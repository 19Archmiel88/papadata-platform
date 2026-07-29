import {
  createHash,
} from 'node:crypto';

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
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

const contractPath = path.join(
  root,
  'apps/web/src/storybook-next/storybook-contract.json',
);

const generatedCatalogPath = path.join(
  root,
  'apps/web/src/storybook-next/catalog/catalog.generated.ts',
);

const checkOnly = process.argv.includes(
  '--check',
);

if (!existsSync(contractPath)) {
  throw new Error(
    `Brak kontraktu: ${contractPath}`,
  );
}

const contractSource = readFileSync(
  contractPath,
  'utf8',
);

const contract = JSON.parse(
  contractSource,
);

if (!Array.isArray(contract.entries)) {
  throw new Error(
    'contract.entries nie jest tablicą.',
  );
}

if (
  typeof contract.expectedEntryCount !== 'number'
  || contract.entries.length
    !== contract.expectedEntryCount
) {
  throw new Error(
    'Liczba pozycji kontraktu jest niespójna '
    + 'z expectedEntryCount.',
  );
}

const entryIds = contract.entries.map(
  (entry) => entry.id,
);

if (
  entryIds.some(
    (entryId) => typeof entryId !== 'string',
  )
) {
  throw new Error(
    'Każda pozycja kontraktu musi mieć tekstowe id.',
  );
}

if (
  new Set(entryIds).size
  !== entryIds.length
) {
  throw new Error(
    'Kontrakt zawiera zduplikowane identyfikatory.',
  );
}

const expectedStatusDefinitions = {
  sourceStatus: [
    'accepted',
    'specified',
  ],
  documentationStatus: [
    'planned',
    'draft',
    'review',
    'accepted',
    'deprecated',
  ],
  prototypeStatus: [
    'none',
    'draft',
    'in_progress',
    'review',
    'implemented',
    'deprecated',
  ],
  productionStatus: [
    'not_started',
    'in_progress',
    'review',
    'implemented',
    'deprecated',
  ],
  testStatus: [
    'not_started',
    'partial',
    'passing',
    'failing',
    'blocked',
  ],
  storyStatus: [
    'planned',
    'implemented',
    'deprecated',
  ],
  storyVisibility: [
    'visible',
    'hidden',
  ],
};

function assertStringArrayEqual(
  actual,
  expected,
  label,
) {
  if (
    !Array.isArray(actual)
    || actual.length !== expected.length
    || actual.some(
      (value, index) =>
        value !== expected[index],
    )
  ) {
    throw new Error(
      `${label} ma niepoprawną definicję.`,
    );
  }
}

if (
  !contract.statusDefinitions
  || typeof contract.statusDefinitions
    !== 'object'
) {
  throw new Error(
    'Brak contract.statusDefinitions.',
  );
}

for (
  const [statusName, expectedValues]
  of Object.entries(
    expectedStatusDefinitions,
  )
) {
  assertStringArrayEqual(
    contract.statusDefinitions[
      statusName
    ],
    expectedValues,
    `statusDefinitions.${statusName}`,
  );
}

for (const entry of contract.entries) {
  if (
    Object.prototype.hasOwnProperty.call(
      entry,
      'implementationStatus',
    )
  ) {
    throw new Error(
      `Pozycja ${entry.id} nadal zawiera implementationStatus.`,
    );
  }

  for (
    const statusName
    of Object.keys(
      expectedStatusDefinitions,
    )
  ) {
    const allowedValues = new Set(
      expectedStatusDefinitions[
        statusName
      ],
    );

    if (
      !allowedValues.has(
        entry[statusName],
      )
    ) {
      throw new Error(
        `Pozycja ${entry.id}: niepoprawne ${statusName}.`,
      );
    }
  }

  if (
    entry.storyStatus === 'implemented'
  ) {
    if (
      entry.storyVisibility !== 'visible'
    ) {
      throw new Error(
        `Pozycja ${entry.id}: wdrożone story musi być widoczne.`,
      );
    }

    if (
      !entry.storyFile
      || !entry.storyTitle
      || !entry.storyExport
    ) {
      throw new Error(
        `Pozycja ${entry.id}: niekompletne dane story.`,
      );
    }
  }

  if (
    entry.storyStatus === 'planned'
  ) {
    if (
      entry.storyVisibility !== 'hidden'
    ) {
      throw new Error(
        `Pozycja ${entry.id}: planowane story musi być ukryte.`,
      );
    }

    if (
      entry.storyFile !== null
      || entry.storyTitle !== null
      || entry.storyName !== undefined
      || entry.storyExport !== undefined
    ) {
      throw new Error(
        `Pozycja ${entry.id}: planowane story zawiera dane pliku.`,
      );
    }
  }
}

const contractHash = createHash('sha256')
  .update(contractSource)
  .digest('hex');

const generatedSource = [
  '// Ten plik jest generowany automatycznie.',
  '// Nie edytuj go ręcznie.',
  '// Źródło: ../storybook-contract.json',
  `// SHA-256 źródła: ${contractHash}`,
  '',
  "import type { CatalogEntryDefinition } from './types';",
  '',
  `export const storybookCatalog = ${JSON.stringify(
    contract.entries,
    null,
    2,
  )} as const satisfies readonly CatalogEntryDefinition[];`,
  '',
].join('\n');

if (checkOnly) {
  if (!existsSync(generatedCatalogPath)) {
    throw new Error(
      [
        `Brak pliku generowanego: ${generatedCatalogPath}`,
        'Uruchom:',
        'pnpm --filter @papadata/web '
          + 'generate-storybook-catalog',
      ].join('\n'),
    );
  }

  const currentSource = readFileSync(
    generatedCatalogPath,
    'utf8',
  );

  if (currentSource !== generatedSource) {
    throw new Error(
      [
        'catalog.generated.ts jest niezgodny '
          + 'ze storybook-contract.json.',
        'Uruchom:',
        'pnpm --filter @papadata/web '
          + 'generate-storybook-catalog',
      ].join('\n'),
    );
  }

  console.log(
    'Katalog generowany jest zgodny '
    + 'ze storybook-contract.json.',
  );
} else {
  mkdirSync(
    path.dirname(generatedCatalogPath),
    {
      recursive: true,
    },
  );

  const currentSource = existsSync(
    generatedCatalogPath,
  )
    ? readFileSync(
        generatedCatalogPath,
        'utf8',
      )
    : null;

  if (currentSource === generatedSource) {
    console.log(
      'catalog.generated.ts jest już aktualny.',
    );
  } else {
    writeFileSync(
      generatedCatalogPath,
      generatedSource,
      'utf8',
    );

    console.log(
      `Wygenerowano: ${generatedCatalogPath}`,
    );
  }
}
