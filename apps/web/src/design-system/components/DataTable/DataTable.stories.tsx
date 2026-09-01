import {
  useState,
} from 'react';
import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  DataTable,
} from './DataTable';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const columns = [
  { id: 'order', label: 'Zamówienie' },
  { id: 'customer', label: 'Klient' },
  { align: 'right' as const, id: 'total', label: 'Wartość' },
  { id: 'status', label: 'Status' },
];

const rows = [
  { customer: 'A. Kowalska', id: 'ord-1042', order: '#1042', status: 'paid', total: '284,00 zł' },
  { customer: 'M. Nowak', id: 'ord-1041', order: '#1041', status: 'pending', total: '120,50 zł' },
  { customer: 'J. Wiśniewski', id: 'ord-1040', order: '#1040', status: 'refunded', total: '58,00 zł' },
];

const menuItems = [
  { id: 'view', label: 'Zobacz szczegóły' },
  { destructive: true, id: 'refund', label: 'Zwróć płatność' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/DataTable',
  component: DataTable,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    actionsMenuItems: () => menuItems,
    columns,
    emptyMessage: 'Brak zamówień w wybranym zakresie.',
    loading: false,
    rowCount: rows.length,
    rows,
    selectedRowIds: [],
    sort: { columnId: 'order', direction: 'desc' as const },
    statusColumn: {
      columnId: 'status',
      label: 'Status',
      mapTone: { paid: 'success' as const, pending: 'warning' as const, refunded: 'neutral' as const },
    },
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-data-table-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

function SelectableDataTable() {
  const [selected, setSelected] = useState<readonly string[]>([rows[0]!.id]);

  return (
    <DataTable
      actionsMenuItems={() => menuItems}
      columns={columns}
      emptyMessage="Brak zamówień."
      loading={false}
      rowCount={rows.length}
      rows={rows}
      selectedRowIds={selected}
      selection={{
        allVisibleSelected: selected.length === rows.length,
        onToggleRow: (rowId) => {
          setSelected((current) => (
            current.includes(rowId)
              ? current.filter((id) => id !== rowId)
              : [...current, rowId]
          ));
        },
        onToggleVisible: () => {
          setSelected((current) => (
            current.length === rows.length ? [] : rows.map((row) => row.id)
          ));
        },
        someVisibleSelected: selected.length > 0 && selected.length < rows.length,
      }}
      sort={{ columnId: 'order', direction: 'desc' }}
      statusColumn={{
        columnId: 'status',
        label: 'Status',
        mapTone: { paid: 'success', pending: 'warning', refunded: 'neutral' },
      }}
      onAction={fn()}
      onSortChange={fn()}
    />
  );
}

export const DataTableStory: Story = {
  name: 'DataTable',
  render: (args) => (
    <StoryPresentationPage
      className="pd-data-table-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry DataTable', en: 'DataTable parameters' })}
          items={[
            { label: <Localized pl="Zbudowany na" en="Built on" />, value: 'DataColumn/DataRow (contracts)' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="data-table"
      summary={
        <Localized
          pl="Table + zaznaczanie wierszy, kolumna statusu (mapTone), menu akcji na wiersz i paginacja kursorowa w jednym komponencie. Dla prostych, statycznych tabel bez tej złożoności użyj Table."
          en="Table + row selection, a status column (mapTone), a per-row action menu and cursor pagination in one component. For simple, static tables without this complexity, use Table."
        />
      }
      title={<Localized pl="Tabela, która zarządza sobą sama." en="A table that manages itself." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany (zaznaczanie)" en="Controlled (selection)" />}>
        <div data-testid="data-table-controlled">
          <SelectableDataTable />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Ładowanie / błąd / brak wyników" en="Loading / error / no results" />}>
        <div data-testid="data-table-states" style={{ display: 'grid', gap: 'var(--pd-space-6)' }}>
          <DataTable columns={columns} emptyMessage={copy({ pl: 'Brak zamówień.', en: 'No orders.' })} loading rowCount={0} rows={[]} selectedRowIds={[]} sort={null} />
          <DataTable columns={columns} emptyMessage={copy({ pl: 'Brak zamówień.', en: 'No orders.' })} errorMessage={copy({ pl: 'Nie udało się pobrać zamówień.', en: 'Failed to fetch orders.' })} loading={false} rowCount={0} rows={[]} selectedRowIds={[]} sort={null} />
          <DataTable columns={columns} emptyMessage={copy({ pl: 'Zmień filtry, aby zobaczyć wyniki.', en: 'Adjust the filters to see results.' })} loading={false} noResults noResultsMessage={copy({ pl: 'Nic nie znaleziono dla podanych filtrów.', en: 'Nothing found for the current filters.' })} rowCount={0} rows={[]} selectedRowIds={[]} sort={null} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('data-table-controlled').querySelectorAll('tbody tr')).toHaveLength(rows.length);
    await expect(canvas.getByTestId('data-table-states').children).toHaveLength(3);
  },
};
