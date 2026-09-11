---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: Tabs
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Tabs

## Cel i odpowiedzialność
`Tabs` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
items; activeId; activation; orientation.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/tabs.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `items` | `Array<{ id: string; label: string; disabled?: boolean; badge?: string }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `activeId` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `activation` | `'automatic' | 'manual'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `orientation` | `'horizontal' | 'vertical'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
> [STD-COMPONENT-EVENTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-events) — normatywny.

## Stany i warianty
> [STD-COMPONENT-STATES](../../00-zarzadzanie-dokumentacja/README.md#std-component-states) — normatywny.

## Dostępność
> [STD-COMPONENT-A11Y](../../00-zarzadzanie-dokumentacja/README.md#std-component-a11y) — normatywny.

## Konsumenci
- `20.01` — Powłoka aplikacji
- `30.03` — KPI
- `30.05` — Drivery wyniku
- `30.07` — Ruch
- `30.08` — Produkty
- `30.10` — Lejek
- `30.12` — Sygnały sprzedażowe
- `30.13` — Waterfall
- `31.01` — Przegląd
- `31.02` — Lista kampanii
- `31.03` — Szczegóły kampanii
- `31.08` — Warianty kampanii
- `32.01` — Przegląd
- `32.03` — Szczegóły
- `33.01` — Przegląd
- `33.02` — Katalog
- `33.03` — Szczegóły
- `33.06` — Wydajność
- `33.08` — Analiza wpływu
- `33.09` — Warianty produktów
- `34.04` — Szczegóły pseudonimizowane
- `35.03` — Lejek — widok
- `35.04` — Lejek — szczegóły kroku
- `35.06` — GA4 vs zamówienia
- `40.03` — Szczegóły integracji
- `40.06` — Zakres synchronizacji
- `50.04` — Context basket
- `50.09` — Obserwacje
- `60.07` — Audyt
- `80.06` — Szczegóły działania
- `80.08` — Biblioteka działań
- `85.01` — Strona główna pomocy
- `85.02` — Procedury
- `85.03` — Lista wyników
- `85.04` — Szczegóły procedury

## Storybook i testy
> [STD-COMPONENT-STORYBOOK-TESTS](../../00-zarzadzanie-dokumentacja/README.md#std-component-storybook-tests) — normatywny.

## Kryteria akceptacji
> [STD-COMPONENT-ACCEPTANCE](../../00-zarzadzanie-dokumentacja/README.md#std-component-acceptance) — normatywny.
