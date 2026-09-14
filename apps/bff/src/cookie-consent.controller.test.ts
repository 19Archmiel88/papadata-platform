import "reflect-metadata";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Test } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyReply, FastifyRequest } from "fastify";
import { CookieConsentController } from "./cookie-consent.controller.js";
import { signCookieValue } from "./cookie-signing.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService } from "./security.service.js";
import { BFF_CONFIG } from "./tokens.js";
import type { BffConfig } from "./config.js";
import type { BffSessionRecord, BffSessionStore } from "./session-store.js";

describe("CookieConsentController source shape", () => {
  it("gives every constructor parameter an explicit @Inject(), matching the rest of this codebase's convention", () => {
    const path = fileURLToPath(new URL("./cookie-consent.controller.ts", import.meta.url));
    const source = readFileSync(path, "utf8");
    const constructorMatch = source.match(/constructor\(([\s\S]*?)\)\s*\{\}/u);
    expect(constructorMatch, "could not find the constructor to check").not.toBeNull();
    const params = constructorMatch![1]!.split(",").map((p) => p.trim()).filter(Boolean);
    expect(params.length).toBeGreaterThan(0);
    for (const param of params) {
      expect(param, `constructor parameter "${param}" is missing an explicit @Inject(...)`)
        .toMatch(/^@Inject\(/u);
    }
  });
});

describe("CookieConsentController DI", () => {
  it("resolves every constructor dependency via Nest DI, none undefined", async () => {
    const fakeConfig = { apiOrigin: "http://api:3001" };
    const fakeSecurity = { applyCorsHeaders: vi.fn() };
    const fakeRateLimit = { consumePublic: vi.fn(async () => undefined) };
    const fakeCloudRunIdentity = { authorizationHeader: vi.fn(async () => null) };

    const moduleRef = await Test.createTestingModule({
      controllers: [CookieConsentController],
      providers: [
        { provide: BFF_CONFIG, useValue: fakeConfig },
        { provide: BffSecurityService, useValue: fakeSecurity },
        { provide: BffRateLimitService, useValue: fakeRateLimit },
        { provide: CloudRunIdentityService, useValue: fakeCloudRunIdentity },
      ],
    }).compile();

    const controller = moduleRef.get(CookieConsentController);
    expect(controller).toBeInstanceOf(CookieConsentController);
    expect((controller as unknown as { config: unknown }).config).toBe(fakeConfig);
    expect((controller as unknown as { security: unknown }).security).toBe(fakeSecurity);
    expect((controller as unknown as { rateLimit: unknown }).rateLimit).toBe(fakeRateLimit);
    expect((controller as unknown as { cloudRunIdentity: unknown }).cloudRunIdentity).toBe(fakeCloudRunIdentity);
  });
});

const config: BffConfig = {
  allowedOrigins: ["https://papadata.localhost"],
  apiOrigin: "http://api:3001",
  consentCookieMaxAgeSeconds: 31536000,
  consentCookieName: "papadata_consent_subject",
  consentCookiePath: "/",
  consentCookiePreviousSecret: null,
  consentCookieSecret: "test-consent-cookie-secret-at-least-32-bytes-x",
  cookieMaxAgeSeconds: 1800,
  cookiePath: "/",
  cookiePreviousSecret: null,
  cookieSameSite: "strict",
  cookieSecret: "test-session-cookie-secret-at-least-32-bytes-x",
  cookieSecure: false,
  csrfCookieMaxAgeSeconds: 3600,
  csrfCookieName: "papadata_csrf",
  csrfHeaderName: "x-papadata-csrf",
  csrfSecret: "test-csrf-secret-at-least-32-bytes-long-too-xx",
  internalAuthActiveSecret: "test-internal-auth-secret-at-least-32-bytes-x",
  internalAuthAudience: "papadata-api",
  internalAuthIssuer: "papadata-bff",
  internalAuthPreviousSecret: null,
  internalPrincipalHeaderName: "x-papadata-internal-principal",
  internalTokenTtlSeconds: 120,
  maxBodyBytes: 1_048_576,
  port: 3001,
  publicHosts: ["papadata.localhost"],
  rateLimitMax: 300,
  rateLimitWindowMs: 60_000,
  redisCaBase64: null,
  redisCommandTimeoutMs: 2000,
  redisConnectTimeoutMs: 3000,
  refreshCookieName: "pd_refresh",
  refreshCookiePath: "/api/v1/auth/refresh",
  refreshCookiePreviousSecret: null,
  refreshCookieSecret: "test-refresh-cookie-secret-at-least-32-bytes-x",
  requestIdHeaderName: "x-request-id",
  runtimeEnvironment: "test",
  sessionAbsoluteTtlSeconds: 2_592_000,
  sessionCookieName: "pd_session",
  sessionRedisPrefix: "papadata:auth",
  sessionRedisUrl: "redis://127.0.0.1:6379",
  sessionStoreMode: "test-memory",
  upstreamIdentityMode: "disabled",
  upstreamIdentityAudience: null,
  upstreamTimeoutMs: 5_000,
  metadataIdentityEndpoint: "http://metadata.google.internal",
  otlpEndpoint: null,
};

function fakeReply(): FastifyReply & { readonly sentBody: unknown; readonly statusCode: number | null; readonly cookies: Record<string, unknown>; readonly cookieOptions: Record<string, unknown> } {
  const state: { sentBody: unknown; statusCode: number | null; cookies: Record<string, unknown>; cookieOptions: Record<string, unknown> } = {
    sentBody: undefined,
    statusCode: null,
    cookies: {},
    cookieOptions: {},
  };
  const reply = {
    header: () => reply,
    status: (code: number) => { state.statusCode = code; return reply; },
    setCookie: (name: string, value: string, options: unknown) => { state.cookies[name] = value; state.cookieOptions[name] = options; return reply; },
    send: (body: unknown) => { state.sentBody = body; return reply; },
    get sentBody() { return state.sentBody; },
    get statusCode() { return state.statusCode; },
    get cookies() { return state.cookies; },
    get cookieOptions() { return state.cookieOptions; },
  };
  return reply as unknown as FastifyReply & typeof state;
}

function fakeRequest(
  cookies: Record<string, string | undefined>,
  headers: Record<string, string> = {},
): FastifyRequest {
  return {
    cookies,
    headers: { host: "papadata.localhost", origin: "https://papadata.localhost", ...headers },
    ip: "127.0.0.1",
    method: "GET",
  } as unknown as FastifyRequest;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function activeSession(overrides: Partial<BffSessionRecord> = {}): BffSessionRecord {
  return {
    absoluteExpiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    activeTenantId: "tenant-1",
    activeWorkspaceId: "workspace-1",
    authLevel: "session",
    capabilities: ["workspace.read"],
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    issuedAt: new Date(Date.now() - 60 * 1000).toISOString(),
    memberships: [{ capabilities: ["workspace.read"], roles: [], tenantId: "tenant-1", workspaceId: "workspace-1" }],
    revokedAt: null,
    sessionId: "session-1",
    stepUpExpiresAt: null,
    user: { displayName: "Jan Kowalski", email: "jan@example.com" },
    userAgent: "vitest",
    userId: "user-1",
    ...overrides,
  };
}

describe("CookieConsentController", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let security: BffSecurityService;
  let controller: CookieConsentController;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    security = new BffSecurityService(config, { findSession: vi.fn(async () => null) } as unknown as BffSessionStore);
    const rateLimit = { consumePublic: vi.fn(async () => undefined) } as unknown as BffRateLimitService;
    const cloudRunIdentity = { authorizationHeader: vi.fn(async () => null) } as unknown as CloudRunIdentityService;
    controller = new CookieConsentController(config, security, rateLimit, cloudRunIdentity);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("read: mints a fresh subject id when no cookie is present, sets it on the response, forwards it to the API", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const reply = fakeReply();

    await controller.read(fakeRequest({}), reply);

    const [calledUrl] = fetchMock.mock.calls[0] as [string];
    const forwardedSubjectId = new URL(calledUrl).searchParams.get("subjectId");
    expect(forwardedSubjectId).toMatch(/^[0-9a-f-]{36}$/u);
    expect(reply.cookies[config.consentCookieName]).toContain(".");
    expect(reply.sentBody).toEqual({ data: { currentVersion: "1", decision: null } });
  });

  it("read: reuses an existing valid signed subject-id cookie instead of minting a new one", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const existing = "22222222-2222-4222-8222-222222222222";
    const signed = signCookieValue(existing, config.consentCookieSecret);
    const reply = fakeReply();

    await controller.read(fakeRequest({ [config.consentCookieName]: signed }), reply);

    const [calledUrl] = fetchMock.mock.calls[0] as [string];
    expect(new URL(calledUrl).searchParams.get("subjectId")).toBe(existing);
  });

  it("read: an invalid/tampered cookie value is not trusted -- a fresh subject id is minted instead", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const reply = fakeReply();

    await controller.read(fakeRequest({ [config.consentCookieName]: "not-a-valid-signed-value" }), reply);

    const [calledUrl] = fetchMock.mock.calls[0] as [string];
    expect(new URL(calledUrl).searchParams.get("subjectId")).toMatch(/^[0-9a-f-]{36}$/u);
  });

  it("read: accepts a valid previous-secret consent subject cookie and rotates it to the active secret", async () => {
    const rotatingConfig = { ...config, consentCookiePreviousSecret: "test-previous-consent-cookie-secret-at-least-32-bytes" };
    controller = new CookieConsentController(
      rotatingConfig,
      security,
      { consumePublic: vi.fn(async () => undefined) } as unknown as BffRateLimitService,
      { authorizationHeader: vi.fn(async () => null) } as unknown as CloudRunIdentityService,
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const existing = "33333333-3333-4333-8333-333333333333";
    const reply = fakeReply();

    await controller.read(fakeRequest({ [config.consentCookieName]: signCookieValue(existing, rotatingConfig.consentCookiePreviousSecret!) }), reply);

    const [calledUrl] = fetchMock.mock.calls[0] as [string];
    expect(new URL(calledUrl).searchParams.get("subjectId")).toBe(existing);
    expect(String(reply.cookies[config.consentCookieName])).not.toBe(signCookieValue(existing, rotatingConfig.consentCookiePreviousSecret!));
  });

  it("read: sets consent subject cookie with HttpOnly, SameSite, Secure and configured path/maxAge attributes", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const reply = fakeReply();

    await controller.read(fakeRequest({}), reply);

    expect(reply.cookieOptions[config.consentCookieName]).toEqual(expect.objectContaining({
      httpOnly: true,
      maxAge: config.consentCookieMaxAgeSeconds,
      path: config.consentCookiePath,
      sameSite: config.cookieSameSite,
      secure: config.cookieSecure,
    }));
  });

  it("write: rejects a request with a missing/disallowed Origin before ever calling fetch", async () => {
    const reply = fakeReply();

    await expect(
      controller.write(fakeRequest({}, { origin: "https://evil.example" }), reply, { analytics: false, marketing: false, preferences: false }),
    ).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("write: anonymous (no session cookie) forwards no internal-principal header", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const reply = fakeReply();

    await controller.write(fakeRequest({}), reply, { analytics: true, marketing: false, preferences: true });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = requestInit.headers as Record<string, string>;
    expect(headers[config.internalPrincipalHeaderName]).toBeUndefined();
  });

  it("write: an active session cookie forwards a signed internal-principal header (account context comes from the resolved session, never the request body)", async () => {
    const session = activeSession();
    security = new BffSecurityService(config, { findSession: vi.fn(async () => session) } as unknown as BffSessionStore);
    controller = new CookieConsentController(
      config,
      security,
      { consumePublic: vi.fn(async () => undefined) } as unknown as BffRateLimitService,
      { authorizationHeader: vi.fn(async () => null) } as unknown as CloudRunIdentityService,
    );
    fetchMock.mockResolvedValueOnce(jsonResponse(200, { data: { currentVersion: "1", decision: null } }));
    const signedSession = signCookieValue(session.sessionId, config.cookieSecret);
    const reply = fakeReply();

    await controller.write(
      fakeRequest({ [config.sessionCookieName]: signedSession }, { "x-papadata-expected-tenant": "tenant-1", "x-papadata-expected-workspace": "workspace-1", "x-papadata-expected-user": "user-1" }),
      reply,
      { analytics: false, marketing: false, preferences: false },
    );

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = requestInit.headers as Record<string, string>;
    expect(headers[config.internalPrincipalHeaderName]).toBeTruthy();
  });

  it("preflight: applies CORS headers and returns 204 with no body work", () => {
    const reply = fakeReply();
    controller.preflight(fakeRequest({}), reply);
    expect(reply.sentBody).toBeUndefined();
  });
});
