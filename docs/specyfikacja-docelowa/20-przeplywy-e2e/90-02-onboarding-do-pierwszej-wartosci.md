---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.02
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Onboarding do pierwszej wartości

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Profil działalności → Identyfikacja firmy → Karta pilotażu → Integracja → Dane częściowe → Pierwszy insight → Rekomendacja. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Profil działalności | `03-dostep-rejestracja-onboarding/katalogi/25-10-onboarding.md` | `onboarding.profile.update` / `command` | `fixtures/e2e/90-02/01-profil-dzia-alno-ci.json` | Po kroku „Profil działalności” obowiązuje domenowy warunek: operacja `onboarding.profile.update` jest widoczna w audycie, fixture response `fixtures/api/onboarding.profile.update.response.json` przechodzi walidację schema, a następna powierzchnia „Identyfikacja firmy” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 2 | Identyfikacja firmy | `03-dostep-rejestracja-onboarding/powierzchnie-auth/auth-07-identyfikacja-firmy.md` | `company.lookup` / `query` | `fixtures/e2e/90-02/02-identyfikacja-firmy.json` | Po kroku „Identyfikacja firmy” obowiązuje domenowy warunek: operacja `company.lookup` jest widoczna w audycie, fixture response `fixtures/api/company.lookup.response.json` przechodzi walidację schema, a następna powierzchnia „Karta pilotażu” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 3 | Karta pilotażu | `17-subskrypcja-i-platnosci/70-09-pilot-do-abonamentu.md` | `billing.pilot.read` / `query` | `fixtures/e2e/90-02/03-karta-pilota-u.json` | Po kroku „Karta pilotażu” obowiązuje domenowy warunek: operacja `billing.pilot.read` jest widoczna w audycie, fixture response `fixtures/api/billing.pilot.read.response.json` przechodzi walidację schema, a następna powierzchnia „Integracja” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 4 | Integracja | `13-integracje-i-synchronizacja/40-02-kreator-polaczenia.md` | `integrations.connection.create` / `command` | `fixtures/e2e/90-02/04-integracja.json` | Po kroku „Integracja” obowiązuje domenowy warunek: operacja `integrations.connection.create` jest widoczna w audycie, fixture response `fixtures/api/integrations.connection.create.response.json` przechodzi walidację schema, a następna powierzchnia „Dane częściowe” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 5 | Dane częściowe | `14-jakosc-danych-i-integralnosc/41-01-centrum-jakosci.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-02/05-dane-cz-ciowe.json` | Po kroku „Dane częściowe” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „Pierwszy insight” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 6 | Pierwszy insight | `07-centrum-dowodzenia/30-11-rekomendacje-ai-skrot.md` | `command-center.ai-recommendations.read` / `query` | `fixtures/e2e/90-02/06-pierwszy-insight.json` | Po kroku „Pierwszy insight” obowiązuje domenowy warunek: operacja `command-center.ai-recommendations.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.ai-recommendations.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.02. |
| 7 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/80-03-rekomendacje.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-02/07-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.02. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/onboarding/profile`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 2: zachowaj niesekretne dane formularza i route `/auth/company`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/billing/pilot-do-abonamentu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/integrations/kreator-polaczenia`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/command-center/rekomendacje-ai-skrot`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `ONBOARDING_FIRST_VALUE_BLOCKED` — `ONBOARDING_FIRST_VALUE_BLOCKED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `ONBOARDING_FIRST_VALUE_BLOCKED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
