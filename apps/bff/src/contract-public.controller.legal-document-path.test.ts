import "reflect-metadata";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContractPublicController } from "./contract-public.controller.js";
import { CloudRunIdentityService } from "./cloud-run-identity.service.js";
import { BffRateLimitService } from "./rate-limit.service.js";
import { BffSecurityService } from "./security.service.js";
import { BFF_SESSION_STORE } from "./session-store.js";
import { BFF_CONFIG } from "./tokens.js";

// BATCH F added "api/v1/legal/documents/:type" to publicContractPaths, but
// only ever checked the array *contains that string* -- it never proved
// Nest/Fastify's router actually treats ":type" as a routable dynamic
// segment rather than a literal, uninstantiable path. compile()-only
// TestingModules (see contract-public.controller.test.ts) never build an
// HTTP router at all, so a broken matcher there would have shipped
// silently. This file boots a real Fastify adapter and drives requests
// through app.inject() -- the only way to prove routing, not just DI,
// actually works (see BATCH F.1).
async function bootApp(): Promise<{
  readonly app: NestFastifyApplication;
  readonly fakeRateLimit: { consumePublic: ReturnType<typeof vi.fn> };
  readonly fakeSecurity: {
    validateHost: ReturnType<typeof vi.fn>;
    validateOrigin: ReturnType<typeof vi.fn>;
    corsHeaders: ReturnType<typeof vi.fn>;
  };
}> {
  const fakeConfig = { apiOrigin: "http://api.internal:3001", upstreamTimeoutMs: 5000 };
  const fakeSecurity = {
    corsHeaders: vi.fn(() => ({})),
    validateHost: vi.fn(),
    validateOrigin: vi.fn(),
  };
  const fakeRateLimit = { consumePublic: vi.fn(async () => undefined) };
  const fakeCloudRunIdentity = { authorizationHeader: vi.fn(async () => null) };
  const fakeSessions = { revokeAllSessionsForUser: vi.fn(async () => undefined) };

  const moduleRef = await Test.createTestingModule({
    controllers: [ContractPublicController],
    providers: [
      { provide: BFF_CONFIG, useValue: fakeConfig },
      { provide: BffSecurityService, useValue: fakeSecurity },
      { provide: BffRateLimitService, useValue: fakeRateLimit },
      { provide: CloudRunIdentityService, useValue: fakeCloudRunIdentity },
      { provide: BFF_SESSION_STORE, useValue: fakeSessions },
    ],
  }).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return { app, fakeRateLimit, fakeSecurity };
}

describe("ContractPublicController -- api/v1/legal/documents/:type routing", () => {
  let app: NestFastifyApplication | null = null;
  const originalFetch = global.fetch;

  afterEach(async () => {
    global.fetch = originalFetch;
    await app?.close();
    app = null;
  });

  it("GET /api/v1/legal/documents/cookie_policy is matched, forwarded to the API with GET, and requires no session", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ data: { document: null } }), {
      headers: { "content-type": "application/json" },
      status: 200,
    }));
    global.fetch = fetchMock as unknown as typeof fetch;

    const booted = await bootApp();
    app = booted.app;

    const response = await app.getHttpAdapter().getInstance().inject({
      method: "GET",
      url: "/api/v1/legal/documents/cookie_policy",
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ data: { document: null } });
    expect(booted.fakeRateLimit.consumePublic).toHaveBeenCalledWith(
      expect.objectContaining({ route: "public-contract" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("http://api.internal:3001/v1/legal/documents/cookie_policy");
    expect(init?.method).toBe("GET");
    // No cookie/session/BFF_SESSION_STORE lookup of any kind is on this
    // path -- ContractPublicController's forward() never calls
    // sessions.* for GET, unlike its password-reset-specific branch.
    expect(booted.fakeRateLimit.consumePublic).toHaveBeenCalledTimes(1);
  });

  it.each(["privacy_notice", "terms_of_service", "data_processing_terms"])(
    "GET /api/v1/legal/documents/%s is also matched (the segment is a real dynamic param, not a hardcoded literal)",
    async (type) => {
      const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ data: { document: null } }), {
        headers: { "content-type": "application/json" },
        status: 200,
      }));
      global.fetch = fetchMock as unknown as typeof fetch;

      const booted = await bootApp();
      app = booted.app;

      const response = await app.getHttpAdapter().getInstance().inject({
        method: "GET",
        url: `/api/v1/legal/documents/${type}`,
      });

      expect(response.statusCode).toBe(200);
      expect(fetchMock.mock.calls[0]![0]).toBe(`http://api.internal:3001/v1/legal/documents/${type}`);
    },
  );

  it("an unlisted, unrelated path is never proxied (the allowlist is not a wildcard)", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const booted = await bootApp();
    app = booted.app;

    const response = await app.getHttpAdapter().getInstance().inject({
      method: "GET",
      url: "/api/v1/some/arbitrary/unlisted/path",
    });

    expect(response.statusCode).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("a second path segment appended after the type is never proxied (the dynamic segment matches exactly one path component)", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const booted = await bootApp();
    app = booted.app;

    const response = await app.getHttpAdapter().getInstance().inject({
      method: "GET",
      url: "/api/v1/legal/documents/cookie_policy/extra",
    });

    expect(response.statusCode).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("a path-traversal attempt in the type segment does not escape to an arbitrary upstream path", async () => {
    const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) => undefined as unknown);
    global.fetch = fetchMock as unknown as typeof fetch;

    const booted = await bootApp();
    app = booted.app;

    const response = await app.getHttpAdapter().getInstance().inject({
      method: "GET",
      url: "/api/v1/legal/documents/..%2f..%2fsecret",
    });

    // Whether Fastify normalizes this to a 404 or a matched single segment
    // it passes straight through as an opaque string, the API's own
    // allow-listed type validation (see LegalDocumentsService.readActive,
    // BATCH F) is what actually rejects it -- this test's job is only to
    // confirm the BFF never turns it into a request for a *different*
    // upstream route than /v1/legal/documents/<whatever the segment was>.
    if (response.statusCode === 200 || response.statusCode === 502) {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const forwardedUrl = new URL(fetchMock.mock.calls[0]![0] as string);
      expect(forwardedUrl.pathname.startsWith("/v1/legal/documents/")).toBe(true);
      expect(forwardedUrl.origin).toBe("http://api.internal:3001");
    } else {
      expect(response.statusCode).toBe(404);
      expect(fetchMock).not.toHaveBeenCalled();
    }
  });
});
