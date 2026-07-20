import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/40-analytics/Wykresy i filtry dat',
  component: PapaDataFullInterfaceScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    state: 'ready',
    surface: 'charts',
    theme: 'dark',
    viewport: 'desktop',
  },
  argTypes: {
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
    viewport: {
      control: 'inline-radio',
      options: ['desktop', 'tablet', 'mobile'],
    },
  },
} satisfies Meta<typeof PapaDataFullInterfaceScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function story(args: Partial<PapaDataFullInterfaceScreenProps>, name: string): Story {
  return {
    args,
    name,
  };
}

export const Default: Story = {
  ...story({}, 'Default'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByText(/LineChart/i)).resolves.toBeInTheDocument();
    await expect(canvas.findByText(/Tabela trendu przychodu netto/i)).resolves.toBeInTheDocument();
  },
};

export const Loading = story({ state: 'loading' }, 'Loading');
export const Empty = story({ state: 'empty' }, 'Empty');
export const Partial = story({ state: 'partial' }, 'Partial');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Dark');
export const Light = story({ theme: 'light' }, 'Light');
