FROM node:24.18.0-alpine AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/bff/package.json apps/bff/package.json
RUN pnpm install --frozen-lockfile
COPY apps/bff apps/bff
RUN pnpm --filter @papadata/bff build
RUN pnpm --filter @papadata/bff --prod deploy --legacy /runtime

FROM node:24.18.0-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S papadata && adduser -S papadata -G papadata
COPY --from=build --chown=papadata:papadata /runtime ./
USER papadata
EXPOSE 3001
CMD ["node", "dist/main.js"]
