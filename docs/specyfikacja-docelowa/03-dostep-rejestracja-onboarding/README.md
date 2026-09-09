---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Dostęp, rejestracja i onboarding

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-auth-fsm-wykonawczy"></a>

## Auth FSM — model wykonawczy 1.0 po audycie

Ten dokument zamyka problem F-006: target przejścia jest zawsze `AuthSurfaceId`, a `operationId` nigdy nie jest używane jako powierzchnia. Guardy, akcje i zabezpieczenia są przypisane do konkretnej operacji oraz ryzyka.

| Surface | Event | Operation | Branch | Success | Error | Guard | Security |
|---|---|---|---|---|---|---|---|
| `auth-01` | `OpenAuthEntry` | `access.resolve` | business | `auth-02|auth-03|auth-15` | `auth-27` | Resolve public entry context: invite token, expired session or normal login | public csrf, host allow-list, neutral error |
| `auth-02` | `SubmitCredentials` | `auth.login` | success | `auth-16|auth-29` | `auth-28` | Email/password format valid and login rate budget available | csrf, credential rate limit, audit login attempt |
| `auth-03` | `ChooseRegistrationMethod` | `access.resolve` | business | `auth-04|auth-05` | `auth-27` | Registration feature enabled for tenant policy | csrf, anti-enumeration, invite context preserved |
| `auth-04` | `SubmitEmailRegistration` | `auth.register.email` | success | `auth-12` | `auth-28` | Email, password and invite constraints valid | csrf, password policy, anti-enumeration, audit |
| `auth-05` | `StartOAuth` | `auth.oauth.start` | callback | `auth-06|auth-13` | `auth-27` | OAuth provider selected and redirect URI allowed | state nonce, PKCE, provider allow-list |
| `auth-06` | `VerifyEmailToken` | `auth.email.verify` | success | `auth-13` | `auth-06|auth-27` | Token exists, not expired, matches pending user | single-use token, replay protection, neutral invalid token copy |
| `auth-07` | `SubmitCompanyIdentity` | `company.lookup` | business | `auth-08|auth-10|auth-11` | `auth-27` | NIP/domain provided and lookup provider available | rate limit registry lookup, no company enumeration |
| `auth-08` | `SelectCompanyCandidate` | `company.lookup` | success | `auth-09` | `auth-10` | Registry returned candidate company data | provider timeout budget, provenance logged |
| `auth-09` | `ConfirmCompanyData` | `company.draft.update` | success | `auth-12` | `auth-10` | User can confirm or correct registry data | input validation, audit company draft change |
| `auth-10` | `SubmitManualCompany` | `company.draft.update` | success | `auth-12` | `auth-10` | Required legal fields supplied manually | validation, no external provider dependency |
| `auth-11` | `ResolveExistingCompany` | `invitation.request` | business | `auth-15|auth-28` | `auth-27` | Company match exists and user has no membership | tenant privacy, neutral copy, support audit |
| `auth-12` | `AcceptConsents` | `auth.consents.accept` | success | `auth-13` | `auth-12` | Required consents selected with version ids | consent versioning, audit, no prechecked optional consents |
| `auth-13` | `FinalizeRegistration` | `auth.registration.finalize` | job | `auth-14` | `auth-27` | Email/company/consent preconditions complete | transactional audit, idempotency key |
| `auth-14` | `ContinueAfterRegistration` | `access.bootstrap` | success | `auth-21|auth-29` | `auth-27` | Registration finalize job completed | session rotation, onboarding marker |
| `auth-15` | `AcceptInvitation` | `invitation.validate` | success | `auth-02|auth-04|auth-21` | `auth-28` | Invitation token valid and recipient matches | single-use invite token, recipient verification |
| `auth-16` | `VerifyMfaCode` | `auth.mfa.verify` | success | `auth-21|auth-29` | `auth-16|auth-28` | Challenge id active and attempts remain | attempt limit, TOTP/WebAuthn validation, audit |
| `auth-17` | `EnrollMfaFactor` | `auth.mfa.enroll` | success | `auth-16` | `auth-17` | Privileged or policy-required MFA enrollment active | secret masking, recovery codes once, audit |
| `auth-18` | `RequestPasswordRecovery` | `auth.password.recovery.request` | success | `auth-19` | `auth-18` | Email syntactically valid and rate budget available | anti-enumeration, rate limit, mail audit |
| `auth-19` | `OpenResetLink` | `auth.password.recovery.token.validate` | callback | `auth-20` | `auth-18` | Reset token arrives from email deep link and is valid | single-use token, expiry, neutral invalid copy |
| `auth-20` | `SubmitNewPassword` | `auth.password.reset` | success | `auth-02` | `auth-20|auth-28` | Token valid and password policy satisfied | password policy, session revoke, audit |
| `auth-21` | `ResolveAccessContext` | `access.resolve` | success | `auth-22|auth-23|auth-29` | `auth-28` | Authenticated session exists and memberships are loaded | tenant isolation, membership filter |
| `auth-22` | `SelectTenant` | `access.tenant.select` | success | `auth-23|auth-29` | `auth-28` | User has more than one tenant membership | membership check, no cross-tenant leakage |
| `auth-23` | `SelectWorkspace` | `access.workspace.select` | success | `auth-29` | `auth-28` | Selected workspace belongs to selected tenant and user membership | workspace membership, data-scope audit |
| `auth-24` | `SubmitReauthentication` | `auth.reauthenticate` | success | `auth-29` | `auth-28` | Sensitive operation requires fresh auth | step-up TTL, audit, original operation binding |
| `auth-25` | `StartLogout` | `auth.logout` | job | `auth-26` | `auth-27` | Active session or logout request exists | csrf, session revoke, cookie clearing |
| `auth-26` | `ReturnToLogin` | `ui.return_to_login` | ui | `auth-02` | `auth-27` | No active authenticated session remains | no sensitive data retained in browser state |
| `auth-27` | `RetryAuthService` | `auth.status.read` | query | `auth-01` | `auth-27` | Service health can be checked without exposing user data | neutral error, no secret in diagnostics |
| `auth-28` | `RequestSupportOrRetry` | `access.blocked.read` | query | `auth-18|auth-27` | `auth-28` | Block reason available for current session or invite context | no tenant data leakage, support audit |
| `auth-29` | `EnterApplication` | `access.bootstrap` | success | `app-shell` | `auth-27` | Tenant/workspace resolved and session active | session rotation, workspace scope lock |

<a id="sekcja-auth-statechart-1-0"></a>

## Auth statechart 1.0

Dokument definiuje formalną maszynę stanów dla 29 powierzchni Auth. Nie występują placeholdery `state-XX`, `next-XX`, `error-XX`.

| Surface | State | Reason | Operation | Success | Error |
|---|---|---|---|---|---|
| `auth-01` | `AccessEntryReady` | `UserEnteredAuth` | `access.resolve` | `auth-02-logowanie|auth-03-wejscie-do-rejestracji|auth-15-przeglad-zaproszenia` | `auth-27-usluga-auth-niedostepna` |
| `auth-02` | `LoginFormReady` | `CredentialsSubmitted` | `auth.login` | `auth-16-weryfikacja-mfa|auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji` | `auth-28-dostep-zablokowany` |
| `auth-03` | `RegistrationChoiceReady` | `RegistrationStarted` | `access.resolve` | `auth-04-rejestracja-adresem-e-mail|auth-05-rejestracja-przez-oauth` | `auth-27-usluga-auth-niedostepna` |
| `auth-04` | `EmailRegistrationReady` | `EmailRegistrationSubmitted` | `auth.register.email` | `auth-06-weryfikacja-adresu-e-mail` | `auth-12-zgody-rejestracyjne` |
| `auth-05` | `OAuthRegistrationReady` | `OAuthProviderSelected` | `auth.oauth.start` | `auth.oauth.callback` | `auth-27-usluga-auth-niedostepna` |
| `auth-06` | `EmailVerificationPending` | `EmailTokenConfirmed` | `auth.email.verify` | `auth-07-identyfikacja-firmy` | `auth-19-informacja-o-wyslaniu-resetu` |
| `auth-07` | `CompanyIdentificationReady` | `CompanyLookupRequested` | `company.lookup` | `auth-08-wyszukiwanie-firmy|auth-10-reczne-wprowadzenie-firmy` | `auth-11-firma-juz-zarejestrowana` |
| `auth-08` | `CompanyLookupRunning` | `CompanyLookupResolved` | `company.lookup` | `auth-09-sprawdzenie-i-edycja-danych-firmy` | `auth-10-reczne-wprowadzenie-firmy` |
| `auth-09` | `CompanyDraftReviewReady` | `CompanyDraftUpdated` | `company.draft.update` | `auth-12-zgody-rejestracyjne` | `auth-10-reczne-wprowadzenie-firmy` |
| `auth-10` | `ManualCompanyEntryReady` | `ManualCompanySubmitted` | `company.draft.update` | `auth-12-zgody-rejestracyjne` | `auth-11-firma-juz-zarejestrowana` |
| `auth-11` | `CompanyAlreadyRegistered` | `ExistingCompanyHandled` | `invitation.validate` | `auth-15-przeglad-zaproszenia|auth-02-logowanie` | `auth-28-dostep-zablokowany` |
| `auth-12` | `RegistrationConsentsReady` | `ConsentsAccepted` | `auth.register.email` | `auth-13-przetwarzanie-rejestracji` | `auth-04-rejestracja-adresem-e-mail` |
| `auth-13` | `RegistrationProcessing` | `RegistrationCompleted` | `auth.register.email` | `auth-14-rejestracja-zakonczona` | `auth-27-usluga-auth-niedostepna` |
| `auth-14` | `RegistrationCompleted` | `ContinueToAccessResolution` | `access.resolve` | `auth-21-rozwiazanie-dostepu` | `auth-27-usluga-auth-niedostepna` |
| `auth-15` | `InvitationReviewReady` | `InvitationAccepted` | `invitation.accept` | `auth-04-rejestracja-adresem-e-mail|auth-02-logowanie` | `auth-28-dostep-zablokowany` |
| `auth-16` | `MfaChallengeReady` | `MfaCodeSubmitted` | `auth.mfa.verify` | `auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji` | `auth-28-dostep-zablokowany` |
| `auth-17` | `MfaEnrollmentReady` | `MfaEnrollmentConfirmed` | `auth.mfa.enroll|auth.mfa.confirm` | `auth-16-weryfikacja-mfa` | `auth-27-usluga-auth-niedostepna` |
| `auth-18` | `PasswordRecoveryRequestReady` | `PasswordRecoveryRequested` | `auth.password.recovery.request` | `auth-19-informacja-o-wyslaniu-resetu` | `auth-27-usluga-auth-niedostepna` |
| `auth-19` | `PasswordRecoverySent` | `RecoveryEmailResent` | `auth.email.resend` | `auth-20-ustawienie-nowego-hasla` | `auth-27-usluga-auth-niedostepna` |
| `auth-20` | `PasswordResetReady` | `NewPasswordSubmitted` | `auth.password.reset` | `auth-02-logowanie` | `auth-27-usluga-auth-niedostepna` |
| `auth-21` | `AccessResolutionReady` | `AccessContextResolved` | `access.resolve` | `auth-22-wybor-organizacji-lub-tenanta|auth-23-wybor-obszaru-roboczego|auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji` | `auth-28-dostep-zablokowany` |
| `auth-22` | `TenantSelectionReady` | `TenantSelected` | `access.tenant.select` | `auth-23-wybor-obszaru-roboczego` | `auth-28-dostep-zablokowany` |
| `auth-23` | `WorkspaceSelectionReady` | `WorkspaceSelected` | `access.workspace.select` | `auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji` | `auth-28-dostep-zablokowany` |
| `auth-24` | `ReauthenticationRequired` | `ReauthenticationSubmitted` | `auth.reauthenticate` | `auth-21-rozwiazanie-dostepu` | `auth-28-dostep-zablokowany` |
| `auth-25` | `LogoutProcessing` | `LogoutCompleted` | `auth.logout` | `auth-26-ekran-po-wylogowaniu` | `auth-27-usluga-auth-niedostepna` |
| `auth-26` | `SignedOut` | `ReturnToLogin` | `auth.session.read` | `auth-02-logowanie` | `auth-27-usluga-auth-niedostepna` |
| `auth-27` | `AuthServiceUnavailable` | `RetryStatusCheck` | `auth.status.read` | `auth-01-wejscie-do-auth` | `auth-27-usluga-auth-niedostepna` |
| `auth-28` | `AccessBlocked` | `SupportOrRetrySelected` | `auth.access.blocked.read` | `auth-18-prosba-o-odzyskanie-hasla|auth-02-logowanie` | `auth-28-dostep-zablokowany` |
| `auth-29` | `ApplicationEntryGranted` | `EnterApplication` | `access.resolve` | `app-shell-ready` | `auth-27-usluga-auth-niedostepna` |

<a id="sekcja-25-01-wejscie-do-auth"></a>

## Wejście do Auth — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.01 |
| Nazwa polska | Wejście do Auth |
| Nazwa techniczna | wejscie-do-auth |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Wejście do Auth”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Wejście do Auth | [Wejście do Auth](powierzchnie-auth.md#sekcja-auth-01-wejscie-do-auth) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-02-logowanie"></a>

## Logowanie — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.02 |
| Nazwa polska | Logowanie |
| Nazwa techniczna | logowanie |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Logowanie”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Logowanie | [Logowanie](powierzchnie-auth.md#sekcja-auth-02-logowanie) | osobny kontrakt powierzchni |
| Przetwarzanie wylogowania | [Przetwarzanie wylogowania](powierzchnie-auth.md#sekcja-auth-25-przetwarzanie-wylogowania) | osobny kontrakt powierzchni |
| Ekran po wylogowaniu | [Ekran po wylogowaniu](powierzchnie-auth.md#sekcja-auth-26-ekran-po-wylogowaniu) | osobny kontrakt powierzchni |
| Usługa Auth niedostępna | [Usługa Auth niedostępna](powierzchnie-auth.md#sekcja-auth-27-usluga-auth-niedostepna) | osobny kontrakt powierzchni |
| Dostęp zablokowany | [Dostęp zablokowany](powierzchnie-auth.md#sekcja-auth-28-dostep-zablokowany) | osobny kontrakt powierzchni |
| Zakończenie procesu i wejście do aplikacji | [Zakończenie procesu i wejście do aplikacji](powierzchnie-auth.md#sekcja-auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-03-rejestracja"></a>

## Rejestracja — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.03 |
| Nazwa polska | Rejestracja |
| Nazwa techniczna | rejestracja |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Rejestracja”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Wejście do rejestracji | [Wejście do rejestracji](powierzchnie-auth.md#sekcja-auth-03-wejscie-do-rejestracji) | osobny kontrakt powierzchni |
| Rejestracja adresem e-mail | [Rejestracja adresem e-mail](powierzchnie-auth.md#sekcja-auth-04-rejestracja-adresem-e-mail) | osobny kontrakt powierzchni |
| Rejestracja przez OAuth | [Rejestracja przez OAuth](powierzchnie-auth.md#sekcja-auth-05-rejestracja-przez-oauth) | osobny kontrakt powierzchni |
| Zgody rejestracyjne | [Zgody rejestracyjne](powierzchnie-auth.md#sekcja-auth-12-zgody-rejestracyjne) | osobny kontrakt powierzchni |
| Przetwarzanie rejestracji | [Przetwarzanie rejestracji](powierzchnie-auth.md#sekcja-auth-13-przetwarzanie-rejestracji) | osobny kontrakt powierzchni |
| Rejestracja zakończona | [Rejestracja zakończona](powierzchnie-auth.md#sekcja-auth-14-rejestracja-zakonczona) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-04-zaproszenie"></a>

## Zaproszenie — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.04 |
| Nazwa polska | Zaproszenie |
| Nazwa techniczna | zaproszenie |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Zaproszenie”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Przegląd zaproszenia | [Przegląd zaproszenia](powierzchnie-auth.md#sekcja-auth-15-przeglad-zaproszenia) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-05-weryfikacja-e-mail"></a>

## Weryfikacja e-mail — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.05 |
| Nazwa polska | Weryfikacja e-mail |
| Nazwa techniczna | weryfikacja-e-mail |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Weryfikacja e-mail”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Weryfikacja adresu e-mail | [Weryfikacja adresu e-mail](powierzchnie-auth.md#sekcja-auth-06-weryfikacja-adresu-e-mail) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-06-identyfikacja-firmy"></a>

## Identyfikacja firmy — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.06 |
| Nazwa polska | Identyfikacja firmy |
| Nazwa techniczna | identyfikacja-firmy |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Identyfikacja firmy”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Identyfikacja firmy | [Identyfikacja firmy](powierzchnie-auth.md#sekcja-auth-07-identyfikacja-firmy) | osobny kontrakt powierzchni |
| Wyszukiwanie firmy | [Wyszukiwanie firmy](powierzchnie-auth.md#sekcja-auth-08-wyszukiwanie-firmy) | osobny kontrakt powierzchni |
| Sprawdzenie i edycja danych firmy | [Sprawdzenie i edycja danych firmy](powierzchnie-auth.md#sekcja-auth-09-sprawdzenie-i-edycja-danych-firmy) | osobny kontrakt powierzchni |
| Ręczne wprowadzenie firmy | [Ręczne wprowadzenie firmy](powierzchnie-auth.md#sekcja-auth-10-reczne-wprowadzenie-firmy) | osobny kontrakt powierzchni |
| Firma już zarejestrowana | [Firma już zarejestrowana](powierzchnie-auth.md#sekcja-auth-11-firma-juz-zarejestrowana) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-07-mfa"></a>

## MFA — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.07 |
| Nazwa polska | MFA |
| Nazwa techniczna | mfa |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „MFA”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Weryfikacja MFA | [Weryfikacja MFA](powierzchnie-auth.md#sekcja-auth-16-weryfikacja-mfa) | osobny kontrakt powierzchni |
| Konfiguracja MFA | [Konfiguracja MFA](powierzchnie-auth.md#sekcja-auth-17-konfiguracja-mfa) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-08-odzyskiwanie-dostepu"></a>

## Odzyskiwanie dostępu — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.08 |
| Nazwa polska | Odzyskiwanie dostępu |
| Nazwa techniczna | odzyskiwanie-dostepu |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Odzyskiwanie dostępu”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Prośba o odzyskanie hasła | [Prośba o odzyskanie hasła](powierzchnie-auth.md#sekcja-auth-18-prosba-o-odzyskanie-hasla) | osobny kontrakt powierzchni |
| Informacja o wysłaniu resetu | [Informacja o wysłaniu resetu](powierzchnie-auth.md#sekcja-auth-19-informacja-o-wyslaniu-resetu) | osobny kontrakt powierzchni |
| Ustawienie nowego hasła | [Ustawienie nowego hasła](powierzchnie-auth.md#sekcja-auth-20-ustawienie-nowego-hasla) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-09-rozwiazanie-kontekstu-dostepu"></a>

## Rozwiązanie kontekstu dostępu — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.09 |
| Nazwa polska | Rozwiązanie kontekstu dostępu |
| Nazwa techniczna | rozwiazanie-kontekstu-dostepu |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Rozwiązanie kontekstu dostępu”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Rozwiązanie dostępu | [Rozwiązanie dostępu](powierzchnie-auth.md#sekcja-auth-21-rozwiazanie-dostepu) | osobny kontrakt powierzchni |
| Wybór organizacji lub tenanta | [Wybór organizacji lub tenanta](powierzchnie-auth.md#sekcja-auth-22-wybor-organizacji-lub-tenanta) | osobny kontrakt powierzchni |
| Wybór obszaru roboczego | [Wybór obszaru roboczego](powierzchnie-auth.md#sekcja-auth-23-wybor-obszaru-roboczego) | osobny kontrakt powierzchni |
| Ponowne uwierzytelnienie | [Ponowne uwierzytelnienie](powierzchnie-auth.md#sekcja-auth-24-ponowne-uwierzytelnienie) | osobny kontrakt powierzchni |
| Dostęp zablokowany | [Dostęp zablokowany](powierzchnie-auth.md#sekcja-auth-28-dostep-zablokowany) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-25-10-onboarding"></a>

## Onboarding — katalog procesu

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 25.10 |
| Nazwa polska | Onboarding |
| Nazwa techniczna | onboarding |
| Typ dokumentu | katalog powierzchni i stanów |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Identity Lead |
| Moduł | M01 — Identity & Access |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

### Cel katalogu

Dokument grupuje powierzchnie należące do procesu „Onboarding”, ale nie zastępuje ich indywidualnych kontraktów. Każda powierzchnia ma osobną maszynę stanów, pola, operacje i testy.

### Powierzchnie

| Powierzchnia | Dokument | Rola |
| --- | --- | --- |
| Rejestracja zakończona | [Rejestracja zakończona](powierzchnie-auth.md#sekcja-auth-14-rejestracja-zakonczona) | osobny kontrakt powierzchni |
| Zakończenie procesu i wejście do aplikacji | [Zakończenie procesu i wejście do aplikacji](powierzchnie-auth.md#sekcja-auth-29-zakonczenie-procesu-i-wejscie-do-aplikacji) | osobny kontrakt powierzchni |

### Reguły przejść

- Backend zwraca dozwolony następny stan; klient nie rekonstruuje polityki dostępu.
- Powrót i odświeżenie nie powtarzają nieidempotentnej operacji.
- Draft nie zawiera hasła, tokenu MFA, recovery codes ani OAuth secrets.
- Każdy błąd ma kod techniczny, neutralny komunikat i jawny recovery path.

### Odbiór

Katalog jest kompletny, gdy wszystkie wymagania są przypisane do konkretnej powierzchni, przejścia są testowane E2E, a Storybook zawiera stany pozytywne, błędne, wygasłe, zablokowane i niedostępne.

<a id="sekcja-onboarding-do-pierwszej-wartosci"></a>

## Onboarding do pierwszej wartości — kontrakt procesu

### Status

Zatwierdzony kontrakt docelowy 1.0. Proces jest odrębny od pojedynczego ekranu Auth i kończy się dopiero po uzyskaniu pierwszego wiarygodnego KPI lub insightu.

### Cel

Użytkownik ma przejść od potwierdzonej tożsamości i kontekstu firmy do pierwszej wartości biznesowej bez utraty postępu, bez wymuszania konfiguracji niepotrzebnej dla jego roli i bez prezentowania danych częściowych jako gotowych.

### Etapy

1. Potwierdzenie kontekstu tenanta i workspace.
2. Profil działalności, waluta, strefa czasowa i podstawowe cele.
3. Wybór pierwszego źródła danych.
4. Połączenie integracji i potwierdzenie zakresu.
5. Pierwsza synchronizacja z widocznym statusem etapów.
6. Ocena readiness, kompletności i świeżości.
7. Pierwszy KPI, insight albo jednoznaczna informacja, co blokuje wartość.
8. Zaproszenie zespołu jako krok opcjonalny, zależny od roli.
9. Wejście do Centrum Dowodzenia z zachowanym kontekstem.

### Wznowienie

Postęp jest utrwalany po każdym bezpiecznym kroku. OAuth, synchronizacja i operacje asynchroniczne mają osobny status; odświeżenie strony nie powtarza mutacji. Użytkownik wraca do pierwszego niezakończonego etapu, chyba że jego uprawnienia lub readiness uległy zmianie.

### Komponenty

`ProgressIndicator`, `DataStatusBanner`, `PairingFlow` lub kreator integracji, `SyncTimeline`, `MetricCard`, `InlineNotice`, `Button`, `Dialog` dla przerwania procesu.

### Dane i API

Proces korzysta z operacji `auth.access.resolve`, `settings.workspace.profile.update`, `integrations.connection.create`, `integrations.sync.start`, `readiness.workspace.read` i `commandCenter.firstValue.read`. Dokładne ścieżki HTTP należą do kontraktów domenowych.

### Kryteria akceptacji

- proces można przerwać i wznowić;
- częściowe dane mają jawne ograniczenia;
- każda mutacja jest idempotentna;
- użytkownik bez capability nie widzi aktywnej akcji;
- zakończenie jest mierzone zdarzeniem `onboarding_first_value_reached`;
- test E2E obejmuje OAuth przerwany, provider unavailable, dane partial, zmianę workspace i wygasłą sesję.

### Powiązany przepływ E2E

Od onboardingu do pierwszej wartości.
