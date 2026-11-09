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
  const data = await res.json().catch(() => null) as { token?: unknown; message?: unknown } | null;
  if (!res.ok || typeof data?.token !== 'string') {
    throw new Error(typeof data?.message === 'string' ? data.message : `The studio server did not issue a Live API token (${res.status}).`);
  }
  return data.token;
}

/** Whether the studio server has a Gemini API key (the key itself never leaves it). */
export async function fetchKeyStatus(): Promise<KeyStatus> {
  try {
    const res = await fetch('/api/live/status', { cache: 'no-store', credentials: 'same-origin' });
    if (!res.ok) return 'unknown';
    const data = await res.json() as { configured?: unknown };
    return data.configured === true ? 'configured' : 'missing';
  } catch {
    return 'unknown';
  }
}
