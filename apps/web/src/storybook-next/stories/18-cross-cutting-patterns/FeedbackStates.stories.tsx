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

const feedbackRoutes = [
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Obszar istnieje, ale użytkownik nie dodał jeszcze danych.',
    id: '01',
    label: 'Empty',
  },
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Filtry działają, ale nie zwracają żadnego wyniku.',
    id: '02',
    label: 'No results',
  },
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Źródło nie ma danych dla metryki; to nie jest awaria.',
    id: '03',
    label: 'No data',
  },
  {
    alert: 'tak',
    component: 'ErrorState',
    description: 'Błąd systemowy wymaga roli alertu i ścieżki recovery.',
    id: '04',
    label: 'Error',
  },
  {
    alert: 'nie',
    component: 'InlineNotice',
    description: 'Proces czeka na zależność, ale użytkownik nie musi reagować alarmowo.',
    id: '05',
    label: 'Blocked',
  },
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Brak dostępu jest stanem uprawnień, nie błędem systemowym.',
    id: '06',
    label: 'Forbidden',
  },
  {
    alert: 'nie',
    component: 'InlineNotice',
    description: 'Brak entitlementu produktowego jest oddzielony od awarii.',
    id: '07',
    label: 'Missing entitlement',
  },
  {
    alert: 'nie',
    component: 'TextAction',
    description: 'Retry pokazujemy tylko wtedy, gdy operację można realnie ponowić.',
    id: '08',
    label: 'Retry',
  },
] as const;

function FeedbackStateMatrix() {
  const [retryMessage, setRetryMessage] = useState(
    'Retry nie został jeszcze uruchomiony.',
  );

  return (
    <div className="pd-x18-stack pd-x18-feedback-pattern">
      <div
        aria-label="Mapa decyzji dla stanów feedback"
        className="pd-x18-feedback-routes"
        role="list"
      >
        {feedbackRoutes.map((route) => (
          <div
            className="pd-x18-feedback-route"
            key={route.id}
            role="listitem"
          >
            <span className="pd-x18-feedback-route__id">{route.id}</span>
            <span className="pd-x18-feedback-route__name">{route.label}</span>
            <span className="pd-x18-feedback-route__description">
              {route.description}
            </span>
            <span className="pd-x18-feedback-route__component">
              {route.component}
            </span>
            <span className="pd-x18-feedback-route__alert">
              alert: {route.alert}
            </span>
          </div>
        ))}
      </div>

      <div className="pd-x18-feedback-stage">
        <section
          aria-labelledby="pd-x18-feedback-error-title"
          className="pd-x18-feedback-stage__main"
        >
          <div className="pd-x18-region__header">
            <p className="pd-x18-region__eyebrow">Stan alertowy</p>
            <h3
              className="pd-x18-region__title"
              id="pd-x18-feedback-error-title"
            >
              Error dostaje pełną uwagę
            </h3>
            <p className="pd-x18-region__text">
              Tylko rzeczywista awaria używa ErrorState i `role=alert`. Akcje
              prowadzą do diagnostyki albo ponowienia, nie do dekoracyjnego
              wariantu karty.
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

          <div
            aria-live="polite"
            className="pd-x18-note pd-x18-feedback-live-note"
          >
            {retryMessage}
          </div>
        </section>

        <section
          aria-labelledby="pd-x18-feedback-non-alert-title"
          className="pd-x18-feedback-stage__side"
        >
          <div className="pd-x18-region__header">
            <p className="pd-x18-region__eyebrow">Stany niealertowe</p>
            <h3
              className="pd-x18-region__title"
              id="pd-x18-feedback-non-alert-title"
            >
              Blokady i recovery zostają lekkie
            </h3>
            <p className="pd-x18-region__text">
              Informują o zależności albo możliwej akcji, ale nie konkurują
              wizualnie z awarią.
            </p>
          </div>

          <div className="pd-x18-feedback-compact-list">
            <div className="pd-x18-feedback-compact-item">
              <InlineNotice
                actionLabel="Zobacz blokadę"
                message="Import czeka na zaakceptowanie mapowania pól przez właściciela danych."
                title="Proces zablokowany"
                tone="info"
              />
            </div>
            <div className="pd-x18-feedback-compact-item">
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
            <div className="pd-x18-feedback-compact-item">
              <p className="pd-x18-region__text">
                Ostatni krok był możliwy do ponowienia bez eskalacji błędu.
              </p>
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
        </section>
      </div>

      <section
        aria-labelledby="pd-x18-feedback-empty-title"
        className="pd-x18-feedback-examples"
      >
        <div className="pd-x18-region__header">
          <p className="pd-x18-region__eyebrow">Puste stany i dostęp</p>
          <h3
            className="pd-x18-region__title"
            id="pd-x18-feedback-empty-title"
          >
            Cztery podobne przypadki, cztery różne intencje
          </h3>
          <p className="pd-x18-region__text">
            Komponent może wyglądać podobnie, ale copy i akcja mówią, czy
            użytkownik ma dodać dane, zmienić filtr, zaakceptować brak danych
            albo poprosić o dostęp.
          </p>
        </div>

        <div className="pd-x18-feedback-gallery">
          <div className="pd-x18-feedback-example pd-x18-feedback-example--wide">
            <EmptyState
              message="Dodaj pierwsze źródło, żeby uruchomić przepływ analizy."
              primaryActionLabel="Dodaj źródło"
              secondaryActionLabel="Zobacz wymagania"
              title="Brak źródeł danych"
              variant="empty"
            />
          </div>
          <div className="pd-x18-feedback-example">
            <EmptyState
              message="Zmień zakres dat albo usuń filtr kampanii, żeby zobaczyć wyniki."
              primaryActionLabel="Wyczyść filtry"
              title="Brak wyników"
              variant="search"
            />
          </div>
          <div className="pd-x18-feedback-example">
            <EmptyState
              message="Provider nie przekazuje wartości dla tej metryki w wybranym okresie."
              title="Brak danych w źródle"
              variant="configuration"
            />
          </div>
          <div className="pd-x18-feedback-example pd-x18-feedback-example--wide">
            <EmptyState
              message="Rola użytkownika nie obejmuje podglądu danych billingowych."
              primaryActionLabel="Poproś o dostęp"
              title="Nie masz dostępu"
              variant="forbidden"
            />
          </div>
        </div>
      </section>
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
