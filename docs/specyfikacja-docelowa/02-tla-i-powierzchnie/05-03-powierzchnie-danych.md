---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-683566C77344
status: approved-target
updated_at: 2026-08-07T00:00:00+02:00
---

# Powierzchnie danych

## Rola Laboratorium i handoff
`05.03` porównuje archetypy powierzchni danych. Nie jest trwałym właścicielem `MetricCard`, `ChartFrame`, `DataTable`, panelu szczegółów, dowodów ani rekomendacji. Po akceptacji odpowiedzialności są promowane odpowiednio do warstw `00 / 15 / 18`.

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
2. Handoff KPI do `15.02 MetricCard`.
3. Rodziny wykresów.
4. Handoff ChartFrame do `15.01 ChartFrame`.
5. Użycie runtime `DataTable` i handoff workflow tabeli do `18.04`.
6. Stany powierzchni konsumujące kanoniczny model statusu.
7. Panele robocze w kontekście.
8. Decyzja i antyprzykład.

W całej historii nie wolno używać poziomego scrolla jako rozwiązania układu. Elementy układają się pionowo albo w elastycznej siatce. Panele szczegółów, eksportu, dowodów i rekomendacji są warstwami zgodnymi z `00-08-glebia-i-warstwy.md`, a nie blokami przedłużającymi stronę.

## KPI — handoff

Warianty KPI i mikrotrend zostały promowane do `15.02 MetricCard`. 05.03 nie renderuje lokalnego katalogu KPI, nie utrzymuje `KpiSparkline` i nie definiuje drugiego języka sygnału. Laboratorium pokazuje jedynie informację o ownerze i zachowuje historię decyzji.

## Rodziny wykresów

Historia pokazuje `TrendChart`, `ComparisonChart`, `ShareChart`, `CorrelationChart`, `ForecastChart`, `WaterfallChart` i `FunnelChart`. Każda rodzina odpowiada na inne pytanie biznesowe i ma własny kontekst metryki, źródła, zakresu oraz punktu odniesienia. Laboratorium nie prezentuje siedmiu miniaturek z identycznym opisem.

Serie analityczne używają ról `--pd-data-accent` oraz `--pd-data-series-*`. `--pd-brand-*` nie pełni roli koloru danych, a tony statusowe są używane tylko wtedy, gdy wykres rzeczywiście koduje semantyczny wzrost, spadek lub błąd. Grid i osie mają niższą wagę niż dane. Benchmark jest rozróżniony linią przerywaną. Zoom, brush, pan i crosshair pozostają poza zatwierdzonym kontraktem, dlatego nie są deklarowane jako gotowe funkcje.

## ChartFrame — handoff

Pełny kontener został promowany do `15.01 ChartFrame`. 05.03 nie renderuje lokalnej implementacji ChartFrame. Nagłówek, status, metadane, wizualizacja, legenda, wniosek, tabela alternatywna i akcja Papa są kontraktem 15.01.

## Tabela — handoff i użycie

Bazowy `DataTable` pozostaje runtime komponentem, a aktywnym ownerem workflow tabeli w Storybooku jest `18.04`. 05.03 konsumuje ten komponent bez lokalnego silnika `<table>`, bez własnego `DataSurfaceSelect`, bez własnej paginacji, wyboru kolumn, gęstości, filtrowania i mechanizmu zaznaczeń.

Laboratorium pokazuje jedynie kontekst użycia tabeli oraz warstwy uruchamiane z akcji rekordu:

- `Pokaż szczegóły` używa istniejącej ikony `data` i otwiera warstwę szczegółów;
- `Wyjaśnij z Papa` używa istniejącej ikony `assistant` i otwiera warstwę interpretacji;
- `Podgląd eksportu` jest wyłącznie handoffem, ponieważ pełny workflow `FilterBar + DataTable + Pagination + actions + DetailPanel` należy do `18.04`.

Tabela domyślnie nie zaznacza żadnego rekordu. Laboratorium dodaje nad runtime `DataTable` wyłącznie kontekst powierzchni: zakres, źródła, status danych i aktualny opis sortowania. Nie implementuje własnego toolbara, filtrów, paginacji ani ColumnPicker. Liczby, waluty i procenty są formatowane przez Foundation runtime. Na wąskim reflow nie wolno wprowadzać poziomego scrolla jako zastępstwa decyzji układowej.

## Stany danych

Laboratoryjne stany używają `AnalyticsDataState`, `resolveAnalyticsDataStateTone()` i kanonicznego `StatusBadge`. 05.03 nie mapuje `processing`, `partial`, `stale`, `noData` ani błędów danych przez lokalny `ReviewBadge`. Każdy stan korzysta z tej samej stabilnej anatomii powierzchni: nagłówek metryki, stały region danych, metadane świeżości/kompletności i tekstowy opis stanu. Stan zmienia informację, a nie konstrukcję powierzchni. Konkretny klucz stanu pozostaje własnością domeny/Analytics UI.

## Panele robocze

Dowody, rekomendacja i panel roboczy są uruchamiane z rzeczywistego kontekstu decyzji zawierającego metryki, trend i sygnał biznesowy. Otwierają się jako warstwy ponad canvasem i nie są trzema równorzędnymi kartami dokładanymi pod wykresem lub tabelą. Warstwa ma nazwę, kontrolkę zamknięcia, Escape, scrim i focus restore wynikające z komponentu Drawer/OverlayRoot.

## Decyzja i antyprzykład

Story pokazuje również ograniczony wizualny antyprzykład. Demonstruje on kartę dla każdego fragmentu danych, zagnieżdżanie powierzchni i sztuczny poziomy scrollbar. Antyprzykład jest zamknięty we własnym regionie demonstracyjnym i nie wprowadza rzeczywistego poziomego overflow strony.

## Tokeny

`--pd-canvas`, `--pd-surface`, `--pd-surface-subtle`, `--pd-surface-raised`, `--pd-separator-subtle`, `--pd-separator`, `--pd-overlay-scrim`, `--pd-shadow-overlay`, `--pd-radius-*` oraz role warstw z Fundamentów.

## Responsywność i dostępność

Aktywny odbiór Stage 02 obejmuje desktop light/dark. Reflow nie może tworzyć poziomego scrolla. SVG ma tekstowy odpowiednik, tabela ma caption i etykiety, a znaczenie statusów i trendów nie zależy wyłącznie od koloru. Mobile i tablet pozostają odroczone jako formalny projekt produktu.

## Storybook i odbiór

Przed akceptacją wymagane są: typecheck, Storybook build, checki katalogu/architektury/taksonomii, Foundation verification, `git diff --check`, desktop light/dark, kontrola wszystkich ośmiu sekcji, klawiatury istniejących komponentów, focus, Drawer/OverlayRoot, Escape, focus restore, braku domyślnego zaznaczenia, braku lokalnego silnika tabeli/Selecta, braku poziomego overflow i błędów konsoli. Historia ma status `accepted`.

BRAK DECYZJI W DOKUMENTACJI: szczegółowy kontrakt zoom, brush, pan i crosshair nie jest zatwierdzony. Funkcje nie są wdrażane w tym laboratorium.

BRAK DECYZJI W DOKUMENTACJI: określenie „wykres kwadratowy” nie identyfikuje Treemap, Heatmap ani nowej rodziny i wymaga osobnej decyzji.


## Handoff po promocji 15.01–15.02

- archetyp pełnego `ChartFrame` został promowany do `15.01`; 05.03 nie utrzymuje drugiej implementacji;
- warianty KPI i lokalny `KpiSparkline` zostały promowane do `15.02 MetricCard`; 05.03 nie utrzymuje drugiego katalogu KPI;
- rodziny wykresów pozostają decyzją laboratoryjną do czasu implementacji `15.03–15.07`;
- bazowa tabela jest konsumowana jako runtime `DataTable`; workflow filtrów, paginacji, akcji i detail należy do `18.04`;
- stany danych konsumują kanoniczny `StatusBadge` i mapowanie Analytics; docelowe zachowanie rodzin danych pozostaje do promocji w `15.08`;
- warstwy szczegółów/dowodów/rekomendacji pozostają decision recordem do czasu handoffu do `18.07`.

Od tego etapu 05.03 jest źródłem historii decyzji, a nie runtime source of truth dla ChartFrame i MetricCard.
