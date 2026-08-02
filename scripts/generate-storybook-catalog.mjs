import { writeFileSync } from 'node:fs';

import {
  getContract,
  readText,
  resolveFromRoot,
  sha256,
} from './storybook-check-utils.mjs';

const contractText = readText(
  'apps/web/src/storybook-next/storybook-contract.json',
);
const contract = getContract();
const outputPath = resolveFromRoot(
  'apps/web/src/storybook-next/catalog/catalog.generated.ts',
);

const source = `// Ten plik jest generowany automatycznie.
// Nie edytuj go ręcznie.
// Źródło: ../storybook-contract.json
// SHA-256 źródła: ${sha256(contractText)}

import type { CatalogEntryDefinition } from './types';

export const storybookCatalog = ${JSON.stringify(contract.entries, null, 2)} as const satisfies readonly CatalogEntryDefinition[];
`;

if (process.argv.includes('--check')) {
  const current = readText(
    'apps/web/src/storybook-next/catalog/catalog.generated.ts',
  );

  if (current !== source) {
    throw new Error('Generated Storybook catalog differs from the contract.');
  }

  console.log('Storybook catalog is up to date.');
} else {
  writeFileSync(outputPath, source);
  console.log(`Generated ${outputPath}`);
}

