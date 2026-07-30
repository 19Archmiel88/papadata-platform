import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import {
  useId,
  useState,
} from 'react';

import {
  Button,
} from '../Button';
import {
  InlineNotice,
} from '../InlineNotice';
import {
  Drawer,
} from './Drawer';
import '../OverlayRoot/overlay-showcase.css';

type DrawerExampleProps = {
  readonly dismissible?: boolean;
  readonly side?: 'left' | 'right';
  readonly theme?: 'light' | 'dark';
  readonly title: string;
  readonly triggerLabel: string;
  readonly width?: number;
};

function DrawerExample({
  dismissible = true,
  side = 'right',
  theme = 'light',
  title,
  triggerLabel,
  width = 448,
}: DrawerExampleProps) {
  const [open, setOpen] = useState(false);
  const hostId = useId().replace(/:/g, '-');

  return (
    <div data-theme={theme}>
      <div className="pd-overlay-story__canvas">
        <Button
          onClick={() => {
            setOpen(true);
          }}
          type="button"
          variant="secondary"
        >
          {triggerLabel}
        </Button>
      </div>
      <div id={hostId} />
      <Drawer
        description="Panel boczny prowadzi krótką pracę operacyjną bez opuszczania aktualnego kontekstu."
        dismissible={dismissible}
        hostId={hostId}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        primaryActionLabel="Zastosuj"
        secondaryActionLabel="Anuluj"
        side={side}
        title={title}
        width={width}
      >
        <InlineNotice
          message="Ten wariant nie buduje layoutu aplikacji. Pokazuje tylko lokalny panel boczny do Storybooka."
          title="Warstwa robocza"
          tone="info"
        />
        <p className="pd-overlay-story__copy">
          W treści można umieścić formularz, listę kontrolną albo krótki
          opis stanu danych. Priorytetem jest czytelny układ i przewidywalny
          fokus.
        </p>
      </Drawer>
    </div>
  );
}

const meta = {
  title: '10 Komponenty/Drawer',
  component: Drawer,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Panel boczny PapaData jest warstwą roboczą dla zadań pomocniczych. Komponent działa lokalnie w Storybooku i nie tworzy pełnej powłoki aplikacji.',
      },
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DrawerStory: Story = {
  args: {
    dismissible: true,
    open: false,
    side: 'right',
    title: 'Przykładowy panel boczny',
    width: 448,
  },
  name: 'Panel boczny',
  render: () => (
    <main className="pd-overlay-story">
      <div className="pd-overlay-story__inner">
        <header className="pd-overlay-story__header">
          <p className="pd-overlay-story__kicker">10 Komponenty/Drawer</p>
          <h1>Panel boczny ma wspierać analizę, a nie zamieniać się w osobny ekran.</h1>
          <p className="pd-overlay-story__lead">
            Drawer wykorzystuje tę samą neutralną powierzchnię co dialog,
            ale pracuje z krawędzi ekranu i lepiej pasuje do zadań pobocznych.
          </p>
        </header>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Warianty</h2>
          <div className="pd-overlay-story__rows">
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Panel po prawej</h3>
                <p>Wariant podstawowy dla pracy na szczegółach.</p>
              </div>
              <DrawerExample
                title="Szczegóły źródła danych"
                triggerLabel="Otwórz panel po prawej"
              />
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Panel po lewej</h3>
                <p>Wariant użyteczny dla filtrów lub przeglądu zależności.</p>
              </div>
              <DrawerExample
                side="left"
                title="Filtry segmentu przychodów"
                triggerLabel="Otwórz panel po lewej"
              />
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Szerszy panel</h3>
                <p>Większa szerokość bez budowania dużej, ozdobnej karty.</p>
              </div>
              <DrawerExample
                title="Mapa pól integracji sprzedażowej"
                triggerLabel="Otwórz szerszy panel"
                width={560}
              />
            </div>
          </div>
        </section>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Tryb jasny i ciemny</h2>
          <div className="pd-overlay-story__theme-grid">
            <div className="pd-overlay-story__theme-column">
              <span className="pd-overlay-story__eyebrow">tryb jasny</span>
              <DrawerExample
                title="Historia zmian definicji"
                triggerLabel="Pokaż panel w jasnym motywie"
              />
            </div>
            <div
              className="pd-overlay-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-overlay-story__eyebrow">tryb ciemny</span>
              <DrawerExample
                theme="dark"
                title="Konfiguracja mapowania kanałów"
                triggerLabel="Pokaż panel w ciemnym motywie"
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

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Otwórz panel po prawej',
      }),
    );

    await expect(
      canvas.getByRole('dialog', {
        name: 'Szczegóły źródła danych',
      }),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        canvas.queryByRole('dialog', {
          name: 'Szczegóły źródła danych',
        }),
      ).not.toBeInTheDocument();
    });
  },
};
