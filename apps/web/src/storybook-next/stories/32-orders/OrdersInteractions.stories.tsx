import type {
  Meta,
} from '@storybook/react-vite';

import {
  PapaAiInteractions as PapaAiInteractionsStory,
} from './OrdersBiPage.story-support';

const meta = {
  title: 'ANALIZA/Zamówienia/Interakcje',
} satisfies Meta;

export default meta;

export const PapaAiInteractions = {
  ...PapaAiInteractionsStory,
  name: 'Papa AI',
};
