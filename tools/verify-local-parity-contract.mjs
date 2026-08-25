import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readJson, repoRoot } from "./lib/production-parity-env.mjs";

const failures = [];
const contract = await readJson("config/local-production-parity.contract.json");
const envContract = await readJson("config/production-parity-env.contract.json");

if (contract.schemaVersion !== 1) failures.push("Unsupported local parity contract schema.");
if (!/^[0-9a-f]{40}$/u.test(contract.baseline?.commit ?? "")) failures.push("Baseline commit must be a full SHA.");
if (contract.canonicalLocalEndpoint?.hostname !== "papadata.localhost") failures.push("Canonical hostname must be papadata.localhost.");
if (contract.canonicalLocalEndpoint?.origin !== "https://papadata.localhost") failures.push("Canonical origin must be https://papadata.localhost.");

const apiRoute = contract.routing?.find((item) => item.match === "/api/*");
const webRoute = contract.routing?.find((item) => item.match === "/*");
if (apiRoute?.publicOwner !== "bff") failures.push("/api/* must be owned by BFF.");
if (webRoute?.publicOwner !== "web") failures.push("/* must be owned by web.");
if (contract.serviceExposure?.api !== "private") failures.push("API must remain private.");
if (contract.serviceExposure?.worker !== "private") failures.push("Worker must remain private.");

const compose = await readFile(resolve(repoRoot, "compose.production-parity.yml"), "utf8");
for (const binding of ["127.0.0.1:55432:5432", "127.0.0.1:56379:6379", "127.0.0.1:53001:3001", "127.0.0.1:54100:4000"]) {
  if (!compose.includes(binding)) failures.push(`Compose loopback binding missing: ${binding}`);
}
if (!compose.includes("image: redis:7.2-alpine")) failures.push("Local Redis must align with GCP REDIS_7_2.");
if (!compose.includes("condition: service_healthy")) failures.push("Compose must use health-based dependency ordering.");

const terraform = await readFile(resolve(repoRoot, "infra/terraform/main.tf"), "utf8");
for (const token of [
  'database_version    = "POSTGRES_16"',
  'redis_version           = "REDIS_7_2"',
  'ingress             = "INGRESS_TRAFFIC_INTERNAL_ONLY"',
  'ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"',
]) {
  if (!terraform.includes(token)) failures.push(`Terraform parity assertion missing: ${token}`);
}

const envOrigin = envContract.entries.find((entry) => entry.name === "BFF_ALLOWED_ORIGINS");
if (envOrigin?.source?.path !== "canonicalLocalEndpoint.origin") {
  failures.push("LP-2 env contract is not linked to the LP-0 canonical origin.");
}

console.log(JSON.stringify({
  contract: contract.program,
  baseline: contract.baseline,
  canonicalLocalEndpoint: contract.canonicalLocalEndpoint,
  result: failures.length === 0 ? "pass" : "fail",
  failures,
}, null, 2));

if (failures.length > 0) process.exitCode = 1;
