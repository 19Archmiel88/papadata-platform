---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: ColumnPicker
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# ColumnPicker

## Cel i odpowiedzialność
`ColumnPicker` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
columns; maxVisible.

`ColumnPicker` służy wyłącznie do pokazywania i ukrywania istniejących kolumn. Pole `visible` opisuje bieżącą widoczność kolumny, a `required` oznacza kolumnę wymaganą, której użytkownik nie może ukryć.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/columnpicker.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `columns` | `Array<{ id: string; label: string; visible: boolean; required: boolean }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `maxVisible` | `number | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

ColumnPicker nie tworzy nowych kolumn, nie usuwa kolumn z modelu, nie modyfikuje schematu, nie usuwa danych źródłowych i nie zmienia kolejności kolumn. Zmiana kolejności kolumn pozostaje poza zakresem zatwierdzonego kontraktu.

Ukrycie kolumny wpływa na aktualny widok oraz na opcję „Eksportuj widoczne kolumny”. Nie zmienia danych źródłowych ani bezpiecznego zakresu opcji „Eksportuj wszystkie kolumny”. Ukrycie kolumny przez ColumnPicker jest preferencją widoku i nie zwiększa ani nie zmniejsza uprawnień użytkownika.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `20.01` — Powłoka aplikacji

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
