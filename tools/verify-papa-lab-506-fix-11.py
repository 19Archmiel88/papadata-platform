from pathlib import Path
import datetime
import re
import subprocess

ROOT = Path("/home/papadata/papadata-platform")
REPORT_PATH = ROOT / ".runtime/reports/papa-lab-506-fix-11-meta-verifier.md"

checks = []

def read_rel(path: str) -> str:
    target = ROOT / path
    if not target.exists():
        return ""
    return target.read_text(encoding="utf-8")

def exists_rel(path: str) -> bool:
    return (ROOT / path).exists()

def add(status: str, name: str, detail: str = "") -> None:
    checks.append({
        "status": status,
        "name": name,
        "detail": detail,
    })

def check(name: str, condition: bool, detail: str = "") -> None:
    add("PASS" if condition else "FAIL", name, detail)

def warn(name: str, condition: bool, detail: str = "") -> None:
    add("PASS" if condition else "WARN", name, detail)

def count_status(status: str) -> int:
    return sum(1 for item in checks if item["status"] == status)

def shell(command: str) -> str:
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

files = {
    "service": "apps/api/src/production/contract-runtime/contract-runtime.service.ts",
    "papa_source": "apps/api/src/production/contract-runtime/papa-conversation.real-source.ts",
    "db": "packages/database/src/production.ts",
    "db_index": "packages/database/src/index.ts",
    "bff": "apps/web/src/shared/api/bffClient.ts",
    "runtime": "apps/web/src/shell/papa-assistant/PapaAssistantRuntimeContext.tsx",
    "panels": "apps/web/src/screens/papa/PapaAssistantPanels.tsx",
}

migrations = {
    "0023": "packages/database/migrations/0023_papa_conversation_continuity.sql",
    "0024": "packages/database/migrations/0024_papa_conversation_integrity.sql",
    "0025": "packages/database/migrations/0025_papa_lab_case_observation_domain.sql",
    "0026": "packages/database/migrations/0026_papa_lab_recommendation_decision_action_outcome.sql",
    "0027": "packages/database/migrations/0027_papa_lab_experiments_read_model.sql",
    "0028": "packages/database/migrations/0028_papa_report_builder_exports.sql",
    "0029": "packages/database/migrations/0029_papa_ai_notifications.sql",
    "0030": "packages/database/migrations/0030_papa_metric_engine_provenance.sql",
    "0031": "packages/database/migrations/0031_papa_ai_answer_contract_provider_governance.sql",
    "0032": "packages/database/migrations/0032_papa_privacy_redaction_proof.sql",
}

for label, path in files.items():
    check(f"required source file exists: {label}", exists_rel(path), path)

for label, path in migrations.items():
    check(f"required migration exists: {label}", exists_rel(path), path)

service = read_rel(files["service"])
source = read_rel(files["papa_source"])
db = read_rel(files["db"])
bff = read_rel(files["bff"])
runtime = read_rel(files["runtime"])
panels = read_rel(files["panels"])

migration_texts = {key: read_rel(path) for key, path in migrations.items()}
all_migrations = "\n".join(migration_texts.values())

check("no malformed ROW LEVELSECURITY token", "ROW LEVELSECURITY" not in all_migrations)
check(
    "no malformed assistant table RLS adjacency",
    re.search(
        r"app\.assistant_[A-Za-z0-9_]+(?:ENABLE|FORCE)\s+ROW\s+LEVEL\s+SECURITY",
        all_migrations,
    ) is None,
)

check(
    "no old malformed evidence provenance ENABLE token",
    "assistant_evidence_provenanceENABLE" not in all_migrations,
)

check(
    "no old malformed evidence provenance FORCE token",
    "assistant_evidence_provenanceFORCE" not in all_migrations,
)

def has_enable_rls(table: str, text: str) -> bool:
    explicit = re.search(
        rf"ALTER\s+TABLE\s+app\.{re.escape(table)}\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY",
        text,
        re.IGNORECASE,
    ) is not None

    dynamic = (
        table in text
        and "ENABLE ROW LEVEL SECURITY" in text
        and "EXECUTE format" in text
    )

    return explicit or dynamic

def has_force_rls(table: str, text: str) -> bool:
    explicit = re.search(
        rf"ALTER\s+TABLE\s+app\.{re.escape(table)}\s+FORCE\s+ROW\s+LEVEL\s+SECURITY",
        text,
        re.IGNORECASE,
    ) is not None

    dynamic = (
        table in text
        and "FORCE ROW LEVEL SECURITY" in text
        and "EXECUTE format" in text
    )

    return explicit or dynamic

table_to_migration = {
    "assistant_threads": "0025",
    "assistant_messages": "0025",
    "assistant_evidence": "0025",
    "assistant_cases": "0025",
    "assistant_observations": "0025",
    "assistant_recommendations": "0026",
    "assistant_decisions": "0026",
    "assistant_action_proposals": "0026",
    "assistant_action_approvals": "0026",
    "assistant_outcomes": "0026",
    "assistant_lab_experiments": "0027",
    "assistant_report_definitions": "0028",
    "assistant_report_versions": "0028",
    "assistant_report_exports": "0028",
    "assistant_report_schedules": "0028",
    "assistant_ai_notifications": "0029",
    "assistant_metric_engine_snapshots": "0030",
    "assistant_evidence_provenance": "0030",
    "assistant_ai_answer_contracts": "0031",
    "assistant_provider_governance_events": "0031",
    "assistant_privacy_redaction_events": "0032",
}

for table, migration_key in table_to_migration.items():
    text = migration_texts.get(migration_key, "")
    check(f"RLS enabled for {table}", has_enable_rls(table, text), migrations.get(migration_key, ""))
    check(f"FORCE RLS enabled for {table}", has_force_rls(table, text), migrations.get(migration_key, ""))

migration_required_fragments = {
    "0025 cases/observations": [
        "assistant_cases",
        "assistant_observations",
    ],
    "0026 durable chain": [
        "assistant_recommendations",
        "assistant_decisions",
        "assistant_action_proposals",
        "assistant_action_approvals",
        "assistant_outcomes",
    ],
    "0027 lab experiments": [
        "assistant_lab_experiments",
    ],
    "0028 report builder": [
        "assistant_report_definitions",
        "assistant_report_versions",
        "assistant_report_exports",
        "assistant_report_schedules",
        "format IN ('csv', 'pdf', 'xlsx')",
    ],
    "0029 AI notifications": [
        "assistant_ai_notifications",
        "assistant_ai_notifications_critical_no_snooze",
        "assistant_ai_notifications_dedup_uidx",
    ],
    "0030 metric provenance": [
        "assistant_metric_engine_snapshots",
        "assistant_evidence_provenance",
        "metric_engine_snapshot",
        "canonical_metric_refs",
        "null_semantics",
        "partial_data_metadata",
    ],
    "0031 answer contract/provider governance": [
        "assistant_ai_answer_contracts",
        "assistant_provider_governance_events",
        "thesis",
        "provider_guardrails",
        "timeout_ms",
        "retry_count",
        "circuit_breaker_state",
        "telemetry",
        "cancellation",
    ],
    "0032 privacy redaction": [
        "assistant_privacy_redaction_events",
        "raw_input_hash",
        "redacted_input_hash",
        "sample_free",
        "assistant_privacy_redaction_events_sample_free",
    ],
}

for label, fragments in migration_required_fragments.items():
    key = label.split(" ", 1)[0]
    text = migration_texts.get(key, "")
    for fragment in fragments:
        check(f"migration {label} contains {fragment}", fragment in text)

repository_methods = [
    "upsertAssistantCase",
    "appendObservation",
    "listObservationRecords",
    "upsertAssistantRecommendation",
    "upsertAssistantDecision",
    "upsertAssistantActionProposal",
    "upsertAssistantOutcome",
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
    "upsertAssistantReportDefinition",
    "duplicateAssistantReportDefinition",
    "readAssistantReportDefinitions",
    "createAssistantReportExport",
    "upsertAssistantReportSchedule",
    "upsertAssistantAiNotification",
    "readAssistantAiNotifications",
    "markAssistantAiNotificationRead",
    "snoozeAssistantAiNotification",
    "upsertAssistantMetricEngineSnapshot",
    "appendAssistantEvidenceProvenance",
    "readAssistantMetricProvenance",
    "upsertAssistantAiAnswerContract",
    "appendAssistantProviderGovernanceEvent",
    "readAssistantAiAnswerContracts",
    "readAssistantProviderGovernanceEvents",
    "appendAssistantPrivacyRedactionEvent",
    "readAssistantPrivacyRedactionEvents",
]

for method in repository_methods:
    check(f"repository method exists: {method}", f"async {method}" in db)

check("AssistantEvidenceSourceType exists", "type AssistantEvidenceSourceType =" in db)
check("appendEvidence source type widened", "sourceType: AssistantEvidenceSourceType;" in db)

runtime_fragments = [
    "syncDurableRecommendationDecisionActionOutcomeFromSnapshot",
    "syncMetricEngineProvenanceFromSnapshot",
    "persistPapaAiAnswerContractAndGovernance",
    "persistPapaPreProviderRedactionProof",
    "redactPapaProviderInputForPrivacy",
    "providerPrivacy.redactedInput",
    "appendAssistantPrivacyRedactionEvent",
    "hashPapaPrivacyInput",
    "buildPapaAnswerRefusal",
    "inferPapaAnswerRiskLevel",
    "resolvePapaEvidenceSourceType",
    "appendAssistantEvidenceProvenance",
]

for fragment in runtime_fragments:
    check(f"runtime fragment exists: {fragment}", fragment in source)

start = source.find("export async function generatePapaAnswer")
end = source.find("export async function saveObservation", start)
generate_section = source[start:end] if start != -1 and end != -1 else ""

check("generatePapaAnswer section found", bool(generate_section))
check(
    "DLP proof is before answer contract persistence",
    bool(generate_section)
    and generate_section.find("const providerPrivacy") != -1
    and generate_section.find("persistPapaAiAnswerContractAndGovernance") != -1
    and generate_section.find("const providerPrivacy") < generate_section.find("persistPapaAiAnswerContractAndGovernance"),
)
check("raw options.prompt absent in generatePapaAnswer", re.search(r"options\.prompt\b", generate_section) is None)
check("raw options.question absent in generatePapaAnswer", re.search(r"options\.question\b", generate_section) is None)
check("raw options.message absent in generatePapaAnswer", re.search(r"options\.message\b", generate_section) is None)
check("static metric_snapshot source write absent", 'sourceType: "metric_snapshot",' not in source)

warn("legacy 0.5 fallback occurrences marked for FIX 12", "0.5" not in source, f"count={source.count('0.5')}")
warn("legacy role system occurrence marked for cleanup if it is write-path", 'role: "system"' not in source, f"count={source.count('role: \"system\"')}")

service_handlers = [
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
]

for operation_id in service_handlers:
    check(f"service handler exists: {operation_id}", f'request.operationId === "{operation_id}"' in service)

check("generic papa fallback blocked", "cannot fall through to ProductDomainRepository" in service)
check("papa.* block exists before generic descriptor", service.find('request.operationId.startsWith("papa.")') != -1 and service.find('request.operationId.startsWith("papa.")') < service.find("operationDescriptor(request.operationId)"))
check("execute remains blocked", 'operationId === "papa.ai.action.execute"' in service)
check("rollback remains blocked", 'operationId === "papa.ai.action.rollback"' in service)

check("BFF report accepts pdf", "'pdf'" in bff and "createPapaReport" in bff)
check("BFF report accepts xlsx", "'xlsx'" in bff and "createPapaReport" in bff)
check("runtime report format includes xlsx", "| 'xlsx'" in runtime)
check("browser fake PDF disabled text absent", "PDF nie jest jeszcze obsługiwany" not in runtime)
check("panel PDF disabled button absent", "PDF niedostępny" not in panels)
check("panel backend export message present", "CSV, PDF i XLSX" in panels)

privacy_migration = migration_texts.get("0032", "")
for raw_column in [
    "raw_input text",
    "raw_prompt",
    "raw_message",
    "raw_content",
]:
    check(f"privacy migration does not store raw content column: {raw_column}", raw_column not in privacy_migration)

check("privacy sample_free constraint present", "sample_free = true" in privacy_migration)
check("privacy hash proof present", "raw_input_hash" in privacy_migration and "redacted_input_hash" in privacy_migration)

git_status = shell("git status --short --branch")
warn("working tree is intentionally not committed", "nothing to commit" in git_status.lower(), "expected WARN during fix series")
warn("untracked generated migrations/verifiers still present", "?? packages/database/migrations/00" not in git_status, "expected WARN before final add/commit")

pass_count = count_status("PASS")
warn_count = count_status("WARN")
fail_count = count_status("FAIL")
total = len(checks)

for item in checks:
    detail = f" :: {item['detail']}" if item["detail"] else ""
    print(f"{item['status']}  {item['name']}{detail}")

print("")
print(f"Verifier result: {pass_count}/{total} PASS, {warn_count} WARN, {fail_count} FAIL")

REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
lines = [
    "# Papa/Lab 506 - FIX 11 Meta Verifier",
    "",
    f"Generated at: {datetime.datetime.now(datetime.timezone.utc).isoformat()}",
    "",
    "## Summary",
    "",
    f"- PASS: {pass_count}",
    f"- WARN: {warn_count}",
    f"- FAIL: {fail_count}",
    f"- TOTAL: {total}",
    "",
    "## Notes",
    "",
    "- This verifier intentionally does not run lint, test, build, typecheck or pnpm verify.",
    "- WARN entries are follow-up cleanup candidates, not automatic blockers.",
    "- FAIL entries should be fixed before proceeding.",
    "",
    "## Results",
    "",
]

for item in checks:
    detail = f" — {item['detail']}" if item["detail"] else ""
    lines.append(f"- **{item['status']}** — {item['name']}{detail}")

REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

print("")
print(f"Report: {REPORT_PATH}")

if fail_count:
    print("")
    print("UWAGA: sa FAIL w meta-verifierze. Najpierw robimy FIX 11A.")
elif warn_count:
    print("")
    print("Meta-verifier bez FAIL. WARN-y przechodza do FIX 12 cleanup.")
else:
    print("")
    print("Meta-verifier czysty. Mozna przejsc do FIX 12.")
