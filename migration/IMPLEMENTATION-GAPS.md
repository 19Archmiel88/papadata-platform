# Otwarte luki implementacyjne

## Krytyczne przed pełnym przełączeniem

1. Natywny port pozostałych operacji oznaczonych `contract-compatibility-runtime`.
2. Pełny model danych domenowych zamiast wspólnego JSONB tam, gdzie wymagane są constrainty i wydajne agregacje.
3. Migration upgrade ze starego schematu i test na reprezentatywnym zbiorze danych.
4. Live acceptance siedmiu integracji.
5. Pełny billing Stripe, ledger, invoices, webhook lifecycle i tax evidence.
6. Dashboard/analytics z algorytmami i golden tests ze starego backendu.
7. Auth recovery, email verification, OAuth, linking i invitation lifecycle.
8. Reports/exports, DSAR, retencja i backup/provider erasure evidence.
9. AI observations/recommendations/tool registry/execution ledger w nowych granicach.
10. Zamknięcie wszystkich environment/CI/external acceptance controls.

## Reguła statusu

- `native-hardened-runtime` — natywna usługa w nowych granicach;
- `migrated-*-policy` — przeniesiona i przetestowana semantyka bez pełnej domeny;
- `canonical-*-runtime` — odczyt oparty o dane kanoniczne;
- `explicit-limited-handler` — jawnie ograniczone zachowanie;
- `contract-compatibility-runtime` — zgodność trasy, bez deklaracji pełnej semantyki.
