import type {
  HTMLAttributes,
} from 'react';
import {
  useState,
} from 'react';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  PapaDataIconName,
} from '../../icons';
import {
  Menu,
} from '../Menu';
import type {
  MenuItem,
} from '../Menu';
import {
  PaginationNav,
} from '../PaginationNav';
import {
  StatusBadge,
} from '../StatusBadge';
import {
  Table,
} from '../Table';
import type {
  TableColumn,
  TableRow,
} from '../Table';
import {
  InlineNotice,
} from '../InlineNotice';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Data/data.css';

export type DataTableStatusTone =
  | 'default'
  | 'danger'
  | 'neutral'
  | 'success'
  | 'warning';

export type DataTableProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly actionsLabel?: string;
  readonly actionsMenuItems?:
    | ((
        row: DataRow,
      ) => readonly MenuItem[])
    | undefined;
  readonly ariaLabel?: string;
  readonly columns: readonly DataColumn[];
  readonly density?: 'comfortable' | 'compact';
  readonly emptyMessage: string;
  readonly emptyTitle?: string;
  readonly errorMessage?: string | null;
  readonly loading: boolean;
  readonly noResults?: boolean;
  readonly noResultsMessage?: string;
  readonly onAction?:
    | ((
        rowId: string,
        actionId: string,
      ) => void)
    | undefined;
  readonly onSortChange?:
    | ((
        columnId: string,
      ) => void)
    | undefined;
  readonly pagination?:
    | {
        readonly cursor: string | null;
        readonly loading: boolean;
        readonly nextCursor: string | null;
        readonly onNavigate?:
          | ((
              direction:
                | 'next'
                | 'previous',
            ) => void)
          | undefined;
        readonly previousCursor: string | null;
        readonly summary: string;
      }
    | null;
  readonly rowCount: number;
  readonly rows: readonly DataRow[];
  readonly selectedRowIds: readonly string[];
  readonly sort:
    | {
        readonly columnId: string;
        readonly direction: 'asc' | 'desc';
      }
    | null;
  readonly statusColumn?:
    | {
        readonly columnId: string;
        readonly icon?: PapaDataIconName | null;
        readonly label: string;
        readonly mapTone: Record<
          string,
          DataTableStatusTone
        >;
      }
    | null;
  readonly summary?: string | null;
};

const toneMap = {
  danger: 'critical',
  default: 'neutral',
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
} as const;

function DataTableActionsCell({
  items,
  label,
  rowId,
  onAction,
}: {
  readonly items: readonly MenuItem[];
  readonly label: string;
  readonly rowId: string;
  readonly onAction?:
    | ((
        actionId: string,
      ) => void)
    | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [activeItemId, setActiveItemId] =
    useState<string | null>(null);

  return (
    <Menu
      activeItemId={activeItemId}
      items={items}
      open={open}
      placement="bottom-end"
      trigger={(
        <button
          aria-label={`Akcje dla wiersza ${rowId}`}
          className="pd-pagination__button"
          type="button"
        >
          {label}
        </button>
      )}
      onAction={(actionId) => {
        onAction?.(actionId);
        setOpen(false);
      }}
      onActiveItemIdChange={(itemId) => {
        setActiveItemId(itemId);
      }}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
      }}
    />
  );
}

function buildTableColumns(
  columns: readonly DataColumn[],
  statusColumn:
    | DataTableProps['statusColumn']
    | null,
  actionsMenuItems:
    | DataTableProps['actionsMenuItems']
    | undefined,
  actionsLabel: string,
  onAction:
    | DataTableProps['onAction']
    | undefined,
) {
  const mappedColumns: TableColumn[] =
    columns.map((column) => {
      if (
        statusColumn
        && column.id === statusColumn.columnId
      ) {
        return {
          align: column.align,
          id: column.id,
          label: column.label,
          renderCell: (row) => {
            const rawValue =
              row[column.id];
            const text =
              rawValue === null
              || rawValue === undefined
                ? '—'
                : String(rawValue);
            const toneKey =
              statusColumn.mapTone[text]
              ?? 'default';

            return (
              <span className="pd-key-value-list__status">
                <StatusBadge
                  icon={
                    statusColumn.icon
                      ?? null
                  }
                  status={statusColumn.label}
                  text={text}
                  tone={toneMap[toneKey]}
                />
              </span>
            );
          },
          sortable: column.sortable,
          width: column.width,
        };
      }

      return {
        align: column.align,
        id: column.id,
        label: column.label,
        sortable: column.sortable,
        width: column.width,
      };
    });

  if (!actionsMenuItems) {
    return mappedColumns;
  }

  mappedColumns.push({
    align: 'right',
    id: '__actions',
    label: actionsLabel,
    renderCell: (row) => {
      const dataRow = row as DataRow;
      const items =
        actionsMenuItems(dataRow);

      return (
        <DataTableActionsCell
          items={items}
          label={actionsLabel}
          rowId={String(dataRow.id)}
          onAction={(actionId) => {
            onAction?.(
              String(dataRow.id),
              actionId,
            );
          }}
        />
      );
    },
    width: 132,
  });

  return mappedColumns;
}

export function DataTable({
  actionsLabel = 'Akcje',
  actionsMenuItems,
  ariaLabel = 'Tabela danych',
  className,
  columns,
  density = 'comfortable',
  emptyMessage,
  emptyTitle = 'Brak danych',
  errorMessage = null,
  loading,
  noResults = false,
  noResultsMessage = 'Filtry nie zwróciły żadnych wyników.',
  onAction,
  onSortChange,
  pagination = null,
  rowCount,
  rows,
  selectedRowIds,
  sort,
  statusColumn = null,
  summary = null,
  ...props
}: DataTableProps) {
  const tableRows: TableRow[] = rows.map(
    (row) => ({
      ...row,
      selected:
        selectedRowIds.includes(
          row.id,
        ),
    }),
  );
  const tableColumns = buildTableColumns(
    columns,
    statusColumn,
    actionsMenuItems,
    actionsLabel,
    onAction,
  );
  const captionText = summary
    ?? `${rowCount} wierszy w bieżącym zestawie danych.`;

  return (
    <div
      {...props}
      className={joinClassNames(
        'pd-data-table',
        className,
      )}
    >
      <div className="pd-data-table__toolbar">
        <p className="pd-data-table__summary">
          {captionText}
        </p>
      </div>

      {errorMessage ? (
        <InlineNotice
          message={errorMessage}
          title="Błąd danych"
          tone="critical"
        />
      ) : null}

      <Table
        ariaLabel={ariaLabel}
        caption={captionText}
        columns={tableColumns}
        density={density}
        emptyMessage={
          noResults
            ? noResultsMessage
            : emptyMessage
        }
        emptyTitle={
          noResults
            ? 'Brak wyników'
            : emptyTitle
        }
        loading={loading}
        rows={tableRows}
        sort={sort}
        onSort={onSortChange}
      />

      {pagination ? (
        <PaginationNav
          cursor={pagination.cursor}
          loading={pagination.loading}
          nextCursor={pagination.nextCursor}
          previousCursor={pagination.previousCursor}
          summary={pagination.summary}
          onNavigate={pagination.onNavigate}
        />
      ) : null}
    </div>
  );
}
