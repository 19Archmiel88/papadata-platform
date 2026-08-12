---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
document_type: e2e-flow
flow_id: 90.08
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---
# Produkt do ponownego przetwarzania

## Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Produkt → Mapowanie → Konflikt → Przegląd ręczny → Ponowne przetwarzanie → Rekoncyliacja. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

## Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Produkt | `10-produkty/33-03-szczegoly.md` | `products.detail.read` / `query` | `fixtures/e2e/90-08/01-produkt.json` | Po kroku „Produkt” obowiązuje domenowy warunek: operacja `products.detail.read` jest widoczna w audycie, fixture response `fixtures/api/products.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Mapowanie” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 2 | Mapowanie | `10-produkty/33-04-mapowanie.md` | `products.mapping.update` / `command` | `fixtures/e2e/90-08/02-mapowanie.json` | Po kroku „Mapowanie” obowiązuje domenowy warunek: operacja `products.mapping.update` jest widoczna w audycie, fixture response `fixtures/api/products.mapping.update.response.json` przechodzi walidację schema, a następna powierzchnia „Konflikt” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 3 | Konflikt | `14-jakosc-danych-i-integralnosc/41-06-konflikty.md` | `data-quality.conflicts.read` / `query` | `fixtures/e2e/90-08/03-konflikt.json` | Po kroku „Konflikt” obowiązuje domenowy warunek: operacja `data-quality.conflicts.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.conflicts.read.response.json` przechodzi walidację schema, a następna powierzchnia „Przegląd ręczny” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 4 | Przegląd ręczny | `14-jakosc-danych-i-integralnosc/41-07-przeglad-reczny.md` | `data-quality.manual-review.submit` / `command` | `fixtures/e2e/90-08/04-przegl-d-r-czny.json` | Po kroku „Przegląd ręczny” obowiązuje domenowy warunek: operacja `data-quality.manual-review.submit` jest widoczna w audycie, fixture response `fixtures/api/data-quality.manual-review.submit.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne przetwarzanie” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 5 | Ponowne przetwarzanie | `14-jakosc-danych-i-integralnosc/41-08-ponowne-przetwarzanie.md` | `data-quality.reprocess.start` / `command` | `fixtures/e2e/90-08/05-ponowne-przetwarzanie.json` | Po kroku „Ponowne przetwarzanie” obowiązuje domenowy warunek: operacja `data-quality.reprocess.start` jest widoczna w audycie, fixture response `fixtures/api/data-quality.reprocess.start.response.json` przechodzi walidację schema, a następna powierzchnia „Rekoncyliacja” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 6 | Rekoncyliacja | `14-jakosc-danych-i-integralnosc/41-09-rekoncyliacja.md` | `data-quality.reconciliation.confirm` / `command` | `fixtures/e2e/90-08/06-rekoncyliacja.json` | Po kroku „Rekoncyliacja” obowiązuje domenowy warunek: operacja `data-quality.reconciliation.confirm` jest widoczna w audycie, fixture response `fixtures/api/data-quality.reconciliation.confirm.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.08. |

## Ścieżki alternatywne i odzyskiwanie
- Krok 1: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/products/szczegoly`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/products/mapowanie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/data-quality/konflikty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/data-quality/przeglad-reczny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/data-quality/ponowne-przetwarzanie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/rekoncyliacja`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

## Zasady bezpieczeństwa
Każdy krok ponownie sprawdza capability i zakres tenant/workspace. Tokeny, hasła i kody MFA nie są zapisywane w fixture ani telemetrii. Komendy wymagają correlationId, audytu i idempotency key; callback wymaga podpisu i ochrony przed replay.

## Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

## Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `PRODUCT_REPROCESSING_FAILED`.

## Kryteria akceptacji
1. Każdy krok ma istniejący fixture i operationId o prawidłowym kind.
2. Surface document, route i postcondition są zgodne z nazwą procesu.
3. Retry nie duplikuje skutku komendy.
4. Proces ma test happy path, błąd odzyskiwalny, utratę capability i wznowienie po przerwaniu.
