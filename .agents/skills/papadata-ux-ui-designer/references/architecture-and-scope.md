# Architecture and scope reference

## Contents

1. Canonical ownership
2. Scope inference
3. Data ownership
4. Global component rules
5. Storybook rules
6. Acceptance/testing boundary

## 1. Canonical ownership

Use this dependency direction:

```text
Design System / runtime shared
          ↓
     Product Screens
      ↙         ↘
 Storybook    Production
```

Current PapaData architecture intentionally moved product screens out of `storybook-next/stories` and runtime ownership out of `storybook-next/runtime`.

Canonical product UI belongs under `apps/web/src/screens`. Shared global UI belongs under `apps/web/src/design-system`. Shared runtime belongs under `apps/web/src/runtime`. Storybook stories and fixtures remain consumers.

Do not reintroduce a Storybook-owned product screen or runtime module.

## 2. Scope inference

### Global by default for generic canonical component wording

Examples:

- `Popraw dropdown.`
- `Dropdown jest za duży.`
- `Tooltip powinien wyglądać lepiej.`
- `Ujednolić paginację.`

Interpret as: locate the semantic canonical component, audit matching consumers, improve the canonical implementation, and migrate matching duplicates when required.

### Domain/screen scope when a named area is supplied

Examples:

- `Popraw dropdown w Laboratorium.`
- `Zmień tabelę w Paid Campaigns.`
- `Przebuduj ekran produktów.`

Keep changes in that domain unless the issue is proven to be a defect of an existing global primitive.

### Local scope when instance language is explicit

Examples:

- `Ten dropdown tutaj.`
- `Tylko ta tabela.`
- `Nie zmieniaj reszty ekranów.`

Do not propagate beyond that instance/domain.

### Cross-product pattern request

Example:

- `Dodaj CSV/PDF do tabel.`

Treat as a request for a shared table/export pattern across semantically appropriate tables. Do not inject export into tables where it is meaningless or forbidden by product semantics.

## 3. Data ownership

Use:

```text
Screen.model / domain contract
            ↓
          Screen
       ↙          ↘
 Storybook         Production
   fixture          adapter/API
       ↖          ↗
     neutral seed/factory
      only when justified
```

Rules:

- A screen must not import a Storybook fixture.
- A screen must not import a demo seed as its business source of truth.
- A screen must not import its production adapter.
- Production must not import Storybook fixtures/stories.
- Neutral demo seeds belong under `apps/web/src/fixtures` when needed by multiple non-canonical consumers.

## 4. Global component rules

Consolidate by semantics, not appearance.

Good canonical candidates include recurring Select, Menu, SearchInput, Pagination, Dialog shell, Drawer shell, MetricCard, DateRange, TableToolbar, status presentation, and chart control patterns.

Keep domain-specific components local when their behavior/data contract is materially different.

Never create a monolithic `Universal` component with many unrelated modes merely to eliminate files.

When a canonical component lacks one legitimate recurring capability, prefer a small prop, slot, composition API, or variant rather than copying the component into a screen.

## 5. Storybook rules

Storybook may own:

- `.stories.tsx`
- args/scenarios
- fixtures
- decorators
- presentation wrappers that exist only to demonstrate stories
- Storybook metadata/catalog tooling

Storybook must not own the canonical product screen, global product component, auth runtime, shell runtime, or production data source.

A Storybook story should render the same component/screen that production uses.

## 6. Acceptance/testing boundary

Before explicit user acceptance, focus on implementation and design iteration. Do not author, modify, or run test suites. Do not turn Playwright/browser automation into a formal QA gate.

Manual/interactive render inspection is allowed for understanding and design iteration, because it is part of designing the requested UI rather than a post-acceptance validation suite.

After explicit acceptance, run the validation appropriate to the accepted scope and repair regressions.
