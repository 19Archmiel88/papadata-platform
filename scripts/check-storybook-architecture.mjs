import {
  existsSync,
  readFileSync,
  readdirSync,
} from 'node:fs';

import path from 'node:path';

import {
  fileURLToPath,
} from 'node:url';

import * as ts from 'typescript';

const scriptDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

const root = path.resolve(scriptDirectory, '..');
const webRoot = path.join(root, 'apps/web');
const srcRoot = path.join(webRoot, 'src');
const storybookRoot = path.join(srcRoot, 'storybook-next');
const contractPath = path.join(
  storybookRoot,
  'storybook-contract.json',
);
const taxonomyPath = path.join(
  storybookRoot,
  'storybook-taxonomy-map.json',
);
const packagePath = path.join(webRoot, 'package.json');
const mainPath = path.join(webRoot, '.storybook/main.ts');
const previewPath = path.join(webRoot, '.storybook/preview.tsx');
const appMainPath = path.join(srcRoot, 'app/main.tsx');
const appCssPath = path.join(srcRoot, 'app/app.css');
const generatedCatalogPath = path.join(
  storybookRoot,
  'catalog/catalog.generated.ts',
);
const foundationsEntrypointCssPath = path.join(
  srcRoot,
  'design-system/foundations/foundations.css',
);
const tokenDefinitionsCssPath = path.join(
  srcRoot,
  'design-system/foundations/themes/carbon-pearl.css',
);

const emptyStorybookDirectories = [
  'components',
  'decorators',
  'docs',
  'fixtures',
  'styles',
];

const forbiddenFragments = [
  '--pds-',
  'ShowcaseKit',
  'ComponentDocumentation',
  'SurfaceDocumentation',
  'SystemShowcases',
  'system-showcases.css',
  'showcase-kit-freeze.json',
  'storybook-next/styles/index.css',
  'storybook-next/components/showcases',
];

const textExtensions = new Set([
  '.css',
  '.js',
  '.jsx',
  '.json',
  '.mdx',
  '.mjs',
  '.ts',
  '.tsx',
]);

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function relativePath(filePath) {
  return toPosixPath(path.relative(root, filePath));
}

function walk(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];

  for (
    const entry
    of readdirSync(directory, { withFileTypes: true })
  ) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(absolutePath));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files.sort();
}

function isStoryFile(filePath) {
  const base = path.basename(filePath);

  return (
    base.includes('.stories.')
    || base.endsWith('.mdx')
  );
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath));
}

function unwrapExpression(expression) {
  let current = expression;

  while (
    ts.isAsExpression(current)
    || ts.isParenthesizedExpression(current)
    || ts.isSatisfiesExpression(current)
  ) {
    current = current.expression;
  }

  return current;
}

function getStringLiteral(expression) {
  const unwrapped = unwrapExpression(expression);

  if (
    ts.isStringLiteral(unwrapped)
    || ts.isNoSubstitutionTemplateLiteral(unwrapped)
  ) {
    return unwrapped.text;
  }

  return null;
}

function getPropertyName(name) {
  if (
    ts.isIdentifier(name)
    || ts.isStringLiteral(name)
  ) {
    return name.text;
  }

  return null;
}

function getObjectProperty(objectLiteral, propertyName) {
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }

    if (
      getPropertyName(property.name)
      === propertyName
    ) {
      return property.initializer;
    }
  }

  return null;
}

function hasExportModifier(node) {
  return Boolean(
    node.modifiers?.some(
      (modifier) =>
        modifier.kind === ts.SyntaxKind.ExportKeyword,
    ),
  );
}

function parseStoryFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx')
      ? ts.ScriptKind.TSX
      : ts.ScriptKind.TS,
  );
  const objectVariables = new Map();
  const storyExports = [];
  let defaultExportName = null;
  let defaultObject = null;

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (
        const declaration
        of statement.declarationList.declarations
      ) {
        if (
          !ts.isIdentifier(declaration.name)
          || !declaration.initializer
        ) {
          continue;
        }

        const initializer =
          unwrapExpression(declaration.initializer);

        if (ts.isObjectLiteralExpression(initializer)) {
          objectVariables.set(
            declaration.name.text,
            initializer,
          );
        }

        if (hasExportModifier(statement)) {
          storyExports.push(
            declaration.name.text,
          );
        }
      }
    }

    if (
      ts.isFunctionDeclaration(statement)
      && statement.name
      && hasExportModifier(statement)
    ) {
      storyExports.push(statement.name.text);
    }

    if (
      ts.isExportAssignment(statement)
      && !statement.isExportEquals
    ) {
      const expression =
        unwrapExpression(statement.expression);

      if (ts.isIdentifier(expression)) {
        defaultExportName = expression.text;
      }

      if (ts.isObjectLiteralExpression(expression)) {
        defaultObject = expression;
      }
    }
  }

  const metaObject =
    defaultObject
    ?? (
      defaultExportName
        ? objectVariables.get(defaultExportName)
        : null
    );

  const titleExpression =
    metaObject
      ? getObjectProperty(metaObject, 'title')
      : null;
  const title =
    titleExpression
      ? getStringLiteral(titleExpression)
      : null;

  return {
    filePath,
    relativePath: relativePath(filePath),
    title,
    storyExports,
  };
}

function scanForbiddenFragments(files) {
  const findings = [];

  for (const filePath of files) {
    if (!isTextFile(filePath)) {
      continue;
    }

    if (
      filePath === contractPath
      || filePath === taxonomyPath
      || filePath === generatedCatalogPath
    ) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');

    for (const fragment of forbiddenFragments) {
      if (content.includes(fragment)) {
        findings.push(
          `${relativePath(filePath)} -> ${fragment}`,
        );
      }
    }
  }

  return findings;
}

function scanLocalTokenDefinitions(files) {
  const findings = [];

  for (const filePath of files) {
    if (!isTextFile(filePath)) {
      continue;
    }

    if (filePath === tokenDefinitionsCssPath) {
      continue;
    }

    const content = readFileSync(filePath, 'utf8');
    const matches = content.matchAll(
      /--pd-[a-z0-9-]+\s*:/gi,
    );

    for (const match of matches) {
      findings.push(
        `${relativePath(filePath)} -> ${match[0]}`,
      );
    }
  }

  return findings;
}

function makeStoryKey({
  storyFile,
  storyTitle,
  storyExport,
}) {
  return [
    storyFile,
    storyTitle,
    storyExport,
  ].join('#');
}

function validateStoryFiles(
  contract,
  taxonomy,
  storyFiles,
) {
  const storyFileModels = storyFiles.map(parseStoryFile);
  const storyFileModelByPath = new Map(
    storyFileModels.map((storyFileModel) => [
      storyFileModel.relativePath,
      storyFileModel,
    ]),
  );

  const visibleRoots = new Set(
    taxonomy.canonicalRoots
      .filter((rootItem) =>
        rootItem.visibility === 'visible')
      .map((rootItem) =>
        `${rootItem.id} ${rootItem.title}`),
  );
  const mappingsBySectionId = new Map(
    taxonomy.sectionMappings.map((mapping) => [
      mapping.sectionId,
      mapping,
    ]),
  );

  const implementedEntries = contract.entries.filter(
    (entry) =>
      entry.storyStatus === 'implemented'
      && entry.storyVisibility === 'visible',
  );
  const implementedKeys = new Set();

  for (const entry of implementedEntries) {
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

    const mapping = mappingsBySectionId.get(
      entry.sectionId,
    );

    ensure(
      Boolean(mapping),
      `Entry ${entry.id}: missing taxonomy mapping.`,
    );

    const plannedRoot = mapping.plannedPath[0];

    ensure(
      entry.storyTitle === plannedRoot
      || entry.storyTitle.startsWith(
        `${plannedRoot}/`,
      ),
      `Entry ${entry.id}: storyTitle is outside taxonomy path.`,
    );

    const actualStoryFile =
      storyFileModelByPath.get(entry.storyFile);

    ensure(
      Boolean(actualStoryFile),
      `Entry ${entry.id}: storyFile does not exist.`,
    );

    ensure(
      actualStoryFile?.title === entry.storyTitle,
      `Entry ${entry.id}: storyTitle differs from file meta.`,
    );

    ensure(
      actualStoryFile?.storyExports.includes(
        entry.storyExport,
      ),
      `Entry ${entry.id}: storyExport not found in file.`,
    );

    implementedKeys.add(
      makeStoryKey(entry),
    );
  }

  for (const storyFileModel of storyFileModels) {
    ensure(
      typeof storyFileModel.title === 'string',
      `Story file ${storyFileModel.relativePath}: missing default title.`,
    );

    const rootTitle =
      storyFileModel.title?.split('/')[0];

    ensure(
      rootTitle && visibleRoots.has(rootTitle),
      `Story file ${storyFileModel.relativePath}: unsupported root ${rootTitle}.`,
    );

    ensure(
      storyFileModel.storyExports.length > 0,
      `Story file ${storyFileModel.relativePath}: missing story exports.`,
    );

    for (const storyExport of storyFileModel.storyExports) {
      const key = makeStoryKey({
        storyFile: storyFileModel.relativePath,
        storyTitle: storyFileModel.title,
        storyExport,
      });

      ensure(
        implementedKeys.has(key),
        `Story ${storyFileModel.relativePath}#${storyExport} is not in contract.`,
      );
    }
  }
}

function validateArchitecture() {
  ensure(
    existsSync(storybookRoot),
    'Missing storybook-next target directory.',
  );
  ensure(
    existsSync(contractPath),
    'Missing storybook contract.',
  );
  ensure(
    existsSync(taxonomyPath),
    'Missing storybook taxonomy map.',
  );
  ensure(
    existsSync(foundationsEntrypointCssPath),
    'Missing shared foundations CSS entrypoint.',
  );
  ensure(
    existsSync(tokenDefinitionsCssPath),
    'Missing foundations token definition CSS.',
  );

  for (const directoryName of emptyStorybookDirectories) {
    const directoryPath = path.join(
      storybookRoot,
      directoryName,
    );

    ensure(
      existsSync(directoryPath),
      `Missing target directory: ${directoryName}`,
    );

    const files = walk(directoryPath).filter(
      (filePath) =>
        path.basename(filePath) !== '.gitkeep',
    );

    ensure(
      files.length === 0,
      `Directory ${directoryName} must not contain local visual layer files:\n${files.join('\n')}`,
    );
  }

  const contract = readJson(contractPath);
  const taxonomy = readJson(taxonomyPath);
  const packageJson = readJson(packagePath);
  const mainSource = readFileSync(mainPath, 'utf8');
  const previewSource = readFileSync(previewPath, 'utf8');
  const appMainSource = readFileSync(appMainPath, 'utf8');
  const appCssSource = readFileSync(appCssPath, 'utf8');
  const srcFiles = walk(srcRoot);
  const storybookConfigFiles = walk(
    path.join(webRoot, '.storybook'),
  );
  const scanFiles = [
    ...srcFiles,
    ...storybookConfigFiles,
    packagePath,
  ];
  const storyFiles = srcFiles.filter(isStoryFile);

  ensure(
    mainSource.includes(
      "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ),
    'Storybook main config does not scan colocated stories.',
  );

  ensure(
    previewSource.includes(
      '../src/design-system/foundations/foundations.css',
    ),
    'Storybook preview does not import shared foundations CSS.',
  );

  ensure(
    !previewSource.includes('../src/app/app.css'),
    'Storybook preview must not import production app CSS.',
  );

  ensure(
    previewSource.includes(
      'applyPapaDataRuntimeGlobals',
    ),
    'Storybook preview does not use shared runtime globals.',
  );

  ensure(
    appMainSource.includes(
      '../design-system/foundations/foundations.css',
    ),
    'Application entry does not import shared foundations CSS.',
  );

  const previewRuntimeCalls =
    previewSource.match(
      /applyPapaDataRuntimeGlobals\s*\(/g,
    )?.length ?? 0;
  const appRuntimeCalls =
    appMainSource.match(
      /applyPapaDataRuntimeGlobals\s*\(/g,
    )?.length ?? 0;

  ensure(
    previewRuntimeCalls === 1
    && previewSource.includes(
      'document.documentElement',
    )
    && !previewSource.includes('document.body')
    && !previewSource.includes(
      'getPapaDataRuntimeAttributes',
    ),
    'Storybook globals must target only document.documentElement.',
  );

  ensure(
    appRuntimeCalls === 1
    && appMainSource.includes(
      'document.documentElement',
    )
    && !appMainSource.includes('document.body'),
    'Application globals must target only document.documentElement.',
  );

  ensure(
    !appCssSource.includes('@import')
    && !/(^|\n)\s*:root\b/.test(appCssSource)
    && !/(^|\n)\s*body\b/.test(appCssSource)
    && !/(^|\n)\s*button\s*,/.test(appCssSource),
    'app.css must contain only application styles.',
  );

  ensure(
    !Object.prototype.hasOwnProperty.call(
      packageJson.scripts ?? {},
      'check-storybook-visual-reset',
    ),
    'Package still exposes visual reset checker.',
  );

  ensure(
    (
      packageJson.scripts?.[
        'check-storybook-catalog'
      ] ?? ''
    ).includes('check-storybook-architecture.mjs'),
    'Catalog quality gate does not include architecture checker.',
  );

  ensure(
    !existsSync(
      path.join(
        storybookRoot,
        'components/showcases',
      ),
    ),
    'Legacy showcases directory still exists.',
  );

  const forbiddenFindings =
    scanForbiddenFragments(scanFiles);

  ensure(
    forbiddenFindings.length === 0,
    `Forbidden Storybook architecture references remain:\n${forbiddenFindings.join('\n')}`,
  );

  const localTokenFindings =
    scanLocalTokenDefinitions(scanFiles);

  ensure(
    localTokenFindings.length === 0,
    `Local --pd-* token definitions outside foundations remain:\n${localTokenFindings.join('\n')}`,
  );

  validateStoryFiles(
    contract,
    taxonomy,
    storyFiles,
  );

  return {
    storyFileCount: storyFiles.length,
    storyExportCount: storyFiles
      .map(parseStoryFile)
      .reduce(
        (count, storyFileModel) =>
          count + storyFileModel.storyExports.length,
        0,
      ),
  };
}

function expectFailure(label, callback) {
  let failed = false;

  try {
    callback();
  } catch {
    failed = true;
  }

  if (!failed) {
    throw new Error(
      `Self-test did not detect: ${label}`,
    );
  }
}

function runSelfTest() {
  expectFailure('forbidden pds token', () => {
    const findings = [];
    const fragment = forbiddenFragments.find(
      (candidate) => candidate === '--pds-',
    );
    ensure(Boolean(fragment), 'missing --pds- fragment');
    findings.push('sample.css -> --pds-color');
    ensure(
      findings.length === 0,
      findings.join('\n'),
    );
  });

  expectFailure('uncontracted story', () => {
    validateStoryFiles(
      {
        entries: [],
      },
      {
        canonicalRoots: [
          {
            id: '00',
            title: 'Fundamenty',
            visibility: 'visible',
          },
        ],
        sectionMappings: [],
      },
      [
        path.join(
          storybookRoot,
          'stories/00-foundations/foundations-clean-start.stories.tsx',
        ),
      ],
    );
  });

  console.log(
    'Storybook architecture self-test: PASS.',
  );
}

const stats = validateArchitecture();

if (process.argv.includes('--self-test')) {
  runSelfTest();
}

console.log(
  [
    'Storybook architecture: PASS.',
    `Story files: ${stats.storyFileCount}.`,
    `Story exports: ${stats.storyExportCount}.`,
    'Legacy visual layer: blocked.',
    'ShowcaseKit: blocked.',
    'Token prefix: --pd-* only.',
  ].join(' '),
);
