import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Button,
} from '../Button';
import {
  Spinner,
} from './Spinner';

import '../Loading/loading-showcase.css';

const meta = {
  title: '10 Komponenty/Spinner',
  component: Spinner,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Wskaźnik ładowania PapaData utrzymuje spokojne tempo, czytelny opis i zgodność z dark oraz light mode bez ciężkich kontenerów.',
      },
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SpinnerStory: Story = {
  args: {
    delayMs: 120,
    label: 'Ładowanie danych',
    size: 20,
  },
  name: 'Wskaźnik ładowania',
  render: () => (
    <main className="pd-loading-story">
      <div className="pd-loading-story__inner">
        <header className="pd-loading-story__header">
          <p className="pd-loading-story__kicker">10 Komponenty/Spinner</p>
          <h1>Ładowanie ma uspokajać, a nie dominować ekran.</h1>
          <p className="pd-loading-story__lead">
            Spinner działa jako lekki sygnał stanu. Zachowuje etykietę,
            wspiera reduced motion i może pracować zarówno w tekście,
            jak i w sekcji roboczej.
          </p>
        </header>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Rozmiary i użycie inline</h2>
          <div className="pd-loading-story__sizes-row">
            <span className="pd-loading-story__size-item">
              <Spinner delayMs={0} label="Ładowanie niewielkiego bloku" size={16} showLabel />
              <span className="pd-loading-story__size-label">mały</span>
            </span>
            <span className="pd-loading-story__size-item">
              <Spinner delayMs={120} label="Ładowanie danych źródłowych" size={20} showLabel />
              <span className="pd-loading-story__size-label">średni</span>
            </span>
            <span className="pd-loading-story__size-item">
              <Spinner delayMs={180} label="Przygotowanie sekcji analitycznej" size={28} showLabel />
              <span className="pd-loading-story__size-label">duży</span>
            </span>
          </div>
        </section>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">W tekście i w akcji</h2>
          <div className="pd-loading-story__list">
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Wariant inline</h3>
                <p>Ładowanie pozostaje częścią zdania i nie tworzy osobnego modułu.</p>
              </div>
              <div className="pd-loading-story__inline-group">
                <Spinner delayMs={0} label="Trwa sprawdzanie integralności" size={16} />
                <span>Trwa sprawdzanie integralności źródeł danych.</span>
              </div>
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Wariant przycisku</h3>
                <p>Stan zajętości jest osadzony bez dodatkowego kontenera demonstracyjnego.</p>
              </div>
              <Button loading loadingLabel="Zapisywanie zmian">
                Zapisz zmiany
              </Button>
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Wariant sekcyjny</h3>
                <p>Minimalny obszar roboczy z separatorem zamiast dużej karty.</p>
              </div>
              <Spinner
                delayMs={240}
                inline={false}
                label="Ładowanie sekcji przeglądu kampanii"
                showLabel
                size={24}
              />
            </div>
          </div>
        </section>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Tryby kolorystyczne</h2>
          <div className="pd-loading-story__theme-grid">
            <div className="pd-loading-story__theme-row">
              <span className="pd-loading-story__eyebrow">tryb jasny</span>
              <Spinner delayMs={90} inline={false} label="Ładowanie raportu dziennego" showLabel size={20} />
            </div>
            <div className="pd-loading-story__theme-row" data-theme="dark">
              <span className="pd-loading-story__eyebrow">tryb ciemny</span>
              <Spinner delayMs={90} inline={false} label="Ładowanie raportu dziennego" showLabel size={20} />
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
    const mediumSizeItem = canvas.getByText('średni').closest('.pd-loading-story__size-item') as HTMLElement | null;
    const loadingButton = canvas.getByRole('button', {
      name: 'Zapisywanie zmian',
    });

    if (!mediumSizeItem) {
      throw new Error('Nie znaleziono średniego wariantu spinnera.');
    }

    await expect(
      within(mediumSizeItem).getByRole('status'),
    ).toHaveTextContent('Ładowanie danych źródłowych');

    await expect(
      loadingButton,
    ).toHaveAttribute('aria-busy', 'true');
  },
};
