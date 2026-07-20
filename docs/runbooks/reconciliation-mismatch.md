# Runbook: Reconciliation Mismatch

## Objawy

- Reconciliation ma status `MISMATCH`.
- KPI jest `INVALID` albo `PARTIAL`.
- Alert ma typ `reconciliation_mismatch`.

## Kontrola

1. Porównaj source totals, normalized totals, canonical totals i snapshot.
2. Sprawdź exclusions, duplicates i conflict count.
3. Sprawdź tolerance i reason codes.
4. Otwórz lineage z Trust Drawer.
5. Zweryfikuj, czy problem dotyczy tylko jednego providera.

## Recovery

1. Jeżeli problem jest lokalny dla providera, zdegraduj tylko zależny KPI.
2. Utwórz albo przypisz task właścicielowi danych.
3. Po naprawie uruchom reprocessing i ponowną kalkulację.
4. Nie publikuj wartości jako `READY`, dopóki mismatch pozostaje poza tolerancją.
