---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: ErrorState
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# ErrorState

## Cel i odpowiedzialność
`ErrorState` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
errorCode; title; message; correlationId; recoverable; retryActionId.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/errorstate.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `errorCode` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `title` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `message` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `correlationId` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `recoverable` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `retryActionId` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

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
