const bffBaseUrl = requiredUrl("BFF_BASE_URL");
const apiBaseUrl = optionalUrl("API_BASE_URL");
const apiIdentityToken = process.env.API_IDENTITY_TOKEN?.trim() || null;
const infrastructureToken = process.env.API_INFRA_TOKEN?.trim() || null;
const failures = [];
const evidence = [];

async function request(name, url, options = {}, expectedStatuses = [200]) {
  const startedAt = performance.now();
  try {
    const response = await fetch(url, {
      ...options,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const body = await response.text();
    const item = {
      name,
      status: response.status,
      latencyMs: Math.round(performance.now() - startedAt),
      requestId: response.headers.get("x-request-id"),
      correlationId: response.headers.get("x-correlation-id"),
      body: body.slice(0, 2_000),
    };
    evidence.push(item);
    if (!expectedStatuses.includes(response.status)) {
      failures.push(`${name}: expected ${expectedStatuses.join("/")}, got ${response.status}`);
    }
    return { response, body };
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

await request("bff-health", new URL("/health", bffBaseUrl), {}, [200]);
await request("bff-startup", new URL("/startupz", bffBaseUrl), {}, [200]);
await request("bff-readiness", new URL("/readyz", bffBaseUrl), {}, [200]);
await request(
  "bff-protected-route-rejects-anonymous",
  new URL("/api/v1/integrations/providers", bffBaseUrl),
  { headers: { accept: "application/json" } },
  [401, 403],
);
await request(
  "bff-invalid-host-or-origin-rejected",
  new URL("/api/v1/integrations/providers", bffBaseUrl),
  { headers: { origin: "https://invalid.example.invalid" } },
  [400, 401, 403],
);

if (apiBaseUrl) {
  const cloudRunHeaders = apiIdentityToken
    ? { authorization: `Bearer ${apiIdentityToken}` }
    : {};
  await request("api-health", new URL("/health", apiBaseUrl), { headers: cloudRunHeaders }, [200]);
  await request("api-readiness", new URL("/readyz", apiBaseUrl), { headers: cloudRunHeaders }, [200]);
  await request("api-metrics-rejects-missing-app-token", new URL("/metrics", apiBaseUrl), { headers: cloudRunHeaders }, [401]);

  if (infrastructureToken) {
    await request(
      "api-metrics-authorized",
      new URL("/metrics", apiBaseUrl),
      {
        headers: {
          ...cloudRunHeaders,
          "x-papadata-infrastructure-token": infrastructureToken,
        },
      },
      [200],
    );
  } else {
    failures.push("API_BASE_URL was provided but API_INFRA_TOKEN is missing.");
  }
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  result: failures.length === 0 ? "pass" : "fail",
  evidence,
  failures,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;

function requiredUrl(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required.`);
  return new URL(value);
}

function optionalUrl(name) {
  const value = process.env[name]?.trim();
  return value ? new URL(value) : null;
}
