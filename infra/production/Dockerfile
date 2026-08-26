FROM node:24.18.1-alpine3.24@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS build

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

FROM node:24.18.1-alpine3.24@sha256:f70403e87646dc51b45295f4b8b70cdad0b63d2297c4c9899119b03f7af7a6b3 AS runtime

RUN apk upgrade --no-cache libcrypto3 libssl3

ENV NODE_ENV=production

WORKDIR /app

RUN rm -rf \
      /usr/local/lib/node_modules/npm \
      /usr/local/lib/node_modules/corepack \
      /opt/yarn-v1.22.22 \
    && rm -f \
      /usr/local/bin/npm \
      /usr/local/bin/npx \
      /usr/local/bin/corepack \
      /usr/local/bin/pnpm \
      /usr/local/bin/pnpx \
      /usr/local/bin/yarn \
      /usr/local/bin/yarnpkg

RUN addgroup -S papadata \
    && adduser -S papadata -G papadata

COPY --from=build --chown=papadata:papadata /runtime ./

USER papadata

EXPOSE 4000

CMD ["node", "dist/production/main.js"]
