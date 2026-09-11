---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: DateRangePicker
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# DateRangePicker

## Cel i odpowiedzialność
`DateRangePicker` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
from; to; preset; minDate; maxDate.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/daterangepicker.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `from` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `to` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `preset` | `'today' | 'last7d' | 'last30d' | 'monthToDate' | 'custom'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `minDate` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `maxDate` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `30.01` — Widok główny

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
