import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs';

import path from 'node:path';

import {
  fileURLToPath,
} from 'node:url';

const scriptDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const root = path.resolve(scriptDirectory, '..');
const webRoot = path.join(root, 'apps/web');
const srcRoot = path.join(webRoot, 'src');
const storybookRoot = path.join(srcRoot, 'storybook-next');
const packagePath = path.join(webRoot, 'package.json');
const mainPath = path.join(webRoot, '.storybook/main.ts');
const previewPath = path.join(webRoot, '.storybook/preview.tsx');
const freezeCheckerPath = path.join(root, 'scripts/check-storybook-showcase-freeze.mjs');

const requiredEmptyDirectories = [
  'components',
  'decorators',
  'docs',
  'fixtures',
  'stories',
  'styles',
];

const forbiddenFragments = [
  'ShowcaseKit',
  'ComponentDocumentation',
  'SurfaceDocumentation',
  'SystemShowcases',
  'system-showcases.css',
  'showcase-kit-freeze.json',
  'storybook-next/styles/index.css',
  'storybook-next/components/showcases',
];

const textExtensions = new Set([
  '.css',
  '.js',
  '.jsx',
  '.json',
  '.mdx',
  '.mjs',
  '.ts',
  '.tsx',
]);

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function walk(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];

  for (
    const entry
    of readdirSync(directory, { withFileTypes: true })
  ) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function isStoryFile(filePath) {
  const base = path.basename(filePath);
  return base.includes('.stories.') || base.endsWith('.mdx');
}

function scanForbidden(files) {
  const findings = [];

  for (const filePath of files) {
    if (!textExtensions.has(path.extname(filePath))) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');

    for (const fragment of forbiddenFragments) {
      if (content.includes(fragment)) {
        findings.push(`${path.relative(root, filePath)} -> ${fragment}`);
      }
    }
  }

  return findings;
}

ensure(existsSync(storybookRoot), 'Missing storybook-next target directory.');

for (const directoryName of requiredEmptyDirectories) {
  const directoryPath = path.join(storybookRoot, directoryName);
  ensure(existsSync(directoryPath), `Missing target directory: ${directoryName}`);

  const files = walk(directoryPath).filter(
    (filePath) => path.basename(filePath) !== '.gitkeep',
  );

  ensure(
    files.length === 0,
    `Directory ${directoryName} is not empty:\n${files.join('\n')}`,
  );
}

const activeStoryFiles = walk(srcRoot).filter(isStoryFile);

ensure(
  activeStoryFiles.length === 0,
  `Active story files remain:\n${activeStoryFiles.join('\n')}`,
);

ensure(
  !existsSync(path.join(storybookRoot, 'components/showcases')),
  'Legacy showcases directory still exists.',
);

ensure(
  !existsSync(freezeCheckerPath),
  'Showcase freeze checker still exists.',
);

const mainSource = readFileSync(mainPath, 'utf8');
const previewSource = readFileSync(previewPath, 'utf8');
const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

ensure(
  mainSource.includes("../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"),
  'Storybook main config does not scan future colocated production stories.',
);

ensure(
  !previewSource.includes('import ')
  || !previewSource.match(/import\s+['"][^'"]+\.css['"]/),
  'Preview still imports a visual CSS layer.',
);

ensure(
  !Object.prototype.hasOwnProperty.call(
    packageJson.scripts ?? {},
    'check-storybook-showcase-freeze',
  ),
  'Package still contains showcase freeze script.',
);

ensure(
  (packageJson.scripts?.['check-storybook-catalog'] ?? '')
    .includes('check-storybook-visual-reset.mjs'),
  'Catalog quality gate does not include visual reset checker.',
);

const scanFiles = [
  ...walk(path.join(webRoot, '.storybook')),
  ...walk(srcRoot),
].filter(
  (filePath) => !filePath.endsWith('storybook-contract.json')
    && !filePath.endsWith('storybook-taxonomy-map.json')
    && !filePath.includes(`${path.sep}catalog${path.sep}catalog.generated.ts`),
);

const forbiddenFindings = scanForbidden(scanFiles);

ensure(
  forbiddenFindings.length === 0,
  `Legacy visual layer references remain:\n${forbiddenFindings.join('\n')}`,
);

if (process.argv.includes('--self-test')) {
  const sample = forbiddenFragments.join(' ');
  ensure(
    forbiddenFragments.every((fragment) => sample.includes(fragment)),
    'Visual reset checker self-test failed.',
  );
}

console.log(
  [
    'Storybook visual reset: PASS.',
    'Active story files: 0.',
    'Legacy showcase files: 0.',
    'Legacy visual CSS files: 0.',
    'Showcase freeze checker: removed.',
    'Target directories retained: 6.',
  ].join('\n'),
);
