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
  FilterChip,
} from './FilterChip';

const meta = {
  title: '10 Komponenty/FilterChip',
  component: FilterChip,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof FilterChip>;

export default meta;

type Story = StoryObj<typeof meta>;

function RemovableFilterChipPreview() {
  const [removedLabel, setRemovedLabel] = useState('brak');

  return (
    <section
      aria-label="Usuwalne filtry"
      className="pd-tools-story__surface"
    >
      <div className="pd-filter-cluster">
        <FilterChip
          active
          label="Status"
          removable
          removeLabel="Usuń filtr: Status Wymaga uwagi"
          tone="accent"
          value="Wymaga uwagi"
          onRemove={() => {
            setRemovedLabel('Status Wymaga uwagi');
          }}
        />
        <FilterChip
          disabled
          label="Typ"
          removable
          removeLabel="Usuń filtr: Typ Commerce"
          value="Commerce"
        />
      </div>

      <p aria-live="polite">Usunięto filtr: {removedLabel}</p>
    </section>
  );
}

function LongCopyFilterChipPreview() {
  return (
    <section
      aria-label="Długie etykiety filtrów"
      className="pd-tools-story__surface"
    >
      <div className="pd-filter-cluster">
        <FilterChip
          active
          label="Status ręcznej rekoncyliacji wieloetapowej"
          removable
          tone="accent"
          value="Requires manual revenue recovery verification before publication"
        />
        <FilterChip
          label="Escalation owner responsible for partner-side follow-up"
          removable
          tone="warning"
          value="North Europe revenue operations"
        />
        <FilterChip
          label="Zakres porównania i wyjątki"
          tone="neutral"
          value="Rolling 30-day reconciliation and exception review window"
        />
      </div>
    </section>
  );
}

export const FilterChipStory: Story = {
  args: {
    label: 'Status',
  },
  name: 'Znacznik filtra',
  render: () => (
    <main className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/FilterChip</p>
          <h1>Aktywny filtr ma być lekki i czytelny, nie ciężki jak przycisk.</h1>
          <p className="pd-tools-story__lead">
            Znacznik filtra pokazuje kontekst, pomaga usuwać warunki i może subtelnie
            zaznaczać ton statusu bez przejmowania całego interfejsu.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Warianty</h2>
          <div className="pd-tools-story__rows">
            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Tekst i wartość</h3>
                <p>Najczęstszy wariant do aktywnego filtra w pasku narzędziowym.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <div className="pd-filter-cluster">
                  <FilterChip label="Status" value="Stabilne" />
                  <FilterChip label="Właściciel" value="Operacje danych" />
                  <FilterChip label="Zakres dat" value="Ostatnie 7 dni" />
                </div>
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Usuwalny filtr</h3>
                <p>Przycisk usunięcia pozostaje mały, ale dostępny klawiaturą i screen readerem.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <RemovableFilterChipPreview />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Warianty statusowe</h3>
                <p>Ton może wspierać czytelność operacyjną, ale nie dominuje całego paska filtrów.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <div className="pd-filter-cluster">
                  <FilterChip label="Stan" tone="success" value="Stabilne" />
                  <FilterChip label="Stan" tone="warning" value="Wymaga uwagi" />
                  <FilterChip label="Stan" tone="danger" value="Błąd blokujący" />
                </div>
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Długie etykiety i język angielski</h3>
                <p>Chipy zawijają długie nazwy warunków bez zasłaniania celu usunięcia ani bez page overflow.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <LongCopyFilterChipPreview />
              </div>
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
    const removableButton = canvas.getByRole('button', {
      name: 'Usuń filtr: Status Wymaga uwagi',
    });
    const disabledButton = canvas.getByRole('button', {
      name: 'Usuń filtr: Typ Commerce',
    });

    removableButton.focus();
    await expect(removableButton).toHaveFocus();
    await userEvent.keyboard(' ');

    await expect(
      canvas.getByText('Usunięto filtr: Status Wymaga uwagi'),
    ).toBeInTheDocument();
    await expect(disabledButton).toBeDisabled();
  },
};
