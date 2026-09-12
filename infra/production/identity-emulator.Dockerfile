# Local production-parity-only emulator of the GCE/Cloud Run metadata
# identity-token endpoint. See infra/production/identity-emulator/server.mjs
# for exactly what this does and does not replicate. Never built or shipped
# as part of the api/bff/worker/web production images -- this exists purely
# so compose.production-parity.yml's bff-production can exercise the same
# CloudRunIdentityService code path production does.
FROM node:24.18.0-alpine3.24@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS runtime
WORKDIR /workspace
COPY infra/production/identity-emulator/server.mjs ./server.mjs
RUN addgroup -S identity-emulator && adduser -S identity-emulator -G identity-emulator
USER identity-emulator
EXPOSE 8081
CMD ["node", "server.mjs"]
