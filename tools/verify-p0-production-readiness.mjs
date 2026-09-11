import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const mode = process.argv.includes("--release") ? "release" : "code";
const read = (p) => readFileSync(resolve(root, p), "utf8");
const errors = [];
const checks = {};
const ok = (name, condition, detail) => {
  checks[name] = { ok: Boolean(condition), detail };
  if (!condition) errors.push(`${name}: ${detail}`);
};

const readiness = JSON.parse(read("config/p0-production-readiness.json"));
const catalog = JSON.parse(read("contracts/metric-catalog-58.json"));
const metricSource = read("apps/api/src/metrics/metricEngineCore.ts");
const metricKeys = catalog.metrics.map((metric) => metric.metricKey);
const metricArrayMatch = /export const dashboardMetricCodes = \[([\s\S]*?)\] as const;/.exec(metricSource);
const engineKeys = metricArrayMatch
  ? [...metricArrayMatch[1].matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1])
  : [];
ok("metric-catalog-58", catalog.count === 58 && metricKeys.length === 58 && new Set(metricKeys).size === 58, `catalog=${metricKeys.length}`);
ok("metric-engine-key-parity", JSON.stringify([...metricKeys].sort()) === JSON.stringify([...engineKeys].sort()), `engine=${engineKeys.length}, catalog=${metricKeys.length}`);
ok("metric-missing-is-explicit", metricSource.includes("plannedUnavailableMetricCodes") && metricSource.includes("no value is inferred or coerced to zero"), "planned metrics without canonical facts must be unavailable, never zero");

const openapi = JSON.parse(read("contracts/openapi-1.0.json"));
const openapiIds = new Set();
for (const item of Object.values(openapi.paths ?? {})) {
  for (const operation of Object.values(item ?? {})) {
    if (operation && typeof operation === "object" && operation.operationId) openapiIds.add(operation.operationId);
  }
}
const csvIds = (path) => new Set(read(path).split(/\r?\n/).slice(1).filter(Boolean).map((line) => line.split(",", 1)[0]));
const apiIds = csvIds("rejestry/api-operations.csv");
const matrixIds = csvIds("macierze/operation-id-registry.csv");
const sameSet = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
ok("api-openapi-registry-parity", sameSet(openapiIds, apiIds), `openapi=${openapiIds.size}, api=${apiIds.size}`);
ok("api-operation-matrix-parity", sameSet(openapiIds, matrixIds), `openapi=${openapiIds.size}, matrix=${matrixIds.size}`);

const runtime = read("apps/api/src/production/contract-runtime/contract-runtime.service.ts");
ok("contract-runtime-fail-closed", runtime.includes("operation_not_implemented") && runtime.includes("HttpStatus.NOT_IMPLEMENTED"), "unmapped approved operations must return 501");
ok("mobile-dedicated-handler", runtime.includes('request.operationId === "mobile.invite"') && runtime.includes('request.operationId === "mobile.device.manage"') && runtime.includes('request.operationId === "mobile.use"'), "mobile operations need dedicated domain handlers");
ok("mobile-token-hashing", runtime.includes('createHash("sha256").update(rawToken)') && existsSync(resolve(root, "packages/database/migrations/0068_mobile_pairing_p0.sql")), "raw pairing token must not be persisted");

const tf = read("infra/terraform/main.tf");
const tfVars = read("infra/terraform/variables.tf");
ok("gcp-web-service", tf.includes('resource "google_cloud_run_v2_service" "web"') && tfVars.includes('variable "web_image"'), "Terraform must deploy immutable Web image");
ok("gcp-web-neg", tf.includes('resource "google_compute_region_network_endpoint_group" "web"') && tf.includes('resource "google_compute_backend_service" "web"'), "Web must be behind serverless NEG/backend");
ok("gcp-api-path-route", tf.includes('paths   = ["/api", "/api/*"]') && tf.includes('default_service = google_compute_backend_service.web.id'), "/* must route to Web and /api/* to BFF");

const providerRegistry = read("packages/integrations/src/provider-registry.ts");
const providerIds = ["woocommerce", "shopify", "baselinker", "allegro", "google_ads", "meta_ads", "ga4"];
ok("mvp-seven-provider-catalog", providerIds.every((id) => providerRegistry.includes(`"${id}"`) || providerRegistry.includes(`'${id}'`)), "MVP catalog must contain exactly the seven approved providers; live acceptance is a release-evidence control");

const reportingContract = read("packages/contracts/src/reporting-runtime.ts");
ok("report-format-contract", ["csv", "json", "pdf", "xlsx"].every((f) => reportingContract.includes(`"${f}"`)), "backend reporting contract must declare CSV/JSON/PDF/XLSX");

ok("docs-integrity-gate", read("package.json").includes("verify:docs-integrity"), "documentation registry integrity must remain executable");

if (mode === "release") {
  const evidencePath = resolve(root, process.env.PAPADATA_P0_EVIDENCE_FILE || "artifacts/p0-release-evidence.json");
  if (!existsSync(evidencePath)) {
    errors.push(`release-evidence: missing ${evidencePath}`);
    checks["release-evidence"] = { ok: false, detail: "evidence file missing" };
  } else {
    const evidence = JSON.parse(readFileSync(evidencePath, "utf8"));
    const records = new Map((evidence.evidence ?? []).map((entry) => [entry.id, entry]));
    const missing = [];
    for (const id of readiness.releaseEvidence) {
      const entry = records.get(id);
      if (!entry || entry.accepted !== true || typeof entry.reference !== "string" || entry.reference.trim().length < 3) missing.push(id);
    }
    ok("release-evidence", missing.length === 0, missing.length ? `missing/not accepted: ${missing.join(", ")}` : `${readiness.releaseEvidence.length} controls accepted`);
  }
}

const result = { mode, status: errors.length ? "FAIL" : "PASS", errorCount: errors.length, errors, checks };
console.log(JSON.stringify(result, null, 2));
process.exitCode = errors.length ? 1 : 0;
