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
