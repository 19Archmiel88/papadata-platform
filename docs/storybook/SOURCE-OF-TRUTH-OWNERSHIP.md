# Source of Truth & Ownership — Storybook / Design System

Status: obowiązujący kontrakt architektoniczny.

## Zasada nadrzędna

Każda decyzja ma jednego właściciela. Storybook może demonstrować tę samą decyzję w wielu kontekstach, ale nie może definiować jej ponownie.

Jeżeli po zmianie istnieją dwa miejsca, które mogą być interpretowane jako kanoniczne dla tej samej decyzji, zmiana nie jest gotowa do przyjęcia.

## Hierarchia źródeł prawdy

1. **Fundamenty (`00`)** — tokeny, role semantyczne, powierzchnie, komunikaty i reguły systemowe. Nie utrzymują katalogów domenowych ani pełnych workflow produktu.
2. **Zaakceptowane elementy bazowe (`00.12–00.15`)** — publiczne React API, zachowanie, warianty, stany i katalog elementów bazowych są prezentowane w `00 Fundamenty`. Runtime props pozostają własnością implementacji w `apps/web/src/design-system`.
3. **Wykresy i dane (`15`)** — runtime komponenty analityczne i ich zachowanie: `ChartFrame`, `MetricCard` oraz docelowe rodziny wizualizacji. Nie przejmują bazowych kontrolek z `00.12-00.15`.
4. **Wzorce interfejsu (`18`) i powłoka (`20`)** — kompozycje wielu komponentów i stanów: page patterns, Auth/App shell, workflow tabel i warstw. Workflow tabel należy do `18.04`, a runtime `DataTable` pozostaje współlokowany z implementacją komponentu.
5. **Laboratorium decyzji (`05`)** — tymczasowe miejsce porównania wariantów. Po akceptacji decyzja jest promowana do docelowego ownera. Laboratorium zostaje decision recordem, nie drugim source of truth.
6. **Domena produktu** — konkretne status keys, provider branding, capabilities i słowniki biznesowe.

## Kontrakty TypeScript

`contracts/components/*.ts` są kontraktami orkiestracyjnymi/specyfikacyjnymi dla ekranów, fixture'ów, zdarzeń i planowanej integracji. Nie kopiują i nie zastępują publicznego React API działającego komponentu.

Dla komponentu zaimplementowanego runtime source of truth jest współlokowany z implementacją w `apps/web/src/design-system`. Rejestr runtime API znajduje się w `rejestry/runtime-component-api.csv`.

Jeżeli kontrakt orkiestracyjny i runtime React props różnią się szczegółowością, pierwszeństwo dla działającego komponentu ma implementacja runtime oraz rejestr runtime API. Kontrakt orkiestracyjny może być węższy lub bardziej ogólny, ale nie może przeczyć runtime ownerowi.

## Granice ownership

| Zakres | Właściciel docelowy | Granica |
| --- | --- | --- |
| tony statusów | `00.03/00.04` | Fundament definiuje ton i anatomię; domena definiuje konkretne klucze. Publiczny ton krytyczny to `critical`, nie `danger`. |
| hierarchia powierzchni | `00 / 02 Powierzchnie i komunikaty / Canvas, tło i powierzchnie` | Cztery poziomy powierzchni: canvas, surface, floating, overlay. Domeny nie tworzą prywatnych kart. |
| komunikat w kontekście | `00 / 02 Powierzchnie i komunikaty / Komunikat w kontekście` | Komunikat w kontekście. Nie zastępuje statusu, toasta ani pustego stanu. |
| toast operacyjny | `00 / 02 Powierzchnie i komunikaty / Toast operacyjny` | Krótkotrwały komunikat operacyjny; nie zmienia układu. |
| stany puste, błędy i blokady | `00 / 02 Powierzchnie i komunikaty / Stany puste, błędy i blokady` | Wspólna anatomia stanów ekranowych; domena dostarcza copy i akcję. |
| DataDecisionWorkspace | `18 / DataDecisionWorkspace` | Produktowe użycie powierzchni i komunikatów: dane, rekomendacja, sidecar i toast. Nie definiuje lokalnych wariantów notice/status/toast. |
| separatory i linie | `00.07` | `05.04` jest decision recordem / handoffem. |
| reguły ikon | `00.09` | Geometria, `currentColor`, znaczenie i zasady użycia ikon. |
| pełny katalog ikon | `00.13 / Icon` | Jedyny katalog nazw i wariantów ikon. |
| marka | `00.12 / PapaDataBrand` | Bez publicznego dekoracyjnego glow w bazowym API. |
| Auth canvas | `05.01` do decyzji | Po decyzji handoff do `25 — Access/Auth patterns`. |
| App canvas / shell composition | `05.02` do decyzji | Po decyzji handoff do `20 — Product Shell / AppShell`. |
| MetricCard / mikrotrend KPI | `15.02 / MetricCard` | `05.03` jest decision recordem; nie utrzymuje lokalnego katalogu KPI. |
| ChartFrame | `15.01 / ChartFrame` | Kontener kompozycyjny; konkretne rodziny wykresów należą do `15.03–15.07`. |
| TrendChart | `15.03 / TrendChart` | Line/area oraz actual/plan/previous period/moving average. Recharts jest silnikiem geometrii, ale nie właścicielem semantyki ani chrome `ChartFrame`. |
| ComparisonChart | `15.04 / ComparisonChart` | Bar/grouped/ranking, benchmark i period comparison dla dyskretnych kategorii. Recharts jest silnikiem geometrii. Czas ciągły należy do `TrendChart`, rekordy do `DataTable`, interakcje do `15.09`. |
| ShareChart | `15.05 / ShareChart` | Donut/bar/stacked, part-to-whole i struktura udziałów. Recharts jest silnikiem geometrii. Porównania kategorii należą do `ComparisonChart`, czas do `TrendChart`, rekordy do `DataTable`, interakcje do `15.09`. |
| CorrelationChart | `15.06 / CorrelationChart` | Scatter plot, relationship chart, driver analysis jako `driver hypothesis`, statyczne outlier/cluster indication i copy siły korelacji. Brak sugestii przyczynowości bez dowodu. Pełne data states należą do `15.08`, interakcje do `15.09`, rekordy do `DataTable`. |
| ForecastChart | `15.07 / ForecastChart` | Actual vs forecast split, uncertainty band, confidence, quality i statyczne scenarios. Prognoza nie jest faktem. Runtime nie przejmuje `Tooltip`, hover, selection, drill-down ani cross-filtering. Pełne data states należą do `15.08`, tooltip/hover/selection/drill-down/cross-filtering do `15.09`, finalny pass responsive/a11y do `15.10`. |
| ChartDataState | `15.08 / Stany danych` | Jeden wspólny system stanów dla `ChartFrame` i wizualizacji: loading, empty, no data, partial, stale, delayed, blocked, error i unavailable. Wykresy 15.03–15.07 nie tworzą prywatnych stanów. |
| ChartInteractionLayer | `15.09 / Interakcje i filtry` | Tooltip, hover, focus z klawiatury, wybór punktu/serii, zakres dat, reset, drill-down i cross-filtering. Warstwa interakcji nie zmienia sensu danych ani nie przejmuje geometrii wykresów. |
| Finalny pass sekcji 15 | `15.10 / Responsywność i dostępność` | Quality gate dla desktop/tablet/mobile, light/dark, długich tekstów, legend, kontrastu i alternatywnego opisu danych. Nie dodaje nowych funkcji ani nowych runtime ownerów geometrii. |
| bazowy DataTable | runtime `DataTable` + `18.04` workflow | `05.03` konsumuje go bez lokalnego silnika tabeli i bez własnego katalogu tabel. Workflow tabela + filtry + detail należy do `18.04`. |
| role statusów | `00 / 01 Fundamenty wizualne / Role semantyczne statusów` + `00 / 02 Powierzchnie i komunikaty / Status obiektu` | Fundament definiuje znaczenie tonu; `Status obiektu` jest jedynym UI ownerem badge'a. Domeny mapują własne klucze. |
| Select | runtime `Select` + `00.15` field shell | `05.03` nie utrzymuje `DataSurfaceSelect`; workflow filtrów należy do `18.04`. |
| pozostałe data layers | `15 / 18` zgodnie z rolą | `05.03` zachowuje tylko decyzję do czasu promocji. |
| efekty / głębia | `00.08` po decyzji | `05.05` porównuje warianty, nie tworzy drugiego standardu. |
| command button | `Button` / `00.14` | `<button>`, submit/command. Jedna akcja główna, wspierająca lub destrukcyjna; nie służy do nawigacji tekstowej. |
| lightweight command | `TextAction` / `00.14` | `<button>`, komenda kontekstowa w treści, tabeli, komunikacie albo panelu. Nie zastępuje CTA. |
| navigation | `LinkAction` / `00.14` | `<a href>`, jedyny właściciel nawigacji tekstowej. Nie mutuje danych. |
| icon command | `IconButton` / `00.14` | `<button>`, jawna etykieta i jednoznaczna komenda ikonowa dla gęstych układów. |

## Reguła promocji z Laboratorium

1. Warianty są porównywane w `05`.
2. Podejmowana jest decyzja i wskazywany `target owner`.
3. Reguła, komponent albo pattern jest aktualizowany u target ownera.
4. Dokumentacja target ownera staje się kanoniczna.
5. Lab pozostaje opisem decyzji albo trafia do archiwum; nie może być używane jako alternatywna specyfikacja.

## Wspólna prezentacja Storybooka

Wspólny chrome stron ma jeden source of truth:

- `apps/web/src/storybook-next/presentation/StoryPresentation.tsx`
- `apps/web/src/storybook-next/presentation/story-presentation.css`

Lokalne story mogą dodawać CSS demonstracji, ale nie redefiniują `.pd-f0-page`, `.pd-f0-section` ani produkcyjnych selektorów komponentów bazowych takich jak `Button`, `IconButton`, `TextAction`, `LinkAction`, `DataTable`, `StatusBadge`, `Select` i kontrolki pól.

## Reguła dla nowych prac

Przed dodaniem reguły lub wariantu trzeba wskazać jego ownera.

Zmiana jest gotowa do przyjęcia dopiero wtedy, gdy:

1. ma jednego kanonicznego ownera,
2. nie dubluje decyzji w Laboratorium,
3. nie tworzy drugiego katalogu komponentu,
4. nie redefiniuje publicznego API komponentu poza jego runtime ownerem,
5. aktualizuje dokumentację, rejestr i katalog Storybooka zgodnie z ownership.
