# Storybook visual presentation audit

Status: draft / working branch `storybook/visual-presentation-brand-flow`

## Problem

Storybook miał kilka równoległych sposobów prezentowania przykładów:

- wspólny shell `pd-f0-page` / `pd-f0-section`,
- lokalne wrappery `canvas`, `stage`, `grid`, `row`, `variant`,
- warianty z opisem po lewej i komponentem po prawej,
- przykłady pełnoszerokościowe obok przykładów ściskanych przez kolumnę tekstu.

Efekt wizualny: przykłady w różnych sekcjach były raz przesunięte w prawo, raz wyśrodkowane, raz ściśnięte, a raz pełnoszerokościowe.

## Decyzja

Storybook ma mieć jeden globalny kontrakt prezentacji:

1. `StoryPresentationPage` odpowiada za shell strony.
2. `StoryPresentationSection` odpowiada za układ sekcji.
3. Domyślna zawartość sekcji nie jest przesuwana do prawej kolumny.
4. Duże komponenty, wykresy, tła i warstwy mają dostawać pełną szerokość dostępnego obszaru.
5. Opis przykładu nie może ściskać głównego komponentu.
6. Lokalne CSS-y mogą doprecyzować przykład, ale nie powinny tworzyć konkurencyjnego systemu layoutu.

## Zakres tego patcha

- centralny kontrakt `StoryPresentationSection`,
- globalny układ `.pd-f0-section__content`,
- domyślne ułożenie `.pd-f0-variant` jako stacked,
- pierwsze wyrównanie wariantów w sekcji `15 Wykresy i dane`.

## Poza zakresem

- globalny light canvas,
- system focus states,
- BrandFlowLine,
- usuwanie legacy stories,
- pełna migracja wszystkich starych lokalnych wrapperów.

## Patch 1.1 — local chart story alignment

Po odbiorze wizualnym pierwszego patcha potwierdzono, że centralny shell poprawił większość układu, ale część story wykresów nadal miała lokalne split-layouty ściskające wykres przez boczny opis.

Zakres korekty:

- `CorrelationChart`: opis wariantu nad wykresem, wykres dostaje pełną dostępną szerokość.
- `ForecastChart`: opis wariantu nad wykresem, prognoza i pasmo niepewności dostają pełną dostępną szerokość.
- `ComparisonChart`: sprawdzony, bez zmiany w tym patchu, bo główny wariant jest już stackowany; ewentualne dopracowanie zostaje do późniejszego passu wizualnego.

Decyzja: lokalne split-layouty są dozwolone tylko dla porównań semantycznych, list reguł i par accepted/rejected. Nie są dozwolone tam, gdzie główny wykres demonstracyjny traci szerokość przez opis pomocniczy.

## Patch 2 — BrandFlowLine

Po odbiorze layoutu wydzielono wspólny motyw kreski PapaData jako CSS primitive `BrandFlowLine`.

Decyzje:

- `PapaDataBrand` pozostaje źródłem wizualnego charakteru kreski.
- Kreska rozchodzi się od środka, ma fade na końcach i subtelny cień.
- `Button`, `IconButton`, `TextAction` i `LinkAction` używają tego samego motywu.
- Kolor kreski w akcjach wynika z bieżącego wariantu kontroli (`currentColor`), więc akcje destrukcyjne nie udają brandowego CTA.
- Focus ring nie jest zastępowany kreską. Kreska jest motywem hover/focus, ale dostępnościowy focus zostaje osobnym stanem.
