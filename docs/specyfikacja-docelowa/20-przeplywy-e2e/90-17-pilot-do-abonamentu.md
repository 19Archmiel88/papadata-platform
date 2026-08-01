---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.17
---
# Pilot do abonamentu

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Pilot → Użycie → Dowód wartości → Plan → Płatność → Abonament → Entitlements. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Pilot | `17-subskrypcja-i-platnosci/70-09-pilot-do-abonamentu.md` | `billing.pilot.read` / `query` | `fixtures/e2e/90-17/01-pilot.json` | Po kroku „Pilot” obowiązuje domenowy warunek: operacja `billing.pilot.read` jest widoczna w audycie, fixture response `fixtures/api/billing.pilot.read.response.json` przechodzi walidację schema, a następna powierzchnia „Użycie” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 2 | Użycie | `17-subskrypcja-i-platnosci/70-02-uzycie-i-limity.md` | `billing.usage-limits.read` / `query` | `fixtures/e2e/90-17/02-u-ycie.json` | Po kroku „Użycie” obowiązuje domenowy warunek: operacja `billing.usage-limits.read` jest widoczna w audycie, fixture response `fixtures/api/billing.usage-limits.read.response.json` przechodzi walidację schema, a następna powierzchnia „Dowód wartości” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 3 | Dowód wartości | `07-centrum-dowodzenia/30-04-plan-vs-wynik.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-17/03-dow-d-warto-ci.json` | Po kroku „Dowód wartości” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Plan” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 4 | Plan | `17-subskrypcja-i-platnosci/70-03-plany.md` | `billing.plan.select` / `command` | `fixtures/e2e/90-17/04-plan.json` | Po kroku „Plan” obowiązuje domenowy warunek: operacja `billing.plan.select` jest widoczna w audycie, fixture response `fixtures/api/billing.plan.select.response.json` przechodzi walidację schema, a następna powierzchnia „Płatność” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 5 | Płatność | `17-subskrypcja-i-platnosci/70-05-platnosci.md` | `billing.payment.method.update` / `command` | `fixtures/e2e/90-17/05-p-atno.json` | Po kroku „Płatność” obowiązuje domenowy warunek: operacja `billing.payment.method.update` jest widoczna w audycie, fixture response `fixtures/api/billing.payment.method.update.response.json` przechodzi walidację schema, a następna powierzchnia „Abonament” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 6 | Abonament | `17-subskrypcja-i-platnosci/70-01-subskrypcja.md` | `billing.subscription.activate` / `command` | `fixtures/e2e/90-17/06-abonament.json` | Po kroku „Abonament” obowiązuje domenowy warunek: operacja `billing.subscription.activate` jest widoczna w audycie, fixture response `fixtures/api/billing.subscription.activate.response.json` przechodzi walidację schema, a następna powierzchnia „Entitlements” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 7 | Entitlements | `17-subskrypcja-i-platnosci/70-02-uzycie-i-limity.md` | `billing.entitlements.read` / `query` | `fixtures/e2e/90-17/07-entitlements.json` | Po kroku „Entitlements” obowiązuje domenowy warunek: operacja `billing.entitlements.read` jest widoczna w audycie, fixture response `fixtures/api/billing.entitlements.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.17. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/billing/pilot-do-abonamentu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/billing/uzycie-i-limity`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/billing/plany`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/billing/platnosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/billing/subskrypcja`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/billing/uzycie-i-limity`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `OVERDUE_PAYMENT_UNRESOLVED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
