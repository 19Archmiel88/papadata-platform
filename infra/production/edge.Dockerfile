FROM nginx:1.27-alpine@sha256:65645c7bb6a0661892a8b03b89d0743208a18dd2f3f17a54ef4b76fb8e2f2a10 AS runtime
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
