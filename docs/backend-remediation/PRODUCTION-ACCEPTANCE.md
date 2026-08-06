# Odbiór produkcyjny backendu

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/13-release-gates.md:L17-L37`
- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/14-test-plan.md:L24-L35`
- `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L13-L34`

## Bramy statyczne

```bash
pnpm install --frozen-lockfile
pnpm verify:backend
pnpm evidence:backend
terraform fmt -check -recursive infra/terraform
terraform -chdir=infra/terraform init -backend=false
terraform -chdir=infra/terraform validate
```

## Bramy wymagające środowiska

1. `pnpm prepare:production-parity`, clean install i upgrade migracji na PostgreSQL 16 przy użyciu `packages/database/scripts/migrate.sh`.
2. `pnpm test:migrations`, w tym cross-tenant read/write test oraz potwierdzenie oddzielnej roli `papadata_platform` z kontrolowanym `BYPASSRLS`.
3. Deploy API/BFF/workera z digest-pinned images.
4. Negatywny test bez `roles/run.invoker` oraz pozytywny BFF→API.
5. Cloud Armor: SQLi/XSS, 429 i logi edge.
6. Secret Manager: per-secret IAM i udokumentowana rotacja active/previous.
7. `tests/backend-production-parity/smoke.mjs` z prywatnym API.
8. Restore drill z pomiarem RPO/RTO.
9. Trivy image scan, SBOM, dependency audit i license report.
10. Dashboard/alerty dla 5xx, latency, queue lag, job failures, auth failures i readiness.

## Reguła GO

Status GO może zostać nadany wyłącznie wtedy, gdy wszystkie pozycje `implemented_requires_*`, `implemented_external_acceptance`, `procedure_requires_external_acceptance` i `implemented_requires_ci` z `config/backend-security-controls.json` mają dowód powiązany z SHA wydania. Repozytoryjny PASS nie jest dowodem wdrożenia.
