---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-ORDERS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Orders — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `orders.detail.read` | `query` | `GET` | `/api/v1/orders/szczegoly` | `/v1/orders/szczegoly` | `OrdersDetailReadRequest` | `OrdersDetailReadResponse` |
| `orders.eksport.read` | `query` | `GET` | `/api/v1/orders/eksport` | `/v1/orders/eksport` | `OrdersEksportReadRequest` | `OrdersEksportReadResponse` |
| `orders.list.read` | `query` | `GET` | `/api/v1/orders/lista` | `/v1/orders/lista` | `OrdersListReadRequest` | `OrdersListReadResponse` |
| `orders.os-zdarzen.read` | `query` | `GET` | `/api/v1/orders/os-zdarzen` | `/v1/orders/os-zdarzen` | `OrdersOsZdarzenReadRequest` | `OrdersOsZdarzenReadResponse` |
| `orders.overview.read` | `query` | `GET` | `/api/v1/orders/przeglad` | `/v1/orders/przeglad` | `OrdersOverviewReadRequest` | `OrdersOverviewReadResponse` |
| `orders.porownanie-zrodel.read` | `query` | `GET` | `/api/v1/orders/porownanie-zrodel` | `/v1/orders/porownanie-zrodel` | `OrdersPorownanieZrodelReadRequest` | `OrdersPorownanieZrodelReadResponse` |
| `orders.read` | `query` | `GET` | `/api/v1/orders/read` | `/v1/orders/read` | `OrdersReadRequest` | `OrdersReadResponse` |
| `orders.rekoncyliacja-skrot.read` | `query` | `GET` | `/api/v1/orders/rekoncyliacja-skrot` | `/v1/orders/rekoncyliacja-skrot` | `OrdersRekoncyliacjaSkrotReadRequest` | `OrdersRekoncyliacjaSkrotReadResponse` |
| `orders.write` | `command` | `POST` | `/api/v1/orders/write` | `/v1/orders/write` | `OrdersWriteRequest` | `OrdersWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `orders.detail.read` | `query` | `OrdersDetailReadRequest` | `OrdersDetailReadResponse` | `/api/v1/orders/szczegoly/{resourceId}` | `/v1/orders/szczegoly/{resourceId}` |
| `orders.eksport.read` | `query` | `OrdersEksportReadRequest` | `OrdersEksportReadResponse` | `/api/v1/orders/eksport` | `/v1/orders/eksport` |
| `orders.list.read` | `query` | `OrdersListReadRequest` | `OrdersListReadResponse` | `/api/v1/orders/lista` | `/v1/orders/lista` |
| `orders.os-zdarzen.read` | `query` | `OrdersOsZdarzenReadRequest` | `OrdersOsZdarzenReadResponse` | `/api/v1/orders/os-zdarzen` | `/v1/orders/os-zdarzen` |
| `orders.overview.read` | `query` | `OrdersOverviewReadRequest` | `OrdersOverviewReadResponse` | `/api/v1/orders/przeglad` | `/v1/orders/przeglad` |
| `orders.porownanie-zrodel.read` | `query` | `OrdersPorownanieZrodelReadRequest` | `OrdersPorownanieZrodelReadResponse` | `/api/v1/orders/porownanie-zrodel` | `/v1/orders/porownanie-zrodel` |
| `orders.read` | `query` | `OrdersReadRequest` | `OrdersReadResponse` | `/api/v1/orders/read` | `/v1/orders/read` |
| `orders.rekoncyliacja-skrot.read` | `query` | `OrdersRekoncyliacjaSkrotReadRequest` | `OrdersRekoncyliacjaSkrotReadResponse` | `/api/v1/orders/rekoncyliacja-skrot` | `/v1/orders/rekoncyliacja-skrot` |
| `orders.write` | `command` | `OrdersWriteRequest` | `OrdersWriteResponse` | `/api/v1/orders/write` | `/v1/orders/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
