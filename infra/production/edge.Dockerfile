FROM nginx:1.30.4-alpine3.24@sha256:97d490c12ba55b4946b01546d1c3ed324e8d41ab1c9fcb2a616aa470620e5b46 AS runtime
RUN apk upgrade --no-cache libcrypto3 libssl3
RUN rm -f /etc/nginx/conf.d/default.conf
COPY infra/production/edge/nginx.conf.template /etc/nginx/templates/default.conf.template
# nginx's default temp/cache dirs live under /var/cache/nginx, and the
# envsubst entrypoint writes the rendered template into conf.d at startup;
# the master process never runs as root here (USER nginx below), so both
# need to be owned by it. The default nginx.conf's "pid /var/run/nginx.pid;"
# and "user nginx;" both assume a root master process; neither is true here.
RUN chown -R nginx:nginx /var/cache/nginx /etc/nginx/conf.d \
    && sed -i \
      -e 's#^pid\s\+.*;#pid /tmp/nginx.pid;#' \
      -e '/^user\s/d' \
      /etc/nginx/nginx.conf
USER nginx
EXPOSE 8443
