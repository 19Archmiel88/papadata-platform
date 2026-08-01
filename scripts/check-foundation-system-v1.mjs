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
const root = path.resolve(scriptDirectory, '..');

const contractPath = path.join(
  root,
  'apps/web/src/storybook-next/storybook-contract.json',
);
const themePath = path.join(
  root,
  'apps/web/src/design-system/foundations/themes/carbon-pearl.css',
);
const runtimePath = path.join(
  root,
  'apps/web/src/design-system/foundations/runtime/index.ts',
);
const brandPath = path.join(
  root,
  'apps/web/src/design-system/icons/PapaDataBrand.tsx',
);
const foundationStoryPath = path.join(
  root,
  'apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx',
);
const surfaceStoryPath = path.join(
  root,
  'apps/web/src/storybook-next/stories/05-surfaces/surfaces-laboratory.stories.tsx',
);
const storyCssPath = path.join(
  root,
  'apps/web/src/storybook-next/stories/foundations-demo.css',
);
const webPackagePath = path.join(
  root,
  'apps/web/package.json',
);

const evidenceScriptPath = path.join(
  root,
  'scripts/capture-foundation-evidence.mjs',
);

const requiredEntries = {
  '00.01': 'KierunekWizualny',
  '00.02': 'Typografia',
  '00.03': 'KolorySemantyczne',
  '00.04': 'StatusySystemowe',
  '00.05': 'SpacingIGrid',
  '00.06': 'PromienieIGeometria',
  '00.07': 'LinieISeparacja',
  '00.08': 'GlebiaIWarstwy',
  '00.09': 'Ikonografia',
  '00.10': 'MotionIReducedMotion',
  '00.11': 'Dostepnosc',
  '05.01': 'TloAuth',
  '05.02': 'CanvasAplikacji',
  '05.03': 'PowierzchniaDanych',
  '05.04': 'SeparatoryIObramowania',
  '05.05': 'GradientySwiatloISzklo',
};

const requiredTokens = [
  '--pd-brand',
  '--pd-brand-highlight',
  '--pd-interactive',
  '--pd-interactive-on',
  '--pd-data-accent',
  '--pd-data-series-1',
  '--pd-data-series-6',
  '--pd-data-actual',
  '--pd-data-target',
  '--pd-data-forecast',
  '--pd-status-neutral',
  '--pd-focus-visible',
  '--pd-focus-on-interactive',
  '--pd-grid-gutter',
  '--pd-shadow-control',
  '--pd-shadow-floating',
  '--pd-glass-surface',
  '--pd-gradient-premium',
  '--pd-gradient-data',
  '--pd-overlay-scrim-text',
  '--pd-overlay-scrim-text-muted',
  '--pd-type-size-page-mobile',
  '--pd-type-size-display-mobile',
];

function ensure(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function read(filePath) {
  ensure(existsSync(filePath), `Missing file: ${filePath}`);
  return readFileSync(filePath, 'utf8');
}

function run() {
  const contract = JSON.parse(read(contractPath));
  const theme = read(themePath);
  const runtime = read(runtimePath);
  const brand = read(brandPath);
  const foundationStory = read(foundationStoryPath);
  const surfaceStory = read(surfaceStoryPath);
  const storyCss = read(storyCssPath);
  const webPackage = JSON.parse(read(webPackagePath));
  const evidenceScript = read(evidenceScriptPath);

  const entries = new Map(
    contract.entries.map((entry) => [entry.id, entry]),
  );

  for (const [entryId, storyExport] of Object.entries(requiredEntries)) {
    const entry = entries.get(entryId);
    ensure(entry, `Missing Foundation System entry ${entryId}.`);
    ensure(
      entry.storyStatus === 'implemented',
      `${entryId} is not implemented.`,
    );
    ensure(
      entry.storyVisibility === 'visible',
      `${entryId} is not visible.`,
    );
    ensure(
      entry.storyExport === storyExport,
      `${entryId} uses ${entry.storyExport}, expected ${storyExport}.`,
    );
    ensure(
      Array.isArray(entry.requirements)
      && entry.requirements.length > 0,
      `${entryId} has no requirements.`,
    );
  }

  const implementedStories = contract.entries.filter(
    (entry) => entry.storyStatus === 'implemented',
  );
  const visibleStories = contract.entries.filter(
    (entry) => entry.storyVisibility === 'visible',
  );

  ensure(
    contract.visibleStoryPolicy.entryStoryCount === implementedStories.length,
    'visibleStoryPolicy.entryStoryCount must match implemented stories.',
  );
  ensure(
    contract.visibleStoryPolicy.visibleStoryCount === visibleStories.length,
    'visibleStoryPolicy.visibleStoryCount must match visible stories.',
  );

  for (const token of requiredTokens) {
    ensure(theme.includes(`${token}:`), `Missing token ${token}.`);
  }

  ensure(
    theme.includes('@media (forced-colors: active)'),
    'Global forced-colors focus fallback is missing.',
  );
  ensure(
    !theme.includes('outline: none'),
    'Global focus must not remove outline without fallback.',
  );
  ensure(
    runtime.includes('data-motion-requested'),
    'Requested and effective motion are not separated.',
  );
  ensure(
    runtime.includes('readPapaDataSystemMotionPreference'),
    'System reduced-motion preference is not handled.',
  );

  ensure(
    brand.includes('exactly') === false,
    'Brand component must remain implementation code, not documentation prose.',
  );
  ensure(
    foundationStory.includes("import {\n  Icon,\n  PapaDataBrand"),
    'Foundation stories do not use shared brand and icon primitives.',
  );
  ensure(
    surfaceStory.includes('PapaDataBrand'),
    'Surface stories do not use the shared brand lockup.',
  );
  ensure(
    !foundationStory.includes('function BrandSigil'),
    'A local BrandSigil implementation remains in foundation stories.',
  );
  ensure(
    !surfaceStory.includes('function BrandSigil'),
    'A local BrandSigil implementation remains in surface stories.',
  );
  ensure(
    !storyCss.includes('--demo-brand-'),
    'Local demo brand palette remains.',
  );
  ensure(
    (foundationStory.match(/play:\s*async/g) ?? []).length >= 2,
    'At least two interaction play tests are required.',
  );
  ensure(
    foundationStory.includes('aria-live="polite"'),
    'Dynamic screen-reader announcement example is missing.',
  );
  ensure(
    foundationStory.includes('role="listbox"'),
    'Keyboard listbox example is missing.',
  );
  ensure(
    surfaceStory.includes('role="table"')
      && surfaceStory.includes('aria-label="Źródła danych"')
      && surfaceStory.includes('role="columnheader"')
      && surfaceStory.includes('role="cell"'),
    'Data table accessible name and table semantics are missing.',
  );

  ensure(
    foundationStory.includes('className="pd-f0-motion-mode"')
      && foundationStory.includes(
        "data-motion={reduced ? 'reduced' : 'full'}",
      )
      && foundationStory.includes(
        'className="pd-f0-motion-demo"',
      )
      && foundationStory.includes(
        'className="pd-f0-motion-demo__track"',
      ),
    'Motion story does not expose the accepted full and reduced variants.',
  );
  ensure(
    surfaceStory.includes('aria-label="Nawigacja obszaru roboczego"')
      && surfaceStory.includes('aria-label="Nawigacja modułów"'),
    'Responsive application canvas navigation semantics are missing.',
  );
  ensure(
    surfaceStory.includes('Źródła aktywne')
      && surfaceStory.includes('Ostatnia synchronizacja'),
    'Polish operational data-surface copy is missing.',
  );
  ensure(
    surfaceStory.includes('pd-cw-separation-stage')
      && surfaceStory.includes('pd-cw-separation-stage__table')
      && surfaceStory.includes('Nagłówki, wiersze i podziały wewnątrz regionu.'),
    'Current separator guidance and separation stage are missing.',
  );
  ensure(
    storyCss.includes('height: 220px;'),
    'Chart placeholder does not have a definite height.',
  );
  ensure(
    theme.includes('--pd-overlay-scrim-text:')
      && theme.includes('--pd-overlay-scrim-text-muted:')
      && surfaceStory.includes('aria-label="Panel Papa Asystenta"'),
    'Overlay text tokens or the accepted assistant overlay surface are missing.',
  );
  ensure(
    webPackage.scripts?.['verify-foundation-system']?.includes('capture-foundation-evidence'),
    'verify-foundation-system must run capture-foundation-evidence.',
  );
  ensure(
    evidenceScript.includes("captureModel: 'CDP full-page, mobile, 200% zoom, layout and interaction evidence'"),
    'Evidence script is not using the final CDP capture model.',
  );
  ensure(
    evidenceScript.includes('const foundationCoreExports = requiredExports.slice(0, 11);'),
    'Foundation evidence does not explicitly cover the 11 core stories.',
  );
  ensure(
    evidenceScript.includes('zoom: 2'),
    'Foundation evidence does not include 200% zoom cases.',
  );
  ensure(
    evidenceScript.includes('pageHorizontalOverflow'),
    'Foundation evidence does not include a page overflow gate.',
  );
  ensure(
    evidenceScript.includes('unnamedInteractive'),
    'Foundation evidence does not include an interactive-name gate.',
  );
  ensure(
    evidenceScript.includes('captureBeyondViewport: true'),
    'Full-page evidence capture is missing.',
  );
  ensure(
    evidenceScript.includes("action: 'focus-primary'"),
    'Keyboard focus evidence is missing.',
  );
  ensure(
    evidenceScript.includes("action: 'listbox-active'"),
    'Listbox selected/active evidence is missing.',
  );
  ensure(
    evidenceScript.includes("action: 'motion-reduced'"),
    'Reduced-motion interaction evidence is missing.',
  );
  ensure(
    theme.includes('outline-color: var(--pd-focus-on-interactive);'),
    'Primary focus does not expose a visible outer outline.',
  );
  ensure(
    theme.includes('var(--pd-focus-visible),\n    inset 0'),
    'Primary focus does not use the two-layer focus ring.',
  );
  ensure(
    foundationStory.includes('optionRefs.current[boundedIndex]?.focus();')
      && foundationStory.includes('aria-selected={selected === option}'),
    'Listbox focus navigation and selected state are not represented separately.',
  );
  ensure(
    foundationStory.includes('role="option"')
      && foundationStory.includes('optionRefs.current[index] = node;')
      && theme.includes(':focus-visible'),
    'Listbox option focus-visible indicator is missing.',
  );
  ensure(
    evidenceScript.includes("dispatchKey(client, 'ArrowDown', 'ArrowDown', 40)"),
    'Listbox evidence does not keep active distinct from selected.',
  );
  ensure(
    evidenceScript.includes('async function removeDirectoryWithRetries'),
    'Evidence cleanup retry helper is missing.',
  );
  ensure(
    evidenceScript.includes('await removeDirectoryWithRetries('),
    'Evidence cleanup does not use the retry helper.',
  );

  console.log(
    [
      'Foundation System V1 static gate: PASS.',
      'Entries: 16/16.',
      `Required tokens: ${requiredTokens.length}/${requiredTokens.length}.`,
      'Shared brand: PASS.',
      'Focus and forced colors: PASS.',
      'Screen-reader semantics: PASS.',
      'Reduced motion precedence: PASS.',
      'Full-page, mobile, 200% zoom and interaction evidence contract: PASS.',
      'Final focus, listbox and cleanup hardening: PASS.',
    ].join(' '),
  );
}

try {
  run();
} catch (error) {
  console.error(
    `Foundation System V1 static gate: FAIL.\n${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
