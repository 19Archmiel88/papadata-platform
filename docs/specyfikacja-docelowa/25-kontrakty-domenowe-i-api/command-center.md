---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-COMMAND-CENTER
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Command Center — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `command-center.ai-recommendations.read` | `query` | `GET` | `/api/v1/command-center/rekomendacje-ai-skrot` | `/v1/command-center/rekomendacje-ai-skrot` | `CommandCenterAiRecommendationsReadRequest` | `CommandCenterAiRecommendationsReadResponse` |
| `command-center.attention.queue.read` | `query` | `GET` | `/api/v1/command-center/kolejka-uwagi` | `/v1/command-center/kolejka-uwagi` | `CommandCenterAttentionQueueReadRequest` | `CommandCenterAttentionQueueReadResponse` |
| `command-center.customers-summary.read` | `query` | `GET` | `/api/v1/command-center/klienci` | `/v1/command-center/klienci` | `CommandCenterCustomersSummaryReadRequest` | `CommandCenterCustomersSummaryReadResponse` |
| `command-center.drivers.read` | `query` | `GET` | `/api/v1/command-center/drivery-wyniku` | `/v1/command-center/drivery-wyniku` | `CommandCenterDriversReadRequest` | `CommandCenterDriversReadResponse` |
| `command-center.funnel.read` | `query` | `GET` | `/api/v1/command-center/lejek` | `/v1/command-center/lejek` | `CommandCenterFunnelReadRequest` | `CommandCenterFunnelReadResponse` |
| `command-center.kpi.read` | `query` | `GET` | `/api/v1/command-center/kpi` | `/v1/command-center/kpi` | `CommandCenterKpiReadRequest` | `CommandCenterKpiReadResponse` |
| `command-center.overview.read` | `query` | `GET` | `/api/v1/command-center/widok-glowny` | `/v1/command-center/widok-glowny` | `CommandCenterOverviewReadRequest` | `CommandCenterOverviewReadResponse` |
| `command-center.plan-performance.read` | `query` | `GET` | `/api/v1/command-center/plan-vs-wynik` | `/v1/command-center/plan-vs-wynik` | `CommandCenterPlanPerformanceReadRequest` | `CommandCenterPlanPerformanceReadResponse` |
| `command-center.products-summary.read` | `query` | `GET` | `/api/v1/command-center/produkty` | `/v1/command-center/produkty` | `CommandCenterProductsSummaryReadRequest` | `CommandCenterProductsSummaryReadResponse` |
| `command-center.read` | `query` | `GET` | `/api/v1/command-center/read` | `/v1/command-center/read` | `CommandCenterReadRequest` | `CommandCenterReadResponse` |
| `command-center.sales-signals.read` | `query` | `GET` | `/api/v1/command-center/sygnaly-sprzedazowe` | `/v1/command-center/sygnaly-sprzedazowe` | `CommandCenterSalesSignalsReadRequest` | `CommandCenterSalesSignalsReadResponse` |
| `command-center.sales-sources.read` | `query` | `GET` | `/api/v1/command-center/zrodla-sprzedazy` | `/v1/command-center/zrodla-sprzedazy` | `CommandCenterSalesSourcesReadRequest` | `CommandCenterSalesSourcesReadResponse` |
| `command-center.traffic-summary.read` | `query` | `GET` | `/api/v1/command-center/ruch` | `/v1/command-center/ruch` | `CommandCenterTrafficSummaryReadRequest` | `CommandCenterTrafficSummaryReadResponse` |
| `command-center.waterfall.read` | `query` | `GET` | `/api/v1/command-center/waterfall` | `/v1/command-center/waterfall` | `CommandCenterWaterfallReadRequest` | `CommandCenterWaterfallReadResponse` |
| `command-center.write` | `command` | `POST` | `/api/v1/command-center/write` | `/v1/command-center/write` | `CommandCenterWriteRequest` | `CommandCenterWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `command-center.ai-recommendations.read` | `query` | `CommandCenterAiRecommendationsReadRequest` | `CommandCenterAiRecommendationsReadResponse` | `/api/v1/command-center/rekomendacje-ai-skrot` | `/v1/command-center/rekomendacje-ai-skrot` |
| `command-center.attention.queue.read` | `query` | `CommandCenterAttentionQueueReadRequest` | `CommandCenterAttentionQueueReadResponse` | `/api/v1/command-center/kolejka-uwagi` | `/v1/command-center/kolejka-uwagi` |
| `command-center.customers-summary.read` | `query` | `CommandCenterCustomersSummaryReadRequest` | `CommandCenterCustomersSummaryReadResponse` | `/api/v1/command-center/klienci` | `/v1/command-center/klienci` |
| `command-center.drivers.read` | `query` | `CommandCenterDriversReadRequest` | `CommandCenterDriversReadResponse` | `/api/v1/command-center/drivery-wyniku` | `/v1/command-center/drivery-wyniku` |
| `command-center.funnel.read` | `query` | `CommandCenterFunnelReadRequest` | `CommandCenterFunnelReadResponse` | `/api/v1/command-center/lejek` | `/v1/command-center/lejek` |
| `command-center.kpi.read` | `query` | `CommandCenterKpiReadRequest` | `CommandCenterKpiReadResponse` | `/api/v1/command-center/kpi` | `/v1/command-center/kpi` |
| `command-center.overview.read` | `query` | `CommandCenterOverviewReadRequest` | `CommandCenterOverviewReadResponse` | `/api/v1/command-center/widok-glowny` | `/v1/command-center/widok-glowny` |
| `command-center.plan-performance.read` | `query` | `CommandCenterPlanPerformanceReadRequest` | `CommandCenterPlanPerformanceReadResponse` | `/api/v1/command-center/plan-vs-wynik` | `/v1/command-center/plan-vs-wynik` |
| `command-center.products-summary.read` | `query` | `CommandCenterProductsSummaryReadRequest` | `CommandCenterProductsSummaryReadResponse` | `/api/v1/command-center/produkty` | `/v1/command-center/produkty` |
| `command-center.read` | `query` | `CommandCenterReadRequest` | `CommandCenterReadResponse` | `/api/v1/command-center/read` | `/v1/command-center/read` |
| `command-center.sales-signals.read` | `query` | `CommandCenterSalesSignalsReadRequest` | `CommandCenterSalesSignalsReadResponse` | `/api/v1/command-center/sygnaly-sprzedazowe` | `/v1/command-center/sygnaly-sprzedazowe` |
| `command-center.sales-sources.read` | `query` | `CommandCenterSalesSourcesReadRequest` | `CommandCenterSalesSourcesReadResponse` | `/api/v1/command-center/zrodla-sprzedazy` | `/v1/command-center/zrodla-sprzedazy` |
| `command-center.traffic-summary.read` | `query` | `CommandCenterTrafficSummaryReadRequest` | `CommandCenterTrafficSummaryReadResponse` | `/api/v1/command-center/ruch` | `/v1/command-center/ruch` |
| `command-center.waterfall.read` | `query` | `CommandCenterWaterfallReadRequest` | `CommandCenterWaterfallReadResponse` | `/api/v1/command-center/waterfall` | `/v1/command-center/waterfall` |
| `command-center.write` | `command` | `CommandCenterWriteRequest` | `CommandCenterWriteResponse` | `/api/v1/command-center/write` | `/v1/command-center/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
