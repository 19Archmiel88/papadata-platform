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
  Table,
} from './Table';
import type {
  TableRow,
} from './Table';
import {
  StatusBadge,
} from '../StatusBadge';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const columns = [
  { id: 'source', label: 'Źródło' },
  {
    id: 'status',
    label: 'Stan',
    renderCell: (row: TableRow) => (
      <StatusBadge status={String(row.status ?? '')} text={String(row.statusText ?? '')} tone={row.statusTone as 'success' | 'warning' | 'critical'} />
    ),
  },
  { align: 'right' as const, id: 'completeness', label: 'Kompletność' },
  { id: 'sync', label: 'Ostatnia synchronizacja' },
];

const rows = [
  { completeness: '98%', id: 'woo', source: 'WooCommerce', status: 'ready', statusText: 'Gotowe', statusTone: 'success', sync: '18 min temu' },
  { completeness: '82%', id: 'google-ads', source: 'Google Ads', status: 'action_required', statusText: 'Wymaga działania', statusTone: 'critical', sync: '6 h temu' },
  { completeness: '—', id: 'ga4', source: 'Google Analytics 4', status: 'syncing', statusText: 'Synchronizacja', statusTone: 'warning', sync: 'w toku' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Dane/Table',
  component: Table,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    columns,
    rows,
  },
  argTypes: {
    density: { control: 'inline-radio', options: ['comfortable', 'compact'] },
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof Table>;

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
      className="pd-table-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const TableStory: Story = {
  name: 'Table',
  render: (args) => (
    <StoryPresentationPage
      className="pd-table-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry Table', en: 'Table parameters' })}
          items={[
            { label: <Localized pl="renderCell" en="renderCell" />, value: copy({ pl: 'komórka jako dowolny komponent', en: 'cell as any component' }) },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="table"
      summary={
        <Localized
          pl="Statyczna tabela danych — sortowanie, komórki niestandardowe (renderCell), stan ładowania i pusty. Dla tabel z wbudowanym filtrowaniem, akcjami rzędu i menu kontekstowym użyj DataTable."
          en="A static data table — sorting, custom cells (renderCell), loading and empty states. For tables with built-in filtering, row actions and a context menu, use DataTable."
        />
      }
      title={<Localized pl="Wiersze i kolumny, którym można zaufać." en="Rows and columns you can trust." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany" en="Controlled" />}>
        <div data-testid="table-controlled">
          <Table {...args} />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Sortowalna" en="Sortable" />}>
        <div data-testid="table-sortable">
          <Table columns={columns} rows={rows} sort={{ columnId: 'source', direction: 'asc' }} onSort={fn()} />
        </div>
      </StorySection>

      <StorySection index="03" title={<Localized pl="Ładowanie / pusta" en="Loading / empty" />}>
        <div data-testid="table-states" style={{ display: 'grid', gap: 'var(--pd-space-6)' }}>
          <Table columns={columns} loading loadingRows={3} rows={[]} />
          <Table columns={columns} emptyMessage={copy({ pl: 'Podłącz pierwsze źródło, aby zobaczyć dane.', en: 'Connect your first source to see data.' })} emptyTitle={copy({ pl: 'Brak źródeł', en: 'No sources' })} rows={[]} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('table-controlled').querySelectorAll('tbody tr')).toHaveLength(rows.length);
    await expect(canvas.getByTestId('table-sortable')).toBeInTheDocument();
    await expect(canvas.getByTestId('table-states').children).toHaveLength(2);
  },
};
