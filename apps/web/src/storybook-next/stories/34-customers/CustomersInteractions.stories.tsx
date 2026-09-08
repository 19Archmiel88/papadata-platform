import type { Meta } from '@storybook/react-vite';
import { Overview } from './CustomersBiPage.story-support';

const meta = { title: 'ANALIZA/Klienci/Interakcje' } satisfies Meta;
export default meta;

// Keep the original workflow checks away from the stable full-page preview.
export const NavigationAndDetails = { ...Overview, name: 'Nawigacja i szczegóły' };
