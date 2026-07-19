# Rejestr decyzji bezpieczeństwa MVP

PAPADATA | SEC-19 | Rejestr decyzji bezpieczeństwa MVP

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

## Pozycja dokumentu w governance

SEC-19 nie jest konkurencyjnym rejestrem decyzji. Dokument opisuje wykonawczą interpretację i dowody bezpieczeństwa dla decyzji utrzymywanych wyłącznie w Dokumencie 2. W razie sprzeczności obowiązuje treść i status decyzji centralnej.

## PAPADATA

Rejestr decyzji bezpieczeństwa MVP

Przyjęte decyzje architektoniczne i parametry wykonawcze

Kod dokumentu

## SEC-19

Wersja

1.0

Status

zatwierdzona w centralnym Rejestrze decyzji - architektura docelowa; wymagane dowody

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

PAPADATA | SEC-19 | Rejestr decyzji bezpieczeństwa MVP

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

Fakt potwierdzony: Wszystkie decyzje skorygowanego modelu MVP mają status zatwierdzona w centralnym Rejestrze decyzji i obowiązują od MVP.

Ograniczenie: Dokumentacja nie jest dowodem wdrożenia. Każda kontrola wymaga osobnego dowodu

technicznego i testowego.

Status wspólny decyzji

Status interpretacji wykonawczej: Status: zatwierdzona w centralnym Rejestrze decyzji | Zakres: obowiązuje dla MVP | Zasada: pełna funkcjonalność, ograniczona liczba

integracji | Zmiana: wymaga decyzji architektonicznej oraz aktualizacji kontraktów

Przyjęte decyzje

## ID

Temat

Treść decyzji

## DEC-SEC-MVP-001

Granica tenantu

Tenant: handel, ownership, billing i polityki;

workspace: dane, autoryzacja i operacje

## DEC-SEC-MVP-002

Capabilities

Role domyślne + capabilities + data scope; pełny

model od MVP

## DEC-SEC-MVP-003

## MFA

Obowiązkowe dla uprzywilejowanych; możliwe

wymuszenie dla całego tenanta; recovery i backup

codes

## DEC-SEC-MVP-004

Sesje

Krótkie access tokeny, rotowane refresh, reuse

detection, list/revoke i polityki czasu

## DEC-SEC-MVP-005

Zaproszenia

Jednorazowe, czasowe, email-bound; pełny lifecycle

i audyt

## DEC-SEC-MVP-006

Eksporty

Aggregate/detail/report, async, history, expiry, reauth

i approval high-risk

## DEC-SEC-MVP-007

Audit storage

Append-only, niezależny backup i tamper detection

## DEC-SEC-MVP-008

Support

JIT, ticket, cel, scope, expiry, revoke, audyt i

kontrolowane impersonation

## DEC-SEC-MVP-009

AI Assistant

Pełny asystent analityczny, raporty, integracje,

historia i actions w ramach policy

## DEC-SEC-MVP-010

AI provider

Jeden provider przez wewnętrzny gateway z

PAPADATA | SEC-19 | Rejestr decyzji bezpieczeństwa MVP

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

## ID

Temat

Treść decyzji

routingiem, minimalizacją, versioning i kosztami

## DEC-SEC-MVP-011

AI Actions

Risk-based confirmation, reauth, approval, dual

approval/block; execution, retry i rollback

## DEC-SEC-MVP-012

Retencja

Klasy retencji i deletion ledger dla wszystkich

warstw, backupów, AI, providerów i sekretów

## DEC-SEC-MVP-013

Integracje

Minimalne, jawne i wersjonowane scopes; mały

katalog kompletnych konektorów

## DEC-SEC-MVP-014

Awaria audytu

Fail-closed dla high-risk, durable buffer dla

pozostałych

## DEC-SEC-MVP-015

Udostępnianie raportów

Internal/external, token, expiry, revoke, usage limit,

password, email binding, watermark i audit

Zasada nadrzędna MVP

MVP ogranicza liczbę obsługiwanych integracji i wariantów konfiguracyjnych, ale nie usuwa kluczowych funkcji produktu.

Każda funkcja włączona do MVP posiada pełne stany sukcesu, błędu, oczekiwania, anulowania, odzyskiwania, retencję,

audyt, monitoring i testy.

Parametry wykonawcze wymagające decyzji

## ID

Parametr

Owner decyzyjny

Termin/brama

## PAR-AUTH-001

Access token TTL

Security/Backend

Przed zamrożeniem auth contract

## PAR-AUTH-002

Refresh TTL, idle i absolute timeout

Security/Product

Przed testami sesji

## PAR-AUTH-003

Metody MFA i recovery evidence

Security/Product

Przed UI i provider selection

## PAR-INV-001

Invitation TTL i limity resend

Product/Security

Przed implementacją invitation

## PAR-RSK-001

Pełny katalog operacji R0-R4

Product/Security

Przed Actions/Exports/Sharing

## PAR-APR-001

Dual approval i reguła niezależności

Security/Product

Przed Action Service

## PAR-EXP-001

Klasy eksportów i retencja plików

Data/Security

Przed Export Service

## PAR-SHR-001

TTL, maxUses i verification external

grant

Product/Security

Przed Sharing Service

## PAR-AUD-001

Retencja audytu i partycjonowanie

hash chain

Security/Ops

Przed Audit Service go-live

## PAR-SUP-001

Domyślny/maksymalny czas JIT i

przypadki impersonation

Support/Security

Przed JIT

## PAR-AI-001

Provider, region, modele i warunki

przetwarzania

AI/Privacy/Security

Przed danymi klientów

## PAR-AI-002

Retencja

prompt/output/evidence/embeddings

AI/Privacy

Przed historią AI

## PAR-ACT-001

Lista action types MVP i rollback

Product/Integrations

Przed Action Service

## PAR-INT-001

Ostateczny katalog providerów MVP

Product/Integrations

Przed harmonogramem

## PAR-RET-001

Wartości klas retencji i deletion SLA

Privacy/Data/Ops

Przed produkcją

## PAR-BCP-001

RTO/RPO po restore exercise

Ops/Product

Przed zobowiązaniami

PAPADATA | SEC-19 | Rejestr decyzji bezpieczeństwa MVP

Wersja 2.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Reguły zmiany decyzji



Zmiana tworzy nową wersję lub decyzję zastępującą; nie usuwa historii.



Zmiana wymaga analizy wpływu na API, model danych, UI, audit, testy i istniejące dane.



Zmiana granicy workspace, capabilities, risk class lub retencji wymaga migracji i planu rollback.



Status zatwierdzona w centralnym Rejestrze decyzji nie może zostać utożsamiony ze statusem Implemented lub Verified.

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
