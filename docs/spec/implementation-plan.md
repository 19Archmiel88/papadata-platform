# Plan implementacji

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

- [ ] AI gateway.
- [ ] Evidence pack.
- [ ] Structured output.
- [ ] Fakty, wnioski i rekomendacje.
- [ ] Odmowa przy braku danych.
- [ ] Odmowa przy braku uprawnień.
- [ ] AI Actions.
- [ ] Approval.
- [ ] Audit.
- [ ] Evals.

## Fala 6 — billing i operacje

- [ ] Plany.
- [ ] Entitlements.
- [ ] Usage.
- [ ] Raporty.
- [ ] Eksporty.
- [ ] Support JIT.
- [ ] Monitoring.
- [ ] Alerty.
- [ ] Runbooki.

## Fala 7 — hardening i go-live

- [ ] Tenant isolation tests.
- [ ] Security scans.
- [ ] Restore exercise.
- [ ] Provider failure tests.
- [ ] AI evals.
- [ ] Rollback.
- [ ] Go/no-go.
