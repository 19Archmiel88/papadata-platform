import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');

const contractPath = path.join(
  root,
  'apps/web/src/storybook-next/storybook-contract.json',
);

const taxonomyPath = path.join(
  root,
  'apps/web/src/storybook-next/storybook-taxonomy-map.json',
);

const documentPath = path.join(
  root,
  'docs/storybook/STORYBOOK-TAXONOMY-DECISIONS.md',
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function compactJson(value) {
  return JSON.stringify(value);
}

function contractIdentity(contract) {
  const identity = {
    sections: contract.sections.map((section) => ({
      id: section.id,
      title: section.title,
      folder: section.folder,
      storyClass: section.storyClass,
      layer: section.layer,
      entryCount: section.entryCount,
    })),
    entries: contract.entries.map((entry) => ({
      id: entry.id,
      sectionId: entry.sectionId,
    })),
  };

  return crypto
    .createHash('sha256')
    .update(compactJson(identity), 'utf8')
    .digest('hex');
}

function taxonomyDigest(taxonomy) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(taxonomy, null, 2) + '\n', 'utf8')
    .digest('hex');
}

function ensure(condition, message, errors) {
  if (!condition) {
    errors.push(message);
  }
}

function uniqueValues(items) {
  return new Set(items).size === items.length;
}

function validate(contract, taxonomy) {
  const errors = [];

  ensure(taxonomy.schemaVersion === 2, 'schemaVersion must be 2.', errors);
  ensure(taxonomy.decisionId === 'SB-TAXONOMY-002', 'Unexpected decisionId.', errors);
  ensure(taxonomy.status === 'accepted', 'Taxonomy status must be accepted.', errors);
  ensure(
    taxonomy.sourceContract === 'apps/web/src/storybook-next/storybook-contract.json',
    'Invalid sourceContract.',
    errors,
  );
  ensure(
    taxonomy.expectedSectionCount === contract.sections.length,
    'expectedSectionCount differs from contract.',
    errors,
  );
  ensure(
    taxonomy.expectedEntryCount === contract.entries.length,
    'expectedEntryCount differs from contract.',
    errors,
  );

  const actualIdentity = contractIdentity(contract);

  ensure(
    taxonomy.baselineContractIdentitySha256 === actualIdentity,
    'Contract identity changed.',
    errors,
  );

  const requiredPolicies = {
    preserveEntryIds: true,
    requirementsRemainInContract: true,
    activeVisualLayerReset: true,
    zeroActiveStoriesAfterReset: true,
    legacyPrototypeAllowed: false,
    newVisibleRootRequiresDecision: true,
    singlePrimaryRootPerCurrentSection: true,
    entryOverridesAllowed: true,
    internalGroupsAreNotSidebarRoots: true,
  };

  for (const [policyName, expectedValue] of Object.entries(requiredPolicies)) {
    ensure(
      taxonomy.policies?.[policyName] === expectedValue,
      `Policy ${policyName} must equal ${expectedValue}.`,
      errors,
    );
  }

  const roots = taxonomy.canonicalRoots ?? [];
  const internalGroups = taxonomy.internalGroups ?? [];
  const mappings = taxonomy.sectionMappings ?? [];
  const overrides = taxonomy.entryOverrides ?? [];
  const rootIds = roots.map((item) => item.id);
  const internalIds = internalGroups.map((item) => item.id);
  const targetIds = [...rootIds, ...internalIds];

  ensure(
    rootIds.join(',') === '00,05,10,20,25,30,40,50,60,70,80,90',
    'Canonical root list changed.',
    errors,
  );
  ensure(uniqueValues(targetIds), 'Duplicate target IDs.', errors);

  const contractSectionsById = new Map(
    contract.sections.map((section) => [section.id, section]),
  );
  const mappingIds = mappings.map((mapping) => mapping.sectionId);

  ensure(uniqueValues(mappingIds), 'Duplicate section mapping.', errors);
  ensure(
    mappingIds.length === contract.sections.length,
    'Section mapping count differs from contract.',
    errors,
  );

  for (const section of contract.sections) {
    ensure(
      mappingIds.includes(section.id),
      `Missing mapping for section ${section.id}.`,
      errors,
    );
  }

  for (const mapping of mappings) {
    const section = contractSectionsById.get(mapping.sectionId);
    ensure(Boolean(section), `Unknown section ${mapping.sectionId}.`, errors);

    if (!section) {
      continue;
    }

    ensure(mapping.currentTitle === section.title, `Stale title for ${mapping.sectionId}.`, errors);
    ensure(mapping.currentFolder === section.folder, `Stale folder for ${mapping.sectionId}.`, errors);
    ensure(targetIds.includes(mapping.primaryRootId), `Unknown target for ${mapping.sectionId}.`, errors);
    ensure(Array.isArray(mapping.plannedPath) && mapping.plannedPath.length > 0, `Missing path for ${mapping.sectionId}.`, errors);
  }

  const contractEntriesById = new Map(
    contract.entries.map((entry) => [entry.id, entry]),
  );
  const overrideIds = overrides.map((override) => override.entryId);

  ensure(uniqueValues(overrideIds), 'Duplicate entry override.', errors);

  for (const override of overrides) {
    ensure(
      contractEntriesById.has(override.entryId),
      `Unknown override entry ${override.entryId}.`,
      errors,
    );
    ensure(
      targetIds.includes(override.targetRootId),
      `Unknown override target ${override.targetRootId}.`,
      errors,
    );
  }

  ensure(
    contract.entries.every((entry) => entry.prototypeStatus === 'none'),
    'All entries must have prototypeStatus none after visual reset.',
    errors,
  );
  ensure(
    contract.entries.every((entry) => entry.storyStatus === 'planned'),
    'All entries must have storyStatus planned after visual reset.',
    errors,
  );
  ensure(
    contract.entries.every((entry) => entry.storyVisibility === 'hidden'),
    'All entries must be hidden after visual reset.',
    errors,
  );

  const mappingsBySectionId = new Map(
    mappings.map((mapping) => [mapping.sectionId, mapping]),
  );
  const overridesByEntryId = new Map(
    overrides.map((override) => [override.entryId, override]),
  );
  const resolvedCounts = new Map(
    targetIds.map((targetId) => [targetId, 0]),
  );

  for (const entry of contract.entries) {
    const targetId = overridesByEntryId.get(entry.id)?.targetRootId
      ?? mappingsBySectionId.get(entry.sectionId)?.primaryRootId;

    ensure(Boolean(targetId), `No target for entry ${entry.id}.`, errors);

    if (targetId && resolvedCounts.has(targetId)) {
      resolvedCounts.set(targetId, resolvedCounts.get(targetId) + 1);
    }
  }

  return {
    errors,
    stats: {
      sections: contract.sections.length,
      entries: contract.entries.length,
      canonicalRoots: roots.length,
      internalGroups: internalGroups.length,
      overrides: overrides.length,
      contractIdentitySha256: actualIdentity,
      taxonomySha256: taxonomyDigest(taxonomy),
      resolvedCounts: Object.fromEntries(resolvedCounts),
    },
  };
}

function escapeTable(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function renderDecisionDocument(contract, taxonomy, stats) {
  const rootsById = new Map([
    ...taxonomy.canonicalRoots.map((item) => [item.id, item]),
    ...taxonomy.internalGroups.map((item) => [item.id, item]),
  ]);
  const entriesById = new Map(
    contract.entries.map((entry) => [entry.id, entry]),
  );

  const lines = [
    '# PapaData - decyzje taksonomii Storybooka',
    '',
    `Decyzja: \`${taxonomy.decisionId}\``,
    `Status: \`${taxonomy.status}\``,
    `Zrodlo maszynowe: \`${path.relative(root, taxonomyPath)}\``,
    `Zrodlo katalogu: \`${taxonomy.sourceContract}\``,
    '',
    '## Stan aktywnej warstwy wizualnej',
    '',
    'Aktywna warstwa wizualna Storybooka zostala wyzerowana. Poprzednie stories, ShowcaseKit, wrappery demonstracyjne i lokalne style nie sa czescia biezacego systemu.',
    '',
    '- wymagania: 220 pozycji w kontrakcie;',
    '- aktywne stories: 0;',
    '- prototypeStatus implemented: 0;',
    '- wszystkie nowe implementacje maja wynikac z dokumentacji normatywnej i biezacych decyzji produktowych.',
    '',
    '## Cel',
    '',
    taxonomy.purpose,
    '',
    '## Kanoniczne rooty',
    '',
    '| Root | Nazwa | Widocznosc | Cykl zycia | Przeznaczenie |',
    '|---|---|---|---|---|',
  ];

  for (const rootItem of taxonomy.canonicalRoots) {
    lines.push(
      `| ${escapeTable(rootItem.id)} | ${escapeTable(rootItem.title)} | ${escapeTable(rootItem.visibility)} | ${escapeTable(rootItem.lifecycle)} | ${escapeTable(rootItem.purpose)} |`,
    );
  }

  for (const internalGroup of taxonomy.internalGroups) {
    lines.push(
      `| ${escapeTable(internalGroup.id)} | ${escapeTable(internalGroup.title)} | ${escapeTable(internalGroup.visibility)} | internal | ${escapeTable(internalGroup.purpose)} |`,
    );
  }

  lines.push(
    '',
    '## Mapowanie wymagan',
    '',
    '| Sekcja kontraktu | Nazwa | Root docelowy | Planowana sciezka | Dyspozycja | Decyzja |',
    '|---|---|---|---|---|---|',
  );

  for (const mapping of taxonomy.sectionMappings) {
    const target = rootsById.get(mapping.primaryRootId);
    lines.push(
      `| ${escapeTable(mapping.sectionId)} | ${escapeTable(mapping.currentTitle)} | ${escapeTable(`${mapping.primaryRootId} ${target?.title ?? ''}`.trim())} | ${escapeTable(mapping.plannedPath.join(' / '))} | ${escapeTable(mapping.disposition)} | ${escapeTable(mapping.decision)} |`,
    );
  }

  lines.push(
    '',
    '## Wyjatki na poziomie pozycji',
    '',
    '| entryId | Pozycja | Root docelowy | Planowana sciezka | Uzasadnienie |',
    '|---|---|---|---|---|',
  );

  for (const override of taxonomy.entryOverrides) {
    const entry = entriesById.get(override.entryId);
    const target = rootsById.get(override.targetRootId);
    lines.push(
      `| ${escapeTable(override.entryId)} | ${escapeTable(entry?.title ?? 'BRAK')} | ${escapeTable(`${override.targetRootId} ${target?.title ?? ''}`.trim())} | ${escapeTable(override.plannedPath.join(' / '))} | ${escapeTable(override.reason)} |`,
    );
  }

  lines.push(
    '',
    '## Rozklad 220 wymagan',
    '',
    '| Root | Liczba pozycji |',
    '|---|---:|',
  );

  for (const [targetId, count] of Object.entries(stats.resolvedCounts)) {
    const target = rootsById.get(targetId);
    lines.push(
      `| ${escapeTable(`${targetId} ${target?.title ?? ''}`.trim())} | ${count} |`,
    );
  }

  lines.push(
    '',
    '## Zasady dalszego rozwoju',
    '',
    '- Nie wolno przywracac ShowcaseKit ani starej warstwy CSS.',
    '- Nowe story powstaje przy produkcyjnej implementacji lub jako jawne laboratorium decyzji.',
    '- Zmiana storyStatus, prototypeStatus, productionStatus i testStatus wymaga rzeczywistego dowodu.',
    '- Lista 220 wymagan pozostaje zakresem produktu, a nie lista aktywnych atrap.',
    '',
    '## Integralnosc',
    '',
    `- Contract identity SHA-256: \`${stats.contractIdentitySha256}\``,
    `- Taxonomy SHA-256: \`${stats.taxonomySha256}\``,
    '',
    '<!-- GENERATED BY scripts/check-storybook-taxonomy.mjs --write-doc -->',
    '',
  );

  return lines.join('\n');
}

function assertValid(contract, taxonomy) {
  const result = validate(contract, taxonomy);

  if (result.errors.length > 0) {
    throw new Error(`Taxonomy check failed:\n- ${result.errors.join('\n- ')}`);
  }

  return result.stats;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectFailure(label, callback) {
  let failed = false;
  try {
    callback();
  } catch {
    failed = true;
  }
  if (!failed) {
    throw new Error(`Self-test did not detect: ${label}`);
  }
}

function runSelfTest(contract, taxonomy) {
  assertValid(contract, taxonomy);

  expectFailure('missing section mapping', () => {
    const changed = clone(taxonomy);
    changed.sectionMappings.pop();
    assertValid(contract, changed);
  });

  expectFailure('unknown target root', () => {
    const changed = clone(taxonomy);
    changed.sectionMappings[0].primaryRootId = '77';
    assertValid(contract, changed);
  });

  expectFailure('restored legacy prototype', () => {
    const changedContract = clone(contract);
    changedContract.entries[0].prototypeStatus = 'implemented';
    assertValid(changedContract, taxonomy);
  });

  expectFailure('changed entry ID', () => {
    const changedContract = clone(contract);
    changedContract.entries[0].id = '00.99';
    assertValid(changedContract, taxonomy);
  });

  console.log('Storybook taxonomy self-test: PASS.');
}

const contract = readJson(contractPath);
const taxonomy = readJson(taxonomyPath);
const stats = assertValid(contract, taxonomy);
const expectedDocument = renderDecisionDocument(contract, taxonomy, stats);

if (process.argv.includes('--write-doc')) {
  fs.mkdirSync(path.dirname(documentPath), { recursive: true });
  fs.writeFileSync(documentPath, expectedDocument, 'utf8');
  console.log(`Saved taxonomy document: ${path.relative(root, documentPath)}`);
}

if (process.argv.includes('--self-test')) {
  runSelfTest(contract, taxonomy);
}

if (!fs.existsSync(documentPath)) {
  throw new Error('Missing generated taxonomy document. Run with --write-doc.');
}

const actualDocument = fs.readFileSync(documentPath, 'utf8');

if (actualDocument !== expectedDocument) {
  throw new Error('Taxonomy document differs from JSON. Run with --write-doc.');
}

console.log(
  [
    'Storybook taxonomy: PASS.',
    `Sections: ${stats.sections}.`,
    `Entries: ${stats.entries}.`,
    `Visible roots: ${stats.canonicalRoots}.`,
    `Internal groups: ${stats.internalGroups}.`,
    `Entry overrides: ${stats.overrides}.`,
  ].join(' '),
);
