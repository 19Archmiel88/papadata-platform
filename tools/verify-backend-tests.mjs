import {
  collectRuntimeOperations,
  pathExists,
  readJson,
  readText,
} from "./backend-gate-common.mjs";

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const runtimeOperations = await collectRuntimeOperations();
const packageJson = await readJson("package.json");
const canonicalCapabilities = await readText("packages/contracts/src/capability-catalog.ts");

assert(packageJson.scripts.test === "pnpm test:backend", "Root test must delegate to test:backend.");
assert(
  packageJson.scripts["test:backend"] === "node tools/verify-backend-tests.mjs",
  "test:backend must run this backend test verifier.",
);

for (const operation of runtimeOperations) {
  const decorators = operation.decorators;
  const classifications = [
    "@PublicEndpoint",
    "@InfrastructureEndpoint",
    "@ExternalProviderEndpoint",
    "@RequireCapabilities",
  ].filter((decorator) => decorators.includes(decorator));

  assert(
    classifications.length === 1,
    `${operation.operationId} must declare exactly one route policy classification.`,
  );
  assert(
    /^[a-z][a-z0-9_-]*(?:\.[a-z0-9][a-z0-9_-]*)+$/u.test(operation.operationId),
    `${operation.operationId} has an invalid operationId format.`,
  );

  for (const capability of decorators.matchAll(/@RequireCapabilities\("([^"]+)"\)/gu)) {
    assert(
      canonicalCapabilities.includes(`"${capability[1]}"`),
      `${operation.operationId} requires non-canonical capability ${capability[1]}.`,
    );
  }
}

const appModule = await readText("apps/api/src/production/app.module.ts");
for (const required of [
  "ProductionAuthGuard",
  "CapabilityGuard",
  "CommandExecutionInterceptor",
  "RequestContextInterceptor",
  "RequestMetricsInterceptor",
  "ApiProblemFilter",
  "...contractRuntimeControllers",
]) {
  assert(appModule.includes(required), `API production module is missing ${required}.`);
}

const routePolicyReader = await readText("apps/api/src/production/auth/route-policy-reader.ts");
for (const required of [
  "classifications.length !== 1",
  "endpoint_policy_classification_required",
  "endpoint_capability_policy_required",
  "capabilities.length === 0",
]) {
  assert(routePolicyReader.includes(required), `Route policy reader is missing ${required}.`);
}

const commandInterceptor = await readText("apps/api/src/production/commands/command-execution.interceptor.ts");
for (const required of [
  "Idempotency-Key",
  "request_hash",
  "on conflict",
  "for update",
  "status = 'succeeded'",
  "status = 'failed'",
  "audit.append",
]) {
  assert(commandInterceptor.includes(required), `Command execution interceptor is missing ${required}.`);
}

const migrationText = await allMigrations();
const normalizedMigrationText = migrationText.toLowerCase();
for (const required of [
  "CREATE TABLE IF NOT EXISTS app.schema_migrations",
  "CREATE TABLE IF NOT EXISTS app.command_executions",
  "CREATE TABLE IF NOT EXISTS app.table_security_classification",
  "FORCE ROW LEVEL SECURITY",
  "ENABLE ROW LEVEL SECURITY",
  "papadata_app",
  "papadata_platform",
]) {
  assert(normalizedMigrationText.includes(required.toLowerCase()), `Database migrations are missing ${required}.`);
}
assert(!migrationText.includes("papadata_application"), "Migrations contain obsolete papadata_application role.");
assert(pathExists("packages/database/tests/rls-isolation.sql"), "RLS isolation SQL test is missing.");
assert(
  pathExists("tests/backend-production-parity/e2e.mjs"),
  "Production-parity runtime E2E test is missing.",
);

const apiConfig = await readText("apps/api/src/production/config.ts");
const bffConfig = await readText("apps/bff/src/config.ts");
const workerConfig = await readText("apps/worker/src/production/config.ts");
for (const [label, source] of [
  ["API", apiConfig],
  ["BFF", bffConfig],
  ["Worker", workerConfig],
]) {
  assert(source.includes("REDIS_CA_BASE64"), `${label} config does not require Redis CA material.`);
  assert(source.includes("rediss:"), `${label} config does not validate rediss:// Redis URLs.`);
  assert(source.includes("placeholderPattern"), `${label} config does not reject placeholder secrets.`);
}

const platformQueue = await readText("apps/api/src/production/queue/platform-queue.service.ts");
const integrationQueue = await readText("apps/api/src/production/queue/queue.service.ts");
const workerService = await readText("apps/worker/src/production/worker.service.ts");
for (const [label, source] of [
  ["platform queue", platformQueue],
  ["integration queue", integrationQueue],
]) {
  assert(source.includes("new IORedis(config.redisUrl"), `${label} does not use configured Redis.`);
  assert(source.includes("maxRetriesPerRequest: null"), `${label} is missing BullMQ-compatible Redis options.`);
  assert(source.includes("attempts: 5"), `${label} is missing retry attempts.`);
  assert(source.includes("backoff: { type: \"exponential\""), `${label} is missing exponential backoff.`);
  assert(source.includes("jobId:"), `${label} does not use deterministic job IDs.`);
  assert(source.includes("onModuleDestroy"), `${label} does not close Redis/BullMQ resources.`);
}
assert(platformQueue.includes("toBullMqJobId"), "Platform queue does not normalize BullMQ-safe job IDs.");
assert(workerService.includes("new Worker<IntegrationJobPayload>"), "Worker does not consume BullMQ integration jobs.");
assert(workerService.includes("leaseDurationMs"), "Worker processing is missing lease duration configuration.");
assert(workerService.includes("adapter.verifyConnection()"), "Worker does not verify provider connection before ingestion.");

const storage = await readText("packages/storage/src/index.ts");
for (const required of [
  "calculateSha256",
  "deleteAllVersions",
  "ListObjectVersionsCommand",
  "DeleteObjectsCommand",
  "getSignedUrl",
  "versions: true",
]) {
  assert(storage.includes(required), `Storage adapter is missing ${required}.`);
}

const productionParityE2e = await readText("tests/backend-production-parity/e2e.mjs");
for (const required of [
  "Edge -> Web -> BFF -> API -> PostgreSQL/Redis -> Worker -> Object Storage",
  "/api/v1/auth/register/email",
  "/api/v1/security/mfa/enroll",
  "/api/v1/reports",
  "postgresRlsRuntime",
  "minioObjectRuntime",
  "redisTlsAuth",
]) {
  assert(
    productionParityE2e.includes(required),
    `Production-parity runtime E2E is missing ${required}.`,
  );
}

const registry = await readText("packages/integrations/src/provider-registry.ts");
const factory = await readText("packages/integrations/src/provider-factory.ts");
const expectedProviders = [
  "woocommerce",
  "shopify",
  "baselinker",
  "allegro",
  "google_ads",
  "meta_ads",
  "ga4",
];
for (const provider of expectedProviders) {
  assert(registry.includes(`providerId: "${provider}"`), `Provider registry is missing ${provider}.`);
  assert(factory.includes(`case "${provider}"`), `Provider factory is missing ${provider}.`);
}
assert((registry.match(/\bproviderId:\s*"/gu) ?? []).length === expectedProviders.length, "Provider registry must expose exactly seven MVP providers.");

const webhookService = await readText("apps/api/src/production/integrations/webhook.service.ts");
for (const required of [
  "WebhookReceiptRepository",
  "15 * 60 * 1_000",
  "derived:",
  "verifyProviderWebhook",
]) {
  assert(webhookService.includes(required), `Webhook runtime is missing ${required}.`);
}

const bffProxy = await readText("apps/bff/src/proxy.controller.ts");
for (const required of [
  "requireSession",
  "validateCsrf",
  "signInternalPrincipalToken",
  "authorizationHeader",
  "maxBodyBytes",
]) {
  assert(bffProxy.includes(required), `BFF proxy is missing ${required}.`);
}

if (failures.length > 0) {
  console.error("BACKEND_TESTS=FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`BACKEND_TESTS=PASS operations=${runtimeOperations.length} providers=7`);
}

async function allMigrations() {
  const { collectFiles, root } = await import("./backend-gate-common.mjs");
  const files = (await collectFiles(`${root}/packages/database/migrations`))
    .filter((file) => file.endsWith(".sql"))
    .sort();
  let output = "";
  for (const file of files) output += `${await readText(file)}\n`;
  return output;
}
