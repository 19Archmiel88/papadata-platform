import {
  createHash,
} from 'node:crypto';
import {
  execFileSync,
  spawnSync,
} from 'node:child_process';
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

import {
  ensure,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const root = resolveFromRoot();
const foundationManifestPath = 'foundation-evidence/manifest.json';
const foundationScreenshotsDirectory = 'foundation-evidence/screenshots';

function git(args) {
  return execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
  }).trim();
}

function sha256File(relativePath) {
  const absolutePath = resolveFromRoot(relativePath);
  if (!existsSync(absolutePath)) {
    return null;
  }

  return createHash('sha256').update(readFileSync(absolutePath)).digest('hex');
}

function listFilesRecursively(directory, predicate) {
  const absoluteDirectory = resolveFromRoot(directory);

  if (!existsSync(absoluteDirectory)) {
    return [];
  }

  const results = [];
  const visit = (currentDirectory) => {
    for (const item of readdirSync(currentDirectory)) {
      const itemPath = path.join(currentDirectory, item);
      const relativePath = path.relative(root, itemPath).replace(/\\/g, '/');
      const stats = statSync(itemPath);

      if (stats.isDirectory()) {
        visit(itemPath);
        continue;
      }

      if (predicate(relativePath)) {
        results.push(relativePath);
      }
    }
  };

  visit(absoluteDirectory);
  return results.sort();
}

function snapshotTrackedFiles() {
  const index = git(['ls-files', '--stage']);
  const files = git(['ls-files', '-z'])
    .split('\0')
    .filter(Boolean);
  const entries = files.map((file) => [
    file,
    sha256File(file),
  ]);

  return JSON.stringify({
    index,
    entries,
  });
}

function snapshotFoundationManifest() {
  return sha256File(foundationManifestPath);
}

function snapshotFoundationPngs() {
  return JSON.stringify(
    listFilesRecursively(
      foundationScreenshotsDirectory,
      (file) => file.endsWith('.png'),
    ).map((file) => [
      file,
      sha256File(file),
    ]),
  );
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw result.error;
  }

  ensure(
    result.status === 0,
    `${command} ${args.join(' ')} failed with exit code ${result.status ?? 'unknown'}.`,
  );
}

const before = {
  trackedFiles: snapshotTrackedFiles(),
  foundationManifest: snapshotFoundationManifest(),
  foundationPngs: snapshotFoundationPngs(),
};

for (const args of [
  ['--dir', 'apps/web', 'check-storybook-catalog'],
  ['--dir', 'apps/web', 'check-foundation-system'],
  ['--dir', 'apps/web', 'check-component-system'],
  ['--dir', 'apps/web', 'typecheck'],
  ['--dir', 'apps/web', 'build-storybook'],
]) {
  run('pnpm', args);
}

const after = {
  trackedFiles: snapshotTrackedFiles(),
  foundationManifest: snapshotFoundationManifest(),
  foundationPngs: snapshotFoundationPngs(),
};

ensure(
  before.trackedFiles === after.trackedFiles,
  'Read-only foundation verification changed tracked files.',
);
ensure(
  before.foundationManifest === after.foundationManifest,
  'Read-only foundation verification changed foundation-evidence/manifest.json.',
);
ensure(
  before.foundationPngs === after.foundationPngs,
  'Read-only foundation verification changed existing foundation evidence PNG files.',
);

console.log('Foundation System V1 read-only verification OK: no tracked files, manifest, or existing PNG files changed.');
