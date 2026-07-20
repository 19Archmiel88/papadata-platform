# Dane, jakość i KPI

## Warstwy danych

- source,
- normalized,
- canonical,
- ready dataset,
- ready KPI,
- evidence.

## Wymagane stany

- no_data,
- partial,
- delayed,
- stale,
- invalid,
- conflicting,
- processing,
- ready,
- resync_required,
- manual_review_required.

## Kontrakt KPI

Każdy KPI musi zawierać:

- identyfikator,
- nazwę,
- definicję,
- wersję definicji,
- wartość,
- jednostkę,
- walutę,
- zakres czasu,
- źródła,
- readiness,
- limitations,
- generatedAt,
- lineage,
- evidence.

## Zasady

- Brak danych nie może być prezentowany jako zero.
- Jeden fakt biznesowy może zasilić KPI tylko raz.
- Source data nie są canonical data.
- Canonical data nie oznaczają automatycznie ready dataset.
- Ready dataset nie oznacza automatycznie ready KPI.
- Readiness jest lokalne dla zakresu, okresu, waluty i workspace.
- KPI nie może być `ready`, jeżeli wymagane dane nie przeszły readiness.
- Zmiana definicji KPI wymaga wersjonowania `MetricDefinition`.
- `MetricSnapshot` zawiera readiness, lineage i evidence.

## Kanoniczny katalog metryk L2

Backend L2 używa katalogu `2026-05-analytics-v1` z `packages/contracts` oraz
opisu w `docs/architecture/canonical-metric-catalog.md`.

Katalog zawiera:

- 55 metryk objętych audytem;
- 3 dodatkowe metryki GA4 oznaczone jako `supplemental`;
- 58 metryk łącznie.

Dashboard, Business Summary i Centrum Dowodzenia nie mogą wprowadzać
alternatywnych wzorów dla tych samych kluczy. Rozbieżności `net_revenue`,
`cac`, `aov`, `conversion_rate`, `roas`/`mer`,
`orders_per_customer`/`purchase_frequency` oraz
`discounts`/`discount_value_total` muszą zostać usunięte lub jawnie powiązane
przed uznaniem Metric Engine i Dashboard API za gotowe.

## Implementacja Fali 3

Implementacja local/CI znajduje się w `apps/web/src/features/data-quality`.

Zakres:

- source -> raw normalized -> exact matching -> source authority ->
  canonicalization -> lineage;
- quality assessment i readiness datasetu `orders`;
- DataIssue, manual review, reprocessing, impact report i reconciliation;
- minimalne `MetricDefinition` dla `order_count`, `gross_revenue` i
  `revenue_after_fees`.

Fuzzy matching pozostaje wyłączony jako `fuzzy.disabled.2026-07`.

## Implementacja Fali 4

Implementacja local/CI znajduje się w `apps/web/src/features/analytics`.

Zakres:

- wersjonowane `MetricDefinition`;
- deterministyczny Metric Engine;
- niezmienny `MetricSnapshot`;
- KPI readiness `READY`, `PARTIAL`, `EMPTY`, `STALE`, `INVALID`, `BLOCKED`,
  `PROCESSING`, `RECALCULATION_REQUIRED`;
- reconciliation source -> normalized -> canonical -> qualifying ->
  snapshot;
- Query Service z capability, entitlement, tenant i workspace validation;
- cache key z tenantem, workspace, okresem, readiness i wersją definicji;
- Command Center projections;
- Trust Drawer;
- drill-down;
- alerty, zadania i controlled export.

Aktywne KPI local/CI:

- `Order Count`;
- `Gross Revenue`;
- `Refund Value`;
- `Net Revenue`.

KPI gated albo blocked:

- `Marketplace Fees`;
- `Revenue After Marketplace Fees`;
- `Advertising Spend`;
- `Attributed Conversion Value`;
- `ROAS`;
- `Contribution Margin`.

`Contribution Margin` pozostaje blocked bez potwierdzonego kosztu produktu i
innych wymaganych kosztów zmiennych.

## Implementacja Fali 5

AI korzysta tylko z `MetricSnapshot` dostępnych przez Metrics & Query Service.
Runtime Fali 5 nie zastępuje snapshotów fixture'em.

Do AI mogą trafić:

- `READY` MetricSnapshot;
- `PARTIAL` MetricSnapshot z limitations;
- zatwierdzone definicje KPI;
- evidence;
- lineage i reconciliation przez Trust Drawer;
- agregaty.

AI odmawia lub blokuje:

- brak danych;
- `INVALID` KPI;
- `BLOCKED` KPI;
- dane spoza tenant/workspace;
- dane bez evidence;
- dane poza dozwolonym data scope;
- próby ujawnienia sekretów;
- prompt injection.
