from pathlib import Path

migration = Path("packages/database/migrations/0028_papa_report_builder_exports.sql").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
bff = Path("apps/web/src/shared/api/bffClient.ts").read_text(encoding="utf-8")
runtime = Path("apps/web/src/shell/papa-assistant/PapaAssistantRuntimeContext.tsx").read_text(encoding="utf-8")
panels = Path("apps/web/src/screens/papa/PapaAssistantPanels.tsx").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

for table in [
    "assistant_report_definitions",
    "assistant_report_versions",
    "assistant_report_exports",
    "assistant_report_schedules",
]:
    check(f"{table} migration exists", f"CREATE TABLE IF NOT EXISTS app.{table}" in migration)
    check(f"{table} RLS in loop", f"'{table}'" in migration)

for method in [
    "upsertAssistantReportDefinition",
    "duplicateAssistantReportDefinition",
    "readAssistantReportDefinitions",
    "createAssistantReportExport",
    "upsertAssistantReportSchedule",
]:
    check(f"repository method {method} exists", f"async {method}" in db)

check("BFF createPapaReport accepts pdf", "'pdf'" in bff and "createPapaReport" in bff)
check("BFF createPapaReport accepts xlsx", "'xlsx'" in bff and "createPapaReport" in bff)

check("runtime report format includes xlsx", "| 'xlsx'" in runtime)
check("runtime no PDF disabled text", "PDF nie jest jeszcze obsługiwany" not in runtime)
check("runtime sends selected format", "format," in runtime and "reportType: 'papa-laboratory'" in runtime)
check("artifact preserves selected format", "format: PapaAssistantReportFormat" in runtime)

check("panel generic report generator exists", "generateCurrentScreenReport" in panels)
check("panel PDF button exists", "Generuj PDF" in panels)
check("panel XLSX button exists", "Generuj XLSX" in panels)
check("panel no PDF disabled button", "PDF niedostępny" not in panels)
check("panel backend controlled notice updated", "CSV, PDF i XLSX" in panels)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
