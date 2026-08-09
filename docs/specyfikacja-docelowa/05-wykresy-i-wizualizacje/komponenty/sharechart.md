---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: review
document_type: component-contract
component_id: ShareChart
---

# ShareChart

## Cel i odpowiedzialność

`ShareChart` został promowany do runtime ownera `15.05 — Struktura i udział`.

Runtime source of truth:

`apps/web/src/design-system/components/ShareChart/ShareChart.tsx`

Kontrakt w `contracts/components/sharechart.ts` pozostaje kontraktem orkiestracyjnym dla fixture'ów, ekranów i przepływów. Nie zastępuje publicznego React API runtime.

## Kanoniczne warianty

- Wariant `donut` — mała liczba segmentów w relacji część–całość.
- Wariant `bar` — lista udziałów jako poziome share rows.
- Wariant `stacked` — kompaktowa struktura 100%.

## Granice

`ShareChart` nie przejmuje porównań, trendów, tabel ani interakcji. Te zakresy pozostają odpowiednio w `ComparisonChart`, `TrendChart`, `DataTable` i `15.09`.

## Konsumenci

- `30.04` — Plan vs wynik
- `30.05` — Drivery wyniku
- `30.06` — Źródła sprzedaży
- `30.07` — Ruch
- `30.09` — Klienci
- `31.03` — Szczegóły kampanii
- `31.04` — Atrybucja i sprzedaż
- `32.01` — Przegląd
- `33.02` — Katalog
- `33.03` — Szczegóły
- `33.06` — Wydajność
- `34.02` — Segmenty
- `34.07` — Analiza wpływu
- `35.02` — Kanały
- `35.04` — Lejek — szczegóły kroku
- `35.08` — Strony wejścia
- `41.05` — Nadrzędność źródła
- `50.06` — Dowody
- `50.08` — Laboratorium AI

## Kryteria akceptacji

1. Runtime i story istnieją w sekcji `15`.
2. Legacy owner `10 Komponenty/ShareChart` nie jest drugim źródłem prawdy.
3. Wykres przechodzi light/dark, 1440 / 768 / 390, 200% zoom i long copy.
4. Znaczenie segmentu nie zależy wyłącznie od koloru.

## Reguły wizualne po odbiorze 15.05

- Jednolity `stacked` 100% jest wskaźnikiem struktury, nie przyciskiem.
- Długie etykiety na mobile przechodzą nad słupki.
- Donut grupuje segmenty poniżej 3% jako `Pozostałe`.
- Rozwinięcie `Pozostałe` przez interakcję należy do 15.09.
- ShareChart używa lokalnie zbalansowanej luminancji kolorów udziałów bez zmiany globalnych tokenów danych.

## Minimalna przestrzeń paska

W wariancie `bar` przy wąskim kontenerze etykieta nie może zabierać przestrzeni porównawczej. Układ mobile ogranicza tekst i zachowuje pasek jako główny obiekt porównania.

## Track background

Wariant `stacked`, szczególnie przy pojedynczym segmencie 100%, musi mieć subtelny tor tła i obrys. Dzięki temu wskaźnik nie wygląda jak primary button ani separator.

## Mobile bar layout

W wąskim kontenerze `bar` układa etykietę nad paskiem, a nie obok niego. Pozwala to zachować wspólną oś 0% i pełną szerokość porównawczą nawet dla długich nazw segmentów.

## Mobile metadata

Metadata pod wykresem nie może tworzyć gęstej drabinki dividerów. W mobile separację buduje odstęp, a nie każdorazowa linia.

## Swatches

Znaczniki kolorów mają widoczny obrys i rozmiar umożliwiający szybkie powiązanie z segmentem także w dark mode.
