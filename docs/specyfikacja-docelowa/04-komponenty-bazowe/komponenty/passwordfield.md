---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: PasswordField
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# PasswordField

## Cel i odpowiedzialność
`PasswordField` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Runtime source of truth
Publiczne React API działającego komponentu jest własnością `apps/web/src/design-system/components/Field/PasswordField.tsx`. Plik `contracts/components/passwordfield.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla ekranów i zdarzeń; nie jest kopią React Props.

## Anatomia
value; visible; autocomplete; strength; requirements.

## Kontrakt orkiestracyjny TypeScript
Kontrakt orkiestracyjny/specyfikacyjny: `contracts/components/passwordfield.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `value` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `visible` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `autocomplete` | `'current-password' | 'new-password'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `strength` | `number | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `requirements` | `Array<{ id: string; label: string; met: boolean }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

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
1. `tsc --noEmit` kompiluje kontrakt orkiestracyjny, a runtime Props kompilują się z implementacją komponentu.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
