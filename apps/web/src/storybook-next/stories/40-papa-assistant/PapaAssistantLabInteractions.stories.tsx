import type {
  Meta,
} from '@storybook/react-vite';

import {
  NowaAnaliza as NowaAnalizaStory,
  SymulacjaWhatIf as SymulacjaWhatIfStory,
  TrybSkupienia as TrybSkupieniaStory,
} from './PapaAssistantLabPage.story-support';

const meta = {
  title: 'AI/Laboratorium Papa Asystenta/Interakcje',
} satisfies Meta;

export default meta;

export const NowaAnaliza = {
  ...NowaAnalizaStory,
  name: 'Nowa analiza',
};

export const SymulacjaWhatIf = {
  ...SymulacjaWhatIfStory,
  name: 'Symulacja wariantów',
};

export const TrybSkupienia = {
  ...TrybSkupieniaStory,
  name: 'Tryb skupienia',
};
