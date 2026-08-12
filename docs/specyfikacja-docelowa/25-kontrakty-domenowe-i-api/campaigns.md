---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-CAMPAIGNS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
work_prerequisite: "Przed wykonaniem prac należy zapoznać się z tym dokumentem i jego powiązaniami."
---

# Campaigns — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `campaigns.attribution-sales.read` | `query` | `GET` | `/api/v1/campaigns/atrybucja-i-sprzedaz` | `/v1/campaigns/atrybucja-i-sprzedaz` | `CampaignsAttributionSalesReadRequest` | `CampaignsAttributionSalesReadResponse` |
| `campaigns.budget.change.propose` | `command` | `POST` | `/api/v1/campaigns/budget/proposals` | `/v1/campaigns/budget/proposals` | `CampaignsBudgetChangeProposeRequest` | `CampaignsBudgetChangeProposeResponse` |
| `campaigns.budget.read` | `query` | `GET` | `/api/v1/campaigns/budzet` | `/v1/campaigns/budzet` | `CampaignsBudgetReadRequest` | `CampaignsBudgetReadResponse` |
| `campaigns.budget.recommendation.read` | `query` | `GET` | `/api/v1/campaigns/budget/recommendation` | `/v1/campaigns/budget/recommendation` | `CampaignsBudgetRecommendationReadRequest` | `CampaignsBudgetRecommendationReadResponse` |
| `campaigns.detail.read` | `query` | `GET` | `/api/v1/campaigns/szczegoly-kampanii` | `/v1/campaigns/szczegoly-kampanii` | `CampaignsDetailReadRequest` | `CampaignsDetailReadResponse` |
| `campaigns.diagnostics.read` | `query` | `GET` | `/api/v1/campaigns/diagnostyka` | `/v1/campaigns/diagnostyka` | `CampaignsDiagnosticsReadRequest` | `CampaignsDiagnosticsReadResponse` |
| `campaigns.list.read` | `query` | `GET` | `/api/v1/campaigns/lista-kampanii` | `/v1/campaigns/lista-kampanii` | `CampaignsListReadRequest` | `CampaignsListReadResponse` |
| `campaigns.overview.read` | `query` | `GET` | `/api/v1/campaigns/przeglad` | `/v1/campaigns/przeglad` | `CampaignsOverviewReadRequest` | `CampaignsOverviewReadResponse` |
| `campaigns.read` | `query` | `GET` | `/api/v1/campaigns/read` | `/v1/campaigns/read` | `CampaignsReadRequest` | `CampaignsReadResponse` |
| `campaigns.recommendations.read` | `query` | `GET` | `/api/v1/campaigns/rekomendacje-kontekst-domenowy` | `/v1/campaigns/rekomendacje-kontekst-domenowy` | `CampaignsRecommendationsReadRequest` | `CampaignsRecommendationsReadResponse` |
| `campaigns.write` | `command` | `POST` | `/api/v1/campaigns/write` | `/v1/campaigns/write` | `CampaignsWriteRequest` | `CampaignsWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `campaigns.attribution-sales.read` | `query` | `CampaignsAttributionSalesReadRequest` | `CampaignsAttributionSalesReadResponse` | `/api/v1/campaigns/atrybucja-i-sprzedaz` | `/v1/campaigns/atrybucja-i-sprzedaz` |
| `campaigns.budget.change.propose` | `command` | `CampaignsBudgetChangeProposeRequest` | `CampaignsBudgetChangeProposeResponse` | `/api/v1/campaigns/budget/proposals` | `/v1/campaigns/budget/proposals` |
| `campaigns.budget.read` | `query` | `CampaignsBudgetReadRequest` | `CampaignsBudgetReadResponse` | `/api/v1/campaigns/budzet` | `/v1/campaigns/budzet` |
| `campaigns.budget.recommendation.read` | `query` | `CampaignsBudgetRecommendationReadRequest` | `CampaignsBudgetRecommendationReadResponse` | `/api/v1/campaigns/budget/recommendation` | `/v1/campaigns/budget/recommendation` |
| `campaigns.detail.read` | `query` | `CampaignsDetailReadRequest` | `CampaignsDetailReadResponse` | `/api/v1/campaigns/szczegoly-kampanii/{resourceId}` | `/v1/campaigns/szczegoly-kampanii/{resourceId}` |
| `campaigns.diagnostics.read` | `query` | `CampaignsDiagnosticsReadRequest` | `CampaignsDiagnosticsReadResponse` | `/api/v1/campaigns/diagnostyka` | `/v1/campaigns/diagnostyka` |
| `campaigns.list.read` | `query` | `CampaignsListReadRequest` | `CampaignsListReadResponse` | `/api/v1/campaigns/lista-kampanii` | `/v1/campaigns/lista-kampanii` |
| `campaigns.overview.read` | `query` | `CampaignsOverviewReadRequest` | `CampaignsOverviewReadResponse` | `/api/v1/campaigns/przeglad` | `/v1/campaigns/przeglad` |
| `campaigns.read` | `query` | `CampaignsReadRequest` | `CampaignsReadResponse` | `/api/v1/campaigns/read` | `/v1/campaigns/read` |
| `campaigns.recommendations.read` | `query` | `CampaignsRecommendationsReadRequest` | `CampaignsRecommendationsReadResponse` | `/api/v1/campaigns/rekomendacje-kontekst-domenowy` | `/v1/campaigns/rekomendacje-kontekst-domenowy` |
| `campaigns.write` | `command` | `CampaignsWriteRequest` | `CampaignsWriteResponse` | `/api/v1/campaigns/write` | `/v1/campaigns/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
