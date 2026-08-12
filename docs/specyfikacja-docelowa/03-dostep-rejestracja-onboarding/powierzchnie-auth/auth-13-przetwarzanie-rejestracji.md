---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: auth-surface
surface_id: auth-13
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Przetwarzanie rejestracji

## Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `RegistrationProcessing` z powodu `registrationSubmissionPending`. Wejście jest dozwolone tylko po spełnieniu guardu: **Email/company/consent preconditions complete**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

## Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `registrationDraftId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `idempotencyKey` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

## Akcje
- Akcja główna: **Finalizuj rejestrację**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

## Kontrakt operacji
`auth.registration.finalize` (`job`, `POST /api/v1/auth/registration/finalize`), request `AuthRegistrationFinalizeRequest`, response `AuthRegistrationFinalizeResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-14`. Błąd prowadzi do `auth-27`; retry do `auth-13`. Akcja maszyny: **create user, tenant/workspace bootstrap job or membership binding**.

## Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: transactional audit, idempotency key.

## Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

## Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

## Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.
