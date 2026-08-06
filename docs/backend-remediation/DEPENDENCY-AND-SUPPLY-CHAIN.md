# Zależności i supply chain

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/07-ci-supply-chain.md:L15-L35`
- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/12-dr-bcp-backup.md:L17-L24`

Kontrole:

- `pnpm audit --prod --audit-level high` blokuje znane podatności high/critical;
- Trivy skanuje repozytorium pod kątem sekretów i obrazy pod kątem OS/library CVE;
- Trivy generuje CycloneDX SBOM;
- `pnpm licenses list --prod --json` jest oceniany przez `tools/check-license-report.mjs` i `config/backend-license-policy.json`;
- GitHub Actions są przypięte do pełnych SHA;
- trzy Dockerfile używają minimalnego multi-stage runtime, non-root użytkownika i digest-pinned Node base image;
- Terraform akceptuje wyłącznie obrazy aplikacji wskazane przez digest.

Podpisywanie obrazu i attestation wymagają skonfigurowanego rejestru/OIDC. Brak podpisu w konkretnym wydaniu pozostaje blokadą produkcyjną, nawet gdy workflow repozytorium jest poprawny.
