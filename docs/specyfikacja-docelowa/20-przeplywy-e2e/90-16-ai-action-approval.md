---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.16
---
# AI Action approval

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Policy check → Dokładna operacja → Cel → Wpływ → Rollback → Capability → MFA lub reauth → Approve albo reject → Wykonanie → Audyt → Outcome. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Policy check | `15-papa-asystent-i-laboratorium-ai/50-12-ai-action-approval.md` | `papa.ai.action.validate` / `command` | `fixtures/e2e/90-16/01-policy-check.json` | Po kroku „Policy check” obowiązuje domenowy warunek: operacja `papa.ai.action.validate` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.validate.response.json` przechodzi walidację schema, a następna powierzchnia „Dokładna operacja” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 2 | Dokładna operacja | `15-papa-asystent-i-laboratorium-ai/50-13-ai-actions.md` | `papa.actions.read` / `query` | `fixtures/e2e/90-16/02-dok-adna-operacja.json` | Po kroku „Dokładna operacja” obowiązuje domenowy warunek: operacja `papa.actions.read` jest widoczna w audycie, fixture response `fixtures/api/papa.actions.read.response.json` przechodzi walidację schema, a następna powierzchnia „Cel” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 3 | Cel | `15-papa-asystent-i-laboratorium-ai/50-12-ai-action-approval.md` | `papa.ai.action.validate` / `command` | `fixtures/e2e/90-16/03-cel.json` | Po kroku „Cel” obowiązuje domenowy warunek: operacja `papa.ai.action.validate` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.validate.response.json` przechodzi walidację schema, a następna powierzchnia „Wpływ” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 4 | Wpływ | `10-produkty/33-08-analiza-wplywu.md` | `products.impact.read` / `query` | `fixtures/e2e/90-16/04-wp-yw.json` | Po kroku „Wpływ” obowiązuje domenowy warunek: operacja `products.impact.read` jest widoczna w audycie, fixture response `fixtures/api/products.impact.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rollback” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 5 | Rollback | `15-papa-asystent-i-laboratorium-ai/50-12-ai-action-approval.md` | `papa.ai.action.rollback` / `command` | `fixtures/e2e/90-16/05-rollback.json` | Po kroku „Rollback” obowiązuje domenowy warunek: operacja `papa.ai.action.rollback` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.rollback.response.json` przechodzi walidację schema, a następna powierzchnia „Capability” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 6 | Capability | `15-papa-asystent-i-laboratorium-ai/50-16-ustawienia-ai-i-governance.md` | `papa.governance.read` / `query` | `fixtures/e2e/90-16/06-capability.json` | Po kroku „Capability” obowiązuje domenowy warunek: operacja `papa.governance.read` jest widoczna w audycie, fixture response `fixtures/api/papa.governance.read.response.json` przechodzi walidację schema, a następna powierzchnia „MFA lub reauth” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 7 | MFA lub reauth | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-24-ponowne-uwierzytelnienie.md` | `auth.reauthenticate` / `command` | `fixtures/e2e/90-16/07-mfa-lub-reauth.json` | Po kroku „MFA lub reauth” obowiązuje domenowy warunek: operacja `auth.reauthenticate` jest widoczna w audycie, fixture response `fixtures/api/auth.reauthenticate.response.json` przechodzi walidację schema, a następna powierzchnia „Approve albo reject” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 8 | Approve albo reject | `15-papa-asystent-i-laboratorium-ai/50-12-ai-action-approval.md` | `papa.ai.action.approve` / `command` | `fixtures/e2e/90-16/08-approve-albo-reject.json` | Po kroku „Approve albo reject” obowiązuje domenowy warunek: operacja `papa.ai.action.approve` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.approve.response.json` przechodzi walidację schema, a następna powierzchnia „Wykonanie” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 9 | Wykonanie | `15-papa-asystent-i-laboratorium-ai/50-13-ai-actions.md` | `papa.ai.action.execute` / `job` | `fixtures/e2e/90-16/09-wykonanie.json` | Po kroku „Wykonanie” obowiązuje domenowy warunek: operacja `papa.ai.action.execute` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.execute.response.json` przechodzi walidację schema, a następna powierzchnia „Audyt” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 10 | Audyt | `16-ustawienia-zespol-bezpieczenstwo/60-07-audyt.md` | `settings.audit.read` / `query` | `fixtures/e2e/90-16/10-audyt.json` | Po kroku „Audyt” obowiązuje domenowy warunek: operacja `settings.audit.read` jest widoczna w audycie, fixture response `fixtures/api/settings.audit.read.response.json` przechodzi walidację schema, a następna powierzchnia „Outcome” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 11 | Outcome | `18-wsparcie-marketingowe-decyzje-dzialania/80-07-pomiar.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-16/11-outcome.json` | Po kroku „Outcome” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.16. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/papa/ai-actions`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/products/analiza-wplywu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/papa/ustawienia-ai-i-governance`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/auth/reauthenticate`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 8: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 8: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 9: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 9: zachowaj niesekretne dane formularza i route `/app/papa/ai-actions`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 10: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 10: zachowaj niesekretne dane formularza i route `/app/settings/audyt`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 11: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 11: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `SUBSCRIPTION_ACTIVATION_FAILED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
