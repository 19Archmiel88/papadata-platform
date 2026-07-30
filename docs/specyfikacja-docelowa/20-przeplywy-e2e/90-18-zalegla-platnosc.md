---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.18
---
# Zaległa płatność

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Alert billingowy → Zaległa płatność → Bezpieczne ograniczenie → Metoda płatności → Odblokowanie. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Alert billingowy | `17-subskrypcja-i-platnosci/70-06-zalegla-platnosc.md` | `billing.overdue-payment.read` / `query` | `fixtures/e2e/90-18/01-alert-billingowy.json` | Po kroku „Alert billingowy” obowiązuje domenowy warunek: operacja `billing.overdue-payment.read` jest widoczna w audycie, fixture response `fixtures/api/billing.overdue-payment.read.response.json` przechodzi walidację schema, a następna powierzchnia „Zaległa płatność” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 2 | Zaległa płatność | `17-subskrypcja-i-platnosci/70-06-zalegla-platnosc.md` | `billing.overdue-payment.read` / `query` | `fixtures/e2e/90-18/02-zaleg-a-p-atno.json` | Po kroku „Zaległa płatność” obowiązuje domenowy warunek: operacja `billing.overdue-payment.read` jest widoczna w audycie, fixture response `fixtures/api/billing.overdue-payment.read.response.json` przechodzi walidację schema, a następna powierzchnia „Bezpieczne ograniczenie” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 3 | Bezpieczne ograniczenie | `17-subskrypcja-i-platnosci/70-02-uzycie-i-limity.md` | `billing.entitlements.read` / `query` | `fixtures/e2e/90-18/03-bezpieczne-ograniczenie.json` | Po kroku „Bezpieczne ograniczenie” obowiązuje domenowy warunek: operacja `billing.entitlements.read` jest widoczna w audycie, fixture response `fixtures/api/billing.entitlements.read.response.json` przechodzi walidację schema, a następna powierzchnia „Metoda płatności” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 4 | Metoda płatności | `17-subskrypcja-i-platnosci/70-05-platnosci.md` | `billing.payment.method.update` / `command` | `fixtures/e2e/90-18/04-metoda-p-atno-ci.json` | Po kroku „Metoda płatności” obowiązuje domenowy warunek: operacja `billing.payment.method.update` jest widoczna w audycie, fixture response `fixtures/api/billing.payment.method.update.response.json` przechodzi walidację schema, a następna powierzchnia „Odblokowanie” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 5 | Odblokowanie | `17-subskrypcja-i-platnosci/70-06-zalegla-platnosc.md` | `billing.overdue.resolve` / `command` | `fixtures/e2e/90-18/05-odblokowanie.json` | Po kroku „Odblokowanie” obowiązuje domenowy warunek: operacja `billing.overdue.resolve` jest widoczna w audycie, fixture response `fixtures/api/billing.overdue.resolve.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.18. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/billing/zalegla-platnosc`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/billing/zalegla-platnosc`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/billing/uzycie-i-limity`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/billing/platnosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/billing/zalegla-platnosc`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `MEASUREMENT_WINDOW_INCOMPLETE`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
