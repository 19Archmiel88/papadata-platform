import type {
  Meta,
} from '@storybook/react-vite';

import {
  Overview as OverviewStory,
} from './PaidCampaignsBiPage.story-support';

const meta = {
  title: 'ANALIZA/Kampanie płatne/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
};
