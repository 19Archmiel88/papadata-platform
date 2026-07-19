# Auth threat model

Status: local/test boundary coverage, production controls pending decisions.

## Assets

- Session cookie and server-side session state.
- User identity, credentials and MFA state.
- Tenant, workspace and membership records.
- Invitation, password reset and recovery-code tokens.
- Audit events and correlation IDs.

## Trust Boundaries

- Browser is untrusted for auth decisions.
- `serverAuthApiClient` is a transport client only.
- `/api/auth` is the trusted local/test execution boundary.
- `localAuthGateway` is a local/test provider behind the boundary, not a
  production IdP.
- Storybook mocks are deterministic fixtures, not production security controls.

## Covered Threats

- Missing, expired and revoked cookies.
- Session fixation and session rotation reuse.
- CSRF through Origin, Host and token validation.
- Open redirect return URLs.
- Wrong tenant/workspace and foreign workspace access.
- Missing membership and missing capability.
- One-time reset, invitation and recovery-code reuse.
- MFA retry limit.
- Neutral responses for unknown users.
- Passwords, raw tokens, MFA codes and cookies excluded from server audit
  output.

## Residual Production Risks

- No production IdP is selected.
- No durable database or append-only audit store exists.
- No distributed session or rate-limit store exists.
- `totp_dev` is local/test only and has no production approval.
- MFA secret encryption and e-mail delivery are not selected.
- TTL, retention, RTO and RPO policies are not approved.

## Required Negative Tests

The local/test suite covers wrong workspace, foreign workspace, no membership,
missing capability, missing cookie, revoked/expired cookie, CSRF rejection,
token reuse and MFA retry limit. Every future data-bearing feature must add a
negative test for a foreign `workspaceId` with explicit `tenantId`.
