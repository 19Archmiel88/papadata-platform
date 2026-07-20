# Tenant-Safe Retrieval

Retrieval jest deny-by-default i zawsze filtruje po:

- `tenantId`;
- `workspaceId`;
- `userId`;
- membership;
- capability;
- entitlement;
- data scope;
- use case;
- purpose;
- time range;
- classification;
- readiness;
- retention.

AI nie polega wyłącznie na similarity. Fala 5 nie uruchamia vector indexu
produkcyjnego; evidence pochodzi z MetricSnapshotów Fali 4 i zachowuje
namespace tenant/workspace.
