# Macierz migracji `papadata-main` → `papadata-platform`

| Domena dawcy | Granica docelowa | Status w paczce | Następny wymagany krok |
|---|---|---|---|
| auth / registration | BFF + `apps/api/.../identity` + security | częściowo natywna | recovery, verification, OAuth i account linking jako natywne use-case’y |
| tenancy / workspaces / RBAC | identity + database + capability guards | fundament zachowany | przenieść lifecycle workspace, role i zaproszenia z testami RLS |
| onboarding / GUS | natywny moduł onboarding | donor do portu | wydzielić provider GUS, DTO, cache i audyt |
| integrations | `@papadata/integrations` + durable worker | 7 implementacji + canonical v2 | conformance i live acceptance per provider |
| webhooks | API external-provider boundary | hardening zachowany | provider-specific negative tests i live acceptance |
| dashboard / command center | natywny analytics read model | częściowa semantyka | przenieść agregacje i materialized read models zamiast generycznych rekordów |
| analytics / metrics | database + worker + analytics services | canonical foundation | przenieść algorytmy obliczeń i golden tests |
| ads | canonical ad streams + analytics | adaptery obecne | przenieść metryki, attribution i reconciliation |
| billing / Stripe | natywny billing package/module | polityki czyste przeniesione | port webhooków Stripe, invoices, subscriptions, tax evidence i ledger |
| KSeF / VAT | billing compliance | jawna polityka readiness | integracja live i evidence bez fałszywych deklaracji |
| AI / assistant library | `@papadata/ai-runtime` + governed actions | fundament mocniejszy | przenieść observations, recommendations, registry i execution ledger |
| alerts / notifications | platform jobs + notifications | compatibility-only | natywne repozytoria, kanały, retry i preference policy |
| reports / exports | reports + storage + platform queue | ograniczony runtime | renderery, dataset snapshot, retention i signed download acceptance |
| data quality | canonical streams + reconciliation | część semantyki przeniesiona | issue lifecycle, scorecards, evidence i remediation commands |
| targets / annotations | product domain | compatibility-only | typowane encje i native services |
| settings / search | osobne read/write services | compatibility-only | przenieść kontrakty, indeksowanie i capability matrix |
| DSAR / privacy | privacy + platform queue | ograniczony runtime | pełny erasure graph, provider/backup evidence i legal acceptance |
| audit | audit chain | natywny hardening | testy bazy, chain tamper i retention acceptance |
| sync orchestrator / tasks | durable worker | nowy fundament zachowany | przenieść harmonogramy i semantykę jobów bez omijania state machine |
| Prisma schema | `@papadata/database` SQL migrations | donor jako mapa domenowa | projektować nowe migracje, nie kopiować historii 1:1 |
| CI/IaC | obecne workflow + Terraform | supply-chain zachowany | dodać DB/Redis integration gates, monitoring i environment acceptance |

## Priorytet

### P0-A — integracje

Conformance dla 7/7: credentials, scopes, pagination, backfill, incremental, checkpoint, retry, rate limit, cancel, reconciliation, tenant isolation i webhook verification.

### P0-B — domeny produktu

1. auth/onboarding/workspaces/team;
2. dashboard/analytics/metrics;
3. billing/Stripe/VAT/KSeF;
4. reports/exports;
5. AI/assistant;
6. alerts/notifications/data quality;
7. settings/search/targets/annotations;
8. DSAR/retention.

### P0-C — dane

Każda nowa tabela tenantowa: RLS, właściwy owner/runtime role, test izolacji, upgrade test i jawny model retencji.

### P1 — CI/IaC

Realny PostgreSQL/Redis w CI, migration upgrade, route coverage, provider readiness, Terraform tests, alerting, uptime, budgets i staging smoke.
