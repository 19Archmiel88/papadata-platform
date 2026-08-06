# Raport porównawczy backendów PapaData

**Data analizy:** 6 sierpnia 2026
**Priorytet:** obecny projekt `PapaData-Project-Current-State-20260806-040340`
**Projekt porównawczy:** `papadata-main`

## 1. Werdykt

### Werdykt główny

- **`papadata-main` jest obecnie bardziej dojrzały merytorycznie i funkcjonalnie.** Ma znacznie szerszy, rzeczywiście podłączony zakres domen biznesowych, więcej endpointów, bogatszy model danych, więcej testów oraz pięć rozbudowanych adapterów integracyjnych.
- **Obecny projekt ma lepszą architekturę docelową i mocniejszy hardening platformowy.** Wygrywa separacją BFF/API/worker, granicami pakietów, restrykcyjnym TypeScriptem, trwałym pipeline’em ingestion, kontrolą zakresu wydania, supply-chain security, podpisywaniem obrazów i jawnie ograniczonym release contract.
- **Obecny projekt powinien pozostać jedyną bazą rozwojową.** `papadata-main` należy traktować jako repozytorium-dawcę sprawdzonych domen, algorytmów, adapterów, testów i wzorców infrastruktury. Nie należy wykonywać pełnego merge ani kopiować starej architektury wprost.
- **Żadna paczka nie realizuje jeszcze docelowych 7/7 integracji.** Obecny projekt ma 3 adaptery, `papadata-main` ma 5. Łącznie kod obu paczek pokrywa 6 unikalnych providerów; **Allegro nadal wymaga nowej implementacji**.

### Ocena porównawcza

| Obszar | Obecny projekt | `papadata-main` | Wniosek |
|---|---:|---:|---|
| Dojrzałość merytoryczna produktu | 45/100 | 84/100 | Wyraźna przewaga starego backendu |
| Architektura docelowa i izolacja usług | 86/100 | 67/100 | Wyraźna przewaga obecnego projektu |
| Realna kompletność implementacji | 42/100 | 82/100 | Wyraźna przewaga starego backendu |
| Security i supply-chain hardening | 88/100 | 76/100 | Przewaga obecnego projektu |
| Testy i dowody wykonania | 63/100 | 86/100 | Przewaga starego backendu |
| CI/CD i infrastruktura | 82/100 | 87/100 | Stary projekt jest szerszy; obecny bezpieczniejszy w release supply chain |
| Utrzymywalność architektury | 82/100 | 58/100 | Przewaga obecnego projektu |
| Dokumentacja zgodna z runtime | 68/100 | 85/100 | Stary projekt ma lepsze automatyczne pokrycie route/docs; obecny ma uczciwszy ograniczony release scope |

> Punktacja ma charakter porównawczy. Nie jest certyfikacją produkcyjną ani wynikiem testu penetracyjnego.

## 2. Zakres i metodologia

Analizowano dwa dostarczone archiwa:

| Paczka | SHA256 | Stan |
|---|---|---|
| `PapaData-Project-Current-State-20260806-040340.zip` | `15f4ee467a6e56e968fd0dd1826741c80a1bda040f73ffd8895ec5cf5455f330` | Integralność zgodna z dostarczonym plikiem `.sha256`; branch `backend/remediation-aud-001-030-20260806-032801`; HEAD `ff6854e001ef61b8745c8f2db61f44618464f6c8`; zawiera niecommitowany worktree |
| `papadata-main.zip` | `64c20d1a854e3abeef82f4a03da8da1e5b9f251a31ad4365fc2c1f9a145439a4` | Archiwum poprawne; bez dołączonego metadokumentu Git/SHA źródłowego |

Wykonano:

1. kontrolę integralności obu ZIP-ów;
2. inwentaryzację kodu backendowego, testów, migracji, endpointów, dokumentacji i infrastruktury;
3. analizę entrypointów produkcyjnych, modułów, adapterów i pipeline’ów;
4. uruchomienie natywnych walidatorów niewymagających instalacji zależności:
   - obecny projekt: `BACKEND_RELEASE_SCOPE=PASS`, 26 operacji;
   - obecny projekt: `BACKEND_SECURITY_CONTROLS=PASS`, 30 kontroli, 21 oczekujących odbiorów środowiskowych;
   - `papadata-main`: OpenAPI route coverage `262/262 PASS`;
   - `papadata-main`: provider readiness `PASS` dla 44 pozycji katalogowych;
   - `papadata-main`: docs check `PASS`.

Nie wykonywano pełnego deployu chmurowego ani testów z prawdziwymi credentialami providerów. Raport odróżnia implementację repozytoryjną od potwierdzenia na staging/production.

## 3. Kluczowe metryki

| Metryka backendowa | Obecny projekt | `papadata-main` |
|---|---:|---:|
| Pliki kodu backend/infrastruktura | 190 | 506 |
| Linie kodu backend/infrastruktura | 36 368 | 148 630 |
| Produkcyjne kontrolery API | 9 | 38 |
| Produkcyjne endpointy/dekoratory HTTP | 26 | 259 |
| Operacje w kontrakcie OpenAPI | 212 docelowych, ale release deklaruje tylko 26 | 262, route coverage 262/262 |
| Pliki testowe backendu | 21 | 92 |
| Przybliżona liczba asercji | 456 | 2 325 |
| Migracje | 13 SQL | 54 Prisma/SQL |
| Tabele/model domenowy | 85 `CREATE TABLE` | 79 modeli Prisma |
| `ENABLE ROW LEVEL SECURITY` | 19 | 63 |
| `FORCE ROW LEVEL SECURITY` | 2 | 60 |
| Polityki RLS | 7 | 87 |
| Adaptery runtime | 3 | 5 |
| Linie kodu adapterów | 289 | 2 555 |
| Zasoby Terraform | 34 | 66 |
| Workflow GitHub Actions | 4 / 8 jobów | 1 / 2 rozbudowane joby |
| Pliki dokumentacji | 473 | 85 |
| Linie Markdown | 31 915 | 16 950 |

Sama liczba dokumentów w obecnym projekcie nie oznacza większej kompletności runtime. Znaczna część opisuje kontrakt docelowy, podczas gdy produkcyjny manifest wydania ogranicza runtime do 26 operacji.

## 4. Co faktycznie ma obecny projekt

### 4.1. Mocne strony obecnego projektu

#### Architektura i granice usług

- osobny **BFF**, API i worker;
- wydzielone pakiety `database`, `integrations`, `storage`, `ai-runtime`, `contracts`, `testing`;
- Fastify po stronie API i BFF;
- globalny restrykcyjny TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`);
- jawne produkcyjne entrypointy zamiast uruchamiania lokalnych harnessów w produkcji.

#### Bezpieczeństwo aplikacyjne

- BFF jako granica sesji i proxy;
- podpisywane cookies, CSRF i kontrola Origin;
- Redis TLS/ACL, reconnect i timeout policy;
- Cloud Run identity pomiędzy BFF i API;
- globalne guardy auth/capability;
- MFA TOTP, step-up oraz tokeny zaproszeń;
- jawne DTO runtime i `forbidNonWhitelisted`;
- request context, korelacja i ujednolicony filtr błędów;
- command execution interceptor z audytem/idempotency foundation;
- rozdzielenie ról bazy: runtime, platform, migrator, test.

#### Worker i ingestion

- trwała maszyna stanów joba;
- lease acquisition i heartbeat/renewal;
- checkpointy;
- zapis source batch/source records przed normalizacją;
- osobne fazy normalization, canonical write i reconciliation;
- cancel, retryable/terminal failure oraz dead-letter;
- ochrona przed false-green sukcesem przez reconciliation.

To jest **lepszy fundament wykonawczy** niż stary connector runtime i powinien zostać zachowany.

#### Supply chain i release engineering

- akcje GitHub przypięte do SHA;
- CodeQL;
- Trivy secret/vulnerability/container scanning;
- CycloneDX SBOM;
- skan licencji;
- obrazy bazowe przypięte digestem;
- obrazy runtime bez package managerów i uruchamiane jako non-root;
- keyless Cosign signing i attestacja SBOM;
- jawny release manifest oraz maszynowy security-control matrix.

### 4.2. Faktyczny zakres obecnego runtime

Produkcja udostępnia obecnie 26 operacji, głównie:

- health, startup, readiness i metrics;
- katalog providerów, connections i jobs;
- start sync/backfill, retry i cancel;
- ograniczone reports;
- ograniczone privacy requests;
- MFA, step-up, invitation token;
- weryfikację łańcucha audytu.

Nie jest to pełny backend produktu opisany przez 212-operacyjny kontrakt docelowy. Manifest sam poprawnie deklaruje `targetReleaseClaimed: false`.

### 4.3. Obecne ograniczenia

- tylko **3/7 adapterów**;
- webhooki są globalnie `blocked`;
- reports są `limited`;
- privacy/DSAR jest `limited_and_blocked`;
- AI jest ograniczone i bez skutków ubocznych;
- część scheduler/platform jobs nadal wymaga dowodu bazodanowego lub środowiskowego;
- 21 z 30 kontroli ma status wymagający CI, bazy, live lub external acceptance;
- Terraform nie zawiera jeszcze zasobów alertingu/monitoringu porównywalnych ze starym projektem;
- szerokie klasy `InMemory*` i sandbox cores nie są podłączone do produkcyjnego `ProductionAppModule`;
- worktree jest niecommitowany, więc nie jest stabilnym artefaktem release;
- dokumentacja docelowa nadal jest szersza niż produkcyjny runtime.

## 5. Co faktycznie ma `papadata-main`

### 5.1. Przewaga merytoryczna i biznesowa

`papadata-main` posiada rzeczywiste kontrolery/usługi dla znacznie większej części produktu:

- auth i registration;
- onboarding i GUS/company verification;
- workspaces, tenancy, role, team i invitations;
- billing, Stripe, VAT/reverse charge i KSeF readiness;
- integrations, OAuth/direct connect, status i webhooks;
- dashboard, command center, metrics i analytics;
- ads i commerce metrics;
- alerts i notifications;
- tasks i sync orchestrator;
- reports i exports;
- data quality;
- targets i annotations;
- search;
- settings;
- DSAR;
- AI assistant, observations, recommendations, scheduled analysis i tool registry;
- assistant library i execution ledger.

Kod jest podłączony do jednego produkcyjnego Nest `AppModule`, a nie tylko opisany w specyfikacji.

### 5.2. Dane i persistence

- 54 migracje;
- 79 modeli Prisma i 36 enumów;
- 63 aktywacje RLS;
- 60 `FORCE ROW LEVEL SECURITY`;
- 87 polityk RLS;
- dedykowane testy tenant isolation i DB AccessGuard;
- rozbudowany schemat obejmujący domeny produktu, billing, AI, dashboard, integracje i assistant artifacts.

Stary projekt ma obecnie pełniejszy model danych i wyraźnie szerszą egzekucję RLS. Obecny projekt ma lepszy podział ról i repozytoria produkcyjne, ale nie dorównał jeszcze pokryciem domenowym.

### 5.3. Integracje w `papadata-main`

Za `production_ready` uznano pięć adapterów:

1. WooCommerce;
2. BaseLinker;
3. Google Ads;
4. Meta Ads;
5. Google Analytics 4.

Adaptery mają znacznie większą głębokość implementacji niż obecne wersje:

- provider-specific credential parsing;
- pagination;
- backfill i incremental sync;
- token refresh dla Google;
- normalizację orders/products/ads/analytics;
- zapis raw ingest i danych kanonicznych;
- tenant context;
- source identifiers, promocje, koszty, zasięg i metryki;
- provider-specific testy.

Katalog zawiera 44 providerów, ale tylko pięć jest runtime-ready. Pozostałe są poprawnie blokowane.

### 5.4. Testy, kontrakty i dokumentacja

- 92 pliki testowe;
- około 2 325 asercji;
- OpenAPI obejmuje 262 operacje;
- natywny checker potwierdził 262/262 tras kontrolerów w OpenAPI;
- provider readiness checker przechodzi dla 44 providerów;
- dokumentacja posiada automatyczne inventory dla CSRF, RBAC, audytu i tenant data;
- root gates uruchamiają testy domenowe, integracyjne, kontraktowe, compliance i staging smoke.

### 5.5. Infrastruktura

`papadata-main` ma szersze IaC:

- Cloud Run API, worker, web i migration job;
- Cloud SQL, Redis, Cloud Tasks, storage i BigQuery;
- Secret Manager i rozdzielone service accounts;
- Cloud Armor;
- stable/candidate edge routing;
- monitoring, alert policies, uptime checks i budget;
- oddzielne środowiska staging/production;
- Terraform module tests;
- CI z realnym PostgreSQL i Redis.

### 5.6. Słabości `papadata-main`

- brak osobnego BFF;
- bardziej monolityczny API i płaski `AppModule`;
- silne sprzężenie domen z Prisma i jednym procesem API;
- bardzo duże pliki, np. `dashboard.service.ts` około 9 380 linii;
- część kontrolerów/usług przekracza 1 000–3 000 linii;
- tylko `strictNullChecks`, bez globalnego pełnego `strict` porównywalnego z obecnym projektem;
- brak wydzielonych pakietów database/integrations/storage/AI;
- workflow używa wersji akcji zamiast przypiętych SHA;
- brak podpisywania obrazów i attestacji SBOM na poziomie obecnego projektu;
- katalog providerów jest ogromny, ale 39/44 pozycji jest wyłączonych;
- część obszarów dokumentacja sama klasyfikuje jako `partial` lub wymagające live/legal evidence;
- brak Shopify i Allegro jako działających adapterów.

## 6. Porównanie siedmiu wymaganych integracji

| Provider | Obecny projekt | `papadata-main` | Docelowe działanie |
|---|---|---|---|
| Shopify | Adapter istnieje | Brak adaptera | Zachować obecny i rozbudować conformance suite |
| BaseLinker | Adapter istnieje, prostszy | Rozbudowany adapter | Przenieść logikę starego adaptera do obecnego kontraktu |
| GA4 | Adapter istnieje, prostszy | Rozbudowany adapter | Przenieść normalizację i token lifecycle do obecnego kontraktu |
| WooCommerce | `targetOnly` | Rozbudowany adapter | Port do obecnego pipeline’u |
| Google Ads | `targetOnly` | Rozbudowany adapter | Port do obecnego pipeline’u |
| Meta Ads | `targetOnly` | Rozbudowany adapter | Port do obecnego pipeline’u |
| Allegro | `targetOnly`, brak adaptera | Brak adaptera | Nowa implementacja od zera |

### Faktyczna liczba

- obecny projekt: **3/7**;
- `papadata-main`: **5/7**;
- unikalne adaptery dostępne w obu paczkach: **6/7**;
- po przeniesieniu starego kodu nadal pozostaje **Allegro**;
- żaden webhook provider-specific nie powinien zostać uznany za produkcyjny bez podpisu, timestampu, replay store i acceptance suite.

## 7. Dokumentacja kontra rzeczywisty kod

### Obecny projekt

Zalety:

- release scope jest maszynowy i sprawdzany względem `@OperationId`;
- security controls mają maszynowe statusy i evidence paths;
- generator tworzy route map i snapshot kontroli;
- release uczciwie nie deklaruje zgodności z pełnym kontraktem 212 operacji.

Braki:

- proces **nie aktualizuje automatycznie całej `docs/specyfikacja-docelowa`**;
- główna specyfikacja nadal może opisywać pełne 7 integracji i pełny produkt, podczas gdy release ma 3 adaptery i 26 operacji;
- walidator wprost wymusza dziś listę `baselinker`, `ga4`, `shopify`, więc dodanie 7/7 wymaga ręcznej zmiany kodu, manifestu, verifiera i dokumentów;
- nie istnieje jeszcze jeden generator „kod → capability matrix → dokumentacja”.

### `papadata-main`

- checker pokrycia tras OpenAPI przechodzi 262/262;
- compliance inventory potrafi generować/aktualizować dokumenty;
- provider readiness jest generowane z danych runtime i przechodzi dla 44 providerów;
- docs check przechodzi;
- dokumentacja jest bliżej rzeczywistego API, choć nadal zawiera obszary `partial`, live evidence i legal review.

### Wniosek dokumentacyjny

W obecnym projekcie należy wdrożyć automatyczny pipeline:

1. kod kontrolerów i provider factory;
2. generowany capability manifest;
3. generowany release scope;
4. generowane tabele providerów i domen;
5. generowany fragment dokumentacji;
6. CI blokujące ręczną rozbieżność.

Docelowo dokumentacja nie może deklarować „7/7”, dopóki wszystkie adaptery i conformance tests nie przejdą. Po ich wdrożeniu generator ma automatycznie zmienić status na 7/7.

## 8. Rekomendowany kierunek: obecny projekt jako baza

### Zasada

**Nie przenosić starego repozytorium jako całości.** Przenosić zachowania domenowe, algorytmy, testy i model danych do aktualnych granic:

- BFF;
- production API;
- durable worker;
- `@papadata/database`;
- `@papadata/integrations`;
- `@papadata/storage`;
- `@papadata/ai-runtime`;
- kontrakty i machine-readable release evidence.

### Kolejność migracji

#### Etap P0-A — 7/7 integracji

1. rozszerzyć `IntegrationProviderAdapter` o pełny kontrakt conformance;
2. przenieść WooCommerce z `papadata-main`;
3. przenieść Google Ads;
4. przenieść Meta Ads;
5. rozbudować BaseLinker logiką starego adaptera;
6. rozbudować GA4 logiką starego adaptera;
7. zachować i dopracować Shopify;
8. zbudować Allegro od zera;
9. podłączyć każdy adapter do durable ingestion pipeline;
10. dodać 7-provider conformance suite: credentials, scopes, pagination, backfill, incremental, checkpoint, retry, rate limit, cancel, reconciliation i tenant isolation;
11. dodać provider-specific webhook verification i replay protection tam, gdzie provider obsługuje webhooki;
12. automatycznie zaktualizować release scope, verifier, security matrix i dokumentację.

#### Etap P0-B — domeny produktu

Przenosić w kolejności:

1. auth/registration/onboarding/workspaces/team;
2. dashboard/analytics/metrics/command center;
3. billing/subscriptions/VAT/KSeF;
4. reports/exports;
5. AI/assistant library/execution ledger;
6. alerts/notifications/data quality;
7. settings/search/targets/annotations;
8. pełny DSAR/retention.

Każda domena musi mieć jednocześnie:

- produkcyjny kontroler;
- runtime DTO;
- repository/persistence;
- capability i tenant policy;
- audyt/idempotency;
- telemetry;
- testy unit/integration/DB;
- operationId i release manifest;
- automatycznie zsynchronizowaną dokumentację.

#### Etap P0-C — persistence

- użyć starego `schema.prisma` i migracji jako **mapy domenowej**, nie jako historii do skopiowania;
- przenieść brakujące modele do aktualnego SQL schema;
- dla każdej tabeli tenantowej wymusić RLS i `FORCE RLS` tam, gdzie runtime role nie może być ownerem/bypassować polityki;
- zachować aktualne oddzielne role migrator/runtime/platform;
- dodać migration compatibility i upgrade test z danymi starego projektu.

#### Etap P1 — CI/IaC

Przenieść do obecnego projektu:

- PostgreSQL i Redis services w CI;
- OpenAPI route coverage;
- compliance inventory generator;
- provider readiness generator;
- Terraform module tests;
- Cloud Tasks;
- BigQuery foundation, jeśli nadal jest wymagana;
- monitoring metrics, alert policies, uptime checks i budget;
- staging/production environment modules;
- migration Cloud Run Job;
- canary/stable routing, jeśli model release go wymaga.

Zachować z obecnego projektu:

- pinned Actions SHA;
- CodeQL;
- Trivy/SBOM;
- Cosign signing/attestation;
- digest-pinned base images;
- BFF;
- worker pool i durable ingestion;
- production release/security manifests.

## 9. Kryteria uznania obecnego projektu za dojrzalszy

Obecny projekt będzie jednoznacznie dojrzalszy od `papadata-main`, gdy spełni wszystkie poniższe warunki:

1. **7/7 providerów** ma działające adaptery i conformance suite;
2. produkcyjny API pokrywa wymagane domeny MVP, nie tylko 26 operacji hardening beta;
3. route coverage porównuje runtime z pełnym release OpenAPI i przechodzi 100%;
4. główna dokumentacja jest generowana z capability manifestu;
5. testy obejmują realny PostgreSQL, Redis, storage i migration upgrade;
6. RLS/FORCE RLS obejmuje wszystkie tenantowe tabele;
7. reports, privacy i AI nie mają statusu `limited`/`blocked` w docelowym release;
8. webhooki mają podpis, timestamp, replay protection i testy negatywne;
9. 21 kontroli `acceptance_pending` ma dołączone dowody środowiskowe;
10. worktree jest commitowany, CI zielone, obrazy podpisane, a staging smoke zakończony sukcesem.

## 10. Ostateczna rekomendacja

### Co wybrać jako bazę

**Wybrać obecny projekt.** Ma lepsze granice, bezpieczniejszą architekturę, lepszy model release engineering i właściwy kierunek dla backendu, który ma działać niezależnie od frontendu.

### Która paczka jest dziś dojrzalsza

**Dziś `papadata-main` jest dojrzalszy jako funkcjonalny backend produktu.** Wynika to z realnej liczby domen, endpointów, modeli, testów, adapterów i zgodności OpenAPI.

### Jak uzyskać najlepszy wynik

Najlepsza wersja PapaData nie powstanie przez wybór jednej paczki i odrzucenie drugiej. Powinna powstać przez:

- utrzymanie obecnego projektu jako architektury docelowej;
- selektywne przeniesienie do niego dojrzałej logiki biznesowej i adapterów ze starego projektu;
- napisanie brakującego Allegro;
- doprowadzenie integracji do 7/7;
- automatyczne generowanie dokumentacji z rzeczywistego kodu i testów;
- zamknięcie pełnej walidacji środowiskowej przed oznaczeniem backendu jako produkcyjnego.
