# Request interpretation examples

## Contents

1. Global component change
2. Domain-only component change
3. Local instance change
4. Whole-screen redesign
5. Screenshot-led redesign
6. Global table capability
7. Tests before acceptance

## 1. Global component change

User:

`Popraw dropdown.`

Interpretation:

- Treat as global semantic scope.
- Audit Select/Menu/Combobox semantics rather than blindly replacing all popovers.
- Modify the canonical Design System component or create one only when none exists.
- Update semantically matching product consumers.
- Do not wait for separate instructions per screen.

## 2. Domain-only component change

User:

`Popraw dropdown w Laboratorium.`

Interpretation:

- Scope is Papa Assistant Laboratory.
- Reuse the canonical Select/Menu primitive if appropriate.
- Keep domain-specific composition/styling local if the requested difference belongs specifically to Laboratory.
- Do not propagate a domain-specific design choice globally.

## 3. Local instance change

User:

`Ten dropdown tutaj jest za wysoki. Zmień tylko ten.`

Interpretation:

- Local scope.
- Prefer a local prop/variant only if it does not create a malformed global API.
- Do not change other consumers.

## 4. Whole-screen redesign

User:

`Przebuduj Laboratorium, bo obecny ekran jest słaby.`

Interpretation:

- Inspect the real `PapaAssistantLabScreen`, its current Storybook render, functions, states, and screen-specific components.
- You may substantially reorganize hierarchy, panes, controls, density, and component composition.
- Preserve modes, inspector, canvas/chart studio, context, decisions, focus state, run state, history/log, and other actual capabilities unless explicitly asked to remove/change them.
- Storybook and production must continue to consume the same canonical screen.

## 5. Screenshot-led redesign

User supplies a screenshot and says:

`To wygląda źle, popraw.`

Interpretation:

- Treat the screenshot as primary evidence for the visual problem.
- Identify concrete issues: hierarchy, density, alignment, control semantics, contrast, wasted space, interaction ambiguity, etc.
- Locate the real canonical component/screen in code.
- Implement the improvement in the real shared UI rather than reproducing the screenshot inside a Storybook-only component.

## 6. Global table capability

User:

`Dodaj CSV/PDF do tabel.`

Interpretation:

- Audit table ownership first.
- Prefer one shared pattern such as a composable `TableToolbar` + `ExportMenu` insertion point.
- Apply only to tables where export is a valid product action.
- Keep actual export behavior/data mapping domain-aware while sharing presentation and interaction mechanics.

## 7. Tests before acceptance

User requests a redesign and has not yet explicitly accepted the final result.

Do:

- implement;
- inspect screenshot/current UI;
- typecheck/compile if useful and non-test;
- show the final implementation for acceptance.

Do not:

- write or update tests;
- run `test`;
- run Playwright as a QA gate;
- run Storybook test runner/play suites;
- run visual-regression/a11y suites.

After the user explicitly says `akceptuję` or equivalent, move to validation.
