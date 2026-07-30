---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.04
---
# KPI do rekordu źródłowego

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: KPI → Wykres → Tabela alternatywna → Źródło → Rekord źródłowy → Lineage → Problem danych. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | KPI | `07-centrum-dowodzenia/30-03-kpi.md` | `command-center.kpi.read` / `query` | `fixtures/e2e/90-04/01-kpi.json` | Po kroku „KPI” obowiązuje domenowy warunek: operacja `command-center.kpi.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.kpi.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wykres” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 2 | Wykres | `07-centrum-dowodzenia/30-04-plan-vs-wynik.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-04/02-wykres.json` | Po kroku „Wykres” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Tabela alternatywna” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 3 | Tabela alternatywna | `09-zamowienia/32-02-lista.md` | `orders.list.read` / `query` | `fixtures/e2e/90-04/03-tabela-alternatywna.json` | Po kroku „Tabela alternatywna” obowiązuje domenowy warunek: operacja `orders.list.read` jest widoczna w audycie, fixture response `fixtures/api/orders.list.read.response.json` przechodzi walidację schema, a następna powierzchnia „Źródło” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 4 | Źródło | `13-integracje-i-synchronizacja/40-03-szczegoly-integracji.md` | `integrations.detail.read` / `query` | `fixtures/e2e/90-04/04-r-d-o.json` | Po kroku „Źródło” obowiązuje domenowy warunek: operacja `integrations.detail.read` jest widoczna w audycie, fixture response `fixtures/api/integrations.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekord źródłowy” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 5 | Rekord źródłowy | `09-zamowienia/32-03-szczegoly.md` | `orders.detail.read` / `query` | `fixtures/e2e/90-04/05-rekord-r-d-owy.json` | Po kroku „Rekord źródłowy” obowiązuje domenowy warunek: operacja `orders.detail.read` jest widoczna w audycie, fixture response `fixtures/api/orders.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Lineage” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 6 | Lineage | `14-jakosc-danych-i-integralnosc/41-03-pochodzenie-danych.md` | `data-quality.lineage.read` / `query` | `fixtures/e2e/90-04/06-lineage.json` | Po kroku „Lineage” obowiązuje domenowy warunek: operacja `data-quality.lineage.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.lineage.read.response.json` przechodzi walidację schema, a następna powierzchnia „Problem danych” jest osiągalna wyłącznie zgodnie z procesem 90.04. |
| 7 | Problem danych | `14-jakosc-danych-i-integralnosc/41-06-konflikty.md` | `data-quality.conflicts.read` / `query` | `fixtures/e2e/90-04/07-problem-danych.json` | Po kroku „Problem danych” obowiązuje domenowy warunek: operacja `data-quality.conflicts.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.conflicts.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.04. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/kpi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/orders/lista`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/integrations/szczegoly-integracji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/orders/szczegoly`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/pochodzenie-danych`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `SOURCE_RECORD_UNAVAILABLE` — `SOURCE_RECORD_UNAVAILABLE` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/data-quality/konflikty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `SOURCE_RECORD_UNAVAILABLE`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
