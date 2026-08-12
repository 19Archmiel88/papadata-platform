---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-14903FD7424D
status: accepted
updated_at: 2026-08-08T21:09:00+01:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Udziały i struktura

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.05 |
| Nazwa polska | Udziały i struktura |
| Nazwa techniczna | struktura-i-udzial |
| Runtime owner | `ShareChart` |
| Source of truth | `apps/web/src/design-system/components/ShareChart/ShareChart.tsx` |
| Storybook | `15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura` |
| Status implementacji | ACCEPTED — runtime i story wdrożone, po odbiorze wizualnym |

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

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura`.
- Runtime: `ShareChart`.
- Wymagane widoki: light/dark, 1440 / 768 / 390, 200% zoom, long copy, single segment.
- Status: accepted po odbiorze wizualnym 2026-08-11.

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

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
