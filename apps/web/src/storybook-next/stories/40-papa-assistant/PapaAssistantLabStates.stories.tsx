import type {
  Meta,
} from '@storybook/react-vite';

import {
  AnalizaWToku as AnalizaWTokuStory,
  DaneCzesciowe as DaneCzescioweStory,
  BrakDanych as BrakDanychStory,
  OdmowaAi as OdmowaAiStory,
  BladAnalizy as BladAnalizyStory,
  BrakDostepu as BrakDostepuStory,
} from './PapaAssistantLabPage.story-support';

const meta = {
  title: 'AI/Laboratorium Papa Asystenta/Stany',
} satisfies Meta;

export default meta;

export const AnalizaWToku = {
  ...AnalizaWTokuStory,
  name: 'Analiza w toku',
};

export const DaneCzesciowe = {
  ...DaneCzescioweStory,
  name: 'Dane częściowe',
};

export const BrakDanych = {
  ...BrakDanychStory,
  name: 'Brak danych',
};

export const OdmowaAi = {
  ...OdmowaAiStory,
  name: 'Odmowa Asystenta',
};

export const BladAnalizy = {
  ...BladAnalizyStory,
  name: 'Błąd analizy',
};

export const BrakDostepu = {
  ...BrakDostepuStory,
  name: 'Brak dostępu',
};
