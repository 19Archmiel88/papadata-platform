---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Ustawienia, zespół i bezpieczeństwo

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-60-01-organizacja"></a>

## Organizacja

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Organizacja” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/organizacja`.
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
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.organization.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.organization.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.organization.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `organizationResult` | `SettingsOrganizationReadResult` | Dostarczane przez `settings.organization.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-01.ts`.

### API i akcje
- Odczyt: `settings.organization.read` — `GET /api/v1/settings/organizacja`, `SettingsOrganizationReadRequest` → `SettingsOrganizationReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-02-workspace"></a>

## Workspace

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Workspace” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/workspace`.
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
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.workspace.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.workspace.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.workspace.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `workspaceResult` | `SettingsWorkspaceReadResult` | Dostarczane przez `settings.workspace.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-02.ts`.

### API i akcje
- Odczyt: `settings.workspace.read` — `GET /api/v1/settings/workspace`, `SettingsWorkspaceReadRequest` → `SettingsWorkspaceReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-03-czlonkostwa"></a>

## Członkostwa

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Członkostwa” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/czlonkostwa`.
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
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.memberships.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.memberships.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.memberships.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `membershipsResult` | `SettingsMembershipsReadResult` | Dostarczane przez `settings.memberships.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-03.ts`.

### API i akcje
- Odczyt: `settings.memberships.read` — `GET /api/v1/settings/czlonkostwa`, `SettingsMembershipsReadRequest` → `SettingsMembershipsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-04-role-i-uprawnienia"></a>

## Role i uprawnienia

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Role i uprawnienia” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/role-i-uprawnienia`.
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
| `ApprovalPanel` | `04-komponenty-bazowe/komponenty/approvalpanel.md` | required |
| `AlertDialog` | `04-komponenty-bazowe/komponenty/alertdialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.roles.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.roles.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.roles.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `rolesResult` | `SettingsRolesReadResult` | Dostarczane przez `settings.roles.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-04.ts`.

### API i akcje
- Odczyt: `settings.roles.read` — `GET /api/v1/settings/role-i-uprawnienia`, `SettingsRolesReadRequest` → `SettingsRolesReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-05-bezpieczenstwo-konta"></a>

## Bezpieczeństwo konta

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Bezpieczeństwo konta” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/bezpieczenstwo-konta`.
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
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.account-security.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.account-security.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.account-security.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `accountSecurityResult` | `SettingsAccountSecurityReadResult` | Dostarczane przez `settings.account-security.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-05.ts`.

### API i akcje
- Odczyt: `settings.account-security.read` — `GET /api/v1/settings/bezpieczenstwo-konta`, `SettingsAccountSecurityReadRequest` → `SettingsAccountSecurityReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.


### Aktualizacja normatywna 2026-08-17 — wejście z Account Panelu

`/app/settings/bezpieczenstwo-konta` jest aktywnym destination route Account Panelu. Widok pobiera dane z `settings.account-security.read` i nie może używać Storybook fixtures w runtime. Account Panel nie duplikuje zawartości widoku — jest wyłącznie punktem wejścia.

<a id="sekcja-60-06-sesje"></a>

## Sesje

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Sesje” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/sesje`.
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
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.sessions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.sessions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.sessions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `sessionsResult` | `SettingsSessionsReadResult` | Dostarczane przez `settings.sessions.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-06.ts`.

### API i akcje
- Odczyt: `settings.sessions.read` — `GET /api/v1/settings/sesje`, `SettingsSessionsReadRequest` → `SettingsSessionsReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.


### Aktualizacja normatywna 2026-08-17 — Sesje i urządzenia

`/app/settings/sesje` jest aktywnym destination route Account Panelu. Widok pokazuje aktualny kontekst sesji z BFF oraz dane zwrócone przez `settings.sessions.read`. Sama obecność pozycji w Account Panelu nie może prowadzić do `NotFound`.

<a id="sekcja-60-07-audyt"></a>

## Audyt

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Audyt” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/audyt`.
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
| `Tabs` | `04-komponenty-bazowe/komponenty/tabs.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `auditResult` | `SettingsAuditReadResult` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-07.ts`.

### API i akcje
- Odczyt: `settings.audit.read` — `GET /api/v1/settings/audyt`, `SettingsAuditReadRequest` → `SettingsAuditReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-08-prywatnosc"></a>

## Prywatność

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Prywatność” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/prywatnosc`.
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
| `ApprovalPanel` | `04-komponenty-bazowe/komponenty/approvalpanel.md` | required |
| `AlertDialog` | `04-komponenty-bazowe/komponenty/alertdialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `privacyResult` | `SettingsPrivacyReadResult` | Dostarczane przez `settings.privacy.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-08.ts`.

### API i akcje
- Odczyt: `settings.privacy.read` — `GET /api/v1/settings/prywatnosc`, `SettingsPrivacyReadRequest` → `SettingsPrivacyReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-09-dostep-wsparcia"></a>

## Dostęp wsparcia

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Dostęp wsparcia” w obszarze: tenant, workspace, członkostwa, role, sesje, audyt i prywatność. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/settings/dostep-wsparcia`.
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
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.support-access.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.support-access.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.support-access.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `supportAccessResult` | `SettingsSupportAccessReadResult` | Dostarczane przez `settings.support-access.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-09.ts`.

### API i akcje
- Odczyt: `settings.support-access.read` — `GET /api/v1/settings/dostep-wsparcia`, `SettingsSupportAccessReadRequest` → `SettingsSupportAccessReadResponse`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.

<a id="sekcja-60-10-warianty-ustawien"></a>

## Warianty ustawień

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty ustawień”; nie jest samodzielnym routem runtime.

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

Kanoniczny model TypeScript ekranu: `contracts/screens/60-10.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.10`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
Target Storybook używa fixture właściwego temu dokumentowi. Wymagane są stany ready/loading/empty/partial/stale/error/forbidden/offline, viewporty 1440/768/390, PL/EN, dark/light, reduced motion oraz test interakcji powiązany z rzeczywistym operationId.

### Kryteria akceptacji
1. Ekran renderuje wyłącznie komponenty z tabeli i ich kanonicznych kontraktów.
2. Dane są zgodne z typem z `contracts/api-schemas.ts`; niedozwolone `any` i generyczny `Record<string, unknown>` nie są modelem finalnym.
3. Każda akcja ma operationId lub jest jawnie akcją UI bez transportu.
4. Testy komponentowe, a11y, kontraktowe i E2E obejmują stany z tabeli.
