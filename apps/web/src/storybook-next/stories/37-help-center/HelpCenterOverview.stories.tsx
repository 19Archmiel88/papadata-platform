import type {
  Meta,
} from '@storybook/react-vite';

import {
  FullPage as FullPageStory,
} from './HelpCenterBiPage.story-support';

const meta = {
  title: 'WSPARCIE/Centrum Pomocy/Całość',
} satisfies Meta;

export default meta;

export const FullPage = {
  ...FullPageStory,
  name: 'Widok pełny',
};
