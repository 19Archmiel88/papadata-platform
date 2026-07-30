---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-PRODUCTS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Products — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `products.catalog.read` | `query` | `GET` | `/api/v1/products/katalog` | `/v1/products/katalog` | `ProductsCatalogReadRequest` | `ProductsCatalogReadResponse` |
| `products.detail.read` | `query` | `GET` | `/api/v1/products/szczegoly` | `/v1/products/szczegoly` | `ProductsDetailReadRequest` | `ProductsDetailReadResponse` |
| `products.gaps.queue.read` | `query` | `GET` | `/api/v1/products/kolejka-brakow` | `/v1/products/kolejka-brakow` | `ProductsGapsQueueReadRequest` | `ProductsGapsQueueReadResponse` |
| `products.impact.read` | `query` | `GET` | `/api/v1/products/analiza-wplywu` | `/v1/products/analiza-wplywu` | `ProductsImpactReadRequest` | `ProductsImpactReadResponse` |
| `products.mapping.read` | `query` | `GET` | `/api/v1/products/mapowanie` | `/v1/products/mapowanie` | `ProductsMappingReadRequest` | `ProductsMappingReadResponse` |
| `products.mapping.update` | `command` | `PUT` | `/api/v1/products/mapping` | `/v1/products/mapping` | `ProductsMappingUpdateRequest` | `ProductsMappingUpdateResponse` |
| `products.offers.read` | `query` | `GET` | `/api/v1/products/oferty` | `/v1/products/oferty` | `ProductsOffersReadRequest` | `ProductsOffersReadResponse` |
| `products.overview.read` | `query` | `GET` | `/api/v1/products/przeglad` | `/v1/products/przeglad` | `ProductsOverviewReadRequest` | `ProductsOverviewReadResponse` |
| `products.performance.read` | `query` | `GET` | `/api/v1/products/wydajnosc` | `/v1/products/wydajnosc` | `ProductsPerformanceReadRequest` | `ProductsPerformanceReadResponse` |
| `products.read` | `query` | `GET` | `/api/v1/products/read` | `/v1/products/read` | `ProductsReadRequest` | `ProductsReadResponse` |
| `products.write` | `command` | `POST` | `/api/v1/products/write` | `/v1/products/write` | `ProductsWriteRequest` | `ProductsWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `products.catalog.read` | `query` | `ProductsCatalogReadRequest` | `ProductsCatalogReadResponse` | `/api/v1/products/katalog` | `/v1/products/katalog` |
| `products.detail.read` | `query` | `ProductsDetailReadRequest` | `ProductsDetailReadResponse` | `/api/v1/products/szczegoly/{resourceId}` | `/v1/products/szczegoly/{resourceId}` |
| `products.gaps.queue.read` | `query` | `ProductsGapsQueueReadRequest` | `ProductsGapsQueueReadResponse` | `/api/v1/products/kolejka-brakow` | `/v1/products/kolejka-brakow` |
| `products.impact.read` | `query` | `ProductsImpactReadRequest` | `ProductsImpactReadResponse` | `/api/v1/products/analiza-wplywu` | `/v1/products/analiza-wplywu` |
| `products.mapping.read` | `query` | `ProductsMappingReadRequest` | `ProductsMappingReadResponse` | `/api/v1/products/mapowanie` | `/v1/products/mapowanie` |
| `products.mapping.update` | `command` | `ProductsMappingUpdateRequest` | `ProductsMappingUpdateResponse` | `/api/v1/products/mapping` | `/v1/products/mapping` |
| `products.offers.read` | `query` | `ProductsOffersReadRequest` | `ProductsOffersReadResponse` | `/api/v1/products/oferty` | `/v1/products/oferty` |
| `products.overview.read` | `query` | `ProductsOverviewReadRequest` | `ProductsOverviewReadResponse` | `/api/v1/products/przeglad` | `/v1/products/przeglad` |
| `products.performance.read` | `query` | `ProductsPerformanceReadRequest` | `ProductsPerformanceReadResponse` | `/api/v1/products/wydajnosc` | `/v1/products/wydajnosc` |
| `products.read` | `query` | `ProductsReadRequest` | `ProductsReadResponse` | `/api/v1/products/read` | `/v1/products/read` |
| `products.write` | `command` | `ProductsWriteRequest` | `ProductsWriteResponse` | `/api/v1/products/write` | `/v1/products/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
