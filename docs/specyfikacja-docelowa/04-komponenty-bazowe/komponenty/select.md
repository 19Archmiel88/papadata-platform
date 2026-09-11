---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: Select
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Select

## Cel i odpowiedzialność
`Select` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
value; options; placeholder; searchable.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/select.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `value` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `options` | `Array<{ value: string; label: string; disabled?: boolean }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `placeholder` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `searchable` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `25.02` — Logowanie
- `30.03` — KPI
- `30.10` — Lejek
- `30.14` — Warianty Centrum Dowodzenia
- `32.04` — Oś zdarzeń
- `33.04` — Mapowanie
- `33.08` — Analiza wpływu
- `35.05` — Definicje lejka
- `35.07` — Jakość zdarzeń
- `40.02` — Kreator połączenia
- `40.07` — Ponowne połączenie
- `40.08` — Odłączenie
- `41.08` — Ponowne przetwarzanie
- `60.02` — Workspace
- `70.03` — Plany
- `70.05` — Płatności
- `70.08` — Zmiana i anulowanie
- `85.05` — Zgłoszenie wsparcia

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
