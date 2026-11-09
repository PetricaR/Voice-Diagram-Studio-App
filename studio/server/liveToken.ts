/**
 * The token server: the only place that holds the Gemini API key. The page
 * asks it for an ephemeral token before every Live API connection
 * (https://ai.google.dev/gemini-api/docs/ephemeral-tokens):
 *
 *   GET  /api/live/status  → { configured }                (never the key itself)
 *   POST /api/live/token   { model, voice?, thinkingLevel? } → { token, expireTime }
 *
 * Every token
 *   - starts at most one session (uses: 1), within 60 seconds of being issued,
 *   - expires after 30 minutes (a resumed session fetches a new one),
 *   - is locked to the studio's model, voice, system instruction and tools, so a
 *     token copied out of the page cannot be used with other prompts or models.
 * The endpoint only answers same-origin requests addressed to an allowed host
 * name (against cross-site requests and DNS rebinding), accepts small JSON
 * bodies with allow-listed values, and is rate limited per client. The key is
 * sent to Google in a header, never in a URL, and never appears in a response.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import type * as LiveConfig from '../src/agent/liveConfig.ts';

/** What the server needs from src/agent/liveConfig.ts. */
export type AgentConfig = Pick<typeof LiveConfig, 'LIVE_MODELS' | 'VOICES' | 'THINKING_LEVELS' | 'agentSetup'>;

const TOKENS_URL = 'https://generativelanguage.googleapis.com/v1alpha/auth_tokens';
export const TOKEN_TTL_MS = 30 * 60_000;
export const NEW_SESSION_MS = 60_000;
/** Setup fields a token is locked to; the rest (resumption handle, transcription, voice detection) stays with the page. */
const LOCKED_FIELDS = ['model', 'generationConfig', 'systemInstruction', 'tools'];
const MAX_BODY_BYTES = 2048;
const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

export class TokenError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

/** The field mask of the locked fields, one level deep, as the Google Gen AI SDK builds it. */
export function fieldMask(setup: Record<string, unknown>): string {
  return Object.entries(setup).flatMap(([field, value]) =>
    value != null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0
      ? Object.keys(value).map((sub) => `${field}.${sub}`)
      : [field]).join(',');
}

/** Asks Google for a single-use token locked to `setup` (a BidiGenerateContentSetup). */
export async function createLiveToken(
  apiKey: string,
  setup: Record<string, unknown>,
  options: { fetch?: typeof fetch; now?: number } = {},
): Promise<{ token: string; expireTime: string }> {
  const now = options.now ?? Date.now();
  const locked = Object.fromEntries(LOCKED_FIELDS.filter((f) => setup[f] != null).map((f) => [f, setup[f]]));
  const expireTime = new Date(now + TOKEN_TTL_MS).toISOString();
  const body = {
    uses: 1,
    expireTime,
    newSessionExpireTime: new Date(now + NEW_SESSION_MS).toISOString(),
    bidiGenerateContentSetup: locked,
    fieldMask: fieldMask(locked),
  };
  let res: Response;
  try {
    res = await (options.fetch ?? fetch)(TOKENS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    throw new TokenError(502, 'upstream', `Google could not be reached for a Live API token (${e instanceof Error ? e.message : String(e)}).`);
  }
  const text = await res.text();
  let data: { name?: unknown; error?: { message?: unknown } } | null = null;
  try {
    data = JSON.parse(text);
  } catch {
    // not JSON
  }
  if (!res.ok) {
    const detail = String(data?.error?.message ?? text).slice(0, 300).replaceAll(apiKey, '[key]');
    if (res.status === 401 || res.status === 403 || /API_KEY_INVALID|API key not valid|API key expired/i.test(text)) {
      throw new TokenError(502, 'key-rejected', `Google refused the studio server's Gemini API key: ${detail} Check it, or replace it with ./studio.sh key.`);
    }
    if (res.status === 429) {
      throw new TokenError(429, 'quota', `The Gemini API quota of this key is used up for now; try again in a minute. (${detail})`);
    }
    throw new TokenError(502, 'upstream', `Google did not issue a Live API token (${res.status}: ${detail})`);
  }
  if (typeof data?.name !== 'string' || !data.name.startsWith('auth_tokens/')) {
    throw new TokenError(502, 'upstream', 'Google answered without a Live API token.');
  }
  return { token: data.name, expireTime };
}

export interface LiveTokenOptions {
  /** The Gemini API key, or '' when the server has none. */
  getApiKey: () => string;
  /** Called when Google refuses the key, so that a replaced key is read again. */
  onKeyRejected?: () => void;
  /** Loads src/agent/liveConfig.ts (through Vite, so that edits of the prompt apply at once). */
  loadConfig: () => Promise<AgentConfig>;
  /** Models tokens may be issued for (default: LIVE_MODELS). */
  models?: readonly string[];
  /** Host names allowed besides loopback, e.g. the domain of a deployment. */
  allowedHosts?: readonly string[];
  /** Tokens per client per minute (default 10). */
  rateLimit?: number;
  fetch?: typeof fetch;
  log?: (message: string) => void;
  now?: () => number;
}

type Next = (error?: unknown) => void;

/** Connect-style middleware (Vite, Express or a plain node:http server) for /api/live/*. */
export function liveTokenMiddleware(o: LiveTokenOptions) {
  const hosts = new Set([...LOOPBACK_HOSTS, ...(o.allowedHosts ?? []).map((h) => h.toLowerCase())]);
  const now = o.now ?? Date.now;
  const limiter = new RateLimiter(o.rateLimit ?? 10, 60_000, now);
  const log = o.log ?? ((m: string) => console.warn(m));

  async function handle(req: IncomingMessage, res: ServerResponse, path: string) {
    const denied = checkRequestOrigin(req, hosts);
    if (denied) return send(res, 403, { error: 'forbidden', message: denied });

    if (path === '/api/live/status') {
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'method', message: 'Use GET.' }, { Allow: 'GET, HEAD' });
      return send(res, 200, { configured: o.getApiKey() !== '' });
    }
    if (path !== '/api/live/token') return send(res, 404, { error: 'not-found', message: 'Not found.' });
    if (req.method !== 'POST') return send(res, 405, { error: 'method', message: 'Use POST.' }, { Allow: 'POST' });
    if (!/^application\/json\s*(;|$)/i.test(req.headers['content-type'] ?? '')) {
      return send(res, 415, { error: 'content-type', message: 'Send JSON (Content-Type: application/json).' });
    }
    const raw = await readBody(req, MAX_BODY_BYTES);
    if (raw == null) return send(res, 413, { error: 'too-large', message: 'The request is too large.' });
    let request: unknown;
    try {
      request = JSON.parse(raw);
    } catch {
      return send(res, 400, { error: 'bad-request', message: 'The request is not valid JSON.' });
    }
    const config = await o.loadConfig();
    const invalid = validate(request, config, o.models ?? config.LIVE_MODELS);
    if (invalid) return send(res, 400, { error: 'bad-request', message: invalid });

    const wait = limiter.take(req.socket.remoteAddress ?? 'unknown');
    if (wait > 0) {
      return send(res, 429, { error: 'rate-limit', message: 'Too many Live sessions were started; wait a moment.' },
        { 'Retry-After': String(Math.ceil(wait / 1000)) });
    }
    const apiKey = o.getApiKey();
    if (!apiKey) {
      return send(res, 503, { error: 'no-key', message: 'No Gemini API key on the studio server. Run ./studio.sh key in a terminal, then try again.' });
    }
    const { model, voice, thinkingLevel } = request as { model: string; voice?: string; thinkingLevel?: string };
    try {
      const token = await createLiveToken(apiKey, config.agentSetup({ model, voice, thinkingLevel }), { fetch: o.fetch, now: now() });
      return send(res, 200, token);
    } catch (e) {
      if (!(e instanceof TokenError)) throw e;
      if (e.code === 'key-rejected') o.onKeyRejected?.();
      log(`[live-token] ${e.message}`);
      return send(res, e.status, { error: e.code, message: e.message });
    }
  }

  return (req: IncomingMessage, res: ServerResponse, next: Next) => {
    const path = (req.url ?? '').split('?')[0];
    if (!path.startsWith('/api/live/')) {
      next();
      return;
    }
    handle(req, res, path).catch((e: unknown) => {
      log(`[live-token] ${e instanceof Error ? e.message : String(e)}`);
      if (!res.headersSent) send(res, 500, { error: 'internal', message: 'The token server failed; see its log.' });
    });
  };
}

/** Rejects requests from other sites and requests addressed to unknown host names. */
export function checkRequestOrigin(req: IncomingMessage, hosts: Set<string>): string | null {
  const host = (req.headers.host ?? '').toLowerCase();
  let hostname: string;
  try {
    hostname = new URL(`http://${host}`).hostname;
  } catch {
    return 'Bad Host header.';
  }
  // A page on another domain that resolves to this machine (DNS rebinding)
  if (!hosts.has(hostname)) return `Requests for ${hostname} are not allowed (see STUDIO_ALLOWED_HOSTS).`;
  const site = req.headers['sec-fetch-site'];
  if (site != null && site !== 'same-origin' && site !== 'none') return 'Cross-site requests are not allowed.';
  const origin = req.headers.origin;
  if (origin != null) {
    let o: URL;
    try {
      o = new URL(origin);
    } catch {
      return 'Bad Origin header.';
    }
    if (o.host !== host) return 'Cross-origin requests are not allowed.';
  }
  return null;
}

function validate(r: unknown, config: AgentConfig, models: readonly string[]): string | null {
  if (r == null || typeof r !== 'object' || Array.isArray(r)) return 'Expected a JSON object.';
  const { model, voice, thinkingLevel, ...rest } = r as Record<string, unknown>;
  const unknown = Object.keys(rest);
  if (unknown.length > 0) return `Unknown field ${JSON.stringify(unknown[0].slice(0, 40))}.`;
  if (typeof model !== 'string' || !models.includes(model)) {
    return `The model ${JSON.stringify(String(model).slice(0, 80))} is not enabled on the studio server (STUDIO_LIVE_MODELS).`;
  }
  if (voice !== undefined && (typeof voice !== 'string' || !config.VOICES.includes(voice))) return 'Unknown voice.';
  if (thinkingLevel !== undefined && (typeof thinkingLevel !== 'string' || !config.THINKING_LEVELS.includes(thinkingLevel))) {
    return 'Unknown thinking level.';
  }
  return null;
}

/** The body as text, or null when it is larger than `limit` bytes. */
function readBody(req: IncomingMessage, limit: number): Promise<string | null> {
  if (Number(req.headers['content-length'] ?? 0) > limit) {
    req.resume();
    return Promise.resolve(null);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size <= limit) chunks.push(chunk);
    });
    req.on('end', () => resolve(size > limit ? null : Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  });
  res.end(JSON.stringify(body));
}

/** Sliding window: at most `limit` tokens per client in `windowMs`. */
class RateLimiter {
  private hits = new Map<string, number[]>();

  constructor(private limit: number, private windowMs: number, private now: () => number) {}

  /** 0 when allowed, otherwise the milliseconds to wait. */
  take(client: string): number {
    const t = this.now();
    const recent = (this.hits.get(client) ?? []).filter((h) => t - h < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(client, recent);
      return this.windowMs - (t - recent[0]);
    }
    recent.push(t);
    this.hits.set(client, recent);
    if (this.hits.size > 1000) {
      for (const [c, list] of this.hits) {
        if (list.every((h) => t - h >= this.windowMs)) this.hits.delete(c);
      }
    }
    return 0;
  }
}
