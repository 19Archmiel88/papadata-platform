import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Toast,
} from './Toast';
import '../Feedback/feedback-showcase.css';

const meta = {
  title: '10 Komponenty/Toast',
  component: Toast,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ToastStory: Story = {
  args: {
    message: 'To jest komponent prezentacyjny bez globalnego systemu kolejkowania.',
    toastId: 'toast-preview',
    tone: 'info',
  },
  name: 'Powiadomienie chwilowe',
  render: () => (
    <main className="pd-feedback-story">
      <div className="pd-feedback-story__inner">
        <header className="pd-feedback-story__header">
          <p className="pd-feedback-story__kicker">10 Komponenty/Toast</p>
          <h1>Powiadomienie chwilowe bez globalnego runtime.</h1>
          <p className="pd-feedback-story__lead">
            Toast pozostaje wyłącznie komponentem prezentacyjnym: pokazuje ton,
            treść, akcję i zamknięcie, ale nie zarządza kolejką ani czasem życia aplikacji.
          </p>
        </header>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Warianty</h2>
          <div className="pd-feedback-story__toast-stack">
            <Toast
              actionLabel="Otwórz log"
              durationMs={5000}
              message="Zapis zakończył się poprawnie i może zostać zweryfikowany w historii zmian."
              title="Sukces zapisu"
              toastId="toast-success"
              tone="success"
            />
            <Toast
              actionLabel="Pokaż szczegóły"
              dismissible
              message="Część rekordów nadal czeka na zatwierdzenie, zanim zostanie opublikowana."
              title="Ostrzeżenie operacyjne"
              toastId="toast-warning"
              tone="warning"
            />
            <Toast
              dismissible
              durationMs={null}
              message="Nie udało się ukończyć operacji. Wariant pozostaje tylko demonstracją warstwy wizualnej."
              title="Błąd wykonania"
              toastId="toast-critical"
              tone="critical"
            />
          </div>
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Motywy</h2>
          <div className="pd-feedback-story__toast-theme-grid">
            <div className="pd-feedback-story__toast-theme-column">
              <span className="pd-feedback-story__eyebrow">tryb jasny</span>
              <Toast
                actionLabel="Przejdź dalej"
                durationMs={4000}
                message="Powiadomienie zachowuje lekki kontrast i nie wygląda jak modal."
                title="Motyw jasny"
                toastId="toast-light"
                tone="info"
              />
            </div>
            <div
              className="pd-feedback-story__toast-theme-column"
              data-theme="dark"
            >
              <span className="pd-feedback-story__eyebrow">tryb ciemny</span>
              <Toast
                dismissible
                durationMs={null}
                message="Wariant ciemny utrzymuje czytelność bez ciężkich ramek i neonowych akcentów."
                title="Motyw ciemny"
                toastId="toast-dark"
                tone="warning"
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
      canvas.getByRole('status', {
        name: 'Sukces zapisu',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('alert', {
        name: 'Błąd wykonania',
      }),
    ).toBeInTheDocument();
  },
};
