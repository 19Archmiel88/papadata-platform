---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-683566C77344
status: approved-target
updated_at: 2026-08-06T00:00:00+02:00
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

| Status implementacji | PROTOTYP STORYBOOK — REVIEW |
| Status Storybooka | jedna historia 05.03 z ośmioma reprezentatywnymi sekcjami |
| Status testów | dedykowane interaction/play i utrwalone axe: `not_started`; walidacja techniczna i runtime wymagana przed akceptacją |

## Decyzja docelowa

Panel istnieje tylko wtedy, gdy ma własną rolę, stan albo cykl interakcji. Story 05.03 jest laboratorium decyzji i nie zastępuje docelowych stories `MetricCard`, `ChartFrame`, rodzin wykresów, `DataTable`, `ColumnPicker`, `DetailPanel` ani eksportu.

## Wdrożony zakres laboratorium

1. Role powierzchni.
2. Warianty KPI.
3. Rodziny wykresów.
4. Pełny ChartFrame.
5. System tabeli.
6. Stany powierzchni.
7. Panele robocze w kontekście.
8. Decyzja i antyprzykład.

W całej historii nie wolno używać poziomego scrolla jako rozwiązania układu. Elementy układają się pionowo albo w elastycznej siatce. Panele szczegółów, eksportu, dowodów i rekomendacji są warstwami zgodnymi z `00-08-glebia-i-warstwy.md`, a nie blokami przedłużającymi stronę.

## Warianty KPI

Każdy lokalny wariant KPI w 05.03 ma deterministyczny mikrowykres SVG: wzrostowy, spadkowy albo stabilny. Kierunek wynika z przebiegu linii, tekstowego opisu i kontekstu metryki, nie wyłącznie z koloru. Spadek kosztu może być korzystny. `unknown` i brak danych nie są przedstawiane jako fałszywy trend płaski.

Mikrowykres rozdziela kierunek linii od sygnału biznesowego. Sygnał dodatni używa `--pd-status-success`, ujemny `--pd-status-danger`, neutralny `--pd-status-neutral`, a ostrzegawczy `--pd-status-warning`. Dlatego korzystny spadek kosztu pozostaje zielony, natomiast spadek marży jest czerwony. Tekst badge’a jawnie nazywa zarówno sygnał, jak i kierunek, więc znaczenie nie zależy wyłącznie od koloru. Lokalny, 12-procentowy `color-mix()` tworzy subtelne wypełnienie pod linią bez glow, drop-shadow ani ciężkich filtrów. Reguły SVG są ograniczone do KPI historii 05.03 i nie rozszerzają globalnego kontraktu produkcyjnego `MetricCard`.

## Rodziny wykresów

Historia pokazuje `TrendChart`, `ComparisonChart`, `ShareChart`, `CorrelationChart`, `ForecastChart`, `WaterfallChart` i `FunnelChart`. Każda rodzina przedstawia właściwe znaczenie kontraktowe, osie lub punkt odniesienia, metadane źródła i zakresu oraz warstwy analityczne. Wykresy nie są dekoracyjnymi szkicami.

Grid i osie mają niższą wagę niż dane. Benchmark jest rozróżniony linią przerywaną. Focus, insight i adnotacja nie polegają wyłącznie na kolorze. Zoom, brush, pan i crosshair pozostają poza zatwierdzonym kontraktem, dlatego nie są deklarowane jako gotowe funkcje.

## Pełny ChartFrame

ChartFrame pokazuje jedno pytanie biznesowe, jeden główny wykres, status świeżości, zakres dat, porównanie okresu, legendę, adnotację i narracyjny wniosek. Dane, źródła i tabela alternatywna są ujawniane progresywnie przez zakładki. Nie ma przeładowanego brush zoomu, wielu nakładających się tooltipów ani dekoracyjnych filtrów SVG.

## System tabeli

Tabela domyślnie nie zaznacza żadnego rekordu. Przycisk „Zwiń do 1 wiersza” pokazuje pierwszy rekord bieżącej strony po filtrach i nie zmienia sortowania, strony, filtrów, widoczności kolumn, zaznaczeń ani danych źródłowych. `aria-expanded` odzwierciedla stan prezentacji.

Toolbar demonstruje wyszukiwanie, status, zakres, sortowanie, czyszczenie filtrów, gęstość, wybór widocznych kolumn i eksport. Paginacja zachowuje bieżący kontekst, a zaznaczenie rekordów ujawnia lokalny pasek działań zbiorczych. Produkt, wybór i akcja pozostają zawsze widoczne; kolumny opcjonalne są zarządzane w warstwie, a nie przez dodatkowy blok pod tabelą.

Kontrolki Status, Zakres i Sortowanie używają lokalnego wzorca select zgodnego z zaakceptowanymi Fundamentami: przycisk wyzwalający z bursztynowym akcentem, panel `listbox` na warstwie popover, firmowy stan aktywny i znacznik wybranej opcji w formie kreski. Obsługiwane są strzałki, Home, End, Escape, Tab i powrót fokusu do triggera. Laboratorium nie używa natywnego menu przeglądarkowego ani nie rozszerza jeszcze globalnego kontraktu produkcyjnego Select.

Szczegóły rekordu, wybór kolumn i podgląd eksportu otwierają się przez istniejący `Drawer`/`OverlayRoot`, obsługują Escape i przywrócenie fokusu. Eksport domyślnie używa bieżącego widoku i widocznych kolumn; może objąć zaznaczone rekordy albo wszystkie rekordy dozwolone przez capability i politykę danych.

Tabela nie używa poziomego scrolla. Na wąskim reflow rekordy przechodzą do pionowej prezentacji z etykietami pól.

## Stany danych

Laboratoryjne stany mapują się na kanoniczne: loading → processing, empty → no data, partial → partial, stale → stale, error → konkretna przyczyna, np. provider error. Ogólny `error` bez przyczyny nie jest używany. Stany zachowują geometrię i układają się bez poziomego przewijania.

## Panele robocze

Dowody, rekomendacja i panel roboczy są uruchamiane z kontekstu decyzji i otwierane jako warstwy. Nie są trzema równorzędnymi kartami pod wykresem lub tabelą. Warstwa ma nazwę, kontrolkę zamknięcia, Escape, scrim i focus restore wynikające z komponentu Drawer/OverlayRoot.

## Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-separator`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*` oraz role warstw z Fundamentów.

## Responsywność i dostępność

Aktywny odbiór Stage 02 obejmuje desktop light/dark. Reflow nie może tworzyć poziomego scrolla. SVG ma tekstowy odpowiednik, tabela ma caption i etykiety, a znaczenie statusów i trendów nie zależy wyłącznie od koloru. Mobile i tablet pozostają odroczone jako formalny projekt produktu.

## Storybook i odbiór

Przed akceptacją wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola wszystkich ośmiu sekcji, klawiatury, focus, Drawer/OverlayRoot, Escape, focus restore, braku domyślnego zaznaczenia, zwijania tabeli, braku poziomego overflow i błędów konsoli. Historia pozostaje `review` do świadomej akceptacji użytkownika.

BRAK DECYZJI W DOKUMENTACJI: szczegółowy kontrakt zoom, brush, pan i crosshair nie jest zatwierdzony. Funkcje nie są wdrażane w tym laboratorium.

BRAK DECYZJI W DOKUMENTACJI: określenie „wykres kwadratowy” nie identyfikuje Treemap, Heatmap ani nowej rodziny i wymaga osobnej decyzji.
