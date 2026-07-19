# Architektura bezpieczeństwa SaaS PapaData

PAPADATA | SEC-01 | Architektura bezpieczeństwa SaaS PapaData

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

Architektura bezpieczeństwa SaaS

PapaData

Model nadrzędny: role, dostęp, AI, integracje, audit log i QA

Kod dokumentu

## SEC-01

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

PAPADATA | SEC-01 | Architektura bezpieczeństwa SaaS PapaData

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

1. Wnioski główne

PapaData przetwarza wrażliwe dane biznesowe, finansowe, sprzedażowe, marketingowe i potencjalnie osobowe.

Bezpieczeństwo musi być elementem kontraktu każdego procesu, a nie warstwą dodawaną po implementacji.

Decyzja krytyczna: Tenant jest podstawową granicą izolacji klienta, własności danych i polityk.

Workspace jest dodatkową granicą operacyjną wewnątrz tenanta i nie może istnieć bez tenantId.



Pełny model role + capabilities + data scope obowiązuje od MVP.



AI, eksporty, udostępnianie raportów, Support JIT, audit integrity i deletion ledger są pełnymi funkcjami MVP.



Ograniczenie MVP dotyczy liczby kompletnych integracji i wariantów, nie kompletności procesów.

2. Model bezpieczeństwa produktu

Każda decyzja dostępu jest obliczana na backendzie z kontekstu tożsamości, sesji, polityki tenanta, membershipu

workspace, capabilities, data scope, entitlement, stanu zasobu, klasy ryzyka, approval i wersji polityki.

Warstwa

Odpowiedzialność bezpieczeństwa

Tenant

Właścicielstwo, billing, polityki MFA i sesji, użytkownicy tenanta

Workspace

Dane, role operacyjne, integracje, AI, raporty, eksporty i działania

Resource

Własny workspace, klasyfikacja, stan, wersja, owner i data scope

Operation

Capability, risk class, reauth, approval, idempotency i audit

Evidence

Niezmienny ślad decyzji, wersji policy, modelu, danych i wyniku

PAPADATA | SEC-01 | Architektura bezpieczeństwa SaaS PapaData

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

3. Model ról i uprawnień

Rola

Widoczność

Może

Nie może

Tenant Owner

Tenant i wszystkie przypisane

workspace

Własność, polityki tenanta, billing,

zatwierdzanie operacji krytycznych

Nie omija polityk, data scope, audytu

ani dual approval

Workspace Admin

Wskazany workspace

Użytkownicy, integracje, ustawienia,

raporty i operacje administracyjne

Brak automatycznego dostępu do

billingu, danych szczegółowych i

approval wysokiego ryzyka

Analyst

Dane i domeny wynikające z data

scope

Analizy, KPI, raporty, eksporty i AI

Brak zarządzania tożsamością,

politykami i billingiem

Marketing Operator

Dane marketingowe i przypisane

źródła

Analizy marketingowe i dozwolone

działania

Brak dostępu poza zakresem

marketingowym

Viewer

Przypisane dashboardy i raporty

Odczyt; eksport wyłącznie z osobną

capability

Brak mutacji i działań AI

Billing Admin

Billing tenanta

Plan, faktury i metody płatności

Brak danych analitycznych bez

osobnego membershipu

Auditor/Security

Audit log, polityki i dowody

Odczyt i kontrolowany eksport

dowodów

Brak modyfikacji danych biznesowych

Internal Support/Operations

Tylko zakres aktywnego grantu JIT

Diagnoza, kontrolowane impersonation

i operacje wsparcia

Brak stałego dostępu i brak dostępu

poza ticketem

4. Macierz dostępu

Szczegółowa macierz znajduje się w SEC-03. Minimalne domeny macierzy obejmują dashboard, analitykę, integracje,

AI, raporty, eksporty, użytkowników, role, workspace, billing, audit log, zaproszenia, polityki bezpieczeństwa, Support JIT

i retencję.

5. Kontrola dostępu do ekranów UI/UX



Nawigacja i widoczność elementów są wynikiem SessionContext, ale nie zastępują autoryzacji endpointu.



Zmiana workspace anuluje zapytania, czyści cache, historię AI i dane ekranu oraz pobiera nowy kontekst.



Każdy ekran obsługuje forbidden, session expired, membership revoked, workspace suspended i policy blocked.



Operacje wrażliwe pokazują zakres, wpływ, odwracalność, poziom ryzyka i wymagany approval.



Dane z poprzedniego workspace nie mogą zostać wyrenderowane po spóźnionej odpowiedzi.

6. Autoryzacja i uwierzytelnianie

MVP obejmuje pełny lifecycle MFA, recovery, backup codes, krótkotrwałe access tokeny, rotowane refresh tokeny, reuse

detection, listę sesji, revoke, idle timeout, absolute timeout, zaproszenia jednorazowe i reautoryzację.

7. Workspace, tenant i izolacja danych

Izolacja obejmuje API, bazę danych, storage, cache, kolejki, joby, eksporty, udostępnienia, indeksy wyszukiwania,

retrieval AI, support i backup. Test cross-workspace jest obowiązkowym release gate.

8. Integracje i dane zewnętrzne

Każda integracja MVP działa kompletnie: autoryzacja, minimalne wersjonowane scopes, initial sync, incremental sync,

webhooki, retry, reauth, disconnect, monitoring, audit, retencja, mapowanie i kontrola uprawnień.

PAPADATA | SEC-01 | Architektura bezpieczeństwa SaaS PapaData

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

9. AI i bezpieczeństwo rekomendacji

Asystent analizuje KPI, trendy, anomalie, okresy i przyczyny, tworzy raporty, proponuje działania i inicjuje dozwolone

operacje. AI nie może omijać policy, ustanawiać readiness, zmieniać definicji KPI ani wykonywać działania bez Action

Service.

10. Audit log

Audit log jest append-only, posiada niezależny backup, wykrywanie manipulacji i durable buffer. Operacje wysokiego

ryzyka działają fail-closed, jeśli nie można utrwalić audit intent.

11. Komunikaty bezpieczeństwa w UI

Komunikat przekazuje: co się stało, jakiego zakresu dotyczy problem, jaki jest wpływ, jaka akcja jest dostępna i czy

potrzebna jest inna rola. Nie ujawnia istnienia zasobów niedostępnych użytkownikowi.

12. Ryzyka bezpieczeństwa

Rejestr SEC-17 obejmuje ryzyka cross-workspace, przejęcia sesji, nadmiernych scopes, eksportów, zewnętrznych

grantów, prompt injection, nadmiernej autonomii AI, awarii audytu, impersonation i nieskutecznego usunięcia danych.

13. Wymagania backendu i API



Centralny Policy Enforcement Point i obowiązkowy workspace scope.



Idempotency-Key dla jobów i działań; expectedVersion/ETag dla mutacji.



Audit intent przed operacją wysokiego ryzyka i wynik po zakończeniu.



Joby nie mogą obchodzić policy ani audit.



Błędy zawierają kod, wpływ, next action i correlationId.

14. Wymagania frontendu i Storybooka

Storybook dokumentuje role, data scope, stany security, reauth, approval, partial failure, rollback, token expiry, JIT

Support i zmianę workspace. Fixture musi przechodzić walidację kontraktu API.

15. Wymagania QA

SEC-16 definiuje scenariusze Given/When/Then dla identity, isolation, roles, integrations, AI, actions, exports, sharing,

audit, support, retention i restore.

16. Zakres MVP / Etap 2 / Później

Poziom

Zakres

## MVP

Pełne procesy główne, jeden provider AI, mały katalog kompletnych

integracji, pełny model bezpieczeństwa

Etap 2

Kolejni providerzy, więcej action types, bardziej rozbudowane policy

builders, SCIM i federacyjne SSO

Później

Wieloregionowość, zaawansowane DLP, rozbudowana automatyzacja

enterprise i większa skala

PAPADATA | SEC-01 | Architektura bezpieczeństwa SaaS PapaData

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

5

17. Decyzje do podjęcia

Architektura została zatwierdzona. Do zamknięcia pozostają parametry wykonawcze: TTL tokenów, metody MFA, klasy

retencji, lista action types, dokładne reguły approval, provider AI, lista integracji MVP i czasy retencji.

18. Rekomendowana kolejność prac

1.

Zamrożenie modeli tenant, workspace, membership, capabilities i risk classes.

2.

Identity, session management, Policy Enforcement Point i audit integrity.

3.

Pierwsza kompletna integracja i kontrakt danych.

4.

Eksporty, Report Sharing i retencja.

5.

AI Gateway, Asystent, Actions i Approval Service.

6.

Support JIT, restore, incident response i niezależny review.

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
