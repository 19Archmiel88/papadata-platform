---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.01
---
# Zaproszenie do pierwszego KPI

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Przegląd zaproszenia → Utworzenie lub powiązanie konta → Weryfikacja MFA → Wybór workspace → Onboarding → Połączenie integracji → Pierwsza synchronizacja → Pierwszy KPI → Centrum Dowodzenia. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Przegląd zaproszenia | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-15-przeglad-zaproszenia.md` | `invitation.validate` / `command` | `fixtures/e2e/90-01/01-przegl-d-zaproszenia.json` | Po kroku „Przegląd zaproszenia” obowiązuje domenowy warunek: operacja `invitation.validate` jest widoczna w audycie, fixture response `fixtures/api/invitation.validate.response.json` przechodzi walidację schema, a następna powierzchnia „Utworzenie lub powiązanie konta” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 2 | Utworzenie lub powiązanie konta | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-04-rejestracja-adresem-e-mail.md` | `auth.register.email` / `command` | `fixtures/e2e/90-01/02-utworzenie-lub-powi-zanie-konta.json` | Po kroku „Utworzenie lub powiązanie konta” obowiązuje domenowy warunek: operacja `auth.register.email` jest widoczna w audycie, fixture response `fixtures/api/auth.register.email.response.json` przechodzi walidację schema, a następna powierzchnia „Weryfikacja MFA” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 3 | Weryfikacja MFA | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-16-weryfikacja-mfa.md` | `auth.mfa.verify` / `command` | `fixtures/e2e/90-01/03-weryfikacja-mfa.json` | Po kroku „Weryfikacja MFA” obowiązuje domenowy warunek: operacja `auth.mfa.verify` jest widoczna w audycie, fixture response `fixtures/api/auth.mfa.verify.response.json` przechodzi walidację schema, a następna powierzchnia „Wybór workspace” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 4 | Wybór workspace | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-23-wybor-obszaru-roboczego.md` | `access.workspace.select` / `command` | `fixtures/e2e/90-01/04-wyb-r-workspace.json` | Po kroku „Wybór workspace” obowiązuje domenowy warunek: operacja `access.workspace.select` jest widoczna w audycie, fixture response `fixtures/api/access.workspace.select.response.json` przechodzi walidację schema, a następna powierzchnia „Onboarding” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 5 | Onboarding | `03-dostep-rejestracja-onboarding/katalogi/25-10-onboarding.md` | `onboarding.profile.update` / `command` | `fixtures/e2e/90-01/05-onboarding.json` | Po kroku „Onboarding” obowiązuje domenowy warunek: operacja `onboarding.profile.update` jest widoczna w audycie, fixture response `fixtures/api/onboarding.profile.update.response.json` przechodzi walidację schema, a następna powierzchnia „Połączenie integracji” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 6 | Połączenie integracji | `13-integracje-i-synchronizacja/40-02-kreator-polaczenia.md` | `integrations.connection.create` / `command` | `fixtures/e2e/90-01/06-po-czenie-integracji.json` | Po kroku „Połączenie integracji” obowiązuje domenowy warunek: operacja `integrations.connection.create` jest widoczna w audycie, fixture response `fixtures/api/integrations.connection.create.response.json` przechodzi walidację schema, a następna powierzchnia „Pierwsza synchronizacja” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 7 | Pierwsza synchronizacja | `13-integracje-i-synchronizacja/40-05-przebieg-synchronizacji.md` | `integrations.sync.start` / `command` | `fixtures/e2e/90-01/07-pierwsza-synchronizacja.json` | Po kroku „Pierwsza synchronizacja” obowiązuje domenowy warunek: operacja `integrations.sync.start` jest widoczna w audycie, fixture response `fixtures/api/integrations.sync.start.response.json` przechodzi walidację schema, a następna powierzchnia „Pierwszy KPI” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 8 | Pierwszy KPI | `07-centrum-dowodzenia/30-03-kpi.md` | `command-center.kpi.read` / `query` | `fixtures/e2e/90-01/08-pierwszy-kpi.json` | Po kroku „Pierwszy KPI” obowiązuje domenowy warunek: operacja `command-center.kpi.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.kpi.read.response.json` przechodzi walidację schema, a następna powierzchnia „Centrum Dowodzenia” jest osiągalna wyłącznie zgodnie z procesem 90.01. |
| 9 | Centrum Dowodzenia | `07-centrum-dowodzenia/30-01-widok-glowny.md` | `command-center.overview.read` / `query` | `fixtures/e2e/90-01/09-centrum-dowodzenia.json` | Po kroku „Centrum Dowodzenia” obowiązuje domenowy warunek: operacja `command-center.overview.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.01. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/auth/invitation`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/auth/register`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/auth/mfa`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/auth/workspace`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/onboarding`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/integrations/przebieg-synchronizacji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 8: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 8: zachowaj niesekretne dane formularza i route `/app/command-center/kpi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 9: `INVITATION_OR_ACCESS_FAILED` — `INVITATION_OR_ACCESS_FAILED` dla kroku 9: zachowaj niesekretne dane formularza i route `/app/command-center/widok-glowny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `INVITATION_OR_ACCESS_FAILED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
