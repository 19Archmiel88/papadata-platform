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

import '../Filters/filters-showcase.css';
import {
  sortOptions,
} from '../Filters/storyData';
import {
  type SortControlOption,
  SortControl,
} from './SortControl';

const meta = {
  title: '10 Komponenty/SortControl',
  component: SortControl,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof SortControl>;

export default meta;

type Story = StoryObj<typeof meta>;

const longSortOptions: readonly SortControlOption[] = [
  {
    id: 'updatedAt',
    label: 'Last synchronization checkpoint for cross-workspace reconciliation',
  },
  {
    id: 'source',
    label: 'Partner system alias and source display name',
  },
  {
    id: 'owner',
    label: 'Escalation owner responsible for operational follow-up',
  },
  {
    id: 'incidents',
    label: 'Number of unresolved exceptions requiring manual review',
  },
] as const;

function SortPreview({
  ariaLabel,
  disabled = false,
  initialSelectedId = 'updatedAt',
  label = 'Sortuj',
  options = sortOptions,
  scopeLabel,
  syncButtonLabel = 'Ustaw właściciela programowo',
  syncTargetId = 'owner',
  theme,
}: {
  readonly ariaLabel: string;
  readonly disabled?: boolean;
  readonly initialSelectedId?: string;
  readonly label?: string;
  readonly options?: readonly SortControlOption[];
  readonly scopeLabel?: string;
  readonly syncButtonLabel?: string;
  readonly syncTargetId?: string;
  readonly theme?: 'light' | 'dark';
}) {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');
  const currentOption = options.find(
    (option) => option.id === selectedId,
  );

  return (
    <section
      aria-label={scopeLabel}
      className="pd-tools-story__surface"
      data-theme={theme}
    >
      <div className="pd-tools-story__stack">
        <button
          disabled={disabled}
          type="button"
          onClick={() => {
            setSelectedId(syncTargetId);
          }}
        >
          {syncButtonLabel}
        </button>
        <p aria-live="polite">
          Aktywne sortowanie: {currentOption?.label ?? '—'}, {direction === 'asc' ? 'rosnąco' : 'malejąco'}
        </p>
      </div>
      <SortControl
        ariaLabel={ariaLabel}
        direction={direction}
        disabled={disabled}
        label={label}
        options={options}
        selectedId={selectedId}
        onDirectionChange={setDirection}
        onSelectedIdChange={setSelectedId}
      />
    </section>
  );
}

export const SortControlStory: Story = {
  args: {
    options: sortOptions,
    selectedId: 'updatedAt',
  },
  name: 'Kontrola sortowania',
  render: () => (
    <main className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/SortControl</p>
          <h1>Sortowanie ma być lokalne, dyskretne i gotowe do osadzenia w toolbarze.</h1>
          <p className="pd-tools-story__lead">
            Komponent nie sortuje danych samodzielnie. Pokazuje wybór kryterium i kierunku,
            a intencję przekazuje właścicielowi sekcji lub tabeli.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Warianty</h2>
          <div className="pd-tools-story__rows">
            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Przycisk otwiera lokalną listę opcji, a kierunek pozostaje niezależny.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SortPreview
                  ariaLabel="Sortowanie podstawowe"
                  scopeLabel="Podstawowa kontrola sortowania"
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Stan wyłączony</h3>
                <p>Kontrola pozostaje widoczna, ale nie sugeruje interakcji podczas blokady danych.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SortPreview
                  ariaLabel="Sortowanie wyłączone"
                  disabled
                  scopeLabel="Wyłączona kontrola sortowania"
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Długie copy i angielski</h3>
                <p>Dłuższe etykiety kryteriów pozostają czytelne i nie rozsuwają niekontrolowanie kontrolki.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <SortPreview
                  ariaLabel="Long-copy sort order"
                  initialSelectedId="updatedAt"
                  label="Sort order"
                  options={longSortOptions}
                  scopeLabel="Sortowanie z długim copy"
                  syncButtonLabel="Set escalation owner programmatically"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-tools-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-tools-story__theme-grid">
            <div className="pd-tools-story__theme-column">
              <h3>Tryb jasny</h3>
              <SortPreview
                ariaLabel="Sortowanie jasne"
                scopeLabel="Jasna kontrola sortowania"
                theme="light"
              />
            </div>
            <div className="pd-tools-story__theme-column">
              <h3>Tryb ciemny</h3>
              <SortPreview
                ariaLabel="Sortowanie ciemne"
                scopeLabel="Ciemna kontrola sortowania"
                theme="dark"
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
    const primaryPreview = within(
      canvas.getByRole('region', {
        name: 'Podstawowa kontrola sortowania',
      }),
    );
    const syncButton = primaryPreview.getByRole('button', {
      name: 'Ustaw właściciela programowo',
    });
    const trigger = primaryPreview.getByRole('button', {
      name: 'Sortowanie podstawowe',
    });
    const directionButton = primaryPreview.getByRole('button', {
      name: 'Zmień kierunek sortowania. Aktualnie malejąco.',
    });

    await userEvent.click(syncButton);
    await expect(
      primaryPreview.getByText(
        'Aktywne sortowanie: Właściciel procesu, malejąco',
      ),
    ).toBeInTheDocument();

    await userEvent.click(trigger);
    await userEvent.keyboard('{Enter}');

    await expect(
      primaryPreview.getByText(
        'Aktywne sortowanie: Właściciel procesu, malejąco',
      ),
    ).toBeInTheDocument();

    await userEvent.click(directionButton);
    await expect(
      primaryPreview.getByText(
        'Aktywne sortowanie: Właściciel procesu, rosnąco',
      ),
    ).toBeInTheDocument();

    await expect(
      canvas.getByRole('button', {
        name: 'Sortowanie wyłączone',
      }),
    ).toBeDisabled();
  },
};
