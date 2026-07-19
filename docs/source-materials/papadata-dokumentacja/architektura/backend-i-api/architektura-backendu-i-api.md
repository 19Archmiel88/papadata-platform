# Architektura backendu i API

PAPADATA

Architektura backendu i API

Moduły domenowe, komendy, zapytania, joby i kontrakty

Tabela:
- Wiersz 1: Kod dokumentu; A05
- Wiersz 2: Wersja; 2.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Określić backend jako właściciela procesów, policy, integralności komend i audytu. [FAKT/ZAKRES]

Zakres: Warstwy, API/BFF, outbox, async operations, błędy, wersjonowanie i idempotencja. [FAKT/ZAKRES]

Poza zakresem: Finalne OpenAPI i implementacja frameworkowa. [OGRANICZENIE]

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

## Warstwy backendu

Tabela:
- Wiersz 1: Warstwa; Odpowiedzialność; Nie może
- Wiersz 2: Transport/BFF; auth context, validation, DTO, rate limit; zawierać core rules
- Wiersz 3: Application; orchestracja use case, transaction, policy; znać layout UI/provider payload
- Wiersz 4: Domain; inwarianty, state transitions; zależeć od frameworka/chmury
- Wiersz 5: Infrastructure; DB, queue, secrets, external clients; przeciekać typami vendorów
- Wiersz 6: Projection; read models dla ekranów; być write source of truth
- Wiersz 7: Worker; job, checkpoint, progress; obchodzić policy/audit

## Kontrakty API

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

## Standard odpowiedzi

{ "data": {...}, "meta": { "correlationId":"...", "workspaceId":"...", "contractVersion":"v1", "readiness":{...}, "limitations":[] } }

{ "error": { "code":"DATA_NOT_READY", "message":"Dane nie spełniają warunków KPI.", "fieldErrors":[], "impact":"KPI pozostaje zablokowany.", "nextActions":[...], "retryable":false, "correlationId":"..." } }

## Idempotencja i concurrency

POST uruchamiający job/action wymaga Idempotency-Key i fingerprintu komendy.

Mutacje konfiguracji używają expectedVersion/ETag.

Consumer przechowuje processed event id lub naturalny klucz.

Retry nie zwiększa usage i nie duplikuje operacji zewnętrznej.

Manual replay z DLQ wymaga capability, reason i audytu.

## Transactional outbox

Komenda zapisuje write model i event outbox w jednej transakcji.

Publisher publikuje event co najmniej raz.

Consumer jest idempotentny i aktualizuje projekcję lub etap.

Stan publikacji i próby są obserwowalne.

Event nie zawiera sekretów ani zbędnych danych osobowych.

## Model jobu

Tabela:
- Wiersz 1: Pole; Znaczenie
- Wiersz 2: jobId/operationId; stabilny identyfikator procesu
- Wiersz 3: tenantId/workspaceId; obowiązkowy scope
- Wiersz 4: type/version; typ i wersja kontraktu
- Wiersz 5: inputRef; odwołanie; minimalny queue payload
- Wiersz 6: status; QUEUED/RUNNING/RETRY_WAIT/SUCCEEDED/PARTIAL/FAILED/CANCELLED/DLQ
- Wiersz 7: attempt/maxAttempts; retry budget
- Wiersz 8: checkpoint/progress; wznowienie i UI
- Wiersz 9: errorClass/retryable; decyzja retry
- Wiersz 10: correlation/causation; trace/audit
- Wiersz 11: resultRef; odwołanie do wyniku

## Walidacje komendy

Sesja i auth strength.

Tenant/workspace membership i status.

Capability, data scope i entitlement.

Stan zasobu i wersja.

Readiness/policy dla data/AI.

Reauth/secondary approval dla high impact.

Audit before/after i correlationId.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
