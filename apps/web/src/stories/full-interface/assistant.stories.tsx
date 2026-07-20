import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/80 Asystent/Papa Asystent',
  component: PapaDataFullInterfaceScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    state: 'needs_review',
    surface: 'assistant',
    theme: 'dark',
    viewport: 'desktop',
  },
  argTypes: {
    state: {
      control: 'select',
      options: [
        'loading',
        'processing',
        'ready',
        'partial',
        'error',
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
    await expect(canvas.findByRole('heading', { name: /Papa Asystent/i })).resolves.toBeInTheDocument();
    const diagnosisButtons = await canvas.findAllByRole('button', { name: /^Diagnoza$/i });
    const diagnosisButton = diagnosisButtons[0];

    if (!diagnosisButton) {
      throw new Error('ASSISTANT_DIAGNOSIS_MODE_BUTTON_MISSING');
    }

    await userEvent.click(diagnosisButton);
    await expect(canvas.findByText(/Action draft wymaga approval/i)).resolves.toBeInTheDocument();
  },
};

export const Loading = story({ state: 'loading' }, 'Ładowanie');
export const Generating = story({ state: 'processing' }, 'Generowanie');
export const ReadyAnswer = story({ state: 'ready' }, 'Gotowa odpowiedź');
export const Partial = story({ state: 'partial' }, 'Częściowa odpowiedź');
export const RefusalNoData = story({ state: 'insufficient_data' }, 'Odmowa: brak danych');
export const ProviderError = story({ state: 'provider_error' }, 'Błąd providera');
export const Cancelled = story({ state: 'cancelled' }, 'Anulowane');
export const BlockedByPolicy = story({ state: 'blocked_by_policy' }, 'Zablokowane polityką');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Motyw ciemny');
