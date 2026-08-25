from pathlib import Path

migration = Path("packages/database/migrations/0031_papa_ai_answer_contract_provider_governance.sql").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
source = Path("apps/api/src/production/contract-runtime/papa-conversation.real-source.ts").read_text(encoding="utf-8")
service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

check("assistant_ai_answer_contracts table exists", "CREATE TABLE IF NOT EXISTS app.assistant_ai_answer_contracts" in migration)
check("assistant_provider_governance_events table exists", "CREATE TABLE IF NOT EXISTS app.assistant_provider_governance_events" in migration)
check("answer contract RLS enabled", "ALTER TABLE app.assistant_ai_answer_contracts ENABLE ROW LEVEL SECURITY" in migration)
check("answer contract FORCE RLS enabled", "ALTER TABLE app.assistant_ai_answer_contracts FORCE ROW LEVEL SECURITY" in migration)
check("provider governance RLS enabled", "ALTER TABLE app.assistant_provider_governance_events ENABLE ROW LEVEL SECURITY" in migration)
check("provider governance FORCE RLS enabled", "ALTER TABLE app.assistant_provider_governance_events FORCE ROW LEVEL SECURITY" in migration)

for field in [
    "thesis",
    "evidence",
    "confidence",
    "freshness",
    "assumptions",
    "limitations",
    "risk_level",
    "human_required",
    "refusal",
    "provider_metadata",
    "provider_guardrails",
]:
    check(f"answer contract field {field}", field in migration)

for field in [
    "timeout_ms",
    "retry_count",
    "circuit_breaker_state",
    "cost",
    "redaction",
    "telemetry",
    "cancellation",
]:
    check(f"provider governance field {field}", field in migration)

for method in [
    "upsertAssistantAiAnswerContract",
    "appendAssistantProviderGovernanceEvent",
    "readAssistantAiAnswerContracts",
    "readAssistantProviderGovernanceEvents",
]:
    check(f"repository method {method} exists", f"async {method}" in db)

check("runtime persists answer contract", "persistPapaAiAnswerContractAndGovernance" in source)
check("runtime writes answer contract", "upsertAssistantAiAnswerContract" in source)
check("runtime writes provider governance", "appendAssistantProviderGovernanceEvent" in source)
check("runtime extracts thesis", "extractPapaAnswerThesis" in source)
check("runtime extracts refusal", "buildPapaAnswerRefusal" in source)
check("runtime infers risk", "inferPapaAnswerRiskLevel" in source)
check("runtime avoids fake confidence 0.5", "0.5" not in source[source.find("function persistPapaAiAnswerContractAndGovernance"):source.find("function toPapaObservationRecord")])

check("answer contract service handler exists", 'request.operationId === "papa.answer-contract.read"' in service)
check("provider governance service handler exists", 'request.operationId === "papa.provider-governance.read"' in service)
check("generic papa fallback still blocked", "cannot fall through to ProductDomainRepository" in service)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
