import { Inject, Injectable } from "@nestjs/common";
import type { OnModuleDestroy } from "@nestjs/common";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "redis";
import type { RedisClientType } from "redis";
import type { CanonicalCapability } from "@papadata/contracts";
import {
  isAuthenticationLevel,
  type RequestPrincipal,
  type RequestPrincipalMembership,
  type RequestWithPrincipal,
} from "./request-principal.js";
import { isCanonicalCapability } from "./route-policy.js";

type JsonRecord = Record<string, unknown>;

export const internalPrincipalHeaderName = "x-papadata-internal-principal";

export type PrincipalClock = {
  readonly now: () => Date;
};

export type PrincipalSessionRecord = {
  readonly activeTenantId?: string;
  readonly activeWorkspaceId?: string;
  readonly expiresAt: string;
  readonly revokedAt: string | null;
  readonly sessionId: string;
  readonly userId: string;
};

export type PrincipalSessionStore = {
  readonly findSession: (
    sessionId: string,
  ) => Promise<PrincipalSessionRecord | null>;
};

export const PRINCIPAL_CLOCK = Symbol("PRINCIPAL_CLOCK");
export const PRINCIPAL_SESSION_STORE = Symbol("PRINCIPAL_SESSION_STORE");

export const systemPrincipalClock: PrincipalClock = {
  now: () => new Date(),
};

export class PrincipalConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrincipalConfigurationError";
  }
}

@Injectable()
export class RedisPrincipalSessionStore
  implements OnModuleDestroy, PrincipalSessionStore
{
  private redisClient: RedisClientType | null = null;

  async onModuleDestroy(): Promise<void> {
    if (this.redisClient?.isOpen) {
      await this.redisClient.quit();
    }
  }

  async findSession(sessionId: string): Promise<PrincipalSessionRecord | null> {
    const mode = process.env.PAPADATA_API_AUTH_SESSION_STORE;

    if (mode !== "redis-auth-state") {
      throw new PrincipalConfigurationError(
        "Production principal session verification is not configured.",
      );
    }

    const redisUrl = requiredEnv("REDIS_URL");
    const redis = await this.getRedis(redisUrl);
    const prefix = process.env.PAPADATA_API_AUTH_SESSION_REDIS_PREFIX
      ?? "papadata:auth";
    const raw = await redis.get(`${prefix}:session:${sessionId}`);

    if (!raw) {
      return null;
    }

    const session = JSON.parse(raw) as unknown;
    return isRecord(session) ? readSessionRecord(session) : null;
  }

  private async getRedis(url: string): Promise<RedisClientType> {
    if (!this.redisClient) {
      this.redisClient = createClient({ url });
    }

    if (!this.redisClient.isOpen) {
      await this.redisClient.connect();
    }

    return this.redisClient;
  }
}

@Injectable()
export class TestMemoryPrincipalSessionStore
  implements PrincipalSessionStore
{
  private readonly sessions = new Map<string, PrincipalSessionRecord>();

  findSession(sessionId: string): Promise<PrincipalSessionRecord | null> {
    return Promise.resolve(this.sessions.get(sessionId) ?? null);
  }

  saveSession(session: PrincipalSessionRecord): void {
    this.sessions.set(session.sessionId, session);
  }
}

export function createPrincipalSessionStore(): PrincipalSessionStore {
  if (process.env.PAPADATA_API_AUTH_SESSION_STORE === "test-memory") {
    if (process.env.NODE_ENV !== "test") {
      throw new PrincipalConfigurationError(
        "The test principal session store is only available when NODE_ENV=test.",
      );
    }

    return new TestMemoryPrincipalSessionStore();
  }

  return new RedisPrincipalSessionStore();
}

@Injectable()
export class PrincipalService {
  constructor(
    @Inject(PRINCIPAL_SESSION_STORE)
    private readonly sessionStore: PrincipalSessionStore,

    @Inject(PRINCIPAL_CLOCK)
    private readonly clock: PrincipalClock,
  ) {}

  async resolve(request: RequestWithPrincipal): Promise<RequestPrincipal | null> {
    const token = readInternalPrincipalToken(request.headers);

    if (!token) {
      return null;
    }

    const now = this.clock.now();
    const principal = this.verifyToken(token, now);

    if (!principal) {
      return null;
    }

    const sessionValid = await this.verifySession(principal, now);
    return sessionValid ? principal : null;
  }

  private verifyToken(token: string, now: Date): RequestPrincipal | null {
    const issuer = requiredEnv("PAPADATA_API_AUTH_ISSUER");
    const audience = requiredEnv("PAPADATA_API_AUTH_AUDIENCE");
    const secrets = readSigningSecrets();

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    const header = parseJsonPart(encodedHeader);

    if (
      !isRecord(header)
      || header.alg !== "HS256"
      || header.typ !== "JWT"
    ) {
      return null;
    }

    if (
      !secrets.some((secret) =>
        safeEqual(
          signature,
          createHmac("sha256", secret)
            .update(`${encodedHeader}.${encodedPayload}`)
            .digest("base64url"),
        ),
      )
    ) {
      return null;
    }

    const claims = parseJsonPart(encodedPayload);

    if (!isRecord(claims)) {
      return null;
    }

    if (
      readString(claims, "iss") !== issuer
      || !audienceMatches(claims.aud, audience)
    ) {
      return null;
    }

    const userId = readString(claims, "sub");
    const sessionId = readString(claims, "sid");
    const tenantId = readString(claims, "tid");
    const workspaceId = readString(claims, "wid");
    const issuedAtSeconds = readNumericDate(claims, "iat");
    const expiresAtSeconds = readNumericDate(claims, "exp");
    const authLevel = readString(claims, "auth_level");

    if (
      !userId
      || !sessionId
      || !tenantId
      || !workspaceId
      || issuedAtSeconds === null
      || expiresAtSeconds === null
      || !authLevel
      || !isAuthenticationLevel(authLevel)
    ) {
      return null;
    }

    if (!validTokenTimeWindow(issuedAtSeconds, expiresAtSeconds, now)) {
      return null;
    }

    const capabilities = readCapabilities(claims.caps);
    const memberships = readMemberships(claims.memberships);

    if (
      !capabilities
      || !memberships
      || !memberships.some(
        (membership) =>
          membership.tenantId === tenantId
          && membership.workspaceId === workspaceId,
      )
    ) {
      return null;
    }

    const stepUpExpiresAt = readNullableIsoDate(
      claims.step_up_expires_at,
    );

    return {
      authLevel,
      capabilities,
      expiresAt: new Date(expiresAtSeconds * 1000).toISOString(),
      issuedAt: new Date(issuedAtSeconds * 1000).toISOString(),
      issuer,
      memberships,
      sessionId,
      source: "internal_token",
      stepUpExpiresAt,
      tenantId,
      userId,
      workspaceId,
    };
  }

  private async verifySession(
    principal: RequestPrincipal,
    now: Date,
  ): Promise<boolean> {
    const session = await this.sessionStore.findSession(principal.sessionId);

    if (!session) {
      return false;
    }

    if (
      session.sessionId !== principal.sessionId
      || session.userId !== principal.userId
      || Date.parse(session.expiresAt) <= now.getTime()
      || session.revokedAt !== null
    ) {
      return false;
    }

    return !(
      (session.activeTenantId && session.activeTenantId !== principal.tenantId)
      || (session.activeWorkspaceId
        && session.activeWorkspaceId !== principal.workspaceId)
    );
  }
}

function readInternalPrincipalToken(
  headers: RequestWithPrincipal["headers"],
): string | null {
  const header = headers?.[internalPrincipalHeaderName];
  const value = Array.isArray(header) ? header[0] : header;

  return value?.trim() || null;
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new PrincipalConfigurationError(
      `${name} is required for production principal resolution.`,
    );
  }

  return value;
}

function readSigningSecrets(): readonly string[] {
  const active =
    process.env.PAPADATA_API_AUTH_ACTIVE_SECRET
    ?? process.env.PAPADATA_API_AUTH_JWT_SECRET;

  if (!active) {
    throw new PrincipalConfigurationError(
      "PAPADATA_API_AUTH_ACTIVE_SECRET is required for production principal resolution.",
    );
  }

  const previous = process.env.PAPADATA_API_AUTH_PREVIOUS_SECRET;
  const secrets = previous ? [active, previous] : [active];

  for (const [index, secret] of secrets.entries()) {
    if (Buffer.byteLength(secret, "utf8") < 32) {
      throw new PrincipalConfigurationError(
        `${index === 0 ? "PAPADATA_API_AUTH_ACTIVE_SECRET" : "PAPADATA_API_AUTH_PREVIOUS_SECRET"} must be at least 32 bytes.`,
      );
    }
  }

  if (previous && active === previous) {
    throw new PrincipalConfigurationError(
      "PAPADATA_API_AUTH_ACTIVE_SECRET and PAPADATA_API_AUTH_PREVIOUS_SECRET must be different.",
    );
  }

  return secrets;
}

function parseJsonPart(value: string): unknown {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readString(source: JsonRecord, key: string): string | null {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readNumber(source: JsonRecord, key: string): number | null {
  const value = source[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readNumericDate(source: JsonRecord, key: string): number | null {
  const value = readNumber(source, key);
  return value !== null && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

function validTokenTimeWindow(
  issuedAtSeconds: number,
  expiresAtSeconds: number,
  now: Date,
): boolean {
  const allowedClockSkewSeconds = readBoundedSeconds(
    "AUTH_CLOCK_SKEW_SECONDS",
    60,
    0,
    300,
  );
  const maxAgeSeconds = readBoundedSeconds(
    "AUTH_INTERNAL_TOKEN_MAX_AGE_SECONDS",
    300,
    1,
    3600,
  );
  const nowSeconds = Math.floor(now.getTime() / 1000);

  return expiresAtSeconds > issuedAtSeconds
    && issuedAtSeconds <= nowSeconds + allowedClockSkewSeconds
    && expiresAtSeconds + allowedClockSkewSeconds > nowSeconds
    && nowSeconds - issuedAtSeconds <= maxAgeSeconds + allowedClockSkewSeconds;
}

function readBoundedSeconds(
  name: string,
  defaultValue: number,
  min: number,
  max: number,
): number {
  const raw = process.env[name];

  if (raw === undefined) {
    return defaultValue;
  }

  if (!/^\d+$/u.test(raw)) {
    throw new PrincipalConfigurationError(`${name} must be an integer.`);
  }

  const value = Number(raw);

  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new PrincipalConfigurationError(
      `${name} must be between ${min} and ${max} seconds.`,
    );
  }

  return value;
}

function readSessionRecord(value: JsonRecord): PrincipalSessionRecord | null {
  const sessionId = readString(value, "sessionId");
  const userId = readString(value, "userId");
  const expiresAt = readString(value, "expiresAt");

  if (!sessionId || !userId || !expiresAt) {
    return null;
  }

  return {
    activeTenantId: readString(value, "activeTenantId") ?? undefined,
    activeWorkspaceId: readString(value, "activeWorkspaceId") ?? undefined,
    expiresAt,
    revokedAt: typeof value.revokedAt === "string" ? value.revokedAt : null,
    sessionId,
    userId,
  };
}

function audienceMatches(value: unknown, expected: string): boolean {
  return value === expected
    || (Array.isArray(value) && value.every((item) => typeof item === "string")
      && value.includes(expected));
}

function readCapabilities(
  value: unknown,
): readonly CanonicalCapability[] | null {
  if (
    !Array.isArray(value)
    || !value.every(
      (item): item is CanonicalCapability =>
        typeof item === "string" && isCanonicalCapability(item),
    )
  ) {
    return null;
  }

  return [...new Set(value)];
}

function readMemberships(
  value: unknown,
): readonly RequestPrincipalMembership[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const memberships: RequestPrincipalMembership[] = [];

  for (const item of value) {
    if (!isRecord(item)) {
      return null;
    }

    const tenantId = readString(item, "tenantId");
    const workspaceId = readString(item, "workspaceId");
    const capabilities = readCapabilities(item.capabilities);

    if (!tenantId || !workspaceId || !capabilities) {
      return null;
    }

    const roles = Array.isArray(item.roles)
      && item.roles.every((role) => typeof role === "string")
      ? item.roles
      : [];

    memberships.push({
      capabilities,
      roles,
      tenantId,
      workspaceId,
    });
  }

  return memberships;
}

function readNullableIsoDate(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length
    && timingSafeEqual(leftBuffer, rightBuffer);
}
