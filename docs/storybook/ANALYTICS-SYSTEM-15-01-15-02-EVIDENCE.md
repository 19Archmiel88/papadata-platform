# Analytics System — 15.01 ChartFrame + 15.02 MetricCard

## Status

`IMPLEMENTED — REVIEW`

Ten zakres wdraża dwóch pierwszych właścicieli runtime sekcji `15 — Wykresy i dane`. Status pozostaje `review` do czasu walidacji WSL i odbioru wizualnego w jasnym oraz ciemnym motywie.

## 15.01 — ChartFrame

Runtime source of truth:

`apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx`

ChartFrame jest kontenerem kompozycyjnym. Nie implementuje silnika wykresu, własnego Selecta, Buttona ani DataTable. Caller przekazuje wizualizację, filtry, akcje i alternatywną tabelę.

## 15.02 — MetricCard

Runtime source of truth:

`apps/web/src/design-system/components/MetricCard/MetricCard.tsx`

MetricCard jest właścicielem KPI, porównania, celu/odchylenia, statusu danych i prywatnego mikrowykresu. Mikrowykres nie jest osobnym publicznym komponentem na tym etapie.

## Handoff z 05.03

- lokalny ChartFrame z Laboratorium został usunięty;
- lokalny `KpiSparkline` został usunięty;
- lokalny `DataSurfaceSelect` i drugi silnik tabeli zostały usunięte z 05.03; bazowa tabela jest konsumowana z `10.07 DataTable`;
- statusy powierzchni w 05.03 konsumują `StatusBadge` i kanoniczne mapowanie `AnalyticsDataState → SemanticStatusTone`;
- 05.03 zachowuje wyłącznie decision record/handoff dla KPI i ChartFrame;
- ChartFrame i MetricCard konsumują ikony `data` / `assistant` z 10.11 oraz Foundation runtime formatters w story/evidence;
- pozostałe rodziny wykresów, stany i warstwy danych pozostają do promocji w 15.03–15.10 oraz 18.

## Bramy odbioru

- `check-analytics-system-v1.mjs` — ownership i brak duplikatów ChartFrame/KPI/Select/table engine;
- `check-storybook-presentation-contract.mjs` — również lokalny CSS sekcji 15, bez override `pd-f0-*`;
- `validate_all.py` — integralność repo;
- web typecheck;
- production Storybook build;
- odbiór wizualny light/dark + 1440/768/390 + long copy;
- dopiero po odbiorze wizualnym `accepted` może zostać ustawione na `true`.
