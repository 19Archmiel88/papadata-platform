import { existsSync } from 'node:fs';
import {
  ensure,
  getContract,
  readJson,
  readText,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const system = readJson('apps/web/src/design-system/analytics-system-v1.json');
const contract = getContract();
const entries = new Map(contract.entries.map((entry) => [entry.id, entry]));

ensure(system.stage === 'A15.1', 'Analytics System must declare stage A15.1.');
ensure(system.status === 'review', '15.01-15.02 must remain review until visual acceptance.');

for (const item of system.entries) {
  for (const path of [item.runtime, item.story, item.fixture]) {
    ensure(existsSync(resolveFromRoot(path)), `${item.id}: missing ${path}`);
  }
  const entry = entries.get(item.id);
  ensure(entry?.storyStatus === 'implemented', `${item.id}: Storybook contract must be implemented.`);
  ensure(entry?.storyVisibility === 'visible', `${item.id}: story must be visible.`);
  ensure(entry?.accepted === false, `${item.id}: visual acceptance must remain false.`);
  ensure(entry?.owner === 'Analytics UI', `${item.id}: Analytics UI must own the story.`);
}

const runtime = readText('rejestry/runtime-component-api.csv');
for (const [component, storyId] of [['ChartFrame', '15.01'], ['MetricCard', '15.02']]) {
  const row = runtime.split('\n').find((line) => line.startsWith(`${component},`));
  ensure(row?.includes(`,${storyId},review,Analytics UI`), `${component}: runtime registry ownership/status drift.`);
}

const registry = readText('rejestry/storybook.csv');
for (const title of ['15 Wykresy i dane/ChartFrame', '15 Wykresy i dane/MetricCard']) {
  const rows = registry.split('\n').filter((line) => line.startsWith(`${title},`));
  ensure(rows.length === 1, `${title}: expected exactly one Storybook registry owner.`);
  ensure(rows[0]?.includes(',review,'), `${title}: registry must remain review.`);
}
for (const legacy of [
  '10 Komponenty/ChartFrame,',
  '10 Komponenty/MetricCard,',
  '15 Wykresy i wizualizacje danych/ChartFrame,',
  '15 Wykresy i wizualizacje danych/MetricCard,',
]) {
  ensure(!registry.includes(legacy), `Legacy duplicate Storybook owner remains: ${legacy}`);
}

const componentIndex = readText('apps/web/src/design-system/components/index.ts');
for (const marker of ['ChartFrame', 'ChartFrameProps', 'MetricCard', 'MetricCardProps']) {
  ensure(componentIndex.includes(marker), `Component index missing ${marker}.`);
}

for (const [path, marker] of [
  ['contracts/components/chartframe.ts', 'Orchestration contract'],
  ['contracts/components/metriccard.ts', 'Orchestration contract'],
]) {
  ensure(readText(path).includes(marker), `${path}: runtime/orchestration ownership is not explicit.`);
}

const lab = readText('apps/web/src/storybook-next/stories/05-surfaces/DataSurfaceLaboratory.tsx');
ensure(!lab.includes('function ChartFrame('), '05.03 must not keep a local ChartFrame implementation.');
ensure(!lab.includes('KpiSparkline'), '05.03 must not keep a local KPI sparkline implementation.');
ensure(!lab.includes('DataSurfaceSelect'), '05.03 must not keep a local Select implementation.');
ensure(!lab.includes('<table'), '05.03 must not keep a local table engine.');
ensure(lab.includes('<DataTable'), '05.03 must consume the canonical DataTable.');
ensure(lab.includes('resolveAnalyticsDataStateTone'), '05.03 must consume the canonical analytics status mapping.');
ensure(lab.includes('15.01') && lab.includes('15.02'), '05.03 must declare both analytics handoffs.');
ensure(!existsSync(resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces/KpiSparkline.tsx')), 'Legacy KpiSparkline file must be removed.');
ensure(!existsSync(resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces/DataSurfaceSelect.tsx')), 'Legacy DataSurfaceSelect file must be removed.');

for (const path of [
  'apps/web/src/storybook-next/stories/15-data-visualizations/ChartFrame.stories.tsx',
  'apps/web/src/storybook-next/stories/15-data-visualizations/MetricCard.stories.tsx',
]) {
  const source = readText(path);
  ensure(source.includes('presentation/story-presentation.css'), `${path}: must use canonical StoryPresentation.`);
}

console.log('Analytics System A15.1 OK: ChartFrame + MetricCard have one runtime/story owner.');
