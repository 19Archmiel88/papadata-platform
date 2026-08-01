---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.06
---
# Wygasły token do ponownego połączenia

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Alert integracji → Szczegóły integracji → Ponowne połączenie → Ponowne uwierzytelnienie → Wznowienie synchronizacji → Potwierdzenie. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Alert integracji | `13-integracje-i-synchronizacja/40-09-awaria-providera.md` | `integrations.provider-outage.read` / `query` | `fixtures/e2e/90-06/01-alert-integracji.json` | Po kroku „Alert integracji” obowiązuje domenowy warunek: operacja `integrations.provider-outage.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.provider-outage.read.response.json` przechodzi walidację schema, a następna powierzchnia „Szczegóły integracji” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 2 | Szczegóły integracji | `13-integracje-i-synchronizacja/40-03-szczegoly-integracji.md` | `integrations.detail.read` / `query` | `fixtures/e2e/90-06/02-szczeg-y-integracji.json` | Po kroku „Szczegóły integracji” obowiązuje domenowy warunek: operacja `integrations.detail.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne połączenie” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 3 | Ponowne połączenie | `13-integracje-i-synchronizacja/40-07-ponowne-polaczenie.md` | `integrations.reconnect.start` / `command` | `fixtures/e2e/90-06/03-ponowne-po-czenie.json` | Po kroku „Ponowne połączenie” obowiązuje domenowy warunek: operacja `integrations.reconnect.start` jest widoczna w audycie, fixture response `fixtures/api/integrations.reconnect.start.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne uwierzytelnienie” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 4 | Ponowne uwierzytelnienie | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-24-ponowne-uwierzytelnienie.md` | `auth.reauthenticate` / `command` | `fixtures/e2e/90-06/04-ponowne-uwierzytelnienie.json` | Po kroku „Ponowne uwierzytelnienie” obowiązuje domenowy warunek: operacja `auth.reauthenticate` jest widoczna w audycie, fixture response `fixtures/api/auth.reauthenticate.response.json` przechodzi walidację schema, a następna powierzchnia „Wznowienie synchronizacji” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 5 | Wznowienie synchronizacji | `13-integracje-i-synchronizacja/40-05-przebieg-synchronizacji.md` | `integrations.sync.resume` / `command` | `fixtures/e2e/90-06/05-wznowienie-synchronizacji.json` | Po kroku „Wznowienie synchronizacji” obowiązuje domenowy warunek: operacja `integrations.sync.resume` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync.resume.response.json` przechodzi walidację schema, a następna powierzchnia „Potwierdzenie” jest osiągalna wyłącznie zgodnie z procesem 90.06. |
| 6 | Potwierdzenie | `13-integracje-i-synchronizacja/40-04-historia-synchronizacji.md` | `integrations.sync-history.read` / `query` | `fixtures/e2e/90-06/06-potwierdzenie.json` | Po kroku „Potwierdzenie” obowiązuje domenowy warunek: operacja `integrations.sync-history.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync-history.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.06. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/integrations/awaria-providera`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/integrations/szczegoly-integracji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/integrations/ponowne-polaczenie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 4: zachowaj niesekretne dane formularza i route `/auth/reauthenticate`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/integrations/przebieg-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `INTEGRATION_TOKEN_EXPIRED` — `INTEGRATION_TOKEN_EXPIRED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/integrations/historia-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `INTEGRATION_TOKEN_EXPIRED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
