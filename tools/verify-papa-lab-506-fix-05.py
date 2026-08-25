from pathlib import Path

service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
migration = Path("packages/database/migrations/0027_papa_lab_experiments_read_model.sql").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

check("assistant_lab_experiments migration exists", "CREATE TABLE IF NOT EXISTS app.assistant_lab_experiments" in migration)
check("assistant_lab_experiments RLS enabled", "ALTER TABLE app.assistant_lab_experiments ENABLE ROW LEVEL SECURITY" in migration)
check("assistant_lab_experiments FORCE RLS enabled", "ALTER TABLE app.assistant_lab_experiments FORCE ROW LEVEL SECURITY" in migration)

for method in [
    "readAssistantContextBasket",
    "readAssistantEvidence",
    "readAssistantLab",
    "readAssistantProposals",
    "readAssistantGovernance",
    "readAssistantActions",
    "readAssistantActionApprovals",
    "validateAssistantAction",
    "approveAssistantAction",
    "rejectAssistantAction",
]:
    check(f"repository method {method} exists", f"async {method}" in db)

for operation_id in [
    "papa.context-basket.read",
    "papa.evidence.read",
    "papa.lab.read",
    "papa.proposals.read",
    "papa.governance.read",
    "papa.actions.read",
    "papa.action-approval.read",
    "papa.ai.action.validate",
    "papa.ai.action.approve",
    "papa.ai.action.reject",
]:
    check(f"dedicated handler {operation_id}", f'request.operationId === "{operation_id}"' in service)

check(
    "generic papa fallback is blocked",
    "cannot fall through to ProductDomainRepository" in service,
)

check(
    "execute remains blocked",
    'operationId === "papa.ai.action.execute"' in service,
)

check(
    "rollback remains blocked",
    'operationId === "papa.ai.action.rollback"' in service,
)

check(
    "optionalPapaPayloadObject helper exists",
    "function optionalPapaPayloadObject" in service,
)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
