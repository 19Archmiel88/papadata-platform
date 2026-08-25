from pathlib import Path
import re
import subprocess

ROOT = Path("/home/papadata/papadata-platform")

source_path = ROOT / "apps/api/src/production/contract-runtime/papa-conversation.real-source.ts"
runtime_path = ROOT / "apps/web/src/screens/papa/papaRuntimeData.ts"
service_path = ROOT / "apps/api/src/production/contract-runtime/contract-runtime.service.ts"
report_path = ROOT / ".runtime/reports/papa-lab-506-fix-12-cleanup-verifier.md"

source = source_path.read_text(encoding="utf-8")
runtime = runtime_path.read_text(encoding="utf-8")
service = service_path.read_text(encoding="utf-8")

checks = []

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

check("Papa confidence threshold constant exists", "PAPA_CONFIDENCE_ATTENTION_THRESHOLD = 1 / 2" in source)
check("Papa system role constant exists", 'PAPA_SYSTEM_MESSAGE_ROLE = "system" as const' in source)
check("Papa confidence attention helper exists", "function hasPapaConfidenceAtLeastAttention" in source)
check("Papa confidence low helper exists", "function isPapaConfidenceBelowAttention" in source)

check("runtime ready threshold constant exists", "PAPA_RUNTIME_CONFIDENCE_READY_THRESHOLD = 17 / 20" in runtime)
check("runtime attention threshold constant exists", "PAPA_RUNTIME_CONFIDENCE_ATTENTION_THRESHOLD = 1 / 2" in runtime)
check("runtime attention helper exists", "function isRuntimeConfidenceAtLeastAttention" in runtime)
check("runtime state resolver exists", "function resolveRuntimeConfidenceState" in runtime)

check("legacy 0.5 literal absent from papa source", "0.5" not in source, f"count={source.count('0.5')}")
check("legacy 0.5 literal absent from runtime data", "0.5" not in runtime, f"count={runtime.count('0.5')}")
check("hardcoded role system literal absent from papa source", 'role: "system"' not in source, f"count={source.count('role: \"system\"')}")
check("system role now named", "role: PAPA_SYSTEM_MESSAGE_ROLE" in source)

start = source.find("export async function generatePapaAnswer")
end = source.find("export async function saveObservation", start)
generate_section = source[start:end] if start != -1 and end != -1 else ""

check("generatePapaAnswer section found", bool(generate_section))
check("raw options.prompt still absent", "options.prompt" not in generate_section)
check("raw options.question still absent", "options.question" not in generate_section)
check("raw options.message still absent", "options.message" not in generate_section)
check("provider redacted input still used", "providerPrivacy.redactedInput" in generate_section)
check("DLP still before answer contract", generate_section.find("const providerPrivacy") != -1 and generate_section.find("persistPapaAiAnswerContractAndGovernance") != -1 and generate_section.find("const providerPrivacy") < generate_section.find("persistPapaAiAnswerContractAndGovernance"))

check("static metric_snapshot source write still absent", 'sourceType: "metric_snapshot",' not in source)
check("generic papa fallback still blocked", "cannot fall through to ProductDomainRepository" in service)
check("execute remains blocked", 'operationId === "papa.ai.action.execute"' in service)
check("rollback remains blocked", 'operationId === "papa.ai.action.rollback"' in service)

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
    "# Papa/Lab 506 - FIX 12 Cleanup Verifier",
    "",
    "## Summary",
    "",
    f"- PASS: {pass_count}",
    f"- WARN: {warn_count}",
    f"- FAIL: {fail_count}",
    f"- TOTAL: {total}",
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
    print("UWAGA: sa FAIL w cleanup verifierze. Najpierw robimy FIX 12A.")
else:
    print("")
    print("Cleanup verifier bez FAIL. Mozna przejsc do FIX 13.")
