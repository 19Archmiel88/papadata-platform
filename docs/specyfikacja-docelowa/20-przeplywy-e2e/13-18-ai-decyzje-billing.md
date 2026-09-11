---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
status: approved-target
updated_at: 2026-09-09
---

# Przepływy E2E 13–18 — AI, decyzje i billing

Ten dokument jest kanonicznym, scalonym źródłem dla tego obszaru. Sekcje odpowiadają wcześniej rozdzielonym kontraktom i zachowują ich treść merytoryczną.

<a id="sekcja-90-13-obserwacja-do-wyniku"></a>

## Obserwacja do wyniku

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Obserwacja → Decyzja → Brief → Działanie → Pomiar → Wynik → Wniosek. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Obserwacja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.observation.create` / `command` | `fixtures/e2e/90-13/01-obserwacja.json` | Po kroku „Obserwacja” obowiązuje domenowy warunek: operacja `decisions.observation.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.observation.create.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 2 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-13/02-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Brief” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 3 | Brief | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-13/03-brief.json` | Po kroku „Brief” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „Działanie” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 4 | Działanie | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.action-detail.read` / `query` | `fixtures/e2e/90-13/04-dzia-anie.json` | Po kroku „Działanie” obowiązuje domenowy warunek: operacja `decisions.action-detail.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.action-detail.read.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 5 | Pomiar | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-13/05-pomiar.json` | Po kroku „Pomiar” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wynik” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 6 | Wynik | `07-centrum-dowodzenia/README.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-13/06-wynik.json` | Po kroku „Wynik” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Wniosek” jest osiągalna wyłącznie zgodnie z procesem 90.13. |
| 7 | Wniosek | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.registry.read` / `query` | `fixtures/e2e/90-13/07-wniosek.json` | Po kroku „Wniosek” obowiązuje domenowy warunek: operacja `decisions.registry.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.registry.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.13. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/decisions/obserwacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/decisions/szczegoly-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `PAPA_INTERPRETATION_UNAVAILABLE` — `PAPA_INTERPRETATION_UNAVAILABLE` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `PAPA_INTERPRETATION_UNAVAILABLE`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-14-kpi-do-interpretacji-papa"></a>

## KPI do interpretacji Papa

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: KPI → Otwarcie Papa → Snapshot kontekstu → Dowody → Odpowiedź → Ograniczenia → Zapis lub odrzucenie obserwacji. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | KPI | `07-centrum-dowodzenia/README.md` | `command-center.kpi.read` / `query` | `fixtures/e2e/90-14/01-kpi.json` | Po kroku „KPI” obowiązuje domenowy warunek: operacja `command-center.kpi.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.kpi.read.response.json` przechodzi walidację schema, a następna powierzchnia „Otwarcie Papa” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 2 | Otwarcie Papa | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.context-panel.read` / `query` | `fixtures/e2e/90-14/02-otwarcie-papa.json` | Po kroku „Otwarcie Papa” obowiązuje domenowy warunek: operacja `papa.context-panel.read` jest widoczna w audycie, fixture response `fixtures/api/papa.context-panel.read.response.json` przechodzi walidację schema, a następna powierzchnia „Snapshot kontekstu” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 3 | Snapshot kontekstu | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.context.capture` / `command` | `fixtures/e2e/90-14/03-snapshot-kontekstu.json` | Po kroku „Snapshot kontekstu” obowiązuje domenowy warunek: operacja `papa.context.capture` jest widoczna w audycie, fixture response `fixtures/api/papa.context.capture.response.json` przechodzi walidację schema, a następna powierzchnia „Dowody” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 4 | Dowody | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.evidence.read` / `query` | `fixtures/e2e/90-14/04-dowody.json` | Po kroku „Dowody” obowiązuje domenowy warunek: operacja `papa.evidence.read` jest widoczna w audycie, fixture response `fixtures/api/papa.evidence.read.response.json` przechodzi walidację schema, a następna powierzchnia „Odpowiedź” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 5 | Odpowiedź | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.answer.generate` / `command` | `fixtures/e2e/90-14/05-odpowied.json` | Po kroku „Odpowiedź” obowiązuje domenowy warunek: operacja `papa.answer.generate` jest widoczna w audycie, fixture response `fixtures/api/papa.answer.generate.response.json` przechodzi walidację schema, a następna powierzchnia „Ograniczenia” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 6 | Ograniczenia | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.governance.read` / `query` | `fixtures/e2e/90-14/06-ograniczenia.json` | Po kroku „Ograniczenia” obowiązuje domenowy warunek: operacja `papa.governance.read` jest widoczna w audycie, fixture response `fixtures/api/papa.governance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Zapis lub odrzucenie obserwacji” jest osiągalna wyłącznie zgodnie z procesem 90.14. |
| 7 | Zapis lub odrzucenie obserwacji | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.observation.save` / `command` | `fixtures/e2e/90-14/07-zapis-lub-odrzucenie-obserwacji.json` | Po kroku „Zapis lub odrzucenie obserwacji” obowiązuje domenowy warunek: operacja `papa.observation.save` jest widoczna w audycie, fixture response `fixtures/api/papa.observation.save.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.14. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/command-center/kpi`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/papa/panel-kontekstowy-papa`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/context-basket`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/papa/dowody`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/papa/odpowiedz-papa`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 6: zachowaj niesekretne dane formularza i route ``, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `RECOMMENDATION_DECISION_CONFLICT` — `RECOMMENDATION_DECISION_CONFLICT` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/papa/obserwacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `RECOMMENDATION_DECISION_CONFLICT`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-15-rekomendacja-do-decyzji"></a>

## Rekomendacja do decyzji

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Rekomendacja → Warianty → Dowody, ryzyko i wysiłek → Review → Decyzja → Propozycja działania → Baseline → Pomiar. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Rekomendacja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-15/01-rekomendacja.json` | Po kroku „Rekomendacja” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Warianty” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 2 | Warianty | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.recommendation.read` / `query` | `fixtures/e2e/90-15/02-warianty.json` | Po kroku „Warianty” obowiązuje domenowy warunek: operacja `decisions.recommendation.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.recommendation.read.response.json` przechodzi walidację schema, a następna powierzchnia „Dowody, ryzyko i wysiłek” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 3 | Dowody, ryzyko i wysiłek | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.evidence.read` / `query` | `fixtures/e2e/90-15/03-dowody-ryzyko-i-wysi-ek.json` | Po kroku „Dowody, ryzyko i wysiłek” obowiązuje domenowy warunek: operacja `papa.evidence.read` jest widoczna w audycie, fixture response `fixtures/api/papa.evidence.read.response.json` przechodzi walidację schema, a następna powierzchnia „Review” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 4 | Review | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.center.read` / `query` | `fixtures/e2e/90-15/04-review.json` | Po kroku „Review” obowiązuje domenowy warunek: operacja `decisions.center.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.center.read.response.json` przechodzi walidację schema, a następna powierzchnia „Decyzja” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 5 | Decyzja | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.decision.record` / `command` | `fixtures/e2e/90-15/05-decyzja.json` | Po kroku „Decyzja” obowiązuje domenowy warunek: operacja `decisions.decision.record` jest widoczna w audycie, fixture response `fixtures/api/decisions.decision.record.response.json` przechodzi walidację schema, a następna powierzchnia „Propozycja działania” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 6 | Propozycja działania | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.action.brief.create` / `command` | `fixtures/e2e/90-15/06-propozycja-dzia-ania.json` | Po kroku „Propozycja działania” obowiązuje domenowy warunek: operacja `decisions.action.brief.create` jest widoczna w audycie, fixture response `fixtures/api/decisions.action.brief.create.response.json` przechodzi walidację schema, a następna powierzchnia „Baseline” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 7 | Baseline | `07-centrum-dowodzenia/README.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-15/07-baseline.json` | Po kroku „Baseline” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Pomiar” jest osiągalna wyłącznie zgodnie z procesem 90.15. |
| 8 | Pomiar | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-15/08-pomiar.json` | Po kroku „Pomiar” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.15. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/decisions/rekomendacje`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/dowody`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/decisions/centrum-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/decisions/rejestr-decyzji`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/decisions/brief-dzialania`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 8: `AI_ACTION_APPROVAL_FAILED` — `AI_ACTION_APPROVAL_FAILED` dla kroku 8: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `AI_ACTION_APPROVAL_FAILED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-16-ai-action-approval"></a>

## AI Action approval

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Policy check → Dokładna operacja → Cel → Wpływ → Rollback → Capability → MFA lub reauth → Approve albo reject → Wykonanie → Audyt → Outcome. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Policy check | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.ai.action.validate` / `command` | `fixtures/e2e/90-16/01-policy-check.json` | Po kroku „Policy check” obowiązuje domenowy warunek: operacja `papa.ai.action.validate` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.validate.response.json` przechodzi walidację schema, a następna powierzchnia „Dokładna operacja” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 2 | Dokładna operacja | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.actions.read` / `query` | `fixtures/e2e/90-16/02-dok-adna-operacja.json` | Po kroku „Dokładna operacja” obowiązuje domenowy warunek: operacja `papa.actions.read` jest widoczna w audycie, fixture response `fixtures/api/papa.actions.read.response.json` przechodzi walidację schema, a następna powierzchnia „Cel” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 3 | Cel | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.ai.action.validate` / `command` | `fixtures/e2e/90-16/03-cel.json` | Po kroku „Cel” obowiązuje domenowy warunek: operacja `papa.ai.action.validate` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.validate.response.json` przechodzi walidację schema, a następna powierzchnia „Wpływ” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 4 | Wpływ | `10-produkty/README.md` | `products.impact.read` / `query` | `fixtures/e2e/90-16/04-wp-yw.json` | Po kroku „Wpływ” obowiązuje domenowy warunek: operacja `products.impact.read` jest widoczna w audycie, fixture response `fixtures/api/products.impact.read.response.json` przechodzi walidację schema, a następna powierzchnia „Rollback” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 5 | Rollback | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.ai.action.rollback` / `command` | `fixtures/e2e/90-16/05-rollback.json` | Po kroku „Rollback” obowiązuje domenowy warunek: operacja `papa.ai.action.rollback` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.rollback.response.json` przechodzi walidację schema, a następna powierzchnia „Capability” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 6 | Capability | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.governance.read` / `query` | `fixtures/e2e/90-16/06-capability.json` | Po kroku „Capability” obowiązuje domenowy warunek: operacja `papa.governance.read` jest widoczna w audycie, fixture response `fixtures/api/papa.governance.read.response.json` przechodzi walidację schema, a następna powierzchnia „MFA lub reauth” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 7 | MFA lub reauth | `03-dostep-rejestracja-onboarding/powierzchnie-auth.md` | `auth.reauthenticate` / `command` | `fixtures/e2e/90-16/07-mfa-lub-reauth.json` | Po kroku „MFA lub reauth” obowiązuje domenowy warunek: operacja `auth.reauthenticate` jest widoczna w audycie, fixture response `fixtures/api/auth.reauthenticate.response.json` przechodzi walidację schema, a następna powierzchnia „Approve albo reject” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 8 | Approve albo reject | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.ai.action.approve` / `command` | `fixtures/e2e/90-16/08-approve-albo-reject.json` | Po kroku „Approve albo reject” obowiązuje domenowy warunek: operacja `papa.ai.action.approve` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.approve.response.json` przechodzi walidację schema, a następna powierzchnia „Wykonanie” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 9 | Wykonanie | `15-papa-asystent-i-laboratorium-ai/README.md` | `papa.ai.action.execute` / `job` | `fixtures/e2e/90-16/09-wykonanie.json` | Po kroku „Wykonanie” obowiązuje domenowy warunek: operacja `papa.ai.action.execute` jest widoczna w audycie, fixture response `fixtures/api/papa.ai.action.execute.response.json` przechodzi walidację schema, a następna powierzchnia „Audyt” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 10 | Audyt | `16-ustawienia-zespol-bezpieczenstwo/README.md` | `settings.audit.read` / `query` | `fixtures/e2e/90-16/10-audyt.json` | Po kroku „Audyt” obowiązuje domenowy warunek: operacja `settings.audit.read` jest widoczna w audycie, fixture response `fixtures/api/settings.audit.read.response.json` przechodzi walidację schema, a następna powierzchnia „Outcome” jest osiągalna wyłącznie zgodnie z procesem 90.16. |
| 11 | Outcome | `18-wsparcie-marketingowe-decyzje-dzialania/README.md` | `decisions.measurement.read` / `query` | `fixtures/e2e/90-16/11-outcome.json` | Po kroku „Outcome” obowiązuje domenowy warunek: operacja `decisions.measurement.read` jest widoczna w audycie, fixture response `fixtures/api/decisions.measurement.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.16. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/papa/ai-actions`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/products/analiza-wplywu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/papa/ustawienia-ai-i-governance`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 7: zachowaj niesekretne dane formularza i route `/auth/reauthenticate`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 8: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 8: zachowaj niesekretne dane formularza i route `/app/papa/ai-action-approval`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 9: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 9: zachowaj niesekretne dane formularza i route `/app/papa/ai-actions`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 10: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 10: zachowaj niesekretne dane formularza i route `/app/settings/audyt`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 11: `SUBSCRIPTION_ACTIVATION_FAILED` — `SUBSCRIPTION_ACTIVATION_FAILED` dla kroku 11: zachowaj niesekretne dane formularza i route `/app/decisions/pomiar`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `SUBSCRIPTION_ACTIVATION_FAILED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-17-pilot-do-abonamentu"></a>

## Pilot do abonamentu

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Pilot → Użycie → Dowód wartości → Plan → Płatność → Abonament → Entitlements. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Pilot | `17-subskrypcja-i-platnosci/README.md` | `billing.pilot.read` / `query` | `fixtures/e2e/90-17/01-pilot.json` | Po kroku „Pilot” obowiązuje domenowy warunek: operacja `billing.pilot.read` jest widoczna w audycie, fixture response `fixtures/api/billing.pilot.read.response.json` przechodzi walidację schema, a następna powierzchnia „Użycie” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 2 | Użycie | `17-subskrypcja-i-platnosci/README.md` | `billing.usage-limits.read` / `query` | `fixtures/e2e/90-17/02-u-ycie.json` | Po kroku „Użycie” obowiązuje domenowy warunek: operacja `billing.usage-limits.read` jest widoczna w audycie, fixture response `fixtures/api/billing.usage-limits.read.response.json` przechodzi walidację schema, a następna powierzchnia „Dowód wartości” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 3 | Dowód wartości | `07-centrum-dowodzenia/README.md` | `command-center.plan-performance.read` / `query` | `fixtures/e2e/90-17/03-dow-d-warto-ci.json` | Po kroku „Dowód wartości” obowiązuje domenowy warunek: operacja `command-center.plan-performance.read` jest widoczna w audycie, fixture response `fixtures/api/command-center.plan-performance.read.response.json` przechodzi walidację schema, a następna powierzchnia „Plan” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 4 | Plan | `17-subskrypcja-i-platnosci/README.md` | `billing.plan.select` / `command` | `fixtures/e2e/90-17/04-plan.json` | Po kroku „Plan” obowiązuje domenowy warunek: operacja `billing.plan.select` jest widoczna w audycie, fixture response `fixtures/api/billing.plan.select.response.json` przechodzi walidację schema, a następna powierzchnia „Płatność” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 5 | Płatność | `17-subskrypcja-i-platnosci/README.md` | `billing.payment.method.update` / `command` | `fixtures/e2e/90-17/05-p-atno.json` | Po kroku „Płatność” obowiązuje domenowy warunek: operacja `billing.payment.method.update` jest widoczna w audycie, fixture response `fixtures/api/billing.payment.method.update.response.json` przechodzi walidację schema, a następna powierzchnia „Abonament” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 6 | Abonament | `17-subskrypcja-i-platnosci/README.md` | `billing.subscription.activate` / `command` | `fixtures/e2e/90-17/06-abonament.json` | Po kroku „Abonament” obowiązuje domenowy warunek: operacja `billing.subscription.activate` jest widoczna w audycie, fixture response `fixtures/api/billing.subscription.activate.response.json` przechodzi walidację schema, a następna powierzchnia „Entitlements” jest osiągalna wyłącznie zgodnie z procesem 90.17. |
| 7 | Entitlements | `17-subskrypcja-i-platnosci/README.md` | `billing.entitlements.read` / `query` | `fixtures/e2e/90-17/07-entitlements.json` | Po kroku „Entitlements” obowiązuje domenowy warunek: operacja `billing.entitlements.read` jest widoczna w audycie, fixture response `fixtures/api/billing.entitlements.read.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.17. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/billing/pilot-do-abonamentu`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/billing/uzycie-i-limity`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/command-center/plan-vs-wynik`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/billing/plany`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/billing/platnosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 6: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 6: zachowaj niesekretne dane formularza i route `/app/billing/subskrypcja`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 7: `OVERDUE_PAYMENT_UNRESOLVED` — `OVERDUE_PAYMENT_UNRESOLVED` dla kroku 7: zachowaj niesekretne dane formularza i route `/app/billing/uzycie-i-limity`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `OVERDUE_PAYMENT_UNRESOLVED`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.

<a id="sekcja-90-18-zalegla-platnosc"></a>

## Zaległa płatność

### Cel i wynik biznesowy
Proces prowadzi użytkownika przez: Alert billingowy → Zaległa płatność → Bezpieczne ograniczenie → Metoda płatności → Odblokowanie. Sukces oznacza osiągnięcie ostatniego postcondition bez utraty tenant/workspace scope, bez podwójnej mutacji i z kompletnym audytem operacji.

### Sekwencja wykonawcza
| Krok | Powierzchnia | Dokument | Operacja | Fixture | Postcondition |
|---:|---|---|---|---|---|
| 1 | Alert billingowy | `17-subskrypcja-i-platnosci/README.md` | `billing.overdue-payment.read` / `query` | `fixtures/e2e/90-18/01-alert-billingowy.json` | Po kroku „Alert billingowy” obowiązuje domenowy warunek: operacja `billing.overdue-payment.read` jest widoczna w audycie, fixture response `fixtures/api/billing.overdue-payment.read.response.json` przechodzi walidację schema, a następna powierzchnia „Zaległa płatność” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 2 | Zaległa płatność | `17-subskrypcja-i-platnosci/README.md` | `billing.overdue-payment.read` / `query` | `fixtures/e2e/90-18/02-zaleg-a-p-atno.json` | Po kroku „Zaległa płatność” obowiązuje domenowy warunek: operacja `billing.overdue-payment.read` jest widoczna w audycie, fixture response `fixtures/api/billing.overdue-payment.read.response.json` przechodzi walidację schema, a następna powierzchnia „Bezpieczne ograniczenie” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 3 | Bezpieczne ograniczenie | `17-subskrypcja-i-platnosci/README.md` | `billing.entitlements.read` / `query` | `fixtures/e2e/90-18/03-bezpieczne-ograniczenie.json` | Po kroku „Bezpieczne ograniczenie” obowiązuje domenowy warunek: operacja `billing.entitlements.read` jest widoczna w audycie, fixture response `fixtures/api/billing.entitlements.read.response.json` przechodzi walidację schema, a następna powierzchnia „Metoda płatności” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 4 | Metoda płatności | `17-subskrypcja-i-platnosci/README.md` | `billing.payment.method.update` / `command` | `fixtures/e2e/90-18/04-metoda-p-atno-ci.json` | Po kroku „Metoda płatności” obowiązuje domenowy warunek: operacja `billing.payment.method.update` jest widoczna w audycie, fixture response `fixtures/api/billing.payment.method.update.response.json` przechodzi walidację schema, a następna powierzchnia „Odblokowanie” jest osiągalna wyłącznie zgodnie z procesem 90.18. |
| 5 | Odblokowanie | `17-subskrypcja-i-platnosci/README.md` | `billing.overdue.resolve` / `command` | `fixtures/e2e/90-18/05-odblokowanie.json` | Po kroku „Odblokowanie” obowiązuje domenowy warunek: operacja `billing.overdue.resolve` jest widoczna w audycie, fixture response `fixtures/api/billing.overdue.resolve.response.json` przechodzi walidację schema, a następna powierzchnia „stan końcowy procesu” jest osiągalna wyłącznie zgodnie z procesem 90.18. |

### Ścieżki alternatywne i odzyskiwanie
- Krok 1: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 1: zachowaj niesekretne dane formularza i route `/app/billing/zalegla-platnosc`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 2: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 2: zachowaj niesekretne dane formularza i route `/app/billing/zalegla-platnosc`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 3: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 3: zachowaj niesekretne dane formularza i route `/app/billing/uzycie-i-limity`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 4: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 4: zachowaj niesekretne dane formularza i route `/app/billing/platnosci`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.
- Krok 5: `MEASUREMENT_WINDOW_INCOMPLETE` — `MEASUREMENT_WINDOW_INCOMPLETE` dla kroku 5: zachowaj niesekretne dane formularza i route `/app/billing/zalegla-platnosc`, pokaż correlationId oraz akcję retry tylko dla błędu oznaczonego `recoverable=true`; błąd capability kończy proces bez retry.

### Zasady bezpieczeństwa
> [STD-E2E-SECURITY](../00-zarzadzanie-dokumentacja/README.md#std-e2e-security) — normatywny.

### Wznowienie
Wznowienie opiera się na ostatnim potwierdzonym postcondition, a nie na samym numerze ekranu. System przed kontynuacją odczytuje aktualny stan domeny i nie odtwarza mutacji bez dowodu idempotencji.

### Test E2E
Test ładuje fizyczne fixture wskazane w tabeli, mockuje kontrakt API zgodny z `contracts/openapi-1.0.json`, wykonuje akcję UI, sprawdza event i postcondition, a następnie uruchamia scenariusz błędu `MEASUREMENT_WINDOW_INCOMPLETE`.

### Kryteria akceptacji
> [STD-E2E-ACCEPTANCE](../00-zarzadzanie-dokumentacja/README.md#std-e2e-acceptance) — normatywny.
