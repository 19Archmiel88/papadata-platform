---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: SearchField
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# SearchField

## Cel i odpowiedzialność
`SearchField` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
query; placeholder; loading; resultCount; debounceMs.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/searchfield.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `query` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `placeholder` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `loading` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `resultCount` | `number | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `debounceMs` | `number` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `25.02` — Logowanie

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
