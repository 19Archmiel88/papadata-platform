import { readFile, readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(process.cwd());
const manifest = JSON.parse(
  await readFile(resolve(root, "config/backend-release-scope.json"), "utf8"),
);
const openApi = JSON.parse(
  await readFile(resolve(root, "contracts/openapi-1.0.json"), "utf8"),
);
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

for (const [label, script, args] of [
  ["Contract runtime", "tools/generate-backend-contract-runtime.mjs", ["--check"]],
  ["Capability documentation", "tools/generate-backend-capability-docs.mjs", ["--check"]],
]) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: root,
    encoding: "utf8",
  });
  assert(
    result.status === 0,
    `${label} is stale: ${result.stderr || result.stdout}`,
  );
}

assert(manifest.schemaVersion === 3, "Unsupported release scope schemaVersion.");
assert(Array.isArray(manifest.operations), "Release scope operations are missing.");
assert(Array.isArray(manifest.targetCoverage), "Target coverage matrix is missing.");

const runtimeOperations = await collectRuntimeOperations();
const targetOperations = collectTargetOperations(openApi);
const runtimeIds = runtimeOperations.map((item) => item.operationId);
const manifestIds = manifest.operations.map((item) => item.operationId);
assert(new Set(runtimeIds).size === runtimeIds.length, "Duplicate operationId in runtime controllers.");
assert(new Set(manifestIds).size === manifestIds.length, "Duplicate operationId in release scope.");
assert(
  JSON.stringify([...runtimeIds].sort()) === JSON.stringify([...manifestIds].sort()),
  "Runtime operationId set differs from generated release scope.",
);
assert(targetOperations.length === 218, `Target contract operation count changed: ${targetOperations.length}.`);

const runtimeByRoute = new Map(
  runtimeOperations.map((item) => [`${item.method} ${item.servicePath}`, item]),
);
for (const target of targetOperations) {
  const runtime = runtimeByRoute.get(`${target.method} ${target.servicePath}`);
  assert(Boolean(runtime), `Target route is missing: ${target.method} ${target.servicePath}.`);
  assert(
    runtime?.operationId === target.operationId,
    `Target operation mismatch for ${target.method} ${target.servicePath}: expected ${target.operationId}, received ${runtime?.operationId ?? "missing"}.`,
  );
}
assert(
  manifest.contractPosition.targetOperations === 218
    && manifest.contractPosition.exactTargetOperations === 218
    && manifest.contractPosition.routeMethodOperationIdParity === true,
  "Manifest must report exact 218/218 route, method and operationId parity.",
);
assert(manifest.contractPosition.targetReleaseClaimed === false, "Repository evidence must not claim live production acceptance.");
assert(manifest.contractPosition.semanticConformanceClaimed === false, "Compatibility routes must not be described as complete semantic conformance.");

const expectedProviders = [
  "allegro",
  "baselinker",
  "ga4",
  "google_ads",
  "meta_ads",
  "shopify",
  "woocommerce",
];
assert(
  JSON.stringify([...manifest.featureBoundaries.providers.enabled].sort())
    === JSON.stringify(expectedProviders),
  "Provider runtime must be 7/7.",
);
assert(
  manifest.featureBoundaries.providers.targetOnly.length === 0,
  "No MVP provider may remain target-only.",
);

const factory = await text("packages/integrations/src/provider-factory.ts");
const registry = await text("packages/integrations/src/provider-registry.ts");
for (const provider of expectedProviders) {
  assert(factory.includes(`case "${provider}"`), `Provider ${provider} has no factory case.`);
  assert(registry.includes(`providerId: "${provider}"`), `Provider ${provider} has no registry descriptor.`);
}
for (const adapter of [
  "providers/woocommerce.ts",
  "providers/shopify.ts",
  "providers/baselinker.ts",
  "providers/allegro.ts",
  "providers/google-ads.ts",
  "providers/meta-ads.ts",
  "providers/ga4.ts",
]) {
  await readFile(resolve(root, "packages/integrations/src", adapter))
    .catch(() => failures.push(`Provider adapter file is missing: ${adapter}.`));
}

const webhook = await text("apps/api/src/production/integrations/webhook.service.ts");
for (const provider of ["woocommerce", "shopify", "meta_ads"]) {
  assert(webhook.includes(`providerId === "${provider}"`) || webhook.includes(`"${provider}"`), `Signed webhook support missing for ${provider}.`);
}
assert(webhook.includes("WebhookReceiptRepository"), "Webhook replay protection repository is missing.");
assert(webhook.includes("derived:"), "Webhook fallback event IDs must be deterministic.");
assert(webhook.includes("15 * 60 * 1_000"), "Webhook timestamp replay window is missing.");

const migration = await text("packages/database/migrations/0017_backend_product_convergence.sql");
for (const table of [
  "identity_users",
  "identity_memberships",
  "product_domain_records",
  "product_domain_events",
  "webhook_replay_receipts",
]) {
  assert(migration.includes(`app.${table}`), `Migration is missing app.${table}.`);
}
const productDomain = await text("packages/database/src/product-domain.ts");
for (const coreTable of ["app.users", "app.tenants", "app.workspaces", "app.memberships"]) {
  assert(productDomain.includes(coreTable), `Convergence registration does not reference core table ${coreTable}.`);
}
assert((migration.match(/force row level security/giu) ?? []).length >= 5, "Convergence tables do not enforce RLS.");
assert(migration.includes("papadata_app"), "Convergence migration must grant the current application role.");
assert(!migration.includes("papadata_application"), "Convergence migration contains the obsolete application role.");

const contractService = await text("apps/api/src/production/contract-runtime/contract-runtime.service.ts");
assert(contractService.includes("assertNoPersistedSecrets"), "Contract runtime does not reject secret persistence.");
assert(contractService.includes("ProductDomainRepository"), "Contract runtime bypasses the tenant-aware repository.");
assert(contractService.includes("External AI side effects remain disabled"), "External AI effects must remain fail-closed.");

const apiModule = await text("apps/api/src/production/app.module.ts");
assert(apiModule.includes("...contractRuntimeControllers"), "Generated contract controllers are not registered in API.");
assert(apiModule.includes("ContractRuntimeService"), "Contract runtime service is not registered in API.");

const bffModule = await text("apps/bff/src/app.module.ts");
for (const required of [
  "ContractAuthController",
  "ContractPublicController",
  "BffIdentitySessionService",
]) {
  assert(bffModule.includes(required), `BFF contract boundary is missing ${required}.`);
}
const contractAuth = await text("apps/bff/src/contract-auth.controller.ts");
for (const route of ["register/email", "login", "logout", "session"]) {
  assert(contractAuth.includes(`\"${route}\"`), `BFF contract auth route is missing: ${route}.`);
}

const packageJson = JSON.parse(await text("package.json"));
assert(packageJson.scripts["verify:backend-contract-runtime"], "Contract runtime drift check is not wired into package scripts.");
assert(
  packageJson.scripts["verify:backend"].includes("verify:backend-contract-runtime"),
  "Full backend verification does not include contract runtime drift.",
);

for (const operation of manifest.operations) {
  assert(["GET", "POST", "PUT", "PATCH", "DELETE"].includes(operation.method), `Invalid method for ${operation.operationId}.`);
  assert(operation.servicePath.startsWith("/"), `Invalid path for ${operation.operationId}.`);
  assert(operation.bffPath === `/api${operation.servicePath}`, `BFF path mismatch for ${operation.operationId}.`);
}

if (failures.length > 0) {
  console.error("BACKEND_RELEASE_SCOPE=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    `BACKEND_RELEASE_SCOPE=PASS operations=${manifest.operations.length} target=218 providers=7 release=${manifest.releaseName}`,
  );
}

async function text(path) {
  return readFile(resolve(root, path), "utf8");
}

async function collectRuntimeOperations() {
  const files = await collectFiles(resolve(root, "apps/api/src/production"));
  const operations = [];
  for (const file of files.filter((item) => item.endsWith(".controller.ts"))) {
    const source = await readFile(file, "utf8");
    const prefix = source.match(/@Controller\("([^"]*)"\)/u)?.[1] ?? "";
    const pattern = /@(Get|Post|Put|Patch|Delete)(?:\("([^"]*)"\)|\(\))([\s\S]*?)(?=\n\s*(?:async\s+)?[A-Za-z_$][\w$]*\s*\()/gu;
    for (const match of source.matchAll(pattern)) {
      const operationId = match[3].match(/@OperationId\("([^"]+)"\)/u)?.[1];
      if (!operationId) continue;
      operations.push({
        operationId,
        method: match[1].toUpperCase(),
        servicePath: normalizePath(`/${prefix}/${match[2] ?? ""}`)
          .replace(/:([A-Za-z0-9_]+)/gu, "{$1}"),
        file: relative(root, file),
      });
    }
  }
  return operations;
}

function collectTargetOperations(document) {
  const result = [];
  for (const [publicPath, pathItem] of Object.entries(document.paths ?? {})) {
    for (const [methodName, operation] of Object.entries(pathItem)) {
      if (!["get", "post", "put", "patch", "delete"].includes(methodName)) continue;
      if (!operation || typeof operation.operationId !== "string") continue;
      result.push({
        operationId: operation.operationId,
        method: methodName.toUpperCase(),
        servicePath: normalizePath(publicPath.replace(/^\/api/u, "")),
      });
    }
  }
  return result;
}

function normalizePath(value) {
  return value.replace(/\/+/gu, "/").replace(/\/$/u, "") || "/";
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...await collectFiles(path));
    else if (entry.isFile()) result.push(path);
  }
  return result;
}
