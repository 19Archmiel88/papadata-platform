# Backend Implementation Plan

## Status

Ten dokument porządkuje backend po korekcie zakresu. Backend jest dzielony na
9 krótkich zadań. Każde zadanie kończy się kontrolami i nie przechodzi do
następnego bez zielonych bram.

## 1. Audyt, ADR-y i kontrakty

Zakres:

- audyt repozytorium, TypeScript, Docker, testow i zaleznosci;
- ADR dla NestJS;
- ADR dla BFF/API;
- ADR dla SQL oraz `pg` bez ORM;
- ADR dla skrótów haseł;
- ADR dla kolejki;
- ADR dla storage;
- `packages/contracts`;
- standard `/v1`;
- `correlationId`;
- `contractVersion`;
- `readiness`;
- `limitations`;
- `operationId`;
- `Idempotency-Key`;
- `expectedVersion` i `ETag`;
- paginacja kursorowa.

Wymaganie: wszystkie kolejne endpointy musza uzywac jednego standardu
odpowiedzi, idempotencji i wersjonowania.

## 2. Docker Compose, BFF, PostgreSQL, Redis i OTel

Lokalny runtime obejmuje:

- `web`;
- `bff`;
- `api`;
- `worker`;
- `scheduler`;
- `migrate`;
- `seed`;
- `postgres`;
- `redis`;
- `queue-emulator`;
- `storage-emulator`;
- `otel-collector`;
- środowiska testowe providerów.

Wymagania:

- PostgreSQL w tej samej głównej wersji co planowany Cloud SQL;
- osobna rola migracyjna i runtime;
- emulator kolejki;
- MinIO albo emulator GCS;
- scheduler;
- OpenTelemetry Collector;
- te same migracje i kontrakty w Local, CI i GCP.

## 3. Auth

Endpointy auth uzywaja kontraktow z zadania 1.

Zakres:

- cookies;
- CSRF;
- refresh rotation;
- OTP;
- MFA;
- recovery;
- sessions;
- lockout;
- rate limit;
- audit.

## 4. Tenant, workspace, role, policy i onboarding

Zakres:

- session;
- auth strength;
- tenant status;
- workspace status;
- membership status;
- capabilities;
- data scope;
- entitlements;
- resource state;
- policy version;
- role `Tenant Owner`;
- role `Workspace Admin`;
- role `Analyst`;
- role `Marketing Operator`;
- role `Viewer`;
- role `Billing Admin`;
- role `Auditor/Security`;
- role `Internal Support/Operations`;
- JIT dla `Internal Support/Operations`.

## 5. Queue, worker, outbox, storage i scheduler

Zakres:

- transactional outbox;
- idempotentni konsumenci;
- retry budget;
- backoff i jitter;
- checkpointy;
- DLQ;
- replay;
- storage plikow;
- eksporty;
- cykliczne joby;
- cleanup;
- obserwowalnosc jobow.

## 6. Integracje i canonical pipeline

Katalog MVP:

- WooCommerce;
- Shopify;
- BaseLinker;
- Allegro;
- Google Ads;
- Meta Ads;
- Google Analytics 4.

Providerzy lokalni moga byc sandbox, ale musza realizowac:

- connect;
- sync;
- backfill;
- checkpoint;
- retry;
- reauthorize;
- disconnect;
- recovery.

TikTok Ads nie jest providerem MVP i nie moze byc pokazywany jako dostepny.

Pipeline:

```text
source
-> normalized
-> overlap detection
-> source authority
-> canonical
-> lineage
-> quality
-> readiness
-> metric snapshot
```

Tabele:

- `source_batches`;
- `source_records`;
- `normalized_records`;
- `canonical_facts`;
- `canonical_lineage`;
- `sync_checkpoints`;
- `data_issues`;
- `quality_assessments`;
- `readiness_assessments`;
- `metric_definitions`;
- `reprocess_jobs`;
- `reconciliation_reports`.

## 7. Metric Engine i Dashboard API

Zadanie startuje od katalogu `2026-05-analytics-v1` z
`packages/contracts` oraz `docs/architecture/canonical-metric-catalog.md`.
Nie wolno budować dashboardu na osobnym słowniku KPI bez mapowania do
kanonicznego katalogu.

Zakres KPI:

- sprzedaż;
- zamówienia;
- AOV;
- zwroty;
- stan magazynowy;
- ryzyko braku zapasu;
- marża;
- contribution;
- koszt reklam;
- ROAS;
- CPC;
- CPM;
- CTR;
- rankingi produktów.

Marża i wartość magazynu nie mogą być liczone bez kosztów oraz source
authority.

Przed implementacją endpointów dashboardu trzeba usunąć lub jawnie powiązać
rozbieżności: `net_revenue`, `cac`, `aov`, `conversion_rate`, `roas`/`mer`,
`orders_per_customer`/`purchase_frequency` oraz
`discounts`/`discount_value_total`.

## 8. Billing, AI, notifications i reports

Billing sandbox nie jest tylko odczytem. Zakres lifecycle:

- create checkout;
- activate subscription;
- change plan;
- cancel;
- resume;
- payment attempt;
- payment failed;
- payment recovered;
- invoice generated;
- usage limit reached;
- entitlement updated.

Dodatkowo:

- trwale powiadomienia;
- raporty i pliki;
- Papa Asystent;
- evidence;
- refusal;
- approvals;
- simulation;
- revalidation.

## 9. Testy, security, recovery i hardening

Zakres:

- `test:contract`;
- `test:authz`;
- `test:migrations`;
- `test:security`;
- `test:resilience`;
- `test:recovery`;
- `test:ai-eval`;
- `test:performance`;
- dependency scan;
- secret scan;
- SAST;
- container scan;
- SBOM;
- testy nieuprawnionego dostępu do obiektów;
- failure injection;
- backup/restore;
- compatibility migracji;
- runbooki;
- rollback evidence.
