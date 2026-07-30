---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-INTEGRATIONS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Integrations — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `integrations.catalog.read` | `query` | `GET` | `/api/v1/integrations/katalog-integracji` | `/v1/integrations/katalog-integracji` | `IntegrationsCatalogReadRequest` | `IntegrationsCatalogReadResponse` |
| `integrations.connection-wizard.read` | `query` | `GET` | `/api/v1/integrations/kreator-polaczenia` | `/v1/integrations/kreator-polaczenia` | `IntegrationsConnectionWizardReadRequest` | `IntegrationsConnectionWizardReadResponse` |
| `integrations.connection.create` | `command` | `POST` | `/api/v1/integrations/connections` | `/v1/integrations/connections` | `IntegrationsConnectionCreateRequest` | `IntegrationsConnectionCreateResponse` |
| `integrations.detail.read` | `query` | `GET` | `/api/v1/integrations/szczegoly-integracji` | `/v1/integrations/szczegoly-integracji` | `IntegrationsDetailReadRequest` | `IntegrationsDetailReadResponse` |
| `integrations.disconnect.read` | `query` | `GET` | `/api/v1/integrations/odlaczenie` | `/v1/integrations/odlaczenie` | `IntegrationsDisconnectReadRequest` | `IntegrationsDisconnectReadResponse` |
| `integrations.oauth.callback` | `callback` | `POST` | `/api/v1/integrations/oauth/callback` | `/v1/integrations/oauth/callback` | `IntegrationsOauthCallbackRequest` | `IntegrationsOauthCallbackResponse` |
| `integrations.provider-outage.read` | `query` | `GET` | `/api/v1/integrations/awaria-providera` | `/v1/integrations/awaria-providera` | `IntegrationsProviderOutageReadRequest` | `IntegrationsProviderOutageReadResponse` |
| `integrations.read` | `query` | `GET` | `/api/v1/integrations/read` | `/v1/integrations/read` | `IntegrationsReadRequest` | `IntegrationsReadResponse` |
| `integrations.reconnect.read` | `query` | `GET` | `/api/v1/integrations/ponowne-polaczenie` | `/v1/integrations/ponowne-polaczenie` | `IntegrationsReconnectReadRequest` | `IntegrationsReconnectReadResponse` |
| `integrations.reconnect.start` | `command` | `POST` | `/api/v1/integrations/reconnect/start` | `/v1/integrations/reconnect/start` | `IntegrationsReconnectStartRequest` | `IntegrationsReconnectStartResponse` |
| `integrations.sync-history.read` | `query` | `GET` | `/api/v1/integrations/historia-synchronizacji` | `/v1/integrations/historia-synchronizacji` | `IntegrationsSyncHistoryReadRequest` | `IntegrationsSyncHistoryReadResponse` |
| `integrations.sync-run.read` | `query` | `GET` | `/api/v1/integrations/przebieg-synchronizacji` | `/v1/integrations/przebieg-synchronizacji` | `IntegrationsSyncRunReadRequest` | `IntegrationsSyncRunReadResponse` |
| `integrations.sync-scope.read` | `query` | `GET` | `/api/v1/integrations/zakres-synchronizacji` | `/v1/integrations/zakres-synchronizacji` | `IntegrationsSyncScopeReadRequest` | `IntegrationsSyncScopeReadResponse` |
| `integrations.sync.resume` | `command` | `POST` | `/api/v1/integrations/sync/resume` | `/v1/integrations/sync/resume` | `IntegrationsSyncResumeRequest` | `IntegrationsSyncResumeResponse` |
| `integrations.sync.start` | `command` | `POST` | `/api/v1/integrations/sync/start` | `/v1/integrations/sync/start` | `IntegrationsSyncStartRequest` | `IntegrationsSyncStartResponse` |
| `integrations.write` | `command` | `POST` | `/api/v1/integrations/write` | `/v1/integrations/write` | `IntegrationsWriteRequest` | `IntegrationsWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `integrations.catalog.read` | `query` | `IntegrationsCatalogReadRequest` | `IntegrationsCatalogReadResponse` | `/api/v1/integrations/katalog-integracji` | `/v1/integrations/katalog-integracji` |
| `integrations.connection-wizard.read` | `query` | `IntegrationsConnectionWizardReadRequest` | `IntegrationsConnectionWizardReadResponse` | `/api/v1/integrations/kreator-polaczenia` | `/v1/integrations/kreator-polaczenia` |
| `integrations.connection.create` | `command` | `IntegrationsConnectionCreateRequest` | `IntegrationsConnectionCreateResponse` | `/api/v1/integrations/connections` | `/v1/integrations/connections` |
| `integrations.detail.read` | `query` | `IntegrationsDetailReadRequest` | `IntegrationsDetailReadResponse` | `/api/v1/integrations/szczegoly-integracji/{resourceId}` | `/v1/integrations/szczegoly-integracji/{resourceId}` |
| `integrations.disconnect.read` | `query` | `IntegrationsDisconnectReadRequest` | `IntegrationsDisconnectReadResponse` | `/api/v1/integrations/odlaczenie` | `/v1/integrations/odlaczenie` |
| `integrations.oauth.callback` | `callback` | `IntegrationsOauthCallbackRequest` | `IntegrationsOauthCallbackResponse` | `/api/v1/integrations/oauth/callback` | `/v1/integrations/oauth/callback` |
| `integrations.provider-outage.read` | `query` | `IntegrationsProviderOutageReadRequest` | `IntegrationsProviderOutageReadResponse` | `/api/v1/integrations/awaria-providera` | `/v1/integrations/awaria-providera` |
| `integrations.read` | `query` | `IntegrationsReadRequest` | `IntegrationsReadResponse` | `/api/v1/integrations/read` | `/v1/integrations/read` |
| `integrations.reconnect.read` | `query` | `IntegrationsReconnectReadRequest` | `IntegrationsReconnectReadResponse` | `/api/v1/integrations/ponowne-polaczenie` | `/v1/integrations/ponowne-polaczenie` |
| `integrations.reconnect.start` | `command` | `IntegrationsReconnectStartRequest` | `IntegrationsReconnectStartResponse` | `/api/v1/integrations/reconnect/start` | `/v1/integrations/reconnect/start` |
| `integrations.sync-history.read` | `query` | `IntegrationsSyncHistoryReadRequest` | `IntegrationsSyncHistoryReadResponse` | `/api/v1/integrations/historia-synchronizacji` | `/v1/integrations/historia-synchronizacji` |
| `integrations.sync-run.read` | `query` | `IntegrationsSyncRunReadRequest` | `IntegrationsSyncRunReadResponse` | `/api/v1/integrations/przebieg-synchronizacji` | `/v1/integrations/przebieg-synchronizacji` |
| `integrations.sync-scope.read` | `query` | `IntegrationsSyncScopeReadRequest` | `IntegrationsSyncScopeReadResponse` | `/api/v1/integrations/zakres-synchronizacji` | `/v1/integrations/zakres-synchronizacji` |
| `integrations.sync.resume` | `command` | `IntegrationsSyncResumeRequest` | `IntegrationsSyncResumeResponse` | `/api/v1/integrations/sync/resume` | `/v1/integrations/sync/resume` |
| `integrations.sync.start` | `command` | `IntegrationsSyncStartRequest` | `IntegrationsSyncStartResponse` | `/api/v1/integrations/sync/start` | `/v1/integrations/sync/start` |
| `integrations.write` | `command` | `IntegrationsWriteRequest` | `IntegrationsWriteResponse` | `/api/v1/integrations/write` | `/v1/integrations/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
