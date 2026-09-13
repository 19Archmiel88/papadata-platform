import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  ProductDataState,
} from '../../../screens/shared/ProductDataState';

const retry = fn();

const meta = {
  title: 'DESIGN SYSTEM/Wzorce/Stany danych produktu',
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const readyContent = (
  <div>
    <h3>Dane gotowe</h3>
    <p>Widok domenowy renderuje własną zawartość dopiero po rozstrzygnięciu stanu danych.</p>
  </div>
);

export const Gotowe: Story = {
  name: 'Gotowe',
  render: () => (
    <ProductDataState
      provenance={{
        calculatedAt: '2026-09-12T10:00:00.000Z',
        source: 'BFF / customers',
        synchronizedAt: '2026-09-12T09:55:00.000Z',
      }}
      state="ready"
    >
      {readyContent}
    </ProductDataState>
  ),
};

export const Ladowanie: Story = {
  name: 'Ładowanie',
  render: () => <ProductDataState state="loading" />,
};

export const Puste: Story = {
  name: 'Brak danych',
  render: () => <ProductDataState onRetry={retry} state="empty" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Brak danych w wybranym zakresie')).toBeInTheDocument();
  },
};

export const Czesciowe: Story = {
  name: 'Dane częściowe',
  render: () => (
    <ProductDataState
      problem="Brakuje części danych z jednego źródła."
      state="partial"
    >
      {readyContent}
    </ProductDataState>
  ),
};

export const Nieaktualne: Story = {
  name: 'Dane nieaktualne',
  render: () => (
    <ProductDataState
      problem="Ostatnia synchronizacja wymaga odświeżenia."
      state="stale"
    >
      {readyContent}
    </ProductDataState>
  ),
};

export const Blad: Story = {
  name: 'Błąd',
  render: () => <ProductDataState onRetry={retry} state="error" />,
};

export const Offline: Story = {
  name: 'Offline',
  render: () => <ProductDataState onRetry={retry} state="offline" />,
};

export const BrakUprawnien: Story = {
  name: 'Brak uprawnień',
  render: () => <ProductDataState state="forbidden" />,
};
