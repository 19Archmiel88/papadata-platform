---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Powierzchnie Auth — katalog 29 stanów

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-auth-01-wejscie-do-auth"></a>

## Wejście do Auth

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `AccessEntryReady` z powodu `entryRequested`. Wejście jest dozwolone tylko po spełnieniu guardu: **Resolve public entry context: invite token, expired session or normal login**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `inviteToken?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `returnUrl?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `expiredSessionReason?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Rozpocznij**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.resolve` (`command`, `POST /api/v1/access/resolve`), request `AccessResolveRequest`, response `AccessResolveResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-02|auth-03|auth-15`. Błąd prowadzi do `auth-27`; retry do `auth-01`. Akcja maszyny: **store accessEntryReason and render selected branch**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: public csrf, host allow-list, neutral error.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-02-logowanie"></a>

## Logowanie

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `LoginFormReady` z powodu `credentialsRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Email/password format valid and login rate budget available**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `email` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `password` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `rememberDevice` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Zaloguj się**.
- Nie pamiętam hasła
- Utwórz konto

### Kontrakt operacji
`auth.login` (`command`, `POST /api/v1/auth/login`), request `AuthLoginRequest`, response `AuthLoginResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-16|auth-29`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **create session challenge or active session**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: csrf, credential rate limit, audit login attempt.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-03-wejscie-do-rejestracji"></a>

## Wejście do rejestracji

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `RegistrationChoiceReady` z powodu `registrationMethodRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Registration feature enabled for tenant policy**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `registrationMethod` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wybierz metodę rejestracji**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.resolve` (`command`, `POST /api/v1/access/resolve`), request `AccessResolveRequest`, response `AccessResolveResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-04|auth-05`. Błąd prowadzi do `auth-27`; retry do `auth-03`. Akcja maszyny: **persist registration method choice**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: csrf, anti-enumeration, invite context preserved.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-04-rejestracja-adresem-e-mail"></a>

## Rejestracja adresem e-mail

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `EmailRegistrationReady` z powodu `emailRegistrationSelected`. Wejście jest dozwolone tylko po spełnieniu guardu: **Email, password and invite constraints valid**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `email` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `password` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `passwordConfirmation` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `inviteToken?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Utwórz konto**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.register.email` (`command`, `POST /api/v1/auth/register/email`), request `AuthRegisterEmailRequest`, response `AuthRegisterEmailResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-12`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **create pending registration draft**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: csrf, password policy, anti-enumeration, audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-05-rejestracja-przez-oauth"></a>

## Rejestracja przez OAuth

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `OAuthRegistrationStarted` z powodu `oauthRegistrationSelected`. Wejście jest dozwolone tylko po spełnieniu guardu: **OAuth provider selected and redirect URI allowed**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `provider` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `returnUrl` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Kontynuuj przez OAuth**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.oauth.start` (`command`, `POST /api/v1/auth/oauth/start`), request `AuthOauthStartRequest`, response `AuthOauthStartResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-06|auth-13`. Błąd prowadzi do `auth-27`; retry do `auth-05`. Akcja maszyny: **create OAuth state and wait for signed provider callback**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: state nonce, PKCE, provider allow-list.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-06-weryfikacja-adresu-e-mail"></a>

## Weryfikacja adresu e-mail

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `EmailVerificationPending` z powodu `emailVerificationRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Token exists, not expired, matches pending user**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `verificationToken` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Zweryfikuj e-mail**.
- Wyślij wiadomość ponownie

### Kontrakt operacji
`auth.email.verify` (`command`, `POST /api/v1/auth/email/verify`), request `AuthEmailVerifyRequest`, response `AuthEmailVerifyResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-13`. Błąd prowadzi do `auth-06|auth-27`; retry do `brak automatycznego retry`. Akcja maszyny: **mark email verified and continue registration**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: single-use token, replay protection, neutral invalid token copy.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-07-identyfikacja-firmy"></a>

## Identyfikacja firmy

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `CompanyIdentificationReady` z powodu `companyContextRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **NIP/domain provided and lookup provider available**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `nip` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `companyDomain?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Znajdź firmę**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`company.lookup` (`query`, `GET /api/v1/company/lookup`), request `CompanyLookupRequest`, response `CompanyLookupResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-08|auth-10|auth-11`. Błąd prowadzi do `auth-27`; retry do `auth-07`. Akcja maszyny: **resolve candidate company or manual path**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: rate limit registry lookup, no company enumeration.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-08-wyszukiwanie-firmy"></a>

## Wyszukiwanie firmy

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `CompanyLookupRunning` z powodu `companySearchRequested`. Wejście jest dozwolone tylko po spełnieniu guardu: **Registry returned candidate company data**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `searchQuery` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `selectedCandidateId?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wybierz firmę**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`company.lookup` (`query`, `GET /api/v1/company/lookup`), request `CompanyLookupRequest`, response `CompanyLookupResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-09`. Błąd prowadzi do `auth-10`; retry do `brak automatycznego retry`. Akcja maszyny: **attach registry candidate to onboarding draft**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: provider timeout budget, provenance logged.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-09-sprawdzenie-i-edycja-danych-firmy"></a>

## Sprawdzenie i edycja danych firmy

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `CompanyDataReviewReady` z powodu `companyCandidateSelected`. Wejście jest dozwolone tylko po spełnieniu guardu: **User can confirm or correct registry data**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `legalName` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `nip` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `address` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `registryProvenance` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Potwierdź dane firmy**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`company.draft.update` (`command`, `PUT /api/v1/company/draft`), request `CompanyDraftUpdateRequest`, response `CompanyDraftUpdateResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-12`. Błąd prowadzi do `auth-10`; retry do `brak automatycznego retry`. Akcja maszyny: **persist company draft fields and provenance**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: input validation, audit company draft change.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-10-reczne-wprowadzenie-firmy"></a>

## Ręczne wprowadzenie firmy

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `ManualCompanyEntryReady` z powodu `companyManualEntryRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Required legal fields supplied manually**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `legalName` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `nip` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `country` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `postalCode` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `city` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `street` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Zapisz dane firmy**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`company.draft.update` (`command`, `PUT /api/v1/company/draft`), request `CompanyDraftUpdateRequest`, response `CompanyDraftUpdateResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-12`. Błąd prowadzi do `auth-10`; retry do `brak automatycznego retry`. Akcja maszyny: **persist manual company draft**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: validation, no external provider dependency.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-11-firma-juz-zarejestrowana"></a>

## Firma już zarejestrowana

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `CompanyAlreadyRegistered` z powodu `companyAlreadyExists`. Wejście jest dozwolone tylko po spełnieniu guardu: **Company match exists and user has no membership**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `companyDisplayName` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `requestAccessReason?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Poproś o dostęp**.
- Wróć do identyfikacji firmy

### Kontrakt operacji
`invitation.request` (`command`, `POST /api/v1/auth/invitations/request`), request `InvitationRequestRequest`, response `InvitationRequestResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-15|auth-28`. Błąd prowadzi do `auth-27`; retry do `auth-11`. Akcja maszyny: **offer invite/access request path without leaking tenant data**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: tenant privacy, neutral copy, support audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-12-zgody-rejestracyjne"></a>

## Zgody rejestracyjne

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `RegistrationConsentsReady` z powodu `registrationConsentsRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Required consents selected with version ids**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `requiredConsentVersionIds` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `optionalConsentVersionIds` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Zaakceptuj wymagane zgody**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.consents.accept` (`command`, `POST /api/v1/auth/consents`), request `AuthConsentsAcceptRequest`, response `AuthConsentsAcceptResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-13`. Błąd prowadzi do `auth-12`; retry do `brak automatycznego retry`. Akcja maszyny: **store consent receipts and continue finalize**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: consent versioning, audit, no prechecked optional consents.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-13-przetwarzanie-rejestracji"></a>

## Przetwarzanie rejestracji

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `RegistrationProcessing` z powodu `registrationSubmissionPending`. Wejście jest dozwolone tylko po spełnieniu guardu: **Email/company/consent preconditions complete**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `registrationDraftId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `idempotencyKey` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Finalizuj rejestrację**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.registration.finalize` (`job`, `POST /api/v1/auth/registration/finalize`), request `AuthRegistrationFinalizeRequest`, response `AuthRegistrationFinalizeResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-14`. Błąd prowadzi do `auth-27`; retry do `auth-13`. Akcja maszyny: **create user, tenant/workspace bootstrap job or membership binding**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: transactional audit, idempotency key.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-14-rejestracja-zakonczona"></a>

## Rejestracja zakończona

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `RegistrationCompleted` z powodu `registrationCompleted`. Wejście jest dozwolone tylko po spełnieniu guardu: **Registration finalize job completed**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `registrationId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Przejdź dalej**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.bootstrap` (`command`, `POST /api/v1/access/bootstrap`), request `AccessBootstrapRequest`, response `AccessBootstrapResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-21|auth-29`. Błąd prowadzi do `auth-27`; retry do `brak automatycznego retry`. Akcja maszyny: **bootstrap first access context**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: session rotation, onboarding marker.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-15-przeglad-zaproszenia"></a>

## Przegląd zaproszenia

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `InvitationReviewReady` z powodu `invitationReceived`. Wejście jest dozwolone tylko po spełnieniu guardu: **Invitation token valid and recipient matches**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `invitationToken` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `recipientEmail` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Zaakceptuj zaproszenie**.
- Odrzuć zaproszenie

### Kontrakt operacji
`invitation.validate` (`command`, `POST /api/v1/auth/invitations/validate`), request `InvitationValidateRequest`, response `InvitationValidateResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-02|auth-04|auth-21`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **bind invite context to auth journey**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: single-use invite token, recipient verification.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-16-weryfikacja-mfa"></a>

## Weryfikacja MFA

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `MfaChallengeReady` z powodu `mfaChallengeRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Challenge id active and attempts remain**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `challengeId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `verificationCode` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `rememberDevice` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Potwierdź MFA**.
- Użyj innej metody
- Odzyskaj dostęp

### Kontrakt operacji
`auth.mfa.verify` (`command`, `POST /api/v1/auth/mfa/verify`), request `AuthMfaVerifyRequest`, response `AuthMfaVerifyResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-21|auth-29`. Błąd prowadzi do `auth-16|auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **complete step-up or login session**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: attempt limit, TOTP/WebAuthn validation, audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-17-konfiguracja-mfa"></a>

## Konfiguracja MFA

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `MfaEnrollmentReady` z powodu `mfaEnrollmentRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Privileged or policy-required MFA enrollment active**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `factorType` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `enrollmentChallenge` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `verificationCode` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Skonfiguruj MFA**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.mfa.enroll` (`command`, `POST /api/v1/auth/mfa/enroll`), request `AuthMfaEnrollRequest`, response `AuthMfaEnrollResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-16`. Błąd prowadzi do `auth-17`; retry do `brak automatycznego retry`. Akcja maszyny: **create MFA secret/challenge and require confirmation through auth-16**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: secret masking, recovery codes once, audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-18-prosba-o-odzyskanie-hasla"></a>

## Prośba o odzyskanie hasła

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `PasswordRecoveryRequestReady` z powodu `passwordRecoveryRequested`. Wejście jest dozwolone tylko po spełnieniu guardu: **Email syntactically valid and rate budget available**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `email` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wyślij link resetujący**.
- Wróć do logowania

### Kontrakt operacji
`auth.password.recovery.request` (`command`, `POST /api/v1/auth/password/recovery/request`), request `AuthPasswordRecoveryRequestRequest`, response `AuthPasswordRecoveryRequestResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-19`. Błąd prowadzi do `auth-18`; retry do `brak automatycznego retry`. Akcja maszyny: **send neutral recovery message if account eligible**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: anti-enumeration, rate limit, mail audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-19-informacja-o-wyslaniu-resetu"></a>

## Informacja o wysłaniu resetu

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `PasswordRecoverySent` z powodu `passwordRecoveryEmailSent`. Wejście jest dozwolone tylko po spełnieniu guardu: **Reset token arrives from email deep link and is valid**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `resetToken` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Sprawdź link resetujący**.
- Wyślij ponownie

### Kontrakt operacji
`auth.password.recovery.token.validate` (`callback`, `POST /api/v1/auth/password/recovery/token/validate`), request `AuthPasswordRecoveryTokenValidateRequest`, response `AuthPasswordRecoveryTokenValidateResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-20`. Błąd prowadzi do `auth-18`; retry do `auth-19`. Akcja maszyny: **unlock password reset surface for token owner**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: single-use token, expiry, neutral invalid copy.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-20-ustawienie-nowego-hasla"></a>

## Ustawienie nowego hasła

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `NewPasswordReady` z powodu `passwordResetTokenAccepted`. Wejście jest dozwolone tylko po spełnieniu guardu: **Token valid and password policy satisfied**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `resetToken` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `newPassword` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `newPasswordConfirmation` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Ustaw nowe hasło**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.password.reset` (`command`, `POST /api/v1/auth/password/reset`), request `AuthPasswordResetRequest`, response `AuthPasswordResetResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-02`. Błąd prowadzi do `auth-20|auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **rotate credentials and revoke active sessions**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: password policy, session revoke, audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-21-rozwiazanie-dostepu"></a>

## Rozwiązanie dostępu

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `AccessResolutionReady` z powodu `accessContextUnresolved`. Wejście jest dozwolone tylko po spełnieniu guardu: **Authenticated session exists and memberships are loaded**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `sessionId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Rozwiąż kontekst dostępu**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.resolve` (`command`, `POST /api/v1/access/resolve`), request `AccessResolveRequest`, response `AccessResolveResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-22|auth-23|auth-29`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **resolve tenant/workspace target**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: tenant isolation, membership filter.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-22-wybor-organizacji-lub-tenanta"></a>

## Wybór organizacji lub tenanta

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `TenantSelectionReady` z powodu `tenantSelectionRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **User has more than one tenant membership**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `tenantId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wybierz organizację**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.tenant.select` (`command`, `POST /api/v1/access/tenant/select`), request `AccessTenantSelectRequest`, response `AccessTenantSelectResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-23|auth-29`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **store selected tenant context**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: membership check, no cross-tenant leakage.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-23-wybor-obszaru-roboczego"></a>

## Wybór obszaru roboczego

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `WorkspaceSelectionReady` z powodu `workspaceSelectionRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Selected workspace belongs to selected tenant and user membership**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `workspaceId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wybierz obszar roboczy**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.workspace.select` (`command`, `POST /api/v1/access/workspace/select`), request `AccessWorkspaceSelectRequest`, response `AccessWorkspaceSelectResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-29`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **activate workspace context**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: workspace membership, data-scope audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-24-ponowne-uwierzytelnienie"></a>

## Ponowne uwierzytelnienie

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `ReauthenticationReady` z powodu `freshAuthenticationRequired`. Wejście jest dozwolone tylko po spełnieniu guardu: **Sensitive operation requires fresh auth**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `passwordOrWebAuthnAssertion` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `originalOperationId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Potwierdź tożsamość**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.reauthenticate` (`command`, `POST /api/v1/auth/reauthenticate`), request `AuthReauthenticateRequest`, response `AuthReauthenticateResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-29`. Błąd prowadzi do `auth-28`; retry do `brak automatycznego retry`. Akcja maszyny: **issue step-up proof for original operation**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: step-up TTL, audit, original operation binding.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-25-przetwarzanie-wylogowania"></a>

## Przetwarzanie wylogowania

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `LogoutProcessing` z powodu `logoutRequested`. Wejście jest dozwolone tylko po spełnieniu guardu: **Active session or logout request exists**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `sessionId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wyloguj**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`auth.logout` (`command`, `POST /api/v1/auth/logout`), request `AuthLogoutRequest`, response `AuthLogoutResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-26`. Błąd prowadzi do `auth-27`; retry do `auth-25`. Akcja maszyny: **revoke session and clear cookies**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: csrf, session revoke, cookie clearing.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-26-ekran-po-wylogowaniu"></a>

## Ekran po wylogowaniu

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `SignedOut` z powodu `sessionTerminated`. Wejście jest dozwolone tylko po spełnieniu guardu: **No active authenticated session remains**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- Brak pól edytowalnych; powierzchnia prezentuje stan i dostępne bezpieczne działania.

### Akcje
- Akcja główna: **Wróć do logowania**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
Akcja UI `ui.return_to_login` bez transportu BFF.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-02`. Błąd prowadzi do `auth-27`; retry do `brak automatycznego retry`. Akcja maszyny: **navigate to login without BFF mutation**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: no sensitive data retained in browser state.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-27-usluga-auth-niedostepna"></a>

## Usługa Auth niedostępna

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `AuthServiceUnavailable` z powodu `authServiceUnavailable`. Wejście jest dozwolone tylko po spełnieniu guardu: **Service health can be checked without exposing user data**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `correlationId?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Ponów sprawdzenie**.
- Skontaktuj się ze wsparciem

### Kontrakt operacji
`auth.status.read` (`query`, `GET /api/v1/auth/status`), request `AuthStatusReadRequest`, response `AuthStatusReadResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-01`. Błąd prowadzi do `auth-27`; retry do `auth-27`. Akcja maszyny: **retry status check or show support contact**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: neutral error, no secret in diagnostics.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-28-dostep-zablokowany"></a>

## Dostęp zablokowany

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `AccessBlocked` z powodu `accessPolicyBlocked`. Wejście jest dozwolone tylko po spełnieniu guardu: **Block reason available for current session or invite context**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `blockCode` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `correlationId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Otwórz bezpieczną ścieżkę odzyskania**.
- Odzyskaj hasło
- Skontaktuj się ze wsparciem

### Kontrakt operacji
`auth.access.blocked.read` (`query`, `GET /api/v1/auth/access/blocked`), request `AuthAccessBlockedReadRequest`, response `AuthAccessBlockedReadResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `auth-18|auth-27`. Błąd prowadzi do `auth-28`; retry do `auth-28`. Akcja maszyny: **show safe recovery path**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: no tenant data leakage, support audit.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.

<a id="sekcja-auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji"></a>

## Zakończenie procesu i wejście do aplikacji

### Cel użytkownika i warunek wejścia
Powierzchnia realizuje stan `EnterApplication` z powodu `applicationEntryReady`. Wejście jest dozwolone tylko po spełnieniu guardu: **Tenant/workspace resolved and session active**. Bezpośrednie otwarcie URL nie może ominąć walidacji serwerowej.

### Anatomia i pola
- Publiczny `AuthShell`, marka PapaData, nagłówek i neutralny opis kontekstu.
- Formularz lub panel stanu ograniczony do danych wymaganych w tym kroku.
- Region błędów z `correlationId`; bez ujawniania, czy konto lub tenant istnieje.
- `tenantId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `workspaceId` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.
- `returnUrl?` — jawnie etykietowane, walidowane po blur i submit; błędy pola nie usuwają wprowadzonej wartości.

### Akcje
- Akcja główna: **Wejdź do aplikacji**.
- Brak akcji dodatkowej albo wyłącznie bezpieczna nawigacja wstecz wynikająca z maszyny stanów.

### Kontrakt operacji
`access.bootstrap` (`command`, `POST /api/v1/access/bootstrap`), request `AccessBootstrapRequest`, response `AccessBootstrapResponse`.

Po sukcesie dozwolone są wyłącznie przejścia: `app-shell`. Błąd prowadzi do `auth-27`; retry do `brak automatycznego retry`. Akcja maszyny: **enter app shell with active workspace**.

### Stany błędów i bezpieczeństwo
- validationError: błędy przy konkretnych polach i podsumowanie na początku formularza; fokus na pierwszy błąd.
- rateLimited: bezpieczny komunikat, licznik czasu z `retryAfterSeconds`, brak agresywnego polling.
- serviceUnavailable: zachowanie danych niesekretnych i przejście do auth-27.
- blocked: brak ujawniania danych organizacji, przejście do auth-28.
- Kontrole: session rotation, workspace scope lock.

### Dostępność i responsywność
Jedna kolumna do 640 px, czytelny reflow przy 400% zoom, logiczny porządek tabulacji, `autocomplete` właściwe dla pola, poprawne etykiety i live region dla statusu asynchronicznego. Kody MFA można wkleić; hasło współpracuje z menedżerami haseł.

### Storybook i testy
Stories docelowe: default, validationError, rateLimited, serviceUnavailable, blocked, long-copy PL/EN i mobile 390 px. Test kontraktowy sprawdza operationId, dozwolone przejścia i neutralność komunikatów bezpieczeństwa.

### Kryteria akceptacji
1. Surface, dokument Identity/Auth, CSV i TypeScript są generowane z `contracts/auth-fsm.json`.
2. Nie można przejść do stanu spoza success/error/retry transition.
3. Operacja, reason i state są jednoznaczne i różne pojęciowo.
4. Zdarzenie bezpieczeństwa zawiera correlationId, surfaceId i wynik bez sekretów.
