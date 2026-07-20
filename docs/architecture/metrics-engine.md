# Metrics Engine

Backendowy Metric Engine L2 musi używać katalogu `2026-05-analytics-v1` z
`packages/contracts`. Wąski runtime Fali 4 pozostaje lokalną implementacją
referencyjną i nie może być traktowany jako pełny katalog metryk.

Fala 4 dodaje lokalny silnik metryk w
`apps/web/src/features/analytics/localAnalyticsRuntime.ts`.

Wejście silnika:

- canonical orders z Fali 3;
- dataset `orders`;
- quality assessment;
- readiness assessment;
- lineage;
- reconciliation;
- aktywna wersja `MetricDefinition`.

Silnik publikuje wyłącznie `MetricSnapshot`. UI nie oblicza KPI.

Deterministyczny hash wejścia obejmuje:

- `tenantId`;
- `workspaceId`;
- okres;
- `metricCode`;
- wersję definicji;
- `datasetId`;
- canonical order IDs;
- source authority version;
- mapping version;
- status mapping version;
- deduplication version;
- FX policy version.

Kwoty są liczone jako decimal string przez bigintowe wartości groszowe w
runtime local/CI. Brak danych pozostaje brakiem danych i nie jest zastępowany
zerem.
