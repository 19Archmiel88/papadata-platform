---
version: 1.2
author: Artur Wisniewski
creator: Artur Wisniewski
owner: Artur Wisniewski
status: visual-work-in-progress
document_type: runtime-screen
screen_id: 30.00
runtime_surface: yes
---
# Centrum Dowodzenia - landing page

Centrum Dowodzenia jest jednym landing page w trybie przebudowy wizualnej. Aktualny aktywny zakres obejmuje sekcje KPI oraz Plan vs Prognoza.

## Aktywny zakres

- Route: `/app/command-center`.
- Aktywne kotwice runtime: `#command-section-kpi`, `#command-section-plan`.
- Aktywna historia Storybooka pelnej strony: `30 Centrum Dowodzenia/Landing page` -> `30.00 Caly landing page`.
- Aktywne historie sekcyjne: `30.01 KPI`, `30.02 Plan vs Prognoza`.
- Aktywne komponenty tresci: `CommandCenterKpiSection`, `CommandCenterPlanExecutionSection`, `CommandCenterPlanTrajectoryChart`.

## Obecne zalozenia UI

- KPI i Plan vs Prognoza sa renderowane jako sekcje tego samego landing page.
- Naglowki sekcji maja wspolny, maly styl sekcyjny.
- Karty KPI maja byc wizualnie spojne z kaflami Planu: wiecej glebi, mniej wewnetrznych kontenerow, mniejsze wykresy pomocnicze.
- Nawigacja po sekcjach jest jedna: runtime rail renderowany przez `CommandCenterWorkspace` i `SectionNavigation`.
- Interaktywny wykres Planu ma obslugiwac hover/focus punktow, plynne wygaszanie tooltipa oraz wlaczanie/wylaczanie serii z legendy.

## Czasowo odpiete z kryteriow

- Attention / sygnaly decyzyjne.
- Decision Workspace.
- Drivery wyniku.
- Struktura sprzedazy.
- Zrodla, klienci, produkty i lejek.
- Dzialania w toku.
- Testy play wymagajace pelnego landing page.
- Blokujace testy a11y w Storybooku.
- Lokalne walidacje katalogu, architektury i prezentacji Storybooka.

Po stabilizacji sekcji KPI oraz Plan vs Prognoza kolejnym zakresem jest osobna historia `30.03 Drivery` oparta na prototypie referencyjnym, bez kopiowania zewnetrznych zaleznosci z HTML.
