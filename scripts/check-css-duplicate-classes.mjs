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
