import {
  existsSync,
  globSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {
  dirname,
  join,
  relative,
  resolve,
} from 'node:path';
import {
  fileURLToPath,
} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const storybookDir = resolve(root, 'apps/web/.storybook');
const sourceRoot = resolve(root, 'apps/web/src');
const failures = [];

function fail(message) {
  failures.push(message);
}

function walk(directory) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const name of readdirSync(directory)) {
    const fullPath = join(directory, name);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function repoPath(filePath) {
  return relative(root, filePath).replaceAll('\\', '/');
}

const mainPath = resolve(storybookDir, 'main.ts');
const mainSource = readFileSync(mainPath, 'utf8');
const storyPatterns = [...mainSource.matchAll(/['"](\.\.\/src\/[^'"]+\.stories\.tsx)['"]/gu)]
  .map((match) => match[1]);

if (storyPatterns.length === 0) {
  fail('Storybook main.ts does not declare any .stories.tsx inputs.');
}

const matchedStoryFiles = new Set();
for (const pattern of storyPatterns) {
  const matches = globSync(pattern, { cwd: storybookDir });
  if (matches.length === 0) {
    fail(`Storybook source pattern has no matches: ${pattern}`);
  }
  for (const match of matches) {
    matchedStoryFiles.add(resolve(storybookDir, match));
  }
}

// Reverse check: every *.stories.tsx file that physically exists inside an
// area main.ts's own patterns point into must be covered by at least one of
// those patterns. A file that exists but matches nothing loads silently into
// nowhere -- Storybook never lists it in its sidebar, and nothing else here
// would notice. "Areas" are derived from storyPatterns itself (the first
// path segment after '../src/'), not a hardcoded directory list, so this
// stays correct as directories are added, renamed or removed without
// needing this verifier to be edited in lockstep.
const declaredAreas = new Set(
  storyPatterns
    .map((pattern) => /^\.\.\/src\/([^/]+)\//u.exec(pattern))
    .filter((match) => match !== null)
    .map((match) => match[1]),
);

for (const area of declaredAreas) {
  const areaRoot = resolve(sourceRoot, area);
  const storyFilesInArea = globSync('**/*.stories.tsx', { cwd: areaRoot })
    .map((relativePath) => resolve(areaRoot, relativePath));

  for (const filePath of storyFilesInArea) {
    if (!matchedStoryFiles.has(filePath)) {
      fail(`Story file exists but matches no pattern declared in main.ts, so Storybook silently drops it: ${repoPath(filePath)}`);
    }
  }
}

const productionRoots = [
  resolve(sourceRoot, 'app'),
  resolve(sourceRoot, 'runtime'),
  resolve(sourceRoot, 'screens'),
  resolve(sourceRoot, 'design-system'),
];

for (const directory of productionRoots) {
  for (const filePath of walk(directory)) {
    if (!/\.(?:ts|tsx)$/u.test(filePath)) continue;
    if (/\.(?:stories|test|spec)\.(?:ts|tsx)$/u.test(filePath)) continue;

    const source = readFileSync(filePath, 'utf8');
    if (/from\s+['"][^'"]*storybook-next|import\s+['"][^'"]*storybook-next/gu.test(source)) {
      fail(`Production/shared code imports Storybook implementation: ${repoPath(filePath)}`);
    }
  }
}

const storyRoot = resolve(sourceRoot, 'storybook-next/stories');
for (const filePath of walk(storyRoot)) {
  if (!filePath.endsWith('.stories.tsx')) continue;
  const source = readFileSync(filePath, 'utf8');

  if (/\bfunction\s+[A-Z][A-Za-z0-9_]*Pattern\s*\(/gu.test(source)
    || /\b(?:const|let)\s+[A-Z][A-Za-z0-9_]*Pattern\s*=/gu.test(source)) {
    fail(`Story defines a local *Pattern implementation instead of importing its owner: ${repoPath(filePath)}`);
  }

  if (/title:\s*['"]PLATFORMA\//gu.test(source)) {
    fail(`Legacy PLATFORMA Storybook root remains: ${repoPath(filePath)}`);
  }
}

if (failures.length > 0) {
  console.error('STORYBOOK_ARCHITECTURE=FAIL');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log(`STORYBOOK_ARCHITECTURE=PASS patterns=${storyPatterns.length}`);
}
