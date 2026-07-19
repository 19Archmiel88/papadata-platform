# Wymagania bezpieczeństwa frontendu i Storybooka

PAPADATA | SEC-15 | Wymagania bezpieczeństwa frontendu i Storybooka

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Wymagania bezpieczeństwa frontendu i

Storybooka

Stany dostępu, workspace switch, reauth, approval, masking i kontrakty UI

Kod dokumentu

## SEC-15

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

PAPADATA | SEC-15 | Wymagania bezpieczeństwa frontendu i Storybooka

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

Fakt potwierdzony: Ukrycie elementu UI nie jest kontrolą bezpieczeństwa. Frontend komunikuje decyzję backendu

i nie może samodzielnie nadawać dostępu.

SessionContext i powłoka

Element

Wymaganie

Aktywny tenant i workspace

Wyświetlane jednoznacznie; zmiana wymaga rewalidacji

Effective role/capabilities

Używane do prezentacji, ale nie jako jedyne zabezpieczenie

Policy obligations

MFA required, reauth, approval, masking, quota

Workspace status

active, suspended, read-only, blocked

Session status

active, expiring, revoked, reauth required

Notifications

Security, integration, export, AI action i Support JIT

Zmiana workspace

1.

Zablokuj zmianę lub poproś o decyzję przy niezapisanym formularzu.

2.

Anuluj requesty, streamy, uploady i lokalne job polling.

3.

Usuń dane ekranu, cache, drafty, kontekst AI i identyfikatory zasobów.

4.

Pobierz nowy SessionContext.

5.

Odrzuć odpowiedzi oznaczone poprzednim context version.

6.

Renderuj dane dopiero po potwierdzeniu nowego workspace.

PAPADATA | SEC-15 | Wymagania bezpieczeństwa frontendu i Storybooka

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3

Obowiązkowe stany ekranów

Stan

Zachowanie

## LOADING

Bez wyświetlania danych starego kontekstu

## EMPTY

Jawny brak danych, nie zero

## PARTIAL

Zakres braków, wpływ i next action

## STALE

Ostatnia aktualizacja i wpływ

## FORBIDDEN

Brak danych; bez nadmiernego ujawnienia zasobu

## SESSION_EXPIRED

Bezpieczny powrót po ponownym logowaniu

## MEMBERSHIP_REVOKED

Wyczyszczenie danych i powrót do wyboru

## WORKSPACE_SUSPENDED

Dozwolone tylko bezpieczne operacje

## REAUTH_REQUIRED

Powrót do dokładnie tej operacji po sukcesie

## APPROVAL_REQUIRED

Status, approverzy i expiry

## OPERATION_PARTIAL

Jawny zakres sukcesu i błędu

## POLICY_BLOCKED

Powód bez ujawniania wrażliwej konfiguracji

Formularze i operacje wrażliwe



Walidacja klientowa wspiera UX, lecz serwer ponownie waliduje wszystkie pola.



Sekrety i tokeny nie wracają w formularzach.



Przed operacją R2-R4 UI pokazuje cel, zakres, wpływ, odwracalność i wymagania approval.



Po sukcesie UI pokazuje trwały wynik i kolejny krok, nie tylko toast.



Po błędzie UI nie zakłada, że operacja nie została wykonana; dla nieznanego wyniku pokazuje reconciliation.

Eksporty, sharing i AI

Obszar

Wymagane stany

Eksport

requested, awaiting reauth, awaiting approval, generating, ready,

partial, failed, expired, revoked

Report Sharing

internal, external, email mismatch, password, usage limit, expired,

revoked, masked

## AI

disabled, insufficient, generating, answered, partial, needs review,

expired, provider error, blocked

AI Action

proposal, confirmation, reauth, approval, executing, partial, rollback,

failed

Support JIT

pending, approved, active, expiring, revoked, expired, impersonation

Storybook - minimalny kontrakt historii



Kontekst tenanta, workspace, roli, capabilities i data scope.



Stan sesji i polityki MFA.

PAPADATA | SEC-15 | Wymagania bezpieczeństwa frontendu i Storybooka

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4



Dane wejściowe, klasyfikacja, readiness i freshness.



Akcja użytkownika oraz spodziewany request/response.



Audit event oczekiwany po akcji.



Warianty jasny/ciemny, klawiatura, focus i wysoki kontrast.



Happy path, dwa błędy domenowe, forbidden, reauth i expired.



Fixture walidowana względem kontraktu API.

Bezpieczne renderowanie



Treści providerów, użytkowników i AI są traktowane jako niezaufane.



Brak wykonywania HTML/Markdown bez sanitizacji i allowlisty.



Linki zewnętrzne są jawnie oznaczone i nie otrzymują tokenów w referrer.



Pliki są pobierane, nie wykonywane w kontekście aplikacji.



CSP, frame restrictions i ochrona przed clickjacking są częścią runtime.

QA frontendu



Spóźniona odpowiedź starego workspace nie jest renderowana.



Przycisk ukryty nie uniemożliwia bezpośredniego API testu - backend nadal odrzuca.



Po 401/403 dane ekranu są czyszczone.



Reauth wraca do właściwej operacji bez jej automatycznego wykonania.



Impersonation jest stale widoczne.



Dane zamaskowane nie występują w DOM ani payloadzie.



Storybook pokrywa wszystkie stany wymagane dla MVP.

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
