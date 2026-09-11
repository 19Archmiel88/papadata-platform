---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Przepływy E2E 01–06 — dostęp i dane

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-90-01-zaproszenie-do-pierwszego-kpi"></a>

## Zaproszenie do pierwszego KPI

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Przegląd zaproszenia → Utworzenie lub powiązanie konta → Weryfikacja MFA → Wybór workspace → Onboarding → Połączenie integracji → Pierwsza synchronizacja → Pierwszy KPI → Centrum Dowodzenia. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Przegląd zaproszenia | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `invitation.validate` / `command` | `fixtures/e2e/90-01/01-przegl-d-zaproszenia.json` | Po kroku „Przegląd zaproszenia” obowiązuje domenowy warunek: operacja `invitation.validate` jest widoczna w audycie, fixture response `fixtures/api/invitation.validate.response.json` przechodzi walidację schema, a następna powierzchnia „Utworzenie lub powiązanie konta” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 2 | Utworzenie lub powiązanie konta | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `auth.register.email` / `command` | `fixtures/e2e/90-01/02-utworzenie-lub-powi-zanie-konta.json` | Po kroku „Utworzenie lub powiązanie konta” obowiązuje domenowy warunek: operacja `auth.register.email` jest widoczna w audycie, fixture response `fixtures/api/auth.register.email.response.json` przechodzi walidację schema, a następna powierzchnia „Weryfikacja MFA” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 3 | Weryfikacja MFA | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `auth.mfa.verify` / `command` | `fixtures/e2e/90-01/03-weryfikacja-mfa.json` | Po kroku „Weryfikacja MFA” obowiązuje domenowy warunek: operacja `auth.mfa.verify` jest widoczna w audycie, fixture response `fixtures/api/auth.mfa.verify.response.json` przechodzi walidację schema, a następna powierzchnia „Wybór workspace” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 4 | Wybór workspace | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `access.workspace.select` / `command` | `fixtures/e2e/90-01/04-wyb-r-workspace.json` | Po kroku „Wybór workspace” obowiązuje domenowy warunek: operacja `access.workspace.select` jest widoczna w audycie, fixture response `fixtures/api/access.workspace.select.response.json` przechodzi walidację schema, a następna powierzchnia „Onboarding” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 5 | Onboarding | `03-dostep-rejestracja-onboarding/README.md` | `onboarding.profile.update` / `command` | `fixtures/e2e/90-01/05-onboarding.json` | Po kroku „Onboarding” obowiązuje domenowy warunek: operacja `onboarding.profile.update` jest widoczna w audycie, fixture response `fixtures/api/onboarding.profile.update.response.json` przechodzi walidację schema, a następna powierzchnia „Połączenie integracji” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 6 | Połączenie integracji | `13-integracje-i-synchronizacja/README.md` | `integrations.connection.create` / `command` | `fixtures/e2e/90-01/06-po-czenie-integracji.json` | Po kroku „Połączenie integracji” obowiązuje domenowy warunek: operacja `integrations.connection.create` jest widoczna w audycie, fixture response `fixtures/api/integrations.connection.create.response.json` przechodzi walidację schema, a następna powierzchnia „Pierwsza synchronizacja” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 7 | Pierwsza synchronizacja | `13-integracje-i-synchronizacja/README.md` | `integrations.sync.start` / `command` | `fixtures/e2e/90-01/07-pierwsza-synchronizacja.json` | Po kroku „Pierwsza synchronizacja” obowiązuje domenowy warunek: operacja `integrations.sync.start` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync.start.response.json` przechodzi walidację schema, a następna powierzchnia „Pierwszy KPI” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 8 | Pierwszy KPI | `07-centrum-dowodzenia/README.md` | `command-center.kpi.read` / `query` | `fixtures/e2e/90-01/08-pierwszy-kpi.json` | Po kroku „Pierwszy KPI” obowiązuje domenowy warunek: operacja `command-center.kpi.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.kpi.read.response.json` przechodzi walidację schema, a następna powierzchnia „Centrum Dowodzenia” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 9 | Centrum Dowodzenia | `07-centrum-dowodzenia/README.md` | `command-center.overview.read` / `query` | `fixtures/e2e/90-01/09-centrum-dowodzenia.json` | Po kroku „Centrum Dowodzenia” obowiązuje domenowy warunek: operacja `command-center.overview.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.01. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/auth/invitation`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/auth/register`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/auth/mfa`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/auth/workspace`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/onboarding`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/integrations/przebieg-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 8: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 8: zachowaj niesekretne dane formularza i route `/app/command-center/kpi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 9: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 9: zachowaj niesekretne dane formularza i route `/app/command-center/widok-glowny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `INVITATION_OR_ACCESS_FAILED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-02-onboarding-do-pierwszej-wartosci"></a>

## Onboarding do pierwszej wartości

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Profil działalności → Identyfikacja firmy → Karta pilotażu → Integracja → Dane częściowe → Pierwszy insight → Rekomendacja. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Profil działalności | `03-dostep-rejestracja-onboarding/README.md` | `onboarding.profile.update` / `command` | `fixtures/e2e/90-02/01-profil-dzia-alno-ci.json` | Po kroku „Profil działalności” obowiązuje domenowy warunek: operacja `onboarding.profile.update` jest widoczna w audycie, fixture response `fixtures/api/onboarding.profile.update.response.json` przechodzi walidację schema, a następna powierzchnia „Identyfikacja firmy” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 2 | Identyfikacja firmy | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `company.lookup` / `query` | `fixtures/e2e/90-02/02-identyfikacja-firmy.json` | Po kroku „Identyfikacja firmy” obowiązuje domenowy warunek: operacja `company.lookup` jest widoczna w audycie, fixture response `fixtures/api/company.lookup.response.json` przechodzi walidację schema, a następna powierzchnia „Karta pilotażu” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 3 | Karta pilotażu | `17-subskrypcja-i-platnosci/README.md` | `billing.pilot.read` / `query` | `fixtures/e2e/90-02/03-karta-pilota-u.json` | Po kroku „Karta pilotażu” obowiązuje domenowy warunek: operacja `billing.pilot.read` jest widoczna w audycie, fixture response `fixtures/api/billing.pilot.read.response.json` przechodzi walidację schema, a następna powierzchnia „Integracja” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 4 | Integracja | `13-integracje-i-synchronizacja/README.md` | `integrations.connection.create` / `command` | `fixtures/e2e/90-02/04-integracja.json` | Po kroku „Integracja” obowiązuje domenowy warunek: operacja `integrations.connection.create` jest widoczna w audycie, fixture response `fixtures/api/integrations.connection.create.response.json` przechodzi walidację schema, a następna powierzchnia „Dane częściowe” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 5 | Dane częściowe | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-02/05-dane-cz-ciowe.json` | Po kroku „Dane częściowe” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „Pierwszy insight” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 6 | Pierwszy insight | `07-centrum-dowodzenia/README.md` | `command-center.ai-recommendations.read` / `query` | `fixtures/e2e/90-02/06-pierwszy-insight.json` | Po kroku „Pierwszy insight” obowiązuje domenowy warunek: operacja `command-center.ai-recommendations.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.ai-recommendations.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 7 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-02/07-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.02. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/onboarding/profile`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 2: zachowaj niesekretne dane formularza i route `/auth/company`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/billing/pilot-do-abonamentu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/command-center/rekomendacje-ai-skrot`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `ONBOARDING_FIRST_VALUE_BLOCKED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-03-zmiana-workspace"></a>

## Zmiana workspace

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Aktywny moduł → Otwarcie przełącznika workspace → Walidacja dostępu → Zmiana workspace → Zachowanie modułu albo fallback → Komunikat wpływu na dane. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Aktywny moduł | `07-centrum-dowodzenia/README.md` | `command-center.overview.read` / `query` | `fixtures/e2e/90-03/01-aktywny-modu.json` | Po kroku „Aktywny moduł” obowiązuje domenowy warunek: operacja `command-center.overview.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Otwarcie przełącznika workspace” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 2 | Otwarcie przełącznika workspace | `06-powloka-produktu-i-nawigacja/README.md` | `auth.session.read` / `query` | `fixtures/e2e/90-03/02-otwarcie-prze-cznika-workspace.json` | Po kroku „Otwarcie przełącznika workspace” obowiązuje domenowy warunek: operacja `auth.session.read` jest widoczna w audycie, fixture response `fixtures/api/auth.session.read.response.json` przechodzi walidację schema, a następna powierzchnia „Walidacja dostępu” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 3 | Walidacja dostępu | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `access.resolve` / `command` | `fixtures/e2e/90-03/03-walidacja-dost-pu.json` | Po kroku „Walidacja dostępu” obowiązuje domenowy warunek: operacja `access.resolve` jest widoczna w audycie, fixture response `fixtures/api/access.resolve.response.json` przechodzi walidację schema, a następna powierzchnia „Zmiana workspace” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 4 | Zmiana workspace | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `access.workspace.select` / `command` | `fixtures/e2e/90-03/04-zmiana-workspace.json` | Po kroku „Zmiana workspace” obowiązuje domenowy warunek: operacja `access.workspace.select` jest widoczna w audycie, fixture response `fixtures/api/access.workspace.select.response.json` przechodzi walidację schema, a następna powierzchnia „Zachowanie modułu albo fallback” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 5 | Zachowanie modułu albo fallback | `06-powloka-produktu-i-nawigacja/README.md` | `command-center.overview.read` / `query` | `fixtures/e2e/90-03/05-zachowanie-modu-u-albo-fallback.json` | Po kroku „Zachowanie modułu albo fallback” obowiązuje domenowy warunek: operacja `command-center.overview.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Komunikat wpływu na dane” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 6 | Komunikat wpływu na dane | `06-powloka-produktu-i-nawigacja/README.md` | `auth.session.read` / `query` | `fixtures/e2e/90-03/06-komunikat-wp-ywu-na-dane.json` | Po kroku „Komunikat wpływu na dane” obowiązuje domenowy warunek: operacja `auth.session.read` jest widoczna w audycie, fixture response `fixtures/api/auth.session.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.03. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/widok-glowny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/shell/workspace-switcher`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/auth/access-resolution`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/auth/workspace`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/notifications`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `WORKSPACE_SWITCH_FAILED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-04-kpi-do-rekordu-zrodlowego"></a>

## KPI do rekordu źródłowego

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: KPI → Wykres → Tabela alternatywna → Źródło → Rekord źródłowy → Lineage → Problem danych. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | KPI | `07-centrum-dowodzenia/README.md` | `command-center.kpi.read` / `query` | `fixtures/e2e/90-04/01-kpi.json` | Po kroku „KPI” obowiązuje domenowy warunek: operacja `command-center.kpi.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.kpi.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wykres” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 2 | Wykres | `07-centrum-dowodzenia/README.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-04/02-wykres.json` | Po kroku „Wykres” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Tabela alternatywna” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 3 | Tabela alternatywna | `09-zamowienia/README.md` | `orders.list.read` / `query` | `fixtures/e2e/90-04/03-tabela-alternatywna.json` | Po kroku „Tabela alternatywna” obowiązuje domenowy warunek: operacja `orders.list.read` jest widoczna w audycie, fixture response `fixtures/api/orders.list.read.response.json` przechodzi walidację schema, a następna powierzchnia „Źródło” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 4 | Źródło | `13-integracje-i-synchronizacja/README.md` | `integrations.detail.read` / `query` | `fixtures/e2e/90-04/04-r-d-o.json` | Po kroku „Źródło” obowiązuje domenowy warunek: operacja `integrations.detail.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekord źródłowy” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 5 | Rekord źródłowy | `09-zamowienia/README.md` | `orders.detail.read` / `query` | `fixtures/e2e/90-04/05-rekord-r-d-owy.json` | Po kroku „Rekord źródłowy” obowiązuje domenowy warunek: operacja `orders.detail.read` jest widoczna w audycie, fixture response `fixtures/api/orders.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Lineage” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 6 | Lineage | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.lineage.read` / `query` | `fixtures/e2e/90-04/06-lineage.json` | Po kroku „Lineage” obowiązuje domenowy warunek: operacja `data-quality.lineage.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.lineage.read.response.json` przechodzi walidację schema, a następna powierzchnia „Problem danych” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 7 | Problem danych | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.conflicts.read` / `query` | `fixtures/e2e/90-04/07-problem-danych.json` | Po kroku „Problem danych” obowiązuje domenowy warunek: operacja `data-quality.conflicts.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.conflicts.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.04. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/kpi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/orders/lista`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/integrations/szczegoly-integracji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/orders/szczegoly`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/pochodzenie-danych`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/data-quality/konflikty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `SOURCE_RECORD_UNAVAILABLE`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-05-polaczenie-do-pierwszych-danych"></a>

## Połączenie do pierwszych danych

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Katalog integracji → Kreator połączenia → OAuth lub API key → Zakres synchronizacji → Synchronizacja → Dane częściowe → Gotowość. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Katalog integracji | `13-integracje-i-synchronizacja/README.md` | `integrations.catalog.read` / `query` | `fixtures/e2e/90-05/01-katalog-integracji.json` | Po kroku „Katalog integracji” obowiązuje domenowy warunek: operacja `integrations.catalog.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.catalog.read.response.json` przechodzi walidację schema, a następna powierzchnia „Kreator połączenia” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 2 | Kreator połączenia | `13-integracje-i-synchronizacja/README.md` | `integrations.connection.create` / `command` | `fixtures/e2e/90-05/02-kreator-po-czenia.json` | Po kroku „Kreator połączenia” obowiązuje domenowy warunek: operacja `integrations.connection.create` jest widoczna w audycie, fixture response `fixtures/api/integrations.connection.create.response.json` przechodzi walidację schema, a następna powierzchnia „OAuth lub API key” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 3 | OAuth lub API key | `13-integracje-i-synchronizacja/README.md` | `integrations.oauth.callback` / `callback` | `fixtures/e2e/90-05/03-oauth-lub-api-key.json` | Po kroku „OAuth lub API key” obowiązuje domenowy warunek: operacja `integrations.oauth.callback` jest widoczna w audycie, fixture response `fixtures/api/integrations.oauth.callback.response.json` przechodzi walidację schema, a następna powierzchnia „Zakres synchronizacji” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 4 | Zakres synchronizacji | `13-integracje-i-synchronizacja/README.md` | `integrations.sync-scope.read` / `query` | `fixtures/e2e/90-05/04-zakres-synchronizacji.json` | Po kroku „Zakres synchronizacji” obowiązuje domenowy warunek: operacja `integrations.sync-scope.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync-scope.read.response.json` przechodzi walidację schema, a następna powierzchnia „Synchronizacja” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 5 | Synchronizacja | `13-integracje-i-synchronizacja/README.md` | `integrations.sync.start` / `command` | `fixtures/e2e/90-05/05-synchronizacja.json` | Po kroku „Synchronizacja” obowiązuje domenowy warunek: operacja `integrations.sync.start` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync.start.response.json` przechodzi walidację schema, a następna powierzchnia „Dane częściowe” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 6 | Dane częściowe | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-05/06-dane-cz-ciowe.json` | Po kroku „Dane częściowe” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „Gotowość” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 7 | Gotowość | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-05/07-gotowo.json` | Po kroku „Gotowość” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.05. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/integrations/katalog-integracji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/integrations/zakres-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/integrations/przebieg-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `INTEGRATION_FIRST_SYNC_FAILED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-06-wygasly-token-do-ponownego-polaczenia"></a>

## Wygasły token do ponownego połączenia

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Alert integracji → Szczegóły integracji → Ponowne połączenie → Ponowne uwierzytelnienie → Wznowienie synchronizacji → Potwierdzenie. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Alert integracji | `13-integracje-i-synchronizacja/README.md` | `integrations.provider-outage.read` / `query` | `fixtures/e2e/90-06/01-alert-integracji.json` | Po kroku „Alert integracji” obowiązuje domenowy warunek: operacja `integrations.provider-outage.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.provider-outage.read.response.json` przechodzi walidację schema, a następna powierzchnia „Szczegóły integracji” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 2 | Szczegóły integracji | `13-integracje-i-synchronizacja/README.md` | `integrations.detail.read` / `query` | `fixtures/e2e/90-06/02-szczeg-y-integracji.json` | Po kroku „Szczegóły integracji” obowiązuje domenowy warunek: operacja `integrations.detail.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne połączenie” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 3 | Ponowne połączenie | `13-integracje-i-synchronizacja/README.md` | `integrations.reconnect.start` / `command` | `fixtures/e2e/90-06/03-ponowne-po-czenie.json` | Po kroku „Ponowne połączenie” obowiązuje domenowy warunek: operacja `integrations.reconnect.start` jest widoczna w audycie, fixture response `fixtures/api/integrations.reconnect.start.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne uwierzytelnienie” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 4 | Ponowne uwierzytelnienie | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `auth.reauthenticate` / `command` | `fixtures/e2e/90-06/04-ponowne-uwierzytelnienie.json` | Po kroku „Ponowne uwierzytelnienie” obowiązuje domenowy warunek: operacja `auth.reauthenticate` jest widoczna w audycie, fixture response `fixtures/api/auth.reauthenticate.response.json` przechodzi walidację schema, a następna powierzchnia „Wznowienie synchronizacji” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 5 | Wznowienie synchronizacji | `13-integracje-i-synchronizacja/README.md` | `integrations.sync.resume` / `command` | `fixtures/e2e/90-06/05-wznowienie-synchronizacji.json` | Po kroku „Wznowienie synchronizacji” obowiązuje domenowy warunek: operacja `integrations.sync.resume` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync.resume.response.json` przechodzi walidację schema, a następna powierzchnia „Potwierdzenie” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 6 | Potwierdzenie | `13-integracje-i-synchronizacja/README.md` | `integrations.sync-history.read` / `query` | `fixtures/e2e/90-06/06-potwierdzenie.json` | Po kroku „Potwierdzenie” obowiązuje domenowy warunek: operacja `integrations.sync-history.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync-history.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.06. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/integrations/awaria-providera`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/integrations/szczegoly-integracji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/integrations/ponowne-polaczenie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 4: zachowaj niesekretne dane formularza i route `/auth/reauthenticate`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/integrations/przebieg-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/integrations/historia-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `INTEGRATION_TOKEN_EXPIRED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.
