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

ensure(componentSystem.stage === 'C2.1', 'Component System must declare C2.1 ownership alignment.');
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
  'Komponenty bazowe (`10`)',
  'Laboratorium decyzji (`05`)',
  'contracts/components/*.ts',
  'decision recordem',
  'rejestry/runtime-component-api.csv',
]) {
  ensure(ownership.includes(marker), `Ownership contract missing marker: ${marker}`);
}

const runtimeRegistry = readText(componentSystem.runtimeApiRegistry);
for (const component of componentSystem.requiredComponents) {
  ensure(runtimeRegistry.includes(`${component},`), `Runtime API registry missing ${component}.`);
}

const storybookRegistry = readText('rejestry/storybook.csv');
for (const title of ['10 Komponenty bazowe/Marka', '10 Komponenty bazowe/Ikony']) {
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
ensure(foundationStory.includes('10.11 — Ikony'), '00.09 must hand the full icon catalogue to 10.11.');
ensure(!foundationStory.includes('foundationProjectGraphics'), '00.09 must not keep a duplicate full icon catalogue.');
ensure(
  !existsSync(resolveFromRoot('apps/web/src/storybook-next/stories/00-foundations/foundation-iconography-project-catalog.css')),
  '00.09 legacy full-catalogue CSS must be removed after handoff to 10.11.',
);

const buttonSource = readText('apps/web/src/design-system/components/Button/Button.tsx');
const iconButtonSource = readText('apps/web/src/design-system/components/Button/IconButton.tsx');
const buttonStory = readText('apps/web/src/design-system/components/Button/Button.stories.tsx');
ensure(!buttonSource.includes("'link'"), 'Button runtime must not own navigation/link variant.');
ensure(!buttonSource.includes('buttonType'), 'Button runtime must use native type as the single submit/command source.');
ensure(!buttonStory.includes("variant: 'link'"), '10.02 story must not document Button link variant.');
ensure(buttonStory.includes('LinkAction'), '10.02 must demonstrate LinkAction as navigation owner.');
ensure(buttonStory.includes('TextAction'), '10.02 must demonstrate TextAction as lightweight command owner.');
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
ensure(!/\bglow\s*[=}]|glow:/.test(brandStory), '10.01 story must not expose a glow control/prop.');

for (const [id, expected] of [
  ['00.07', '05.04'],
  ['00.09', '10.11'],
  ['05.01', 'Access/Auth'],
  ['05.02', 'AppShell'],
  ['05.03', '10/15/18'],
  ['05.04', '00.07'],
  ['05.05', '00.08'],
]) {
  ensure(entries.get(id)?.note?.replaceAll(' ', '').includes(expected.replaceAll(' ', '')), `${id}: missing ownership handoff ${expected}.`);
}
ensure(entries.get('05.04')?.accepted === true, '05.04 accepted decision record must be marked accepted.');
ensure(!entries.get('10.02')?.requirements?.includes('link'), '10.02 contract still claims Button link variant.');
ensure(!entries.get('10.11')?.requirements?.includes('ProviderLogo'), '10.11 contract still claims ProviderLogo.');
ensure(!entries.get('10.11')?.requirements?.includes('StatusIcon'), '10.11 contract still claims StatusIcon.');

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
