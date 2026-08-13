import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scannedRoots = [
  'docs',
  'README.md',
  'RAPORT-WALIDACJI.md',
  'RAPORT-KOMPLETNOSCI-I-JAKOSCI.md',
  'POTWIERDZENIE-PRIORYTETOW-P0.md',
  'audy12082026.md',
];
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  '.turbo',
  'storybook-static',
  'dist',
  'build',
]);
const forbiddenPatterns = [
  [/\{\{[^}\n]+\}\}/, 'template-token'],
  [/\b(?:TODO|FIXME|TBD)\b:?/i, 'todo-marker'],
  [/\b(?:CHANGE_ME|REPLACE_ME|INSERT_HERE|YOUR_[A-Z0-9_]+)\b/, 'generator-marker'],
  [/\bLorem ipsum\b/i, 'lorem-ipsum'],
  [/<(?:TODO|FIXME|TBD|CHANGE_ME|REPLACE_ME)>/i, 'angle-placeholder'],
  [/\[(?:TODO|FIXME|TBD|CHANGE_ME|REPLACE_ME)\]/i, 'bracket-placeholder'],
];

function collectMarkdownFiles(target) {
  const absolute = path.join(root, target);

  if (!existsSync(absolute)) {
    return [];
  }

  const stats = statSync(absolute);

  if (stats.isFile()) {
    return absolute.endsWith('.md') ? [absolute] : [];
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
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

const failures = [];

for (const file of scannedRoots.flatMap(collectMarkdownFiles)) {
  const source = readFileSync(file, 'utf8');
  const relative = path.relative(root, file).replaceAll('\\\\', '/');

  source.split('\n').forEach((line, index) => {
    for (const [pattern, code] of forbiddenPatterns) {
      if (pattern.test(line)) {
        failures.push(`${relative}:${index + 1}: ${code}`);
      }
    }
  });
}

if (failures.length > 0) {
  console.error('Documentation placeholder guard failed:');
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) {
    console.error(`- ...and ${failures.length - 80} more`);
  }
  process.exitCode = 1;
} else {
  console.log('Documentation placeholder guard OK.');
}
