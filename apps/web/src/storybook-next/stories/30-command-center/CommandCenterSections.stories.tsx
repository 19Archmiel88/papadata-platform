import type { Meta } from '@storybook/react-vite';
import {
  Kpi as MetricsStory,
  Trend as TrendStory,
  Drivers as DriversStory,
  Guardian as DecisionsStory,
  DataHealth as DataStory,
} from './CommandCenterBiPage.story-support';
const meta = {
  id: 'analiza-centrum-dowodzenia-sekcje',
  title: 'ANALIZA/Przegląd/Sekcje',
} satisfies Meta;
export default meta;
export const Kpi = { ...MetricsStory, name: 'Główne wskaźniki' };
export const Trend = { ...TrendStory, name: 'Wynik w czasie' };
export const Drivers = { ...DriversStory, name: 'Czynniki zmiany marży' };
export const Guardian = { ...DecisionsStory, name: 'Decyzje na teraz' };
export const DataHealth = { ...DataStory, name: 'Gotowość danych' };
