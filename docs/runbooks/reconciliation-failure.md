# Runbook Reconciliation Failure

1. Sprawdź `reasonCodes` i `evidenceHash` raportu.
2. Porównaj `sourceTotals` i `canonicalTotals`.
3. Sprawdź `excludedRecordCount`, `duplicateCount` i `unresolvedOverlapCount`.
4. Jeżeli różnica przekracza tolerancję, utwórz `DataIssue`.
5. Nie oznaczaj datasetu jako `READY`, dopóki reconciliation pozostaje `FAIL`.
6. Jeżeli problem wynika z reguły, przygotuj source authority albo mapping
   change i uruchom reprocess.
