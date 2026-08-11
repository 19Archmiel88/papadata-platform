---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-14903FD7424D
status: review
updated_at: 2026-08-08T21:09:00+01:00
---

# Struktura i udział

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.05 |
| Nazwa polska | Struktura i udział |
| Nazwa techniczna | struktura-i-udzial |
| Runtime owner | `ShareChart` |
| Source of truth | `apps/web/src/design-system/components/ShareChart/ShareChart.tsx` |
| Storybook | `15 Wykresy i dane/Udziały i struktura` |
| Status implementacji | REVIEW — runtime i story wdrożone, przed odbiorem wizualnym |

## Cel i decyzja docelowa

`ShareChart` jest właścicielem pytań część–całość: jak segmenty składają się na total. Komponent nie zastępuje `ComparisonChart`, `TrendChart`, `DataTable` ani przyszłych interakcji 15.09.

## Zakres runtime

| Wariant | Rola |
| --- | --- |
| `donut` | Mała liczba rozróżnialnych segmentów z widocznym totalem i legendą. |
| `bar` | Czytelne porównanie udziałów segmentów bez przejmowania rankingu ComparisonChart. |
| `stacked` | Kompaktowa struktura 100% z legendą jako tekstowym wyjaśnieniem. |

## Granice ownership

- Porównania kategorii, ranking, benchmark i period comparison należą do `15.04 / ComparisonChart`.
- Czas ciągły należy do `15.03 / TrendChart`.
- Dokładne rekordy, sortowanie i row actions należą do runtime `DataTable` oraz wzorca workflow `18.04`.
- Hover, tooltip, selection, drill-down i cross-filtering należą do `15.09`.
- Pełna macierz stanów danych należy do `15.08`.

## Dostępność

Wykres nie przekazuje znaczenia wyłącznie kolorem. Każdy segment ma tekstową legendę i metadane wartości. Mobile i 200% zoom nie mogą wymuszać poziomego scrolla strony.

## Storybook

- Title: `15 Wykresy i dane/Udziały i struktura`.
- Runtime: `ShareChart`.
- Wymagane widoki: light/dark, 1440 / 768 / 390, 200% zoom, long copy, single segment.
- Status: review do odbioru wizualnego.

## Reguły po odbiorze wizualnym

1. `stacked` z jednym segmentem nie może wyglądać jak primary button. Wariant 100% ma być cienkim wskaźnikiem struktury z obrysem, a nie dużym blokiem CTA.
2. W widoku mobilnym długie etykiety wariantu `bar` układają się nad paskami, żeby pasek zawsze wykorzystywał pełną szerokość dostępnego obszaru.
3. Segmenty donut poniżej 3% są grupowane jako `Pozostałe`. Rozbicie tej grupy przez hover/click należy do `15.09 — Interakcje i filtry`.
4. Paleta `ShareChart` musi mieć zbliżoną luminancję segmentów w dark mode, żeby kolor nie sugerował fałszywej wagi biznesowej.

5. Na mobile legenda używa zwartego układu dwukolumnowego, żeby nie oddzielać nadmiernie wykresu od jego kontekstu.
6. Wykres `bar` na mobile utrzymuje minimalną szerokość części porównawczej: tekst jest ograniczony, a pasek pozostaje głównym nośnikiem proporcji.
7. Oś procentowa w dark mode musi być czytelna z dystansu i nie może zlewać się z tłem.
8. `stacked` używa toru tła, żeby pojedynczy segment 100% był jednoznacznie wskaźnikiem, a nie przyciskiem.

9. Na mobile słupki udziałów układają etykietę nad torem, dzięki czemu każdy pasek startuje ze wspólnego punktu 0% i wykorzystuje pełną szerokość kolumny.
10. Mobile metadata pod wykresami nie używa twardej drabinki dividerów; separację buduje odstęp.
11. Swatche legendy mają obrys i rozmiar wystarczający do identyfikacji segmentu w dark mode.
