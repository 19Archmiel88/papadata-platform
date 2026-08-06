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

## Polityka licencji

`BlueOak-1.0.0` i `OFL-1.1` są jawnie dopuszczone w `config/backend-license-policy.json`. Pierwsza obejmuje zależności narzędziowe używane przez workspace, a druga paczki self-hostowanych fontów. Polityka pozostaje fail-closed: `unknownPolicy` ma wartość `fail`, dlatego każda kolejna nierozpoznana licencja blokuje bramkę do czasu jawnej decyzji.

## GitHub Code Scanning i SARIF

Skan Trivy pozostaje bramką niezależnie od dostępności GitHub Code Scanning: wykrycie podatności `HIGH` lub `CRITICAL` nadal kończy job błędem. SARIF jest zawsze zachowywany jako artefakt workflow. Upload do Code Scanning oraz analiza CodeQL są wykonywane dla repozytorium publicznego albo po włączeniu GitHub Code Security i ustawieniu zmiennej repozytorium `PAPADATA_CODE_SCANNING_ENABLED=true`. Brak tej usługi w repozytorium prywatnym nie może być maskowany przez `continue-on-error`.
