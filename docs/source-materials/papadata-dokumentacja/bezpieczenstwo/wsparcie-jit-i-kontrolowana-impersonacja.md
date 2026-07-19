# Wsparcie JIT i kontrolowana impersonacja

PAPADATA | SEC-12 | Support JIT i kontrolowane impersonation

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Support JIT i kontrolowane impersonation

Wniosek, cel, zakres, approval, czasowy grant, widoczność klienta i audyt

Kod dokumentu

## SEC-12

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

PAPADATA | SEC-12 | Support JIT i kontrolowane impersonation

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

Zasada

Decyzja krytyczna: Support nie posiada stałego dostępu do danych klienta. Każdy dostęp jest czasowy, celowy,

ograniczony i w pełni audytowany.

Model procesu

1.

Support tworzy wniosek wskazujący ticket, cel, workspace, zakres danych, operacje i oczekiwany czas.

2.

System automatycznie odrzuca zakres szerszy niż dostępny dla danego typu zgłoszenia.

3.

Wniosek jest zatwierdzany zgodnie z polityką tenanta i klasą danych.

4.

Po zatwierdzeniu powstaje czasowy SupportGrant i osobna oznaczona sesja.

5.

Impersonation jest możliwe wyłącznie, jeśli jest niezbędne i jawnie objęte grantem.

6.

Klient może widzieć aktywny dostęp Supportu, zakres i czas wygaśnięcia.

7.

Grant wygasa automatycznie lub jest ręcznie odwoływany.

8.

Wynik działań i dostęp do danych są powiązane z ticketem.

SupportGrant

Pole

Wymaganie

ticketId/purpose

Obowiązkowy cel i odniesienie do zgłoszenia

tenantId/workspaceId

Jeden jawny scope

requester/approver

Różne role, jeśli wymaga tego policy

capabilities

Minimalny zamknięty zestaw

dataScope

Domeny, obiekty, pola i poziom szczegółowości

impersonationAllowed

Jawna flaga; domyślnie false

PAPADATA | SEC-12 | Support JIT i kontrolowane impersonation

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Pole

Wymaganie

validFrom/expiresAt

Krótki czas; brak bezterminowego grantu

status

## PENDING, APPROVED, ACTIVE, EXPIRED, REVOKED, DENIED

customerVisibility

Czy i jak klient jest powiadamiany

reasonForExtension

Nowe approval dla przedłużenia

Impersonation



UI i audit jednoznacznie wskazują, że sesja jest impersonowana.



Każdy audit event zawiera support actor oraz impersonated identity.



Support nie może zatwierdzać operacji jako impersonowany użytkownik, jeśli byłby approverem własnego działania.



Operacje R3/R4 mogą być zabronione w impersonation lub wymagać odrębnego approval klienta.



Hasła, MFA secrets, backup codes i credential integracji nie są dostępne Supportowi.

Dostęp do treści

Poziom

Domyślna polityka

Metadata techniczne

Dostępne w ramach odpowiedniej capability JIT

Statusy jobów/integracji

Dostępne bez payloadów biznesowych

Dane zagregowane

Tylko gdy niezbędne dla diagnozy

Dane szczegółowe

Wymagają jawnego scope i często approval klienta

Sekrety/tokeny

Nigdy nie są zwracane

Eksporty/raporty

Dostęp tylko jeśli objęty ticketem i capability

Wygaśnięcie i revoke



Wygaśnięcie unieważnia tokeny, sesje, signed URLs i aktywne połączenia.



Długie operacje Supportu są anulowane albo przejmowane przez proces systemowy zgodnie z policy.



Przedłużenie tworzy nową decyzję i audit event.



Manual revoke działa natychmiastowo.

Audit i monitoring

Event

Dane

## SUPPORT_JIT_REQUESTED

ticket, purpose, scope, duration

## SUPPORT_JIT_APPROVED/DENIED

approver, rationale, policy

## SUPPORT_JIT_STARTED

session, auth strength, grant

## SUPPORT_IMPERSONATION_STARTED/ENDED

support actor, impersonated identity

## SUPPORT_DATA_ACCESSED

resource class, scope; bez pełnej treści

## SUPPORT_JIT_EXTENDED/REVOKED/EXPIRED

actor/system, reason, affected sessions

PAPADATA | SEC-12 | Support JIT i kontrolowane impersonation

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

## QA



Grant nie działa poza wskazanym workspace.



Grant nie działa po expiry ani revoke.



Impersonation bez jawnej flagi jest blokowane.



Support nie widzi sekretów i backup codes.



Support actor nie może zatwierdzić własnego R3/R4 działania przez impersonation.



Klient widzi aktywną sesję, jeśli polityka wymaga widoczności.



Awaria audytu blokuje rozpoczęcie JIT i impersonation.

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
