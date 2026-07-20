# Analytics Query Service

Query Service Fali 4 jest lokalną fasadą metod
`LocalAnalyticsRuntime`.

Zakres:

- metric definitions;
- metric calculations;
- metric snapshots;
- Command Center;
- moduły analityczne;
- trend, drivers, comparison i history;
- tasks;
- alerts;
- changes since last visit;
- metric exports;
- Trust Drawer;
- drill-down.

Każde zapytanie egzekwuje:

- membership przez `ApplicationSessionContext`;
- capability;
- entitlement;
- tenant;
- workspace;
- data scope;
- stabilne sortowanie;
- pagination;
- koszt zapytania;
- stale response token po zmianie workspace.

Cache key zawiera:

- `tenantId`;
- `workspaceId`;
- `metricCode`;
- `metricDefinitionVersion`;
- `projectionVersion`;
- okres;
- currency;
- timezone;
- data scope;
- policy version;
- readiness.
