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
  useState,
} from 'react';

import {
  Button,
} from '../Button';
import {
  InlineNotice,
} from '../InlineNotice';
import {
  Popover,
} from './Popover';
import '../OverlayRoot/overlay-showcase.css';

type PopoverExampleProps = {
  readonly placement: 'top' | 'right' | 'bottom' | 'left';
  readonly theme?: 'light' | 'dark';
  readonly title: string;
  readonly triggerLabel: string;
};

function PopoverExample({
  placement,
  theme = 'light',
  title,
  triggerLabel,
}: PopoverExampleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div data-theme={theme}>
      <Popover
        actionLabel="Zastosuj"
        anchorId={`popover-${triggerLabel}`}
        description="Panel kontekstowy trzyma krótki opis i jedną bezpieczną akcję."
        modal={false}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        placement={placement}
        title={title}
        trigger={(
          <Button
            size="small"
            type="button"
            variant="secondary"
          >
            {triggerLabel}
          </Button>
        )}
      >
        <InlineNotice
          message="Komponent zamyka się po kliknięciu poza obszarem lub po Escape."
          title="Szybki kontekst"
          tone="info"
        />
      </Popover>
    </div>
  );
}

const meta = {
  title: '10 Komponenty/Popover',
  component: Popover,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Panel kontekstowy PapaData utrzymuje małą, operacyjną powierzchnię bez wyglądu mini-karty marketingowej.',
      },
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PopoverStory: Story = {
  args: {
    anchorId: 'przykladowy-trigger',
    modal: false,
    open: false,
    placement: 'bottom',
    title: 'Przykładowy panel kontekstowy',
    trigger: (
      <button type="button">
        Przykładowy element wywołujący
      </button>
    ),
  },
  name: 'Panel kontekstowy',
  render: () => (
    <main className="pd-overlay-story">
      <div className="pd-overlay-story__inner">
        <header className="pd-overlay-story__header">
          <p className="pd-overlay-story__kicker">10 Komponenty/Popover</p>
          <h1>Panel kontekstowy pokazuje szybką decyzję bez odrywania od danych.</h1>
          <p className="pd-overlay-story__lead">
            To warstwa niemodalna zakotwiczona przy elemencie wywołującym.
            Treść jest krótka, a akcja jedna i przewidywalna.
          </p>
        </header>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Pozycje i warianty</h2>
          <div className="pd-overlay-story__rows">
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Najczęstszy układ pod elementem wywołującym.</p>
              </div>
              <div className="pd-overlay-story__anchor-strip">
                <PopoverExample
                  placement="bottom"
                  title="Szybkie filtrowanie"
                  triggerLabel="Otwórz panel podstawowy"
                />
              </div>
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Informacja boczna</h3>
                <p>Przydatna dla krótkich wskazówek albo dodatkowego statusu.</p>
              </div>
              <div className="pd-overlay-story__anchor-strip">
                <PopoverExample
                  placement="right"
                  title="Źródło danych"
                  triggerLabel="Otwórz panel z prawej"
                />
                <PopoverExample
                  placement="left"
                  title="Dodatkowy kontekst"
                  triggerLabel="Otwórz panel z lewej"
                />
              </div>
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Pozycja górna</h3>
                <p>Przydaje się tam, gdzie pod triggerem jest mało miejsca.</p>
              </div>
              <div className="pd-overlay-story__anchor-strip">
                <PopoverExample
                  placement="top"
                  title="Korekta zakresu"
                  triggerLabel="Otwórz panel od góry"
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
              <PopoverExample
                placement="bottom"
                title="Lekki wariant kontekstowy"
                triggerLabel="Pokaż panel w jasnym motywie"
              />
            </div>
            <div
              className="pd-overlay-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-overlay-story__eyebrow">tryb ciemny</span>
              <PopoverExample
                placement="bottom"
                theme="dark"
                title="Wariant kontekstowy w ciemnym motywie"
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
        name: 'Otwórz panel podstawowy',
      }),
    );

    await expect(
      canvas.getByRole('dialog', {
        name: 'Szybkie filtrowanie',
      }),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        canvas.queryByRole('dialog', {
          name: 'Szybkie filtrowanie',
        }),
      ).not.toBeInTheDocument();
    });
  },
};
