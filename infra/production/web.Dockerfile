FROM node:24.18.0-alpine3.24@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS build
WORKDIR /workspace
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json turbo.json ./
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile
# apps/web reaches the repo-root contracts/ directory via relative imports
# (e.g. "../../../../../contracts/api-schemas"), not as a workspace package.
COPY contracts contracts
COPY apps/web apps/web
RUN pnpm --filter @papadata/web build
# Source maps are generated for local debugging builds but must not be served
# from the production image (config/local-production-parity contract: web is
# publicly reachable through the edge).
RUN find apps/web/dist -name '*.map' -delete

FROM nginx:1.30.4-alpine3.24@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46 AS runtime
RUN apk upgrade --no-cache libcrypto3 libssl3
RUN rm -f /etc/nginx/conf.d/default.conf
COPY infra/production/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build --chown=nginx:nginx /workspace/apps/web/dist /usr/share/nginx/html
# nginx's default temp/cache dirs live under /var/cache/nginx; the master
# process never runs as root here (USER nginx below), so it must own them.
# The default nginx.conf's "pid /var/run/nginx.pid;" and "user nginx;" both
# assume a root master process (write access to /var/run; privilege drop);
# neither is true for this non-root container, so both are rewritten.
RUN chown -R nginx:nginx /var/cache/nginx \
    && sed -i \
      -e 's#^pid\s\+.*;#pid /tmp/nginx.pid;#' \
      -e '/^user\s/d' \
      /etc/nginx/nginx.conf
USER nginx
EXPOSE 8080
