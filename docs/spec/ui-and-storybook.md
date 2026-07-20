# UI i Storybook

## Zasady UI

- interfejs premium i enterprise,
- light i dark mode,
- nasycone, ale nieneonowe kolory,
- ograniczone użycie pogrubień,
- brak nadmiaru ramek,
- brak ciężkich kart dla każdej sekcji,
- logiczna hierarchia,
- command center,
- panele kontekstowe,
- dostępność klawiaturą.

## Grupy Storybooka

- Foundations
- Design System
- Forms
- Feedback
- Navigation
- Intro
- Auth Flow
- Workspace Setup
- Dashboard
- Analytics
- Integrations
- AI Assistant
- Reports
- Settings
- Users and Roles
- Security States
- Error States
- Product Flows
- Edge Cases

## Każda ważna story musi zawierać

- [ ] Light mode.
- [ ] Dark mode.
- [ ] Warianty ról.
- [ ] Loading.
- [ ] Empty.
- [ ] Partial.
- [ ] Error.
- [ ] No access.
- [ ] Expired session.
- [ ] Długie treści.
- [ ] Obsługę klawiatury.
- [ ] Centralne fixtures.

## Fala 1 — wspólny fundament Storybooka

Kanoniczne fixture Fali 1 znajdują się w
`apps/web/src/shared/test/fala1Fixtures.ts` i są walidowane schematami z
`domain-contracts`.

Obowiązujące fixture:

- `ctx_owner_ready`;
- `ctx_admin_partial`;
- `ctx_analyst_invalid`;
- `ctx_viewer_forbidden`;
- `ctx_ops_jit`;
- `integration_reauth`;
- `sync_retry_wait`;
- `quality_conflict`;
- `metric_definition_changed`;
- `ai_insufficient_data`;
- `ai_needs_review`;
- `billing_past_due`.

Wspólne wzorce Fali 1 znajdują się w `apps/web/src/shared/patterns`:

- `WorkspaceContextBar`;
- `ReadinessBanner`;
- `OperationTracker`;
- `EvidencePanel`;
- `DecisionCard`;
- `PermissionBoundary`;
- `DataIssuePanel`;
- standardowe stany empty, partial, error i expired session.

## Fala 2 — integracje i synchronizacja

Ekran integracji znajduje się w
`apps/web/src/features/integrations/IntegrationLifecycleScreen.tsx`.

Storybook:

- `PapaData/04 Ekrany docelowe/Integracje i synchronizacja`;
- `apps/web/src/stories/integrations/wave2-integrations.stories.tsx`.

Fixtures są walidowane schematem Zod i znajdują się w
`apps/web/src/features/integrations/integrationFixtures.ts`.

Obowiązujące stany:

- provider unavailable;
- provider pilot;
- missing capability;
- missing entitlement;
- not connected;
- connecting;
- OAuth cancelled;
- callback error;
- bad redirect;
- full scope;
- limited scope;
- active;
- initial sync queued;
- initial sync running;
- initial sync partial;
- initial sync failed;
- no data;
- rate limit;
- retry wait;
- provider outage;
- schema mismatch;
- credential expired;
- reauth required;
- reconnect success;
- reconnect failure;
- scope increased;
- scope decreased;
- backfill;
- disconnect impact;
- revoke failure;
- disabled connection;
- recovery success;
- recovery failure;
- forbidden;
- expired session;
- workspace switch during operation;
- light theme.

## Fala 3 — jakość danych i integralność

Ekran jakości danych znajduje się w
`apps/web/src/features/data-quality/DataQualityCenterScreen.tsx`.

Storybook:

- `PapaData/04 Ekrany docelowe/Jakość danych i integralność`;
- `apps/web/src/stories/data-quality/wave3-data-quality.stories.tsx`.

Fixtures są walidowane schematem Zod i znajdują się w
`apps/web/src/features/data-quality/dataQualityFixtures.ts`.

Obowiązujące stany:

- `NO_DATA`;
- `INGESTING`;
- `PARTIAL`;
- `DELAYED`;
- `INVALID`;
- `PROCESSING`;
- `READY`;
- `RESYNC_REQUIRED`;
- `BLOCKED`;
- schema mismatch;
- missing required field;
- unknown status;
- missing currency;
- duplicate source record;
- exact match;
- overlap;
- source authority;
- manual review;
- reprocess;
- reconciliation;
- old/new impact;
- missing lineage;
- forbidden;
- expired session;
- workspace switch during operation;
- light theme.

## Fala 4 — Analytics Platform i Customer Workspace

Ekran customer workspace znajduje się w
`apps/web/src/features/analytics/CustomerWorkspaceScreen.tsx`.

Storybook:

- `PapaData/04 Ekrany docelowe/Analytics Platform i Customer Workspace`;
- `apps/web/src/stories/analytics/wave4-analytics.stories.tsx`.

Fixtures są walidowane schematem Zod i znajdują się w
`apps/web/src/features/analytics/analyticsFixtures.ts`.

Obowiązujące stany:

- default;
- loading;
- empty confirmed;
- missing data;
- partial;
- stale;
- invalid;
- blocked;
- processing;
- recalculation;
- permission denied;
- entitlement required;
- recoverable error;
- critical issue;
- historical snapshot;
- long content;
- desktop;
- tablet;
- mobile;
- keyboard navigation;
- reduced motion;
- light;
- dark;
- high contrast;
- orders;
- D2C;
- data trust;
- alerts;
- tasks;
- gated modules;
- workspace switch.
