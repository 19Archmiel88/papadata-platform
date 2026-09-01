import type {
  Meta,
} from '@storybook/react-vite';

import {
  PapaAiInteractions as PapaAiInteractionsStory,
} from './CommandCenterBiPage.story-support';

const meta = {
  title: 'ANALIZA/Centrum Dowodzenia/Interakcje',
} satisfies Meta;

export default meta;

export const PapaAiInteractions = {
  ...PapaAiInteractionsStory,
  name: 'Papa AI',
};
