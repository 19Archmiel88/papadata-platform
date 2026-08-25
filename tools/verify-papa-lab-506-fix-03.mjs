import fs from "node:fs";

const migration = fs.readFileSync("packages/database/migrations/0025_papa_lab_case_observation_domain.sql", "utf8");
const source = fs.readFileSync("apps/api/src/production/contract-runtime/papa-conversation.real-source.ts", "utf8");
const db = fs.readFileSync("packages/database/src/production.ts", "utf8");

const checks = [];

function check(name, condition) {
  checks.push({ name, status: condition ? "PASS" : "FAIL" });
}

check("assistant_cases migration exists", migration.includes("CREATE TABLE IF NOT EXISTS app.assistant_cases"));
check("assistant_observations migration exists", migration.includes("CREATE TABLE IF NOT EXISTS app.assistant_observations"));
check("assistant_threads RLS enabled", migration.includes("ALTER TABLE app.assistant_threads ENABLE ROW LEVEL SECURITY"));
check("assistant_messages RLS enabled", migration.includes("ALTER TABLE app.assistant_messages ENABLE ROW LEVEL SECURITY"));
check("assistant_evidence RLS enabled", migration.includes("ALTER TABLE app.assistant_evidence ENABLE ROW LEVEL SECURITY"));
check("assistant_cases RLS enabled", migration.includes("ALTER TABLE app.assistant_cases ENABLE ROW LEVEL SECURITY"));
check("assistant_observations RLS enabled", migration.includes("ALTER TABLE app.assistant_observations ENABLE ROW LEVEL SECURITY"));

check("repository upsertAssistantCase exists", db.includes("async upsertAssistantCase"));
check("repository appendObservation exists", db.includes("async appendObservation"));
check("repository listObservationRecords exists", db.includes("async listObservationRecords"));

check("capture syncs assistant case", source.includes("upsertAssistantCase"));
check("saveObservation uses appendObservation", source.includes("const observation = await options.repository.appendObservation"));
check("saveObservation no longer writes role system message", !source.includes('auditReference: `papa-observation:${options.idempotencyKey}`'));
check("observations read from assistant_observations", source.includes("options.repository.listObservationRecords"));
check("observation mapper exists", source.includes("function toPapaObservationRecord"));

const failed = checks.filter((item) => item.status !== "PASS");

for (const item of checks) {
  console.log(`${item.status}  ${item.name}`);
}

console.log("");
console.log(`Verifier result: ${checks.length - failed.length}/${checks.length} PASS`);

if (failed.length > 0) {
  console.log("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.");
}
