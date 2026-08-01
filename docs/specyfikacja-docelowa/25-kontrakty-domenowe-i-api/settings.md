---
version: 1.0
author: Artur Wiśniewski
creator: Artur Wiśniewski
owner: Artur Wiśniewski
id: DOC-API-SETTINGS
status: approved-target
updated_at: 2026-07-30T10:55:00+02:00
---

# Settings — kontrakt domenowy API

## Cel

Dokument definiuje wyłącznie kanoniczne operacje wynikające z przypadków użycia. Nie zawiera automatycznego zestawu `details/export/mutate` dla każdego ekranu.

## Operacje

| operationId | kind | method | BFF route | service route | request | response |
|---|---|---|---|---|---|---|
| `settings.account-security.read` | `query` | `GET` | `/api/v1/settings/bezpieczenstwo-konta` | `/v1/settings/bezpieczenstwo-konta` | `SettingsAccountSecurityReadRequest` | `SettingsAccountSecurityReadResponse` |
| `settings.audit.read` | `query` | `GET` | `/api/v1/settings/audyt` | `/v1/settings/audyt` | `SettingsAuditReadRequest` | `SettingsAuditReadResponse` |
| `settings.memberships.read` | `query` | `GET` | `/api/v1/settings/czlonkostwa` | `/v1/settings/czlonkostwa` | `SettingsMembershipsReadRequest` | `SettingsMembershipsReadResponse` |
| `settings.organization.read` | `query` | `GET` | `/api/v1/settings/organizacja` | `/v1/settings/organizacja` | `SettingsOrganizationReadRequest` | `SettingsOrganizationReadResponse` |
| `settings.privacy.read` | `query` | `GET` | `/api/v1/settings/prywatnosc` | `/v1/settings/prywatnosc` | `SettingsPrivacyReadRequest` | `SettingsPrivacyReadResponse` |
| `settings.read` | `query` | `GET` | `/api/v1/settings/read` | `/v1/settings/read` | `SettingsReadRequest` | `SettingsReadResponse` |
| `settings.roles.read` | `query` | `GET` | `/api/v1/settings/role-i-uprawnienia` | `/v1/settings/role-i-uprawnienia` | `SettingsRolesReadRequest` | `SettingsRolesReadResponse` |
| `settings.sessions.read` | `query` | `GET` | `/api/v1/settings/sesje` | `/v1/settings/sesje` | `SettingsSessionsReadRequest` | `SettingsSessionsReadResponse` |
| `settings.support-access.read` | `query` | `GET` | `/api/v1/settings/dostep-wsparcia` | `/v1/settings/dostep-wsparcia` | `SettingsSupportAccessReadRequest` | `SettingsSupportAccessReadResponse` |
| `settings.workspace.profile.update` | `command` | `PATCH` | `/api/v1/settings/workspace/profile/update` | `/v1/settings/workspace/profile/update` | `SettingsWorkspaceProfileUpdateRequest` | `SettingsWorkspaceProfileUpdateResponse` |
| `settings.workspace.read` | `query` | `GET` | `/api/v1/settings/workspace` | `/v1/settings/workspace` | `SettingsWorkspaceReadRequest` | `SettingsWorkspaceReadResponse` |
| `settings.write` | `command` | `POST` | `/api/v1/settings/write` | `/v1/settings/write` | `SettingsWriteRequest` | `SettingsWriteResponse` |

## Reguły

- `query` nie zmienia stanu i może zwrócić status danych oraz ograniczenia.
- `command` wymaga idempotency key, audytu, kontroli capability i jawnego outcome.
- Alias ekranowy nie jest nowym endpointem backendowym.
- Dokumenty wariantów i polityk nie otrzymują własnego route ani operationId.

## Kanoniczne DTO i operacje 1.0 po audycie

| Operation | Kind | Request | Response | BFF | Service |
|---|---|---|---|---|---|
| `settings.account-security.read` | `query` | `SettingsAccountSecurityReadRequest` | `SettingsAccountSecurityReadResponse` | `/api/v1/settings/bezpieczenstwo-konta` | `/v1/settings/bezpieczenstwo-konta` |
| `settings.audit.read` | `query` | `SettingsAuditReadRequest` | `SettingsAuditReadResponse` | `/api/v1/settings/audyt` | `/v1/settings/audyt` |
| `settings.memberships.read` | `query` | `SettingsMembershipsReadRequest` | `SettingsMembershipsReadResponse` | `/api/v1/settings/czlonkostwa` | `/v1/settings/czlonkostwa` |
| `settings.organization.read` | `query` | `SettingsOrganizationReadRequest` | `SettingsOrganizationReadResponse` | `/api/v1/settings/organizacja` | `/v1/settings/organizacja` |
| `settings.privacy.read` | `query` | `SettingsPrivacyReadRequest` | `SettingsPrivacyReadResponse` | `/api/v1/settings/prywatnosc` | `/v1/settings/prywatnosc` |
| `settings.read` | `query` | `SettingsReadRequest` | `SettingsReadResponse` | `/api/v1/settings/read` | `/v1/settings/read` |
| `settings.roles.read` | `query` | `SettingsRolesReadRequest` | `SettingsRolesReadResponse` | `/api/v1/settings/role-i-uprawnienia` | `/v1/settings/role-i-uprawnienia` |
| `settings.sessions.read` | `query` | `SettingsSessionsReadRequest` | `SettingsSessionsReadResponse` | `/api/v1/settings/sesje` | `/v1/settings/sesje` |
| `settings.support-access.read` | `query` | `SettingsSupportAccessReadRequest` | `SettingsSupportAccessReadResponse` | `/api/v1/settings/dostep-wsparcia` | `/v1/settings/dostep-wsparcia` |
| `settings.workspace.profile.update` | `command` | `SettingsWorkspaceProfileUpdateRequest` | `SettingsWorkspaceProfileUpdateResponse` | `/api/v1/settings/workspace/profile/update/{resourceId}` | `/v1/settings/workspace/profile/update/{resourceId}` |
| `settings.workspace.read` | `query` | `SettingsWorkspaceReadRequest` | `SettingsWorkspaceReadResponse` | `/api/v1/settings/workspace` | `/v1/settings/workspace` |
| `settings.write` | `command` | `SettingsWriteRequest` | `SettingsWriteResponse` | `/api/v1/settings/write` | `/v1/settings/write` |

Pełne definicje pól, nullability, przykłady i reguły kompatybilności znajdują się w `contracts/api-schemas.ts`, `contracts/api-schemas.json` i `contracts/openapi-1.0.json`.
