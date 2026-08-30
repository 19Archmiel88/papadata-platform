import type { OnModuleDestroy } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { createClient, type RedisClientType } from "redis";
import type { BffConfig } from "./config.js";

type JsonRecord = Record<string, unknown>;

export type BffSessionMembership = {
  readonly capabilities: readonly string[];
  readonly roles: readonly string[];
  readonly tenantId: string;
  readonly tenantName?: string;
  readonly workspaceId: string;
  readonly workspaceName?: string;
};

export type BffSessionRecord = {
  readonly user?: { readonly displayName: string; readonly email: string };
  // Hard ceiling from session creation, independent of expiresAt sliding
  // forward on each refresh -- see RedisBffSessionStore.saveSession for why
  // the physical Redis key TTL is derived from this instead of expiresAt.
  readonly absoluteExpiresAt: string;
  readonly activeTenantId: string;
  readonly activeWorkspaceId: string;
  readonly authLevel: "mfa" | "session" | "step_up";
  readonly capabilities: readonly string[];
  readonly expiresAt: string;
  readonly issuedAt: string;
  readonly memberships: readonly BffSessionMembership[];
  readonly revokedAt: string | null;
  readonly sessionId: string;
  readonly stepUpExpiresAt: string | null;
  readonly userAgent: string | null;
  readonly userId: string;
};

export type RefreshRotationResult = "ok" | "mismatch" | "missing";

export type BffSessionStore = {
  readonly findSession: (sessionId: string) => Promise<BffSessionRecord | null>;
  readonly saveSession: (session: BffSessionRecord) => Promise<void>;
  readonly revokeSession: (sessionId: string, revokedAt: string) => Promise<void>;
  readonly listSessionsForUser: (userId: string) => Promise<readonly BffSessionRecord[]>;
  readonly revokeAllSessionsForUser: (
    userId: string,
    revokedAt: string,
    exceptSessionId?: string,
  ) => Promise<void>;
  // Sets the refresh token hash for a session, independent of the session
  // JSON blob -- see the module doc comment below for why this is a
  // separate key.
  readonly setRefreshTokenHash: (
    sessionId: string,
    tokenHash: string,
    ttlSeconds: number,
  ) => Promise<void>;
  // Atomically compares the presented refresh token's hash against the
  // stored one and, on a match, replaces it with the next one in the same
  // operation -- the compare-and-swap that makes concurrent refresh calls
  // for the same session race-safe (see RedisBffSessionStore's Lua script).
  readonly compareAndRotateRefreshTokenHash: (
    sessionId: string,
    presentedHash: string,
    nextHash: string,
    ttlSeconds: number,
  ) => Promise<RefreshRotationResult>;
};

export const BFF_SESSION_STORE = Symbol("BFF_SESSION_STORE");

// The refresh token's hash is stored in its own Redis key
// (`${prefix}:session:${id}:refresh`), separate from the session JSON blob
// (`${prefix}:session:${id}`), specifically so the security-critical
// compare-and-swap on refresh can be a single atomic Redis Lua script
// operating on one small string value, instead of a read-modify-write
// race on the whole JSON blob (GET, decode, compare, mutate, encode, SET
// is not atomic across two round trips -- two concurrent refresh calls
// presenting the same still-valid token could both read the same "current"
// hash and both believe they won the rotation). Sliding expiresAt and other
// session fields are updated by a plain saveSession() call right after a
// successful rotation; that second write isn't security-critical (a rare
// redundant write from genuinely concurrent legitimate calls just means
// one of two identical expiresAt values wins, not a security issue), so it
// doesn't need the same atomicity.
const REFRESH_ROTATE_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if not current then
  return 'missing'
end
if current ~= ARGV[1] then
  return 'mismatch'
end
redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])
return 'ok'
`;

@Injectable()
export class TestMemoryBffSessionStore implements BffSessionStore {
  private readonly sessions = new Map<string, BffSessionRecord>();
  private readonly refreshHashes = new Map<string, string>();

  findSession(sessionId: string): Promise<BffSessionRecord | null> {
    return Promise.resolve(this.sessions.get(sessionId) ?? null);
  }

  saveSession(session: BffSessionRecord): Promise<void> {
    this.sessions.set(session.sessionId, session);
    return Promise.resolve();
  }

  revokeSession(sessionId: string, revokedAt: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) this.sessions.set(sessionId, { ...session, revokedAt });
    return Promise.resolve();
  }

  listSessionsForUser(userId: string): Promise<readonly BffSessionRecord[]> {
    const now = Date.now();
    return Promise.resolve(
      [...this.sessions.values()].filter((session) =>
        session.userId === userId
        && session.revokedAt === null
        && Date.parse(session.absoluteExpiresAt) > now
      ),
    );
  }

  revokeAllSessionsForUser(
    userId: string,
    revokedAt: string,
    exceptSessionId?: string,
  ): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.sessionId !== exceptSessionId) {
        this.sessions.set(session.sessionId, { ...session, revokedAt });
      }
    }
    return Promise.resolve();
  }

  setRefreshTokenHash(sessionId: string, tokenHash: string, _ttlSeconds: number): Promise<void> {
    this.refreshHashes.set(sessionId, tokenHash);
    return Promise.resolve();
  }

  compareAndRotateRefreshTokenHash(
    sessionId: string,
    presentedHash: string,
    nextHash: string,
    _ttlSeconds: number,
  ): Promise<RefreshRotationResult> {
    const current = this.refreshHashes.get(sessionId);
    if (current === undefined) return Promise.resolve("missing");
    if (current !== presentedHash) return Promise.resolve("mismatch");
    this.refreshHashes.set(sessionId, nextHash);
    return Promise.resolve("ok");
  }
}

export class RedisBffSessionStore implements BffSessionStore, OnModuleDestroy {
  private readonly redis: RedisClientType;
  private connectPromise: Promise<void> | null = null;

  constructor(private readonly config: BffConfig) {
    this.redis = createClient({
      url: config.sessionRedisUrl,
      socket: new URL(config.sessionRedisUrl).protocol === "rediss:"
        ? {
            connectTimeout: config.redisConnectTimeoutMs,
            tls: true as const,
            ...(config.redisCaBase64
              ? {
                  ca: Buffer.from(
                    config.redisCaBase64,
                    "base64",
                  ).toString("utf8"),
                }
              : {}),
            reconnectStrategy: (retries: number) =>
              Math.min(100 * 2 ** retries, 2_000),
          }
        : {
            connectTimeout: config.redisConnectTimeoutMs,
            keepAlive: true,
            keepAliveInitialDelay: 5_000,
            reconnectStrategy: (retries: number) =>
              Math.min(100 * 2 ** retries, 2_000),
          },
    });
    this.redis.on("error", (error: Error) => {
      console.error("BFF Redis client error", { message: error.message });
    });
  }

  async findSession(sessionId: string): Promise<BffSessionRecord | null> {
    await this.ensureConnected();
    const raw = await withTimeout(
      this.redis.get(this.sessionKey(sessionId)),
      this.config.redisCommandTimeoutMs,
    );

    if (!raw) return null;

    let parsed: unknown;
    try {
      parsed = JSON.parse(String(raw)) as unknown;
    } catch {
      return null;
    }
    return isRecord(parsed) ? readSessionRecord(parsed) : null;
  }

  async saveSession(session: BffSessionRecord): Promise<void> {
    await this.ensureConnected();
    // Physical Redis TTL is the absolute ceiling, not the sliding
    // expiresAt -- a refresh call must still be able to find (and extend)
    // a session whose expiresAt has already lapsed but whose
    // absoluteExpiresAt hasn't. requireSession()/verifySession() on the
    // API side independently reject on expiresAt regardless of whether the
    // Redis key itself still exists, so this doesn't change what a normal
    // (non-refresh) request accepts.
    const ttlSeconds = ttlSecondsUntil(session.absoluteExpiresAt);
    await withTimeout(
      this.redis.set(
        this.sessionKey(session.sessionId),
        JSON.stringify(session),
        { EX: ttlSeconds },
      ),
      this.config.redisCommandTimeoutMs,
    );
    // Idempotent: re-adding an existing member is a no-op, so this runs on
    // every save (not just creation) rather than needing to special-case
    // "is this session new". Self-healing on read -- see
    // listSessionsForUser, which prunes entries whose session key is gone.
    await withTimeout(
      this.redis.sAdd(this.userIndexKey(session.userId), session.sessionId),
      this.config.redisCommandTimeoutMs,
    );
  }

  async revokeSession(sessionId: string, revokedAt: string): Promise<void> {
    await this.ensureConnected();
    const session = await this.findSession(sessionId);
    if (!session) return;
    const ttlSeconds = ttlSecondsUntil(session.absoluteExpiresAt);
    await withTimeout(
      this.redis.set(
        this.sessionKey(sessionId),
        JSON.stringify({ ...session, revokedAt }),
        { EX: ttlSeconds },
      ),
      this.config.redisCommandTimeoutMs,
    );
    await withTimeout(
      this.redis.sRem(this.userIndexKey(session.userId), sessionId),
      this.config.redisCommandTimeoutMs,
    );
  }

  async listSessionsForUser(userId: string): Promise<readonly BffSessionRecord[]> {
    await this.ensureConnected();
    const sessionIds = await withTimeout(
      this.redis.sMembers(this.userIndexKey(userId)),
      this.config.redisCommandTimeoutMs,
    );
    if (sessionIds.length === 0) return [];

    const results: BffSessionRecord[] = [];
    const staleIds: string[] = [];
    const now = Date.now();

    for (const sessionId of sessionIds) {
      const session = await this.findSession(sessionId);
      if (!session || session.revokedAt !== null || Date.parse(session.absoluteExpiresAt) <= now) {
        staleIds.push(sessionId);
        continue;
      }
      results.push(session);
    }

    if (staleIds.length > 0) {
      await withTimeout(
        this.redis.sRem(this.userIndexKey(userId), staleIds),
        this.config.redisCommandTimeoutMs,
      );
    }

    return results;
  }

  async revokeAllSessionsForUser(
    userId: string,
    revokedAt: string,
    exceptSessionId?: string,
  ): Promise<void> {
    await this.ensureConnected();
    const sessionIds = await withTimeout(
      this.redis.sMembers(this.userIndexKey(userId)),
      this.config.redisCommandTimeoutMs,
    );
    for (const sessionId of sessionIds) {
      if (sessionId === exceptSessionId) continue;
      await this.revokeSession(sessionId, revokedAt);
    }
  }

  async setRefreshTokenHash(
    sessionId: string,
    tokenHash: string,
    ttlSeconds: number,
  ): Promise<void> {
    await this.ensureConnected();
    await withTimeout(
      this.redis.set(this.refreshKey(sessionId), tokenHash, { EX: Math.max(1, ttlSeconds) }),
      this.config.redisCommandTimeoutMs,
    );
  }

  async compareAndRotateRefreshTokenHash(
    sessionId: string,
    presentedHash: string,
    nextHash: string,
    ttlSeconds: number,
  ): Promise<RefreshRotationResult> {
    await this.ensureConnected();
    const result = await withTimeout(
      this.redis.eval(REFRESH_ROTATE_SCRIPT, {
        arguments: [presentedHash, nextHash, String(Math.max(1, ttlSeconds))],
        keys: [this.refreshKey(sessionId)],
      }),
      this.config.redisCommandTimeoutMs,
    );
    return result === "ok" || result === "mismatch" || result === "missing" ? result : "missing";
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.isOpen) {
      await this.redis.quit().catch(() => this.redis.disconnect());
    }
  }

  private sessionKey(sessionId: string): string {
    return `${this.config.sessionRedisPrefix}:session:${sessionId}`;
  }

  private refreshKey(sessionId: string): string {
    return `${this.config.sessionRedisPrefix}:session:${sessionId}:refresh`;
  }

  private userIndexKey(userId: string): string {
    return `${this.config.sessionRedisPrefix}:user-sessions:${userId}`;
  }

  private async ensureConnected(): Promise<void> {
    if (this.redis.isReady) return;
    const connecting = this.connectPromise ??= this.redis.connect().then(() => undefined).finally(() => {
      this.connectPromise = null;
    });
    await withTimeout(connecting, this.config.redisConnectTimeoutMs);
  }
}

export function createBffSessionStore(config: BffConfig): BffSessionStore {
  return config.sessionStoreMode === "test-memory"
    ? new TestMemoryBffSessionStore()
    : new RedisBffSessionStore(config);
}

function ttlSecondsUntil(isoDate: string): number {
  return Math.max(1, Math.floor((Date.parse(isoDate) - Date.now()) / 1_000));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: NodeJS.Timeout | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_resolve, reject) => {
        timeout = setTimeout(() => reject(new Error("Redis command timed out.")), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function readSessionRecord(value: JsonRecord): BffSessionRecord | null {
  const sessionId = readString(value, "sessionId");
  const userId = readString(value, "userId");
  const expiresAt = readString(value, "expiresAt");
  const activeTenantId = readString(value, "activeTenantId") ?? readString(value, "tenantId");
  const activeWorkspaceId = readString(value, "activeWorkspaceId") ?? readString(value, "workspaceId");
  const memberships = readMemberships(value.memberships);

  if (!sessionId || !userId || !expiresAt || !activeTenantId || !activeWorkspaceId || !memberships) {
    return null;
  }

  const capabilities = readStringArray(value.capabilities)
    ?? memberships.find((membership) =>
      membership.tenantId === activeTenantId
      && membership.workspaceId === activeWorkspaceId
    )?.capabilities;
  if (!capabilities) return null;

  const authLevel = readAuthLevel(value.authLevel)
    ?? (value.mfaVerified === true ? "mfa" : "session");

  const user = isRecord(value.user)
    ? readSessionUser(value.user)
    : null;

  return {
    // Records saved before this field existed have no absolute ceiling of
    // their own; falling back to expiresAt just means they behave exactly
    // as before (no refresh capability) instead of failing to parse.
    absoluteExpiresAt: readString(value, "absoluteExpiresAt") ?? expiresAt,
    activeTenantId,
    activeWorkspaceId,
    authLevel,
    capabilities,
    expiresAt,
    issuedAt: readString(value, "issuedAt") ?? expiresAt,
    memberships,
    revokedAt: readNullableString(value.revokedAt),
    sessionId,
    stepUpExpiresAt: readNullableString(value.stepUpExpiresAt),
    ...(user ? { user } : {}),
    userAgent: readNullableString(value.userAgent),
    userId,
  };
}

function readMemberships(value: unknown): readonly BffSessionMembership[] | null {
  if (!Array.isArray(value)) return null;
  const memberships: BffSessionMembership[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const tenantId = readString(item, "tenantId");
    const tenantName = readNullableString(item.tenantName);
    const workspaceId = readString(item, "workspaceId");
    const workspaceName = readNullableString(item.workspaceName);
    const capabilities = readStringArray(item.capabilities);
    const roles = readStringArray(item.roles) ?? [];
    if (!tenantId || !workspaceId || !capabilities) return null;
    memberships.push({
      capabilities,
      roles,
      tenantId,
      ...(tenantName ? { tenantName } : {}),
      workspaceId,
      ...(workspaceName ? { workspaceName } : {}),
    });
  }
  return memberships;
}

function readSessionUser(value: JsonRecord): { readonly displayName: string; readonly email: string } | null {
  const displayName = readString(value, "displayName");
  const email = readString(value, "email");
  return displayName && email ? { displayName, email } : null;
}

function readAuthLevel(value: unknown): BffSessionRecord["authLevel"] | null {
  return value === "session" || value === "mfa" || value === "step_up" ? value : null;
}

function readString(source: JsonRecord, key: string): string | null {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNullableString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readStringArray(value: unknown): readonly string[] | null {
  return Array.isArray(value)
    && value.every((item) => typeof item === "string" && item.length > 0)
    ? [...new Set(value)]
    : null;
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
