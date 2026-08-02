import {
  ensure,
  getContract,
  readJson,
  readText,
} from './storybook-check-utils.mjs';

const contract = getContract();
const componentSystem = readJson('apps/web/src/design-system/component-system-v1.json');
const componentIndex = readText('apps/web/src/design-system/components/index.ts');
const designSystemIndex = readText('apps/web/src/design-system/index.ts');
const iconsIndex = readText('apps/web/src/design-system/icons/index.ts');

const entries = new Map(contract.entries.map((entry) => [entry.id, entry]));

for (const component of componentSystem.requiredComponents) {
  ensure(
    componentIndex.includes(component)
      || iconsIndex.includes(component)
      || designSystemIndex.includes(component),
    `Missing component export ${component}.`,
  );
}

for (const exportName of componentSystem.requiredComponentExports) {
  ensure(componentIndex.includes(exportName), `Missing component type export ${exportName}.`);
}

for (const entryId of componentSystem.activeComponentEntries) {
  const entry = entries.get(entryId);
  ensure(entry, `Missing component catalog entry ${entryId}.`);
  ensure(entry.storyStatus === 'implemented', `${entryId}: component story must be implemented.`);
  ensure(entry.storyVisibility === 'visible', `${entryId}: component story must be visible.`);
}

ensure(componentSystem.finalizedComponentEntries.every((entryId) => componentSystem.activeComponentEntries.includes(entryId)), 'Finalized component entries must be active.');

console.log(`Component System V1 OK: ${componentSystem.activeComponentEntries.length} active component entries.`);
