from pathlib import Path

db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

for helper in [
    "function extractAssistantContextItems",
    "function summarizeAssistantRowsByKey",
    "function numberFromAssistantRow",
]:
    check(f"{helper} exists", helper in db)

for usage in [
    "extractAssistantContextItems(latestSnapshot)",
    "summarizeAssistantRowsByKey(result.rows, \"sourceType\")",
    "summarizeAssistantRowsByKey(result.rows, \"status\")",
    "numberFromAssistantRow(row.openCases)",
]:
    check(f"usage present: {usage}", usage in db)

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

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
