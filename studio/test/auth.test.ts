/**
 * Sign-in and daily allowances on a deployed studio (server/auth.ts,
 * server/usage.ts, server/access.ts): only signed-in users get Live API tokens,
 * within their plan's sessions per day and the studio's total.
 */
import { createServer, request, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT, type JWTVerifyGetKey } from 'jose';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import * as liveConfig from '../src/agent/liveConfig';
import { accessFromEnv } from '../server/access';
import { createAuth, LOCAL_COOKIE, SECURE_COOKIE, type Auth } from '../server/auth';
import { liveTokenMiddleware, type LiveTokenOptions } from '../server/liveToken';
import { MemoryUsageStore, Usage, utcDay } from '../server/usage';

const CLIENT_ID = '1234567890-studio.apps.googleusercontent.com';
const SECRET = 'a-test-session-secret-that-is-long-enough-0123456789';
const NOW = Date.parse('2026-11-09T12:00:00Z');

let privateKey: CryptoKey;
let jwks: JWTVerifyGetKey;

beforeAll(async () => {
  const pair = await generateKeyPair('RS256');
  privateKey = pair.privateKey;
  const jwk = { ...(await exportJWK(pair.publicKey)), kid: 'k1', alg: 'RS256', use: 'sig' };
  jwks = createLocalJWKSet({ keys: [jwk] });
});

/** An ID token as Google would sign it. */
function googleToken(claims: Record<string, unknown> = {}, o: { aud?: string; iss?: string; exp?: number; key?: CryptoKey } = {}) {
  const t = Math.floor(NOW / 1000);
  return new SignJWT({ email: 'ada@example.com', email_verified: true, name: 'Ada Lovelace', picture: 'https://lh3.googleusercontent.com/a/ada', ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'k1' })
    .setIssuer(o.iss ?? 'https://accounts.google.com')
    .setAudience(o.aud ?? CLIENT_ID)
    .setSubject(String(claims.sub ?? '1001'))
    .setIssuedAt(t - 10)
    .setExpirationTime(o.exp ?? t + 3600)
    .sign(o.key ?? privateKey);
}

function makeAuth(o: { allowedEmails?: string[]; secureCookies?: boolean; now?: () => number } = {}): Auth {
  return createAuth({ clientIds: [CLIENT_ID], sessionSecret: SECRET, jwks, now: o.now ?? (() => NOW), ...o });
}

describe('Google ID token verification', () => {
  it('accepts a token Google signed for this client', async () => {
    const user = await makeAuth().verifyGoogleCredential(await googleToken());
    expect(user).toEqual({ id: '1001', email: 'ada@example.com', name: 'Ada Lovelace', picture: 'https://lh3.googleusercontent.com/a/ada' });
  });

  it('refuses tokens for another app, from another issuer, expired, forged or without a verified e-mail', async () => {
    const auth = makeAuth();
    const other = await generateKeyPair('RS256');
    const cases: [string, Promise<string>, string][] = [
      ['another client', googleToken({}, { aud: 'someone-else.apps.googleusercontent.com' }), 'bad-credential'],
      ['another issuer', googleToken({}, { iss: 'https://evil.example' }), 'bad-credential'],
      ['expired', googleToken({}, { exp: Math.floor(NOW / 1000) - 120 }), 'bad-credential'],
      ['forged', googleToken({}, { key: other.privateKey }), 'bad-credential'],
      ['unverified e-mail', googleToken({ email_verified: false }), 'unverified-email'],
    ];
    for (const [name, token, code] of cases) {
      await expect(auth.verifyGoogleCredential(await token), name).rejects.toMatchObject({ code });
    }
    await expect(auth.verifyGoogleCredential('')).rejects.toMatchObject({ code: 'bad-credential' });
  });

  it('applies the allow-list of addresses and domains', async () => {
    const auth = makeAuth({ allowedEmails: ['@formare.dev', 'ada@example.com'] });
    await expect(auth.verifyGoogleCredential(await googleToken())).resolves.toMatchObject({ email: 'ada@example.com' });
    await expect(auth.verifyGoogleCredential(await googleToken({ email: 'bob@formare.dev' }))).resolves.toMatchObject({ email: 'bob@formare.dev' });
    await expect(auth.verifyGoogleCredential(await googleToken({ email: 'eve@example.com' }))).rejects.toMatchObject({ code: 'not-allowed' });
  });

  it('refuses a short session secret', () => {
    expect(() => createAuth({ clientIds: [CLIENT_ID], sessionSecret: 'short' })).toThrow(/32 bytes/);
  });
});

describe('session cookie', () => {
  const reqWith = (cookie: string) => ({ headers: { cookie } }) as never;
  const valueOf = (setCookie: string) => setCookie.split(';')[0];

  it('round-trips the user, HttpOnly and SameSite=Lax; __Host- and Secure over HTTPS', async () => {
    const user = { id: '1001', email: 'ada@example.com', name: 'Ada' };
    const local = await makeAuth().sessionCookie(user);
    expect(local).toMatch(new RegExp(`^${LOCAL_COOKIE}=`));
    expect(local).toContain('HttpOnly');
    expect(local).toContain('SameSite=Lax');
    expect(local).not.toContain('Secure');
    const secure = await makeAuth({ secureCookies: true }).sessionCookie(user);
    expect(secure).toMatch(new RegExp(`^${SECURE_COOKIE}=.*; Path=/; HttpOnly; SameSite=Lax; Secure`));
    expect(await makeAuth().userOf(reqWith(`theme=dark; ${valueOf(local)}`))).toMatchObject(user);
  });

  it('ignores tampered, foreign and expired sessions', async () => {
    const auth = makeAuth();
    const cookie = valueOf(await auth.sessionCookie({ id: '1001', email: 'ada@example.com' }));
    const [name, jwt] = cookie.split('=');
    const [h, p, sig] = jwt.split('.');
    const forgedPayload = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(p, 'base64url').toString()), sub: '1' })).toString('base64url');
    expect(await auth.userOf(reqWith(`${name}=${h}.${forgedPayload}.${sig}`))).toBeNull();
    const otherSecret = createAuth({ clientIds: [CLIENT_ID], sessionSecret: 'x'.repeat(40), jwks, now: () => NOW });
    expect(await otherSecret.userOf(reqWith(cookie))).toBeNull();
    const later = makeAuth({ now: () => NOW + 8 * 24 * 3600_000 });
    expect(await later.userOf(reqWith(cookie))).toBeNull();
    expect(await auth.userOf(reqWith('vds_session='))).toBeNull();
  });

  it('drops a session when its address leaves the allow-list', async () => {
    const before = makeAuth();
    const cookie = valueOf(await before.sessionCookie({ id: '1001', email: 'ada@example.com' }));
    expect(await makeAuth({ allowedEmails: ['@formare.dev'] }).userOf(reqWith(cookie))).toBeNull();
  });
});

describe('daily allowances', () => {
  const ada = { id: '1001', email: 'ada@example.com' };

  it('counts per user and per day, with unlimited owners and a total for everyone', async () => {
    let t = NOW;
    const store = new MemoryUsageStore();
    const usage = new Usage(store, { free: 2, pro: 5, total: 4 }, ['Owner@Example.com'], () => t);
    expect((await usage.reserve(ada)).ok).toBe(true);
    expect((await usage.reserve(ada)).ok).toBe(true);
    expect(await usage.reserve(ada)).toMatchObject({ ok: false, reason: 'user', account: { used: 2, limit: 2, plan: 'free' } });

    const owner = { id: '7', email: 'owner@example.com' };
    expect(await usage.reserve(owner)).toMatchObject({ ok: true, account: { plan: 'owner', limit: null } });
    expect((await usage.reserve(owner)).ok).toBe(true);
    // The studio's total (4) is reached: even the owner waits for tomorrow, and nothing is counted
    expect(await usage.reserve(owner)).toMatchObject({ ok: false, reason: 'total' });
    expect(await store.peek(`${utcDay(t)}:7`)).toBe(2);

    t += 24 * 3600_000;
    expect((await usage.reserve(ada)).ok).toBe(true);
  });

  it('gives a session back when the token cannot be issued, and reads the plan', async () => {
    const store = new MemoryUsageStore();
    const usage = new Usage(store, { free: 1, pro: 3, total: 100 }, [], () => NOW);
    const r = await usage.reserve(ada);
    expect(r.ok).toBe(true);
    if (r.ok) await r.release();
    expect((await usage.account(ada)).used).toBe(0);
    store.setPlan('1001', 'pro');
    expect(await usage.account(ada)).toMatchObject({ plan: 'pro', limit: 3 });
  });
});

describe('token API with sign-in required', () => {
  let server: Server;
  let port = 0;
  let handler: ReturnType<typeof liveTokenMiddleware>;
  let upstream = vi.fn<typeof fetch>();
  let store: MemoryUsageStore;

  function setup(o: Partial<LiveTokenOptions> & { limits?: { free: number; pro: number; total: number } } = {}) {
    upstream = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ name: 'auth_tokens/t1' }), { status: 200 }));
    store = new MemoryUsageStore();
    const { limits, ...rest } = o;
    handler = liveTokenMiddleware({
      getApiKey: () => 'AIzaSy-secret-test-key-0123456789',
      loadConfig: async () => liveConfig,
      fetch: upstream,
      log: () => undefined,
      now: () => NOW,
      requireSignIn: true,
      auth: makeAuth(),
      usage: new Usage(store, limits ?? { free: 2, pro: 10, total: 100 }, [], () => NOW),
      ...rest,
    });
  }

  function call(method: string, path: string, o: { body?: unknown; cookie?: string } = {}) {
    return new Promise<{ status: number; body: any; setCookie: string[] }>((resolve, reject) => {
      const req = request({
        host: '127.0.0.1', port, method, path,
        headers: {
          host: `127.0.0.1:${port}`,
          origin: `http://127.0.0.1:${port}`,
          'sec-fetch-site': 'same-origin',
          'content-type': 'application/json',
          ...(o.cookie ? { cookie: o.cookie } : {}),
        },
      }, (res) => {
        let text = '';
        res.setEncoding('utf8');
        res.on('data', (c) => { text += c; });
        res.on('end', () => resolve({
          status: res.statusCode ?? 0,
          body: text ? JSON.parse(text) : null,
          setCookie: ([] as string[]).concat(res.headers['set-cookie'] ?? []),
        }));
      });
      req.on('error', reject);
      req.end(o.body === undefined ? undefined : JSON.stringify(o.body));
    });
  }

  const askToken = (cookie?: string) => call('POST', '/api/live/token', { body: { model: 'gemini-3.8-live' }, cookie });

  async function signIn(claims: Record<string, unknown> = {}) {
    const r = await call('POST', '/api/auth/google', { body: { credential: await googleToken(claims) } });
    expect(r.status).toBe(200);
    return r.setCookie[0].split(';')[0];
  }

  beforeAll(async () => {
    server = createServer((req, res) => handler(req, res, () => {
      res.statusCode = 404;
      res.end();
    }));
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(() => new Promise<void>((r) => server.close(() => r())));

  it('fails closed when sign-in is required but not configured', async () => {
    setup({ auth: undefined, usage: undefined });
    expect((await call('GET', '/api/live/status')).body.auth).toEqual({ required: true, configured: false });
    const r = await askToken();
    expect(r.status).toBe(503);
    expect(r.body.error).toBe('auth-not-configured');
    expect((await call('POST', '/api/auth/google', { body: { credential: await googleToken() } })).status).toBe(503);
    expect(upstream).not.toHaveBeenCalled();
  });

  it('gives no token without a session', async () => {
    setup();
    const r = await askToken();
    expect(r.status).toBe(401);
    expect(r.body.error).toBe('signed-out');
    expect((await askToken('vds_session=not-a-jwt')).status).toBe(401);
    expect(upstream).not.toHaveBeenCalled();
    expect((await call('GET', '/api/live/status')).body.auth).toEqual({
      required: true, configured: true, clientId: CLIENT_ID, freeDaily: 2, account: null,
    });
  });

  it('signs in with a Google ID token, then issues tokens within the daily allowance', async () => {
    setup();
    const cookie = await signIn();
    const status = await call('GET', '/api/live/status', { cookie });
    expect(status.body.auth.account).toMatchObject({ email: 'ada@example.com', plan: 'free', used: 0, limit: 2 });

    const first = await askToken(cookie);
    expect(first.status).toBe(200);
    expect(first.body).toMatchObject({ token: 'auth_tokens/t1', account: { used: 1, limit: 2 } });
    expect((await askToken(cookie)).status).toBe(200);
    const third = await askToken(cookie);
    expect(third.status).toBe(429);
    expect(third.body).toMatchObject({ error: 'daily-limit', account: { used: 2, limit: 2 } });
    expect(upstream).toHaveBeenCalledTimes(2);
  });

  it('refuses a token for another app at sign-in', async () => {
    setup();
    const r = await call('POST', '/api/auth/google', { body: { credential: await googleToken({}, { aud: 'other.apps.googleusercontent.com' }) } });
    expect(r.status).toBe(401);
    expect(r.setCookie).toEqual([]);
  });

  it('stops everyone at the studio total', async () => {
    setup({ limits: { free: 5, pro: 5, total: 1 } });
    const ada = await signIn();
    const bob = await signIn({ sub: '2002', email: 'bob@example.com' });
    expect((await askToken(ada)).status).toBe(200);
    const r = await askToken(bob);
    expect(r.status).toBe(503);
    expect(r.body.error).toBe('busy');
  });

  it('gives the session back when Google refuses the token', async () => {
    setup();
    upstream.mockImplementation(async () => new Response(JSON.stringify({ error: { message: 'boom' } }), { status: 500 }));
    const cookie = await signIn();
    expect((await askToken(cookie)).status).toBe(502);
    const status = await call('GET', '/api/live/status', { cookie });
    expect(status.body.auth.account.used).toBe(0);
  });

  it('signs out by clearing the cookie', async () => {
    setup();
    const r = await call('POST', '/api/auth/logout', { body: {} });
    expect(r.status).toBe(200);
    expect(r.setCookie[0]).toMatch(/^vds_session=; .*Max-Age=0/);
  });
});

describe('access from the environment', () => {
  const log = () => undefined;

  it('is off on loopback and required on Cloud Run', async () => {
    expect(await accessFromEnv({}, { onCloudRun: false, log })).toEqual({ requireSignIn: false });
    expect(await accessFromEnv({}, { onCloudRun: true, log })).toEqual({ requireSignIn: true });
    expect(await accessFromEnv({ STUDIO_AUTH: 'off' }, { onCloudRun: true, log })).toEqual({ requireSignIn: false });
    expect(await accessFromEnv({ STUDIO_AUTH: 'typo' }, { onCloudRun: false, log })).toEqual({ requireSignIn: true });
  });

  it('builds sign-in and allowances from the variables', async () => {
    const a = await accessFromEnv({
      STUDIO_AUTH: 'google',
      GOOGLE_CLIENT_ID: CLIENT_ID,
      SESSION_SECRET: SECRET,
      STUDIO_FREE_DAILY_SESSIONS: '7',
      STUDIO_USAGE_STORE: 'memory',
    }, { onCloudRun: false, log });
    expect(a.requireSignIn).toBe(true);
    expect(a.auth?.clientId).toBe(CLIENT_ID);
    expect(a.usage?.limits).toEqual({ free: 7, pro: 300, total: 1500 });
  });

  it('stays closed with a short secret', async () => {
    expect(await accessFromEnv({ STUDIO_AUTH: 'google', GOOGLE_CLIENT_ID: CLIENT_ID, SESSION_SECRET: 'short' }, { onCloudRun: false, log }))
      .toEqual({ requireSignIn: true });
  });
});
