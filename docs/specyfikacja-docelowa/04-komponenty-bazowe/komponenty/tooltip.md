---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: Tooltip
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Tooltip

## Cel i odpowiedzialność
`Tooltip` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
content; placement; delayMs; interactive.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/tooltip.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `content` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `placement` | `'top' | 'right' | 'bottom' | 'left'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `delayMs` | `number` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `interactive` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `20.10` — Nakładki i warstwy interfejsu

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
