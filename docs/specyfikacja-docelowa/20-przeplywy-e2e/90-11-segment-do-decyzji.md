---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.11
---
# Segment do decyzji

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Klienci → Segment → Kohorta → Rekomendacja → Decyzja → Działanie. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Klienci | `11-klienci/34-01-przeglad.md` | `customers.overview.read` / `query` | `fixtures/e2e/90-11/01-klienci.json` | Po kroku „Klienci” obowiązuje domenowy warunek: operacja `customers.overview.read` jest widoczna w audycie, fixture response `fixtures/api/customers.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Segment” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 2 | Segment | `11-klienci/34-02-segmenty.md` | `customers.segment.analyze` / `query` | `fixtures/e2e/90-11/02-segment.json` | Po kroku „Segment” obowiązuje domenowy warunek: operacja `customers.segment.analyze` jest widoczna w audycie, fixture response `fixtures/api/customers.segment.analyze.response.json` przechodzi walidację schema, a następna powierzchnia „Kohorta” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 3 | Kohorta | `11-klienci/34-03-kohorty.md` | `customers.cohorts.read` / `query` | `fixtures/e2e/90-11/03-kohorta.json` | Po kroku „Kohorta” obowiązuje domenowy warunek: operacja `customers.cohorts.read` jest widoczna w audycie, fixture response `fixtures/api/customers.cohorts.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 4 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/80-03-rekomendacje.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-11/04-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 5 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-11/05-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Działanie” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 6 | Działanie | `18-wsparcie-marketingowe-decyzje-dzialania/80-05-brief-dzialania.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-11/06-dzia-anie.json` | Po kroku „Działanie” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.11. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/customers/przeglad`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/customers/segmenty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/customers/kohorty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `SEGMENT_DECISION_INVALID`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
