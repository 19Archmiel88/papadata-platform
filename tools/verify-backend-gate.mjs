import {
  ensureEvidenceDir,
  evidenceDir,
  gitHead,
  runCommand,
  writeJson,
} from "./backend-gate-common.mjs";

await ensureEvidenceDir();

const steps = [
  {
    id: "contracts-api",
    command: "pnpm",
    args: ["verify:backend-release"],
    covers: ["contracts/API", "release scope", "BFF route map"],
  },
  {
    id: "auth-rbac-postgres-redis-storage-integrations-security",
    command: "pnpm",
    args: ["test:backend"],
    covers: ["auth/RBAC", "PostgreSQL/RLS", "Redis/queues", "storage", "integrations"],
  },
  {
    id: "migrations-rls",
    command: "pnpm",
    args: ["test:migrations"],
    covers: ["migrations", "PostgreSQL/RLS"],
  },
  {
    id: "security-controls",
    command: "pnpm",
    args: ["verify:backend-security"],
    covers: ["security", "release evidence controls"],
  },
  {
    id: "security-audit",
    command: "pnpm",
    args: ["audit", "--prod", "--audit-level", "high"],
    covers: ["dependency security"],
  },
  {
    id: "license-policy",
    command: "pnpm",
    args: ["verify:licenses"],
    covers: ["dependency licenses", "supply-chain policy"],
  },
  {
    id: "typecheck",
    command: "pnpm",
    args: ["typecheck:backend"],
    covers: ["typecheck"],
  },
  {
    id: "build",
    command: "pnpm",
    args: ["build:backend"],
    covers: ["build"],
  },
  {
    id: "production-parity-runtime",
    command: "pnpm",
    args: ["verify:production-parity-runtime"],
    covers: ["Edge", "Web", "BFF", "API", "PostgreSQL/RLS", "Redis/queues", "Worker", "Object Storage"],
  },
];

const startedAt = new Date().toISOString();
const results = [];

for (const step of steps) {
  const before = process.hrtime.bigint();
  const result = runCommand(step.command, step.args);
  const after = process.hrtime.bigint();
  results.push({
    ...step,
    ...result,
    durationMs: Number((after - before) / 1_000_000n),
  });
  const output = result.output ? ` ${result.output.split("\n").at(-1)}` : "";
  console.log(`BACKEND_GATE_STEP=${result.status.toUpperCase()} id=${step.id}${output}`);
}

const failed = results.filter((result) => result.status !== "pass");
const validation = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  gitHead: gitHead(),
  startedAt,
  status: failed.length === 0 ? "pass" : "fail",
  steps: results,
};

await writeJson("artifacts/backend-evidence/validation-results.json", validation);

console.log(
  `BACKEND_GATE=${validation.status.toUpperCase()} steps=${results.length} evidence=${evidenceDir}`,
);

if (failed.length > 0) {
  process.exitCode = 1;
}
