FROM node:24.18.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/worker/package.json apps/worker/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/integrations/package.json packages/integrations/package.json
COPY packages/storage/package.json packages/storage/package.json
RUN pnpm install --frozen-lockfile
COPY apps/worker apps/worker
COPY packages/contracts packages/contracts
COPY packages/database packages/database
COPY packages/integrations packages/integrations
COPY packages/storage packages/storage
RUN pnpm --filter @papadata/worker... build
RUN pnpm --filter @papadata/worker --prod deploy --legacy /runtime

FROM node:24.18.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S papadata && adduser -S papadata -G papadata
COPY --from=build --chown=papadata:papadata /runtime ./
USER papadata
CMD ["node", "dist/production/main.js"]
