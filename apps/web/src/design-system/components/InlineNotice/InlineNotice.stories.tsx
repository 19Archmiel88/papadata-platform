import type {
  CSSProperties,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  InlineNotice,
} from './InlineNotice';
import '../Feedback/feedback-showcase.css';

const meta = {
  title: '10 Komponenty/InlineNotice',
  component: InlineNotice,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof InlineNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

const themeFrameStyle = {
  display: 'grid',
  gap: 'var(--pd-space-3)',
} satisfies CSSProperties;

export const InlineNoticeStory: Story = {
  args: {
    title: 'Widoczność danych wymaga decyzji.',
    message: 'Ten komunikat pozostaje osadzony w kontekście sekcji i nie wymaga osobnej warstwy.',
    tone: 'info',
  },
  name: 'Komunikat kontekstowy',
  render: () => (
    <main className="pd-feedback-story">
      <div className="pd-feedback-story__inner">
        <header className="pd-feedback-story__header">
          <p className="pd-feedback-story__kicker">10 Komponenty/InlineNotice</p>
          <h1>Komunikat kontekstowy dla statusów i decyzji.</h1>
          <p className="pd-feedback-story__lead">
            Warianty informacyjne, sukcesu, ostrzeżenia i błędu pozostają lekkie,
            czytelne i gotowe do osadzenia w sekcjach bez budowania osobnego runtime.
          </p>
        </header>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Warianty tonalne</h2>
          <div className="pd-feedback-story__stack">
            <InlineNotice
              actionLabel="Sprawdź szczegóły"
              message="Synchronizacja danych odbywa się zgodnie z ostatnim harmonogramem."
              title="Informacja operacyjna"
              tone="info"
            />
            <InlineNotice
              message="Nowa konfiguracja została zapisana i jest gotowa do publikacji."
              title="Sukces zapisu"
              tone="success"
            />
            <InlineNotice
              actionLabel="Otwórz rekomendacje"
              message="Część danych czeka jeszcze na ręczne potwierdzenie jakości."
              title="Ostrzeżenie jakościowe"
              tone="warning"
            />
            <InlineNotice
              dismissible
              message="Nie udało się przeliczyć ostatniego importu w bieżącym oknie czasu."
              title="Błąd przetwarzania"
              tone="critical"
            />
          </div>
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Motywy</h2>
          <div className="pd-feedback-story__grid">
            <div className="pd-feedback-story__frame" style={themeFrameStyle}>
              <span className="pd-feedback-story__eyebrow">tryb jasny</span>
              <InlineNotice
                actionLabel="Zobacz zalecenia"
                message="Zespół może przejść dalej po krótkiej weryfikacji zależności."
                title="Komunikat w motywie jasnym"
                tone="info"
              />
            </div>

            <div
              className="pd-feedback-story__frame"
              data-theme="dark"
              style={themeFrameStyle}
            >
              <span className="pd-feedback-story__eyebrow">tryb ciemny</span>
              <InlineNotice
                dismissible
                message="Wariant zachowuje spokojny kontrast i nie opiera znaczenia wyłącznie na kolorze."
                title="Komunikat w motywie ciemnym"
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
        name: 'Informacja operacyjna',
      }),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('alert', {
        name: 'Błąd przetwarzania',
      }),
    ).toBeInTheDocument();
  },
};
