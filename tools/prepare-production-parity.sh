#!/usr/bin/env sh

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." 2>/dev/null && pwd)"
runtime_dir="${repo_root}/.runtime/backend-production-parity"
tls_dir="${runtime_dir}/redis-tls"
env_file="${repo_root}/.env.production-parity"
ready=1
reuse_existing=0

if [ -z "$repo_root" ] || [ ! -f "$repo_root/compose.production-parity.yml" ]; then
  echo "Cannot resolve the PapaData repository root."
  ready=0
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "OpenSSL is required to generate local production-parity certificates."
  ready=0
fi

if [ "$ready" -eq 1 ] \
  && [ "${PAPADATA_REGENERATE_PARITY:-0}" != "1" ] \
  && [ -f "$env_file" ] \
  && [ -f "$tls_dir/ca.crt" ] \
  && [ -f "$tls_dir/server.crt" ] \
  && [ -f "$tls_dir/server.key" ] \
  && openssl x509 -checkend 86400 -noout -in "$tls_dir/server.crt" >/dev/null 2>&1; then
  reuse_existing=1
fi

if [ "$ready" -eq 1 ] && [ "$reuse_existing" -eq 0 ]; then
  mkdir -p "$tls_dir"
  chmod 700 "$runtime_dir" "$tls_dir"

  cat > "$runtime_dir/redis-server.cnf" <<'CONFIG'
[req]
distinguished_name = dn
prompt = no
req_extensions = req_ext

[dn]
CN = redis-production

[req_ext]
subjectAltName = @alt_names

[alt_names]
DNS.1 = redis-production
DNS.2 = localhost
IP.1 = 127.0.0.1
CONFIG

  openssl req \
    -x509 \
    -newkey rsa:3072 \
    -sha256 \
    -nodes \
    -days 30 \
    -subj "/CN=PapaData Production Parity Redis CA" \
    -keyout "$tls_dir/ca.key" \
    -out "$tls_dir/ca.crt" >/dev/null 2>&1 || ready=0

  if [ "$ready" -eq 1 ]; then
    openssl req \
      -newkey rsa:3072 \
      -sha256 \
      -nodes \
      -config "$runtime_dir/redis-server.cnf" \
      -keyout "$tls_dir/server.key" \
      -out "$tls_dir/server.csr" >/dev/null 2>&1 || ready=0
  fi

  if [ "$ready" -eq 1 ]; then
    openssl x509 \
      -req \
      -sha256 \
      -days 30 \
      -in "$tls_dir/server.csr" \
      -CA "$tls_dir/ca.crt" \
      -CAkey "$tls_dir/ca.key" \
      -CAcreateserial \
      -extfile "$runtime_dir/redis-server.cnf" \
      -extensions req_ext \
      -out "$tls_dir/server.crt" >/dev/null 2>&1 || ready=0
  fi
fi

random_hex() {
  openssl rand -hex "${1:-32}"
}

if [ "$ready" -eq 1 ] && [ "$reuse_existing" -eq 0 ]; then
  migrator_password="$(random_hex 32)"
  app_password="$(random_hex 32)"
  platform_password="$(random_hex 32)"
  test_password="$(random_hex 32)"
  redis_password="$(random_hex 32)"
  minio_user="parity-$(random_hex 6)"
  minio_password="$(random_hex 32)"
  internal_active="$(random_hex 32)"
  internal_previous="$(random_hex 32)"
  cookie_active="$(random_hex 32)"
  cookie_previous="$(random_hex 32)"
  csrf_secret="$(random_hex 32)"
  infrastructure_token="$(random_hex 32)"
  mfa_key="$(random_hex 32)"
  redis_ca_base64="$(base64 -w 0 "$tls_dir/ca.crt" 2>/dev/null)"

  if [ -z "$redis_ca_base64" ]; then
    redis_ca_base64="$(base64 "$tls_dir/ca.crt" 2>/dev/null | tr -d '\n')"
  fi

  cat > "$env_file" <<EOF_ENV
NODE_ENV=production
POSTGRES_PASSWORD=${migrator_password}
PAPADATA_APP_PASSWORD=${app_password}
PAPADATA_PLATFORM_PASSWORD=${platform_password}
PAPADATA_TEST_PASSWORD=${test_password}
REDIS_PASSWORD=${redis_password}
MINIO_ROOT_USER=${minio_user}
MINIO_ROOT_PASSWORD=${minio_password}

DATABASE_URL=postgresql://papadata_app:${app_password}@postgres-production:5432/papadata
SCHEDULER_DATABASE_URL=postgresql://papadata_platform:${platform_password}@postgres-production:5432/papadata
REDIS_URL=rediss://default:${redis_password}@redis-production:6379
REDIS_CA_BASE64=${redis_ca_base64}

PAPADATA_STORAGE_DRIVER=minio
PAPADATA_STORAGE_BUCKET=papadata-artifacts
PAPADATA_STORAGE_ENDPOINT=http://minio:9000
PAPADATA_STORAGE_ACCESS_KEY=${minio_user}
PAPADATA_STORAGE_SECRET_KEY=${minio_password}

PAPADATA_API_AUTH_ACTIVE_SECRET=${internal_active}
PAPADATA_API_AUTH_PREVIOUS_SECRET=${internal_previous}
PAPADATA_API_AUTH_ISSUER=papadata-bff
PAPADATA_API_AUTH_AUDIENCE=papadata-api
PAPADATA_API_AUTH_SESSION_STORE=redis-auth-state
PAPADATA_API_AUTH_SESSION_REDIS_PREFIX=papadata:auth
PAPADATA_INFRASTRUCTURE_AUTH_TOKEN=${infrastructure_token}
MFA_ENCRYPTION_KEY=${mfa_key}

BFF_PORT=3001
API_ORIGIN=http://api-production:4000
BFF_ALLOWED_ORIGINS=https://localhost.example
BFF_PUBLIC_HOSTS=localhost.example
BFF_COOKIE_SECRET=${cookie_active}
BFF_COOKIE_PREVIOUS_SECRET=${cookie_previous}
BFF_CSRF_SECRET=${csrf_secret}
BFF_INTERNAL_AUTH_ACTIVE_SECRET=${internal_active}
BFF_INTERNAL_AUTH_PREVIOUS_SECRET=${internal_previous}
BFF_INTERNAL_AUTH_ISSUER=papadata-bff
BFF_INTERNAL_AUTH_AUDIENCE=papadata-api
BFF_SESSION_STORE=redis-auth-state
BFF_SESSION_REDIS_PREFIX=papadata:auth
BFF_RATE_LIMIT_MAX=300
BFF_RATE_LIMIT_WINDOW_MS=60000

OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
EOF_ENV

  chmod 600 "$env_file" "$tls_dir/ca.key" "$tls_dir/server.key"
  chmod 644 "$tls_dir/ca.crt" "$tls_dir/server.crt"

  echo "Production-parity environment prepared."
  echo "Environment file: $env_file"
  echo "Redis TLS assets: $tls_dir"
  echo "Run: pnpm start:production-parity"
elif [ "$ready" -eq 1 ] && [ "$reuse_existing" -eq 1 ]; then
  echo "Reusing the existing production-parity environment and valid TLS certificate."
  echo "Set PAPADATA_REGENERATE_PARITY=1 after removing persistent parity volumes to rotate it."
else
  echo "Production-parity preparation failed. No stack was started."
  false
fi
