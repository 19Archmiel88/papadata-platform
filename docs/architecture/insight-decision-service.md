# Insight & Decision Service

Fala 5 dodaje lokalny kontrakt i runtime w
`apps/web/src/features/ai`.

Przepływ:

1. `MetricSnapshot` z Fali 4.
2. `AIEvidence` z minimalnym zakresem.
3. `Observation`.
4. `Insight`.
5. `Recommendation`.
6. `Decision` człowieka.
7. `ActionProposal`.
8. Approval, reauthentication i rewalidacja.
9. `ActionExecution`.
10. `Outcome`.

AI nie podejmuje decyzji. AI może przygotować draft albo analizę, ale
`Decision` zapisuje `decidedBy`, `rationale`, wersję recommendation i readiness
w momencie decyzji.
