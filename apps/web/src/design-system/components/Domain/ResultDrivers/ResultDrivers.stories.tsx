import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ResultDrivers,
} from './ResultDrivers';
import type {
  ResultDriversProps,
} from './ResultDrivers';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_drivers' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/ResultDrivers',
  component: ResultDrivers,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof ResultDrivers>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    baselineValue: 184000,
    context: workspaceContext,
    currentValue: 198500,
    drivers: [
      { id: 'paid', label: 'Paid search', contribution: 14200, direction: 'positive', evidence: [{ id: 'ev-paid', label: 'Wzrost przychodu', source: 'Google Ads' }] },
      { id: 'stock', label: 'Braki magazynowe', contribution: -7400, direction: 'negative', evidence: [{ id: 'ev-stock', label: 'Niski zapas', source: 'ERP' }] },
      { id: 'email', label: 'Email retention', contribution: 7700, direction: 'positive', evidence: [{ id: 'ev-email', label: 'Kampania winback', source: 'Klaviyo' }] },
    ],
    onInspectDriver: () => undefined,
  } satisfies ResultDriversProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Wpływ czynników na zmianę')).toBeInTheDocument();
  },
};
