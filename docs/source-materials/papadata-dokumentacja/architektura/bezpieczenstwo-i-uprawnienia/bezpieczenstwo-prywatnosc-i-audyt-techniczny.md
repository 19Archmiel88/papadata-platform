# Bezpieczeństwo prywatność i audyt techniczny

PAPADATA

Bezpieczeństwo, prywatność i audyt techniczny

Kontrole P0, tenant isolation, sekrety, privacy i bramy go-live

Tabela:
- Wiersz 1: Kod dokumentu; A10
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Przełożyć security, privacy, continuity i AI governance na kontrole i dowody. [FAKT/ZAKRES]

Zakres: Threat model, identity, isolation, data protection, secrets, audit, supply chain, recovery i incident. [FAKT/ZAKRES]

Poza zakresem: Formalna opinia prawna, DPIA, pentest i certyfikacja. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Podstawa źródłowa

Tabela:
- Wiersz 1: Kod; Dokument; Rola w architekturze
- Wiersz 2: D1; Dokumentacja produktu; Nadrzędna dokumentacja biznesowo-produktowa.
- Wiersz 3: D2; Rejestr decyzji i wymagań biznesowych; Jedyne źródło prawdy dla statusu i wersji decyzji.
- Wiersz 4: D3; Kontrakt danych, stanów i KPI; Źródło prawdy dla warstw danych, canonicalization, deduplikacji i readiness.
- Wiersz 5: D4; Integracje i gotowość operacyjna; Źródło prawdy dla providerów, bram, synchronizacji, retry i recovery.
- Wiersz 6: D5; Pierwszy pion produktowy i płatny pilotaż; Proces pierwszej mierzalnej wartości i kryteria pilotażu.
- Wiersz 7: D6; Model komercyjny i unit economics; Plany, limity, koszty, marża i bramy skalowania.
- Wiersz 8: D7; Bezpieczeństwo, Prywatność i AI Governance; Kontrole bezpieczeństwa, prywatności, ciągłości i AI.
- Wiersz 9: M01-M15; Specyfikacje architektury UI/UX; Ekrany, flow, stany, formularze, Storybook i priorytety.

Hierarchia: D2 ustala status decyzji; D3 semantykę danych/KPI; D4 gotowość integracji; D7 bezpieczeństwo i AI. M01-M15 opisują wymagania UI, ale nie dowodzą implementacji. [FAKT]

## Zasady bezpieczeństwa

Każda operacja rewaliduje tenant, capability, resource state i policy.

Dane są szyfrowane; sekrety pozostają w Secret Store i są write-only.

Logi nie zawierają payloadów, tokenów ani pełnych identyfikatorów.

Audit jest odrębny od logu technicznego i obejmuje człowieka, system i AI.

Ops access jest JIT, celowy, ograniczony i audytowany.

Kontrola ma test/dowód; dokument nie jest dowodem.

## Threat model

Tabela:
- Wiersz 1: Scenariusz; Zasób; Kontrole; Dowód
- Wiersz 2: IDOR/cross-tenant; dane klienta; policy, tenant filters/RLS/constraints, negative tests; test suite/logs
- Wiersz 3: Credential theft; integracje; secret store, rotation, least scope; rotation test
- Wiersz 4: Webhook spoof/replay; ingestion; signature, timestamp, event dedupe; contract test
- Wiersz 5: Duplicate action; external/billing; idempotency, target hash, outbox; failure injection
- Wiersz 6: Prompt injection/exfiltration; AI; policy before retrieval, classification, tool allowlist; AI security eval
- Wiersz 7: Privilege escalation; roles; admin boundaries, reauth, last-owner guard; auth tests
- Wiersz 8: Supply-chain; build/deploy; locked deps, scans, SBOM, signed artifact; CI evidence
- Wiersz 9: Data loss; DB/canonical; backup, PITR, restore, immutable source; restore report
- Wiersz 10: Support misuse; customer data; JIT, purpose, least privilege, alerts; access review
- Wiersz 11: Deletion failure; personal data; lifecycle jobs, dependency map, evidence; deletion report

## Kontrole P0

Tabela:
- Wiersz 1: Obszar; Kontrola; Brama
- Wiersz 2: Identity; MFA privileged, sessions, recovery; positive/negative tests
- Wiersz 3: Tenant; scope w API/DB/jobs; cross-tenant suite
- Wiersz 4: Secrets; central store, rotation, masking; no secrets in repo/logs
- Wiersz 5: Data; encryption, classification, minimization, retention; data inventory
- Wiersz 6: Audit; append-only, restricted export; critical action coverage
- Wiersz 7: CI/CD; review, protected branch, scans; release gate
- Wiersz 8: Runtime; WAF/rate limit/least privilege/network; config evidence
- Wiersz 9: Backup; backup + restore exercise; RTO/RPO evidence
- Wiersz 10: Incident; severity, contacts, containment; tabletop/runbook
- Wiersz 11: AI; safe retrieval, allowlist, oversight, budgets; AI gate

## Prywatność

Data inventory mapuje source, purpose, legal basis, class, owner, location, recipients, retention i deletion.

Customer identity jest pseudonymizowana, jeśli analiza nie wymaga tożsamości.

AI data ma osobną retencję i ocenę podprocesora.

Export/delete są audytowane; legal hold jest jawny.

Testy używają danych syntetycznych.

## AuditEvent

Tabela:
- Wiersz 1: Pole; Wymaganie
- Wiersz 2: eventId/timestamp; unikalny i wiarygodny czas
- Wiersz 3: tenant/workspace; jawny scope
- Wiersz 4: actor; user/service/AI/support + auth strength
- Wiersz 5: action/target; stabilny kod i ID
- Wiersz 6: decision; allow/deny/success/failure
- Wiersz 7: before/after; hash lub minimalny diff
- Wiersz 8: reason/rationale; manual decision/override
- Wiersz 9: correlation/causation; powiązanie request/job/event
- Wiersz 10: policy/rule/model version; automaty i AI
- Wiersz 11: data classification; kontrola dostępu do audytu

## Bramy go-live

Niezależny security review i tenant tests.

Restore test i zatwierdzone RTO/RPO.

Runbook incydentu i provider outage przećwiczony.

Privacy/legal review dla data, integration i AI.

Brak critical vulnerabilities lub formalny acceptance.

Monitoring, alerts, support i kill switch integration/AI.

Dowód, że AI/Actions nie omijają policy/approval.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.
