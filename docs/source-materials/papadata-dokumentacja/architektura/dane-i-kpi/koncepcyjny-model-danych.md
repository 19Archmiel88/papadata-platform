# Koncepcyjny model danych

PAPADATA

Koncepcyjny model danych

Encje, relacje, własność domenowa i krytyczność MVP

Tabela:
- Wiersz 1: Kod dokumentu; A06
- Wiersz 2: Wersja; 1.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Ustanowić wspólny model pojęciowy dla produktu i podstawę modelu logicznego. [FAKT/ZAKRES]

Zakres: Encje operacyjne, integracyjne, kanoniczne, analityczne, AI, audit i billing. [FAKT/ZAKRES]

Poza zakresem: Fizyczne tabele, indeksy, partycjonowanie i typy kolumn. [OGRANICZENIE]

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

## Zasady modelowania

Każdy rekord tenantowy ma tenantId. Rekord należący do workspace ma tenantId i workspaceId; rekord globalny platformy nie ma żadnego z tych identyfikatorów.

External ID nie jest primary key PapaData.

Source payload jest niemutowalny/wersjonowany; canonical może być przeliczany z lineage.

Definicje, reguły i policy mają wersję oraz czas obowiązywania.

Brak wartości i zero są odrębne.

PII jest klasyfikowane, minimalizowane i pseudonimizowane.

Manual override przechowuje actor, rationale, before, rule version i reprocess impact.

Tabela:
- Wiersz 1: Encja; Cel; Kluczowe pola; Relacje; Owner; MVP
- Wiersz 2: Tenant; Granica klienta, własności danych, umowy, billingu i polityk; tenantId, name, status, legalProfileRef; 1:N Workspace; Tenant; MVP krytyczna
- Wiersz 3: Workspace; Przestrzeń operacyjna wewnątrz tenanta; workspaceId, tenantId, name, timezone, currency, status; N:1 Tenant; 1:N Membership/Connection; Tenant; MVP krytyczna
- Wiersz 4: User; Osoba korzystająca z platformy; id, identityRef, email, status, locale; N:M Workspace przez Membership; Identity; MVP krytyczna
- Wiersz 5: Membership; Powiązanie użytkownika z workspace; id, tenantId, userId, workspaceId, roleSet, status, validity; N:1 User/Workspace; Authorization; MVP krytyczna
- Wiersz 6: Role/Capability; Polityka dozwolonych operacji; code, version, capabilities, constraints; N:M Membership; Authorization; MVP krytyczna
- Wiersz 7: Invitation; Kontrolowane zaproszenie; id, tenantId, workspaceId, email, roleSet, tokenHash, expiresAt, status; N:1 Workspace; Identity; MVP
- Wiersz 8: IntegrationProvider; Katalog źródeł; providerId, category, scopes, readiness dimensions; 1:N Connection; Integrations; MVP
- Wiersz 9: IntegrationConnection; Połączenie z kontem zewnętrznym; id, tenantId, workspaceId, providerId, externalAccountRef, scope, status, credentialRef; 1:N SyncJob; Integrations; MVP krytyczna
- Wiersz 10: SyncJob; Jednostka synchronizacji; id, tenantId, workspaceId, connectionId, type, range, status, attempt, progress, errorClass; N:1 Connection; 1:N SourceBatch; Ingestion; MVP krytyczna
- Wiersz 11: SyncCheckpoint; Stan bezpiecznego wznowienia; tenantId, workspaceId, connectionId, stream, cursor, watermark, updatedAt; 1:1 per stream; Ingestion; MVP
- Wiersz 12: SourceRecord; Niemutowalny rekord lub odwołanie źródłowe; tenantId, workspaceId, provider, connectionId, externalId, payloadRef, fetchedAt, contractVersion; N:1 SourceBatch; Data Platform; MVP krytyczna
- Wiersz 13: CanonicalOrder; Kanoniczny fakt zamówienia; id, tenantId, workspaceId, authorityVersion, status, amounts, currency, occurredAt; 1:N OrderLine; N:M SourceRecord lineage; Commerce Data; MVP krytyczna
- Wiersz 14: CanonicalProduct/Variant; Kanoniczna tożsamość produktu; id, tenantId, workspaceId, sku, attributes, mappingStatus; 1:N Variant/Offer; Commerce Data; MVP zależna
- Wiersz 15: Dataset; Zakres danych oceniany jako całość; id, tenantId, workspaceId, type, period, schemaVersion, readiness; 1:N Assessment/MetricSnapshot; Quality; MVP krytyczna
- Wiersz 16: QualityAssessment; Wynik reguł jakości; id, tenantId, workspaceId, datasetId, ruleVersion, completeness, freshness, integrity, result; N:1 Dataset; Quality; MVP krytyczna
- Wiersz 17: DataIssue; Problem wymagający działania; id, tenantId, workspaceId, datasetId, class, severity, impact, owner, status, resolution; N:1 Dataset; Quality; MVP
- Wiersz 18: MetricDefinition; Wersjonowana definicja KPI; code, version, formulaRef, requiredFields, readinessRule, validFrom; 1:N MetricSnapshot; Metrics; MVP krytyczna
- Wiersz 19: MetricSnapshot; Wynik KPI dla zakresu i czasu; id, tenantId, workspaceId, metricCode/version, period, value, currency, readiness, evidenceRef; N:1 MetricDefinition; Metrics; MVP krytyczna
- Wiersz 20: Insight; Fakt lub obserwacja wyprowadzona z danych; id, tenantId, workspaceId, type, statement, evidenceRefs, confidence, status; 1:N Recommendation; Insights; MVP
- Wiersz 21: Recommendation; Proponowane działanie lub interpretacja; id, tenantId, workspaceId, insightId, owner, impact, reversibility, expiresAt, status; N:1 Insight; 1:N Decision; Decisions; MVP
- Wiersz 22: Decision; Jawna decyzja człowieka; id, tenantId, workspaceId, recommendationId, actorId, result, rationale, decidedAt; 1:N Action/Outcome; Decisions; MVP
- Wiersz 23: ActionExecution; Wykonanie zatwierdzonego działania; id, tenantId, workspaceId, decisionId, target, status, idempotencyKey, result, rollbackRef; N:1 Decision; Actions; Etap 2
- Wiersz 24: AssistantThread; Kontekst analizy AI; id, tenantId, workspaceId, purpose, scope, retentionClass; 1:N Message; AI; MVP ograniczony
- Wiersz 25: AssistantMessage/ModelRun; Treść, model i dowody odpowiedzi; id, tenantId, workspaceId, threadId, type, contentRef, modelVersion, promptVersion, evidenceRefs, cost; N:1 Thread; AI; MVP ograniczony
- Wiersz 26: AuditEvent; Niemodyfikowalny ślad operacji; id, tenantId, workspaceId (opcjonalnie), actor, action, target, beforeAfterHash, timestamp, correlationId; odniesienia do wszystkich encji; Audit; MVP krytyczna
- Wiersz 27: Subscription/UsageRecord; Plan i jednostki użycia; id, tenantId, plan, status, period, meterVersion, quantity; N:1 Tenant; Billing; MVP minimalny

## Relacje krytyczne

Tenant 1---N Workspace 1---N IntegrationConnection 1---N SyncJob
| | |
| +---N Dataset-------------+
| | +---N Assessment / DataIssue
| +---N CanonicalOrder ---N SourceRecord (lineage)
| +---N MetricSnapshot ---1 MetricDefinition(version)
| +---N Insight ---N Recommendation ---N Decision ---N ActionExecution
+---N Subscription / UsageRecord

User N---M Workspace przez Membership ---N Role/Capability
AssistantThread ---N Message/ModelRun ---N EvidenceReference -> MetricSnapshot/Dataset

## Klasy danych i retencja

Tabela:
- Wiersz 1: Klasa; Przykłady; Kontrole; Retencja
- Wiersz 2: Public/config; provider catalog, UI definitions; integrity/versioning; wg wersji produktu
- Wiersz 3: Customer confidential; orders, campaigns, KPI; tenant isolation/encryption/audit; umowa/policy
- Wiersz 4: Personal data; user email, customer refs; minimization/pseudonymization/rights; purpose-based
- Wiersz 5: Credentials; OAuth token, webhook secret; secret store/write-only/rotation; do revoke/rotation
- Wiersz 6: Audit/security; login, role, export; append-only/restricted; security/legal
- Wiersz 7: AI prompts/outputs; questions, evidence, run; policy/redaction/retention class; per use case

## Wersjonowanie i czas

Source record przechowuje fetchedAt i provider contract version.

Canonical fact przechowuje business/effective time oraz processing time.

MetricDefinition ma validFrom/validTo; snapshot wskazuje wersję.

Source authority i mapping są wersjonowane; zmiana tworzy impact/reprocess plan.

Deletion/anonymization zachowuje zminimalizowany dowód operacji zgodnie z policy.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Procesy krytyczne mają dane, błędy, stan końcowy i audyt; rekomendacje nie są przedstawiane jako fakty.

Elementy MVP mają mierzalny rezultat, ścieżkę błędu oraz właściciela decyzji dla luk i blokerów.
