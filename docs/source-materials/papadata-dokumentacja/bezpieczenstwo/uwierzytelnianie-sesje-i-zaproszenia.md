# Uwierzytelnianie sesje i zaproszenia

PAPADATA | SEC-04 | Uwierzytelnianie, sesje i zaproszenia

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

1

## PAPADATA

Uwierzytelnianie, sesje i zaproszenia

MFA, recovery, token rotation, reuse detection i invitation lifecycle

Kod dokumentu

## SEC-04

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

PAPADATA | SEC-04 | Uwierzytelnianie, sesje i zaproszenia

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

Model uwierzytelniania MVP

Fakt potwierdzony: MFA, pełny lifecycle sesji i jednorazowe zaproszenia są pełnymi funkcjami MVP.

Proces

Ryzyko

Mechanizm MVP

Konsekwencje UI

Audit

Logowanie

enumeracja, brute force

neutralne błędy, rate limit, risk

signals

invalid/locked/MFA/expired

## LOGIN_*

MFA activation

przejęcie konfiguracji

fresh auth, secret QR tylko raz,

backup codes

setup/verify/success

## MFA_ENROLLED

MFA challenge

bypass

server-side challenge i limit

prób

challenge/locked/recovery

## MFA_CHALLENGE_*

Recovery

account takeover

jednorazowy token, neutralna

odpowiedź, dodatkowa

weryfikacja

requested/expired/completed

## RECOVERY_*

Refresh

token theft/replay

rotacja, token family, reuse

detection

session terminated alert

## TOKEN_REUSE_DETECTED

Session revoke

utrzymanie dostępu

natychmiastowe unieważnienie

po zmianie

uprawnień/incydencie

lista sesji i wynik

## SESSION_REVOKED

Invitation

przejęcie membershipu

jednorazowy, czasowy, email-

bound, hash tokenu

valid/expired/wrong email

## INVITATION_*

Reauthentication

stara sesja do high-risk

fresh MFA lub równoważna

metoda

modal z powrotem do operacji

## REAUTH_*

## MFA



MFA jest obowiązkowe dla użytkowników uprzywilejowanych.

PAPADATA | SEC-04 | Uwierzytelnianie, sesje i zaproszenia

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

3



Tenant Owner może wymusić MFA dla wszystkich członków tenanta.



System obsługuje aktywację, weryfikację, recovery, backup codes i regenerację kodów.



Wyłączenie MFA wymaga fresh reauthentication i jest audytowane.



Użytkownik niespełniający nowej polityki otrzymuje ograniczony dostęp wyłącznie do konfiguracji MFA i

bezpiecznego wylogowania.

Sesje i tokeny

Element

Wymaganie

Access token

Krótkotrwały; nie zawiera kompletnej listy uprawnień jako jedynego

źródła prawdy

Refresh token

Rotowany przy każdym użyciu; przechowywany bezpiecznie;

powiązany z rodziną tokenów

Reuse detection

Ponowne użycie tokenu unieważnia rodzinę i generuje alert

Idle timeout

Konfigurowalny w polityce tenanta w dopuszczalnych granicach

Absolute timeout

Sesja wygasa niezależnie od aktywności

Session list

Urządzenie, czas, przybliżona lokalizacja, metoda auth, ostatnia

aktywność

Revoke

Pojedyncza sesja, wszystkie inne sesje lub wszystkie sesje

Policy revoke

Automatyczne po zmianie roli, capability, MFA policy, hasła lub

incydencie

Zaproszenia

Zaproszenie jest wersjonowanym rekordem dostępu. Zmiana adresu, roli, workspace, data scope lub daty ważności

unieważnia poprzedni token.

Stan

Znaczenie

Dozwolone akcje

## DRAFT

Nie wysłano

edytuj, wyślij, anuluj

## SENT

Token aktywny

resend z rotacją tokenu, zmień, anuluj

## ACCEPTED

Membership utworzony

brak ponownego użycia

## EXPIRED

Minął termin

utwórz nową wersję

## REVOKED

Anulowane

brak akceptacji

## CONFLICT

Konto lub membership koliduje

bezpieczne rozstrzygnięcie przez Admina

Parametry wykonawcze do zatwierdzenia

Parametr

Wymagane rozstrzygnięcie

Status

Access token TTL

Dokładna długość i dopuszczalne odchylenie

czasu

Decyzja wykonawcza

Refresh token TTL

Czas bezwzględny i idle policy

Decyzja wykonawcza

PAPADATA | SEC-04 | Uwierzytelnianie, sesje i zaproszenia

Wersja 1.0

Dokument projektowy - nie stanowi dowodu

wdrożenia

4

Parametr

Wymagane rozstrzygnięcie

Status

Invitation TTL

Domyślna i maksymalna wartość

Decyzja wykonawcza

Metody MFA

TOTP, WebAuthn lub inne

Decyzja wykonawcza

Lockout/rate limit

Progi i czas blokady bez DoS na konto

Decyzja wykonawcza

Fresh-auth window

Maksymalny wiek uwierzytelnienia dla klas

## R2-R4

Decyzja wykonawcza

Kryteria QA



Token zaproszenia nie może zostać użyty drugi raz.



Token zaproszenia nie działa dla innego adresu e-mail.



Refresh token reuse unieważnia całą rodzinę.



Zmiana roli blokuje kolejną operację w aktywnej sesji.



Użytkownik może zamknąć pojedynczą i wszystkie sesje.



Recovery nie ujawnia istnienia konta.



Operacja R3 nie działa bez fresh reauthentication.



Kody zapasowe są jednorazowe i przechowywane jako bezpieczne skróty.

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
