#!/usr/bin/env node
// Verifies that a *built* apps/web artifact -- either the raw Vite `dist`
// output or the final `web-production` Docker image -- carries no
// Storybook/tooling leftovers. Deliberately does not grep apps/web/src:
// the leak this guard was written for (fixturePath/documentPath metadata
// riding along inside businessScreenDefinitions, a real production export)
// was invisible to a source-tree grep for `.stories.tsx` -- only inspecting
// the compiled output caught it. This script never runs `pnpm build:web`
// itself; it only inspects an artifact a prior CI step already produced, so
// invoking it does not cost a second build.
import {
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
} from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';

// Markers verified present in an actual (pre-fix) production bundle of this
// app. Deliberately narrow: generic names like `msw`, `argTypes`, `StoryObj`
// are avoided per prior review -- they risk false positives against
// unrelated minified code. `documentPath` used to be excluded here because it
// still leaked from seven screen-data modules (settingsData.ts,
// billingData.ts, decisionsData.ts, analyticsModuleData.ts, papaData.ts,
// integrationsData.ts, dataQualityData.ts) that were out of a prior patch's
// scope. Those modules never actually had a runtime consumer for the field --
// it was inert developer/doc metadata -- so it was deleted at the source
// (2026-08-21) instead of being added to this list as a second, parallel
// leak surface. `documentPath` is included below now that no known source
// carries it, so a future reintroduction is caught as a regression.
const FORBIDDEN_MARKERS = [
  'fixtures/storybook/',
  '.stories.',
  'storybook-next',
  'fixturePath',
  'documentPath',
];

const SCANNABLE_EXTENSIONS = new Set(['.js', '.css', '.html']);

// Extensions/basenames a production web-production artifact may legitimately
// contain. No .map (stripped at build time), no .json/.md/.ts/.tsx source or
// data files, no dotfiles beyond nginx's own housekeeping.
const ALLOWED_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.ico',
  '.js',
  '.svg',
  '.woff',
  '.woff2',
]);
const ALLOWED_BASENAMES = new Set(['.gitkeep']);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

async function scanMarkers(files) {
  const findings = [];
  for (const file of files) {
    if (!SCANNABLE_EXTENSIONS.has(extname(file))) continue;
    const content = await readFile(file, 'utf8');
    for (const marker of FORBIDDEN_MARKERS) {
      if (content.includes(marker)) {
        findings.push({ file, marker });
      }
    }
  }
  return findings;
}

function checkExtensions(files, root) {
  const violations = [];
  for (const file of files) {
    const base = file.slice(root.length + 1);
    const ext = extname(file);
    const basename = file.split('/').at(-1) ?? file;
    if (ALLOWED_BASENAMES.has(basename)) continue;
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      violations.push(base);
    }
  }
  return violations;
}

async function verifyDist(distPath) {
  let stat;
  try {
    stat = statSync(distPath);
  } catch {
    console.error(`verify-web-production-artifact: dist path not found: ${distPath}`);
    console.error('Run `pnpm build:web` first -- this script only inspects an existing build.');
    process.exit(1);
  }
  if (!stat.isDirectory()) {
    console.error(`verify-web-production-artifact: not a directory: ${distPath}`);
    process.exit(1);
  }

  const files = walk(distPath);
  const findings = await scanMarkers(files);

  report(findings, [], distPath);
}

async function verifyImage(imageRef) {
  const containerId = execFileSync('docker', ['create', imageRef]).toString().trim();
  const extractDir = mkdtempSync(join(tmpdir(), 'papadata-web-image-'));

  try {
    execFileSync('docker', [
      'cp',
      `${containerId}:/usr/share/nginx/html`,
      join(extractDir, 'html'),
    ]);

    const root = join(extractDir, 'html');
    const files = walk(root);
    const findings = await scanMarkers(files);
    const extensionViolations = checkExtensions(files, root);

    report(findings, extensionViolations, root);
  } finally {
    execFileSync('docker', ['rm', '-f', containerId]);
    rmSync(extractDir, { recursive: true, force: true });
  }
}

function report(markerFindings, extensionViolations, root) {
  if (markerFindings.length === 0 && extensionViolations.length === 0) {
    console.log(`verify-web-production-artifact: OK (${root}) -- no Storybook/tooling markers, no disallowed file types.`);
    return;
  }

  if (markerFindings.length > 0) {
    console.error('verify-web-production-artifact: forbidden markers found in built artifact:');
    for (const { file, marker } of markerFindings) {
      console.error(`  ${file}: contains "${marker}"`);
    }
  }

  if (extensionViolations.length > 0) {
    console.error('verify-web-production-artifact: disallowed file(s) in web-production image:');
    for (const file of extensionViolations) {
      console.error(`  ${file}`);
    }
  }

  process.exit(1);
}

const args = process.argv.slice(2);
const distIndex = args.indexOf('--dist');
const imageIndex = args.indexOf('--image');

if (distIndex !== -1) {
  await verifyDist(args[distIndex + 1]);
} else if (imageIndex !== -1) {
  await verifyImage(args[imageIndex + 1]);
} else {
  console.error('Usage: verify-web-production-artifact.mjs --dist <path> | --image <image-ref>');
  process.exit(1);
}
