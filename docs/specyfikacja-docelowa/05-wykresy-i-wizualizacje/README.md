---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Wykresy i wizualizacje — system danych i interakcji

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-15-01-chartframe"></a>

## ChartFrame

### Metadane

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

### Cel i decyzja docelowa

`ChartFrame` jest kanoniczną powierzchnią danych dla pojedynczej dużej wizualizacji analitycznej opartą o zasady powierzchni z 00. Odpowiada za kontekst decyzji, status i świeżość danych, metadane, filtry i akcje, miejsce na wizualizację oraz właściwą legendę wykresu. Panel rekomendacji, narracyjny wniosek, wejście Papa i inne elementy interpretacyjne są osobnymi warstwami canvasu.

Nie jest silnikiem wykresów i nie tworzy osobnego języka powierzchni dla sekcji 15. `TrendChart`, `ComparisonChart`, `ShareChart`, `ForecastChart` i pozostałe rodziny są przekazywane do niego jako gotowa wizualizacja. ChartFrame nie tworzy lokalnych wersji `Button`, `TextAction`, `SegmentedControl`, `DataTable` ani innych kontrolek.

### Ownership

- `15.01` jest jedynym Storybookowym właścicielem pełnego ChartFrame.
- `05.03` zachowuje wyłącznie decision record i handoff; nie renderuje drugiego pełnego ChartFrame.
- rodzaj wykresu pozostaje odpowiedzialnością `15.03–15.07`;
- zachowanie pełnego katalogu stanów danych należy do `15.08`;
- page-level readiness pozostaje w `18.08`.

### Runtime API

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

### Anatomia

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

### Stany na etapie 15.01

W story 15.01 obowiązkowo pokazywane są reprezentatywne stany:

- `ready` — pełna wizualizacja;
- `partial` — wizualizacja pozostaje dostępna z jawnym statusem ograniczenia;
- `processing` — kontekst pozostaje stabilny, region danych pokazuje loading;
- `noData` — brak wizualizacji, komunikat i działająca akcja recovery.

Pełny katalog `ready / partial / stale / no data / conflict / provider error / processing / unavailable` zostanie domknięty w 15.08 bez tworzenia nowego ChartFrame.



### Powierzchnia danych z 00

Duże wykresy sekcji 15 nie są osadzane bezpośrednio na canvasie. `ChartFrame` jest kanoniczną powierzchnią danych dla dużych wizualizacji i konsumuje tokeny oraz zasady z 00: `--pd-surface-data`, `--pd-surface-panel`, `--pd-separator-subtle` i `--pd-radius-surface`. Lokalny wykres może definiować geometrię serii, ale nie może tworzyć własnej powierzchni ani własnego języka tła.

Przy większej liczbie serii wykres używa rozszerzonej palety `--pd-data-series-1`–`--pd-data-series-10`. Kreskowanie nie służy do odróżniania kolejnych kategorii. Jest dopuszczalne wyłącznie jako dodatkowy sygnał dla semantycznej granicy prognozy, zakresu niepewności lub referencji i zawsze wymaga tekstowej legendy.

### Responsywność

- komponent nie wymusza poziomego scrolla strony;
- toolbar zawija się, zamiast wychodzić poza powierzchnię;
- nagłówek przechodzi w jedną kolumnę na małej szerokości;
- panel rekomendacji i Papa Asystent są prawą szyną canvasu na desktopie i osobnymi blokami pod powierzchnią danych na mobile;
- alternatywna tabela jest ujawniana progresywnie pod wykresem i nie zmienia wysokości Papa Asystenta;
- tabela alternatywna zachowuje własne zasady reflow DataTable bez dodatkowej powierzchni karty.

### Dostępność techniczna

Podstawowy gate dostępności dla tej story obejmuje tylko: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook i testy

- Story: `apps/web/src/storybook-next/stories/15-data-visualizations/ChartFrame.stories.tsx`.
- Story korzysta z kanonicznego `StoryPresentation`.
- Pełna kompozycja używa istniejących `SegmentedControl`, `TextAction` i `DataTable`.
- Story pokazuje gotową kompozycję zarówno z filtrem, jak i bez filtra; filtr jest slotem caller-a, nie powierzchnią wewnątrz ChartFrame.
- Wartości walutowe, procentowe i świeżość danych w fixture są formatowane przez Foundation runtime.
- `Tabela danych` konsumuje ikonę `data`, a `Wyjaśnij z Papa` ikonę `assistant` z `00.13`; widoczna etykieta pozostaje nazwą akcji.
- Play test sprawdza akcję Papa, źródła, zmianę filtra, otwarcie alternatywnej tabeli oraz recovery dla `noData`.
- Light/dark, 1440, tablet, mobile i długi copy są elementami odbioru wizualnego.
- Odbiór wizualny sekcji 15 jest zaakceptowany po pełnym skanie 2026-08-11.

### Kryteria akceptacji

1. Runtime komponent jest reużywalny i nie renderuje konkretnej rodziny wykresu.
2. 05.03 nie utrzymuje drugiej pełnej implementacji ChartFrame.
3. Storybook, fixture, registry i dokument wskazują 15.01 jako ownera.
4. Nie istnieje backlogowy duplikat `10 Komponenty/ChartFrame`.
5. `typecheck`, Storybook build, analytics ownership guard oraz `git diff --check` przechodzą.
6. Formalne `accepted` jest potwierdzone po odbiorze wizualnym light/dark i pełnym skanie sekcji 15.

### Doprecyzowanie po kontroli wizualnej — powierzchnia danych

Po kontroli wizualnej wzorcem obowiązującym dla `ChartFrame` jest produktowa powierzchnia danych z 00, zilustrowana układem „Przychód, kampanie i decyzje”. Duży wykres nie może być samodzielnym obiektem na canvasie. Musi być elementem jednej powierzchni danych z nagłówkiem, statusem, metadanymi, obszarem wykresu oraz tabelą, wnioskiem albo listą obserwacji w tej samej strukturze.

Wymagania wizualne:

- `ChartFrame` używa `--pd-surface-data` jako powierzchni bazowej, a nie neutralnego canvasu.
- Obszar wykresu jest regionem wewnętrznym powierzchni danych, nie osobną kartą.
- Legenda pozostaje ostatnim elementem figury wykresu.
- Tabela alternatywna rozwija się pod wykresem bez dodatkowej powierzchni karty i bez zmiany wysokości Papa Asystenta.
- Podsumowanie, rekomendacje i komentarze interpretacyjne pozostają w osobnych warstwach canvasu.
- Długie etykiety nie mogą niszczyć geometrii wykresu; w przypadku korelacji są mapowane do krótkich znaczników w polu wykresu i osobnej listy obserwacji poza powierzchnią danych.
- Kreskowanie nie zastępuje brakujących kolorów serii; pozostaje wyłącznie dla znaczeń semantycznych, takich jak prognoza, referencja, niepewność albo granica zakresu.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela alternatywna rozwija się pod wykresem bez dodatkowej powierzchni, a prawa szyna canvasu na desktopie utrzymuje stałą wysokość względem powierzchni wykresu.

<a id="sekcja-15-02-metriccard"></a>

## MetricCard

### Metadane

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

### Cel i decyzja docelowa

`MetricCard` jest kanoniczną powierzchnią KPI. Pokazuje wartość, jednostkę, porównanie, kierunek trendu, cel lub odchylenie, status danych, źródło, świeżość i opcjonalny mikrotrend. Nie jest małym ChartFrame i nie buduje pełnego dashboardu wewnątrz karty.

### Ownership

- `15.02` jest jedynym Storybookowym właścicielem wariantów KPI i mikrotrendów;
- `05.03` zachowuje wyłącznie decision record i handoff;
- mikrotrend jest prywatną częścią MetricCard na tym etapie i nie tworzy osobnego publicznego `Sparkline`;
- pełne rodziny wykresów należą do `15.03–15.07`;
- pełny katalog stanów analitycznych zostanie domknięty w `15.08`.

### Runtime API

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
| prezentacja | `depth`, `density` |
| akcje | `detailAction`, `papaAction` |

`contracts/components/metriccard.ts` pozostaje kontraktem orkiestracyjnym/specyfikacyjnym dla view modelu ekranów i zdarzeń. Nie jest kopią React Props.

### Warianty

Warianty są kompozycją pól, nie zestawem sześciu wzajemnie wykluczających się komponentów:

- podstawowy;
- z trendem;
- z celem;
- z odchyleniem;
- z mikrochartem;
- alarmowy lub rekomendacyjny.

`emphasis="alert"` i `emphasis="recommendation"` zmieniają jedynie wagę powierzchni. Znaczenie danych nadal wynika z tekstowego statusu, porównania i sygnału.

### Głębia i kompaktowość

`depth="hero"` zmienia wyłącznie skalę i powierzchnię karty — nie zawęża zakresu prezentowanych informacji. Hero renderuje ten sam układ podbloków co pozostałe warianty (mikrotrend, benchmarki, metadane, akcje), rozłożony inaczej przez siatkę. Jest zarezerwowane dla jednego najważniejszego KPI w danym układzie, np. przychodu w Centrum Dowodzenia. `depth="flat"` oraz `density="compact"` służą do list wspierających KPI rozdzielanych separatorami. Ten wariant nie tworzy osobnych ciężkich kontenerów i nie konkuruje z metryką główną. W kompaktowej liście status `ready` może zostać wizualnie wyciszony lub pominięty, a stany ograniczające interpretację, np. `partial` i `stale`, pozostają widoczne.

### Mikrotrend

Mikrotrend:

- jest dekoracyjnym skrótem trendu;
- nie ma osi, tooltipu ani niezależnego modelu interakcji;
- nie zastępuje tekstowego porównania;
- używa Foundation data/status tokens;
- dla przebiegu płaskiego prowadzi linię przez neutralny środek dostępnej wysokości, zamiast przy dolnej krawędzi;
- nie może rozrosnąć się w drugi ChartFrame.

### Stany na etapie 15.02

Story pokazuje `ready`, `partial`, `stale`, `processing` i `noData`. MetricCard zachowuje nazwę metryki w każdym stanie; gdy wartość nie istnieje, nie renderuje sztucznej liczby.

### Responsywność

- KPI może żyć w siatce, ale sam komponent nie wymusza liczby kolumn;
- długie label i comparison copy zawijają się;
- akcje przechodzą do kolejnego wiersza;
- nie powstaje poziomy scrollbar jako rozwiązanie layoutu.

### Dostępność techniczna

Podstawowy gate dostępności dla tej story obejmuje tylko: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook i testy

- Story: `apps/web/src/storybook-next/stories/15-data-visualizations/MetricCard.stories.tsx`.
- Story pokazuje pełny katalog wariantów, stany, light/dark, długi copy oraz układ hero + compact flat na separatorach.
- `dataState` (`ready`, `partial`, `stale`, `processing`, `noData`) i `emphasis` (`default`, `alert`, `recommendation`) są odrębnymi osiami kontraktu.
- Wartości KPI, procenty i freshness w fixture są formatowane przez Foundation runtime.
- `Szczegóły KPI` konsumują ikonę `data`, a `Wyjaśnij z Papa` ikonę `assistant` z `00.13`; widoczna etykieta pozostaje nazwą akcji.
- Play test uruchamia obie akcje i sprawdza dostępną nazwę sformatowanego KPI.

### Kryteria akceptacji

1. Runtime MetricCard jest reużywalny i nie zależy od Laboratorium.
2. Lokalny `KpiSparkline` z 05.03 zostaje usunięty.
3. Storybook, fixture, registry i dokument wskazują 15.02 jako ownera.
4. Nie istnieje backlogowy duplikat `10 Komponenty/MetricCard`.
5. `typecheck`, Storybook build, analytics ownership guard oraz `git diff --check` przechodzą.
6. Formalne `accepted` jest potwierdzone po odbiorze wizualnym light/dark i pełnym skanie sekcji 15.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-03-trendy"></a>

## Trendy

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.03 |
| Nazwa polska | Trendy |
| Nazwa techniczna | trendy |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | IMPLEMENTED — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/02 Rodziny wykresów/Trendy`, visible, implemented, accepted |
| Status testów | kontrakt testów i story przechodzą w macierzy sekcji 15 |

### Cel i decyzja docelowa

„Trendy” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | trend przychodu | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | trend zamówień | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | trend marży | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | trend ROAS | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | trend konwersji | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | trend ruchu | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | actual vs previous period. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
trendy
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

### Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

### Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

### Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

### Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Trendy`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: implemented, visible, accepted.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-04-porownania"></a>

## Porównania

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.04 |
| Nazwa polska | Porównania |
| Nazwa techniczna | porownania |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/02 Rodziny wykresów/Porównania`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

### Cel i decyzja docelowa

„Porównania” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | kanały | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | platformy | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | kampanie | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | produkty | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | segmenty klientów | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | okresy | wymagany wariant lub stan | test Storybook + test interakcji |
| 7 | workspace. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
porownania
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

### Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button
- ShareChart
- ComparisonChart
- DetailPanel
- Tabs

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

### Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

### Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

### Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Porównania`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: implemented, visible, accepted.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-05-struktura-i-udzial"></a>

## Udziały i struktura

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.05 |
| Nazwa polska | Udziały i struktura |
| Nazwa techniczna | struktura-i-udzial |
| Runtime owner | `ShareChart` |
| Source of truth | `apps/web/src/design-system/components/ShareChart/ShareChart.tsx` |
| Storybook | `15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura` |
| Status implementacji | ACCEPTED — runtime i story wdrożone, po odbiorze wizualnym |

### Cel i decyzja docelowa

`ShareChart` jest właścicielem pytań część–całość: jak segmenty składają się na total. Komponent nie zastępuje `ComparisonChart`, `TrendChart`, `DataTable` ani przyszłych interakcji 15.09.

### Zakres runtime

| Wariant | Rola |
| --- | --- |
| `donut` | Mała liczba rozróżnialnych segmentów z widocznym totalem i legendą. |
| `bar` | Czytelne porównanie udziałów segmentów bez przejmowania rankingu ComparisonChart. |
| `stacked` | Kompaktowa struktura 100% z legendą jako tekstowym wyjaśnieniem. |

### Granice ownership

- Porównania kategorii, ranking, benchmark i period comparison należą do `15.04 / ComparisonChart`.
- Czas ciągły należy do `15.03 / TrendChart`.
- Dokładne rekordy, sortowanie i row actions należą do runtime `DataTable` oraz wzorca workflow `18.04`.
- Hover, tooltip, selection, drill-down i cross-filtering należą do `15.09`.
- Pełna macierz stanów danych należy do `15.08`.

### Dostępność

Wykres nie przekazuje znaczenia wyłącznie kolorem. Każdy segment ma tekstową legendę i metadane wartości. Mobile i 200% zoom nie mogą wymuszać poziomego scrolla strony.

### Storybook

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura`.
- Runtime: `ShareChart`.
- Wymagane widoki: light/dark, 1440 / 768 / 390, 200% zoom, long copy, single segment.
- Status: accepted po odbiorze wizualnym 2026-08-11.

### Reguły po odbiorze wizualnym

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

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-06-zaleznosci-i-korelacje"></a>

## Zależności i korelacje

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.06 |
| Nazwa polska | Zależności i korelacje |
| Nazwa techniczna | zaleznosci-i-korelacje |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/02 Rodziny wykresów/Zależności i korelacje`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

### Cel i decyzja docelowa

„Zależności i korelacje” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | koszt vs przychód | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | ROAS vs budżet | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | ruch vs zamówienia | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | AOV vs segment | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | marża vs promocja. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
zaleznosci-i-korelacje
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

### Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button
- MetricCard
- ChartFrame
- TrendChart
- ShareChart
- ComparisonChart
- DetailPanel
- Tabs

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

### Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

### Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

### Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Zależności i korelacje`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: implemented, visible, accepted.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

### Doprecyzowanie po kontroli wizualnej — długie etykiety

Wykres korelacji nie może renderować długich nazw kampanii bezpośrednio jako wielowierszowych etykiet w polu wykresu. Długie etykiety mają być przeniesione do listy obserwacji, tabeli albo panelu szczegółów jako osobnej warstwy canvasu poza powierzchnią danych. Pole wykresu może używać krótkich znaczników numerycznych lub krótkich kodów, które jednoznacznie mapują punkt do pełnego opisu w osobnej warstwie canvasu poza polem wykresu.

Ten wzorzec jest obowiązkowy dla regresji długiego tekstu, trybu mobilnego i 200% zoom. Czytelność danych jest ważniejsza niż próba pokazania pełnej nazwy przy każdym punkcie.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-07-prognoza-i-ai"></a>

## Prognoza i AI

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.07 |
| Nazwa polska | Prognoza i AI |
| Nazwa techniczna | prognoza-i-ai |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

### Cel i decyzja docelowa

„Prognoza i AI” jest współdzielonym kontraktem, a nie lokalnym układem jednego ekranu. Wzorzec ma jedną odpowiedzialność, korzysta z fundamentów i komponentów bazowych oraz udostępnia warianty wymagane przez domeny bez kopiowania implementacji.

### Stan obecny


### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | wynik rzeczywisty | wymagany wariant lub stan | test Storybook + test interakcji |
| 2 | prognoza | wymagany wariant lub stan | test Storybook + test interakcji |
| 3 | confidence jako poziom opisowy | wymagany wariant lub stan | test Storybook + test interakcji |
| 4 | ograniczenia danych | wymagany wariant lub stan | test Storybook + test interakcji |
| 5 | scenariusze | wymagany wariant lub stan | test Storybook + test interakcji |
| 6 | rekomendacja. | wymagany wariant lub stan | test Storybook + test interakcji |

### Anatomia

```text
prognoza-i-ai
├── semantic root
├── header or accessible label
├── primary content
├── status / validation region
├── primary action
└── optional secondary actions or metadata
```

### Komponenty składowe

- PageHeader
- DataStatusBanner
- InlineNotice
- Button
- ForecastChart
- EvidencePanel
- RecommendationCard
- DecisionCard

Każdy składnik ma osobny kontrakt w katalogu komponentów. Wzorzec nie zmienia publicznej semantyki komponentu, lecz ustala kolejność, relacje i zarządzanie stanem.

### Kontrakt stanu

- Stan kontrolowany jest używany dla route, filtrów, formularza, selection i overlay.
- Stan asynchroniczny rozróżnia loading, processing, retrying, success, recoverable error i terminal error.
- Read-only, no-access i plan-restricted są osobnymi stanami, nie odmianą disabled.
- Zmiana motywu, języka lub viewportu nie resetuje danych ani procesu.

### Interakcje i klawiatura

Tab order odpowiada hierarchii zadania. Enter/Space uruchamiają natywne kontrolki; Escape zamyka najwyższą warstwę; strzałki są używane wyłącznie w komponentach z modelem composite widget. Focus restore jest obowiązkowy po każdej warstwie.

### Responsywność

Wide może używać kolumn lub detail panelu. Compact przechodzi w jedną kolumnę, zachowuje wszystkie funkcje i przenosi akcje drugorzędne do jawnego overflow. Tabele otrzymują scroll lub widok priorytetowych kolumn, a wykresy — tabelę alternatywną.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI`.
- Wymagane stories: każdy wiersz wymagań, light/dark, PL/EN, desktop/tablet/mobile, keyboard, error i reduced motion.
- Status: implemented, visible, accepted.

### Testy i kryteria akceptacji

1. Wszystkie wymagania mają story i asercję testową.
2. Wzorzec nie tworzy duplikatu komponentu bazowego.
3. Stany błędu i brak dostępu mają recovery albo jednoznaczne zakończenie.
4. Mobile i zoom 200% nie tracą funkcji.
5. Klawiatura oraz focus restore przechodzą play test.
6. Dokument jest linkowany przez co najmniej jeden ekran albo oznaczony jako fundament przyszłego użycia.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-08-stany-danych"></a>

## Stany danych

### Metadane

| Pole | Wartość |
| --- | --- |
| Identyfikator | 15.08 |
| Nazwa polska | Stany danych |
| Nazwa techniczna | stany-danych |
| Typ dokumentu | kontrakt wizualizacji |
| Wersja | 1.0 |
| Status kontraktu | zatwierdzony stan docelowy |
| Priorytet | P1 |
| Właściciel | Analytics UX |
| Moduł | Wykresy i dane — M02 |

| Status implementacji | WDROŻONE W STORYBOOK — ACCEPTED |
| Status Storybooka | `15 Wykresy i dane/03 Stany i interakcje/Stany danych`, visible, implemented, accepted |
| Status testów | kontrakt testów zdefiniowany; odbiór wizualny zaakceptowany po pełnym skanie 2026-08-11 |

### Cel i decyzja docelowa

15.08 jest właścicielem wspólnego języka stanów danych dla wykresów analitycznych. Stan nie należy do pojedynczego wykresu; `ChartFrame` i wizualizacje konsumują jeden runtime `ChartDataState`, dzięki czemu loading, empty, no data, partial data, stale data, delayed, blocked, error i unavailable mają spójną semantykę.

### Stan obecny

Runtime `ChartDataState` jest wdrożony jako owner 15.08 i jest konsumowany przez `ChartFrame`. Storybook pokazuje pełny słownik stanów w jednym miejscu oraz przykład użycia w kontenerze wykresu.

Decyzja nazewnicza dla 15.01/15.02: kanoniczny stan trwającego pobierania to `loading`. `processing` pozostaje wyłącznie legacy aliasem publicznego typu `AnalyticsDataState` i jest normalizowany do `loading`. Analogicznie `conflict` jest aliasem `blocked`, a `providerError` aliasem `error`. Nowe rejestry i dokumenty promują nazwy kanoniczne.

### Zakres i wymagania

| Lp. | Wymaganie | Kontrakt | Dowód odbioru |
| --- | --- | --- | --- |
| 1 | loading | stabilny szkielet i live region bez pustej osi | story + marker `data-chart-data-state="loading"` |
| 2 | empty | filtr nie zwraca wyników; nie jest to awaria | story + tekst stanu pustego |
| 3 | no data | źródło nie ma danych dla zakresu lub metryki | story + brak zastępczej wizualizacji |
| 4 | partial data | wykres może być widoczny z oznaczeniem braków | story + alternatywna tabela |
| 5 | stale data | dane starsze niż próg świeżości | story + status ostrzegawczy |
| 6 | delayed | źródło raportuje opóźnienie | story + status opóźnienia |
| 7 | blocked | dostęp lub policy blokuje odczyt | story + assertive notice |
| 8 | error | błąd wymaga retry albo ścieżki naprawy | story + akcja naprawcza |
| 9 | unavailable | źródło lub usługa czasowo niedostępne | story + stan informacyjny |
| 10 | shared state language | jeden słownik dla ChartFrame i wizualizacji | `pnpm check:analytics-system` |
| 11 | no per-chart states | brak lokalnych wariantów per wykres | `pnpm check:analytics-system` |

### Mapowanie nazw laboratoryjnych

05.03 pozostaje laboratorium decyzji i korzysta z publicznego `AnalyticsDataState`, ale nie jest właścicielem słownika. Mapowanie obowiązujące po 15.08:

| Etykieta w 05.03 lub legacy | Nazwa kanoniczna | Identyfikator techniczny |
| --- | --- | --- |
| ready | ready | `ready` |
| loading | loading | `loading` |
| processing | loading | `processing` jako legacy alias |
| empty | empty | `empty` |
| no data | no data | `noData` |
| partial | partial data | `partial` |
| stale | stale data | `stale` |
| delayed | delayed | `delayed` |
| blocked | blocked | `blocked` |
| conflict | blocked | `conflict` jako legacy alias |
| error | error | `error` |
| provider error | error | `providerError` jako legacy alias |
| unavailable | unavailable | `unavailable` |

### Anatomia

```text
ChartDataState
├── semantic root
├── accessible state name
├── stable message
├── optional action
└── canonical data-state marker
```

### Komponenty składowe

- `ChartDataState`
- `ChartFrame`
- `TrendChart` jako przykład renderowalnych danych
- `DataTable` jako alternatywny odczyt danych
- `TextAction` dla recovery

Każdy składnik ma osobny kontrakt. 15.08 nie tworzy lokalnych stanów dla TrendChart, ComparisonChart, ShareChart, CorrelationChart ani ForecastChart.

### Kontrakt stanu

- Kanoniczne stany 15.08 to `ready`, `loading`, `empty`, `noData`, `partial`, `stale`, `delayed`, `blocked`, `error` i `unavailable`.
- Legacy aliasy `processing`, `conflict` i `providerError` są dozwolone wyłącznie dla kompatybilności publicznego runtime i muszą przejść przez `normalizeAnalyticsDataState()`.
- Stany renderowalne (`ready`, `partial`, `stale`, `delayed`) mogą pokazywać wykres z widocznym statusem.
- Stany nierenderowalne nie pokazują fikcyjnej geometrii ani wartości zero.
- Zmiana motywu, języka lub viewportu nie zmienia semantyki stanu.

### Interakcje i klawiatura

15.08 nie jest ownerem tooltipów, hover, selection, drill-down ani cross-filteringu. Te zachowania przejmuje 15.09. Stany danych muszą jednak mieć dostępną nazwę, poprawny `aria-live` i akcję możliwą do uruchomienia z klawiatury, jeśli recovery istnieje.

### Responsywność

`ChartDataState` zachowuje stabilny układ w `ChartFrame` na desktop/tablet/mobile i przy zoom 200%. Renderowalne stany zachowują alternatywną tabelę danych.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `15 Wykresy i dane/03 Stany i interakcje/Stany danych`.
- Story: `DataStatesStory`.
- Status: implemented, visible, accepted.
- Wymagane warianty: loading, empty, no data, partial data, stale data, delayed, blocked, error i unavailable.
- Wymagane środowiska: light/dark, desktop/tablet/mobile, zoom 200%, reduced motion.

### Testy i kryteria akceptacji

1. Wszystkie stany kanoniczne mają story i marker runtime.
2. `ChartFrame` konsumuje `ChartDataState`, zamiast tworzyć własny system.
3. `processing` jest jawnie traktowany jako legacy alias `loading`, a nie drugi stan kanoniczny.
4. Stany błędu i blokady mają recovery albo jednoznaczne zakończenie.
5. Mobile i zoom 200% nie tracą informacji ani akcji.
6. Walidacja `pnpm check:analytics-system` potwierdza ownerstwo 15.08.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-09-interakcje-i-filtry"></a>

## Interakcje i filtry

### Metadane

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

### Cel i decyzja docelowa

15.09 jest właścicielem wspólnej warstwy interakcji wykresów: tooltip, hover, focus z klawiatury, wybór punktu lub serii, zakres dat, reset, drill-down i cross-filtering. Warstwa wskazuje rekord i filtr, ale nie zmienia definicji danych ani znaczenia serii.

### Stan obecny

Runtime `ChartInteractionLayer` jest wdrożony jako owner 15.09. Storybook pokazuje użycie z `TrendChart`, bo geometria trendu ma już właściciela 15.03. 15.09 nie przejmuje actual/plan, porównań, udziałów, korelacji ani prognozy.

Kontener filtrów używa `role="group"`, nie `role="toolbar"`, ponieważ runtime nie implementuje pełnego composite toolbar keyboard modelu. Kontrolki pozostają natywnymi przyciskami z `aria-pressed`, a focus/hover aktualizują ten sam opis tooltipu.

### Zakres i wymagania

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

### Anatomia

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

### Komponenty składowe

- `ChartInteractionLayer`
- `ChartFrame`
- owner geometrii wykresu, np. `TrendChart`
- `TextAction` dla resetu i drill-down

15.09 jest warstwą interakcji, a nie nowym silnikiem wykresów. Nie używa raw SVG i nie wprowadza nowej semantyki danych.

### Kontrakt stanu

- Stan kontrolowany obejmuje aktywny filtr i aktywny punkt.
- `points=[]` jest stanem bezpiecznym i pokazuje informację „Brak punktów interakcji”.
- Interakcja może zmienić wskazany rekord, ale nie może przeliczyć definicji metryki ani zmienić sensu danych.
- Reset przywraca pełny zakres i bazowy punkt.
- Drill-down przekazuje bieżący punkt do caller-owned handlera.

### Interakcje i klawiatura

Tab order prowadzi przez filtry, wykres i listę punktów. Enter/Space uruchamiają natywne przyciski. Hover i focus aktualizują tę samą podpowiedź. Po resecie i drill-down runtime zachowuje fokus na kontrolce, która wywołała akcję. Strzałki nie mają specjalnego modelu, bo 15.09 nie deklaruje composite toolbar.

### Responsywność

Warstwa przechodzi z układu wykres + panel do jednej kolumny na mniejszych viewportach. Kontrolki zawijają się bez poziomego scrolla i bez zmiany rozmiaru wykresu przy hover/focus.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.

### Storybook

- Title: `15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry`.
- Story: `ChartInteractionsStory`.
- Status: implemented, visible, accepted.
- Wymagane przypadki: filter change, hover/focus tooltip, point selection, reset, drill-down, focus restoration, empty points guard i niezmieniona semantyka danych.
- Wymagane środowiska: light/dark, desktop/tablet/mobile, zoom 200%, reduced motion.

### Testy i kryteria akceptacji

1. Play story sprawdza hover i focus tooltip bez fałszywych asercji.
2. Play story sprawdza reset, drill-down i focus restoration.
3. `ChartInteractionLayer` nie crashuje przy pustej tablicy `points`.
4. Warstwa używa `role="group"` zamiast `role="toolbar"`, dopóki nie ma pełnego modelu toolbar.
5. Interakcje nie zmieniają znaczenia danych ani ownerstwa 15.03–15.07.
6. Walidacja `pnpm check:analytics-system` potwierdza ownerstwo 15.09.
7. Wiersze podpowiedzi danych mają stałą geometrię; zmiana aktywnego punktu nie przesuwa etykiety, wartości ani sąsiednich wierszy.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.

<a id="sekcja-15-10-responsywnosc-i-dostepnosc"></a>

## Responsywność i dostępność

### Metadane

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

### Cel i decyzja docelowa

15.10 jest finalnym passem responsive i accessibility dla sekcji 15 po wdrożeniu ownerów 15.01–15.09. Nie dodaje nowych funkcji, nowej geometrii ani nowych runtime ownerów. Ujednolica odbiór wykresów na desktop/tablet/mobile, light/dark, długich tekstach, legendach, kontraście i alternatywnym opisie danych.

### Stan obecny

Storybook `ChartAccessibilityReview` jest wdrożony jako quality gate 15.10. Pokazuje macierz ownerów 15.01–15.09 oraz listę wymagań końcowych: desktop/tablet/mobile, light/dark, długie legendy bez poziomego scrolla, kontrast, alternatywny opis danych i brak nowych funkcji.

### Zakres i wymagania

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

### Anatomia

```text
15.10 quality gate
├── section 15 owner matrix
├── viewport and theme checklist
├── long-copy and legend checks
├── contrast and focus checks
├── alternative data description
└── no-new-features assertion
```

### Komponenty składowe

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

### Kontrakt stanu

- 15.10 nie definiuje nowego `dataState`.
- Stan danych pozostaje własnością 15.08.
- Interakcje pozostają własnością 15.09.
- Jeżeli finalny pass ujawni regresję, naprawa ma trafić do właściwego ownera, a nie do lokalnego obejścia w story 15.10.

### Interakcje i klawiatura

15.10 weryfikuje keyboard-only, focus-visible i focus restoration dla ownerów, które mają interakcje. Nie dodaje własnych tooltipów, zoomu, hover ani drill-down.

### Responsywność

Wszystkie wykresy sekcji 15 muszą przejść desktop/tablet/mobile oraz zoom 200% bez poziomego scrolla strony, overlapu tekstu, utraty legendy i utraty alternatywnego odczytu danych.

### Dostępność

Podstawowy gate dostępności: Contrast, Keyboard, Focus, Forms, Semantics, ARIA, Alt text, Error states.



### Kolor i kreskowanie

Dla większej liczby serii danych obowiązuje rozszerzona paleta `--pd-data-series-1`–`--pd-data-series-10`. Kreskowanie nie zastępuje brakującego koloru serii. Może pojawić się tylko jako dodatkowy sygnał semantyczny dla granicy prognozy, przedziału niepewności lub referencji pomocniczej, przy zachowaniu tekstowej legendy i braku informacji zależnej wyłącznie od koloru albo kreski.

### Storybook

- Title: `15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność`.
- Story: `ChartAccessibilityReviewStory`.
- Status: implemented, visible, accepted quality gate.
- Wymagane przypadki: owner matrix 15.01–15.09, desktop/tablet/mobile, light/dark, long copy, legendy, kontrast, alternatywny opis danych, brak nowych funkcji.

### Testy i kryteria akceptacji

1. Story 15.10 potwierdza macierz ownerów 15.01–15.09.
2. Nie pojawia się nowy runtime owner ani nowa funkcja w 15.10.
3. Każdy wykres sekcji 15 ma ścieżkę alternatywnego odczytu danych albo opis.
4. Mobile i zoom 200% nie powodują poziomego scrolla strony.
5. Light/dark zachowują kontrast osi, legend, statusów i opisów.
6. Walidacja `pnpm check:analytics-system` potwierdza quality gate 15.10.

### Zasada canvasu i warstw interpretacyjnych

Dla całej sekcji 15 obowiązuje rozdzielenie powierzchni danych od warstw pomocniczych i interpretacyjnych. Powierzchnia danych zawiera wyłącznie bezpośrednią wizualizację danych: wykres, właściwą legendę, źródło, zakres, świeżość i status danych. Alternatywne tabele, listy obserwacji, opisowe legendy, scenariusze, horyzont, pewność, jakość predykcji, podpowiedzi, wnioski, rekomendacje, sidecary, overlaye, toasty i komentarze interpretacyjne są osobnymi warstwami na głównym canvasie, z własną głębią i statusem. Nie są częścią obszaru wykresu.

#### Fizyczne kryterium akceptacji wizualnej

Warstwy pomocnicze i interpretacyjne muszą być fizycznie poza powierzchnią danych. Wariant jest niezaakceptowany, jeżeli podpowiedź, wniosek, rekomendacja, alert, ryzyko, komentarz interpretacyjny, lista obserwacji, opisowa legenda, scenariusz, horyzont, pewność albo jakość predykcji siedzi jako boczny lub dolny panel tej samej ramy wykresu. Tabela danych może rozwinąć się płasko pod wykresem bez dodatkowej powierzchni i bez wpływu na wysokość Papa Asystenta. Dopuszczalne układy dla warstw interpretacyjnych to prawa szyna canvasu o czytelnej szerokości na desktopie oraz osobna warstwa pod powierzchnią danych na węższych viewportach.
