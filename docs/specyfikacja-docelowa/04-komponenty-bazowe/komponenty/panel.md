---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: Panel
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Panel

## Cel i odpowiedzialność
`Panel` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
title; padding; bordered; collapsible; collapsed.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/panel.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `title` | `string | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `padding` | `'none' | 'sm' | 'md' | 'lg'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `bordered` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `collapsible` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `collapsed` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `30.01` — Widok główny

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
