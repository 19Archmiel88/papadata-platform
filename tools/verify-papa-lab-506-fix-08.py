from pathlib import Path

migration = Path("packages/database/migrations/0030_papa_metric_engine_provenance.sql").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
source = Path("apps/api/src/production/contract-runtime/papa-conversation.real-source.ts").read_text(encoding="utf-8")
service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

check("assistant_metric_engine_snapshots table exists", "CREATE TABLE IF NOT EXISTS app.assistant_metric_engine_snapshots" in migration)
check("assistant_evidence_provenance table exists", "CREATE TABLE IF NOT EXISTS app.assistant_evidence_provenance" in migration)
check("assistant_evidence source type widened", "metric_engine_snapshot" in migration and "context_snapshot" in migration and "chart" in migration and "table" in migration)
check("metric provenance RLS enabled", "ALTER TABLE app.assistant_metric_engine_snapshots ENABLE ROW LEVEL SECURITY" in migration)
check("evidence provenance RLS enabled", "ALTER TABLE app.assistant_evidence_provenance ENABLE ROW LEVEL SECURITY" in migration)
check("metric provenance FORCE RLS enabled", "ALTER TABLE app.assistant_metric_engine_snapshots FORCE ROW LEVEL SECURITY" in migration)
check("evidence provenance FORCE RLS enabled", "ALTER TABLE app.assistant_evidence_provenance FORCE ROW LEVEL SECURITY" in migration)

for method in [
    "upsertAssistantMetricEngineSnapshot",
    "appendAssistantEvidenceProvenance",
    "readAssistantMetricProvenance",
]:
    check(f"repository method {method} exists", f"async {method}" in db)

check("AssistantEvidenceSourceType exists", "type AssistantEvidenceSourceType =" in db)
check("appendEvidence source type widened", "sourceType: AssistantEvidenceSourceType;" in db)

check("capture syncs metric provenance", "syncMetricEngineProvenanceFromSnapshot" in source)
check("metric identifiers persisted", "metricIdentifiers" in source)
check("canonical metric refs persisted", "canonicalMetricRefs" in source)
check("date range persisted", "dateRange" in source)
check("filters persisted", "filters" in source)
check("currency persisted", "currency:" in source)
check("timezone persisted", "timezone:" in source)
check("precision config persisted", "precisionConfig" in source)
check("null semantics persisted", "nullSemantics" in source)
check("partial data metadata persisted", "partialDataMetadata" in source)
check("data quality persisted", "dataQuality" in source)
check("freshness persisted", "freshness" in source)
check("provenance persisted", "provenance" in source)

check("static metric_snapshot evidence source removed", 'sourceType: "metric_snapshot",' not in source)
check("evidence source resolver exists", "resolvePapaEvidenceSourceType" in source)
check("evidence provenance appended", "appendAssistantEvidenceProvenance" in source)

check("metric provenance service handler exists", 'request.operationId === "papa.metric-provenance.read"' in service)
check("generic papa fallback still blocked", "cannot fall through to ProductDomainRepository" in service)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
