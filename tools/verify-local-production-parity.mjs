// P0-2.1: the ONE canonical gate for "is local production-parity a
// complete, reproducible, certified stand-in for production." Chains every
// existing gate that together cover the full checklist (runtime config,
// typechecks, unit/contract tests, repository integrity, Compose
// validation, and the two live-stack e2e suites -- backend's
// tests/backend-production-parity/e2e.mjs covers clean boot, migrations,
// provisioning, health/readiness, edge routing, BFF/API identity, DB
// TLS/RLS, Redis, queue/worker multi-instance safety, storage and
// auth/session; web's apps/web/tests/production-parity/e2e.mjs covers
// HTTPS/HSTS/CSP, artifact hygiene, and web/edge restart+chaos recovery)
// rather than re-implementing any of them. A PASS here is what "this local
// stack is a ready template for GCP" is actually based on.
import {
  ensureEvidenceDir,
  gitHead,
  gitWorkingTreeClean,
  readJson,
  root,
  runCommand,
  writeJson,
} from "./backend-gate-common.mjs";
import { buildProductionParitySteps } from "./lib/production-parity-steps.mjs";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const steps = buildProductionParitySteps();

const startedAt = new Date().toISOString();
const results = [];

for (const step of steps) {
  const before = process.hrtime.bigint();
  const result = runCommand(step.command, step.args, {
    timeout: step.timeout ?? 20 * 60 * 1000,
    ...(step.env ? { env: { ...process.env, ...step.env } } : {}),
  });
  const after = process.hrtime.bigint();
  results.push({ ...step, ...result, durationMs: Number((after - before) / 1_000_000n) });
  const lastLine = result.output.split("\n").filter(Boolean).at(-1) ?? "";
  console.log(`LOCAL_PRODUCTION_PARITY_STEP=${result.status.toUpperCase()} id=${step.id} ${lastLine}`);
  if (result.status !== "pass") break;
}

const overall = results.length === steps.length && results.every((step) => step.status === "pass")
  ? "pass"
  : "fail";

await ensureEvidenceDir();
const evidence = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  startedAt,
  gitHead: gitHead(),
  gitWorkingTreeClean: gitWorkingTreeClean(),
  environment: "production-parity",
  overall,
  steps: results.map(({ output, ...step }) => ({ ...step, outputTail: tail(output) })),
  referencedEvidence: await collectReferencedEvidence(),
};

await writeJson("artifacts/local-production-parity-evidence.json", evidence);

console.log(
  `LOCAL_PRODUCTION_PARITY=${overall.toUpperCase()} steps=${results.length}/${steps.length} evidence=artifacts/local-production-parity-evidence.json`,
);

if (overall !== "pass") process.exitCode = 1;

function tail(text, lines = 40) {
  const parts = text.split("\n");
  return parts.length <= lines ? text : parts.slice(-lines).join("\n");
}

async function collectReferencedEvidence() {
  const candidates = [
    "artifacts/backend-evidence/production-parity-e2e.json",
    "artifacts/web-production-parity/evidence.json",
  ];
  const referenced = {};
  for (const candidate of candidates) {
    if (!existsSync(resolve(root, candidate))) continue;
    try {
      const parsed = await readJson(candidate);
      referenced[candidate] = {
        status: parsed.status ?? (Array.isArray(parsed.failures) && parsed.failures.length === 0 ? "pass" : "fail"),
        generatedAt: parsed.generatedAt ?? parsed.startedAt ?? null,
      };
    } catch {
      referenced[candidate] = { status: "unreadable" };
    }
  }
  return referenced;
}
