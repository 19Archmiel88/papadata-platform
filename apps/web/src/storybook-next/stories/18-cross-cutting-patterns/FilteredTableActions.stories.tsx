import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useMemo,
  useState,
} from 'react';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  DataTable,
  FilterBar,
  SearchField,
  Select,
  SortControl,
  StatusBadge,
  TextAction,
} from '../../../design-system/components';
import type {
  SortControlDirection,
} from '../../../design-system/components';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './cross-cutting-patterns.css';

const rowAction = fn();
const bulkExportAction = fn();

type StatusFilter =
  | 'all'
  | 'ready'
  | 'delayed'
  | 'action';

type SortId =
  | 'source'
  | 'updatedAt'
  | 'readiness';

const columns: readonly DataColumn[] = [
  {
    id: 'source',
    label: 'Źródło',
    sortable: true,
    width: 240,
  },
  {
    id: 'owner',
    label: 'Właściciel',
    width: 200,
  },
  {
    id: 'readiness',
    label: 'Gotowość',
    sortable: true,
    width: 190,
  },
  {
    id: 'updatedAt',
    label: 'Ostatnia aktualizacja',
    sortable: true,
    width: 190,
  },
];

const rows: readonly DataRow[] = [
  {
    id: 'ga4-web',
    owner: 'Zespół analityki',
    readiness: 'Gotowe',
    source: 'GA4 web',
    statusId: 'ready',
    updatedAt: '10:20',
  },
  {
    id: 'meta-ads',
    owner: 'Zespół wzrostu',
    readiness: 'Gotowe',
    source: 'Meta Ads',
    statusId: 'ready',
    updatedAt: '10:11',
  },
  {
    id: 'tiktok-ads',
    owner: 'Zespół efektywności',
    readiness: 'Opóźnione',
    source: 'TikTok Ads',
    statusId: 'delayed',
    updatedAt: '09:42',
  },
  {
    id: 'billing',
    owner: 'Finanse',
    readiness: 'Wymaga działania',
    source: 'Łącznik rozliczeń',
    statusId: 'action',
    updatedAt: '08:58',
  },
  {
    id: 'organic-search',
    owner: 'Zespół treści',
    readiness: 'Gotowe',
    source: 'Ruch organiczny',
    statusId: 'ready',
    updatedAt: '08:30',
  },
];

const statusLabels: Record<StatusFilter, string> = {
  action: 'Wymaga działania',
  all: 'Wszystkie',
  delayed: 'Opóźnione',
  ready: 'Gotowe',
};

const sortLabels: Record<SortId, string> = {
  readiness: 'Gotowość',
  source: 'Źródło',
  updatedAt: 'Aktualizacja',
};

const sortDirectionLabels: Record<SortControlDirection, string> = {
  asc: 'rosnąco',
  desc: 'malejąco',
};

function formatResultCount(count: number) {
  if (count === 1) {
    return '1 wynik';
  }

  if (
    count > 1
    && count < 5
  ) {
    return `${count} wyniki`;
  }

  return `${count} wyników`;
}

function formatSelectedCount(count: number) {
  if (count === 1) {
    return '1 zaznaczenie';
  }

  if (
    count > 1
    && count < 5
  ) {
    return `${count} zaznaczenia`;
  }

  return `${count} zaznaczeń`;
}

function formatActiveFilterCount(count: number) {
  if (count === 0) {
    return 'Brak aktywnych';
  }

  if (count === 1) {
    return '1 aktywny';
  }

  return `${count} aktywne`;
}

function resolveStatusFilterTone(statusFilter: StatusFilter) {
  switch (statusFilter) {
    case 'action':
      return 'critical';
    case 'delayed':
      return 'warning';
    case 'ready':
      return 'success';
    case 'all':
    default:
      return 'neutral';
  }
}

function sortRows(
  inputRows: readonly DataRow[],
  sortId: SortId,
  direction: SortControlDirection,
) {
  const sorted = [...inputRows].sort((left, right) => {
    const leftValue = String(left[sortId] ?? '');
    const rightValue = String(right[sortId] ?? '');

    return leftValue.localeCompare(
      rightValue,
      'pl',
      {
        numeric: true,
      },
    );
  });

  return direction === 'asc'
    ? sorted
    : sorted.reverse();
}

function FilteredTablePattern() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');
  const [sortId, setSortId] =
    useState<SortId>('updatedAt');
  const [sortDirection, setSortDirection] =
    useState<SortControlDirection>('desc');
  const [selectedRowIds, setSelectedRowIds] =
    useState<readonly string[]>([
      'ga4-web',
    ]);
  const [actionMessage, setActionMessage] =
    useState('Wybierz akcję wiersza albo eksport zaznaczenia.');

  const filteredRows = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase('pl');

    return sortRows(
      rows.filter((row) => {
        const matchesQuery =
          normalizedQuery.length === 0
          || String(row.source)
            .toLocaleLowerCase('pl')
            .includes(normalizedQuery)
          || String(row.owner)
            .toLocaleLowerCase('pl')
            .includes(normalizedQuery);
        const matchesStatus =
          statusFilter === 'all'
          || row.statusId === statusFilter;

        return matchesQuery && matchesStatus;
      }),
      sortId,
      sortDirection,
    );
  }, [
    query,
    sortDirection,
    sortId,
    statusFilter,
  ]);

  const activeFilters = [
    {
      id: 'query',
      label: 'Wyszukiwanie',
      removable: true,
      tone: 'accent' as const,
      type: 'search' as const,
      value: query.trim() ? query.trim() : null,
    },
    {
      id: 'status',
      label: 'Status',
      removable: true,
      tone: 'neutral' as const,
      type: 'select' as const,
      value:
        statusFilter === 'all'
          ? null
          : statusLabels[statusFilter],
    },
  ];
  const activeFilterCount = activeFilters.filter(
    (item) => item.value !== null,
  ).length;
  const resultCountLabel = formatResultCount(filteredRows.length);
  const selectedCountLabel = formatSelectedCount(selectedRowIds.length);
  const totalCountLabel = formatResultCount(rows.length);

  return (
    <div className="pd-x18-table-shell">
      <section
        aria-labelledby="pd-x18-table-title"
        className="pd-x18-table-hero"
      >
        <div className="pd-x18-table-hero__copy">
          <p className="pd-x18-region__eyebrow">
            18.04 / DataTable
          </p>
          <h3
            className="pd-x18-table-hero__title"
            id="pd-x18-table-title"
          >
            Operacyjna tabela źródeł danych
          </h3>
          <p className="pd-x18-table-hero__text">
            Wzorzec pokazuje wyszukiwanie, filtr statusu, sortowanie i akcje
            wiersza bez udawania selekcji polami wyboru.
          </p>
        </div>

        <dl className="pd-x18-table-metrics">
          <div>
            <dt>Wyniki</dt>
            <dd>
              {resultCountLabel} z {totalCountLabel}
            </dd>
          </div>
          <div>
            <dt>Filtry</dt>
            <dd>{formatActiveFilterCount(activeFilterCount)}</dd>
          </div>
          <div>
            <dt>Zaznaczenie</dt>
            <dd>{selectedCountLabel}</dd>
          </div>
        </dl>
      </section>

      <section
        aria-label="Sterowanie widokiem tabeli"
        className="pd-x18-table-controls"
      >
        <div className="pd-x18-table-controls__header">
          <div className="pd-x18-table-section-copy">
            <h3 className="pd-x18-table-section-title">
              Sterowanie widokiem
            </h3>
            <p className="pd-x18-table-section-text">
              Filtry i sortowanie zmieniają stan story, a licznik zaznaczenia
              należy do widoku.
            </p>
          </div>
          <StatusBadge
            status="Status filtra"
            text={statusLabels[statusFilter]}
            tone={resolveStatusFilterTone(statusFilter)}
          />
        </div>

        <FilterBar
          actions={(
            <div className="pd-x18-table-action-set">
              <div className="pd-x18-table-selection">
                <StatusBadge
                  status="Zaznaczenie kontrolowane przez widok"
                  text={selectedCountLabel}
                  tone="info"
                />
                <span>
                  zaznaczenie nie pochodzi z pól wyboru tabeli
                </span>
              </div>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  bulkExportAction();
                  setActionMessage(
                    `Eksport obejmuje ${selectedCountLabel} kontrolowane przez widok.`,
                  );
                }}
              >
                Eksportuj zaznaczenie
              </Button>
            </div>
          )}
          activeCount={activeFilterCount}
          availableFilters={(
            <div className="pd-x18-select-wrap">
              <Select
                label="Status gotowości"
                options={[
                  { label: 'Wszystkie', value: 'all' },
                  { label: 'Gotowe', value: 'ready' },
                  { label: 'Opóźnione', value: 'delayed' },
                  { label: 'Wymaga działania', value: 'action' },
                ]}
                placeholder="Wybierz status"
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.currentTarget.value as StatusFilter,
                  );
                }}
              />
            </div>
          )}
          className="pd-x18-filter-bar"
          clearFiltersLabel="Wyczyść filtry"
          collapsible={false}
          compact
          emptyLabel="Brak aktywnych filtrów."
          filters={activeFilters}
          resultCount={filteredRows.length}
          search={(
            <SearchField
              className="pd-x18-table-search"
              debounceMs={0}
              hideLabel={false}
              label="Szukaj źródeł"
              loading={false}
              placeholder="Szukaj po źródle lub właścicielu"
              query={query}
              resultCount={filteredRows.length}
              onClear={() => {
                setQuery('');
              }}
              onQueryChange={setQuery}
            />
          )}
          sort={(
            <SortControl
              direction={sortDirection}
              label="Sortuj"
              options={[
                { id: 'updatedAt', label: sortLabels.updatedAt },
                { id: 'source', label: sortLabels.source },
                { id: 'readiness', label: sortLabels.readiness },
              ]}
              selectedId={sortId}
              onDirectionChange={setSortDirection}
              onSelectedIdChange={(nextId) => {
                setSortId(nextId as SortId);
              }}
            />
          )}
          onClearFilters={() => {
            setQuery('');
            setStatusFilter('all');
          }}
          onRemoveFilter={(filterId) => {
            if (filterId === 'query') {
              setQuery('');
            }

            if (filterId === 'status') {
              setStatusFilter('all');
            }
          }}
        />
      </section>

      <section
        aria-label="Wyniki źródeł danych"
        className="pd-x18-table-results"
      >
        <div className="pd-x18-table-results__header">
          <div className="pd-x18-table-section-copy">
            <h3 className="pd-x18-table-section-title">
              Wyniki po filtrach
            </h3>
            <p className="pd-x18-table-section-text">
              {resultCountLabel} w bieżącym widoku. Sortowanie:
              {' '}
              {sortLabels[sortId]},
              {' '}
              {sortDirectionLabels[sortDirection]}.
            </p>
          </div>
          <StatusBadge
            status="Liczba wyników"
            text={resultCountLabel}
            tone={
              filteredRows.length === 0
                ? 'warning'
                : 'success'
            }
          />
        </div>

        <DataTable
          actionsLabel="Akcje"
          actionsMenuItems={(row) => [
            {
              id: 'details',
              label: 'Pokaż szczegóły',
            },
            {
              id: 'retry',
              label: 'Ponów synchronizację',
            },
          ]}
          ariaLabel="Tabela źródeł danych z filtrami i akcjami"
          className="pd-x18-table-data"
          columns={columns}
          density="comfortable"
          emptyMessage="Zmień filtry albo dodaj źródło danych."
          loading={false}
          noResults={filteredRows.length === 0}
          noResultsMessage="Filtry nie zwróciły żadnych źródeł danych."
          pagination={{
            cursor: 'page-1',
            loading: false,
            nextCursor: null,
            previousCursor: null,
            summary: `${resultCountLabel} z ${totalCountLabel}`,
          }}
          rowCount={filteredRows.length}
          rows={filteredRows}
          selectedRowIds={selectedRowIds}
          sort={{
            columnId: sortId,
            direction: sortDirection,
          }}
          statusColumn={{
            columnId: 'readiness',
            label: 'Status gotowości',
            mapTone: {
              Gotowe: 'success',
              Opóźnione: 'warning',
              'Wymaga działania': 'danger',
            },
          }}
          summary="Tabela pokazuje filtrowanie, sortowanie, akcje wiersza i licznik zaznaczenia kontrolowany przez widok."
          onAction={(rowId, actionId) => {
            rowAction(rowId, actionId);
            setSelectedRowIds([
              rowId,
            ]);
            setActionMessage(
              actionId === 'details'
                ? `Pokaż szczegóły źródła ${rowId}.`
                : `Ponów synchronizację źródła ${rowId}.`,
            );
          }}
          onSortChange={(columnId) => {
            setSortId(columnId as SortId);
            setSortDirection((current) => (
              current === 'asc'
                ? 'desc'
                : 'asc'
            ));
          }}
        />
      </section>

      <div
        aria-live="polite"
        className="pd-x18-table-message"
      >
        <span>{actionMessage}</span>
        <TextAction
          tone="muted"
          onClick={() => {
            setQuery('');
            setStatusFilter('all');
            setSortId('updatedAt');
            setSortDirection('desc');
            setSelectedRowIds([
              'ga4-web',
            ]);
            setActionMessage('Tabela wróciła do stanu początkowego.');
          }}
        >
          Przywróć widok początkowy
        </TextAction>
      </div>
    </div>
  );
}

const meta = {
  title: '18 Wzorce interfejsu/Tabela z filtrami i akcjami',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const FilteredTableActionsStory: Story = {
  name: 'Tabela z filtrami i akcjami',
  render: () => (
    <StoryPresentationPage
      className="pd-x18-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Parametry wzorca tabeli"
          items={[
            { label: 'Kontrakt', value: '18.04' },
            { label: 'Powierzchnia', value: 'DataTable' },
            { label: 'Status', value: 'review' },
          ]}
        />
      )}
      sectionCode="18"
      sectionLabel="Wzorce interfejsu"
      storyId="18.04"
      summary="Tabela z filtrami i akcjami używa kanonicznego DataTable oraz istniejących komponentów sterowania. Nie tworzy lokalnego grida ani fałszywej selekcji wierszy."
      title="Tabela z filtrami i akcjami"
    >
      <StoryPresentationSection
        index="01"
        summary="Wyszukiwanie, filtr, sortowanie, akcja wiersza, dane częściowe i puste wyniki są realnym stanem story."
        title="Praca na danych bez lokalnego silnika tabeli"
      >
        <FilteredTablePattern />
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', {
        name: 'Tabela z filtrami i akcjami',
      }),
    ).toBeInTheDocument();

    const search = canvas.getByRole('searchbox', {
      name: 'Szukaj źródeł',
    });

    await userEvent.type(search, 'a');
    await expect(
      await canvas.findByRole('button', {
        name: 'Usuń filtr: Wyszukiwanie a',
      }),
    ).toBeInTheDocument();

    await userEvent.type(search, 'd');
    await expect(
      await canvas.findByRole('button', {
        name: 'Usuń filtr: Wyszukiwanie ad',
      }),
    ).toBeInTheDocument();

    await userEvent.type(search, 's');

    await expect(
      await canvas.findByRole('button', {
        name: 'Usuń filtr: Wyszukiwanie ads',
      }),
    ).toBeInTheDocument();

    const statusFilter = canvas.getByRole('combobox', {
      name: 'Status gotowości',
    });

    await userEvent.click(statusFilter);
    await userEvent.click(
      canvas.getByRole('option', {
        name: 'Opóźnione',
      }),
    );

    await expect(
      await canvas.findByText('TikTok Ads'),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: /Zmień kierunek sortowania/,
      }),
    );

    await expect(
      canvas.getByText(/lokalne sterowanie kolejnością/),
    ).toBeInTheDocument();

    const actionTrigger = canvas.getByRole('button', {
      name: /Akcje dla wiersza tiktok-ads/,
    });

    await userEvent.click(actionTrigger);
    await userEvent.click(
      canvas.getByRole('menuitem', {
        name: 'Pokaż szczegóły',
      }),
    );

    await expect(
      canvas.getByText('Pokaż szczegóły źródła tiktok-ads.'),
    ).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Eksportuj zaznaczenie',
      }),
    );

    await expect(
      canvas.getByText(
        'Eksport obejmuje 1 zaznaczenie kontrolowane przez widok.',
      ),
    ).toBeInTheDocument();
  },
};
