# Specyfikacja nadrzędna warstwy danych analityki insightów i bezpiecznego AI

Specyfikacja nadrzędna warstwy danych, analityki, insightów i bezpiecznego AI

AI-00
Wersja 2.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-00
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

## Wnioski główne

PapaData powinna działać jako warstwa decyzyjna oparta na jawnej gotowości danych, wersjonowanych KPI, lokalnej ocenie jakości i śladzie dowodowym.

Minimalny pion wartości: integracja -> ingestia -> normalizacja -> kanonikalizacja -> jakość -> readiness -> KPI -> insight -> decyzja -> wynik.

Największe ryzyka to nierozstrzygnięty zakres MVP, brak operacyjnych kontraktów źródeł i brak dowodów bezpieczeństwa oraz ewaluacji AI.

## Fakty

PapaData jest projektowana jako platforma SaaS z workspace, użytkownikami, rolami, integracjami, dashboardami, analityką, automatyzacją i asystentem AI.

Źródło, rekord znormalizowany, rekord kanoniczny, gotowy dataset i gotowy KPI są odrębnymi stanami.

Status integracji wpływa na dostępność, świeżość i wiarygodność analiz.

Asystent AI ma być kontrolowaną warstwą analizy, wyjaśniania, rekomendacji i zatwierdzanych działań.

## Założenia robocze

MVP zaczyna się od jednego pionu i jednego dostawcy, mimo że jeden z wymogów wskazuje także równoległy D2C i marketplace.

Pierwsza wartość opiera się na danych sprzedażowych i małym katalogu KPI.

## Rekomendacje

Zatwierdzić jeden pion MVP i jednego dostawcę.

Utworzyć centralne rejestry: źródeł, mapowań, jakości, KPI, insightów, AI, uprawnień, retencji i dowodów.

Nie publikować KPI lub odpowiedzi AI bez informacji o jakości, świeżości, wersji i zakresie uprawnień.

## Luki i konflikty

Zakres MVP został rozstrzygnięty: pełna funkcjonalność aplikacji dla D2C, marketplace, marketingu, analityki, decyzji, AI i billingu; ograniczony pozostaje katalog kompletnych providerów.

UI przewiduje działania AI, a architektura odkłada część działań zewnętrznych poza MVP.

Brak operacyjnego katalogu insightów, pełnych kart KPI i provider-specific mappings.

## Mapa pakietu

AI-01 zasady i decyzje; AI-02 źródła; AI-03 klasyfikacja; AI-04 model danych; AI-05 KPI; AI-06 dashboard; AI-07 insighty; AI-08 wizualizacje; AI-09 stany; AI-10 jakość; AI-11 rola AI; AI-12 zapytania; AI-13 odpowiedzi; AI-14 bezpieczeństwo; AI-15 automatyzacje; AI-16 raporty; AI-17 Storybook; AI-18 ryzyka; AI-19 roadmapa; AI-20 decyzje i kolejność prac.

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
