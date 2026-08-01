---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-TRAFFIC
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Traffic — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `traffic.channels.read` | `query` | `GET` | `/api/v1/traffic/kanaly` | `/v1/traffic/kanaly` | `TrafficChannelsReadRequest` | `TrafficChannelsReadResponse` |
| `traffic.drop.diagnose` | `query` | `GET` | `/api/v1/traffic/drop/diagnose` | `/v1/traffic/drop/diagnose` | `TrafficDropDiagnoseRequest` | `TrafficDropDiagnoseResponse` |
| `traffic.event-quality.read` | `query` | `GET` | `/api/v1/traffic/jakosc-zdarzen` | `/v1/traffic/jakosc-zdarzen` | `TrafficEventQualityReadRequest` | `TrafficEventQualityReadResponse` |
| `traffic.funnel-definitions.read` | `query` | `GET` | `/api/v1/traffic/definicje-lejka` | `/v1/traffic/definicje-lejka` | `TrafficFunnelDefinitionsReadRequest` | `TrafficFunnelDefinitionsReadResponse` |
| `traffic.funnel-step.read` | `query` | `GET` | `/api/v1/traffic/lejek-szczegoly-kroku` | `/v1/traffic/lejek-szczegoly-kroku` | `TrafficFunnelStepReadRequest` | `TrafficFunnelStepReadResponse` |
| `traffic.funnel.read` | `query` | `GET` | `/api/v1/traffic/lejek-widok` | `/v1/traffic/lejek-widok` | `TrafficFunnelReadRequest` | `TrafficFunnelReadResponse` |
| `traffic.ga4-orders.read` | `query` | `GET` | `/api/v1/traffic/ga4-vs-zamowienia` | `/v1/traffic/ga4-vs-zamowienia` | `TrafficGa4OrdersReadRequest` | `TrafficGa4OrdersReadResponse` |
| `traffic.landing-pages.read` | `query` | `GET` | `/api/v1/traffic/strony-wejscia` | `/v1/traffic/strony-wejscia` | `TrafficLandingPagesReadRequest` | `TrafficLandingPagesReadResponse` |
| `traffic.overview.read` | `query` | `GET` | `/api/v1/traffic/przeglad-ruchu` | `/v1/traffic/przeglad-ruchu` | `TrafficOverviewReadRequest` | `TrafficOverviewReadResponse` |
| `traffic.read` | `query` | `GET` | `/api/v1/traffic/read` | `/v1/traffic/read` | `TrafficReadRequest` | `TrafficReadResponse` |
| `traffic.write` | `command` | `POST` | `/api/v1/traffic/write` | `/v1/traffic/write` | `TrafficWriteRequest` | `TrafficWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `traffic.channels.read` | `query` | `TrafficChannelsReadRequest` | `TrafficChannelsReadResponse` | `/api/v1/traffic/kanaly` | `/v1/traffic/kanaly` |
| `traffic.drop.diagnose` | `query` | `TrafficDropDiagnoseRequest` | `TrafficDropDiagnoseResponse` | `/api/v1/traffic/drop/diagnose` | `/v1/traffic/drop/diagnose` |
| `traffic.event-quality.read` | `query` | `TrafficEventQualityReadRequest` | `TrafficEventQualityReadResponse` | `/api/v1/traffic/jakosc-zdarzen` | `/v1/traffic/jakosc-zdarzen` |
| `traffic.funnel-definitions.read` | `query` | `TrafficFunnelDefinitionsReadRequest` | `TrafficFunnelDefinitionsReadResponse` | `/api/v1/traffic/definicje-lejka` | `/v1/traffic/definicje-lejka` |
| `traffic.funnel-step.read` | `query` | `TrafficFunnelStepReadRequest` | `TrafficFunnelStepReadResponse` | `/api/v1/traffic/lejek-szczegoly-kroku/{resourceId}` | `/v1/traffic/lejek-szczegoly-kroku/{resourceId}` |
| `traffic.funnel.read` | `query` | `TrafficFunnelReadRequest` | `TrafficFunnelReadResponse` | `/api/v1/traffic/lejek-widok` | `/v1/traffic/lejek-widok` |
| `traffic.ga4-orders.read` | `query` | `TrafficGa4OrdersReadRequest` | `TrafficGa4OrdersReadResponse` | `/api/v1/traffic/ga4-vs-zamowienia` | `/v1/traffic/ga4-vs-zamowienia` |
| `traffic.landing-pages.read` | `query` | `TrafficLandingPagesReadRequest` | `TrafficLandingPagesReadResponse` | `/api/v1/traffic/strony-wejscia` | `/v1/traffic/strony-wejscia` |
| `traffic.overview.read` | `query` | `TrafficOverviewReadRequest` | `TrafficOverviewReadResponse` | `/api/v1/traffic/przeglad-ruchu` | `/v1/traffic/przeglad-ruchu` |
| `traffic.read` | `query` | `TrafficReadRequest` | `TrafficReadResponse` | `/api/v1/traffic/read` | `/v1/traffic/read` |
| `traffic.write` | `command` | `TrafficWriteRequest` | `TrafficWriteResponse` | `/api/v1/traffic/write` | `/v1/traffic/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
