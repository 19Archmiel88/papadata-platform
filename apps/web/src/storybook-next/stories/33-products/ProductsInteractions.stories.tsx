import type {
  Meta,
} from '@storybook/react-vite';

import {
  BundleSimulator as BundleSimulatorStory,
  PapaAiInteractions as PapaAiInteractionsStory,
} from './ProductsBiPage.story-support';

const meta = {
  title: 'ANALIZA/Produkty/Interakcje',
} satisfies Meta;

export default meta;

export const BundleSimulator = {
  ...BundleSimulatorStory,
  name: 'Symulator zestawów',
};

export const PapaAiInteractions = {
  ...PapaAiInteractionsStory,
  name: 'Papa AI',
};
