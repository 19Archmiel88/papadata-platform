from pathlib import Path

migration = Path("packages/database/migrations/0030_papa_metric_engine_provenance.sql").read_text(encoding="utf-8")
source = Path("apps/api/src/production/contract-runtime/papa-conversation.real-source.ts").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

for line in [
    "ALTER TABLE app.assistant_metric_engine_snapshots ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE app.assistant_metric_engine_snapshots FORCE ROW LEVEL SECURITY;",
    "ALTER TABLE app.assistant_evidence_provenance ENABLE ROW LEVEL SECURITY;",
    "ALTER TABLE app.assistant_evidence_provenance FORCE ROW LEVEL SECURITY;",
]:
    check(f"required SQL line present: {line}", line in migration)

for malformed in [
    "assistant_evidence_provenanceENABLE",
    "assistant_evidence_provenanceFORCE",
    "assistant_metric_engine_snapshotsENABLE",
    "assistant_metric_engine_snapshotsFORCE",
]:
    check(f"malformed SQL absent: {malformed}", malformed not in migration)

check("metric provenance table exists", "CREATE TABLE IF NOT EXISTS app.assistant_metric_engine_snapshots" in migration)
check("evidence provenance table exists", "CREATE TABLE IF NOT EXISTS app.assistant_evidence_provenance" in migration)
check("metric provenance repo method exists", "async upsertAssistantMetricEngineSnapshot" in db)
check("evidence provenance repo method exists", "async appendAssistantEvidenceProvenance" in db)
check("metric provenance read method exists", "async readAssistantMetricProvenance" in db)
check("runtime sync still present", "syncMetricEngineProvenanceFromSnapshot" in source)
check("service handler still present", 'request.operationId === "papa.metric-provenance.read"' in service)
check("generic papa fallback still blocked", "cannot fall through to ProductDomainRepository" in service)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
