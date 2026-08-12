---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.15
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Rekomendacja do decyzji

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Rekomendacja → Warianty → Dowody, ryzyko i wysiłek → Review → Decyzja → Propozycja działania → Baseline → Pomiar. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/80-03-rekomendacje.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-15/01-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Warianty” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 2 | Warianty | `18-wsparcie-marketingowe-decyzje-dzialania/80-03-rekomendacje.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-15/02-warianty.json` | Po kroku „Warianty” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Dowody, ryzyko i wysiłek” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 3 | Dowody, ryzyko i wysiłek | `15-papa-asystent-i-laboratorium-ai/50-06-dowody.md` | `papa.evidence.read` / `query` | `fixtures/e2e/90-15/03-dowody-ryzyko-i-wysi-ek.json` | Po kroku „Dowody, ryzyko i wysiłek” obowiązuje domenowy warunek: operacja `papa.evidence.read` jest widoczna w audycie, fixture response `fixtures/api/papa.evidence.read.response.json` przechodzi walidację schema, a następna powierzchnia „Review” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 4 | Review | `18-wsparcie-marketingowe-decyzje-dzialania/80-01-centrum-decyzji.md` | `decisions.center.read` / `query` | `fixtures/e2e/90-15/04-review.json` | Po kroku „Review” obowiązuje domenowy warunek: operacja `decisions.center.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.center.read.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 5 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-15/05-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Propozycja działania” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 6 | Propozycja działania | `18-wsparcie-marketingowe-decyzje-dzialania/80-05-brief-dzialania.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-15/06-propozycja-dzia-ania.json` | Po kroku „Propozycja działania” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „Baseline” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 7 | Baseline | `07-centrum-dowodzenia/30-04-plan-vs-wynik.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-15/07-baseline.json` | Po kroku „Baseline” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 8 | Pomiar | `18-wsparcie-marketingowe-decyzje-dzialania/80-07-pomiar.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-15/08-pomiar.json` | Po kroku „Pomiar” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.15. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/dowody`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/decisions/centrum-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 8: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 8: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `AI_ACTION_APPROVAL_FAILED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
