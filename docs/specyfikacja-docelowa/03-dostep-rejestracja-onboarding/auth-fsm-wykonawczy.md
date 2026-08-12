---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-07-30T12:30:00+02:00
id: DOC-AUTH-FSM-EXECUTION
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Auth FSM — model wykonawczy 1.0 po audycie

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
