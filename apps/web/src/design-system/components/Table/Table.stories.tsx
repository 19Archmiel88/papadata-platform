import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';

import {
  dataTableColumns,
  dataTableRows,
  wideTableColumns,
  wideTableRows,
} from '../Data/storyData';
import '../Data/data-showcase.css';
import {
  Table,
} from './Table';
import type {
  TableColumn,
  TableRow,
} from './Table';

function mapRows(
  rows: readonly TableRow[],
): TableRow[] {
  return rows.map((row) => ({
    ...row,
  }));
}

function mapColumns(
  columns: readonly TableColumn[],
): TableColumn[] {
  return columns.map((column) => ({
    ...column,
  }));
}

function SortableTableExample({
  compact = false,
}: {
  readonly compact?: boolean;
}) {
  const [sort, setSort] = useState<{
    columnId: string;
    direction: 'asc' | 'desc';
  } | null>({
    columnId: 'source',
    direction: 'asc',
  });

  return (
    <Table
      ariaLabel="Tabela źródeł danych"
      caption="Przegląd podstawowych źródeł w obszarze Commerce."
      columns={mapColumns(dataTableColumns)}
      density={
        compact
          ? 'compact'
          : 'comfortable'
      }
      rows={mapRows(dataTableRows)}
      sort={sort}
      onSort={(columnId) => {
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
  title: '10 Komponenty/Table',
  component: Table,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TableStory: Story = {
  args: {
    columns: [],
    rows: [],
  },
  name: 'Tabela',
  render: () => (
    <main className="pd-data-story">
      <div className="pd-data-story__inner">
        <header className="pd-data-story__header">
          <p className="pd-data-story__kicker">10 Komponenty/Table</p>
          <h1>Tabela bazowa ma eksponować dane i strukturę, nie dekorację.</h1>
          <p className="pd-data-story__lead">
            Semantyka HTML, subtelny hover, logiczne wyrównanie kolumn i poziomy
            scroll dla szerokich zestawów pozostają ważniejsze niż efekt wizualny.
          </p>
        </header>

        <section className="pd-data-story__section">
          <h2>Warianty</h2>
          <div className="pd-data-story__rows">
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Kolumny tekstowe, liczbowe i prosty stan sortowania.</p>
              </div>
              <div className="pd-data-story__canvas">
                <SortableTableExample />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Gęstszy rytm dla tabel pomocniczych i paneli operacyjnych.</p>
              </div>
              <div className="pd-data-story__canvas">
                <SortableTableExample compact />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Szeroki zestaw kolumn</h3>
                <p>Poziomy scroll pozostaje lokalny i nie rozpycha całego widoku.</p>
              </div>
              <div className="pd-data-story__canvas">
                <Table
                  ariaLabel="Szeroka tabela źródeł danych"
                  columns={wideTableColumns.map((column) => ({
                    ...column,
                  }))}
                  minWidth="78rem"
                  rows={wideTableRows.map((row) => ({
                    ...row,
                  }))}
                />
              </div>
            </div>
            <div className="pd-data-story__row">
              <div className="pd-data-story__label">
                <h3>Stany tabeli</h3>
                <p>Ładowanie i brak danych korzystają z istniejących komponentów systemu.</p>
              </div>
              <div className="pd-data-story__canvas">
                <Table
                  columns={mapColumns(dataTableColumns)}
                  loading
                  rows={[]}
                />
                <Table
                  columns={mapColumns(dataTableColumns)}
                  emptyMessage="Nie znaleziono żadnych źródeł do bieżącego filtra."
                  emptyTitle="Brak danych"
                  rows={[]}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
