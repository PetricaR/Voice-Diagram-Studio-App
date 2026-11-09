/**
 * Who may start Live sessions, from the environment:
 *
 *   STUDIO_AUTH                 google | off. Default: google on Cloud Run, off on
 *                               loopback (the key's owner is the only user there).
 *   GOOGLE_CLIENT_ID            OAuth web client id(s), comma-separated
 *   SESSION_SECRET              signs the session cookie (≥ 32 bytes; Secret Manager)
 *   STUDIO_ALLOWED_EMAILS       optional allow-list: addresses or @domains
 *   STUDIO_OWNER_EMAILS         unlimited sessions (still within the studio's total)
 *   STUDIO_FREE_DAILY_SESSIONS  default 20      STUDIO_PRO_DAILY_SESSIONS  default 300
 *   STUDIO_DAILY_SESSIONS_TOTAL default 1500, every user together
 *   STUDIO_USAGE_STORE          firestore | memory. Default: firestore on Cloud Run
 *   FIRESTORE_DATABASE          optional, default "(default)"
 *
 * Sign-in that is required but not configured fails closed: no tokens at all.
 */
import { createAuth } from './auth.ts';
import { createFirestoreUsageStore, DEFAULT_LIMITS, MemoryUsageStore, Usage, type Limits } from './usage.ts';
import type { LiveTokenOptions } from './liveToken.ts';

export type Access = Pick<LiveTokenOptions, 'requireSignIn' | 'auth' | 'usage'>;

const list = (value: string | undefined) => value?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];

function count(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return value != null && value.trim() !== '' && Number.isInteger(n) && n >= 0 ? n : fallback;
}

export async function accessFromEnv(
  env: NodeJS.ProcessEnv,
  o: { onCloudRun: boolean; log?: (message: string) => void },
): Promise<Access> {
  const log = o.log ?? ((m: string) => console.warn(m));
  const mode = (env.STUDIO_AUTH ?? (o.onCloudRun ? 'google' : 'off')).trim().toLowerCase();
  if (mode === 'off') return { requireSignIn: false };
  if (mode !== 'google') {
    log(`[auth] STUDIO_AUTH=${mode} is not known (use google or off); sign-in stays required and voice is off.`);
    return { requireSignIn: true };
  }

  const clientIds = list(env.GOOGLE_CLIENT_ID);
  const sessionSecret = env.SESSION_SECRET?.trim() ?? '';
  if (clientIds.length === 0 || sessionSecret.length < 32) {
    log('[auth] Sign-in is required but GOOGLE_CLIENT_ID or SESSION_SECRET (≥ 32 characters) is missing; voice is off until both are set.');
    return { requireSignIn: true };
  }

  const limits: Limits = {
    free: count(env.STUDIO_FREE_DAILY_SESSIONS, DEFAULT_LIMITS.free),
    pro: count(env.STUDIO_PRO_DAILY_SESSIONS, DEFAULT_LIMITS.pro),
    total: count(env.STUDIO_DAILY_SESSIONS_TOTAL, DEFAULT_LIMITS.total),
  };
  const storeKind = (env.STUDIO_USAGE_STORE ?? (o.onCloudRun ? 'firestore' : 'memory')).trim().toLowerCase();
  const store = storeKind === 'firestore'
    ? await createFirestoreUsageStore(env.GOOGLE_CLOUD_PROJECT || undefined, env.FIRESTORE_DATABASE || undefined)
    : new MemoryUsageStore();
  if (storeKind !== 'firestore' && o.onCloudRun) {
    log('[auth] Daily allowances are kept in memory: every instance counts on its own, and a restart resets them.');
  }

  return {
    requireSignIn: true,
    auth: createAuth({
      clientIds,
      sessionSecret,
      allowedEmails: list(env.STUDIO_ALLOWED_EMAILS),
      secureCookies: o.onCloudRun || env.STUDIO_SECURE_COOKIES === '1',
    }),
    usage: new Usage(store, limits, list(env.STUDIO_OWNER_EMAILS)),
  };
}
