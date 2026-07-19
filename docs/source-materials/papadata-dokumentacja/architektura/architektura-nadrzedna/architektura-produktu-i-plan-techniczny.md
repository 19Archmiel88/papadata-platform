# Architektura produktu i plan techniczny

PAPADATA

Architektura produktu i plan techniczny

Nadrzędna synteza produktu PapaData

Tabela:
- Wiersz 1: Kod dokumentu; A01
- Wiersz 2: Wersja; 2.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Przełożyć biznes i UI/UX na spójną architekturę oraz kontrolowany plan realizacji. [FAKT/ZAKRES]

Zakres: Domeny, moduły, procesy, dane, API, role, integracje, AI, Storybook, ryzyka, MVP i kolejność wdrożenia. [FAKT/ZAKRES]

Poza zakresem: Kod, finalne OpenAPI, fizyczny schemat DB, konfiguracja chmury i certyfikacja. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Google Cloud Platform jest docelową platformą infrastrukturalną PapaData. Architektura może korzystać z każdej usługi GCP zatwierdzonej w katalogu usług i uzasadnionej wymaganiami produktu, bezpieczeństwa, operacji lub kosztu; nie oznacza to obowiązku wdrażania wszystkich usług GCP. Referencyjne mapowanie obejmuje Cloud Run dla API, BFF, workerów i jobów, Cloud SQL for PostgreSQL, Memorystore for Redis, Pub/Sub i Cloud Tasks, Cloud Storage, Secret Manager, Cloud Scheduler, Artifact Registry, Cloud Build, IAM, Cloud KMS, Cloud Logging, Monitoring i Trace oraz komponenty sieciowe i ochronne odpowiednie do ryzyka.

Środowiska Local, CI, Development i Staging odtwarzają produkcyjne kontrakty, wersje, granice procesów i przepływy danych w maksymalnym praktycznym zakresie. Lokalny development wykorzystuje Docker Compose oraz kontenery API, BFF, workerów i migracji, PostgreSQL w tej samej głównej wersji co Cloud SQL, Redis, emulator lub adapter kolejek, emulator GCS albo MinIO za interfejsem storage, lokalny scheduler, OpenTelemetry Collector oraz sandboxy lub mocki providerów. Te same migracje, obrazy, schematy API i kontrakty zdarzeń obowiązują w Local, CI i GCP. Bruno jest wersjonowanym narzędziem testowania i dokumentowania API, a nie usługą infrastrukturalną.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

Billing, usage, entitlements, limity, status subskrypcji, dokumenty rozliczeniowe oraz self-service należą do MVP. Funkcje płatnicze działają end-to-end dla wybranego providera i metod płatności dopuszczonych do MVP. Nieobsługiwane metody lub rynki nie są prezentowane jako dostępne; wymagany proces ręczny jest jawnie opisanym fallbackiem operacyjnym, a nie atrapą ekranu.

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

## 1. Wnioski główne

Rdzeniem wartości jest łańcuch: źródło -> canonical data -> readiness -> KPI -> insight -> decyzja -> outcome.

Rekomendowany start to modularny monolit z osobnymi workerami, kolejkami i adapter runtime.

MVP dostarcza pełne funkcje wszystkich modułów aplikacji; ograniczenie dotyczy katalogu kompletnych integracji, wariantów, rynków i skali.

Tenant isolation, serwerowa autoryzacja, audyt, idempotencja, readiness i wersjonowanie reguł są P0.

AI w MVP służy do interpretacji danych dopuszczonych przez readiness, z evidence i bez autonomicznego wykonania.

Model tenant/workspace, katalog providerów MVP, zakres funkcji, GCP i parzystość środowisk są rozstrzygnięte w decyzjach centralnych; retencja oraz RTO/RPO podlegają bramom domenowym.

Frontend prezentuje projekcje i statusy; backend posiada procesy/policy; dane posiadają canonicalization/KPI; AI konsumuje zatwierdzony kontekst.

## Przekazanie odpowiedzialności

Tabela:
- Wiersz 1: Zespół; Odpowiedzialność; Nie przejmuje
- Wiersz 2: Frontend; Ekrany, dostępność, formularze, stan requestu, prezentacja statusów; KPI, auth decisions, dedupe, retry integracji
- Wiersz 3: Backend; API, procesy, policy, komendy, joby, audit; Finalna semantyka UI i danych bez ownerów
- Wiersz 4: Dane; Warstwy, lineage, jakość, source authority, KPI; Role i automatyczne decyzje
- Wiersz 5: AI; Interpretacja, evidence, rekomendacje, ograniczenia; Prawda, readiness, role, samodzielne actions
- Wiersz 6: Security; Threat model, isolation, secrets, privacy, recovery gates; Kierunek produktu bez ownera
- Wiersz 7: Operations; Monitoring, runbook, recovery, support evidence; Stały szeroki dostęp do danych

## 2. Mapa domen produktu

Tabela:
- Wiersz 1: Kod; Domena; Cel; Procesy; Dane; Zależności; Ryzyko; Priorytet
- Wiersz 2: D-01; Identity & Access; Uwierzytelnienie i sesja; logowanie, MFA, recovery, reauth; Identity, Session, MFAChallenge; D-02, D-12; przejęcie konta; MVP
- Wiersz 3: D-02; Tenant i Workspace; Kontekst tenantu i członkostwa; workspace, membership, invitation; Tenant, Workspace, Membership; D-01, D-03, D-13; wyciek cross-tenant; MVP
- Wiersz 4: D-03; Authorization & Entitlements; Decyzje dostępu i planu; RBAC/ABAC, capability, data scope; Role, Capability, Policy, Entitlement; D-01, D-02, D-13; logika uprawnień w UI; MVP
- Wiersz 5: D-04; Integration Management; Cykl życia connection; connect, reconnect, scopes, statusy; Provider, Connection, Scope; D-02, D-05, D-12; sekrety i scope; MVP
- Wiersz 6: D-05; Ingestion & Synchronization; Pobranie danych; initial sync, incremental, backfill, webhook; SyncJob, Checkpoint, SourceBatch; D-04, D-06, D-12; duplikaty i retry storm; MVP
- Wiersz 7: D-06; Data Quality & Readiness; Ocena jakości i gotowości; walidacja, issue, readiness, resync; Dataset, Assessment, DataIssue; D-05, D-07, D-08; fałszywe READY; MVP
- Wiersz 8: D-07; Canonical Commerce Data; Jednoznaczny fakt biznesowy; normalizacja, source authority, dedupe; CanonicalOrder, Product, CustomerRef; D-05, D-06, D-08; podwójne liczenie; MVP
- Wiersz 9: D-08; Metrics & Analytics; Wersjonowane KPI; calculation, snapshot, compare; MetricDefinition, MetricSnapshot; D-06, D-07, D-09; różne definicje KPI; MVP
- Wiersz 10: D-09; Insights & Decisions; Od obserwacji do decyzji; insight, recommendation, decision, outcome; Insight, Recommendation, Decision; D-08, D-10, D-11; rekomendacja bez ownera; MVP
- Wiersz 11: D-10; AI Assistant; Kontrolowana interpretacja; retrieval, answer, evidence, review; Thread, Message, Evidence, ModelRun; D-03, D-06, D-08, D-09; prompt injection i leakage; MVP ograniczony
- Wiersz 12: D-11; Actions & Automation; Bezpieczne wykonanie działań; approval, execution, rollback; ActionProposal, Approval, Execution; D-03, D-09, D-10; excessive agency; Etap 2
- Wiersz 13: D-12; Audit, Notifications & Operations; Dowody i obsługa operacyjna; audit, alert, support, incident; AuditEvent, Notification, Incident; wszystkie domeny; brak dowodu i alert fatigue; MVP
- Wiersz 14: D-13; Subskrypcja i billing; Plan, limity i usage; subscription, metering, invoice ref; Subscription, UsageRecord; D-02, D-03, D-12; błędny metering; MVP minimalny
- Wiersz 15: D-14; Configuration & Governance; Wersjonowane reguły i bramy; feature flag, rule version, evidence, ADR; RuleVersion, GateEvidence, ADR; wszystkie domeny; zmiana bez reprocessingu; MVP

## 3. Architektura modułów

Rekomendacja: Modularny monolit dla usług domenowych, osobne procesy dla web/API/workers/migrate; adaptery izolowane anti-corruption layer. [REKOMENDACJA]

Tabela:
- Wiersz 1: Kod; Moduł; Odpowiedzialność; UI; Kontrakty; Zależności; Stany/błędy; Etap
- Wiersz 2: MOD-01; Web Application; Powłoka, ekrany i stan lokalny UI; M01-M15; DTO, komendy, operation status; API/BFF, Identity; loading/partial/blocked/error; MVP
- Wiersz 3: MOD-02; BFF / Public API; Stabilny kontrakt i agregacja widoków; wszystkie; REST/JSON + polling/SSE; Application, Policy; 401/403/409/422/503; MVP
- Wiersz 4: MOD-03; Identity & Tenant; Sesje, membership, capability i kontekst; M01, M03, M13; auth, memberships, invitations; IdP, Audit; reauth/suspended/wrong tenant; MVP
- Wiersz 5: MOD-04; Integration Control Plane; Provider catalog i connection lifecycle; M10, M01; connect/reconnect/disconnect; Adapter, Secret Store; reauth/limited/error; MVP
- Wiersz 6: MOD-05; Adapter Runtime; Izolacja specyfiki providerów; M10; anti-corruption clients; Queue, Object Storage; rate limit/schema drift; MVP: jeden adapter
- Wiersz 7: MOD-06; Job Orchestrator & Workers; Sync, backfill, reprocess i eksport; M10, M11, M14; job, progress, retry, DLQ; Queue, DB, Storage; retry/failed/partial; MVP
- Wiersz 8: MOD-07; Data Platform; Source, normalized, canonical i lineage; M05-M11; ingestion/canonical contracts; Workers, Quality; conflict/duplicate/invalid; MVP
- Wiersz 9: MOD-08; Quality & Readiness Engine; Reguły jakości i bramy KPI; M11, M04; assess, issue, readiness; Data, Metrics; no_data/partial/invalid/stale; MVP
- Wiersz 10: MOD-09; Metrics & Query Service; Metryki i projekcje dashboardów; M04-M09; metric queries/snapshots; Canonical Data, Cache; calculating/stale/version changed; MVP
- Wiersz 11: MOD-10; Insight & Decision Service; Insight, rekomendacje, decyzje i outcome; M04, M12, M15; create/review/decide/measure; Metrics, AI, Audit; expired/data changed/no owner; MVP
- Wiersz 12: MOD-11; AI Gateway; Policy, retrieval, koszt, evidence i modele; M12; generate/stream/approve proposal; Metrics, Policy, Models; insufficient/provider error/blocked; MVP ograniczony
- Wiersz 13: MOD-12; Billing & Usage; Entitlements, usage i status płatności; M14; usage/subscription; Policy, billing provider; past_due/limit reached; MVP minimalny
- Wiersz 14: MOD-13; Audit & Operations; Ślad, monitoring, support i incydenty; M03, M10-M15; audit search, alerts, runbook hooks; wszystkie; incident/audit unavailable; MVP

## 4. Konsekwencje techniczne ekranów UI/UX

Każdy ekran deklaruje tenant/workspace, zakres, capabilities i readiness.

Zmiana workspace czyści cache i wymaga rewalidacji policy; dane poprzedniego tenantu nie pozostają w pamięci.

KPI wraca z wersją definicji, statusem, ograniczeniami, okresem, walutą i evidence.

Operacje długie zwracają operationId; UI pokazuje postęp i nie duplikuje komendy.

Błędy rozróżniają validation, permission, conflict, data readiness, provider i internal.

Storybook pokrywa loading, empty, no data, partial, delayed, invalid, processing, ready, resync, forbidden i expired session.

## 5. Procesy systemowe

Tabela:
- Wiersz 1: Kod; Proces; Warunek; Kroki systemu; Użytkownik; Dane; Błędy; Koniec; Audyt
- Wiersz 2: P-01; Zaproszenie -> konto -> MFA -> workspace; ważne invitation/membership; token; identity; MFA; sesja; kontekst; accept + MFA; Invitation, User, Membership; expired/email mismatch/MFA; aktywny workspace; invitation.accepted; session.created
- Wiersz 3: P-02; Odzyskanie dostępu; zweryfikowana identity; rate limit; token; reset; MFA recovery; revoke sessions; request/reset; User, Session, Audit; expired/too many attempts; nowa sesja/support; access.recovery.completed
- Wiersz 4: P-03; Konfiguracja workspace; Owner/Admin; profil; timezone; currency; pilot scope; policy; uzupełnia profil; Workspace, GateEvidence; missing owner/invalid scope; gotowy do connect; workspace.configured
- Wiersz 5: P-04; Połączenie integracji; provider runtime enabled; intent; OAuth; scope; credentialRef; verify account; wybór konta; Connection, Scope, Audit; OAuth cancelled/missing scope; ACTIVE/LIMITED; integration.connected
- Wiersz 6: P-05; Initial sync/backfill; ACTIVE connection; enqueue; checkpoint; fetch; source persist; retry; monitoruje; SyncJob, Batch, SourceRecord; rate limit/outage/schema; source available/failed; sync.completed/failed
- Wiersz 7: P-06; Normalizacja i canonicalization; source batch; normalize; overlap; authority; dedupe; lineage; review konfliktu; CanonicalOrder, Lineage, Issue; conflict/missing key; canonical dataset; canonicalization.completed
- Wiersz 8: P-07; Readiness i KPI; canonical dataset; quality; readiness; metric calc; snapshot publish; interpretuje ograniczenia; Assessment, MetricSnapshot; partial/invalid/version changed; READY/PARTIAL KPI; metric.published
- Wiersz 9: P-08; Dashboard i drill-down; snapshot + permission; projection; policy; cache; evidence; filtruje/drąży; Snapshot, Projection; stale/forbidden/timeout; jawny readiness; dashboard.viewed
- Wiersz 10: P-09; Analiza AI z dowodami; AI enabled + allowed data; policy; retrieval; evidence; model; validation; zadaje pytanie; Thread, ModelRun, Evidence; insufficient/injection/provider; ANSWERED/REFUSAL; ai.analysis.completed
- Wiersz 11: P-10; Rekomendacja -> decyzja; insight + owner; impact; expiry; approval policy; persist; accept/reject/defer; Insight, Recommendation, Decision; data changed/no owner; decyzja człowieka; recommendation.decided
- Wiersz 12: P-11; Wykonanie działania; approved decision; revalidate target; idempotency; execute; verify; potwierdza; ActionExecution, Audit; target changed/external fail; success/failed/rollback; action.executed
- Wiersz 13: P-12; Reconnect i wznowienie; REAUTH_REQUIRED; new auth; continuity; resume checkpoint; reconnect; Connection, Checkpoint, Job; account changed/scope reduced; ACTIVE/SYNCING; integration.reauthorized
- Wiersz 14: P-13; Zmiana roli/członkostwa; uprawniony admin; policy; last-owner guard; apply; revoke; zmienia rolę; Membership, Role, Audit; escalation/self-lockout; nowy dostęp; membership.updated
- Wiersz 15: P-14; Dezaktywacja/retencja/usunięcie; approved request; legal hold; disable; export/delete/anonymize; potwierdza; Workspace, DeletionJob, Audit; hold/dependency/incomplete; deactivated/deleted; data.lifecycle.changed
- Wiersz 16: P-15; Usage i rozliczenie; aktywny plan; meter canonical units/jobs/AI; aggregate; limits; przegląda usage; UsageRecord, Subscription; duplicate meter/provider; usage snapshot; usage.recorded

## 6. Koncepcyjny model danych

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

## 7. Kontrakty frontend-backend

Każda odpowiedź ma correlationId; analityczna także scope, generatedAt, readiness i limitations.

Komendy wymagają idempotencyKey lub expectedVersion; operacje wrażliwe mogą wymagać reauthToken.

Paginacja logów i list używa stabilnego kursora.

Backend zwraca capabilities dla UX, ale ponownie egzekwuje policy przy komendzie.

Status procesu jest zasobem, nie zbiorem rekonstruowanych flag.

Fixtures są walidowane tym samym schematem co kontrakt API.

Tabela:
- Wiersz 1: Akcja; Odpowiedź; Cel; Błędy; Kontrakt
- Wiersz 2: GET /v1/session-context; SessionContext; boot aplikacji; 401/403/423; user, tenant, workspace, capabilities, entitlements
- Wiersz 3: POST /v1/invitations/{token}/accept; MembershipView; akceptacja zaproszenia; 409/410/422; idempotencyKey, audit
- Wiersz 4: GET /v1/workspaces/{id}/overview; CommandCenterView; Centrum Dowodzenia; 403/404/409/503; readiness, lastUpdated, evidence
- Wiersz 5: GET /v1/metrics/{code}; MetricView; KPI/drill-down; 404/409/422; definitionVersion, scope, readiness, limitations
- Wiersz 6: POST /v1/integration-connections; OperationAccepted; connect intent; 403/409/422/503; providerId, scopes, returnUrl, operationId
- Wiersz 7: POST /v1/integration-connections/{id}/reauthorize; OperationAccepted; reconnect; 403/409/422; expectedVersion, operationId
- Wiersz 8: POST /v1/integration-connections/{id}/sync-jobs; OperationAccepted; sync/backfill; 403/409/429; type, range, idempotencyKey
- Wiersz 9: GET /v1/operations/{id}; OperationStatus; status długiego procesu; 403/404; state, progress, resultRef, error, retryAt
- Wiersz 10: GET /v1/datasets/{id}/readiness; ReadinessView; jakość danych; 403/404/503; dimensions, affectedMetrics, nextActions
- Wiersz 11: GET /v1/data-issues; CursorPage<DataIssueView>; lista problemów; 403/422; filters, cursor, stable sort
- Wiersz 12: POST /v1/data-issues/{id}/resolve; DataIssueView; manual resolution; 403/409/422; resolutionType, rationale, expectedVersion
- Wiersz 13: POST /v1/assistant/analyses; Stream/AnalysisAccepted; analiza AI; 403/409/422/429/503; contextRef, question, budgetClass
- Wiersz 14: POST /v1/recommendations/{id}/decisions; DecisionView; decyzja człowieka; 403/409/410/422; result, rationale, evidenceHash
- Wiersz 15: POST /v1/actions/{id}/execute; OperationAccepted; kontrolowane działanie; 403/409/410/422; approvalId, idempotencyKey, reauthToken
- Wiersz 16: GET /v1/audit-events; CursorPage<AuditEventView>; audyt; 403/422; immutable records, restricted filters
- Wiersz 17: GET /v1/subscription/usage; UsageView; billing; 403/503; estimated/final, meterVersion

## 8. Role i uprawnienia

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej. [REKOMENDACJA]

Tabela:
- Wiersz 1: Rola; Widoczność; Akcje; Zakazy; Ekrany; Audyt
- Wiersz 2: Owner; Pełna widoczność workspace; plan, członkowie, integracje, decyzje wysokiego wpływu; nie omija readiness ani audytu; M01-M15; role, billing, integracje, eksport, approvals
- Wiersz 3: Admin; Konfiguracja workspace i integracji; invite, role w zakresie, reconnect, sync; bez ownership/billing bez capability; M01, M03, M10, M11, M13; role, connection, sync
- Wiersz 4: Analyst; Dane, KPI, jakość, insight i AI; analiza, issue, insight, rekomendacja; bez billing i high-impact execution; M04-M12, M15; override, issue, recommendation
- Wiersz 5: Marketing Operator; Kampanie, ruch i decyzje marketingowe; analiza i niskoryzykowne działania; brak role management i danych poza scope; M05, M09, M12, M15; campaign/action approvals
- Wiersz 6: Viewer; Odczyt dozwolonych dashboardów; filtry i opcjonalny eksport; brak mutacji i AI actions; M04-M09, M12 read-only; eksport
- Wiersz 7: Billing Admin; Plan, usage, faktury; płatności i plan; brak danych analitycznych bez roli; M14; payment/plan
- Wiersz 8: Internal Operations; Techniczne statusy tenantów w JIT; diagnoza, reprocess po zatwierdzeniu; brak domyślnego dostępu do treści; M10, M11, M13; JIT/reprocess/support
- Wiersz 9: Auditor/Security; Audit i kontrole; przegląd dowodów; read-only poza audytem; M13/audit; audit export/policy

## 9. Integracje

Catalog nie jest runtime availability.

Connection, sync, data readiness, KPI readiness i operational readiness są oddzielne.

Credential jest tylko reference do Secret Store i nie wraca do UI/logów.

Każdy stream ma checkpoint, retry budget i idempotency.

Awaria providera degraduje lokalny zakres.

Reconnect rewaliduje konto, scopes i ciągłość danych.

Integracja ma runbook oraz dowody bram.

Tabela:
- Wiersz 1: Stan; Znaczenie; UI; Dowód
- Wiersz 2: NOT_CONNECTED; Brak aktywnego connection; Pokaż wymagania i akcję Połącz; brak
- Wiersz 3: CONNECTING; Trwa OAuth/token exchange lub walidacja scope; Nie sugerować gotowości danych; operationId
- Wiersz 4: ACTIVE; Credential ważny i połączenie zweryfikowane; Osobno sync i readiness; connection verified
- Wiersz 5: SYNCING; Trwa initial/incremental sync; Postęp, zakres, checkpoint; job running
- Wiersz 6: LIMITED_ACCESS; Scope lub dane są ograniczone; Wpływ i brakujące uprawnienia; scope diff
- Wiersz 7: REAUTH_REQUIRED; Credential wygasł/cofnięty; Reconnect; oznacz dane historyczne; auth error
- Wiersz 8: ERROR; Błąd providera, schematu lub konfiguracji; Klasa błędu i next action; failed job
- Wiersz 9: DISABLED; Connection wyłączony przez użytkownika/politykę; Brak nowych danych; status historii; manual/policy

## 10. AI i warstwa analityczna

AI otrzymuje tylko dane dostępne użytkownikowi i use case po kontroli policy.

Odpowiedź rozdziela fakty, wnioski, rekomendacje, ograniczenia i dowody.

Brak danych kończy się INSUFFICIENT_DATA.

Evidence pack przechowuje snapshoty, definicje, zakres i hash.

Model, prompt, policy, koszt i walidacja są audytowalne.

Action wymaga approval, rewalidacji targetu i idempotencji.

MVP obejmuje kontekstowego Papa Asystenta, Laboratorium AI i AI Actions; nie obejmuje niekontrolowanej autonomicznej optymalizacji bez approval i audytu.

Tabela:
- Wiersz 1: Stan AI; Warunek; UI
- Wiersz 2: DISABLED; AI wyłączone dla workspace/planu/use case; Wyjaśnij warunek włączenia
- Wiersz 3: INSUFFICIENT_DATA; Brak danych spełniających kontrakt; Nie generuj pewnej odpowiedzi
- Wiersz 4: GENERATING; Trwa retrieval i generowanie; Streaming z anulowaniem
- Wiersz 5: ANSWERED; Odpowiedź powiązana z dowodami; Rozdziel fakty/wnioski/rekomendacje
- Wiersz 6: NEEDS_REVIEW; Rekomendacja/działanie wymaga człowieka; Owner, wpływ, odwracalność, termin
- Wiersz 7: REJECTED; Człowiek odrzucił rekomendację; Zachowaj rationale i audyt
- Wiersz 8: EXPIRED; Zmieniły się dane lub minął termin; Wymuś ponowną analizę
- Wiersz 9: PROVIDER_ERROR; Błąd modelu/gateway; Bezpieczny retry bez utraty kontekstu
- Wiersz 10: BLOCKED_BY_POLICY; Use case, dane lub akcja niedozwolone; Brak obejścia przez prompt

## 11. Storybook i mock data

Fixtures grupują workspace, rolę, capabilities, plan, integration state, readiness i AI state.

Każdy ekran ma pełnoekranowe stories: happy, partial, error, forbidden i expired session.

Mock server symuluje opóźnienia, konflikty i operation status.

Flow story pokazuje sekwencję stanów.

CI waliduje schema fixtures i testy interakcji/a11y.

Dane fixture są syntetyczne.

## 12. Ryzyka techniczne

Tabela:
- Wiersz 1: ID; Ryzyko; Wpływ; Prawdopodobieństwo; Działanie; Priorytet
- Wiersz 2: R-01; MVP jako pełne 15 modułów; Bardzo wysoki; Wysokie; Jeden pion wartości; reszta jako kontrakty/stories; P0
- Wiersz 3: R-02; Niejasne granice Tenant/Workspace; Wysoki; Średnie; Zatwierdzić model tenant/workspace przed bazą danych, routingiem i billingiem; P0
- Wiersz 4: R-03; Autoryzacja przez ukrycie UI; Krytyczny; Średnie; Policy w backendzie + cross-tenant/IDOR tests; P0
- Wiersz 5: R-04; Pojedynczy status integracji; Wysoki; Wysokie; Oddziel connection/sync/data/KPI/ops; P0
- Wiersz 6: R-05; Podwójne liczenie omnichannel; Krytyczny; Wysokie; Source authority, lineage, exact matching; P0
- Wiersz 7: R-06; Brak wersjonowania KPI/reguł; Wysoki; Średnie; Versioned definitions + reprocessing; P0
- Wiersz 8: R-07; Ciężkie joby blokują API; Wysoki; Średnie; Workers/queues, per-tenant limits, backpressure; P0
- Wiersz 9: R-08; Retry powoduje duplikaty/koszty; Wysoki; Średnie; Idempotency, checkpoints, retry budget, DLQ; P0
- Wiersz 10: R-09; AI ma szerszy dostęp niż user; Krytyczny; Średnie; Policy before retrieval + evidence ACL; P0
- Wiersz 11: R-10; AI actions bez rewalidacji; Krytyczny; Niskie/Średnie; Human approval, target hash, allowlist; P0
- Wiersz 12: R-11; Brak partial/stale/invalid; Wysoki; Wysokie; Wspólny status contract + fixtures; P0
- Wiersz 13: R-12; Brak audytu override/decisions; Wysoki; Średnie; Immutable event + rationale + correlation; P0
- Wiersz 14: R-13; Jednoosobowe governance bez bram; Wysoki; Wysokie; Niezależny legal/privacy/security/recovery review; P0
- Wiersz 15: R-14; Metering niezgodny z canonical; Wysoki; Średnie; Meter po dedupe; usage reconciliation; P1
- Wiersz 16: R-15; Zbyt wczesne mikroserwisy; Średni; Średnie; Modularny monolit; ekstrakcja na pomiarach; P1
- Wiersz 17: R-16; Brak restore/recovery tests; Krytyczny; Średnie; Backup/restore evidence, RTO/RPO, runbook; P0
- Wiersz 18: R-17; Fixtures różne od API; Wysoki; Wysokie; Schema-validated fixtures w CI; P1
- Wiersz 19: R-18; Brak minimalizacji PII; Krytyczny; Średnie; Pseudonimizacja, klasy danych, retencja; P0

## 13. Zakres MVP

Tabela:
- Wiersz 1: Etap; Zakres; Uzasadnienie
- Wiersz 2: MVP / płatny pilotaż; Identity/workspace/capabilities; jeden provider; sync; source/normalized/canonical; readiness; ograniczone KPI; Command Center; issue; audit; AI evidence; decyzja; monitoring/support; Kompletny przepływ wartości bez pozornej szerokości.
- Wiersz 3: Etap 2; Kolejne providery, dodatkowe warianty, rynki, regiony i większa skala; Rozszerza pokrycie po potwierdzeniu jakości i kosztu.
- Wiersz 4: Później; Pełny omnichannel, multi-market/currency, enterprise SSO variants, automatyczne actions, modele predykcyjne; Wymaga skali, governance i dowodów.

## Kryterium wyjścia MVP

Każda integracja katalogu MVP przechodzi connect, sync, recovery, reconnect i disconnect.

Każdy dataset wymagany przez funkcje MVP ma source/reference, lineage, canonicalization i readiness.

Każdy KPI udostępniony w modułach MVP jest deterministyczny, wersjonowany i obsługuje no_data/partial/invalid/stale/ready.

Command Center prezentuje KPI, ograniczenia, issue i next action.

AI interpretuje KPI z evidence albo odmawia.

Decyzja człowieka ma rationale i outcome tracking.

Przetestowano isolation, restore, provider failure, retry i audit.

## 14. Decyzje do podjęcia

Tabela:
- Wiersz 1: ID; Temat; Znaczenie; Warianty; Rekomendacja; Blokada
- Wiersz 2: DEC-ARCH-001; Granica Tenant/Workspace; Izolacja, billing, routing, retencja; Tenant jako granica klienta; workspace jako zakres operacyjny; Tenant jako klient i granica izolacji; workspace jako zakres operacyjny; tenantId zawsze, workspaceId dla zasobów workspace; blokuje DB/auth
- Wiersz 3: DEC-ARCH-002; Styl backendu; Koszt i tempo MVP; mikroserwisy; monolit; functions; Modularny monolit + osobne workers/adapter runtime; blokuje repo/CI
- Wiersz 4: DEC-ARCH-003; Provider pilotażowy; Wyznacza canonical model; WooCommerce; BaseLinker; inny; Wybrać przez dane klienta i Gate 3-6; blokuje vertical slice
- Wiersz 5: DEC-ARCH-004; Warstwa analityczna MVP; Koszt i wydajność; Postgres-only; warehouse; lakehouse; Rozdzielić logicznie; fizyczny wybór po wolumenie/testach; blokuje sizing
- Wiersz 6: DEC-ARCH-005; Model autoryzacji; Bezpieczeństwo i skalowanie; RBAC; ABAC; capabilities; Role jako pakiety capabilities + constraints; blokuje API/UI
- Wiersz 7: DEC-ARCH-006; Dostawca identity; MFA/SSO i koszt ops; managed; self-hosted; cloud-native; Spike i ADR; tenant model własny; nie blokuje domeny
- Wiersz 8: DEC-ARCH-007; Live status jobów; UX długich procesów; polling; SSE; WebSocket; Polling baseline, SSE dla postępu; blokuje live contract
- Wiersz 9: DEC-ARCH-008; Retencja source payload; Koszt/audyt/privacy; pełny; selektywny; krótki; Klasy per provider; szyfrowany payloadRef; minimizacja; blokuje storage/DPA
- Wiersz 10: DEC-ARCH-009; Zakres AI MVP; Ryzyko i wartość; chat; KPI interpretation; automation; Interpretacja jednego KPI z evidence; bez execution; blokuje M12
- Wiersz 11: DEC-ARCH-010; RTO/RPO i backup; Brama produkcji; wartości per plan; Zatwierdzić i wykonać restore przed produkcją; blokuje go-live

## 15. Rekomendowana kolejność wdrożenia

Tabela:
- Wiersz 1: Fala; Zakres; Brama; Ownerzy
- Wiersz 2: Fala 0 - decyzje i kontrakty; tenant model, provider, glossary, domain/status/error contracts; Zatwierdzone decyzje P0 i vertical slice; Product + Architecture + Security + Data
- Wiersz 3: Fala 1 - fundament; repo/moduły, CI, identity, membership, policy, audit, observability; Cross-tenant tests, invite/MFA, audit evidence; Backend + Frontend + Security
- Wiersz 4: Fala 2 - integracja i joby; control plane, adapter SDK, secrets, queues, checkpoints, retry/DLQ; Connect/reconnect/sync/recovery E2E; Backend + Integrations + Ops
- Wiersz 5: Fala 3 - data contract; source/normalized/canonical, lineage, dedupe, readiness, reprocess; Jeden dataset przechodzi bramy; Data + Backend
- Wiersz 6: Fala 4 - analityka i UI; metrics, projections, Command Center, drill-down, Storybook; Jeden KPI ready/partial/invalid; Data + FE + BE
- Wiersz 7: Fala 5 - insight i AI; evidence, gateway, assistant, recommendation/decision; AI odmawia bez danych i cytuje evidence; AI + Data + Security + FE
- Wiersz 8: Fala 6 - komercja i ops; usage, limits, support views, runbooks, SLO/alerts; Reconciled metering i operacyjna diagnoza; BE + Ops + Product
- Wiersz 9: Fala 7 - hardening/pilot; security review, restore, performance, provider failure, legal/privacy; Go/no-go evidence dla pilotażu; Wszyscy + niezależni reviewerzy

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
