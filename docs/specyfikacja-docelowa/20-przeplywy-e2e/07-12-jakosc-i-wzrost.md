---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Przepływy E2E 07–12 — jakość i wzrost

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-90-07-problem-danych-do-readiness"></a>

## Problem danych do readiness

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Status danych → Problem jakości → Lineage → Nadrzędność źródła → Przegląd ręczny → Ponowne przetwarzanie → Gotowość poprawiona. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Status danych | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-07/01-status-danych.json` | Po kroku „Status danych” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „Problem jakości” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 2 | Problem jakości | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.conflicts.read` / `query` | `fixtures/e2e/90-07/02-problem-jako-ci.json` | Po kroku „Problem jakości” obowiązuje domenowy warunek: operacja `data-quality.conflicts.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.conflicts.read.response.json` przechodzi walidację schema, a następna powierzchnia „Lineage” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 3 | Lineage | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.lineage.read` / `query` | `fixtures/e2e/90-07/03-lineage.json` | Po kroku „Lineage” obowiązuje domenowy warunek: operacja `data-quality.lineage.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.lineage.read.response.json` przechodzi walidację schema, a następna powierzchnia „Nadrzędność źródła” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 4 | Nadrzędność źródła | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.source-priority.read` / `query` | `fixtures/e2e/90-07/04-nadrz-dno-r-d-a.json` | Po kroku „Nadrzędność źródła” obowiązuje domenowy warunek: operacja `data-quality.source-priority.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.source-priority.read.response.json` przechodzi walidację schema, a następna powierzchnia „Przegląd ręczny” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 5 | Przegląd ręczny | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.manual-review.submit` / `command` | `fixtures/e2e/90-07/05-przegl-d-r-czny.json` | Po kroku „Przegląd ręczny” obowiązuje domenowy warunek: operacja `data-quality.manual-review.submit` jest widoczna w audycie, fixture response `fixtures/api/data-quality.manual-review.submit.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne przetwarzanie” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 6 | Ponowne przetwarzanie | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.reprocess.start` / `command` | `fixtures/e2e/90-07/06-ponowne-przetwarzanie.json` | Po kroku „Ponowne przetwarzanie” obowiązuje domenowy warunek: operacja `data-quality.reprocess.start` jest widoczna w audycie, fixture response `fixtures/api/data-quality.reprocess.start.response.json` przechodzi walidację schema, a następna powierzchnia „Gotowość poprawiona” jest osiągalna wyłącznie zgodnie z procesem 90.07. |
| 7 | Gotowość poprawiona | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.readiness.read` / `query` | `fixtures/e2e/90-07/07-gotowo-poprawiona.json` | Po kroku „Gotowość poprawiona” obowiązuje domenowy warunek: operacja `data-quality.readiness.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.readiness.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.07. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/data-quality/konflikty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/data-quality/pochodzenie-danych`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/data-quality/nadrzednosc-zrodla`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/data-quality/przeglad-reczny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/ponowne-przetwarzanie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `DATA_READINESS_BLOCKED` — `DATA_READINESS_BLOCKED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/data-quality/centrum-jakosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `DATA_READINESS_BLOCKED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-08-produkt-do-ponownego-przetwarzania"></a>

## Produkt do ponownego przetwarzania

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Produkt → Mapowanie → Konflikt → Przegląd ręczny → Ponowne przetwarzanie → Rekoncyliacja. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Produkt | `10-produkty/README.md` | `products.detail.read` / `query` | `fixtures/e2e/90-08/01-produkt.json` | Po kroku „Produkt” obowiązuje domenowy warunek: operacja `products.detail.read` jest widoczna w audycie, fixture response `fixtures/api/products.detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Mapowanie” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 2 | Mapowanie | `10-produkty/README.md` | `products.mapping.update` / `command` | `fixtures/e2e/90-08/02-mapowanie.json` | Po kroku „Mapowanie” obowiązuje domenowy warunek: operacja `products.mapping.update` jest widoczna w audycie, fixture response `fixtures/api/products.mapping.update.response.json` przechodzi walidację schema, a następna powierzchnia „Konflikt” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 3 | Konflikt | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.conflicts.read` / `query` | `fixtures/e2e/90-08/03-konflikt.json` | Po kroku „Konflikt” obowiązuje domenowy warunek: operacja `data-quality.conflicts.read` jest widoczna w audycie, fixture response `fixtures/api/data-quality.conflicts.read.response.json` przechodzi walidację schema, a następna powierzchnia „Przegląd ręczny” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 4 | Przegląd ręczny | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.manual-review.submit` / `command` | `fixtures/e2e/90-08/04-przegl-d-r-czny.json` | Po kroku „Przegląd ręczny” obowiązuje domenowy warunek: operacja `data-quality.manual-review.submit` jest widoczna w audycie, fixture response `fixtures/api/data-quality.manual-review.submit.response.json` przechodzi walidację schema, a następna powierzchnia „Ponowne przetwarzanie” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 5 | Ponowne przetwarzanie | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.reprocess.start` / `command` | `fixtures/e2e/90-08/05-ponowne-przetwarzanie.json` | Po kroku „Ponowne przetwarzanie” obowiązuje domenowy warunek: operacja `data-quality.reprocess.start` jest widoczna w audycie, fixture response `fixtures/api/data-quality.reprocess.start.response.json` przechodzi walidację schema, a następna powierzchnia „Rekoncyliacja” jest osiągalna wyłącznie zgodnie z procesem 90.08. |
| 6 | Rekoncyliacja | `14-jakosc-danych-i-integralnosc/README.md` | `data-quality.reconciliation.confirm` / `command` | `fixtures/e2e/90-08/06-rekoncyliacja.json` | Po kroku „Rekoncyliacja” obowiązuje domenowy warunek: operacja `data-quality.reconciliation.confirm` jest widoczna w audycie, fixture response `fixtures/api/data-quality.reconciliation.confirm.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.08. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/products/szczegoly`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/products/mapowanie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/data-quality/konflikty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/data-quality/przeglad-reczny`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/data-quality/ponowne-przetwarzanie`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `PRODUCT_REPROCESSING_FAILED` — `PRODUCT_REPROCESSING_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/data-quality/rekoncyliacja`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `PRODUCT_REPROCESSING_FAILED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-09-uwaga-do-decyzji"></a>

## Uwaga do decyzji

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Sygnał w Centrum Dowodzenia → Kolejka uwagi → Dowody → Rekomendacja Papa → Decyzja → Pomiar. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Sygnał w Centrum Dowodzenia | `07-centrum-dowodzenia/README.md` | `command-center.sales-signals.read` / `query` | `fixtures/e2e/90-09/01-sygna-w-centrum-dowodzenia.json` | Po kroku „Sygnał w Centrum Dowodzenia” obowiązuje domenowy warunek: operacja `command-center.sales-signals.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.sales-signals.read.response.json` przechodzi walidację schema, a następna powierzchnia „Kolejka uwagi” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 2 | Kolejka uwagi | `07-centrum-dowodzenia/README.md` | `command-center.attention.queue.read` / `query` | `fixtures/e2e/90-09/02-kolejka-uwagi.json` | Po kroku „Kolejka uwagi” obowiązuje domenowy warunek: operacja `command-center.attention.queue.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.attention.queue.read.response.json` przechodzi walidację schema, a następna powierzchnia „Dowody” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 3 | Dowody | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.evidence.read` / `query` | `fixtures/e2e/90-09/03-dowody.json` | Po kroku „Dowody” obowiązuje domenowy warunek: operacja `papa.evidence.read` jest widoczna w audycie, fixture response `fixtures/api/papa.evidence.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja Papa” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 4 | Rekomendacja Papa | `15-papa-asystent-i-laboratorium-ai/README.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-09/04-rekomendacja-papa.json` | Po kroku „Rekomendacja Papa” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 5 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-09/05-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar” jest osiągalna wyłącznie zgodnie z procesem 90.09. |
| 6 | Pomiar | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-09/06-pomiar.json` | Po kroku „Pomiar” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.09. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/sygnaly-sprzedazowe`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/command-center/kolejka-uwagi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/dowody`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/papa/propozycje-ai`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `ATTENTION_DECISION_CONFLICT` — `ATTENTION_DECISION_CONFLICT` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `ATTENTION_DECISION_CONFLICT`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-10-kampania-do-decyzji-budzetowej"></a>

## Kampania do decyzji budżetowej

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Kampanie → Analiza ROAS → Budżet → Rekomendacja → Zatwierdzenie → Pomiar rezultatu. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Kampanie | `08-kampanie-platne/README.md` | `campaigns.overview.read` / `query` | `fixtures/e2e/90-10/01-kampanie.json` | Po kroku „Kampanie” obowiązuje domenowy warunek: operacja `campaigns.overview.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Analiza ROAS” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 2 | Analiza ROAS | `08-kampanie-platne/README.md` | `campaigns.attribution-sales.read` / `query` | `fixtures/e2e/90-10/02-analiza-roas.json` | Po kroku „Analiza ROAS” obowiązuje domenowy warunek: operacja `campaigns.attribution-sales.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.attribution-sales.read.response.json` przechodzi walidację schema, a następna powierzchnia „Budżet” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 3 | Budżet | `08-kampanie-platne/README.md` | `campaigns.budget.read` / `query` | `fixtures/e2e/90-10/03-bud-et.json` | Po kroku „Budżet” obowiązuje domenowy warunek: operacja `campaigns.budget.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.budget.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 4 | Rekomendacja | `08-kampanie-platne/README.md` | `campaigns.budget.recommendation.read` / `query` | `fixtures/e2e/90-10/04-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `campaigns.budget.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/campaigns.budget.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Zatwierdzenie” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 5 | Zatwierdzenie | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-10/05-zatwierdzenie.json` | Po kroku „Zatwierdzenie” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar rezultatu” jest osiągalna wyłącznie zgodnie z procesem 90.10. |
| 6 | Pomiar rezultatu | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-10/06-pomiar-rezultatu.json` | Po kroku „Pomiar rezultatu” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.10. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/campaigns/przeglad`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/campaigns/atrybucja-i-sprzedaz`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/campaigns/budzet`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/campaigns/rekomendacje-kontekst-domenowy`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `BUDGET_DECISION_CONFLICT` — `BUDGET_DECISION_CONFLICT` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `BUDGET_DECISION_CONFLICT`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-11-segment-do-decyzji"></a>

## Segment do decyzji

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Klienci → Segment → Kohorta → Rekomendacja → Decyzja → Działanie. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Klienci | `11-klienci/README.md` | `customers.overview.read` / `query` | `fixtures/e2e/90-11/01-klienci.json` | Po kroku „Klienci” obowiązuje domenowy warunek: operacja `customers.overview.read` jest widoczna w audycie, fixture response `fixtures/api/customers.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Segment” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 2 | Segment | `11-klienci/README.md` | `customers.segment.analyze` / `query` | `fixtures/e2e/90-11/02-segment.json` | Po kroku „Segment” obowiązuje domenowy warunek: operacja `customers.segment.analyze` jest widoczna w audycie, fixture response `fixtures/api/customers.segment.analyze.response.json` przechodzi walidację schema, a następna powierzchnia „Kohorta” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 3 | Kohorta | `11-klienci/README.md` | `customers.cohorts.read` / `query` | `fixtures/e2e/90-11/03-kohorta.json` | Po kroku „Kohorta” obowiązuje domenowy warunek: operacja `customers.cohorts.read` jest widoczna w audycie, fixture response `fixtures/api/customers.cohorts.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 4 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-11/04-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 5 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-11/05-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Działanie” jest osiągalna wyłącznie zgodnie z procesem 90.11. |
| 6 | Działanie | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-11/06-dzia-anie.json` | Po kroku „Działanie” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.11. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/customers/przeglad`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/customers/segmenty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/customers/kohorty`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `SEGMENT_DECISION_INVALID` — `SEGMENT_DECISION_INVALID` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `SEGMENT_DECISION_INVALID`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-12-spadek-ruchu-do-dzialania"></a>

## Spadek ruchu do działania

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Ruch → Lejek → Wykrycie spadku → Diagnoza → Rekomendacja → Działanie marketingowe. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Ruch | `12-ruch-i-lejek/README.md` | `traffic.overview.read` / `query` | `fixtures/e2e/90-12/01-ruch.json` | Po kroku „Ruch” obowiązuje domenowy warunek: operacja `traffic.overview.read` jest widoczna w audycie, fixture response `fixtures/api/traffic.overview.read.response.json` przechodzi walidację schema, a następna powierzchnia „Lejek” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 2 | Lejek | `12-ruch-i-lejek/README.md` | `traffic.funnel.read` / `query` | `fixtures/e2e/90-12/02-lejek.json` | Po kroku „Lejek” obowiązuje domenowy warunek: operacja `traffic.funnel.read` jest widoczna w audycie, fixture response `fixtures/api/traffic.funnel.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wykrycie spadku” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 3 | Wykrycie spadku | `12-ruch-i-lejek/README.md` | `traffic.event-quality.read` / `query` | `fixtures/e2e/90-12/03-wykrycie-spadku.json` | Po kroku „Wykrycie spadku” obowiązuje domenowy warunek: operacja `traffic.event-quality.read` jest widoczna w audycie, fixture response `fixtures/api/traffic.event-quality.read.response.json` przechodzi walidację schema, a następna powierzchnia „Diagnoza” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 4 | Diagnoza | `08-kampanie-platne/README.md` | `traffic.drop.diagnose` / `query` | `fixtures/e2e/90-12/04-diagnoza.json` | Po kroku „Diagnoza” obowiązuje domenowy warunek: operacja `traffic.drop.diagnose` jest widoczna w audycie, fixture response `fixtures/api/traffic.drop.diagnose.response.json` przechodzi walidację schema, a następna powierzchnia „Rekomendacja” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 5 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-12/05-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Działanie marketingowe” jest osiągalna wyłącznie zgodnie z procesem 90.12. |
| 6 | Działanie marketingowe | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-12/06-dzia-anie-marketingowe.json` | Po kroku „Działanie marketingowe” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.12. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/traffic/przeglad-ruchu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/traffic/lejek-widok`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/traffic/jakosc-zdarzen`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/campaigns/diagnostyka`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `TRAFFIC_DIAGNOSIS_INCOMPLETE` — `TRAFFIC_DIAGNOSIS_INCOMPLETE` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `TRAFFIC_DIAGNOSIS_INCOMPLETE`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.
