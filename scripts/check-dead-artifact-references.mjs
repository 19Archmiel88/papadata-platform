import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scannedRoots = [
  'docs',
  'README.md',
  'docs/audits/2026-08/raport-walidacji-2026-08-14.md',
  'docs/audits/2026-08/raport-kompletnosci-i-jakosci-2026-08-14.md',
  'docs/audits/2026-08/potwierdzenie-priorytetow-p0.md',
  'docs/audits/2026-08/audyt-dokumentacji-storybooka-i-frontendu-2026-08-12.md',
  'rejestry',
  'macierze',
  'MANIFEST.json',
];
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  '.turbo',
  'storybook-static',
  'dist',
  'build',
]);
const forbiddenReferences = [
  'papadata-platform-source-20260810-143339.zip',
  '.runtime/implementation-backups',
  '.runtime/volume-backups',
  'migration/remaining-compatibility-summary.txt',
  'SHA256SUMS.txt',
];
const forbiddenHistoricalReportPattern = /(?:storybook|browser|audit).*(?:historyczn|archiwaln).*gate/i;

function collectTextFiles(target) {
  const absolute = path.join(root, target);

  if (!existsSync(absolute)) {
    return [];
  }

  const stats = statSync(absolute);

  if (stats.isFile()) {
    return /\.(?:md|csv|json|txt)$/.test(absolute) ? [absolute] : [];
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
      } else if (entry.isFile() && /\.(?:md|csv|json|txt)$/.test(entry.name)) {
        files.push(entryPath);
      }
    }
  }

  return files;
}

const failures = [];

for (const file of scannedRoots.flatMap(collectTextFiles)) {
  const relative = path.relative(root, file).replaceAll('\\\\', '/');
  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, index) => {
    for (const token of forbiddenReferences) {
      if (line.includes(token)) {
        failures.push(`${relative}:${index + 1}: dead reference ${token}`);
      }
    }

    if (forbiddenHistoricalReportPattern.test(line)) {
      failures.push(`${relative}:${index + 1}: historical report cannot be treated as active gate`);
    }
  });
}

if (failures.length > 0) {
  console.error('Dead artifact reference guard failed:');
  for (const failure of failures.slice(0, 80)) {
    console.error(`- ${failure}`);
  }
  if (failures.length > 80) {
    console.error(`- ...and ${failures.length - 80} more`);
  }
  process.exitCode = 1;
} else {
  console.log('Dead artifact reference guard OK.');
}
