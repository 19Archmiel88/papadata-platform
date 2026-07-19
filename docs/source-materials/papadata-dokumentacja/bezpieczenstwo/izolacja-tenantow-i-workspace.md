# Izolacja tenantów i workspace

PAPADATA | SEC-05 | Izolacja tenantów i workspace

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Izolacja tenantów i workspace

Kontrole tenant-safe dla API, danych, jobów, storage, AI, eksportów i Supportu

Kod dokumentu

## SEC-05

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

PAPADATA | SEC-05 | Izolacja tenantów i workspace

Wersja 1.0

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

Model granic

Decyzja krytyczna: Tenant jest granicą izolacji klienta, własności danych, umowy, billingu i polityk.

Workspace jest przestrzenią operacyjną wewnątrz tenanta i należy do dokładnie jednego tenanta identyfikowanego przez tenantId.

Poziom

Zakres

Nie może zastąpić

Tenant

billing, ownership, policy, katalog

użytkowników

workspace scope zasobów

Workspace

dane, integracje, raporty, AI, joby, eksporty

capability i data scope

Resource

konkretny obiekt i klasyfikacja

membershipu

Operation

konkretny skutek, risk class i approval

autoryzacji zasobu

Inwarianty danych



Każdy zasób tenantowy posiada tenantId. Zasób należący do workspace posiada również workspaceId; zasób globalny platformy nie posiada tenantId ani workspaceId.



Relacje między zasobami nie mogą łączyć różnych workspace, chyba że istnieje jawny, kontrolowany obiekt

tenantowy bez danych biznesowych.



Klucz unikalny biznesowy zasobu tenantowego zawiera tenantId, a zasobu workspace zawiera co najmniej tenantId i workspaceId.



Deduplikacja i canonicalization nie mogą łączyć danych między workspace.



Raport, eksport, AI run, action proposal, approval i audit event zachowują workspace źródłowy.

Kontrole warstwowe

Warstwa

Kontrola obowiązkowa

Dowód

## API/BFF

SessionContext, workspace membership, capability,

allow/deny contract tests

PAPADATA | SEC-05 | Izolacja tenantów i workspace

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Warstwa

Kontrola obowiązkowa

Dowód

data scope

Application

Policy Enforcement Point przed query i command

unit/integration policy tests

Database

workspace filters, constraints, opcjonalnie RLS

cross-workspace DB tests

Cache

klucze z workspace, identity, scope i policy version

cache poisoning tests

Queue/Jobs

workspace w job envelope, revalidation przed

skutkiem

job isolation tests

Object storage

ścieżka i metadata workspace, signed URLs po

recheck

storage access tests

Search/vector index

oddzielny namespace lub obowiązkowy filtr

retrieval test z obcym ID

Exports

zamrożony scope, download reauthorization, expiry

export leak tests

Report sharing

ReportGrant niezależny od Membership

external grant tests

Support

JIT grant związany z workspace i czasem

JIT negative tests

Backup/restore

zachowanie scope i ponowne zastosowanie deletion

ledger

restore report

Zmiana workspace w UI

1.

Anulowanie aktywnych zapytań i streamów.

2.

Wyczyszczenie ekranów, cache klienta, wyborów, draftów i kontekstu AI.

3.

Pobranie nowego SessionContext.

4.

Odrzucenie spóźnionych odpowiedzi poprzedniego workspace.

5.

Ponowne pobranie danych dopiero po pozytywnej autoryzacji.

6.

Brak automatycznego przenoszenia filtrów zawierających identyfikatory zasobów.

Cross-workspace suite

Test

Wektor

Oczekiwany wynik

IDOR read

ID obcego raportu/datasetu/KPI

## 404 lub 403 bez danych i bez metadanych

IDOR write

PATCH/DELETE obcego zasobu

odmowa; brak zmiany

List filter

manipulacja workspaceId/query

wyniki wyłącznie aktywnego scope

Async job

podstawienie resultRef obcego jobu

odmowa

Signed URL

URL pliku obcego workspace

odmowa lub nieważny podpis

AI retrieval

prompt zawiera ID obcego zasobu

BLOCKED_BY_POLICY przed pobraniem

Export

pobranie pliku po zmianie membershipu

odmowa

Report grant

token raportu po revoke

odmowa

Support

JIT token na inny workspace

odmowa i alert

Cache

ten sam resource ID w dwóch workspace

brak kolizji i wycieku

PAPADATA | SEC-05 | Izolacja tenantów i workspace

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Monitoring



Liczba deny z kodem CROSS_WORKSPACE_ACCESS.



Próby użycia ID zasobów z innego workspace.



Brak workspaceId w jobie, audycie, pliku lub indeksie.



Rozbieżność tenantId-workspaceId.



Spóźnione odpowiedzi po workspace switch.

MVP blocker: Brak automatycznego zestawu testów cross-workspace blokuje dopuszczenie danych klientów.

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
