# Analytics System — 15.01 ChartFrame + 15.02 MetricCard + 15.03 TrendChart

## Status

`A15.2 — REVIEW / 15.03 ACCEPTED`

Zakres wdraża trzech pierwszych właścicieli runtime sekcji `15 — Wykresy i dane`.

`15.03 TrendChart` jest formalnie zaakceptowany po pełnej walidacji technicznej i odbiorze wizualnym w light/dark dla 1440, 768 i 390 px.

Status całego A15.2 pozostaje `review`, ponieważ wpisy governance 15.01 i 15.02 nie są zmieniane w ramach formalnego zamknięcia 15.03.

## 15.01 — ChartFrame

Runtime source of truth:

`apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx`

ChartFrame jest kontenerem kompozycyjnym. Nie implementuje silnika wykresu, własnego Selecta, Buttona ani DataTable. Caller przekazuje wizualizację, filtry, akcje i alternatywną tabelę.

## 15.02 — MetricCard

Runtime source of truth:

`apps/web/src/design-system/components/MetricCard/MetricCard.tsx`

MetricCard jest właścicielem KPI, porównania, celu/odchylenia, statusu danych i prywatnego mikrowykresu. Mikrowykres nie jest osobnym publicznym komponentem.

## 15.03 — TrendChart

Runtime source of truth:

`apps/web/src/design-system/components/TrendChart/TrendChart.tsx`

TrendChart jest właścicielem temporalnej rodziny wykresów: `line`, `area`, `actual`, `plan`, `previous period` i `moving average`.

Silnikiem geometrii i skal jest `Recharts`. PapaData pozostaje właścicielem publicznego React API, semantyki serii, foundation tokens, kodowania linii, legendy, responsywności i accessibility contract.

TrendChart nie przejmuje:

- nagłówka, statusu, źródła, świeżości ani akcji z ChartFrame;
- KPI i prywatnego mikrotrendu MetricCard;
- forecast/confidence z 15.07;
- tooltipów, zoomu, selection, drill-down i cross-filtering z 15.09;
- pełnej macierzy stanów danych z 15.08.

## Handoff z 05.03

- lokalny ChartFrame z Laboratorium został usunięty wcześniej;
- lokalny `KpiSparkline` został usunięty wcześniej;
- lokalny `DataSurfaceSelect` i drugi silnik tabeli zostały usunięte wcześniej;
- lokalna demonstracja `TrendChart` została usunięta z katalogu rodzin wykresów;
- 05.03 wskazuje `15.03 TrendChart` jako jedynego ownera trendów;
- pozostałe rodziny wykresów pozostają w Laboratorium jako decision record do czasu promocji do 15.04–15.07;
- legacy `10 Komponenty/TrendChart` nie jest drugim ownerem Storybooka.

## Bramy odbioru

- `check-analytics-system-v1.mjs` — ownership 15.01–15.03, Recharts i brak legacy TrendChart;
- `check-storybook-presentation-contract.mjs` — izolacja lokalnego CSS;
- `check-storybook-catalog.mjs` — kontrakt i wygenerowany katalog;
- `check-design-system-ownership.mjs` — jedna odpowiedzialność, jeden owner;
- `validate_all.py` — integralność repo, jeśli skrypt jest dostępny;
- web typecheck;
- production Storybook build;
- odbiór wizualny light/dark;
- 1440 / 768 / 390;
- 200% zoom;
- long copy;
- brak poziomego scrolla;
- dopiero po odbiorze wizualnym `accepted` może zostać ustawione na `true`.
