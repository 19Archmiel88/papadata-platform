# Warstwy danych Fali 3

Fala 3 w repo implementuje lokalny, testowalny vertical slice dla datasetu
`orders` z providera WooCommerce.

Pipeline:

```text
SourceBatch/SourceRecord
-> RawNormalizedRecord
-> ExactMatchResult i OverlapCandidate
-> SourceAuthorityRule
-> CanonicalOrder
-> LineageLink
-> Dataset
-> QualityAssessment
-> ReadinessAssessment
-> DataIssue / ManualDataDecision
-> ReprocessJob / DataImpactReport
-> ReconciliationReport
```

Implementacja:

- kontrakty: `apps/web/src/features/data-quality/dataQualityContracts.ts`;
- runtime: `apps/web/src/features/data-quality/localDataQualityRuntime.ts`;
- source wejściowy: `apps/web/src/features/integrations/localIntegrationRuntime.ts`.

Warstwy pozostają rozdzielone. Source data nie są canonical data, canonical
data nie oznaczają gotowego datasetu, a gotowy dataset nie oznacza pełnych KPI
Fali 4.
