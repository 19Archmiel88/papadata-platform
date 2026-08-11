import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  AlertDialog,
  Button,
  InlineNotice,
  StatusBadge,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const confirmDestructiveAction = fn();
const cancelDestructiveAction = fn();

function DestructiveConfirmationPattern() {
  const [open, setOpen] =
    useState(false);
  const [outcome, setOutcome] =
    useState('Operacja nie została jeszcze uruchomiona.');
  const [tone, setTone] =
    useState<'info' | 'success'>('info');

  return (
    <div className="pd-x18-split pd-x18-confirmation-layout">
      <section
        aria-label="Operacja destrukcyjna"
        className="pd-x18-region"
      >
        <div className="pd-x18-region__header">
          <p className="pd-x18-region__eyebrow">
            Operacja na źródle danych
          </p>
          <h3 className="pd-x18-region__title">
            Usunięcie integracji testowej
          </h3>
          <p className="pd-x18-region__text">
            Potwierdzenie opisuje skutek przed wykonaniem komendy. Nie zawiera
            approval, OTP ani wpisywania frazy potwierdzającej.
          </p>
        </div>

        <dl className="pd-x18-drawer-ledger">
          <div>
            <dt>Skutek</dt>
            <dd>
              Integracja przestanie synchronizować nowe dane i zniknie z listy
              aktywnych źródeł.
            </dd>
          </div>
          <div>
            <dt>Zakres</dt>
            <dd>
              Dane historyczne pozostają w widokach, ale bez dalszego
              odświeżania.
            </dd>
          </div>
          <div>
            <dt>Warunek</dt>
            <dd>
              Użytkownik musi świadomie potwierdzić destrukcyjną komendę.
            </dd>
          </div>
        </dl>

        <div className="pd-x18-action-row">
          <Button
            onClick={() => {
              setOpen(true);
              setTone('info');
              setOutcome(
                'Potwierdzenie jest otwarte i czeka na decyzję użytkownika.',
              );
            }}
            type="button"
            variant="danger"
          >
            Usuń integrację testową
          </Button>
          <StatusBadge
            status="Ryzyko"
            text="Destrukcyjne"
            tone="critical"
          />
        </div>
      </section>

      <section
        aria-label="Status potwierdzenia"
        className="pd-x18-region"
      >
        <InlineNotice
          message={outcome}
          title="Wynik decyzji"
          tone={tone}
        />
        <ul className="pd-x18-separator-list">
          <li>
            <span className="pd-x18-term">Anulowanie</span>
            <span className="pd-x18-description">
              Zamknięcie bez wykonania operacji zostawia źródło bez zmian.
            </span>
          </li>
          <li>
            <span className="pd-x18-term">Potwierdzenie</span>
            <span className="pd-x18-description">
              Destrukcyjna akcja jest wykonywana dopiero po wybraniu
              potwierdzenia w AlertDialog.
            </span>
          </li>
        </ul>
      </section>

      <AlertDialog
        cancelLabel="Anuluj"
        confirmLabel="Usuń integrację"
        destructive
        message="Usunięcie rozłączy źródło danych. Nowe dane nie będą synchronizowane, a przywrócenie wymaga ponownego połączenia integracji."
        open={open}
        title="Usunąć integrację testową?"
        onCancel={() => {
          cancelDestructiveAction();
          setTone('info');
          setOutcome('Operacja anulowana. Integracja pozostaje aktywna.');
        }}
        onConfirm={() => {
          confirmDestructiveAction();
          setTone('success');
          setOutcome('Operacja destrukcyjna została świadomie potwierdzona.');
        }}
        onOpenChange={(nextOpen, reason) => {
          setOpen(nextOpen);

          if (!nextOpen && reason === 'escape') {
            setTone('info');
            setOutcome(
              'Potwierdzenie zamknięte klawiszem Escape. Operacja nie została wykonana.',
            );
          }
        }}
      />
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Potwierdzenia i operacje destrukcyjne',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const DestructiveConfirmationsStory: Story = {
  name: 'Potwierdzenia i operacje destrukcyjne',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca potwierdzeń"
          items={[
            { label: 'Kontrakt', value: '18.05' },
            { label: 'Komponenty', value: 'AlertDialog / Button' },
            { label: 'Status', value: 'W przeglądzie' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.05"
      summary="Potwierdzenie destrukcyjnej operacji używa AlertDialog, opisuje skutek i pozwala anulować komendę przed wykonaniem."
      title="Potwierdzenia i operacje destrukcyjne"
    >
      <StoryPresentationSection
        index="01"
        summary="AlertDialog rozdziela otwarcie potwierdzenia, anulowanie, Escape i destrukcyjne potwierdzenie."
        title="Świadome potwierdzenie skutku"
      >
        <DestructiveConfirmationPattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await expect(
      canvas.getByRole('heading', {
        name: 'Potwierdzenia i operacje destrukcyjne',
      }),
    ).toBeInTheDocument();

    const trigger = canvas.getByRole('button', {
      name: 'Usuń integrację testową',
    });

    await userEvent.click(trigger);

    await expect(
      body.getByRole('alertdialog', {
        name: 'Usunąć integrację testową?',
      }),
    ).toBeInTheDocument();
    await expect(
      body.getByText(/Nowe dane nie będą synchronizowane/),
    ).toBeInTheDocument();

    await userEvent.click(
      body.getByRole('button', {
        name: 'Anuluj',
      }),
    );
    await expect(
      canvas.getByText(/Operacja anulowana/),
    ).toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 30);
    });
    await expect(trigger).toHaveFocus();
    await expect(
      canvas.getByText(/zamknięte klawiszem Escape/),
    ).toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.click(
      body.getByRole('button', {
        name: 'Usuń integrację',
      }),
    );
    await expect(
      canvas.getByText(/świadomie potwierdzona/),
    ).toBeInTheDocument();
  },
};
