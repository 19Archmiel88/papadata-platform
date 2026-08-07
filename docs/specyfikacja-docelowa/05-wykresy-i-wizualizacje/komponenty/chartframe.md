---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: ChartFrame
---
# ChartFrame

## Cel i odpowiedzialność
`ChartFrame` jest runtime kontenerem pojedynczej wizualizacji analitycznej. Odpowiada za kontekst, status, metadane, kompozycję istniejących kontrolek, miejsce na gotową wizualizację, legendę, wniosek i alternatywną tabelę. Nie implementuje konkretnego typu wykresu.

## Runtime source of truth
Publiczne React API działającego komponentu jest własnością `apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx`. Storybookowym ownerem jest `15.01`.

`contracts/components/chartframe.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla screen view modelu i zdarzeń; nie jest kopią React Props.

## Publiczne grupy Props
- `title`, `businessQuestion`, `description`;
- `status`, `statusLabel`, `stateMessage`, `stateAction`;
- `sourceLabel`, `freshnessLabel`, `rangeLabel`;
- `filters`, `actions`, `visualization`, `visualizationLabel`;
- `legend`, `annotation`, `summary`;
- `alternativeTable`, `alternativeTableLabel`;
- `papaAction`.

## Stany i warianty
Na etapie 15.01 runtime obsługuje pełny typ `AnalyticsDataState`, a story demonstruje reprezentatywnie `ready`, `partial`, `processing` i `noData`. Pełny katalog zachowań stanu jest własnością 15.08.

## Ownership i handoff
05.03 nie renderuje drugiego pełnego ChartFrame. Po promocji zachowuje wyłącznie decyzję i wskazanie ownera `15.01`.

## Dostępność techniczna
Semantyczny region, jawny status, działające akcje, istniejące kontrolki klawiaturowe i alternatywna reprezentacja danych. Formalne WCAG AA nie jest bramą biznesową tego etapu.

## Konsumenci
- `30.02` — Kolejka uwagi
- `30.03` — KPI
- `30.04` — Plan vs wynik
- `30.11` — Rekomendacje AI — skrót
- `30.13` — Waterfall
- `30.14` — Warianty Centrum Dowodzenia
- `31.01` — Przegląd
- `31.02` — Lista kampanii
- `31.03` — Szczegóły kampanii
- `31.05` — Budżet
- `31.07` — Rekomendacje — kontekst domenowy
- `32.01` — Przegląd
- `33.01` — Przegląd
- `33.06` — Wydajność
- `33.07` — Kolejka braków
- `33.08` — Analiza wpływu
- `34.01` — Przegląd
- `34.02` — Segmenty
- `34.07` — Analiza wpływu
- `35.01` — Przegląd ruchu
- `35.05` — Definicje lejka
- `40.01` — Katalog integracji
- `40.08` — Odłączenie
- `41.07` — Przegląd ręczny
- `50.01` — Panel kontekstowy Papa
- `50.03` — Tryby pracy
- `50.04` — Context basket
- `50.09` — Obserwacje
- `50.10` — Rekomendacje i warianty
- `50.14` — Zablokowane działania AI
- `70.01` — Subskrypcja
- `70.02` — Użycie i limity
- `70.03` — Plany
- `70.08` — Zmiana i anulowanie
- `70.09` — Pilot do abonamentu
- `80.02` — Obserwacje
- `80.03` — Rekomendacje
- `80.07` — Pomiar

## Storybook i testy
Story 15.01 jest zaimplementowanym ownerem ChartFrame w statusie `review`. Pokazuje kompozycję z filtrem i bez filtra, reprezentatywne stany, długi copy, alternatywną tabelę oraz działające akcje. Pełny katalog zachowania stanów należy do 15.08.

05.03 nie renderuje pełnego ChartFrame; zachowuje wyłącznie decision record i handoff do 15.01.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
