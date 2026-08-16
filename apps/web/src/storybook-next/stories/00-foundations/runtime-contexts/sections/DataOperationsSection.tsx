import { useState } from 'react';

import { StoryPresentationSection } from '../../../../presentation/StoryPresentation';
import {
  BulkActionBar,
  ColumnPicker,
  DataList,
  DataStatusBanner,
  DataTable,
  Pagination,
  PaginationNav,
  TextAction,
} from '../../../../../design-system/components';
import { RuntimeSequence } from '../RuntimeSequence';
import { dataSources, tableColumns, tableRows, workspaceContext } from '../runtime-context-data';
import type { PushEvidence } from '../runtime-context-types';

export function DataOperationsSection({
  pushEvidence,
}: {
  readonly pushEvidence: PushEvidence;
}) {
  const [page, setPage] = useState(2);
  const [selectedRows, setSelectedRows] = useState<readonly string[]>(['shopify']);
  const [columns, setColumns] = useState([
    { id: 'source', label: 'Źródło', required: true, visible: true },
    { id: 'orders', label: 'Zamówienia', required: false, visible: true },
    { id: 'status', label: 'Status', required: false, visible: true },
  ]);
  const selectedCount = selectedRows.length;
  const allVisibleSelected = selectedCount === tableRows.length;
  const someVisibleSelected = selectedCount > 0 && !allVisibleSelected;

  return (
    <StoryPresentationSection
            index="02"
            layout="full"
            summary="Dane, zaznaczenie, kolumny, paginacja i akcje zbiorcze pracują w jednym przepływie."
            title="Tabela, lista i operacje na danych"
          >
            <div className="pd-c83-flow">
              <RuntimeSequence
                evidenceLabel="DataTable, ColumnPicker, BulkActionBar, Pagination, PaginationNav, DataList i StatusBadge pracują na tym samym stanie."
                title="Tabela źródeł i akcje operacyjne"
              >
                <DataStatusBanner
                  blockingIssues={[{ id: 'late-meta', label: 'Meta Ads opóźnione', severity: 'warning' }]}
                  context={workspaceContext}
                  readiness="partial"
                  sources={dataSources}
                  onOpenIssue={(event) => pushEvidence(`DataStatusBanner otworzył problem: ${event.issueId}.`)}
                />
                <ColumnPicker
                  columns={columns}
                  description="Zmiana widoczności kolumn jest natychmiast widoczna w tabeli."
                  label="Widoczność kolumn"
                  maxVisible={3}
                  onColumnVisibilityChange={(columnId, visible) => {
                    setColumns((currentColumns) => currentColumns.map((column) => (
                      column.id === columnId
                        ? { ...column, visible }
                        : column
                    )));
                    pushEvidence(`ColumnPicker zmienił kolumnę ${columnId}.`);
                  }}
                />
                <BulkActionBar
                  availableActions={[
                    { destructive: false, id: 'export', label: 'Eksportuj' },
                    { destructive: true, id: 'archive', label: 'Archiwizuj' },
                  ]}
                  busyActionId={null}
                  selectedCount={selectedCount}
                  onAction={(actionId) => pushEvidence(`BulkActionBar wykonał akcję: ${actionId}.`)}
                  onClearSelection={() => {
                    setSelectedRows([]);
                    pushEvidence('BulkActionBar wyczyścił zaznaczenie.');
                  }}
                />
                <DataTable
                  actionsLabel="Akcje"
                  actionsMenuItems={() => [
                    { id: 'inspect', label: 'Otwórz szczegóły' },
                    { id: 'separator', kind: 'separator' },
                    { destructive: true, id: 'exclude', label: 'Wyklucz z raportu' },
                  ]}
                  actionsTriggerLabel="Akcje"
                  ariaLabel="Źródła sprzedaży"
                  columns={tableColumns.filter((column) => columns.find((candidate) => candidate.id === column.id)?.visible ?? true)}
                  density="comfortable"
                  emptyMessage="Brak źródeł dla aktywnych filtrów."
                  loading={false}
                  minWidth={720}
                  pagination={{
                    cursor: 'page-2',
                    loading: false,
                    nextCursor: 'page-3',
                    previousCursor: 'page-1',
                    summary: '26–50 z 128 wyników',
                    onNavigate: (direction) => pushEvidence(`PaginationNav w DataTable pobrał zakres: ${direction}.`),
                  }}
                  rowCount={tableRows.length}
                  rowHeaderColumnId="source"
                  rows={tableRows}
                  selectedRowIds={selectedRows}
                  selection={{
                    allVisibleSelected,
                    ariaLabel: 'Zaznacz źródła sprzedaży',
                    onToggleRow: (rowId) => {
                      setSelectedRows((currentRows) => currentRows.includes(rowId)
                        ? currentRows.filter((id) => id !== rowId)
                        : [...currentRows, rowId]);
                      pushEvidence(`DataTable zmienił zaznaczenie wiersza: ${rowId}.`);
                    },
                    onToggleVisible: () => {
                      setSelectedRows(allVisibleSelected ? [] : tableRows.map((row) => row.id));
                      pushEvidence('DataTable zmienił zaznaczenie wszystkich widocznych wierszy.');
                    },
                    someVisibleSelected,
                  }}
                  sort={{ columnId: 'orders', direction: 'desc' }}
                  statusColumn={{
                    columnId: 'status',
                    label: 'Status',
                    mapTone: {
                      opportunity: 'success',
                      risk: 'danger',
                      stable: 'neutral',
                    },
                  }}
                  summary="Tabela źródeł sprzedaży z sortowaniem, statusem, menu wiersza i paginacją kursorową."
                  onAction={(rowId, actionId) => pushEvidence(`DataTable wykonał ${actionId} dla ${rowId}.`)}
                  onSortChange={(columnId) => pushEvidence(`DataTable zmienił sortowanie kolumny: ${columnId}.`)}
                />
                <Pagination
                  page={page}
                  pageSize={25}
                  pageSizeOptions={[25, 50, 100]}
                  total={320}
                  onPageChange={(nextPage, reason) => {
                    setPage(nextPage);
                    pushEvidence(`Pagination zmienił stronę na ${nextPage}; powód: ${reason}.`);
                  }}
                />
                <PaginationNav
                  cursor="page-2"
                  loading={false}
                  nextCursor="page-3"
                  previousCursor="page-1"
                  summary="26–50 z 320 wyników"
                  onNavigate={(direction) => pushEvidence(`PaginationNav pobrał zakres: ${direction}.`)}
                />
                <DataList
                  items={[
                    {
                      action: <TextAction size="small" onClick={() => pushEvidence('DataList otworzył Shopify.')}>Otwórz</TextAction>,
                      description: 'Źródło wymaga ponowienia części synchronizacji.',
                      icon: 'integration',
                      id: 'shopify',
                      meta: ['48 zamówień', 'ostatnia synchronizacja 01:45'],
                      status: { status: 'Status', text: 'Ryzyko', tone: 'warning' },
                      title: 'Shopify',
                    },
                    {
                      description: 'Stabilny dopływ danych kampanii.',
                      icon: 'success',
                      id: 'meta',
                      meta: ['86 zamówień', 'kompletność 93%'],
                      status: { status: 'Status', text: 'Szansa', tone: 'success' },
                      title: 'Meta Ads',
                    },
                  ]}
                />
              </RuntimeSequence>
            </div>
          </StoryPresentationSection>
  );
}
