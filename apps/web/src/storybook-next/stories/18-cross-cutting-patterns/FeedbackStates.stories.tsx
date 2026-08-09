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
  EmptyState,
  ErrorState,
  InlineNotice,
  TextAction,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const retryAction = fn();
const entitlementAction = fn();

function FeedbackStateMatrix() {
  const [retryMessage, setRetryMessage] = useState(
    'Retry nie został jeszcze uruchomiony.',
  );

  return (
    <div className="pd-x18-stack">
      <div className="pd-x18-feedback-grid">
        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Empty</h3>
            <p className="pd-x18-region__text">
              Obszar istnieje, ale użytkownik nie dodał jeszcze danych.
            </p>
          </div>
          <EmptyState
            message="Dodaj pierwsze źródło, żeby uruchomić przepływ analizy."
            primaryActionLabel="Dodaj źródło"
            secondaryActionLabel="Zobacz wymagania"
            title="Brak źródeł danych"
            variant="empty"
          />
        </div>

        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">No results</h3>
            <p className="pd-x18-region__text">
              Filtry działają, ale nie zwracają żadnego wyniku.
            </p>
          </div>
          <EmptyState
            message="Zmień zakres dat albo usuń filtr kampanii, żeby zobaczyć wyniki."
            primaryActionLabel="Wyczyść filtry"
            title="Brak wyników"
            variant="search"
          />
        </div>

        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">No data</h3>
            <p className="pd-x18-region__text">
              Źródło nie ma danych dla metryki; to nie jest awaria.
            </p>
          </div>
          <EmptyState
            message="Provider nie przekazuje wartości dla tej metryki w wybranym okresie."
            title="Brak danych w źródle"
            variant="configuration"
          />
        </div>

        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Error</h3>
            <p className="pd-x18-region__text">
              Błąd korzysta z ErrorState, dlatego ma prawdziwy `role=alert`.
            </p>
          </div>
          <ErrorState
            correlationId="corr-18-02"
            errorCode="SYNC_TIMEOUT"
            message="Synchronizacja źródła przekroczyła limit czasu. Dane nie są kompletne do decyzji."
            retryLabel="Ponów synchronizację"
            supportLabel="Pokaż diagnostykę"
            title="Nie udało się pobrać danych"
            variant="integration"
            onRetry={() => {
              retryAction();
              setRetryMessage(
                'Retry wysłany. Użytkownik dostał jawny komunikat o ponowieniu.',
              );
            }}
          />
        </div>
      </div>

      <div
        aria-live="polite"
        className="pd-x18-note"
      >
        {retryMessage}
      </div>

      <div className="pd-x18-light-rule" />

      <div className="pd-x18-feedback-grid">
        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Blocked</h3>
            <p className="pd-x18-region__text">
              Proces jest zablokowany przez zależność, ale nie wymaga alertu.
            </p>
          </div>
          <InlineNotice
            actionLabel="Zobacz blokadę"
            message="Import czeka na zaakceptowanie mapowania pól przez właściciela danych."
            title="Proces zablokowany"
            tone="info"
          />
        </div>

        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Forbidden</h3>
            <p className="pd-x18-region__text">
              Brak dostępu używa kanonicznego stanu no-access.
            </p>
          </div>
          <EmptyState
            message="Rola użytkownika nie obejmuje podglądu danych billingowych."
            primaryActionLabel="Poproś o dostęp"
            title="Nie masz dostępu"
            variant="forbidden"
          />
        </div>

        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Missing entitlement</h3>
            <p className="pd-x18-region__text">
              Brak uprawnienia produktowego jest oddzielony od błędu systemu.
            </p>
          </div>
          <InlineNotice
            actionLabel="Sprawdź plan"
            message="Funkcja rekomendacji AI wymaga aktywnego pakietu Growth."
            title="Brak uprawnienia w planie"
            tone="info"
            onAction={() => {
              entitlementAction();
            }}
          />
        </div>

        <div className="pd-x18-feedback-item">
          <div className="pd-x18-region__header">
            <h3 className="pd-x18-region__title">Retry</h3>
            <p className="pd-x18-region__text">
              Recovery jest widoczne tylko tam, gdzie użytkownik może naprawdę
              ponowić operację.
            </p>
          </div>
          <TextAction
            onClick={() => {
              retryAction();
              setRetryMessage(
                'Retry z akcji tekstowej został zapisany jako jawny stan story.',
              );
            }}
          >
            Ponów ostatnią operację
          </TextAction>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Empty, error i no-access',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FeedbackStatesStory: Story = {
  name: 'Empty, error i no-access',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca stanów feedback"
          items={[
            { label: 'Kontrakt', value: '18.02' },
            { label: 'Komponenty', value: 'EmptyState / ErrorState' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.02"
      summary="Wspólny język pustych stanów, błędów i braku dostępu korzysta z istniejących komponentów feedback. Alert pojawia się tylko przy rzeczywistym ErrorState."
      title="Empty, error i no-access"
    >
      <StoryPresentationSection
        index="01"
        summary="Empty, no results, no data, error, blocked, forbidden, missing entitlement i retry bez lokalnych zamienników komponentów."
        title="Kanoniczne stany feedback"
      >
        <FeedbackStateMatrix />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Empty, error i no-access',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('alert', {
        name: /Nie udało się pobrać danych/,
      }),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Ponów synchronizację',
      }),
    );

    await expect(
      canvas.getByText(/Retry wysłany/),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', {
        name: 'Poproś o dostęp',
      }),
    ).toBeInTheDocument();
  },
};
