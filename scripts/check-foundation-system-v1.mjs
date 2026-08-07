import {
  readdirSync,
  statSync,
} from 'node:fs';
import path from 'node:path';

import {
  ensure,
  getContract,
  readJson,
  readText,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const contract = getContract();
const componentSystem = readJson('apps/web/src/design-system/component-system-v1.json');
const foundationStory = readText('apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx');
const storyPresentation = readText('apps/web/src/storybook-next/presentation/story-presentation.css');
const surfacesStory = readText('apps/web/src/storybook-next/stories/05-surfaces/surfaces-laboratory.stories.tsx');
const theme = readText('apps/web/src/design-system/foundations/themes/carbon-pearl.css');
const foundationsIndex = readText('apps/web/src/design-system/foundations/index.ts');
const foundationTokensIndex = readText('apps/web/src/design-system/foundations/tokens/index.ts');
const typographyTokens = readText('apps/web/src/design-system/foundations/tokens/typography.ts');
const layerTokens = readText('apps/web/src/design-system/foundations/tokens/layers.ts');
const iconsIndex = readText('apps/web/src/design-system/icons/index.ts');

const entries = new Map(contract.entries.map((entry) => [entry.id, entry]));
const frozenEntries = componentSystem.foundationBaseline.frozenEntries;
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
const laboratoryEntryIds = [
  '05.01',
  '05.02',
  '05.03',
  '05.04',
  '05.05',
];
const expectedFoundationDocs = [
  '00-01-kierunek-wizualny.md',
  '00-02-typografia.md',
  '00-03-kolory-semantyczne.md',
  '00-04-statusy-systemowe.md',
  '00-05-spacing-i-grid.md',
  '00-06-promienie-i-geometria.md',
  '00-07-linie-i-separacja.md',
  '00-08-glebia-i-warstwy.md',
  '00-09-ikonografia.md',
  '00-10-motion.md',
  '00-11-dostepnosc.md',
];
const requiredDocumentMetadata = [
  'story_id:',
  'decision_status:',
  'prototype_status:',
  'production_status:',
  'test_status:',
  'applies_to:',
  'approved_commit:',
  'approved_evidence:',
  'owner:',
];

function listFilesRecursively(directory, predicate) {
  const directoryPath = resolveFromRoot(directory);
  const results = [];

  for (const item of readdirSync(directoryPath)) {
    const itemPath = path.join(directoryPath, item);
    const relativePath = path.relative(resolveFromRoot(), itemPath);
    const stats = statSync(itemPath);

    if (stats.isDirectory()) {
      results.push(...listFilesRecursively(relativePath, predicate));
      continue;
    }

    if (predicate(relativePath)) {
      results.push(relativePath);
    }
  }

  return results.sort();
}

function lineNumberForIndex(source, index) {
  return source.slice(0, index).split('\n').length;
}

function collectCssVariableDefinitions(files) {
  const definitions = new Map();
  const definitionPattern = /(--pd-[A-Za-z0-9-]+)\s*:/g;

  for (const file of files) {
    const source = readText(file);
    for (const match of source.matchAll(definitionPattern)) {
      const token = match[1];
      const locations = definitions.get(token) ?? [];
      locations.push({
        file,
        line: lineNumberForIndex(source, match.index ?? 0),
      });
      definitions.set(token, locations);
    }
  }

  return definitions;
}

function collectUndefinedCssVariableUses(files, definitions) {
  const usagePattern = /var\(\s*(--pd-[A-Za-z0-9-]+)\s*([,)])/g;
  const undefinedUses = new Map();

  for (const file of files) {
    const source = readText(file);
    for (const match of source.matchAll(usagePattern)) {
      const token = match[1];
      const hasFallback = match[2] === ',';

      if (hasFallback || definitions.has(token)) {
        continue;
      }

      const locations = undefinedUses.get(token) ?? [];
      locations.push({
        file,
        line: lineNumberForIndex(source, match.index ?? 0),
      });
      undefinedUses.set(token, locations);
    }
  }

  return undefinedUses;
}

function formatUndefinedCssVariableError(undefinedUses) {
  return [...undefinedUses.entries()]
    .map(([token, locations]) => {
      const grouped = new Map();
      for (const location of locations) {
        const lines = grouped.get(location.file) ?? [];
        lines.push(location.line);
        grouped.set(location.file, lines);
      }

      return [
        'Undefined CSS variable:',
        `token: ${token}`,
        `occurrences: ${locations.length}`,
        ...[...grouped.entries()].map(([file, lines]) => (
          `file: ${file}; lines: ${[...new Set(lines)].join(', ')}`
        )),
      ].join('\n');
    })
    .join('\n\n');
}

for (const entryId of frozenEntries) {
  const entry = entries.get(entryId);
  ensure(entry, `Missing frozen foundation entry ${entryId}.`);
  ensure(entry.storyStatus === 'implemented', `${entryId}: must be implemented.`);
  ensure(entry.storyVisibility === 'visible', `${entryId}: must be visible.`);
  ensure(typeof entry.storyExport === 'string', `${entryId}: missing story export.`);
}

ensure(
  frozenEntries.every((entryId) => foundationEntryIds.includes(entryId)),
  'Laboratorium entries must not be frozen in Foundation System V1.',
);

for (const entryId of foundationEntryIds) {
  const entry = entries.get(entryId);
  ensure(entry, `Missing foundation entry ${entryId}.`);
  ensure(entry.sourceStatus === 'accepted', `${entryId}: foundation source must be accepted.`);
  ensure(entry.documentationStatus === 'accepted', `${entryId}: foundation documentation must be accepted.`);
  ensure(entry.storyStatus === 'implemented', `${entryId}: foundation story must be implemented.`);
  ensure(entry.storyVisibility === 'visible', `${entryId}: foundation story must be visible.`);
}

for (const entryId of laboratoryEntryIds) {
  const entry = entries.get(entryId);
  ensure(entry, `Missing laboratory entry ${entryId}.`);
  ensure(entry.productionStatus === 'not_started', `${entryId}: laboratory production must not be started.`);

  if (entryId === '05.04') {
    ensure(entry.sourceStatus === 'accepted', '05.04: accepted separator decision must be marked accepted.');
    ensure(entry.documentationStatus === 'accepted', '05.04: accepted separator decision documentation must be accepted.');
    ensure(entry.prototypeStatus === 'implemented', '05.04: accepted separator decision prototype must be implemented.');
    ensure(entry.testStatus === 'passing', '05.04: accepted separator decision static checks must pass.');
    continue;
  }

  ensure(entry.sourceStatus === 'specified', `${entryId}: open laboratory source must remain specified.`);
  ensure(entry.documentationStatus === 'review', `${entryId}: open laboratory documentation must remain in review.`);
  ensure(entry.prototypeStatus === 'review', `${entryId}: open laboratory prototype must remain in review.`);
  ensure(entry.testStatus === 'not_started', `${entryId}: open laboratory tests must remain not_started.`);
}

for (const token of componentSystem.foundationBaseline.requiredTokens) {
  ensure(theme.includes(`${token}:`), `Missing foundation token ${token}.`);
}

for (const exportName of componentSystem.foundationBaseline.requiredFoundationExports) {
  ensure(
    foundationsIndex.includes(exportName)
      || foundationTokensIndex.includes(exportName),
    `Missing foundation export ${exportName}.`,
  );
}

for (const exportName of componentSystem.foundationBaseline.requiredIconExports) {
  ensure(iconsIndex.includes(exportName), `Missing icon export ${exportName}.`);
}

for (const cssImport of [
  '../../presentation/story-presentation.css',
  'foundation-accessibility.css',
  'foundation-geometry.css',
  'foundation-iconography.css',
  'foundation-status-catalog.css',
]) {
  ensure(
    foundationStory.includes(cssImport),
    `Missing Foundation CSS import ${cssImport}.`,
  );
}

const foundationStoriesDirectory =
  'apps/web/src/storybook-next/stories/00-foundations';

const foundationStoryFiles = new Set(
  readdirSync(resolveFromRoot(foundationStoriesDirectory)),
);

for (const obsoleteCssImport of [
  'foundation-iconography-no-containers.css',
  'foundation-geometry-lab-only.css',
  'foundation-select-target.css',
]) {
  ensure(
    !foundationStory.includes(obsoleteCssImport),
    `Obsolete Foundation CSS import ${obsoleteCssImport} must not return.`,
  );
  ensure(
    !foundationStoryFiles.has(obsoleteCssImport),
    `Obsolete Foundation CSS file ${obsoleteCssImport} must not return.`,
  );
}

for (const obsoleteFoundationSelector of [
  'pd-f0-icon-button',
  'pd-f0-focus-sample',
]) {
  ensure(
    !foundationStory.includes(obsoleteFoundationSelector),
    `Obsolete Foundation selector ${obsoleteFoundationSelector} must not return to the Foundation story.`,
  );
  ensure(
    !storyPresentation.includes(obsoleteFoundationSelector),
    `Obsolete Foundation selector ${obsoleteFoundationSelector} must not return to the canonical presentation shell.`,
  );
}

ensure(!surfacesStory.includes('communication-layers-lab.css'), 'Laboratorium decyzji must not import removed communication-layers-lab.css.');
ensure(surfacesStory.includes('../../presentation/story-presentation.css'), 'Missing canonical Storybook presentation CSS import in Laboratorium.');
ensure(surfacesStory.includes('auth-laboratory.css'), 'Missing 05.01 auth laboratory CSS import.');
ensure(componentSystem.foundationBaseline.expectedActiveStoryCount === contract.activeVisualLayer.activeEntryStories, 'Component baseline active story count is stale.');

for (const tokenName of [
  'label',
  'heading1',
  'heading2',
  'heading3',
  'heading4',
  'heading5',
  'headingSmall',
]) {
  ensure(typographyTokens.includes(tokenName), `Missing typography role ${tokenName}.`);
}
ensure(typographyTokens.includes('tight'), 'Missing typography line height role tight.');
ensure(typographyTokens.includes('Inter'), 'Typography contract must use Inter.');
ensure(typographyTokens.includes('JetBrains Mono'), 'Typography contract must use JetBrains Mono.');

for (const [name, value] of [
  ['underlay', '-1'],
  ['base', '0'],
  ['sticky', '10'],
  ['popover', '20'],
  ['modal', '30'],
  ['toast', '40'],
]) {
  ensure(layerTokens.includes(`${name}: 'var(--pd-layer-${name})'`), `Missing layer token ${name}.`);
  ensure(layerTokens.includes(`${name}: ${value}`), `Missing layer contract value ${name}: ${value}.`);
}

const foundationDocsDirectory = 'docs/specyfikacja-docelowa/01-fundamenty';
const actualFoundationDocs = readdirSync(resolveFromRoot(foundationDocsDirectory))
  .filter((file) => file.endsWith('.md'))
  .sort();
ensure(
  JSON.stringify(actualFoundationDocs) === JSON.stringify(expectedFoundationDocs),
  `Foundation docs must map 1:1 to Storybook. Expected ${expectedFoundationDocs.join(', ')}, got ${actualFoundationDocs.join(', ')}.`,
);

const seenStoryIds = new Set();
for (const documentName of expectedFoundationDocs) {
  const documentPath = `${foundationDocsDirectory}/${documentName}`;
  const source = readText(documentPath);
  for (const field of requiredDocumentMetadata) {
    ensure(source.includes(field), `${documentPath}: missing metadata field ${field}`);
  }
  const storyId = source.match(/story_id:\s*["'](00\.\d{2})["']/)?.[1];
  ensure(storyId, `${documentPath}: missing machine-readable story_id.`);
  ensure(!seenStoryIds.has(storyId), `Duplicate foundation story_id ${storyId}.`);
  seenStoryIds.add(storyId);
  ensure(!source.includes('Instrument Sans'), `${documentPath}: stale Instrument Sans reference.`);
  ensure(!source.includes('IBM Plex Mono'), `${documentPath}: stale IBM Plex Mono reference.`);
  ensure(!source.includes('--pd-text-primary'), `${documentPath}: stale --pd-text-primary token.`);
  ensure(!source.includes('--pd-border-subtle'), `${documentPath}: stale --pd-border-subtle token.`);
  ensure(!source.includes('--pd-surface-1'), `${documentPath}: stale --pd-surface-1 token.`);
}

for (const documentName of [
  '00-03-kolory.md',
  '00-04-spacing-i-grid.md',
  '00-05-promienie-obramowania-i-cienie.md',
  '00-06-ikonografia.md',
  '00-07-motion.md',
  '00-08-dostepnosc.md',
]) {
  ensure(!actualFoundationDocs.includes(documentName), `Stale foundation document name remains: ${documentName}.`);
}

const cssFiles = listFilesRecursively(
  'apps/web/src',
  (file) => file.endsWith('.css'),
);
const cssDefinitions = collectCssVariableDefinitions(cssFiles);
const undefinedCssVariables = collectUndefinedCssVariableUses(cssFiles, cssDefinitions);
ensure(
  undefinedCssVariables.size === 0,
  formatUndefinedCssVariableError(undefinedCssVariables),
);

console.log(`Foundation System V1 OK: ${frozenEntries.length} frozen entries.`);
