import type {
  HTMLAttributes,
  ReactNode,
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
  InlineNotice,
} from '../InlineNotice';
import {
  joinClassNames,
} from '../Field/fieldUtils';
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
import '../Data/data.css';

export type DataTableStatusTone =
  | 'default'
  | 'danger'
  | 'neutral'
  | 'success'
  | 'warning';

export type DataTableCellRenderer = (
  row: DataRow,
) => ReactNode;

export type DataTableSelection = {
  readonly allVisibleSelected: boolean;
  readonly ariaLabel?: string;
  readonly onToggleRow: (rowId: string) => void;
  readonly onToggleVisible: () => void;
  readonly someVisibleSelected?: boolean;
};

export type DataTableProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly actionsLabel?: string;
  readonly actionsMenuItems?:
    | ((
      row: DataRow,
    ) => readonly MenuItem[])
    | undefined;
  readonly actionsTriggerLabel?: string;
  readonly ariaLabel?: string;
  readonly cellRenderers?:
    | Readonly<Record<string, DataTableCellRenderer>>
    | undefined;
  readonly columns: readonly DataColumn[];
  readonly density?: 'comfortable' | 'compact';
  readonly emptyMessage: string;
  readonly emptyTitle?: string;
  readonly errorMessage?: string | null;
  readonly loading: boolean;
  readonly minWidth?: string | number;
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
  readonly rowHeaderColumnId?: string | null;
  readonly rows: readonly DataRow[];
  readonly selectedRowIds: readonly string[];
  readonly selection?: DataTableSelection | null;
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
  readonly stickyHeader?: boolean;
  readonly summary?: string | null;
};

const toneMap = {
  danger: 'critical',
  default: 'neutral',
  neutral: 'neutral',
  success: 'success',
  warning: 'warning',
} as const;

function SelectionCheckbox({
  ariaLabel,
  checked,
  indeterminate = false,
  onChange,
}: {
  readonly ariaLabel: string;
  readonly checked: boolean;
  readonly indeterminate?: boolean;
  readonly onChange: () => void;
}) {
  return (
    <input
      aria-label={ariaLabel}
      checked={checked}
      className="pd-data-table__selection-control"
      ref={(element) => {
        if (element) {
          element.indeterminate = indeterminate;
        }
      }}
      type="checkbox"
      onChange={onChange}
    />
  );
}

function DataTableActionsCell({
  items,
  label,
  rowId,
  triggerLabel,
  onAction,
}: {
  readonly items: readonly MenuItem[];
  readonly label: string;
  readonly rowId: string;
  readonly triggerLabel: string;
  readonly onAction?:
    | ((
      actionId: string,
    ) => void)
    | undefined;
}) {
  const [open, setOpen] = useState(false);

  const [
    activeItemId,
    setActiveItemId,
  ] = useState<string | null>(
    null,
  );

  return (
    <Menu
      activeItemId={activeItemId}
      items={items}
      open={open}
      placement="bottom-end"
      trigger={(
        <button
          aria-label={`${label} dla wiersza ${rowId}`}
          className={joinClassNames(
            'pd-pagination-nav__button',
            'pd-data-table__action-trigger',
          )}
          type="button"
        >
          <span aria-hidden="true">
            {triggerLabel}
          </span>
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
  cellRenderers:
    | DataTableProps['cellRenderers']
    | undefined,
  actionsMenuItems:
    | DataTableProps['actionsMenuItems']
    | undefined,
  actionsLabel: string,
  actionsTriggerLabel: string,
  onAction:
    | DataTableProps['onAction']
    | undefined,
  selection:
    | DataTableProps['selection']
    | null,
): TableColumn[] {
  const mappedColumns: TableColumn[] = [];

  if (selection) {
    mappedColumns.push({
      align: 'center',
      id: '__selection',
      label:
        selection.ariaLabel
        ?? 'Zaznaczenie',
      renderHeader: (
        <SelectionCheckbox
          ariaLabel="Zaznacz wszystkie wiersze na stronie"
          checked={
            selection.allVisibleSelected
          }
          indeterminate={
            Boolean(
              selection.someVisibleSelected,
            )
            && !selection.allVisibleSelected
          }
          onChange={
            selection.onToggleVisible
          }
        />
      ),
      renderCell: (
        row: TableRow,
      ) => (
        <SelectionCheckbox
          ariaLabel={`Zaznacz wiersz ${String(row.id)}`}
          checked={Boolean(row.selected)}
          onChange={() => {
            selection.onToggleRow(
              String(row.id),
            );
          }}
        />
      ),
      width: 48,
    });
  }

  columns.forEach(
    (column: DataColumn) => {
      const customRenderer =
        cellRenderers?.[column.id];

      if (customRenderer) {
        mappedColumns.push({
          align: column.align,
          id: column.id,
          label: column.label,
          renderCell: (
            row: TableRow,
          ) => (
            customRenderer(
              row as DataRow,
            )
          ),
          sortable: column.sortable,
          width: column.width,
        });

        return;
      }

      if (
        statusColumn
        && column.id
          === statusColumn.columnId
      ) {
        mappedColumns.push({
          align: column.align,
          id: column.id,
          label: column.label,
          renderCell: (
            row: TableRow,
          ) => {
            const rawValue =
              row[column.id];

            const text =
              rawValue === null
              || rawValue === undefined
                ? '—'
                : String(rawValue);

            const toneKey =
              statusColumn.mapTone[
                text
              ]
              ?? 'default';

            return (
              <span className="pd-key-value-list__status">
                <StatusBadge
                  icon={
                    statusColumn.icon
                    ?? null
                  }
                  status={
                    statusColumn.label
                  }
                  text={text}
                  tone={
                    toneMap[
                      toneKey
                    ]
                  }
                />
              </span>
            );
          },
          sortable:
            column.sortable,
          width:
            column.width,
        });

        return;
      }

      mappedColumns.push({
        align: column.align,
        id: column.id,
        label: column.label,
        sortable: column.sortable,
        width: column.width,
      });
    },
  );

  if (!actionsMenuItems) {
    return mappedColumns;
  }

  mappedColumns.push({
    align: 'right',
    id: '__actions',
    label: actionsLabel,
    renderCell: (
      row: TableRow,
    ) => {
      const dataRow =
        row as DataRow;

      const items =
        actionsMenuItems(
          dataRow,
        );

      return (
        <DataTableActionsCell
          items={items}
          label={actionsLabel}
          rowId={
            String(dataRow.id)
          }
          triggerLabel={
            actionsTriggerLabel
          }
          onAction={(actionId) => {
            onAction?.(
              String(
                dataRow.id,
              ),
              actionId,
            );
          }}
        />
      );
    },
    width: 64,
  });

  return mappedColumns;
}

export function DataTable({
  actionsLabel = 'Akcje',
  actionsMenuItems,
  actionsTriggerLabel = '…',
  ariaLabel = 'Tabela danych',
  cellRenderers,
  className,
  columns,
  density = 'comfortable',
  emptyMessage,
  emptyTitle = 'Brak danych',
  errorMessage = null,
  loading,
  minWidth,
  noResults = false,
  noResultsMessage = 'Filtry nie zwróciły żadnych wyników.',
  onAction,
  onSortChange,
  pagination = null,
  rowCount,
  rowHeaderColumnId = null,
  rows,
  selectedRowIds,
  selection = null,
  sort,
  statusColumn = null,
  stickyHeader = true,
  summary = null,
  ...props
}: DataTableProps) {
  const tableRows: TableRow[] =
    rows.map(
      (row: DataRow) => ({
        ...row,
        selected:
          selectedRowIds.includes(
            String(row.id),
          ),
      }),
    );

  const tableColumns =
    buildTableColumns(
      columns,
      statusColumn,
      cellRenderers,
      actionsMenuItems,
      actionsLabel,
      actionsTriggerLabel,
      onAction,
      selection,
    );

  const captionText =
    summary
    ?? `${rowCount} wierszy w bieżącym zestawie danych.`;

  return (
    <div
      {...props}
      className={joinClassNames(
        'pd-data-table',
        className,
      )}
      data-has-actions={
        actionsMenuItems
          ? true
          : undefined
      }
      data-has-selection={
        selection
          ? true
          : undefined
      }
    >
      <p
        aria-hidden="true"
        className="pd-data-table__summary"
      >
        {captionText}
      </p>

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
        captionVisuallyHidden
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
        minWidth={minWidth}
        rowHeaderColumnId={
          rowHeaderColumnId
        }
        rows={tableRows}
        sort={sort}
        stickyHeader={
          stickyHeader
        }
        onSort={
          onSortChange
        }
      />

      {pagination ? (
        <PaginationNav
          cursor={
            pagination.cursor
          }
          loading={
            pagination.loading
          }
          nextCursor={
            pagination.nextCursor
          }
          previousCursor={
            pagination.previousCursor
          }
          summary={
            pagination.summary
          }
          onNavigate={
            pagination.onNavigate
          }
        />
      ) : null}
    </div>
  );
}
