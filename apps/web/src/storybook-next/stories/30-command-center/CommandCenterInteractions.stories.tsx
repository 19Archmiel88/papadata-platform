import type { Meta } from '@storybook/react-vite';
import { EvidenceInteraction } from './CommandCenterBiPage.story-support';
const meta = {
  id: 'analiza-centrum-dowodzenia-interakcje',
  title: 'ANALIZA/Przegląd/Interakcje',
} satisfies Meta;
export default meta;
export const Evidence = { ...EvidenceInteraction, name: 'Decyzja → dowody → powrót' };
