import {
  spawnSync,
} from 'node:child_process';

import {
  existsSync,
  readFileSync,
} from 'node:fs';

import path from 'node:path';

import {
  fileURLToPath,
} from 'node:url';

const scriptDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const root = path.resolve(
  scriptDirectory,
  '..',
);

const generatorPath = path.join(
  root,
  'scripts/generate-storybook-catalog.mjs',
);

const contractPath = path.join(
  root,
  'apps/web/src/storybook-next/storybook-contract.json',
);

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

ensure(
  existsSync(generatorPath),
  `Missing catalog generator: ${generatorPath}`,
);

const generatedCatalogCheck = spawnSync(
  process.execPath,
  [
    generatorPath,
    '--check',
  ],
  {
    cwd: root,
    stdio: 'inherit',
  },
);

if (generatedCatalogCheck.error) {
  throw generatedCatalogCheck.error;
}

ensure(
  generatedCatalogCheck.status === 0,
  'Generated catalog differs from the contract.',
);

ensure(
  existsSync(contractPath),
  `Missing contract: ${contractPath}`,
);

const contract = JSON.parse(
  readFileSync(contractPath, 'utf8'),
);

ensure(Array.isArray(contract.sections), 'contract.sections is not an array.');
ensure(Array.isArray(contract.entries), 'contract.entries is not an array.');
ensure(contract.sections.length === 22, 'Expected 22 contract sections.');
ensure(contract.entries.length === 220, 'Expected 220 contract entries.');

const entryIds = contract.entries.map(
  (entry) => entry.id,
);

ensure(
  new Set(entryIds).size === entryIds.length,
  'Contract contains duplicate entry IDs.',
);

const statusFields = [
  'documentationStatus',
  'prototypeStatus',
  'productionStatus',
  'testStatus',
  'storyStatus',
  'storyVisibility',
];

for (const entry of contract.entries) {
  ensure(
    !Object.prototype.hasOwnProperty.call(entry, 'implementationStatus'),
    `Entry ${entry.id} still contains implementationStatus.`,
  );

  for (const statusField of statusFields) {
    const allowedValues = contract.statusDefinitions?.[statusField];

    ensure(
      Array.isArray(allowedValues)
      && allowedValues.includes(entry[statusField]),
      `Entry ${entry.id}: invalid ${statusField}.`,
    );
  }

  ensure(
    entry.prototypeStatus === 'none',
    `Entry ${entry.id}: prototypeStatus must remain none.`,
  );

  ensure(
    entry.productionStatus === 'not_started',
    `Entry ${entry.id}: productionStatus must remain not_started.`,
  );

  ensure(
    entry.testStatus === 'not_started',
    `Entry ${entry.id}: testStatus must remain not_started.`,
  );

  if (entry.storyStatus === 'implemented') {
    ensure(
      entry.storyVisibility === 'visible',
      `Entry ${entry.id}: implemented story must be visible.`,
    );

    ensure(
      typeof entry.storyFile === 'string'
      && typeof entry.storyTitle === 'string'
      && typeof entry.storyExport === 'string',
      `Entry ${entry.id}: incomplete story metadata.`,
    );

    ensure(
      !Object.prototype.hasOwnProperty.call(
        entry,
        'storyName',
      ),
      `Entry ${entry.id}: storyName is no longer tracked.`,
    );
  } else {
    ensure(
      entry.storyVisibility === 'hidden',
      `Entry ${entry.id}: non-implemented story must be hidden.`,
    );

    ensure(
      entry.storyFile === null
      && entry.storyTitle === null
      && entry.storyName === undefined
      && entry.storyExport === undefined,
      `Entry ${entry.id}: inactive story metadata remains.`,
    );
  }
}

const policy = contract.visibleStoryPolicy;
const implementedStories = contract.entries.filter(
  (entry) => entry.storyStatus === 'implemented',
);
const visibleStories = contract.entries.filter(
  (entry) => entry.storyVisibility === 'visible',
);
const activeStoryFiles = new Set(
  implementedStories.map(
    (entry) => entry.storyFile,
  ),
);

ensure(Boolean(policy), 'Missing visibleStoryPolicy.');
ensure(policy.sectionOverviewCount === 0, 'sectionOverviewCount must be 0.');
ensure(
  policy.entryStoryCount === implementedStories.length,
  'entryStoryCount differs from implemented stories.',
);
ensure(
  policy.visibleStoryCount === visibleStories.length,
  'visibleStoryCount differs from visible stories.',
);
ensure(
  policy.plannedEntriesRemainInContract === true,
  'Requirements must remain in contract.',
);

ensure(
  contract.activeVisualLayer?.state
    === 'foundations_clean_start',
  'activeVisualLayer.state must be foundations_clean_start.',
);

ensure(
  contract.activeVisualLayer?.legacyPrototypeAllowed === false,
  'Legacy prototype must not be allowed.',
);

ensure(
  contract.activeVisualLayer?.activeStoryFiles
    === activeStoryFiles.size,
  'activeStoryFiles differs from implemented story files.',
);

ensure(
  contract.activeVisualLayer?.activeSectionOverviews === 0,
  'activeSectionOverviews must be 0.',
);

ensure(
  contract.activeVisualLayer?.activeEntryStories
    === implementedStories.length,
  'activeEntryStories differs from implemented stories.',
);

console.log(
  [
    'Storybook requirements contract: PASS.',
    'Sections: 22.',
    'Requirements entries: 220.',
    'Active section overview stories: 0.',
    `Active entry stories: ${implementedStories.length}.`,
    'prototypeStatus none: 220.',
    'productionStatus not_started: 220.',
    'testStatus not_started: 220.',
    `storyStatus implemented: ${implementedStories.length}.`,
    `storyVisibility visible: ${visibleStories.length}.`,
  ].join('\n'),
);
