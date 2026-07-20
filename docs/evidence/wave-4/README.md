# Evidence Fali 4

Zakres evidence:

- `pipeline.md` — przepływ canonical data do Customer Workspace;
- `test-vectors.md` — oczekiwane wyniki KPI;
- `monitoring.md` — telemetry i metryki runtime;
- `sample-objects.json` — przykładowe obiekty kontraktu.

Brama Fali 4 local/CI:

- `Order Count` działa jako `READY`;
- ten sam KPI działa jako `PARTIAL`;
- ten sam KPI działa jako `INVALID`;
- istnieją `MetricDefinition`, `MetricSnapshot` i projections;
- działa Command Center;
- działa Trust Drawer i drill-down;
- działają testy izolacji tenant/workspace.

Wizualizacje są dostępne przez komponenty HTML/CSS z tabelaryczną
alternatywą. `recharts` nie jest zadeklarowany jako zależność aplikacji web,
więc nie został dodany bez jawnej zgody na nową zależność produkcyjną.
