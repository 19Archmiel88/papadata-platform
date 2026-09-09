---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Papa Asystent i Laboratorium AI

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-50-01-panel-kontekstowy-papa"></a>

## Panel kontekstowy Papa

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Panel kontekstowy Papa” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/panel-kontekstowy-papa`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.context-panel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.context-panel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.context-panel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `contextPanelResult` | `PapaContextPanelReadResult` | Dostarczane przez `papa.context-panel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-01.ts`.

### API i akcje
- Odczyt: `papa.context-panel.read` — `GET /api/v1/papa/panel-kontekstowy-papa`, `PapaContextPanelReadRequest` → `PapaContextPanelReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-02-assistantshell"></a>

## AssistantShell

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „AssistantShell” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/assistantshell`.
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
| `records` | `PapaRecord[]` | Dostarczane przez `papa.assistant-shell.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.assistant-shell.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.assistant-shell.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `assistantShellResult` | `PapaAssistantShellReadResult` | Dostarczane przez `papa.assistant-shell.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-02.ts`.

### API i akcje
- Odczyt: `papa.assistant-shell.read` — `GET /api/v1/papa/assistantshell`, `PapaAssistantShellReadRequest` → `PapaAssistantShellReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-03-tryby-pracy"></a>

## Tryby pracy

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Tryby pracy”; nie jest samodzielnym routem runtime.

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
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ChartFrame` | `05-wykresy-i-wizualizacje/komponenty/chartframe.md` | required |
| `TrendChart` | `05-wykresy-i-wizualizacje/komponenty/trendchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-03.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-04-context-basket"></a>

## Context basket

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Context basket” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/context-basket`.
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
| `DetailPanel` | `04-komponenty-bazowe/komponenty/detailpanel.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.context-basket.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.context-basket.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.context-basket.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `contextBasketResult` | `PapaContextBasketReadResult` | Dostarczane przez `papa.context-basket.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-04.ts`.

### API i akcje
- Odczyt: `papa.context-basket.read` — `GET /api/v1/papa/context-basket`, `PapaContextBasketReadRequest` → `PapaContextBasketReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-05-odpowiedz-papa"></a>

## Odpowiedź Papa

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Odpowiedź Papa” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/odpowiedz-papa`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.answer.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.answer.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.answer.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `answerResult` | `PapaAnswerReadResult` | Dostarczane przez `papa.answer.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-05.ts`.

### API i akcje
- Odczyt: `papa.answer.read` — `GET /api/v1/papa/odpowiedz-papa`, `PapaAnswerReadRequest` → `PapaAnswerReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-06-dowody"></a>

## Dowody

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Dowody” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/dowody`.
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
| `EvidencePanel` | `04-komponenty-domenowe/evidence-panel.md` | required-domain |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.evidence.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.evidence.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.evidence.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `evidenceResult` | `PapaEvidenceReadResult` | Dostarczane przez `papa.evidence.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-06.ts`.

### API i akcje
- Odczyt: `papa.evidence.read` — `GET /api/v1/papa/dowody`, `PapaEvidenceReadRequest` → `PapaEvidenceReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-07-confidence"></a>

## Confidence

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Confidence”; nie jest samodzielnym routem runtime.

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

Kanoniczny model TypeScript ekranu: `contracts/screens/50-07.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-08-laboratorium-ai"></a>

## Laboratorium AI

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Laboratorium AI” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/laboratorium-ai`.
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
| `ShareChart` | `05-wykresy-i-wizualizacje/komponenty/sharechart.md` | required |
| `ComparisonChart` | `05-wykresy-i-wizualizacje/komponenty/comparisonchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.lab.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.lab.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.lab.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `labResult` | `PapaLabReadResult` | Dostarczane przez `papa.lab.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-08.ts`.

### API i akcje
- Odczyt: `papa.lab.read` — `GET /api/v1/papa/laboratorium-ai`, `PapaLabReadRequest` → `PapaLabReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

### Decyzja P0 — raporty i ciągłość
Laboratorium zachowuje conversationId z panelu Papa Asystenta oraz zapewnia kreator raportów z zapisem wykresów i eksportem PDF/CSV/XLSX.

<a id="sekcja-50-09-obserwacje"></a>

## Obserwacje

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Obserwacje” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/obserwacje`.
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
| `DetailPanel` | `04-komponenty-bazowe/komponenty/detailpanel.md` | required |
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.observations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.observations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.observations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `observationsResult` | `PapaObservationsReadResult` | Dostarczane przez `papa.observations.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-09.ts`.

### API i akcje
- Odczyt: `papa.observations.read` — `GET /api/v1/papa/obserwacje`, `PapaObservationsReadRequest` → `PapaObservationsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

### Decyzja P0 — AI Case Threads
Anomalia, wzrost, ryzyko i problem danych mogą otrzymać osobny wątek sprawy powiązany z rozmową główną.

<a id="sekcja-50-10-rekomendacje-i-warianty"></a>

## Rekomendacje i warianty

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Rekomendacje i warianty”; nie jest samodzielnym routem runtime.

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
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ChartFrame` | `05-wykresy-i-wizualizacje/komponenty/chartframe.md` | required |
| `TrendChart` | `05-wykresy-i-wizualizacje/komponenty/trendchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-10.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.10`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-11-propozycje-ai"></a>

## Propozycje AI

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Propozycje AI” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/propozycje-ai`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.proposals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.proposals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.proposals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `proposalsResult` | `PapaProposalsReadResult` | Dostarczane przez `papa.proposals.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-11.ts`.

### API i akcje
- Odczyt: `papa.proposals.read` — `GET /api/v1/papa/propozycje-ai`, `PapaProposalsReadRequest` → `PapaProposalsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.11`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-12-ai-action-approval"></a>

## AI Action Approval

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „AI Action Approval” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/ai-action-approval`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |
| `ApprovalPanel` | `04-komponenty-bazowe/komponenty/approvalpanel.md` | required |
| `AlertDialog` | `04-komponenty-bazowe/komponenty/alertdialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.action-approval.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.action-approval.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.action-approval.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `actionApprovalResult` | `PapaActionApprovalReadResult` | Dostarczane przez `papa.action-approval.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-12.ts`.

### API i akcje
- Odczyt: `papa.action-approval.read` — `GET /api/v1/papa/ai-action-approval`, `PapaActionApprovalReadRequest` → `PapaActionApprovalReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.12`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-13-ai-actions"></a>

## AI Actions

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „AI Actions” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/ai-actions`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.actions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.actions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.actions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `actionsResult` | `PapaActionsReadResult` | Dostarczane przez `papa.actions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-13.ts`.

### API i akcje
- Odczyt: `papa.actions.read` — `GET /api/v1/papa/ai-actions`, `PapaActionsReadRequest` → `PapaActionsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.13`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

### Decyzja P0 — wykonanie zmian
Zmiany budżetu i ustawień integracji wymagają diffu, walidacji, capability, jawnej akceptacji człowieka, idempotencji, read-after-write, audytu i rollbacku/kompensacji.

<a id="sekcja-50-14-zablokowane-dzialania-ai"></a>

## Zablokowane działania AI

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Zablokowane działania AI”; nie jest samodzielnym routem runtime.

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
| `MetricCard` | `05-wykresy-i-wizualizacje/komponenty/metriccard.md` | required |
| `ChartFrame` | `05-wykresy-i-wizualizacje/komponenty/chartframe.md` | required |
| `TrendChart` | `05-wykresy-i-wizualizacje/komponenty/trendchart.md` | required |
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-14.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.14`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-15-historia-i-pamiec-papa"></a>

## Historia i pamięć Papa

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Historia i pamięć Papa” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/historia-i-pamiec-papa`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |
| `ApprovalPanel` | `04-komponenty-bazowe/komponenty/approvalpanel.md` | required |
| `AlertDialog` | `04-komponenty-bazowe/komponenty/alertdialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.history-memory.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.history-memory.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.history-memory.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `timeline` | `PapaTimelineEvent[]` | Dostarczane przez `papa.history-memory.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `historyMemoryResult` | `PapaHistoryMemoryReadResult` | Dostarczane przez `papa.history-memory.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-15.ts`.

### API i akcje
- Odczyt: `papa.history-memory.read` — `GET /api/v1/papa/historia-i-pamiec-papa`, `PapaHistoryMemoryReadRequest` → `PapaHistoryMemoryReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.15`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

### Decyzja P0 — jeden wątek
Panel i Laboratorium są dwiema powierzchniami tej samej rozmowy. Nowy conversationId powstaje tylko po jawnej akcji.

<a id="sekcja-50-16-ustawienia-ai-i-governance"></a>

## Ustawienia AI i Governance

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Ustawienia AI i Governance” w obszarze: Papa, evidence, confidence, rekomendacje, decyzje i działania AI. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/papa/ustawienia-ai-i-governance`.
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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `PapaRecord[]` | Dostarczane przez `papa.governance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `papa.governance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `PapaSummary` | Dostarczane przez `papa.governance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `governanceResult` | `PapaGovernanceReadResult` | Dostarczane przez `papa.governance.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-16.ts`.

### API i akcje
- Odczyt: `papa.governance.read` — `GET /api/v1/papa/ustawienia-ai-i-governance`, `PapaGovernanceReadRequest` → `PapaGovernanceReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.16`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-50-17-warianty-papa"></a>

## Warianty Papa

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty Papa”; nie jest samodzielnym routem runtime.

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
| `DecisionCard` | `04-komponenty-bazowe/komponenty/decisioncard.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/50-17.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=50.17`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="papa-asystent-kontekst-produktowy"></a>

## [x] 1. Czym jest Papa Asystent

Poniżej masz **kompletny kontekst Papa Asystenta** jako modułu. Bez skakania. To jest opis docelowy: **co to jest, jak działa, jak wygląda, jakie ma funkcje, statusy, raporty, evidence, AI actions, bezpieczeństwo i wymagane informacje AI**.


Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

**Papa Asystent to kontekstowa warstwa analityczna AI nad całym panelem PapaData.** Nie jest zwykłym czatem, nie jest osobnym chatbotem i nie jest źródłem prawdy. Źródłem prawdy pozostają dane, kontrakty, backend, integracje, tenant/workspace i uprawnienia. Dokumentacja mówi wprost: Papa Asystent jest modułem zaawansowanej analityki biznesowej i współpracy z AI, a nie tylko czatem.

Najkrócej:

```text
Papa Asystent = AI do analizy, decyzji, rekomendacji, raportów i akcji wymagających zatwierdzenia.
```

Nie powinien mówić: „zrobiłem”, jeśli realnie tylko przygotował propozycję. Nie powinien wykonywać działań biznesowych bez procesu AI Action.

---

## [x] 2. Główne zasady działania

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Każde zapytanie do Papa Asystenta musi mieć jawny kontekst:

* tenant,
* workspace,
* aktywny ekran,
* zakres dat,
* aktywne filtry,
* wybrane KPI,
* wykresy,
* tabele,
* źródła danych i ich jakość,
* uprawnienia użytkownika,
* dozwolone narzędzia.

Czyli Asystent nie odpowiada „ogólnie”. On odpowiada na podstawie **konkretnego workspace, konkretnego okresu, konkretnych danych i konkretnych uprawnień**.

---

## [x] 3. Gdzie użytkownik go uruchamia

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent powinien być dostępny z kilku punktów:

* pływający launcher,
* przycisk na KPI,
* akcja wykresu,
* akcja tabeli,
* rekomendacja,
* globalna wyszukiwarka,
* Centrum Pomocy,
* Laboratorium.

W praktyce: użytkownik może zapytać o cały ekran, konkretny KPI, konkretny wykres, konkretną tabelę, rekomendację, problem integracji albo raport.

---

## [x] 4. Jak wygląda Papa Asystent

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

## [x] 4.1. Globalny panel

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Na desktopie:

* szerokość standardowa: **420–480 px**,
* szerokość rozszerzona: **560–720 px**,
* panel może być resizable,
* zapamiętuje preferencję użytkownika,
* może działać jako overlay albo panel przypięty.

Na mobile:

* bottom sheet albo pełny ekran,
* composer pozostaje dostępny,
* artefakty otwierają się jako pełny widok.

## [x] 4.2. Struktura AssistantShell

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Docelowa anatomia:

```text
AssistantShell
├── Header
├── ContextSummary
├── ModeSwitcher
├── Conversation
├── ToolActivity
├── EvidencePanel
├── ArtifactRegion
├── Composer
└── OperationStatus
```

To jest rdzeń UI Papa Asystenta.

Widoki wewnętrzne:

```text
conversation
sources
artifact
report
execution
history
```

Ważne: te widoki **nie mogą tworzyć kolejnych modalnych drawerów nad panelem**.

---

## [x] 5. Formy pracy Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

## [x] 5.1. Panel kontekstowy

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

* dostępny z każdego ekranu,
* stała szerokość,
* nie zasłania głównej treści,
* zachowuje kontekst ekranu, filtrów i okresu,
* można go rozszerzyć.

## [x] 5.2. Widok podzielony

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

* Asystent i dane są jednocześnie widoczne,
* Asystent może wskazać wykres, tabelę albo pole,
* może przewinąć do elementu i podświetlić go.

## [x] 5.3. Pełna sekcja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Pełny widok Papa Asystenta obejmuje:

* rozmowy,
* analizy,
* rekomendacje,
* symulacje,
* historię decyzji,
* raporty,
* bibliotekę raportów,
* kontynuację rozmowy rozpoczętej w panelu.

## [x] 5.4. Inline Assistant

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Działa na konkretnym KPI, wykresie albo tabeli:

* desktop: panel boczny,
* mobile: bottom sheet,
* zachowuje zakres i filtr,
* pokazuje nazwę obiektu kontekstu,
* pozwala przejść do głównego panelu bez utraty rozmowy.

---

## [x] 6. Context basket

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Użytkownik może wrzucić do kontekstu Asystenta:

* KPI,
* wykres,
* zaznaczony zakres wykresu,
* wiersze tabeli,
* rekomendację,
* plik,
* raport,
* procedurę pomocy.

Każdy element context basket musi pokazywać:

* źródło,
* zakres,
* świeżość,
* możliwość usunięcia.

---

## [x] 7. Tryby pracy Papa Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Docelowe tryby:

## [x] Szybki brief

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Podsumowuje aktywny ekran.

## [x] Interpretacja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Wyjaśnia zmianę i drivery.

## [x] Diagnoza

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Szuka przyczyn, ograniczeń i brakujących danych.

## [x] Decyzja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Przygotowuje rekomendacje i warianty.

## [x] Raport

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Tworzy draft raportu albo uruchamia report job po jawnej akcji użytkownika.

## [x] Plan działań

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Tworzy zadania, właścicieli i terminy. Nie wykonuje zmian biznesowych bez AI Action.

Dla Laboratorium są też tryby robocze:

* decyzja,
* diagnoza,
* raport,
* plan działań.

---

## [x] 8. Jak wygląda odpowiedź Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Każda odpowiedź powinna mieć logiczną strukturę:

```text
facts
interpretations
hypotheses
recommendations
limitations
suggestedNextSteps
```

Czyli nie sam tekst „ładnie napisany”, tylko konkretna struktura: fakty, interpretacja, hipotezy, rekomendacje, ograniczenia i następne kroki.

Streaming odpowiedzi ma być stabilny. Czytnik ekranu nie może dostawać chaotycznej aktualizacji każdego tokenu.

---

## [x] 9. EvidencePanel i zaufanie

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent musi pokazywać evidence, czyli dowody i ograniczenia odpowiedzi.

EvidencePanel pokazuje:

* źródła,
* dataset i snapshot,
* zakres dat,
* filtry,
* świeżość,
* kompletność,
* estymacje,
* ograniczenia,
* lineage,
* audyt.

Poziomy confidence:

```text
wysoka
ograniczona
niewystarczająca
```

Nie używa się swobodnie wygenerowanego procentu typu `87%`, jeśli nie ma realnej metodologii.

---

## [x] 10. Odmowy i zabezpieczenia

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Asystent odmawia albo ogranicza odpowiedź, gdy:

* brakuje evidence,
* dane są niewystarczające,
* żądanie przekracza data scope,
* użytkownik nie ma capability,
* wykryto prompt injection,
* żądanie dotyczy zabronionej operacji,
* koszt albo limit został przekroczony.

Kluczowe decyzje finansowe i operacyjne wymagają weryfikacji człowieka.

---

## [x] 11. Źródła analizy

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Widok `sources` pozwala dodać:

* pliki,
* zapisane analizy,
* źródła integracyjne,
* artefakty biblioteki.

Dodanie źródła nie zmienia data authority. Źródło ma klasyfikację, zakres i retencję. Czyli plik albo artefakt może pomóc w analizie, ale nie staje się automatycznie oficjalnym źródłem prawdy.

---

## [x] 12. Artefakty

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent tworzy artefakty:

* podsumowanie,
* lista,
* tabela,
* wykres,
* briefing,
* draft raportu,
* plan działań.

Tabela artefaktu powinna mieć:

* search,
* sortowanie,
* widoczność kolumn,
* CSV,
* zapis widoku.

Rozbudowany artefakt nie powinien być małym modalem. Ma być route-backed workspace albo widokiem Asystenta.

---

## [x] 13. Rekomendacja i symulacja

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Przed akceptacją rekomendacji użytkownik widzi:

* stan obecny,
* przewidywany stan bez działania,
* przewidywany stan po wdrożeniu,
* różnicę liczbową i wizualną,
* założenia,
* źródła danych,
* poziom pewności,
* oznaczenie, że to prognoza AI.

To jest ważne UX-owo: rekomendacja AI nie może być tylko tekstem. Ma pokazywać **before / after / no action**.

---

## [x] 14. Wykonanie zmiany przez AI

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent może przygotować i wykonać zmianę w integracji dopiero po świadomym zatwierdzeniu klienta.

Przed zatwierdzeniem system pokazuje:

* konto,
* integrację,
* dokładny zakres,
* termin,
* możliwość cofnięcia,
* ryzyka,
* skutki uboczne,
* poziom ryzyka,
* kto może zatwierdzić.

Zasada:

```text
AI może przygotować propozycję.
AI nie wykonuje zmiany bez świadomego approval.
```

Zmiany finansowe, masowe albo trudne do cofnięcia wymagają dwóch kroków i wpisania frazy. Polityka workspace może wymagać zgody drugiej osoby.

---

## [x] 15. Wykonanie częściowe

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Zasady partial execution:

* bezpieczne niezależne zmiany mogą zakończyć się częściowo,
* finansowe, masowe i krytyczne działają według zasady wszystko albo nic,
* klient widzi wykonane, niewykonane, cofnięte i oczekujące elementy,
* system proponuje najbezpieczniejsze dalsze działanie,
* ważne ponowienie wymaga zgody klienta.

---

## [x] 16. Historia decyzji i działań

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Historia Papa Asystenta ma pełną oś czasu:

* rekomendacja,
* symulacja,
* decyzja,
* zatwierdzenia,
* harmonogram,
* wykonanie,
* błędy i ponowienia,
* wynik,
* porównanie prognozy z rzeczywistością.

Historia ma mieć:

* filtrowanie,
* wyszukiwanie,
* eksport.

---

## [x] 17. Raporty

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Asystent tworzy:

* raport PDF,
* raport CSV,
* raport analityczny z wykresami, tabelami, źródłami, filtrami i rekomendacjami.

Raport można:

* podejrzeć w sekcji Papa Asystenta,
* zapisać w bibliotece,
* wersjonować,
* kontynuować rozmowę na jego podstawie.

Przycisk raportu ma być dostępny w kontekście Asystenta, Laboratorium albo analizy. Nie globalnie w topbarze.

Statusy report job:

```text
queued
generating
ready
failed
expired
```

Postęp jest trwały, a zakończenie trafia do powiadomień.

---

## [x] 18. Laboratorium jako część Papa Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Laboratorium jest pełnym miejscem pracy z AI, a nie tylko czatem.

Sygnały wejściowe Laboratorium:

* zakres danych,
* liczba rekomendacji,
* biblioteka,
* jakość danych.

Główna część Laboratorium:

* tryb decyzja,
* tryb diagnoza,
* tryb raport,
* tryb plan działań,
* panel szczegółów danych: źródła, pokrycie, świeżość, kompletność, poziom zaufania.

Sekcje Laboratorium:

* Zapytaj,
* Rekomendacje,
* Biblioteka,
* Briefingi,
* Eksport i MCP.

---

## [x] 19. Rekomendacje w Laboratorium

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Karta rekomendacji pokazuje:

* co zrobić,
* dlaczego,
* evidence,
* wpływ,
* ryzyko,
* właściciela,
* horyzont,
* status.

Statusy rekomendacji:

* nowa,
* do decyzji,
* w planie,
* odłożona,
* zrealizowana,
* odrzucona.

---

## [x] 20. Biblioteka

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Biblioteka przechowuje:

* artefakty,
* wersje,
* zakres,
* autora,
* źródła,
* status.

Typy artefaktów w bibliotece:

* tabela,
* wykres,
* decyzja,
* brief,
* alert,
* raport.

Metadane:

* nazwa,
* typ,
* autor,
* data,
* zakres,
* źródła,
* wersja,
* status,
* link do analizy.

---

## [x] 21. Briefingi i analizy

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Briefingi i analizy:

* uruchamiają report jobs,
* monitorują kolejkę,
* eksportują wyniki.

Briefing zawiera:

* temat,
* cel,
* kontekst,
* oczekiwany wynik,
* obszar,
* kanał,
* priorytet,
* termin,
* właściciela,
* załączniki,
* kontekst Asystenta.

---

## [x] 22. DecisionQueue

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Statusy DecisionQueue:

```text
proposed
needsReview
approved
rejected
deferred
expired
invalidated
executing
succeeded
failed
partiallySucceeded
compensated
```



Znaczenie:

* `proposed` — AI przygotowało propozycję,
* `needsReview` — człowiek musi przejrzeć,
* `approved` — zatwierdzone,
* `rejected` — odrzucone,
* `deferred` — odłożone,
* `expired` — zatwierdzenie wygasło,
* `invalidated` — dane/kontekst się zmieniły,
* `executing` — wykonanie trwa,
* `succeeded` — wykonane,
* `failed` — nieudane,
* `partiallySucceeded` — częściowo wykonane,
* `compensated` — cofnięte/naprawione kompensacją.

---

## [x] 23. Eksport i MCP

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Eksporty:

* PDF,
* CSV,
* brief zespołu,
* biblioteka,
* workflow zewnętrzny,
* MCP.

Statusy eksportu/MCP:

```text
ready
generating
expired
error
no access
```



W praktyce: wynik Asystenta może zostać zamieniony w PDF, CSV, brief, zapis do biblioteki albo przepięty do zewnętrznego workflow/MCP.

---

## [x] 24. Dostępność

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent musi mieć:

* pełną obsługę klawiatury,
* stabilny focus podczas streamingu,
* komunikowany status generowania,
* stop generation,
* poprawny live region,
* źródła i ograniczenia dostępne tekstowo,
* confidence/readiness nieoparte wyłącznie na kolorze.

---

## [x] 25. Storybook

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Docelowe stories:

```text
40 Laboratorium Papa Asystenta/AssistantShell
40 Laboratorium Papa Asystenta/InlineAssistant
40 Laboratorium Papa Asystenta/ContextBasket
40 Laboratorium Papa Asystenta/EvidencePanel
40 Laboratorium Papa Asystenta/ArtifactTable
40 Laboratorium Papa Asystenta/Recommendation
40 Laboratorium Papa Asystenta/DecisionQueue
90 Przepływy/AssistantContext
90 Przepływy/ReportJob
90 Przepływy/AIRefusal
```



---

## [x] 26. Kryteria akceptacji

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Papa Asystent jest poprawnie zaprojektowany dopiero wtedy, gdy:

* zawsze ma jawny kontekst,
* evidence i ograniczenia są widoczne,
* nie ma fałszywej precyzji confidence,
* źródła i artefakty nie tworzą zagnieżdżonych modali,
* report job jest asynchroniczny,
* DecisionQueue ma wszystkie stany,
* rekomendacja nie wykonuje działania bez AI Action,
* testy izolacji tenant/workspace i prompt injection przechodzą.

---

## [x] 27. Obowiązkowe informacje AI w UI

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Zgodnie z AI Act, użytkownik powinien być poinformowany, że wchodzi w interakcję z systemem AI, gdy system jest przeznaczony do bezpośredniej interakcji z osobami; obowiązki transparentności Article 50 dotyczą m.in. interaktywnych systemów AI i treści AI, a Komisja wskazuje, że reguły transparentności pomagają rozpoznawać interakcję z AI lub ekspozycję na treść AI. ([Eur-Lex][1]) ([Cyfrowa Strategia Europy][2])

Dla Papa Asystenta dodaj stały blok transparentności:

```text
Odpowiada Papa Asystent AI.
Wynik jest generowany automatycznie na podstawie danych workspace, aktywnych filtrów i dostępnych źródeł.
Sprawdź evidence, aktualność danych i ograniczenia przed podjęciem decyzji.
```

Dla rekomendacji:

```text
Rekomendacja wygenerowana przez AI.
Wdrożenie wymaga zatwierdzenia użytkownika i ponownej walidacji danych.
```

Dla raportów/briefów:

```text
Raport wygenerowany przez Papa Asystenta AI.
Zawiera dane, wnioski i rekomendacje z określonego zakresu.
Przed użyciem operacyjnym sprawdź źródła, kompletność danych i poziom pewności.
```

Dla odmowy:

```text
Papa Asystent nie może przygotować odpowiedzi, ponieważ dostępne dane, uprawnienia albo evidence są niewystarczające.
```

Jeżeli Asystent generuje treść używaną dalej poza aplikacją — raport, brief, alert, publiczny opis, mail, eksport — oznacz ją jako **wygenerowaną przez AI**. Komisja opisuje też Code of Practice i ikony jako narzędzia wspierające oznaczanie treści AI. ([Cyfrowa Strategia Europy][3])

---

## [x] 28. Statusy, które powinieneś mieć w modelu

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

## [x] Status danych

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
ready
partial
stale
restricted
empty
error
no access
```

## [x] Confidence

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
wysoka
ograniczona
niewystarczająca
```

## [x] Report job

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
queued
generating
ready
failed
expired
```

## [x] DecisionQueue

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
proposed
needsReview
approved
rejected
deferred
expired
invalidated
executing
succeeded
failed
partiallySucceeded
compensated
```

## [x] Eksport / MCP

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
ready
generating
expired
error
no access
```

## [x] Odmowa AI

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
insufficient_evidence
insufficient_data
out_of_scope
missing_capability
prompt_injection_detected
forbidden_operation
cost_or_limit_exceeded
approval_required
```

---

## [x] 29. Minimalny przebieg użytkownika

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
Użytkownik otwiera ekran
→ Papa Asystent dostaje kontekst ekranu
→ użytkownik zadaje pytanie albo wybiera tryb
→ Asystent analizuje dane
→ pokazuje odpowiedź z facts / interpretations / hypotheses / recommendations / limitations / next steps
→ pokazuje evidence i confidence
→ generuje artefakt
→ użytkownik zapisuje do biblioteki / tworzy raport / tworzy briefing
→ jeśli jest akcja biznesowa, powstaje proposal
→ użytkownik zatwierdza
→ system robi revalidation
→ dopiero potem execution
→ wynik trafia do historii, audytu i recovery
```

---

## [x] 30. Co musi być na ekranie Papa Asystenta

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

Minimum UI:

1. **Header**

   * nazwa: Papa Asystent,
   * status AI,
   * informacja, że odpowiada AI.

2. **ContextSummary**

   * workspace,
   * ekran,
   * zakres dat,
   * filtry,
   * źródła,
   * jakość danych,
   * capability.

3. **ModeSwitcher**

   * szybki brief,
   * interpretacja,
   * diagnoza,
   * decyzja,
   * raport,
   * plan działań.

4. **Conversation**

   * pytania,
   * odpowiedzi,
   * streaming,
   * stop generation.

5. **EvidencePanel**

   * źródła,
   * zakres,
   * świeżość,
   * kompletność,
   * ograniczenia,
   * confidence.

6. **ArtifactRegion**

   * tabela,
   * wykres,
   * lista,
   * briefing,
   * draft raportu,
   * plan działań.

7. **ToolActivity**

   * co Asystent sprawdza,
   * jakie źródła czyta,
   * czy są braki,
   * czy akcja wymaga approval.

8. **OperationStatus**

   * queued,
   * generating,
   * needsReview,
   * executing,
   * succeeded,
   * failed,
   * recovery.

9. **Composer**

   * pole pytania,
   * gotowe prompty,
   * wybór trybu,
   * załącz kontekst,
   * wyślij.

---

## [x] 31. Najkrótsza definicja produktu

Evidence: `apps/web/src/features/papa-assistant/assistantTypes.ts`, `apps/web/src/features/papa-assistant/papaAssistantData.ts`, `apps/web/src/features/papa-assistant/PapaAssistantExperience.tsx`, `apps/web/src/features/papa-assistant/papa-assistant-experience.css`, `apps/web/src/features/papa-assistant/papaAssistantModel.test.ts`, `apps/web/src/storybook-next/stories/40-papa-assistant`, `apps/web/src/storybook-next/stories/90-papa-assistant-flows`, `apps/web/src/screens/papa/PapaScreen.tsx`.
Verification: `pnpm verify:papa-assistant`, `pnpm -w typecheck`, `pnpm -w lint`, `pnpm -w test`.

```text
Papa Asystent to kontekstowy analityk AI w PapaData.
Czyta dane workspace, ekran, filtry, KPI, wykresy, tabele i uprawnienia.
Odpowiada z evidence, confidence i ograniczeniami.
Tworzy rekomendacje, symulacje, artefakty, raporty i briefingi.
Nie jest źródłem prawdy i nie wykonuje działań bez approval.
Każda akcja idzie przez proposal, approval, revalidation, execution, audit i recovery.
```

To jest punkt wyjścia. Następny logiczny krok: rozpisać to samo **jako checklistę implementacyjną P0/P1 dla Papa Asystenta** — pliki, komponenty, stany, kontrakty, testy, Storybook.

[1]: https://eur-lex.europa.eu/legal-content/EN/TXT/?qid=1747442914146&uri=CELEX%3A02024R1689-20260727&utm_source=chatgpt.com "EUR-Lex - 02024R1689-20260727 - PL - EUR-Lex"
[2]: https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems?utm_source=chatgpt.com "Quick Facts: Transparency rules for AI systems | Shaping Europe’s digital future"
[3]: https://digital-strategy.ec.europa.eu/en/policies/code-practice-ai-generated-content?utm_source=chatgpt.com "Code of Practice on Transparency of AI-generated Content | Shaping Europe’s digital future"

<a id="10-papa-assistant-laboratory"></a>

## Papa Asystent i Laboratorium UI Copy

### Transparentność AI

Asystent:

```text
Odpowiada Papa Asystent AI. Wynik jest generowany automatycznie na podstawie danych workspace, aktywnych filtrów i dostępnych źródeł. Sprawdź evidence, aktualność danych i ograniczenia przed podjęciem decyzji.
```

Rekomendacja:

```text
Rekomendacja wygenerowana przez AI. Wdrożenie wymaga zatwierdzenia użytkownika i ponownej walidacji danych.
```

Raport:

```text
Raport wygenerowany przez Papa Asystenta AI. Zawiera dane, wnioski i rekomendacje z określonego zakresu. Przed użyciem operacyjnym sprawdź źródła, kompletność danych i poziom pewności.
```

Odmowa:

```text
Papa Asystent nie może przygotować odpowiedzi, ponieważ dostępne dane, uprawnienia albo evidence są niewystarczające.
```

### Główne sekcje

```text
Papa Asystent
ContextSummary
Conversation
EvidencePanel
ArtifactRegion
ToolActivity
OperationStatus
ContextBasket
DecisionQueue
ReportJob
AIRefusal
```

### Tryby

```text
Szybki brief
Interpretacja
Diagnoza
Decyzja
Raport
Plan działań
```

### Akcje

```text
Stop generation
Załącz kontekst
Wyślij
CSV
Zapisz widok
Przejdź do panelu bez utraty rozmowy
Eksport historii
```
