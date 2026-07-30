import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  Breadcrumbs,
} from './Breadcrumbs';
import '../Navigation/navigation-showcase.css';

const meta = {
  title: '10 Komponenty/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Ścieżka nawigacji pokazuje kontekst miejsca w strukturze bez udawania pełnego topbaru lub marketingowej belki.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumbs>;

export default meta;

type Story = StoryObj<typeof meta>;

const items = [
  {
    current: false,
    href: '#obszar',
    id: 'obszar',
    label: 'Obszar roboczy',
  },
  {
    current: false,
    href: '#analityka',
    id: 'analityka',
    label: 'Analityka kampanii',
  },
  {
    current: false,
    href: '#retencja',
    id: 'retencja',
    label: 'Retencja klientów',
  },
  {
    current: true,
    href: null,
    id: 'szczegoly',
    label: 'Szczegóły segmentu lipcowego',
  },
] as const;

export const BreadcrumbsStory: Story = {
  args: {
    items: [],
    maxVisible: 4,
  },
  name: 'Ścieżka nawigacji',
  render: () => (
    <main className="pd-navigation-story">
      <div className="pd-navigation-story__inner">
        <header className="pd-navigation-story__header">
          <p className="pd-navigation-story__kicker">10 Komponenty/Breadcrumbs</p>
          <h1>Ścieżka ma tłumaczyć położenie, a nie tworzyć osobny pasek marki.</h1>
          <p className="pd-navigation-story__lead">
            Ostatni element pozostaje zwykłym tekstem. Separator jest subtelny,
            a długie ścieżki można skrócić bez utraty kontekstu.
          </p>
        </header>

        <section className="pd-navigation-story__section">
          <h2>Warianty</h2>
          <div className="pd-navigation-story__rows">
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Pełna ścieżka z bieżącym elementem na końcu.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <Breadcrumbs items={items} maxVisible={4} />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Dłuższa ścieżka</h3>
                <p>Rozwinięty kontekst z długą etykietą w języku polskim.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <Breadcrumbs
                  items={[
                    ...items.slice(0, 3),
                    {
                      current: true,
                      href: null,
                      id: 'angielski',
                      label:
                        'Eksport dla zarządu z porównaniem okresów i filtrem jakości danych',
                    },
                  ]}
                  maxVisible={4}
                />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Skrócenie ścieżki</h3>
                <p>Prosta elipsa ukrywa środkowe poziomy bez zmiany bieżącego miejsca.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <Breadcrumbs
                  items={[
                    {
                      current: false,
                      href: '#organizacja',
                      id: 'organizacja',
                      label: 'Organizacja',
                    },
                    ...items,
                  ]}
                  maxVisible={4}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-navigation-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-navigation-story__theme-grid">
            <div className="pd-navigation-story__theme-column">
              <span className="pd-navigation-story__eyebrow">tryb jasny</span>
              <Breadcrumbs items={items} maxVisible={4} />
            </div>
            <div
              className="pd-navigation-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-navigation-story__eyebrow">tryb ciemny</span>
              <Breadcrumbs items={items} maxVisible={3} />
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
