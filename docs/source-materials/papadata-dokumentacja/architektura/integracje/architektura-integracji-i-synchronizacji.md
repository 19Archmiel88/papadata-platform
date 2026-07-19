# Architektura integracji i synchronizacji

PAPADATA

Architektura integracji i synchronizacji

Connect, scope, sync, backfill, retry, recovery i gotowość

Tabela:
- Wiersz 1: Kod dokumentu; A08
- Wiersz 2: Wersja; 2.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zaprojektować bezpieczny i mierzalny cykl życia integracji. [FAKT/ZAKRES]

Zakres: Provider catalog, adapter contract, credential lifecycle, sync, webhook, status, retry, reprocess i runbook. [FAKT/ZAKRES]

Poza zakresem: Szczegółowe endpointy providerów i sekrety. [OGRANICZENIE]

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

## Wymiary gotowości

Tabela:
- Wiersz 1: Wymiar; Wartości; Dowód
- Wiersz 2: catalogStatus; identified/catalogued/retired; rekord katalogu
- Wiersz 3: adapterStatus; planned/implemented/verified; contract tests
- Wiersz 4: environmentStatus; not_configured/configured/verified; config/secret test
- Wiersz 5: runtimeAvailability; disabled/pilot/available; feature/policy
- Wiersz 6: connectionStatus; not_connected/active/limited/reauth/error; credential/scope validation
- Wiersz 7: syncStatus; idle/queued/running/retry/failed; SyncJob/checkpoint
- Wiersz 8: dataReadiness; no_data/partial/invalid/ready; Assessment
- Wiersz 9: kpiReadiness; unavailable/partial/ready/stale; MetricSnapshot
- Wiersz 10: operationalReadiness; not_ready/pilot_ready/production_verified; monitoring/runbook/recovery

## Status użytkownika

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

## Kontrakt adaptera

Tabela:
- Wiersz 1: Obszar; Wymaganie
- Wiersz 2: Identity; providerId, externalAccountRef, connectionId
- Wiersz 3: Authorization; start/complete auth, scope inspection, rotation/revoke
- Wiersz 4: Discovery; accounts/stores/channels
- Wiersz 5: Streams; jawna lista i schema/contract version
- Wiersz 6: Fetch; cursor/watermark, bounded page, rate metadata
- Wiersz 7: Webhooks; signature, timestamp, event dedupe
- Wiersz 8: Errors; auth/rate_limit/transient/schema/permission/not_found
- Wiersz 9: Observability; sanitized logs, metrics, correlation/job
- Wiersz 10: Data; raw payloadRef + metadata; bez KPI mapping
- Wiersz 11: Testing; contract fixtures, sandbox/replay, failure injection

## Algorytm synchronizacji

Walidacja connection, scopes, runtime i tenant limits.

Utworzenie SyncJob z idempotency, type i range.

Rezerwacja concurrency slot per provider/tenant.

Fetch page z checkpointem i retry budget.

Zapis source przed przesunięciem checkpointu.

Publikacja progress i trigger kolejnego etapu.

PARTIAL_SUCCESS, jeśli część streamów jest użyteczna.

Auth -> REAUTH; rate limit -> RETRY_WAIT; schema -> DataIssue/BLOCKED.

Recovery z ostatniego potwierdzonego checkpointu.

## Retry matrix

Tabela:
- Wiersz 1: Klasa; Retry; Stan; Akcja usera
- Wiersz 2: AUTH/REVOKED; nie auto; REAUTH_REQUIRED; Reconnect
- Wiersz 3: RATE_LIMIT; retryAfter+jitter; RETRY_WAIT; informacja
- Wiersz 4: TRANSIENT/TIMEOUT; ograniczony budget; RETRY_WAIT; monitoring
- Wiersz 5: SCHEMA_MISMATCH; nie do fix; FAILED/BLOCKED; support/data issue
- Wiersz 6: PERMISSION/SCOPE; nie; LIMITED_ACCESS; scope/reconnect
- Wiersz 7: VALIDATION_DATA; quarantine wg reguły; PARTIAL/INVALID; review issue
- Wiersz 8: BUG/INVARIANT; nie agresywnie; FAILED/DLQ; incident

## Runbook minimalny

Rozpoznanie auth failure, rate limit, outage, schema drift i duplicate storm.

Lokalne wyłączenie scheduling connection/provider.

Reconnect bez utraty historii.

Bezpieczny replay/reprocess z idempotencją.

Ocena wpływu na dataset/KPI/UI/AI.

Komunikacja zakresu i next step.

Post-incident evidence i prevention.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
