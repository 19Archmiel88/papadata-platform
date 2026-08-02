import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ProgressIndicator,
} from './ProgressIndicator';

import '../Loading/loading-showcase.css';

const meta = {
  title: '10 Komponenty/ProgressIndicator',
  component: ProgressIndicator,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Pasek postępu PapaData pokazuje wartość, stan i semantykę progressbara bez dekoracyjnych ozdobników.',
      },
    },
  },
} satisfies Meta<typeof ProgressIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProgressIndicatorStory: Story = {
  args: {
    indeterminate: false,
    label: 'Postęp synchronizacji',
    max: 100,
    showValue: true,
    tone: 'neutral',
    value: 64,
  },
  name: 'Postęp',
  render: () => (
    <main className="pd-loading-story">
      <div className="pd-loading-story__inner">
        <header className="pd-loading-story__header">
          <p className="pd-loading-story__kicker">10 Komponenty/ProgressIndicator</p>
          <h1>Postęp ma być precyzyjny i semantyczny.</h1>
          <p className="pd-loading-story__lead">
            Komponent obsługuje stan z wartością, stan nieokreślony oraz
            warianty znaczeniowe. Zawsze zachowuje rolę progressbara i opis,
            gdy użytkownik potrzebuje kontekstu.
          </p>
        </header>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Warianty znaczeniowe</h2>
          <div className="pd-loading-story__list">
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Neutralny</h3>
                <p>Analiza przechodzi przez kolejne kroki bez nadmiaru dekoracji.</p>
              </div>
              <ProgressIndicator
                description="Analiza przygotowuje kolejne kroki w tle."
                indeterminate={false}
                label="Postęp analizy"
                max={100}
                showValue
                tone="neutral"
                value={64}
              />
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Sukces</h3>
                <p>Wartość jest pełna, ale kolor pozostaje lokalnym akcentem.</p>
              </div>
              <ProgressIndicator
                description="Wynik jest gotowy do zatwierdzenia."
                indeterminate={false}
                label="Finalizacja importu"
                max={100}
                showValue
                tone="success"
                value={100}
              />
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Ostrzeżenie</h3>
                <p>Wymaga uwagi, ale nie zamienia całego wiersza w kolorową kartę.</p>
              </div>
              <ProgressIndicator
                description="Jedno ze źródeł wymaga ręcznego potwierdzenia."
                indeterminate={false}
                label="Kontrola jakości danych"
                max={100}
                showValue
                tone="warning"
                value={42}
              />
            </div>
            <div className="pd-loading-story__spec-row">
              <div className="pd-loading-story__spec-label">
                <h3>Błąd</h3>
                <p>Stan problemowy zachowuje semantykę i czytelność danych.</p>
              </div>
              <ProgressIndicator
                description="Proces zatrzymał się przed zakończeniem."
                indeterminate={false}
                label="Przesył danych"
                max={100}
                showValue
                tone="critical"
                value={27}
              />
            </div>
          </div>
        </section>

        <section className="pd-loading-story__section">
          <h2 className="pd-loading-story__section-title">Postęp nieokreślony i motywy</h2>
          <div className="pd-loading-story__theme-grid">
            <div className="pd-loading-story__theme-row">
              <span className="pd-loading-story__eyebrow">tryb jasny</span>
              <ProgressIndicator
                description="System czeka na odpowiedź z kolejki zadań."
                indeterminate
                label="Przygotowanie paczki eksportu"
                max={100}
                showValue
                value={null}
              />
            </div>
            <div className="pd-loading-story__theme-row" data-theme="dark">
              <span className="pd-loading-story__eyebrow">tryb ciemny</span>
              <ProgressIndicator
                description="System czeka na odpowiedź z kolejki zadań."
                indeterminate
                label="Przygotowanie paczki eksportu"
                max={100}
                showValue
                value={null}
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
    const neutralRow = canvas.getByRole('heading', {
      name: 'Neutralny',
    }).closest('.pd-loading-story__spec-row') as HTMLElement | null;
    const lightThemeRow = canvas.getByText('tryb jasny').closest('.pd-loading-story__theme-row') as HTMLElement | null;

    if (!neutralRow || !lightThemeRow) {
      throw new Error('Nie znaleziono oczekiwanych wariantów paska postępu.');
    }

    await expect(
      within(neutralRow).getByRole('progressbar', {
        name: 'Postęp analizy',
      }),
    ).toHaveAttribute('aria-valuenow', '64');

    await expect(
      within(lightThemeRow).getByRole('progressbar', {
        name: 'Przygotowanie paczki eksportu',
      }),
    ).toHaveAttribute(
      'aria-valuetext',
      'Przygotowanie paczki eksportu: w toku',
    );
  },
};
