# Runbook: Metric Calculation Failure

## Objawy

- `MetricCalculation` ma status `FAILED`.
- Snapshot nie został opublikowany.
- Command Center pokazuje `INVALID`, `BLOCKED` albo `RECALCULATION_REQUIRED`.

## Kontrola

1. Sprawdź `tenantId`, `workspaceId`, okres, walutę i timezone.
2. Sprawdź readiness datasetu Fali 3.
3. Sprawdź wersję `MetricDefinition`.
4. Sprawdź `missingData` i `readinessReasons` snapshotu.
5. Sprawdź reconciliation dla tego snapshotu.

## Recovery local/CI

1. Usuń blocker danych w Fali 3.
2. Uruchom reprocessing datasetu, jeżeli zmieniła się reguła.
3. Wykonaj ponowną kalkulację KPI.
4. Zweryfikuj Trust Drawer i evidence.

Brak danych nie może być zastąpiony zerem.
