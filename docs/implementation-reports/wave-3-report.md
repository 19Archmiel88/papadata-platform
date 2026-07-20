# Raport wdrożenia Fali 3

Data: 2026-07-20

## Zakres wykonany

Zrealizowano lokalny, testowalny vertical slice kontraktu danych:

- rozszerzenie `SourceBatch` i `SourceRecord` z Fali 2;
- `RawNormalizedRecord` dla WooCommerce orders;
- exact matching przed fuzzy matching;
- source authority;
- `CanonicalOrder`;
- lineage;
- dataset, quality assessment i readiness;
- `DataIssue`, manual review i stale version;
- reprocessing jako nowy job;
- impact report old/new;
- reconciliation;
- data inventory i deletion ledger;
- API facade Fali 3;
- frontend modułu jakości danych;
- Storybook stanów Fali 3;
- test vectors, contract, integration i cross-workspace tests.

## Dataset referencyjny

- Dataset: `orders`.
- Provider: WooCommerce.
- Źródło: source snapshot z lokalnego runtime Fali 2.
- Fakt kanoniczny: `CanonicalOrder`.

## Modele

Modele znajdują się w
`apps/web/src/features/data-quality/dataQualityContracts.ts`.

Source z Fali 2 znajduje się w
`apps/web/src/features/integrations/integrationContracts.ts`.

## Migracje

Repo nie posiada obecnie warstwy DB ani katalogu migracji. Fala 3 nie dodaje
nowej zależności produkcyjnej ani frameworka migracji bez osobnej decyzji
architektonicznej. Kontrakty są utrwalone jako TypeScript/Zod i testy
local/CI.

Status migracji fizycznych: `NOT APPLICABLE` dla aktualnego repo.

## Wersje reguł

- source schema: `woocommerce-orders.source.2026-07`;
- normalization mapping: `woocommerce-orders.mapping.2026-07`;
- status mapping: `woocommerce-status.mapping.2026-07`;
- source authority: `authority.woocommerce-orders.2026-07`;
- exact matching: `exact-match.order-number.2026-07`;
- fuzzy matching: `fuzzy.disabled.2026-07`;
- deduplication: `dedupe.exact-order-number.2026-07`;
- canonical schema: `canonical-order.v1`;
- quality rules: `quality.orders.mvp.2026-07`;
- readiness rules: `readiness.orders.mvp.2026-07`;
- reconciliation tolerance: `reconciliation.orders.0-01.2026-07`;
- reprocessing policy: `reprocess.dataset-versioned.2026-07`.

## API

Typed API facade:

- `GET /v1/datasets`;
- `GET /v1/datasets/{datasetId}`;
- `GET /v1/datasets/{datasetId}/readiness`;
- `GET /v1/datasets/{datasetId}/lineage`;
- `GET /v1/datasets/{datasetId}/reconciliation`;
- `GET /v1/datasets/{datasetId}/impact-reports`;
- `GET /v1/data-issues`;
- `POST /v1/data-issues/{issueId}/assign`;
- `POST /v1/data-issues/{issueId}/review`;
- `POST /v1/data-issues/{issueId}/resolve`;
- `GET/POST /v1/source-authority-rules`;
- `POST /v1/source-authority-rules/{ruleId}/activate`;
- `POST /v1/datasets/{datasetId}/reprocess`;
- `GET /v1/operations/{operationId}`.

Implementacja: `createDataQualityApi`.

## Frontend i Storybook

- Ekran: `DataQualityCenterScreen`.
- Stories: `PapaData/04 Ekrany docelowe/Jakość danych i integralność`.
- Liczba wariantów Fali 3: 40 plus motyw jasny.
- Interaction test: kliknięcie `Reprocess` w story gotowego datasetu.

## Testy

Uruchomione kontrole cząstkowe:

- `pnpm --filter @papadata/web typecheck` — zielone.
- `pnpm --filter @papadata/web test:auth` — zielone, 20 plików, 91 testów.
- `pnpm --filter @papadata/web test:storybook` — zielone, 52 pliki, 243 testy.

Pełna kontrola końcowa została wykonana po raporcie podczas finalnej
weryfikacji Codexa.

## Kryteria bramy

| Kryterium | Status |
| --- | --- |
| Source data mają tenant/workspace i są wersjonowane | PASSED |
| Normalizacja deterministyczna | PASSED |
| Kontrakty wersjonowane | PASSED |
| Błędne rekordy tworzą DataIssue | PASSED |
| Source authority jawna i wersjonowana | PASSED |
| Exact matching działa | PASSED |
| Fuzzy matching kontrolowanie wyłączony | PASSED |
| Overlap detection nie łączy workspace | PASSED |
| Jeden fakt tworzy jeden wkład kanoniczny | PASSED |
| Canonical fact ma lineage | PASSED |
| Dataset lokalny dla zakresu | PASSED |
| QualityAssessment i Readiness działają | PASSED |
| `NO_DATA` nie zwraca zera | PASSED |
| DataIssue lifecycle i stale review | PASSED |
| Reprocessing jako nowy idempotentny job | PASSED |
| Impact report old/new | PASSED |
| Reconciliation z tolerancją | PASSED |
| Retencja i deletion ledger | PASSED |
| Cross-workspace tests | PASSED |
| Audit events i monitoring lokalny | PASSED |
| Frontend i Storybook | PASSED |
| Fizyczne DB migrations | NOT APPLICABLE |
| Produkcyjny HTTP backend/GCP monitoring | OUTSIDE CURRENT REPO |

## Ograniczenia

Fala 3 działa w aktualnym stacku repo jako lokalny runtime, API facade i UI.
Produkcyjna baza danych, fizyczne migracje, kolejka infrastrukturalna,
zewnętrzny monitoring GCP i HTTP transport pozostają zależne od osobnej decyzji
deploymentowej.

## Do Fali 4

- pełny metric engine;
- `MetricSnapshot`;
- Command Center na gotowych KPI;
- pełne formuły KPI i wizualizacje;
- AI/evidence pack dla analiz.

## Werdykt

WAVE 3: PASSED
