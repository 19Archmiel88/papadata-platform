---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
title: Auth statechart 1.0
type: auth-statechart
status: approved-target
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Auth statechart 1.0

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
