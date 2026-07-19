# Architektura systemu i modułów

PAPADATA

Architektura systemu i modułów

Logiczna topologia aplikacji, danych, jobów i zależności

Tabela:
- Wiersz 1: Kod dokumentu; A03
- Wiersz 2: Wersja; 2.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zdefiniować współpracę web, API, domen, integracji, danych, analityki, AI i operacji. [FAKT/ZAKRES]

Zakres: Moduły, przepływy, granice wdrożeniowe, asynchroniczność, observability i skalowanie. [FAKT/ZAKRES]

Poza zakresem: Finalny sizing, regiony produkcyjne i kosztorys. Dostawcą docelowym jest Google Cloud Platform zgodnie z DEC-ARCH-CLOUD-001. [OGRANICZENIE]

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

## Architektura referencyjna

[Web SPA]
|
[BFF/Public API] ---> [Identity + Policy] ---> [Audit]
|
+--> [Application Domains] ---> [Operational DB + Outbox]
|
+--> [Job Orchestrator / Queue] ---> [Workers / Adapter Runtime] ---> External Providers
|
[Source/Object Storage]
|
[Normalize -> Canonical -> Quality]
|
[Metric Snapshots / Projections]
+--> [AI Gateway + Evidence]
+--> [Command Center / Reports]

Rekomendacja: Spójne repo/monorepo; osobne procesy web, API, workers i migrate. Adaptery mają oddzielne kolejki, limity i konfigurację. [REKOMENDACJA]

Tabela:
- Wiersz 1: Kod; Moduł; Odpowiedzialność; UI; Kontrakty; Zależności; Stany; Etap
- Wiersz 2: MOD-01; Web Application; Powłoka, ekrany i stan lokalny UI; M01-M15; DTO, komendy, operation status; API/BFF, Identity; loading/partial/blocked/error; MVP
- Wiersz 3: MOD-02; BFF / Public API; Stabilny kontrakt i agregacja widoków; wszystkie; REST/JSON + polling/SSE; Application, Policy; 401/403/409/422/503; MVP
- Wiersz 4: MOD-03; Identity & Tenant; Sesje, membership, capability i kontekst; M01, M03, M13; auth, memberships, invitations; IdP, Audit; reauth/suspended/wrong tenant; MVP
- Wiersz 5: MOD-04; Integration Control Plane; Provider catalog i connection lifecycle; M10, M01; connect/reconnect/disconnect; Adapter, Secret Store; reauth/limited/error; MVP
- Wiersz 6: MOD-05; Adapter Runtime; Izolacja specyfiki providerów; M10; anti-corruption clients; Queue, Object Storage; rate limit/schema drift; MVP: zatwierdzony katalog adapterów
- Wiersz 7: MOD-06; Job Orchestrator & Workers; Sync, backfill, reprocess i eksport; M10, M11, M14; job, progress, retry, DLQ; Queue, DB, Storage; retry/failed/partial; MVP
- Wiersz 8: MOD-07; Data Platform; Source, normalized, canonical i lineage; M05-M11; ingestion/canonical contracts; Workers, Quality; conflict/duplicate/invalid; MVP
- Wiersz 9: MOD-08; Quality & Readiness Engine; Reguły jakości i bramy KPI; M11, M04; assess, issue, readiness; Data, Metrics; no_data/partial/invalid/stale; MVP
- Wiersz 10: MOD-09; Metrics & Query Service; Metryki i projekcje dashboardów; M04-M09; metric queries/snapshots; Canonical Data, Cache; calculating/stale/version changed; MVP
- Wiersz 11: MOD-10; Insight & Decision Service; Insight, rekomendacje, decyzje i outcome; M04, M12, M15; create/review/decide/measure; Metrics, AI, Audit; expired/data changed/no owner; MVP
- Wiersz 12: MOD-11; AI Gateway; Policy, retrieval, koszt, evidence i modele; M12; generate/stream/approve proposal; Metrics, Policy, Models; insufficient/provider error/blocked; MVP pełny funkcjonalnie, ograniczony providerowo
- Wiersz 13: MOD-12; Billing & Usage; Entitlements, usage i status płatności; M14; usage/subscription; Policy, billing provider; past_due/limit reached; MVP pełny w zatwierdzonym wariancie
- Wiersz 14: MOD-13; Audit & Operations; Ślad, monitoring, support i incydenty; M03, M10-M15; audit search, alerts, runbook hooks; wszystkie; incident/audit unavailable; MVP

## Synchroniczność i asynchroniczność

Tabela:
- Wiersz 1: Typ; Przykłady; Zasada; Odpowiedź; Recovery
- Wiersz 2: Sync read; context, dashboard, metric; policy przed query; 200/4xx/503; jawny stale cache
- Wiersz 3: Sync command; invite, settings, decision; transakcja + outbox; result lub 202; idempotency/version
- Wiersz 4: Async job; sync, backfill, export, action; queue + checkpoint; 202 operationId; retry/DLQ/replay
- Wiersz 5: Domain event; readiness, metric published; po commit przez outbox; at-least-once; idempotent consumer
- Wiersz 6: AI stream; contextual analysis; policy/retrieval przed model; SSE + final state; cancel/fallback policy

## Skalowanie i izolacja

API i workers mają niezależne limity; backfill nie blokuje auth/dashboardu.

Kolejki są rozdzielone na interactive, sync, reprocess/export i AI/action.

Concurrency jest ograniczone per provider, tenant i workspace.

Ciężkie operacje nie działają w request thread.

Cache nie jest source of truth; key zawiera workspace, scope i wersję.

Mikroserwis jest wydzielany dopiero przez pomiary, izolację ryzyka lub ownership zespołu.

## Obserwowalność

Tabela:
- Wiersz 1: Warstwa; Logi; Metryki; Trace; Alert
- Wiersz 2: API; request/correlation/policy; latency/errors/saturation; BFF->domain->DB; SLO/5xx/auth anomaly
- Wiersz 3: Integracje; provider/job/attempt/sanitized error; success/lag/rate limit/retry; job->adapter->provider; sync lag/auth
- Wiersz 4: Dane; batch/rule/schema/counts; freshness/completeness/conflicts; source->metric; readiness regression
- Wiersz 5: AI; policy/model/prompt/evidence hashes; latency/refusal/cost; retrieval->model; cost/leakage signal
- Wiersz 6: Security; auth/privilege/export/JIT; failed auth/denies; audit correlation; critical incident

## Kryteria ekstrakcji mikroserwisu

Niezależne skalowanie potwierdzone pomiarami.

Awaria wymaga izolacji od core API.

Zespół ma pełną własność operacyjną.

Dane i transakcje mają stabilną granicę.

Koszt sieci, deploymentu i observability jest uzasadniony.

Istnieje plan migracji danych i kompatybilności.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
