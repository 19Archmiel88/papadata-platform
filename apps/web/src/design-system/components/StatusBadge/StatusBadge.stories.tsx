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
  StatusBadge,
} from './StatusBadge';
import '../Feedback/feedback-showcase.css';

const meta = {
  title: '10 Komponenty/StatusBadge',
  component: StatusBadge,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

const themeFrameStyle = {
  display: 'grid',
  gap: 'var(--pd-space-3)',
} satisfies CSSProperties;

export const StatusBadgeStory: Story = {
  args: {
    status: 'Przetwarzanie',
    text: 'Przetwarzanie',
    tone: 'processing',
  },
  name: 'Kompaktowy status',
  render: () => (
    <main className="pd-feedback-story">
      <div className="pd-feedback-story__inner">
        <header className="pd-feedback-story__header">
          <p className="pd-feedback-story__kicker">10 Komponenty/StatusBadge</p>
          <h1>Status wymaga tekstu.</h1>
          <p className="pd-feedback-story__lead">
            Status pozostaje lekką kapsułą z cienkim obrysem, kropką i tekstem.
            Kolor wzmacnia znaczenie, ale nie zastępuje etykiety.
          </p>
        </header>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Warianty</h2>
          <div className="pd-feedback-story__table">
            <StatusBadge status="Stabilność" text="Stabilne" tone="success" />
            <StatusBadge status="Weryfikacja" text="Do sprawdzenia" tone="warning" />
            <StatusBadge status="Synchronizacja" text="Błąd synchronizacji" tone="critical" />
            <StatusBadge status="Start" text="Nie rozpoczęto" tone="neutral" />
            <StatusBadge status="Przetwarzanie" text="Przetwarzanie" tone="processing" />
          </div>
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Kierunek przyjęty i odrzucony</h2>
          <div
            className="pd-feedback-story__direction-grid"
            data-theme="dark"
          >
            <div className="pd-feedback-story__direction-card">
              <StatusBadge status="Kierunek" text="Przyjęte" tone="success" />
              <div className="pd-feedback-story__direction-copy">
                <h3>Neutralne powierzchnie, lokalny akcent</h3>
                <p>
                  Spokojny canvas, precyzyjne separatory, duża czytelność danych
                  i kolor używany oszczędnie wyłącznie do statusu.
                </p>
              </div>
            </div>
            <div
              className="pd-feedback-story__direction-card"
              data-tone="critical"
            >
              <StatusBadge status="Kierunek" text="Odrzucone" tone="critical" />
              <div className="pd-feedback-story__direction-copy">
                <h3>Neonowe halo i nadmiar kart</h3>
                <p>
                  Zbyt mocne poświaty, przypadkowe gradienty i ciężkie zamknięcie
                  każdej informacji w osobnej karcie nie są kierunkiem PapaData.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="pd-feedback-story__section">
          <h2 className="pd-feedback-story__section-title">Motywy</h2>
          <div className="pd-feedback-story__grid">
            <div className="pd-feedback-story__frame" style={themeFrameStyle}>
              <span className="pd-feedback-story__eyebrow">tryb jasny</span>
              <div className="pd-feedback-story__table">
                <StatusBadge status="Import" text="Stabilne" tone="success" />
                <StatusBadge status="Analiza" text="Przetwarzanie" tone="processing" />
              </div>
            </div>
            <div
              className="pd-feedback-story__frame"
              data-theme="dark"
              style={themeFrameStyle}
            >
              <span className="pd-feedback-story__eyebrow">tryb ciemny</span>
              <div className="pd-feedback-story__table">
                <StatusBadge status="Uprawnienia" text="Do sprawdzenia" tone="warning" />
                <StatusBadge status="Integracja" text="Błąd synchronizacji" tone="critical" />
              </div>
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
      canvas.getByLabelText('Przetwarzanie: Przetwarzanie'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Przyjęte'),
    ).toBeInTheDocument();
  },
};
