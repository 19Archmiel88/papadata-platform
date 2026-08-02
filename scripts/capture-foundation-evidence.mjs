import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  getContract,
  implementedEntries,
  readJson,
  resolveFromRoot,
  uniqueStoryFiles,
  visibleEntries,
} from './storybook-check-utils.mjs';

const contract = getContract();
const storybookIndex = readJson('apps/web/storybook-static/index.json');
const outputDirectory = path.resolve(
  process.argv.find((argument) => !argument.startsWith('--') && argument !== process.argv[0] && argument !== process.argv[1])
    ?? resolveFromRoot('foundation-evidence'),
);

const evidence = {
  activeStoryFiles: [...uniqueStoryFiles(implementedEntries(contract))],
  contractEntries: contract.entries.length,
  generatedAt: new Date().toISOString(),
  implementedStories: implementedEntries(contract).length,
  storybookStories: Object.keys(storybookIndex.entries ?? {}).length,
  visibleStories: visibleEntries(contract).length,
};

mkdirSync(outputDirectory, {
  recursive: true,
});
writeFileSync(
  path.join(outputDirectory, 'summary.json'),
  `${JSON.stringify(evidence, null, 2)}\n`,
);

console.log(`Foundation evidence captured: ${path.join(outputDirectory, 'summary.json')}`);

