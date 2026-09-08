import { expect, within } from 'storybook/test';
import type {
  Meta,
} from '@storybook/react-vite';

import {
  Overview as OverviewStory,
} from './CustomersBiPage.story-support';

const meta = {
  title: 'ANALIZA/Klienci/Całość',
} satisfies Meta;

export default meta;

export const Overview = {
  ...OverviewStory,
  name: 'Widok pełny',
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    await expect(within(canvasElement).getByRole('heading', { name: 'Klienci', level: 1 })).toBeInTheDocument();
  },
};
