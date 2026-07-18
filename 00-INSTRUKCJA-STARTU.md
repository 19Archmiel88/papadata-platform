# PapaData — pełna instrukcja przygotowania projektu w Visual Studio Code i rozpoczęcia pracy z Codexem

**Status:** rekomendacja wykonawcza
**Data opracowania:** 18 lipca 2026
**Podstawa:** dokumentacja biznesowo-produktowa PapaData, rejestr decyzji, kontrakt danych i KPI, integracje i gotowość operacyjna, model komercyjny oraz bezpieczeństwo, prywatność i AI Governance.

---

## 1. Najważniejsza decyzja

PapaData powinna powstać jako **modularny monorepo TypeScript**, uruchamiany lokalnie w WSL2 i Docker Compose, z docelowym wdrożeniem na Google Cloud Platform.

Nie należy zaczynać od:
- jednego dużego procesu backendowego;
- bezpośredniego łączenia Reacta z bazą lub providerami;
- tworzenia wszystkich modułów równocześnie;
- instalowania każdej potencjalnie przydatnej biblioteki;
- budowania produkcyjnych integracji bez kontraktu adaptera, stanów, retry, idempotencji i audytu;
- implementowania własnego systemu haseł, tokenów i MFA;
- używania AI jako źródła prawdy albo autonomicznego wykonawcy operacji.

Docelowe granice procesów:
1. aplikacja webowa;
2. BFF przeznaczony dla klienta webowego;
3. API domenowe;
4. worker procesów asynchronicznych;
5. proces migracji;
6. lokalne usługi infrastrukturalne;
7. osobne adaptery providerów;
8. infrastruktura jako kod.

---

## 2. Zatwierdzone ograniczenia architektoniczne

Instrukcja przyjmuje następujące niezmienne założenia:

- Google Cloud Platform jest platformą docelową.
- Cloud Run obsługuje API, BFF, workery i joby.
- Cloud SQL for PostgreSQL jest podstawową relacyjną bazą danych.
- Redis służy do cache, sesji, krótkotrwałych koordynacji i ograniczonych mechanizmów technicznych; nie jest źródłem prawdy.
- Pub/Sub obsługuje zdarzenia, a Cloud Tasks kontrolowane zadania i dostarczenie.
- Cloud Storage przechowuje eksporty, pliki i artefakty.
- Secret Manager przechowuje sekrety produkcyjne.
- Cloud Scheduler inicjuje procesy okresowe.
- Artifact Registry przechowuje obrazy.
- Cloud Build realizuje produkcyjne budowanie i wdrożenie.
- OpenTelemetry jest wspólną podstawą logów, metryk i trace.
- Local, CI, Development, Staging i Production muszą zachowywać te same kontrakty, schematy, migracje i granice procesów.
- Każdy kontrakt używa jawnie `organizationId` i `workspaceId`.
- Uprawnienia są egzekwowane po stronie BFF/API/workerów, nigdy wyłącznie w UI.
- Każdy job, event, cache key, log, eksport i artefakt AI zachowuje kontekst organizacji i workspace.
- MVP jest kompletne procesowo; ograniczana jest liczba providerów, wariantów, rynków i skala, a nie obsługa błędów, recovery, bezpieczeństwa i audytu.

---

## 3. System operacyjny i środowisko lokalne

### 3.1. Rekomendowany układ na Windows

Używaj:
- Windows 11;
- WSL2;
- Ubuntu 24.04 LTS w WSL;
- Visual Studio Code połączonego z WSL;
- Docker Desktop z integracją WSL2;
- repozytorium przechowywanego wewnątrz systemu plików Linux, np. `/home/papadata/papadata`.

Nie przechowuj aktywnego repozytorium Node.js w `/mnt/c/...`, ponieważ operacje na tysiącach plików, watchery i uprawnienia bywają wolniejsze i mniej przewidywalne.

### 3.2. Narzędzia systemowe

Obowiązkowe:
- Git;
- GitHub CLI;
- curl;
- jq;
- unzip;
- make;
- build-essential;
- Docker;
- Docker Compose;
- Google Cloud CLI;
- Terraform;
- Bruno;
- Codex CLI;
- Visual Studio Code;
- Node.js 24 LTS;
- Corepack;
- pnpm przypięty w repozytorium.

Opcjonalne, ale zalecane:
- DBeaver;
- k6;
- Trivy;
- Gitleaks;
- OSV-Scanner;
- direnv;
- ShellCheck;
- hadolint.

### 3.3. Polityka wersji

- Node.js: **24 LTS**.
- Nie używaj Node.js 26 Current w projekcie produkcyjnym do czasu wejścia tej linii w LTS i przejścia testów kompatybilności.
- PostgreSQL: **18**, ponieważ jest domyślną wersją wspieraną przez Cloud SQL w dniu opracowania instrukcji.
- pnpm: jedna wersja przypięta przez pole `packageManager` w głównym `package.json`.
- Obrazy Docker: przypięte co najmniej do wersji głównej i pomocniczej; w CI produkcyjnym najlepiej także do digestu.
- Wszystkie aktualizacje główne przechodzą osobny PR i testy migracyjne.

### 3.4. Weryfikacja środowiska

Po instalacji wykonaj:

```bash
node --version
corepack --version
pnpm --version
git --version
gh --version
docker --version
docker compose version
gcloud --version
terraform version
codex --version
```

W repozytorium powinny istnieć:
- `.nvmrc` lub `.node-version`;
- `packageManager` w `package.json`;
- wersja PostgreSQL w `compose.yaml`;
- wersje Terraform providerów;
- rejestr odstępstw środowiskowych.

---

## 4. Visual Studio Code

### 4.1. Rozszerzenia obowiązkowe

1. OpenAI Codex.
2. WSL.
3. Dev Containers.
4. Docker.
5. ESLint.
6. Prettier.
7. EditorConfig.
8. Tailwind CSS IntelliSense.
9. Playwright Test for VS Code.
10. Vitest Explorer.
11. YAML.
12. Even Better TOML.
13. HashiCorp Terraform.
14. GitHub Actions.
15. markdownlint.
16. Error Lens.

Opcjonalne:
- GitLens;
- Todo Tree;
- Code Spell Checker;
- polski słownik do Code Spell Checker;
- PostgreSQL client, jeżeli nie używasz DBeaver.

### 4.2. Zasady edytora

- LF jako zakończenie linii.
- UTF-8.
- formatowanie przy zapisie;
- poprawki ESLint przy zapisie;
- brak automatycznego organizowania importów, jeżeli mogłoby to usuwać importy wymagane przez generator lub dekoratory;
- TypeScript z repozytorium, nie globalny;
- widoczne końcowe spacje i problemy;
- pliki wygenerowane wyłączone z ręcznej edycji.

---

## 5. Model repozytorium

Rekomendowana struktura:

```text
papadata/
├── apps/
│   ├── web/
│   ├── bff/
│   ├── api/
│   └── worker/
├── packages/
│   ├── authz/
│   ├── config/
│   ├── contracts/
│   ├── database/
│   ├── domain/
│   ├── events/
│   ├── observability/
│   ├── provider-sdk/
│   ├── queue/
│   ├── storage/
│   ├── testing/
│   └── ui/
├── infra/
│   ├── terraform/
│   │   ├── modules/
│   │   └── environments/
│   └── docker/
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── contracts/
│   ├── decisions/
│   ├── runbooks/
│   ├── security/
│   └── ui-copy/
├── bruno/
├── scripts/
├── .github/
│   └── workflows/
├── .vscode/
├── AGENTS.md
├── compose.yaml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

### 5.1. Odpowiedzialność aplikacji

#### `apps/web`
- React;
- routing;
- Storybook;
- wizualizacja danych;
- lokalny stan interfejsu;
- komunikacja wyłącznie z BFF;
- brak sekretów;
- brak bezpośredniego dostępu do providerów i bazy.

#### `apps/bff`
- sesja użytkownika;
- bezpieczne cookie;
- CSRF;
- agregacja danych dla UI;
- walidacja kontekstu organizacji i workspace;
- kontrola capability i entitlement;
- mapowanie odpowiedzi domenowych na kontrakty UI;
- brak ciężkich procesów danych.

#### `apps/api`
- logika domenowa;
- source authority;
- canonicalization;
- KPI;
- billing i entitlements;
- integracje;
- audyt;
- autoryzacja serwerowa;
- publikowanie zdarzeń;
- tworzenie zadań.

#### `apps/worker`
- backfill;
- synchronizacja;
- webhook apply;
- reprocessing;
- eksporty;
- AI artifacts;
- retencja;
- recovery;
- ciężkie i długotrwałe procesy.

#### proces migracji
Nie musi być stale działającą aplikacją. Powinien mieć osobny target obrazu i komendę, używać tych samych migracji w Local, CI i GCP oraz nie wykonywać migracji automatycznie przy starcie każdej repliki API.

---

## 6. Stack frontendowy

### 6.1. Fundament

- React;
- TypeScript w trybie `strict`;
- Vite;
- React Router;
- TanStack Query;
- Zod;
- React Hook Form;
- Zustand wyłącznie dla lokalnego stanu UI;
- Storybook z builderem Vite;
- Tailwind CSS;
- Radix UI;
- class-variance-authority;
- clsx;
- tailwind-merge;
- Lucide React;
- Motion;
- ECharts;
- i18next i react-i18next;
- date-fns dla prezentacji;
- MSW dla mocków sieci;
- Vitest;
- React Testing Library;
- Playwright.

### 6.2. Zasady stanu

- Stan serwerowy: TanStack Query.
- Stan formularzy: React Hook Form.
- Walidacja: Zod.
- Stan lokalny komponentu: `useState` lub `useReducer`.
- Stan współdzielony UI: Zustand tylko po wykazaniu potrzeby.
- Nie twórz globalnego store dla danych serwerowych.
- Nie duplikuj cache BFF w Zustand.

### 6.3. Storybook

Storybook jest obowiązkowym środowiskiem rozwoju UI.

Każdy ekran MVP powinien posiadać stany:
- success;
- loading;
- empty/no data;
- partial;
- error;
- cancelled;
- recovery;
- brak uprawnień;
- zablokowany entitlement;
- niedostępny provider;
- opóźniona synchronizacja;
- konflikt danych, jeżeli dotyczy.

Zasady:
- nazwy stories po polsku;
- komponent używany w Storybooku jest tym samym komponentem, który trafia do aplikacji;
- fixtures są jawne i wersjonowane;
- Storybook nie może zawierać atrapy procesu, który nie ma odpowiadającego kontraktu;
- accessibility test dla komponentów interaktywnych;
- testy interakcji dla krytycznych formularzy;
- snapshoty wizualne tylko jako pomoc, nie jedyna forma testu.

### 6.4. Wykresy

ECharts jest podstawowym silnikiem wykresów.

Nie instaluj równolegle kilku bibliotek wykresowych. Dodatkowy silnik można wprowadzić dopiero po ADR wykazującym brak wymaganej możliwości w ECharts.

Wykres musi obsługiwać:
- strefy czasowe;
- waluty;
- braki danych;
- częściową gotowość;
- poziom zaufania;
- źródło;
- zakres;
- dostępność;
- opis tekstowy;
- obsługę klawiatury w zakresie praktycznym;
- format eksportowy.

---

## 7. Stack backendowy

### 7.1. Fundament

- NestJS;
- Fastify;
- TypeScript strict;
- Zod;
- nestjs-zod;
- OpenAPI;
- Pino;
- nestjs-pino;
- PostgreSQL driver `pg`;
- Drizzle ORM i Drizzle Kit;
- Redis przez `ioredis`;
- OpenTelemetry;
- Undici;
- p-retry;
- Bottleneck;
- Decimal.js;
- Luxon;
- UUID;
- AJV;
- CloudEvents SDK.

### 7.2. Dlaczego NestJS + Fastify

NestJS daje:
- moduły;
- dependency injection;
- guards;
- interceptory;
- kontrolowany podział domen;
- dobrą bazę dla API i workerów;
- testowalność.

Fastify daje:
- przewidywalną wydajność;
- pluginy dla cookies, security headers i rate limiting;
- dobry model walidacji;
- mniejszy narzut niż Express.

### 7.3. API

Domyślnie używaj REST + OpenAPI.

Nie wprowadzaj GraphQL na początku. PapaData potrzebuje:
- jednoznacznych kontraktów;
- łatwych testów bezpieczeństwa;
- generowania klienta;
- wersjonowania;
- dokumentowania błędów;
- prostego testowania w Bruno.

Frontend może używać:
- `openapi-typescript`;
- `openapi-fetch`.

Kontrakt OpenAPI jest generowany w CI i porównywany z wersją bazową. Breaking change wymaga jawnej decyzji.

### 7.4. Baza danych

PostgreSQL jest źródłem prawdy dla:
- organizacji;
- workspace;
- membershipów;
- ról;
- capabilities;
- sesji;
- connection;
- konfiguracji providerów;
- danych źródłowych i kanonicznych w początkowej skali;
- idempotency keys;
- job state;
- audytu;
- billing state;
- AI proposal i approval state.

Wymagania:
- każda tabela domenowa posiada właściwy `organization_id` i `workspace_id`;
- klucze obce uwzględniają granice;
- indeksy zaczynają się od zakresu tenantu, jeśli odpowiada to zapytaniom;
- testy negatywne próbują odczytu i zapisu obcego zakresu;
- brak polegania wyłącznie na ORM;
- rozważyć PostgreSQL RLS jako dodatkową warstwę, nie jedyną kontrolę;
- migracje są nieodwracalne tylko po wyraźnym uzasadnieniu;
- migracja danych jest oddzielona od migracji schematu, jeśli operacja jest ciężka;
- kwoty używają `numeric`, a w kodzie Decimal.js;
- czas jest przechowywany jako UTC, a strefa biznesowa jako jawna wartość IANA;
- brak danych pozostaje `NULL` lub stanem domenowym, nie jest automatycznie zerem.

### 7.5. Redis

Redis może obsługiwać:
- server-side session store;
- cache krótkotrwały;
- rate limiting;
- lock techniczny po przeanalizowaniu failure mode;
- krótkotrwałe dane koordynacyjne.

Redis nie może przechowywać jedynej kopii:
- stanu joba;
- decyzji biznesowej;
- approval AI;
- audytu;
- billing state;
- source authority;
- definicji KPI.

Każdy cache key zawiera `organizationId` i `workspaceId` w jednoznacznym formacie.

---

## 8. Procesy asynchroniczne

### 8.1. Model

- Pub/Sub: zdarzenia domenowe i integracyjne.
- Cloud Tasks: kontrolowane dostarczenie zadania HTTP, harmonogram retry i ograniczenie tempa.
- Cloud Scheduler: inicjowanie procesów okresowych.
- Postgres: trwały stan procesu, idempotency, checkpointy i audit trail.

### 8.2. Każdy komunikat zawiera

- `eventId`;
- `eventType`;
- `eventVersion`;
- `occurredAt`;
- `organizationId`;
- `workspaceId`;
- `operationId`;
- `correlationId`;
- `causationId`;
- `actor`;
- `purpose`;
- `dataScope`;
- `payload`;
- `schemaVersion`.

### 8.3. Obowiązkowe mechanizmy

- idempotency;
- retry z backoff i jitter;
- limit prób;
- dead-letter handling;
- checkpoint;
- możliwość wznowienia;
- możliwość anulowania, gdy proces na to pozwala;
- kompensacja dla operacji odwracalnych;
- kontrola rate limit providera;
- timeout;
- circuit breaker tylko po prawidłowym określeniu stanów;
- audit;
- metryki czasu, kosztu, sukcesu i błędu.

Nie używaj BullMQ jako produkcyjnego kontraktu, jeżeli produkcja opiera się na Pub/Sub i Cloud Tasks. Lokalny adapter może emulować zachowanie, ale testy integracyjne muszą obejmować rzeczywiste usługi GCP na środowisku Development.

---

## 9. Integracje

### 9.1. Katalog MVP

- WooCommerce;
- Shopify;
- BaseLinker;
- Allegro;
- Google Ads;
- Meta Ads;
- Google Analytics 4.

Nie należy implementować ich równolegle. Kolejność wykonawcza:
1. framework adapterów;
2. WooCommerce jako pierwszy pion D2C;
3. Shopify;
4. BaseLinker;
5. Allegro;
6. source overlap i deduplikacja BaseLinker–Allegro;
7. Google Ads;
8. Meta Ads;
9. GA4.

### 9.2. Wspólny kontrakt adaptera

Każdy adapter implementuje:
- katalog capabilities providera;
- wymagane scopes;
- connect;
- callback;
- verify connection;
- initial backfill;
- incremental sync;
- webhook verification;
- webhook ingestion;
- checkpoint;
- reconnect;
- disconnect;
- health;
- rate limits;
- error mapping;
- retry classification;
- normalization;
- audit metadata;
- sandbox/mock;
- test contract.

### 9.3. Biblioteki integracyjne

Podstawa:
- Undici;
- p-retry;
- Bottleneck;
- Zod;
- AJV;
- oficjalny SDK providera tylko wtedy, gdy jest utrzymywany, kompletny i nie ukrywa wymaganych danych;
- własny adapter wokół SDK, nigdy bezpośrednie użycie SDK w domenie.

Każdy provider jest odseparowany w module i nie przecieka typami zewnętrznymi do modelu kanonicznego.

---

## 10. Uwierzytelnienie, sesje i autoryzacja

### 10.1. IdP

Nie buduj własnego systemu haseł i MFA.

Rekomendowany pierwszy wariant:
- Google Cloud Identity Platform albo inny zatwierdzony provider OIDC;
- połączenie przez standard OIDC;
- biblioteka `openid-client` po stronie zaufanej;
- BFF utrzymuje sesję aplikacyjną.

Wybór IdP wymaga ADR obejmującego:
- e-mail;
- Google;
- Microsoft;
- MFA;
- reset hasła;
- zaproszenia;
- unieważnienie sesji;
- eksport i usunięcie danych;
- koszty;
- region;
- zgodność;
- możliwość migracji.

### 10.2. Sesje

- cookie `HttpOnly`, `Secure`, odpowiedni `SameSite`;
- server-side session state;
- możliwość natychmiastowego revoke;
- rotacja identyfikatora;
- reauthentication dla operacji wysokiego ryzyka;
- informacja o MFA;
- device/session inventory;
- brak tokenów providera w LocalStorage;
- ochrona CSRF;
- walidacja Origin i Host;
- limit czasu bezczynności i limit bezwzględny.

### 10.3. Autoryzacja

W `packages/authz` utwórz:
- typowany katalog capabilities;
- typowany data scope;
- role jako domyślne pakiety;
- policy evaluator;
- kontekst aktora;
- testy macierzy;
- deny by default.

Nie używaj UI jako źródła decyzji. UI tylko ukrywa lub blokuje elementy zgodnie z decyzją zwróconą przez serwer.

---

## 11. Bezpieczeństwo

### 11.1. Biblioteki runtime

- `@fastify/helmet`;
- `@fastify/rate-limit`;
- `@fastify/cookie`;
- `@fastify/session`;
- `@fastify/csrf-protection` lub równoważna kontrola zatwierdzona w ADR;
- Zod/AJV;
- Pino z redaction.

### 11.2. Narzędzia CI

- CodeQL;
- Gitleaks;
- Trivy;
- OSV-Scanner;
- Dependabot albo Renovate — wybierz jedno; rekomendowany Renovate;
- Semgrep dla reguł projektowych;
- OWASP ZAP na Staging;
- k6 dla testów obciążenia;
- testy tenant isolation;
- testy restore;
- testy webhook replay;
- testy idempotency;
- testy uprawnień po odebraniu membershipu.

### 11.3. Sekrety

- `.env.example` zawiera wyłącznie nazwy i opis;
- `.env.local` nie jest commitowany;
- produkcja używa Secret Manager;
- CI/GCP używa Workload Identity Federation, nie długowiecznych kluczy serwisowych;
- tokeny providerów są szyfrowane i mają oddzielny dostęp;
- logi redagują tokeny, e-maile, identyfikatory i payloady wrażliwe;
- Codex nigdy nie otrzymuje prawdziwych sekretów w promptach.

---

## 12. Obserwowalność

### 12.1. Standard

- OpenTelemetry SDK;
- OTLP;
- lokalny OpenTelemetry Collector;
- Cloud Logging;
- Cloud Monitoring;
- Cloud Trace;
- Pino dla logów strukturalnych.

### 12.2. Pola korelacyjne

Każdy log i span, jeśli ma zastosowanie:
- `service`;
- `environment`;
- `version`;
- `organizationId`;
- `workspaceId`;
- `operationId`;
- `correlationId`;
- `jobId`;
- `connectionId`;
- `providerId`;
- `actorId` po pseudonimizacji;
- `result`;
- `errorCode`;
- `dataClassification`.

Nie loguj pełnych payloadów providerów domyślnie.

### 12.3. Metryki biznesowo-operacyjne

- czas do first useful data;
- czas synchronizacji;
- liczba rekordów pobranych;
- liczba rekordów odrzuconych;
- konflikty;
- duplikaty;
- freshness;
- readiness;
- retry count;
- dead-letter count;
- koszty na workspace;
- użycie AI;
- manual review time;
- support time;
- błąd tenant isolation: zawsze alert krytyczny.

---

## 13. AI w produkcie

### 13.1. Stack początkowy

Dopiero po gotowym kontrakcie danych:
- oficjalny SDK OpenAI;
- Zod dla strukturalnych odpowiedzi;
- PostgreSQL i opcjonalnie `pgvector` jako pierwszy magazyn retrieval;
- Promptfoo dla evals;
- OpenTelemetry dla śledzenia;
- własny provider adapter.

Nie instaluj LangChain jako domyślnej podstawy. Można go ocenić później, gdy pojawi się konkretny problem, którego cienka warstwa nad oficjalnym SDK nie rozwiązuje.

### 13.2. Każda odpowiedź AI zawiera

- evidence;
- zakres danych;
- readiness;
- ograniczenia;
- confidence;
- wersję promptu;
- wersję modelu;
- identyfikator policy;
- możliwość odmowy;
- audit.

### 13.3. AI Actions

Proces:
1. proposal;
2. policy check;
3. approval człowieka;
4. ponowna walidacja targetu;
5. ponowna walidacja danych;
6. idempotency;
7. execution;
8. audit;
9. outcome;
10. cancel albo compensation, jeśli możliwe.

Nie wolno wprowadzać autonomicznego działania o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

---

## 14. Billing

Billing należy do MVP, ale SDK providera nie powinien zostać zainstalowany przed ADR.

ADR musi porównać co najmniej:
- Stripe Billing;
- alternatywny provider obsługujący wymagane metody i dokumenty;
- podatki;
- faktury;
- dunning;
- refundy;
- chargeback;
- webhooks;
- idempotency;
- self-service;
- metering;
- eksport księgowy;
- zgodność z rynkiem polskim.

Niezależnie od providera utwórz własne:
- `BillingProvider`;
- `Subscription`;
- `Entitlement`;
- `UsageMeter`;
- `InvoiceReference`;
- `PaymentState`;
- `BillingWebhookEvent`;
- `BillingAudit`.

Webhook providera nie może bezpośrednio modyfikować przypadkowych tabel domenowych. Najpierw jest weryfikowany, zapisywany, deduplikowany i przetwarzany idempotentnie.

---

## 15. Narzędzia jakości kodu

### Obowiązkowe

- ESLint flat config;
- TypeScript strict;
- Prettier;
- EditorConfig;
- markdownlint;
- Knip;
- dependency-cruiser;
- commitlint;
- lint-staged;
- Husky;
- Vitest;
- Playwright;
- Testcontainers;
- Bruno;
- OpenAPI diff;
- Docker build checks.

### Reguły

- zero błędów TypeScript;
- zero błędów ESLint;
- brak nieużywanych eksportów;
- brak cykli między modułami domenowymi;
- test nowej logiki;
- test błędu i recovery;
- test uprawnień;
- test zakresu tenantów;
- aktualizacja kontraktu i dokumentacji;
- brak nowych zależności bez uzasadnienia.

---

## 16. Testy

### 16.1. Piramida

1. testy typów i schematów;
2. unit;
3. integration z prawdziwym PostgreSQL i Redis przez Testcontainers;
4. contract tests adapterów;
5. API tests w Bruno;
6. Storybook interaction i accessibility;
7. Playwright E2E;
8. testy bezpieczeństwa;
9. testy wydajności;
10. testy recovery i restore.

### 16.2. Krytyczne zestawy

- tenant isolation;
- capability matrix;
- session revoke;
- MFA requirement;
- invitation one-time use;
- password/account recovery;
- source authority;
- exact matching;
- deduplikacja;
- brak danych vs zero;
- currency;
- timezone;
- webhook replay;
- idempotency;
- rate limit;
- retry;
- backfill resume;
- KPI readiness;
- AI refusal;
- AI approval;
- billing webhook deduplication;
- export scope;
- deletion and restore.

---

## 17. Local Docker Compose

Minimalne usługi:
- PostgreSQL 18;
- Redis w wersji zgodnej z wybranym Memorystore;
- Pub/Sub emulator;
- adapter/emulator Cloud Tasks;
- fake-gcs-server albo MinIO za interfejsem storage;
- OpenTelemetry Collector;
- Mailpit;
- lokalny scheduler;
- mock provider server;
- opcjonalnie Toxiproxy.

Kontenery aplikacyjne:
- web;
- bff;
- api;
- worker;
- migrations.

Zasada: uruchomienie `docker compose up` ma doprowadzić do powtarzalnego środowiska bez ręcznego klikania w panelach dostawców. Integracje zewnętrzne w Local używają sandboxów lub mocków.

---

## 18. CI/CD

### 18.1. Pull request

GitHub Actions:
1. install z frozen lockfile;
2. format check;
3. lint;
4. typecheck;
5. unit tests;
6. integration tests;
7. OpenAPI diff;
8. Storybook build;
9. Playwright smoke;
10. tenant isolation suite;
11. secret scan;
12. dependency scan;
13. image build;
14. Trivy;
15. Terraform fmt/validate/plan dla zmian infra.

### 18.2. Merge do main

- Cloud Build buduje obrazy;
- obrazy trafiają do Artifact Registry;
- deploy do Development;
- migracja jako osobny krok;
- smoke tests;
- następnie manualna promocja do Staging;
- Production dopiero po bramie.

### 18.3. Produkcja

- bez bezpośrednich zmian z laptopa;
- bez `latest`;
- artefakt promowany, nie przebudowywany;
- rollback obrazu;
- migracje kompatybilne wstecznie;
- feature release oddzielony od deploymentu;
- audit wdrożenia.

---

## 19. Dokumentacja repozytorium

Obowiązkowe pliki:
- `README.md`;
- `AGENTS.md`;
- `docs/architecture/system-context.md`;
- `docs/architecture/container-view.md`;
- `docs/architecture/data-flow.md`;
- `docs/architecture/trust-boundaries.md`;
- `docs/adr/`;
- `docs/contracts/`;
- `docs/runbooks/`;
- `docs/security/threat-model.md`;
- `docs/security/data-classification.md`;
- `docs/security/tenant-isolation.md`;
- `docs/security/secrets.md`;
- `docs/testing/strategy.md`;
- `docs/development/local-environment.md`;
- `docs/development/codex-workflow.md`.

Każda decyzja techniczna:
- ma identyfikator ADR;
- opisuje kontekst;
- warianty;
- decyzję;
- konsekwencje;
- warunek ponownej oceny.

---

## 20. Instalacja Codexa

### 20.1. VS Code

1. Zainstaluj oficjalne rozszerzenie Codex.
2. Otwórz repo przez WSL.
3. Otwórz panel Codex.
4. Zaloguj się kontem ChatGPT.
5. Nie rozpoczynaj od polecenia implementacji.
6. Najpierw każ Codexowi sprawdzić repo i aktywne instrukcje.

### 20.2. CLI

Na Linux/WSL zainstaluj zgodnie z oficjalnym instalatorem Codex, następnie:

```bash
cd /home/papadata/papadata
codex
```

Przydatne komendy:
- `/init`;
- `/status`;
- `/permissions`;
- `/model`;
- `/review`.

### 20.3. Uprawnienia

Początkowo:
- odczyt repo: tak;
- edycja workspace: po zatwierdzonym planie;
- sieć: tylko gdy zadanie wymaga dokumentacji albo instalacji;
- instalowanie zależności: wymaga jawnej zgody;
- operacje Git: bez commit, push, reset, rebase i force bez jawnej zgody;
- usuwanie plików: wymaga jawnej zgody;
- zmiany infrastruktury: plan bez apply;
- sekrety: niedostępne.

---

## 21. AGENTS.md

Codex czyta `AGENTS.md` przed rozpoczęciem pracy. Plik główny powinien zawierać niezmienne reguły repozytorium, a katalogi specjalistyczne mogą posiadać dodatkowe `AGENTS.md` albo `AGENTS.override.md`.

Proponowany układ:

```text
AGENTS.md
apps/web/AGENTS.md
apps/api/AGENTS.md
apps/worker/AGENTS.md
packages/database/AGENTS.md
infra/AGENTS.md
```

Nie umieszczaj całej dokumentacji w jednym AGENTS.md. Plik ma wskazywać źródła prawdy i reguły wykonania, a nie kopiować setki stron.

---

## 22. Zasada pracy z Codexem

Każde zadanie przechodzi przez siedem faz:

1. **Inspect** — Codex sprawdza repo, dokumentację, zależności i aktualny stan.
2. **Plan** — podaje pliki, zakres, ryzyka i testy.
3. **Approval** — użytkownik akceptuje zakres.
4. **Implement** — Codex wykonuje wyłącznie zatwierdzony zakres.
5. **Verify** — uruchamia lint, typecheck, testy i build.
6. **Review** — pokazuje diff, ryzyka i niewykonane elementy.
7. **Checkpoint** — commit dopiero po jawnej zgodzie użytkownika.

Nie zlecaj:
> Zbuduj całe PapaData.

Zlecaj:
> Zaimplementuj jeden pionowy fragment: utworzenie organizacji i workspace, z API, BFF, formularzem, Storybookiem, testem uprawnień, audytem i E2E.

---

## 23. Szablon zadania dla Codexa

Każde zadanie powinno zawierać:

```text
Cel:
Źródła prawdy:
Zakres:
Poza zakresem:
Stan bieżący:
Reguły domenowe:
Reguły bezpieczeństwa:
Oczekiwane pliki:
Kryteria akceptacji:
Wymagane testy:
Zakazane działania:
Oczekiwany raport końcowy:
```

Przykład:

```text
Cel:
Przygotuj projektową podstawę dwupoziomowego modelu Organization/Workspace.

Źródła prawdy:
- docs/product/...
- DEC-TEN-001
- DEC-AUTHZ-001
- dokument bezpieczeństwa, sekcja izolacji tenantów.

Zakres:
- kontrakty TypeScript;
- schemat bazowy;
- migracja;
- policy context;
- testy tenant isolation;
- dokumentacja ADR.

Poza zakresem:
- UI;
- billing;
- integracje;
- dane produkcyjne.

Kryteria akceptacji:
- jawne organizationId i workspaceId;
- brak tenantId;
- deny by default;
- negatywny test obcego workspace;
- lint, typecheck i testy przechodzą.

Zakazane działania:
- nie instaluj zależności bez zgody;
- nie wykonuj operacji Git;
- nie modyfikuj plików poza zatwierdzonym zakresem.
```

---

## 24. Plan rozpoczęcia pracy z Codexem

### Etap 0 — uporządkowanie źródeł prawdy

Codex nie pisze kodu.

Zadania:
- zinwentaryzować dokumenty;
- wykryć sprzeczności;
- utworzyć mapę dokument → decyzja → moduł → test;
- wskazać brakujący Dokument 5;
- oddzielić biznesowy stan docelowy od dowodu wdrożenia;
- przygotować listę ADR technicznych.

Rezultat:
- `docs/TRACEABILITY.md`;
- `docs/OPEN-TECHNICAL-DECISIONS.md`;
- lista braków i blokerów.

### Etap 1 — audyt istniejących repozytoriów

Codex nadal nie pisze funkcji.

Zadania:
- sprawdzić aktualne repo;
- sprawdzić aktualny frontend;
- sprawdzić projekt legacy wyłącznie jako źródło kontraktów;
- wykryć obecne wersje;
- wykryć duplikaty;
- sprawdzić Git;
- sprawdzić sekrety;
- przygotować plan migracji lub konsolidacji.

Rezultat:
- raport bieżącego stanu;
- rekomendacja: rozbudowa istniejącego repo albo nowe monorepo;
- lista plików do zachowania, przeniesienia i odrzucenia.

### Etap 2 — fundament repozytorium

Zadania:
- pnpm workspace;
- Turborepo;
- wspólny TypeScript;
- ESLint;
- Prettier;
- EditorConfig;
- scripts;
- CI skeleton;
- `.vscode`;
- `AGENTS.md`;
- README;
- katalog docs.

Rezultat:
- repo buduje się bez funkcji domenowych;
- `pnpm verify` działa.

### Etap 3 — parytet lokalny

Zadania:
- compose;
- PostgreSQL;
- Redis;
- Pub/Sub emulator;
- storage emulator;
- OTel Collector;
- Mailpit;
- mock provider;
- migracje;
- health checks.

Rezultat:
- jedno polecenie uruchamia środowisko;
- test CI uruchamia ten sam zestaw kontraktów.

### Etap 4 — kontrakty przekrojowe

Zadania:
- organization/workspace;
- actor context;
- capabilities;
- data scope;
- entitlements;
- audit envelope;
- error model;
- event envelope;
- job state;
- idempotency.

Rezultat:
- pakiety bez logiki ekranowej;
- testy tenant isolation;
- przykładowy event i API contract.

### Etap 5 — auth

Zadania:
- ADR wyboru IdP;
- BFF session;
- cookie;
- CSRF;
- invitation;
- login;
- logout;
- revoke;
- MFA state;
- recovery;
- audit;
- Storybook stanów auth;
- E2E.

Rezultat:
- kompletny auth end-to-end;
- brak tokenów w LocalStorage;
- serwerowa autoryzacja.

### Etap 6 — pierwszy pion wartości

Rekomendacja: WooCommerce.

Proces:
- connect;
- verify;
- initial backfill;
- incremental sync;
- normalization;
- canonical order;
- first useful data;
- jeden KPI;
- readiness;
- UI;
- recovery;
- monitoring;
- runbook.

Rezultat:
- jeden pełny pionowy fragment;
- nie tylko „adapter działa”.

### Etap 7 — source authority i deduplikacja

Zadania:
- authority versioning;
- exact matching;
- duplicate group;
- conflict;
- manual review;
- reprocessing;
- audit.

Rezultat:
- baza przed Allegro/BaseLinker overlap.

### Etap 8 — kolejne integracje

Kolejno:
- Shopify;
- BaseLinker;
- Allegro;
- Google Ads;
- Meta Ads;
- GA4.

Każda przechodzi własne bramy.

### Etap 9 — AI

Dopiero po readiness danych:
- evidence retrieval;
- odpowiedzi strukturalne;
- refusal;
- evals;
- proposal;
- approval;
- revalidation;
- action;
- audit;
- recovery.

### Etap 10 — billing

- ADR providera;
- subscription;
- entitlements;
- usage;
- webhook;
- idempotency;
- self-service;
- invoices;
- dunning;
- E2E.

### Etap 11 — produkcja

- Terraform;
- GCP Development;
- Staging;
- WIF;
- Artifact Registry;
- Cloud Build;
- Cloud Run;
- Cloud SQL;
- Redis;
- Pub/Sub;
- Tasks;
- Storage;
- secrets;
- OTel;
- backup;
- restore;
- pentest;
- runbooks;
- incident process.

---

## 25. Pierwsze prompty do Codexa

### Prompt 1 — tylko analiza

```text
Przeanalizuj całe repozytorium bez modyfikowania plików.

Najpierw:
1. odczytaj wszystkie aktywne AGENTS.md i AGENTS.override.md;
2. pokaż root repozytorium i aktualny branch;
3. pokaż strukturę katalogów;
4. odczytaj package.json, workspace, konfigurację TypeScript, lint, testy, Docker i CI;
5. wskaż istniejące aplikacje, pakiety i kontrakty;
6. wykryj sekrety lub ryzykowne pliki, ale nie pokazuj ich wartości;
7. porównaj stan repo z dokumentacją PapaData;
8. przedstaw luki, sprzeczności, ryzyka i rekomendowaną kolejność prac.

Nie instaluj zależności.
Nie zmieniaj plików.
Nie wykonuj commit, push, reset, rebase ani checkout.
Na końcu podaj dokładny plan pierwszego małego zadania implementacyjnego.
```

### Prompt 2 — fundament

```text
Na podstawie zatwierdzonego planu przygotuj wyłącznie fundament monorepo.

Przed zmianą pokaż:
- listę plików do utworzenia lub zmiany;
- zależności;
- skrypty;
- testy;
- ryzyka.

Nie implementuj funkcji domenowych.
Nie instaluj zależności przed moją akceptacją.
Nie wykonuj operacji Git.
Po wykonaniu uruchom format check, lint, typecheck, test i build.
```

### Prompt 3 — przegląd

```text
Wykonaj przegląd niezatwierdzonych zmian bez modyfikowania plików.

Sprawdź:
- zgodność z AGENTS.md;
- naruszenia organizationId/workspaceId;
- bezpieczeństwo;
- breaking changes;
- brakujące testy;
- niepotrzebne zależności;
- martwy kod;
- logowanie danych wrażliwych;
- zgodność Local/CI/GCP;
- dokumentację.

Podaj problemy według priorytetu: krytyczne, wysokie, średnie, niskie.
```

---

## 26. Polecenia repozytorium

Docelowo główny `package.json` powinien udostępniać:

```text
pnpm dev
pnpm dev:web
pnpm dev:bff
pnpm dev:api
pnpm dev:worker
pnpm infra:up
pnpm infra:down
pnpm db:migrate
pnpm db:seed
pnpm db:reset
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:contract
pnpm test:tenant
pnpm test:e2e
pnpm test:storybook
pnpm storybook
pnpm build:storybook
pnpm bruno:test
pnpm build
pnpm verify
```

`pnpm verify` powinno uruchamiać minimum:
- format check;
- lint;
- typecheck;
- unit;
- integration w rozsądnym zakresie;
- build.

---

## 27. Czego nie instalować na początku

Nie dodawaj bez konkretnego ADR i przypadku użycia:
- Kubernetes;
- service mesh;
- Kafka;
- Temporal;
- Elasticsearch/OpenSearch;
- osobnej bazy wektorowej;
- BigQuery;
- dbt;
- Dataform;
- GraphQL;
- LangChain;
- kilku bibliotek UI;
- kilku bibliotek wykresowych;
- mikrofrontendów;
- event sourcingu całego systemu;
- CQRS dla każdego modułu;
- własnego IdP;
- własnego systemu płatności;
- własnego systemu sekretów;
- BullMQ jako kontraktu produkcyjnego;
- feature flag SaaS;
- produktu analitycznego klienta zewnętrznego przed oceną prywatności.

Każda z tych technologii może być uzasadniona później, ale nie jest potrzebna do rozpoczęcia pierwszego pełnego pionu wartości.

---

## 28. Pierwszy dzień

1. Otwórz repo w WSL.
2. Zweryfikuj wersje.
3. Zainstaluj rozszerzenie Codex.
4. Umieść `AGENTS.md`.
5. Dodaj dokumentację do repo jako źródła prawdy.
6. Uruchom Prompt 1.
7. Nie pozwalaj jeszcze na edycję.
8. Zatwierdź mapę repo i luk.
9. Wybierz, czy istniejący kod jest bazą, czy tylko źródłem.
10. Utwórz checkpoint Git przed pierwszą zmianą.

---

## 29. Pierwszy tydzień

Oczekiwany rezultat:
- zatwierdzona struktura monorepo;
- `AGENTS.md`;
- lokalne środowisko;
- CI skeleton;
- OpenTelemetry skeleton;
- kontrakt błędów;
- event envelope;
- `organizationId` i `workspaceId`;
- authz skeleton;
- migracje;
- test tenant isolation;
- dokumentacja ADR;
- brak funkcji udających gotowość biznesową.

---

## 30. Pierwszy miesiąc

Oczekiwany rezultat:
- auth end-to-end;
- Organization/Workspace;
- role, capabilities i data scope;
- invitation;
- sessions i revoke;
- audit;
- pierwszy provider w sandbox/mock;
- initial backfill;
- normalized data;
- canonical order;
- jeden KPI;
- readiness;
- jeden kompletny ekran i Storybook stanów;
- recovery;
- monitoring;
- runbook;
- E2E pierwszego pionu.

---

## 31. Brak w obecnym pakiecie dokumentacji

Rejestr decyzji odwołuje się do Dokumentu 5 dotyczącego procesów pierwszego pionu i płatnego pilotażu, ale dokument nie znajdował się w udostępnionym folderze podczas przygotowywania instrukcji.

Skutek:
- stack i fundament mogą zostać ustalone;
- dokładna kolejność procesu pilotażowego, bramy klienta, odpowiedzialności i dowody pilotażu powinny zostać uzupełnione przed planowaniem komercyjnego pilotażu;
- nie blokuje to pracy na danych testowych ani budowy pierwszego pionu technicznego.

---

## 32. Ostateczna rekomendacja

Rozpocznij od:
1. audytu repo przez Codex bez zmian;
2. stworzenia AGENTS.md;
3. konsolidacji dokumentacji w repo;
4. monorepo i jakości;
5. parytetu Local/CI/GCP;
6. Organization/Workspace i autoryzacji;
7. auth;
8. jednego kompletnego pionu WooCommerce;
9. dopiero potem kolejnych integracji, AI i billing.

Największym ryzykiem nie jest brak biblioteki. Największym ryzykiem jest rozpoczęcie implementacji wielu modułów bez wspólnych granic tenantu, kontraktów, idempotencji, readiness, audytu i recovery.
