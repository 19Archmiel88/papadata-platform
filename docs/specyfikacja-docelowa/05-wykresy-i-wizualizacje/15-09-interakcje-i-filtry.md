---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-EE3E67615F4B
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
---

# Interakcje i filtry

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.09 |
| Nazwa polska | Interakcje i filtry |
| Nazwa techniczna | interakcje-i-filtry |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i wizualizacje danych — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — REVIEW |
| Status Storybooka | `15 Wykresy i dane/Interakcje i filtry`, visible, implemented |
| Status testów | kontrakt testów zdefiniowany; implementacja śledzona w macierzy A15.6 |

## Cel i decyzja docelowa

15.09 jest właścicielem wspólnej warstwy interakcji wykresów: tooltip, hover, focus z klawiatury, wybór punktu lub serii, zakres dat, reset, drill-down i cross-filtering. Warstwa wskazuje rekord i filtr, ale nie zmienia definicji danych ani znaczenia serii.

## Stan obecny

Runtime `ChartInteractionLayer` jest wdrożony jako owner 15.09. Storybook pokazuje użycie z `TrendChart`, bo geometria trendu ma już właściciela 15.03. 15.09 nie przejmuje actual/plan, porównań, udziałów, korelacji ani prognozy.

Kontener filtrów używa `role="group"`, nie `role="toolbar"`, ponieważ runtime nie implementuje pełnego composite toolbar keyboard modelu. Kontrolki pozostają natywnymi przyciskami z `aria-pressed`, a focus/hover aktualizują ten sam opis tooltipu.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | tooltip | jeden statyczny opis aktywnego punktu | story + `role="tooltip"` |
| 2 | hover | hover wskazuje punkt i aktualizuje tooltip | play step `exercise-hover-focus-tooltip` |
| 3 | focus z klawiatury | focus wskazuje punkt bez myszy | play step `verify-keyboard-only` |
| 4 | selection | punkt lub seria ma stan `aria-pressed` | story + a11y marker |
| 5 | date range | zakres dat jest jawny w metadanych warstwy | story + `dateRangeLabel` |
| 6 | reset | przywraca pełny filtr i pierwszy punkt | play step `exercise-reset` |
| 7 | drill-down | uruchamia przejście w szczegóły z wybranego punktu | play step `exercise-drill-down` |
| 8 | cross-filtering | filtr zawęża kontekst bez zmiany metryki | play step `exercise-filter-change` |
| 9 | focus restoration | akcje przywracają fokus na kontrolkę wywołującą | play step `verify-focus-restoration` |
| 10 | empty points guard | pusta tablica punktów nie crashuje runtime | story + marker `data-state="empty-points"` |

## Anatomia

```text
ChartInteractionLayer
├── group root
├── title and description
├── date range and active filter metadata
├── filter group
├── chart visualization slot
├── tooltip description
├── point selection group
└── optional drill-down action
```

## Komponenty składowe

- `ChartInteractionLayer`
- `ChartFrame`
- owner geometrii wykresu, np. `TrendChart`
- `TextAction` dla resetu i drill-down

15.09 jest warstwą interakcji, a nie nowym silnikiem wykresów. Nie używa raw SVG i nie wprowadza nowej semantyki danych.

## Kontrakt stanu

- Stan kontrolowany obejmuje aktywny filtr i aktywny punkt.
- `points=[]` jest stanem bezpiecznym i pokazuje informację „Brak punktów interakcji”.
- Interakcja może zmienić wskazany rekord, ale nie może przeliczyć definicji metryki ani zmienić sensu danych.
- Reset przywraca pełny zakres i bazowy punkt.
- Drill-down przekazuje bieżący punkt do caller-owned handlera.

## Interakcje i klawiatura

Tab order prowadzi przez filtry, wykres i listę punktów. Enter/Space uruchamiają natywne przyciski. Hover i focus aktualizują tę samą podpowiedź. Po resecie i drill-down runtime zachowuje fokus na kontrolce, która wywołała akcję. Strzałki nie mają specjalnego modelu, bo 15.09 nie deklaruje composite toolbar.

## Responsywność

Warstwa przechodzi z układu wykres + panel do jednej kolumny na mniejszych viewportach. Kontrolki zawijają się bez poziomego scrolla i bez zmiany rozmiaru wykresu przy hover/focus.

## Dostępność

Minimum WCAG 2.2 AA: dostępna nazwa grupy, `aria-pressed` dla selection i filtrów, `aria-describedby` dla punktów, widoczny focus, obsługa keyboard-only, brak informacji zależnej wyłącznie od koloru oraz focus restoration po akcjach.

## Storybook

- Title: `15 Wykresy i dane/Interakcje i filtry`.
- Story: `ChartInteractionsStory`.
- Status: implemented, visible, review.
- Wymagane przypadki: filter change, hover/focus tooltip, point selection, reset, drill-down, focus restoration, empty points guard i niezmieniona semantyka danych.
- Wymagane środowiska: light/dark, desktop/tablet/mobile, zoom 200%, reduced motion.

## Testy i kryteria akceptacji

1. Play story sprawdza hover i focus tooltip bez fałszywych asercji.
2. Play story sprawdza reset, drill-down i focus restoration.
3. `ChartInteractionLayer` nie crashuje przy pustej tablicy `points`.
4. Warstwa używa `role="group"` zamiast `role="toolbar"`, dopóki nie ma pełnego modelu toolbar.
5. Interakcje nie zmieniają znaczenia danych ani ownerstwa 15.03–15.07.
6. Walidacja `pnpm check:analytics-system` potwierdza ownerstwo 15.09.
