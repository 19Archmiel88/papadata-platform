# PapaData — LP-0…LP-4 local production parity

Baseline: `8b05902f7f166bee0b2d3d28aa34dfbde151e2f9` (`main`)

## Status after applying this package

This package implements the code/config foundation for LP-0 through LP-4. It does **not**
claim LOCAL-PARITY-GO. The HTTPS edge, production web container and complete customer
vertical are deliberately outside this ZIP and remain LP-5/LP-6+.

## LP-0 — environment contract

Canonical local hostname: `papadata.localhost`.

Canonical future public origin: `https://papadata.localhost`.

Deployment decision:

- web is an immutable static SPA artifact;
- the production form of that artifact will be a container;
- local parity and GCP use the same web artifact/container model;
- `/api/*` is routed to BFF;
- every other public path is routed to web;
- API and worker are never public.

The machine-readable source is:

`config/local-production-parity.contract.json`

## LP-1 — workstation preflight

Run:

```bash
pnpm preflight:local-parity
```

For an already-running stack:

```bash
pnpm preflight:local-parity -- --allow-running
```

Required gates:

- Node exactly 24.18.0;
- pnpm exactly 10.29.3;
- Git;
- OpenSSL;
- Docker CLI;
- Docker daemon;
- Docker Compose v2;
- required ports.

On Windows, WSL2/Linux is the reference execution path.

## LP-2 — env/secrets source of truth

Normative contract:

`config/production-parity-env.contract.json`

The contract controls:

- generated local secrets;
- derived connection URLs;
- shared API↔BFF internal auth material;
- canonical BFF origin/host;
- generated `.env.production-parity.example`;
- validation against Compose, frontend and Terraform.

Generate runtime secrets/TLS:

```bash
pnpm prepare:production-parity
```

Verify drift:

```bash
pnpm verify:production-parity-env
pnpm verify:local-parity-contract
```

Do not manually maintain `.env.production-parity.example`.

## LP-3 — backend parity hardening

Changes include:

- local Redis aligned to GCP Redis 7.2 family;
- all diagnostic host ports bound only to `127.0.0.1`;
- restart policy for persistent/runtime services;
- `init` and graceful stop periods for API/BFF/worker;
- `no-new-privileges` for application containers;
- API and BFF health checks;
- BFF waits on healthy API and Redis;
- worker waits on completed migrations and healthy stateful dependencies.

Baseline smoke remains:

```bash
BFF_BASE_URL=http://127.0.0.1:53001 pnpm test:backend-production-parity
```

Restart harness:

```bash
pnpm test:backend-production-parity:restart
```

Controlled PostgreSQL/Redis outage recovery:

```bash
pnpm test:backend-production-parity:restart -- --chaos
```

The chaos mode intentionally stops stateful services and must only be run against local parity.

## LP-4 — real frontend runtime

Implemented without introducing a new router dependency:

- browser History API router;
- `/login`;
- `/register`;
- protected `/app`;
- session bootstrap from `GET /api/v1/auth/session`;
- login through `POST /api/v1/auth/login`;
- registration through `POST /api/v1/auth/register/email`;
- CSRF acquisition through `GET /api/csrf`;
- logout through `POST /api/v1/auth/logout`;
- HttpOnly session cookies through the existing BFF;
- AppShell;
- first protected `Centrum Dowodzenia` surface;
- protected BFF→API probe.

Frontend defaults to same-origin BFF calls. `VITE_BFF_BASE_URL` exists only as a development
override.

### Critical dependency boundary

In production-parity BFF sets `Secure` cookies. Therefore a browser flow matching production
transport cannot be fully accepted over direct HTTP ports. The code in LP-4 is real, but the
final browser-level production-parity acceptance is blocked until LP-6 supplies the canonical
HTTPS edge for `https://papadata.localhost`.

This is intentional. Do not weaken `Secure`, CSRF, Origin or Host validation to make LP-4
appear complete.

## Static acceptance

After applying:

```bash
pnpm verify:local-parity
pnpm build:web
pnpm verify:backend
```

Then prepare/start the parity stack:

```bash
pnpm preflight:local-parity
pnpm prepare:production-parity
pnpm verify:production-parity-env
pnpm start:production-parity
```

In a second terminal:

```bash
pnpm test:backend-production-parity
pnpm test:backend-production-parity:restart
```

Do not commit until all repository gates required by the project are green.
