---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-ONBOARDING
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Onboarding — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `onboarding.profile.update` | `command` | `PUT` | `/api/v1/onboarding/profile` | `/v1/onboarding/profile` | `OnboardingProfileUpdateRequest` | `OnboardingProfileUpdateResponse` |
| `onboarding.progress.read` | `query` | `GET` | `/api/v1/onboarding/progress` | `/v1/onboarding/progress` | `OnboardingProgressReadRequest` | `OnboardingProgressReadResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `onboarding.profile.update` | `command` | `OnboardingProfileUpdateRequest` | `OnboardingProfileUpdateResponse` | `/api/v1/onboarding/profile/{resourceId}` | `/v1/onboarding/profile/{resourceId}` |
| `onboarding.progress.read` | `query` | `OnboardingProgressReadRequest` | `OnboardingProgressReadResponse` | `/api/v1/onboarding/progress` | `/v1/onboarding/progress` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
