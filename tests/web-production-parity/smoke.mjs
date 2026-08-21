const baseUrl = new URL(process.env.EDGE_BASE_URL?.trim() || "https://papadata.localhost/");
const failures = [];
const evidence = [];

// Node's fetch has no browser-style cookie jar: Set-Cookie headers from each
// response are parsed by hand and replayed as a Cookie header on subsequent
// requests, same as a real browser session would.
const cookieJar = new Map();
let lastSetCookieHeaders = [];

async function request(name, path, options = {}, expectedStatuses = [200]) {
  const url = new URL(path, baseUrl);
  const headers = { ...options.headers };
  if (cookieJar.size > 0) {
    headers.cookie = [...cookieJar.entries()].map(([key, value]) => `${key}=${value}`).join("; ");
  }

  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      ...options,
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    lastSetCookieHeaders = typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [];
    for (const setCookie of lastSetCookieHeaders) {
      const [pair] = setCookie.split(";");
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex > 0) {
        cookieJar.set(pair.slice(0, separatorIndex).trim(), pair.slice(separatorIndex + 1).trim());
      }
    }

    const item = {
      name,
      status: response.status,
      latencyMs: Math.round(performance.now() - startedAt),
      headers: Object.fromEntries(response.headers.entries()),
      body: body.slice(0, 1_000),
    };
    evidence.push(item);
    if (!expectedStatuses.includes(response.status)) {
      failures.push(`${name}: expected ${expectedStatuses.join("/")}, got ${response.status} (${body.slice(0, 300)})`);
    }
    return { response, body };
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

// 1. web-production is reachable through the edge and serves the built SPA shell.
const root = await request("web-index", "/");
let hashedAssetPath = null;
if (root) {
  const match = root.body.match(/\/assets\/[^"'\s]+\.js/);
  hashedAssetPath = match?.[0] ?? null;
  assert(Boolean(hashedAssetPath), "web-index: could not find a hashed /assets/*.js reference in index.html");
  assert(
    root.response.headers.get("strict-transport-security") !== null,
    "web-index: edge did not set Strict-Transport-Security",
  );
  const csp = root.response.headers.get("content-security-policy") ?? "";
  assert(csp.includes("default-src 'self'"), "web-index: edge CSP is not the web-app policy");
}

// 2. Deep links fall back to index.html (client-side History API router) instead of 404ing.
await request("web-deep-link-spa-fallback", "/app/campaigns", {
  headers: { accept: "text/html" },
}, [200]);

// 3. Hashed assets are cached forever; index.html is not.
if (hashedAssetPath) {
  const asset = await request("web-hashed-asset-cache-control", hashedAssetPath);
  assert(
    asset?.response.headers.get("cache-control") === "public, max-age=31536000, immutable",
    "web-hashed-asset-cache-control: expected immutable long-lived cache-control",
  );
}

// 3a. A hashed-looking path that was never built (typo'd/rotated-out asset) is
// a real 404, not the SPA shell -- nginx's /assets/ location must win over the
// SPA fallback location for this prefix, and the 404 must not be cached as if
// it were a valid immutable asset.
const missingAsset = await request(
  "web-asset-404",
  "/assets/does-not-exist-should-404.js",
  {},
  [404],
);
if (missingAsset) {
  assert(
    missingAsset.response.headers.get("cache-control") !== "public, max-age=31536000, immutable",
    "web-asset-404: a 404 response must not carry the immutable asset cache-control",
  );
}

// 3b. A route the client router doesn't know about still resolves through the
// SPA shell at the HTTP layer (client-side NotFound handling is exercised by
// the Playwright CSP/DOM check, not this fetch-only smoke test), and must not
// be cached like the immutable asset it is not.
const bogusRoute = await request(
  "web-bogus-route-spa-shell",
  "/totally/bogus/route/that/was/never/registered",
  { headers: { accept: "text/html" } },
  [200],
);
if (bogusRoute) {
  assert(
    bogusRoute.response.headers.get("cache-control") === "no-cache",
    "web-bogus-route-spa-shell: expected the same no-cache contract as index.html",
  );
}

// 4. /api/* is proxied to the BFF, whose own CSP (defense-in-depth for its JSON
// responses) must pass through untouched -- the edge must not layer its
// web-app CSP on top of it.
const registerEmail = `lp5-lp6-smoke+${Date.now()}@example.test`;
const registerResult = await request("auth-register", "/api/v1/auth/register/email", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    origin: baseUrl.origin,
  },
  body: JSON.stringify({
    displayName: "LP-5/LP-6 Smoke Test",
    email: registerEmail,
    organizationName: "LP-5/LP-6 Smoke Org",
    password: "Sm0ke-Test-Password-2026!",
    workspaceName: "LP-5/LP-6 Smoke Workspace",
  }),
}, [200, 201]);

if (registerResult) {
  const sessionCookie = lastSetCookieHeaders.find((value) => value.startsWith("pd_session="));
  assert(Boolean(sessionCookie), "auth-register: no pd_session cookie was set");
  if (sessionCookie) {
    const attributes = sessionCookie.toLowerCase();
    assert(attributes.includes("secure"), "auth-register: session cookie is missing Secure -- only observable now that TLS terminates at the edge");
    assert(attributes.includes("httponly"), "auth-register: session cookie is missing HttpOnly");
    assert(attributes.includes("samesite"), "auth-register: session cookie is missing SameSite");
  }
  const apiCsp = registerResult.response.headers.get("content-security-policy") ?? "";
  assert(apiCsp.includes("default-src 'none'"), "auth-register: BFF's own restrictive CSP was not passed through unmodified by the edge");
}

// 5. CSRF token issuance requires an existing session (BFF requireSession()),
// so this must come after register/login, never before.
let csrfToken = null;
const csrfResult = await request("auth-csrf", "/api/csrf", {
  headers: { origin: baseUrl.origin },
});
if (csrfResult) {
  try {
    csrfToken = JSON.parse(csrfResult.body)?.data?.csrfToken ?? null;
  } catch {
    // handled by the assertion below
  }
  assert(Boolean(csrfToken), "auth-csrf: response did not contain data.csrfToken");
}

// 6. The session bootstrap the web app performs on load.
await request("auth-session", "/api/v1/auth/session", {
  headers: { origin: baseUrl.origin },
});

// 7. Logout requires the double-submit CSRF header to match the CSRF cookie
// (apps/bff/src/security.service.ts validateCsrf).
if (csrfToken) {
  await request("auth-logout", "/api/v1/auth/logout", {
    method: "POST",
    headers: {
      origin: baseUrl.origin,
      "x-papadata-csrf": csrfToken,
    },
  });

  // 8. A revoked session must not be reusable after logout.
  await request("auth-session-after-logout", "/api/v1/auth/session", {
    headers: { origin: baseUrl.origin },
  }, [401]);
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  result: failures.length === 0 ? "pass" : "fail",
  evidence,
  failures,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;
