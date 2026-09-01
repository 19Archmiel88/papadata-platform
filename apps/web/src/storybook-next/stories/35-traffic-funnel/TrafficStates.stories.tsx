import type {
  Meta,
} from '@storybook/react-vite';

import {
  Alerts as AlertsStory,
} from './TrafficBiPage.story-support';

const meta = {
  title: 'ANALIZA/Ruch na stronie/Stany',
} satisfies Meta;

export default meta;

export const Alerts = {
  ...AlertsStory,
  name: 'Alerty i anomalie',
};
