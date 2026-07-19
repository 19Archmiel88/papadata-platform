import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';

import {
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';

function AnalyticsStateStage() {
  return (
    <div
      className="pds-brand-surface pdx-shell"
      data-theme="dark"
      lang="pl"
    />
  );
}

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Analityka',
  component: AnalyticsStateStage,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AnalyticsStateStage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StateCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className="pds-brand-surface pdx-shell"
      data-theme="dark"
      lang="pl"
    >
      <main className="pdx-main">
        {children}
      </main>
    </div>
  );
}

export const BrakDanych: Story = {
  name: 'Brak danych',
  render: () => (
    <StateCanvas>
      <EmptyState
        action={<Button variant="secondary">Połącz źródło danych</Button>}
        text="Nie pokazujemy zera, dopóki źródła nie dostarczą faktów biznesowych."
        title="Brak danych dla zakresu"
      />
    </StateCanvas>
  ),
};

export const Ladowanie: Story = {
  name: 'Ładowanie',
  render: () => (
    <StateCanvas>
      <LoadingState
        text="Przetwarzamy dane źródłowe przed pokazaniem KPI."
        title="Trwa przygotowanie danych"
      />
    </StateCanvas>
  ),
};

export const ErrorView: Story = {
  name: 'Błąd',
  render: () => (
    <StateCanvas>
      <ErrorState
        action={<Button variant="secondary">Spróbuj ponownie</Button>}
        text="Ostatnia synchronizacja nie zakończyła się powodzeniem."
        title="Nie udało się odświeżyć danych"
      />
    </StateCanvas>
  ),
};
