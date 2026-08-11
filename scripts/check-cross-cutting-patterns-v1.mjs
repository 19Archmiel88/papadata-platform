import {
  existsSync,
  readdirSync,
} from 'node:fs';
import {
  spawnSync,
} from 'node:child_process';

import {
  ensure,
  getContract,
  readJson,
  readText,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const storyRoot =
  'apps/web/src/storybook-next/stories/18-cross-cutting-patterns';
const cssPath = `${storyRoot}/cross-cutting-patterns.css`;

const implementedEntries = [
  {
    id: '18.01',
    fixture: 'fixtures/storybook/112-18-01-uklad-strony-i-sekcji.json',
    storyExport: 'PageSectionLayoutStory',
    storyFile: `${storyRoot}/PageSectionLayout.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Układ strony i sekcji',
  },
  {
    id: '18.02',
    fixture: 'fixtures/storybook/105-18-02-empty-error-i-no-access.json',
    storyExport: 'FeedbackStatesStory',
    storyFile: `${storyRoot}/FeedbackStates.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Routing feedbacku',
  },
  {
    id: '18.03',
    fixture: 'fixtures/storybook/113-18-03-ladowanie-danych-i-operacje-w-tle.json',
    storyExport: 'LoadingOperationsStory',
    storyFile: `${storyRoot}/LoadingOperations.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Ładowanie danych i operacje w tle',
  },
  {
    id: '18.04',
    fixture: 'fixtures/storybook/111-18-04-tabela-z-filtrami-i-akcjami.json',
    storyExport: 'FilteredTableActionsStory',
    storyFile: `${storyRoot}/FilteredTableActions.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Tabela z filtrami i akcjami',
  },
  {
    id: '18.07',
    fixture: 'fixtures/storybook/108-18-07-panele-szczegolow-dowodow-i-rekomendacji.json',
    storyExport: 'DetailEvidenceRecommendationPanelsStory',
    storyFile: `${storyRoot}/DetailEvidenceRecommendationPanels.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Panele szczegółów, dowodów i rekomendacji',
  },
  {
    id: '18.08',
    fixture: 'fixtures/storybook/110-18-08-status-danych-i-readiness.json',
    storyExport: 'DataReadinessStatusStory',
    storyFile: `${storyRoot}/DataReadinessStatus.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Readiness operacyjny',
  },
  {
    id: '18.10',
    accepted: true,
    documentationStatus: 'accepted',
    fixture: 'fixtures/storybook/107-18-10-macierz-stanow-przekrojowych.json',
    implementationStatus: 'implemented-accepted-cross-cutting-pattern',
    storyExport: 'CrossStateMatrixStory',
    storyFile: `${storyRoot}/CrossStateMatrix.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/Macierz stanów przekrojowych',
  },
  {
    id: '18.11',
    fixture: 'fixtures/storybook/230-18-11-data-decision-workspace.json',
    storyExport: 'DataDecisionWorkspaceStory',
    storyFile: `${storyRoot}/DataDecisionWorkspace.stories.tsx`,
    storyTitle: '18 Wzorce interfejsu/DataDecisionWorkspace',
  },
];

const plannedEntries = [
  '18.05',
  '18.06',
  '18.09',
];

const forbiddenProductionSelectors = [
  'pd-f0-page',
  'pd-f0-section',
  'pd-button',
  'pd-inline-action',
  'pd-icon-button',
  'pd-data-table',
  'pd-table',
  'pd-status-badge',
  'pd-feedback-state',
  'pd-feedback-surface',
  'pd-skeleton',
  'pd-spinner',
  'pd-background-operation',
  'pd-progress-indicator',
  'pd-filter-bar',
  'pd-search-field',
  'pd-sort-control',
  'pd-select',
  'pd-drawer',
  'pd-tabs',
  'pd-data-list',
  'pd-key-value-list',
  'pd-overlay-root',
  'pd-overlay-surface',
  'pd-form-field',
  'pd-form-control',
  'pd-pagination',
  'pd-menu',
];

const forbiddenLocalLanguage = [
  'card-grid',
  'tile',
  'box-card',
  'container-card',
  'panel-card',
  'glow',
  'halo',
  'blur',
  'glass',
  'glassmorphism',
];

function assertNoGitDiff(path) {
  const repositoryRoot = resolveFromRoot();

  if (!existsSync(resolveFromRoot('.git'))) {
    return;
  }

  const result = spawnSync(
    'git',
    [
      'diff',
      '--quiet',
      '--',
      path,
    ],
    {
      cwd: repositoryRoot,
    },
  );

  ensure(
    result.status === 0,
    `${path} must remain unchanged for 18 cross-cutting patterns.`,
  );
}

function ensureArrayIncludes(values, expected, message) {
  ensure(
    Array.isArray(values)
      && values.includes(expected),
    message,
  );
}

function ensureArrayExcludes(values, unexpected, message) {
  ensure(
    !Array.isArray(values)
      || !values.some((value) => String(value).includes(unexpected)),
    message,
  );
}

function assertCssContract() {
  ensure(
    existsSync(resolveFromRoot(cssPath)),
    '18: missing local cross-cutting CSS.',
  );

  const css = readText(cssPath);
  const classNames = Array.from(
    css.matchAll(/(?:^|[\s,{>+~])\.([_a-zA-Z][a-zA-Z0-9_-]*)/g),
    (match) => match[1],
  );

  for (const className of classNames) {
    ensure(
      className.startsWith('pd-x18-'),
      `${cssPath}: local CSS class .${className} must use pd-x18-* prefix.`,
    );
  }

  for (const selector of forbiddenProductionSelectors) {
    const pattern = new RegExp(
      `\\\\.${selector}(?=[\\\\s,:>{.#\\\\[]|$)`,
    );
    ensure(
      !pattern.test(css),
      `${cssPath}: local CSS must not override .${selector}.`,
    );
  }

  for (const marker of forbiddenLocalLanguage) {
    ensure(
      !css.includes(marker),
      `${cssPath}: local CSS uses forbidden card/tile/decorative marker "${marker}".`,
    );
  }
}

function assertStorySources() {
  const files = readdirSync(resolveFromRoot(storyRoot))
    .filter((file) => file.endsWith('.stories.tsx'));

  ensure(
    files.length === implementedEntries.length,
    '18: story folder must contain exactly the implemented story files.',
  );

  for (const item of implementedEntries) {
    const source = readText(item.storyFile);

    ensure(
      source.includes('../../../storybook-next/presentation/story-presentation.css'),
      `${item.id}: missing canonical StoryPresentation CSS import.`,
    );
    ensure(
      source.includes('StoryPresentationPage')
        && source.includes('StoryPresentationSection'),
      `${item.id}: story must use StoryPresentationPage/StoryPresentationSection.`,
    );
    ensure(
      source.includes(`export const ${item.storyExport}`),
      `${item.id}: missing story export ${item.storyExport}.`,
    );

    for (const marker of [
      'card-grid',
      'box-card',
      'container-card',
      'panel-card',
      'glassmorphism',
    ]) {
      ensure(
        !source.includes(marker),
        `${item.id}: story source contains forbidden UI marker ${marker}.`,
      );
    }
  }
}

function assertContract() {
  const contract = getContract();
  const entries = new Map(
    contract.entries.map((entry) => [
      entry.id,
      entry,
    ]),
  );

  for (const item of implementedEntries) {
    const entry = entries.get(item.id);

    ensure(entry, `${item.id}: missing Storybook contract entry.`);
    ensure(entry.storyStatus === 'implemented', `${item.id}: must be implemented.`);
    ensure(entry.storyVisibility === 'visible', `${item.id}: must be visible.`);
    ensure(entry.documentationStatus === (item.documentationStatus ?? 'review'), `${item.id}: docs status drift.`);
    ensure(entry.prototypeStatus === 'implemented', `${item.id}: prototype must be implemented.`);
    ensure(entry.productionStatus === 'not_started', `${item.id}: production status must remain not_started for pattern-only scope.`);
    ensure(entry.testStatus === 'passing', `${item.id}: test status must be passing.`);
    ensure(entry.accepted === (item.accepted ?? false), `${item.id}: visual acceptance drift.`);
    ensure(entry.storyFile === item.storyFile, `${item.id}: storyFile drift.`);
    ensure(entry.storyTitle === item.storyTitle, `${item.id}: storyTitle drift.`);
    ensure(entry.storyExport === item.storyExport, `${item.id}: storyExport drift.`);
  }

  for (const id of plannedEntries) {
    const entry = entries.get(id);

    ensure(entry, `${id}: missing planned contract entry.`);
    ensure(entry.storyStatus === 'planned', `${id}: must remain planned.`);
    ensure(entry.storyVisibility === 'hidden', `${id}: must remain hidden.`);
    ensure(entry.storyFile === null, `${id}: planned entry must not point to storyFile.`);
    ensure(entry.storyTitle === null, `${id}: planned entry must not point to storyTitle.`);
  }

  const implemented = contract.entries.filter((entry) => (
    entry.storyStatus === 'implemented'
  ));
  const visible = contract.entries.filter((entry) => (
    entry.storyVisibility === 'visible'
  ));
  const storyFiles = new Set(
    implemented
      .map((entry) => entry.storyFile)
      .filter(Boolean),
  );

  ensure(
    contract.visibleStoryPolicy.entryStoryCount === implemented.length,
    '18: visibleStoryPolicy.entryStoryCount drift.',
  );
  ensure(
    contract.visibleStoryPolicy.visibleStoryCount === visible.length,
    '18: visibleStoryPolicy.visibleStoryCount drift.',
  );
  ensure(
    contract.activeVisualLayer.activeEntryStories === implemented.length,
    '18: activeEntryStories drift.',
  );
  ensure(
    contract.activeVisualLayer.activeStoryFiles === storyFiles.size,
    '18: activeStoryFiles drift.',
  );
}

function assertFixtures() {
  const auditSource = readText('apps/web/scripts/storybook-audit.mjs');

  for (const item of implementedEntries) {
    const fixture = readJson(item.fixture);
    const playSteps = fixture.playSteps ?? [];
    const visualAssertions = fixture.visualAssertions ?? [];
    const a11y = fixture.a11y ?? [];

    ensure(fixture.storyTitle === item.storyTitle, `${item.id}: fixture storyTitle drift.`);
    ensure(fixture.implementationStatus === (item.implementationStatus ?? 'implemented-review-cross-cutting-pattern'), `${item.id}: fixture implementation status drift.`);
    ensure(fixture.components.length > 0, `${item.id}: fixture must list real components.`);
    ensure(fixture.localeCases.length === 1 && fixture.localeCases[0] === 'pl', `${item.id}: fixture must only claim implemented PL locale.`);
    ensureArrayIncludes(visualAssertions, 'no-horizontal-page-scroll', `${item.id}: fixture must declare no-horizontal-page-scroll for audit coverage.`);
    ensure(
      auditSource.includes(item.storyTitle),
      `${item.id}: no-horizontal-page-scroll fixture assertion must be covered by storybook-audit target.`,
    );

    for (const genericStep of [
      'focus-first-interactive',
      'exercise-component-interaction',
      'verify-live-region',
      'verify-keyboard-only',
    ]) {
      ensureArrayExcludes(playSteps, genericStep, `${item.id}: fixture keeps generic or false play step ${genericStep}.`);
    }

    ensureArrayExcludes(a11y, 'live-region', `${item.id}: fixture claims live-region without explicit scoped coverage.`);
    ensureArrayExcludes(a11y, 'keyboard-only', `${item.id}: fixture claims keyboard-only without full keyboard-only path.`);
    ensureArrayExcludes(visualAssertions, 'selected-row', `${item.id}: fixture must not claim selected-row UI.`);
    ensureArrayExcludes(playSteps, 'selected-row', `${item.id}: fixture must not claim selected-row UI.`);
    ensureArrayExcludes(playSteps, 'bulk-actions', `${item.id}: fixture must use caller-owned bulk action wording if needed.`);

    if (playSteps.some((step) => step.includes('focus-restoration'))) {
      ensure(
        item.id === '18.07',
        `${item.id}: focus restoration is only implemented in 18.07 Drawer story.`,
      );
    }

    if (playSteps.some((step) => step.includes('drawer-escape-close'))) {
      ensure(
        item.id === '18.07',
        `${item.id}: drawer escape close is only implemented in 18.07.`,
      );
    }

    if (playSteps.some((step) => step.includes('role-alert')) || a11y.some((step) => step.includes('role-alert'))) {
      ensure(
        item.id === '18.02',
        `${item.id}: role-alert is only covered by 18.02 ErrorState.`,
      );
    }

    if (playSteps.some((step) => step.includes('role-status')) || a11y.some((step) => step.includes('role-status'))) {
      ensure(
        item.id === '18.03',
        `${item.id}: role-status is only covered by 18.03 Spinner.`,
      );
    }
  }
}

function assertRegistries() {
  const storybookRegistry = readText('rejestry/storybook.csv');

  for (const item of implementedEntries) {
    ensure(
      storybookRegistry.includes(item.storyTitle),
      `${item.id}: storybook registry missing ${item.storyTitle}.`,
    );
    ensure(
      storybookRegistry.includes(`${item.fixture},`),
      `${item.id}: storybook registry missing fixture path.`,
    );
  }

  for (const id of [
    '18-05',
    '18-06',
    '18-09',
  ]) {
    ensure(
      storybookRegistry.includes(`${id}-`),
      `${id}: planned registry row missing.`,
    );
  }
}

assertNoGitDiff('apps/web/src/design-system/analytics-system-v1.json');
assertCssContract();
assertStorySources();
assertContract();
assertFixtures();
assertRegistries();

console.log('Cross-cutting patterns V1 OK: 18.01, 18.02, 18.03, 18.04, 18.07, 18.08, 18.11 in Storybook review; 18.10 accepted.');
