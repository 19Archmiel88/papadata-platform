import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const controls = JSON.parse(await readFile(resolve(root, "config/backend-security-controls.json"), "utf8"));
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

async function text(path) {
  return readFile(resolve(root, path), "utf8");
}

function extractHclBlock(source, header) {
  const headerIndex = source.indexOf(header);

  if (headerIndex === -1) {
    return "";
  }

  const openingBrace = source.indexOf("{", headerIndex + header.length);

  if (openingBrace === -1) {
    return "";
  }

  let depth = 0;

  for (let index = openingBrace; index < source.length; index += 1) {
    const character = source[index];

    if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return source.slice(headerIndex, index + 1);
      }
    }
  }

  return "";
}

const expectedIds = Array.from({ length: 30 }, (_, index) => `AUD-${String(index + 1).padStart(3, "0")}`);
const actualIds = controls.controls.map((control) => control.findingId);
assert(JSON.stringify(actualIds) === JSON.stringify(expectedIds), "Security control matrix must contain AUD-001 through AUD-030 exactly once and in order.");

for (const control of controls.controls) {
  assert(controls.states.includes(control.status), `${control.findingId} has an unknown status.`);
  assert(Array.isArray(control.evidencePaths) && control.evidencePaths.length > 0, `${control.findingId} has no evidence path.`);
  assert(typeof control.owner === "string" && control.owner.length > 0, `${control.findingId} has no owner.`);
  if (/(requires|external|limited|procedure)/.test(control.status)) {
    assert(Boolean(control.riskExpiry), `${control.findingId} requires an explicit risk expiry.`);
  }
  for (const path of control.evidencePaths) {
    await readFile(resolve(root, path)).catch(() => failures.push(`${control.findingId} evidence path does not exist: ${path}`));
  }
}

const migration = await text("packages/database/migrations/0016_backend_release_hardening.sql");
const normalizedMigration = migration.toLowerCase();
for (const required of [
  "force row level security",
  "command_executions",
  "privacy_identity_verifications",
  "platform_schedule_runs",
  "artifact_deletion_ledger",
]) assert(normalizedMigration.includes(required.toLowerCase()), `Hardening migration is missing ${required}.`);

const apiConfig = await text("apps/api/src/production/config.ts");
const bffConfig = await text("apps/bff/src/config.ts");
const workerConfig = await text("apps/worker/src/production/config.ts");
assert(apiConfig.includes("rediss:"), "API production config does not enforce rediss.");
assert(bffConfig.includes("REDIS_CA_BASE64"), "BFF production config has no Redis CA contract.");
assert(!workerConfig.includes("change-me-local-only"), "Worker contains a production credential fallback.");

const terraform = await text("infra/terraform/main.tf");
const terraformVariables = await text("infra/terraform/variables.tf");
const terraformVersions = await text("infra/terraform/versions.tf");
for (const required of [
  "google_compute_security_policy",
  "INGRESS_TRAFFIC_INTERNAL_ONLY",
  "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER",
  "google_cloud_run_v2_service_iam_member",
  "runtime_secret_ids",
  "PAPADATA_API_AUTH_SESSION_STORE",
  "PAPADATA_API_AUTH_SESSION_REDIS_PREFIX",
]) assert(terraform.includes(required), `Terraform is missing ${required}.`);
const workerPoolBlock = extractHclBlock(
  terraform,
  'resource "google_cloud_run_v2_worker_pool" "worker"',
);
const workerTemplateBlock = extractHclBlock(
  workerPoolBlock,
  "template",
);

assert(
  /(^|\n)\s*service_account\s*=\s*google_service_account\.worker\.email\s*(?:\n|$)/.test(
    workerTemplateBlock,
  ),
  "Terraform Worker Pool template is missing the worker service account.",
);

assert(!terraform.includes("bff_internal_auth_active_secret"), "Terraform must reuse the API signing secret for BFF principal signatures.");
assert(!terraform.includes("bff_internal_auth_previous_secret"), "Terraform must reuse the API previous signing secret for BFF principal signatures.");
assert(!terraformVariables.includes('variable "bff_internal_auth_issuer"'), "BFF issuer must not drift from API issuer.");
assert(!terraformVariables.includes('variable "bff_internal_auth_audience"'), "BFF audience must not drift from API audience.");
const runtimeSecretBlock = terraformVariables.match(/variable "runtime_secret_ids" \{([\s\S]*?)\n\}/)?.[1] ?? "";
assert(!runtimeSecretBlock.includes("sensitive"), "runtime_secret_ids contains identifiers and must remain usable in for_each.");
assert(terraformVersions.includes('version = "~> 7.21"'), "Terraform Google provider must be pinned to the validated 7.21 series.");
assert(!terraform.includes('launch_stage        = "BETA"'), "Worker pool must not force a stale launch stage.");

for (const dockerfile of [
  "infra/production/api.Dockerfile",
  "infra/production/bff.Dockerfile",
  "infra/production/worker.Dockerfile",
]) {
  const source = await text(dockerfile);
  assert(/FROM node:[^\s]+@sha256:[0-9a-f]{64}/.test(source), `${dockerfile} base image is not digest-pinned.`);
  assert(source.includes("USER papadata"), `${dockerfile} does not use the non-root runtime user.`);
}

const workflows = [
  ".github/workflows/ci.yml",
  ".github/workflows/codeql.yml",
  ".github/workflows/platform-production-foundation.yml",
  ".github/workflows/backend-image-release.yml",
];
for (const workflow of workflows) {
  const source = await text(workflow);
  for (const match of source.matchAll(/^\s*uses:\s*([^\s#]+).*$/gm)) {
    const reference = match[1];
    assert(/@[0-9a-f]{40}$/.test(reference), `${workflow} contains an unpinned action: ${reference}`);
  }
}

const parity = await text("compose.production-parity.yml");
const parityPreparation = await text("tools/prepare-production-parity.sh");
const parityPreparationImplementation = await text(
  "tools/prepare-production-parity.mjs",
);
const parityEnvironmentLibrary = await text(
  "tools/lib/production-parity-env.mjs",
);
const parityEnvironmentContract = JSON.parse(
  await text("config/production-parity-env.contract.json"),
);

assert(
  parity.includes("packages/database/scripts/migrate.sh"),
  "Production parity does not use the canonical migration runner.",
);
assert(
  parity.includes("--tls-port") && parity.includes("--requirepass"),
  "Production parity Redis must require TLS and authentication.",
);

assert(
  parityPreparation.includes("prepare-production-parity.mjs"),
  "Production parity shell entrypoint must delegate to the canonical Node preparation implementation.",
);

const redisCaContract = parityEnvironmentContract.entries.find(
  (entry) => entry.name === "REDIS_CA_BASE64",
);

assert(
  redisCaContract?.source?.kind === "fileBase64"
    && redisCaContract.source.path ===
      ".runtime/backend-production-parity/redis-tls/ca.crt",
  "Production parity environment contract does not derive REDIS_CA_BASE64 from the generated Redis CA certificate.",
);

assert(
  parityEnvironmentLibrary.includes('source.kind === "fileBase64"')
    && parityEnvironmentLibrary.includes('toString("base64")'),
  "Production parity environment generator does not implement file-backed base64 secret/config material.",
);

for (const required of [
  "generateRedisTls",
  "runOpenSsl",
  "ca.crt",
  "ca.key",
  "server.crt",
  "server.key",
  "server.csr",
]) {
  assert(
    parityPreparationImplementation.includes(required),
    `Production parity TLS preparation is missing ${required}.`,
  );
}

assert(
  parityPreparationImplementation.includes('"req", "-x509"')
    && parityPreparationImplementation.includes('"x509", "-req"'),
  "Production parity preparation does not generate a local Redis CA and signed server certificate.",
);

assert(
  parityPreparationImplementation.includes("hasValidCertificate")
    && parityPreparationImplementation.includes("-checkend"),
  "Production parity preparation does not validate existing Redis TLS certificate lifetime.",
);

assert(
  !parity.includes("papadata-local-secret")
    && !parity.includes("papadata-local}"),
  "Production parity contains local credential fallbacks.",
);

const storage = await text("packages/storage/src/index.ts");
assert(storage.includes("deleteAllVersions"), "Object storage adapter has no version-aware deletion method.");

const databaseModule = await text("apps/api/src/production/database.module.ts");
assert(databaseModule.includes("onModuleDestroy"), "Database module has no controlled pool shutdown.");

if (failures.length > 0) {
  console.error("BACKEND_SECURITY_CONTROLS=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  const unresolved = controls.controls.filter((control) => control.status !== "implemented" && control.status !== "release_scope_control" && control.status !== "excluded_storybook_context");
  console.log(`BACKEND_SECURITY_CONTROLS=PASS controls=${controls.controls.length} acceptance_pending=${unresolved.length}`);
}
