# Local Auth Runbook

Status: local/test only with server auth boundary

## Purpose

The local auth server lets developers run AUTH-001/AUTH-002 flows without a
production identity provider or real e-mail delivery. The local provider runs
behind `/api/auth` for runtime/E2E, while Storybook injects it explicitly as a
mock.

## Commands

Run auth unit, integration and local e2e tests:

```bash
fnm exec --using 24.18.0 pnpm --filter @papadata/web test:auth
```

Run true browser E2E with Vite, the auth server, HTTP and cookies:

```bash
fnm exec --using 24.18.0 pnpm --filter @papadata/web test:e2e:auth:browser
```

Run Storybook auth states and existing UI states:

```bash
fnm exec --using 24.18.0 pnpm test:storybook
```

Run the full repository test script:

```bash
fnm exec --using 24.18.0 pnpm test
```

## Fixtures

Typed auth fixtures live in:

- `apps/web/src/fixtures/auth-domain.ts`;
- `apps/web/src/fixtures/auth-experience.ts`.

The adapter exposes a controlled test outbox through `getTestOutbox()`. Tokens
are used by tests and Storybook fixtures only. Do not print tokens to normal
application logs.

## Debugging

1. Use `test:auth` first to isolate gateway behavior.
2. Use `test:storybook` to verify browser rendering and interaction tests.
3. Check audit events through `getAuditEvents()` in tests or
   `/api/auth/local-test/audit` in local E2E.
4. Verify CSRF by loading `/api/auth/csrf` and sending `X-PapaData-CSRF` on
   state-changing requests.
5. Verify that protected operations use explicit `organizationId` and
   `workspaceId`.
6. If a flow depends on a production security decision, keep it behind the
   provider-agnostic contract and record the blocker.

## Rollback

Rollback is source-only:

- remove the AUTH-001 files under `apps/web/src/auth`;
- remove AUTH-002 server files under `apps/web/src/server/auth`;
- remove Playwright auth E2E files under `apps/web/e2e` and
  `playwright.auth.config.ts`;
- remove `apps/web/src/screens/auth`;
- remove `apps/web/src/stories/auth`;
- restore `apps/web/src/app/App.tsx` to the previous dashboard entrypoint;
- remove auth docs added under `docs/adr`, `docs/architecture` and
  `docs/runbooks`;
- restore `apps/web/package.json`, `vite.config.ts`, `tsconfig.node.json`,
  `tsconfig.server.json` and `vitest.auth.config.ts`.

No production migrations, infrastructure changes, secrets or external provider
configuration are created by this local/test implementation.
