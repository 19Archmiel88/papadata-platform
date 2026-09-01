import type {
  Meta,
} from '@storybook/react-vite';

import {
  Overview as OverviewStory,
} from './TrafficBiPage.story-support';

const meta = {
  title: 'ANALIZA/Ruch na stronie/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
};
