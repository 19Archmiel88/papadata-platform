# Monitoring Fali 4

Runtime local/CI utrzymuje:

- calculation latency;
- snapshot publication count;
- reconciliation mismatch count;
- projection latency;
- query latency;
- cache hit rate;
- invalidation failures;
- export latency;
- permission denies;
- cross-workspace denies;
- first ready KPI;
- first useful data;
- readiness distribution.

Telemetry eventy:

- `command_center.viewed`;
- `analytics_module.viewed`;
- `kpi.viewed`;
- `kpi.trust_opened`;
- `kpi.drilldown_opened`;
- `kpi.comparison_changed`;
- `kpi.period_changed`;
- `metric.export_requested`;
- `metric.recalculation_requested`;
- `alert.opened`;
- `alert.acknowledged`;
- `task.opened`;
- `task.completed`;
- `workspace.switched`.
