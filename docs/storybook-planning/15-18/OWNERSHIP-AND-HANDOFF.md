# Ownership i handoff

## Docelowy lancuch

`00 Fundamenty -> 10 Komponenty Bazowe -> 15 Wykresy i dane -> 18 Wzorce interfejsu -> 20 Powloka produktu -> ekrany domenowe`

Laboratorium `05` jest boczna sciezka decyzyjna, a nie kolejny poziom zaleznosci runtime.

## Promocja z 05.03

| Element z 05.03 | Docelowy owner |
| --- | --- |
| warianty KPI i mikrotrendy | 15.02 MetricCard |
| pelny ChartFrame | 15.01 ChartFrame |
| rodziny wykresow trendowych | 15.03 Trendy |
| porownania | 15.04 Porownania |
| udzial/mix | 15.05 Struktura i udzial |
| relacje/korelacje | 15.06 Zaleznosci i korelacje |
| prognoza | 15.07 Prognoza i AI |
| rendering partial/stale/no-data | 15.08 Stany danych |
| chart hover/filter/drilldown | 15.09 Interakcje i filtry wykresow |
| chart reflow | 15.10 Responsywnosc i tryby prezentacji |
| tabela + filtry + detail handoff | 18.04 Tabela z filtrami i akcjami |
| evidence/recommendation/detail composition | 18.07 Panele szczegolow, dowodow i rekomendacji |
| readiness calego widoku | 18.08 Status danych i readiness |

Po promocji 05.03 nie powinno byc utrzymywane jako drugi katalog produkcyjnych wariantow.

## Granice krytyczne

### 10.07 vs 18.04

- 10.07 jest wlascicielem `DataTable`.
- 05.03 konsumuje `DataTable` i nie utrzymuje lokalnego silnika tabeli ani `DataSurfaceSelect`.
- 18.04 jest wlascicielem workflow `FilterBar + DataTable + Pagination + actions + DetailPanel`.

### 15.08 vs 18.08

- 15.08: co robi wykres/KPI, gdy dane sa partial/stale/error.
- 18.08: co komunikuje caly widok i jakie akcje sa dostepne.

### 18.05 vs 18.06

- 18.05: confirmation ryzykownej/destrukcyjnej decyzji.
- 18.06: authorization/approval/step-up przed dopuszczeniem do decyzji.

### 18.01 vs 20.01

- 18.01: layout tresci strony wewnatrz content area.
- 20.01: AppShell, topbar, sidebar, global overlay i routing shell.

### 15.07 vs 50 Papa Asystent

- 15.07: wizualizacja forecast/confidence/scenario.
- 50: interakcja z AI, evidence, approval i dzialania AI.
