import type { OnModuleDestroy } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import { createClient, type RedisClientType } from "redis";
import type { BffConfig } from "./config.js";

type JsonRecord = Record<string, unknown>;

export type BffSessionMembership = {
  readonly capabilities: readonly string[];
  readonly roles: readonly string[];
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type BffSessionRecord = {
  readonly activeTenantId: string;
  readonly activeWorkspaceId: string;
  readonly authLevel: "mfa" | "session" | "step_up";
  readonly capabilities: readonly string[];
  readonly expiresAt: string;
  readonly memberships: readonly BffSessionMembership[];
  readonly revokedAt: string | null;
  readonly sessionId: string;
  readonly stepUpExpiresAt: string | null;
  readonly userId: string;
};

export type BffSessionStore = {
  readonly findSession: (sessionId: string) => Promise<BffSessionRecord | null>;
  readonly saveSession: (session: BffSessionRecord) => Promise<void>;
  readonly revokeSession: (sessionId: string, revokedAt: string) => Promise<void>;
};

export const BFF_SESSION_STORE = Symbol("BFF_SESSION_STORE");

@Injectable()
export class TestMemoryBffSessionStore implements BffSessionStore {
  private readonly sessions = new Map<string, BffSessionRecord>();

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
      this.redis.get(`${this.config.sessionRedisPrefix}:session:${sessionId}`),
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
    const ttlSeconds = Math.max(
      1,
      Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1_000),
    );
    await withTimeout(
      this.redis.set(
        `${this.config.sessionRedisPrefix}:session:${session.sessionId}`,
        JSON.stringify(session),
        { EX: ttlSeconds },
      ),
      this.config.redisCommandTimeoutMs,
    );
  }

  async revokeSession(sessionId: string, revokedAt: string): Promise<void> {
    await this.ensureConnected();
    const key = `${this.config.sessionRedisPrefix}:session:${sessionId}`;
    const session = await this.findSession(sessionId);
    if (!session) return;
    const ttlSeconds = Math.max(
      1,
      Math.floor((Date.parse(session.expiresAt) - Date.now()) / 1_000),
    );
    await withTimeout(
      this.redis.set(key, JSON.stringify({ ...session, revokedAt }), { EX: ttlSeconds }),
      this.config.redisCommandTimeoutMs,
    );
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.isOpen) {
      await this.redis.quit().catch(() => this.redis.disconnect());
    }
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

  return {
    activeTenantId,
    activeWorkspaceId,
    authLevel,
    capabilities,
    expiresAt,
    memberships,
    revokedAt: readNullableString(value.revokedAt),
    sessionId,
    stepUpExpiresAt: readNullableString(value.stepUpExpiresAt),
    userId,
  };
}

function readMemberships(value: unknown): readonly BffSessionMembership[] | null {
  if (!Array.isArray(value)) return null;
  const memberships: BffSessionMembership[] = [];
  for (const item of value) {
    if (!isRecord(item)) return null;
    const tenantId = readString(item, "tenantId");
    const workspaceId = readString(item, "workspaceId");
    const capabilities = readStringArray(item.capabilities);
    const roles = readStringArray(item.roles) ?? [];
    if (!tenantId || !workspaceId || !capabilities) return null;
    memberships.push({ capabilities, roles, tenantId, workspaceId });
  }
  return memberships;
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
