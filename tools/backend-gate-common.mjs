import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";

export const root = resolve(process.cwd());
export const evidenceDir = resolve(root, "artifacts/backend-evidence");

export async function readText(path) {
  return readFile(resolve(root, path), "utf8");
}

export async function readJson(path) {
  return JSON.parse(await readText(path));
}

export function pathExists(path) {
  return existsSync(resolve(root, path));
}

export async function sha256(path) {
  const body = await readFile(resolve(root, path));
  return createHash("sha256").update(body).digest("hex");
}

export async function ensureEvidenceDir() {
  await mkdir(evidenceDir, { recursive: true });
}

export async function writeJson(path, value) {
  await writeFile(resolve(root, path), `${JSON.stringify(value, null, 2)}\n`);
}

export function runCommand(command, args, options = {}) {
  const startedAt = new Date().toISOString();
  const result = spawnSync(command, args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();

  return {
    command: [command, ...args].join(" "),
    durationMs: null,
    exitCode: result.status ?? 1,
    output,
    startedAt,
    status: result.status === 0 ? "pass" : "fail",
  };
}

export function gitHead() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unavailable";
  }
}

export async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...await collectFiles(path));
    } else if (entry.isFile()) {
      result.push(path);
    }
  }
  return result;
}

export function normalizePath(value) {
  return value.replace(/\/+/gu, "/").replace(/\/$/u, "") || "/";
}

export async function collectRuntimeOperations() {
  const productionRoot = resolve(root, "apps/api/src/production");
  const files = await collectFiles(productionRoot);
  const operations = [];

  for (const file of files.filter((item) => item.endsWith(".controller.ts"))) {
    const source = await readFile(file, "utf8");
    const controllerPath = source.match(/@Controller\("([^"]*)"\)/u)?.[1] ?? "";
    const decoratorPattern = /@(Get|Post|Put|Patch|Delete)(?:\("([^"]*)"\)|\(\))([\s\S]*?)(?=\n\s*(?:async\s+)?[A-Za-z_$][\w$]*\s*\()/gu;

    for (const match of source.matchAll(decoratorPattern)) {
      const method = match[1].toUpperCase();
      const route = match[2] ?? "";
      const decorators = match[3];
      const operationId = decorators.match(/@OperationId\("([^"]+)"\)/u)?.[1];
      if (!operationId) continue;

      const servicePath = normalizePath(`/${controllerPath}/${route}`)
        .replace(/:([A-Za-z0-9_]+)/gu, "{$1}");
      operations.push({
        auth: readAuth(decorators),
        controllerFile: relative(root, file),
        decorators,
        implementation: implementationFor(operationId, relative(root, file)),
        method,
        operationId,
        releaseStatus: readReleaseStatus(operationId, relative(root, file)),
        servicePath,
      });
    }
  }

  return operations.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

export function collectTargetOperations(openApi) {
  const result = [];
  for (const [publicPath, pathItem] of Object.entries(openApi.paths ?? {})) {
    for (const [methodName, operation] of Object.entries(pathItem)) {
      if (!["get", "post", "put", "patch", "delete"].includes(methodName)) continue;
      if (!operation || typeof operation.operationId !== "string") continue;
      result.push({
        method: methodName.toUpperCase(),
        operationId: operation.operationId,
        servicePath: normalizePath(publicPath.replace(/^\/api/u, "")),
      });
    }
  }
  return result.sort((a, b) => a.operationId.localeCompare(b.operationId));
}

export function buildBackendManifest(runtimeOperations, targetOperations, currentManifest) {
  const runtimeByRoute = new Map(
    runtimeOperations.map((item) => [`${item.method} ${item.servicePath}`, item]),
  );
  const targetCoverage = targetOperations.map((target) => {
    const runtime = runtimeByRoute.get(`${target.method} ${target.servicePath}`) ?? null;
    return {
      ...target,
      exact: runtime?.operationId === target.operationId,
      implementation: runtime?.implementation ?? null,
      runtimeOperationId: runtime?.operationId ?? null,
    };
  });
  const targetRouteSet = new Set(
    targetOperations.map((item) => `${item.method} ${item.servicePath}`),
  );
  const exactTargetOperations = targetCoverage.filter((item) => item.exact).length;
  const extraHardeningOperations = runtimeOperations.filter(
    (item) => !targetRouteSet.has(`${item.method} ${item.servicePath}`),
  ).length;

  return {
    ...currentManifest,
    contractPosition: {
      ...currentManifest.contractPosition,
      exactTargetOperations,
      extraHardeningOperations,
      routeMethodOperationIdParity: exactTargetOperations === targetOperations.length,
      targetContract: "contracts/openapi-1.0.json",
      targetOperations: targetOperations.length,
    },
    operations: runtimeOperations.map(({ decorators, ...operation }) => ({
      ...operation,
      bffPath: `/api${operation.servicePath}`,
    })),
    semanticImplementationCounts: Object.fromEntries(
      [...new Set(runtimeOperations.map((operation) => operation.implementation))]
        .sort()
        .map((implementation) => [
          implementation,
          runtimeOperations.filter((operation) => operation.implementation === implementation).length,
        ]),
    ),
    targetCoverage,
  };
}

function readAuth(decorators) {
  if (decorators.includes("@PublicEndpoint")) return "public";
  if (decorators.includes("@InfrastructureEndpoint")) return "infrastructure";
  if (decorators.includes("@ExternalProviderEndpoint")) return "external_provider";
  if (decorators.includes('@RequireAuthLevel("step_up")')) return "step_up+capability";
  if (decorators.includes('@RequireAuthLevel("mfa")')) return "mfa+capability";
  return "capability";
}

function implementationFor(operationId, controllerFile) {
  if (!controllerFile.includes("contract-runtime/generated/")) {
    return "native-hardened-runtime";
  }
  if (["auth.login", "auth.register.email"].includes(operationId)) {
    return "native-identity-service";
  }
  if (operationId === "access.resolve" || operationId === "auth.access.resolve") {
    return "migrated-access-policy";
  }
  if (operationId.startsWith("billing.")) {
    return "migrated-billing-policy";
  }
  if (operationId.startsWith("command-center.")) {
    return "canonical-command-center-runtime";
  }
  if (operationId.startsWith("integrations.")) {
    return "native-integration-service";
  }
  if (operationId.startsWith("data-quality.")) {
    return "migrated-data-quality-policy";
  }
  if (
    operationId.startsWith("auth.password.recovery.")
    || operationId.startsWith("auth.oauth.")
    || operationId === "auth.account.link"
    || operationId === "auth.email.resend"
    || operationId.startsWith("invitation.")
  ) {
    return "explicit-limited-handler";
  }
  return "contract-compatibility-runtime";
}

function readReleaseStatus(operationId, controllerFile) {
  if (operationId.startsWith("privacy.")) return "limited";
  if (["papa.ai.action.execute", "papa.ai.action.rollback"].includes(operationId)) {
    return "blocked-until-live-approval";
  }
  return controllerFile.includes("contract-runtime/generated/")
    ? "compatibility"
    : "enabled";
}
