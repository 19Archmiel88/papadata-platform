# Backend — operacje, bezpieczeństwo i gotowość produkcyjna


## Macierz możliwości backendu

> Snapshot opisowy możliwości backendu. Machine-readable source of truth dla zakresu release: `config/backend-release-scope.json`; dowód release wiąże aktualny commit SHA i immutable image digests.

**Zakres:** backend-production-runtime<br>
**Operacje runtime:** 292<br>
**Kontrakt docelowy:** 223/223 dokładnych metod, ścieżek i operationId<br>
**Dodatkowe operacje hardeningowe:** 69<br>
**Integracje runtime:** 7/7<br>
**Pełna zgodność semantyczna i odbiór live:** jeszcze nie zadeklarowane

| OperationId | Metoda | Ścieżka | Autoryzacja | Implementacja | Status |
|---|---|---|---|---|---|
| access.bootstrap | POST | `/v1/access/bootstrap` | mfa+capability | contract-compatibility-runtime | compatibility |
| access.resolve | POST | `/v1/access/resolve` | mfa+capability | migrated-access-policy | compatibility |
| access.tenant.select | POST | `/v1/access/tenant/select` | mfa+capability | contract-compatibility-runtime | compatibility |
| access.tenants.list | GET | `/v1/access/tenants/list` | capability | contract-compatibility-runtime | compatibility |
| access.workspace.select | POST | `/v1/access/workspace/select` | mfa+capability | contract-compatibility-runtime | compatibility |
| access.workspaces.list | GET | `/v1/access/workspaces/list` | capability | contract-compatibility-runtime | compatibility |
| actions.read | GET | `/v1/actions/read` | capability | contract-compatibility-runtime | compatibility |
| actions.write | POST | `/v1/actions/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| ai.actions.approve | POST | `/v1/ai/actions/{key}/approve` | step_up+capability | native-hardened-runtime | enabled |
| ai.actions.create | POST | `/v1/ai/actions` | capability | native-hardened-runtime | enabled |
| ai.history.list | GET | `/v1/ai/history` | capability | native-hardened-runtime | enabled |
| ai.runs.create | POST | `/v1/ai/runs` | capability | native-hardened-runtime | enabled |
| analytics.metrics.compare | POST | `/v1/metrics/compare` | capability | native-hardened-runtime | enabled |
| analytics.metrics.list | GET | `/v1/metrics` | capability | native-hardened-runtime | enabled |
| annotations.create | POST | `/v1/annotations` | capability | native-hardened-runtime | enabled |
| annotations.delete | DELETE | `/v1/annotations/{key}` | capability | native-hardened-runtime | enabled |
| annotations.list | GET | `/v1/annotations` | capability | native-hardened-runtime | enabled |
| audit.chain.verify | POST | `/v1/audit/verify` | step_up+capability | native-hardened-runtime | enabled |
| auth.access.blocked.read | GET | `/v1/auth/access/blocked` | public | contract-compatibility-runtime | compatibility |
| auth.access.resolve | POST | `/v1/auth/access/resolve` | mfa+capability | migrated-access-policy | compatibility |
| auth.account.link | POST | `/v1/auth/account/link` | mfa+capability | explicit-limited-handler | compatibility |
| auth.consents.accept | POST | `/v1/auth/consents` | mfa+capability | contract-compatibility-runtime | compatibility |
| auth.email.resend | POST | `/v1/auth/email/resend` | public | explicit-limited-handler | compatibility |
| auth.email.verify | POST | `/v1/auth/email/verify` | public | contract-compatibility-runtime | compatibility |
| auth.login | POST | `/v1/auth/login` | public | native-identity-service | compatibility |
| auth.logout | POST | `/v1/auth/logout` | mfa+capability | contract-compatibility-runtime | compatibility |
| auth.mfa.confirm | POST | `/v1/auth/mfa/confirm` | step_up+capability | contract-compatibility-runtime | compatibility |
| auth.mfa.enroll | POST | `/v1/auth/mfa/enroll` | step_up+capability | contract-compatibility-runtime | compatibility |
| auth.mfa.verify | POST | `/v1/auth/mfa/verify` | step_up+capability | contract-compatibility-runtime | compatibility |
| auth.oauth.callback | POST | `/v1/auth/oauth/callback` | public | explicit-limited-handler | compatibility |
| auth.oauth.start | POST | `/v1/auth/oauth/start` | public | explicit-limited-handler | compatibility |
| auth.password.recovery.request | POST | `/v1/auth/password/recovery/request` | public | explicit-limited-handler | compatibility |
| auth.password.recovery.token.validate | POST | `/v1/auth/password/recovery/token/validate` | public | explicit-limited-handler | compatibility |
| auth.password.reset | POST | `/v1/auth/password/reset` | public | contract-compatibility-runtime | compatibility |
| auth.reauthenticate | POST | `/v1/auth/reauthenticate` | mfa+capability | contract-compatibility-runtime | compatibility |
| auth.register.email | POST | `/v1/auth/register/email` | public | native-identity-service | compatibility |
| auth.registration.finalize | POST | `/v1/auth/registration/finalize` | public | contract-compatibility-runtime | compatibility |
| auth.session.read | GET | `/v1/auth/session` | capability | contract-compatibility-runtime | compatibility |
| auth.status.read | GET | `/v1/auth/status` | public | contract-compatibility-runtime | compatibility |
| billing.adjustments.read | GET | `/v1/billing/korekty` | capability | migrated-billing-policy | compatibility |
| billing.change-cancel.read | GET | `/v1/billing/zmiana-i-anulowanie` | capability | migrated-billing-policy | compatibility |
| billing.entitlements.read | GET | `/v1/billing/entitlements` | capability | migrated-billing-policy | compatibility |
| billing.invoices.read | GET | `/v1/billing/faktury` | capability | migrated-billing-policy | compatibility |
| billing.overdue-payment.read | GET | `/v1/billing/zalegla-platnosc` | capability | migrated-billing-policy | compatibility |
| billing.overdue.resolve | POST | `/v1/billing/overdue/resolve` | step_up+capability | migrated-billing-policy | compatibility |
| billing.payment.method.update | PUT | `/v1/billing/payment-method` | step_up+capability | migrated-billing-policy | compatibility |
| billing.payments.read | GET | `/v1/billing/platnosci` | capability | migrated-billing-policy | compatibility |
| billing.pilot-to-subscription.read | GET | `/v1/billing/pilot-do-abonamentu` | capability | migrated-billing-policy | compatibility |
| billing.pilot.read | GET | `/v1/billing/pilot` | capability | migrated-billing-policy | compatibility |
| billing.plan.select | POST | `/v1/billing/plan/select` | step_up+capability | migrated-billing-policy | compatibility |
| billing.plans.read | GET | `/v1/billing/plany` | capability | migrated-billing-policy | compatibility |
| billing.read | GET | `/v1/billing/read` | capability | migrated-billing-policy | compatibility |
| billing.subscription.activate | POST | `/v1/billing/subscription/activate` | step_up+capability | migrated-billing-policy | compatibility |
| billing.subscription.change-plan | POST | `/v1/billing/subscription/change-plan` | step_up+capability | native-hardened-runtime | enabled |
| billing.subscription.current.read | GET | `/v1/billing/subscription` | capability | native-hardened-runtime | enabled |
| billing.subscription.read | GET | `/v1/billing/subskrypcja` | capability | migrated-billing-policy | compatibility |
| billing.usage-limits.read | GET | `/v1/billing/uzycie-i-limity` | capability | migrated-billing-policy | compatibility |
| billing.write | POST | `/v1/billing/write` | step_up+capability | migrated-billing-policy | compatibility |
| campaigns.attribution-sales.read | GET | `/v1/campaigns/atrybucja-i-sprzedaz` | capability | contract-compatibility-runtime | compatibility |
| campaigns.budget.change.propose | POST | `/v1/campaigns/budget/proposals` | mfa+capability | contract-compatibility-runtime | compatibility |
| campaigns.budget.read | GET | `/v1/campaigns/budzet` | capability | contract-compatibility-runtime | compatibility |
| campaigns.budget.recommendation.read | GET | `/v1/campaigns/budget/recommendation` | capability | contract-compatibility-runtime | compatibility |
| campaigns.detail.read | GET | `/v1/campaigns/szczegoly-kampanii` | capability | contract-compatibility-runtime | compatibility |
| campaigns.diagnostics.read | GET | `/v1/campaigns/diagnostyka` | capability | contract-compatibility-runtime | compatibility |
| campaigns.list | GET | `/v1/campaigns` | capability | native-hardened-runtime | enabled |
| campaigns.list.read | GET | `/v1/campaigns/lista-kampanii` | capability | contract-compatibility-runtime | compatibility |
| campaigns.overview.read | GET | `/v1/campaigns/przeglad` | capability | contract-compatibility-runtime | compatibility |
| campaigns.read | GET | `/v1/campaigns/read` | capability | contract-compatibility-runtime | compatibility |
| campaigns.recommendations.read | GET | `/v1/campaigns/rekomendacje-kontekst-domenowy` | capability | contract-compatibility-runtime | compatibility |
| campaigns.write | POST | `/v1/campaigns/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| command-center.ai-recommendations.read | GET | `/v1/command-center/rekomendacje-ai-skrot` | capability | canonical-command-center-runtime | compatibility |
| command-center.attention.queue.read | GET | `/v1/command-center/kolejka-uwagi` | capability | canonical-command-center-runtime | compatibility |
| command-center.customers-summary.read | GET | `/v1/command-center/klienci` | capability | canonical-command-center-runtime | compatibility |
| command-center.drivers.read | GET | `/v1/command-center/drivery-wyniku` | capability | canonical-command-center-runtime | compatibility |
| command-center.funnel.read | GET | `/v1/command-center/lejek` | capability | canonical-command-center-runtime | compatibility |
| command-center.kpi.read | GET | `/v1/command-center/kpi` | capability | canonical-command-center-runtime | compatibility |
| command-center.overview.read | GET | `/v1/command-center/widok-glowny` | capability | canonical-command-center-runtime | compatibility |
| command-center.plan-performance.read | GET | `/v1/command-center/plan-vs-wynik` | capability | canonical-command-center-runtime | compatibility |
| command-center.products-summary.read | GET | `/v1/command-center/produkty` | capability | canonical-command-center-runtime | compatibility |
| command-center.read | GET | `/v1/command-center/read` | capability | canonical-command-center-runtime | compatibility |
| command-center.sales-signals.read | GET | `/v1/command-center/sygnaly-sprzedazowe` | capability | canonical-command-center-runtime | compatibility |
| command-center.sales-sources.read | GET | `/v1/command-center/zrodla-sprzedazy` | capability | canonical-command-center-runtime | compatibility |
| command-center.traffic-summary.read | GET | `/v1/command-center/ruch` | capability | canonical-command-center-runtime | compatibility |
| command-center.waterfall.read | GET | `/v1/command-center/waterfall` | capability | canonical-command-center-runtime | compatibility |
| command-center.write | POST | `/v1/command-center/write` | mfa+capability | canonical-command-center-runtime | compatibility |
| company.draft.update | PUT | `/v1/company/draft` | mfa+capability | contract-compatibility-runtime | compatibility |
| company.lookup | GET | `/v1/company/lookup` | public | contract-compatibility-runtime | compatibility |
| customers.cohorts.read | GET | `/v1/customers/kohorty` | capability | contract-compatibility-runtime | compatibility |
| customers.identity-conflicts.read | GET | `/v1/customers/konflikty-tozsamosci` | capability | contract-compatibility-runtime | compatibility |
| customers.impact.read | GET | `/v1/customers/analiza-wplywu` | capability | contract-compatibility-runtime | compatibility |
| customers.list | GET | `/v1/customers` | capability | native-hardened-runtime | enabled |
| customers.overview.read | GET | `/v1/customers/przeglad` | capability | contract-compatibility-runtime | compatibility |
| customers.privacy.read | GET | `/v1/customers/prywatnosc` | capability | contract-compatibility-runtime | compatibility |
| customers.pseudonymized-detail.read | GET | `/v1/customers/szczegoly-pseudonimizowane` | capability | contract-compatibility-runtime | compatibility |
| customers.read | GET | `/v1/customers/read` | capability | contract-compatibility-runtime | compatibility |
| customers.segment.analyze | GET | `/v1/customers/segment/analyze` | capability | contract-compatibility-runtime | compatibility |
| customers.segments.read | GET | `/v1/customers/segmenty` | capability | contract-compatibility-runtime | compatibility |
| customers.write | POST | `/v1/customers/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| dashboard.command-center.read | GET | `/v1/dashboard/command-center` | capability | native-hardened-runtime | enabled |
| data-quality.center.read | GET | `/v1/data-quality/centrum-jakosci` | capability | migrated-data-quality-policy | compatibility |
| data-quality.conflicts.read | GET | `/v1/data-quality/konflikty` | capability | contract-compatibility-runtime | compatibility |
| data-quality.dataset.read | GET | `/v1/data-quality/zbior-danych` | capability | contract-compatibility-runtime | compatibility |
| data-quality.issues.create | POST | `/v1/data-quality/issues` | capability | native-hardened-runtime | enabled |
| data-quality.issues.list | GET | `/v1/data-quality/issues` | capability | native-hardened-runtime | enabled |
| data-quality.lineage.read | GET | `/v1/data-quality/pochodzenie-danych` | capability | contract-compatibility-runtime | compatibility |
| data-quality.manual-review.read | GET | `/v1/data-quality/przeglad-reczny` | capability | contract-compatibility-runtime | compatibility |
| data-quality.manual-review.submit | POST | `/v1/data-quality/manual-review` | mfa+capability | contract-compatibility-runtime | compatibility |
| data-quality.read | GET | `/v1/data-quality/read` | capability | contract-compatibility-runtime | compatibility |
| data-quality.readiness.read | GET | `/v1/data-quality/readiness` | capability | migrated-data-quality-policy | compatibility |
| data-quality.reconciliation.confirm | POST | `/v1/data-quality/reconciliation/confirm` | mfa+capability | contract-compatibility-runtime | compatibility |
| data-quality.reconciliation.read | GET | `/v1/data-quality/rekoncyliacja` | capability | migrated-data-quality-policy | compatibility |
| data-quality.reprocess.start | POST | `/v1/data-quality/reprocess` | mfa+capability | contract-compatibility-runtime | compatibility |
| data-quality.reprocessing.read | GET | `/v1/data-quality/ponowne-przetwarzanie` | capability | contract-compatibility-runtime | compatibility |
| data-quality.source-overlap.read | GET | `/v1/data-quality/nakladanie-zrodel` | capability | contract-compatibility-runtime | compatibility |
| data-quality.source-priority.read | GET | `/v1/data-quality/nadrzednosc-zrodla` | capability | migrated-data-quality-policy | compatibility |
| data-quality.write | POST | `/v1/data-quality/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| decisions.action-brief.read | GET | `/v1/decisions/brief-dzialania` | capability | contract-compatibility-runtime | compatibility |
| decisions.action-detail.read | GET | `/v1/decisions/szczegoly-dzialania` | capability | contract-compatibility-runtime | compatibility |
| decisions.action-library.read | GET | `/v1/decisions/biblioteka-dzialan` | capability | contract-compatibility-runtime | compatibility |
| decisions.action.brief.create | POST | `/v1/decisions/action-brief` | mfa+capability | contract-compatibility-runtime | compatibility |
| decisions.center.read | GET | `/v1/decisions/centrum-decyzji` | capability | contract-compatibility-runtime | compatibility |
| decisions.decision.record | POST | `/v1/decisions/registry` | mfa+capability | contract-compatibility-runtime | compatibility |
| decisions.measurement.read | GET | `/v1/decisions/pomiar` | capability | contract-compatibility-runtime | compatibility |
| decisions.observation.create | POST | `/v1/decisions/observations` | mfa+capability | contract-compatibility-runtime | compatibility |
| decisions.observations.read | GET | `/v1/decisions/obserwacje` | capability | contract-compatibility-runtime | compatibility |
| decisions.recommendation.read | GET | `/v1/decisions/recommendation` | capability | contract-compatibility-runtime | compatibility |
| decisions.registry.read | GET | `/v1/decisions/rejestr-decyzji` | capability | contract-compatibility-runtime | compatibility |
| decisions.rekomendacje.read | GET | `/v1/decisions/rekomendacje` | capability | contract-compatibility-runtime | compatibility |
| decisions.relations.read | GET | `/v1/decisions/powiazania-z-modulami-i-sprawami` | capability | contract-compatibility-runtime | compatibility |
| help.home.read | GET | `/v1/help/strona-glowna-pomocy` | capability | contract-compatibility-runtime | compatibility |
| help.procedure-detail.read | GET | `/v1/help/szczegoly-procedury` | capability | contract-compatibility-runtime | compatibility |
| help.procedures.read | GET | `/v1/help/procedury` | capability | contract-compatibility-runtime | compatibility |
| help.read | GET | `/v1/help/read` | capability | contract-compatibility-runtime | compatibility |
| help.results.read | GET | `/v1/help/lista-wynikow` | capability | contract-compatibility-runtime | compatibility |
| help.support-request.read | GET | `/v1/help/zgloszenie-wsparcia` | capability | contract-compatibility-runtime | compatibility |
| help.write | POST | `/v1/help/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| identity.login | POST | `/v1/identity/login` | public | native-hardened-runtime | enabled |
| identity.oauth.callback | POST | `/v1/identity/oauth/callback` | public | native-hardened-runtime | enabled |
| identity.oauth.link.start | POST | `/v1/identity/oauth/link/start` | mfa+capability | native-hardened-runtime | enabled |
| identity.oauth.reauth.start | POST | `/v1/identity/oauth/reauth/start` | mfa+capability | native-hardened-runtime | enabled |
| identity.oauth.start | POST | `/v1/identity/oauth/start` | public | native-hardened-runtime | enabled |
| identity.register | POST | `/v1/identity/register` | public | native-hardened-runtime | enabled |
| infrastructure.health.live | GET | `/health` | public | native-hardened-runtime | enabled |
| infrastructure.health.live.healthz | GET | `/healthz` | public | native-hardened-runtime | enabled |
| infrastructure.health.ready | GET | `/readyz` | public | native-hardened-runtime | enabled |
| infrastructure.health.startup | GET | `/startupz` | public | native-hardened-runtime | enabled |
| infrastructure.metrics.read | GET | `/metrics` | infrastructure | native-hardened-runtime | enabled |
| integrations.backfill.start | POST | `/v1/integrations/connections/{id}/backfill` | mfa+capability | native-hardened-runtime | enabled |
| integrations.catalog.read | GET | `/v1/integrations/katalog-integracji` | capability | native-integration-service | compatibility |
| integrations.completeness.read | GET | `/v1/integrations/completeness` | capability | native-hardened-runtime | enabled |
| integrations.connection-wizard.read | GET | `/v1/integrations/kreator-polaczenia` | capability | contract-compatibility-runtime | compatibility |
| integrations.connection.create | POST | `/v1/integrations/connections` | step_up+capability | native-hardened-runtime | enabled |
| integrations.connections.disconnect | DELETE | `/v1/integrations/connections/{id}` | step_up+capability | native-hardened-runtime | enabled |
| integrations.connections.list | GET | `/v1/integrations/connections` | capability | native-hardened-runtime | enabled |
| integrations.detail.read | GET | `/v1/integrations/szczegoly-integracji` | capability | contract-compatibility-runtime | compatibility |
| integrations.disconnect.read | GET | `/v1/integrations/odlaczenie` | capability | contract-compatibility-runtime | compatibility |
| integrations.jobs.cancel | POST | `/v1/integrations/jobs/{id}/cancel` | mfa+capability | native-hardened-runtime | enabled |
| integrations.jobs.get | GET | `/v1/integrations/jobs/{id}` | capability | native-hardened-runtime | enabled |
| integrations.jobs.list | GET | `/v1/integrations/jobs` | capability | native-hardened-runtime | enabled |
| integrations.jobs.retry | POST | `/v1/integrations/jobs/{id}/retry` | mfa+capability | native-hardened-runtime | enabled |
| integrations.logs.read | GET | `/v1/integrations/logs` | capability | native-hardened-runtime | enabled |
| integrations.oauth.callback | POST | `/v1/integrations/oauth/callback` | mfa+capability | contract-compatibility-runtime | compatibility |
| integrations.provider-outage.read | GET | `/v1/integrations/awaria-providera` | capability | contract-compatibility-runtime | compatibility |
| integrations.provider.test | POST | `/v1/integrations/{provider}/test` | step_up+capability | native-hardened-runtime | enabled |
| integrations.providers.list | GET | `/v1/integrations/providers` | capability | native-hardened-runtime | enabled |
| integrations.read | GET | `/v1/integrations/read` | capability | native-integration-service | compatibility |
| integrations.reconnect.read | GET | `/v1/integrations/ponowne-polaczenie` | capability | contract-compatibility-runtime | compatibility |
| integrations.reconnect.start | POST | `/v1/integrations/reconnect/start` | mfa+capability | contract-compatibility-runtime | compatibility |
| integrations.runtime-catalog.read | GET | `/v1/integrations/catalog` | capability | native-hardened-runtime | enabled |
| integrations.runtime.read | GET | `/v1/integrations` | capability | native-hardened-runtime | enabled |
| integrations.status.read | GET | `/v1/integrations/status` | capability | native-hardened-runtime | enabled |
| integrations.sync-history.read | GET | `/v1/integrations/historia-synchronizacji` | capability | native-integration-service | compatibility |
| integrations.sync-run.read | GET | `/v1/integrations/przebieg-synchronizacji` | capability | native-integration-service | compatibility |
| integrations.sync-scope.read | GET | `/v1/integrations/zakres-synchronizacji` | capability | contract-compatibility-runtime | compatibility |
| integrations.sync.connection.start | POST | `/v1/integrations/connections/{id}/sync` | mfa+capability | native-hardened-runtime | enabled |
| integrations.sync.resume | POST | `/v1/integrations/sync/resume` | mfa+capability | contract-compatibility-runtime | compatibility |
| integrations.sync.start | POST | `/v1/integrations/sync/start` | mfa+capability | contract-compatibility-runtime | compatibility |
| integrations.webhooks.receive | POST | `/v1/integrations/webhooks/{provider}/{connectionId}` | external_provider | native-hardened-runtime | enabled |
| integrations.write | POST | `/v1/integrations/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| invitation.accept | POST | `/v1/auth/invitations/accept` | public | explicit-limited-handler | compatibility |
| invitation.read | GET | `/v1/invitation/read` | capability | contract-compatibility-runtime | compatibility |
| invitation.reject | POST | `/v1/invitation/reject` | step_up+capability | contract-compatibility-runtime | compatibility |
| invitation.request | POST | `/v1/auth/invitations/request` | step_up+capability | contract-compatibility-runtime | compatibility |
| invitation.validate | POST | `/v1/auth/invitations/validate` | public | explicit-limited-handler | compatibility |
| mobile.device.manage | POST | `/v1/mobile/device/manage` | mfa+capability | contract-compatibility-runtime | compatibility |
| mobile.invite | POST | `/v1/mobile/invite` | mfa+capability | contract-compatibility-runtime | compatibility |
| mobile.use | GET | `/v1/mobile/use` | capability | contract-compatibility-runtime | compatibility |
| notifications.list | GET | `/v1/notifications` | capability | native-hardened-runtime | enabled |
| notifications.mark-all-read | POST | `/v1/notifications/read-all` | capability | native-hardened-runtime | enabled |
| notifications.mark-read | POST | `/v1/notifications/{id}/read` | capability | native-hardened-runtime | enabled |
| notifications.mark-unread | POST | `/v1/notifications/{id}/unread` | capability | native-hardened-runtime | enabled |
| notifications.snooze | POST | `/v1/notifications/{id}/snooze` | capability | native-hardened-runtime | enabled |
| notifications.unsnooze | POST | `/v1/notifications/{id}/unsnooze` | capability | native-hardened-runtime | enabled |
| onboarding.profile.update | PUT | `/v1/onboarding/profile` | mfa+capability | contract-compatibility-runtime | compatibility |
| onboarding.progress.read | GET | `/v1/onboarding/progress` | capability | contract-compatibility-runtime | compatibility |
| onboarding.read | GET | `/v1/onboarding` | capability | native-hardened-runtime | enabled |
| onboarding.update | PUT | `/v1/onboarding` | capability | native-hardened-runtime | enabled |
| orders.detail.read | GET | `/v1/orders/szczegoly` | capability | contract-compatibility-runtime | compatibility |
| orders.eksport.read | GET | `/v1/orders/eksport` | capability | contract-compatibility-runtime | compatibility |
| orders.list | GET | `/v1/orders` | capability | native-hardened-runtime | enabled |
| orders.list.read | GET | `/v1/orders/lista` | capability | contract-compatibility-runtime | compatibility |
| orders.os-zdarzen.read | GET | `/v1/orders/os-zdarzen` | capability | contract-compatibility-runtime | compatibility |
| orders.overview.read | GET | `/v1/orders/przeglad` | capability | contract-compatibility-runtime | compatibility |
| orders.porownanie-zrodel.read | GET | `/v1/orders/porownanie-zrodel` | capability | contract-compatibility-runtime | compatibility |
| orders.read | GET | `/v1/orders/read` | capability | contract-compatibility-runtime | compatibility |
| orders.rekoncyliacja-skrot.read | GET | `/v1/orders/rekoncyliacja-skrot` | capability | contract-compatibility-runtime | compatibility |
| orders.write | POST | `/v1/orders/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| papa.action-approval.read | GET | `/v1/papa/ai-action-approval` | capability | contract-compatibility-runtime | compatibility |
| papa.actions.read | GET | `/v1/papa/ai-actions` | capability | contract-compatibility-runtime | compatibility |
| papa.ai.action.approve | POST | `/v1/papa/ai-actions/approve` | step_up+capability | contract-compatibility-runtime | compatibility |
| papa.ai.action.execute | POST | `/v1/papa/ai-actions/execute` | step_up+capability | contract-compatibility-runtime | blocked-until-live-approval |
| papa.ai.action.reject | POST | `/v1/papa/ai-actions/reject` | mfa+capability | contract-compatibility-runtime | compatibility |
| papa.ai.action.rollback | POST | `/v1/papa/ai-actions/rollback` | step_up+capability | contract-compatibility-runtime | blocked-until-live-approval |
| papa.ai.action.validate | POST | `/v1/papa/ai-actions/validate` | mfa+capability | contract-compatibility-runtime | compatibility |
| papa.answer.generate | POST | `/v1/papa/answer` | capability | contract-compatibility-runtime | compatibility |
| papa.answer.read | GET | `/v1/papa/odpowiedz-papa` | capability | contract-compatibility-runtime | compatibility |
| papa.assistant-shell.read | GET | `/v1/papa/assistantshell` | capability | contract-compatibility-runtime | compatibility |
| papa.context-basket.read | GET | `/v1/papa/context-basket` | capability | contract-compatibility-runtime | compatibility |
| papa.context-panel.read | GET | `/v1/papa/panel-kontekstowy-papa` | capability | contract-compatibility-runtime | compatibility |
| papa.context.capture | POST | `/v1/papa/context/capture` | capability | contract-compatibility-runtime | compatibility |
| papa.evidence.read | GET | `/v1/papa/dowody` | capability | contract-compatibility-runtime | compatibility |
| papa.governance.read | GET | `/v1/papa/ustawienia-ai-i-governance` | capability | contract-compatibility-runtime | compatibility |
| papa.history-memory.read | GET | `/v1/papa/historia-i-pamiec-papa` | capability | contract-compatibility-runtime | compatibility |
| papa.lab.read | GET | `/v1/papa/laboratorium-ai` | capability | contract-compatibility-runtime | compatibility |
| papa.observation.save | POST | `/v1/papa/observations` | capability | contract-compatibility-runtime | compatibility |
| papa.observations.read | GET | `/v1/papa/obserwacje` | capability | contract-compatibility-runtime | compatibility |
| papa.proposals.read | GET | `/v1/papa/propozycje-ai` | capability | contract-compatibility-runtime | compatibility |
| papa.read | GET | `/v1/papa/read` | capability | contract-compatibility-runtime | compatibility |
| papa.report-definition.duplicate | POST | `/v1/papa/report-definitions/duplicate` | capability | contract-compatibility-runtime | compatibility |
| papa.report-definition.read | GET | `/v1/papa/report-definitions` | capability | contract-compatibility-runtime | compatibility |
| papa.report-definition.upsert | POST | `/v1/papa/report-definitions` | capability | contract-compatibility-runtime | compatibility |
| papa.report-export.create | POST | `/v1/papa/report-definitions/exports` | capability | contract-compatibility-runtime | compatibility |
| papa.report-schedule.upsert | POST | `/v1/papa/report-definitions/schedule` | capability | contract-compatibility-runtime | compatibility |
| papa.write | POST | `/v1/papa/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| privacy.identity-verifications.create | POST | `/v1/privacy/identity-verifications` | step_up+capability | native-hardened-runtime | limited |
| privacy.requests.approve | POST | `/v1/privacy/requests/{id}/approve` | step_up+capability | native-hardened-runtime | limited |
| privacy.requests.create | POST | `/v1/privacy/requests` | step_up+capability | native-hardened-runtime | limited |
| products.catalog.read | GET | `/v1/products/katalog` | capability | contract-compatibility-runtime | compatibility |
| products.detail.read | GET | `/v1/products/szczegoly` | capability | contract-compatibility-runtime | compatibility |
| products.gaps.queue.read | GET | `/v1/products/kolejka-brakow` | capability | contract-compatibility-runtime | compatibility |
| products.impact.read | GET | `/v1/products/analiza-wplywu` | capability | contract-compatibility-runtime | compatibility |
| products.list | GET | `/v1/products` | capability | native-hardened-runtime | enabled |
| products.mapping.read | GET | `/v1/products/mapowanie` | capability | contract-compatibility-runtime | compatibility |
| products.mapping.update | PUT | `/v1/products/mapping` | mfa+capability | contract-compatibility-runtime | compatibility |
| products.offers.read | GET | `/v1/products/oferty` | capability | contract-compatibility-runtime | compatibility |
| products.overview.read | GET | `/v1/products/przeglad` | capability | contract-compatibility-runtime | compatibility |
| products.performance.read | GET | `/v1/products/wydajnosc` | capability | contract-compatibility-runtime | compatibility |
| products.read | GET | `/v1/products/read` | capability | contract-compatibility-runtime | compatibility |
| products.write | POST | `/v1/products/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| reports.create | POST | `/v1/reports` | mfa+capability | native-hardened-runtime | enabled |
| reports.download | GET | `/v1/reports/{id}/download` | step_up+capability | native-hardened-runtime | enabled |
| reports.get | GET | `/v1/reports/{id}` | capability | native-hardened-runtime | enabled |
| search.query | GET | `/v1/search` | capability | native-hardened-runtime | enabled |
| security.invitations.token.issue | POST | `/v1/security/invitations/token` | step_up+capability | native-hardened-runtime | enabled |
| security.mfa.confirm | POST | `/v1/security/mfa/confirm` | capability | native-hardened-runtime | enabled |
| security.mfa.enroll | POST | `/v1/security/mfa/enroll` | capability | native-hardened-runtime | enabled |
| security.step-up.issue | POST | `/v1/security/step-up` | mfa+capability | native-hardened-runtime | enabled |
| settings.account-security.read | GET | `/v1/settings/bezpieczenstwo-konta` | capability | contract-compatibility-runtime | compatibility |
| settings.audit.read | GET | `/v1/settings/audyt` | capability | contract-compatibility-runtime | compatibility |
| settings.current.read | GET | `/v1/settings` | capability | native-hardened-runtime | enabled |
| settings.memberships.read | GET | `/v1/settings/czlonkostwa` | capability | contract-compatibility-runtime | compatibility |
| settings.organization.read | GET | `/v1/settings/organizacja` | capability | contract-compatibility-runtime | compatibility |
| settings.privacy.read | GET | `/v1/settings/prywatnosc` | capability | contract-compatibility-runtime | compatibility |
| settings.read | GET | `/v1/settings/read` | capability | contract-compatibility-runtime | compatibility |
| settings.roles.read | GET | `/v1/settings/role-i-uprawnienia` | capability | contract-compatibility-runtime | compatibility |
| settings.sessions.read | GET | `/v1/settings/sesje` | capability | contract-compatibility-runtime | compatibility |
| settings.support-access.read | GET | `/v1/settings/dostep-wsparcia` | capability | contract-compatibility-runtime | compatibility |
| settings.update | PUT | `/v1/settings` | capability | native-hardened-runtime | enabled |
| settings.workspace.profile.update | PATCH | `/v1/settings/workspace/profile/update` | mfa+capability | contract-compatibility-runtime | compatibility |
| settings.workspace.read | GET | `/v1/settings/workspace` | capability | contract-compatibility-runtime | compatibility |
| settings.write | POST | `/v1/settings/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| support.threads.create | POST | `/v1/support/threads` | capability | native-hardened-runtime | enabled |
| support.threads.list | GET | `/v1/support/threads` | capability | native-hardened-runtime | enabled |
| targets.create | POST | `/v1/targets` | capability | native-hardened-runtime | enabled |
| targets.list | GET | `/v1/targets` | capability | native-hardened-runtime | enabled |
| targets.update | PATCH | `/v1/targets/{key}` | capability | native-hardened-runtime | enabled |
| traffic.channels.read | GET | `/v1/traffic/kanaly` | capability | contract-compatibility-runtime | compatibility |
| traffic.drop.diagnose | GET | `/v1/traffic/drop/diagnose` | capability | contract-compatibility-runtime | compatibility |
| traffic.event-quality.read | GET | `/v1/traffic/jakosc-zdarzen` | capability | contract-compatibility-runtime | compatibility |
| traffic.funnel-definitions.read | GET | `/v1/traffic/definicje-lejka` | capability | contract-compatibility-runtime | compatibility |
| traffic.funnel-step.read | GET | `/v1/traffic/lejek-szczegoly-kroku` | capability | contract-compatibility-runtime | compatibility |
| traffic.funnel.read | GET | `/v1/traffic/lejek-widok` | capability | contract-compatibility-runtime | compatibility |
| traffic.ga4-orders.read | GET | `/v1/traffic/ga4-vs-zamowienia` | capability | contract-compatibility-runtime | compatibility |
| traffic.landing-pages.read | GET | `/v1/traffic/strony-wejscia` | capability | contract-compatibility-runtime | compatibility |
| traffic.list | GET | `/v1/traffic` | capability | native-hardened-runtime | enabled |
| traffic.overview.read | GET | `/v1/traffic/przeglad-ruchu` | capability | contract-compatibility-runtime | compatibility |
| traffic.read | GET | `/v1/traffic/read` | capability | contract-compatibility-runtime | compatibility |
| traffic.write | POST | `/v1/traffic/write` | mfa+capability | contract-compatibility-runtime | compatibility |
| workspace.onboarding.update | POST | `/v1/workspace/onboarding/update` | mfa+capability | contract-compatibility-runtime | compatibility |
| workspace.resolve | GET | `/v1/workspace/resolve` | capability | contract-compatibility-runtime | compatibility |
| workspaces.list | GET | `/v1/workspaces` | capability | native-hardened-runtime | enabled |
| workspaces.update | PATCH | `/v1/workspaces/{key}` | mfa+capability | native-hardened-runtime | enabled |

## Konwergencja ze starego backendu

### Zasada

`papadata-main` nie jest mergowany jako całość. Obecny projekt pozostaje jedyną bazą rozwojową. Zachowania ze starego backendu są przenoszone do aktualnych granic odpowiedzialności i podlegają aktualnym zasadom bezpieczeństwa, tenancy, audytu oraz testów.

| Stary obszar | Docelowa warstwa obecnego projektu |
|---|---|
| connector/adapters | `packages/integrations` + durable worker ingestion |
| Prisma domain services | `ProductDomainRepository` + RLS PostgreSQL |
| auth/session | API identity + BFF Redis session boundary |
| dashboard/analytics | natywne kontrolery domenowe + canonical ingestion/metric snapshots |
| szeroki kontrakt HTTP | generowany contract compatibility runtime w aktualnym Nest API |
| jobs/scheduler | BullMQ worker + PostgreSQL reservation/lease |
| webhook dedup | provider verifier + `webhook_replay_receipts` |
| docs inventory | generator manifestu, macierzy możliwości i integracji |

### Co przeniesiono

- adaptery i mapowania domenowe WooCommerce, Google Ads i Meta Ads;
- zachowania biznesowe dla kampanii, zamówień, produktów, klientów, ruchu, jakości danych, ustawień, billing i support;
- szerokość kontraktu API: 212/212 par metoda, ścieżka i `operationId`;
- wymagania testowe i operacyjne dla integracji, synchronizacji, backfill i recovery.

Allegro zostało dodane jako nowy adapter, ponieważ żadna z porównywanych paczek nie zawierała kompletnej implementacji.

### Jak działa warstwa zgodności kontraktu

- kontrolery są generowane z `contracts/openapi-1.0.json`;
- istniejące natywne kontrolery mają pierwszeństwo;
- brakujące operacje trafiają do tenant-aware `ContractRuntimeService`;
- odczyty korzystają z trwałych rekordów domenowych, a mutacje z RLS, idempotency i audytu;
- pola sekretne są odrzucane przed persistence;
- skutki zewnętrznych akcji AI pozostają zablokowane fail-closed.

Dokładne route parity nie jest równoznaczne z pełnym odbiorem semantycznym. Operacje kompatybilności muszą być stopniowo zastępowane natywnymi usługami domenowymi i testami kontraktowymi.

### Co nie zostało skopiowane

- monolityczny moduł API;
- bezpośrednie zależności domen od Prisma;
- in-memory persistence w produkcyjnym runtime;
- pozorne wpisy providerów bez adaptera;
- zewnętrzne skutki AI bez approval i rewalidacji;
- dokumentacja deklarująca funkcję bez dowodu w kodzie i verifierze.

## Zależności i supply chain

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35`
- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L24`

Kontrole:

- `pnpm audit --prod --audit-level high` blokuje znane podatności high/critical;
- Trivy skanuje repozytorium pod kątem sekretów i obrazy pod kątem OS/library CVE;
- Trivy generuje CycloneDX SBOM;
- `pnpm licenses list --prod --json` jest oceniany przez `tools/check-license-report.mjs` i `config/backend-license-policy.json`;
- GitHub Actions są przypięte do pełnych SHA;
- trzy Dockerfile używają minimalnego multi-stage runtime, non-root użytkownika i digest-pinned Node base image;
- Terraform akceptuje wyłącznie obrazy aplikacji wskazane przez digest.

Podpisywanie obrazu i attestation wymagają skonfigurowanego rejestru/OIDC. Brak podpisu w konkretnym wydaniu pozostaje blokadą produkcyjną, nawet gdy workflow repozytorium jest poprawny.

### Polityka licencji

`BlueOak-1.0.0` i `OFL-1.1` są jawnie dopuszczone w `config/backend-license-policy.json`. Pierwsza obejmuje zależności narzędziowe używane przez workspace, a druga paczki self-hostowanych fontów. Polityka pozostaje fail-closed: `unknownPolicy` ma wartość `fail`, dlatego każda kolejna nierozpoznana licencja blokuje bramkę do czasu jawnej decyzji.

### GitHub Code Scanning i SARIF

Skan Trivy pozostaje bramką niezależnie od dostępności GitHub Code Scanning: wykrycie podatności `HIGH` lub `CRITICAL` nadal kończy job błędem. SARIF jest zawsze zachowywany jako artefakt workflow. Upload do Code Scanning oraz analiza CodeQL są wykonywane dla repozytorium publicznego albo po włączeniu GitHub Code Security i ustawieniu zmiennej repozytorium `PAPADATA_CODE_SCANNING_ENABLED=true`. Brak tej usługi w repozytorium prywatnym nie może być maskowany przez `continue-on-error`.

## Runtime integracji 7/7

> Plik generowany automatycznie z manifestu i kodu. Nie edytować ręcznie.

| Provider | Adapter | Dostarczanie zmian | Pipeline |
|---|---|---|---|
| woocommerce | implementation present; live acceptance pending | podpisany webhook + replay protection | durable ingestion + canonical v2 |
| shopify | implementation present; live acceptance pending | podpisany webhook + replay protection | durable ingestion + canonical v2 |
| baselinker | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |
| allegro | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |
| google_ads | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |
| meta_ads | implementation present; live acceptance pending | podpisany webhook + replay protection | durable ingestion + canonical v2 |
| ga4 | implementation present; live acceptance pending | incremental polling/checkpoint | durable ingestion + canonical v2 |

Webhooki są aktywne tylko dla providerów posiadających zweryfikowany model podpisanego callbacku. Pozostałe integracje korzystają z checkpointowanego pollingu i są pełnoprawnymi adapterami runtime. Pełne uznanie produkcyjne wymaga testów live z rzeczywistymi kontami providerów.

## Migracje, rollback i disaster recovery

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37`
- `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L13-L34`
- `README.md:L26-L32`

### Jeden runner

Local i production-parity używają `packages/database/scripts/migrate.sh` oraz ledgeru `app.schema_migrations`. `infra/postgres/apply-migrations.sh` jest wyłącznie wrapperem kompatybilności i nie posiada własnego ledgeru.

### Polityka zmian

Migracje są forward-only i muszą stosować expand/contract:

1. expand bez usuwania kontraktu N-1;
2. deploy kodu czytającego obie wersje;
3. backfill z mierzalnym postępem;
4. przełączenie odczytu;
5. contract w osobnym wydaniu po okresie kompatybilności.

Przed migracją ryzykowną wymagany jest backup/PITR checkpoint, plan roll-forward oraz rollback aplikacji. Nie należy dodawać automatycznego `down`, który może utracić dane.

### Testy

```bash
sh tools/verify-migration-parity.sh
pnpm test:migrations
```

`pnpm test:migrations` tworzy czystą bazę testową, uruchamia kanoniczny runner, sprawdza klasyfikację tabel, `FORCE RLS`, rozdzielenie roli aplikacyjnej i platformowej oraz wykonuje rzeczywistą próbę odczytu, modyfikacji i zapisu cross-tenant z `packages/database/tests/rls-isolation.sql`.

Profil lokalny z produkcyjnymi entrypointami i Redis TLS przygotowuje się poleceniem:

```bash
pnpm prepare:production-parity
pnpm start:production-parity
```

Sekrety i certyfikaty trafiają wyłącznie do ignorowanych plików `.env.production-parity` i `.runtime/backend-production-parity`. Rotacja wymaga usunięcia wolumenów parity oraz `PAPADATA_REGENERATE_PARITY=1`.

Restore drill:

```bash
PAPADATA_DR_SOURCE_DATABASE_URL="..." \
PAPADATA_DR_TARGET_DATABASE_URL="..." \
PAPADATA_RPO_TARGET_MINUTES=15 \
PAPADATA_RTO_TARGET_MINUTES=60 \
sh tools/restore-drill.sh
```

Drill musi być wykonywany na izolowanym celu. Wynik bez zweryfikowania integralności domenowej i czasu od ostatniego odtwarzalnego punktu nie potwierdza RPO.

### Korekta klasyfikacji po migracji 0017

Migracja `0018_classify_product_convergence_tables.sql` jest korektą forward-only. Klasyfikuje sześć tabel utworzonych przez `0017_backend_product_convergence.sql` w `app.table_security_classification`: `identity_users` i `identity_audit_events` jako `global_internal`, a `identity_memberships`, `product_domain_records`, `product_domain_events` i `webhook_replay_receipts` jako `tenant_workspace`.

Nie wolno dopisywać tej korekty do zastosowanych migracji `0016` ani `0017`. Kanoniczny runner zapisuje SHA-256 migracji w `app.schema_migrations`, więc zmiana istniejącego pliku powodowałaby kontrolowany `Checksum mismatch` na bazie, która już go zastosowała.

## Observability i detekcja

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35`
- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37`

### Implementacja repozytoryjna

- API emituje trace OTLP oraz metryki HTTP z route/method/status i histogramem latency.
- Request context utrzymuje correlation ID i request ID, a ApiProblem zwraca identyfikatory bez stack trace.
- `/metrics` wymaga osobnego tokenu infrastrukturalnego.
- `infra/otel/otel-collector-production.yaml` posiada batching, memory limiter, retry i kolejkę do zewnętrznego OTLP endpointu.

### Odbiór zewnętrzny

Wymagane są źródła i alerty dla:

- p95/p99 latency i 5xx API/BFF;
- auth failure, denied capability i step-up failure;
- Redis/PostgreSQL/storage readiness;
- queue depth, lease age, retry/dead-letter i scheduler drift;
- integracji: error class, provider rate limits i freshness;
- privacy SLA i deletion ledger failures;
- Cloud Armor deny/rate limit;
- Cloud SQL backup/PITR i restore drill.

Każdy alert musi mieć ownera, próg, okno, runbook, test sygnału i termin przeglądu. Debug exporter nie jest dopuszczalnym exporterem produkcyjnym.

## Odbiór produkcyjny backendu

Źródła wymagań:

- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37`
- `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L24-L35`
- `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L13-L34`

### Bramy statyczne

```bash
pnpm install --frozen-lockfile
pnpm verify:backend
pnpm evidence:backend
terraform fmt -check -recursive infra/terraform
terraform -chdir=infra/terraform init -backend=false
terraform -chdir=infra/terraform validate
```

### Bramy wymagające środowiska

1. `pnpm prepare:production-parity`, clean install i upgrade migracji na PostgreSQL 16 przy użyciu `packages/database/scripts/migrate.sh`.
2. `pnpm test:migrations`, w tym cross-tenant read/write test oraz potwierdzenie oddzielnej roli `papadata_platform` z kontrolowanym `BYPASSRLS`.
3. Deploy API/BFF/workera z digest-pinned images.
4. Negatywny test bez `roles/run.invoker` oraz pozytywny BFF→API.
5. Cloud Armor: SQLi/XSS, 429 i logi edge.
6. Secret Manager: per-secret IAM i udokumentowana rotacja active/previous.
7. `tests/backend-production-parity/smoke.mjs` z prywatnym API.
8. Restore drill z pomiarem RPO/RTO.
9. Trivy image scan, SBOM, dependency audit i license report.
10. Dashboard/alerty dla 5xx, latency, queue lag, job failures, auth failures i readiness.

### Reguła GO

Status GO może zostać nadany wyłącznie wtedy, gdy wszystkie pozycje `implemented_requires_*`, `implemented_external_acceptance`, `procedure_requires_external_acceptance` i `implemented_requires_ci` z `config/backend-security-controls.json` mają dowód powiązany z SHA wydania. Repozytoryjny PASS nie jest dowodem wdrożenia.

## Schematy sekretów providerów 7/7

> Ten dokument opisuje pola JSON przechowywane w Secret Manager. Kod nie zapisuje wartości sekretów w tabelach domenowych ani dokumentacji.

| Provider | Wymagane pola | Opcjonalne pola | Dostarczanie zmian |
|---|---|---|---|
| WooCommerce | `storeUrl`, `consumerKey`, `consumerSecret` | `webhookSecret` | webhook HMAC lub polling |
| Shopify | `shopDomain`, `accessToken`, `apiVersion` | `webhookSecret` | webhook HMAC + GraphQL incremental sync |
| BaseLinker | `token` | — | polling/checkpoint |
| Allegro | `refreshToken`, `clientId`, `clientSecret` lub aktywny `accessToken` | `tokenUri`, `expiresAt`, `apiBaseUrl`, `marketplaceId` | OAuth refresh + polling/checkpoint |
| Google Ads | `developerToken`, `customerId`, OAuth refresh albo aktywny `accessToken` | `loginCustomerId`, `tokenUri`, `expiresAt`, `apiVersion` | GAQL polling/checkpoint |
| Meta Ads | `accountId`, `accessToken` | `apiVersion`, `appSecret` | Graph API polling; webhook HMAC, gdy `appSecret` jest skonfigurowany |
| GA4 | `propertyId`, OAuth refresh albo aktywny `accessToken` | `tokenUri`, `expiresAt` | Data API polling/checkpoint |

### Zasady bezpieczeństwa

- Sekret jest rozwiązywany dopiero dla konkretnego `tenantId`, `workspaceId`, `connectionId` i providera.
- Metadata credentialu i wersja sekretu są audytowane.
- Rotacja utrzymuje aktywną i poprzednią wersję bez wbudowanych wartości fallback.
- Adaptery nie logują tokenów, kluczy, nagłówków autoryzacji ani pełnych payloadów błędów providera.
- Webhooki wymagają podpisu; duplikaty są blokowane w trwałym ledgerze replay.
- Odbiór produkcyjny wymaga testu connect, refresh, initial sync, incremental sync, backfill, retry, reconnect i revoke dla każdego providera.

## Backend remediation program

Dokumentacja w tym katalogu implementuje rozdzielenie stanów wymagane przez `AUD-027`:

- target — dokument docelowy;
- implemented — kontrola obecna w kodzie;
- verified — dowód testu powiązany z SHA;
- accepted-risk — jawny wyjątek z ownerem i datą wygaśnięcia.

Źródłem maszynowym jest `config/backend-security-controls.json`. Każde `AUD-001–AUD-030` ma ownera, ścieżkę implementacji i rodzaj odbioru. Status wymagający środowiska nie może zostać automatycznie podniesiony do `verified` przez statyczny skrypt.

### Walidacja lokalna

```bash
pnpm verify:backend
pnpm evidence:backend
pnpm prepare:production-parity
pnpm test:migrations
```

Profil parity używa produkcyjnych entrypointów, odrębnej roli platformowej i lokalnego Redis TLS. Nie zastępuje dowodu z GCP, Cloud Armor, IAM, Secret Manager, backup restore ani podpisanego obrazu.

## Zakres wydania backend-converged-2026-08

### Priorytet architektoniczny

Jedyną bazą rozwojową jest obecny projekt z rozdzielonym BFF, API, workerem i pakietami platformowymi. Kod ze starego `papadata-main` jest wyłącznie dawcą zachowań domenowych, adapterów, testów i modeli danych. Nie przeniesiono starego monolitycznego `AppModule` ani zależności domen od Prisma.

### Zakres repozytoryjny

Wydanie zawiera:

- 7/7 adapterów: WooCommerce, Shopify, BaseLinker, Allegro, Google Ads, Meta Ads i GA4;
- podpisane webhooki z trwałą replay protection dla WooCommerce, Shopify i Meta Ads;
- checkpointowany polling dla BaseLinker, Allegro, Google Ads i GA4;
- publiczną rejestrację i logowanie przez API oraz sesję HttpOnly zarządzaną przez BFF/Redis;
- dokładną zgodność 212/212 dla metod, ścieżek i `operationId` kontraktu `contracts/openapi-1.0.json`;
- trwały model tenancy, domen produktowych, audytu mutacji i wyszukiwania;
- natywne runtime dla głównych domen oraz generowaną warstwę kompatybilności dla pozostałych operacji kontraktu;
- automatycznie generowaną macierz możliwości, pokrycia kontraktu i integracji;
- migrację `0017_backend_product_convergence.sql` z wymuszonym RLS oraz forward-only migrację `0018_classify_product_convergence_tables.sql`, która rejestruje klasyfikację bezpieczeństwa sześciu nowych tabel.

### Granice uczciwego statusu

`targetReleaseClaimed` i `semanticConformanceClaimed` pozostają `false`. Pokrycie trasy oznacza, że żądanie ma kontrolowany handler w aktualnej architekturze; nie oznacza jeszcze, że każda z 212 operacji posiada pełny, dedykowany model biznesowy i odbiór live.

Nadal wymagają odbioru środowiskowego:

- live OAuth/connect/sync/backfill/revoke dla wszystkich siedmiu providerów;
- callbacki webhooków z rzeczywistymi podpisami providerów;
- test PostgreSQL/Redis/storage w CI i staging;
- pełne scenariusze DSAR wraz z providerami i backupami;
- PDF/XLSX;
- zewnętrzne skutki AI, które pozostają wyłączone fail-closed;
- zastępowanie handlerów `compatibility` natywnymi usługami domenowymi i golden tests.

### Synchronizacja dokumentacji

Kontrolery kontraktowe generuje:

```text
node tools/generate-backend-contract-runtime.mjs
```

Manifest oraz dokumentację generuje:

```text
node tools/generate-backend-capability-docs.mjs
```

CI uruchamia oba generatory w wariancie `--check`. Drift pomiędzy OpenAPI, kontrolerami, providerami, manifestem i dokumentacją blokuje bramkę wydania.

### Granica GitHub Code Scanning

Trivy pozostaje egzekwowaną bramką podatności, a wygenerowany SARIF jest zachowywany jako artefakt. CodeQL i upload SARIF do GitHub Code Scanning wymagają dostępnej usługi Code Scanning. W prywatnym repozytorium uruchamiają się dopiero po włączeniu GitHub Code Security i ustawieniu `PAPADATA_CODE_SCANNING_ENABLED=true`; nie stanowi to deklaracji gotowości produkcyjnej ani zastępstwa dla wyniku skanowania.

## Macierz kontroli naprawczych AUD-001–AUD-030

> Status repozytoryjny nie oznacza automatycznie weryfikacji środowiska. Kontrole z `requires`, `external`, `limited` lub `procedure` pozostają blokadą GO do czasu dołączenia dowodu z konkretnego SHA.

| ID | Ryzyko / priorytet | Ustalenie | Odniesienie do dokumentacji źródłowej | Status naprawy | Implementacja / dowód | Odbiór |
|---|---|---|---|---|---|---|
| AUD-001 | Krytyczny / P0 | Produkcjny runtime API jest radykalnie rozbieżny z kanonicznym kontraktem 1.0 | `README.md:L7-L19; docs/audits/2026-08/raport-kompletnosci-i-jakosci-2026-08-14.md:L5-L20; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/integrations.md:L19-L43; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/identity-auth-api.md:L14-L55` | `release_scope_control` | `config/backend-release-scope.json`; `tools/verify-backend-release-scope.mjs` | static verifier |
| AUD-002 | Krytyczny / P0 | Terraform nie dostarcza konfiguracji wymaganej do uruchomienia produkcyjnego BFF i pełnego łańcucha auth API | `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L13-L34; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37` | `implemented_external_acceptance` | `infra/terraform/main.tf`; `infra/terraform/README.md`; `tests/backend-production-parity/smoke.mjs` | repository verifier plus environment-specific evidence |
| AUD-003 | Krytyczny / P0 | Izolacja tenant/workspace nie jest konsekwentnie egzekwowana przez bazę danych | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L24-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L24-L35; docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L26-L34` | `implemented_requires_database_test` | `packages/database/migrations/0016_backend_release_hardening.sql`; `packages/database/migrations/0018_classify_product_convergence_tables.sql`; `packages/database/tests/rls-isolation.sql`; `packages/database/scripts/migrate.sh` | repository verifier plus environment-specific evidence |
| AUD-004 | Krytyczny / P0 | Local i production-parity używają różnych runtime oraz dwóch niezależnych systemów migracji | `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L13-L34; docs/audits/2026-08/potwierdzenie-priorytetow-p0.md:L4-L19` | `implemented_requires_database_test` | `compose.yaml`; `compose.production-parity.yml`; `tools/prepare-production-parity.sh`; `packages/database/scripts/migrate.sh`; `infra/postgres/apply-migrations.sh` | repository verifier plus environment-specific evidence |
| AUD-005 | Krytyczny / P0 | Produkcyjny moduł backendu nie reprezentuje zadeklarowanego pełnego MVP | `docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md:L11-L27; docs/audits/2026-08/potwierdzenie-priorytetow-p0.md:L6-L19` | `release_scope_control` | `config/backend-release-scope.json`; `docs/backend-remediation/RELEASE-SCOPE.md` | static verifier |
| AUD-006 | Krytyczny / P0 | Runtime zawiera 7/7 adapterów; webhooki są provider-specific, zabezpieczone podpisem i trwałą ochroną replay, lecz wymagają odbioru live na rzeczywistych kontach | `docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md:L15-L25; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/integrations.md:L19-L43` | `implemented_requires_live_test` | `packages/integrations/src/provider-registry.ts`; `packages/integrations/src/provider-factory.ts`; `packages/integrations/src/provider-conformance.test.ts`; `packages/integrations/src/provider-webhook.test.ts`; `apps/api/src/production/integrations/webhook.service.ts`; `packages/database/migrations/0017_backend_product_convergence.sql`; `docs/backend-remediation/INTEGRATION-RUNTIME.md` | repository verifier plus provider-specific live evidence |
| AUD-007 | Wysoki / P0 | Globalny ValidationPipe nie zapewnia runtime walidacji większości body | `README.md:L12-L19; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/api-schema-catalog.md:L23-L40; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/integrations.md:L66-L66` | `implemented` | `apps/api/src/production/main.ts`; `apps/api/src/production/validation/dtos.ts` | static verifier |
| AUD-008 | Wysoki / P0 | Reguła command: idempotency + audyt + capability + outcome jest wdrożona tylko częściowo | `docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/cross-cutting-operations.md:L23-L28; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/integrations.md:L38-L43; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/audit-telemetry.md:L23-L28` | `implemented_requires_database_test` | `apps/api/src/production/commands/command-execution.interceptor.ts`; `packages/database/migrations/0016_backend_release_hardening.sql` | repository verifier plus environment-specific evidence |
| AUD-009 | Wysoki / P0 | Własny klient Redis BFF nie obsługuje TLS, AUTH, wyboru DB ani timeoutów | `docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/identity-auth-api.md:L14-L16; docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L17-L24; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35` | `implemented_requires_live_test` | `apps/bff/src/session-store.ts`; `apps/bff/src/rate-limit.service.ts`; `apps/bff/src/config.ts`; `apps/bff/src/config-hardening.test.ts`; `tools/prepare-production-parity.sh` | repository verifier plus environment-specific evidence |
| AUD-010 | Wysoki / P0 | DSAR/privacy workflow kończy się na statusie verification_pending i nie realizuje usunięcia lub eksportu | `docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/13-polityka-retencji-i-usuwania.md:L15-L45; docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md:L13-L27` | `limited_and_blocked` | `apps/api/src/production/privacy/privacy.service.ts`; `apps/worker/src/production/platform-worker.service.ts`; `config/backend-release-scope.json` | repository verifier plus environment-specific evidence |
| AUD-011 | Wysoki / P0 | Worker raportowy generuje pusty JSON niezależnie od żądanego formatu | `docs/specyfikacja-docelowa/26-priorytety-p0/07-kreator-raportow-i-eksport.md:L11-L40; docs/audits/2026-08/potwierdzenie-priorytetow-p0.md:L12-L19` | `implemented_limited` | `apps/worker/src/production/platform-worker.service.ts`; `config/backend-release-scope.json` | repository verifier plus environment-specific evidence |
| AUD-012 | Wysoki / P0 | AI runtime nie spełnia wymaganego kontraktu providera i local deterministic mode | `docs/specyfikacja-docelowa/26-priorytety-p0/04-ai-local-i-adaptery-providerow.md:L11-L29; docs/specyfikacja-docelowa/26-priorytety-p0/10-ai-actions-akceptacja-czlowieka.md:L11-L17` | `implemented_limited` | `packages/ai-runtime/src/index.ts`; `config/backend-release-scope.json` | repository verifier plus environment-specific evidence |
| AUD-013 | Wysoki / P1 | Scheduler i część platform jobs są atrapami operacyjnymi | `docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md:L13-L27; docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/13-polityka-retencji-i-usuwania.md:L31-L45` | `implemented_requires_database_test` | `apps/worker/src/production/scheduler.service.ts`; `apps/worker/src/production/platform-worker.service.ts` | repository verifier plus environment-specific evidence |
| AUD-014 | Wysoki / P1 | Readiness deklaruje niezweryfikowane zależności, wykonuje zapisy do storage, a `/metrics` jest zawsze blokowane | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37` | `implemented_requires_live_test` | `apps/api/src/production/readiness.controller.ts`; `apps/api/src/production/observability/metrics.controller.ts`; `tests/backend-production-parity/smoke.mjs` | repository verifier plus environment-specific evidence |
| AUD-015 | Wysoki / P1 | CI nie egzekwuje większości udokumentowanych release gates | `README.md:L26-L32; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37` | `implemented_requires_ci` | `.github/workflows/ci.yml`; `.github/workflows/platform-production-foundation.yml`; `tools/verify-backend-security-controls.mjs` | repository verifier plus environment-specific evidence |
| AUD-016 | Wysoki / P1 | Zakres testów nie dowodzi działania produkcyjnego stosu end-to-end | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md:L25-L25` | `implemented_requires_live_test` | `tests/backend-production-parity/smoke.mjs`; `docs/backend-remediation/PRODUCTION-ACCEPTANCE.md` | repository verifier plus environment-specific evidence |
| AUD-017 | Wysoki / P1 | API nie ma jednolitego ApiProblem/correlation/operation error boundary | `docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/api-schema-catalog.md:L23-L40; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/cross-cutting-operations.md:L23-L28` | `implemented` | `apps/api/src/production/observability/api-problem.filter.ts`; `apps/api/src/production/observability/request-context.interceptor.ts` | static verifier |
| AUD-018 | Wysoki / P1 | Workery w trybie produkcyjnym cicho wracają do lokalnych URL-i, haseł i bucketów | `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L26-L34; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35` | `implemented` | `apps/worker/src/production/config.ts` | static verifier |
| AUD-019 | Wysoki / P1 | Lease nie jest odnawiany, a API cancellation nie używa trwałego stanu cancel_requested | `docs/specyfikacja-docelowa/26-priorytety-p0/03-zakres-mvp-cala-aplikacja.md:L25-L25; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/integrations.md:L30-L43` | `implemented_requires_database_test` | `apps/worker/src/production/ingestion-pipeline.ts`; `packages/database/src/production.ts`; `apps/api/src/production/queue/queue.service.ts` | repository verifier plus environment-specific evidence |
| AUD-020 | Średni / P1 | Zatwierdzony raport zależności nie obejmuje manifestów backendu | `docs/specyfikacja-docelowa/00-zarzadzanie-dokumentacja/README.md:L13-L45; docs/specyfikacja-docelowa/00-zarzadzanie-dokumentacja/README.md:L83-L102; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L24` | `implemented_requires_ci` | `.github/workflows/platform-production-foundation.yml`; `config/backend-license-policy.json`; `tools/check-license-report.mjs` | repository verifier plus environment-specific evidence |
| AUD-021 | Średni / P1 | Observability ogranicza się do trace exportu API i debug exportera collectora | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L17-L24` | `implemented_external_acceptance` | `apps/api/src/production/telemetry.ts`; `infra/otel/otel-collector-production.yaml`; `docs/backend-remediation/OBSERVABILITY.md` | repository verifier plus environment-specific evidence |
| AUD-022 | Wysoki / P1 | Nie znaleziono rate limiting ani WAF/edge enforcement dla auth i mutacji | `docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/identity-auth-api.md:L14-L16; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L24` | `implemented_external_acceptance` | `apps/bff/src/rate-limit.service.ts`; `infra/terraform/main.tf`; `tests/backend-production-parity/smoke.mjs` | repository verifier plus environment-specific evidence |
| AUD-023 | Wysoki / P1 | Retencja plików i deletion ledger nie mają działającego wykonania | `docs/specyfikacja-docelowa/27-pakiet-prawny-i-organizacyjny/13-polityka-retencji-i-usuwania.md:L15-L45; docs/specyfikacja-docelowa/26-priorytety-p0/07-kreator-raportow-i-eksport.md:L19-L40` | `implemented_requires_database_test` | `packages/storage/src/index.ts`; `apps/worker/src/production/platform-worker.service.ts`; `packages/database/migrations/0016_backend_release_hardening.sql` | repository verifier plus environment-specific evidence |
| AUD-024 | Średni / P1 | IAM i zarządzanie sekretami w Terraform są zbyt szerokie i nie pokazują KMS/rotation boundary | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37` | `implemented_external_acceptance` | `infra/terraform/main.tf`; `infra/terraform/backend.tf.example`; `infra/terraform/README.md` | repository verifier plus environment-specific evidence |
| AUD-025 | Średni / P2 | API ma słabą walidację liczb/adapterów i nie zamyka jawnie poola PostgreSQL | `docs/specyfikacja-docelowa/26-priorytety-p0/02-parytet-local-gcp.md:L26-L34; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L33-L37` | `implemented` | `apps/api/src/production/config.ts`; `apps/api/src/production/config-hardening.test.ts`; `apps/api/src/production/database.module.ts`; `apps/api/src/production/main.ts` | static verifier |
| AUD-026 | Średni / P2 | Migracje nie mają strategii rollback/expand-contract i brak dowodu osiągnięcia RPO/RTO | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L37; README.md:L26-L32` | `procedure_requires_external_acceptance` | `docs/backend-remediation/MIGRATION-AND-DR.md`; `tools/restore-drill.sh` | repository verifier plus environment-specific evidence |
| AUD-027 | Średni / P1 | Dokumenty bezpieczeństwa mają status approved-target, ale wiele z nich jest identycznym szablonem bez konkretnej kontroli | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35; docs/audits/2026-08/potwierdzenie-priorytetow-p0.md:L4-L19` | `implemented` | `config/backend-security-controls.json`; `docs/backend-remediation/SECURITY-CONTROL-MATRIX.md` | static verifier |
| AUD-028 | Niski / P2 | Aktualny raport PASS i checksum manifest są nieaktualne względem working tree | `README.md:L26-L32; docs/audits/2026-08/raport-walidacji-2026-08-14.md:L3-L19` | `excluded_storybook_context` | `docs/backend-remediation/RELEASE-SCOPE.md` | static verifier |
| AUD-029 | Niski / P2 | BFF buforuje pełną odpowiedź upstream i akceptuje wyłącznie JSON body | `docs/specyfikacja-docelowa/26-priorytety-p0/07-kreator-raportow-i-eksport.md:L19-L38; docs/specyfikacja-docelowa/25-kontrakty-domenowe-i-api/identity-auth-api.md:L14-L16` | `implemented_requires_live_test` | `apps/bff/src/proxy.controller.ts`; `apps/bff/src/app.factory.ts`; `tests/backend-production-parity/smoke.mjs` | repository verifier plus environment-specific evidence |
| AUD-030 | Średni / P2 | Kontener produkcyjny nie jest minimalny, nie jest non-root i obrazy nie są pinowane digestem | `docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L17-L24; docs/specyfikacja-docelowa/23-bezpieczenstwo-platformy/README.md:L15-L35` | `implemented_requires_ci` | `infra/production/api.Dockerfile`; `infra/production/bff.Dockerfile`; `infra/production/worker.Dockerfile`; `.github/workflows/platform-production-foundation.yml` | repository verifier plus environment-specific evidence |

### Interpretacja statusów

- `implemented`: kontrola jest obecna i ma bramę statyczną; nadal wymaga zwykłego CI dla SHA.
- `release_scope_control`: ryzyko jest zamknięte przez formalne ograniczenie zakresu, nie przez pozorną implementację targetu.
- `implemented_requires_database_test`: kod i migracja są obecne, lecz wymagany jest test na realnym PostgreSQL.
- `implemented_requires_live_test` / `implemented_external_acceptance`: wymagany jest dowód z wdrożenia lub systemu zewnętrznego.
- `implemented_requires_ci`: kontrola musi przejść w wymaganym workflow dla konkretnego SHA.
- `implemented_limited` / `limited_and_blocked`: bezpieczny podzbiór działa, a pozostała funkcja jest fail-closed.
- `procedure_requires_external_acceptance`: istnieje runbook i narzędzie, ale nie ma wyniku ćwiczenia.
- `excluded_storybook_context`: problem nie należy do mutacji backendowej i musi zostać zamknięty w swoim strumieniu prac.

### Warunkowa publikacja wyników Code Scanning

Kontrole `implemented_requires_ci` nadal wymagają przejścia właściwego gate’u dla konkretnego SHA. Trivy egzekwuje próg podatności niezależnie od publikacji SARIF. W prywatnym repozytorium CodeQL i upload SARIF są aktywowane dopiero po udostępnieniu GitHub Code Security oraz ustawieniu zmiennej `PAPADATA_CODE_SCANNING_ENABLED=true`; do tego czasu SARIF pozostaje dowodem w artefakcie workflow, a brak usługi jest raportowany jawnie.
