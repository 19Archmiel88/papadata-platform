from pathlib import Path

migration = Path("packages/database/migrations/0029_papa_ai_notifications.sql").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

check("assistant_ai_notifications table exists", "CREATE TABLE IF NOT EXISTS app.assistant_ai_notifications" in migration)
check("AI category constraint exists", "category = 'ai'" in migration)
check("severity constraint exists", "assistant_ai_notifications_severity_valid" in migration)
check("critical no snooze constraint exists", "assistant_ai_notifications_critical_no_snooze" in migration)
check("deduplication unique index exists", "assistant_ai_notifications_dedup_uidx" in migration)
check("RLS enabled", "ALTER TABLE app.assistant_ai_notifications ENABLE ROW LEVEL SECURITY" in migration)
check("FORCE RLS enabled", "ALTER TABLE app.assistant_ai_notifications FORCE ROW LEVEL SECURITY" in migration)

for method in [
    "upsertAssistantAiNotification",
    "readAssistantAiNotifications",
    "markAssistantAiNotificationRead",
    "snoozeAssistantAiNotification",
]:
    check(f"repository method {method} exists", f"async {method}" in db)

check("case creation creates AI notification", "sourceObjectType: \"assistant_case\"" in db)
check("case deep link exists", "/app/papa/laboratorium-ai?caseThreadId=" in db)
check("report export creates AI notification", "sourceObjectType: \"assistant_report_export\"" in db)
check("report export deep link exists", "/app/papa/laboratorium-ai?reportExportId=" in db)
check("critical snooze is blocked in SQL", "when severity = 'critical' then null" in db)

for operation_id in [
    "papa.ai.notifications.read",
    "papa.ai.notification.mark-read",
    "papa.ai.notification.snooze",
    "papa.ai.notification.unsnooze",
]:
    check(f"service handler {operation_id}", f'request.operationId === "{operation_id}"' in service)

check("generic papa fallback still blocked", "cannot fall through to ProductDomainRepository" in service)
check("execute remains blocked", 'operationId === "papa.ai.action.execute"' in service)
check("rollback remains blocked", 'operationId === "papa.ai.action.rollback"' in service)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
