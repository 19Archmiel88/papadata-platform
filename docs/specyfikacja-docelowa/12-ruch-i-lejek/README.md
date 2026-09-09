---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Ruch i lejek

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-35-01-przeglad-ruchu"></a>

## Przegląd ruchu

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Przegląd ruchu” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/przeglad-ruchu`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | metryki, porównania, trend i alternatywa tabelaryczna |
| Rejestr danych | DataTable lub komponent domenowy | sortowanie, filtrowanie, paginacja i otwieranie rekordu |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |
| `Pagination` | `04-komponenty-bazowe/komponenty/pagination.md` | required |
| `DetailPanel` | `04-komponenty-bazowe/komponenty/detailpanel.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ChartFrame` | `05-wykresy-i-wizualizacje/komponenty/chartframe.md` | required |
| `TrendChart` | `05-wykresy-i-wizualizacje/komponenty/trendchart.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `overviewResult` | `TrafficOverviewReadResult` | Dostarczane przez `traffic.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-01.ts`.

### API i akcje
- Odczyt: `traffic.overview.read` — `GET /api/v1/traffic/przeglad-ruchu`, `TrafficOverviewReadRequest` → `TrafficOverviewReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-02-kanaly"></a>

## Kanały

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Kanały” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/kanaly`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | metryki, porównania, trend i alternatywa tabelaryczna |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.channels.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.channels.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.channels.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `channelsResult` | `TrafficChannelsReadResult` | Dostarczane przez `traffic.channels.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-02.ts`.

### API i akcje
- Odczyt: `traffic.channels.read` — `GET /api/v1/traffic/kanaly`, `TrafficChannelsReadRequest` → `TrafficChannelsReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-03-lejek-widok"></a>

## Lejek — widok

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Lejek — widok” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/lejek-widok`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | metryki, porównania, trend i alternatywa tabelaryczna |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FunnelChart` | `05-wykresy-i-wizualizacje/komponenty/funnelchart.md` | required |
| `DetailPanel` | `04-komponenty-bazowe/komponenty/detailpanel.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `SalesFunnel` | `04-komponenty-domenowe/sales-funnel.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `steps` | `FunnelStepView[]` | Dostarczane przez `traffic.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `funnelResult` | `TrafficFunnelReadResult` | Dostarczane przez `traffic.funnel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-03.ts`.

### API i akcje
- Odczyt: `traffic.funnel.read` — `GET /api/v1/traffic/lejek-widok`, `TrafficFunnelReadRequest` → `TrafficFunnelReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-04-lejek-szczegoly-kroku"></a>

## Lejek — szczegóły kroku

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Lejek — szczegóły kroku” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/lejek-szczegoly-kroku/:resourceId`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | metryki, porównania, trend i alternatywa tabelaryczna |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |
| `FunnelChart` | `05-wykresy-i-wizualizacje/komponenty/funnelchart.md` | required |
| `DetailPanel` | `04-komponenty-bazowe/komponenty/detailpanel.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `FunnelStep` | `04-komponenty-domenowe/funnel-step.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.funnel-step.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.funnel-step.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.funnel-step.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `steps` | `FunnelStepView[]` | Dostarczane przez `traffic.funnel-step.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `funnelStepResult` | `TrafficFunnelStepReadResult` | Dostarczane przez `traffic.funnel-step.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-04.ts`.

### API i akcje
- Odczyt: `traffic.funnel-step.read` — `GET /api/v1/traffic/lejek-szczegoly-kroku`, `TrafficFunnelStepReadRequest` → `TrafficFunnelStepReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-05-definicje-lejka"></a>

## Definicje lejka

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Definicje lejka” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/definicje-lejka`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | metryki, porównania, trend i alternatywa tabelaryczna |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ChartFrame` | `05-wykresy-i-wizualizacje/komponenty/chartframe.md` | required |
| `TrendChart` | `05-wykresy-i-wizualizacje/komponenty/trendchart.md` | required |
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.funnel-definitions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.funnel-definitions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.funnel-definitions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `steps` | `FunnelStepView[]` | Dostarczane przez `traffic.funnel-definitions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `funnelDefinitionsResult` | `TrafficFunnelDefinitionsReadResult` | Dostarczane przez `traffic.funnel-definitions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-05.ts`.

### API i akcje
- Odczyt: `traffic.funnel-definitions.read` — `GET /api/v1/traffic/definicje-lejka`, `TrafficFunnelDefinitionsReadRequest` → `TrafficFunnelDefinitionsReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-06-ga4-vs-zamowienia"></a>

## GA4 vs zamówienia

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „GA4 vs zamówienia” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/ga4-vs-zamowienia`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `DetailPanel` | `04-komponenty-bazowe/komponenty/detailpanel.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.ga4-orders.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.ga4-orders.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.ga4-orders.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `ga4OrdersResult` | `TrafficGa4OrdersReadResult` | Dostarczane przez `traffic.ga4-orders.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-06.ts`.

### API i akcje
- Odczyt: `traffic.ga4-orders.read` — `GET /api/v1/traffic/ga4-vs-zamowienia`, `TrafficGa4OrdersReadRequest` → `TrafficGa4OrdersReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-07-jakosc-zdarzen"></a>

## Jakość zdarzeń

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Jakość zdarzeń” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/jakosc-zdarzen`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.event-quality.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.event-quality.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.event-quality.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `traffic.event-quality.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `eventQualityResult` | `TrafficEventQualityReadResult` | Dostarczane przez `traffic.event-quality.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-07.ts`.

### API i akcje
- Odczyt: `traffic.event-quality.read` — `GET /api/v1/traffic/jakosc-zdarzen`, `TrafficEventQualityReadRequest` → `TrafficEventQualityReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-08-strony-wejscia"></a>

## Strony wejścia

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Strony wejścia” w obszarze: ruch, kanały, zdarzenia, strony wejścia i lejek. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/traffic/strony-wejscia`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Analiza | komponenty analityczne | metryki, porównania, trend i alternatywa tabelaryczna |
| Dowody i stan | DataStatusBanner / EvidencePanel | świeżość, pochodzenie, confidence i ograniczenia |
| Akcje | Button / ApprovalPanel / Dialog | tylko operacje dozwolone capability; mutacje z potwierdzeniem i idempotency key |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `TrafficRecord[]` | Dostarczane przez `traffic.landing-pages.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `traffic.landing-pages.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `TrafficSummary` | Dostarczane przez `traffic.landing-pages.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `landingPagesResult` | `TrafficLandingPagesReadResult` | Dostarczane przez `traffic.landing-pages.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-08.ts`.

### API i akcje
- Odczyt: `traffic.landing-pages.read` — `GET /api/v1/traffic/strony-wejscia`, `TrafficLandingPagesReadRequest` → `TrafficLandingPagesReadResponse`.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-35-09-warianty-ruchu"></a>

## Warianty ruchu

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty ruchu”; nie jest samodzielnym routem runtime.

### Routing i warunki wejścia
- Route: brak.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
| Reguły wariantów | dokument policy | macierz warunków i rekomendowane użycie |
| Przykłady | Storybook backlog | przykłady poprawne i błędne |

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/35-09.ts`.

### API i akcje
Brak endpointu i brak route runtime. Dokument nie może być rejestrowany jako ekran aplikacji ani otrzymać fikcyjnej operacji CRUD.

### Reguły biznesowe i interakcje
- Odczyt nie może zmieniać stanu domeny. Mutacja wymaga capability write, potwierdzenia adekwatnego do ryzyka i audit eventu.
- Filtry, sortowanie i zakres czasu są częścią adresowalnego stanu widoku.
- Otwarcie szczegółu zachowuje kontekst powrotu; overlay przywraca focus do elementu wywołującego.
- Eksport istnieje wyłącznie wtedy, gdy ma osobne operationId i respektuje maskowanie, role oraz retencję.

### Stany
| Stan | Zachowanie |
|---|---|
| `ready` | Dane kompletne; wszystkie dozwolone akcje aktywne. |
| `loading` | Skeleton zachowuje układ i nie pokazuje fałszywych zer. |
| `empty` | Wyjaśnienie, dlaczego brak danych, oraz konkretna akcja uzyskania danych. |
| `partial` | Widoczne źródła braków; obliczenia nie udają pełnej pewności. |
| `stale` | Znacznik czasu i wpływ nieświeżości na decyzję. |
| `error` | ApiProblem z correlationId, bez utraty filtrów. |
| `forbidden` | Informacja o wymaganym capability bez ujawnienia danych. |
| `offline` | Dane cache oznaczone jako historyczne; mutacje zablokowane. |

### Responsywność i dostępność
Desktop używa siatki 12-kolumnowej; tablet redukuje zestawienie do 2 kolumn; mobile prezentuje kolejność: readiness → najważniejszy wynik → działania → szczegóły. Tabele mają tryb przewijania lub listy kart bez utraty pól. Wykresy mają tabelę danych, opis trendu i oznaczenia inne niż kolor. Wszystkie akcje są dostępne z klawiatury, a fokus nie jest przenoszony bez intencji użytkownika.

### Bezpieczeństwo i prywatność
- Zapytania zawsze zawierają zweryfikowany tenant/workspace z sesji, nie z samego parametru klienta.
- PII jest maskowane albo pseudonimizowane zgodnie z rolą.
- Błędy nie ujawniają rekordów z innego tenanta.
- Mutacje rejestrują actor, operationId, resource IDs, wynik i correlationId bez sekretów.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=35.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.
