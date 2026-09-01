import type {
  Meta,
} from '@storybook/react-vite';

import {
  FullPage as FullPageStory,
} from './MarketingSupportBiPage.story-support';

const meta = {
  title: 'WSPARCIE/Wsparcie w marketingu/Całość',
} satisfies Meta;

export default meta;

export const FullPage = {
  ...FullPageStory,
  name: 'Widok pełny',
};
