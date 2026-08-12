---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.07
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Problem danych do readiness

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Status danych → Problem jakości → Lineage → Nadrzędność źródła → Przegląd ręczny → Ponowne przetwarzanie → Gotowość poprawiona. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Status danych | `14-jakosc-danych-i-integralnosc/41-01-centrum-jakosci.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-07/01-status-danych.json` | Po kroku „Status danych” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „Problem jakości” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 2 | Problem jakości | `14-jakosc-danych-i-integralnosc/41-06-konflikty.md` | `data-quality.conflicts.read` / `query` | `fixtures/e2e/90-07/02-problem-jako-ci.json` | Po kroku „Problem jakości” obowiązuje domenowy warunek: operacja `data-quality.conflicts.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.conflicts.read.response.json` przechodzi walidację schema, a następna powierzchnia „Lineage” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 3 | Lineage | `14-jakosc-danych-i-integralnosc/41-03-pochodzenie-danych.md` | `data-quality.lineage.read` / `query` | `fixtures/e2e/90-07/03-lineage.json` | Po kroku „Lineage” obowiązuje domenowy warunek: operacja `data-quality.lineage.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.lineage.read.response.json` przechodzi walidację schema, a następna powierzchnia „Nadrzędność źródła” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 4 | Nadrzędność źródła | `14-jakosc-danych-i-integralnosc/41-05-nadrzednosc-zrodla.md` | `data-quality.source-priority.read` / `query` | `fixtures/e2e/90-07/04-nadrz-dno-r-d-a.json` | Po kroku „Nadrzędność źródła” obowiązuje domenowy warunek: operacja `data-quality.source-priority.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.source-priority.read.response.json` przechodzi walidację schema, a następna powierzchnia „Przegląd ręczny” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 5 | Przegląd ręczny | `14-jakosc-danych-i-integralnosc/41-07-przeglad-reczny.md` | `data-quality.manual-review.submit` / `command` | `fixtures/e2e/90-07/05-przegl-d-r-czny.json` | Po kroku „Przegląd ręczny” obowiązuje domenowy warunek: operacja `data-quality.manual-review.submit` jest widoczna w audycie, fixture response `fixtures/api/data-quality.manual-review.submit.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne przetwarzanie” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 6 | Ponowne przetwarzanie | `14-jakosc-danych-i-integralnosc/41-08-ponowne-przetwarzanie.md` | `data-quality.reprocess.start` / `command` | `fixtures/e2e/90-07/06-ponowne-przetwarzanie.json` | Po kroku „Ponowne przetwarzanie” obowiązuje domenowy warunek: operacja `data-quality.reprocess.start` jest widoczna w audycie, fixture response `fixtures/api/data-quality.reprocess.start.response.json` przechodzi walidację schema, a następna powierzchnia „Gotowość poprawiona” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 7 | Gotowość poprawiona | `14-jakosc-danych-i-integralnosc/41-01-centrum-jakosci.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-07/07-gotowo-poprawiona.json` | Po kroku „Gotowość poprawiona” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.07. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/data-quality/konflikty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/data-quality/pochodzenie-danych`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/data-quality/nadrzednosc-zrodla`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/data-quality/przeglad-reczny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/ponowne-przetwarzanie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `DATA_READINESS_BLOCKED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
