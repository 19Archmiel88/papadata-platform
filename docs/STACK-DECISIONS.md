# PapaData — katalog rekomendowanego stacku

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
- Drizzle ORM
- Drizzle Kit
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
