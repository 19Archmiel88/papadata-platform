---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: component-contract
component_id: DataTable
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# DataTable

## Cel i odpowiedzialność
`DataTable` rozwiązuje jeden określony problem interfejsu i nie przejmuje odpowiedzialności ekranu ani domenowego API. Kontrakt jest stanem docelowym wymagającym implementacji i testów.

## Anatomia
columns; rows; rowCount; sort; selectedRowIds; loading; emptyMessage.

Pełny system tabeli jest kompozycją powierzchni, a nie wyłącznie siatką danych. Może obejmować toolbar, wyszukiwanie, filtry, zakres dat, licznik aktywnych filtrów, czyszczenie filtrów, `ColumnPicker`, zmianę gęstości, sortowanie, zaznaczanie wierszy, `BulkActionBar`, akcje pojedynczego rekordu, otwieranie `DetailPanel`, paginację, liczbę wszystkich rekordów, stany danych i eksport.

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

Wariant prezentacyjny „Zwiń do 1 wiersza” pokazuje pierwszy wiersz bieżącego wyniku po zastosowaniu aktywnych filtrów, aktualnego sortowania i aktualnie wybranej strony. Akcja powrotna to „Pokaż pełną tabelę”.

Zwinięcie nie jest stanem danych, stanem gotowości, zmianą paginacji ani zmianą zestawu danych. Nie może automatycznie zaznaczać wiersza, zmieniać aktywnej strony, zmieniać rozmiaru strony, usuwać filtrów, usuwać sortowania, zmieniać widoczności kolumn, usuwać istniejącego zaznaczenia ani zmieniać danych źródłowych. Toolbar, nagłówek kolumn oraz informacja o liczbie rekordów pozostają dostępne, chyba że dokumentacja konkretnego ekranu jednoznacznie określi inaczej.

Eksport pojedynczej tabeli korzysta z aktualnej konfiguracji powierzchni. Opcja „Eksportuj widoczne kolumny” uwzględnia tylko widoczne kolumny, ich aktualną kolejność prezentacji wynikającą z konfiguracji tabeli, aktywne filtry, aktualne sortowanie, zakres dat, źródło, świeżość i snapshot, jeżeli dotyczy.

Opcja „Eksportuj wszystkie kolumny” obejmuje także kolumny ukryte, ale tylko w bezpiecznym zakresie: wszystkie dozwolone i eksportowalne kolumny należące do aktualnego zestawu danych tabeli, dostępne dla aktualnego użytkownika oraz dopuszczone do prezentacji i eksportu przez capability oraz politykę danych. Opcja nie obejmuje pól technicznych backendu, kolumn niedostępnych dla użytkownika ani danych wyłączonych z eksportu. PII, sekrety i dane chronione są wykluczone, jeśli nie zostały jawnie dopuszczone do eksportu; dane osobowe mogą trafić do eksportu tylko wtedy, gdy należą do aktualnego zestawu danych tabeli, użytkownik ma właściwe capability, a polityka danych jawnie pozwala na eksport. Nie zmienia widoku użytkownika.

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

Story DataTable odpowiada za pełne warianty systemu tabeli. Story 05.03 pokazuje reprezentatywną powierzchnię tabeli i nie zastępuje katalogu komponentu.

## Kryteria akceptacji
1. `tsc --noEmit` kompiluje jedyny kontrakt kanoniczny.
2. Dokument, rejestr i macierz ekran–komponent wskazują ten sam component ID i plik kontraktu.
3. Testy a11y nie wykazują naruszeń krytycznych.
4. Komponent nie definiuje własnych tokenów ani duplikuje komponentu bazowego.
