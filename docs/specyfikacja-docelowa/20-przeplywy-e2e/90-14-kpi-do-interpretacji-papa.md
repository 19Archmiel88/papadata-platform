---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.14
---
# KPI do interpretacji Papa

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: KPI → Otwarcie Papa → Snapshot kontekstu → Dowody → Odpowiedź → Ograniczenia → Zapis lub odrzucenie obserwacji. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | KPI | `07-centrum-dowodzenia/30-03-kpi.md` | `command-center.kpi.read` / `query` | `fixtures/e2e/90-14/01-kpi.json` | Po kroku „KPI” obowiązuje domenowy warunek: operacja `command-center.kpi.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.kpi.read.response.json` przechodzi walidację schema, a następna powierzchnia „Otwarcie Papa” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 2 | Otwarcie Papa | `15-papa-asystent-i-laboratorium-ai/50-01-panel-kontekstowy-papa.md` | `papa.context-panel.read` / `query` | `fixtures/e2e/90-14/02-otwarcie-papa.json` | Po kroku „Otwarcie Papa” obowiązuje domenowy warunek: operacja `papa.context-panel.read` jest widoczna w audycie, fixture response `fixtures/api/papa.context-panel.read.response.json` przechodzi walidację schema, a następna powierzchnia „Snapshot kontekstu” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 3 | Snapshot kontekstu | `15-papa-asystent-i-laboratorium-ai/50-04-context-basket.md` | `papa.context.capture` / `command` | `fixtures/e2e/90-14/03-snapshot-kontekstu.json` | Po kroku „Snapshot kontekstu” obowiązuje domenowy warunek: operacja `papa.context.capture` jest widoczna w audycie, fixture response `fixtures/api/papa.context.capture.response.json` przechodzi walidację schema, a następna powierzchnia „Dowody” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 4 | Dowody | `15-papa-asystent-i-laboratorium-ai/50-06-dowody.md` | `papa.evidence.read` / `query` | `fixtures/e2e/90-14/04-dowody.json` | Po kroku „Dowody” obowiązuje domenowy warunek: operacja `papa.evidence.read` jest widoczna w audycie, fixture response `fixtures/api/papa.evidence.read.response.json` przechodzi walidację schema, a następna powierzchnia „Odpowiedź” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 5 | Odpowiedź | `15-papa-asystent-i-laboratorium-ai/50-05-odpowiedz-papa.md` | `papa.answer.generate` / `command` | `fixtures/e2e/90-14/05-odpowied.json` | Po kroku „Odpowiedź” obowiązuje domenowy warunek: operacja `papa.answer.generate` jest widoczna w audycie, fixture response `fixtures/api/papa.answer.generate.response.json` przechodzi walidację schema, a następna powierzchnia „Ograniczenia” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 6 | Ograniczenia | `15-papa-asystent-i-laboratorium-ai/50-07-confidence.md` | `papa.governance.read` / `query` | `fixtures/e2e/90-14/06-ograniczenia.json` | Po kroku „Ograniczenia” obowiązuje domenowy warunek: operacja `papa.governance.read` jest widoczna w audycie, fixture response `fixtures/api/papa.governance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Zapis lub odrzucenie obserwacji” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 7 | Zapis lub odrzucenie obserwacji | `15-papa-asystent-i-laboratorium-ai/50-09-obserwacje.md` | `papa.observation.save` / `command` | `fixtures/e2e/90-14/07-zapis-lub-odrzucenie-obserwacji.json` | Po kroku „Zapis lub odrzucenie obserwacji” obowiązuje domenowy warunek: operacja `papa.observation.save` jest widoczna w audycie, fixture response `fixtures/api/papa.observation.save.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.14. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/kpi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/papa/panel-kontekstowy-papa`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/context-basket`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/papa/dowody`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/papa/odpowiedz-papa`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 6: zachowaj niesekretne dane formularza i route ``, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/papa/obserwacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `RECOMMENDATION_DECISION_CONFLICT`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
