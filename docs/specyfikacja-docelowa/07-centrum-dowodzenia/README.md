---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Centrum Dowodzenia

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-30-00-one-page"></a>

## Centrum Dowodzenia - landing page

Centrum Dowodzenia jest jednym landing page w trakcie stabilizacji produkcyjnej. Aktywny runtime składa trzy kanoniczne zakresy danych: KPI (`30.03`), Plan vs Benchmark (`30.04`) oraz Drivery wyniku (`30.05`). Numer `30.00` opisuje wyłącznie kompozycję landing page i nie zastępuje identyfikatorów ekranów kanonicznych.

### Aktywny zakres

- Route główny: `/app/command-center`.
- Aktywne kotwice runtime: `#command-section-kpi`, `#command-section-plan`, `#command-section-drivers`.
- Historia pełnej strony: `30 Centrum Dowodzenia/Landing page` -> `30.00 Cały landing page`.
- Historie sekcyjne nie otrzymują nowych identyfikatorów `30.xx`; ich nazwy to `KPI`, `Plan vs Benchmark`, `Drivery wyniku`.
- Kanoniczne identyfikatory pozostają jednoznaczne: `30.01 Widok główny`, `30.02 Kolejka uwagi`, `30.03 KPI`, `30.04 Plan vs wynik`, `30.05 Drivery wyniku`.
- Aktywne komponenty treści: `CommandCenterKpiSection`, `CommandCenterPlanExecutionSection`, `CommandCenterPlanTrajectoryChart`, `CommandCenterDriversSection`.

### Kontrakt danych runtime

- Runtime nie używa fixture'ów ani generatorów demonstracyjnych. Dane demonstracyjne są dozwolone wyłącznie w Storybooku.
- KPI czyta kanoniczne rekordy integracji przez Metric Engine. Brak źródła oznacza stan `unavailable`, a nie wartość zastępczą.
- Zakres dat jest liczony jako lokalny zakres kalendarzowy w timezone przekazanym przez shell.
- `business_time` rekordów kanonicznych wynika z `canonical_payload.occurredAt`; czas synchronizacji jest wyłącznie fallbackiem dla rekordów bez czasu biznesowego.
- Plan vs Benchmark nie udaje zatwierdzonego planu finansowego. Benchmark to średni dzienny przychód z bezpośrednio poprzedniego, równoważnego okresu pomnożony przez `1,08`.
- Prognoza jest jawnie oznaczona jako `linear-run-rate` i wynika z bieżącego tempa realnych obserwacji.
- Drivery przychodu używają dekompozycji `Orders x AOV`. Drivery marketingowe korelują koszt mediów z przypisanym przychodem. Współczynnik i wykres zawsze używają dokładnie tego samego zestawu sparowanych punktów. Przy niewystarczającej próbie nie jest generowany zastępczy współczynnik.
- Landing pobiera trzy jawne kontrakty (`30.03`, `30.04`, `30.05`) i składa je po stronie orkiestracji UI; pojedynczy endpoint nie deklaruje pól spoza własnego schematu.

### Założenia UI i dostępność

- KPI, Plan vs Benchmark i Drivery są sekcjami tego samego landing page.
- Nawigacja po sekcjach korzysta z jednego źródła `commandCenterOnePageSectionIds`.
- `MetricCard` jest konfigurowany wyłącznie przez publiczne props/API; ekran nie styluje jego prywatnych klas potomnych.
- Wykres Planu jest wizualizacją `role=img`; komplet tych samych danych jest dostępny w tabeli rozwijanej przyciskiem.
- Legenda serii pozostaje sterowalna klawiaturą i respektuje `prefers-reduced-motion`.
- Testy a11y Storybooka pozostają włączone; historie landing page nie mogą lokalnie wyłączać test runnera.

### Poza aktywnym zakresem 30.00

- Attention / sygnały decyzyjne.
- Decision Workspace.
- Struktura sprzedaży oraz osobne widoki źródeł, klientów, produktów i lejka.
- Rekomendacje AI bez realnego silnika rekomendacyjnego.
- Waterfall bez realnego modelu wkładów.

Elementy poza zakresem nie mogą wracać do runtime jako hardcoded dane wyglądające na produkcyjne.

<a id="sekcja-30-01-widok-glowny"></a>

## Widok główny

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Widok główny” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/widok-glowny`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `BrandLockup` | `04-komponenty-bazowe/komponenty/brandlockup.md` | required |
| `BrandMark` | `04-komponenty-bazowe/komponenty/brandmark.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |
| `DateRangePicker` | `04-komponenty-bazowe/komponenty/daterangepicker.md` | required |
| `IconButton` | `04-komponenty-bazowe/komponenty/iconbutton.md` | required |
| `StatusBadge` | `04-komponenty-bazowe/komponenty/statusbadge.md` | required |
| `TextAction` | `04-komponenty-bazowe/komponenty/textaction.md` | required |
| `TextArea` | `04-komponenty-bazowe/komponenty/textarea.md` | required |
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerOverviewResult` | `CommandCenterOverviewReadResult` | Dostarczane przez `command-center.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-01.ts`.

### API i akcje
- Odczyt: `command-center.overview.read` — `GET /api/v1/command-center/widok-glowny`, `CommandCenterOverviewReadRequest` → `CommandCenterOverviewReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-02-kolejka-uwagi"></a>

## Kolejka uwagi

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Kolejka uwagi” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/kolejka-uwagi`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.attention.queue.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.attention.queue.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.attention.queue.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerAttentionQueueResult` | `CommandCenterAttentionQueueReadResult` | Dostarczane przez `command-center.attention.queue.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-02.ts`.

### API i akcje
- Odczyt: `command-center.attention.queue.read` — `GET /api/v1/command-center/kolejka-uwagi`, `CommandCenterAttentionQueueReadRequest` → `CommandCenterAttentionQueueReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-03-kpi"></a>

## KPI

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „KPI” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/kpi`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | przychód jako jeden KPI hero, pozostałe KPI jako kompaktowa lista na separatorach, porównania, trend i alternatywa tabelaryczna |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.kpi.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.kpi.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.kpi.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerKpiResult` | `CommandCenterKpiReadResult` | Dostarczane przez `command-center.kpi.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-03.ts`.

### API i akcje
- Odczyt: `command-center.kpi.read` — `GET /api/v1/command-center/kpi`, `CommandCenterKpiReadRequest` → `CommandCenterKpiReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Hierarchia KPI

W układzie KPI przychód jest jedyną kartą o największej głębi. Pozostałe metryki nie powtarzają ciężkich kontenerów; są prezentowane kompaktowo i rozdzielane separatorami. Na mobile kolejność pozostaje: readiness → przychód → pozostałe KPI → działania i szczegóły.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Hierarchia biznesowa KPI

Przychód pozostaje główną powierzchnią hero. Po jego prawej stronie Marża brutto, Zamówienia, ROAS i Konwersja są czterema osobnymi powierzchniami w układzie 2×2 — nie tworzą jednej wspólnej ramy z wewnętrznymi separatorami. Pozostałe KPI schodzą do jednego niższego rzędu na powierzchni tła i są rozdzielane separatorami, bez osobnych kontenerów.

Hero renderuje mikrotrend, metadane źródła i świeżości oraz znacznik zmiany definicji w tym samym układzie co pozostałe warianty `MetricCard`; `depth="hero"` zmienia wyłącznie skalę i powierzchnię, nie zakres prezentowanych informacji.

<a id="sekcja-30-04-plan-vs-wynik"></a>

## Plan vs wynik

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Plan vs wynik” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/plan-vs-wynik`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `FunnelChart` | `05-wykresy-i-wizualizacje/komponenty/funnelchart.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.plan-performance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.plan-performance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.plan-performance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerPlanPerformanceResult` | `CommandCenterPlanPerformanceReadResult` | Dostarczane przez `command-center.plan-performance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-04.ts`.

### API i akcje
- Odczyt: `command-center.plan-performance.read` — `GET /api/v1/command-center/plan-vs-wynik`, `CommandCenterPlanPerformanceReadRequest` → `CommandCenterPlanPerformanceReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-05-drivery-wyniku"></a>

## Drivery wyniku

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Drivery wyniku” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/drivery-wyniku`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.drivers.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.drivers.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.drivers.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerDriversResult` | `CommandCenterDriversReadResult` | Dostarczane przez `command-center.drivers.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-05.ts`.

### API i akcje
- Odczyt: `command-center.drivers.read` — `GET /api/v1/command-center/drivery-wyniku`, `CommandCenterDriversReadRequest` → `CommandCenterDriversReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-06-zrodla-sprzedazy"></a>

## Źródła sprzedaży

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Źródła sprzedaży” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/zrodla-sprzedazy`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.sales-sources.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.sales-sources.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.sales-sources.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerSalesSourcesResult` | `CommandCenterSalesSourcesReadResult` | Dostarczane przez `command-center.sales-sources.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-06.ts`.

### API i akcje
- Odczyt: `command-center.sales-sources.read` — `GET /api/v1/command-center/zrodla-sprzedazy`, `CommandCenterSalesSourcesReadRequest` → `CommandCenterSalesSourcesReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-07-ruch"></a>

## Ruch

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Ruch” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/ruch`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.traffic-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.traffic-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.traffic-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerTrafficSummaryResult` | `CommandCenterTrafficSummaryReadResult` | Dostarczane przez `command-center.traffic-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-07.ts`.

### API i akcje
- Odczyt: `command-center.traffic-summary.read` — `GET /api/v1/command-center/ruch`, `CommandCenterTrafficSummaryReadRequest` → `CommandCenterTrafficSummaryReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-08-produkty"></a>

## Produkty

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Produkty” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/produkty`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-BASE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-base) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.products-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.products-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.products-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerProductsSummaryResult` | `CommandCenterProductsSummaryReadResult` | Dostarczane przez `command-center.products-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-08.ts`.

### API i akcje
- Odczyt: `command-center.products-summary.read` — `GET /api/v1/command-center/produkty`, `CommandCenterProductsSummaryReadRequest` → `CommandCenterProductsSummaryReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-09-klienci"></a>

## Klienci

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Klienci” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/klienci`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.customers-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.customers-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.customers-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerCustomersSummaryResult` | `CommandCenterCustomersSummaryReadResult` | Dostarczane przez `command-center.customers-summary.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-09.ts`.

### API i akcje
- Odczyt: `command-center.customers-summary.read` — `GET /api/v1/command-center/klienci`, `CommandCenterCustomersSummaryReadRequest` → `CommandCenterCustomersSummaryReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-10-lejek"></a>

## Lejek

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Lejek” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/lejek`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FunnelChart` | `05-wykresy-i-wizualizacje/komponenty/funnelchart.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `steps` | `FunnelStepView[]` | Dostarczane przez `command-center.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerFunnelResult` | `CommandCenterFunnelReadResult` | Dostarczane przez `command-center.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-10.ts`.

### API i akcje
- Odczyt: `command-center.funnel.read` — `GET /api/v1/command-center/lejek`, `CommandCenterFunnelReadRequest` → `CommandCenterFunnelReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.10`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-11-rekomendacje-ai-skrot"></a>

## Rekomendacje AI — skrót

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Rekomendacje AI — skrót” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/rekomendacje-ai-skrot`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.ai-recommendations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.ai-recommendations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.ai-recommendations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `recommendations` | `RecommendationView[]` | Dostarczane przez `command-center.ai-recommendations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerAiRecommendationsResult` | `CommandCenterAiRecommendationsReadResult` | Dostarczane przez `command-center.ai-recommendations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-11.ts`.

### API i akcje
- Odczyt: `command-center.ai-recommendations.read` — `GET /api/v1/command-center/rekomendacje-ai-skrot`, `CommandCenterAiRecommendationsReadRequest` → `CommandCenterAiRecommendationsReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.11`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-12-sygnaly-sprzedazowe"></a>

## Sygnały sprzedażowe

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Sygnały sprzedażowe” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/sygnaly-sprzedazowe`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-BASE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-base) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.sales-signals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.sales-signals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.sales-signals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerSalesSignalsResult` | `CommandCenterSalesSignalsReadResult` | Dostarczane przez `command-center.sales-signals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-12.ts`.

### API i akcje
- Odczyt: `command-center.sales-signals.read` — `GET /api/v1/command-center/sygnaly-sprzedazowe`, `CommandCenterSalesSignalsReadRequest` → `CommandCenterSalesSignalsReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.12`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-13-waterfall"></a>

## Waterfall

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Waterfall” w obszarze: poranny przegląd kondycji biznesu, KPI, drivery i decyzje wymagające uwagi. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/command-center/waterfall`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-ANALYTICS](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-analytics) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CommandCenterRecord[]` | Dostarczane przez `command-center.waterfall.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `command-center.waterfall.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CommandCenterSummary` | Dostarczane przez `command-center.waterfall.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `waterfall` | `WaterfallItem[]` | Dostarczane przez `command-center.waterfall.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `centerWaterfallResult` | `CommandCenterWaterfallReadResult` | Dostarczane przez `command-center.waterfall.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-13.ts`.

### API i akcje
- Odczyt: `command-center.waterfall.read` — `GET /api/v1/command-center/waterfall`, `CommandCenterWaterfallReadRequest` → `CommandCenterWaterfallReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.13`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-30-14-warianty-centrum-dowodzenia"></a>

## Warianty Centrum Dowodzenia

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty Centrum Dowodzenia”; nie jest samodzielnym routem runtime.

### Routing i warunki wejścia
> [STD-SCREEN-ROUTE-NONE](../00-zarzadzanie-dokumentacja/README.md#std-screen-route-none) — normatywny.

### Anatomia finalnego ekranu
> [STD-SCREEN-LAYOUT-POLICY](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-policy) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/30-14.ts`.

### API i akcje
Brak endpointu i brak route runtime. Dokument nie może być rejestrowany jako ekran aplikacji ani otrzymać fikcyjnej operacji CRUD.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=30.14`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.
