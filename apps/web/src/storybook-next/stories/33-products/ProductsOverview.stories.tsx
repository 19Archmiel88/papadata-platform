import type {
  Meta,
} from '@storybook/react-vite';

import {
  Overview as OverviewStory,
} from './ProductsBiPage.story-support';

const meta = {
  title: 'ANALIZA/Produkty/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
};
