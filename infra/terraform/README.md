# PapaData production infrastructure

Ten katalog definiuje utwardzony runtime `api`, `bff` i `worker` dla GCP.

## Granica bezpieczeństwa

- API ma `INGRESS_TRAFFIC_INTERNAL_ONLY` i wymaga `roles/run.invoker` dla service account BFF.
- BFF ma `INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER` i jest publikowany wyłącznie przez globalny HTTPS Load Balancer.
- Cloud Armor blokuje reguły SQLi/XSS i wymusza per-IP rate limit przed BFF.
- Redis używa AUTH oraz TLS. Certyfikat CA i URL są przekazywane przez Secret Manager.
- Każdy proces ma osobny service account i dostęp wyłącznie do wymaganych sekretów/bucketów.
- Obrazy `api_image`, `bff_image` i `worker_image` muszą być wskazane przez `@sha256:<digest>`.

## Sekrety

Terraform nie tworzy wersji sekretów aplikacyjnych. `runtime_secret_ids` wskazuje istniejące sekrety zarządzane przez oddzielny proces rotacji. Wymagane klucze:

- `database_url`
- `scheduler_database_url`
- `api_auth_active_secret`
- `api_auth_previous_secret`
- `mfa_encryption_key`
- `infrastructure_auth_token`
- `bff_cookie_secret`
- `bff_cookie_previous_secret`
- `bff_csrf_secret`

Te same sekrety `api_auth_active_secret` i `api_auth_previous_secret` są wstrzykiwane do API oraz BFF, co eliminuje ryzyko rozjazdu materiału podpisującego principal. Tylko sekrety wynikające z utworzonego przez Terraform Redis (`redis_url`, `redis_ca_base64`) są wersjonowane przez ten moduł. Stan Terraform zawiera dane wrażliwe generowane przez providera. Produkcja wymaga prywatnego GCS backendu, wersjonowania, CMEK zgodnego z polityką organizacji, ograniczonego IAM i logów dostępu. `backend.tf.example` nie jest konfiguracją produkcyjną samą w sobie.

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

Plan nie jest dowodem wdrożenia. Po deployu uruchom:

```bash
BFF_BASE_URL="https://app.example.com" \
API_INFRA_TOKEN="..." \
node tests/backend-production-parity/smoke.mjs
```

Dowody z planu, smoke testu, Cloud Armor, Secret Manager IAM, Cloud Run IAM i restore drill należy dołączyć do artefaktu wydaniowego.
