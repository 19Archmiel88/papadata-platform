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
  BackgroundOperationItem,
} from './BackgroundOperationItem';

import '../Loading/loading-showcase.css';

const meta = {
  title: '10 Komponenty/BackgroundOperationItem',
  component: BackgroundOperationItem,
  args: {
    onAction: fn(),
  },
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Prezentacyjny element operacji w tle pokazuje stan, opis, postęp i jedną akcję bez budowania globalnego runtime.',
      },
    },
  },
} satisfies Meta<typeof BackgroundOperationItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BackgroundOperationItemStory: Story = {
  args: {
    actionLabel: 'Zobacz szczegóły',
    description: 'Łączenie sprzedaży, kampanii i kosztów platformy.',
    errorCode: null,
    operationId: 'JOB-2048',
    progress: 72,
    showProgressValue: true,
    startedAt: '30 lipca 2026, 10:14',
    status: 'running',
    title: 'Aktualizacja źródeł wydajności',
  },
  name: 'Operacja w tle',
  render: (args) => (
    <main className="pd-loading-story">
      <div className="pd-loading-story__inner">
        <header className="pd-loading-story__header">
          <p className="pd-loading-story__kicker">10 Komponenty/BackgroundOperationItem</p>
          <h1>Operacje w tle mają wyglądać jak część platformy, nie osobny moduł.</h1>
          <p className="pd-loading-story__lead">
            Ten komponent jest wyłącznie prezentacyjny. Pokazuje status,
            krótki opis, postęp i jedną bezpieczną akcję dla Storybooka.
          </p>
        </header>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Najczęstsze stany</h2>
          <div className="pd-loading-story__operations">
            <BackgroundOperationItem
              {...args}
              actionLabel="Anuluj"
              operationId="JOB-2048"
              progress={72}
              status="running"
              title="Aktualizacja źródeł wydajności"
            />
            <BackgroundOperationItem
              {...args}
              actionLabel={null}
              operationId="JOB-2049"
              progress={null}
              startedAt="30 lipca 2026, 10:02"
              status="queued"
              title="Przygotowanie eksportu dla zarządu"
            />
            <BackgroundOperationItem
              {...args}
              actionLabel="Pobierz wynik"
              actionVariant="secondary"
              operationId="JOB-2050"
              progress={100}
              startedAt="30 lipca 2026, 09:41"
              status="completed"
              title="Przeliczenie marży kampanii"
            />
            <BackgroundOperationItem
              {...args}
              actionLabel="Ponów"
              errorCode="SYNC-409"
              operationId="JOB-2051"
              progress={27}
              startedAt="30 lipca 2026, 09:18"
              status="failed"
              statusText="Wymaga uwagi"
              title="Import danych z hurtowni"
            />
          </div>
        </section>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Tryb jasny i ciemny</h2>
          <div className="pd-loading-story__operations-theme-grid">
            <div className="pd-loading-story__operations-theme-column">
              <span className="pd-loading-story__eyebrow">tryb jasny</span>
              <BackgroundOperationItem
                {...args}
                actionLabel="Zobacz szczegóły"
                operationId="JOB-2052"
                progress={58}
                status="running"
                title="Weryfikacja zmian w kosztach"
              />
            </div>
            <div
              className="pd-loading-story__operations-theme-column"
              data-theme="dark"
            >
              <span className="pd-loading-story__eyebrow">tryb ciemny</span>
              <BackgroundOperationItem
                {...args}
                actionLabel="Ponów"
                errorCode="AUTH-401"
                operationId="JOB-2053"
                progress={18}
                status="failed"
                statusText="Wymaga uwagi"
                title="Odświeżenie połączenia z integracją"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByLabelText('Stan operacji: W toku'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', {
        name: 'Ponów',
      }),
    ).toBeInTheDocument();
  },
};
