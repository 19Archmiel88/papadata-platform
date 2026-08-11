import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
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
  readonly [key: string]:
    TableRowValue;
};

export type TableColumn = {
  readonly align?:
    | 'left'
    | 'right'
    | 'center';
  readonly id: string;
  readonly label: string;
  readonly renderCell?:
    | ((
      row: TableRow,
    ) => ReactNode)
    | undefined;
  readonly renderHeader?:
    ReactNode;
  readonly sortable?: boolean;
  readonly width?:
    string | number;
};

export type TableProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  readonly ariaLabel?: string;
  readonly caption?:
    string | null;
  readonly captionVisuallyHidden?:
    boolean;
  readonly columns:
    readonly TableColumn[];
  readonly density?:
    | 'comfortable'
    | 'compact';
  readonly emptyMessage?: string;
  readonly emptyTitle?: string;
  readonly loading?: boolean;
  readonly loadingRows?: number;
  readonly minWidth?:
    string | number;
  readonly rowHeaderColumnId?:
    string | null;
  readonly rows:
    readonly TableRow[];
  readonly sort?:
    | {
      readonly columnId: string;
      readonly direction:
        | 'asc'
        | 'desc';
    }
    | null;
  readonly stickyHeader?: boolean;
  readonly onSort?:
    | ((
      columnId: string,
    ) => void)
    | undefined;
};

function resolveWidth(
  value:
    | string
    | number
    | undefined,
) {
  if (
    typeof value === 'number'
  ) {
    return `${value}px`;
  }

  return value;
}

function renderCellValue(
  value: TableRowValue,
) {
  if (
    typeof value === 'boolean'
  ) {
    return value
      ? 'Tak'
      : 'Nie';
  }

  if (
    value === null
    || value === undefined
  ) {
    return '—';
  }

  return value;
}

function resolveSortLabel(
  columnLabel: string,
  sortState:
    | 'asc'
    | 'desc'
    | undefined,
) {
  if (
    sortState === 'asc'
  ) {
    return `Sortuj po kolumnie ${columnLabel}. Obecnie rosnąco.`;
  }

  if (
    sortState === 'desc'
  ) {
    return `Sortuj po kolumnie ${columnLabel}. Obecnie malejąco.`;
  }

  return `Sortuj po kolumnie ${columnLabel}.`;
}

export function Table({
  ariaLabel,
  caption = null,
  captionVisuallyHidden = false,
  className,
  columns,
  density = 'comfortable',
  emptyMessage = 'Brak danych do wyświetlenia.',
  emptyTitle = 'Brak danych',
  loading = false,
  loadingRows = 4,
  minWidth = '46rem',
  onSort,
  rowHeaderColumnId = null,
  rows,
  sort = null,
  stickyHeader = false,
  style,
  ...props
}: TableProps) {
  const resolvedStyle = {
    ...style,
    '--pd-table-min-width':
      resolveWidth(
        minWidth,
      ),
  } as CSSProperties;

  if (loading) {
    return (
      <div
        {...props}
        aria-busy="true"
        aria-live="polite"
        className={
          joinClassNames(
            'pd-table',
            className,
          )
        }
        data-density={density}
        style={resolvedStyle}
      >
        <div
          className="pd-table__loading"
          role="status"
        >
          <span className="pd-visually-hidden">
            Ładowanie danych tabeli
          </span>

          {Array.from({
            length: loadingRows,
          }).map(
            (
              _,
              index: number,
            ) => (
              <Skeleton
                key={`row-${index}`}
                height={18}
                lines={1}
                shape="text"
                width="100%"
              />
            ),
          )}
        </div>
      </div>
    );
  }

  if (
    rows.length === 0
  ) {
    return (
      <div
        {...props}
        className={
          joinClassNames(
            'pd-table',
            className,
          )
        }
        data-density={density}
        style={resolvedStyle}
      >
        <div
          className="pd-table__empty"
          role="status"
        >
          <p className="pd-table__empty-title">
            {emptyTitle}
          </p>

          <p className="pd-table__empty-message">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      {...props}
      className={
        joinClassNames(
          'pd-table',
          className,
        )
      }
      data-density={density}
      data-sticky-header={
        stickyHeader
          ? true
          : undefined
      }
      style={resolvedStyle}
    >
      <div className="pd-table__scroll">
        <table
          aria-label={
            ariaLabel
          }
          className="pd-table__element pd-table__table"
        >
          {caption ? (
            <caption
              className={
                joinClassNames(
                  'pd-table__caption',
                  captionVisuallyHidden
                    ? 'pd-visually-hidden'
                    : null,
                )
              }
            >
              {caption}
            </caption>
          ) : null}

          <thead className="pd-table__head">
            <tr>
              {columns.map(
                (
                  column:
                    TableColumn,
                ) => {
                  const sortState =
                    sort?.columnId
                    === column.id
                      ? sort.direction
                      : undefined;

                  return (
                    <th
                      key={
                        column.id
                      }
                      aria-sort={
                        sortState
                        === 'asc'
                          ? 'ascending'
                          : sortState
                            === 'desc'
                            ? 'descending'
                            : column.sortable
                              ? 'none'
                              : undefined
                      }
                      data-align={
                        column.align
                        ?? 'left'
                      }
                      scope="col"
                      style={{
                        width:
                          resolveWidth(
                            column.width,
                          ),
                      }}
                    >
                      {column.renderHeader
                        ? column.renderHeader
                        : column.sortable
                          ? (
                            <button
                              aria-label={
                                resolveSortLabel(
                                  column.label,
                                  sortState,
                                )
                              }
                              className="pd-table__sort-button"
                              type="button"
                              onClick={() => {
                                onSort?.(
                                  column.id,
                                );
                              }}
                            >
                              <span>
                                {
                                  column.label
                                }
                              </span>

                              <span
                                aria-hidden="true"
                                className="pd-table__sort-indicator"
                              >
                                {sortState
                                  === 'asc'
                                  ? '↑'
                                  : sortState
                                    === 'desc'
                                    ? '↓'
                                    : '↕'}
                              </span>
                            </button>
                          )
                          : column.label}
                    </th>
                  );
                },
              )}
            </tr>
          </thead>

          <tbody className="pd-table__body">
            {rows.map(
              (
                row:
                  TableRow,
              ) => (
                <tr
                  key={row.id}
                  data-selected={
                    row.selected
                      ? true
                      : undefined
                  }
                >
                  {columns.map(
                    (
                      column:
                        TableColumn,
                    ) => {
                      const content =
                        column.renderCell
                          ? column.renderCell(
                            row,
                          )
                          : renderCellValue(
                            row[
                              column.id
                            ],
                          );

                      if (
                        rowHeaderColumnId
                        && column.id
                          === rowHeaderColumnId
                      ) {
                        return (
                          <th
                            key={`${row.id}-${column.id}`}
                            data-align={
                              column.align
                              ?? 'left'
                            }
                            scope="row"
                          >
                            <div className="pd-table__cell-wrap">
                              {
                                content
                              }
                            </div>
                          </th>
                        );
                      }

                      return (
                        <td
                          key={`${row.id}-${column.id}`}
                          data-align={
                            column.align
                            ?? 'left'
                          }
                        >
                          <div className="pd-table__cell-wrap">
                            {
                              content
                            }
                          </div>
                        </td>
                      );
                    },
                  )}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
