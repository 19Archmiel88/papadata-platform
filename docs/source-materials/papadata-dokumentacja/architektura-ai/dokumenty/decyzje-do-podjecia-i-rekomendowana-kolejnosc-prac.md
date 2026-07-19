# Decyzje do podjęcia i rekomendowana kolejność prac

Decyzje do podjęcia i rekomendowana kolejność prac

AI-20
Wersja 2.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-20
- Wiersz 3: Wersja; 2.0
- Wiersz 4: Data; 18 lipca 2026
- Wiersz 5: Status; Finalny dokument spójnościowy
- Wiersz 6: Zakres; Dane, analityka, insighty, automatyzacje i bezpieczne AI

## Konwencja

Tabela:
- Wiersz 1: Klasa; Znaczenie
- Wiersz 2: FAKT; Wynika z dokumentacji źródłowej.
- Wiersz 3: ZAŁOŻENIE; Przyjęte roboczo i wymaga potwierdzenia.
- Wiersz 4: REKOMENDACJA; Proponowany sposób realizacji.
- Wiersz 5: LUKA / KONFLIKT; Brak, niespójność lub decyzja blokująca.

## Obowiązujące decyzje przekrojowe - wersja 2.0

Niniejszy dokument stosuje decyzje centralne: DEC-PRD-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001, DEC-BILL-MVP-001 i DEC-INT-MVP-001.

PapaData MVP obejmuje kompletną funkcjonalność aplikacji przewidzianą dla pierwszego wydania. Ograniczenie zakresu MVP dotyczy liczby aktywnych integracji, providerów, wariantów konfiguracyjnych, obsługiwanych rynków i skali, a nie kompletności procesów aplikacji. Każda funkcja należąca do MVP działa end-to-end i posiada stany sukcesu, oczekiwania, braku danych, częściowej gotowości, błędu, anulowania i odzyskiwania oraz wymagane mechanizmy uprawnień, audytu, retencji, monitoringu i testów.

Katalog integracji MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads oraz Google Analytics 4. Każda udostępniona integracja musi być kompletna w zakresie właściwym dla providera: autoryzacja i scopes, ustanowienie połączenia, synchronizacja początkowa i przyrostowa, backfill, webhooki jeżeli są wspierane, checkpointy, idempotencja, retry, obsługa limitów, reconnect, disconnect, monitoring, audyt, retencja, procedura recovery, runbook i testy. Provider spoza katalogu nie jest pokazywany jako dostępny.

Google Cloud Platform jest docelową platformą infrastrukturalną PapaData. Architektura może korzystać z każdej usługi GCP zatwierdzonej w katalogu usług i uzasadnionej wymaganiami produktu, bezpieczeństwa, operacji lub kosztu; nie oznacza to obowiązku wdrażania wszystkich usług GCP. Referencyjne mapowanie obejmuje Cloud Run dla API, BFF, workerów i jobów, Cloud SQL for PostgreSQL, Memorystore for Redis, Pub/Sub i Cloud Tasks, Cloud Storage, Secret Manager, Cloud Scheduler, Artifact Registry, Cloud Build, IAM, Cloud KMS, Cloud Logging, Monitoring i Trace oraz komponenty sieciowe i ochronne odpowiednie do ryzyka.

Środowiska Local, CI, Development i Staging odtwarzają produkcyjne kontrakty, wersje, granice procesów i przepływy danych w maksymalnym praktycznym zakresie. Lokalny development wykorzystuje Docker Compose oraz kontenery API, BFF, workerów i migracji, PostgreSQL w tej samej głównej wersji co Cloud SQL, Redis, emulator lub adapter kolejek, emulator GCS albo MinIO za interfejsem storage, lokalny scheduler, OpenTelemetry Collector oraz sandboxy lub mocki providerów. Te same migracje, obrazy, schematy API i kontrakty zdarzeń obowiązują w Local, CI i GCP. Bruno jest wersjonowanym narzędziem testowania i dokumentowania API, a nie usługą infrastrukturalną.

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

## Cel

Realizować zatwierdzone decyzje centralne w kolejności minimalizującej ryzyko i zapewniającej pełną funkcjonalność MVP.

## Kolejność prac

Fala 0: governance - propagacja DEC-PRD-MVP-001, DEC-INT-MVP-001, DEC-ARCH-CLOUD-001, DEC-ENV-PARITY-001, DEC-TEN-001, DEC-AUTHZ-001, DEC-AI-ACT-001 i DEC-BILL-MVP-001.

Fala 1: foundation - tenant, identity, capabilities, audit i secrets.

Fala 2: integration - adapter, jobs, checkpoint, retry i runbook.

Fala 3: data contract - source/normalized/canonical, authority, dedupe, quality i readiness.

Fala 4: analytics - KPI, snapshots, Command Center i wizualizacje.

Fala 5: insight/AI - evidence, structured responses, refusal i evals.

Fala 6: decisions/outcomes - rekomendacja, decyzja, draft działania i wynik.

Fala 7: hardening/pilot - security, restore, incident, support, koszty i go-live.

## Definition of Ready

Decyzje centralne obowiązują, mapowania są zaakceptowane, test data dostępne, security zatwierdzone, acceptance i evidence zdefiniowane.

## Definition of Done

Happy path i stany błędne, telemetry, audit, testy, dokumentacja, runbook, uprawnienia i dowód akceptacji.

## Minimalne informacje do startu

Klient pilota, provider, test credentials, payloady, statusy zamówień/zwrotów, waluta, timezone, wolumeny, SLA, ownerzy, retencja i role.

## Rejestr decyzji

Tabela:
- Wiersz 1: ID; Obszar; Opcje; Rekomendacja; Ważność; Owner
- Wiersz 2: D-01; Pion MVP; D2C + marketplace + marketing + analityka w pełnej aplikacji / marketplace; D2C + marketplace + marketing + analityka w pełnej aplikacji; blokująca; Product
- Wiersz 3: D-02; Provider; WooCommerce / Shopify; katalog MVP: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads, GA4; blokująca; Product + Tech
- Wiersz 4: D-03; KPI; 4 / szerszy katalog; pełny katalog KPI modułów MVP; blokująca; Data Owner
- Wiersz 5: D-04; Waluta; workspace / FX; jedna waluta MVP; blokująca; Business + Data
- Wiersz 6: D-05; Timezone; source / workspace; workspace timezone; blokująca; Data Owner
- Wiersz 7: D-06; Retencja; raw/canonical/AI/audit; osobne okresy; blokująca; Security/Legal
- Wiersz 8: D-07; Role; minimum / pełny model; role domyślne + capabilities + data scope; ważna; Product/Security
- Wiersz 9: D-08; AI provider; model/region/retention; provider AI przez gateway; region i retencja zatwierdzane bezpieczeństwem; blokująca; Security/AI
- Wiersz 10: D-09; Approval; zakres działań; external writes dozwolone przez AI Actions z approval, revalidation i audytem; ważna; Product/Security
- Wiersz 11: D-10; Outcome; manualny / automatyczny; pełny outcome lifecycle z pomiarem efektu; ważna; Product/Data

## Źródła dokumentacyjne

D1-D7: dokumentacja biznesowa, decyzje, kontrakt danych/KPI, integracje, pilotaż, komercjalizacja i bezpieczeństwo.

M01-M15: dokumentacja UI/UX oraz stanów produktowych.

A01-A15: architektura produktu, systemu, danych, integracji, uprawnień, bezpieczeństwa, AI, MVP i wdrożenia.

Dokument nie jest dowodem implementacji, gotowości produkcyjnej ani opinią prawną.

## Zatwierdzenia

Tabela:
- Wiersz 1: Rola; Osoba; Decyzja; Data
- Wiersz 2: Właściciel biznesowy
- Wiersz 3: Właściciel danych
- Wiersz 4: Architekt techniczny
- Wiersz 5: Bezpieczeństwo / prywatność

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
