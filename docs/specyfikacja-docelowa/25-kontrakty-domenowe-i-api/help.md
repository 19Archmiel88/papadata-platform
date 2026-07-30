---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-HELP
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Help — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `help.home.read` | `query` | `GET` | `/api/v1/help/strona-glowna-pomocy` | `/v1/help/strona-glowna-pomocy` | `HelpHomeReadRequest` | `HelpHomeReadResponse` |
| `help.procedure-detail.read` | `query` | `GET` | `/api/v1/help/szczegoly-procedury` | `/v1/help/szczegoly-procedury` | `HelpProcedureDetailReadRequest` | `HelpProcedureDetailReadResponse` |
| `help.procedures.read` | `query` | `GET` | `/api/v1/help/procedury` | `/v1/help/procedury` | `HelpProceduresReadRequest` | `HelpProceduresReadResponse` |
| `help.read` | `query` | `GET` | `/api/v1/help/read` | `/v1/help/read` | `HelpReadRequest` | `HelpReadResponse` |
| `help.results.read` | `query` | `GET` | `/api/v1/help/lista-wynikow` | `/v1/help/lista-wynikow` | `HelpResultsReadRequest` | `HelpResultsReadResponse` |
| `help.support-request.read` | `query` | `GET` | `/api/v1/help/zgloszenie-wsparcia` | `/v1/help/zgloszenie-wsparcia` | `HelpSupportRequestReadRequest` | `HelpSupportRequestReadResponse` |
| `help.write` | `command` | `POST` | `/api/v1/help/write` | `/v1/help/write` | `HelpWriteRequest` | `HelpWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `help.home.read` | `query` | `HelpHomeReadRequest` | `HelpHomeReadResponse` | `/api/v1/help/strona-glowna-pomocy` | `/v1/help/strona-glowna-pomocy` |
| `help.procedure-detail.read` | `query` | `HelpProcedureDetailReadRequest` | `HelpProcedureDetailReadResponse` | `/api/v1/help/szczegoly-procedury/{resourceId}` | `/v1/help/szczegoly-procedury/{resourceId}` |
| `help.procedures.read` | `query` | `HelpProceduresReadRequest` | `HelpProceduresReadResponse` | `/api/v1/help/procedury/{resourceId}` | `/v1/help/procedury/{resourceId}` |
| `help.read` | `query` | `HelpReadRequest` | `HelpReadResponse` | `/api/v1/help/read` | `/v1/help/read` |
| `help.results.read` | `query` | `HelpResultsReadRequest` | `HelpResultsReadResponse` | `/api/v1/help/lista-wynikow` | `/v1/help/lista-wynikow` |
| `help.support-request.read` | `query` | `HelpSupportRequestReadRequest` | `HelpSupportRequestReadResponse` | `/api/v1/help/zgloszenie-wsparcia/{resourceId}` | `/v1/help/zgloszenie-wsparcia/{resourceId}` |
| `help.write` | `command` | `HelpWriteRequest` | `HelpWriteResponse` | `/api/v1/help/write` | `/v1/help/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
