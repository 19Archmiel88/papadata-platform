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
  useState,
} from 'react';

import {
  Button,
} from '../Button';
import {
  DataTable,
} from '../DataTable';
import '../Filters/filters-showcase.css';
import {
  filterBarFilters,
  integrationColumns,
  integrationRows,
  integrationStatusTone,
  ownerFilterOptions,
  searchPlaceholder,
  sortOptions,
  statusFilterOptions,
  viewSegments,
} from '../Filters/storyData';
import {
  SearchField,
} from '../SearchField';
import {
  SegmentedControl,
} from '../SegmentedControl';
import {
  Select,
} from '../Select';
import {
  SortControl,
} from '../SortControl';
import {
  FilterBar,
} from './FilterBar';
import type {
  FilterBarFilter,
} from './FilterBar';

const longSearchPlaceholder =
  'Search by escalation owner, partner system alias or reconciliation checkpoint identifier';

const longViewSegments = [
  {
    value: 'all',
    label: 'All reconciliation queues currently visible',
    count: 24,
  },
  {
    value: 'processing',
    label: 'Requires operational follow-up in progress',
    count: 7,
    icon: 'trend',
  },
  {
    value: 'attention',
    label: 'Needs manual validation before publication',
    count: 4,
    icon: 'warning',
  },
  {
    value: 'stable',
    label: 'Stable and ready for downstream reporting',
    count: 13,
    icon: 'success',
  },
  {
    value: 'archived',
    label: 'Archived configurations',
    disabled: true,
  },
] as const;

const longSortOptions = [
  {
    id: 'updatedAt',
    label: 'Last synchronization checkpoint for cross-workspace reconciliation',
  },
  {
    id: 'source',
    label: 'Partner system alias and source display name',
  },
  {
    id: 'owner',
    label: 'Escalation owner responsible for operational follow-up',
  },
  {
    id: 'incidents',
    label: 'Number of unresolved exceptions requiring manual review',
  },
] as const;

const longStatusFilterOptions = [
  {
    value: 'all',
    label: 'All operational readiness states',
  },
  {
    value: 'stable',
    label: 'Stable and ready for reporting',
  },
  {
    value: 'processing',
    label: 'Processing and awaiting follow-up',
  },
  {
    value: 'attention',
    label: 'Requires manual validation',
  },
] as const;

const longOwnerFilterOptions = [
  {
    value: 'all',
    label: 'All escalation owners',
  },
  {
    value: 'operations',
    label: 'North Europe revenue operations',
  },
  {
    value: 'revenue',
    label: 'Revenue intelligence and forecasting',
  },
  {
    value: 'support',
    label: 'Partner onboarding and support',
  },
] as const;

const meta = {
  title: '10 Komponenty/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

function FilterBarPreview({
  copyVariant = 'default',
  compact = false,
  scopeLabel = 'Podstawowy pasek filtrów',
  theme,
}: {
  readonly copyVariant?: 'default' | 'long';
  readonly compact?: boolean;
  readonly scopeLabel?: string;
  readonly theme?: 'light' | 'dark';
}) {
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [status, setStatus] = useState('all');
  const [owner, setOwner] = useState('all');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const content = copyVariant === 'long'
    ? {
        actionLabel: 'Save comparison view',
        clearFiltersLabel: 'Clear all active filters',
        ownerFilterLabel: 'Escalation owner responsible for follow-up',
        ownerFilterOptions: longOwnerFilterOptions,
        periodFilterLabel: 'Reporting horizon',
        periodValue: 'Rolling 30-day reconciliation and exception review window',
        queryFilterLabel: 'Search query',
        searchHelperText:
          'Search across reconciliation checkpoints, escalation owners and workspace-specific integration identifiers without leaving the current section.',
        searchLabel: 'Cross-workspace search input',
        searchPlaceholder: longSearchPlaceholder,
        segments: longViewSegments,
        sortLabel: 'Sort order',
        sortOptions: longSortOptions,
        statusFilterLabel: 'Operational readiness state',
        statusFilterOptions: longStatusFilterOptions,
        summary:
          'Local reconciliation example with long English copy, still disconnected from routing, backend and URL persistence.',
      }
    : {
        actionLabel: 'Zapisz widok',
        clearFiltersLabel: 'Wyczyść filtry',
        ownerFilterLabel: 'Właściciel',
        ownerFilterOptions,
        periodFilterLabel: 'Zakres dat',
        periodValue: 'Ostatnie 7 dni',
        queryFilterLabel: 'Wyszukiwanie',
        searchHelperText:
          'Szukaj po nazwie źródła, właścicielu albo identyfikatorze procesu.',
        searchLabel: 'Wyszukiwanie lokalne',
        searchPlaceholder,
        segments: viewSegments,
        sortLabel: 'Sortuj',
        sortOptions,
        statusFilterLabel: 'Status',
        statusFilterOptions,
        summary:
          'Lokalny przykład filtrowania bez backendu i bez zapisu do URL.',
      };

  const activeFilters: FilterBarFilter[] = [
    {
      ...filterBarFilters[0],
      label: content.statusFilterLabel,
      value:
        status === 'all'
          ? null
          : content.statusFilterOptions.find((option) => option.value === status)?.label
            ?? null,
    },
    {
      ...filterBarFilters[1],
      label: content.ownerFilterLabel,
      value:
        owner === 'all'
          ? null
          : content.ownerFilterOptions.find((option) => option.value === owner)?.label
            ?? null,
    },
    {
      ...filterBarFilters[2],
      label: content.periodFilterLabel,
      removable: false,
      tone: 'neutral',
      value: content.periodValue,
    },
    {
      id: 'query',
      label: content.queryFilterLabel,
      removable: true,
      tone: 'accent',
      type: 'search',
      value: query.length > 0 ? query : null,
    },
  ];

  const filteredRows = integrationRows
    .filter((row) => {
      const rowQuery = query.trim().toLowerCase();

      if (rowQuery.length === 0) {
        return true;
      }

      return [
        row.id,
        String(row.source),
        String(row.owner),
      ].some((value) =>
        value.toLowerCase().includes(rowQuery),
      );
    })
    .filter((row) => {
      if (segment === 'all') {
        return true;
      }

      if (segment === 'processing') {
        return row.status === 'W toku';
      }

      if (segment === 'attention') {
        return row.status === 'Wymaga uwagi';
      }

      if (segment === 'stable') {
        return row.status === 'Stabilne';
      }

      return true;
    })
    .filter((row) => {
      if (status === 'all') {
        return true;
      }

      const expected = statusFilterOptions.find(
        (option) => option.value === status,
      )?.label;

      return row.status === expected;
    })
    .filter((row) => {
      if (owner === 'all') {
        return true;
      }

      const expected = ownerFilterOptions.find(
        (option) => option.value === owner,
      )?.label;

      return row.owner === expected;
    })
    .slice()
    .sort((left, right) => {
      const leftValue = String(left[sortField] ?? '');
      const rightValue = String(right[sortField] ?? '');
      const comparison = leftValue.localeCompare(
        rightValue,
        'pl',
      );

      return sortDirection === 'asc'
        ? comparison
        : comparison * -1;
    });

  return (
    <section
      aria-label={scopeLabel}
      className="pd-tools-story__surface"
      data-theme={theme}
    >
      <div className="pd-tools-story__stack">
        <FilterBar
          actions={(
            <Button size={compact ? 'small' : 'medium'} variant="secondary">
              {content.actionLabel}
            </Button>
          )}
          activeCount={activeFilters.filter((filter) => filter.value !== null).length}
          availableFilters={(
            <div className="pd-filter-cluster">
              <Select
                aria-label={content.statusFilterLabel}
                label={content.statusFilterLabel}
                options={content.statusFilterOptions}
                placeholder={content.statusFilterLabel}
                searchable
                value={status}
                onChange={(event) => {
                  setStatus(event.currentTarget.value || 'all');
                }}
              />
              <Select
                aria-label={content.ownerFilterLabel}
                label={content.ownerFilterLabel}
                options={content.ownerFilterOptions}
                placeholder={content.ownerFilterLabel}
                value={owner}
                onChange={(event) => {
                  setOwner(event.currentTarget.value || 'all');
                }}
              />
            </div>
          )}
          clearFiltersLabel={content.clearFiltersLabel}
          collapsible
          compact={compact}
          filters={activeFilters}
          resultCount={filteredRows.length}
          search={(
            <SearchField
              debounceMs={120}
              hideLabel
              helperText={content.searchHelperText}
              label={content.searchLabel}
              loading={false}
              placeholder={content.searchPlaceholder}
              query={query}
              resultCount={filteredRows.length}
              size={compact ? 'compact' : 'default'}
              style={{ maxWidth: '28rem' }}
              onQueryChange={setQuery}
            />
          )}
          segments={(
            <SegmentedControl
              ariaLabel="Segment widoku"
              items={content.segments}
              size={compact ? 'compact' : 'default'}
              value={segment}
              onValueChange={setSegment}
            />
          )}
          sort={(
            <SortControl
              direction={sortDirection}
              label={content.sortLabel}
              options={content.sortOptions}
              selectedId={sortField}
              size={compact ? 'compact' : 'default'}
              onDirectionChange={setSortDirection}
              onSelectedIdChange={setSortField}
            />
          )}
          onClearFilters={() => {
            setQuery('');
            setSegment('all');
            setStatus('all');
            setOwner('all');
          }}
          onRemoveFilter={(filterId) => {
            if (filterId === 'query') {
              setQuery('');
            }

            if (filterId === 'status') {
              setStatus('all');
            }

            if (filterId === 'owner') {
              setOwner('all');
            }
          }}
        />

        <DataTable
          actionsLabel="Akcje"
          ariaLabel="Tabela integracji"
          columns={integrationColumns}
          density={compact ? 'compact' : 'comfortable'}
          emptyMessage="Brak źródeł spełniających bieżące kryteria."
          emptyTitle="Brak wyników"
          loading={false}
          rowCount={filteredRows.length}
          rows={filteredRows}
          selectedRowIds={[]}
          sort={{
            columnId: sortField,
            direction: sortDirection,
          }}
          statusColumn={{
            columnId: 'status',
            label: 'Status',
            mapTone: integrationStatusTone,
          }}
          summary={content.summary}
          onSortChange={(columnId) => {
            setSortField(columnId);
            setSortDirection((current) =>
              sortField === columnId && current === 'asc'
                ? 'desc'
                : 'asc',
            );
          }}
        />
      </div>
    </section>
  );
}

export const FilterBarStory: Story = {
  args: {
    activeCount: 0,
    collapsible: true,
    filters: [],
  },
  name: 'Pasek filtrów',
  render: () => (
    <main className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/FilterBar</p>
          <h1>FilterBar porządkuje lokalne sterowanie danymi bez budowania query engine.</h1>
          <p className="pd-tools-story__lead">
            Komponent zbiera wyszukiwarkę, segmenty, selekty, sortowanie i aktywne filtry
            w jednej spokojnej warstwie roboczej, gotowej do użycia nad tabelą lub listą danych.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Warianty</h2>
          <div className="pd-tools-story__rows">
            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Pełny lokalny zestaw sterowania z przykładem użycia nad DataTable.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <FilterBarPreview scopeLabel="Podstawowy pasek filtrów" />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Gęstszy układ utrzymuje funkcje bez dokładania dodatkowych kart pokazowych.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <FilterBarPreview
                  compact
                  scopeLabel="Kompaktowy pasek filtrów"
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Długie copy i angielski</h3>
                <p>Wariant stresuje najdłuższe etykiety filtrów, segmentów, sortowania i wyszukiwania w jednym, lokalnym układzie.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <FilterBarPreview
                  copyVariant="long"
                  scopeLabel="Pasek filtrów z długim copy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="pd-tools-story__section">
          <h2>Tryb jasny i ciemny</h2>
          <div className="pd-tools-story__theme-grid">
            <div className="pd-tools-story__theme-column">
              <h3>Tryb jasny</h3>
              <p className="pd-tools-story__theme-copy">
                Pasek filtrów zachowuje neutralny canvas i precyzyjne separatory.
              </p>
              <FilterBarPreview
                scopeLabel="Jasny pasek filtrów"
                theme="light"
              />
            </div>

            <div className="pd-tools-story__theme-column">
              <h3>Tryb ciemny</h3>
              <p className="pd-tools-story__theme-copy">
                Komponent nie wpada w biały systemowy dropdown ani w efekt marketingowego dashboardu.
              </p>
              <FilterBarPreview
                scopeLabel="Ciemny pasek filtrów"
                theme="dark"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
  play: async ({
    canvasElement,
  }) => {
    const canvas = within(canvasElement);
    const region = canvas.getByRole('region', {
      name: 'Podstawowy pasek filtrów',
    });
    const scoped = within(region);
    const search = scoped.getByLabelText(
      'Wyszukiwanie lokalne',
    );

    await userEvent.type(search, 'erp');
    await new Promise((resolve) => {
      window.setTimeout(resolve, 180);
    });

    await expect(
      scoped.getByText('ERP magazyn centralny'),
    ).toBeInTheDocument();

    const removeQueryFilter = scoped.getByRole('button', {
      name: 'Usuń filtr: Wyszukiwanie erp',
    });

    await userEvent.click(removeQueryFilter);
    await new Promise((resolve) => {
      window.setTimeout(resolve, 180);
    });

    await expect(search).toHaveValue('');
  },
};

export const FilterBarSequenceStory: Story = {
  args: {
    activeCount: 0,
    collapsible: true,
    filters: [],
  },
  name: 'Sekwencja filtrów',
  render: () => (
    <main className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/FilterBar</p>
          <h1>Ścieżka klawiaturowa filtrów ma być lokalna, przewidywalna i w pełni odwracalna.</h1>
          <p className="pd-tools-story__lead">
            Ten wariant służy do sekwencyjnego testu wyszukiwania, dodania i usunięcia filtra,
            zmiany segmentu, sortowania oraz wyczyszczenia stanu bez użycia myszy.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Scenariusz testowy</h2>
          <FilterBarPreview scopeLabel="Sekwencyjny pasek filtrów" />
        </section>
      </div>
    </main>
  ),
};
