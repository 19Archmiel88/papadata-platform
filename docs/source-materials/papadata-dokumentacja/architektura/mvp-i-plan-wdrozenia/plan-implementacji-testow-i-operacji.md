# Plan implementacji testów i operacji

PAPADATA

Plan implementacji, testów i operacji

Kolejność prac, bramy jakości, CI/CD, obserwowalność i go-live

Tabela:
- Wiersz 1: Kod dokumentu; A15
- Wiersz 2: Wersja; 2.0
- Wiersz 3: Status; Finalny pakiet architektoniczny
- Wiersz 4: Data obowiązywania; 18 lipca 2026
- Wiersz 5: Właściciel produktu; Artur Wiśniewski
- Wiersz 6: Charakter; Architektura docelowa i plan realizacji; treść nie jest dowodem implementacji

Poufność: dokument projektowy. Wymaga zatwierdzenia decyzji i dowodów przed go-live.

## Metryka i sposób stosowania

Cel: Zorganizować realizację w kolejności redukującej ryzyko domenowe, danych i bezpieczeństwa. [FAKT/ZAKRES]

Zakres: Fale, workstreamy, DoD, testy, CI/CD, environments, monitoring, runbooki i release evidence. [FAKT/ZAKRES]

Poza zakresem: Harmonogram kalendarzowy i konkretne osoby. [OGRANICZENIE]

Zasada interpretacji: Dokument opisuje stan docelowy i rekomendowany plan. Nie potwierdza istnienia kodu, infrastruktury, kontroli ani gotowości produkcyjnej. [FAKT]

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Google Cloud Platform jest docelową platformą infrastrukturalną PapaData. Architektura może korzystać z każdej usługi GCP zatwierdzonej w katalogu usług i uzasadnionej wymaganiami produktu, bezpieczeństwa, operacji lub kosztu; nie oznacza to obowiązku wdrażania wszystkich usług GCP. Referencyjne mapowanie obejmuje Cloud Run dla API, BFF, workerów i jobów, Cloud SQL for PostgreSQL, Memorystore for Redis, Pub/Sub i Cloud Tasks, Cloud Storage, Secret Manager, Cloud Scheduler, Artifact Registry, Cloud Build, IAM, Cloud KMS, Cloud Logging, Monitoring i Trace oraz komponenty sieciowe i ochronne odpowiednie do ryzyka.

Środowiska Local, CI, Development i Staging odtwarzają produkcyjne kontrakty, wersje, granice procesów i przepływy danych w maksymalnym praktycznym zakresie. Lokalny development wykorzystuje Docker Compose oraz kontenery API, BFF, workerów i migracji, PostgreSQL w tej samej głównej wersji co Cloud SQL, Redis, emulator lub adapter kolejek, emulator GCS albo MinIO za interfejsem storage, lokalny scheduler, OpenTelemetry Collector oraz sandboxy lub mocki providerów. Te same migracje, obrazy, schematy API i kontrakty zdarzeń obowiązują w Local, CI i GCP. Bruno jest wersjonowanym narzędziem testowania i dokumentowania API, a nie usługą infrastrukturalną.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

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

## Fale wdrożenia

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

## Workstreamy

Tabela:
- Wiersz 1: Workstream; Artefakty; Zależności
- Wiersz 2: Product/Architecture; decisions, ADR, glossary, acceptance; wszystkie
- Wiersz 3: Frontend; shell, patterns, screens, Storybook, a11y; contracts/fixtures
- Wiersz 4: Backend; API, domains, policy, outbox, jobs; tenant model
- Wiersz 5: Integrations; adapter SDK, provider, connect/sync; secrets/queue/data
- Wiersz 6: Data; source/canonical, quality, metrics, reprocess; provider/definitions
- Wiersz 7: AI; gateway, evidence, output, evals; ready metrics/policy
- Wiersz 8: Security/Privacy; threat, controls, tests, inventory; architecture/providers
- Wiersz 9: Operations; monitoring, alerts, runbooks, restore; runtime
- Wiersz 10: Commercial; entitlements, usage, pilot success; canonical meter

## Definition of Done

Cel biznesowy, owner i measurable outcome.

API/schema oraz fixture.

Capabilities i deny tests.

Loading/empty/partial/error/forbidden/success.

Audit i observability.

Unit/contract/integration/E2E wg ryzyka.

Runbook/update.

Security/privacy review dla new data/action.

ADR dla zmiany granicy/technologii.

Deployment evidence i rollback.

## Strategia testów

Tabela:
- Wiersz 1: Typ; Zakres; Przykład; Brama
- Wiersz 2: Unit/domain; invariants/transform; states/formula; PR
- Wiersz 3: Contract; API/event/provider; schema/fixtures; PR
- Wiersz 4: Integration; DB/queue/secret/storage; outbox/checkpoint/retry; PR/nightly
- Wiersz 5: Data quality; vectors/reconciliation; dedupe/missing/currency; rule change
- Wiersz 6: Authorization; RBAC/tenant; IDOR/AI retrieval; release
- Wiersz 7: E2E; vertical slice; invite->connect->KPI->decision; release
- Wiersz 8: Performance; API/jobs/query; backfill isolation; pilot
- Wiersz 9: Resilience; provider/queue/DB failure; retry/DLQ/degraded; go-live
- Wiersz 10: Security; SAST/DAST/deps/pentest; secrets/tenant/supply; release
- Wiersz 11: AI eval; safety/faithfulness/cost; refusal/evidence/injection; model change
- Wiersz 12: Recovery; backup/restore/reprocess; PITR/source replay; go-live/cyclic

## CI/CD pipeline

Format/lint/type/unit.

Validate API/event schemas i fixtures.

Dependency/secret/SAST/container scans.

Reproducible build, SBOM i signature.

Integration tests z ephemeral dependencies.

Migration check i backward compatibility.

Deploy test + smoke/contract/E2E.

Approval/evidence gate dla production.

Canary/monitoring/rollback.

Post-deploy auth/tenant/connection/job/metric/audit.

## Środowiska i dane

Tabela:
- Wiersz 1: Środowisko; Dane; Cel; Ograniczenie
- Wiersz 2: Local; synthetic fixtures + provider sandboxes + contract fixtures; development na Docker Compose z parzystością kontraktów GCP; no real secrets; Postgres/Redis/queue/storage/OTel lokalnie
- Wiersz 3: CI; ephemeral containers and synthetic data; automation, migrations, Bruno, contract and integration tests; short retention
- Wiersz 4: Dev shared; synthetic/sandbox; team integration; no customer data
- Wiersz 5: Staging; anonymized/synthetic representative; release verification; prod-like controls, images, migrations and GCP contracts
- Wiersz 6: Pilot/Prod; approved customer scope; commercial value; full security/privacy/ops gates

## Runbooki przed pilotem

Login/MFA/recovery failure.

Provider outage/rate/schema/reauth.

Sync stuck/retry storm/DLQ/replay.

Bad canonical/KPI/reprocess.

Cross-tenant/security incident.

AI provider/cost/policy violation.

Backup restore/data loss.

Billing/usage discrepancy.

Workspace lifecycle.

## Go-live checklist

Decyzje P0 zatwierdzone.

Brak critical risks bez acceptance.

Evidence tenant/auth/audit/restore/incident.

Provider success/failure/reconnect.

KPI vectors i reconciliation.

Storybook/E2E ready/partial/invalid/forbidden.

AI eval i kill switch.

Monitoring/alerts/support/communication.

Rollback i disable integration/AI.

Pilot scope/success/exit podpisane.

## Kryteria gotowości dokumentu

Nazwy domen, encji, statusów i ról są spójne z całym pakietem.

Każdy proces krytyczny ma dane, błędy, koniec i audyt.

Rekomendacje nie są przedstawione jako zatwierdzone fakty.

Elementy MVP mają mierzalny rezultat i ścieżkę błędu.

Luki i blokery posiadają właściciela decyzji.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
