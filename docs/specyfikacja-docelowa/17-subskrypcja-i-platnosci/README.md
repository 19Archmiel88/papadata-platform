---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Subskrypcja i płatności

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-70-01-subskrypcja"></a>

## Subskrypcja

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Subskrypcja” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/subskrypcja`.
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
| `records` | `BillingRecord[]` | Dostarczane przez `billing.subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `subscriptionResult` | `BillingSubscriptionReadResult` | Dostarczane przez `billing.subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-01.ts`.

### API i akcje
- Odczyt: `billing.subscription.read` — `GET /api/v1/billing/subskrypcja`, `BillingSubscriptionReadRequest` → `BillingSubscriptionReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.01`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-02-uzycie-i-limity"></a>

## Użycie i limity

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Użycie i limity” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/uzycie-i-limity`.
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
| `records` | `BillingRecord[]` | Dostarczane przez `billing.usage-limits.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.usage-limits.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.usage-limits.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `usageLimitsResult` | `BillingUsageLimitsReadResult` | Dostarczane przez `billing.usage-limits.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-02.ts`.

### API i akcje
- Odczyt: `billing.usage-limits.read` — `GET /api/v1/billing/uzycie-i-limity`, `BillingUsageLimitsReadRequest` → `BillingUsageLimitsReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.02`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

<a id="sekcja-70-03-plany"></a>

## Plany

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Plany” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/plany`.
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
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `BillingRecord[]` | Dostarczane przez `billing.plans.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.plans.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.plans.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `plansResult` | `BillingPlansReadResult` | Dostarczane przez `billing.plans.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-03.ts`.

### API i akcje
- Odczyt: `billing.plans.read` — `GET /api/v1/billing/plany`, `BillingPlansReadRequest` → `BillingPlansReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.03`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-04-faktury"></a>

## Faktury

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Faktury” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/faktury`.
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
| `records` | `BillingRecord[]` | Dostarczane przez `billing.invoices.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.invoices.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.invoices.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `invoicesResult` | `BillingInvoicesReadResult` | Dostarczane przez `billing.invoices.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-04.ts`.

### API i akcje
- Odczyt: `billing.invoices.read` — `GET /api/v1/billing/faktury`, `BillingInvoicesReadRequest` → `BillingInvoicesReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.04`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-05-platnosci"></a>

## Płatności

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Płatności” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/platnosci`.
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
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `BillingRecord[]` | Dostarczane przez `billing.payments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.payments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.payments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `paymentsResult` | `BillingPaymentsReadResult` | Dostarczane przez `billing.payments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-05.ts`.

### API i akcje
- Odczyt: `billing.payments.read` — `GET /api/v1/billing/platnosci`, `BillingPaymentsReadRequest` → `BillingPaymentsReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.05`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-06-zalegla-platnosc"></a>

## Zaległa płatność

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Zaległa płatność” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/zalegla-platnosc`.
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
| `records` | `BillingRecord[]` | Dostarczane przez `billing.overdue-payment.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.overdue-payment.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.overdue-payment.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `overduePaymentResult` | `BillingOverduePaymentReadResult` | Dostarczane przez `billing.overdue-payment.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-06.ts`.

### API i akcje
- Odczyt: `billing.overdue-payment.read` — `GET /api/v1/billing/zalegla-platnosc`, `BillingOverduePaymentReadRequest` → `BillingOverduePaymentReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.06`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-07-korekty"></a>

## Korekty

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Korekty” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/korekty`.
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
| `records` | `BillingRecord[]` | Dostarczane przez `billing.adjustments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.adjustments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.adjustments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `adjustmentsResult` | `BillingAdjustmentsReadResult` | Dostarczane przez `billing.adjustments.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-07.ts`.

### API i akcje
- Odczyt: `billing.adjustments.read` — `GET /api/v1/billing/korekty`, `BillingAdjustmentsReadRequest` → `BillingAdjustmentsReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.07`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-08-zmiana-i-anulowanie"></a>

## Zmiana i anulowanie

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Zmiana i anulowanie” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/zmiana-i-anulowanie`.
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
| `TextField` | `04-komponenty-bazowe/komponenty/textfield.md` | required |
| `Select` | `04-komponenty-bazowe/komponenty/select.md` | required |
| `Checkbox` | `04-komponenty-bazowe/komponenty/checkbox.md` | required |
| `Dialog` | `04-komponenty-bazowe/komponenty/dialog.md` | required |

### Kontrakt danych
| Pole | Typ | Reguła |
|---|---|---|
| `records` | `BillingRecord[]` | Dostarczane przez `billing.change-cancel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.change-cancel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.change-cancel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `changeCancelResult` | `BillingChangeCancelReadResult` | Dostarczane przez `billing.change-cancel.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-08.ts`.

### API i akcje
- Odczyt: `billing.change-cancel.read` — `GET /api/v1/billing/zmiana-i-anulowanie`, `BillingChangeCancelReadRequest` → `BillingChangeCancelReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.08`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-09-pilot-do-abonamentu"></a>

## Pilot do abonamentu

### Cel użytkownika i granica odpowiedzialności
Użytkownik realizuje zadanie „Pilot do abonamentu” w obszarze: plany, subskrypcja, limity, faktury, płatności i zaległości. Ekran prowadzi od rozpoznania stanu danych do decyzji lub bezpiecznej nawigacji do szczegółu.

### Routing i warunki wejścia
- Route: `/app/billing/pilot-do-abonamentu`.
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
| `records` | `BillingRecord[]` | Dostarczane przez `billing.pilot-to-subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pageInfo` | `PageInfo` | Dostarczane przez `billing.pilot-to-subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `summary` | `BillingSummary` | Dostarczane przez `billing.pilot-to-subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |
| `pilotToSubscriptionResult` | `BillingPilotToSubscriptionReadResult` | Dostarczane przez `billing.pilot-to-subscription.read`; brak wartości ma semantykę kontraktu, nie pustego stringa. |

Kanoniczny model TypeScript ekranu: `contracts/screens/70-09.ts`.

### API i akcje
- Odczyt: `billing.pilot-to-subscription.read` — `GET /api/v1/billing/pilot-do-abonamentu`, `BillingPilotToSubscriptionReadRequest` → `BillingPilotToSubscriptionReadResponse`.

### Reguły biznesowe i interakcje
> [STD-SCREEN-BUSINESS-INTERACTIONS](../00-zarzadzanie-dokumentacja/README.md#std-screen-business-interactions) — normatywny.

### Stany
> [STD-SCREEN-STATES](../00-zarzadzanie-dokumentacja/README.md#std-screen-states) — normatywny.

### Responsywność i dostępność
> [STD-SCREEN-RESPONSIVE-A11Y](../00-zarzadzanie-dokumentacja/README.md#std-screen-responsive-a11y) — normatywny.

### Bezpieczeństwo i prywatność
> [STD-SCREEN-SECURITY-PRIVACY](../00-zarzadzanie-dokumentacja/README.md#std-screen-security-privacy) — normatywny.

### Telemetria
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.09`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-10-warianty-billingowe"></a>

## Warianty billingowe

### Cel użytkownika i granica odpowiedzialności
Dokument definiuje zasady, warianty i ograniczenia dla obszaru „Warianty billingowe”; nie jest samodzielnym routem runtime.

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

Kanoniczny model TypeScript ekranu: `contracts/screens/70-10.ts`.

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
Zdarzenia: `screen_viewed`, `filter_changed`, `record_opened`, `operation_started`, `operation_succeeded`, `operation_failed`, każde z `screenId=70.10`, workspaceId, operationId i readiness; bez wartości PII.

### Storybook i testy
> [STD-SCREEN-STORYBOOK-TESTS](../00-zarzadzanie-dokumentacja/README.md#std-screen-storybook-tests) — normatywny.

### Kryteria akceptacji
> [STD-SCREEN-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-screen-acceptance) — normatywny.

### Decyzja P0 z 30 lipca 2026

- Cała funkcjonalność billingowa należy do MVP.
- Dostępne są cykle `monthly` i `annual`.
- Ceny, podatki, data kolejnego obciążenia, automatyczne odnowienie i zasady anulowania są widoczne przed zatwierdzeniem.
- Metody MVP: karta, BLIK jednorazowy, BLIK powtarzalny, szybki przelew, przelew tradycyjny oraz dostępne portfele providera.
- Faktury i korekty są gotowe do KSeF.
- Dodatkowa opłata nie może wynikać z domyślnie zaznaczonej zgody.
- Dane kartowe są obsługiwane przez provider-hosted fields/tokenizację; PapaData nie zapisuje PAN/CVV.

<a id="sekcja-70-11-kontrakt-subskrypcji-miesiecznej-rocznej"></a>

## Kontrakt subskrypcji miesięcznej i rocznej

Cykl rozliczeniowy jest enumem `monthly | annual`. Roczny plan pokazuje łączną kwotę, efektywną cenę miesięczną i datę kolejnego odnowienia. Zmiana cyklu ma jawne proration, credit balance i termin wejścia w życie.

Checkout zapisuje wersję planu, cennika, podatków, regulaminu i zgody. Automatyczne odnowienie może zostać wyłączone bez kontaktu z supportem. Przed obciążeniem rocznym system wysyła przypomnienie zgodnie z polityką firmy i właściwym prawem.

<a id="sekcja-70-12-katalog-metod-platnosci"></a>

## Katalog metod płatności MVP

| Metoda | Tryb | Wymaganie |
|---|---|---|
| Karta | jednorazowa i cykliczna | hosted fields, tokenizacja, SCA/3DS, brak PAN/CVV w PapaData |
| BLIK | jednorazowy | kod i potwierdzenie bankowe |
| BLIK powtarzalny | cykliczny | zgoda mandatu, status, anulowanie i bankowa dostępność |
| Szybki przelew | jednorazowy | pay-by-link, callback/webhook i reconciliation |
| Przelew tradycyjny | jednorazowy/abonament B2B | unikalny tytuł/rachunek, reconciliation i termin płatności |
| Apple Pay / Google Pay | jednorazowy/cykliczny zależnie od providera | włączone, gdy provider i urządzenie je wspierają |

UI pokazuje wyłącznie metody faktycznie dostępne dla kraju, waluty, banku i providera, ale provider wybrany dla MVP musi pokrywać kartę, BLIK i przelewy.

<a id="sekcja-70-13-integracja-ksef"></a>

## Integracja faktur z KSeF

Adapter KSeF jest oddzielony od domeny billingowej. Obsługuje środowisko integracyjne/demo i produkcję, certyfikaty/uprawnienia, FA(3), wysłanie faktury, pobranie numeru KSeF/UPO, status, korekty, QR, tryby offline i awarii, retry, limity oraz reconciliation.

Faktura lokalna ma statusy: `draft`, `ready_for_ksef`, `submitted`, `accepted`, `rejected`, `offline_pending`, `correction_required`, `cancelled_where_legally_allowed`. Oryginalny payload, odpowiedź i identyfikatory są objęte audytem i retencją księgową.

Konfiguracja: `KSEF_ENV`, `KSEF_BASE_URL`, `KSEF_AUTH_MODE`, `KSEF_CERTIFICATE_REF`, `KSEF_NIP_CONTEXT`, `KSEF_TIMEOUT_MS`, `KSEF_RETRY_POLICY`.

<a id="sekcja-70-14-adapter-providera-platnosci"></a>

## Adapter providera płatności

Domena używa interfejsu `PaymentProvider`: createCheckout, createMandate, charge, refund, cancelMandate, getPayment, listMethods, verifyWebhook i reconcile. Provider SDK nie może przenikać do kontrolerów ani modeli domenowych.

Wymagane są idempotency keys, podpis webhooków, deduplikacja, stan pośredni, timeout, retry bez podwójnego obciążenia, ledger i codzienna rekoncyliacja. Sekrety znajdują się w secret managerze, a lokalnie w niecommitowanym `.env.local`.
