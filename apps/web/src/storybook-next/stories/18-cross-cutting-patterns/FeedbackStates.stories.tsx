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
const emptySourceAction = fn();
const requirementsAction = fn();
const filterAction = fn();
const blockerAction = fn();
const planAction = fn();
const accessRequestAction = fn();

const feedbackRoutes = [
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Obszar istnieje, ale użytkownik nie dodał jeszcze danych.',
    id: '01',
    label: 'Stan pusty',
  },
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Filtry działają, ale nie zwracają żadnego wyniku.',
    id: '02',
    label: 'Brak wyników',
  },
  {
    alert: 'nie',
    component: 'EmptyState',
    description:
      'Operacyjny widok nie ma danych poza wykresem; analityczne stany danych pozostają w 15.08.',
    id: '03',
    label: 'Brak danych operacyjnych',
  },
  {
    alert: 'tak',
    component: 'ErrorState',
    description: 'Błąd systemowy wymaga roli alertu i ścieżki naprawy.',
    id: '04',
    label: 'Błąd systemowy',
  },
  {
    alert: 'nie',
    component: 'InlineNotice',
    description: 'Proces czeka na zależność, ale użytkownik nie musi reagować alarmowo.',
    id: '05',
    label: 'Blokada procesu',
  },
  {
    alert: 'nie',
    component: 'EmptyState',
    description: 'Brak dostępu jest stanem uprawnień, nie błędem systemowym.',
    id: '06',
    label: 'Brak dostępu',
  },
  {
    alert: 'nie',
    component: 'InlineNotice',
    description: 'Brak uprawnienia produktowego jest oddzielony od awarii.',
    id: '07',
    label: 'Brak uprawnienia w planie',
  },
  {
    alert: 'nie',
    component: 'TextAction',
    description: 'Ponowienie pokazujemy tylko wtedy, gdy operację można realnie ponowić.',
    id: '08',
    label: 'Ponowienie',
  },
] as const;

function FeedbackStateMatrix() {
  const [feedbackMessage, setFeedbackMessage] = useState(
    'Nie uruchomiono jeszcze żadnej akcji feedbacku.',
  );

  const recordFeedbackAction = (
    action: () => void,
    message: string,
  ) => {
    action();
    setFeedbackMessage(message);
  };

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
              rola alertu: {route.alert}
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
              Awaria dostaje pełną uwagę
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
              recordFeedbackAction(
                retryAction,
                'Ponowienie wysłane. Użytkownik dostał jawny komunikat o ponowieniu.',
              );
            }}
          />

          <div
            aria-live="polite"
            className="pd-x18-note pd-x18-feedback-live-note"
          >
            {feedbackMessage}
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
              Blokady i naprawa zostają lekkie
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
                onAction={() => {
                  recordFeedbackAction(
                    blockerAction,
                    'Szczegóły blokady zostały odnotowane jako lekka akcja informacyjna.',
                  );
                }}
              />
            </div>
            <div className="pd-x18-feedback-compact-item">
              <InlineNotice
                actionLabel="Sprawdź plan"
                message="Funkcja rekomendacji AI wymaga aktywnego pakietu Growth."
                title="Brak uprawnienia w planie"
                tone="info"
                onAction={() => {
                  recordFeedbackAction(
                    planAction,
                    'Przejście do planu zostało odnotowane bez eskalacji do alertu.',
                  );
                }}
              />
            </div>
            <div className="pd-x18-feedback-compact-item">
              <p className="pd-x18-region__text">
                Ostatni krok był możliwy do ponowienia bez eskalacji błędu.
              </p>
              <TextAction
                onClick={() => {
                  recordFeedbackAction(
                    retryAction,
                    'Ponowienie z akcji tekstowej zostało zapisane jako jawny stan story.',
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
              onPrimaryAction={() => {
                recordFeedbackAction(
                  emptySourceAction,
                  'Dodanie pierwszego źródła zostało odnotowane jako akcja stanu pustego.',
                );
              }}
              onSecondaryAction={() => {
                recordFeedbackAction(
                  requirementsAction,
                  'Wymagania źródeł zostały otwarte jako pomocnicza akcja stanu pustego.',
                );
              }}
            />
          </div>
          <div className="pd-x18-feedback-example">
            <EmptyState
              message="Zmień zakres dat albo usuń filtr kampanii, żeby zobaczyć wyniki."
              primaryActionLabel="Wyczyść filtry"
              title="Brak wyników"
              variant="search"
              onPrimaryAction={() => {
                recordFeedbackAction(
                  filterAction,
                  'Wyczyszczenie filtrów zostało odnotowane jako akcja dla braku wyników.',
                );
              }}
            />
          </div>
          <div className="pd-x18-feedback-example">
            <EmptyState
              message="Źródło operacyjne nie przekazuje wartości dla tego widoku."
              title="Brak danych operacyjnych"
              variant="configuration"
            />
          </div>
          <div className="pd-x18-feedback-example pd-x18-feedback-example--wide">
            <EmptyState
              message="Rola użytkownika nie obejmuje podglądu danych billingowych."
              primaryActionLabel="Poproś o dostęp"
              title="Nie masz dostępu"
              variant="forbidden"
              onPrimaryAction={() => {
                recordFeedbackAction(
                  accessRequestAction,
                  'Prośba o dostęp została wysłana do właściciela danych.',
                );
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Routing feedbacku',
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
  name: 'Routing feedbacku',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry routingu feedbacku"
          items={[
            { label: 'Kontrakt', value: '18.02' },
            { label: 'Komponenty', value: 'EmptyState / ErrorState' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.02"
      summary="Wzorzec wybiera właściwy element feedbacku z 00 / Powierzchnie i komunikaty. Analityczne stany danych pozostają przy 15.08 / ChartDataState."
      title="Routing feedbacku"
    >
      <StoryPresentationSection
        index="01"
        summary="Macierz decyduje, kiedy użyć EmptyState, ErrorState albo InlineNotice. Kanoniczny wygląd pozostaje w 00, a stany wykresów w 15.08."
        title="Macierz routingu feedbacku"
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
        name: 'Routing feedbacku',
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('alert', {
        name: /Nie udało się pobrać danych/,
      }),
    ).toBeInTheDocument();

    await expect(
      canvas.getAllByRole('alert'),
    ).toHaveLength(1);

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Ponów synchronizację',
      }),
    );

    await expect(
      canvas.getByText(/Ponowienie wysłane/),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Poproś o dostęp',
      }),
    );

    await expect(
      canvas.getByText(/Prośba o dostęp została wysłana/),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Sprawdź plan',
      }),
    );

    await expect(
      canvas.getByText(/Przejście do planu zostało odnotowane/),
    ).toBeInTheDocument();
  },
};
