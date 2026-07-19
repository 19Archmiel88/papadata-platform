# ADR 0001: Provider-agnostic auth boundary

Status: accepted for local/test implementation

Date: 2026-07-19

## Context

`docs/spec/decisions.md` leaves the production identity provider, token TTLs,
session timeouts, MFA methods and invitation TTL unresolved. `00-INSTRUKCJA-STARTU.md`
also says not to build a custom production password and MFA system.

AUTH-001 still requires end-to-end local and test auth flows without a production
provider.

## Decision

PapaData auth is implemented behind a provider-agnostic `AuthGateway` contract.
The current implementation uses a deterministic in-memory local/test adapter in
`apps/web/src/auth/localAuthGateway.ts`.

The adapter is not a production IdP and must not be presented as one. It exists
to validate product flows, UI states, audit events, one-time tokens, session
expiry, MFA challenge behavior and authorization boundaries before the approved
IdP is selected.

No Auth0, Clerk, Firebase Auth, Cognito, Keycloak, OIDC SDK or provider-specific
SDK has been added.

## Consequences

- Production auth remains blocked by the IdP ADR and session policy decisions.
- Local/test flows can run deterministically without external e-mail or IdP.
- UI and Storybook use the same auth screen and fixtures as the app.
- Passwords, MFA codes, recovery codes and tokens are never written to audit
  events.
- Secure cookies, CSRF and server-side session store are implemented for
  local/test in ADR 0002 and remain production BFF/runtime responsibilities.

## Follow-up Decisions

- Production IdP and OIDC integration.
- Access token TTL.
- Refresh token TTL.
- Idle and absolute session timeout.
- Production MFA methods.
- Invitation TTL.
- Audit retention.
