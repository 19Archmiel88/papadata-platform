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

ensure(
  system.stage === 'A15.5',
  'Analytics System must declare stage A15.5.',
);

ensure(
  system.status === 'review',
  'Analytics System A15.5 remains review until every entry is formally accepted.',
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
];

ensure(
  system.entries.length === expectedRuntimeOwners.length,
  'Analytics System A15.5 must contain exactly 15.01-15.06 runtime owners.',
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
]) {
  ensure(
    readText(path).includes(marker),
    `${path}: runtime/orchestration ownership is not explicit.`,
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

console.log(
  'Analytics System A15.5 OK: CorrelationChart 15.06 is the review owner of relationships and correlations; TrendChart 15.03 remains accepted.',
);
