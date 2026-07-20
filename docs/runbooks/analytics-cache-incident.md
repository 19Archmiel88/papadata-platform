# Runbook: Analytics Cache Incident

## Objawy

- Projekcja pokazuje dane starego workspace.
- Query Service odrzuca odpowiedź jako `STALE_WORKSPACE_RESPONSE`.
- Cache hit rate rośnie mimo zmiany definicji albo readiness.

## Kontrola

1. Sprawdź cache key: tenant, workspace, metric, definition version i period.
2. Sprawdź `projectionVersion` i `policyVersion`.
3. Sprawdź token zapytania po zmianie workspace.
4. Sprawdź audit `workspace.switched`.

## Recovery

1. Wyczyść cache aktywnego runtime.
2. Zamknij Trust Drawer i drill-down starego workspace.
3. Wymuś nowe zapytanie z aktualnym request token.
4. Zarejestruj incident, jeżeli cache ujawnił obcy zakres.
