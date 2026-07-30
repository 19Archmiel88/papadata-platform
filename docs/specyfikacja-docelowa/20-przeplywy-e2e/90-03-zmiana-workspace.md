---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.03
---
# Zmiana workspace

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Aktywny moduł → Otwarcie przełącznika workspace → Walidacja dostępu → Zmiana workspace → Zachowanie modułu albo fallback → Komunikat wpływu na dane. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Aktywny moduł | `07-centrum-dowodzenia/30-01-widok-glowny.md` | `command-center.overview.read` / `query` | `fixtures/e2e/90-03/01-aktywny-modu.json` | Po kroku „Aktywny moduł” obowiązuje domenowy warunek: operacja `command-center.overview.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Otwarcie przełącznika workspace” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 2 | Otwarcie przełącznika workspace | `06-powloka-produktu-i-nawigacja/20-06-workspace-switcher.md` | `auth.session.read` / `query` | `fixtures/e2e/90-03/02-otwarcie-prze-cznika-workspace.json` | Po kroku „Otwarcie przełącznika workspace” obowiązuje domenowy warunek: operacja `auth.session.read` jest widoczna w audycie, fixture response `fixtures/api/auth.session.read.response.json` przechodzi walidację schema, a następna powierzchnia „Walidacja dostępu” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 3 | Walidacja dostępu | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-21-rozwiazanie-dostepu.md` | `access.resolve` / `command` | `fixtures/e2e/90-03/03-walidacja-dost-pu.json` | Po kroku „Walidacja dostępu” obowiązuje domenowy warunek: operacja `access.resolve` jest widoczna w audycie, fixture response `fixtures/api/access.resolve.response.json` przechodzi walidację schema, a następna powierzchnia „Zmiana workspace” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 4 | Zmiana workspace | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-23-wybor-obszaru-roboczego.md` | `access.workspace.select` / `command` | `fixtures/e2e/90-03/04-zmiana-workspace.json` | Po kroku „Zmiana workspace” obowiązuje domenowy warunek: operacja `access.workspace.select` jest widoczna w audycie, fixture response `fixtures/api/access.workspace.select.response.json` przechodzi walidację schema, a następna powierzchnia „Zachowanie modułu albo fallback” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 5 | Zachowanie modułu albo fallback | `06-powloka-produktu-i-nawigacja/20-01-appshell.md` | `command-center.overview.read` / `query` | `fixtures/e2e/90-03/05-zachowanie-modu-u-albo-fallback.json` | Po kroku „Zachowanie modułu albo fallback” obowiązuje domenowy warunek: operacja `command-center.overview.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Komunikat wpływu na dane” jest osiągalna wyłącznie zgodnie z procesem 90.03. |
| 6 | Komunikat wpływu na dane | `06-powloka-produktu-i-nawigacja/20-08-powiadomienia.md` | `auth.session.read` / `query` | `fixtures/e2e/90-03/06-komunikat-wp-ywu-na-dane.json` | Po kroku „Komunikat wpływu na dane” obowiązuje domenowy warunek: operacja `auth.session.read` jest widoczna w audycie, fixture response `fixtures/api/auth.session.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.03. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/widok-glowny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/shell/workspace-switcher`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/auth/access-resolution`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/auth/workspace`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `WORKSPACE_SWITCH_FAILED` — `WORKSPACE_SWITCH_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/notifications`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `WORKSPACE_SWITCH_FAILED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
