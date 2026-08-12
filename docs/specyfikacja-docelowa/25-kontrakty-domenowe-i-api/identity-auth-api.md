---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: domain-api-contract
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Identity/Auth API — kontrakt kanoniczny

## Jedno źródło prawdy
Model źródłowy znajduje się w `contracts/auth-fsm.json`. `contracts/auth-fsm.ts`, trzy macierze CSV, ten dokument oraz 29 dokumentów powierzchni muszą być generowane z tego pliku. Ręczna zmiana wyłącznie jednej reprezentacji jest błędem walidacji.

## Reguły transportowe
Mutacje używają CSRF, correlation ID, audytu, rate limitu i idempotency key. OAuth używa state nonce i PKCE. Zaproszenia, tokeny weryfikacji i resetu są jednorazowe. Komunikaty nie umożliwiają enumeracji kont i tenantów.

## Kanoniczne operacje
| operationId | Kind | Metoda i BFF route | Request | Response |
|---|---|---|---|---|
| `access.bootstrap` | `command` | `POST` | `/api/v1/access/bootstrap` | `AccessBootstrapRequest` | `AccessBootstrapResponse` |
| `access.resolve` | `command` | `POST` | `/api/v1/access/resolve` | `AccessResolveRequest` | `AccessResolveResponse` |
| `access.tenant.select` | `command` | `POST` | `/api/v1/access/tenant/select` | `AccessTenantSelectRequest` | `AccessTenantSelectResponse` |
| `access.tenants.list` | `query` | `GET` | `/api/v1/access/tenants/list` | `AccessTenantsListRequest` | `AccessTenantsListResponse` |
| `access.workspace.select` | `command` | `POST` | `/api/v1/access/workspace/select` | `AccessWorkspaceSelectRequest` | `AccessWorkspaceSelectResponse` |
| `access.workspaces.list` | `query` | `GET` | `/api/v1/access/workspaces/list` | `AccessWorkspacesListRequest` | `AccessWorkspacesListResponse` |
| `auth.access.blocked.read` | `query` | `GET` | `/api/v1/auth/access/blocked` | `AuthAccessBlockedReadRequest` | `AuthAccessBlockedReadResponse` |
| `auth.access.resolve` | `command` | `POST` | `/api/v1/auth/access/resolve` | `AuthAccessResolveRequest` | `AuthAccessResolveResponse` |
| `auth.account.link` | `command` | `POST` | `/api/v1/auth/account/link` | `AuthAccountLinkRequest` | `AuthAccountLinkResponse` |
| `auth.consents.accept` | `command` | `POST` | `/api/v1/auth/consents` | `AuthConsentsAcceptRequest` | `AuthConsentsAcceptResponse` |
| `auth.email.resend` | `command` | `POST` | `/api/v1/auth/email/resend` | `AuthEmailResendRequest` | `AuthEmailResendResponse` |
| `auth.email.verify` | `command` | `POST` | `/api/v1/auth/email/verify` | `AuthEmailVerifyRequest` | `AuthEmailVerifyResponse` |
| `auth.login` | `command` | `POST` | `/api/v1/auth/login` | `AuthLoginRequest` | `AuthLoginResponse` |
| `auth.logout` | `command` | `POST` | `/api/v1/auth/logout` | `AuthLogoutRequest` | `AuthLogoutResponse` |
| `auth.mfa.confirm` | `command` | `POST` | `/api/v1/auth/mfa/confirm` | `AuthMfaConfirmRequest` | `AuthMfaConfirmResponse` |
| `auth.mfa.enroll` | `command` | `POST` | `/api/v1/auth/mfa/enroll` | `AuthMfaEnrollRequest` | `AuthMfaEnrollResponse` |
| `auth.mfa.verify` | `command` | `POST` | `/api/v1/auth/mfa/verify` | `AuthMfaVerifyRequest` | `AuthMfaVerifyResponse` |
| `auth.oauth.callback` | `callback` | `POST` | `/api/v1/auth/oauth/callback` | `AuthOauthCallbackRequest` | `AuthOauthCallbackResponse` |
| `auth.oauth.start` | `command` | `POST` | `/api/v1/auth/oauth/start` | `AuthOauthStartRequest` | `AuthOauthStartResponse` |
| `auth.password.recovery.request` | `command` | `POST` | `/api/v1/auth/password/recovery/request` | `AuthPasswordRecoveryRequestRequest` | `AuthPasswordRecoveryRequestResponse` |
| `auth.password.recovery.token.validate` | `callback` | `POST` | `/api/v1/auth/password/recovery/token/validate` | `AuthPasswordRecoveryTokenValidateRequest` | `AuthPasswordRecoveryTokenValidateResponse` |
| `auth.password.reset` | `command` | `POST` | `/api/v1/auth/password/reset` | `AuthPasswordResetRequest` | `AuthPasswordResetResponse` |
| `auth.reauthenticate` | `command` | `POST` | `/api/v1/auth/reauthenticate` | `AuthReauthenticateRequest` | `AuthReauthenticateResponse` |
| `auth.register.email` | `command` | `POST` | `/api/v1/auth/register/email` | `AuthRegisterEmailRequest` | `AuthRegisterEmailResponse` |
| `auth.registration.finalize` | `job` | `POST` | `/api/v1/auth/registration/finalize` | `AuthRegistrationFinalizeRequest` | `AuthRegistrationFinalizeResponse` |
| `auth.session.read` | `query` | `GET` | `/api/v1/auth/session` | `AuthSessionReadRequest` | `AuthSessionReadResponse` |
| `auth.status.read` | `query` | `GET` | `/api/v1/auth/status` | `AuthStatusReadRequest` | `AuthStatusReadResponse` |
| `company.draft.update` | `command` | `PUT` | `/api/v1/company/draft` | `CompanyDraftUpdateRequest` | `CompanyDraftUpdateResponse` |
| `company.lookup` | `query` | `GET` | `/api/v1/company/lookup` | `CompanyLookupRequest` | `CompanyLookupResponse` |
| `invitation.accept` | `command` | `POST` | `/api/v1/auth/invitations/accept` | `InvitationAcceptRequest` | `InvitationAcceptResponse` |
| `invitation.read` | `query` | `GET` | `/api/v1/invitation/read` | `InvitationReadRequest` | `InvitationReadResponse` |
| `invitation.reject` | `command` | `POST` | `/api/v1/invitation/reject` | `InvitationRejectRequest` | `InvitationRejectResponse` |
| `invitation.request` | `command` | `POST` | `/api/v1/auth/invitations/request` | `InvitationRequestRequest` | `InvitationRequestResponse` |
| `invitation.validate` | `command` | `POST` | `/api/v1/auth/invitations/validate` | `InvitationValidateRequest` | `InvitationValidateResponse` |

Akcja `ui.return_to_login` jest rejestrowana w `rejestry/ui-actions.csv` i nie jest endpointem.

## Kanoniczna maszyna 29 powierzchni
| Surface | Nazwa | State | Reason | Operation | Success | Error |
|---|---|---|---|---|---|---|
| `auth-01` | Wejście do Auth | `AccessEntryReady` | `entryRequested` | `access.resolve` | `auth-02|auth-03|auth-15` | `auth-27` |
| `auth-02` | Logowanie | `LoginFormReady` | `credentialsRequired` | `auth.login` | `auth-16|auth-29` | `auth-28` |
| `auth-03` | Wejście do rejestracji | `RegistrationChoiceReady` | `registrationMethodRequired` | `access.resolve` | `auth-04|auth-05` | `auth-27` |
| `auth-04` | Rejestracja adresem e-mail | `EmailRegistrationReady` | `emailRegistrationSelected` | `auth.register.email` | `auth-12` | `auth-28` |
| `auth-05` | Rejestracja przez OAuth | `OAuthRegistrationStarted` | `oauthRegistrationSelected` | `auth.oauth.start` | `auth-06|auth-13` | `auth-27` |
| `auth-06` | Weryfikacja adresu e-mail | `EmailVerificationPending` | `emailVerificationRequired` | `auth.email.verify` | `auth-13` | `auth-06|auth-27` |
| `auth-07` | Identyfikacja firmy | `CompanyIdentificationReady` | `companyContextRequired` | `company.lookup` | `auth-08|auth-10|auth-11` | `auth-27` |
| `auth-08` | Wyszukiwanie firmy | `CompanyLookupRunning` | `companySearchRequested` | `company.lookup` | `auth-09` | `auth-10` |
| `auth-09` | Sprawdzenie i edycja danych firmy | `CompanyDataReviewReady` | `companyCandidateSelected` | `company.draft.update` | `auth-12` | `auth-10` |
| `auth-10` | Ręczne wprowadzenie firmy | `ManualCompanyEntryReady` | `companyManualEntryRequired` | `company.draft.update` | `auth-12` | `auth-10` |
| `auth-11` | Firma już zarejestrowana | `CompanyAlreadyRegistered` | `companyAlreadyExists` | `invitation.request` | `auth-15|auth-28` | `auth-27` |
| `auth-12` | Zgody rejestracyjne | `RegistrationConsentsReady` | `registrationConsentsRequired` | `auth.consents.accept` | `auth-13` | `auth-12` |
| `auth-13` | Przetwarzanie rejestracji | `RegistrationProcessing` | `registrationSubmissionPending` | `auth.registration.finalize` | `auth-14` | `auth-27` |
| `auth-14` | Rejestracja zakończona | `RegistrationCompleted` | `registrationCompleted` | `access.bootstrap` | `auth-21|auth-29` | `auth-27` |
| `auth-15` | Przegląd zaproszenia | `InvitationReviewReady` | `invitationReceived` | `invitation.validate` | `auth-02|auth-04|auth-21` | `auth-28` |
| `auth-16` | Weryfikacja MFA | `MfaChallengeReady` | `mfaChallengeRequired` | `auth.mfa.verify` | `auth-21|auth-29` | `auth-16|auth-28` |
| `auth-17` | Konfiguracja MFA | `MfaEnrollmentReady` | `mfaEnrollmentRequired` | `auth.mfa.enroll` | `auth-16` | `auth-17` |
| `auth-18` | Prośba o odzyskanie hasła | `PasswordRecoveryRequestReady` | `passwordRecoveryRequested` | `auth.password.recovery.request` | `auth-19` | `auth-18` |
| `auth-19` | Informacja o wysłaniu resetu | `PasswordRecoverySent` | `passwordRecoveryEmailSent` | `auth.password.recovery.token.validate` | `auth-20` | `auth-18` |
| `auth-20` | Ustawienie nowego hasła | `NewPasswordReady` | `passwordResetTokenAccepted` | `auth.password.reset` | `auth-02` | `auth-20|auth-28` |
| `auth-21` | Rozwiązanie dostępu | `AccessResolutionReady` | `accessContextUnresolved` | `access.resolve` | `auth-22|auth-23|auth-29` | `auth-28` |
| `auth-22` | Wybór organizacji lub tenanta | `TenantSelectionReady` | `tenantSelectionRequired` | `access.tenant.select` | `auth-23|auth-29` | `auth-28` |
| `auth-23` | Wybór obszaru roboczego | `WorkspaceSelectionReady` | `workspaceSelectionRequired` | `access.workspace.select` | `auth-29` | `auth-28` |
| `auth-24` | Ponowne uwierzytelnienie | `ReauthenticationReady` | `freshAuthenticationRequired` | `auth.reauthenticate` | `auth-29` | `auth-28` |
| `auth-25` | Przetwarzanie wylogowania | `LogoutProcessing` | `logoutRequested` | `auth.logout` | `auth-26` | `auth-27` |
| `auth-26` | Ekran po wylogowaniu | `SignedOut` | `sessionTerminated` | `ui.return_to_login` | `auth-02` | `auth-27` |
| `auth-27` | Usługa Auth niedostępna | `AuthServiceUnavailable` | `authServiceUnavailable` | `auth.status.read` | `auth-01` | `auth-27` |
| `auth-28` | Dostęp zablokowany | `AccessBlocked` | `accessPolicyBlocked` | `auth.access.blocked.read` | `auth-18|auth-27` | `auth-28` |
| `auth-29` | Zakończenie procesu i wejście do aplikacji | `EnterApplication` | `applicationEntryReady` | `access.bootstrap` | `app-shell` | `auth-27` |

## Kryteria akceptacji
- 29 unikalnych surface IDs, states i domenowych reasons.
- Każda operacja API istnieje w rejestrze, a UI action w osobnym rejestrze.
- MFA enrollment, confirmation i challenge są osobnymi operacjami.
- Recovery request, token validation i reset są osobnymi operacjami.
- Automatyczny validator porównuje JSON, TS, CSV, ten dokument i dokumenty powierzchni.
