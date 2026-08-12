---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-8B85AF5FD2D0
status: approved-target
updated_at: 2026-08-07T08:24:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# ChartFrame

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.01 |
| Nazwa polska | ChartFrame |
| Nazwa techniczna | chartframe |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P0 |
| Właściciel | Analytics UI |
| Moduł | Wykresy i dane — M02 |
| Status implementacji | IMPLEMENTED — ACCEPTED |
| Runtime source of truth | `apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx` |
| Storybook | `15 Wykresy i dane/01 Powierzchnie analityczne/ChartFrame` |
| Handoff | `05.03 → 15.01` |

## Cel i decyzja docelowa

`ChartFrame` jest kanoniczną powierzchnią danych dla pojedynczej dużej wizualizacji analitycznej opartą o zasady powierzchni z 00. Odpowiada za kontekst decyzji, status i świeżość danych, metadane, filtry i akcje, miejsce na wizualizację oraz właściwą legendę wykresu. Panel rekomendacji, narracyjny wniosek, wejście Papa i inne elementy interpretacyjne są osobnymi warstwami canvasu.

Nie jest silnikiem wykresów i nie tworzy osobnego języka powierzchni dla sekcji 15. `TrendChart`, `ComparisonChart`, `ShareChart`, `ForecastChart` i pozostałe rodziny są przekazywane do niego jako gotowa wizualizacja. ChartFrame nie tworzy lokalnych wersji `Button`, `TextAction`, `SegmentedControl`, `DataTable` ani innych kontrolek.

## Ownership

- `15.01` jest jedynym Storybookowym właścicielem pełnego ChartFrame.
- `05.03` zachowuje wyłącznie decision record i handoff; nie renderuje drugiego pełnego ChartFrame.
- rodzaj wykresu pozostaje odpowiedzialnością `15.03–15.07`;
- zachowanie pełnego katalogu stanów danych należy do `15.08`;
- page-level readiness pozostaje w `18.08`.

## Runtime API

Publiczne React Props są własnością `apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx`.

Główne grupy API:

| Obszar | Runtime |
| --- | --- |
| kontekst | `title`, `businessQuestion`, `description` |
| status | `status`, `statusLabel`, `stateMessage`, `stateAction` |
| metadane | `sourceLabel`, `freshnessLabel`, `rangeLabel` |
| kompozycja | `filters`, `actions`, `visualization`, `legend`, `annotation` |
| wniosek | `summary` |
| alternatywa | `alternativeTable`, `alternativeTableLabel` |
| Papa | `papaAction` |

`contracts/components/chartframe.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla ekranów i zdarzeń. Nie jest kopią React Props.

## Anatomia

```text
ChartFrame
├── heading
│  ├── title
│  ├── business question
│  ├── description
│  └── data status
├── metadata
│  ├── source
│  └── freshness
├── toolbar
│  ├── existing filters
│  ├── existing actions
│  └── range/comparison label
├── visualization region
│  ├── caller-owned visualization
│  └── optional legend as the last chart element
├── alternative data table disclosure
└── canvas support rail
   ├── Papa Assistant sidecar
   └── optional recommendation panel
```

## Stany na etapie 15.01

W story 15.01 obowiązkowo pokazywane są reprezentatywne stany:

- `ready` — pełna wizualizacja;
- `partial` — wizualizacja pozostaje dostępna z jawnym statusem ograniczenia;
- `processing` — kontekst pozostaje stabilny, region danych pokazuje loading;
- `noData` — brak wizualizacji, komunikat i działająca akcja recovery.

Pełny katalog `ready / partial / stale / no data / conflict / provider error / processing / unavailable` zostanie domknięty w 15.08 bez tworzenia nowego ChartFrame.



## Powierzchnia danych z 00

Duże wykresy sekcji 15 nie są osadzane bezpośrednio na canvasie. `ChartFrame` jest kanoniczną powierzchnią danych dla dużych wizualizacji i konsumuje tokeny oraz zasady z 00: `--pd-surface-data`, `--pd-surface-panel`, `--pd-separator-subtle` i `--pd-radius-surface`. Lokalny wykres może definiować geometrię serii, ale nie może tworzyć własnej powierzchni ani własnego języka tła.

Przy większej liczbie serii wykres używa rozszerzonej palety `--pd-data-series-1`–`--pd-data-series-10`. Kreskowanie nie służy do odróżniania kolejnych kategorii. Jest dopuszczalne wyłącznie jako dodatkowy sygnał dla semantycznej granicy prognozy, zakresu niepewności lub referencji i zawsze wymaga tekstowej legendy.

## Responsywność

- komponent nie wymusza poziomego scrolla strony;
- toolbar zawija się, zamiast wychodzić poza powierzchnię;
- nagłówek przechodzi w jedną kolumnę na małej szerokości;
- panel rekomendacji i Papa Asystent są prawą szyną canvasu na desktopie i osobnymi blokami pod powierzchnią danych na mobile;
- alternatywna tabela jest ujawniana progresywnie pod wykresem i nie zmienia wysokości Papa Asystenta;
- tabela alternatywna zachowuje własne zasady reflow DataTable bez dodatkowej powierzchni karty.

## Dostępność techniczna

Podstawowy gate dostępności dla tej story obejmuje tylko: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

## Storybook i testy

- Story: `apps/web/src/storybook-next/stories/15-data-visualizations/ChartFrame.stories.tsx`.
- Story korzysta z kanonicznego `StoryPresentation`.
- Pełna kompozycja używa istniejących `SegmentedControl`, `TextAction` i `DataTable`.
- Story pokazuje gotową kompozycję zarówno z filtrem, jak i bez filtra; filtr jest slotem caller-a, nie powierzchnią wewnątrz ChartFrame.
- Wartości walutowe, procentowe i świeżość danych w fixture są formatowane przez Foundation runtime.
- `Tabela danych` konsumuje ikonę `data`, a `Wyjaśnij z Papa` ikonę `assistant` z `00.13`; widoczna etykieta pozostaje nazwą akcji.
- Play test sprawdza akcję Papa, źródła, zmianę filtra, otwarcie alternatywnej tabeli oraz recovery dla `noData`.
- Light/dark, 1440, tablet, mobile i długi copy są elementami odbioru wizualnego.
- Odbiór wizualny sekcji 15 jest zaakceptowany po pełnym skanie 2026-08-11.

## Kryteria akceptacji

1. Runtime komponent jest reużywalny i nie renderuje konkretnej rodziny wykresu.
2. 05.03 nie utrzymuje drugiej pełnej implementacji ChartFrame.
3. Storybook, fixture, registry i dokument wskazują 15.01 jako ownera.
4. Nie istnieje backlogowy duplikat `10 Komponenty/ChartFrame`.
5. `typecheck`, Storybook build, analytics ownership guard oraz `git diff --check` przechodzą.
6. Formalne `accepted` jest potwierdzone po odbiorze wizualnym light/dark i pełnym skanie sekcji 15.

## Doprecyzowanie po kontroli wizualnej — powierzchnia danych

Po kontroli wizualnej wzorcem obowiązującym dla `ChartFrame` jest produktowa powierzchnia danych z 00, zilustrowana układem „Przychód, kampanie i decyzje”. Duży wykres nie może być samodzielnym obiektem na canvasie. Musi być elementem jednej powierzchni danych z nagłówkiem, statusem, metadanymi, obszarem wykresu oraz tabelą, wnioskiem albo listą obserwacji w tej samej strukturze.

Wymagania wizualne:

- `ChartFrame` używa `--pd-surface-data` jako powierzchni bazowej, a nie neutralnego canvasu.
- Obszar wykresu jest regionem wewnętrznym powierzchni danych, nie osobną kartą.
- Legenda pozostaje ostatnim elementem figury wykresu.
- Tabela alternatywna rozwija się pod wykresem bez dodatkowej powierzchni karty i bez zmiany wysokości Papa Asystenta.
- Podsumowanie, rekomendacje i komentarze interpretacyjne pozostają w osobnych warstwach canvasu.
- Długie etykiety nie mogą niszczyć geometrii wykresu; w przypadku korelacji są mapowane do krótkich znaczników w polu wykresu i osobnej listy obserwacji poza powierzchnią danych.
- Kreskowanie nie zastępuje brakujących kolorów serii; pozostaje wyłącznie dla znaczeń semantycznych, takich jak prognoza, referencja, niepewność albo granica zakresu.

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela alternatywna rozwija się pod wykresem bez dodatkowej powierzchni, a prawa szyna canvasu na desktopie utrzymuje stałą wysokość względem powierzchni wykresu.
