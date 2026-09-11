---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-ACCESS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Access — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `access.resolve` | `command` | `POST` | `/api/v1/access/resolve` | `/v1/access/resolve` | `AccessResolveRequest` | `AccessResolveResponse` |
| `access.tenant.select` | `command` | `POST` | `/api/v1/access/tenant/select` | `/v1/access/tenant/select` | `AccessTenantSelectRequest` | `AccessTenantSelectResponse` |
| `access.workspace.select` | `command` | `POST` | `/api/v1/access/workspace/select` | `/v1/access/workspace/select` | `AccessWorkspaceSelectRequest` | `AccessWorkspaceSelectResponse` |

## Reguły

> [STD-API-OPERATION-RULES](../00-zarzadzanie-dokumentacja/README.md#std-api-operation-rules) — normatywny.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `access.bootstrap` | `command` | `AccessBootstrapRequest` | `AccessBootstrapResponse` | `/api/v1/access/bootstrap` | `/v1/access/bootstrap` |
| `access.resolve` | `command` | `AccessResolveRequest` | `AccessResolveResponse` | `/api/v1/access/resolve` | `/v1/access/resolve` |
| `access.tenant.select` | `command` | `AccessTenantSelectRequest` | `AccessTenantSelectResponse` | `/api/v1/access/tenant/select` | `/v1/access/tenant/select` |
| `access.tenants.list` | `query` | `AccessTenantsListRequest` | `AccessTenantsListResponse` | `/api/v1/access/tenants/list` | `/v1/access/tenants/list` |
| `access.workspace.select` | `command` | `AccessWorkspaceSelectRequest` | `AccessWorkspaceSelectResponse` | `/api/v1/access/workspace/select` | `/v1/access/workspace/select` |
| `access.workspaces.list` | `query` | `AccessWorkspacesListRequest` | `AccessWorkspacesListResponse` | `/api/v1/access/workspaces/list` | `/v1/access/workspaces/list` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
