# Storybook Taxonomy Cleanup — 2026-08-10

## Decyzja

Na podstawie akceptacji właściciela produktu aktywny Storybook nie pokazuje już niezaakceptowanych sekcji `10 Komponenty` i `20 Powłoka`.

## Co zostało usunięte z aktywnej nawigacji Storybooka

- `10 Komponenty/*` — legacy stories usunięte z aktywnego repozytorium Storybooka; runtime komponentów nie został usunięty.
- `20 Powłoka/OverlayRoot i system warstw` — story usunięte z aktywnego repozytorium Storybooka; runtime OverlayRoot pozostaje poza aktywnym Storybookiem.
- Sekcje `10` i `20` usunięte z `storybook-contract.json` oraz `catalog.generated.ts`.

## Co zostało zachowane

Nie skasowano runtime source komponentów. Zachowano komponenty jako kod produkcyjny/design-systemowy, a usunięto jedynie ich niezaakceptowane ekspozycje w Storybooku.

## Co przeniesiono do 00 Fundamenty

- `PapaDataBrand` → `00 Fundamenty/03 Marka`
- `Icon` → `00 Fundamenty/04 Ikony`
- `Button` / `TextAction` / `LinkAction` / `IconButton` → `00 Fundamenty/05 Akcje i wejścia/Przyciski i akcje`
- `FormFields` → `00 Fundamenty/05 Akcje i wejścia/Pola tekstowe i formularzowe`

## Docelowa kolejność widoczna w Storybooku

1. `00 Fundamenty`
2. `05 Laboratorium decyzji`
3. `15 Wykresy i dane`
4. `18 Wzorce interfejsu`

## Zakres poza tym patchem

- global light canvas,
- docelowe powierzchnie i głębia,
- PL/EN i martwe controls,
- focus polish,
- overflow audit,
- przebudowa albo usunięcie normatywnych dokumentów sekcji produktowej `20`.


## Patch 2 — controls, canvas and remaining visual cleanup

- Global Storybook canvas uses the same cooler light-mode background and runtime attributes as the app foundation layer.
- Storybook globals now remount stories when `theme`, `locale`, `density` or `motion` changes, so controls are not stale after switching.
- Density and reduced-motion globals affect the shared presentation shell.
- Accepted base stories no longer display legacy `10` ownership in their page chrome; they use `00 Fundamenty` IDs.
- Select focus is owned by the composite shell to avoid double focus rectangles.
- 00/05 demo surfaces use shared separators and subtle depth without adding heavy cards.
- The active Storybook surface remains ordered as `00 -> 05 -> 15 -> 18`.

## Patch 3 — docelowy podział po decyzji visual direction

`00 Fundamenty` zawiera teraz pięć chronologicznych grup:

- `01 Fundamenty wizualne` — kierunek wizualny, kolory, typografia, statusy, spacing, geometria, linie, głębia, ikonografia, motion i dostępność.
- `02 Powierzchnie i komunikaty` — canvas, powierzchnie, komunikat w kontekście, status obiektu, toast operacyjny oraz stany puste, błędy i blokady.
- `03 Marka` — użycie `PapaDataBrand`.
- `04 Ikony` — pełny katalog runtime `Icon`.
- `05 Akcje i wejścia` — przyciski, akcje oraz pola formularzowe.

`18 Wzorce interfejsu` przejmuje realne kompozycje produktowe, w tym `DataDecisionWorkspace`. Przykład danych, rekomendacji, sidecara i toasta nie jest już traktowany jako wyłącznie abstrakcyjny fundament — `00` definiuje reguły, a `18` pokazuje wzorzec produktu.

## Patch 4 — przebudowa 00 Fundamenty

Szczegółowy audit i decyzje dla pełnej przebudowy aktywnych stories `00 Fundamenty` są w `docs/storybook-planning/STORYBOOK-00-FOUNDATIONS-REBUILD.md`.
