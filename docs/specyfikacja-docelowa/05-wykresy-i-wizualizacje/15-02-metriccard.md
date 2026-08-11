---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-10-79995BCF3B69
status: approved-target
updated_at: 2026-08-07T08:24:00+02:00
---

# MetricCard

## Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.02 |
| Nazwa polska | MetricCard |
| Nazwa techniczna | metriccard |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UI |
| Moduł | Wykresy i dane — M02 |
| Status implementacji | IMPLEMENTED — ACCEPTED |
| Runtime source of truth | `apps/web/src/design-system/components/MetricCard/MetricCard.tsx` |
| Storybook | `15 Wykresy i dane/01 Powierzchnie analityczne/MetricCard` |
| Handoff | `05.03 → 15.02` |

## Cel i decyzja docelowa

`MetricCard` jest kanoniczną powierzchnią KPI. Pokazuje wartość, jednostkę, porównanie, kierunek trendu, cel lub odchylenie, status danych, źródło, świeżość i opcjonalny mikrotrend. Nie jest małym ChartFrame i nie buduje pełnego dashboardu wewnątrz karty.

## Ownership

- `15.02` jest jedynym Storybookowym właścicielem wariantów KPI i mikrotrendów;
- `05.03` zachowuje wyłącznie decision record i handoff;
- mikrotrend jest prywatną częścią MetricCard na tym etapie i nie tworzy osobnego publicznego `Sparkline`;
- pełne rodziny wykresów należą do `15.03–15.07`;
- pełny katalog stanów analitycznych zostanie domknięty w `15.08`.

## Runtime API

Publiczne React Props są własnością `apps/web/src/design-system/components/MetricCard/MetricCard.tsx`.

Główne grupy API:

| Obszar | Runtime |
| --- | --- |
| identyfikacja | `metricId`, `label` |
| wartość | `value`, `unit` |
| porównanie | `comparison`, `signal` |
| plan | `targetLabel`, `deviationLabel` |
| mikrotrend | `sparklinePoints` |
| status | `status`, `statusLabel`, `stateMessage` |
| metadane | `sourceLabel`, `freshnessLabel`, `definitionChangeLabel` |
| wyróżnienie | `emphasis` |
| akcje | `detailAction`, `papaAction` |

`contracts/components/metriccard.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla view modelu ekranów i zdarzeń. Nie jest kopią React Props.

## Warianty

Warianty są kompozycją pól, nie zestawem sześciu wzajemnie wykluczających się komponentów:

- podstawowy;
- z trendem;
- z celem;
- z odchyleniem;
- z mikrochartem;
- alarmowy lub rekomendacyjny.

`emphasis="alert"` i `emphasis="recommendation"` zmieniają jedynie wagę powierzchni. Znaczenie danych nadal wynika z tekstowego statusu, porównania i sygnału.

## Mikrotrend

Mikrotrend:

- jest dekoracyjnym skrótem trendu;
- nie ma osi, tooltipu ani niezależnego modelu interakcji;
- nie zastępuje tekstowego porównania;
- używa Foundation data/status tokens;
- dla przebiegu płaskiego prowadzi linię przez neutralny środek dostępnej wysokości, zamiast przy dolnej krawędzi;
- nie może rozrosnąć się w drugi ChartFrame.

## Stany na etapie 15.02

Story pokazuje `ready`, `partial`, `stale`, `processing` i `noData`. MetricCard zachowuje nazwę metryki w każdym stanie; gdy wartość nie istnieje, nie renderuje sztucznej liczby.

## Responsywność

- KPI może żyć w siatce, ale sam komponent nie wymusza liczby kolumn;
- długie label i comparison copy zawijają się;
- akcje przechodzą do kolejnego wiersza;
- nie powstaje poziomy scrollbar jako rozwiązanie layoutu.

## Dostępność techniczna

Minimum WCAG 2.2 AA jest obowiązkowym zakresem tej story i każdej następnej. Wymagane są: semantic HTML, accessible name, focus-visible, keyboard-only tam, gdzie dotyczy, reduced motion, reflow/responsywność, brak informacji wyłącznie kolorem oraz tekstowe stany empty/error/loading/no-data. Dla `MetricCard` dodatkowo obowiązuje jawna nazwa KPI i tekstowy status danych.

## Storybook i testy

- Story: `apps/web/src/storybook-next/stories/15-data-visualizations/MetricCard.stories.tsx`.
- Story pokazuje pełny katalog wariantów, stany, light/dark i długi copy.
- `dataState` (`ready`, `partial`, `stale`, `processing`, `noData`) i `emphasis` (`default`, `alert`, `recommendation`) są odrębnymi osiami kontraktu.
- Wartości KPI, procenty i freshness w fixture są formatowane przez Foundation runtime.
- `Szczegóły KPI` konsumują ikonę `data`, a `Wyjaśnij z Papa` ikonę `assistant` z `00.13`; widoczna etykieta pozostaje nazwą akcji.
- Play test uruchamia obie akcje i sprawdza dostępną nazwę sformatowanego KPI.

## Kryteria akceptacji

1. Runtime MetricCard jest reużywalny i nie zależy od Laboratorium.
2. Lokalny `KpiSparkline` z 05.03 zostaje usunięty.
3. Storybook, fixture, registry i dokument wskazują 15.02 jako ownera.
4. Nie istnieje backlogowy duplikat `10 Komponenty/MetricCard`.
5. `typecheck`, Storybook build, analytics ownership guard oraz `git diff --check` przechodzą.
6. Formalne `accepted` jest potwierdzone po odbiorze wizualnym light/dark i pełnym skanie sekcji 15.

## Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
