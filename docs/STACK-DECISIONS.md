# PapaData — katalog rekomendowanego stacku

## Stan instalacji 2026-07-20

Ten dokument opisuje stack rekomendowany i docelowy. Nie wszystkie pozycje są
już zainstalowane.

Aktualnie w repo działają:

- pnpm, Turborepo, TypeScript, ESLint, markdownlint i cspell;
- React, React DOM, Vite, Tailwind CSS, Radix UI, Lucide, Motion, Zod,
  Vitest, Playwright, Storybook i `rehype-sanitize` w `apps/web`;
- lokalne pakiety `@papadata/contracts`, `@papadata/database` i
  `@papadata/testing`;
- lokalny Docker Compose z PostgreSQL, Redis, API, worker i migracjami SQL.

Nie są jeszcze zainstalowane jako produkcyjny runtime: NestJS, `pg`,
ioredis, OpenTelemetry, provider SDK GCP, billing SDK ani OpenAI SDK. Ich
dodanie nadal wymaga właściwego zadania, ADR lub zgody zgodnie z `AGENTS.md`.

## Instalowane w fundamencie

### Root / tooling
- pnpm
- Turborepo
- TypeScript
- ESLint
- Prettier
- EditorConfig
- markdownlint
- Knip
- dependency-cruiser
- Husky
- lint-staged
- commitlint
- Vitest

### Web
- React
- React DOM
- Vite
- React Router
- TanStack Query
- Zod
- React Hook Form
- Tailwind CSS
- Radix UI
- class-variance-authority
- clsx
- tailwind-merge
- Lucide React
- Motion
- i18next
- react-i18next
- MSW
- React Testing Library
- Playwright
- Storybook
- ECharts
- date-fns

### BFF/API/Worker
- NestJS
- Fastify
- Zod
- nestjs-zod
- @nestjs/swagger
- Pino
- nestjs-pino
- pg
- plain SQL migrations
- ioredis
- OpenTelemetry
- Undici
- p-retry
- Bottleneck
- Decimal.js
- Luxon
- uuid
- AJV
- CloudEvents SDK

### GCP adapters
- @google-cloud/pubsub
- @google-cloud/tasks
- @google-cloud/storage
- @google-cloud/secret-manager
- @google-cloud/kms

### Testing
- Testcontainers
- Bruno
- k6
- axe / accessibility tooling
- OpenAPI diff tooling

## Instalowane po decyzji

### Auth
- openid-client
- wybrany SDK IdP

### Billing
- wybrany SDK operatora po ADR

### AI
- oficjalny SDK OpenAI
- Promptfoo
- pgvector, jeśli retrieval wymaga wektorów

### Eksport
- Excel/PDF/CSV dopiero z konkretnym kontraktem eksportu

## Nie instalować bez ADR

- Kubernetes
- Kafka
- Temporal
- GraphQL
- Elasticsearch/OpenSearch
- osobna baza wektorowa
- LangChain
- BigQuery
- dbt
- Dataform
- mikrofrontendy
- drugi framework UI
- drugi silnik wykresów
