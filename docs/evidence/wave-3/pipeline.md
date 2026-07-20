# Pipeline Diagram

```text
WooCommerce orders
  |
  v
SourceBatch + SourceRecord + payloadRef
  |
  v
RawNormalizedRecord
  |
  v
ExactMatchResult -> OverlapCandidate
  |
  v
SourceAuthorityRule
  |
  v
CanonicalOrder
  |
  v
LineageLink
  |
  v
Dataset -> QualityAssessment -> ReadinessAssessment
  |
  +--> DataIssue -> ManualDataDecision -> ReprocessJob
  |
  +--> ReconciliationReport
  |
  +--> DataImpactReport
```
