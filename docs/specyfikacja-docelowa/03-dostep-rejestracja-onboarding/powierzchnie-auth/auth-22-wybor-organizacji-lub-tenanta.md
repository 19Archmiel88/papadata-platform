---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: auth-surface
surface_id: auth-22
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Wybór organizacji lub tenanta

## Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `TenantSelectionReady` z powodu `tenantSelectionRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **User has more than one tenant membership**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

## Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `tenantId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

## Akcje
- Akcja główna: **Wybierz organizację**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

## Kontrakt operacji
`access.tenant.select` (`command`, `POST /api/v1/access/tenant/select`), request `AccessTenantSelectRequest`, response `AccessTenantSelectResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-23|auth-29`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **store selected tenant context**.

## Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: membership check, no cross-tenant leakage.

## Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

## Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

## Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.
