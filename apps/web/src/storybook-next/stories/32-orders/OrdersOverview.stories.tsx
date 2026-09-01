import type {
  Meta,
} from '@storybook/react-vite';

import {
  Overview as OverviewStory,
} from './OrdersBiPage.story-support';

const meta = {
  title: 'ANALIZA/Zamówienia/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
};
