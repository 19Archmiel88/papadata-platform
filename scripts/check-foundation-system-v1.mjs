import {
  ensure,
  getContract,
  readJson,
  readText,
} from './storybook-check-utils.mjs';

const contract = getContract();
const componentSystem = readJson('apps/web/src/design-system/component-system-v1.json');
const foundationStory = readText('apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx');
const surfacesStory = readText('apps/web/src/storybook-next/stories/05-surfaces/surfaces-laboratory.stories.tsx');
const theme = readText('apps/web/src/design-system/foundations/themes/carbon-pearl.css');
const foundationsIndex = readText('apps/web/src/design-system/foundations/index.ts');
const iconsIndex = readText('apps/web/src/design-system/icons/index.ts');

const entries = new Map(contract.entries.map((entry) => [entry.id, entry]));
const frozenEntries = componentSystem.foundationBaseline.frozenEntries;

for (const entryId of frozenEntries) {
  const entry = entries.get(entryId);
  ensure(entry, `Missing frozen foundation entry ${entryId}.`);
  ensure(entry.storyStatus === 'implemented', `${entryId}: must be implemented.`);
  ensure(entry.storyVisibility === 'visible', `${entryId}: must be visible.`);
  ensure(typeof entry.storyExport === 'string', `${entryId}: missing story export.`);
}

for (const token of componentSystem.foundationBaseline.requiredTokens) {
  ensure(theme.includes(`${token}:`), `Missing foundation token ${token}.`);
}

for (const exportName of componentSystem.foundationBaseline.requiredFoundationExports) {
  ensure(foundationsIndex.includes(exportName), `Missing foundation export ${exportName}.`);
}

for (const exportName of componentSystem.foundationBaseline.requiredIconExports) {
  ensure(iconsIndex.includes(exportName), `Missing icon export ${exportName}.`);
}

for (const cssImport of [
  'foundation-iconography-no-containers.css',
  'foundation-lab-alignment.css',
  'foundation-geometry-lab-only.css',
  'foundation-select-target.css',
  'foundation-status-catalog.css',
]) {
  ensure(foundationStory.includes(cssImport), `Missing Foundation CSS import ${cssImport}.`);
}

ensure(surfacesStory.includes('communication-layers-lab.css'), 'Missing Laboratorium decyzji surface CSS import.');
ensure(componentSystem.foundationBaseline.expectedActiveStoryCount === contract.activeVisualLayer.activeEntryStories, 'Component baseline active story count is stale.');

console.log(`Foundation System V1 OK: ${frozenEntries.length} frozen entries.`);

