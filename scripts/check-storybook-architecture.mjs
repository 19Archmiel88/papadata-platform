import {
  ensure,
  getContract,
  readText,
  resolveFromRoot,
  uniqueStoryFiles,
  implementedEntries,
} from './storybook-check-utils.mjs';

const contract = getContract();
const implemented = implementedEntries(contract);

ensure(contract.visibleStoryPolicy.sectionOverviewCount === 0, 'Section overview stories must remain disabled.');
ensure(contract.visibleStoryPolicy.technicalIdentifiersVisibleInSidebar === false, 'Technical IDs must not be visible in the sidebar.');
ensure(contract.activeVisualLayer.state === 'component_system_v1', 'Active visual layer must be component_system_v1.');
ensure(contract.activeVisualLayer.implementationSource === 'apps/web/src/design-system', 'Implementation source must be the design system.');

for (const storyFile of uniqueStoryFiles(implemented)) {
  const storySource = readText(storyFile);
  ensure(storySource.includes('Meta'), `${storyFile}: missing Storybook meta export.`);
}

const preview = readText('apps/web/.storybook/preview.tsx');
ensure(preview.includes('withPapaDataRuntime'), 'Storybook preview must install PapaData runtime globals.');
ensure(preview.includes('applyPapaDataRuntimeGlobals'), 'Storybook preview must apply runtime globals.');

const catalogTypes = readText('apps/web/src/storybook-next/catalog/types.ts');
ensure(catalogTypes.includes('CatalogEntryDefinition'), 'Catalog entry type is missing.');

console.log(`Storybook architecture OK in ${resolveFromRoot()}.`);
