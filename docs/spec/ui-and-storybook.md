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
