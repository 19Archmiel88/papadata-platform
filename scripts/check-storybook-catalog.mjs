import { spawnSync } from 'node:child_process';

import {
  ensure,
  getCatalogEntries,
  getContract,
  implementedEntries,
  resolveFromRoot,
  uniqueStoryFiles,
  visibleEntries,
} from './storybook-check-utils.mjs';

const contract = getContract();
const catalog = getCatalogEntries();

const generator = spawnSync(
  process.execPath,
  [
    resolveFromRoot('scripts/generate-storybook-catalog.mjs'),
    '--check',
  ],
  {
    cwd: resolveFromRoot(),
    stdio: 'inherit',
  },
);

if (generator.error) {
  throw generator.error;
}

ensure(generator.status === 0, 'Generated catalog check failed.');
ensure(Array.isArray(contract.sections), 'contract.sections must be an array.');
ensure(Array.isArray(contract.entries), 'contract.entries must be an array.');
ensure(contract.sections.length === contract.expectedSectionCount, 'Section count differs from expectedSectionCount.');
ensure(contract.entries.length === contract.expectedEntryCount, 'Entry count differs from expectedEntryCount.');
ensure(catalog.length === contract.entries.length, 'Generated catalog entry count differs from contract.');

const ids = contract.entries.map((entry) => entry.id);
ensure(new Set(ids).size === ids.length, 'Contract contains duplicate entry IDs.');

const catalogIds = catalog.map((entry) => entry.id);
ensure(JSON.stringify(catalogIds) === JSON.stringify(ids), 'Generated catalog order differs from contract.');

const implemented = implementedEntries(contract);
const visible = visibleEntries(contract);
const activeFiles = uniqueStoryFiles(implemented);

ensure(contract.visibleStoryPolicy.entryStoryCount === implemented.length, 'visibleStoryPolicy.entryStoryCount is stale.');
ensure(contract.visibleStoryPolicy.visibleStoryCount === visible.length, 'visibleStoryPolicy.visibleStoryCount is stale.');
ensure(contract.activeVisualLayer.activeEntryStories === implemented.length, 'activeVisualLayer.activeEntryStories is stale.');
ensure(contract.activeVisualLayer.activeStoryFiles === activeFiles.size, 'activeVisualLayer.activeStoryFiles is stale.');
ensure(contract.activeVisualLayer.legacyPrototypeAllowed === false, 'Legacy prototype must remain disabled.');

for (const entry of contract.entries) {
  ensure(contract.statusDefinitions.sourceStatus.includes(entry.sourceStatus), `${entry.id}: invalid sourceStatus.`);
  ensure(contract.statusDefinitions.documentationStatus.includes(entry.documentationStatus), `${entry.id}: invalid documentationStatus.`);
  ensure(contract.statusDefinitions.prototypeStatus.includes(entry.prototypeStatus), `${entry.id}: invalid prototypeStatus.`);
  ensure(contract.statusDefinitions.productionStatus.includes(entry.productionStatus), `${entry.id}: invalid productionStatus.`);
  ensure(contract.statusDefinitions.testStatus.includes(entry.testStatus), `${entry.id}: invalid testStatus.`);
  ensure(contract.statusDefinitions.storyStatus.includes(entry.storyStatus), `${entry.id}: invalid storyStatus.`);
  ensure(contract.statusDefinitions.storyVisibility.includes(entry.storyVisibility), `${entry.id}: invalid storyVisibility.`);

  if (entry.storyStatus === 'implemented') {
    ensure(entry.storyVisibility === 'visible', `${entry.id}: implemented story must be visible.`);
    ensure(typeof entry.storyFile === 'string', `${entry.id}: missing storyFile.`);
    ensure(typeof entry.storyTitle === 'string', `${entry.id}: missing storyTitle.`);
    ensure(typeof entry.storyExport === 'string', `${entry.id}: missing storyExport.`);
  } else {
    ensure(entry.storyVisibility === 'hidden', `${entry.id}: planned story must be hidden.`);
    ensure(entry.storyFile === null, `${entry.id}: planned story must not point to a file.`);
    ensure(entry.storyTitle === null, `${entry.id}: planned story must not point to a title.`);
  }
}

console.log(`Storybook contract/catalog OK: ${contract.entries.length} entries, ${implemented.length} implemented stories.`);

