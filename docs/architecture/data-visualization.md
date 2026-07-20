# Data Visualization

Wizualizacje Fali 4 są dostępne i powiązane z evidence.

Aktualny repo nie deklaruje `recharts` w `apps/web/package.json`. Ponieważ
dodanie produkcyjnej zależności wymaga jawnej zgody, Fala 4 implementuje
wizualizacje jako dostępne komponenty HTML/CSS z tabelaryczną alternatywą.

Każda wizualizacja zawiera:

- okres;
- źródło;
- walutę;
- timezone;
- readiness;
- freshness;
- wersję definicji;
- ograniczenia;
- evidence reference;
- tabelę alternatywną.

W local/CI pokryte są:

- trend KPI;
- tabela kanałów i zamówień;
- matrix data trust;
- lineage summary;
- timeline zmian;
- impact/reconciliation table.
