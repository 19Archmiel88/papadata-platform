FROM node:24.18.0-bookworm-slim AS base
RUN corepack enable
WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY contracts ./contracts
RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM node:24.18.0-bookworm-slim AS runtime
RUN corepack enable
WORKDIR /workspace
COPY --from=base /workspace /workspace
ENV NODE_ENV=production
CMD ["node", "apps/api/dist/production/main.js"]
