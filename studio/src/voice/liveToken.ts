/**
 * Browser side of the token server (server/liveToken.ts): the Gemini API key
 * stays on the server, and every Live session gets its own single-use token.
 */

export interface TokenRequest {
  model: string;
  voice?: string;
  thinkingLevel?: string;
}

/** 'unknown' when the studio server cannot be reached (e.g. a static host). */
export type KeyStatus = 'configured' | 'missing' | 'unknown';

/** The signed-in user and today's allowance (server/usage.ts). */
export interface Account {
  email: string;
  name?: string;
  picture?: string;
  plan: 'free' | 'pro' | 'owner';
  used: number;
  /** null when unlimited */
  limit: number | null;
}

/** Whether the studio server only gives tokens to signed-in users (deployments). */
export type AuthStatus =
  | { required: false }
  | { required: true; configured: false }
  | { required: true; configured: true; clientId: string; freeDaily: number; account: Account | null };

export interface ServerStatus {
  key: KeyStatus;
  auth: AuthStatus;
}

/** A failed request to the studio server; `code` is the server's error code (e.g. 'signed-out', 'daily-limit'). */
export class StudioServerError extends Error {
  constructor(message: string, readonly code: string, readonly account?: Account) {
    super(message);
  }
}

let onAccount: ((account: Account) => void) | null = null;

/** Called with the updated allowance after every token. */
export function onAccountChange(listener: ((account: Account) => void) | null) {
  onAccount = listener;
}

/** A fresh ephemeral token, locked to this model and voice. */
export async function fetchLiveToken(request: TokenRequest): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/live/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new Error('The studio server cannot be reached. Start the app with ./studio.sh.');
  }
  const data = await res.json().catch(() => null) as { token?: unknown; message?: unknown; error?: unknown; account?: Account } | null;
  if (data?.account) onAccount?.(data.account);
  if (!res.ok || typeof data?.token !== 'string') {
    throw new StudioServerError(
      typeof data?.message === 'string' ? data.message : `The studio server did not issue a Live API token (${res.status}).`,
      typeof data?.error === 'string' ? data.error : 'unknown',
      data?.account,
    );
  }
  return data.token;
}

/** Whether the studio server has a Gemini API key (the key itself never leaves it) and who is signed in. */
export async function fetchServerStatus(): Promise<ServerStatus> {
  try {
    const res = await fetch('/api/live/status', { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return { key: 'unknown', auth: { required: false } };
    const data = await res.json() as { configured?: unknown; auth?: AuthStatus };
    return {
      key: data.configured === true ? 'configured' : 'missing',
      auth: data.auth?.required === true ? data.auth : { required: false },
    };
  } catch {
    return { key: 'unknown', auth: { required: false } };
  }
}

async function post(path: string, body: unknown): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'same-origin',
      cache: 'no-store',
    });
  } catch {
    throw new StudioServerError('The studio server cannot be reached.', 'offline');
  }
  const data = await res.json().catch(() => null) as { message?: unknown; error?: unknown } | null;
  if (!res.ok) {
    throw new StudioServerError(
      typeof data?.message === 'string' ? data.message : `The studio server refused the request (${res.status}).`,
      typeof data?.error === 'string' ? data.error : 'unknown',
    );
  }
  return data;
}

/** Exchanges a Google ID token for the studio's session cookie. */
export async function signInWithGoogle(credential: string): Promise<Account> {
  const data = await post('/api/auth/google', { credential }) as { account: Account };
  return data.account;
}

export async function signOut(): Promise<void> {
  await post('/api/auth/logout', {});
}
