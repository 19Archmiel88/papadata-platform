---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: DataTable
---
# DataTable

## Cel i odpowiedzialność
`DataTable` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
columns; rows; rowCount; sort; selectedRowIds; loading; emptyMessage.

## Kanoniczny kontrakt TypeScript
Jedyny kanoniczny kontrakt: `contracts/components/datatable.ts`.

| Pole / kontrakt | Typ | Reguła |
|---|---|---|
| `columns` | `DataColumn[]` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `rows` | `DataRow[]` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `rowCount` | `number` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `sort` | `{ columnId: string; direction: 'asc' | 'desc' } | null` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `selectedRowIds` | `string[]` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `loading` | `boolean` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |
| `emptyMessage` | `string` | Wymagane zgodnie z kontraktem; brak wartości domyślnej oznacza obowiązek jawnego przekazania. |

## Zdarzenia
Zdarzenia mają identyfikator komponentu, nazwę działania, `correlationId` i typowany payload. Komponent nie wywołuje bezpośrednio endpointu — przekazuje intencję do właściciela ekranu.

## Stany i warianty
Obsłuż: default, loading, empty, error, disabled, readonly i success, jeśli mają znaczenie dla tego komponentu. Nie renderuj akcji bez capability i nie ukrywaj przyczyny blokady.

## Dostępność
Semantyczny element HTML, pełna obsługa klawiatury, focus-visible, nazwa dostępna, komunikaty dynamiczne przez właściwe live region oraz brak przekazywania znaczenia wyłącznie kolorem.

## Konsumenci
- `30.01` — Widok główny
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
Wymagane stories: wariant bazowy, wszystkie stany, długie polskie i angielskie etykiety, 200% zoom, dark/light, reduced motion oraz test interakcji dla każdej akcji. Target pozostaje backlogiem do chwili dodania fizycznego pliku story.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
