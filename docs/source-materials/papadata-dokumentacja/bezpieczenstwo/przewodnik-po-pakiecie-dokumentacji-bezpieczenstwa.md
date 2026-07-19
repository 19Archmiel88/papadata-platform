# Przewodnik po pakiecie dokumentacji bezpieczeństwa

PAPADATA | SEC-00 | Przewodnik po pakiecie dokumentacji bezpieczeństwa

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

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

## PAPADATA

Przewodnik po pakiecie dokumentacji

bezpieczeństwa

Struktura, źródła prawdy, statusy, traceability i sposób utrzymania

Kod dokumentu

## SEC-00

Wersja

1.0

Status

Accepted - architektura docelowa; wymagane dowody

wdrożenia

Data obowiązywania

## 18 lipca 2026

Właściciel

Artur Wiśniewski

Zakres

PapaData MVP - pełna funkcjonalność, ograniczona liczba

integracji

Klasyfikacja

Wewnętrzna / projektowa

Zasada interpretacji: dokument ustanawia wymagania i kryteria akceptacji. Sam dokument nie potwierdza

implementacji, konfiguracji ani pozytywnego wyniku testów.

PAPADATA | SEC-00 | Przewodnik po pakiecie dokumentacji bezpieczeństwa

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

2

Podstawa i hierarchia źródeł

Dokument należy interpretować łącznie z centralnym rejestrem decyzji PapaData, kontraktem danych i KPI,

dokumentacją integracji, dokumentem bezpieczeństwa i AI Governance, architekturą techniczną oraz specyfikacjami

## UI/UX.

Kod

Źródło prawdy

## D2

Status, wersja i obowiązywanie decyzji

## D3

Semantyka danych, canonicalization, readiness i KPI

## D4

Providerzy, connection, synchronizacja, retry i recovery

## D7

Bezpieczeństwo, prywatność, ciągłość i AI Governance

## A01-A15

Architektura techniczna, API, role, AI, macierze i plan wdrożenia

## M01-M15

Ekrany, flow, stany UI, formularze i Storybook

Korekta MVP 2026-07-18

Pełna funkcjonalność w ograniczonym katalogu integracji i wariantów

Fakt potwierdzony: Wszystkie decyzje skorygowanego modelu MVP mają status Accepted i obowiązują od MVP.

Ograniczenie: Dokumentacja nie jest dowodem wdrożenia. Każda kontrola wymaga osobnego dowodu

technicznego i testowego.

Cel pakietu

Pakiet przekłada decyzje biznesowe i architektoniczne PapaData na wymagania bezpieczeństwa, kontrakty

implementacyjne, wymagania UI, zdarzenia audytowe, scenariusze QA oraz bramy dopuszczenia do produkcji.

Zasada nadrzędna MVP: PapaData MVP jest małym zakresem kompletnego produktu, a nie dużym zakresem

produktu częściowo działającego.

Struktura pakietu

Kod

Dokument

Rola

## SEC-00

Przewodnik po pakiecie

Hierarchia, statusy, traceability

## SEC-01

Architektura bezpieczeństwa SaaS

Model nadrzędny i 18 obszarów kontroli

## SEC-02

IAM, role, capabilities i data scope

Model użytkownik-tenant-workspace-zasób

## SEC-03

Macierz dostępu UI/API

Role, akcje, brak dostępu, approval i audyt

## SEC-04

Uwierzytelnianie, sesje i zaproszenia

MFA, tokeny, recovery i invitation lifecycle

## SEC-05

Izolacja tenantów i workspace

API, DB, cache, joby, storage, AI i eksporty

## SEC-06

Bezpieczeństwo integracji

Scopes, credentials, sync, webhooki i recovery

## SEC-07

AI Governance i Asystent

Retrieval, evidence, provider, koszty i historia

## SEC-08

AI Actions i approval

Klasy ryzyka, wykonanie, partial failure i rollback

## SEC-09

Eksporty

Generowanie, approval, download, expiry i retencja

## SEC-10

Udostępnianie raportów

Granty wewnętrzne i zewnętrzne, tokeny i watermark

## SEC-11

Audit log i integralność

Append-only, tamper detection, buffer i fail-closed

PAPADATA | SEC-00 | Przewodnik po pakiecie dokumentacji bezpieczeństwa

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Kod

Dokument

Rola

## SEC-12

Support JIT i impersonation

Czasowy dostęp, customer visibility i pełny ślad

## SEC-13

Retencja i deletion ledger

Pełny lifecycle danych, backup i restore

## SEC-14

Backend i API

Policy enforcement, idempotency, joby i błędy

## SEC-15

Frontend i Storybook

Stany bezpieczeństwa, workspace switch i kontrakty

## UI

## SEC-16

Plan QA Given/When/Then

Testy P0 i dowody akceptacyjne

## SEC-17

Rejestr ryzyk

Wpływ, prawdopodobieństwo, kontrola i blocker

## MVP

## SEC-18

Go-live, incydenty i dowody

Bramy, runbooki, restore, pentest i sign-off

## SEC-19

Rejestr decyzji bezpieczeństwa

## 15 przyjętych decyzji i parametry wykonawcze

Klasy treści

Oznaczenie

Znaczenie

Sposób użycia

Fakt potwierdzony

Wynika z dokumentacji lub przyjętej decyzji

Może być użyty jako wymaganie, ale nie jako

dowód implementacji

Założenie robocze

Uzupełnia brak parametru bez zmiany

architektury

Musi być zweryfikowane przed zamrożeniem

kontraktu

Luka

Brak decyzji, parametru, implementacji albo

dowodu

Wymaga właściciela i planu zamknięcia

Rekomendacja

Proponowany sposób realizacji

Staje się normą po zatwierdzeniu

Decyzja krytyczna

Brak rozstrzygnięcia blokuje implementację

lub go-live

Musi trafić do SEC-19

Statusy realizacji kontroli

Status

Definicja

Dozwolone przejście

## PLANNED

Wymaganie opisane, brak implementacji

Do IMPLEMENTED po przeglądzie

kodu/konfiguracji

## IMPLEMENTED

Kontrola istnieje, ale nie ma pełnego dowodu

testowego

Do VERIFIED po pozytywnym teście

## VERIFIED

Kontrola przeszła wymagane testy

Do OPERATING po okresie obserwacji

## OPERATING

Kontrola działa i posiada monitoring

Do DEGRADED/FAILED po wykryciu

problemu

## DEGRADED

Kontrola działa częściowo albo z kontrolą

kompensacyjną

Wymaga ryzyka i terminu

## FAILED

Kontrola nieskuteczna

Blokuje odpowiedni zakres

## ACCEPTED_EXCEPTION

Formalnie zaakceptowany wyjątek czasowy

Musi mieć właściciela i datę wygaśnięcia

PAPADATA | SEC-00 | Przewodnik po pakiecie dokumentacji bezpieczeństwa

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Traceability

Każde wymaganie powinno otrzymać stabilny identyfikator w formacie SEC-XX-REQ-NNN. Powiązany test używa

formatu SEC-XX-TST-NNN, zdarzenie audytowe SEC-AUD-EVT-NNN, a ryzyko SEC-RSK-NNN.

Element

Wymagane powiązania

Wymaganie

Decyzja, właściciel, kod/konfiguracja, test, dowód, ryzyko

Endpoint

Capability, data scope, risk class, audit event, deny tests

Ekran

Role, dane, akcje, stany, API, Storybook, test E2E

AI use case

Dane, retrieval policy, prompt/model version, eval, koszt, retention

Integracja

Scopes, credential lifecycle, sync contract, runbook, monitoring

Operacja krytyczna

Reauth, approval, audit intent, idempotency, rollback

Definition of Done dokumentacji



Nazwy encji, ról i statusów są spójne w całym pakiecie.



Każdy proces ma stan początkowy, końcowy, błędy, odzyskiwanie i audyt.



Każdy ekran i endpoint ma allow oraz deny test.



Każda operacja P0 ma dowód implementacji i wynik testu.



Brak wartości parametrów jest oznaczony jako decyzja wykonawcza, nie ukryty jako założenie.



Dokumenty Word i PDF są generowane z tej samej wersji treści.

Zasady zarządzania dokumentem



Zmiana wymagania bezpieczeństwa wymaga wersji dokumentu, analizy wpływu i aktualizacji powiązanych

kontraktów.



Zmiana granicy danych, modelu ról, poziomu ryzyka lub approval wymaga decyzji architektonicznej.



Każde wymaganie P0 musi posiadać właściciela, implementację, test, wynik oraz odwołanie do dowodu.



Wyjątek od wymagania wymaga formalnej akceptacji ryzyka z terminem wygaśnięcia.



Dowody nie mogą być przechowywane wyłącznie w treści tego dokumentu.

## Klauzula spójności wersji 2.0

W przypadku sprzeczności z wcześniejszym sformułowaniem tego dokumentu obowiązują decyzje centralne wskazane w Dokumencie 2, w szczególności zasada pełnej funkcjonalności MVP przy ograniczonym katalogu kompletnych integracji, GCP jako platforma docelowa, parzystość kontraktów środowisk, dwupoziomowy model tenant/workspace, capabilities z data scope, AI Actions pod kontrolą człowieka oraz pełny billing i self-service w wariancie MVP.
