---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-EE3E67615F4B
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
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
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

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
| 11 | stable point rows | hover/focus/active nie zmienia wysokości ani szerokości wierszy wyboru punktu | visual assertion `interactive-controls-do-not-reflow-chart` |

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

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

## Storybook

- Title: `15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry`.
- Story: `ChartInteractionsStory`.
- Status: implemented, visible, accepted.
- Wymagane przypadki: filter change, hover/focus tooltip, point selection, reset, drill-down, focus restoration, empty points guard i niezmieniona semantyka danych.
- Wymagane środowiska: light/dark, desktop/tablet/mobile, zoom 200%, reduced motion.

## Testy i kryteria akceptacji

1. Play story sprawdza hover i focus tooltip bez fałszywych asercji.
2. Play story sprawdza reset, drill-down i focus restoration.
3. `ChartInteractionLayer` nie crashuje przy pustej tablicy `points`.
4. Warstwa używa `role="group"` zamiast `role="toolbar"`, dopóki nie ma pełnego modelu toolbar.
5. Interakcje nie zmieniają znaczenia danych ani ownerstwa 15.03–15.07.
6. Walidacja `pnpm check:analytics-system` potwierdza ownerstwo 15.09.
7. Wiersze podpowiedzi danych mają stałą geometrię; zmiana aktywnego punktu nie przesuwa etykiety, wartości ani sąsiednich wierszy.

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
