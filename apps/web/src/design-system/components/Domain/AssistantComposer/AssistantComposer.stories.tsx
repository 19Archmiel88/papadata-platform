import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  AssistantComposer,
} from './AssistantComposer';
import type {
  AssistantComposerProps,
} from './AssistantComposer';

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/AssistantComposer',
  component: AssistantComposer,
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component: 'Produkcyjny composer Papa Asystenta używany w kontekście analitycznym.',
      },
    },
  },
} satisfies Meta<typeof AssistantComposer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    attachments: [
      { id: 'att-report', name: 'raport-atrybucji.csv', size: 84210 },
    ],
    contextItemIds: ['chart-revenue', 'decision-budget'],
    label: 'Zapytaj Papa Asystenta',
    onSubmit: () => undefined,
    placeholder: 'Wyjaśnij, dlaczego ROAS spadł w kampanii brandowej.',
    submitting: false,
    value: 'Porównaj sprzedaż z ostatnich 7 dni i wskaż źródła ryzyka.',
  } satisfies AssistantComposerProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Zapytaj Papa')).toBeInTheDocument();
  },
};
