import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService } from "./security.service.js";
import { TestMemoryBffSessionStore, type BffSessionRecord } from "./session-store.js";

// Behavioral coverage for multi-device session administration added in the
// P0 Faza 4 (session lifecycle) work: listing, revoking a single other
// session, and "sign out everywhere" (logout-all). None of this existed
// before -- only revoking the current session (logout) did.

const config: BffConfig = {
  allowedOrigins: ["https://papadata.localhost"],
  apiOrigin: "http://api:3001",
  cookieMaxAgeSeconds: 1800,
  cookiePath: "/",
  cookiePreviousSecret: null,
  cookieSameSite: "strict",
  cookieSecret: "test-session-cookie-secret-at-least-32-bytes-long",
  cookieSecure: false,
  csrfCookieMaxAgeSeconds: 3600,
  csrfCookieName: "papadata_csrf",
  csrfHeaderName: "x-papadata-csrf",
  csrfSecret: "test-csrf-secret-at-least-32-bytes-long-too",
  internalAuthActiveSecret: "test-internal-auth-secret-at-least-32-bytes",
  internalAuthAudience: "papadata-test-api",
  internalAuthIssuer: "papadata-test",
  internalAuthPreviousSecret: null,
  internalPrincipalHeaderName: "x-papadata-internal-principal",
  internalTokenTtlSeconds: 120,
  maxBodyBytes: 1_048_576,
  metadataIdentityEndpoint: "http://metadata.invalid",
  port: 3101,
  publicHosts: ["localhost"],
  rateLimitMax: 300,
  rateLimitWindowMs: 60_000,
  redisCaBase64: null,
  redisCommandTimeoutMs: 2_000,
  redisConnectTimeoutMs: 3_000,
  refreshCookieName: "pd_refresh",
  refreshCookiePath: "/api/v1/auth/refresh",
  refreshCookiePreviousSecret: null,
  refreshCookieSecret: "test-refresh-cookie-secret-at-least-32-bytes",
  requestIdHeaderName: "x-request-id",
  runtimeEnvironment: "test",
  sessionAbsoluteTtlSeconds: 30 * 24 * 60 * 60,
  sessionCookieName: "pd_session",
  sessionRedisPrefix: "papadata:auth",
  sessionRedisUrl: "redis://127.0.0.1:6379",
  sessionStoreMode: "test-memory",
  upstreamIdentityAudience: null,
  upstreamTimeoutMs: 5_000,
};

function fakeReply(): FastifyReply & { readonly sentBody: unknown; readonly statusCode: number | null; readonly cookies: Record<string, unknown>; readonly clearedCookies: string[] } {
  const state: { sentBody: unknown; statusCode: number | null; cookies: Record<string, unknown>; clearedCookies: string[] } = {
    sentBody: undefined,
    statusCode: null,
    cookies: {},
    clearedCookies: [],
  };
  const reply = {
    header: () => reply,
    status: (code: number) => {
      state.statusCode = code;
      return reply;
    },
    setCookie: (name: string, value: string) => {
      state.cookies[name] = value;
      return reply;
    },
    clearCookie: (name: string) => {
      state.clearedCookies.push(name);
      return reply;
    },
    send: (body: unknown) => {
      state.sentBody = body;
      return reply;
    },
    get sentBody() { return state.sentBody; },
    get statusCode() { return state.statusCode; },
    get cookies() { return state.cookies; },
    get clearedCookies() { return state.clearedCookies; },
  };
  return reply as unknown as FastifyReply & typeof state;
}

function fakeRequest(
  cookies: Record<string, string | undefined>,
  headers: Record<string, string> = {},
): FastifyRequest {
  return {
    cookies,
    headers: { host: "localhost", origin: "https://papadata.localhost", "user-agent": "vitest", ...headers },
    ip: "127.0.0.1",
    method: "GET",
  } as unknown as FastifyRequest;
}

function withCsrf(
  security: BffSecurityService,
  sessionId: string,
  cookies: Record<string, string | undefined>,
): { readonly cookies: Record<string, string | undefined>; readonly headers: Record<string, string> } {
  const token = security.issueCsrfToken({ sessionId } as BffSessionRecord);
  return {
    cookies: { ...cookies, [config.csrfCookieName]: token },
    headers: { [config.csrfHeaderName]: token },
  };
}

function buildService(sessions: TestMemoryBffSessionStore): { readonly service: BffIdentitySessionService; readonly security: BffSecurityService } {
  const security = new BffSecurityService(config, sessions);
  const rateLimit = new BffRateLimitService(config);
  const cloudRunIdentity = new CloudRunIdentityService(config);
  return {
    service: new BffIdentitySessionService(config, sessions, security, rateLimit, cloudRunIdentity),
    security,
  };
}

async function establishAs(
  service: BffIdentitySessionService,
  userId: string,
): Promise<{ readonly sessionCookie: string; readonly sessionId: string }> {
  const reply = fakeReply();
  const session = await service.establishSession(fakeRequest({}), reply, {
    userId,
    email: `${userId}@example.com`,
    displayName: userId,
    memberships: [{
      capabilities: ["workspace.read"],
      roles: ["Analyst"],
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
    }],
  });
  return { sessionCookie: String(reply.cookies[config.sessionCookieName]), sessionId: session.sessionId };
}

describe("BffIdentitySessionService session administration", () => {
  let sessions: TestMemoryBffSessionStore;
  let service: BffIdentitySessionService;
  let security: BffSecurityService;

  beforeEach(() => {
    sessions = new TestMemoryBffSessionStore();
    ({ service, security } = buildService(sessions));
  });

  it("listSessions returns every active session for the account, marking the current one", async () => {
    const first = await establishAs(service, "user-1");
    const second = await establishAs(service, "user-1");
    await establishAs(service, "user-2"); // a different account -- must never appear

    const reply = fakeReply();
    await service.listSessions(fakeRequest({ [config.sessionCookieName]: first.sessionCookie }), reply);

    const body = reply.sentBody as { readonly data: { readonly sessions: readonly { sessionId: string; current: boolean }[] } };
    const ids = body.data.sessions.map((entry) => entry.sessionId).sort();
    expect(ids).toEqual([first.sessionId, second.sessionId].sort());

    const currentEntry = body.data.sessions.find((entry) => entry.sessionId === first.sessionId);
    const otherEntry = body.data.sessions.find((entry) => entry.sessionId === second.sessionId);
    expect(currentEntry?.current).toBe(true);
    expect(otherEntry?.current).toBe(false);
  });

  it("revokeSessionById revokes a caller's own other session but not a different account's session", async () => {
    const first = await establishAs(service, "user-1");
    const second = await establishAs(service, "user-1");
    const stranger = await establishAs(service, "user-2");

    const csrf = withCsrf(security, first.sessionId, { [config.sessionCookieName]: first.sessionCookie });
    await service.revokeSessionById(
      fakeRequest(csrf.cookies, csrf.headers),
      fakeReply(),
      second.sessionId,
    );

    const revoked = await sessions.findSession(second.sessionId);
    expect(revoked?.revokedAt).not.toBeNull();

    // Attempting to revoke a session belonging to a different account must
    // fail and must not touch that session -- disclosure-safe (same error
    // whether the id doesn't exist or belongs to someone else).
    const crossAccountCsrf = withCsrf(security, first.sessionId, { [config.sessionCookieName]: first.sessionCookie });
    await expect(
      service.revokeSessionById(
        fakeRequest(crossAccountCsrf.cookies, crossAccountCsrf.headers),
        fakeReply(),
        stranger.sessionId,
      ),
    ).rejects.toThrow();
    const untouched = await sessions.findSession(stranger.sessionId);
    expect(untouched?.revokedAt).toBeNull();
  });

  it("logoutAll revokes every session for the account, including the current one, and clears cookies", async () => {
    const first = await establishAs(service, "user-1");
    const second = await establishAs(service, "user-1");
    const stranger = await establishAs(service, "user-2");

    const csrf = withCsrf(security, first.sessionId, { [config.sessionCookieName]: first.sessionCookie });
    const reply = fakeReply();
    await service.logoutAll(fakeRequest(csrf.cookies, csrf.headers), reply);

    const firstSession = await sessions.findSession(first.sessionId);
    const secondSession = await sessions.findSession(second.sessionId);
    const strangerSession = await sessions.findSession(stranger.sessionId);
    expect(firstSession?.revokedAt).not.toBeNull();
    expect(secondSession?.revokedAt).not.toBeNull();
    expect(strangerSession?.revokedAt).toBeNull();
    expect(reply.clearedCookies).toContain(config.sessionCookieName);
    expect(reply.clearedCookies).toContain(config.refreshCookieName);
  });
});
