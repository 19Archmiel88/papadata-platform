import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ErrorState,
} from './ErrorState';
import '../Feedback/feedback-showcase.css';

const meta = {
  title: '10 Komponenty/ErrorState',
  component: ErrorState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof ErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ErrorStateStory: Story = {
  args: {
    errorCode: 'ERR-500',
    message: 'Komponent prezentuje błąd oraz ścieżki odzyskania bez podłączania runtime.',
    title: 'Nie udało się pobrać danych.',
  },
  name: 'Stan błędu',
  render: () => (
    <main className="pd-feedback-story">
      <div className="pd-feedback-story__inner">
        <header className="pd-feedback-story__header">
          <p className="pd-feedback-story__kicker">10 Komponenty/ErrorState</p>
          <h1>Stan błędu z odzyskaniem i śladem technicznym.</h1>
          <p className="pd-feedback-story__lead">
            Warianty danych, uprawnień, integracji i systemu pozostają odseparowane
            od ekranów produkcyjnych, ale pokazują prawidłowy ton i działania.
          </p>
        </header>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Wariant referencyjny</h2>
          <ErrorState
            correlationId="corr-29A1"
            errorCode="DATA-409"
            message="Źródło zwróciło niespójny zakres metryk i wymaga ponownego przeliczenia."
            retryLabel="Przelicz ponownie"
            supportLabel="Pokaż szczegóły"
            title="Błąd danych wejściowych."
            variant="data"
          />
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Warianty</h2>
          <div className="pd-feedback-story__list">
            <div className="pd-feedback-story__spec-row">
              <div className="pd-feedback-story__spec-label">
                <h3>Brak uprawnień</h3>
                <p>Stan blokady pozostaje czytelny bez ciężkiej czerwonej karty.</p>
              </div>
              <ErrorState
                correlationId="perm-77K"
                errorCode="AUTH-403"
                message="Do wykonania tej operacji potrzebna jest decyzja właściciela przestrzeni."
                recoverable={false}
                title="Brak wystarczających uprawnień."
                variant="permission"
              />
            </div>
            <div className="pd-feedback-story__spec-row">
              <div className="pd-feedback-story__spec-label">
                <h3>Błąd integracji</h3>
                <p>Opisuje problem i pokazuje prostą ścieżkę odzyskania.</p>
              </div>
              <ErrorState
                correlationId="int-908"
                errorCode="INT-502"
                message="Provider odpowiedział niepełnie i wymaga ponowienia po stronie synchronizacji."
                retryLabel="Spróbuj ponownie"
                title="Błąd po stronie integracji."
                variant="integration"
              />
            </div>
            <div className="pd-feedback-story__spec-row">
              <div className="pd-feedback-story__spec-label">
                <h3>Błąd systemowy</h3>
                <p>Utrzymuje ślad techniczny i działania pomocnicze.</p>
              </div>
              <ErrorState
                correlationId="sys-114"
                errorCode="SYS-500"
                message="Warstwa systemowa nie zakończyła operacji w oczekiwanym czasie."
                retryLabel="Ponów"
                supportLabel="Skontaktuj się ze wsparciem"
                title="Błąd systemowy."
                variant="system"
              />
            </div>
          </div>
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Motywy</h2>
          <div className="pd-feedback-story__theme-grid">
            <div className="pd-feedback-story__theme-row">
              <span className="pd-feedback-story__eyebrow">tryb jasny</span>
              <ErrorState
                correlationId="corr-light"
                errorCode="INT-502"
                message="Akcja odzyskania pozostaje spokojna i nie dominuje nad opisem problemu."
                title="Integracja wymaga ponowienia."
                variant="integration"
              />
            </div>
            <div
              className="pd-feedback-story__theme-row"
              data-theme="dark"
            >
              <span className="pd-feedback-story__eyebrow">tryb ciemny</span>
              <ErrorState
                correlationId="corr-dark"
                errorCode="AUTH-403"
                message="Wariant ciemny utrzymuje czytelny kontrast bez agresywnej czerwieni."
                recoverable={false}
                title="Dostęp pozostaje zablokowany."
                variant="permission"
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
      canvas.getByRole('alert', {
        name: 'Błąd danych wejściowych.',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Kod błędu: DATA-409'),
    ).toBeInTheDocument();
  },
};
