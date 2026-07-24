import { createConnection } from "node:net";
import type { OnModuleDestroy } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
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
  readonly findSession: (
    sessionId: string,
  ) => Promise<BffSessionRecord | null>;
};

export const BFF_SESSION_STORE = Symbol("BFF_SESSION_STORE");

@Injectable()
export class TestMemoryBffSessionStore implements BffSessionStore {
  private readonly sessions = new Map<string, BffSessionRecord>();

  findSession(sessionId: string): Promise<BffSessionRecord | null> {
    return Promise.resolve(this.sessions.get(sessionId) ?? null);
  }

  saveSession(session: BffSessionRecord): void {
    this.sessions.set(session.sessionId, session);
  }
}

export class RedisBffSessionStore
  implements BffSessionStore, OnModuleDestroy
{
  private readonly redis: RedisRespClient;

  constructor(private readonly config: BffConfig) {
    this.redis = RedisRespClient.fromUrl(config.sessionRedisUrl);
  }

  async findSession(sessionId: string): Promise<BffSessionRecord | null> {
    const raw = await this.redis.get(
      `${this.config.sessionRedisPrefix}:session:${sessionId}`,
    );

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as unknown;
    return isRecord(parsed) ? readSessionRecord(parsed) : null;
  }

  onModuleDestroy(): Promise<void> {
    return Promise.resolve();
  }
}

export function createBffSessionStore(config: BffConfig): BffSessionStore {
  return config.sessionStoreMode === "test-memory"
    ? new TestMemoryBffSessionStore()
    : new RedisBffSessionStore(config);
}

function readSessionRecord(value: JsonRecord): BffSessionRecord | null {
  const sessionId = readString(value, "sessionId");
  const userId = readString(value, "userId");
  const expiresAt = readString(value, "expiresAt");
  const activeTenantId =
    readString(value, "activeTenantId") ?? readString(value, "tenantId");
  const activeWorkspaceId =
    readString(value, "activeWorkspaceId") ?? readString(value, "workspaceId");
  const memberships = readMemberships(value.memberships);

  if (
    !sessionId
    || !userId
    || !expiresAt
    || !activeTenantId
    || !activeWorkspaceId
    || !memberships
  ) {
    return null;
  }

  const capabilities =
    readStringArray(value.capabilities)
    ?? memberships.find(
      (membership) =>
        membership.tenantId === activeTenantId
        && membership.workspaceId === activeWorkspaceId,
    )?.capabilities;

  if (!capabilities) {
    return null;
  }

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
  if (!Array.isArray(value)) {
    return null;
  }

  const memberships: BffSessionMembership[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const tenantId = readString(item, "tenantId");
    const workspaceId = readString(item, "workspaceId");
    const capabilities = readStringArray(item.capabilities);
    const roles = readStringArray(item.roles) ?? [];

    if (!tenantId || !workspaceId || !capabilities) {
      return null;
    }

    memberships.push({
      capabilities,
      roles,
      tenantId,
      workspaceId,
    });
  }

  return memberships;
}

function readAuthLevel(value: unknown): BffSessionRecord["authLevel"] | null {
  return value === "session" || value === "mfa" || value === "step_up"
    ? value
    : null;
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

class RedisRespClient {
  private constructor(
    private readonly host: string,
    private readonly port: number,
  ) {}

  static fromUrl(value: string): RedisRespClient {
    const parsed = new URL(value);
    return new RedisRespClient(
      parsed.hostname,
      Number.parseInt(parsed.port || "6379", 10),
    );
  }

  get(key: string): Promise<string | null> {
    return this.command(["GET", key]).then((value) =>
      typeof value === "string" ? value : null,
    );
  }

  private command(args: readonly string[]): Promise<unknown> {
    return new Promise((resolve, reject) => {
      let settled = false;
      let buffer = Buffer.alloc(0);
      const socket = createConnection(
        {
          host: this.host,
          port: this.port,
        },
        () => {
          socket.write(encodeCommand(args));
        },
      );

      socket.on("data", (chunk) => {
        buffer = Buffer.concat([buffer, chunk]);

        try {
          const parsed = parseResp(buffer.toString("utf8"));
          settled = true;
          socket.end();
          resolve(parsed.value);
        } catch (error) {
          if (isIncompleteResp(buffer.toString("utf8"))) {
            return;
          }

          settled = true;
          socket.destroy();
          reject(error);
        }
      });

      socket.on("error", (error) => {
        if (!settled) {
          reject(error);
        }
      });

      socket.on("end", () => {
        if (!settled) {
          reject(new Error("Redis connection closed before a response."));
        }
      });
    });
  }
}

function encodeCommand(args: readonly string[]): string {
  return `*${args.length}\r\n${args
    .map((arg) => `$${Buffer.byteLength(arg)}\r\n${arg}\r\n`)
    .join("")}`;
}

function parseResp(
  input: string,
  offset = 0,
): { readonly next: number; readonly value: unknown } {
  const type = input[offset];

  if (type === "+") {
    const end = input.indexOf("\r\n", offset);
    return { next: end + 2, value: input.slice(offset + 1, end) };
  }

  if (type === "-") {
    const end = input.indexOf("\r\n", offset);
    throw new Error(input.slice(offset + 1, end));
  }

  if (type === "$") {
    const end = input.indexOf("\r\n", offset);
    const length = Number.parseInt(input.slice(offset + 1, end), 10);

    if (length === -1) {
      return { next: end + 2, value: null };
    }

    const start = end + 2;
    return {
      next: start + length + 2,
      value: input.slice(start, start + length),
    };
  }

  throw new Error("Unsupported Redis response.");
}

function isIncompleteResp(input: string): boolean {
  return !input.endsWith("\r\n");
}
