import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseEnv,
  readJson,
  renderExample,
  repoRoot,
} from "./lib/production-parity-env.mjs";

const failures = [];
const contract = await readJson("config/production-parity-env.contract.json");
const localContract = await readJson(contract.localContract);
const names = contract.entries.map((entry) => entry.name);
const unique = new Set(names);

if (unique.size !== names.length) failures.push("Duplicate variable names in env contract.");

const examplePath = resolve(repoRoot, contract.generatedExampleFile);
const example = await readFile(examplePath, "utf8");
if (example !== renderExample(contract)) {
  failures.push(`${contract.generatedExampleFile} is not generated from the env contract.`);
}

const compose = await readFile(resolve(repoRoot, "compose.production-parity.yml"), "utf8");
const composeReferences = [...compose.matchAll(/\$\{([A-Z0-9_]+)(?::[^}]*)?\}/gu)]
  .map((match) => match[1]);
for (const name of composeReferences) {
  if (!unique.has(name)) failures.push(`Compose references ${name}, but it is absent from the env contract.`);
}

const terraform = await readFile(resolve(repoRoot, "infra/terraform/main.tf"), "utf8");
for (const entry of contract.entries) {
  if (!entry.terraform) continue;
  if (!terraform.includes(`"${entry.terraform.envName}"`) && !terraform.includes(entry.terraform.envName)) {
    failures.push(`Terraform does not expose env ${entry.terraform.envName}.`);
  }
  if (!terraform.includes(`"${entry.terraform.secretKey}"`)) {
    failures.push(`Terraform secret key ${entry.terraform.secretKey} is not present.`);
  }
}

const sourceByName = new Map(contract.entries.map((entry) => [entry.name, entry.source]));
const active = sourceByName.get("BFF_INTERNAL_AUTH_ACTIVE_SECRET");
const previous = sourceByName.get("BFF_INTERNAL_AUTH_PREVIOUS_SECRET");
if (active?.kind !== "reference" || active.from !== "PAPADATA_API_AUTH_ACTIVE_SECRET") {
  failures.push("BFF active internal auth secret must reference the API active auth secret.");
}
if (previous?.kind !== "reference" || previous.from !== "PAPADATA_API_AUTH_PREVIOUS_SECRET") {
  failures.push("BFF previous internal auth secret must reference the API previous auth secret.");
}

const allowedOrigins = contract.entries.find((entry) => entry.name === "BFF_ALLOWED_ORIGINS");
if (allowedOrigins?.source?.kind !== "contract" || allowedOrigins.source.path !== "canonicalLocalEndpoint.origin") {
  failures.push("BFF_ALLOWED_ORIGINS must be sourced from the LP-0 canonical origin.");
}

const webClient = await readFrontendBffClient();
if (!webClient.includes(contract.frontend.baseUrlVariable)) {
  failures.push(`Frontend does not reference ${contract.frontend.baseUrlVariable}.`);
}
if (!webClient.includes("import.meta.env.DEV")) {
  failures.push("Frontend local auth fallback must be gated by import.meta.env.DEV.");
}

const envPath = resolve(repoRoot, contract.generatedEnvFile);
if (existsSync(envPath)) {
  const actual = parseEnv(await readFile(envPath, "utf8"));
  for (const name of names) {
    if (!actual.has(name)) failures.push(`${contract.generatedEnvFile} is missing ${name}.`);
  }
  if (actual.get("NODE_ENV") !== "production") {
    failures.push("Generated NODE_ENV must be production for API and Worker parity containers.");
  }
  if (actual.get("REDIS_URL") && !actual.get("REDIS_URL").startsWith("rediss://")) {
    failures.push("Generated REDIS_URL must use rediss://.");
  }
  if (actual.get("BFF_SESSION_STORE") === "test-memory") {
    failures.push("Generated BFF_SESSION_STORE must not use test-memory.");
  }
  if (actual.get("BFF_ALLOWED_ORIGINS") !== localContract.canonicalLocalEndpoint.origin) {
    failures.push("Generated BFF_ALLOWED_ORIGINS does not match the LP-0 canonical origin.");
  }
  const expectedHosts = `${localContract.canonicalLocalEndpoint.hostname},${localContract.canonicalLocalEndpoint.hostname}:53001`;
  if (actual.get("BFF_PUBLIC_HOSTS") !== expectedHosts) {
    failures.push("Generated BFF_PUBLIC_HOSTS does not match the LP-0 host contract.");
  }
  if (actual.get("BFF_INTERNAL_AUTH_ACTIVE_SECRET") !== actual.get("PAPADATA_API_AUTH_ACTIVE_SECRET")) {
    failures.push("Generated active API/BFF internal auth secrets differ.");
  }
  if (actual.get("BFF_INTERNAL_AUTH_PREVIOUS_SECRET") !== actual.get("PAPADATA_API_AUTH_PREVIOUS_SECRET")) {
    failures.push("Generated previous API/BFF internal auth secrets differ.");
  }
}

console.log(JSON.stringify({
  contract: contract.contractId,
  checkedVariables: names.length,
  generatedEnvPresent: existsSync(envPath),
  result: failures.length === 0 ? "pass" : "fail",
  failures,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;

async function readFrontendBffClient() {
  const candidates = [
    "apps/web/src/storybook-next/runtime/shared/api/bffClient.ts",
    "apps/web/src/shared/api/bffClient.ts",
  ];
  for (const candidate of candidates) {
    const path = resolve(repoRoot, candidate);
    if (existsSync(path)) return readFile(path, "utf8");
  }
  failures.push(`Frontend BFF client not found. Checked: ${candidates.join(", ")}`);
  return "";
}
