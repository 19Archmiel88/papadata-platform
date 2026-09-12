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
> [STD-SCREEN-LAYOUT-BASE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-base) — normatywny.

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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

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
> [STD-SCREEN-LAYOUT-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |
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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

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
> [STD-SCREEN-LAYOUT-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |

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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

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
> [STD-SCREEN-LAYOUT-BASE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-base) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

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
> [STD-SCREEN-LAYOUT-BASE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-base) — normatywny.

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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.


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
> [STD-SCREEN-LAYOUT-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |

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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.


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
> [STD-SCREEN-LAYOUT-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-table) — normatywny.

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
| `records` | `SettingsRecord[]` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `SettingsSummary` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `auditResult` | `SettingsAuditReadResult` | Dostarczane przez `settings.audit.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-07.ts`.

### API i akcje
- Odczyt: `settings.audit.read` — `GET /api/v1/settings/audyt`, `SettingsAuditReadRequest` → `SettingsAuditReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

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
> [STD-SCREEN-LAYOUT-BASE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-base) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

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
> [STD-SCREEN-LAYOUT-TABLE](../00-zarzadzanie-dokumentacja/README.md#std-screen-layout-table) — normatywny.

### Kompozycja z wcześniej zdefiniowanych komponentów
| Komponent | Dokument źródłowy | Status |
|---|---|---|
| `PageHeader` | `04-komponenty-bazowe/komponenty/pageheader.md` | required |
| `InlineNotice` | `04-komponenty-bazowe/komponenty/inlinenotice.md` | required |
| `Button` | `04-komponenty-bazowe/komponenty/button.md` | required |
| `FilterBar` | `04-komponenty-bazowe/komponenty/filterbar.md` | required |
| `DataTable` | `04-komponenty-bazowe/komponenty/datatable.md` | required |

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
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-60-10-warianty-ustawien"></a>

## Warianty ustawień

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty ustawień”; nie jest samodzielnym routem runtime.

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

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `variants` | lista wariantów | Warunek, kompozycja, ograniczenia i przykład użycia. |

Kanoniczny model TypeScript ekranu: `contracts/screens/60-10.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=60.10`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.
