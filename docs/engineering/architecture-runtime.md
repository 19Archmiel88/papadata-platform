# PapaData runtime architecture and production acceptance

## Status

This document describes the executable runtime that exists in the repository. It separates three different claims that must never be conflated:

1. **code readiness** — static contracts, typecheck/build and repository-owned checks;
2. **local production parity** — the production containers running together behind the local HTTPS edge;
3. **production acceptance** — evidence from the real GCP staging environment and repository governance bound to an immutable Git SHA.

Target architecture is not evidence of implementation. `config/local-production-parity.contract.json` contains separate `implementedArchitecture` and `targetArchitecture` sections.

## Runtime ownership

```text
Browser
  -> HTTPS edge / external HTTPS Load Balancer
     -> /*       -> Web
     -> /api     -> BFF
     -> /api/*   -> BFF
                    -> API
                       -> PostgreSQL
                       -> Redis/BullMQ
                       -> Object Storage
                    Worker <- Redis/BullMQ
                       -> PostgreSQL
                       -> Object Storage
                       -> configured external providers
```

### Web

- canonical production build: `apps/web`;
- immutable production container: `infra/production/web.Dockerfile`;
- local parity service: `web-production` in `compose.production-parity.yml`;
- GCP: Cloud Run Web + serverless NEG from `infra/terraform`;
- Storybook renders canonical shared product screens/components; it is not a production runtime owner.

### Edge/BFF/API

- local HTTPS edge: `infra/production/edge.Dockerfile` and nginx configuration;
- GCP edge: External Managed HTTPS Load Balancer, managed certificate and Cloud Armor;
- BFF is the only public API boundary behind `/api` and `/api/*`;
- API remains private and receives signed internal principal context from BFF.

### PostgreSQL and tenant isolation

- migrations: `packages/database/migrations`;
- application runtime uses tenant/workspace scoped database access and RLS;
- privileged platform database access is reserved for explicitly system-owned scheduler/retention/worker tasks;
- migration parity is checked by `pnpm verify:migration-parity`.

### Redis and Worker

- Redis is the durable queue/cache coordination layer;
- BullMQ queue: `papadata-platform-jobs`;
- critical asynchronous jobs run in `apps/worker`;
- Assistant Run generation is queue-owned (`assistant_generation`) and persisted in `app.assistant_generation_runs` with request payload, attempt count, heartbeat and lease state;
- API does not own a long-lived in-memory generation controller.

### Papa AI runtime

- provider selection is canonical in `@papadata/ai-runtime` through `createPapaProviderRuntime`;
- Papa conversation/generation orchestration is canonical in `@papadata/papa-runtime`;
- both compatibility API operations and the durable Worker use the same provider/orchestration layer;
- a configured remote provider is fail-closed when its endpoint/host/model/key contract is invalid.

## Executable local gates

### Repository/code readiness

```bash
pnpm verify:docs-integrity
pnpm verify:p0-code
pnpm verify:p1-code
pnpm typecheck
pnpm build
pnpm verify:backend
pnpm verify:backend-security
pnpm verify:migration-parity
```

### Local production parity

```bash
pnpm prepare:production-parity
pnpm verify:production-parity-env
pnpm verify:production-parity-runtime
```

`verify:production-parity-runtime` validates the backend production stack. P1 adds a separate real browser/edge gate:

```bash
pnpm test:web-production-parity
```

That gate builds/starts the production-parity stack and verifies:

- the browser origin is HTTPS;
- Web security headers and CSP;
- BFF/API routing through the edge;
- no source maps/Storybook development artifacts in the Web image;
- `/`, `/login`, `/register` and `/app` browser smoke;
- Web restart recovery;
- Edge restart recovery;
- Web outage fail-closed behavior and recovery;
- zero browser page/console errors in the smoke path.

### Storybook, accessibility and responsive acceptance

```bash
pnpm build-storybook
pnpm test:storybook-acceptance
```

The browser acceptance harness loads the generated Storybook index and checks canonical stories using Chromium and axe. It records evidence for WCAG A/AA violations, page/console errors, keyboard focus, horizontal overflow, 320px reflow, and desktop/tablet/mobile screenshots for product-screen stories.

Evidence is written under `artifacts/storybook-acceptance` and is uploaded by CI.

## Terraform and GCP staging

Static IaC validation is mandatory in `Platform production foundation`:

```text
terraform fmt -check
terraform init -backend=false
terraform validate
Trivy config HIGH/CRITICAL
```

A real Terraform `plan` is intentionally separate because it requires staging credentials, immutable image digests, secret IDs and environment-specific variables. `.github/workflows/staging-production-acceptance.yml` authenticates through GitHub OIDC/WIF and executes the staging plan from `PAPADATA_TERRAFORM_STAGING_VARS_JSON`.

The same workflow executes:

```bash
pnpm verify:gcp-staging
pnpm verify:oauth-staging
pnpm verify:infra-drill-evidence
```

`GCP staging` evidence means the real public HTTPS origin is reachable through the load balancer with Web/BFF routing and security headers. It is not inferred from local Compose.

Cloud SQL restore, Memorystore failover, Cloud Armor enforcement and managed LB/TLS are managed-service behaviors. They require dated external drill evidence; the repository does not perform a destructive restore/failover automatically.

## OAuth identity

Terraform provisions the Google/Microsoft OAuth client IDs and Secret Manager references for the API runtime. Production acceptance additionally calls the real staging OAuth start endpoints and verifies that authorization URLs resolve to the expected Google/Microsoft authorization hosts without exposing credentials.

## Repository governance

Production release is blocked until `main` is protected by repository administration. The required policy lives in `config/github-governance.required.json` and is machine-checked with:

```bash
pnpm verify:github-governance
```

The repository-side package cannot safely grant itself administration rights or enable protection. An administrator must configure PR-only merging, required reviews/conversation resolution and required status checks. The result is external release evidence.

## P1 acceptance

Repository-owned implementation:

```bash
pnpm verify:p1-code
```

Production acceptance:

```bash
pnpm verify:p1-release
```

`verify:p1-release` requires `artifacts/p1-release-evidence.json`, bound to an immutable 40-character release SHA. The file must reference real CI/GCP/GitHub evidence; copying the example file or changing `pending` to `pass` without evidence does not constitute acceptance.

## Release rule

A green local build is necessary but insufficient. Production release requires, for the exact same immutable commit/image digests:

1. P0/P1 code gates;
2. typecheck/build/backend/security/migration gates;
3. browser production parity and Storybook a11y/responsive acceptance;
4. Terraform static validation and authenticated staging plan;
5. GCP staging + OAuth live acceptance;
6. current restore/failover/Cloud Armor/TLS evidence;
7. protected `main` and required checks;
8. P0 and P1 release-evidence gates.
