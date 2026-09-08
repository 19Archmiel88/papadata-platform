import type {
  Meta,
} from '@storybook/react-vite';

import {
  FullPage as FullPageStory,
} from './SettingsGovernanceBiPage.story-support';

const meta = {
  title: 'ADMINISTRACJA/Ustawienia/Całość',
} satisfies Meta;

export default meta;

export const FullPage = {
  ...FullPageStory,
  name: 'Widok pełny',
};
