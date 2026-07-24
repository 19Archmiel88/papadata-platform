FROM node:24.18.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/integrations/package.json packages/integrations/package.json
COPY packages/storage/package.json packages/storage/package.json
COPY packages/ai-runtime/package.json packages/ai-runtime/package.json
RUN pnpm install --frozen-lockfile
COPY apps/api apps/api
COPY packages/contracts packages/contracts
COPY packages/database packages/database
COPY packages/integrations packages/integrations
COPY packages/storage packages/storage
COPY packages/ai-runtime packages/ai-runtime
RUN pnpm --filter @papadata/api... build
RUN pnpm --filter @papadata/api --prod deploy --legacy /runtime

FROM node:24.18.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S papadata && adduser -S papadata -G papadata
COPY --from=build --chown=papadata:papadata /runtime ./
USER papadata
EXPOSE 4000
CMD ["node", "dist/production/main.js"]
