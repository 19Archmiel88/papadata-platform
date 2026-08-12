---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: MetricCard
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# MetricCard

## Cel i odpowiedzialność
`MetricCard` jest runtime powierzchnią KPI: wartość, jednostka, porównanie, cel/odchylenie, status danych, metadane i opcjonalny mikrotrend. Nie jest małym ChartFrame.

## Runtime source of truth
Publiczne React API działającego komponentu jest własnością `apps/web/src/design-system/components/MetricCard/MetricCard.tsx`. Storybookowym ownerem jest `15.02`.

`contracts/components/metriccard.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla view modelu i zdarzeń; nie jest kopią React Props.

## Publiczne grupy Props
- `metricId`, `label`, `value`, `unit`;
- `comparison`, `signal`;
- `targetLabel`, `deviationLabel`;
- `sparklinePoints`;
- `status`, `statusLabel`, `stateMessage`;
- `sourceLabel`, `freshnessLabel`, `definitionChangeLabel`;
- `emphasis`, `detailAction`, `papaAction`.

## Warianty
Podstawowy, z trendem, z celem, z odchyleniem, z mikrochartem oraz alarmowy/rekomendacyjny są kompozycją jednego API. Mikrotrend pozostaje prywatnym elementem MetricCard do czasu ewentualnej osobnej decyzji produktowej.

## Ownership i handoff
05.03 nie utrzymuje lokalnego katalogu KPI ani `KpiSparkline`. Po promocji ownerem jest wyłącznie `15.02`.

## Dostępność techniczna
Podstawowy gate dostępności dla tej story obejmuje tylko: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

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
Story 15.02 jest zaimplementowanym ownerem MetricCard w statusie `accepted`. Pokazuje warianty KPI, reprezentatywne stany, długi copy, mikrotrend płaski oraz działające akcje szczegółów i Papa. Pełny katalog zachowania stanów należy do 15.08.

05.03 nie renderuje lokalnych wariantów MetricCard ani `KpiSparkline`; zachowuje wyłącznie decision record i handoff do 15.02.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
