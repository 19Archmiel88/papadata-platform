# Monitoring I Alerty

Runtime Fali 3 zapisuje structured logs i metryki:

- `source_records_count`;
- `source_duplicates`;
- `normalization_success`;
- `normalization_failure`;
- `schema_mismatch`;
- `unknown_status_count`;
- `missing_field_count`;
- `overlap_candidate_count`;
- `confirmed_overlap_count`;
- `exact_match_count`;
- `canonical_fact_count`;
- `excluded_contribution_count`;
- `quality_assessment_count`;
- `readiness_distribution.*`;
- `invalid_dataset_count`;
- `delayed_dataset_count`;
- `open_issues_by_severity.*`;
- `manual_review_count`;
- `manual_review_duration_ms`;
- `reprocess_count`;
- `reprocess_duration_ms`;
- `reconciliation_difference`;
- `deletion_failure`;
- `cross_workspace_deny`.

Alerty testowane w runtime:

- `critical_issue_without_owner`;
- `cross_workspace_deny`.

Alerty produkcyjne wymagają docelowego backendu i systemu monitoringu GCP.
