---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Jakość danych i integralność

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-41-01-centrum-jakosci"></a>

## Centrum jakości

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Centrum jakości” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/centrum-jakosci`.
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
| `DataStatusBanner` | `04-komponenty-domenowe/data-status-banner.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.center.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.center.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.center.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.center.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityCenterResult` | `DataQualityCenterReadResult` | Dostarczane przez `data-quality.center.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-01.ts`.

### API i akcje
- Odczyt: `data-quality.center.read` — `GET /api/v1/data-quality/centrum-jakosci`, `DataQualityCenterReadRequest` → `DataQualityCenterReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-02-zbior-danych"></a>

## Zbiór danych

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Zbiór danych” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/zbior-danych`.
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
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.dataset.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.dataset.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.dataset.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.dataset.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityDatasetResult` | `DataQualityDatasetReadResult` | Dostarczane przez `data-quality.dataset.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-02.ts`.

### API i akcje
- Odczyt: `data-quality.dataset.read` — `GET /api/v1/data-quality/zbior-danych`, `DataQualityDatasetReadRequest` → `DataQualityDatasetReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-03-pochodzenie-danych"></a>

## Pochodzenie danych

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Pochodzenie danych” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/pochodzenie-danych`.
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
| `LineageGraph` | `04-komponenty-domenowe/lineage-graph.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.lineage.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.lineage.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.lineage.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.lineage.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityLineageResult` | `DataQualityLineageReadResult` | Dostarczane przez `data-quality.lineage.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-03.ts`.

### API i akcje
- Odczyt: `data-quality.lineage.read` — `GET /api/v1/data-quality/pochodzenie-danych`, `DataQualityLineageReadRequest` → `DataQualityLineageReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-04-nakladanie-zrodel"></a>

## Nakładanie źródeł

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Nakładanie źródeł” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/nakladanie-zrodel`.
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
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.source-overlap.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.source-overlap.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.source-overlap.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.source-overlap.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualitySourceOverlapResult` | `DataQualitySourceOverlapReadResult` | Dostarczane przez `data-quality.source-overlap.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-04.ts`.

### API i akcje
- Odczyt: `data-quality.source-overlap.read` — `GET /api/v1/data-quality/nakladanie-zrodel`, `DataQualitySourceOverlapReadRequest` → `DataQualitySourceOverlapReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-05-nadrzednosc-zrodla"></a>

## Nadrzędność źródła

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Nadrzędność źródła” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/nadrzednosc-zrodla`.
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
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.source-priority.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.source-priority.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.source-priority.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.source-priority.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualitySourcePriorityResult` | `DataQualitySourcePriorityReadResult` | Dostarczane przez `data-quality.source-priority.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-05.ts`.

### API i akcje
- Odczyt: `data-quality.source-priority.read` — `GET /api/v1/data-quality/nadrzednosc-zrodla`, `DataQualitySourcePriorityReadRequest` → `DataQualitySourcePriorityReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-06-konflikty"></a>

## Konflikty

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Konflikty” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/konflikty`.
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
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityConflictsResult` | `DataQualityConflictsReadResult` | Dostarczane przez `data-quality.conflicts.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-06.ts`.

### API i akcje
- Odczyt: `data-quality.conflicts.read` — `GET /api/v1/data-quality/konflikty`, `DataQualityConflictsReadRequest` → `DataQualityConflictsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-07-przeglad-reczny"></a>

## Przegląd ręczny

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Przegląd ręczny” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/przeglad-reczny`.
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
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.manual-review.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.manual-review.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.manual-review.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.manual-review.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityManualReviewResult` | `DataQualityManualReviewReadResult` | Dostarczane przez `data-quality.manual-review.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-07.ts`.

### API i akcje
- Odczyt: `data-quality.manual-review.read` — `GET /api/v1/data-quality/przeglad-reczny`, `DataQualityManualReviewReadRequest` → `DataQualityManualReviewReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-08-ponowne-przetwarzanie"></a>

## Ponowne przetwarzanie

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Ponowne przetwarzanie” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/ponowne-przetwarzanie`.
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
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.reprocessing.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.reprocessing.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.reprocessing.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.reprocessing.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityReprocessingResult` | `DataQualityReprocessingReadResult` | Dostarczane przez `data-quality.reprocessing.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-08.ts`.

### API i akcje
- Odczyt: `data-quality.reprocessing.read` — `GET /api/v1/data-quality/ponowne-przetwarzanie`, `DataQualityReprocessingReadRequest` → `DataQualityReprocessingReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-09-rekoncyliacja"></a>

## Rekoncyliacja

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Rekoncyliacja” w obszarze: readiness, lineage, konflikty i ręczne rozstrzyganie jakości danych. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/data-quality/rekoncyliacja`.
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
| `ReconciliationPanel` | `04-komponenty-domenowe/reconciliation-panel.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `DataQualityRecord[]` | Dostarczane przez `data-quality.reconciliation.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `data-quality.reconciliation.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `DataQualitySummary` | Dostarczane przez `data-quality.reconciliation.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `diagnostics` | `DiagnosticFinding[]` | Dostarczane przez `data-quality.reconciliation.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `qualityReconciliationResult` | `DataQualityReconciliationReadResult` | Dostarczane przez `data-quality.reconciliation.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/41-09.ts`.

### API i akcje
- Odczyt: `data-quality.reconciliation.read` — `GET /api/v1/data-quality/rekoncyliacja`, `DataQualityReconciliationReadRequest` → `DataQualityReconciliationReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-41-10-warianty-jakosci-danych"></a>

## Warianty jakości danych

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty jakości danych”; nie jest samodzielnym routem runtime.

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

Kanoniczny model TypeScript ekranu: `contracts/screens/41-10.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=41.10`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.
