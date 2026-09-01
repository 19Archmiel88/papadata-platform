import type {
  Meta,
} from '@storybook/react-vite';

import {
  Overview as OverviewStory,
} from './CommandCenterBiPage.story-support';

const meta = {
  title: 'ANALIZA/Centrum Dowodzenia/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
};
