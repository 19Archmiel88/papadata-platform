---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-BILLING
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Billing — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `billing.adjustments.read` | `query` | `GET` | `/api/v1/billing/korekty` | `/v1/billing/korekty` | `BillingAdjustmentsReadRequest` | `BillingAdjustmentsReadResponse` |
| `billing.change-cancel.read` | `query` | `GET` | `/api/v1/billing/zmiana-i-anulowanie` | `/v1/billing/zmiana-i-anulowanie` | `BillingChangeCancelReadRequest` | `BillingChangeCancelReadResponse` |
| `billing.entitlements.read` | `query` | `GET` | `/api/v1/billing/entitlements` | `/v1/billing/entitlements` | `BillingEntitlementsReadRequest` | `BillingEntitlementsReadResponse` |
| `billing.invoices.read` | `query` | `GET` | `/api/v1/billing/faktury` | `/v1/billing/faktury` | `BillingInvoicesReadRequest` | `BillingInvoicesReadResponse` |
| `billing.overdue-payment.read` | `query` | `GET` | `/api/v1/billing/zalegla-platnosc` | `/v1/billing/zalegla-platnosc` | `BillingOverduePaymentReadRequest` | `BillingOverduePaymentReadResponse` |
| `billing.overdue.resolve` | `command` | `POST` | `/api/v1/billing/overdue/resolve` | `/v1/billing/overdue/resolve` | `BillingOverdueResolveRequest` | `BillingOverdueResolveResponse` |
| `billing.payment.method.update` | `command` | `PUT` | `/api/v1/billing/payment-method` | `/v1/billing/payment-method` | `BillingPaymentMethodUpdateRequest` | `BillingPaymentMethodUpdateResponse` |
| `billing.payments.read` | `query` | `GET` | `/api/v1/billing/platnosci` | `/v1/billing/platnosci` | `BillingPaymentsReadRequest` | `BillingPaymentsReadResponse` |
| `billing.pilot-to-subscription.read` | `query` | `GET` | `/api/v1/billing/pilot-do-abonamentu` | `/v1/billing/pilot-do-abonamentu` | `BillingPilotToSubscriptionReadRequest` | `BillingPilotToSubscriptionReadResponse` |
| `billing.pilot.read` | `query` | `GET` | `/api/v1/billing/pilot` | `/v1/billing/pilot` | `BillingPilotReadRequest` | `BillingPilotReadResponse` |
| `billing.plan.select` | `command` | `POST` | `/api/v1/billing/plan/select` | `/v1/billing/plan/select` | `BillingPlanSelectRequest` | `BillingPlanSelectResponse` |
| `billing.plans.read` | `query` | `GET` | `/api/v1/billing/plany` | `/v1/billing/plany` | `BillingPlansReadRequest` | `BillingPlansReadResponse` |
| `billing.read` | `query` | `GET` | `/api/v1/billing/read` | `/v1/billing/read` | `BillingReadRequest` | `BillingReadResponse` |
| `billing.subscription.activate` | `command` | `POST` | `/api/v1/billing/subscription/activate` | `/v1/billing/subscription/activate` | `BillingSubscriptionActivateRequest` | `BillingSubscriptionActivateResponse` |
| `billing.subscription.read` | `query` | `GET` | `/api/v1/billing/subskrypcja` | `/v1/billing/subskrypcja` | `BillingSubscriptionReadRequest` | `BillingSubscriptionReadResponse` |
| `billing.usage-limits.read` | `query` | `GET` | `/api/v1/billing/uzycie-i-limity` | `/v1/billing/uzycie-i-limity` | `BillingUsageLimitsReadRequest` | `BillingUsageLimitsReadResponse` |
| `billing.write` | `command` | `POST` | `/api/v1/billing/write` | `/v1/billing/write` | `BillingWriteRequest` | `BillingWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `billing.adjustments.read` | `query` | `BillingAdjustmentsReadRequest` | `BillingAdjustmentsReadResponse` | `/api/v1/billing/korekty` | `/v1/billing/korekty` |
| `billing.change-cancel.read` | `query` | `BillingChangeCancelReadRequest` | `BillingChangeCancelReadResponse` | `/api/v1/billing/zmiana-i-anulowanie` | `/v1/billing/zmiana-i-anulowanie` |
| `billing.entitlements.read` | `query` | `BillingEntitlementsReadRequest` | `BillingEntitlementsReadResponse` | `/api/v1/billing/entitlements` | `/v1/billing/entitlements` |
| `billing.invoices.read` | `query` | `BillingInvoicesReadRequest` | `BillingInvoicesReadResponse` | `/api/v1/billing/faktury` | `/v1/billing/faktury` |
| `billing.overdue-payment.read` | `query` | `BillingOverduePaymentReadRequest` | `BillingOverduePaymentReadResponse` | `/api/v1/billing/zalegla-platnosc` | `/v1/billing/zalegla-platnosc` |
| `billing.overdue.resolve` | `command` | `BillingOverdueResolveRequest` | `BillingOverdueResolveResponse` | `/api/v1/billing/overdue/resolve` | `/v1/billing/overdue/resolve` |
| `billing.payment.method.update` | `command` | `BillingPaymentMethodUpdateRequest` | `BillingPaymentMethodUpdateResponse` | `/api/v1/billing/payment-method` | `/v1/billing/payment-method` |
| `billing.payments.read` | `query` | `BillingPaymentsReadRequest` | `BillingPaymentsReadResponse` | `/api/v1/billing/platnosci` | `/v1/billing/platnosci` |
| `billing.pilot-to-subscription.read` | `query` | `BillingPilotToSubscriptionReadRequest` | `BillingPilotToSubscriptionReadResponse` | `/api/v1/billing/pilot-do-abonamentu` | `/v1/billing/pilot-do-abonamentu` |
| `billing.pilot.read` | `query` | `BillingPilotReadRequest` | `BillingPilotReadResponse` | `/api/v1/billing/pilot` | `/v1/billing/pilot` |
| `billing.plan.select` | `command` | `BillingPlanSelectRequest` | `BillingPlanSelectResponse` | `/api/v1/billing/plan/select` | `/v1/billing/plan/select` |
| `billing.plans.read` | `query` | `BillingPlansReadRequest` | `BillingPlansReadResponse` | `/api/v1/billing/plany` | `/v1/billing/plany` |
| `billing.read` | `query` | `BillingReadRequest` | `BillingReadResponse` | `/api/v1/billing/read` | `/v1/billing/read` |
| `billing.subscription.activate` | `command` | `BillingSubscriptionActivateRequest` | `BillingSubscriptionActivateResponse` | `/api/v1/billing/subscription/activate` | `/v1/billing/subscription/activate` |
| `billing.subscription.read` | `query` | `BillingSubscriptionReadRequest` | `BillingSubscriptionReadResponse` | `/api/v1/billing/subskrypcja` | `/v1/billing/subskrypcja` |
| `billing.usage-limits.read` | `query` | `BillingUsageLimitsReadRequest` | `BillingUsageLimitsReadResponse` | `/api/v1/billing/uzycie-i-limity` | `/v1/billing/uzycie-i-limity` |
| `billing.write` | `command` | `BillingWriteRequest` | `BillingWriteResponse` | `/api/v1/billing/write` | `/v1/billing/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
