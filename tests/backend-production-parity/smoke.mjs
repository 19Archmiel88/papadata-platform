const baseUrl = process.env.PAPADATA_BFF_BASE_URL?.replace(/\/$/u, "");

if (!baseUrl) {
  console.log("BACKEND_PRODUCTION_PARITY_SMOKE=SKIP reason=PAPADATA_BFF_BASE_URL_not_set");
  process.exit(0);
}

const checks = [
  ["/api/healthz", [200]],
  ["/api/readyz", [200, 503]],
];

const failures = [];
for (const [path, expectedStatuses] of checks) {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(5_000),
    });
    if (!expectedStatuses.includes(response.status)) {
      failures.push(`${path} returned ${response.status}`);
    }
  } catch (error) {
    failures.push(`${path} failed: ${error instanceof Error ? error.message : "unknown"}`);
  }
}

if (failures.length > 0) {
  console.error("BACKEND_PRODUCTION_PARITY_SMOKE=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`BACKEND_PRODUCTION_PARITY_SMOKE=PASS base=${baseUrl}`);
