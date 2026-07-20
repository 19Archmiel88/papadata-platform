import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/00 Fundamenty/Pełny interfejs',
  component: PapaDataFullInterfaceScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    state: 'ready',
    surface: 'foundations',
    theme: 'dark',
    viewport: 'desktop',
  },
  argTypes: {
    state: {
      control: 'select',
      options: [
        'loading',
        'empty',
        'no_data',
        'partial',
        'invalid',
        'stale',
        'delayed',
        'processing',
        'ready',
        'success',
        'warning',
        'error',
        'forbidden',
        'blocked',
        'expired',
        'cancelled',
        'needs_review',
        'provider_error',
        'insufficient_data',
        'blocked_by_policy',
      ],
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
  ...story({}, 'Domyślny'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.findByRole('heading', { name: /Pełny interfejs PapaData/i }),
    ).resolves.toBeInTheDocument();
    await expect(canvas.findAllByText(/tenant_papadata_demo/i)).resolves.not.toHaveLength(0);
  },
};

export const Loading = story({ state: 'loading' }, 'Ładowanie');
export const Partial = story({ state: 'partial' }, 'Częściowe dane');
export const Error = story({ state: 'error' }, 'Błąd');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Motyw ciemny');
export const Light = story({ theme: 'light' }, 'Motyw jasny');
