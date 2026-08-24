import { existsSync } from 'node:fs';
import {
  ensure,
  getContract,
  readJson,
  readText,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const system = readJson(
  'apps/web/src/design-system/analytics-system-v1.json',
);
const contract = getContract();
const entries = new Map(
  contract.entries.map((entry) => [
    entry.id,
    entry,
  ]),
);

function ensureArrayIncludes(
  values,
  expected,
  message,
) {
  ensure(
    Array.isArray(values)
      && values.includes(expected),
    message,
  );
}

function ensureArrayExcludes(
  values,
  unexpected,
  message,
) {
  ensure(
    !Array.isArray(values)
      || !values.includes(unexpected),
    message,
  );
}

ensure(
  system.stage === 'A15.6',
  'Analytics System must declare stage A15.6.',
);

ensure(
  system.status === 'accepted',
  'Analytics System A15.6 must be accepted after the section 15 visual scan.',
);

ensure(
  system.chartEngine === 'recharts',
  'Analytics System must declare Recharts as the chart geometry engine.',
);

const expectedRuntimeOwners = [
  ['ChartFrame', '15.01'],
  ['MetricCard', '15.02'],
  ['TrendChart', '15.03'],
  ['ComparisonChart', '15.04'],
  ['ShareChart', '15.05'],
  ['CorrelationChart', '15.06'],
  ['ForecastChart', '15.07'],
  ['ChartDataState', '15.08'],
  ['ChartInteractionLayer', '15.09'],
];

ensure(
  system.entries.length === expectedRuntimeOwners.length,
  'Analytics System A15.6 must contain exactly 15.01-15.09 runtime owners.',
);

for (const item of system.entries) {
  for (const path of [
    item.runtime,
    item.story,
    item.fixture,
  ]) {
    ensure(
      existsSync(resolveFromRoot(path)),
      `${item.id}: missing ${path}`,
    );
  }

  const entry = entries.get(item.id);

  ensure(
    entry?.storyStatus === 'implemented',
    `${item.id}: Storybook contract must be implemented.`,
  );

  ensure(
    entry?.storyVisibility === 'visible',
    `${item.id}: story must be visible.`,
  );

  ensure(
    entry?.accepted === true,
    `${item.id}: Storybook visual acceptance status drift.`,
  );

  ensure(
    entry?.owner === 'Analytics UI',
    `${item.id}: Analytics UI must own the story.`,
  );
}

ensure(
  Array.isArray(system.qualityGates),
  'Analytics System A15.6 must declare quality gates.',
);

const finalA11yGate = system.qualityGates.find((gate) => (
  gate.id === '15.10'
));

ensure(
  finalA11yGate?.name === 'Responsywność i dostępność',
  '15.10 quality gate must be declared explicitly.',
);

for (const path of [
  finalA11yGate?.story,
  finalA11yGate?.fixture,
]) {
  ensure(
    typeof path === 'string'
      && existsSync(resolveFromRoot(path)),
    `15.10: missing ${path}`,
  );
}

const finalA11yEntry = entries.get('15.10');

ensure(
  finalA11yEntry?.storyStatus === 'implemented',
  '15.10: Storybook contract must be implemented.',
);

ensure(
  finalA11yEntry?.storyVisibility === 'visible',
  '15.10: story must be visible.',
);

ensure(
  finalA11yEntry?.accepted === true,
  '15.10: final pass must be accepted after visual acceptance.',
);

const runtimeRegistry = readText(
  'rejestry/runtime-component-api.csv',
);

for (const [
  component,
  storyId,
] of expectedRuntimeOwners) {
  const row = runtimeRegistry
    .split('\n')
    .find((line) => (
      line.startsWith(`${component},`)
    ));

  ensure(
    row?.includes(
      `,${storyId},accepted,Analytics UI`,
    ),
    `${component}: runtime registry ownership/status drift.`,
  );
}

const storybookRegistry = readText(
  'rejestry/storybook.csv',
);

const chartFrameEntry = entries.get('15.01');
const metricCardEntry = entries.get('15.02');
const dataSurfaceLaboratoryEntry = entries.get('05.03');

for (const promoted of [
  'data states promoted to 15.08',
  'interactions and filters promoted to 15.09',
  'final responsive/a11y pass promoted to 15.10',
]) {
  ensureArrayIncludes(
    dataSurfaceLaboratoryEntry?.requirements,
    promoted,
    `05.03: missing promoted owner handoff: ${promoted}`,
  );
}

ensureArrayExcludes(
  dataSurfaceLaboratoryEntry?.requirements,
  'remaining data-state decisions',
  '05.03: data states must not remain an open decision after 15.08.',
);

for (const [
  entry,
  marker,
] of [
  [
    chartFrameEntry,
    'ready/partial/loading/noData',
  ],
  [
    metricCardEntry,
    'loading/noData/stale',
  ],
]) {
  ensureArrayIncludes(
    entry?.requirements,
    marker,
    `${entry?.id}: contract must promote canonical loading.`,
  );

  ensureArrayIncludes(
    entry?.requirements,
    'processing legacy alias for loading',
    `${entry?.id}: contract must keep processing only as a legacy alias.`,
  );
}

for (const [
  fixturePath,
  fixtureId,
] of [
  [
    'fixtures/storybook/094-15-01-chartframe.json',
    'SB-094',
  ],
  [
    'fixtures/storybook/096-15-02-metriccard.json',
    'SB-096',
  ],
]) {
  const fixture = readJson(fixturePath);

  ensureArrayIncludes(
    fixture.states,
    'loading',
    `${fixtureId}: fixture must use canonical loading.`,
  );

  ensureArrayIncludes(
    fixture.states,
    'legacyAliasProcessing',
    `${fixtureId}: fixture must document processing as legacy alias.`,
  );

  ensureArrayExcludes(
    fixture.states,
    'processing',
    `${fixtureId}: fixture states must not promote processing as canonical.`,
  );
}

for (const [
  title,
  expectedStates,
] of [
  [
    '15 Wykresy i dane/01 Powierzchnie analityczne/ChartFrame',
    'ready|partial|loading|noData|legacyAliasProcessing',
  ],
  [
    '15 Wykresy i dane/01 Powierzchnie analityczne/MetricCard',
    'ready|partial|stale|loading|noData|legacyAliasProcessing',
  ],
]) {
  const row = storybookRegistry
    .split('\n')
    .find((line) => (
      line.startsWith(`${title},`)
    ));

  ensure(
    row?.includes(expectedStates),
    `${title}: registry must use canonical loading and explicit processing alias.`,
  );
}

for (const title of [
  '15 Wykresy i dane/01 Powierzchnie analityczne/ChartFrame',
  '15 Wykresy i dane/01 Powierzchnie analityczne/MetricCard',
  '15 Wykresy i dane/02 Rodziny wykresów/Trendy',
  '15 Wykresy i dane/02 Rodziny wykresów/Porównania',
  '15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura',
  '15 Wykresy i dane/02 Rodziny wykresów/Zależności i korelacje',
  '15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI',
  '15 Wykresy i dane/03 Stany i interakcje/Stany danych',
  '15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry',
  '15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność',
]) {
  const rows = storybookRegistry
    .split('\n')
    .filter((line) => (
      line.startsWith(`${title},`)
    ));

  ensure(
    rows.length === 1,
    `${title}: expected exactly one Storybook registry owner.`,
  );

  ensure(
    rows[0]?.includes(
      ',implemented,',
    ),
    `${title}: Storybook registry status drift.`,
  );
}

const correlationLegacyRows = storybookRegistry
  .split('\n')
  .filter((line) => (
    line.startsWith('10 Komponenty/CorrelationChart,')
  ));

ensure(
  correlationLegacyRows.length === 1,
  '10 Komponenty/CorrelationChart: expected one degraded handoff row.',
);

ensure(
  correlationLegacyRows[0]?.includes(',deprecated,')
    && correlationLegacyRows[0]?.includes(
      'promoted-to-15-06-runtime-owner',
    ),
  '10 Komponenty/CorrelationChart must be degraded to 15.06 handoff.',
);

const forecastLegacyRows = storybookRegistry
  .split('\n')
  .filter((line) => (
    line.startsWith('10 Komponenty/ForecastChart,')
  ));

ensure(
  forecastLegacyRows.length === 1,
  '10 Komponenty/ForecastChart: expected one degraded handoff row.',
);

ensure(
  forecastLegacyRows[0]?.includes(',deprecated,')
    && forecastLegacyRows[0]?.includes(
      'legacyHidden|promotedTo15_07|handoff',
    )
    && forecastLegacyRows[0]?.includes(
      'verify-legacy-story-hidden|verify-no-legacy-story-owner|verify-15-07-runtime-owner',
    )
    && forecastLegacyRows[0]?.includes(
      'handoff-to-15-07-runtime-owner',
    ),
  '10 Komponenty/ForecastChart must be degraded to 15.07 handoff.',
);

const forecastLegacyFixture = readJson(
  'fixtures/storybook/059-forecastchart.json',
);

for (const state of [
  'legacyHidden',
  'promotedTo15_07',
  'handoff',
]) {
  ensureArrayIncludes(
    forecastLegacyFixture.states,
    state,
    `SB-059 legacy ForecastChart fixture missing state: ${state}`,
  );
}

for (const step of [
  'verify-legacy-story-hidden',
  'verify-no-legacy-story-owner',
  'verify-15-07-runtime-owner',
]) {
  ensureArrayIncludes(
    forecastLegacyFixture.playSteps,
    step,
    `SB-059 legacy ForecastChart fixture missing play step: ${step}`,
  );
}

ensureArrayExcludes(
  forecastLegacyFixture.a11y,
  'live-region',
  'SB-059 legacy ForecastChart fixture must not require a live region.',
);

ensure(
  forecastLegacyFixture.implementationStatus === 'handoff-to-15-07-runtime-owner',
  'SB-059 legacy ForecastChart fixture must be a 15.07 handoff, not a runtime owner.',
);

const forecastFixture = readJson(
  'fixtures/storybook/098-15-07-prognoza-i-ai.json',
);

for (const state of [
  'ready',
  'actual',
  'forecast',
  'uncertaintyBand',
  'confidence',
  'quality',
  'staticScenarios',
  'alternativeTable',
  'longCopy',
  'forecastNotFact',
  'handoff15_08',
  'handoff15_09',
  'handoff15_10',
]) {
  ensureArrayIncludes(
    forecastFixture.states,
    state,
    `SB-098 ForecastChart fixture missing state: ${state}`,
  );
}

for (const step of [
  'verify-chartframe-composition',
  'verify-actual-forecast-split',
  'verify-uncertainty-band',
  'verify-confidence-copy',
  'verify-quality-copy',
  'verify-static-scenarios',
  'verify-alternative-table',
  'verify-forecast-not-fact',
  'verify-no-recharts-tooltip',
  'verify-no-15-09-interaction',
  'verify-15-08-15-09-15-10-handoff',
]) {
  ensureArrayIncludes(
    forecastFixture.playSteps,
    step,
    `SB-098 ForecastChart fixture missing play step: ${step}`,
  );
}

for (const assertion of [
  'uncertainty-band-visible',
  'axis-and-legend-readable',
  'alternative-table-affordance-visible',
  'no-horizontal-page-scroll',
  'no-runtime-owner-duplication',
]) {
  ensureArrayIncludes(
    forecastFixture.visualAssertions,
    assertion,
    `SB-098 ForecastChart fixture missing visual assertion: ${assertion}`,
  );
}

ensureArrayIncludes(
  forecastFixture.a11y,
  'alternative-table',
  'SB-098 ForecastChart fixture must require an alternative table.',
);

ensureArrayExcludes(
  forecastFixture.a11y,
  'live-region',
  'SB-098 ForecastChart fixture must not require a live region.',
);

ensure(
  forecastFixture.implementationStatus === 'implemented-passing-static-contract',
  'SB-098 ForecastChart fixture must be accepted after visual acceptance.',
);

const dataStatesFixture = readJson(
  'fixtures/storybook/100-15-08-stany-danych.json',
);

for (const state of [
  'loading',
  'empty',
  'noData',
  'partial',
  'stale',
  'delayed',
  'blocked',
  'error',
  'unavailable',
  'sharedStateLanguage',
  'noPerChartStates',
]) {
  ensureArrayIncludes(
    dataStatesFixture.states,
    state,
    `SB-100 data states fixture missing state: ${state}`,
  );
}

for (const step of [
  'verify-loading-state',
  'verify-empty-state',
  'verify-no-data-state',
  'verify-partial-state',
  'verify-stale-state',
  'verify-delayed-state',
  'verify-blocked-state',
  'verify-error-state',
  'verify-unavailable-state',
  'verify-shared-chartframe-state-system',
]) {
  ensureArrayIncludes(
    dataStatesFixture.playSteps,
    step,
    `SB-100 data states fixture missing play step: ${step}`,
  );
}

ensureArrayIncludes(
  dataStatesFixture.a11y,
  'live-region',
  'SB-100 data states fixture must require a live region.',
);

ensure(
  dataStatesFixture.implementationStatus === 'implemented-passing-state-system',
  'SB-100 data states fixture must be implemented as accepted state system.',
);

const interactionFixture = readJson(
  'fixtures/storybook/095-15-09-interakcje-i-filtry.json',
);

for (const state of [
  'tooltip',
  'hover',
  'keyboardFocus',
  'selection',
  'dateRange',
  'reset',
  'drillDown',
  'crossFiltering',
  'emptyPointsGuard',
  'doesNotChangeDataMeaning',
]) {
  ensureArrayIncludes(
    interactionFixture.states,
    state,
    `SB-095 interaction fixture missing state: ${state}`,
  );
}

for (const step of [
  'exercise-filter-change',
  'exercise-hover-focus-tooltip',
  'exercise-point-selection',
  'exercise-reset',
  'exercise-drill-down',
  'verify-focus-restoration',
  'verify-empty-points-guard',
  'verify-keyboard-only',
  'verify-data-semantics-unchanged',
]) {
  ensureArrayIncludes(
    interactionFixture.playSteps,
    step,
    `SB-095 interaction fixture missing play step: ${step}`,
  );
}

for (const assertion of [
  'focus-ring-visible',
  'interactive-controls-do-not-reflow-chart',
  'no-horizontal-page-scroll',
]) {
  ensureArrayIncludes(
    interactionFixture.visualAssertions,
    assertion,
    `SB-095 interaction fixture missing visual assertion: ${assertion}`,
  );
}

for (const a11y of [
  'keyboard-only',
  'focus-visible',
  'aria-pressed',
  'tooltip-describedby',
]) {
  ensureArrayIncludes(
    interactionFixture.a11y,
    a11y,
    `SB-095 interaction fixture missing a11y marker: ${a11y}`,
  );
}

ensure(
  interactionFixture.implementationStatus === 'implemented-passing-interaction-system',
  'SB-095 interaction fixture must be implemented as accepted interaction system.',
);

const finalPassFixture = readJson(
  'fixtures/storybook/099-15-10-responsywnosc-i-dostepnosc.json',
);

for (const state of [
  'desktop',
  'tablet',
  'mobile',
  'light',
  'dark',
  'longCopy',
  'legend',
  'contrast',
  'alternativeDataDescription',
  'noNewFeatures',
  'section15OwnerMatrix',
]) {
  ensureArrayIncludes(
    finalPassFixture.states,
    state,
    `SB-099 final pass fixture missing state: ${state}`,
  );
}

for (const step of [
  'verify-owner-matrix-15-01-to-15-09',
  'verify-desktop-tablet-mobile-copy',
  'verify-light-dark-copy',
  'verify-long-copy-reflow',
  'verify-legend-readable',
  'verify-alternative-data-description',
  'verify-no-new-features',
]) {
  ensureArrayIncludes(
    finalPassFixture.playSteps,
    step,
    `SB-099 final pass fixture missing play step: ${step}`,
  );
}

ensureArrayIncludes(
  finalPassFixture.a11y,
  'alternative-table',
  'SB-099 final pass fixture must require an alternative table.',
);

ensure(
  finalPassFixture.implementationStatus === 'implemented-passing-final-responsive-a11y-pass',
  'SB-099 final pass fixture must be implemented as accepted final responsive/a11y pass.',
);

for (const legacy of [
  '10 Komponenty/ChartFrame,',
  '10 Komponenty/MetricCard,',
  '10 Komponenty/TrendChart,',
  '10 Komponenty/ComparisonChart,',
  '10 Komponenty/ShareChart,',
  '15 Wykresy i dane/ChartFrame,',
  '15 Wykresy i dane/MetricCard,',
  '15 Wykresy i dane/Trendy,',
  '15 Wykresy i dane/Porównania,',
  '15 Wykresy i dane/Struktura i udział,',
  '15 Wykresy i dane/Udziały i struktura,',
  '15 Wykresy i dane/Zależności i korelacje,',
  '15 Wykresy i dane/Prognoza i AI,',
  '15 Wykresy i dane/Stany danych,',
  '15 Wykresy i dane/Interakcje i filtry,',
  '15 Wykresy i dane/Responsywność i dostępność,',
  '15 Wykresy i wizualizacje danych/ChartFrame,',
  '15 Wykresy i wizualizacje danych/MetricCard,',
  '15 Wykresy i wizualizacje danych/Trendy,',
  '15 Wykresy i wizualizacje danych/Porównania,',
  '15 Wykresy i wizualizacje danych/Struktura i udział,',
  '15 Wykresy i wizualizacje danych/Udziały i struktura,',
  '15 Wykresy i wizualizacje danych/Zależności i korelacje,',
  '15 Wykresy i wizualizacje danych/Prognoza i AI,',
  '15 Wykresy i wizualizacje danych/Stany danych,',
  '15 Wykresy i wizualizacje danych/Interakcje i filtry,',
  '15 Wykresy i wizualizacje danych/Responsywność i dostępność,',
]) {
  ensure(
    !storybookRegistry.includes(legacy),
    `Legacy duplicate Storybook owner remains: ${legacy}`,
  );
}

for (const legacyFixture of [
  'fixtures/storybook/091-trendchart.json',
  'fixtures/storybook/045-comparisonchart.json',
  'fixtures/storybook/080-sharechart.json',
]) {
  ensure(
    !existsSync(
      resolveFromRoot(legacyFixture),
    ),
    `Legacy fixture must remain removed: ${legacyFixture}`,
  );
}

const componentIndex = readText(
  'apps/web/src/design-system/components/index.ts',
);

for (const marker of [
  'ChartFrame',
  'ChartFrameProps',
  'ChartDataState',
  'ChartDataStateProps',
  'ChartInteractionLayer',
  'ChartInteractionLayerProps',
  'MetricCard',
  'MetricCardProps',
  'TrendChart',
  'TrendChartProps',
  'ComparisonChart',
  'ComparisonChartProps',
  'ShareChart',
  'ShareChartProps',
  'CorrelationChart',
  'CorrelationChartProps',
  'ForecastChart',
  'ForecastChartProps',
]) {
  ensure(
    componentIndex.includes(marker),
    `Component index missing ${marker}.`,
  );
}

for (const [
  path,
  marker,
] of [
  [
    'contracts/components/chartframe.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/chartdatastate.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/chartinteractionlayer.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/metriccard.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/trendchart.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/comparisonchart.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/sharechart.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/correlationchart.ts',
    'Orchestration contract',
  ],
  [
    'contracts/components/forecastchart.ts',
    'Orchestration contract',
  ],
]) {
  ensure(
    readText(path).includes(marker),
    `${path}: runtime/orchestration ownership is not explicit.`,
  );
}

const forecastContract = readText(
  'contracts/components/forecastchart.ts',
);

for (const marker of [
  'Partial<ForecastChartLabels>',
  'unit?: string | null',
]) {
  ensure(
    forecastContract.includes(marker),
    `contracts/components/forecastchart.ts missing ${marker}.`,
  );
}

const trendRuntime = readText(
  'apps/web/src/design-system/components/TrendChart/TrendChart.tsx',
);

for (const marker of [
  "from 'recharts'",
  'ComposedChart',
  'ResponsiveContainer',
  'accessibilityLayer',
  'actual',
  'plan',
  'previousPeriod',
  'movingAverage',
  'ChartCrosshairTooltip',
]) {
  ensure(
    trendRuntime.includes(marker),
    `TrendChart runtime missing ${marker}.`,
  );
}

ensure(
  !trendRuntime.includes('<svg'),
  'TrendChart must not reimplement a raw SVG chart engine.',
);

const comparisonRuntime = readText(
  'apps/web/src/design-system/components/ComparisonChart/ComparisonChart.tsx',
);

for (const marker of [
  "from 'recharts'",
  'Bar',
  'BarChart',
  'ReferenceLine',
  'ResponsiveContainer',
  'accessibilityLayer',
  "'grouped'",
  "'ranking'",
  'benchmark',
  'ChartMarkTooltip',
]) {
  ensure(
    comparisonRuntime.includes(marker),
    `ComparisonChart runtime missing ${marker}.`,
  );
}

ensure(
  !comparisonRuntime.includes('<svg'),
  'ComparisonChart must not reimplement a raw SVG chart engine.',
);

ensure(
  comparisonRuntime.includes("from '../ChartTooltip'"),
  '15.04 must consume the shared 15.09 chart tooltip contract.',
);

const shareRuntime = readText(
  'apps/web/src/design-system/components/ShareChart/ShareChart.tsx',
);

for (const marker of [
  "from 'recharts'",
  'PieChart',
  'BarChart',
  'Pie',
  'Bar',
  'Cell',
  'ResponsiveContainer',
  'accessibilityLayer',
  "'donut'",
  "'bar'",
  "'stacked'",
  'segments',
  'ChartMarkTooltip',
]) {
  ensure(
    shareRuntime.includes(marker),
    `ShareChart runtime missing ${marker}.`,
  );
}

ensure(
  !shareRuntime.includes('<svg'),
  'ShareChart must not reimplement a raw SVG chart engine.',
);

ensure(
  shareRuntime.includes("from '../ChartTooltip'"),
  '15.05 must consume the shared 15.09 chart tooltip contract.',
);

const correlationRuntime = readText(
  'apps/web/src/design-system/components/CorrelationChart/CorrelationChart.tsx',
);

for (const marker of [
  "from 'recharts'",
  'ScatterChart',
  'Scatter',
  'ReferenceLine',
  'ReferenceArea',
  'ResponsiveContainer',
  'accessibilityLayer',
  "'scatter'",
  "'relationship'",
  "'driver-analysis'",
  'driver-hypothesis',
  'noCausality',
  'ChartMarkTooltip',
]) {
  ensure(
    correlationRuntime.includes(marker),
    `CorrelationChart runtime missing ${marker}.`,
  );
}

ensure(
  !correlationRuntime.includes('<svg'),
  'CorrelationChart must not reimplement a raw SVG chart engine.',
);

ensure(
  correlationRuntime.includes("from '../ChartTooltip'"),
  '15.06 must consume the shared 15.09 chart tooltip contract.',
);

const forecastRuntime = readText(
  'apps/web/src/design-system/components/ForecastChart/ForecastChart.tsx',
);

for (const marker of [
  "from 'recharts'",
  'ComposedChart',
  'Line',
  'Area',
  'ReferenceLine',
  'ResponsiveContainer',
  'accessibilityLayer',
  'actual',
  'forecast',
  'lowerBound',
  'upperBound',
  'confidence',
  'horizonLabel',
  'unit',
  'quality',
  'scenarios',
  'forecastDisclaimer',
]) {
  ensure(
    forecastRuntime.includes(marker),
    `ForecastChart runtime missing ${marker}.`,
  );
}

ensure(
  !forecastRuntime.includes('<svg'),
  'ForecastChart must not reimplement a raw SVG chart engine.',
);

ensure(
  !forecastRuntime.includes('Tooltip'),
  '15.07 must not take tooltip ownership from 15.09.',
);

const chartDataStateRuntime = readText(
  'apps/web/src/design-system/components/ChartDataState/ChartDataState.tsx',
);

for (const marker of [
  'ChartDataState',
  'loading',
  'empty',
  'noData',
  'partial',
  'stale',
  'delayed',
  'blocked',
  'error',
  'unavailable',
  'aria-live',
  'role={assertive ?',
  'Skeleton',
]) {
  ensure(
    chartDataStateRuntime.includes(marker),
    `ChartDataState runtime missing ${marker}.`,
  );
}

const chartFrameRuntime = readText(
  'apps/web/src/design-system/components/ChartFrame/ChartFrame.tsx',
);

ensure(
  chartFrameRuntime.includes('ChartDataState'),
  'ChartFrame must consume the shared 15.08 ChartDataState runtime.',
);

const chartInteractionRuntime = readText(
  'apps/web/src/design-system/components/ChartInteractionLayer/ChartInteractionLayer.tsx',
);

for (const marker of [
  'ChartInteractionLayer',
  'role="tooltip"',
  'role="group"',
  'onMouseEnter',
  'onFocus',
  'aria-pressed',
  'dateRangeLabel',
  'onReset',
  'onDrillDown',
  'crossFilter',
  'emptySelection',
  'hasPoints',
  'data-state="empty-points"',
]) {
  ensure(
    chartInteractionRuntime.includes(marker),
    `ChartInteractionLayer runtime missing ${marker}.`,
  );
}

ensure(
  !chartInteractionRuntime.includes('role="toolbar"'),
  'ChartInteractionLayer must not declare role="toolbar" without a toolbar keyboard model.',
);

const webPackage = readJson(
  'apps/web/package.json',
);

ensure(
  Boolean(
    webPackage.dependencies?.recharts,
  ),
  'Web package must depend on Recharts.',
);

ensure(
  Boolean(
    webPackage.dependencies?.['react-is'],
  ),
  'React 19 chart stack must declare react-is explicitly.',
);

const lab = readText(
  'apps/web/src/storybook-next/stories/05-surfaces/DataSurfaceLaboratory.tsx',
);

ensure(
  !lab.includes('function ChartFrame('),
  '05.03 must not keep a local ChartFrame implementation.',
);

ensure(
  !lab.includes('KpiSparkline'),
  '05.03 must not keep a local KPI sparkline implementation.',
);

ensure(
  !lab.includes('DataSurfaceSelect'),
  '05.03 must not keep a local Select implementation.',
);

ensure(
  !lab.includes('<table'),
  '05.03 must not keep a local table engine.',
);

ensure(
  lab.includes('<DataTable'),
  '05.03 must consume the canonical DataTable.',
);

ensure(
  lab.includes(
    'resolveAnalyticsDataStateTone',
  ),
  '05.03 must consume the canonical analytics status mapping.',
);

for (const handoff of [
  '15.01',
  '15.02',
  '15.03',
  '15.04',
  '15.05',
  '15.06',
  '15.07',
  '15.08',
  '15.09',
  '15.10',
]) {
  ensure(
    lab.includes(handoff),
    `05.03 missing analytics handoff ${handoff}.`,
  );
}

for (const legacyName of [
  "name: 'TrendChart'",
  "name: 'ComparisonChart'",
  "name: 'ShareChart'",
  "name: 'CorrelationChart'",
  "name: 'ForecastChart'",
]) {
  ensure(
    !lab.includes(legacyName),
    `05.03 must not keep local chart catalogue owner: ${legacyName}`,
  );
}

for (const legacyGeometry of [
  "kind === 'trend'",
  "kind === 'comparison'",
  "kind === 'share'",
  "kind === 'correlation'",
  "kind === 'forecast'",
]) {
  ensure(
    !lab.includes(legacyGeometry),
    `05.03 must not keep local chart geometry: ${legacyGeometry}`,
  );
}

ensure(
  !existsSync(
    resolveFromRoot(
      'apps/web/src/storybook-next/stories/05-surfaces/KpiSparkline.tsx',
    ),
  ),
  'Legacy KpiSparkline file must remain removed.',
);

ensure(
  !existsSync(
    resolveFromRoot(
      'apps/web/src/storybook-next/stories/05-surfaces/DataSurfaceSelect.tsx',
    ),
  ),
  'Legacy DataSurfaceSelect file must remain removed.',
);

for (const path of [
  'apps/web/src/storybook-next/stories/15-data-visualizations/ChartFrame.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/MetricCard.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/TrendChart.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/ComparisonChart.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/ShareChart.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/CorrelationChart.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/ForecastChart.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/DataStates.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/ChartInteractions.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/ChartAccessibilityReview.stories.tsx',
]) {
  const source = readText(path);

  ensure(
    source.includes(
      'presentation/story-presentation.css',
    ),
    `${path}: must use canonical StoryPresentation.`,
  );
}

const comparisonStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/ComparisonChart.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/02 Rodziny wykresów/Porównania'",
  'TrendChart',
  'DataTable',
  'Small multiples',
  'negative values',
]) {
  ensure(
    comparisonStory.includes(marker),
    `15.04 story missing decision/evidence marker: ${marker}`,
  );
}

const shareStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/ShareChart.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/02 Rodziny wykresów/Udziały i struktura'",
  'ComparisonChart',
  'TrendChart',
  'DataTable',
  'negative values',
]) {
  ensure(
    shareStory.includes(marker),
    `15.05 story missing decision/evidence marker: ${marker}`,
  );
}

const correlationStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/CorrelationChart.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/02 Rodziny wykresów/Zależności i korelacje'",
  'scatter plot',
  'relationship chart',
  'driver analysis',
  'driver hypothesis',
  'outlier',
  'cluster',
  'Korelacja i driver hypothesis nie są dowodem przyczynowości.',
  'TrendChart',
  'ComparisonChart',
  'DataTable',
  '15.07',
  '15.08',
  '15.09',
]) {
  ensure(
    correlationStory.includes(marker),
    `15.06 story missing decision/evidence marker: ${marker}`,
  );
}

const forecastStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/ForecastChart.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/02 Rodziny wykresów/Prognoza i AI'",
  'ForecastChart',
  'actual',
  'forecast',
  'lowerBound',
  'upperBound',
  'uncertainty',
  'confidence',
  'quality',
  'scenarios',
  'alternativeTable',
  'Tabela danych prognozy',
  'recharts-tooltip-wrapper',
  'Prognoza nie jest faktem.',
  '15.08',
  '15.09',
  '15.10',
  'Pewność zapytania',
  'Granica zakresu: scenariusze i jakość danych',
  'Podpowiedzi, wskazania po najechaniu',
]) {
  ensure(
    forecastStory.includes(marker),
    `15.07 story missing decision/evidence marker: ${marker}`,
  );
}

const dataStatesStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/DataStates.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/03 Stany i interakcje/Stany danych'",
  'ChartDataState',
  'ChartFrame',
  'loading',
  'empty',
  'noData',
  'partial',
  'stale',
  'delayed',
  'blocked',
  'error',
  'unavailable',
  'Jeden spójny system stanów',
  'Nie tworzymy osobnych stanów per wykres',
]) {
  ensure(
    dataStatesStory.includes(marker),
    `15.08 story missing decision/evidence marker: ${marker}`,
  );
}

const interactionStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/ChartInteractions.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry'",
  'ChartInteractionLayer',
  'tooltip',
  'hover',
  'focus z klawiatury',
  'selection',
  'date range',
  'reset',
  'drill-down',
  'cross-filtering',
  'Focus restoration',
  'Guard pustych punktów',
  'Brak punktów interakcji',
  'nie zmienia sensu danych',
  '15.03–15.07',
]) {
  ensure(
    interactionStory.includes(marker),
    `15.09 story missing decision/evidence marker: ${marker}`,
  );
}

const finalPassStory = readText(
  'apps/web/src/storybook-next/stories/15-data-visualizations/ChartAccessibilityReview.stories.tsx',
);

for (const marker of [
  "title: '15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność'",
  'desktop / tablet / mobile',
  'light / dark',
  'długie legendy bez poziomego scrolla',
  'alternatywny opis danych',
  'nie dodaje nowych funkcji',
  '15.08 ChartDataState',
  '15.09 ChartInteractionLayer',
]) {
  ensure(
    finalPassStory.includes(marker),
    `15.10 story missing decision/evidence marker: ${marker}`,
  );
}

for (const [
  path,
  markers,
] of [
  [
    'docs/specyfikacja-docelowa/05-wykresy-i-wizualizacje/15-08-stany-danych.md',
    [
      'WDROŻONE W STORYBOOK — ACCEPTED',
      '`15 Wykresy i dane/03 Stany i interakcje/Stany danych`',
      'kanoniczny stan trwającego pobierania to `loading`',
      '`processing` pozostaje wyłącznie legacy aliasem',
      'nie tworzy lokalnych stanów',
    ],
  ],
  [
    'docs/specyfikacja-docelowa/05-wykresy-i-wizualizacje/15-09-interakcje-i-filtry.md',
    [
      'WDROŻONE W STORYBOOK — ACCEPTED',
      '`15 Wykresy i dane/03 Stany i interakcje/Interakcje i filtry`',
      '`role="group"`',
      'focus restoration',
      'pusta tablica punktów nie crashuje runtime',
    ],
  ],
  [
    'docs/specyfikacja-docelowa/05-wykresy-i-wizualizacje/15-10-responsywnosc-i-dostepnosc.md',
    [
      'WDROŻONE W STORYBOOK — ACCEPTED QUALITY GATE',
      '`15 Wykresy i dane/04 Jakość prezentacji/Responsywność i dostępność`',
      'Nie dodaje nowych funkcji',
      'owner matrix 15.01–15.09',
    ],
  ],
]) {
  const source = readText(path);

  ensure(
    !source.includes('15 Wykresy i wizualizacje danych/'),
    `${path}: must not keep legacy Storybook title.`,
  );

  ensure(
    !source.includes('WYMAGA IMPLEMENTACJI'),
    `${path}: implementation status is stale.`,
  );

  for (const marker of markers) {
    ensure(
      source.includes(marker),
      `${path}: missing current source marker: ${marker}`,
    );
  }
}

console.log(
  'Analytics System A15.6 OK: section 15 visual acceptance is synchronized across runtime owners, fixtures and registries.',
);
