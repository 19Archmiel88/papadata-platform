---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-COMPANY
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Company — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `company.draft.update` | `command` | `PUT` | `/api/v1/company/draft` | `/v1/company/draft` | `CompanyDraftUpdateRequest` | `CompanyDraftUpdateResponse` |
| `company.lookup` | `query` | `GET` | `/api/v1/company/lookup` | `/v1/company/lookup` | `CompanyLookupRequest` | `CompanyLookupResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `company.draft.update` | `command` | `CompanyDraftUpdateRequest` | `CompanyDraftUpdateResponse` | `/api/v1/company/draft` | `/v1/company/draft` |
| `company.lookup` | `query` | `CompanyLookupRequest` | `CompanyLookupResponse` | `/api/v1/company/lookup` | `/v1/company/lookup` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
