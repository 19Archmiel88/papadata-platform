import {
  useState,
} from 'react';

import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  DataColumn,
} from '../../../../../../contracts/component-shared';
import {
  DataTable,
  EmptyState,
  Tabs,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  commandColumns,
  customerColumns,
  productColumns,
  sourceColumns,
} from './commandCenterOnePageModel';

type RegisterTab = {
  readonly columns: readonly DataColumn[];
  readonly emptyMessage: string;
  readonly id: string;
  readonly label: string;
  readonly minWidth: number;
  readonly rows: readonly DataRow[];
  readonly sortColumnId: string;
};

/**
 * One register at the bottom of the one-page instead of four tables scattered
 * between the analytical floors: same width, same density, one place to look
 * when the question stops being "what happened" and becomes "show me the rows".
 */
export function CommandCenterRecordsSection({
  customerRows,
  productRows,
  rows,
  sourceRows,
  title,
}: {
  readonly customerRows: readonly DataRow[];
  readonly productRows: readonly DataRow[];
  readonly rows: readonly DataRow[];
  readonly sourceRows: readonly DataRow[];
  readonly title: string;
}) {
  const tabs: readonly RegisterTab[] = [
    {
      columns: commandColumns,
      emptyMessage: 'Brak metryk dla wybranego zakresu.',
      id: 'kpi',
      label: 'KPI',
      minWidth: 1320,
      rows,
      sortColumnId: 'impact',
    },
    {
      columns: sourceColumns,
      emptyMessage: 'Brak źródeł ruchu.',
      id: 'sources',
      label: 'Źródła ruchu',
      minWidth: 980,
      rows: sourceRows,
      sortColumnId: 'revenue',
    },
    {
      columns: customerColumns,
      emptyMessage: 'Brak segmentów klientów.',
      id: 'customers',
      label: 'Klienci',
      minWidth: 920,
      rows: customerRows,
      sortColumnId: 'revenue',
    },
    {
      columns: productColumns,
      emptyMessage: 'Brak danych produktowych.',
      id: 'products',
      label: 'Produkty',
      minWidth: 1180,
      rows: productRows,
      sortColumnId: 'revenue',
    },
  ];

  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? 'kpi');

  return (
    <section
      aria-labelledby="command-center-records-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__records"
    >
      <CommandSectionHeader
        eyebrow="Dane"
        title={title}
        titleId="command-center-records-title"
      />
      <Tabs
        activation="automatic"
        activeId={activeId}
        ariaLabel="Zakres rejestru operacyjnego"
        items={tabs.map((tab) => ({
          badge: tab.rows.length > 0 ? String(tab.rows.length) : undefined,
          id: tab.id,
          label: tab.label,
          panel: tab.rows.length === 0 ? (
            <EmptyState
              message={tab.emptyMessage}
              title={`Brak danych: ${tab.label}`}
              variant="empty"
            />
          ) : (
            <DataTable
              ariaLabel={`${title}: ${tab.label}`}
              className="pd-command-center-one-page__table"
              columns={tab.columns}
              density="compact"
              emptyMessage={tab.emptyMessage}
              loading={false}
              minWidth={tab.minWidth}
              rowCount={tab.rows.length}
              rows={tab.rows}
              selectedRowIds={[]}
              sort={{ columnId: tab.sortColumnId, direction: 'desc' }}
            />
          ),
        }))}
        onActiveIdChange={(nextId) => {
          setActiveId(nextId);
        }}
        orientation="horizontal"
        size="compact"
      />
    </section>
  );
}
