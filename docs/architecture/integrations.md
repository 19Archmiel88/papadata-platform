# Architektura integracji

## Status Fali 2

Fala 2 wprowadza jeden kanoniczny vertical slice integracji w
`apps/web/src/features/integrations`.

Zakres implementacji:

- kontrakty TypeScript/Zod w `integrationContracts.ts`;
- lokalny runtime i adapter WooCommerce w `localIntegrationRuntime.ts`;
- typed API facade bez realnego transportu HTTP;
- provider catalog z rozdzielonym statusem katalogu, adaptera, środowiska,
  dostępności runtime i gotowości operacyjnej;
- Storybook screen i walidowane fixtures dla stanów connect, sync, error,
  recovery, reconnect, disconnect i braku uprawnień.

## Provider catalog

Provider jest dostępny tylko wtedy, gdy spełnia wszystkie bramy:

- `catalogStatus = catalogued`;
- `adapterStatus = verified`;
- `environmentStatus = verified`;
- `runtimeAvailability = pilot` albo `available`;
- `operationalReadiness = pilot_ready` albo `production_verified`;
- użytkownik ma wymagane capability;
- tenant/workspace ma wymagany entitlement.

Aktualny katalog Fali 2:

| Provider | Status |
| --- | --- |
| WooCommerce | Dostępny w local/CI/development jako provider pilotażowy. |
| Shopify | Skatalogowany jako planowany, ale niewystawiany jako dostępny. |

Pozostali providerzy z katalogu MVP pozostają w specyfikacji produktu i nie są
pokazywani jako dostępni bez implementacji adaptera oraz runbooka.

## Granice danych

Każdy zasób integration workspace zawiera `tenantId` oraz `workspaceId`.
Dotyczy to connection, credential metadata, joba, checkpointu, source batch,
source record, outbox eventu, webhook envelope, logu i metryki.

Runtime stosuje zasadę deny by default:

- obcy tenant lub workspace otrzymuje `NOT_FOUND`;
- ten sam external ID może istnieć równolegle w wielu workspace;
- source record fingerprint zawiera `tenantId`, `workspaceId`, `providerId`,
  stream i external ID;
- idempotency key jest związany z fingerprintem komendy.

## API facade

Kontrakt endpointów jest stabilny i dostępny jako `integrationApiRoutes`:

- `GET /v1/integration-providers`;
- `GET /v1/integration-providers/:providerId`;
- `POST /v1/integration-connections`;
- `POST /v1/integration-connections/:connectionId/reauthorize`;
- `POST /v1/integration-connections/:connectionId/disconnect`;
- `POST /v1/integration-sync-jobs`;
- `POST /v1/integration-sync-jobs/:jobId/replay`;
- `POST /v1/integration-webhooks/:providerId`.

Każda odpowiedź zachowuje `correlationId`, `operationId` dla operacji
długich, `contractVersion`, `tenantId`, `workspaceId`, readiness i ograniczenia
wynikające z capability, entitlement, scopes lub statusu providera.

## Przepływ danych

Minimalny przepływ initial sync:

1. Connect tworzy `IntegrationConnection` i zapisuje wyłącznie metadata
   credential.
2. `SyncJob` przechodzi `QUEUED -> RUNNING`.
3. Adapter pobiera stronę providera.
4. Runtime zapisuje `SourceBatch` i `SourceRecord`.
5. Checkpoint jest aktualizowany dopiero po zapisie source.
6. Outbox publikuje zdarzenie do dalszych warstw danych.
7. Job kończy się `SUCCESS`, `PARTIAL_SUCCESS`, `RETRY_WAIT`, `FAILED` albo
   `DLQ`.

Source data pozostają warstwą wejściową. Fala 2 nie oznacza source records jako
canonical, ready dataset ani ready KPI.
