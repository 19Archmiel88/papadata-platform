import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scannedRoot = 'apps/web/src';
const ignoredDirectories = new Set([
  'node_modules',
  'storybook-static',
  'dist',
  'build',
]);
const allowedDuplicatePrefixes = [
  'pd-f0-',
  'recharts-',
];
const allowedDuplicateClasses = new Set([
  'pd-brand-lockup',
  'pd-brand-lockup__mark',
  'pd-button',
  'pd-button__content',
  'pd-button__label',
  'pd-chart-interaction-layer',
  'pd-data-table',
  'pd-data-table__summary',
  'pd-form-control__meta',
  'pd-inline-action__content',
  'pd-product-shell',
  'pd-product-shell__body',
  'pd-product-shell__side-rail',
  'pd-product-shell__sidebar-column',
  'pd-s5-auth-matrix',
  'pd-s5-data-grid',
  'pd-s5-gradient-grid',
  'pd-s5-shell-grid',
  'pd-status-badge',
  'pd-status-badge__icon',
  'pd-storybook-canvas',
  'pd-tabs',
  'pd-tabs__list',
  // Intentional contextual styling: canonical components remain owned by their
  // design-system CSS; shell/screen CSS only scopes responsive/themed overrides.
  'pd-date-range-picker',
  'pd-date-range-picker__quick-options',
  'pd-brand-lockup__wordmark',
  'pd-overlay-root__viewport',
  'pd-shell-anchored-overlay__trigger',
  'pd-status-badge__dot',
  'pd-overlay-surface__body',
  'pd-metric-card',
  'pd-trend-chart',
  'pd-share-chart',
  'pd-comparison-chart',
  'pd-page-header__heading',
  'pd-page-header__meta',
  'pd-section-navigation__item',
  'pd-table__scroll',
  'pd-table__body',
  'pd-table__head',
  'pd-chart-frame-stage',
  'pd-chart-frame-canvas',
  'pd-chart-frame-canvas__base',
  'pd-chart-frame-canvas__support',
  'pd-chart-interaction-layer__header',
  'pd-chart-interaction-layer__body',
  'pd-chart-interaction-layer__visualization',
  'pd-chart-interaction-layer__panel',
  'pd-chart-interaction-layer__selection',
  'pd-chart-interaction-layer__tooltip',
  'pd-metric-card__sparkline',
  // Intentional contextual overrides: scoped under .pd-command-center-one-page__metric--primary
  // and .pd-command-center-one-page__priority-surface / __supporting-strip selectors.
  'pd-metric-card__shadow-bars',
  'pd-metric-card__header',
  'pd-metric-card__value-region',
  'pd-metric-card__value',
  'pd-metric-card__comparison',
  // Command Center KPI grid needs a 2-column value|sparkline layout compact
  // density doesn't offer — grid-area placement plus label color/metadata
  // separator are set from command-center-one-page.css; everything else
  // (sizing/spacing) is left to MetricCard's own density='compact' CSS.
  'pd-metric-card__label',
  'pd-metric-card__benchmarks',
  'pd-metric-card__metadata',
  'pd-spinner',
  'pd-skeleton',
  'pd-skeleton__line',
  // command-center-vivid.css is a deliberately separate "visual layer" file
  // (color/glass/glow) kept apart from command-center-one-page.css's
  // structural layout so it can be reverted independently — see its own
  // file header. It intentionally re-opens the same selectors to layer
  // additional declarations, not to fight the structural ones.
  'pd-command-center-workspace',
  'pd-command-center-one-page',
  'pd-command-center-one-page__section',
  'pd-command-center-one-page__runtime-side-panel',
  'pd-command-center-one-page__runway-stats',
  'pd-command-center-one-page__visit-digest',
  'pd-command-center-one-page__attention-card',
  'pd-command-center-one-page__attention-card-diagnosis',
  'pd-command-center-one-page__decision-workspace',
  'pd-command-center-one-page__runtime-split',
  'pd-command-center-one-page__runtime-main-analysis',
  'pd-command-center-one-page__driver-metrics',
  'pd-command-center-one-page__driver-meter',
  'pd-command-center-one-page__mosaic',
  'pd-command-center-one-page__command-bar',
  'pd-progress-indicator__fill',
  'pd-waterfall-chart__items',
  'pd-waterfall-chart__bar',
  'pd-funnel-chart__steps',
  'pd-funnel-chart__bar',
  // #command-section-plan scopes a couple of spacing tweaks onto the Plan
  // section specifically when reached via in-page anchor navigation; the
  // base rules stay owned by command-center-plan-execution.css.
  'pd-command-plan-section',
  'pd-command-plan-section__heading',
]);
const classPattern = /(?<![\w-])\.([a-zA-Z_][\w-]*)/g;

function collectCssFiles(target) {
  const absolute = path.join(root, target);

  if (!existsSync(absolute)) {
    return [];
  }

  if (statSync(absolute).isFile()) {
    return absolute.endsWith('.css') ? [absolute] : [];
  }

  const files = [];
  const stack = [absolute];

  while (stack.length > 0) {
    const directory = stack.pop();

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        stack.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith('.css')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

function allowedDuplicate(className) {
  return allowedDuplicateClasses.has(className)
    || allowedDuplicatePrefixes.some((prefix) => className.startsWith(prefix));
}

const owners = new Map();

for (const file of collectCssFiles(scannedRoot)) {
  const relative = path.relative(root, file).replaceAll('\\\\', '/');
  const source = readFileSync(file, 'utf8');

  for (const match of source.matchAll(classPattern)) {
    const className = match[1];

    if (!owners.has(className)) {
      owners.set(className, new Set());
    }

    owners.get(className).add(relative);
  }
}

const failures = [...owners.entries()]
  .filter(([className, files]) => files.size > 1 && !allowedDuplicate(className))
  .map(([className, files]) => `${className}: ${[...files].sort().join(', ')}`);

if (failures.length > 0) {
  console.error('Duplicate CSS class guard failed. Add an explicit allowlist entry only when the shared ownership is intentional:');
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) {
    console.error(`- ...and ${failures.length - 80} more`);
  }
  process.exitCode = 1;
} else {
  console.log('Duplicate CSS class guard OK.');
}
