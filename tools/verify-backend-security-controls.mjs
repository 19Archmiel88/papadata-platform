import {
  pathExists,
  readJson,
  readText,
} from "./backend-gate-common.mjs";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const controls = await readJson("config/backend-security-controls.json");
const packageJson = await readJson("package.json");

assert(controls.schemaVersion === 1, "Unsupported backend security controls schemaVersion.");
const expectedIds = Array.from(
  { length: 30 },
  (_, index) => `AUD-${String(index + 1).padStart(3, "0")}`,
);
const actualIds = controls.controls.map((control) => control.findingId);
assert(
  JSON.stringify(actualIds) === JSON.stringify(expectedIds),
  "Security control matrix must contain AUD-001 through AUD-030 exactly once and in order.",
);

for (const control of controls.controls) {
  assert(controls.states.includes(control.status), `${control.findingId} has an unknown status.`);
  assert(Array.isArray(control.evidencePaths) && control.evidencePaths.length > 0, `${control.findingId} has no evidence paths.`);
  assert(typeof control.owner === "string" && control.owner.length > 0, `${control.findingId} has no owner.`);
  if (/(requires|external|limited|procedure)/u.test(control.status)) {
    assert(Boolean(control.riskExpiry), `${control.findingId} requires an explicit risk expiry.`);
  }
  for (const path of control.evidencePaths) {
    assert(pathExists(path), `${control.findingId} evidence path does not exist: ${path}.`);
  }
}

for (const [script, command] of [
  ["verify:backend", "node tools/verify-backend-gate.mjs"],
  ["verify:backend-release", "node tools/verify-backend-release-scope.mjs"],
  ["verify:backend-security", "node tools/verify-backend-security-controls.mjs"],
  ["test:backend", "node tools/verify-backend-tests.mjs"],
  ["evidence:backend", "node tools/generate-backend-evidence.mjs"],
]) {
  assert(packageJson.scripts[script] === command, `Root script ${script} must be ${command}.`);
}

const nodeVersion = (await readText(".node-version")).trim();
const nvmrc = (await readText(".nvmrc")).trim();
assert(nodeVersion === "24.18.0", ".node-version must pin Node 24.18.0.");
assert(nvmrc === nodeVersion, ".nvmrc must match .node-version.");
assert(packageJson.engines.node === nodeVersion, "Root package engines.node must match .node-version.");

for (const packagePath of [
  "apps/api/package.json",
  "apps/bff/package.json",
  "apps/worker/package.json",
  "packages/ai-runtime/package.json",
  "packages/contracts/package.json",
  "packages/database/package.json",
  "packages/integrations/package.json",
  "packages/storage/package.json",
]) {
  const pkg = await readJson(packagePath);
  assert(pkg.engines?.node === nodeVersion, `${packagePath} engines.node must match .node-version.`);
}

for (const workflow of [
  ".github/workflows/ci.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/platform-production-foundation.yml",
  ".github/workflows/backend-image-release.yml",
]) {
  const source = await readText(workflow);
  for (const match of source.matchAll(/^\s*uses:\s*([^\s#]+).*$/gm)) {
    const reference = match[1];
    assert(/@[0-9a-f]{40}$/u.test(reference), `${workflow} contains an unpinned action: ${reference}.`);
  }
}

const ci = await readText(".github/workflows/ci.yml");
assert(ci.includes("node-version: 24.18.0"), "Backend CI must use canonical Node 24.18.0.");
assert(ci.includes("run: pnpm verify:backend"), "Backend CI must run the canonical backend gate.");
assert(ci.includes("run: pnpm evidence:backend"), "Backend CI must generate backend evidence.");
assert(ci.includes("if-no-files-found: error"), "Backend CI evidence upload must fail when evidence is missing.");

const hardeningMigration = await readText("packages/database/migrations/0016_backend_release_hardening.sql");
const migrations = await migrationBundle();
for (const required of [
  "command_executions",
  "privacy_identity_verifications",
  "platform_schedule_runs",
  "artifact_deletion_ledger",
]) {
  assert(hardeningMigration.includes(required), `Hardening migration is missing ${required}.`);
}
const normalizedMigrations = migrations.toLowerCase();
assert((normalizedMigrations.match(/force row level security/gu) ?? []).length >= 20, "Database migrations must force RLS on tenant tables.");
assert(normalizedMigrations.includes("table_security_classification"), "Database migrations must classify app tables.");

const apiConfig = await readText("apps/api/src/production/config.ts");
const bffConfig = await readText("apps/bff/src/config.ts");
const workerConfig = await readText("apps/worker/src/production/config.ts");
assert(apiConfig.includes("REDIS_URL must use rediss:// in production"), "API production config must enforce Redis TLS.");
assert(bffConfig.includes("REDIS_CA_BASE64 is required for production Redis TLS verification"), "BFF production config must require Redis CA.");
assert(workerConfig.includes("REDIS_URL must use rediss:// in production"), "Worker production config must enforce Redis TLS.");
assert(workerConfig.includes("SCHEDULER_DATABASE_URL must use a separate platform credential"), "Worker must require separate scheduler DB credentials in production.");

const parity = await readText("compose.production-parity.yml");
assert(parity.includes("--tls-port"), "Production parity Redis must expose TLS.");
assert(parity.includes("--requirepass"), "Production parity Redis must require authentication.");
assert(parity.includes("packages/database/scripts/migrate.sh"), "Production parity must use the canonical migration runner.");

const terraform = await readText("infra/terraform/main.tf");
for (const required of [
  "google_compute_security_policy",
  "INGRESS_TRAFFIC_INTERNAL_ONLY",
  "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER",
  "google_cloud_run_v2_service_iam_member",
  "redis_ca_base64",
  "google_storage_bucket_iam_member",
]) {
  assert(terraform.includes(required), `Terraform is missing ${required}.`);
}

const storage = await readText("packages/storage/src/index.ts");
assert(storage.includes("deleteAllVersions"), "Object storage adapter must delete all versions for erasure workflows.");
assert(storage.includes("calculateSha256"), "Object storage adapter must preserve checksum evidence.");

const databaseModule = await readText("apps/api/src/production/database.module.ts");
assert(databaseModule.includes("onModuleDestroy"), "Database module must close pools during shutdown.");

const unresolved = controls.controls.filter(
  (control) => !["implemented", "release_scope_control", "excluded_storybook_context"].includes(control.status),
);

if (failures.length > 0) {
  console.error("BACKEND_SECURITY_CONTROLS=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`BACKEND_SECURITY_CONTROLS=PASS controls=${controls.controls.length} acceptance_pending=${unresolved.length}`);
}

async function migrationBundle() {
  const { collectFiles, root } = await import("./backend-gate-common.mjs");
  const files = (await collectFiles(`${root}/packages/database/migrations`))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  let output = "";
  for (const file of files) output += `${await readText(file)}\n`;
  return output;
}
