import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, test } from "node:test";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { createBffApplication } from "./app.factory.js";
import type { BffConfig } from "./config.js";
import { BffConfigurationError, readBffConfig } from "./config.js";
import { signCookieValue } from "./cookie-signing.js";
import { BFF_SESSION_STORE, TestMemoryBffSessionStore } from "./session-store.js";
import type { BffSessionRecord } from "./session-store.js";

const activeSecret = "0123456789abcdef0123456789abcdef";
const previousSecret = "abcdef0123456789abcdef0123456789";
const cookieSecret = "cookie-secret-0123456789abcdef0000";
const cookiePreviousSecret = "cookie-secret-abcdef01234567890000";
const csrfSecret = "csrf-secret-0123456789abcdef00000";

describe("BFF A02 security boundary", { concurrency: false }, () => {
  let app: NestFastifyApplication;
  let store: TestMemoryBffSessionStore;
  let capturedFetch: CapturedFetch;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(async () => {
    originalFetch = globalThis.fetch;
    capturedFetch = createCapturedFetch();
    globalThis.fetch = capturedFetch.fetch;
    app = await createBffApplication(testConfig());
    await app.init();
    store = app.get<TestMemoryBffSessionStore>(BFF_SESSION_STORE);
    store.saveSession(sessionRecord());
  });

  afterEach(async () => {
    globalThis.fetch = originalFetch;
    await app.close();
  });

  test("configuration fails closed for missing, short, placeholder and shared secrets", () => {
    assert.throws(
      () => readBffConfig(configEnv({ BFF_COOKIE_SECRET: undefined })),
      BffConfigurationError,
    );
    assert.throws(
      () => readBffConfig(configEnv({ BFF_COOKIE_SECRET: "replace-in-production" })),
      BffConfigurationError,
    );
    assert.throws(
      () => readBffConfig(configEnv({ BFF_COOKIE_SECRET: "too-short" })),
      BffConfigurationError,
    );
    assert.throws(
      () =>
        readBffConfig(
          configEnv({
            BFF_INTERNAL_AUTH_ACTIVE_SECRET: undefined,
          }),
        ),
      BffConfigurationError,
    );
    assert.throws(
      () =>
        readBffConfig(
          configEnv({
            BFF_COOKIE_SECRET: activeSecret,
          }),
        ),
      BffConfigurationError,
    );
    assert.throws(
      () =>
        readBffConfig(
          configEnv({
            BFF_SESSION_STORE: "test-memory",
            NODE_ENV: "production",
          }),
        ),
      BffConfigurationError,
    );
  });

  test("CSRF endpoint requires a signed active session cookie", async () => {
    const missing = await inject("GET", "/api/csrf");
    const invalid = await inject("GET", "/api/csrf", {
      cookie: `${testConfig().sessionCookieName}=bad`,
    });
    const valid = await inject("GET", "/api/csrf", sessionHeaders());

    assert.equal(missing.statusCode, 401);
    assert.equal(invalid.statusCode, 401);
    assert.equal(valid.statusCode, 200);
    assert.doesNotMatch(String(valid.headers["set-cookie"]), /HttpOnly/iu);
    assert.match(valid.body, /csrfToken/u);
  });

  test("expired and revoked sessions are blocked", async () => {
    store.saveSession(sessionRecord({
      expiresAt: new Date(Date.now() - 1_000).toISOString(),
      sessionId: "expired-session",
    }));
    store.saveSession(sessionRecord({
      revokedAt: new Date().toISOString(),
      sessionId: "revoked-session",
    }));

    assert.equal(
      (await inject("GET", "/api/csrf", sessionHeaders("expired-session")))
        .statusCode,
      401,
    );
    assert.equal(
      (await inject("GET", "/api/csrf", sessionHeaders("revoked-session")))
        .statusCode,
      401,
    );
  });

  test("state-changing requests require session-bound CSRF and allowed Origin", async () => {
    const csrf = await issueCsrf();

    const missing = await inject("POST", "/api/v1/integrations/jobs", sessionHeaders());
    const bad = await inject(
      "POST",
      "/api/v1/integrations/jobs",
      sessionHeaders("session-real", "bad.csrf"),
    );
    const wrongOrigin = await inject(
      "POST",
      "/api/v1/integrations/jobs",
      {
        ...sessionHeaders("session-real", csrf),
        origin: "https://evil.example",
      },
    );
    const spoofHost = await inject(
      "POST",
      "/api/v1/integrations/jobs",
      {
        ...sessionHeaders("session-real", csrf),
        host: "evil.example",
      },
    );
    const valid = await inject(
      "POST",
      "/api/v1/integrations/jobs",
      sessionHeaders("session-real", csrf),
    );

    assert.equal(missing.statusCode, 403);
    assert.equal(bad.statusCode, 403);
    assert.equal(wrongOrigin.statusCode, 403);
    assert.equal(spoofHost.statusCode, 403);
    assert.equal(valid.statusCode, 200);
  });

  test("GET proxy does not require CSRF", async () => {
    const response = await inject("GET", "/api/v1/integrations/connections", sessionHeaders());

    assert.equal(response.statusCode, 200);
    assert.equal(capturedFetch.calls[0]?.body, undefined);
  });

  test("proxy strips spoofed and hop-by-hop headers and generates internal principal", async () => {
    const csrf = await issueCsrf();

    await inject("POST", "/api/v1/integrations/sync", {
      ...sessionHeaders("session-real", csrf),
      authorization: "Bearer client-token",
      connection: "x-tenant-id",
      forwarded: "for=spoof",
      "x-forwarded-host": "evil.example",
      "x-papadata-internal-principal": "client-internal",
      "x-random-unknown": "nope",
      "x-session-id": "session-spoofed",
      "x-tenant-id": "tenant-spoofed",
      "x-user-id": "user-spoofed",
      "x-workspace-id": "workspace-spoofed",
    });

    const forwarded = capturedFetch.calls[0]?.headers;
    assert.ok(forwarded);
    assert.equal(forwarded.get("authorization"), null);
    assert.equal(forwarded.get("forwarded"), null);
    assert.equal(forwarded.get("x-forwarded-host"), null);
    assert.equal(forwarded.get("x-random-unknown"), null);
    assert.equal(forwarded.get("x-session-id"), null);
    assert.equal(forwarded.get("x-tenant-id"), null);
    assert.equal(forwarded.get("x-user-id"), null);
    assert.equal(forwarded.get("x-workspace-id"), null);
    assert.match(
      forwarded.get("x-papadata-internal-principal") ?? "",
      /^[^.]+\.[^.]+\.[^.]+$/u,
    );
  });

  test("unsupported content type, body limit, timeout and unavailable upstream are controlled", async () => {
    const csrf = await issueCsrf();
    const unsupported = await inject(
      "POST",
      "/api/v1/integrations/sync",
      {
        ...sessionHeaders("session-real", csrf),
        "content-type": "text/plain",
      },
      "plain",
    );

    capturedFetch.mode = "timeout";
    const timeout = await inject(
      "POST",
      "/api/v1/integrations/sync",
      sessionHeaders("session-real", csrf),
    );

    capturedFetch.mode = "throw";
    const unavailable = await inject(
      "POST",
      "/api/v1/integrations/sync",
      sessionHeaders("session-real", csrf),
    );
    const oversized = await inject(
      "POST",
      "/api/v1/integrations/sync",
      sessionHeaders("session-real", csrf),
      { payload: "x".repeat(5_000) },
    );

    assert.equal(unsupported.statusCode, 415);
    assert.equal(timeout.statusCode, 504);
    assert.equal(unavailable.statusCode, 502);
    assert.equal(oversized.statusCode, 413);
    assert.doesNotMatch(timeout.body, /stack|api-production|127\.0\.0\.1/iu);
    assert.doesNotMatch(unavailable.body, /stack|api-production|127\.0\.0\.1/iu);
  });

  async function issueCsrf(sessionId = "session-real"): Promise<string> {
    const response = await inject("GET", "/api/csrf", sessionHeaders(sessionId));
    const body = JSON.parse(response.body) as { data: { csrfToken: string } };
    return body.data.csrfToken;
  }

  async function inject(
    method: "DELETE" | "GET" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT",
    url: string,
    headers: Record<string, string> = {},
    payload: string | object | undefined = undefined,
  ): Promise<{ readonly body: string; readonly headers: Record<string, unknown>; readonly statusCode: number }> {
    const requestHeaders: Record<string, string> = {
      accept: "application/json",
      host: "app.example",
      origin: "https://app.example",
      ...headers,
    };

    if (
      payload !== undefined
      && typeof payload !== "string"
      && !hasHeader(requestHeaders, "content-type")
    ) {
      requestHeaders["content-type"] = "application/json";
    }

    const response = await app.inject({
      headers: requestHeaders,
      method,
      payload: payload === undefined
        ? undefined
        : typeof payload === "string"
          ? payload
          : JSON.stringify(payload),
      url,
    });

    return {
      body: response.body,
      headers: response.headers,
      statusCode: response.statusCode,
    };
  }
});

function hasHeader(headers: Readonly<Record<string, string>>, name: string): boolean {
  return Object.keys(headers).some(
    (headerName) => headerName.toLowerCase() === name.toLowerCase(),
  );
}

function testConfig(overrides: Partial<BffConfig> = {}): BffConfig {
  return {
    ...readBffConfig(configEnv()),
    ...overrides,
  };
}

function configEnv(
  overrides: Readonly<Record<string, string | undefined>> = {},
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    API_ORIGIN: "http://api.internal:4000",
    BFF_ALLOWED_ORIGINS: "https://app.example",
    BFF_COOKIE_PREVIOUS_SECRET: cookiePreviousSecret,
    BFF_COOKIE_SECRET: cookieSecret,
    BFF_CSRF_SECRET: csrfSecret,
    BFF_INTERNAL_AUTH_ACTIVE_SECRET: activeSecret,
    BFF_INTERNAL_AUTH_AUDIENCE: "papadata-api",
    BFF_INTERNAL_AUTH_ISSUER: "papadata-bff",
    BFF_INTERNAL_AUTH_PREVIOUS_SECRET: previousSecret,
    BFF_INTERNAL_TOKEN_TTL_SECONDS: "60",
    BFF_MAX_BODY_BYTES: "4096",
    BFF_PUBLIC_HOSTS: "app.example",
    BFF_SESSION_STORE: "test-memory",
    BFF_UPSTREAM_TIMEOUT_MS: "100",
    NODE_ENV: "test",
  };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      delete env[key];
    } else {
      env[key] = value;
    }
  }

  return env;
}

function sessionHeaders(
  sessionId = "session-real",
  csrfToken?: string,
): Record<string, string> {
  const config = testConfig();
  const cookieValues = [
    `${config.sessionCookieName}=${signCookieValue(sessionId, cookieSecret)}`,
  ];

  if (csrfToken) {
    cookieValues.push(`${config.csrfCookieName}=${csrfToken}`);
  }

  return {
    cookie: cookieValues.join("; "),
    ...(csrfToken ? { [config.csrfHeaderName]: csrfToken } : {}),
  };
}

function sessionRecord(
  overrides: Partial<BffSessionRecord> = {},
): BffSessionRecord {
  return {
    activeTenantId: "tenant-real",
    activeWorkspaceId: "workspace-real",
    authLevel: "mfa",
    capabilities: ["integrations.connection.read", "integrations.sync.run"],
    expiresAt: new Date(Date.now() + 600_000).toISOString(),
    memberships: [
      {
        capabilities: ["integrations.connection.read", "integrations.sync.run"],
        roles: ["Workspace Admin"],
        tenantId: "tenant-real",
        workspaceId: "workspace-real",
      },
    ],
    revokedAt: null,
    sessionId: "session-real",
    stepUpExpiresAt: null,
    userId: "user-real",
    ...overrides,
  };
}

type CapturedFetch = {
  readonly calls: Array<{
    readonly body: BodyInit | null | undefined;
    readonly headers: Headers;
    readonly method: string;
    readonly url: string;
  }>;
  fetch: typeof globalThis.fetch;
  mode: "ok" | "throw" | "timeout";
};

function createCapturedFetch(): CapturedFetch {
  const captured: CapturedFetch = {
    calls: [],
    fetch: (async (input: RequestInfo | URL, init?: RequestInit) => {
      captured.calls.push({
        body: init?.body,
        headers: new Headers(init?.headers),
        method: init?.method ?? "GET",
        url: String(input),
      });

      if (captured.mode === "throw") {
        throw new Error("network refused at 127.0.0.1");
      }

      if (captured.mode === "timeout") {
        await new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(new DOMException("aborted", "AbortError")),
          );
        });
      }

      return new Response(JSON.stringify({ data: { ok: true } }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    }) as typeof globalThis.fetch,
    mode: "ok",
  };

  return captured;
}
