---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: TrendChart
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# TrendChart

## Cel i odpowiedzialność
`TrendChart` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
series; baseline; showPoints; curve; unit.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/trendchart.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `series` | `ChartSeries[]` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `baseline` | `number | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `showPoints` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `curve` | `'linear' | 'monotone' | 'step'` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `unit` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `30.02` — Kolejka uwagi
- `30.03` — KPI
- `30.04` — Plan vs wynik
- `30.11` — Rekomendacje AI — skrót
- `30.13` — Waterfall
- `30.14` — Warianty Centrum Dowodzenia
- `31.01` — Przegląd
- `31.02` — Lista kampanii
- `31.03` — Szczegóły kampanii
- `31.05` — Budżet
- `31.07` — Rekomendacje — kontekst domenowy
- `32.01` — Przegląd
- `33.01` — Przegląd
- `33.06` — Wydajność
- `33.07` — Kolejka braków
- `33.08` — Analiza wpływu
- `34.01` — Przegląd
- `34.02` — Segmenty
- `34.07` — Analiza wpływu
- `35.01` — Przegląd ruchu
- `35.05` — Definicje lejka
- `40.01` — Katalog integracji
- `40.08` — Odłączenie
- `41.07` — Przegląd ręczny
- `50.01` — Panel kontekstowy Papa
- `50.03` — Tryby pracy
- `50.04` — Context basket
- `50.09` — Obserwacje
- `50.10` — Rekomendacje i warianty
- `50.14` — Zablokowane działania AI
- `70.01` — Subskrypcja
- `70.02` — Użycie i limity
- `70.03` — Plany
- `70.08` — Zmiana i anulowanie
- `70.09` — Pilot do abonamentu
- `80.02` — Obserwacje
- `80.03` — Rekomendacje
- `80.07` — Pomiar

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
