import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import {
  EmptyState,
} from '../EmptyState';
import {
  Skeleton,
} from '../Skeleton';
import '../Data/data.css';

export type TableRowValue =
  | ReactNode
  | string
  | number
  | boolean
  | null
  | undefined;

export type TableRow = {
  readonly id: string;
  readonly selected?: boolean;
  readonly [key: string]: TableRowValue;
};

export type TableColumn = {
  readonly align?: 'left' | 'right' | 'center';
  readonly id: string;
  readonly label: string;
  readonly renderCell?:
    | ((
        row: TableRow,
      ) => ReactNode)
    | undefined;
  readonly sortable?: boolean;
  readonly width?: string | number;
};

export type TableProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly ariaLabel?: string;
  readonly caption?: string | null;
  readonly columns: readonly TableColumn[];
  readonly density?: 'comfortable' | 'compact';
  readonly emptyMessage?: string;
  readonly emptyTitle?: string;
  readonly loading?: boolean;
  readonly loadingRows?: number;
  readonly minWidth?: string | number;
  readonly rows: readonly TableRow[];
  readonly sort?:
    | {
        readonly columnId: string;
        readonly direction: 'asc' | 'desc';
      }
    | null;
  readonly onSort?:
    | ((
        columnId: string,
      ) => void)
    | undefined;
};

function resolveWidth(
  value: string | number | undefined,
) {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value;
}

function renderCellValue(
  value: TableRowValue,
) {
  if (typeof value === 'boolean') {
    return value ? 'Tak' : 'Nie';
  }

  if (value === null || value === undefined) {
    return '—';
  }

  return value;
}

export function Table({
  ariaLabel,
  caption = null,
  className,
  columns,
  density = 'comfortable',
  emptyMessage = 'Brak danych do wyświetlenia.',
  emptyTitle = 'Brak danych',
  loading = false,
  loadingRows = 4,
  minWidth = '46rem',
  onSort,
  rows,
  sort = null,
  style,
  ...props
}: TableProps) {
  if (loading) {
    return (
      <div
        {...props}
        className={joinClassNames(
          'pd-table',
          className,
        )}
        data-density={density}
      >
        <div className="pd-table__state">
          <div className="pd-table__skeleton">
            {Array.from({
              length: loadingRows,
            }).map((_, index) => (
              <Skeleton
                key={`row-${index}`}
                height={18}
                lines={1}
                shape="text"
                width="100%"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div
        {...props}
        className={joinClassNames(
          'pd-table',
          className,
        )}
        data-density={density}
      >
        <div className="pd-table__state">
          <EmptyState
            message={emptyMessage}
            title={emptyTitle}
            variant="empty"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      {...props}
      className={joinClassNames(
        'pd-table',
        className,
      )}
      data-density={density}
      style={{
        ...style,
        '--pd-table-min-width':
          resolveWidth(minWidth),
      } as CSSProperties}
    >
      <div className="pd-table__scroll">
        <table
          aria-label={ariaLabel}
          className="pd-table__element"
        >
          {caption ? (
            <caption className="pd-table__caption">
              {caption}
            </caption>
          ) : null}
          <thead className="pd-table__head">
            <tr>
              {columns.map((column) => {
                const sortState =
                  sort?.columnId === column.id
                    ? sort.direction
                    : undefined;

                return (
                  <th
                    key={column.id}
                    aria-sort={
                      sortState === 'asc'
                        ? 'ascending'
                        : sortState === 'desc'
                          ? 'descending'
                          : column.sortable
                            ? 'none'
                            : undefined
                    }
                    data-align={
                      column.align ?? 'left'
                    }
                    scope="col"
                    style={{
                      width: resolveWidth(
                        column.width,
                      ),
                    }}
                  >
                    {column.sortable ? (
                      <button
                        className="pd-table__sort-button"
                        type="button"
                        onClick={() => {
                          onSort?.(column.id);
                        }}
                      >
                        <span>{column.label}</span>
                        <span
                          aria-hidden="true"
                          className="pd-table__sort-indicator"
                        >
                          {sortState === 'asc'
                            ? '↑'
                            : sortState === 'desc'
                              ? '↓'
                              : '↕'}
                        </span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="pd-table__body">
            {rows.map((row) => (
              <tr
                key={row.id}
                data-interactive={columns.some(
                  (column) =>
                    typeof column.renderCell === 'function',
                )}
                data-selected={
                  row.selected
                    ? true
                    : undefined
                }
              >
                {columns.map((column) => (
                  <td
                    key={`${row.id}-${column.id}`}
                    data-align={
                      column.align ?? 'left'
                    }
                  >
                    <div className="pd-table__cell-wrap">
                      {column.renderCell
                        ? column.renderCell(row)
                        : renderCellValue(
                            row[column.id],
                          )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
