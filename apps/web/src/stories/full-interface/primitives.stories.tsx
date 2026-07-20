import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/05-primitives/Komponenty',
  component: PapaDataFullInterfaceScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    state: 'ready',
    surface: 'primitives',
    theme: 'dark',
    viewport: 'desktop',
  },
  argTypes: {
    state: {
      control: 'select',
      options: ['ready', 'loading', 'partial', 'stale', 'error', 'forbidden', 'blocked'],
    },
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
    await expect(canvas.findByRole('heading', { name: /Biblioteka komponentów PapaData/i })).resolves.toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: /Domenowe/i }));
    await expect(canvas.findAllByText(/MetricCard/i)).resolves.not.toHaveLength(0);
  },
};

export const Loading = story({ state: 'loading' }, 'Loading');
export const Empty = story({ state: 'empty' }, 'Empty');
export const Partial = story({ state: 'partial' }, 'Partial');
export const Error = story({ state: 'error' }, 'Error');
export const Forbidden = story({ state: 'forbidden' }, 'Forbidden');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Dark');
