from pathlib import Path
import json
import re
import subprocess

ROOT = Path("/home/papadata/papadata-platform")

contract_path = ROOT / "contracts/papa-lab-runtime-operations.json"
contract_md_path = ROOT / "contracts/papa-lab-runtime-operations.md"
api_schemas_path = ROOT / "contracts/api-schemas.ts"
generated_path = ROOT / "apps/api/src/production/contract-runtime/generated/data-decisions.controller.ts"
service_path = ROOT / "apps/api/src/production/contract-runtime/contract-runtime.service.ts"
bff_path = ROOT / "apps/web/src/shared/api/bffClient.ts"
generator_path = ROOT / "tools/generate-backend-contract-runtime.mjs"
report_path = ROOT / ".runtime/reports/papa-lab-506-fix-13-api-contracts-verifier.md"

checks = []

def read(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8")

def add(status, name, detail=""):
    checks.append({
        "status": status,
        "name": name,
        "detail": detail,
    })

def check(name, condition, detail=""):
    add("PASS" if condition else "FAIL", name, detail)

def warn(name, condition, detail=""):
    add("PASS" if condition else "WARN", name, detail)

def count(status):
    return sum(1 for item in checks if item["status"] == status)

def shell(command):
    try:
        return subprocess.check_output(
            command,
            cwd=ROOT,
            shell=True,
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
    except Exception:
        return ""

contract_text = read(contract_path)
contract_md = read(contract_md_path)
api_schemas = read(api_schemas_path)
generated = read(generated_path)
service = read(service_path)
bff = read(bff_path)
generator = read(generator_path)

check("contract JSON exists", contract_path.exists())
check("contract MD exists", contract_md_path.exists())
check("api schemas file exists", api_schemas_path.exists())
check("generated controller exists", generated_path.exists())
check("BFF client exists", bff_path.exists())
check("runtime generator exists", generator_path.exists())

try:
    contract = json.loads(contract_text)
except Exception as exc:
    contract = {}
    add("FAIL", "contract JSON parses", str(exc))
else:
    add("PASS", "contract JSON parses")

version = contract.get("version")
operations = contract.get("operations", [])
operation_ids = [item.get("operationId") for item in operations if isinstance(item, dict)]
operation_id_set = set(operation_ids)

required_ids = [
    "papa.context.capture",
    "papa.answer.generate",
    "papa.answer.read",
    "papa.context-panel.read",
    "papa.assistant-shell.read",
    "papa.observations.read",
    "papa.observation.save",
    "papa.history-memory.read",
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
    "papa.ai.action.execute",
    "papa.ai.action.rollback",
    "papa.ai.notifications.read",
    "papa.ai.notification.mark-read",
    "papa.ai.notification.snooze",
    "papa.ai.notification.unsnooze",
    "papa.metric-provenance.read",
    "papa.answer-contract.read",
    "papa.provider-governance.read",
    "papa.privacy-redaction.read",
]

check("contract version correct", version == "papa-lab-runtime-operations.v1", str(version))
check("contract operation ids unique", len(operation_ids) == len(operation_id_set))
check("contract has at least required operations", len(operation_id_set) >= len(required_ids), str(len(operation_id_set)))

for operation_id in required_ids:
    check(f"contract contains {operation_id}", operation_id in operation_id_set)
    check(f"api schemas contains {operation_id}", operation_id in api_schemas)
    check(f"generated controller contains {operation_id}", operation_id in generated)
    check(f"BFF contains {operation_id}", operation_id in bff)
    check(f"contract MD contains {operation_id}", operation_id in contract_md)

check("api schemas contract version exported", "PAPA_LAB_RUNTIME_OPERATION_CONTRACT_VERSION" in api_schemas)
check("api schemas operation id type exported", "PapaLabRuntimeOperationId" in api_schemas)
check("generated controller contract version exported", "GENERATED_PAPA_LAB_RUNTIME_OPERATION_CONTRACT_VERSION" in generated)
check("generated controller operation id type exported", "GeneratedPapaLabRuntimeOperationId" in generated)
check("BFF contract version exported", "BFF_PAPA_LAB_RUNTIME_OPERATION_CONTRACT_VERSION" in bff)
check("BFF operation id type exported", "BffPapaLabRuntimeOperationId" in bff)
check("generator contract anchor exists", "PAPA_LAB_RUNTIME_OPERATION_CONTRACT_ANCHOR" in generator)
check("generator references contract JSON", "contracts/papa-lab-runtime-operations.json" in generator)

service_ids = set(re.findall(r'request\.operationId\s*===\s*"([^"]+)"', service))
service_papa_ids = {item for item in service_ids if item.startswith("papa.")}

unknown_service_ids = sorted(service_papa_ids - operation_id_set)
missing_service_read_handlers = [
    item for item in required_ids
    if item.endswith(".read")
    and f'request.operationId === "{item}"' not in service
]

check("all explicit papa service handlers are in contract", not unknown_service_ids, ", ".join(unknown_service_ids))
check("all required read handlers exist in service", not missing_service_read_handlers, ", ".join(missing_service_read_handlers))

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
    "papa.ai.notifications.read",
    "papa.ai.notification.mark-read",
    "papa.ai.notification.snooze",
    "papa.ai.notification.unsnooze",
    "papa.metric-provenance.read",
    "papa.answer-contract.read",
    "papa.provider-governance.read",
    "papa.privacy-redaction.read",
]:
    check(f"service handler exists: {operation_id}", f'request.operationId === "{operation_id}"' in service)

check("generic papa fallback blocked", "cannot fall through to ProductDomainRepository" in service)
check(
    "papa fallback block appears before operation descriptor",
    service.find('request.operationId.startsWith("papa.")') != -1
    and service.find("operationDescriptor(request.operationId)") != -1
    and service.find('request.operationId.startsWith("papa.")') < service.find("operationDescriptor(request.operationId)"),
)
check("execute still blocked", 'operationId === "papa.ai.action.execute"' in service)
check("rollback still blocked", 'operationId === "papa.ai.action.rollback"' in service)

blocked_ops = [
    item for item in operations
    if isinstance(item, dict)
    and item.get("kind") == "blocked"
]
check("blocked external effects are declared", {item.get("operationId") for item in blocked_ops} == {"papa.ai.action.execute", "papa.ai.action.rollback"})

command_without_idempotency = [
    item.get("operationId")
    for item in operations
    if isinstance(item, dict)
    and item.get("kind") == "command"
    and item.get("requiresIdempotencyKey") is not True
]
check("all command operations require idempotency in contract", not command_without_idempotency, ", ".join(command_without_idempotency))

query_with_idempotency = [
    item.get("operationId")
    for item in operations
    if isinstance(item, dict)
    and item.get("kind") == "query"
    and item.get("requiresIdempotencyKey") is True
]
check("query operations do not require idempotency", not query_with_idempotency, ", ".join(query_with_idempotency))

warn("working tree intentionally not committed", "nothing to commit" in shell("git status --short --branch").lower(), "expected WARN before final commit")
warn("untracked generated migrations/verifiers still present", "?? packages/database/migrations/00" not in shell("git status --short --branch"), "expected WARN before final add/commit")

pass_count = count("PASS")
warn_count = count("WARN")
fail_count = count("FAIL")
total = len(checks)

for item in checks:
    detail = f" :: {item['detail']}" if item["detail"] else ""
    print(f"{item['status']}  {item['name']}{detail}")

print("")
print(f"Verifier result: {pass_count}/{total} PASS, {warn_count} WARN, {fail_count} FAIL")

report_path.parent.mkdir(parents=True, exist_ok=True)
lines = [
    "# Papa/Lab 506 - FIX 13 API/contracts verifier",
    "",
    "## Summary",
    "",
    f"- PASS: {pass_count}",
    f"- WARN: {warn_count}",
    f"- FAIL: {fail_count}",
    f"- TOTAL: {total}",
    "",
    "## Contract",
    "",
    f"- Version: `{version}`",
    f"- Operation count: {len(operation_ids)}",
    "",
    "## Results",
    "",
]

for item in checks:
    detail = f" — {item['detail']}" if item["detail"] else ""
    lines.append(f"- **{item['status']}** — {item['name']}{detail}")

report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

print("")
print(f"Report: {report_path}")

if fail_count:
    print("")
    print("UWAGA: sa FAIL w API/contracts verifierze. Najpierw robimy FIX 13A.")
else:
    print("")
    print("API/contracts verifier bez FAIL. Mozna przejsc do FIX 14 final audit.")
