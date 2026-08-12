---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.09
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Uwaga do decyzji

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Sygnał w Centrum Dowodzenia → Kolejka uwagi → Dowody → Rekomendacja Papa → Decyzja → Pomiar. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Sygnał w Centrum Dowodzenia | `07-centrum-dowodzenia/30-12-sygnaly-sprzedazowe.md` | `command-center.sales-signals.read` / `query` | `fixtures/e2e/90-09/01-sygna-w-centrum-dowodzenia.json` | Po kroku „Sygnał w Centrum Dowodzenia” obowiązuje domenowy warunek: operacja `command-center.sales-signals.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.sales-signals.read.response.json` przechodzi walidację schema, a następna powierzchnia „Kolejka uwagi” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 2 | Kolejka uwagi | `07-centrum-dowodzenia/30-02-kolejka-uwagi.md` | `command-center.attention.queue.read` / `query` | `fixtures/e2e/90-09/02-kolejka-uwagi.json` | Po kroku „Kolejka uwagi” obowiązuje domenowy warunek: operacja `command-center.attention.queue.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.attention.queue.read.response.json` przechodzi walidację schema, a następna powierzchnia „Dowody” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 3 | Dowody | `15-papa-asystent-i-laboratorium-ai/50-06-dowody.md` | `papa.evidence.read` / `query` | `fixtures/e2e/90-09/03-dowody.json` | Po kroku „Dowody” obowiązuje domenowy warunek: operacja `papa.evidence.read` jest widoczna w audycie, fixture response `fixtures/api/papa.evidence.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja Papa” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 4 | Rekomendacja Papa | `15-papa-asystent-i-laboratorium-ai/50-11-propozycje-ai.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-09/04-rekomendacja-papa.json` | Po kroku „Rekomendacja Papa” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 5 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-09/05-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 6 | Pomiar | `18-wsparcie-marketingowe-decyzje-dzialania/80-07-pomiar.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-09/06-pomiar.json` | Po kroku „Pomiar” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.09. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/sygnaly-sprzedazowe`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/command-center/kolejka-uwagi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/dowody`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/papa/propozycje-ai`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `ATTENTION_DECISION_CONFLICT`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
