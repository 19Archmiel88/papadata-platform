import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  EmptyState,
} from './EmptyState';
import '../Feedback/feedback-showcase.css';

const meta = {
  title: '10 Komponenty/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const EmptyStateStory: Story = {
  args: {
    title: 'Brak danych do wyświetlenia.',
    message: 'Komponent prowadzi użytkownika do następnego kroku bez budowania ciężkiej karty ekranowej.',
  },
  name: 'Pusty stan',
  render: () => (
    <main className="pd-feedback-story">
      <div className="pd-feedback-story__inner">
        <header className="pd-feedback-story__header">
          <p className="pd-feedback-story__kicker">10 Komponenty/EmptyState</p>
          <h1>Pusty stan dla braków danych, wyników i dostępu.</h1>
          <p className="pd-feedback-story__lead">
            Warianty pozostają spokojne wizualnie, wskazują następną akcję i nie
            przejmują odpowiedzialności całego ekranu.
          </p>
        </header>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Wariant referencyjny</h2>
          <EmptyState
            message="Podłącz źródło danych, aby zbudować pierwszy widok operacyjny."
            primaryActionLabel="Dodaj źródło"
            secondaryActionLabel="Sprawdź wymagania"
            title="Brak danych źródłowych."
            variant="empty"
          />
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Warianty</h2>
          <div className="pd-feedback-story__list">
            <div className="pd-feedback-story__spec-row">
              <div className="pd-feedback-story__spec-label">
                <h3>Brak wyników</h3>
                <p>Zawężenie kontekstu bez budowania osobnego ekranu.</p>
              </div>
              <EmptyState
                message="Zmień frazę albo zawęź filtry, aby odzyskać wyniki wyszukiwania."
                primaryActionLabel="Wyczyść filtry"
                title="Brak wyników dla bieżącego zapytania."
                variant="search"
              />
            </div>
            <div className="pd-feedback-story__spec-row">
              <div className="pd-feedback-story__spec-label">
                <h3>Ograniczony dostęp</h3>
                <p>Uprawnienia są komunikowane spokojnie i lokalnie.</p>
              </div>
              <EmptyState
                message="Ten moduł wymaga dodatkowego uprawnienia lub potwierdzenia właściciela obszaru."
                secondaryActionLabel="Poproś o dostęp"
                title="Dostęp jest ograniczony."
                variant="forbidden"
              />
            </div>
            <div className="pd-feedback-story__spec-row">
              <div className="pd-feedback-story__spec-label">
                <h3>Wymagana konfiguracja</h3>
                <p>Pusty stan prowadzi do następnego kroku bez ciężkiej ramy.</p>
              </div>
              <EmptyState
                message="Najpierw ustaw zasady synchronizacji i zdefiniuj podstawowe mapowanie pól."
                primaryActionLabel="Skonfiguruj integrację"
                title="Wymagana jest konfiguracja początkowa."
                variant="configuration"
              />
            </div>
          </div>
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Motywy</h2>
          <div className="pd-feedback-story__theme-grid">
            <div className="pd-feedback-story__theme-row">
              <span className="pd-feedback-story__eyebrow">tryb jasny</span>
              <EmptyState
                message="Wariant zachowuje czytelny rytm typograficzny i lekkie akcje."
                primaryActionLabel="Dodaj źródło"
                title="Brak danych w motywie jasnym."
                variant="empty"
              />
            </div>
            <div
              className="pd-feedback-story__theme-row"
              data-theme="dark"
            >
              <span className="pd-feedback-story__eyebrow">tryb ciemny</span>
              <EmptyState
                message="Brak dostępu pozostaje czytelny bez agresywnych kolorów i ciężkich dekoracji."
                secondaryActionLabel="Poproś o dostęp"
                title="Brak dostępu w motywie ciemnym."
                variant="forbidden"
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
      canvas.getByRole('heading', {
        name: 'Brak danych źródłowych.',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {
        name: 'Dodaj źródło',
      }),
    ).toBeInTheDocument();
  },
};
