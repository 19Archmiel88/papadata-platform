import { existsSync, readdirSync } from 'node:fs';
import {
  ensure,
  getContract,
  readText,
  resolveFromRoot,
} from './storybook-check-utils.mjs';

const canonicalCssPath = 'apps/web/src/storybook-next/presentation/story-presentation.css';
const presentationComponentPath = 'apps/web/src/storybook-next/presentation/StoryPresentation.tsx';
ensure(existsSync(resolveFromRoot(canonicalCssPath)), 'Missing canonical Storybook presentation CSS.');
ensure(existsSync(resolveFromRoot(presentationComponentPath)), 'Missing canonical StoryPresentation component.');

const canonicalCss = readText(canonicalCssPath);
const presentationComponent = readText(presentationComponentPath);
for (const marker of ['pd-f0-page','pd-f0-page__header','pd-f0-page__meta','pd-f0-section','pd-f0-section__content']) {
  ensure(canonicalCss.includes(`.${marker}`), `Canonical presentation CSS missing ${marker}.`);
  ensure(presentationComponent.includes(marker), `StoryPresentation component missing ${marker}.`);
}

for (const path of [
  'apps/web/src/storybook-next/stories/00-foundations/foundations-clean-start.stories.tsx',
  'apps/web/src/storybook-next/stories/05-surfaces/surfaces-laboratory.stories.tsx',
  'apps/web/src/design-system/icons/PapaDataBrand.stories.tsx',
  'apps/web/src/design-system/icons/Icon.stories.tsx',
  'apps/web/src/design-system/components/Button/Button.stories.tsx',
  'apps/web/src/design-system/components/Field/FormFields.stories.tsx',
]) {
  const source = readText(path);
  ensure(source.includes('presentation/story-presentation.css'), `${path}: missing canonical presentation CSS import.`);
}

for (const path of [
  'apps/web/src/storybook-next/stories/foundations-demo.css',
  'apps/web/src/storybook-next/stories/00-foundations/foundation-lab-alignment.css',
]) {
  ensure(!existsSync(resolveFromRoot(path)), `Legacy presentation CSS still exists: ${path}`);
}

const localCssSources = [
  ...readdirSync(resolveFromRoot('apps/web/src/storybook-next/stories/05-surfaces'))
    .filter((file) => file.endsWith('.css'))
    .map((file) => `apps/web/src/storybook-next/stories/05-surfaces/${file}`),
  ...readdirSync(resolveFromRoot('apps/web/src/storybook-next/stories/15-data-visualizations'))
    .filter((file) => file.endsWith('.css'))
    .map((file) => `apps/web/src/storybook-next/stories/15-data-visualizations/${file}`),
  'apps/web/src/design-system/components/Button/action-showcase.css',
  'apps/web/src/design-system/components/Field/field-family-showcase.css',
];
const forbiddenSharedOverride = /\.(?:pd-f0-page|pd-f0-section)(?=[\s,:>{.#\[]|$)/;
const forbiddenProductionOverride = /\.(?:pd-button|pd-icon-button|pd-inline-action)(?=[\s,:>{.#\[]|$)/;
for (const path of localCssSources) {
  const source = readText(path);
  ensure(!forbiddenSharedOverride.test(source), `${path}: local CSS overrides shared Storybook presentation.`);
  ensure(!forbiddenProductionOverride.test(source), `${path}: showcase/lab CSS overrides a production action component.`);
}

const fieldCss = readText('apps/web/src/design-system/components/Field/field.css');
ensure(fieldCss.includes('.pd-form-control > .pd-form-control__textarea:focus'), '10.03: nested field controls must suppress native inner focus treatment.');
ensure(fieldCss.includes('outline: var(--pd-focus-width) solid var(--pd-focus-visible);'), '10.03: composite field must retain Foundation focus outline.');

const buttonSource = readText('apps/web/src/design-system/components/Button/Button.tsx');
const iconButtonSource = readText('apps/web/src/design-system/components/Button/IconButton.tsx');
const textActionSource = readText('apps/web/src/design-system/components/Button/TextAction.tsx');
const linkActionSource = readText('apps/web/src/design-system/components/Button/LinkAction.tsx');
for (const [label, source, activityClass] of [
  ['Button', buttonSource, 'pd-button__activity-line'],
  ['IconButton', iconButtonSource, 'pd-icon-button__activity-line'],
  ['TextAction', textActionSource, 'pd-inline-action__activity-line'],
  ['LinkAction', linkActionSource, 'pd-inline-action__activity-line'],
]) {
  ensure(source.includes(activityClass), `${label}: missing shared activity-line element.`);
  ensure(source.includes('data-slot="activity-line"'), `${label}: activity line must remain testable.`);
}

const contract = getContract();
ensure(contract.entries.find((entry) => entry.id === '10.02')?.storyStatus === 'implemented', '10.02 must remain implemented.');
console.log('Storybook presentation contract OK: canonical shell + isolated local demos.');
