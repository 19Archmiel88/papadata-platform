// Real client single-flight E2E (Phase 8, Blocker 1).
//
// This process drives the actual production browser-auth-runtime code --
// BffClient and (via its default coordinator) AuthRefreshCoordinator,
// imported unmodified from apps/web -- against a live BFF over real HTTPS,
// to prove single-flight refresh holds for genuine client code rather than
// a re-implementation inside the test harness. The only thing adapted for
// Node is the transport (fetchImpl / cookie handling), which is exactly the
// injection seam BffClientOptions.fetchImpl exists for; every other line of
// this file just drives BffClient's own public API.
//
// Spawned by tests/backend-production-parity/e2e.mjs via `pnpm exec tsx`,
// which has already: registered a user, fetched a CSRF token while the
// session was still valid, and forced the session's sliding `expiresAt`
// into the past directly in Redis (see clientRuntimeParallelRefreshFlow).
// Prints one JSON line to stdout: {clientParallelRequests, clientRefreshCalls,
// clientRequestsSucceeded, sessionStillValid}.

import { readFileSync } from "node:fs";
import https from "node:https";
import type { LookupFunction } from "node:net";
import { BffClient } from "../../../apps/web/src/storybook-next/runtime/shared/api/bffClient.ts";

const host = requiredEnv("PARITY_HOST");
const origin = requiredEnv("PARITY_ORIGIN");
const caPath = requiredEnv("PARITY_CA_PATH");
const cookieHeader = requiredEnv("PARITY_COOKIE_HEADER");
const csrfToken = requiredEnv("PARITY_CSRF_TOKEN");
const ca = readFileSync(caPath);

const forceLoopback: LookupFunction = (_hostname, options, callback) => {
  if (typeof options === "function") {
    options(null, "127.0.0.1", 4);
    return;
  }
  if (options.all) {
    callback(null, [{ address: "127.0.0.1", family: 4 }]);
    return;
  }
  callback(null, "127.0.0.1", 4);
};

class NodeCookieJar {
  private readonly cookies = new Map<string, string>();

  constructor(initial: string) {
    for (const part of initial.split(";")) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      const separator = trimmed.indexOf("=");
      if (separator <= 0) continue;
      this.cookies.set(trimmed.slice(0, separator), trimmed.slice(separator + 1));
    }
  }

  header(): string {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
  }

  capture(response: Response): void {
    for (const setCookie of response.headers.getSetCookie()) {
      const pair = setCookie.split(";", 1)[0] ?? "";
      const separator = pair.indexOf("=");
      if (separator <= 0) continue;
      this.cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }
}

function nodeHttpsFetch(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const url = new URL(typeof input === "string" ? input : input.toString());
  const outgoingHeaders: Record<string, string> = { host };
  new Headers(init.headers).forEach((value, key) => {
    outgoingHeaders[key] = value;
  });

  return new Promise<Response>((resolvePromise, reject) => {
    const request = https.request({
      ca,
      headers: outgoingHeaders,
      hostname: host,
      lookup: forceLoopback,
      method: init.method ?? "GET",
      path: `${url.pathname}${url.search}`,
      port: 443,
      servername: host,
      timeout: 15_000,
    }, (response) => {
      const chunks: Buffer[] = [];
      response.on("data", (chunk: Buffer) => chunks.push(chunk));
      response.on("end", () => {
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(response.headers)) {
          if (Array.isArray(value)) {
            for (const item of value) responseHeaders.append(key, item);
          } else if (typeof value === "string") {
            responseHeaders.set(key, value);
          }
        }
        resolvePromise(new Response(Buffer.concat(chunks), {
          headers: responseHeaders,
          status: response.statusCode ?? 0,
        }));
      });
    });
    request.on("error", reject);
    request.on("timeout", () => request.destroy(new Error(`HTTPS request timed out: ${url.pathname}`)));
    if (init.body) request.write(init.body as string);
    request.end();
  });
}

const jar = new NodeCookieJar(cookieHeader);
let refreshCalls = 0;

async function trackedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const url = new URL(typeof input === "string" ? input : input.toString());
  const method = (init.method ?? "GET").toUpperCase();
  if (method === "POST" && url.pathname === "/api/v1/auth/refresh") {
    refreshCalls += 1;
  }

  const headers = new Headers(init.headers);
  const cookieHeaderValue = jar.header();
  if (cookieHeaderValue) headers.set("cookie", cookieHeaderValue);
  if (method !== "GET" && method !== "HEAD") headers.set("origin", origin);

  const response = await nodeHttpsFetch(input, { ...init, headers });
  jar.capture(response);
  return response;
}

async function main(): Promise<void> {
  // BffClient's own constructor -- no coordinator override, so it uses its
  // real default (BrowserAuthRefreshCoordinator, the same one the browser
  // uses). csrfToken is pre-seeded: the session's sliding expiresAt has
  // already been forced into the past, and GET /api/csrf itself requires an
  // active (non-expired) session on the BFF -- exactly like a real browser
  // tab that fetched its CSRF token earlier while the session was still
  // fresh and has been holding it in memory ever since.
  const client = new BffClient({
    baseUrl: origin,
    csrfToken,
    fetchImpl: trackedFetch,
  });

  const concurrency = 8;
  const outcomes = await Promise.allSettled(
    Array.from({ length: concurrency }, () => client.probeProtectedApi()),
  );
  const succeeded = outcomes.filter(
    (outcome) => outcome.status === "fulfilled" && outcome.value.ok,
  ).length;

  const followUp = await client.probeProtectedApi().catch(() => ({ ok: false as const }));

  process.stdout.write(`${JSON.stringify({
    clientParallelRequests: concurrency,
    clientRefreshCalls: refreshCalls,
    clientRequestsSucceeded: succeeded,
    sessionStillValid: followUp.ok === true,
  })}\n`);
  process.exit(0);
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
