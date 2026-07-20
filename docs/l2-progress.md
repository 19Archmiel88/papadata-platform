# L2 Progress

## Zakres

Prompt 1 obejmuje audyt repozytorium oraz minimalny szkielet backendu w
monorepo. Nie obejmuje auth, implementacji bazy danych, runtime workerów ani
Docker Compose.

## Audyt wejściowy

- Repozytorium działa jako prywatne monorepo pnpm i Turborepo.
- `pnpm-workspace.yaml` obejmuje `apps/*` oraz `packages/*`.
- Istniejący frontend znajduje się w `apps/web` i zachowuje konfigurację Vite,
  React, Storybook, Vitest oraz Playwright.
- Przed tym zakresem istniały lokalne zmiany w `apps/web/package.json` oraz
  `pnpm-lock.yaml`; nie były cofane.
- W repozytorium nie ma obecnie Dockerfile ani Docker Compose.
- Główna konfiguracja TypeScript frontendu jest lokalna dla `apps/web`.

## Wykonany stan L2

- Dodano `apps/api` jako minimalny pakiet TypeScript dla przyszłego API.
- Dodano `apps/worker` jako minimalny pakiet TypeScript dla przyszłych jobów.
- Dodano `packages/contracts` z wersją `domain-contracts.v1`, typami scope
  tenant/workspace i podstawowym kontraktem operacji.
- Dodano `packages/database` jako jawny placeholder granicy persistence bez
  sterownika, schematu i migracji.
- Dodano `packages/testing` z typowanymi fixture scope dla przyszłych testów
  izolacji.
- Dodano `tsconfig.base.json` dla nowych pakietów backendu.

## Korekta podziału backendu

Poprawiony podział backendu ma 9 zadań i jest zapisany w
`docs/backend-implementation-plan.md`. Zadanie 1 obejmuje audyt, ADR-y oraz
wspólny kontrakt API, ponieważ wszystkie późniejsze endpointy muszą używać
jednego standardu odpowiedzi, idempotencji i wersjonowania.

## Granice po Prompt 1

- Backend nie uruchamiał serwera HTTP.
- Worker nie uruchamia kolejki ani procesorów jobów.
- Pakiet database nie łączył się z bazą i nie zawierał migracji.
- Nie dodano zewnętrznych zależności produkcyjnych.
- Nie zmieniono struktury ani kodu `apps/web`.

## Prompt 2: lokalna infrastruktura

Dodano lokalny runtime Docker Compose dla `postgres`, `redis`, `api`,
`worker` oraz jednorazowej usługi `migrate`.

Zakres wykonany:

- PostgreSQL 18 jako lokalny odpowiednik głównej wersji planowanej dla Cloud
  SQL.
- Redis 7 jako lokalny odpowiednik Memorystore.
- Role PostgreSQL: `papadata_migrator`, `papadata_app` oraz `papadata_test`.
- Schemat `app` należy do `papadata_migrator`; runtime `papadata_app` nie ma
  prawa tworzenia obiektów w schemacie.
- Migracje SQL bez ORM w `packages/database/migrations`.
- Tabele infrastrukturalne: `schema_migrations`, `audit_events`,
  `outbox_events` oraz `processed_events`.
- Komendy root: `start:local`, `migrate`, `migrate:status` oraz
  `test:migrations`.
- Minimalne kontrole zdrowia kontenerów `api` i `worker`.

Granice:

- Nie dodano auth.
- Nie dodano danych biznesowych ani tabel domenowych.
- Nie dodano Docker Compose dla BFF, harmonogramu, emulatora kolejki, storage ani
  OTel; pozostają w dalszym zakresie zgodnie z planem backendu.
- Nie dodano nowych zależności produkcyjnych.

## Prompt 3: kompletny backend Auth

Dodano lokalną warstwę backend auth opartą o wspólny kontrakt `/v1`, HttpOnly
cookies, CSRF, Redis-like session state oraz lokalny email outbox.

Zakres wykonany:

- Endpointy:
  `/v1/auth/register`,
  `/v1/auth/login`,
  `/v1/auth/logout`,
  `/v1/auth/refresh`,
  `/v1/auth/me`,
  `/v1/auth/password/reset/request`,
  `/v1/auth/password/reset/confirm`,
  `/v1/auth/password/change`,
  `/v1/auth/email/verify`,
  `/v1/auth/mfa/challenge`,
  `/v1/auth/mfa/verify`,
  `/v1/auth/mfa/recovery`,
  `/v1/auth/sessions`,
  `DELETE /v1/auth/sessions/:sessionId`.
- Hashowanie haseł z użyciem lokalnej implementacji `scrypt`, bez dodawania
  produkcyjnego SDK auth.
- HttpOnly cookies dla sesji, CSRF dla mutacji oraz refresh token rotation.
- OTP e-mail, MFA challenge, recovery codes, lockout i rate limiting.
- Redis-like adapter stanu auth dla lokalnego runtime i testów.
- Lokalny email outbox oraz audit bez haseł, tokenów, OTP i wartości cookies.
- Testy rejestracji, logowania, błędnego hasła, lockout, refresh, logout,
  resetu i zmiany hasła, OTP, MFA, recovery, usuwania sesji, CSRF oraz rate
  limiting.

Granice:

- Runtime persistence dla auth jest lokalny i in-memory/Redis-like; trwałe
  repozytoria `pg` i produkcyjny session store pozostają poza zakresem.
- Nie dodano zewnętrznego IdP ani produkcyjnej konfiguracji dostarczania e-mail.
- Nie rozpoczęto tenant/workspace poza minimalnym kontekstem sesji auth.

## Prompt 4: tenant, workspace, role i onboarding

Dodano lokalną warstwę backend dla kontekstu tenant/workspace, zaproszeń i
procesu onboarding. Endpointy używają `/v1`, istniejącej sesji auth, CSRF oraz
wspólnego kontraktu odpowiedzi.

Zakres wykonany:

- Encje domenowe: `users`, `tenants`, `workspaces`, `memberships`,
  `invitations`, `onboarding_states`, `company_profiles` oraz
  `business_profiles`.
- Role: Tenant Owner, Workspace Admin, Analyst, Marketing Operator, Viewer,
  Billing Admin, Auditor/Security oraz Internal Support/Operations.
- Decyzje dostępu obejmują: session, auth strength, tenant status, workspace
  status, membership, capabilities, data scope, entitlements oraz resource
  state.
- Endpointy zaproszeń, rejestracji organizacji, bootstrap, workspace, wyboru
  kontekstu i procesu onboarding z Promptu 4.
- Migracja SQL `000002_tenant_workspace_access.sql` bez ORM.
- Testy negatywne: cross-tenant, cross-workspace, nieautoryzowany dostęp po
  identyfikatorze, wygasłe zaproszenie, ponowne użycie zaproszenia, błędny
  e-mail, brak capability, zablokowany workspace oraz wybór obcego workspace.

Granice:

- Runtime persistence dla tych encji jest lokalny i in-memory; repozytoria SQL
  pozostają poza zakresem tego promptu.
- Internal Support/Operations ma capabilities tylko przy aktywnym JIT.
- Nie dodano auth, kolejek, integracji ani danych biznesowych.

## Prompt 5: CMP, dokumenty prawne, audyt i powiadomienia

Dodano lokalną warstwę backend dla consent management, dokumentów prawnych,
akceptacji, audytu compliance oraz trwałych powiadomień in-app.

Zakres wykonany:

- Encje domenowe: `cookie_consents`, `legal_documents`, `legal_acceptances`,
  `audit_events` oraz `notifications`.
- Kategorie cookies: `necessary`, `preferences`, `analytics` i `marketing`;
  `necessary` jest zawsze wymuszone jako aktywne.
- Endpointy `/v1/privacy/consent`, `/v1/legal/documents`,
  `/v1/legal/acceptances` oraz `/v1/notifications` z Promptu 5.
- Trwałe typy powiadomień dla: nieudanej synchronizacji, przestarzałych danych,
  blokady readiness, wymaganego approval, gotowego raportu, limitu planu,
  ryzyka braku magazynu oraz wysokiego poziomu zwrotów.
- Migracja SQL `000003_compliance_notifications.sql` bez ORM.
- Testy HTTP dla CMP, dokumentów prawnych, idempotentnej akceptacji,
  trwałości powiadomień, `read`, `read-all` oraz odmowy dostępu po obcym
  identyfikatorze powiadomienia.

Granice:

- Runtime persistence dla Promptu 5 jest lokalny i in-memory; repozytoria SQL
  pozostają poza zakresem tego promptu.
- Dokumenty prawne mają lokalne wersje referencyjne do testów; formalny legal
  review i treści produkcyjne pozostają osobną decyzją.
- Nie dodano integracji, billingu, jobów ani kanałów e-mail/push dla
  powiadomień.

## Prompt 6: Integracje i canonical data

Dodano lokalną warstwę integracji sandbox oraz model danych source,
normalized i canonical dla MVP providerów z Promptu 6.

Zakres wykonany:

- Adaptery sandbox dla WooCommerce, Allegro, Google Ads i Meta Ads.
- Lifecycle adaptera: `connect`, `account selection`, `initial sync`,
  `incremental sync`, `backfill`, `checkpoint`, `retry`, `rate limit`,
  `partial success`, `reauthorize`, `disconnect` i `recovery`.
- Migracja SQL `000004_integration_canonical_data.sql` bez ORM dla:
  `integration_connections`, `sync_jobs`, `sync_checkpoints`,
  `source_batches`, `source_records`, `normalized_records`,
  `canonical_products`, `canonical_product_variants`,
  `external_product_mappings`, `canonical_orders`, `canonical_order_lines`,
  `canonical_payments`, `canonical_refunds`,
  `canonical_customer_returns`, `canonical_inventory_snapshots`,
  `canonical_ad_spend`, `canonical_attributed_conversions`,
  `canonical_lineage`, `data_issues`, `quality_assessments` oraz
  `readiness_assessments`.
- Reguły źródeł: WooCommerce i Allegro zapisują fakty sprzedaży, Google Ads i
  Meta Ads zapisują koszt oraz przypisane konwersje w oddzielnych tabelach.
- Źródło magazynu jest wybierane per `tenantId` i `workspaceId`; canonical
  inventory powstaje tylko z wybranego źródła.
- Mapowanie produktów obsługuje `manual`, `sku`, `ean`, `catalog`,
  `exact_match`; `fuzzy_manual_review` tworzy data issue i wymaga ręcznej
  akceptacji.
- Testy adapterów, checkpointów, retry, deduplikacji, zwrotów i mapowania
  produktów.

Granice:

- Runtime persistence dla Promptu 6 jest lokalny i in-memory; trwałe
  repozytoria `pg` pozostają poza zakresem tego promptu.
- Nie dodano jeszcze endpointów integracji, metric engine, dashboard API,
  providerów Shopify, BaseLinker, GA4 ani pipeline jobów produkcyjnych.

## Prompt 7: Metric Engine i Dashboard API

Dodano lokalny backendowy Metric Engine oraz Dashboard API oparte o
`MetricSnapshot`, bez obliczeń KPI po stronie UI.

Zakres wykonany:

- Encje i migracja SQL `000005_metric_engine_dashboard_api.sql` dla:
  `metric_definitions`, `metric_snapshots`, `reprocess_jobs` oraz
  `reconciliation_reports`.
- Definicje 27 metryk z Promptu 7 wraz z `metricCode`,
  `definitionVersion`, definicją biznesową, formułą, wymaganymi faktami,
  politykami dat, waluty, podatków, zwrotów, braków danych, readiness oraz
  test vectors.
- Obliczenia dla sprzedaży, zwrotów, AOV, stock, reklam, ROAS oraz kosztu na
  zamówienie.
- Marża, kontrybucja i wartość magazynu są blokowane jako `unavailable` bez
  potwierdzonych kosztów produktu.
- `available_stock` oraz metryki inventory wymagają wybranego źródła inventory
  authority.
- Metryki produktowe wymagają zaakceptowanego mapowania produktu; brak mappingu
  zwraca `UNAVAILABLE` i `MISSING_PRODUCT_MAPPING`.
- Endpointy:
  `/v1/dashboard/readiness`,
  `/v1/dashboard/command-center`,
  `/v1/dashboard/campaigns`,
  `/v1/dashboard/orders`,
  `/v1/dashboard/products`,
  `/v1/dashboard/customers`,
  `/v1/dashboard/traffic`.
- Testy każdej formuły oraz stanów `ready`, `partial`, `stale`, `invalid`,
  `no_data` i `unavailable`.

Granice:

- Runtime persistence dla Promptu 7 jest lokalny i in-memory; trwałe
  repozytoria `pg` pozostają poza zakresem tego promptu.
- Endpointy `customers` i `traffic` są dostępne jako projekcje Dashboard API,
  ale bez metryk klienckich i GA4, bo te fakty kanoniczne nie są jeszcze
  zaimplementowane w backendzie.
- Nie dodano Metric Engine jobs, cache, eksportów, AI ani dashboardu UI.

## Prompt 8: Worker, raporty, AI, billing i końcowe E2E

Dodano lokalny backend dla pozostałych operacji MVP bez ruszania UI.

Zakres wykonany:

- Worker runtime obsługuje joby: `email_outbox`, `sync`, `backfill`,
  `readiness`, `metric_calculation`, `reprocessing`, `notifications`,
  `reports`, `exports`, `ai_briefings`, `cleanup`, `retry` i `dlq`.
- Worker ma retry budget, backoff z jitterem, DLQ, replay oraz cleanup w
  lokalnym runtime testowym.
- Endpointy raportów:
  `/v1/reports/export`,
  `/v1/reports/:id/status`,
  `/v1/reports/:id/download`.
- Eksport raportu tworzy rzeczywisty plik w lokalnym katalogu tymczasowym i
  zapisuje metadane: nazwę, typ treści, rozmiar oraz SHA-256.
- Papa Asystent obsługuje threads, messages, streaming, context, evidence,
  confidence, limitations, refusal, recommendations, approvals, simulation,
  revalidation i audit.
- Brak danych w Papa Asystencie zwraca refusal code `INSUFFICIENT_DATA`.
- Billing sandbox obsługuje lifecycle: aktywację subskrypcji, zmianę planu,
  anulowanie, wznowienie, płatność pending/failed/recovered, fakturę, usage,
  limit oraz zmianę entitlement.
- Migracja SQL `000006_worker_reports_assistant_billing.sql` bez ORM dla:
  `worker_jobs`, `worker_dlq_events`, `email_outbox_messages`,
  `report_exports`, `report_files`, `assistant_threads`,
  `assistant_messages`, `assistant_evidence`, `assistant_approvals`,
  `assistant_audit_events`, `billing_subscriptions`, `billing_events`,
  `billing_invoices` oraz `billing_usage_records`.
- Testy końcowe obejmują contract, integration, authorization, E2E,
  resilience, recovery, security oraz AI eval.

Granice:

- Runtime persistence dla Promptu 8 jest lokalny i in-memory; trwałe
  repozytoria `pg` pozostają poza zakresem promptu.
- Pliki raportów są zapisywane lokalnie w sandboxie; produkcyjny storage
  provider i lifecycle udostępniania raportów pozostają osobnym zadaniem.
- Papa Asystent nie wykonuje autonomicznych działań finansowych,
  operacyjnych, prawnych ani dostępowych.
- Nie rozpoczęto UI.
