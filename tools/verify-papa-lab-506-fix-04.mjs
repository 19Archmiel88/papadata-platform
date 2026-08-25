import fs from "node:fs";

const migration = fs.readFileSync("packages/database/migrations/0026_papa_lab_recommendation_decision_action_outcome.sql", "utf8");
const db = fs.readFileSync("packages/database/src/production.ts", "utf8");
const source = fs.readFileSync("apps/api/src/production/contract-runtime/papa-conversation.real-source.ts", "utf8");
const runtime = fs.readFileSync("apps/web/src/screens/papa/papaRuntimeData.ts", "utf8");

const checks = [];

function check(name, condition) {
  checks.push({ name, status: condition ? "PASS" : "FAIL" });
}

for (const table of [
  "assistant_recommendations",
  "assistant_decisions",
  "assistant_action_proposals",
  "assistant_action_approvals",
  "assistant_outcomes",
]) {
  check(`${table} migration exists`, migration.includes(`CREATE TABLE IF NOT EXISTS app.${table}`));
  check(`${table} RLS enabled`, migration.includes(`ALTER TABLE app.${table} ENABLE ROW LEVEL SECURITY`) || migration.includes(`'${table}'`));
}

for (const method of [
  "upsertAssistantRecommendation",
  "upsertAssistantDecision",
  "upsertAssistantActionProposal",
  "upsertAssistantOutcome",
]) {
  check(`${method} repository method exists`, db.includes(`async ${method}`));
}

check("capture sync helper exists", source.includes("syncDurableRecommendationDecisionActionOutcomeFromSnapshot"));
check("capture calls recommendation sync", source.includes("await syncDurableRecommendationDecisionActionOutcomeFromSnapshot"));
check("recommendation write is called", source.includes("upsertAssistantRecommendation"));
check("decision write is called", source.includes("upsertAssistantDecision"));
check("action proposal write is called", source.includes("upsertAssistantActionProposal"));
check("outcome write is called", source.includes("upsertAssistantOutcome"));

check("fake confidence 0.5 fallback removed", !runtime.includes("?? 0.5"));
check("fake effort medium literal removed from recommendation builder", !runtime.includes("effort: 'medium'"));
check("fake owner fallback removed", !runtime.includes("Użytkownik workspace"));
check("runtime confidence helper exists", runtime.includes("resolveRuntimeElementConfidence"));
check("runtime recommendation owner helper exists", runtime.includes("resolveRecommendationOwner"));

const failed = checks.filter((item) => item.status !== "PASS");

for (const item of checks) {
  console.log(`${item.status}  ${item.name}`);
}

console.log("");
console.log(`Verifier result: ${checks.length - failed.length}/${checks.length} PASS`);

if (failed.length > 0) {
  console.log("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.");
}
