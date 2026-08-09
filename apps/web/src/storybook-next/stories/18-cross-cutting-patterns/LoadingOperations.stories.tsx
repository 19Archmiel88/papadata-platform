import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  BackgroundOperationItem,
  Button,
  InlineNotice,
  ProgressIndicator,
  Skeleton,
  Spinner,
  TextAction,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const retryImportAction = fn();
const cancelAction = fn();

function LoadingExamples() {
  const [operationMessage, setOperationMessage] =
    useState('Operacje w tle są widoczne, ale nie blokują całej strony.');

  return (
    <div className="pd-x18-stack">
      <div className="pd-x18-loading-grid">
        <section
          aria-label="Ładowanie regionu danych"
          className="pd-x18-loading-item"
        >
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Loading</h3>
            <p className="pd-x18-region__text">
              Skeleton utrzymuje strukturę regionu, a Spinner komunikuje
              aktywne pobieranie.
            </p>
          </div>
          <div className="pd-x18-loading-line">
            <Spinner
              delayMs={0}
              label="Pobieranie tabeli klientów"
              size={20}
            />
            <Skeleton
              height={18}
              lines={3}
              shape="text"
              width="100%"
            />
            <Skeleton
              height={140}
              lines={1}
              shape="rect"
              width="100%"
            />
          </div>
        </section>

        <section
          aria-label="Operacja w toku"
          className="pd-x18-loading-item"
        >
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Running</h3>
            <p className="pd-x18-region__text">
              Przycisk w stanie loading pokazuje operację caller-owned bez
              tworzenia osobnego komponentu.
            </p>
          </div>
          <div className="pd-x18-action-row">
            <Button
              loading
              loadingLabel="Przeliczanie segmentów"
              variant="secondary"
            >
              Przelicz segmenty
            </Button>
            <TextAction
              tone="muted"
              onClick={() => {
                cancelAction();
                setOperationMessage(
                  'Anulowanie zostało zapisane jako stan story.',
                );
              }}
            >
              Anuluj operację
            </TextAction>
          </div>
        </section>
      </div>

      <section
        aria-label="Kolejka operacji w tle"
        className="pd-x18-region"
      >
        <div className="pd-x18-region__header">
          <h3 className="pd-x18-region__title">
            Queued, running, partial, cancelled i retry
          </h3>
          <p className="pd-x18-region__text">
            BackgroundOperationItem opisuje stan pracy w tle, a ProgressIndicator
            pozostaje realnym wskaźnikiem postępu.
          </p>
        </div>

        <div className="pd-x18-stack pd-x18-stack--tight">
          <BackgroundOperationItem
            description="Eksport czeka na wolny slot w kolejce workerów."
            errorCode={null}
            operationId="op-18-queued"
            progress={null}
            startedAt="oczekuje od 2 min"
            status="queued"
            title="Eksport raportu do CSV"
          />
          <BackgroundOperationItem
            actionLabel="Anuluj"
            description="Import klientów przetworzył część plików i kontynuuje pracę."
            errorCode={null}
            operationId="op-18-running"
            progress={64}
            startedAt="start 10:14"
            status="running"
            statusText="W toku"
            title="Import klientów"
            onAction={() => {
              cancelAction();
              setOperationMessage(
                'Import oznaczono jako anulowany przez użytkownika.',
              );
            }}
          />
          <BackgroundOperationItem
            description="Część integracji została zsynchronizowana, a reszta czeka na ponowienie."
            errorCode={null}
            operationId="op-18-partial"
            progress={72}
            startedAt="start 10:02"
            status="completed"
            statusText="Częściowo zakończone"
            title="Częściowa synchronizacja źródeł"
          />
          <BackgroundOperationItem
            description="Operacja została przerwana przez użytkownika przed publikacją zmian."
            errorCode={null}
            operationId="op-18-cancelled"
            progress={28}
            startedAt="start 09:57"
            status="cancelled"
            title="Anulowane przeliczenie"
          />
          <BackgroundOperationItem
            actionLabel="Ponów import"
            description="Import zakończył się błędem sieciowym i można go ponowić."
            errorCode="NETWORK_RETRYABLE"
            operationId="op-18-retry"
            progress={42}
            startedAt="start 09:48"
            status="failed"
            title="Import wymagający retry"
            onAction={() => {
              retryImportAction();
              setOperationMessage(
                'Ponowienie importu zostało uruchomione z realnej akcji.',
              );
            }}
          />
        </div>
      </section>

      <section
        aria-label="Status operacji"
        className="pd-x18-region"
      >
        <div className="pd-x18-region__header">
          <h3 className="pd-x18-region__title">
            Bezpieczny status asynchroniczny
          </h3>
          <p className="pd-x18-region__text">
            Wzorzec pokazuje postęp i decyzję recovery bez zasłaniania całej
            strony.
          </p>
        </div>
        <ProgressIndicator
          description="Wskaźnik raportuje realny progressbar dla operacji częściowej."
          indeterminate={false}
          label="Postęp zbiorczy operacji"
          max={100}
          showValue
          tone="warning"
          value={72}
        />
        <InlineNotice
          message={operationMessage}
          title="Status operacji w tle"
          tone="info"
        />
      </section>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Ładowanie danych i operacje w tle',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const LoadingOperationsStory: Story = {
  name: 'Ładowanie danych i operacje w tle',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca operacji w tle"
          items={[
            { label: 'Kontrakt', value: '18.03' },
            { label: 'Komponenty', value: 'Skeleton / Spinner' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.03"
      summary="Ładowanie danych i operacje w tle używają istniejących komponentów loading, progress i background operation. Story nie deklaruje fikcyjnych live regionów."
      title="Ładowanie danych i operacje w tle"
    >
      <StoryPresentationSection
        index="01"
        summary="Loading, queued, running, partial completion, cancelled i retry w jednym przepływie asynchronicznym."
        title="Operacje bez blokowania strony"
      >
        <LoadingExamples />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Ładowanie danych i operacje w tle',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getAllByRole('status').length,
    ).toBeGreaterThan(0);

    await expect(
      canvas.getByText('Pobieranie tabeli klientów'),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('progressbar', {
        name: 'Postęp zbiorczy operacji',
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Ponów import',
      }),
    );

    await expect(
      canvas.getByText(/Ponowienie importu zostało uruchomione/),
    ).toBeInTheDocument();
  },
};
