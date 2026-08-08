# Analytics System — 15.01 ChartFrame + 15.02 MetricCard + 15.03 TrendChart + 15.04 ComparisonChart + 15.05 ShareChart + 15.06 CorrelationChart

## Status

`A15.5 — REVIEW / 15.03 ACCEPTED / 15.04 REVIEW / 15.05 REVIEW / 15.06 REVIEW`

Zakres wdraża sześciu pierwszych właścicieli runtime sekcji `15 — Wykresy i dane`.

`15.03 TrendChart` jest formalnie zaakceptowany po pełnej walidacji technicznej i odbiorze wizualnym w light/dark dla 1440, 768 i 390 px.

Status całego A15.5 pozostaje `review`, ponieważ 15.01, 15.02 oraz nowe wpisy 15.04–15.06 wymagają formalnego odbioru przed `accepted`.

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
- ComparisonChart został promowany do 15.04 i usunięty z lokalnego katalogu 05.03;
- ShareChart został promowany do 15.05 i usunięty z lokalnego katalogu 05.03;
- CorrelationChart został promowany do 15.06, a lokalna geometria korelacji w 05.03 została zdegradowana do handoffu;
- pozostałe rodziny pozostają decision recordem do czasu promocji do kolejnych ownerów;
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


## 15.05 — ShareChart

Runtime source of truth:

`apps/web/src/design-system/components/ShareChart/ShareChart.tsx`

ShareChart jest właścicielem wizualizacji część–całość:
`donut`, `bar`, `stacked`, `part-to-whole` i `share breakdown`.

Silnikiem geometrii i skal pozostaje `Recharts`. PapaData posiada publiczne
React API, semantykę segmentów, total, procent udziału, legendę, metadane,
responsywność i accessibility contract.

ShareChart nie przejmuje:

- porównania kategorii, rankingów, benchmarków i period comparison z `15.04 / ComparisonChart`;
- ciągłego czasu z `15.03 / TrendChart`;
- dokładnych rekordów, sortowania i działań z `10.07 / DataTable`;
- tooltipów, selection, zoomu, drill-down i cross-filteringu z `15.09`;
- pełnej macierzy stanów danych z `15.08`.

Status 15.05 pozostaje `review` do odbioru wizualnego light/dark dla
1440 / 768 / 390, 200% zoom, long copy i przypadków brzegowych udziałów.

### Korekty wizualne 15.05 przed commitem

Po odbiorze screenshotów 1440 / 768 / 390 doprecyzowano:
- single segment stacked bar nie może wyglądać jak primary button;
- mobile bar z długą etykietą układa label nad paskiem;
- donut grupuje wartości poniżej 3% jako `Pozostałe`;
- lokalna paleta ShareChart wyrównuje luminancję segmentów w dark mode.

Interaktywne rozwijanie `Pozostałe` pozostaje poza 15.05 i należy do 15.09.

### Druga korekta wizualna 15.05

Po dodatkowym przeglądzie skrajnych szerokości i motywów doprecyzowano:
- ciemna oś procentowa ma wyższy kontrast;
- legenda mobile używa zwartego układu dwukolumnowego;
- share bar na mobile chroni minimalną szerokość paska;
- stacked 100% ma tor tła i nie przypomina primary button;
- story pokazuje segment poniżej 3% zgrupowany jako `Pozostałe`.

### Trzecia korekta wizualna 15.05

Po przeglądzie mobile / panel boczny doprecyzowano:
- share bars na mobile układają label nad paskiem;
- każdy pasek startuje z tej samej osi 0%;
- mobile metadata nie tworzy gęstej drabinki dividerów;
- swatche mają większy rozmiar i obrys dla dark mode;
- stacked 100% ma widoczny track dzięki paddingowi i subtelnemu tłu.


## 15.06 — CorrelationChart

Runtime source of truth:

`apps/web/src/design-system/components/CorrelationChart/CorrelationChart.tsx`

CorrelationChart jest właścicielem wizualizacji zależności dwóch miar:
`scatter plot`, `relationship chart`, `driver analysis`, statycznego
`outlier/cluster indication` oraz tekstu siły korelacji.

Silnikiem geometrii i skal pozostaje `Recharts`. PapaData posiada publiczne
React API, semantykę `correlation`, `relationship`, `driver hypothesis`,
`outlier`, `cluster`, legendę, responsywność i accessibility contract.

CorrelationChart nie przejmuje:

- ciągłego czasu z `15.03 / TrendChart`;
- porównań kategorii, rankingów, benchmarków i period comparison z `15.04 / ComparisonChart`;
- struktury udziałów z `15.05 / ShareChart`;
- forecast/confidence z `15.07`;
- pełnej macierzy stanów danych z `15.08`;
- tooltipów, hover, selection, drill-down i cross-filteringu z `15.09`;
- dokładnych rekordów, sortowania i działań z `10.07 / DataTable`.

Obowiązująca reguła semantyczna: korelacja, zależność i `driver hypothesis`
nie są dowodem przyczynowości. Komponent pokazuje komunikat no-causality,
chyba że caller przekaże osobny, zwalidowany dowód.

Status 15.06 pozostaje `review` do odbioru wizualnego light/dark dla
1440 / 768 / 390, 200% zoom, long copy oraz wariantów scatter,
relationship, driver analysis i statycznego outlier/cluster indication.

### Korekta wizualna 15.06

Po odbiorze wykresów punktowych doprecyzowano:
- etykiety w klastrze są redukowane, żeby nie tworzyć kolizji;
- stałe etykiety zostają dla outlierów, driver hypothesis i pierwszego punktu klastra;
- dark mode ma mocniejszy kontrast osi, siatki i linii odniesienia;
- mobile ogranicza gęstość etykiet i wzmacnia czytelność wykresu;
- touch target, hover, tooltip, pan, zoom, selection, drill-down i cross-filtering pozostają poza 15.06 i należą do 15.09.

### Usunięcie cieni kolorów 15.06

Po odbiorze wizualnym usunięto halo, glow i cienie wokół kolorowych markerów oraz swatchy. Kolor pozostaje nośnikiem kategorii, ale nie dostaje dekoracyjnego podbicia.

### Źródłowe usunięcie cieni kolorów 15.06

Po dodatkowym odbiorze usunięto źródłowy dekoracyjny `box-shadow` z kolorowych markerów i swatchy. CorrelationChart 15.06 nie używa halo, glow ani cieni wokół koloru jako wzmocnienia semantycznego.

### Shape encoding 15.06

Po odbiorze dostępnościowym CorrelationChart 15.06 nie rozróżnia już ról punktów wyłącznie kolorem:
- standard używa koła;
- cluster używa kwadratu;
- driver hypothesis używa trójkąta;
- outlier używa rombu;
- ciasne kontenery ograniczają stałe etykiety;
- wykresy z klastrem redukują pionową siatkę, żeby cluster box, punkty i trendline pozostały czytelne.
