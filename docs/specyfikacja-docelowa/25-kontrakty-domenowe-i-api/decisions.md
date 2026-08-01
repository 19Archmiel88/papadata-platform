---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-DECISIONS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Decisions — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `decisions.action-brief.read` | `query` | `GET` | `/api/v1/decisions/brief-dzialania` | `/v1/decisions/brief-dzialania` | `DecisionsActionBriefReadRequest` | `DecisionsActionBriefReadResponse` |
| `decisions.action-detail.read` | `query` | `GET` | `/api/v1/decisions/szczegoly-dzialania` | `/v1/decisions/szczegoly-dzialania` | `DecisionsActionDetailReadRequest` | `DecisionsActionDetailReadResponse` |
| `decisions.action-library.read` | `query` | `GET` | `/api/v1/decisions/biblioteka-dzialan` | `/v1/decisions/biblioteka-dzialan` | `DecisionsActionLibraryReadRequest` | `DecisionsActionLibraryReadResponse` |
| `decisions.action.brief.create` | `command` | `POST` | `/api/v1/decisions/action-brief` | `/v1/decisions/action-brief` | `DecisionsActionBriefCreateRequest` | `DecisionsActionBriefCreateResponse` |
| `decisions.center.read` | `query` | `GET` | `/api/v1/decisions/centrum-decyzji` | `/v1/decisions/centrum-decyzji` | `DecisionsCenterReadRequest` | `DecisionsCenterReadResponse` |
| `decisions.decision.record` | `command` | `POST` | `/api/v1/decisions/registry` | `/v1/decisions/registry` | `DecisionsDecisionRecordRequest` | `DecisionsDecisionRecordResponse` |
| `decisions.measurement.read` | `query` | `GET` | `/api/v1/decisions/pomiar` | `/v1/decisions/pomiar` | `DecisionsMeasurementReadRequest` | `DecisionsMeasurementReadResponse` |
| `decisions.observation.create` | `command` | `POST` | `/api/v1/decisions/observations` | `/v1/decisions/observations` | `DecisionsObservationCreateRequest` | `DecisionsObservationCreateResponse` |
| `decisions.observations.read` | `query` | `GET` | `/api/v1/decisions/obserwacje` | `/v1/decisions/obserwacje` | `DecisionsObservationsReadRequest` | `DecisionsObservationsReadResponse` |
| `decisions.recommendation.read` | `query` | `GET` | `/api/v1/decisions/recommendation` | `/v1/decisions/recommendation` | `DecisionsRecommendationReadRequest` | `DecisionsRecommendationReadResponse` |
| `decisions.registry.read` | `query` | `GET` | `/api/v1/decisions/rejestr-decyzji` | `/v1/decisions/rejestr-decyzji` | `DecisionsRegistryReadRequest` | `DecisionsRegistryReadResponse` |
| `decisions.rekomendacje.read` | `query` | `GET` | `/api/v1/decisions/rekomendacje` | `/v1/decisions/rekomendacje` | `DecisionsRekomendacjeReadRequest` | `DecisionsRekomendacjeReadResponse` |
| `decisions.relations.read` | `query` | `GET` | `/api/v1/decisions/powiazania-z-modulami-i-sprawami` | `/v1/decisions/powiazania-z-modulami-i-sprawami` | `DecisionsRelationsReadRequest` | `DecisionsRelationsReadResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `decisions.action-brief.read` | `query` | `DecisionsActionBriefReadRequest` | `DecisionsActionBriefReadResponse` | `/api/v1/decisions/brief-dzialania` | `/v1/decisions/brief-dzialania` |
| `decisions.action-detail.read` | `query` | `DecisionsActionDetailReadRequest` | `DecisionsActionDetailReadResponse` | `/api/v1/decisions/szczegoly-dzialania/{resourceId}` | `/v1/decisions/szczegoly-dzialania/{resourceId}` |
| `decisions.action-library.read` | `query` | `DecisionsActionLibraryReadRequest` | `DecisionsActionLibraryReadResponse` | `/api/v1/decisions/biblioteka-dzialan` | `/v1/decisions/biblioteka-dzialan` |
| `decisions.action.brief.create` | `command` | `DecisionsActionBriefCreateRequest` | `DecisionsActionBriefCreateResponse` | `/api/v1/decisions/action-brief` | `/v1/decisions/action-brief` |
| `decisions.center.read` | `query` | `DecisionsCenterReadRequest` | `DecisionsCenterReadResponse` | `/api/v1/decisions/centrum-decyzji` | `/v1/decisions/centrum-decyzji` |
| `decisions.decision.record` | `command` | `DecisionsDecisionRecordRequest` | `DecisionsDecisionRecordResponse` | `/api/v1/decisions/registry` | `/v1/decisions/registry` |
| `decisions.measurement.read` | `query` | `DecisionsMeasurementReadRequest` | `DecisionsMeasurementReadResponse` | `/api/v1/decisions/pomiar` | `/v1/decisions/pomiar` |
| `decisions.observation.create` | `command` | `DecisionsObservationCreateRequest` | `DecisionsObservationCreateResponse` | `/api/v1/decisions/observations` | `/v1/decisions/observations` |
| `decisions.observations.read` | `query` | `DecisionsObservationsReadRequest` | `DecisionsObservationsReadResponse` | `/api/v1/decisions/obserwacje` | `/v1/decisions/obserwacje` |
| `decisions.recommendation.read` | `query` | `DecisionsRecommendationReadRequest` | `DecisionsRecommendationReadResponse` | `/api/v1/decisions/recommendation` | `/v1/decisions/recommendation` |
| `decisions.registry.read` | `query` | `DecisionsRegistryReadRequest` | `DecisionsRegistryReadResponse` | `/api/v1/decisions/rejestr-decyzji` | `/v1/decisions/rejestr-decyzji` |
| `decisions.rekomendacje.read` | `query` | `DecisionsRekomendacjeReadRequest` | `DecisionsRekomendacjeReadResponse` | `/api/v1/decisions/rekomendacje` | `/v1/decisions/rekomendacje` |
| `decisions.relations.read` | `query` | `DecisionsRelationsReadRequest` | `DecisionsRelationsReadResponse` | `/api/v1/decisions/powiazania-z-modulami-i-sprawami` | `/v1/decisions/powiazania-z-modulami-i-sprawami` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
