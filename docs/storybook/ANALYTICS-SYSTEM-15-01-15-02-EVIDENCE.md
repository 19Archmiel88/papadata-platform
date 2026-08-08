# Analytics System — 15.01 ChartFrame + 15.02 MetricCard + 15.03 TrendChart + 15.04 ComparisonChart

## Status

`A15.3 — REVIEW / 15.03 ACCEPTED / 15.04 REVIEW`

Zakres wdraża czterech pierwszych właścicieli runtime sekcji `15 — Wykresy i dane`.

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
- ComparisonChart został promowany do 15.04 i usunięty z lokalnego katalogu 05.03; pozostałe rodziny pozostają decision recordem do czasu promocji do 15.05–15.07;
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


## 15.04 — ComparisonChart

Runtime source of truth:

`apps/web/src/design-system/components/ComparisonChart/ComparisonChart.tsx`

ComparisonChart jest właścicielem dyskretnego porównywania kategorii:
`bar`, `grouped bar`, `ranking`, `benchmark` i `period comparison`.

Silnikiem geometrii i skal pozostaje `Recharts`. PapaData posiada publiczne
React API, skalę słupkową opartą o zero, semantykę serii, kodowanie okresu
porównawczego, benchmark, legendę, responsywność i accessibility contract.

ComparisonChart nie przejmuje:

- ciągłego czasu z `15.03 / TrendChart`;
- KPI i benchmarku pojedynczej metryki z `15.02 / MetricCard`;
- dokładnych rekordów, sortowania i działań z `10.07 / DataTable`;
- tooltipów, selection, zoomu, drill-down i cross-filteringu z `15.09`;
- pełnej macierzy stanów danych z `15.08`.

Status 15.04 pozostaje `review` do odbioru wizualnego light/dark dla
1440 / 768 / 390, 200% zoom, long copy i wartości ujemnych.
