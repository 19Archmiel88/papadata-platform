# Backend production acceptance smoke test

Test uruchamia się po deployu z sieci posiadającej dostęp do prywatnego API. Nie zastępuje testów domenowych ani testów izolacji tenantów.

```bash
BFF_BASE_URL="https://app.example.com" \
API_BASE_URL="https://private-api-url" \
API_IDENTITY_TOKEN="$(gcloud auth print-identity-token --audiences=https://private-api-url)" \
API_INFRA_TOKEN="..." \
node tests/backend-production-parity/smoke.mjs \
  > artifacts/backend-evidence/production-smoke.json
```

Minimalny wariant publiczny wymaga tylko `BFF_BASE_URL`, ale nie dowodzi bezpośredniego IAM API ani `/metrics`.
