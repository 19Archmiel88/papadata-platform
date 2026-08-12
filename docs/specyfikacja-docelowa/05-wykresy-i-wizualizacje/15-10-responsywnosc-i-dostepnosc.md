---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-CB1B6AF6A835
status: approved-target
updated_at: 2026-07-30T10:30:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Responsywność i dostępność

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.10 |
| Nazwa polska | Responsywność i dostępność |
| Nazwa techniczna | responsywnosc-i-dostepnosc |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED QUALITY GATE |
| Status Storybooka | `15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

## Cel i decyzja docelowa

15.10 jest finalnym passem responsive i accessibility dla sekcji 15 po wdrożeniu ownerów 15.01–15.09. Nie dodaje nowych funkcji, nowej geometrii ani nowych runtime ownerów. Ujednolica odbiór wykresów na desktop/tablet/mobile, light/dark, długich tekstach, legendach, kontraście i alternatywnym opisie danych.

## Stan obecny

Storybook `ChartAccessibilityReview` jest wdrożony jako quality gate 15.10. Pokazuje macierz ownerów 15.01–15.09 oraz listę wymagań końcowych: desktop/tablet/mobile, light/dark, długie legendy bez poziomego scrolla, kontrast, alternatywny opis danych i brak nowych funkcji.

## Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | desktop / tablet / mobile | układ czytelny na 1440, 768 i 390 px | story + visual assertion |
| 2 | light / dark | copy, osie, legendy i statusy zachowują kontrast | story + visual assertion |
| 3 | long copy | długie tytuły, legendy i opisy zawijają się bez overlapu | story + `long-copy` |
| 4 | legendy | legenda pozostaje czytelna i nie zasłania danych | story + `legend-readable` |
| 5 | kontrast | mała typografia statusów i akcentów zachowuje czytelność | story + `contrast-copy-present` |
| 6 | alternatywny opis danych | wykres ma tabelę lub opis tekstowy danych | story + `alternative-table-visible` |
| 7 | no new features | finalny pass nie tworzy nowych interakcji ani geometrii | `pnpm check:analytics-system` |
| 8 | owner matrix | ownerzy 15.01–15.09 są jawnie rozdzieleni | story + fixture |

## Anatomia

```text
15.10 quality gate
├── section 15 owner matrix
├── viewport and theme checklist
├── long-copy and legend checks
├── contrast and focus checks
├── alternative data description
└── no-new-features assertion
```

## Komponenty składowe

- `ChartFrame`
- `MetricCard`
- `TrendChart`
- `ComparisonChart`
- `ShareChart`
- `CorrelationChart`
- `ForecastChart`
- `ChartDataState`
- `ChartInteractionLayer`

15.10 nie przejmuje publicznego API tych komponentów. Wskazuje regresje i oczekiwane kryteria odbioru.

## Kontrakt stanu

- 15.10 nie definiuje nowego `dataState`.
- Stan danych pozostaje własnością 15.08.
- Interakcje pozostają własnością 15.09.
- Jeżeli finalny pass ujawni regresję, naprawa ma trafić do właściwego ownera, a nie do lokalnego obejścia w story 15.10.

## Interakcje i klawiatura

15.10 weryfikuje keyboard-only, focus-visible i focus restoration dla ownerów, które mają interakcje. Nie dodaje własnych tooltipów, zoomu, hover ani drill-down.

## Responsywność

Wszystkie wykresy sekcji 15 muszą przejść desktop/tablet/mobile oraz zoom 200% bez poziomego scrolla strony, overlapu tekstu, utraty legendy i utraty alternatywnego odczytu danych.

## Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.



## Kolor i kreskowanie

Dla większej liczby serii danych obowiązuje rozszerzona paleta `--pd-data-series-1`–`--pd-data-series-10`. Kreskowanie nie zastępuje brakującego koloru serii. Może pojawić się tylko jako dodatkowy sygnał semantyczny dla granicy prognozy, przedziału niepewności lub referencji pomocniczej, przy zachowaniu tekstowej legendy i braku informacji zależnej wyłącznie od koloru albo kreski.

## Storybook

- Title: `15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność`.
- Story: `ChartAccessibilityReviewStory`.
- Status: implemented, visible, accepted quality gate.
- Wymagane przypadki: owner matrix 15.01–15.09, desktop/tablet/mobile, light/dark, long copy, legendy, kontrast, alternatywny opis danych, brak nowych funkcji.

## Testy i kryteria akceptacji

1. Story 15.10 potwierdza macierz ownerów 15.01–15.09.
2. Nie pojawia się nowy runtime owner ani nowa funkcja w 15.10.
3. Każdy wykres sekcji 15 ma ścieżkę alternatywnego odczytu danych albo opis.
4. Mobile i zoom 200% nie powodują poziomego scrolla strony.
5. Light/dark zachowują kontrast osi, legend, statusów i opisów.
6. Walidacja `pnpm check:analytics-system` potwierdza quality gate 15.10.

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
