import {
  createHash,
} from 'node:crypto';
import {
  execFileSync,
} from 'node:child_process';
import {
  createServer,
} from 'node:http';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import {
  createRequire,
} from 'node:module';

import {
  ensure,
  getContract,
  readJson,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

function requirePackageFromWebOrPnpmStore(packageName) {
  const requireFromWeb = createRequire(resolveFromRoot('apps/web/package.json'));

  try {
    return requireFromWeb(packageName);
  } catch (error) {
    if (error?.code !== 'MODULE_NOT_FOUND') {
      throw error;
    }
  }

  const pnpmDirectory = resolveFromRoot('node_modules/.pnpm');
  const packagePathParts = packageName.split('/');
  const packageFolder = packagePathParts.join('/');
  const encodedPackagePrefix = packageName
    .replace('/', '+')
    .replace('@', '@');
  const match = readdirSync(pnpmDirectory)
    .find((entry) => entry.startsWith(`${encodedPackagePrefix}@`));

  ensure(match, `Unable to resolve ${packageName} from apps/web or node_modules/.pnpm.`);

  return createRequire(
    path.join(
      pnpmDirectory,
      match,
      'node_modules',
      packageFolder,
      'package.json',
    ),
  )(packageName);
}

const {
  chromium,
} = requirePackageFromWebOrPnpmStore('@playwright/test');

const foundationEntryIds = [
  '00.01',
  '00.02',
  '00.03',
  '00.04',
  '00.05',
  '00.06',
  '00.07',
  '00.08',
  '00.09',
  '00.10',
  '00.11',
];
const themes = [
  'light',
  'dark',
];
const viewport = {
  width: 1440,
  height: 1000,
};
const staticDirectory = resolveFromRoot('apps/web/storybook-static');
const indexPath = path.join(staticDirectory, 'index.json');
const outputDirectory = path.resolve(
  process.argv.find((argument) => (
    !argument.startsWith('--')
      && argument !== process.argv[0]
      && argument !== process.argv[1]
  )) ?? resolveFromRoot('foundation-evidence'),
);
const screenshotsDirectory = path.join(outputDirectory, 'screenshots');

function contentTypeFor(filePath) {
  if (filePath.endsWith('.html')) {
    return 'text/html; charset=utf-8';
  }
  if (filePath.endsWith('.js')) {
    return 'text/javascript; charset=utf-8';
  }
  if (filePath.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }
  if (filePath.endsWith('.json')) {
    return 'application/json; charset=utf-8';
  }
  if (filePath.endsWith('.png')) {
    return 'image/png';
  }
  if (filePath.endsWith('.svg')) {
    return 'image/svg+xml';
  }
  if (filePath.endsWith('.woff2')) {
    return 'font/woff2';
  }
  return 'application/octet-stream';
}

function createStaticServer(directory) {
  const server = createServer((request, response) => {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
    const requestedPath = decodeURIComponent(requestUrl.pathname);
    const safePath = path.normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(
      directory,
      safePath === '/' ? 'index.html' : safePath,
    );

    if (!filePath.startsWith(directory) || !existsSync(filePath)) {
      response.writeHead(404);
      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentTypeFor(filePath),
    });
    response.end(readFileSync(filePath));
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      ensure(address && typeof address === 'object', 'Unable to start evidence server.');
      resolve({
        server,
        url: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function kebab(value) {
  return value
    .replace(/[ąĄ]/g, 'a')
    .replace(/[ćĆ]/g, 'c')
    .replace(/[ęĘ]/g, 'e')
    .replace(/[łŁ]/g, 'l')
    .replace(/[ńŃ]/g, 'n')
    .replace(/[óÓ]/g, 'o')
    .replace(/[śŚ]/g, 's')
    .replace(/[żŻźŹ]/g, 'z')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function git(args) {
  return execFileSync('git', args, {
    cwd: resolveFromRoot(),
    encoding: 'utf8',
  }).trim();
}

function isWorktreeDirty() {
  return git(['status', '--short']).length > 0;
}

function storybookGlobalQuery(theme) {
  return [
    `theme:${theme}`,
    'locale:pl',
    'density:comfortable',
    'motion:full',
    'viewport:desktopStandard',
  ].join(';');
}

ensure(existsSync(indexPath), 'Missing apps/web/storybook-static/index.json. Run build-storybook before capture-foundation-evidence.');

const contract = getContract();
const storybookIndex = readJson('apps/web/storybook-static/index.json');
const packageJson = readJson('apps/web/package.json');
const entriesByExport = new Map(
  Object.values(storybookIndex.entries ?? {})
    .filter((entry) => entry.type === 'story')
    .map((entry) => [entry.exportName, entry]),
);
const contractEntries = new Map(
  contract.entries.map((entry) => [entry.id, entry]),
);
const evidenceEntries = [];
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
const commit = git(['rev-parse', 'HEAD']);
const generatedAt = new Date().toISOString();
const storybookVersion =
  packageJson.devDependencies?.storybook
    ?? packageJson.dependencies?.storybook
    ?? 'unknown';

mkdirSync(screenshotsDirectory, {
  recursive: true,
});
for (const file of readdirSync(screenshotsDirectory)) {
  if (file.endsWith('.png')) {
    unlinkSync(path.join(screenshotsDirectory, file));
  }
}

const {
  server,
  url,
} = await createStaticServer(staticDirectory);

let browser;

try {
  browser = await chromium.launch({
    headless: true,
  });
  const page = await browser.newPage({
    viewport,
    deviceScaleFactor: 1,
  });

  for (const storyId of foundationEntryIds) {
    const contractEntry = contractEntries.get(storyId);
    ensure(contractEntry, `Missing foundation contract entry ${storyId}.`);
    const storybookEntry = entriesByExport.get(contractEntry.storyExport);
    ensure(storybookEntry, `Missing Storybook index entry for ${storyId} / ${contractEntry.storyExport}.`);

    for (const theme of themes) {
      const screenshotName = `${storyId.replace('.', '-')}__${kebab(contractEntry.title)}__${theme}__desktop__pl__comfortable.png`;
      const screenshotPath = path.join(screenshotsDirectory, screenshotName);
      const storyUrl = `${url}/iframe.html?id=${storybookEntry.id}&globals=${encodeURIComponent(storybookGlobalQuery(theme))}`;

      await page.goto(storyUrl, {
        waitUntil: 'networkidle',
      });
      await page.waitForSelector('#storybook-root, #root', {
        timeout: 15000,
      });
      await page.emulateMedia({
        reducedMotion: 'no-preference',
      });
      await page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      const image = readFileSync(screenshotPath);
      evidenceEntries.push({
        storyId,
        storyExport: contractEntry.storyExport,
        storybookId: storybookEntry.id,
        title: contractEntry.title,
        theme,
        locale: 'pl',
        density: 'comfortable',
        motion: 'full',
        viewport,
        branch,
        commit,
        worktreeDirty: isWorktreeDirty(),
        storybookVersion,
        file: path.relative(outputDirectory, screenshotPath),
        sha256: sha256(image),
        decisionStatus: 'candidate',
      });
    }
  }
} finally {
  if (browser) {
    await browser.close();
  }
  await new Promise((resolve) => server.close(resolve));
}

const manifest = {
  schemaVersion: 1,
  generatedAt,
  branch,
  commit,
  worktreeDirty: isWorktreeDirty(),
  viewport,
  locale: 'pl',
  density: 'comfortable',
  motion: 'full',
  requiredScreenshotCount: foundationEntryIds.length * themes.length,
  decisionStatus: 'candidate',
  entries: evidenceEntries,
};
const summary = {
  activeEntryStories: contract.activeVisualLayer.activeEntryStories,
  contractEntries: contract.entries.length,
  generatedAt,
  screenshotCount: evidenceEntries.length,
  storybookStories: Object.keys(storybookIndex.entries ?? {}).length,
  visibleStories: contract.entries.filter((entry) => entry.storyVisibility === 'visible').length,
  manifest: 'manifest.json',
};

ensure(
  evidenceEntries.length === foundationEntryIds.length * themes.length,
  `Expected ${foundationEntryIds.length * themes.length} screenshots, got ${evidenceEntries.length}.`,
);

writeFileSync(
  path.join(outputDirectory, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
writeFileSync(
  path.join(outputDirectory, 'summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);

console.log(`Foundation evidence captured: ${path.join(outputDirectory, 'manifest.json')}`);
