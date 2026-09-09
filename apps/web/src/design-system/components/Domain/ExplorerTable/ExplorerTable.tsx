import type {
  ReactNode,
} from 'react';
import {
  useId,
  useMemo,
  useState,
} from 'react';

import {
  IconButton,
} from '../../Button';
import {
  TextAction,
} from '../../Button';
import {
  ColumnPicker,
} from '../../ColumnPicker';
import {
  DataTable,
} from '../../DataTable';
import type {
  DataRow,
} from '../../../../../../../contracts/component-shared';
import {
  FilterBar,
} from '../../FilterBar';
import type {
  FilterBarFilter,
} from '../../FilterBar';
import {
  Menu,
} from '../../Menu';
import type {
  MenuItem,
} from '../../Menu';
import {
  Popover,
} from '../../Popover';
import {
  SearchField,
} from '../../SearchField';
import {
  downloadCsv,
  slugifyFilename,
} from './csvExport';
import {
  printTableAsPdf,
} from './pdfExport';
import './explorer-table.css';

export type ExplorerTableColumn<Row> = {
  readonly align?: 'left' | 'right' | 'center';
  readonly csvValue?: (row: Row) => number | string;
  readonly defaultVisible?: boolean;
  readonly id: string;
  readonly label: string;
  readonly render?: (row: Row) => ReactNode;
  readonly required?: boolean;
  readonly sortAccessor?: (row: Row) => number | string | null;
  readonly width?: number;
};

export type ExplorerTableExportFormat =
  | 'csv'
  | 'pdf';

const exportMenuItems: readonly MenuItem[] = [
  { id: 'csv', label: 'Eksportuj CSV' },
  { id: 'pdf', label: 'Eksportuj PDF' },
];

export type ExplorerTableSort = { readonly columnId: string; readonly direction: 'asc' | 'desc' };

export type ExplorerTableProps<Row extends { readonly id: string }> = {
  readonly ariaLabel: string;
  readonly className?: string;
  readonly canExport?: boolean;
  readonly loading?: boolean;
  readonly manualSearch?: boolean;
  readonly manualSorting?: boolean;
  readonly sortState?: ExplorerTableSort | null;
  readonly onSortStateChange?: (sort: ExplorerTableSort) => void;
  readonly searchQuery?: string;
  readonly onSearchQueryChange?: (query: string) => void;
  readonly collapsedRowCount?: number;
  readonly columnPickerLabel?: string;
  readonly columns: readonly ExplorerTableColumn<Row>[];
  readonly emptyMessage?: string;
  readonly emptyTitle?: string;
  readonly exportFilenameBase?: string;
  readonly exportLabel?: string;
  readonly filters?: ReactNode;
  readonly filterState?: readonly FilterBarFilter[];
  readonly onClearFilters?: (() => void) | undefined;
  readonly onExport?: (format: ExplorerTableExportFormat, context: {columns: readonly string[]; search: string; sort: ExplorerTableSort | null}) => void;
  readonly exportFormats?: readonly ExplorerTableExportFormat[];
  readonly exportPending?: boolean;
  readonly onRemoveFilter?: ((filterId: string) => void) | undefined;
  readonly onRowAction?: (rowId: string, actionId: string) => void;
  readonly onRowClick?: (row: Row) => void;
  readonly pageSize?: number;
  readonly rowActions?: (row: Row) => readonly MenuItem[];
  readonly rows: readonly Row[];
  readonly searchFields?: readonly (keyof Row)[];
  readonly searchText?: ((row: Row) => string) | undefined;
  readonly searchLabel?: string;
  readonly searchPlaceholder?: string;
};

function normalize(value: unknown): string {
  return String(value ?? '').toLowerCase();
}

export function ExplorerTable<Row extends { readonly id: string }>({
  ariaLabel,
  className,
  canExport = true,
  loading = false,
  manualSearch = false,
  manualSorting = false,
  sortState,
  onSortStateChange,
  searchQuery,
  onSearchQueryChange,
  collapsedRowCount = 5,
  columnPickerLabel = 'Kolumny',
  columns,
  emptyMessage = 'Brak wyników dla wybranych filtrów.',
  emptyTitle = 'Brak danych',
  exportFilenameBase,
  exportLabel = 'Eksportuj',
  filters = null,
  filterState = [],
  onClearFilters,
  onExport,
  exportFormats = ['csv','pdf'],
  exportPending = false,
  onRemoveFilter,
  onRowAction,
  onRowClick,
  pageSize = 10,
  rowActions,
  rows,
  searchFields,
  searchText,
  searchLabel = 'Szukaj',
  searchPlaceholder = 'Szukaj...',
}: ExplorerTableProps<Row>) {
  const columnPickerAnchorId = useId();
  const exportAnchorId = useId();

  const [localQuery, setQuery] = useState('');
  const query = searchQuery ?? localQuery;
  const [hiddenColumnIds, setHiddenColumnIds] = useState<ReadonlySet<string>>(() => (
    new Set(columns.filter((column) => column.defaultVisible === false).map((column) => column.id))
  ));
  const [localSort, setSort] = useState<ExplorerTableSort | null>(null);
  const sort = sortState === undefined ? localSort : sortState;
  const [expanded, setExpanded] = useState(false);
  const [page, setPage] = useState(1);
  const [columnPickerOpen, setColumnPickerOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [activeExportItemId, setActiveExportItemId] = useState<string | null>(null);

  const searchedRows = useMemo(() => {
    if (manualSearch || query.trim() === '') {
      return rows;
    }

    const needle = query.trim().toLowerCase();

    if (searchText) {
      return rows.filter((row) => normalize(searchText(row)).includes(needle));
    }

    if (!searchFields || searchFields.length === 0) {
      return rows;
    }

    return rows.filter((row) => (
      searchFields.some((field) => normalize(row[field]).includes(needle))
    ));
  }, [
    manualSearch,
    query,
    rows,
    searchFields,
    searchText,
  ]);

  const sortedRows = useMemo(() => {
    if (manualSorting || !sort) {
      return searchedRows;
    }

    const column = columns.find((candidate) => candidate.id === sort.columnId);

    if (!column?.sortAccessor) {
      return searchedRows;
    }

    const { sortAccessor } = column;
    const direction = sort.direction === 'asc' ? 1 : -1;

    return [...searchedRows].sort((left, right) => {
      const leftValue = sortAccessor(left);
      const rightValue = sortAccessor(right);

      // Missing values are sorted last, in either direction.
      if(leftValue === null && rightValue === null)return 0;
      if(leftValue === null)return 1;
      if(rightValue === null)return -1;
      if (leftValue < rightValue) return -1 * direction;
      if (leftValue > rightValue) return 1 * direction;
      return 0;
    });
  }, [
    manualSorting,
    columns,
    searchedRows,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const isCollapsible = !expanded && sortedRows.length > collapsedRowCount;
  const visibleRows = isCollapsible
    ? sortedRows.slice(0, collapsedRowCount)
    : sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const showPagination = expanded && sortedRows.length > pageSize;
  const showExpandedFooter = expanded && sortedRows.length > collapsedRowCount;

  const rowsById = useMemo(() => (
    new Map(rows.map((row) => [String(row.id), row]))
  ), [rows]);

  const visibleColumns = columns.filter((column) => (
    column.required || !hiddenColumnIds.has(column.id)
  ));

  function getExportRows() {
    return sortedRows.map((row) => visibleColumns.map((column) => (
      column.csvValue
        ? column.csvValue(row)
        : String((row as Record<string, unknown>)[column.id] ?? '—')
    )));
  }

  function handleExport(format: ExplorerTableExportFormat) {
    if (!canExport || exportPending || !exportFormats.includes(format)) return;
    if (onExport) {
      onExport(format,{columns:visibleColumns.map(column=>column.id),search:query,sort});
      return;
    }

    const headers = visibleColumns.map((column) => column.label);
    const exportRows = getExportRows();
    const filenameBase = exportFilenameBase ?? slugifyFilename(ariaLabel);

    if (format === 'csv') {
      downloadCsv(`${filenameBase}.csv`, headers, exportRows);
      return;
    }

    const pdfOpened = printTableAsPdf({
      headers,
      rows: exportRows,
      title: ariaLabel,
    });

    if (!pdfOpened && typeof window !== 'undefined') {
      window.alert('Nie udało się otworzyć podglądu PDF. Zezwól na wyskakujące okna dla PapaData i spróbuj ponownie.');
    }
  }

  const dataColumns = visibleColumns.map((column) => ({
    align: column.align,
    id: column.id,
    label: column.label,
    sortable: Boolean(column.sortAccessor),
    width: column.width,
  }));

  const cellRenderers = Object.fromEntries(
    visibleColumns.map((column) => [
      column.id,
      (dataRow: DataRow) => {
        const originalRow = rowsById.get(String(dataRow.id));
        if (!originalRow) return null;
        return column.render
          ? column.render(originalRow)
          : String((originalRow as Record<string, unknown>)[column.id] ?? '—');
      },
    ]),
  );

  const dataRows: readonly DataRow[] = visibleRows.map((row) => ({ id: String(row.id) }));

  const optionalColumns = columns.filter((column) => !column.required);

  return (
    <div className={['pd-explorer-table', className].filter(Boolean).join(' ')}>
      <FilterBar
        activeCount={filterState.filter((filter) => filter.value !== null).length}
        actions={(
          <>
            {optionalColumns.length > 0 ? (
              <Popover
                anchorId={columnPickerAnchorId}
                modal={false}
                onOpenChange={setColumnPickerOpen}
                open={columnPickerOpen}
                placement="bottom-end"
                trigger={(
                  <IconButton
                    className="pd-explorer-table__column-picker-trigger"
                    icon="menu"
                    label={columnPickerLabel}
                    size="small"
                    variant="ghost"
                  />
                )}
              >
                <ColumnPicker
                  columns={columns.map((column) => ({
                    id: column.id,
                    label: column.label,
                    required: column.required ?? false,
                    visible: column.required || !hiddenColumnIds.has(column.id),
                  }))}
                  label="Widoczne kolumny"
                  maxVisible={null}
                  onColumnVisibilityChange={(columnId, visible) => {
                    setHiddenColumnIds((current) => {
                      const next = new Set(current);
                      if (visible) {
                        next.delete(columnId);
                      } else {
                        next.add(columnId);
                      }
                      return next;
                    });
                  }}
                />
              </Popover>
            ) : null}

            {canExport && <Menu
              activeItemId={activeExportItemId}
              items={exportMenuItems.filter(item => exportFormats.includes(item.id as ExplorerTableExportFormat))}
              onAction={(itemId) => {
                if (itemId === 'csv' || itemId === 'pdf') {
                  handleExport(itemId);
                }
                setExportMenuOpen(false);
              }}
              onActiveItemIdChange={setActiveExportItemId}
              onOpenChange={setExportMenuOpen}
              open={exportMenuOpen}
              placement="bottom-end"
              trigger={(
                <IconButton
                  className="pd-explorer-table__export-trigger"
                  icon="data"
                  id={exportAnchorId}
                  label={exportLabel}
                  disabled={exportPending || loading}
                  size="small"
                  title="Eksportuj"
                  variant="ghost"
                />
              )}
            />}
          </>
        )}
        availableFilters={filters ? (
          <div className="pd-explorer-table__filter-control">
            {filters}
          </div>
        ) : null}
        collapsible={false}
        filters={filterState}
        onClearFilters={onClearFilters}
        onRemoveFilter={onRemoveFilter}
        resultCount={sortedRows.length}
        search={(searchText || searchFields) ? (
          <SearchField
            debounceMs={0}
            label={searchLabel}
            loading={loading}
            hideLabel
            onQueryChange={(value) => {
              setQuery(value);
              onSearchQueryChange?.(value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            query={query}
            resultCount={null}
            size="compact"
          />
        ) : null}
      />

      <DataTable
        actionsMenuItems={rowActions ? (dataRow) => {
          const originalRow = rowsById.get(String(dataRow.id));
          return originalRow ? rowActions(originalRow) : [];
        } : undefined}
        ariaLabel={ariaLabel}
        cellRenderers={cellRenderers}
        className="pd-explorer-table__data-table"
        columns={dataColumns}
        emptyMessage={emptyMessage}
        emptyTitle={emptyTitle}
        hideSummary
        loading={loading}
        rowCount={sortedRows.length}
        rows={dataRows}
        selectedRowIds={[]}
        sort={sort}
        onAction={onRowAction}
        onRowClick={onRowClick ? (dataRow) => {
          const originalRow = rowsById.get(String(dataRow.id));
          if (originalRow) onRowClick(originalRow);
        } : undefined}
        onSortChange={(columnId) => {
          const next: ExplorerTableSort = { columnId, direction: sort?.columnId === columnId && sort.direction === 'asc' ? 'desc' : 'asc' };
          setSort(next);
          onSortStateChange?.(next);
          setPage(1);
        }}
      />


      {isCollapsible ? (
        <div className="pd-explorer-table__footer">
          <TextAction
            onClick={() => setExpanded(true)}
            size="small"
            tone="muted"
          >
            {`Pokaż wszystkie (${sortedRows.length})`}
          </TextAction>
        </div>
      ) : null}

      {showExpandedFooter ? (
        <div className="pd-explorer-table__footer">
          {showPagination ? (
            <span className="pd-explorer-table__page-summary">
              {`Strona ${currentPage} z ${totalPages}`}
            </span>
          ) : <span />}
          <div className="pd-explorer-table__page-controls">
            {showPagination ? (
              <>
                <TextAction
                  disabled={currentPage <= 1}
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  size="small"
                  tone="muted"
                >
                  Poprzednia
                </TextAction>
                <TextAction
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                  size="small"
                  tone="muted"
                >
                  Następna
                </TextAction>
              </>
            ) : null}
            {expanded && sortedRows.length > collapsedRowCount ? (
              <TextAction
                onClick={() => {
                  setExpanded(false);
                  setPage(1);
                }}
                size="small"
                tone="muted"
              >
                Ukryj
              </TextAction>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
