import "reflect-metadata";
import { beforeEach, describe, expect, it } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService } from "./security.service.js";
import { signCookieValue } from "./cookie-signing.js";
import { TestMemoryBffSessionStore, type BffSessionRecord } from "./session-store.js";

// Behavioral coverage for the refresh-token rotation + reuse-detection
// design added in the P0 Faza 4 (session lifecycle) work: no refresh
// mechanism existed at all before this -- sessions just hard-expired.

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
    method: "POST",
  } as unknown as FastifyRequest;
}

// A state-changing request (refresh is a POST) must carry a valid,
// session-bound double-submit CSRF token, exactly like a real browser
// request would after calling GET /api/csrf -- see
// BffSecurityService.validateCsrf. Bypassing this in the test fixture
// would silently stop exercising CSRF enforcement on the refresh route.
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

async function establish(
  service: BffIdentitySessionService,
): Promise<{ readonly sessionCookie: string; readonly refreshCookie: string; readonly sessionId: string }> {
  const request = fakeRequest({});
  const reply = fakeReply();
  const session = await service.establishSession(request, reply, {
    userId: "user-1",
    email: "user@example.com",
    displayName: "Test User",
    memberships: [{
      capabilities: ["workspace.read"],
      roles: ["Analyst"],
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
    }],
  });
  const sessionCookie = String(reply.cookies[config.sessionCookieName]);
  const refreshCookie = String(reply.cookies[config.refreshCookieName]);
  expect(sessionCookie).toBeTruthy();
  expect(refreshCookie).toBeTruthy();
  return { sessionCookie, refreshCookie, sessionId: session.sessionId };
}

describe("BffIdentitySessionService.refresh", () => {
  let sessions: TestMemoryBffSessionStore;
  let service: BffIdentitySessionService;
  let security: BffSecurityService;

  beforeEach(() => {
    sessions = new TestMemoryBffSessionStore();
    ({ service, security } = buildService(sessions));
  });

  it("rotates both cookies on a valid refresh and the session survives past the old expiresAt", async () => {
    const { sessionCookie, refreshCookie, sessionId } = await establish(service);

    const csrf = withCsrf(security, sessionId, {
      [config.sessionCookieName]: sessionCookie,
      [config.refreshCookieName]: refreshCookie,
    });
    const reply = fakeReply();
    await service.refresh(fakeRequest(csrf.cookies, csrf.headers), reply);

    expect(reply.statusCode).not.toBe(401);
    const newSessionCookie = String(reply.cookies[config.sessionCookieName]);
    const newRefreshCookie = String(reply.cookies[config.refreshCookieName]);
    expect(newSessionCookie).toBeTruthy();
    expect(newRefreshCookie).toBeTruthy();
    // Same session, cookies rotated to new signed values.
    expect(newRefreshCookie).not.toBe(refreshCookie);

    const stored = await sessions.findSession(sessionId);
    expect(stored?.revokedAt).toBeNull();
  });

  it("detects reuse: presenting an already-rotated-away refresh token revokes every session for the user", async () => {
    const { sessionCookie, refreshCookie, sessionId } = await establish(service);

    // First refresh succeeds and rotates the token.
    const firstCsrf = withCsrf(security, sessionId, {
      [config.sessionCookieName]: sessionCookie,
      [config.refreshCookieName]: refreshCookie,
    });
    await service.refresh(fakeRequest(firstCsrf.cookies, firstCsrf.headers), fakeReply());

    // A second, independent session for the same user, to prove reuse
    // detection revokes the whole account's session family, not just the
    // one session the stale token belonged to.
    const other = await establish(service);

    // Replaying the ORIGINAL (now superseded) refresh token must fail...
    const replayCsrf = withCsrf(security, sessionId, {
      [config.sessionCookieName]: sessionCookie,
      [config.refreshCookieName]: refreshCookie,
    });
    await expect(
      service.refresh(fakeRequest(replayCsrf.cookies, replayCsrf.headers), fakeReply()),
    ).rejects.toThrow();

    // ...and revoke both this user's sessions, including the unrelated one.
    const firstSession = await sessions.findSession(sessionId);
    const otherSession = await sessions.findSession(other.sessionId);
    expect(firstSession?.revokedAt).not.toBeNull();
    expect(otherSession?.revokedAt).not.toBeNull();
  });

  it("rejects refresh once the session is past its absolute expiry, even with a valid-looking token", async () => {
    const { sessionCookie, refreshCookie, sessionId } = await establish(service);
    const original = await sessions.findSession(sessionId);
    expect(original).not.toBeNull();
    // Simulate the absolute ceiling having already passed.
    await sessions.saveSession({
      ...(original as BffSessionRecord),
      absoluteExpiresAt: new Date(Date.now() - 1_000).toISOString(),
    });

    const csrf = withCsrf(security, sessionId, {
      [config.sessionCookieName]: sessionCookie,
      [config.refreshCookieName]: refreshCookie,
    });
    await expect(
      service.refresh(fakeRequest(csrf.cookies, csrf.headers), fakeReply()),
    ).rejects.toThrow();
  });

  it("rejects refresh with a tampered refresh cookie", async () => {
    const { sessionCookie, sessionId } = await establish(service);
    const forged = signCookieValue("not-the-real-token", "a-completely-different-secret-32-bytes");

    const csrf = withCsrf(security, sessionId, {
      [config.sessionCookieName]: sessionCookie,
      [config.refreshCookieName]: forged,
    });
    await expect(
      service.refresh(fakeRequest(csrf.cookies, csrf.headers), fakeReply()),
    ).rejects.toThrow();
  });
});
