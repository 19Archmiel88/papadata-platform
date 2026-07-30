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
  Dialog,
} from './Dialog';
import '../OverlayRoot/overlay-showcase.css';

type ExampleProps = {
  readonly closeOnBackdrop?: boolean;
  readonly destructive?: boolean;
  readonly helperText: string;
  readonly theme?: 'light' | 'dark';
  readonly title: string;
  readonly triggerLabel: string;
};

function DialogExample({
  closeOnBackdrop = false,
  destructive = false,
  helperText,
  theme = 'light',
  title,
  triggerLabel,
}: ExampleProps) {
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
      <Dialog
        closeOnBackdrop={closeOnBackdrop}
        closeOnEscape
        description={helperText}
        destructive={destructive}
        hostId={hostId}
        modal
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
        }}
        open={open}
        primaryActionLabel={
          destructive
            ? 'Potwierdź operację'
            : 'Zapisz ustawienia'
        }
        secondaryActionLabel="Anuluj"
        title={title}
      >
        <InlineNotice
          message={
            destructive
              ? 'Usunięcie definicji wpłynie na wszystkie zapisane zestawy danych.'
              : 'Zapis nie uruchamia jeszcze przeliczenia w tle ani publikacji zmian.'
          }
          tone={
            destructive
              ? 'warning'
              : 'info'
          }
          title={
            destructive
              ? 'Ta operacja jest nieodwracalna.'
              : 'Zmiana dotyczy tylko bieżącego widoku.'
          }
        />
        <p className="pd-overlay-story__copy">
          Warstwa pozostaje spokojna i czytelna. Priorytetem jest decyzja,
          nie efekt dekoracyjny.
        </p>
      </Dialog>
    </div>
  );
}

const meta = {
  title: '10 Komponenty/Dialog',
  component: Dialog,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
    docs: {
      description: {
        component:
          'Okno dialogowe PapaData służy do pojedynczej decyzji lub krótkiego formularza. Komponent działa lokalnie w Storybooku i nie buduje globalnego runtime modali.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DialogStory: Story = {
  args: {
    closeOnEscape: true,
    description: 'Pomocniczy opis warstwy.',
    modal: true,
    open: false,
    title: 'Przykładowe okno dialogowe',
  },
  name: 'Okno dialogowe',
  render: () => (
    <main className="pd-overlay-story pd-overlay-story--dialog">
      <div className="pd-overlay-story__inner">
        <header className="pd-overlay-story__header">
          <p className="pd-overlay-story__kicker">10 Komponenty/Dialog</p>
          <h1>Okno dialogowe ma zatrzymać uwagę na jednej decyzji.</h1>
          <p className="pd-overlay-story__lead">
            Warstwa jest neutralna, ma subtelne przyciemnienie tła i nie
            potrzebuje dodatkowych kart demonstracyjnych wokół przykładu.
          </p>
        </header>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Warianty</h2>
          <div className="pd-overlay-story__rows">
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Zamykanie przyciskiem i klawiszem Escape.</p>
              </div>
              <DialogExample
                helperText="Opis prowadzi użytkownika do jednej decyzji i nie rozprasza pobocznym copy."
                title="Ustawienia segmentu analitycznego"
                triggerLabel="Otwórz wariant podstawowy"
              />
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Potwierdzenie operacji</h3>
                <p>Wariant destrukcyjny używa czerwieni tylko lokalnie.</p>
              </div>
              <DialogExample
                destructive
                helperText="Usuń definicję tylko wtedy, gdy masz pewność, że nie jest już używana w innych raportach."
                title="Usuń definicję wskaźnika"
                triggerLabel="Otwórz wariant destrukcyjny"
              />
            </div>
            <div className="pd-overlay-story__row">
              <div className="pd-overlay-story__label">
                <h3>Zamykanie tłem</h3>
                <p>Wariant pokazuje kliknięcie poza obszarem jako świadomą opcję.</p>
              </div>
              <DialogExample
                closeOnBackdrop
                helperText="Kliknięcie poza obszarem może zamknąć warstwę, jeżeli proces nie jest krytyczny."
                title="Podgląd krótkiej informacji"
                triggerLabel="Otwórz wariant z tłem"
              />
            </div>
          </div>
        </section>

        <section className="pd-overlay-story__section">
          <h2 className="pd-overlay-story__section-title">Tryb jasny i ciemny</h2>
          <div className="pd-overlay-story__theme-grid">
            <div className="pd-overlay-story__theme-column">
              <span className="pd-overlay-story__eyebrow">tryb jasny</span>
              <DialogExample
                helperText="Jasny wariant zachowuje separację bez efektu ciężkiej karty."
                title="Przegląd ustawień widoku"
                triggerLabel="Pokaż okno w jasnym motywie"
              />
            </div>
            <div
              className="pd-overlay-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-overlay-story__eyebrow">tryb ciemny</span>
              <p className="pd-overlay-story__theme-copy">
                Portal warstwy jest osadzony lokalnie, więc wariant ciemny nie
                wymaga globalnego runtime motywu.
              </p>
              <DialogExample
                helperText="Ciemny wariant utrzymuje wysoki kontrast treści i spokojny overlay."
                theme="dark"
                title="Kontrola zakresu eksportu"
                triggerLabel="Pokaż okno w ciemnym motywie"
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
        name: 'Otwórz wariant podstawowy',
      }),
    );

    await expect(
      canvas.getByRole('dialog', {
        name: 'Ustawienia segmentu analitycznego',
      }),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(
        canvas.queryByRole('dialog', {
          name: 'Ustawienia segmentu analitycznego',
        }),
      ).not.toBeInTheDocument();
    });
  },
};
