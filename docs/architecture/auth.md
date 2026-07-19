# Auth Architecture

Status: local/test server boundary, production IdP unresolved

## Boundaries

- `apps/web/src/contracts/auth.ts` defines the auth contracts used by UI and tests.
- `apps/web/src/auth/serverAuthApiClient.ts` is the runtime frontend API client.
- `apps/web/src/auth/localAuthGateway.ts` implements a deterministic local/test
  provider used behind the server boundary and as an explicit Storybook mock.
- `apps/web/src/server/auth` contains the local/test HTTP auth boundary.
- `apps/web/src/screens/auth/AuthOperationalScreen.tsx` is the shared production
  screen used by the Vite app and Storybook.
- `apps/web/src/fixtures/auth-domain.ts` and `auth-experience.ts` provide typed
  fixtures.

The current repo still has no production `apps/bff`, `apps/api`, worker,
database schema, distributed session store or approved IdP. Those remain
required for production.

## Server Boundary

AUTH-002 adds a minimal Node HTTP boundary under `/api/auth`. It handles session,
MFA, password reset/change, invitations, organization/workspace selection,
backend authorization checks, reauthentication, rate-limit interfaces and
server-side audit.

The server uses HttpOnly cookie sessions. `Secure` is only set when the server
environment is `production`; local HTTP does not claim secure cookies. CSRF is
enforced for state-changing methods through Origin, Host and token checks.

The response model does not expose the cookie session value as public state.
Session lists use server-issued public handles.

## Session Model

The local/test session model includes:

- `sessionId`;
- `userId`;
- explicit `organizationId` and `workspaceId` when selected;
- status: `active`, `expiring`, `expired`, `revoked`,
  `reauthentication_required`;
- `createdAt`, `lastActivityAt`, `expiresAt`, `idleExpiresAt`;
- MFA satisfaction flag;
- short-lived `reauthenticatedUntil`.

The local/test server rotates session IDs during refresh and marks the previous
session revoked. AUTH-002 implements this with HttpOnly cookies, SameSite
policy, CSRF, Origin/Host validation and server-side session state. Production
still needs a durable distributed session store and approved TTL policy.

## MFA Model

The production MFA method is not decided. The local/test adapter exposes
`totp_dev` only as a developer fixture method and validates it server-side. It
supports:

- challenge creation;
- challenge TTL;
- invalid code handling;
- retry limit;
- recovery codes;
- one-time recovery code use;
- recovery code regeneration after reauthentication;
- MFA disable after reauthentication;
- audit events.

SMS MFA is not implemented.

## Invitations

Invitations are bound to:

- `organizationId`;
- `workspaceId`;
- requested role;
- e-mail;
- one-time token;
- TTL;
- status: `active`, `expired`, `cancelled`, `used`.

The local/test adapter supports create, resend, cancel and accept. New account
activation is only possible through an invitation token, not through open public
registration.

## Organization And Workspace Context

After authentication, context resolution returns one of:

- workspace selected;
- organization selection required;
- workspace selection required;
- no active membership;
- workspace not ready;
- workspace blocked;
- workspace no data.

Every protected operation receives explicit `organizationId` and `workspaceId`.
No `tenantId` field is introduced.

## Authorization

Auth and authz are separate. Role grants are not product decisions yet because
`docs/spec/access-matrix.md` is still `TBD`.

The local/test adapter uses fixture capabilities only for deterministic tests.
The default decision is deny-by-default.

## Audit Events

Implemented event types include:

- login succeeded and failed;
- logout;
- session expired;
- refresh failed and refresh reuse detected;
- password reset requested and completed;
- MFA configured and failed;
- recovery code used;
- recovery codes regenerated;
- MFA disabled;
- invitation created, resent, cancelled and accepted;
- membership changed;
- reauthentication completed;
- session revoked;
- unauthorized access attempt;
- workspace changed.

Audit events include correlation ID, result, actor when available, organization,
workspace, target metadata and reason. Server audit output does not include
passwords, raw tokens, MFA codes, raw recovery codes or full cookies.

## Known Production Gaps

- Production IdP ADR is missing.
- Production backend runtime/hosting decision is missing.
- Database schema and migrations do not exist yet.
- Distributed session and rate-limit stores do not exist yet.
- Audit log is in-memory in local/test, not append-only durable storage.
