import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useMemo,
  useState,
} from 'react';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  dataTableColumns,
  dataTableRows,
  dataTableStatusTone,
  wideTableColumns,
  wideTableRows,
} from '../Data/storyData';
import '../Data/data-showcase.css';
import {
  DataTable,
} from './DataTable';

function DataTableExample({
  compact = false,
  errorMessage = null,
  loading = false,
  noResults = false,
  pagination = true,
  wide = false,
}: {
  readonly compact?: boolean;
  readonly errorMessage?: string | null;
  readonly loading?: boolean;
  readonly noResults?: boolean;
  readonly pagination?: boolean;
  readonly wide?: boolean;
}) {
  const [sort, setSort] = useState<{
    columnId: string;
    direction: 'asc' | 'desc';
  } | null>({
    columnId: 'updatedAt',
    direction: 'desc',
  });
  const columns = useMemo<readonly DataColumn[]>(
    () => wide ? wideTableColumns : dataTableColumns,
    [
      wide,
    ],
  );
  const rows = useMemo<readonly DataRow[]>(
    () => wide ? wideTableRows : dataTableRows,
    [
      wide,
    ],
  );

  return (
    <DataTable
      actionsMenuItems={() => [
        {
          id: 'preview',
          label: 'Pokaż szczegóły',
          shortcut: 'Enter',
        },
        {
          id: 'retry',
          label: 'Ponów synchronizację',
          shortcut: 'R',
        },
        {
          id: 'separator-1',
          kind: 'separator',
        },
        {
          destructive: true,
          id: 'disable',
          label: 'Wyłącz źródło',
          shortcut: 'Del',
        },
      ]}
      ariaLabel="Tabela operacyjna źródeł danych"
      columns={columns}
      density={
        compact
          ? 'compact'
          : 'comfortable'
      }
      emptyMessage="Nie ma jeszcze żadnych źródeł danych w tym obszarze."
      errorMessage={errorMessage}
      loading={loading}
      noResults={noResults}
      pagination={pagination ? {
        cursor: 'after_25',
        loading: false,
        nextCursor: 'after_50',
        previousCursor: 'before_25',
        summary: '26–50 z 240 wyników',
      } : null}
      rowCount={rows.length}
      rows={noResults ? [] : rows}
      selectedRowIds={[
        'ga4-web',
      ]}
      sort={sort}
      statusColumn={{
        columnId: 'status',
        label: 'Status',
        mapTone: dataTableStatusTone,
      }}
      summary="Operacyjny przegląd źródeł danych dla bieżącego obszaru roboczego."
      onSortChange={(columnId) => {
        setSort((current) => {
          if (
            current
            && current.columnId === columnId
          ) {
            return {
              columnId,
              direction:
                current.direction === 'asc'
                  ? 'desc'
                  : 'asc',
            };
          }

          return {
            columnId,
            direction: 'asc',
          };
        });
      }}
    />
  );
}

const meta = {
  title: '10 Komponenty/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const DataTableStory: Story = {
  args: {
    columns: [],
    emptyMessage: 'Brak danych',
    loading: false,
    rowCount: 0,
    rows: [],
    selectedRowIds: [],
    sort: null,
  },
  name: 'Tabela danych',
  render: () => (
    <div className="pd-data-story">
      <div className="pd-data-story__inner">
        <header className="pd-data-story__header">
          <p className="pd-data-story__kicker">10 Komponenty/DataTable</p>
          <h1>Tabela danych ma pokazywać operacje i statusy bez budowania pełnego silnika gridu.</h1>
          <p className="pd-data-story__lead">
            Sortowanie, statusy, akcje wiersza i paginacja pozostają prezentacyjne,
            ale semantycznie i wizualnie są gotowe do użycia w Storybooku.
          </p>
        </header>

        <section className="pd-data-story__section">
          <h2>Warianty</h2>
          <div className="pd-data-story__rows">
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Kolumny operacyjne, statusy i menu akcji wiersza.</p>
              </div>
              <div className="pd-data-story__canvas">
                <DataTableExample />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Mniejsza gęstość dla list technicznych i pobocznych tabel.</p>
              </div>
              <div className="pd-data-story__canvas">
                <DataTableExample
                  compact
                  pagination={false}
                />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Szeroki zakres kolumn</h3>
                <p>Tabela utrzymuje lokalny scroll i nie rozwala układu strony.</p>
              </div>
              <div className="pd-data-story__canvas">
                <DataTableExample
                  pagination={false}
                  wide
                />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Stany danych</h3>
                <p>Ładowanie, błąd i brak wyników używają istniejących komponentów systemowych.</p>
              </div>
              <div className="pd-data-story__canvas">
                <DataTableExample
                  loading
                  pagination={false}
                />
                <DataTableExample
                  errorMessage="Nie udało się odczytać historii synchronizacji dla bieżącego zakresu."
                  pagination={false}
                />
                <DataTableExample
                  noResults
                  pagination={false}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-data-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-data-story__theme-grid">
            <div className="pd-data-story__theme-column">
              <span className="pd-data-story__eyebrow">tryb jasny</span>
              <DataTableExample
                compact
                pagination={false}
              />
            </div>
            <div
              className="pd-data-story__theme-column"
              data-theme="dark"
            >
              <span className="pd-data-story__eyebrow">tryb ciemny</span>
              <DataTableExample pagination={false} />
            </div>
          </div>
        </section>
      </div>
    </div>
  ),
};
