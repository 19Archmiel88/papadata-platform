---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Klienci

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-34-01-przeglad"></a>

## Przegląd

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Przegląd” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/przeglad`.
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

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CustomersRecord[]` | Dostarczane przez `customers.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `customers.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CustomersSummary` | Dostarczane przez `customers.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `overviewResult` | `CustomersOverviewReadResult` | Dostarczane przez `customers.overview.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-01.ts`.

### API i akcje
- Odczyt: `customers.overview.read` — `GET /api/v1/customers/przeglad`, `CustomersOverviewReadRequest` → `CustomersOverviewReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-02-segmenty"></a>

## Segmenty

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Segmenty” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/segmenty`.
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
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ChartFrame` | `05-wykresy-i-wizualizacje/komponenty/chartframe.md` | required |
| `TrendChart` | `05-wykresy-i-wizualizacje/komponenty/trendchart.md` | required |
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |
| `CustomerSegments` | `04-komponenty-domenowe/customer-segments.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CustomersRecord[]` | Dostarczane przez `customers.segments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `customers.segments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CustomersSummary` | Dostarczane przez `customers.segments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `segmentsResult` | `CustomersSegmentsReadResult` | Dostarczane przez `customers.segments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-02.ts`.

### API i akcje
- Odczyt: `customers.segments.read` — `GET /api/v1/customers/segmenty`, `CustomersSegmentsReadRequest` → `CustomersSegmentsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-03-kohorty"></a>

## Kohorty

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Kohorty” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/kohorty`.
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
| `CohortMatrix` | `04-komponenty-domenowe/cohort-matrix.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CustomersRecord[]` | Dostarczane przez `customers.cohorts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `customers.cohorts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CustomersSummary` | Dostarczane przez `customers.cohorts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `cohorts` | `CohortView[]` | Dostarczane przez `customers.cohorts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `cohortsResult` | `CustomersCohortsReadResult` | Dostarczane przez `customers.cohorts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-03.ts`.

### API i akcje
- Odczyt: `customers.cohorts.read` — `GET /api/v1/customers/kohorty`, `CustomersCohortsReadRequest` → `CustomersCohortsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-04-szczegoly-pseudonimizowane"></a>

## Szczegóły pseudonimizowane

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Szczegóły pseudonimizowane” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/szczegoly-pseudonimizowane/:resourceId`.
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
| `record` | `CustomersRecord` | Dostarczane przez `customers.pseudonymized-detail.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pseudonymizedDetailResult` | `CustomersPseudonymizedDetailReadResult` | Dostarczane przez `customers.pseudonymized-detail.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-04.ts`.

### API i akcje
- Odczyt: `customers.pseudonymized-detail.read` — `GET /api/v1/customers/szczegoly-pseudonimizowane`, `CustomersPseudonymizedDetailReadRequest` → `CustomersPseudonymizedDetailReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-05-konflikty-tozsamosci"></a>

## Konflikty tożsamości

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Konflikty tożsamości” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/konflikty-tozsamosci`.
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

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CustomersRecord[]` | Dostarczane przez `customers.identity-conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `customers.identity-conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CustomersSummary` | Dostarczane przez `customers.identity-conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `identityConflictsResult` | `CustomersIdentityConflictsReadResult` | Dostarczane przez `customers.identity-conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-05.ts`.

### API i akcje
- Odczyt: `customers.identity-conflicts.read` — `GET /api/v1/customers/konflikty-tozsamosci`, `CustomersIdentityConflictsReadRequest` → `CustomersIdentityConflictsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-06-prywatnosc"></a>

## Prywatność

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Prywatność” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/prywatnosc`.
- Tenant i workspace muszą być rozwiązane przed pobraniem danych.
- Parametry filtrów i rekordu są walidowane przed żądaniem; niedozwolone identyfikatory kończą się bezpiecznym 404/403.
- Zmiana workspace czyści cache zakresu poprzedniego workspace i odtwarza filtr domyślny.

### Anatomia finalnego ekranu
| Region | Kompozycja | Odpowiedzialność |
|---|---|---|
| Nagłówek | PageHeader lub SectionIntro | nazwa, zakres, readiness i akcje zgodne z capability |
| Kontekst | FilterBar / DateRangePicker | filtry zapisane w URL i odtwarzalne po odświeżeniu |
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

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CustomersRecord[]` | Dostarczane przez `customers.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `customers.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CustomersSummary` | Dostarczane przez `customers.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `privacyResult` | `CustomersPrivacyReadResult` | Dostarczane przez `customers.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-06.ts`.

### API i akcje
- Odczyt: `customers.privacy.read` — `GET /api/v1/customers/prywatnosc`, `CustomersPrivacyReadRequest` → `CustomersPrivacyReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-07-analiza-wplywu"></a>

## Analiza wpływu

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Analiza wpływu” w obszarze: klienci pseudonimizowani, segmenty, kohorty i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/customers/analiza-wplywu`.
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
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `CustomersRecord[]` | Dostarczane przez `customers.impact.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `customers.impact.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `CustomersSummary` | Dostarczane przez `customers.impact.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `impactResult` | `CustomersImpactReadResult` | Dostarczane przez `customers.impact.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/34-07.ts`.

### API i akcje
- Odczyt: `customers.impact.read` — `GET /api/v1/customers/analiza-wplywu`, `CustomersImpactReadRequest` → `CustomersImpactReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-34-08-warianty-klientow"></a>

## Warianty klientów

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty klientów”; nie jest samodzielnym routem runtime.

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

Kanoniczny model TypeScript ekranu: `contracts/screens/34-08.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=34.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.
