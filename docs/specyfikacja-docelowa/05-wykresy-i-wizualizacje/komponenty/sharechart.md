---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: ShareChart
---
# ShareChart

## Cel i odpowiedzialność
`ShareChart` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
segments; total; display.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/sharechart.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `segments` | `Array<{ id: string; label: string; value: number; percent: number }>` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `total` | `number` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `display` | `'donut' | 'bar' | 'stacked'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `30.04` — Plan vs wynik
- `30.05` — Drivery wyniku
- `30.06` — Źródła sprzedaży
- `30.07` — Ruch
- `30.09` — Klienci
- `31.03` — Szczegóły kampanii
- `31.04` — Atrybucja i sprzedaż
- `32.01` — Przegląd
- `33.02` — Katalog
- `33.03` — Szczegóły
- `33.06` — Wydajność
- `34.02` — Segmenty
- `34.07` — Analiza wpływu
- `35.02` — Kanały
- `35.04` — Lejek — szczegóły kroku
- `35.08` — Strony wejścia
- `41.05` — Nadrzędność źródła
- `50.06` — Dowody
- `50.08` — Laboratorium AI

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
