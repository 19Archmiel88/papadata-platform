import { writeFileSync } from 'node:fs';

import {
  ensure,
  getCatalogEntries,
  getContract,
  implementedEntries,
  readJson,
  readText,
  resolveFromRoot,
  uniqueStoryFiles,
} from './storybook-check-utils.mjs';

const contract = getContract();
const catalog = getCatalogEntries();
const taxonomyMap = readJson('apps/web/src/storybook-next/storybook-taxonomy-map.json');
const componentSystem = readJson('apps/web/src/design-system/component-system-v1.json');
const storybookRegistry = readText('rejestry/storybook.csv');
const implemented = implementedEntries(contract);
const sectionIds = new Set(contract.sections.map((section) => section.id));
const activeStoryFiles = uniqueStoryFiles(implemented);

for (const entry of contract.entries) {
  ensure(sectionIds.has(entry.sectionId), `${entry.id}: unknown sectionId ${entry.sectionId}.`);
  ensure(entry.title && entry.displayTitle, `${entry.id}: missing display title.`);
  ensure(entry.folder, `${entry.id}: missing folder.`);
  ensure(contract.storyClasses.includes(entry.storyClass), `${entry.id}: invalid storyClass.`);
}

ensure(taxonomyMap.sourceContract === 'apps/web/src/storybook-next/storybook-contract.json', 'Taxonomy map must point to the active Storybook contract.');
ensure(taxonomyMap.expectedSectionCount === contract.expectedSectionCount, 'Taxonomy map section count differs from active Storybook contract.');
ensure(taxonomyMap.expectedEntryCount === contract.expectedEntryCount, 'Taxonomy map entry count differs from active Storybook contract.');
ensure(catalog.length === contract.entries.length, 'Generated catalog entry count differs from active Storybook contract.');
ensure(componentSystem.foundationBaseline.expectedActiveStoryCount === implemented.length, 'Component baseline active story count differs from active Storybook contract.');
ensure(componentSystem.foundationBaseline.expectedActiveStoryFileCount === activeStoryFiles.size, 'Component baseline active story file count differs from active Storybook contract.');

const storybookRegistryLines = storybookRegistry.trimEnd().split('\n');
const storybookRegistryHeader = storybookRegistryLines[0].split(',');
ensure(storybookRegistryHeader.includes('registry_scope'), 'Storybook registry must declare registry_scope.');
ensure(storybookRegistryHeader.includes('active_sidebar_source'), 'Storybook registry must declare active_sidebar_source.');
for (const line of storybookRegistryLines.slice(1)) {
  ensure(
    line.endsWith(',target-backlog-registry,apps/web/src/storybook-next/storybook-contract.json'),
    'Storybook registry rows must be explicitly scoped as target/backlog and point to the active sidebar source.',
  );
}

if (process.argv.includes('--write-doc')) {
  const rows = contract.sections.map((section) => {
    const count = contract.entries.filter((entry) => entry.sectionId === section.id).length;
    return `- ${section.id} ${section.title}: ${count}`;
  });
  writeFileSync(
    resolveFromRoot('docs/storybook-taxonomy.generated.md'),
    `# Storybook Taxonomy\n\n${rows.join('\n')}\n`,
  );
}

console.log(`Storybook taxonomy OK: ${contract.sections.length} sections.`);
