# Runbook: Analytics Export Failure

## Objawy

- `MetricExport` ma status `FAILED`.
- Eksport nie zachowuje `tenantId` albo `workspaceId`.
- Użytkownik bez capability próbuje pobrać snapshot.

## Kontrola

1. Sprawdź capability `analytics:metrics:export`.
2. Sprawdź entitlement dla workspace.
3. Sprawdź, czy każdy snapshot należy do aktywnego tenant/workspace.
4. Sprawdź retention class `R-EXPORT`.
5. Sprawdź evidence reference eksportu.

## Recovery

1. Nie twórz eksportu częściowego poza zatwierdzonym zakresem.
2. Napraw uprawnienia lub zakres.
3. Ponów eksport z tym samym okresem i snapshot IDs.
4. Zapisz audit i evidence.
