import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  CohortMatrix,
} from './CohortMatrix';
import type {
  CohortMatrixProps,
} from './CohortMatrix';

const workspaceContext = { locale: 'pl', tenantId: 'tenant-papadata', workspaceId: 'workspace_retention' } as const;

const meta = {
  title: '15 Wykresy i dane/05 Katalog komponentów/Komponenty domenowe/CohortMatrix',
  component: CohortMatrix,
  parameters: { layout: 'padded', a11y: { test: 'error' } },
} satisfies Meta<typeof CohortMatrix>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podglad: Story = {
  name: 'Podgląd',
  args: {
    cohortMetric: 'retention',
    columns: ['M0', 'M1', 'M2', 'M3'],
    context: workspaceContext,
    onSelectCohort: () => undefined,
    rows: [
      { cohortId: '2026-05', label: 'Maj 2026', values: [1, 0.42, 0.31, 0.24] },
      { cohortId: '2026-06', label: 'Czerwiec 2026', values: [1, 0.45, 0.33, null] },
      { cohortId: '2026-07', label: 'Lipiec 2026', values: [1, 0.48, null, null] },
    ],
    selectedCohortId: '2026-06',
  } satisfies CohortMatrixProps,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Macierz kohort')).toBeInTheDocument();
  },
};
