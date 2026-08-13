import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scannedRoots = [
  'apps/web/src/app',
  'apps/web/src/features',
  'apps/web/src/screens',
  'apps/web/src/shell',
  'apps/web/src/storybook-next',
  'apps/web/src/design-system/components',
];
const allowedRoots = [
  'apps/web/src/design-system/foundations',
];
const ignoredDirectories = new Set([
  'node_modules',
  'storybook-static',
  'dist',
  'build',
]);
const hexPattern = /#[0-9a-fA-F]{3,8}\b/g;

function isAllowed(relative) {
  return allowedRoots.some((allowedRoot) => relative.startsWith(`${allowedRoot}/`));
}

function collectFiles(target) {
  const absolute = path.join(root, target);

  if (!existsSync(absolute)) {
    return [];
  }

  const stats = statSync(absolute);

  if (stats.isFile()) {
    return /\.(?:css|tsx?|md|json)$/.test(absolute) ? [absolute] : [];
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
      } else if (entry.isFile() && /\.(?:css|tsx?|md|json)$/.test(entry.name)) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

const failures = [];

for (const file of scannedRoots.flatMap(collectFiles)) {
  const relative = path.relative(root, file).replaceAll('\\\\', '/');

  if (isAllowed(relative)) {
    continue;
  }

  const source = readFileSync(file, 'utf8');
  const matches = [...source.matchAll(hexPattern)];

  for (const match of matches) {
    const line = source.slice(0, match.index).split('\n').length;
    failures.push(`${relative}:${line}: ${match[0]}`);
  }
}

if (failures.length > 0) {
  console.error('Local hex color guard failed. Use design tokens instead of local palettes:');
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) {
    console.error(`- ...and ${failures.length - 80} more`);
  }
  process.exitCode = 1;
} else {
  console.log('Local hex color guard OK.');
}
