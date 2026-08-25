from pathlib import Path
import re

migration = Path("packages/database/migrations/0032_papa_privacy_redaction_proof.sql").read_text(encoding="utf-8")
db = Path("packages/database/src/production.ts").read_text(encoding="utf-8")
source = Path("apps/api/src/production/contract-runtime/papa-conversation.real-source.ts").read_text(encoding="utf-8")
service = Path("apps/api/src/production/contract-runtime/contract-runtime.service.ts").read_text(encoding="utf-8")

checks = []

def check(name, condition):
    checks.append((name, "PASS" if condition else "FAIL"))

check("privacy redaction table exists", "CREATE TABLE IF NOT EXISTS app.assistant_privacy_redaction_events" in migration)
check("privacy redaction RLS enabled", "ALTER TABLE app.assistant_privacy_redaction_events ENABLE ROW LEVEL SECURITY" in migration)
check("privacy redaction FORCE RLS enabled", "ALTER TABLE app.assistant_privacy_redaction_events FORCE ROW LEVEL SECURITY" in migration)
check("sample_free proof exists", "sample_free boolean NOT NULL DEFAULT true" in migration)
check("sample_free constraint exists", "assistant_privacy_redaction_events_sample_free" in migration)
check("raw hash column exists", "raw_input_hash text NOT NULL" in migration)
check("redacted hash column exists", "redacted_input_hash text NOT NULL" in migration)
check("detected categories column exists", "detected_categories jsonb" in migration)
check("fields redacted column exists", "fields_redacted jsonb" in migration)
check("redaction summary column exists", "redaction_summary jsonb" in migration)

check("repository append privacy event exists", "async appendAssistantPrivacyRedactionEvent" in db)
check("repository read privacy events exists", "async readAssistantPrivacyRedactionEvents" in db)

check("pre-provider proof function exists", "persistPapaPreProviderRedactionProof" in source)
check("provider privacy variable exists", "const providerPrivacy = await persistPapaPreProviderRedactionProof" in source)
check("provider input redaction function exists", "redactPapaProviderInputForPrivacy" in source)
check("privacy hash function exists", "hashPapaPrivacyInput" in source)
check("raw prompt read helper exists", "readPapaPrivacyPromptInput" in source)
check("privacy proof writes repository event", "appendAssistantPrivacyRedactionEvent" in source)
check("provider redacted input used", "providerPrivacy.redactedInput" in source)
check("email redaction pattern exists", "[REDACTED_EMAIL]" in source)
check("phone redaction pattern exists", "[REDACTED_PHONE]" in source)
check("secret redaction pattern exists", "[REDACTED_SECRET]" in source)
check("api key redaction pattern exists", "[REDACTED_API_KEY]" in source)

start = source.find("export async function generatePapaAnswer")
end = source.find("export async function saveObservation", start)
generate_section = source[start:end] if start != -1 and end != -1 else ""

check("generatePapaAnswer section found", bool(generate_section))
check("provider privacy created before answer persistence", generate_section.find("const providerPrivacy") != -1 and generate_section.find("persistPapaAiAnswerContractAndGovernance") != -1 and generate_section.find("const providerPrivacy") < generate_section.find("persistPapaAiAnswerContractAndGovernance"))
check("raw options.prompt absent from generatePapaAnswer", "options.prompt" not in generate_section)
check("raw options.question absent from generatePapaAnswer", "options.question" not in generate_section)
check("raw options.message absent from generatePapaAnswer", "options.message" not in generate_section)

check("privacy redaction service handler exists", 'request.operationId === "papa.privacy-redaction.read"' in service)
check("generic papa fallback still blocked", "cannot fall through to ProductDomainRepository" in service)

for raw_column in [
    "raw_input text",
    "raw_prompt",
    "raw_message",
    "raw_content",
]:
    check(f"no raw privacy column: {raw_column}", raw_column not in migration)

failed = [item for item in checks if item[1] != "PASS"]

for name, status in checks:
    print(f"{status}  {name}")

print("")
print(f"Verifier result: {len(checks) - len(failed)}/{len(checks)} PASS")

if failed:
    print("UWAGA: sa bledy verifiera, terminal pozostaje otwarty.")
