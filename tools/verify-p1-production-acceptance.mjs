import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const release = process.argv.includes("--release");
const errors = [];
const checks = {};
function text(path) { return readFileSync(resolve(root, path), "utf8"); }
function check(name, ok, detail) { checks[name] = { ok, detail }; if (!ok) errors.push(`${name}: ${detail}`); }
function has(path, ...tokens) {
  if (!existsSync(resolve(root, path))) return false;
  const value = text(path);
  return tokens.every((token) => value.includes(token));
}

check("P1-01-web-production-parity", has("apps/web/tests/production-parity/e2e.mjs", "artifact-no-source-maps", "edge-csp", "chaos-web-recovery") && has(".github/workflows/platform-production-foundation.yml", "web-production-parity:"), "browser/CSP/artifact/restart-chaos harness must be present in CI");
check("P1-02-storybook-a11y", has("apps/web/tests/storybook-acceptance/e2e.mjs", "axe-core", "wcag2aa") && has(".github/workflows/platform-production-foundation.yml", "storybook-acceptance:"), "Storybook browser accessibility gate must be mandatory");
check("P1-03-responsive", has("apps/web/tests/storybook-acceptance/e2e.mjs", 'name: "desktop"', 'name: "tablet"', 'name: "mobile"', "reflow-320", "keyboardFocus"), "desktop/tablet/mobile/reflow/keyboard acceptance must emit evidence");
check("P1-04-durable-assistant", has("apps/api/src/production/assistant-workspace/assistant-run.service.ts", 'jobType: "assistant_generation"') && !text("apps/api/src/production/assistant-workspace/assistant-run.service.ts").includes("void this.execute(") && has("apps/worker/src/production/platform-worker.service.ts", 'case "assistant_generation"', "lease_expires_at", "WORKER_RETRY") && has("packages/database/migrations/0069_assistant_generation_worker.sql", "request_payload", "lease_expires_at"), "assistant generation must be queue/worker owned with durable lease/retry state");
check("P1-05-canonical-ai", existsSync(resolve(root, "packages/papa-runtime/src/index.ts")) && has("apps/api/src/production/contract-runtime/contract-runtime.service.ts", "createPapaProviderRuntime", "@papadata/papa-runtime") && has("apps/worker/src/production/platform-worker.service.ts", "createPapaProviderRuntime", "@papadata/papa-runtime"), "API compatibility and worker must share canonical Papa orchestration/provider selection");
check("P1-06-worker-tests", has("apps/worker/package.json", '"test": "vitest run"') && has("apps/worker/src/production/assistant-generation.policy.test.ts", "retries before the final BullMQ attempt") && has("apps/worker/src/production/platform-worker.policy.test.ts", "report format", "privacy", "reconciliation", "provider/worker failures") && has(".github/workflows/ci.yml", "Worker unit and resilience policy tests"), "worker must have direct retry/idempotency/report/privacy/reconciliation/scheduler/provider-failure test ownership in CI");
check("P1-07-terraform-ci", has(".github/workflows/platform-production-foundation.yml", "terraform-static:", "terraform -chdir=infra/terraform validate", "scan-type: config") && has(".github/workflows/staging-production-acceptance.yml", "terraform plan"), "Terraform fmt/init/validate/security and authenticated staging plan must exist");
check("P1-08-runtime-docs", has("docs/engineering/architecture-runtime.md", "test:web-production-parity", "test:storybook-acceptance", "verify:p1-code", "GCP staging"), "runbook must describe the executable current runtime and acceptance split");
check("P1-09-parity-contract", has("config/local-production-parity.contract.json", '"implementedArchitecture"', '"targetArchitecture"', '"LP-6"'), "implemented and target parity architecture must be separated");
check("P1-10-gcp-drills", existsSync(resolve(root, "tools/verify-gcp-staging-acceptance.mjs")) && existsSync(resolve(root, "tools/verify-infra-drill-evidence.mjs")) && has(".github/workflows/staging-production-acceptance.yml", "Verify GCP staging", "Verify infrastructure drill evidence"), "staging/LB/TLS and restore/failover/Cloud Armor evidence gates must exist");
check("P1-11-oauth", existsSync(resolve(root, "tools/verify-oauth-staging.mjs")) && has("infra/terraform/main.tf", "GOOGLE_OAUTH_CLIENT_ID", "MICROSOFT_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET", "MICROSOFT_OAUTH_CLIENT_SECRET"), "OAuth configuration and live staging verifier must exist");
check("P1-12-governance", existsSync(resolve(root, "config/github-governance.required.json")) && existsSync(resolve(root, "tools/verify-github-governance.mjs")), "branch governance must be machine-verifiable; repository admin applies the rule externally");

if (release) {
  const evidencePath = resolve(root, "artifacts/p1-release-evidence.json");
  if (!existsSync(evidencePath)) {
    check("release-evidence", false, `missing ${evidencePath}`);
  } else {
    const doc = JSON.parse(readFileSync(evidencePath, "utf8"));
    const required = ["webProductionParity","storybookAccessibility","responsiveAcceptance","assistantQueueResilience","canonicalAiRuntime","workerResilience","terraformPlan","runtimeRunbook","parityContract","gcpStaging","cloudSqlRestore","redisFailover","cloudArmor","loadBalancerTls","oauthGoogle","oauthMicrosoft","oauthIdentity","branchProtection","branchGovernance"];
    for (const key of required) {
      const value = doc.evidence?.[key];
      check(`evidence:${key}`, value?.status === "pass" && typeof value.reference === "string" && value.reference.trim().length > 0, "status=pass and a non-empty evidence reference are required");
    }
    const releaseSha = String(doc.releaseSha ?? "");
    check("evidence:releaseSha", /^[0-9a-f]{40}$/u.test(releaseSha), "evidence must bind to an immutable 40-char Git SHA");
  }
}

const result = { mode: release ? "release" : "code", status: errors.length ? "FAIL" : "PASS", errorCount: errors.length, errors, checks };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
