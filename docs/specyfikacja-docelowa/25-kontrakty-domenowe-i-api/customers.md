---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-CUSTOMERS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Customers — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `customers.cohorts.read` | `query` | `GET` | `/api/v1/customers/kohorty` | `/v1/customers/kohorty` | `CustomersCohortsReadRequest` | `CustomersCohortsReadResponse` |
| `customers.identity-conflicts.read` | `query` | `GET` | `/api/v1/customers/konflikty-tozsamosci` | `/v1/customers/konflikty-tozsamosci` | `CustomersIdentityConflictsReadRequest` | `CustomersIdentityConflictsReadResponse` |
| `customers.impact.read` | `query` | `GET` | `/api/v1/customers/analiza-wplywu` | `/v1/customers/analiza-wplywu` | `CustomersImpactReadRequest` | `CustomersImpactReadResponse` |
| `customers.overview.read` | `query` | `GET` | `/api/v1/customers/przeglad` | `/v1/customers/przeglad` | `CustomersOverviewReadRequest` | `CustomersOverviewReadResponse` |
| `customers.privacy.read` | `query` | `GET` | `/api/v1/customers/prywatnosc` | `/v1/customers/prywatnosc` | `CustomersPrivacyReadRequest` | `CustomersPrivacyReadResponse` |
| `customers.pseudonymized-detail.read` | `query` | `GET` | `/api/v1/customers/szczegoly-pseudonimizowane` | `/v1/customers/szczegoly-pseudonimizowane` | `CustomersPseudonymizedDetailReadRequest` | `CustomersPseudonymizedDetailReadResponse` |
| `customers.read` | `query` | `GET` | `/api/v1/customers/read` | `/v1/customers/read` | `CustomersReadRequest` | `CustomersReadResponse` |
| `customers.segment.analyze` | `query` | `GET` | `/api/v1/customers/segment/analyze` | `/v1/customers/segment/analyze` | `CustomersSegmentAnalyzeRequest` | `CustomersSegmentAnalyzeResponse` |
| `customers.segments.read` | `query` | `GET` | `/api/v1/customers/segmenty` | `/v1/customers/segmenty` | `CustomersSegmentsReadRequest` | `CustomersSegmentsReadResponse` |
| `customers.write` | `command` | `POST` | `/api/v1/customers/write` | `/v1/customers/write` | `CustomersWriteRequest` | `CustomersWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `customers.cohorts.read` | `query` | `CustomersCohortsReadRequest` | `CustomersCohortsReadResponse` | `/api/v1/customers/kohorty` | `/v1/customers/kohorty` |
| `customers.identity-conflicts.read` | `query` | `CustomersIdentityConflictsReadRequest` | `CustomersIdentityConflictsReadResponse` | `/api/v1/customers/konflikty-tozsamosci` | `/v1/customers/konflikty-tozsamosci` |
| `customers.impact.read` | `query` | `CustomersImpactReadRequest` | `CustomersImpactReadResponse` | `/api/v1/customers/analiza-wplywu` | `/v1/customers/analiza-wplywu` |
| `customers.overview.read` | `query` | `CustomersOverviewReadRequest` | `CustomersOverviewReadResponse` | `/api/v1/customers/przeglad` | `/v1/customers/przeglad` |
| `customers.privacy.read` | `query` | `CustomersPrivacyReadRequest` | `CustomersPrivacyReadResponse` | `/api/v1/customers/prywatnosc` | `/v1/customers/prywatnosc` |
| `customers.pseudonymized-detail.read` | `query` | `CustomersPseudonymizedDetailReadRequest` | `CustomersPseudonymizedDetailReadResponse` | `/api/v1/customers/szczegoly-pseudonimizowane/{resourceId}` | `/v1/customers/szczegoly-pseudonimizowane/{resourceId}` |
| `customers.read` | `query` | `CustomersReadRequest` | `CustomersReadResponse` | `/api/v1/customers/read` | `/v1/customers/read` |
| `customers.segment.analyze` | `query` | `CustomersSegmentAnalyzeRequest` | `CustomersSegmentAnalyzeResponse` | `/api/v1/customers/segment/analyze` | `/v1/customers/segment/analyze` |
| `customers.segments.read` | `query` | `CustomersSegmentsReadRequest` | `CustomersSegmentsReadResponse` | `/api/v1/customers/segmenty` | `/v1/customers/segmenty` |
| `customers.write` | `command` | `CustomersWriteRequest` | `CustomersWriteResponse` | `/api/v1/customers/write` | `/v1/customers/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
