import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';
import {
  useState,
} from 'react';

import {
  type TabsItem,
  Tabs,
} from './Tabs';
import '../Navigation/navigation-showcase.css';

function buildTabItems(): TabsItem[] {
  return [
    {
      id: 'przeglad',
      label: 'Przegląd',
      panel: (
        <>
          <h3 className="pd-tabs__panel-title">
            Zakres ogólny
          </h3>
          <p className="pd-tabs__panel-copy">
            Zakładki porządkują równorzędne widoki bez dokładania
            kolejnych ramek i bez wrażenia marketingowego dashboardu.
          </p>
        </>
      ),
    },
    {
      badge: '12',
      id: 'jakosc',
      label: 'Jakość danych',
      panel: (
        <>
          <h3 className="pd-tabs__panel-title">
            Jakość danych
          </h3>
          <p className="pd-tabs__panel-copy">
            Licznik może sygnalizować skalę uwag bez zamieniania zakładek w
            ciężkie badge listy.
          </p>
        </>
      ),
    },
    {
      disabled: true,
      id: 'integracje',
      label: 'Integracje',
      panel: (
        <>
          <h3 className="pd-tabs__panel-title">
            Integracje
          </h3>
          <p className="pd-tabs__panel-copy">
            Ta zakładka jest zablokowana do czasu ukończenia konfiguracji.
          </p>
        </>
      ),
    },
  ];
}

function TabsExample({
  activation = 'automatic',
  compact = false,
  icons = false,
  vertical = false,
}: {
  readonly activation?: 'automatic' | 'manual';
  readonly compact?: boolean;
  readonly icons?: boolean;
  readonly vertical?: boolean;
}) {
  const [activeId, setActiveId] =
    useState('przeglad');
  const iconMap = [
    'home',
    'data',
    'integration',
  ] as const;
  const items = buildTabItems().map((item, index): TabsItem => ({
    ...item,
    icon:
      icons
        ? iconMap[index]
        : undefined,
  }));

  return (
    <Tabs
      activation={activation}
      activeId={activeId}
      items={items}
      orientation={
        vertical
          ? 'vertical'
          : 'horizontal'
      }
      size={
        compact
          ? 'compact'
          : 'default'
      }
      onActiveIdChange={(nextId) => {
        setActiveId(nextId);
      }}
    />
  );
}

const meta = {
  title: '10 Komponenty/Tabs',
  component: Tabs,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Zakładki PapaData porządkują równorzędne widoki analityczne. Story pokazuje układ bez dodatkowych demo-kart, z naciskiem na czytelność i obsługę klawiatury.',
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TabsStory: Story = {
  args: {
    activation: 'automatic',
    activeId: 'przeglad',
    items: [],
    orientation: 'horizontal',
  },
  name: 'Zakładki',
  render: () => (
    <main className="pd-navigation-story">
      <div className="pd-navigation-story__inner">
        <header className="pd-navigation-story__header">
          <p className="pd-navigation-story__kicker">10 Komponenty/Tabs</p>
          <h1>Zakładki mają porządkować widoki, nie dominować nad treścią.</h1>
          <p className="pd-navigation-story__lead">
            Warianty pozostają lekkie wizualnie, z czytelnym stanem aktywnym,
            skupieniem klawiatury i subtelnym akcentem zamiast ciężkich kart.
          </p>
        </header>

        <section className="pd-navigation-story__section">
          <h2>Warianty</h2>
          <div className="pd-navigation-story__rows">
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Automatywna aktywacja i klasyczny układ poziomy.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <TabsExample />
              </div>
            </div>

            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Mniejsza gęstość dla paneli narzędziowych i krótszych list.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <TabsExample compact />
              </div>
            </div>

            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Ikony i licznik</h3>
                <p>Ikona i badge są dodatkiem do etykiety, nie zastępują tekstu.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <TabsExample icons />
              </div>
            </div>

            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Aktywacja ręczna</h3>
                <p>Zmiana wyboru następuje dopiero po Enter albo spacji.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <TabsExample activation="manual" />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-navigation-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-navigation-story__theme-grid">
            <div className="pd-navigation-story__theme-column">
              <span className="pd-navigation-story__eyebrow">tryb jasny</span>
              <TabsExample vertical />
            </div>
            <div
              className="pd-navigation-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-navigation-story__eyebrow">tryb ciemny</span>
              <p className="pd-navigation-story__theme-copy">
                Ciemny wariant utrzymuje ten sam rytm separatorów i nie
                przechodzi w neonowy interfejs.
              </p>
              <TabsExample icons vertical />
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
    const firstTab = canvas.getByRole('tab', {
      name: 'Przegląd',
    });

    firstTab.focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(
      canvas.getByRole('tab', {
        name: 'Jakość danych 12',
      }),
    ).toHaveFocus();
  },
};
