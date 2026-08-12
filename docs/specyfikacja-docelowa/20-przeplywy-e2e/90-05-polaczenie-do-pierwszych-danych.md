---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.05
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Połączenie do pierwszych danych

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Katalog integracji → Kreator połączenia → OAuth lub API key → Zakres synchronizacji → Synchronizacja → Dane częściowe → Gotowość. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Katalog integracji | `13-integracje-i-synchronizacja/40-01-katalog-integracji.md` | `integrations.catalog.read` / `query` | `fixtures/e2e/90-05/01-katalog-integracji.json` | Po kroku „Katalog integracji” obowiązuje domenowy warunek: operacja `integrations.catalog.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.catalog.read.response.json` przechodzi walidację schema, a następna powierzchnia „Kreator połączenia” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 2 | Kreator połączenia | `13-integracje-i-synchronizacja/40-02-kreator-polaczenia.md` | `integrations.connection.create` / `command` | `fixtures/e2e/90-05/02-kreator-po-czenia.json` | Po kroku „Kreator połączenia” obowiązuje domenowy warunek: operacja `integrations.connection.create` jest widoczna w audycie, fixture response `fixtures/api/integrations.connection.create.response.json` przechodzi walidację schema, a następna powierzchnia „OAuth lub API key” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 3 | OAuth lub API key | `13-integracje-i-synchronizacja/40-02-kreator-polaczenia.md` | `integrations.oauth.callback` / `callback` | `fixtures/e2e/90-05/03-oauth-lub-api-key.json` | Po kroku „OAuth lub API key” obowiązuje domenowy warunek: operacja `integrations.oauth.callback` jest widoczna w audycie, fixture response `fixtures/api/integrations.oauth.callback.response.json` przechodzi walidację schema, a następna powierzchnia „Zakres synchronizacji” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 4 | Zakres synchronizacji | `13-integracje-i-synchronizacja/40-06-zakres-synchronizacji.md` | `integrations.sync-scope.read` / `query` | `fixtures/e2e/90-05/04-zakres-synchronizacji.json` | Po kroku „Zakres synchronizacji” obowiązuje domenowy warunek: operacja `integrations.sync-scope.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync-scope.read.response.json` przechodzi walidację schema, a następna powierzchnia „Synchronizacja” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 5 | Synchronizacja | `13-integracje-i-synchronizacja/40-05-przebieg-synchronizacji.md` | `integrations.sync.start` / `command` | `fixtures/e2e/90-05/05-synchronizacja.json` | Po kroku „Synchronizacja” obowiązuje domenowy warunek: operacja `integrations.sync.start` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync.start.response.json` przechodzi walidację schema, a następna powierzchnia „Dane częściowe” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 6 | Dane częściowe | `14-jakosc-danych-i-integralnosc/41-01-centrum-jakosci.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-05/06-dane-cz-ciowe.json` | Po kroku „Dane częściowe” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „Gotowość” jest osiągalna wyłącznie zgodnie z procesem 90.05. |
| 7 | Gotowość | `14-jakosc-danych-i-integralnosc/41-01-centrum-jakosci.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-05/07-gotowo.json` | Po kroku „Gotowość” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.05. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/integrations/katalog-integracji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/integrations/zakres-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/integrations/przebieg-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `INTEGRATION_FIRST_SYNC_FAILED` — `INTEGRATION_FIRST_SYNC_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `INTEGRATION_FIRST_SYNC_FAILED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
