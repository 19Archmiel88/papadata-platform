import type { Meta } from '@storybook/react-vite';
import { Overview } from './TrafficBiPage.story-support';

const meta = { title: 'ANALIZA/Ruch na stronie/Interakcje' } satisfies Meta;
export default meta;

// Keep the original workflow checks away from the stable full-page preview.
export const NavigationAndDetails = { ...Overview, name: 'Nawigacja i szczegóły' };
