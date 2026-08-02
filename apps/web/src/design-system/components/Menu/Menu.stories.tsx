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
  Button,
} from '../Button';
import {
  Menu,
} from './Menu';
import '../Navigation/navigation-showcase.css';

function MenuExample({
  destructive = false,
  placement = 'bottom-start',
}: {
  readonly destructive?: boolean;
  readonly placement?: 'bottom-end' | 'bottom-start' | 'right-start';
}) {
  const [open, setOpen] = useState(false);
  const [activeItemId, setActiveItemId] =
    useState<string | null>('otworz');
  const items = destructive
    ? [
        {
          id: 'ponow',
          kind: 'item' as const,
          label: 'Ponów synchronizację',
          shortcut: 'R',
        },
        {
          id: 'separator-1',
          kind: 'separator' as const,
        },
        {
          destructive: true,
          icon: 'warning' as const,
          id: 'usun',
          kind: 'item' as const,
          label: 'Usuń zadanie',
          shortcut: 'Del',
        },
      ]
    : [
        {
          icon: 'search' as const,
          id: 'otworz',
          kind: 'item' as const,
          label: 'Otwórz szczegóły',
          shortcut: 'Enter',
        },
        {
          icon: 'data' as const,
          id: 'eksport',
          kind: 'item' as const,
          label: 'Eksportuj widok',
          shortcut: 'E',
        },
        {
          id: 'separator-1',
          kind: 'separator' as const,
        },
        {
          disabled: true,
          icon: 'integration' as const,
          id: 'udostepnij',
          kind: 'item' as const,
          label: 'Udostępnij zespołowi',
          shortcut: 'S',
        },
      ];

  return (
    <Menu
      activeItemId={activeItemId}
      items={items}
      open={open}
      placement={placement}
      trigger={(
        <Button size="small" variant="secondary">
          Otwórz listę akcji
        </Button>
      )}
      onAction={(itemId) => {
        setActiveItemId(itemId);
        setOpen(false);
      }}
      onActiveItemIdChange={(itemId) => {
        setActiveItemId(itemId);
      }}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    />
  );
}

const meta = {
  title: '10 Komponenty/Menu',
  component: Menu,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MenuStory: Story = {
  args: {
    activeItemId: null,
    items: [],
    open: false,
    placement: 'bottom-start',
    trigger: <button type="button">Akcje</button>,
  },
  name: 'Lista akcji',
  render: () => (
    <main className="pd-navigation-story">
      <div className="pd-navigation-story__inner">
        <header className="pd-navigation-story__header">
          <p className="pd-navigation-story__kicker">10 Komponenty/Menu</p>
          <h1>Menu ma porządkować lokalne akcje bez budowania pełnej nawigacji aplikacyjnej.</h1>
          <p className="pd-navigation-story__lead">
            Lista akcji korzysta z neutralnej powierzchni, klawiatury i lekkiej
            hierarchii, bez globalnego runtime i bez ciężkich kart demonstracyjnych.
          </p>
        </header>

        <section className="pd-navigation-story__section">
          <h2>Warianty</h2>
          <div className="pd-navigation-story__rows">
            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Pozycje z ikoną, separator oraz wyłączona akcja.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <MenuExample />
              </div>
            </div>

            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Akcja krytyczna</h3>
                <p>Destrukcyjna pozycja korzysta z czerwieni tylko lokalnie.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <MenuExample destructive placement="bottom-end" />
              </div>
            </div>

            <div className="pd-navigation-story__row">
              <div className="pd-navigation-story__label">
                <h3>Panel boczny</h3>
                <p>Wariant rozwijany w bok przy krótkim, lokalnym zestawie akcji.</p>
              </div>
              <div className="pd-navigation-story__canvas">
                <MenuExample placement="right-start" />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-navigation-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-navigation-story__theme-grid">
            <div className="pd-navigation-story__theme-column">
              <span className="pd-navigation-story__eyebrow">tryb jasny</span>
              <MenuExample />
            </div>
            <div
              className="pd-navigation-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-navigation-story__eyebrow">tryb ciemny</span>
              <MenuExample destructive />
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
    const basicRow = canvas.getByRole('heading', {
      name: 'Wariant podstawowy',
    }).closest('.pd-navigation-story__row') as HTMLElement | null;

    if (!basicRow) {
      throw new Error('Nie znaleziono podstawowego wariantu menu.');
    }

    await userEvent.click(
      within(basicRow).getByRole('button', {
        name: 'Otwórz listę akcji',
      }),
    );

    await expect(
      canvas.getByRole('menu'),
    ).toBeInTheDocument();
  },
};
