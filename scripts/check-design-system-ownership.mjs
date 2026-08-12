import { existsSync, readdirSync, readFileSync } from 'node:fs';
import {
  ensure,
  getContract,
  readJson,
  readText,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const componentSystem = readJson('apps/web/src/design-system/component-system-v1.json');
const contract = getContract();
const entries = new Map(contract.entries.map((entry) => [entry.id, entry]));

ensure(componentSystem.stage === 'C2.2', 'Component System must declare C2.2 ownership alignment.');
ensure(
  componentSystem.ownershipContract === 'docs/storybook/SOURCE-OF-TRUTH-OWNERSHIP.md',
  'Missing canonical ownership contract path.',
);
ensure(
  componentSystem.runtimeApiRegistry === 'rejestry/runtime-component-api.csv',
  'Missing runtime API registry path.',
);

const ownership = readText(componentSystem.ownershipContract);
for (const marker of [
  'Fundamenty (`00`)',
  'Zaakceptowane elementy bazowe (`00.12–00.15`)',
  'Laboratorium decyzji (`05`)',
  'contracts/components/*.ts',
  'decision recordem',
  'rejestry/runtime-component-api.csv',
]) {
  ensure(ownership.includes(marker), `Ownership contract missing marker: ${marker}`);
}

const runtimeRegistry = readText(componentSystem.runtimeApiRegistry);
const runtimeRegistryRows = new Map(
  runtimeRegistry
    .trimEnd()
    .split('\n')
    .slice(1)
    .map((line) => [line.split(',')[0], line]),
);
for (const component of componentSystem.requiredComponents) {
  ensure(runtimeRegistryRows.has(component), `Runtime API registry missing ${component}.`);
}

const componentIndex = readText('apps/web/src/design-system/components/index.ts');
const publicComponentExports = new Set();
for (const match of componentIndex.matchAll(/export\s+\{([\s\S]*?)\}\s+from\s+'\.\/[^']+';/g)) {
  for (const name of match[1].split(',').map((item) => item.trim()).filter(Boolean)) {
    if (/^[A-Z]/.test(name)) {
      publicComponentExports.add(name);
    }
  }
}
for (const component of publicComponentExports) {
  const row = runtimeRegistryRows.get(component);
  ensure(row, `Runtime API registry missing public component export ${component}.`);
  const [, sourceFile,, storyId, status] = row.split(',');
  ensure(sourceFile && existsSync(resolveFromRoot(sourceFile)), `${component}: runtime API source file does not exist.`);
  ensure(storyId, `${component}: runtime API registry must declare owner story or target.`);
  ensure(['accepted', 'review'].includes(status), `${component}: runtime API status must be accepted or review.`);
}

for (const [
  component,
  storyId,
  status,
] of [
  ['PapaDataBrand', '00.12', 'accepted'],
  ['Icon', '00.13', 'accepted'],
  ['Button', '00.14', 'accepted'],
  ['TextAction', '00.14', 'accepted'],
  ['LinkAction', '00.14', 'accepted'],
  ['IconButton', '00.14', 'accepted'],
  ['ButtonGroup', '00.14', 'accepted'],
  ['TextField', '00.15', 'accepted'],
  ['PasswordField', '00.15', 'accepted'],
  ['Textarea', '00.15', 'accepted'],
  ['FileInput', '00.15', 'accepted'],
  ['VerificationCodeInput', '00.15', 'accepted'],
]) {
  const row = runtimeRegistryRows.get(component);

  ensure(
    row?.includes(`,${storyId},${status},Design System`),
    `${component}: runtime API registry must point to active 00 owner ${storyId}.`,
  );
}

const storybookRegistry = readText('rejestry/storybook.csv');
for (const title of ['00 Fundamenty/03 Marka', '00 Fundamenty/04 Ikony']) {
  const row = storybookRegistry.split('\n').find((line) => line.startsWith(`${title},`));
  ensure(row?.includes(',implemented,'), `${title}: registry must reflect the implemented story.`);
}

const oldPresentationCss = [
  'apps/web/src/storybook-next/stories/foundations-demo.css',
  'apps/web/src/storybook-next/stories/00-foundations/foundation-lab-alignment.css',
];
for (const path of oldPresentationCss) {
  ensure(!existsSync(resolveFromRoot(path)), `Legacy presentation source must be removed: ${path}`);
}
ensure(
  existsSync(resolveFromRoot('apps/web/src/storybook-next/presentation/story-presentation.css')),
  'Missing canonical Storybook presentation CSS.',
);
ensure(
  existsSync(resolveFromRoot('apps/web/src/storybook-next/presentation/StoryPresentation.tsx')),
  'Missing canonical Storybook presentation component.',
);

const storySources = [
  'apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx',
  'apps/web/src/storybook-next/stories/05-surfaces/surfaces-laboratory.stories.tsx',
  'apps/web/src/design-system/icons/PapaDataBrand.stories.tsx',
  'apps/web/src/design-system/icons/Icon.stories.tsx',
  'apps/web/src/design-system/components/Button/Button.stories.tsx',
  'apps/web/src/design-system/components/Field/FormFields.stories.tsx',
];
for (const path of storySources) {
  const source = readText(path);
  ensure(source.includes('presentation/story-presentation.css'), `${path}: must import canonical presentation CSS.`);
}

const foundationStory = readText(storySources[0]);
ensure(foundationStory.includes('SemanticStatusTone'), '00.04 must own semantic status tone without importing component tone.');
ensure(!foundationStory.includes('StatusBadgeTone'), 'Foundation must not depend on component StatusBadgeTone.');
ensure(foundationStory.includes('00.13 — Ikony'), '00.09 must hand the full icon catalogue to 00.13.');
ensure(!foundationStory.includes('foundationProjectGraphics'), '00.09 must not keep a duplicate full icon catalogue.');
ensure(
  !existsSync(resolveFromRoot('apps/web/src/storybook-next/stories/00-foundations/foundation-iconography-project-catalog.css')),
  '00.09 legacy full-catalogue CSS must be removed after handoff to 00.13.',
);

const buttonSource = readText('apps/web/src/design-system/components/Button/Button.tsx');
const iconButtonSource = readText('apps/web/src/design-system/components/Button/IconButton.tsx');
const buttonStory = readText('apps/web/src/design-system/components/Button/Button.stories.tsx');
ensure(!buttonSource.includes("'link'"), 'Button runtime must not own navigation/link variant.');
ensure(!buttonSource.includes('buttonType'), 'Button runtime must use native type as the single submit/command source.');
ensure(!buttonStory.includes("variant: 'link'"), '00.14 story must not document Button link variant.');
ensure(buttonStory.includes('LinkAction'), '00.14 must demonstrate LinkAction as navigation owner.');
ensure(buttonStory.includes('TextAction'), '00.14 must demonstrate TextAction as lightweight command owner.');
ensure(/readonly label: string;/.test(iconButtonSource), 'IconButton must require an explicit accessible label.');
ensure(!iconButtonSource.includes('?? icon'), 'IconButton must not fall back to a technical icon name.');

for (const path of [
  'contracts/components/button.ts',
  'contracts/components/iconbutton.ts',
  'contracts/components/textaction.ts',
  'contracts/components/linkaction.ts',
]) {
  ensure(readText(path).includes('Orchestration contract'), `${path}: must be explicitly orchestration-only.`);
}

const brandSource = readText('apps/web/src/design-system/icons/PapaDataBrand.tsx');
const brandStory = readText('apps/web/src/design-system/icons/PapaDataBrand.stories.tsx');
ensure(!/readonly glow\??:/.test(brandSource), 'PapaDataBrand runtime must not expose decorative glow.');
ensure(!brandSource.includes('pd-brand-lockup--glow'), 'PapaDataBrand runtime must not construct a glow variant.');
ensure(!/\bglow\s*[=}]|glow:/.test(brandStory), '00.12 story must not expose a glow control/prop.');

for (const [id, expected] of [
  ['00.07', '05.04'],
  ['00.09', '00.13'],
  ['05.01', 'Access/Auth'],
  ['05.02', 'AppShell'],
  ['05.03', '15/18'],
  ['05.04', '00.07'],
  ['05.05', '00.08'],
]) {
  ensure(entries.get(id)?.note?.replaceAll(' ', '').includes(expected.replaceAll(' ', '')), `${id}: missing ownership handoff ${expected}.`);
}
ensure(entries.get('05.04')?.accepted === true, '05.04 accepted decision record must be marked accepted.');
for (const entryId of ['05.01', '05.02', '05.03', '05.04', '05.05']) {
  const entry = entries.get(entryId);
  ensure(entry?.accepted === true, `${entryId}: laboratory decision record must be marked accepted.`);
  ensure(entry?.productionStatus === 'not_started', `${entryId}: laboratory decision record must not become production runtime.`);
}
ensure(!entries.get('00.14')?.requirements?.includes('link'), '00.14 contract still claims Button link variant.');
ensure(!entries.get('00.13')?.requirements?.includes('ProviderLogo'), '00.13 contract still claims ProviderLogo.');
ensure(!entries.get('00.13')?.requirements?.includes('StatusIcon'), '00.13 contract still claims StatusIcon.');

const labDirectory = resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces');
ensure(!existsSync(resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces/surfaces-laboratory.css')), 'Legacy surfaces-laboratory.css must be removed.');
ensure(existsSync(resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces/auth-laboratory.css')), '05.01 must own auth-laboratory.css.');
for (const file of ['AppBackgroundLaboratory.tsx','DataSurfaceLaboratory.tsx','SeparatorLaboratory.tsx','EffectsLaboratory.tsx']) {
  const source = readText(`apps/web/src/storybook-next/stories/05-surfaces/${file}`);
  ensure(source.includes('handoff='), `${file}: laboratory decision must declare target handoff.`);
}

// A local laboratory CSS rule with a pd-s5* class that is not referenced by any 05 TSX is dead ownership residue.
const tsxSource = readdirSync(labDirectory)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => readFileSync(resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces', file), 'utf8'))
  .join('\n');
const referenced = new Set([...tsxSource.matchAll(/\b(pd-s5[\w-]*)\b/g)].map((match) => match[1]));
const authCss = readText('apps/web/src/storybook-next/stories/05-surfaces/auth-laboratory.css');
const staleRules = [];
for (const match of authCss.matchAll(/([^{}]+)\{/g)) {
  const selector = match[1].trim();
  if (selector.startsWith('@')) continue;
  const classes = [...selector.matchAll(/\.((?:pd-s5)[\w-]*)/g)].map((item) => item[1]);
  if (classes.length > 0 && classes.every((name) => !referenced.has(name))) {
    staleRules.push(selector);
  }
}
ensure(staleRules.length === 0, `auth-laboratory.css contains fully stale pd-s5 rules: ${staleRules.slice(0, 6).join(' | ')}`);

console.log('Design System ownership OK: one owner per aligned responsibility.');
