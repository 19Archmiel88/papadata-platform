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
  system.status === 'review',
  'Analytics System A15.6 remains review until every entry is formally accepted.',
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
];

ensure(
  system.entries.length === expectedRuntimeOwners.length,
  'Analytics System A15.6 must contain exactly 15.01-15.07 runtime owners.',
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

  const expectedAccepted = (
    item.id === '15.03'
  );

  ensure(
    entry?.accepted === expectedAccepted,
    `${item.id}: Storybook visual acceptance status drift.`,
  );

  ensure(
    entry?.owner === 'Analytics UI',
    `${item.id}: Analytics UI must own the story.`,
  );
}

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

  const expectedStatus = (
    storyId === '15.03'
      ? 'accepted'
      : 'review'
  );

  ensure(
    row?.includes(
      `,${storyId},${expectedStatus},Analytics UI`,
    ),
    `${component}: runtime registry ownership/status drift.`,
  );
}

const storybookRegistry = readText(
  'rejestry/storybook.csv',
);

for (const title of [
  '15 Wykresy i dane/ChartFrame',
  '15 Wykresy i dane/MetricCard',
  '15 Wykresy i dane/Trendy',
  '15 Wykresy i dane/Porównania',
  '15 Wykresy i dane/Udziały i struktura',
  '15 Wykresy i dane/Zależności i korelacje',
  '15 Wykresy i dane/Prognoza i AI',
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

  const expectedRegistryStatus = (
    title === '15 Wykresy i dane/Trendy'
      ? 'implemented'
      : 'review'
  );

  ensure(
    rows[0]?.includes(
      `,${expectedRegistryStatus},`,
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
  forecastFixture.implementationStatus === 'implemented-review-static-contract',
  'SB-098 ForecastChart fixture must remain review/static until visual acceptance.',
);

for (const legacy of [
  '10 Komponenty/ChartFrame,',
  '10 Komponenty/MetricCard,',
  '10 Komponenty/TrendChart,',
  '10 Komponenty/ComparisonChart,',
  '10 Komponenty/ShareChart,',
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
  'ComposedChart',
  'ReferenceLine',
  'ResponsiveContainer',
  'accessibilityLayer',
  "'grouped'",
  "'ranking'",
  'benchmark',
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
  !comparisonRuntime.includes('Tooltip'),
  '15.04 must not take tooltip ownership from 15.09.',
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
  !shareRuntime.includes('Tooltip'),
  '15.05 must not take tooltip ownership from 15.09.',
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
  !correlationRuntime.includes('Tooltip'),
  '15.06 must not take tooltip ownership from 15.09.',
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
  "title: '15 Wykresy i dane/Porównania'",
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
  "title: '15 Wykresy i dane/Udziały i struktura'",
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
  "title: '15 Wykresy i dane/Zależności i korelacje'",
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
  "title: '15 Wykresy i dane/Prognoza i AI'",
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

console.log(
  'Analytics System A15.6 OK: ForecastChart 15.07 is the review owner of forecast and AI semantics; TrendChart 15.03 remains accepted.',
);