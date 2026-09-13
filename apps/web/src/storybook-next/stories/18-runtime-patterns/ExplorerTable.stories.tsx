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
  StatusBadge,
} from '../../../design-system';
import {
  ExplorerTable,
} from '../../../design-system/components/Domain/ExplorerTable/ExplorerTable';
import type {
  ExplorerTableColumn,
} from '../../../design-system/components/Domain/ExplorerTable/ExplorerTable';

type CustomerRow = {
  readonly id: string;
  readonly customer: string;
  readonly segment: string;
  readonly orders: number;
  readonly revenue: number;
  readonly status: 'Aktywny' | 'Ryzyko';
};

const rows: readonly CustomerRow[] = [
  { id: 'c-001', customer: 'CUS-18F2', segment: 'Lojalny', orders: 17, revenue: 18240, status: 'Aktywny' },
  { id: 'c-002', customer: 'CUS-4A91', segment: 'Potencjalnie lojalny', orders: 9, revenue: 9680, status: 'Aktywny' },
  { id: 'c-003', customer: 'CUS-781C', segment: 'W ryzyku', orders: 12, revenue: 7440, status: 'Ryzyko' },
  { id: 'c-004', customer: 'CUS-B02D', segment: 'Nowy', orders: 2, revenue: 1980, status: 'Aktywny' },
  { id: 'c-005', customer: 'CUS-D39E', segment: 'W ryzyku', orders: 8, revenue: 6120, status: 'Ryzyko' },
  { id: 'c-006', customer: 'CUS-E151', segment: 'Lojalny', orders: 21, revenue: 22480, status: 'Aktywny' },
];

const columns: readonly ExplorerTableColumn<CustomerRow>[] = [
  {
    id: 'customer',
    label: 'Klient',
    required: true,
    sortAccessor: (row) => row.customer,
  },
  {
    id: 'segment',
    label: 'Segment',
    sortAccessor: (row) => row.segment,
  },
  {
    align: 'right',
    id: 'orders',
    label: 'Zamówienia',
    sortAccessor: (row) => row.orders,
  },
  {
    align: 'right',
    csvValue: (row) => row.revenue,
    id: 'revenue',
    label: 'Przychód',
    render: (row) => `${row.revenue.toLocaleString('pl-PL')} zł`,
    sortAccessor: (row) => row.revenue,
  },
  {
    id: 'status',
    label: 'Stan',
    render: (row) => (
      <StatusBadge
        status="Stan klienta"
        text={row.status}
        tone={row.status === 'Aktywny' ? 'success' : 'warning'}
      />
    ),
  },
];

const meta = {
  title: 'DESIGN SYSTEM/Wzorce/Data Explorer',
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Podstawowy: Story = {
  name: 'Podstawowy',
  render: () => (
    <ExplorerTable<CustomerRow>
      ariaLabel="Eksplorator klientów"
      columns={columns}
      collapsedRowCount={5}
      pageSize={5}
      rows={rows}
      searchFields={['customer', 'segment']}
      searchPlaceholder="Szukaj klienta lub segmentu"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('table', { name: 'Eksplorator klientów' })).toBeInTheDocument();
    await expect(canvas.getByText('Pokaż wszystkie (6)')).toBeInTheDocument();

    const search = canvas.getByRole('searchbox', { name: 'Szukaj' });
    await userEvent.type(search, 'CUS-781C');
    await expect(canvas.getByText('CUS-781C')).toBeInTheDocument();
    await expect(canvas.queryByText('CUS-18F2')).not.toBeInTheDocument();

    // Wyszukiwanie jest zweryfikowane powyżej — story ma jednak kończyć się w
    // reprezentatywnym, pełnym stanie (patrz "Pokaż wszystkie (6)"), a nie
    // przefiltrowanym do jednego wiersza, więc czyścimy pole i potwierdzamy
    // powrót do pełnych danych.
    await userEvent.clear(search);
    await expect(canvas.getByText('Pokaż wszystkie (6)')).toBeInTheDocument();
    await expect(canvas.getByText('CUS-18F2')).toBeInTheDocument();
  },
};

export const Pusty: Story = {
  name: 'Brak wyników',
  render: () => (
    <ExplorerTable<CustomerRow>
      ariaLabel="Eksplorator klientów"
      columns={columns}
      emptyMessage="Zmień filtry albo zakres danych."
      emptyTitle="Brak klientów"
      rows={[]}
      searchFields={['customer', 'segment']}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Brak klientów')).toBeInTheDocument();
  },
};
