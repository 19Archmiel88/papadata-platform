# PapaData production infrastructure

Ten katalog definiuje utwardzony runtime `web`, `api`, `bff` i `worker` dla GCP.

## Architektura wydania

Load balancer (`google_compute_url_map.edge`) rozdziela ruch po ścieżce, zgodnie z `config/local-production-parity.contract.json`:

- `/api/*` → BFF (`google_compute_backend_service.bff` → serverless NEG → Cloud Run `*-bff`).
- `/*` (domyślne) → Web (`google_compute_backend_service.web` → serverless NEG → Cloud Run `*-web`, statyczny build `apps/web` serwowany przez nginx z `infra/production/web.Dockerfile`).

Oba backendy mają wspólny `google_compute_security_policy.edge` (Cloud Armor: SQLi/XSS, per-IP rate limit). Nagłówki bezpieczeństwa (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy, CSP) są ustawione jako `custom_response_headers` **wyłącznie** na backendzie Web — to GCP-owy odpowiednik bloku `location /` w `infra/production/edge/nginx.conf.template`, który jest źródłem prawdy dla lokalnego parity. Backend BFF celowo nie dostaje tych nagłówków: BFF sam je generuje przez `@fastify/helmet` i nie może dostać nałożonego drugiego, web-owego CSP.

## Granica bezpieczeństwa

- API ma `INGRESS_TRAFFIC_INTERNAL_ONLY` i wymaga `roles/run.invoker` dla service account BFF.
- BFF i Web mają `INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER` i są publikowane wyłącznie przez globalny HTTPS Load Balancer.
- Cloud Armor blokuje reguły SQLi/XSS i wymusza per-IP rate limit przed BFF i Web.
- Redis używa AUTH oraz TLS. Certyfikat CA i URL są przekazywane przez Secret Manager.
- Każdy proces ma osobny service account i dostęp wyłącznie do wymaganych sekretów/bucketów. Web nie ma dostępu do żadnego sekretu ani do VPC — serwuje wyłącznie statyczne pliki.
- Obrazy `api_image`, `bff_image`, `worker_image` i `web_image` muszą być wskazane przez `@sha256:<digest>`.

## Sekrety

Terraform nie tworzy wersji sekretów aplikacyjnych (poza `redis_url`/`redis_ca_base64`, patrz niżej). `runtime_secret_ids` wskazuje istniejące sekrety zarządzane przez oddzielny proces rotacji.

### Wymagane klucze (zawsze)

- `database_url`
- `scheduler_database_url`
- `api_auth_active_secret`
- `api_auth_previous_secret`
- `mfa_encryption_key`
- `infrastructure_auth_token`
- `bff_cookie_secret`
- `bff_cookie_previous_secret`
- `bff_csrf_secret`
- `bff_refresh_cookie_secret`
- `bff_refresh_cookie_previous_secret`

Te same sekrety `api_auth_active_secret` i `api_auth_previous_secret` są wstrzykiwane do API oraz BFF, co eliminuje ryzyko rozjazdu materiału podpisującego principal. Tylko sekrety wynikające z utworzonego przez Terraform Redis (`redis_url`, `redis_ca_base64`) są wersjonowane przez ten moduł. Stan Terraform zawiera dane wrażliwe generowane przez providera. Produkcja wymaga prywatnego GCS backendu, wersjonowania, CMEK zgodnego z polityką organizacji, ograniczonego IAM i logów dostępu. `backend.tf.example` nie jest konfiguracją produkcyjną samą w sobie.

### Opcjonalne klucze integracji (tylko jeśli funkcja jest włączona)

Każda z tych integracji jest domyślnie wyłączona — Terraform nigdy nie włącza jej samodzielnie, tylko wstrzykuje wartości do API, gdy operator je poda. `terraform plan` odmówi planu (precondition na `terraform_data.validate_external_secrets`), jeśli funkcja jest włączona przez zmienną, a odpowiadający jej sekret nie znajduje się w `runtime_secret_ids`:

| Klucz w `runtime_secret_ids` | Wymagany gdy | Wstrzykiwany jako |
|---|---|---|
| `stripe_secret_key` | `billing_mode` != "" | `STRIPE_SECRET_KEY` (API) |
| `stripe_webhook_secret` | `billing_mode` != "" | `STRIPE_WEBHOOK_SECRET` (API) |
| `google_oauth_client_secret` | `google_oauth_client_id` != "" | `GOOGLE_OAUTH_CLIENT_SECRET` (API) |
| `microsoft_oauth_client_secret` | `microsoft_oauth_client_id` != "" | `MICROSOFT_OAUTH_CLIENT_SECRET` (API) |
| `gus_bir_api_key` | `gus_bir_mode` == "production" | `GUS_BIR_API_KEY` (API) |
| `papa_remote_api_key` | `papa_remote_enabled` == true | `PAPADATA_PAPA_REMOTE_API_KEY` (API) |
| `ksef_certificate_ref` | nigdy wymagany (adapter KSeF degraduje się bez zgłaszania błędu — produkcyjna ścieżka nie jest jeszcze zaimplementowana, patrz `packages/integrations/src/ksef-adapter.ts`) | `KSEF_CERTIFICATE_REF` (API), jeśli podany |

Pozostała, jawna konfiguracja tych integracji (non-secret: tryby, URL-e, feature flagi, limity budżetu AI, flagi metod płatności) jest przekazywana przez zmienne Terraform wymienione w `variables.tf` i zawsze wstrzykiwana do API — pusta/domyślna wartość jest przez `apps/api` traktowana identycznie jak brak zmiennej. Zobacz `config/p0-integrations.env.example` dla lokalnego odpowiednika tego samego kontraktu.

## DNS i certyfikat

Po `terraform apply` rekord A domeny `public_domain` musi wskazywać output `edge_ip`. Dopiero po aktywacji managed certificate można wykonać smoke test HTTPS.

## Wymagana sekwencja

```bash
terraform fmt -check -recursive infra/terraform
terraform -chdir=infra/terraform init -backend=false
terraform -chdir=infra/terraform validate
terraform -chdir=infra/terraform plan -out=tfplan
terraform -chdir=infra/terraform show -json tfplan > tfplan.json
```

Plan nie jest dowodem wdrożenia. Po deployu uruchom smoke test przeciwko publicznej domenie LB (sprawdza zarówno routing `/api/*` → BFF, jak i `/*` → Web wraz z nagłówkami bezpieczeństwa):

```bash
PAPADATA_PUBLIC_BASE_URL="https://app.example.com" \
node tests/backend-production-parity/smoke.mjs
```

Dowody z planu, smoke testu, Cloud Armor, Secret Manager IAM, Cloud Run IAM i restore drill należy dołączyć do artefaktu wydaniowego.
