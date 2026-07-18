# Dane, jakość i KPI

## Warstwy danych

- source,
- normalized,
- canonical,
- analytical projections,
- KPI snapshots,
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
- KPI nie może być `ready`, jeżeli wymagane dane nie przeszły readiness.
- Zmiana definicji KPI wymaga wersjonowania.
