# Pipeline Fali 4

Przepływ local/CI:

1. Fala 2 zapisuje source records WooCommerce.
2. Fala 3 tworzy raw normalized records.
3. Fala 3 tworzy canonical orders, lineage, quality i readiness.
4. Fala 4 liczy wersjonowane `MetricDefinition`.
5. Fala 4 publikuje niezmienny `MetricSnapshot`.
6. Fala 4 tworzy reconciliation snapshotu.
7. Query Service tworzy projekcje.
8. Customer Workspace renderuje Command Center i moduły.
9. Trust Drawer pokazuje definicję, lineage, reconciliation i evidence.
10. Drill-down prowadzi do canonical order i source record IDs.
11. Export zapisuje kontrolowany `MetricExport`.

UI nie liczy KPI. UI korzysta z projections i snapshotów.
