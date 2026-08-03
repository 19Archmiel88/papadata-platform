---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-683566C77344
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Powierzchnie danych

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 05.03 |
| Nazwa polska | Powierzchnie danych |
| Nazwa techniczna | powierzchnie-danych |
| Typ dokumentu | kontrakt powierzchni |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Design System Lead |
| Moduł | M02 — Design System |

| Status implementacji | DECYZJA DOCELOWA — WYMAGA IMPLEMENTACJI |
| Status Storybooka | jawnie wskazany w sekcji Storybook |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy |

## Decyzja docelowa

Panel istnieje tylko, gdy ma własną rolę, stan albo cykl interakcji.

05.03 jest laboratorium decyzji wizualnych i strukturalnych dla powierzchni danych. Nie zastępuje docelowych stories komponentów `MetricCard`, `ChartFrame`, rodzin wykresów, `DataTable`, `ColumnPicker`, `FilterBar`, `Pagination`, `BulkActionBar`, `DetailPanel` ani mechanizmu eksportu.

## Anatomia powierzchni

```text
Surface
├── Background role
├── Content boundary
├── Optional status region
├── Interactive content
└── Overlay anchor
```

## Reguły

- KPI, wykres, tabela, szczegóły, dowody, rekomendacja i status danych
- metadane źródła, zakresu i świeżości
- brak kart wewnątrz kart
- 05.03 może prezentować etykiety loading, empty, partial, stale i error, ale nie ustanawia ich jako nowego słownika kanonicznego
- etykiety laboratoryjne mapują się na nazwy kanoniczne z `15-08-stany-danych.md`: loading → processing, empty → no data, partial → partial, stale → stale, error → konkretna przyczyna, np. provider error, unavailable albo conflict
- identyfikatory techniczne, np. `noData` albo `sourceError`, są zapisywane osobno i wyłącznie wtedy, gdy występują we właściwym kontrakcie
- widoczność kolumn w tabeli wynika z `ColumnPicker` i nie zmienia modelu danych
- eksport pojedynczej tabeli domyślnie korzysta z aktualnie widocznych kolumn
- zwinięcie tabeli do 1 wiersza jest wariantem prezentacji powierzchni, nie stanem danych

## Granica laboratorium

Story 05.03 pokazuje decyzje reprezentatywnie. Pełne katalogi wariantów komponentów pozostają odpowiedzialnością ich docelowych stories. Wewnętrzne sekcje 05.03:

1. Role powierzchni.
2. Warianty KPI.
3. Rodziny wykresów.
4. Pełny ChartFrame.
5. System tabeli.
6. Stany powierzchni.
7. Panele robocze w kontekście.
8. Decyzja i antyprzykład.

Nie dodaje się nowej story w sekcji 05.

## Warianty wymagane przez katalog

- karta KPI
- karta wykresu
- tabela
- panel szczegółów
- drawer
- panel dowodów
- panel rekomendacji
- panel statusu danych.

## Rodziny i typy wykresów

05.03 pokazuje rodziny kontraktowe: `TrendChart`, `ComparisonChart`, `ShareChart`, `CorrelationChart`, `ForecastChart`, `WaterfallChart` i `FunnelChart`. Typy użytkowe z raportów mapują się na te rodziny:

| Typ użytkowy | Rodzina kontraktowa | Reguła |
| --- | --- | --- |
| liniowy | `TrendChart` | trend w czasie, opcjonalne punkty i linia bazowa |
| słupkowy | `ComparisonChart` | porównanie kategorii albo okresów |
| kołowy / donut | `ShareChart` | udział segmentów w całości |
| area | `TrendChart` | stosować tylko, gdy wypełnione pole ma znaczenie analityczne |
| stacked | `ShareChart` albo `ComparisonChart` | `ShareChart`, gdy pokazuje strukturę udziału w całości; `ComparisonChart`, gdy porównuje skumulowane kategorie albo okresy |
| waterfall | `WaterfallChart` | składowe zmiany wyniku |
| lejek | `FunnelChart` | konwersja kolejnych etapów |

Określenie „wykres kwadratowy” wymaga późniejszej identyfikacji konkretnej wizualizacji. Nie oznacza jeszcze `Treemap`, `Heatmap`, macierzy ani nowej rodziny wykresu.

## System tabeli w 05.03

Reprezentatywna tabela w 05.03 pokazuje pełną powierzchnię tabeli: toolbar, wyszukiwanie, filtry, zakres dat, licznik aktywnych filtrów, czyszczenie filtrów, wybór widocznych kolumn, kolumny wymagane, zmianę gęstości, sortowanie, zaznaczanie wierszy, działania zbiorcze, akcje rekordu, otwarcie szczegółów, paginację, liczbę rekordów, stany danych i eksport.

`ColumnPicker` kontroluje wyłącznie pokazywanie i ukrywanie istniejących kolumn. Kolumny wymagane nie mogą zostać ukryte. Zmiana kolejności kolumn nie jest zatwierdzona w 05.03.

Eksport pojedynczej tabeli rozróżnia opcje „Eksportuj widoczne kolumny” i „Eksportuj wszystkie kolumny”. Opcją domyślną i rekomendowaną jest eksport widocznych kolumn.

„Eksportuj wszystkie kolumny” oznacza wszystkie dozwolone i eksportowalne kolumny należące do aktualnego zestawu danych tabeli: dostępne dla aktualnego użytkownika oraz dopuszczone do prezentacji i eksportu przez capability oraz politykę danych. Opcja nie obejmuje pól technicznych backendu, kolumn niedostępnych dla użytkownika ani danych wyłączonych z eksportu. PII, sekrety i dane chronione są wykluczone, jeśli nie zostały jawnie dopuszczone do eksportu; dane osobowe mogą trafić do eksportu tylko wtedy, gdy należą do aktualnego zestawu danych tabeli, użytkownik ma właściwe capability, a polityka danych jawnie pozwala na eksport. Ukrycie kolumny przez `ColumnPicker` jest preferencją widoku i nie zwiększa ani nie zmniejsza uprawnień.

Zwinięcie tabeli do 1 wiersza pokazuje pierwszy wiersz bieżącego wyniku po filtrach, sortowaniu i na aktualnej stronie. Nie zmienia filtrów, sortowania, strony, rozmiaru strony, widoczności kolumn, zaznaczeń ani danych źródłowych.

## Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*`.

## Responsywność

Powierzchnia nie ma stałej wysokości zależnej od desktopu. Na compact zachowuje priorytet zadania, na medium redukuje elementy drugorzędne, a na wide nie rozciąga tekstu formularzy i opisów ponad czytelną szerokość.

## Dostępność

Powierzchnia nie jest automatycznie landmarkiem. Landmark wynika z rzeczywistej roli i ma nazwę. Tło, gradient ani tekstura nie mogą obniżyć kontrastu lub utrudnić widoczności focus ring.

## Storybook i odbiór

Wymagane: light, dark, desktop, tablet, mobile, zoom 200%, high content density, empty/error z konkretną przyczyną oraz porównanie z antyprzykładem. Kryterium odbioru stanowi brak utraty funkcji i brak dekoracyjnych wrapperów bez odpowiedzialności. Story 05.03 pozostaje jedną story w `05 Laboratorium decyzji`.
