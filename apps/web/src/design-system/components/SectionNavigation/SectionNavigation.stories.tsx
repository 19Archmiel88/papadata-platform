import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import {
  SectionNavigation,
} from './SectionNavigation';
import '../Navigation/navigation-showcase.css';

const items = [
  {
    href: '#przeglad',
    icon: 'home',
    id: 'przeglad',
    label: 'Przegląd',
  },
  {
    badge: '3',
    href: '#jakosc',
    icon: 'data',
    id: 'jakosc',
    label: 'Jakość danych',
  },
  {
    disabled: true,
    href: '#integracje',
    icon: 'integration',
    id: 'integracje',
    label: 'Integracje',
  },
] as const;

const meta = {
  title: '10 Komponenty/SectionNavigation',
  component: SectionNavigation,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof SectionNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SectionNavigationStory: Story = {
  args: {
    activeId: 'przeglad',
    items: [],
    orientation: 'horizontal',
  },
  name: 'Nawigacja sekcji',
  render: () => (
    <div className="pd-navigation-story">
      <div className="pd-navigation-story__inner">
        <header className="pd-navigation-story__header">
          <p className="pd-navigation-story__kicker">10 Komponenty/SectionNavigation</p>
          <h1>Nawigacja sekcji ma wyglądać jak lokalny system pracy, nie jak uproszczony sidebar.</h1>
          <p className="pd-navigation-story__lead">
            Aktywna sekcja korzysta z precyzyjnego akcentu, a wariant pionowy
            nadal pozostaje lekki i czytelny.
          </p>
        </header>

        <section className="pd-navigation-story__section">
          <h2>Warianty</h2>
          <div className="pd-navigation-story__rows">
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant poziomy</h3>
                <p>Najczęstszy układ dla sekcji modułu i zakresów analizy.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <SectionNavigation
                  activeId="jakosc"
                  ariaLabel="Nawigacja sekcji w wariancie poziomym"
                  items={items}
                  orientation="horizontal"
                />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant pionowy</h3>
                <p>Przydatny dla węższych obszarów pomocniczych i paneli bocznych.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <SectionNavigation
                  activeId="przeglad"
                  ariaLabel="Nawigacja sekcji w wariancie pionowym"
                  items={items}
                  orientation="vertical"
                />
              </div>
            </div>
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Mniejsza gęstość dla miejsc o wysokiej koncentracji danych.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <SectionNavigation
                  activeId="przeglad"
                  ariaLabel="Nawigacja sekcji w wariancie kompaktowym"
                  items={items}
                  orientation="horizontal"
                  size="compact"
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
              <SectionNavigation
                activeId="jakosc"
                ariaLabel="Nawigacja sekcji w trybie jasnym"
                items={items}
                orientation="horizontal"
              />
            </div>
            <div
              className="pd-navigation-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-navigation-story__eyebrow">tryb ciemny</span>
              <SectionNavigation
                activeId="jakosc"
                ariaLabel="Nawigacja sekcji w trybie ciemnym"
                items={items}
                orientation="vertical"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};
