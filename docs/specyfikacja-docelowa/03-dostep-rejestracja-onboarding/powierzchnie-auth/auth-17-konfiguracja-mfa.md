---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: auth-surface
surface_id: auth-17
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Konfiguracja MFA

## Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `MfaEnrollmentReady` z powodu `mfaEnrollmentRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Privileged or policy-required MFA enrollment active**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

## Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `factorType` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `enrollmentChallenge` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `verificationCode` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

## Akcje
- Akcja główna: **Skonfiguruj MFA**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

## Kontrakt operacji
`auth.mfa.enroll` (`command`, `POST /api/v1/auth/mfa/enroll`), request `AuthMfaEnrollRequest`, response `AuthMfaEnrollResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-16`. Błąd prowadzi do `auth-17`; retry do `brak automatycznego retry`. Akcja maszyny: **create MFA secret/challenge and require confirmation through auth-16**.

## Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: secret masking, recovery codes once, audit.

## Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

## Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

## Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.
