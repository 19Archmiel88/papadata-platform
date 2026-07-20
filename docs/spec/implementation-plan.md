# Plan implementacji

Status: plan wykonawczy produktu. Checklista oznacza lokalne pokrycie
kontraktowe/testowe w repo, nie gotowość produkcyjną.

## Fala 0 — analiza i kontrakty

- [x] Zamrozić decyzje P0 w `decisions.md`.
- [x] Wprowadzić wersjonowane kontrakty TypeScript/Zod.
- [x] Wprowadzić kanoniczne `tenantId` i `workspaceId`.
- [x] Usunąć domenowe użycie `organizationId` z vertical slice auth.
- [x] Walidować fixtures auth schematami kontraktów.
- [x] Utrwalić inwarianty danych i KPI w testach.
- [x] Opisać vertical slice tenant/workspace auth.

## Fala 1 — fundament

- [x] Tenant.
- [x] Workspace.
- [x] Membership.
- [x] Role.
- [x] Capabilities.
- [x] Data scope.
- [x] Auth.
- [x] MFA.
- [x] Zaproszenia.
- [x] Sesje.
- [x] Audit log.
- [x] App shell.
- [x] Light/dark mode.

## Fala 2 — integracje

- [x] Wspólny adapter integracji.
- [x] Secrets.
- [x] Kolejki.
- [x] Checkpointy.
- [x] Retry.
- [x] DLQ.
- [x] Backfill.
- [x] Reconnect.
- [x] Disconnect.
- [x] Monitoring.
- [x] Runbooki.

## Fala 3 — dane

- [x] Source data.
- [x] Normalized data.
- [x] Canonical data.
- [x] Lineage.
- [x] Deduplikacja.
- [x] Konflikty danych.
- [x] Quality.
- [x] Readiness.
- [x] Reprocessing.

## Fala 4 — analityka

- [x] KPI.
- [x] Snapshoty.
- [x] Command Center.
- [x] Moduły analityczne.
- [x] Wizualizacje.
- [x] Insighty.
- [x] Storybook pełnych ekranów.

## Fala 5 — AI

- [x] AI gateway.
- [x] Evidence pack.
- [x] Structured output.
- [x] Fakty, wnioski i rekomendacje.
- [x] Odmowa przy braku danych.
- [x] Odmowa przy braku uprawnień.
- [x] AI Actions.
- [x] Approval.
- [x] Audit.
- [x] Evals.

## Fala 6 — billing i operacje

- [x] Plany.
- [x] Entitlements.
- [x] Usage.
- [x] Raporty.
- [x] Eksporty.
- [x] Support JIT.
- [ ] Monitoring produkcyjny.
- [x] Alerty jako trwałe powiadomienia lokalne.
- [ ] Runbooki operacyjne dla produkcji.

## Fala 7 — hardening i go-live

- [x] Tenant isolation tests.
- [x] Security baseline i dependency audit.
- [ ] Restore exercise.
- [x] Provider failure tests w sandboxach.
- [x] AI evals lokalne.
- [ ] Rollback.
- [ ] Go/no-go.
