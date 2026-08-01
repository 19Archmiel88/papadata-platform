---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-DATA-QUALITY
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Data Quality — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `data-quality.center.read` | `query` | `GET` | `/api/v1/data-quality/centrum-jakosci` | `/v1/data-quality/centrum-jakosci` | `DataQualityCenterReadRequest` | `DataQualityCenterReadResponse` |
| `data-quality.conflicts.read` | `query` | `GET` | `/api/v1/data-quality/konflikty` | `/v1/data-quality/konflikty` | `DataQualityConflictsReadRequest` | `DataQualityConflictsReadResponse` |
| `data-quality.dataset.read` | `query` | `GET` | `/api/v1/data-quality/zbior-danych` | `/v1/data-quality/zbior-danych` | `DataQualityDatasetReadRequest` | `DataQualityDatasetReadResponse` |
| `data-quality.lineage.read` | `query` | `GET` | `/api/v1/data-quality/pochodzenie-danych` | `/v1/data-quality/pochodzenie-danych` | `DataQualityLineageReadRequest` | `DataQualityLineageReadResponse` |
| `data-quality.manual-review.read` | `query` | `GET` | `/api/v1/data-quality/przeglad-reczny` | `/v1/data-quality/przeglad-reczny` | `DataQualityManualReviewReadRequest` | `DataQualityManualReviewReadResponse` |
| `data-quality.manual-review.submit` | `command` | `POST` | `/api/v1/data-quality/manual-review` | `/v1/data-quality/manual-review` | `DataQualityManualReviewSubmitRequest` | `DataQualityManualReviewSubmitResponse` |
| `data-quality.read` | `query` | `GET` | `/api/v1/data-quality/read` | `/v1/data-quality/read` | `DataQualityReadRequest` | `DataQualityReadResponse` |
| `data-quality.readiness.read` | `query` | `GET` | `/api/v1/data-quality/readiness` | `/v1/data-quality/readiness` | `DataQualityReadinessReadRequest` | `DataQualityReadinessReadResponse` |
| `data-quality.reconciliation.confirm` | `command` | `POST` | `/api/v1/data-quality/reconciliation/confirm` | `/v1/data-quality/reconciliation/confirm` | `DataQualityReconciliationConfirmRequest` | `DataQualityReconciliationConfirmResponse` |
| `data-quality.reconciliation.read` | `query` | `GET` | `/api/v1/data-quality/rekoncyliacja` | `/v1/data-quality/rekoncyliacja` | `DataQualityReconciliationReadRequest` | `DataQualityReconciliationReadResponse` |
| `data-quality.reprocess.start` | `command` | `POST` | `/api/v1/data-quality/reprocess` | `/v1/data-quality/reprocess` | `DataQualityReprocessStartRequest` | `DataQualityReprocessStartResponse` |
| `data-quality.reprocessing.read` | `query` | `GET` | `/api/v1/data-quality/ponowne-przetwarzanie` | `/v1/data-quality/ponowne-przetwarzanie` | `DataQualityReprocessingReadRequest` | `DataQualityReprocessingReadResponse` |
| `data-quality.source-overlap.read` | `query` | `GET` | `/api/v1/data-quality/nakladanie-zrodel` | `/v1/data-quality/nakladanie-zrodel` | `DataQualitySourceOverlapReadRequest` | `DataQualitySourceOverlapReadResponse` |
| `data-quality.source-priority.read` | `query` | `GET` | `/api/v1/data-quality/nadrzednosc-zrodla` | `/v1/data-quality/nadrzednosc-zrodla` | `DataQualitySourcePriorityReadRequest` | `DataQualitySourcePriorityReadResponse` |
| `data-quality.write` | `command` | `POST` | `/api/v1/data-quality/write` | `/v1/data-quality/write` | `DataQualityWriteRequest` | `DataQualityWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `data-quality.center.read` | `query` | `DataQualityCenterReadRequest` | `DataQualityCenterReadResponse` | `/api/v1/data-quality/centrum-jakosci` | `/v1/data-quality/centrum-jakosci` |
| `data-quality.conflicts.read` | `query` | `DataQualityConflictsReadRequest` | `DataQualityConflictsReadResponse` | `/api/v1/data-quality/konflikty` | `/v1/data-quality/konflikty` |
| `data-quality.dataset.read` | `query` | `DataQualityDatasetReadRequest` | `DataQualityDatasetReadResponse` | `/api/v1/data-quality/zbior-danych` | `/v1/data-quality/zbior-danych` |
| `data-quality.lineage.read` | `query` | `DataQualityLineageReadRequest` | `DataQualityLineageReadResponse` | `/api/v1/data-quality/pochodzenie-danych` | `/v1/data-quality/pochodzenie-danych` |
| `data-quality.manual-review.read` | `query` | `DataQualityManualReviewReadRequest` | `DataQualityManualReviewReadResponse` | `/api/v1/data-quality/przeglad-reczny` | `/v1/data-quality/przeglad-reczny` |
| `data-quality.manual-review.submit` | `command` | `DataQualityManualReviewSubmitRequest` | `DataQualityManualReviewSubmitResponse` | `/api/v1/data-quality/manual-review` | `/v1/data-quality/manual-review` |
| `data-quality.read` | `query` | `DataQualityReadRequest` | `DataQualityReadResponse` | `/api/v1/data-quality/read` | `/v1/data-quality/read` |
| `data-quality.readiness.read` | `query` | `DataQualityReadinessReadRequest` | `DataQualityReadinessReadResponse` | `/api/v1/data-quality/readiness` | `/v1/data-quality/readiness` |
| `data-quality.reconciliation.confirm` | `command` | `DataQualityReconciliationConfirmRequest` | `DataQualityReconciliationConfirmResponse` | `/api/v1/data-quality/reconciliation/confirm` | `/v1/data-quality/reconciliation/confirm` |
| `data-quality.reconciliation.read` | `query` | `DataQualityReconciliationReadRequest` | `DataQualityReconciliationReadResponse` | `/api/v1/data-quality/rekoncyliacja` | `/v1/data-quality/rekoncyliacja` |
| `data-quality.reprocess.start` | `command` | `DataQualityReprocessStartRequest` | `DataQualityReprocessStartResponse` | `/api/v1/data-quality/reprocess` | `/v1/data-quality/reprocess` |
| `data-quality.reprocessing.read` | `query` | `DataQualityReprocessingReadRequest` | `DataQualityReprocessingReadResponse` | `/api/v1/data-quality/ponowne-przetwarzanie` | `/v1/data-quality/ponowne-przetwarzanie` |
| `data-quality.source-overlap.read` | `query` | `DataQualitySourceOverlapReadRequest` | `DataQualitySourceOverlapReadResponse` | `/api/v1/data-quality/nakladanie-zrodel` | `/v1/data-quality/nakladanie-zrodel` |
| `data-quality.source-priority.read` | `query` | `DataQualitySourcePriorityReadRequest` | `DataQualitySourcePriorityReadResponse` | `/api/v1/data-quality/nadrzednosc-zrodla` | `/v1/data-quality/nadrzednosc-zrodla` |
| `data-quality.write` | `command` | `DataQualityWriteRequest` | `DataQualityWriteResponse` | `/api/v1/data-quality/write` | `/v1/data-quality/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
