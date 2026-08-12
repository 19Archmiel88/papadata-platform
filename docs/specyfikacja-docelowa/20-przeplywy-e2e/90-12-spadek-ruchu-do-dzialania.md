---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.12
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Spadek ruchu do działania

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Ruch → Lejek → Wykrycie spadku → Diagnoza → Rekomendacja → Działanie marketingowe. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Ruch | `12-ruch-i-lejek/35-01-przeglad-ruchu.md` | `traffic.overview.read` / `query` | `fixtures/e2e/90-12/01-ruch.json` | Po kroku „Ruch” obowiązuje domenowy warunek: operacja `traffic.overview.read` jest widoczna w audycie, fixture response `fixtures/api/traffic.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Lejek” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 2 | Lejek | `12-ruch-i-lejek/35-03-lejek-widok.md` | `traffic.funnel.read` / `query` | `fixtures/e2e/90-12/02-lejek.json` | Po kroku „Lejek” obowiązuje domenowy warunek: operacja `traffic.funnel.read` jest widoczna w audycie, fixture response `fixtures/api/traffic.funnel.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wykrycie spadku” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 3 | Wykrycie spadku | `12-ruch-i-lejek/35-07-jakosc-zdarzen.md` | `traffic.event-quality.read` / `query` | `fixtures/e2e/90-12/03-wykrycie-spadku.json` | Po kroku „Wykrycie spadku” obowiązuje domenowy warunek: operacja `traffic.event-quality.read` jest widoczna w audycie, fixture response `fixtures/api/traffic.event-quality.read.response.json` przechodzi walidację schema, a następna powierzchnia „Diagnoza” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 4 | Diagnoza | `08-kampanie-platne/31-06-diagnostyka.md` | `traffic.drop.diagnose` / `query` | `fixtures/e2e/90-12/04-diagnoza.json` | Po kroku „Diagnoza” obowiązuje domenowy warunek: operacja `traffic.drop.diagnose` jest widoczna w audycie, fixture response `fixtures/api/traffic.drop.diagnose.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 5 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/80-03-rekomendacje.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-12/05-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Działanie marketingowe” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 6 | Działanie marketingowe | `18-wsparcie-marketingowe-decyzje-dzialania/80-05-brief-dzialania.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-12/06-dzia-anie-marketingowe.json` | Po kroku „Działanie marketingowe” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.12. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/traffic/przeglad-ruchu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/traffic/lejek-widok`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/traffic/jakosc-zdarzen`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/campaigns/diagnostyka`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `TRAFFIC_DIAGNOSIS_INCOMPLETE`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
