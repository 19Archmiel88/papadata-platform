# ADR 0002: Server-side auth execution boundary

Status: accepted for local/test implementation

Date: 2026-07-19

## Context

AUTH-001 delivered provider-agnostic auth flows through a deterministic
local/test adapter. That adapter was useful for UI, Storybook and scenario
coverage, but it still executed trusted decisions in frontend-importable code.

`docs/spec/security.md` and `docs/spec/source-of-truth.md` require backend-side
authorization, explicit `tenantId` and `workspaceId`, secure sessions,
CSRF protection and audit events generated outside the browser.

The production IdP, backend runtime, durable database, session store and TTL
policy remain unresolved in `docs/spec/decisions.md`.

## Decision

PapaData now has a minimal server-side auth boundary under
`apps/web/src/server/auth`.

The boundary provides:

- HTTP routing under `/api/auth`;
- HttpOnly cookie sessions with environment-dependent `Secure`;
- Origin, Host and CSRF validation for state-changing operations;
- server-side session restore, refresh, logout, list and revoke;
- server-side MFA challenge verification for `totp_dev`;
- password recovery, password reset and password change after reauthentication;
- invitation check, accept, create, resend and cancel;
- tenant/workspace selection and backend authorization checks;
- rate-limit interface with a local/test in-memory adapter;
- persistence interfaces for future durable repositories;
- server-side audit events without passwords, raw tokens, MFA codes, recovery
  codes or full cookies;
- true browser E2E coverage through Playwright.

The frontend runtime uses `serverAuthApiClient` and no longer imports
`localAuthGateway` by default. Storybook injects the local/test gateway
explicitly through stories.

## Non-decisions

No production IdP is selected. No Auth0, Clerk, Firebase Auth, Cognito,
Keycloak, Supabase Auth, OIDC SDK or provider SDK is added.

No production database, distributed session store, distributed rate-limit store,
email provider, MFA method or hosting platform is selected by this ADR.

## Consequences

- The browser no longer creates trusted sessions or verifies trusted passwords
  in runtime app mode.
- Local/test still uses deterministic fixtures and a local provider, but only as
  an adapter behind the server boundary or an explicit Storybook mock.
- The session cookie value is not returned as public UI state; session lists use
  server-issued public handles.
- Production remains blocked until the decisions in
  `docs/security/auth-production-blockers.md` are resolved.
