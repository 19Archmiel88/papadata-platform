---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.13
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Obserwacja do wyniku

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Obserwacja → Decyzja → Brief → Działanie → Pomiar → Wynik → Wniosek. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Obserwacja | `18-wsparcie-marketingowe-decyzje-dzialania/80-02-obserwacje.md` | `decisions.observation.create` / `command` | `fixtures/e2e/90-13/01-obserwacja.json` | Po kroku „Obserwacja” obowiązuje domenowy warunek: operacja `decisions.observation.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.observation.create.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 2 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-13/02-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Brief” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 3 | Brief | `18-wsparcie-marketingowe-decyzje-dzialania/80-05-brief-dzialania.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-13/03-brief.json` | Po kroku „Brief” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „Działanie” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 4 | Działanie | `18-wsparcie-marketingowe-decyzje-dzialania/80-06-szczegoly-dzialania.md` | `decisions.action-detail.read` / `query` | `fixtures/e2e/90-13/04-dzia-anie.json` | Po kroku „Działanie” obowiązuje domenowy warunek: operacja `decisions.action-detail.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.action-detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 5 | Pomiar | `18-wsparcie-marketingowe-decyzje-dzialania/80-07-pomiar.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-13/05-pomiar.json` | Po kroku „Pomiar” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wynik” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 6 | Wynik | `07-centrum-dowodzenia/30-04-plan-vs-wynik.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-13/06-wynik.json` | Po kroku „Wynik” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wniosek” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 7 | Wniosek | `18-wsparcie-marketingowe-decyzje-dzialania/80-04-rejestr-decyzji.md` | `decisions.registry.read` / `query` | `fixtures/e2e/90-13/07-wniosek.json` | Po kroku „Wniosek” obowiązuje domenowy warunek: operacja `decisions.registry.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.registry.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.13. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/decisions/obserwacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/decisions/szczegoly-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `PAPA_INTERPRETATION_UNAVAILABLE`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
