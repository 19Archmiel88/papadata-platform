# Raport implementacyjny Fali 4

## Stan wejściowy

Przed zmianą repo było czyste względem `origin/main`.

Kontrole wejściowe:

- `pnpm verify` — PASS;
- `pnpm build` — PASS;
- `pnpm build:storybook` — PASS.

Fala 3 była zweryfikowana w kodzie:

- source records;
- normalized records;
- canonical orders;
- orders dataset;
- tenant/workspace;
- lineage;
- readiness;
- quality assessment;
- source authority;
- dedupe;
- reprocessing;
- reconciliation;
- cross-tenant i cross-workspace tests.

## Zmienione obszary

- `apps/web/src/features/analytics`;
- `apps/web/src/stories/analytics/wave4-analytics.stories.tsx`;
- `apps/web/.storybook/preview.tsx`;
- `docs/architecture`;
- `docs/runbooks`;
- `docs/evidence/wave-4`;
- `docs/spec`.

## Migracje

Brak migracji fizycznej bazy danych. Repo local/CI nadal pracuje na
wersjonowanych kontraktach Zod i lokalnych runtime.

## Kontrakty

Dodano:

- `MetricDefinition`;
- `MetricCalculation`;
- `MetricSnapshot`;
- analytics readiness;
- analytics reconciliation;
- projections;
- Trust Drawer;
- drill-down;
- Alert;
- Task;
- ChangeSinceLastVisit;
- MetricExport;
- cache key;
- monitoring;
- permissions.

## Endpointy

Kontrakt route map obejmuje:

- `GET /v1/metric-definitions`;
- `GET /v1/metric-definitions/{metricCode}`;
- `GET /v1/metric-definitions/{metricCode}/versions`;
- `POST /v1/metric-calculations`;
- `GET /v1/metric-calculations/{calculationId}`;
- `GET /v1/metric-snapshots`;
- `GET /v1/metric-snapshots/{snapshotId}`;
- `GET /v1/metric-snapshots/{snapshotId}/evidence`;
- `GET /v1/metric-snapshots/{snapshotId}/lineage`;
- `GET /v1/metric-snapshots/{snapshotId}/reconciliation`;
- `GET /v1/analytics/command-center`;
- `GET /v1/analytics/orders`;
- `GET /v1/analytics/products`;
- `GET /v1/analytics/customers`;
- `GET /v1/analytics/traffic`;
- `GET /v1/analytics/paid-campaigns`;
- `GET /v1/analytics/d2c`;
- `GET /v1/analytics/marketplace`;
- `GET /v1/analytics/marketing-attribution`;
- `GET /v1/analytics/profitability`;
- `GET /v1/metrics/{metricCode}/trend`;
- `GET /v1/metrics/{metricCode}/drivers`;
- `GET /v1/metrics/{metricCode}/comparison`;
- `GET /v1/metrics/{metricCode}/history`;
- `GET /v1/tasks`;
- `GET /v1/alerts`;
- `GET /v1/changes-since-last-visit`;
- `POST /v1/metric-exports`;
- `GET /v1/metric-exports/{exportId}`.

## Moduły i ekrany

Działające:

- Customer Workspace shell;
- Command Center;
- Orders;
- D2C;
- Data Trust;
- KPI detail;
- Trust Drawer;
- drill-down;
- Alerts;
- Tasks;
- controlled metric export.

Jawnie gated lub blocked:

- Products;
- Customers;
- Traffic;
- Paid Campaigns;
- Marketplace;
- Marketing Attribution;
- Profitability.

## KPI

Aktywne:

- Order Count;
- Gross Revenue;
- Refund Value;
- Net Revenue.

Gated lub blocked:

- Marketplace Fees;
- Revenue After Marketplace Fees;
- Advertising Spend;
- Attributed Conversion Value;
- ROAS;
- Contribution Margin.

## Storybook

Story:

- `PapaData/04 Ekrany docelowe/Analytics Platform i Customer Workspace`.

Pokryte stany:

- default;
- loading;
- empty confirmed;
- missing data;
- partial;
- stale;
- invalid;
- blocked;
- processing;
- recalculation;
- permission denied;
- entitlement required;
- recoverable error;
- critical issue;
- historical snapshot;
- long content;
- desktop;
- tablet;
- mobile;
- keyboard navigation;
- reduced motion;
- light;
- dark;
- high contrast;
- moduły implemented i gated.

## Testy

Dodano:

- contract tests;
- integration tests;
- security tests;
- fixture validation tests;
- Storybook interaction tests.

Zweryfikowane:

- formuły KPI;
- missing versus zero;
- readiness;
- snapshot versioning;
- drivers;
- comparison;
- reconciliation;
- cache key;
- alert generation;
- canonical data -> KPI;
- KPI -> snapshot;
- snapshot -> projection;
- projection -> cache;
- KPI -> Trust Drawer;
- KPI -> drill-down;
- snapshot -> export;
- capability bypass;
- entitlement bypass;
- cross-tenant;
- cross-workspace;
- obcy snapshot;
- obcy evidence;
- obcy export;
- stale response after workspace switch.

## Wydajność

Local/CI egzekwuje koszt zapytania, limit list i stabilne sortowanie. Cache key
obejmuje tenant, workspace, okres, readiness, wersję definicji i policy
version.

## Telemetry

Dodano katalog telemetry eventów:

- `command_center.viewed`;
- `analytics_module.viewed`;
- `kpi.viewed`;
- `kpi.trust_opened`;
- `kpi.drilldown_opened`;
- `metric.export_requested`;
- `workspace.switched`;
- alert/task events.

## Ograniczenia i blockery

- Brak deklarowanej zależności `recharts` w `@papadata/web`; Fala 4 nie dodaje
  nowej zależności produkcyjnej bez zgody.
- Products nie mają canonical product dataset.
- Customers nie mają zatwierdzonej definicji LTV/retencji.
- GA4, Google Ads, Meta Ads, BaseLinker i Allegro nie mają aktywnego adaptera
  runtime local/CI.
- Marketplace Fees i rentowność wymagają fees dataset oraz kosztu produktu.
- Pełny billing, usage, Support Center i kanały powiadomień pozostają w Fali 6.
- AI Gateway i Papa Asystent pozostają w Fali 5.

## Coverage matrix

| Obszar | Status | Dowód |
| --- | --- | --- |
| Command Center | VERIFIED | Storybook i Query Service. |
| Orders | VERIFIED | Canonical orders, table, drill-down. |
| Products | GATED | Brak canonical product dataset. |
| Customers | GATED | Brak zatwierdzonych KPI LTV/retencji. |
| Traffic | GATED | GA4 bez aktywnego adaptera. |
| Paid Campaigns | GATED | Google Ads/Meta Ads bez aktywnego adaptera. |
| D2C | VERIFIED | WooCommerce orders i KPI sprzedażowe. |
| Marketplace | GATED | Brak BaseLinker/Allegro runtime i fees. |
| Marketing Attribution | GATED | Brak modelu atrybucji i danych paid. |
| Costs and Profitability | BLOCKED | Brak kosztu produktu. |
| KPI Library | VERIFIED | MetricDefinition contract. |
| Data Trust | VERIFIED | Trust Drawer, lineage, reconciliation. |
| Integrations | VERIFIED | Provider impact z Fali 2. |
| Alerts | VERIFIED | Alerty produktowe analytics. |
| Tasks | VERIFIED | Tasks for me. |
| Settings dependencies | VERIFIED | Tenant/workspace/currency/timezone/scope. |

WAVE 4: PASSED
MVP ANALYTICS COVERAGE: INCOMPLETE
