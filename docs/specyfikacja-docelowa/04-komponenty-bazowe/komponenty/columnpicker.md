---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: ColumnPicker
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
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

ColumnPicker nie tworzy nowych kolumn, nie usuwa kolumn z modelu, nie modyfikuje schematu, nie usuwa danych źródłowych i nie zmienia kolejności kolumn. Zmiana kolejności kolumn pozostaje poza zakresem zatwierdzonego kontraktu.

Ukrycie kolumny wpływa na aktualny widok oraz na opcję „Eksportuj widoczne kolumny”. Nie zmienia danych źródłowych ani bezpiecznego zakresu opcji „Eksportuj wszystkie kolumny”. Ukrycie kolumny przez ColumnPicker jest preferencją widoku i nie zwiększa ani nie zmniejsza uprawnień użytkownika.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `20.01` — Powłoka aplikacji

## Storybook i testy
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
