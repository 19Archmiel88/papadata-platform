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
  useId,
  useState,
} from 'react';

import {
  Button,
} from '../Button';
import {
  OverlayRoot,
} from './OverlayRoot';
import '../OverlayRoot/overlay-showcase.css';

function OverlayRootExample({
  backdrop,
  label,
  theme = 'light',
}: {
  readonly backdrop: 'none' | 'subtle';
  readonly label: string;
  readonly theme?: 'light' | 'dark';
}) {
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
          {label}
        </Button>
      </div>
      <div id={hostId} />
      <OverlayRoot
        backdrop={backdrop}
        hostId={hostId}
        open={open}
      >
        <div
          aria-labelledby={`${hostId}-title`}
          className="pd-overlay-surface pd-dialog"
          role="dialog"
        >
          <header className="pd-overlay-surface__header">
            <div className="pd-overlay-surface__heading">
              <h2
                className="pd-overlay-surface__title"
                id={`${hostId}-title`}
              >
                Lokalna warstwa portalu
              </h2>
              <p className="pd-overlay-surface__description">
                Ten przykład pokazuje tylko techniczny host warstw dla
                Storybooka. Nie uruchamia globalnej kolejki overlay.
              </p>
            </div>
            <Button
              onClick={() => {
                setOpen(false);
              }}
              size="small"
              type="button"
              variant="ghost"
            >
              Zamknij
            </Button>
          </header>
          <div className="pd-overlay-surface__body">
            <p className="pd-overlay-story__copy">
              Dialog, drawer albo inna warstwa może zostać osadzona w lokalnym
              hoście bez podpinania routingu i bez globalnego runtime aplikacji.
            </p>
          </div>
        </div>
      </OverlayRoot>
    </div>
  );
}

const meta = {
  title: '20 Powłoka/OverlayRoot i system warstw',
  component: OverlayRoot,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Lokalny host warstw służy w Storybooku jako techniczny portal dla dialogów i paneli. Nie implementuje globalnego runtime powłoki produktu.',
      },
    },
  },
} satisfies Meta<typeof OverlayRoot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OverlayRootStory: Story = {
  args: {
    backdrop: 'subtle',
    open: false,
  },
  name: 'Lokalny host warstw',
  render: () => (
    <main className="pd-overlay-story">
      <div className="pd-overlay-story__inner">
        <header className="pd-overlay-story__header">
          <p className="pd-overlay-story__kicker">20 Powłoka/OverlayRoot i system warstw</p>
          <h1>Host warstw ma być prosty i techniczny.</h1>
          <p className="pd-overlay-story__lead">
            W tym etapie `OverlayRoot` tylko transportuje warstwę do portalu i
            utrzymuje subtelne przyciemnienie tła, jeżeli jest potrzebne.
          </p>
        </header>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Warianty hosta</h2>
          <div className="pd-overlay-story__rows">
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Przyciemnienie tła</h3>
                <p>Wariant dla modalnych warstw blokujących uwagę na jednym zadaniu.</p>
              </div>
              <OverlayRootExample
                backdrop="subtle"
                label="Pokaż host z przyciemnieniem"
              />
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Bez przyciemnienia</h3>
                <p>Wariant pomocniczy dla lokalnych paneli lub warstw technicznych.</p>
              </div>
              <OverlayRootExample
                backdrop="none"
                label="Pokaż host bez przyciemnienia"
              />
            </div>
          </div>
        </section>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Tryb jasny i ciemny</h2>
          <div className="pd-overlay-story__theme-grid">
            <div className="pd-overlay-story__theme-column">
              <span className="pd-overlay-story__eyebrow">tryb jasny</span>
              <OverlayRootExample
                backdrop="subtle"
                label="Pokaż jasny host"
              />
            </div>
            <div
              className="pd-overlay-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-overlay-story__eyebrow">tryb ciemny</span>
              <OverlayRootExample
                backdrop="subtle"
                label="Pokaż ciemny host"
                theme="dark"
              />
            </div>
          </div>
        </section>

        <section className="pd-overlay-story__section">
          <div className="pd-overlay-story__note">
            <h2 className="pd-overlay-story__section-title">Zakres techniczny</h2>
            <p className="pd-overlay-story__copy">
              Ten komponent nie buduje kolejki modali, nie zarządza URL i nie
              zastępuje docelowego systemu powłoki. Wystarcza do stabilizacji
              Storybooka i lokalnych komponentów overlay.
            </p>
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
        name: 'Pokaż host z przyciemnieniem',
      }),
    );

    await expect(
      canvas.getByRole('dialog', {
        name: 'Lokalna warstwa portalu',
      }),
    ).toBeInTheDocument();
  },
};
