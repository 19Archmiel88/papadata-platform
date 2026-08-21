# PapaData — LP-5…LP-6 local production parity

Continues `docs/architecture/local-production-parity-lp0-lp4.md`. Implements the two items that
document explicitly deferred: **LP-5 (production web container)** and **LP-6 (local HTTPS edge)**.

## Status after applying this package

`https://papadata.localhost` is now a real, working origin in the local parity stack. The
canonical routing from `config/local-production-parity.contract.json` (`/api/* -> bff`,
`/* -> web`) is implemented by an `edge` reverse proxy in front of a new `web-production`
static container. `api` and `worker` remain private (never reachable through the edge).

## LP-5 — `web-production`

`infra/production/web.Dockerfile` builds `apps/web` with the normal production build
(`pnpm --filter @papadata/web build`, i.e. `tsc -b && vite build` — no dev server, no HMR) and
serves the static output from a non-root `nginx:1.27-alpine` container
(`infra/production/web/nginx.conf`):

- SPA fallback (`try_files $uri /index.html`) for deep links into the client-side
  History API router (`/app/*`, `/login`, `/register`, …).
- Hashed files under `/assets/` get `Cache-Control: public, max-age=31536000, immutable`;
  `index.html` gets `no-cache`.
- Source maps (`vite.config.ts` sets `sourcemap: true`) are stripped from the image at build
  time and additionally blocked at the nginx layer (`location ~* \.map$ { return 404; }`) —
  they are not published.
- `web-production` is `edge-only`: it publishes no port to the host, only the internal Docker
  network.

## LP-6 — local HTTPS edge

`infra/production/edge.Dockerfile` + `infra/production/edge/nginx.conf.template` (templated at
container start via the official nginx image's `envsubst`-on-templates entrypoint) terminate TLS
for `https://papadata.localhost` and route per the contract:

- `location /api/` → `bff-production:3001`. No security headers are added here — the BFF
  already originates its own (`@fastify/helmet` in `apps/bff/src/app.factory.ts`, including a
  restrictive `default-src 'none'` CSP appropriate for a JSON API). The edge must never layer a
  second `Content-Security-Policy` onto this path.
- `location /` → `web-production:8080`, and **is** the source of truth for browser-facing
  security headers (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy,
  Permissions-Policy, and a CSP shaped for the SPA — `script-src 'self'`, `style-src 'self'
  'unsafe-inline'` as a pragmatic default for React inline styles / recharts, `connect-src
  'self'`).
- `client_max_body_size` is templated from `BFF_MAX_BODY_BYTES` (the same env var the BFF itself
  uses, `apps/bff/src/config.ts`) — one source of truth instead of two limits that could drift.

Both `web` and `edge` run fully non-root (`USER nginx`) and therefore cannot bind ports below
1024 inside the container: nginx listens on `8080`/`8443` internally, and the host-visible port
443 is a Docker port mapping (`127.0.0.1:443:8443` for `edge`), so `https://papadata.localhost`
(no port suffix) still works for the browser.

### TLS certificate

`pnpm prepare:production-parity` now also generates a self-signed CA + `papadata.localhost`
server certificate (with the `subjectAltName` modern browsers require) under
`.runtime/backend-production-parity/edge-tls/`, mirroring the existing Redis TLS generation. It
is **not** installed into any OS/browser trust store automatically (that would require
interactive/sudo steps this script cannot take).

- Automated checks (smoke test, CI) trust it explicitly via
  `NODE_EXTRA_CA_CERTS=.runtime/backend-production-parity/edge-tls/ca.crt`.
- To browse `https://papadata.localhost` in a real browser, import
  `.runtime/backend-production-parity/edge-tls/ca.crt` into your OS/browser trust store once.

## Verification

```bash
pnpm prepare:production-parity
pnpm start:production-parity
```

Add `127.0.0.1 papadata.localhost` to `/etc/hosts` (WSL2/Linux reference path from LP-1), then:

```bash
NODE_EXTRA_CA_CERTS=.runtime/backend-production-parity/edge-tls/ca.crt pnpm test:web-production-parity
pnpm test:web-production-parity:csp
```

`test:web-production-parity` (`tests/web-production-parity/smoke.mjs`) walks the real
register → CSRF → session → logout flow through the edge, with a hand-rolled cookie jar (Node's
`fetch` has no browser-style automatic one), and asserts the session cookie now actually carries
`Secure` in a way a browser will honor — see "Critical dependency boundary" in
`local-production-parity-lp0-lp4.md`, which this closes.

`test:web-production-parity:csp` (`apps/web/playwright.production-parity.config.ts` +
`apps/web/tests/production-parity/csp.spec.ts` — placed inside `apps/web`, not next to the other
production-parity tests, because Node's ESM resolver needs `@playwright/test` reachable from the
importing file's own directory tree, and only `apps/web` declares that dependency) is a narrow
Playwright check — not a general E2E suite — that opens `/`, `/login`, `/app` in Chromium and
fails on any Content-Security-Policy console violation. This is the only reliable way to confirm
the edge's CSP doesn't silently block real app resources; a passing header-presence check alone
is not sufficient. It already caught a real bug during development: the build embeds
`@fontsource` files as `data:` URIs, which the initial CSP's `font-src 'self'` blocked — fixed by
adding `data:` to `font-src` in `infra/production/edge/nginx.conf.template`.

Convenient side effect: Chromium (and recent Firefox) resolve any `*.localhost` hostname straight
to loopback per RFC 6761, without needing the `/etc/hosts` entry above — real browsers just work.
Node's `fetch` (used by `tests/web-production-parity/smoke.mjs`) and `curl` do not have this
special case, so the `/etc/hosts` entry is still required for those.

### Manual browser acceptance (still required)

Automated checks cover TLS trust chain, CSRF/cookie semantics and CSP violations. The final
acceptance is still a human, once: register → login → AppShell → logout at
`https://papadata.localhost` with a trusted CA, DevTools console open, zero errors.

### Former blocker — resolved

The tenant-bootstrap RLS bug described below (previously blocking live execution of the
register → CSRF → session → logout flow) was fixed in `971a10d` (`packages/database`:
`product-domain.ts`, `production.ts`, plus a new `identityBootstrapScope.test.mjs`), with two
follow-up fixes in the same session: `6056a1b` (BFF logout DI) and `84e70ed` (added an explicit
session-invalid-after-logout assertion to the smoke test).

Re-verified live on 2026-08-20 against the full built stack (`docker compose ... up --build
--wait`): `pnpm test:web-production-parity` now passes end-to-end with `"result": "pass"` and
`"failures": []` — registration succeeds (real tenant/workspace IDs returned), the session cookie
carries `HttpOnly; Secure; SameSite=Strict`, the CSRF cookie carries `Secure; SameSite=Strict`,
logout returns `{"loggedOut":true}`, and a session check afterward correctly returns `401`.
`pnpm test:web-production-parity:csp` passes 3/3 with zero CSP violations on `/`, `/login`,
`/app`. Everything web/edge-owned — TLS handshake and chain, `/api/*` → BFF and `/*` →
web-production routing, BFF's own CSP passing through `location /api/` untouched, the edge's own
security headers and CSP on `location /`, SPA fallback on a deep link, and `Cache-Control:
immutable` on hashed assets — is now verified live together with the auth flow, not separately.

What remains is only the one step that can't be automated: a human, once, doing the manual
browser acceptance pass below with DevTools open.

## Updating the contract

`config/local-production-parity.contract.json` (`implementedScope`, `scopeBoundary`,
`parityMatrix`) and `tools/verify-local-parity-contract.mjs` are updated to reflect LP-5/LP-6
**only after** the verification steps above are green — not as part of writing the code. A
contract that claims `close`/`included` before that is exactly the stale-SSOT problem this work
is meant to avoid.

## Deferred

LP-7 (local email delivery), LP-8 (deterministic product seed), LP-9 (provider simulator),
LP-10+ (complete customer vertical, full browser E2E beyond the narrow CSP check above), and the
GCP-side HTTPS Load Balancer + Certificate Manager + Cloud Armor equivalent of this edge (staging
acceptance, not local parity) all remain out of scope here.

### Docker Desktop / WSL2 host-port compatibility

OpenTelemetry keeps its standard container ports `4317` and `4318`. Local production-parity
publishes them on host ports `14317` and `14318`. The previous host ports `54317` and `54318`
can overlap Windows excluded TCP port ranges under Docker Desktop/WSL2 and prevent the stack
from starting even when no process is listening on those ports.
