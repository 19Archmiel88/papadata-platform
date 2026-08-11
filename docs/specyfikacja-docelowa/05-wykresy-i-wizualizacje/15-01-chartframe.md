---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-8B85AF5FD2D0
status: approved-target
updated_at: 2026-08-07T08:24:00+02:00
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
| Moduł | Wykresy i wizualizacje danych — M02 |
| Status implementacji | IMPLEMENTED — REVIEW |
| Runtime source of truth | `apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx` |
| Storybook | `15 Wykresy i dane/ChartFrame` |
| Handoff | `05.03 → 15.01` |

## Cel i decyzja docelowa

`ChartFrame` jest kanonicznym kontenerem pojedynczej wizualizacji analitycznej. Odpowiada za kontekst decyzji, status i świeżość danych, metadane, filtry i akcje, miejsce na wizualizację, legendę, adnotację, narracyjny wniosek oraz alternatywną reprezentację tabelaryczną.

Nie jest silnikiem wykresów. `TrendChart`, `ComparisonChart`, `ShareChart`, `ForecastChart` i pozostałe rodziny są przekazywane do niego jako gotowa wizualizacja. ChartFrame nie tworzy lokalnych wersji `Button`, `TextAction`, `SegmentedControl`, `DataTable` ani innych kontrolek.

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
│   ├── title
│   ├── business question
│   ├── description
│   └── data status
├── metadata
│   ├── source
│   └── freshness
├── toolbar
│   ├── existing filters
│   ├── existing actions
│   └── range/comparison label
├── visualization region
│   ├── caller-owned visualization
│   ├── optional annotation
│   └── optional legend
├── narrative summary
├── alternative data table disclosure
└── optional Papa action
```

## Stany na etapie 15.01

W story 15.01 obowiązkowo pokazywane są reprezentatywne stany:

- `ready` — pełna wizualizacja;
- `partial` — wizualizacja pozostaje dostępna z jawnym statusem ograniczenia;
- `processing` — kontekst pozostaje stabilny, region danych pokazuje loading;
- `noData` — brak wizualizacji, komunikat i działająca akcja recovery.

Pełny katalog `ready / partial / stale / no data / conflict / provider error / processing / unavailable` zostanie domknięty w 15.08 bez tworzenia nowego ChartFrame.

## Responsywność

- komponent nie wymusza poziomego scrolla strony;
- toolbar zawija się, zamiast wychodzić poza powierzchnię;
- nagłówek przechodzi w jedną kolumnę na małej szerokości;
- adnotacja przestaje być warstwą absolutną na mobile i wchodzi do normalnego flow;
- alternatywna tabela jest ujawniana progresywnie i zachowuje własne zasady reflow DataTable.

## Dostępność techniczna

Formalne WCAG AA nie jest bramą biznesową tego etapu. Nadal wymagane są poprawna semantyka, działające kontrolki, nazwy regionów/interakcji, obsługa klawiatury istniejących kontrolek oraz brak martwych CTA.

## Storybook i testy

- Story: `apps/web/src/storybook-next/stories/15-data-visualizations/ChartFrame.stories.tsx`.
- Story korzysta z kanonicznego `StoryPresentation`.
- Pełna kompozycja używa istniejących `SegmentedControl`, `TextAction` i `DataTable`.
- Story pokazuje gotową kompozycję zarówno z filtrem, jak i bez filtra; filtr jest slotem caller-a, nie powierzchnią wewnątrz ChartFrame.
- Wartości walutowe, procentowe i świeżość danych w fixture są formatowane przez Foundation runtime.
- `Tabela danych` konsumuje ikonę `data`, a `Wyjaśnij z Papa` ikonę `assistant` z `00.13`; widoczna etykieta pozostaje nazwą akcji.
- Play test sprawdza akcję Papa, źródła, zmianę filtra, otwarcie alternatywnej tabeli oraz recovery dla `noData`.
- Light/dark, 1440, tablet, mobile i długi copy są elementami odbioru wizualnego.

## Kryteria akceptacji

1. Runtime komponent jest reużywalny i nie renderuje konkretnej rodziny wykresu.
2. 05.03 nie utrzymuje drugiej pełnej implementacji ChartFrame.
3. Storybook, fixture, registry i dokument wskazują 15.01 jako ownera.
4. Nie istnieje backlogowy duplikat `10 Komponenty/ChartFrame`.
5. `typecheck`, Storybook build, analytics ownership guard oraz `git diff --check` przechodzą.
6. Formalne `accepted` następuje dopiero po odbiorze wizualnym light/dark.
