import {
  spawnSync,
} from 'node:child_process';

import {
  existsSync,
  readFileSync,
  readdirSync,
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

const storiesRoot = path.join(
  root,
  'apps/web/src/storybook-next/stories',
);

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function collectStoryFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const result = [];

  for (
    const entry
    of readdirSync(
      directory,
      {
        withFileTypes: true,
      },
    )
  ) {
    const absolutePath = path.join(
      directory,
      entry.name,
    );

    if (entry.isDirectory()) {
      result.push(
        ...collectStoryFiles(absolutePath),
      );
      continue;
    }

    if (
      entry.isFile()
      && (
        entry.name.includes('.stories.')
        || entry.name.endsWith('.mdx')
      )
    ) {
      result.push(absolutePath);
    }
  }

  return result.sort();
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

ensure(
  existsSync(storiesRoot),
  `Missing empty stories target directory: ${storiesRoot}`,
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
    `Entry ${entry.id}: prototypeStatus must be none after reset.`,
  );

  ensure(
    entry.productionStatus === 'not_started',
    `Entry ${entry.id}: productionStatus must be not_started after reset.`,
  );

  ensure(
    entry.testStatus === 'not_started',
    `Entry ${entry.id}: testStatus must be not_started after reset.`,
  );

  ensure(
    entry.storyStatus === 'planned',
    `Entry ${entry.id}: storyStatus must be planned after reset.`,
  );

  ensure(
    entry.storyVisibility === 'hidden',
    `Entry ${entry.id}: storyVisibility must be hidden after reset.`,
  );

  ensure(
    entry.storyFile === null
    && entry.storyTitle === null
    && entry.storyName === undefined
    && entry.storyExport === undefined,
    `Entry ${entry.id}: active story metadata remains after reset.`,
  );
}

const policy = contract.visibleStoryPolicy;

ensure(Boolean(policy), 'Missing visibleStoryPolicy.');
ensure(policy.sectionOverviewCount === 0, 'sectionOverviewCount must be 0.');
ensure(policy.entryStoryCount === 0, 'entryStoryCount must be 0.');
ensure(policy.visibleStoryCount === 0, 'visibleStoryCount must be 0.');
ensure(policy.plannedEntriesRemainInContract === true, 'Requirements must remain in contract.');

ensure(
  contract.activeVisualLayer?.state === 'reset',
  'activeVisualLayer.state must be reset.',
);

ensure(
  contract.activeVisualLayer?.legacyPrototypeAllowed === false,
  'Legacy prototype must not be allowed.',
);

const storyFiles = collectStoryFiles(storiesRoot);

ensure(
  storyFiles.length === 0,
  `Active Storybook visual files remain:\n${storyFiles.join('\n')}`,
);

console.log(
  [
    'Storybook requirements contract: PASS.',
    'Sections: 22.',
    'Requirements entries: 220.',
    'Active section overview stories: 0.',
    'Active entry stories: 0.',
    'prototypeStatus none: 220.',
    'productionStatus not_started: 220.',
    'testStatus not_started: 220.',
    'storyStatus planned: 220.',
    'storyVisibility hidden: 220.',
  ].join('\n'),
);
