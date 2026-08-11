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


## Patch 3 — Storybook taxonomy cleanup

Status: proposed patch package generated from user-provided source ZIP on 2026-08-10.

Zakres:
- Usunięto z aktywnego Storybooka niezaakceptowaną sekcję `10 Komponenty`; zaakceptowane elementy bazowe pozostają w `00 Fundamenty`.
- Przeniesiono zaakceptowane elementy bazowe do `00 Fundamenty`:
  - `00 Fundamenty/03 Marka`,
  - `00 Fundamenty/04 Ikony`,
  - `00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje`,
  - `00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe`.
- Usunięto z aktywnego Storybooka sekcję `20 Powłoka`; runtime OverlayRoot nie jest prezentowany jako zaakceptowana powierzchnia.
- Dodano jawny `storySort`, żeby kolejność Storybooka zaczynała się od `00 Fundamenty`, a potem przechodziła przez `05`, `15`, `18`.
- Zaktualizowano kontrakt Storybooka, wygenerowany katalog i mapowanie `component-system-v1`.

Świadomie nie usunięto runtime component source. Zmiana dotyczy widoczności i taksonomii Storybooka, nie kasowania komponentów używanych przez aplikację.


## Patch 3 — global canvas, controls and accessibility polish

Decision: finish the remaining Storybook presentation issues in the active taxonomy after PR #41.

Implemented scope:

- light canvas is cooler and less yellow/milky;
- shared Storybook canvas carries runtime `theme`, `locale`, `density` and `motion` attributes;
- stories remount on runtime global changes to prevent stale locale/density/motion state;
- density and reduced-motion controls affect the shared presentation shell;
- accepted 00 component stories no longer show legacy `10 Komponenty bazowe` page chrome;
- Select focus is reduced to one composite focus-visible ring;
- 00/05 demo surfaces use shared separators and subtle depth rather than accidental containers;
- overflow protection is scoped to Storybook/presentation surfaces, not blindly applied to runtime components.

Out of scope:

- full business-copy translation of every 18.x and 15.x story body;
- Dependabot updates;
- production app screen redesign.
