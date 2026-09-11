---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: ComparisonChart
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# ComparisonChart

## Cel i odpowiedzialność
`ComparisonChart` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
baseline; comparison; comparisonLabel; deltaMode.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/comparisonchart.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `baseline` | `ChartSeries` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `comparison` | `ChartSeries` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `comparisonLabel` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `deltaMode` | `'absolute' | 'percent'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `30.04` — Plan vs wynik
- `30.05` — Drivery wyniku
- `30.06` — Źródła sprzedaży
- `30.07` — Ruch
- `30.09` — Klienci
- `31.03` — Szczegóły kampanii
- `31.04` — Atrybucja i sprzedaż
- `32.01` — Przegląd
- `33.02` — Katalog
- `33.03` — Szczegóły
- `33.06` — Wydajność
- `34.02` — Segmenty
- `34.07` — Analiza wpływu
- `35.02` — Kanały
- `35.04` — Lejek — szczegóły kroku
- `35.08` — Strony wejścia
- `41.05` — Nadrzędność źródła
- `50.06` — Dowody
- `50.08` — Laboratorium AI

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
