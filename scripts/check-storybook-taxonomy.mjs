import { writeFileSync } from 'node:fs';

import {
  ensure,
  getContract,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const contract = getContract();
const sectionIds = new Set(contract.sections.map((section) => section.id));

for (const entry of contract.entries) {
  ensure(sectionIds.has(entry.sectionId), `${entry.id}: unknown sectionId ${entry.sectionId}.`);
  ensure(entry.title && entry.displayTitle, `${entry.id}: missing display title.`);
  ensure(entry.folder, `${entry.id}: missing folder.`);
  ensure(contract.storyClasses.includes(entry.storyClass), `${entry.id}: invalid storyClass.`);
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

