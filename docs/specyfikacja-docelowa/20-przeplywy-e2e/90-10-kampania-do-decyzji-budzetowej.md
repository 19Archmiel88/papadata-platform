---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.10
---
# Kampania do decyzji budżetowej

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Kampanie → Analiza ROAS → Budżet → Rekomendacja → Zatwierdzenie → Pomiar rezultatu. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Kampanie | `08-kampanie-platne/31-01-przeglad.md` | `campaigns.overview.read` / `query` | `fixtures/e2e/90-10/01-kampanie.json` | Po kroku „Kampanie” obowiązuje domenowy warunek: operacja `campaigns.overview.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Analiza ROAS” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 2 | Analiza ROAS | `08-kampanie-platne/31-04-atrybucja-i-sprzedaz.md` | `campaigns.attribution-sales.read` / `query` | `fixtures/e2e/90-10/02-analiza-roas.json` | Po kroku „Analiza ROAS” obowiązuje domenowy warunek: operacja `campaigns.attribution-sales.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.attribution-sales.read.response.json` przechodzi walidację schema, a następna powierzchnia „Budżet” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 3 | Budżet | `08-kampanie-platne/31-05-budzet.md` | `campaigns.budget.read` / `query` | `fixtures/e2e/90-10/03-bud-et.json` | Po kroku „Budżet” obowiązuje domenowy warunek: operacja `campaigns.budget.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.budget.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 4 | Rekomendacja | `08-kampanie-platne/31-07-rekomendacje-kontekst-domenowy.md` | `campaigns.budget.recommendation.read` / `query` | `fixtures/e2e/90-10/04-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `campaigns.budget.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.budget.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Zatwierdzenie” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 5 | Zatwierdzenie | `18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-10/05-zatwierdzenie.json` | Po kroku „Zatwierdzenie” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar rezultatu” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 6 | Pomiar rezultatu | `18-wsparcie-marketingowe-decyzje-dzialania/80-07-pomiar.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-10/06-pomiar-rezultatu.json` | Po kroku „Pomiar rezultatu” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.10. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/campaigns/przeglad`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/campaigns/atrybucja-i-sprzedaz`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/campaigns/budzet`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/campaigns/rekomendacje-kontekst-domenowy`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `BUDGET_DECISION_CONFLICT`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
