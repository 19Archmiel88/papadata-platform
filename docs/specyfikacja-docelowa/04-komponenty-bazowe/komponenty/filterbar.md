---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: FilterBar
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# FilterBar

## Cel i odpowiedzialność
`FilterBar` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
filters; activeCount; collapsible.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/filterbar.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `filters` | `Array<{ id: string; label: string; type: 'select' | 'date' | 'search'; value: string | null }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `activeCount` | `number` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `collapsible` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `20.01` — Powłoka aplikacji
- `30.02` — Kolejka uwagi
- `30.07` — Ruch
- `31.02` — Lista kampanii
- `32.02` — Lista
- `33.02` — Katalog
- `33.07` — Kolejka braków
- `34.06` — Prywatność
- `35.01` — Przegląd ruchu
- `40.01` — Katalog integracji
- `40.04` — Historia synchronizacji
- `50.08` — Laboratorium AI
- `50.15` — Historia i pamięć Papa
- `60.02` — Workspace
- `60.03` — Członkostwa
- `60.06` — Sesje
- `60.07` — Audyt
- `60.09` — Dostęp wsparcia
- `70.04` — Faktury
- `80.04` — Rejestr decyzji
- `80.06` — Szczegóły działania
- `85.03` — Lista wyników

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
