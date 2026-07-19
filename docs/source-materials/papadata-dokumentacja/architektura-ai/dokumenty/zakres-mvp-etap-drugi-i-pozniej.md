# Zakres MVP etap drugi i później

Zakres MVP, etap 2 i później

AI-19
Wersja 2.0 | 18 lipca 2026
PapaData / Architektura danych i AI

## Metryka dokumentu

Tabela:
- Wiersz 1: Pole; Wartość
- Wiersz 2: Kod; AI-19
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

Tenant jest granicą własności danych, umowy, billingu i polityk klienta oraz używa tenantId. Workspace jest przestrzenią operacyjną wewnątrz tenanta. Każdy workspace należy do dokładnie jednego tenanta identyfikowanego przez tenantId i używa workspaceId. Zasób tenantowy zawiera tenantId, a zasób należący do workspace zawiera tenantId i workspaceId; zasób globalny platformy nie zawiera tych identyfikatorów. GCP Organization jest wyłącznie korzeniem infrastruktury operatora PapaData i nigdy nie zastępuje tenantId. Firma lub profil prawny opisuje dane biznesowe klienta, ale nie stanowi technicznej granicy izolacji.

Autoryzacja wykorzystuje role domyślne jako pakiety capabilities i data scope. Minimalny katalog ról obejmuje Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer, Billing Admin, Auditor/Security oraz Internal Support/Operations z dostępem JIT. UI może prezentować capabilities, ale ostateczna decyzja dostępu zawsze jest egzekwowana po stronie zaufanej.

Papa Asystent, Laboratorium AI oraz AI Actions należą do MVP. AI korzysta wyłącznie z danych dopuszczonych przez readiness i uprawnienia, zwraca evidence, ograniczenia i poziom pewności oraz potrafi odmówić. Działania istotne wymagają zatwierdzenia człowieka, ponownej walidacji targetu i danych, idempotencji, audytu oraz mechanizmu anulowania lub kompensacji, gdy jest to technicznie możliwe. Niedopuszczalne jest niekontrolowane autonomiczne wykonanie o wpływie finansowym, operacyjnym, prawnym lub dostępowym.

## MVP

Co najmniej jeden płatny klient referencyjny; pełna aplikacja działa wielotenantowo i w wielu workspace, a katalog providerów jest ograniczony decyzją DEC-INT-MVP-001.

Pełne ścieżki source -> normalized -> canonical dla sprzedaży, produktów, klientów, marketingu, ruchu i danych wymaganych przez funkcje MVP.

Readiness, quality, reconciliation i audit.

Pełny zatwierdzony katalog KPI wymagany przez moduły MVP, z wersją, evidence, readiness, limitations i lineage.

Command Center, wszystkie moduły analityczne, wizualizacje, insighty, rekomendacje, raporty i procesy decyzyjne przewidziane dla MVP.

AI: interpretacja, źródła, ograniczenia, rekomendacja i odmowa.

Decyzja człowieka, AI Actions pod approval oraz pełny zapis outcome, pomiar efektu i recovery.

Support, restore test, incident process i pomiar kosztu.

## Etap 2

Kolejne integracje i warianty providerów poza katalogiem MVP.

Dodatkowe warianty domenowe, większa skala i nowe rynki; produkty, klienci, ruch, lejek i segmentacje należą do MVP.

Dodatkowe KPI eksperymentalne i zaawansowane warianty automatyzacji; podstawowe workflow działań i harmonogramy należą do MVP.

Dodatkowe modele, eksperymenty i warianty symulacji; AI Lab i zatwierdzane działania należą do MVP.

Dodatkowi providerzy płatności, metody i warianty enterprise; billing self-service i pełny katalog ról należą do MVP.

## Później

Omnichannel, zaawansowane FX, predykcja, eksperymenty, benchmarki i automatyzacje wysokiego ryzyka.

Contribution margin po pełnym modelu kosztów.

## Bramy MVP

Scope, data contract, integration readiness, security, restore, KPI acceptance, AI evaluation i pilot operations.

Każda brama ma ownera, checklistę, dowody i decyzję go/no-go.

## Rozstrzygnięcie zakresu

Rozstrzygnięcie zakresu został zamknięty przez DEC-PRD-MVP-001: MVP obejmuje pełne funkcje D2C, marketplace, marketingu, analityki, AI i billingu, a ograniczenie dotyczy katalogu integracji i skali.

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
