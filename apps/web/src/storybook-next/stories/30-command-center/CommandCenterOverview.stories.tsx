import type { Meta } from '@storybook/react-vite';

import { Overview as OverviewStory } from './CommandCenterBiPage.story-support';

const meta = {
  id: 'analiza-centrum-dowodzenia-całość',
  title: 'ANALIZA/Przegląd/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
};
