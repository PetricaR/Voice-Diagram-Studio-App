/**
 * Accounts and daily allowances for signed-in users. Every Live API token is
 * one "session" (a token starts one connection of at most 30 minutes, and a
 * resumed conversation fetches a new one), so counting tokens bounds what a
 * user, and the studio as a whole, can spend of the Gemini API key per day.
 *
 * Counters are kept per UTC day in Firestore on a deployment (shared by every
 * Cloud Run instance, unaffected by restarts) and in memory locally and in tests.
 */
import type { User } from './auth.ts';

export type Plan = 'free' | 'pro' | 'owner';

export interface Account {
  email: string;
  name?: string;
  picture?: string;
  plan: Plan;
  /** Sessions started today (UTC). */
  used: number;
  /** Sessions allowed per day; null when unlimited. */
  limit: number | null;
}

export interface Limits {
  free: number;
  pro: number;
  /** Every user together, so a flood of new accounts cannot drain the key. */
  total: number;
}

export const DEFAULT_LIMITS: Limits = { free: 20, pro: 300, total: 1500 };

export interface UsageStore {
  /** Adds one to `key` if it is below `limit` (atomically); `used` is the count afterwards, or the current one when refused. */
  take(key: string, limit: number): Promise<{ ok: boolean; used: number }>;
  /** Gives one back (the token could not be issued). */
  give(key: string): Promise<void>;
  peek(key: string): Promise<number>;
  /** Records a sign-in; returns the stored plan (Stripe, or an admin, sets it to 'pro'). */
  upsertUser(user: User): Promise<Plan>;
  planOf(userId: string): Promise<Plan>;
}

export function utcDay(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

export class Usage {
  private owners: Set<string>;

  constructor(
    readonly store: UsageStore,
    readonly limits: Limits = DEFAULT_LIMITS,
    ownerEmails: readonly string[] = [],
    private now: () => number = Date.now,
  ) {
    this.owners = new Set(ownerEmails.map((e) => e.trim().toLowerCase()).filter(Boolean));
  }

  private async plan(user: User): Promise<Plan> {
    if (this.owners.has(user.email.toLowerCase())) return 'owner';
    return this.store.planOf(user.id);
  }

  private limitOf(plan: Plan): number | null {
    return plan === 'owner' ? null : plan === 'pro' ? this.limits.pro : this.limits.free;
  }

  async signIn(user: User): Promise<Account> {
    const stored = await this.store.upsertUser(user);
    const plan = this.owners.has(user.email.toLowerCase()) ? 'owner' : stored;
    return this.describe(user, plan);
  }

  async account(user: User): Promise<Account> {
    return this.describe(user, await this.plan(user));
  }

  private async describe(user: User, plan: Plan): Promise<Account> {
    const used = await this.store.peek(`${utcDay(this.now())}:${user.id}`);
    return { email: user.email, name: user.name, picture: user.picture, plan, used, limit: this.limitOf(plan) };
  }

  /**
   * Reserves one session for `user`. On success, `release` gives it back if the
   * token cannot be issued after all.
   */
  async reserve(user: User): Promise<
    | { ok: true; account: Account; release: () => Promise<void> }
    | { ok: false; reason: 'user' | 'total'; account: Account }
  > {
    const day = utcDay(this.now());
    const plan = await this.plan(user);
    const limit = this.limitOf(plan);
    const mineKey = `${day}:${user.id}`;
    const totalKey = `${day}:_total`;
    const mine = await this.store.take(mineKey, limit ?? Number.MAX_SAFE_INTEGER);
    const account: Account = { email: user.email, name: user.name, picture: user.picture, plan, used: mine.used, limit };
    if (!mine.ok) return { ok: false, reason: 'user', account };
    const total = await this.store.take(totalKey, this.limits.total);
    if (!total.ok) {
      await this.store.give(mineKey);
      return { ok: false, reason: 'total', account: { ...account, used: mine.used - 1 } };
    }
    return {
      ok: true,
      account,
      release: async () => {
        await Promise.all([this.store.give(mineKey), this.store.give(totalKey)]);
      },
    };
  }
}

export class MemoryUsageStore implements UsageStore {
  private counts = new Map<string, number>();
  private plans = new Map<string, Plan>();

  async take(key: string, limit: number) {
    const used = this.counts.get(key) ?? 0;
    if (used >= limit) return { ok: false, used };
    this.counts.set(key, used + 1);
    if (this.counts.size > 10_000) this.counts.delete(this.counts.keys().next().value as string);
    return { ok: true, used: used + 1 };
  }

  async give(key: string) {
    const used = this.counts.get(key) ?? 0;
    if (used > 0) this.counts.set(key, used - 1);
  }

  async peek(key: string) {
    return this.counts.get(key) ?? 0;
  }

  async upsertUser(user: User) {
    if (!this.plans.has(user.id)) this.plans.set(user.id, 'free');
    return this.plans.get(user.id) ?? 'free';
  }

  async planOf(userId: string) {
    return this.plans.get(userId) ?? 'free';
  }

  /** Tests and admin tools. */
  setPlan(userId: string, plan: Plan) {
    this.plans.set(userId, plan);
  }
}

const USERS = 'studio_users';
const USAGE = 'studio_usage';

/**
 * Firestore (Native mode) on Cloud Run, with the service account's credentials.
 * `studio_usage/{day}:{userId}` holds { count, expireAt }; a TTL policy on
 * `expireAt` deletes old days. `studio_users/{userId}` holds the profile and plan.
 */
export async function createFirestoreUsageStore(projectId?: string, databaseId?: string): Promise<UsageStore> {
  const { Firestore, FieldValue, Timestamp } = await import('@google-cloud/firestore');
  const db = new Firestore({ projectId, databaseId, ignoreUndefinedProperties: true });
  const counter = (key: string) => db.collection(USAGE).doc(key);
  const expireAt = (key: string) => Timestamp.fromMillis(Date.parse(key.slice(0, 10)) + 8 * 24 * 3600_000);

  return {
    take: (key, limit) => db.runTransaction(async (tx) => {
      const ref = counter(key);
      const snap = await tx.get(ref);
      const used = Number(snap.get('count') ?? 0);
      if (used >= limit) return { ok: false, used };
      tx.set(ref, { count: used + 1, expireAt: expireAt(key), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return { ok: true, used: used + 1 };
    }),

    async give(key) {
      await db.runTransaction(async (tx) => {
        const ref = counter(key);
        const snap = await tx.get(ref);
        const used = Number(snap.get('count') ?? 0);
        if (used > 0) tx.set(ref, { count: used - 1 }, { merge: true });
      });
    },

    async peek(key) {
      const snap = await counter(key).get();
      return Number(snap.get('count') ?? 0);
    },

    async upsertUser(user) {
      const ref = db.collection(USERS).doc(user.id);
      return db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        const plan = (snap.get('plan') as Plan | undefined) ?? 'free';
        tx.set(ref, {
          email: user.email,
          name: user.name,
          picture: user.picture,
          plan,
          lastSignInAt: FieldValue.serverTimestamp(),
          ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        }, { merge: true });
        return plan === 'pro' ? 'pro' : 'free';
      });
    },

    async planOf(userId) {
      const snap = await db.collection(USERS).doc(userId).get();
      return snap.get('plan') === 'pro' ? 'pro' : 'free';
    },
  };
}
