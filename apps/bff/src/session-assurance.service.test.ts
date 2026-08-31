import "reflect-metadata";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { BffConfig } from "./config.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffIdentitySessionService } from "./identity-session.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSessionAssuranceService } from "./session-assurance.service.js";
import { BffSecurityService } from "./security.service.js";
import { TestMemoryBffSessionStore, type BffSessionRecord } from "./session-store.js";

// Behavioral coverage for the P0 Faza 5 (MFA / step-up / recovery
// hardening) BFF-side wiring added in this phase: verifyMfa (the per-login
// MFA challenge that never existed before -- see totp.service.test.ts's
// sibling backend coverage and the design note in session-assurance.service.ts),
// redeemMfaRecoveryCode, disableMfa (forces a full sign-out), and the
// dedicated MFA brute-force rate limit shared by verify/step-up/recovery.

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

function buildServices(sessions: TestMemoryBffSessionStore): {
  readonly identitySession: BffIdentitySessionService;
  readonly assurance: BffSessionAssuranceService;
  readonly security: BffSecurityService;
} {
  const security = new BffSecurityService(config, sessions);
  const rateLimit = new BffRateLimitService(config);
  const cloudRunIdentity = new CloudRunIdentityService(config);
  return {
    assurance: new BffSessionAssuranceService(config, sessions, security, rateLimit, cloudRunIdentity),
    identitySession: new BffIdentitySessionService(config, sessions, security, rateLimit, cloudRunIdentity),
    security,
  };
}

async function establish(
  identitySession: BffIdentitySessionService,
): Promise<{ readonly sessionCookie: string; readonly sessionId: string }> {
  const reply = fakeReply();
  const session = await identitySession.establishSession(fakeRequest({}), reply, {
    userId: "user-1",
    email: "user@example.com",
    displayName: "Test User",
    memberships: [{
      capabilities: ["auth.mfa.enroll", "auth.mfa.manage"],
      roles: ["Analyst"],
      tenantId: "tenant-1",
      workspaceId: "workspace-1",
    }],
  });
  const sessionCookie = String(reply.cookies[config.sessionCookieName]);
  return { sessionCookie, sessionId: session.sessionId };
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("BffSessionAssuranceService", () => {
  let sessions: TestMemoryBffSessionStore;
  let identitySession: BffIdentitySessionService;
  let assurance: BffSessionAssuranceService;
  let security: BffSecurityService;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    sessions = new TestMemoryBffSessionStore();
    ({ assurance, identitySession, security } = buildServices(sessions));
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("verifyMfa elevates a fresh session from session to mfa on a correct code", async () => {
    const { sessionCookie, sessionId } = await establish(identitySession);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { verified: true } }));

    const csrf = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
    const reply = fakeReply();
    await assurance.verifyMfa(fakeRequest(csrf.cookies, csrf.headers), reply, { code: "123456" });

    expect(reply.statusCode).toBe(200);
    const stored = await sessions.findSession(sessionId);
    expect(stored?.authLevel).toBe("mfa");
    const [calledUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe("http://api:3001/v1/security/mfa/verify");
    expect(requestInit.method ?? "POST").toBe("POST");
  });

  it("verifyMfa rejects and leaves the session at authLevel session when the API reports verified: false", async () => {
    const { sessionCookie, sessionId } = await establish(identitySession);
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { verified: false } }));

    const csrf = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
    const reply = fakeReply();
    await assurance.verifyMfa(fakeRequest(csrf.cookies, csrf.headers), reply, { code: "000000" });

    expect(reply.statusCode).toBe(403);
    const stored = await sessions.findSession(sessionId);
    expect(stored?.authLevel).toBe("session");
  });

  it("verifyMfa does not revoke sibling sessions on success -- it is not a security-changed event", async () => {
    const first = await establish(identitySession);
    const secondReply = fakeReply();
    await identitySession.establishSession(fakeRequest({}), secondReply, {
      userId: "user-1",
      email: "user@example.com",
      displayName: "Test User",
      memberships: [{
        capabilities: ["auth.mfa.enroll"],
        roles: ["Analyst"],
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
      }],
    });
    const secondSessions = await sessions.listSessionsForUser("user-1");
    expect(secondSessions).toHaveLength(2);

    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { verified: true } }));
    const csrf = withCsrf(security, first.sessionId, { [config.sessionCookieName]: first.sessionCookie });
    await assurance.verifyMfa(fakeRequest(csrf.cookies, csrf.headers), fakeReply(), { code: "123456" });

    const stillActive = await sessions.listSessionsForUser("user-1");
    expect(stillActive).toHaveLength(2);
  });

  it("redeemMfaRecoveryCode elevates the session on a valid code and rejects an invalid one", async () => {
    const { sessionCookie, sessionId } = await establish(identitySession);

    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { verified: false } }));
    const csrfBad = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
    const badReply = fakeReply();
    await assurance.redeemMfaRecoveryCode(fakeRequest(csrfBad.cookies, csrfBad.headers), badReply, { code: "0000000000000000" });
    expect(badReply.statusCode).toBe(403);

    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { verified: true } }));
    const csrfGood = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
    const goodReply = fakeReply();
    await assurance.redeemMfaRecoveryCode(fakeRequest(csrfGood.cookies, csrfGood.headers), goodReply, { code: "abcdef0123456789" });
    expect(goodReply.statusCode).toBe(200);
    const stored = await sessions.findSession(sessionId);
    expect(stored?.authLevel).toBe("mfa");
  });

  it("disableMfa is refused locally without valid step-up assurance, and never calls the API", async () => {
    const { sessionCookie, sessionId } = await establish(identitySession);
    const csrf = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });

    await expect(
      assurance.disableMfa(fakeRequest(csrf.cookies, csrf.headers), fakeReply()),
    ).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
    const stored = await sessions.findSession(sessionId);
    expect(stored?.revokedAt).toBeNull();
  });

  it("disableMfa with valid step-up assurance revokes every session for the account, including the current one", async () => {
    const { sessionCookie, sessionId } = await establish(identitySession);
    const stepUpSession: BffSessionRecord = {
      ...(await sessions.findSession(sessionId) as BffSessionRecord),
      authLevel: "step_up",
      stepUpExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    };
    await sessions.saveSession(stepUpSession);

    // A sibling session for the same account -- disabling MFA anywhere
    // must end every session for the account, not just this one.
    await identitySession.establishSession(fakeRequest({}), fakeReply(), {
      userId: "user-1",
      email: "user@example.com",
      displayName: "Test User",
      memberships: [{
        capabilities: ["auth.mfa.enroll"],
        roles: ["Analyst"],
        tenantId: "tenant-1",
        workspaceId: "workspace-1",
      }],
    });
    expect(await sessions.listSessionsForUser("user-1")).toHaveLength(2);

    fetchMock.mockResolvedValueOnce(jsonResponse(200, { disabled: true }));
    const csrf = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
    const reply = fakeReply();
    await assurance.disableMfa(fakeRequest(csrf.cookies, csrf.headers), reply);

    expect(reply.statusCode).toBe(200);
    expect(reply.clearedCookies).toContain(config.sessionCookieName);
    expect(reply.clearedCookies).toContain(config.refreshCookieName);

    const allSessions = await sessions.listSessionsForUser("user-1");
    expect(allSessions).toHaveLength(0);
    const [calledUrl, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe("http://api:3001/v1/security/mfa");
    expect(requestInit.method).toBe("DELETE");
  });

  it("consumeMfaAttempt caps MFA guesses well below the generic per-account request budget", async () => {
    const { sessionCookie, sessionId } = await establish(identitySession);
    fetchMock.mockResolvedValue(jsonResponse(200, { data: { verified: false } }));

    // The dedicated MFA cap is 8/window (see rate-limit.service.ts) --
    // deliberately far tighter than the generic 300/window request budget,
    // so this must trip long before consumeRequest would.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const csrf = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
      await assurance.verifyMfa(fakeRequest(csrf.cookies, csrf.headers), fakeReply(), { code: "000000" });
    }

    const csrf = withCsrf(security, sessionId, { [config.sessionCookieName]: sessionCookie });
    const rejection: unknown = await assurance
      .verifyMfa(fakeRequest(csrf.cookies, csrf.headers), fakeReply(), { code: "000000" })
      .then(() => null, (error: unknown) => error);

    expect(rejection).toBeTruthy();
    expect((rejection as { getStatus?: () => number }).getStatus?.()).toBe(429);
    expect((rejection as { getResponse: () => unknown }).getResponse()).toMatchObject({ code: "RATE_LIMITED" });
  });
});
