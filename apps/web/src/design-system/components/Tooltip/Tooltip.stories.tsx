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
  Button,
} from '../Button';
import {
  Tooltip,
} from './Tooltip';
import '../OverlayRoot/overlay-showcase.css';

const meta = {
  title: '10 Komponenty/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Podpowiedź PapaData przekazuje tylko krótki opis. Warstwa pozostaje lekka, bez ciężkich cieni i bez zasłaniania istotnych treści.',
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TooltipStory: Story = {
  args: {
    content: 'Przykładowa podpowiedź',
    delayMs: 80,
    interactive: false,
    placement: 'top',
    trigger: (
      <button type="button">
        Przykładowy element wywołujący
      </button>
    ),
  },
  name: 'Podpowiedź',
  render: () => (
    <main className="pd-overlay-story">
      <div className="pd-overlay-story__inner">
        <header className="pd-overlay-story__header">
          <p className="pd-overlay-story__kicker">10 Komponenty/Tooltip</p>
          <h1>Podpowiedź ma dopowiadać znaczenie, nie walczyć o uwagę.</h1>
          <p className="pd-overlay-story__lead">
            Komponent reaguje na hover i fokus, wspiera Escape oraz utrzymuje
            krótki, pomocniczy komunikat w zgodzie z motywem.
          </p>
        </header>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Pozycje</h2>
          <div className="pd-overlay-story__rows">
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Góra i dół</h3>
                <p>Najczęstsze pozycje dla opisów przy kontrolkach.</p>
              </div>
              <div className="pd-overlay-story__anchor-strip">
                <Tooltip
                  content="Opis z góry dobrze działa przy krótkim przycisku."
                  delayMs={80}
                  interactive={false}
                  placement="top"
                  trigger={(
                    <Button size="small" type="button" variant="secondary">
                      Pokaż podpowiedź od góry
                    </Button>
                  )}
                />
                <Tooltip
                  content="Opis z dołu nie zasłania etykiety powyżej."
                  delayMs={80}
                  interactive={false}
                  placement="bottom"
                  trigger={(
                    <Button size="small" type="button" variant="secondary">
                      Pokaż podpowiedź od dołu
                    </Button>
                  )}
                />
              </div>
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Lewo i prawo</h3>
                <p>Pozycje boczne pozostają lekkie i bez blokowania sąsiednich treści.</p>
              </div>
              <div className="pd-overlay-story__anchor-strip">
                <Tooltip
                  content="Wariant boczny może działać przy gęstych toolbarach."
                  delayMs={80}
                  interactive={true}
                  placement="left"
                  trigger={(
                    <Button size="small" type="button" variant="secondary">
                      Pokaż podpowiedź z lewej
                    </Button>
                  )}
                />
                <Tooltip
                  content="Prawa strona bywa wygodna dla ikon akcji przy tabeli."
                  delayMs={80}
                  interactive={true}
                  placement="right"
                  trigger={(
                    <Button size="small" type="button" variant="secondary">
                      Pokaż podpowiedź z prawej
                    </Button>
                  )}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Tryb jasny i ciemny</h2>
          <div className="pd-overlay-story__theme-grid">
            <div className="pd-overlay-story__theme-column">
              <span className="pd-overlay-story__eyebrow">tryb jasny</span>
              <Tooltip
                content="Jasny wariant zachowuje delikatny cień i czytelny kontrast."
                delayMs={80}
                interactive={false}
                placement="top"
                trigger={(
                  <Button size="small" type="button" variant="secondary">
                    Jasna podpowiedź
                  </Button>
                )}
              />
            </div>
            <div
              className="pd-overlay-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-overlay-story__eyebrow">tryb ciemny</span>
              <Tooltip
                content="Ciemny wariant nie zamienia się w neonowy dymek."
                delayMs={80}
                interactive={false}
                placement="top"
                trigger={(
                  <Button size="small" type="button" variant="secondary">
                    Ciemna podpowiedź
                  </Button>
                )}
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

    await userEvent.tab();

    await expect(
      canvas.getByRole('tooltip'),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await expect(
      canvas.queryByRole('tooltip'),
    ).not.toBeInTheDocument();
  },
};
