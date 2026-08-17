---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: runtime-screen
screen_id: 30.00
runtime_surface: yes
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Centrum Dowodzenia — one-page

## Cel użytkownika i granica odpowiedzialności
Użytkownik ocenia całą kondycję biznesu na jednym przewijanym ekranie: od świeżości danych, przez wynik i jego przyczyny, po decyzje do podjęcia i pełny rejestr. Dokumenty 30.01–30.13 opisują **sekcje tego ekranu**, nie osobne trasy runtime; ich kontrakty danych, stany i kryteria akceptacji obowiązują dalej w obrębie odpowiadających im sekcji.

## Routing i warunki wejścia
- Route: `/app/command-center`. Każda ścieżka `/app/command-center/*` oraz `/app` rozwiązuje się do tej samej powierzchni.
- Sekcje są adresowane fragmentem: `#command-section-kpi`, `-plan`, `-sales-costs`, `-traffic-sources`, `-customers`, `-products`, `-funnel`, `-recommendations`, `-records`.
- Aktywna perspektywa piętra „Sprzedaż i koszty” jest adresowalna parametrem `?lens=cost|volume|efficiency` i odtwarzalna po odświeżeniu.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.

## Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Pasek dowodzenia | Button / DateRangePicker | zakres, czas odświeżenia, stan danych oraz akcje „Raport Papa” i „Odśwież dane”; przyklejony do góry kontenera przewijania |
| Pasek sekcji | SectionNavigation | scrollspy po dziewięciu sekcjach; pojawia się przy przewijaniu w dół, chowa przy powrocie do góry |
| Wynik | MetricCard / DataStatusBanner / MorningBrief | jeden KPI hero, cztery powierzchnie priorytetowe 2×2, rząd wspierający, status danych i brief |
| Przyczyny | SegmentedControl / WaterfallChart / ComparisonChart | trzy perspektywy analizy; wybór przebudowuje wykres i kolejność rekomendacji |
| Struktura | ShareChart / ComparisonChart / FunnelChart | mozaika dwukolumnowa: źródła, klienci, produkty, lejek |
| Decyzje | ComparisonChart / InlineNotice | rekomendacje AI z symulacją wpływu, uszeregowane względem aktywnej perspektywy |
| Rejestr | Tabs / DataTable | jeden rejestr na dole z zakładkami KPI / Źródła ruchu / Klienci / Produkty |

## Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |
| `EmptyState` | `04-komponenty-bazowe/komponenty/emptystate.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `SectionNavigation` | `04-komponenty-bazowe/komponenty/sectionnavigation.md` | required |
| `SegmentedControl` | `04-komponenty-bazowe/komponenty/segmentedcontrol.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `FunnelChart` | `05-wykresy-i-wizualizacje/komponenty/funnelchart.md` | required |
| `WaterfallChart` | `05-wykresy-i-wizualizacje/komponenty/waterfallchart.md` | required |
| `DataStatusBanner` | `04-komponenty-domenowe/data-status-banner.md` | required-domain |
| `MorningBrief` | `04-komponenty-domenowe/morning-brief.md` | required-domain |

## Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.overview.read`. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.overview.read`. |
| `sources` | `DataSourceRef[]` | Wejście dla `DataStatusBanner`. |
| `funnelSteps` | `FunnelStepView[]` | Sekcja lejka; brak kroków oznacza stan `empty`, nie zerowy lejek. |
| `recommendations` | `RecommendationView[]` | Sekcja decyzji. Kontrakt nie zawiera odniesienia do metryki, więc powiązanie z KPI jest wnioskowane z treści i nie może być prezentowane jako fakt źródłowy. |
| `centerOverviewResult` | `CommandCenterOverviewReadResult` | Dostarczane przez `command-center.overview.read`. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-01.ts`.

### Braki pokrycia w kontrakcie
Kontrakt nie dostarcza dziś: podziału przychodu na źródła ruchu, segmentacji nowi/powracający, sprzedaży w podziale na produkty ani żadnej serii czasowej. Sekcje zależne od tych danych renderują `EmptyState` z podaniem przyczyny. Wartości nie mogą być domyślane ani wyliczane ze stałych — dopuszczalne są wyłącznie tożsamości na danych obecnych w kontrakcie (AOV = przychód / zamówienia, koszt mediów = przychód / ROAS, koszt zakupu = koszt mediów / zamówienia). Mikrotrend `MetricCard` pozostaje elementem dekoracyjnym zgodnie z `15-02-metriccard.md` i nie jest podstawą wykresu z osiami.

## API i akcje
- Odczyt: `command-center.overview.read` — `GET /api/v1/command-center/widok-glowny`, `CommandCenterOverviewReadRequest` → `CommandCenterOverviewReadResponse`.
- „Odśwież dane” ponawia ten sam odczyt; nie jest osobną operacją domenową.
- „Raport Papa” jest akcją UI bez transportu — otwiera asystenta z kontekstem ekranu.

## Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie, zakres czasu oraz aktywna perspektywa (`lens`) są częścią adresowalnego stanu widoku.
- Perspektywa bez pokrycia w danych jest prezentowana jako nieaktywna z podaniem przyczyny, nie jest usuwana z kontrolki.
- Zmiana perspektywy nie wywołuje odczytu — przebudowuje wyłącznie prezentację.
- Rekomendacje poza aktywną perspektywą są wyciszane i przenoszone niżej, nigdy ukrywane.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

## Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Wyłącznie pierwsze ładowanie: skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `refreshing` | Zmiana zakresu zachowuje poprzednie wartości, wycisza sekcje i ustawia `aria-busy`; wykresy przechodzą do nowych wartości bez zniknięcia. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów i bez utraty perspektywy. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

## Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; mozaika struktury składa się do jednej kolumny poniżej 1180 px; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Pasek sekcji jest dostępny z klawiatury, a przejście do sekcji respektuje `scroll-margin`, żeby nagłówek nie był przysłonięty. Animacje wykresów i pojawianie się paska sekcji są wyłączane przy `prefers-reduced-motion: reduce`. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

## Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

## Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.00`, workspaceId, operationId i readiness; bez wartości PII. Zmiana perspektywy raportowana jest jako `filter_changed` z `lens` w payloadzie.

## Storybook i testy
Story `30 Centrum Dowodzenia/One-page runtime` renderuje `BusinessScreen` w trybie `runtime` na fixture kontraktowym. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji obejmujący: obecność klasy warstwy runtime, `DataStatusBanner`, `MorningBrief`, powierzchnię priorytetową, dziewięć kotwic sekcji i akcje paska dowodzenia.

## Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Żadna prezentowana wartość nie pochodzi ze stałej wpisanej w kod; brak pokrycia kończy się stanem `empty` z przyczyną.
4. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
5. Perspektywa i zakres są odtwarzalne z adresu URL.
6. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.
