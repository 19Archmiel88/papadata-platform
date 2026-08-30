FROM node:24.18.0-alpine

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/bff/package.json apps/bff/package.json
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/integrations/package.json packages/integrations/package.json
COPY packages/storage/package.json packages/storage/package.json
COPY packages/ai-runtime/package.json packages/ai-runtime/package.json
COPY packages/testing/package.json packages/testing/package.json

RUN pnpm install --frozen-lockfile

COPY apps/api apps/api
COPY apps/bff apps/bff
COPY apps/worker apps/worker
COPY packages packages

RUN pnpm --filter @papadata/api --filter @papadata/bff --filter @papadata/worker build

ENV NODE_ENV=development
