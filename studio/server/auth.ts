/**
 * Who may start Live sessions on a deployed studio. Visitors sign in with
 * Google; the server verifies the ID token itself and keeps the user in a
 * signed, HttpOnly session cookie, so the page never holds a credential.
 *
 *   POST /api/auth/google  { credential }  → { account }   (sets the session cookie)
 *   POST /api/auth/logout                  → 204           (clears it)
 *
 * The ID token must be signed by Google, issued for one of `clientIds` (the
 * audience check is what stops a token minted for another app from being
 * replayed here), unexpired, and carry a verified e-mail address.
 */
import type { IncomingMessage } from 'node:http';
import { createRemoteJWKSet, jwtVerify, SignJWT, type JWTVerifyGetKey } from 'jose';

export const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_JWKS_URL = new URL('https://www.googleapis.com/oauth2/v3/certs');
const SESSION_ISSUER = 'voice-diagram-studio';
const SESSION_TTL_S = 7 * 24 * 3600;
/** `__Host-` binds the cookie to this exact origin over HTTPS (no Domain, Path=/, Secure). */
export const SECURE_COOKIE = '__Host-vds_session';
/** Plain-HTTP loopback cannot set __Host- cookies. */
export const LOCAL_COOKIE = 'vds_session';
const MIN_SECRET_BYTES = 32;

export interface User {
  /** Google's stable account id (`sub`). */
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthOptions {
  /** OAuth client ids whose ID tokens are accepted (the web client, later the extension). */
  clientIds: readonly string[];
  /** Signs the session cookie; at least 32 bytes. */
  sessionSecret: string;
  /** Only these e-mail addresses or `@domain`s may sign in; empty lets every Google account in. */
  allowedEmails?: readonly string[];
  /** Set Secure, __Host- cookies (HTTPS deployments). */
  secureCookies?: boolean;
  /** Google's signing keys; replaced in tests. */
  jwks?: JWTVerifyGetKey;
  now?: () => number;
}

export class AuthError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

export interface Auth {
  readonly clientId: string;
  /** Verifies a Google ID token and returns the user it names. */
  verifyGoogleCredential(credential: string): Promise<User>;
  /** The Set-Cookie value that signs `user` in. */
  sessionCookie(user: User): Promise<string>;
  /** The Set-Cookie value that signs out. */
  clearCookie(): string;
  /** The signed-in user of a request, or null. */
  userOf(req: IncomingMessage): Promise<User | null>;
}

export function createAuth(o: AuthOptions): Auth {
  if (o.clientIds.length === 0) throw new Error('createAuth: at least one OAuth client id is required.');
  const secret = new TextEncoder().encode(o.sessionSecret);
  if (secret.length < MIN_SECRET_BYTES) throw new Error(`createAuth: the session secret must be at least ${MIN_SECRET_BYTES} bytes.`);
  const jwks = o.jwks ?? createRemoteJWKSet(GOOGLE_JWKS_URL);
  const now = o.now ?? Date.now;
  const allowed = (o.allowedEmails ?? []).map((e) => e.trim().toLowerCase()).filter(Boolean);
  const cookieName = o.secureCookies ? SECURE_COOKIE : LOCAL_COOKIE;
  const attributes = `Path=/; HttpOnly; SameSite=Lax${o.secureCookies ? '; Secure' : ''}`;
  const currentDate = () => new Date(now());

  const isAllowed = (email: string) => allowed.length === 0 ||
    allowed.some((a) => (a.startsWith('@') ? email.endsWith(a) : email === a));

  return {
    clientId: o.clientIds[0],

    async verifyGoogleCredential(credential) {
      if (typeof credential !== 'string' || credential.length < 20 || credential.length > 4096) {
        throw new AuthError(400, 'bad-credential', 'The Google sign-in answer is missing or malformed.');
      }
      let payload: Record<string, unknown>;
      try {
        ({ payload } = await jwtVerify(credential, jwks, {
          issuer: GOOGLE_ISSUERS,
          audience: [...o.clientIds],
          algorithms: ['RS256'],
          currentDate: currentDate(),
          clockTolerance: 30,
        }));
      } catch {
        throw new AuthError(401, 'bad-credential', 'Google sign-in could not be verified; try again.');
      }
      const email = typeof payload.email === 'string' ? payload.email.toLowerCase() : '';
      if (typeof payload.sub !== 'string' || payload.sub === '' || email === '') {
        throw new AuthError(401, 'bad-credential', 'The Google account has no e-mail address.');
      }
      if (payload.email_verified !== true) {
        throw new AuthError(403, 'unverified-email', 'Verify the e-mail address of this Google account first.');
      }
      if (!isAllowed(email)) {
        throw new AuthError(403, 'not-allowed', `${email} is not allowed to use this studio.`);
      }
      return {
        id: payload.sub,
        email,
        name: typeof payload.name === 'string' ? payload.name.slice(0, 120) : undefined,
        picture: typeof payload.picture === 'string' && payload.picture.startsWith('https://') ? payload.picture : undefined,
      };
    },

    async sessionCookie(user) {
      const t = Math.floor(now() / 1000);
      const token = await new SignJWT({ email: user.email, name: user.name, picture: user.picture })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuer(SESSION_ISSUER)
        .setAudience(SESSION_ISSUER)
        .setSubject(user.id)
        .setIssuedAt(t)
        .setExpirationTime(t + SESSION_TTL_S)
        .sign(secret);
      return `${cookieName}=${token}; ${attributes}; Max-Age=${SESSION_TTL_S}`;
    },

    clearCookie() {
      return `${cookieName}=; ${attributes}; Max-Age=0`;
    },

    async userOf(req) {
      const token = readCookie(req.headers.cookie, cookieName);
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, secret, {
          issuer: SESSION_ISSUER,
          audience: SESSION_ISSUER,
          algorithms: ['HS256'],
          currentDate: currentDate(),
        });
        if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') return null;
        // A user removed from the allow-list loses access with the next request
        if (!isAllowed(payload.email)) return null;
        return {
          id: payload.sub,
          email: payload.email,
          name: typeof payload.name === 'string' ? payload.name : undefined,
          picture: typeof payload.picture === 'string' ? payload.picture : undefined,
        };
      } catch {
        return null;
      }
    },
  };
}

export function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim() || null;
  }
  return null;
}
