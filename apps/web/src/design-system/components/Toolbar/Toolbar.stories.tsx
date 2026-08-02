import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  useState,
} from 'react';

import {
  Button,
} from '../Button';
import '../Filters/filters-showcase.css';
import {
  FilterChip,
} from '../FilterChip';
import {
  searchPlaceholder,
  sortOptions,
  viewSegments,
} from '../Filters/storyData';
import {
  SearchField,
} from '../SearchField';
import {
  SegmentedControl,
} from '../SegmentedControl';
import {
  SortControl,
} from '../SortControl';
import {
  Toolbar,
} from './Toolbar';

const meta = {
  title: '10 Komponenty/Toolbar',
  component: Toolbar,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta<typeof Toolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

const longToolbarSegments = [
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
] as const;

const longToolbarSortOptions = [
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

function ToolbarWithSearch({
  compact = false,
  scopeLabel = 'Podstawowy toolbar',
}: {
  readonly compact?: boolean;
  readonly scopeLabel?: string;
}) {
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState('all');
  const [selectedSort, setSelectedSort] = useState('updatedAt');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  return (
    <section
      aria-label={scopeLabel}
      className="pd-tools-story__surface"
    >
      <Toolbar
        compact={compact}
        description="Pasek narzędzi grupuje lokalne akcje, filtrowanie i zmianę widoku dla jednej sekcji danych."
        start={(
          <>
            <SearchField
              debounceMs={120}
              hideLabel
              label="Wyszukiwanie lokalne"
              loading={false}
              placeholder={searchPlaceholder}
              query={query}
              resultCount={7}
              size={compact ? 'compact' : 'default'}
              style={{ maxWidth: '30rem' }}
              onQueryChange={setQuery}
            />
            <SegmentedControl
              ariaLabel="Przełącznik widoku"
              items={viewSegments}
              size={compact ? 'compact' : 'default'}
              value={segment}
              onValueChange={setSegment}
            />
          </>
        )}
        end={(
          <>
            <SortControl
              direction={direction}
              options={sortOptions}
              selectedId={selectedSort}
              size={compact ? 'compact' : 'default'}
              onDirectionChange={setDirection}
              onSelectedIdChange={setSelectedSort}
            />
            <Button size={compact ? 'small' : 'medium'} variant="secondary">
              Dodaj filtr
            </Button>
            <Button size={compact ? 'small' : 'medium'}>
              Odśwież dane
            </Button>
          </>
        )}
        title="Źródła danych i synchronizacje"
      />
    </section>
  );
}

function ToolbarLongCopyPreview() {
  const [query, setQuery] = useState('reconciliation');
  const [segment, setSegment] = useState('processing');
  const [selectedSort, setSelectedSort] = useState('updatedAt');
  const [direction, setDirection] = useState<'asc' | 'desc'>('desc');

  return (
    <section
      aria-label="Toolbar z długim copy"
      className="pd-tools-story__surface"
    >
      <Toolbar
        description="Cross-workspace review queue for escalations, reconciliation exceptions and manually verified integration checkpoints."
        end={(
          <>
            <SortControl
              ariaLabel="Reconciliation sort order"
              direction={direction}
              label="Sort order"
              options={longToolbarSortOptions}
              selectedId={selectedSort}
              onDirectionChange={setDirection}
              onSelectedIdChange={setSelectedSort}
            />
            <Button variant="secondary">
              Add follow-up rule
            </Button>
            <Button>
              Refresh reconciliation queue
            </Button>
          </>
        )}
        start={(
          <>
            <SearchField
              debounceMs={120}
              hideLabel
              helperText="Search by escalation owner, partner system alias or reconciliation checkpoint identifier."
              label="Cross-workspace search input"
              loading={false}
              placeholder="Search by escalation owner, partner system alias or reconciliation checkpoint identifier"
              query={query}
              resultCount={3}
              style={{ maxWidth: '30rem' }}
              onQueryChange={setQuery}
            />
            <SegmentedControl
              ariaLabel="Review segment"
              items={longToolbarSegments}
              value={segment}
              onValueChange={setSegment}
            />
          </>
        )}
        title="Revenue recovery, reconciliation and exception handling"
      />
    </section>
  );
}

export const ToolbarStory: Story = {
  args: {},
  name: 'Pasek narzędzi',
  render: () => (
    <main className="pd-tools-story">
      <div className="pd-tools-story__inner">
        <header className="pd-tools-story__header">
          <p className="pd-tools-story__kicker">10 Komponenty/Toolbar</p>
          <h1>Toolbar ma porządkować lokalne akcje, nie udawać topbara aplikacji.</h1>
          <p className="pd-tools-story__lead">
            Narzędzie jest osadzone w sekcji danych. Grupuje wyszukiwanie, przełączanie widoku
            i akcje operacyjne bez budowania AppShella ani globalnej nawigacji.
          </p>
        </header>

        <section className="pd-tools-story__section">
          <h2>Warianty</h2>
          <div className="pd-tools-story__rows">
            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant podstawowy</h3>
                <p>Tytuł sekcji, wyszukiwarka, segmenty widoku i lokalne akcje po prawej stronie.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <ToolbarWithSearch scopeLabel="Podstawowy toolbar" />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Wariant kompaktowy</h3>
                <p>Gęstszy rytm dla węższych sekcji i pomocniczych tabel operacyjnych.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <ToolbarWithSearch
                  compact
                  scopeLabel="Kompaktowy toolbar"
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Lokalne filtry i akcja główna</h3>
                <p>Aktywne warunki mogą pojawić się obok akcji bez zamykania ich w osobnej karcie.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <Toolbar
                  description="Zakres dotyczy tylko listy źródeł z ostatnich 7 dni."
                  end={(
                    <>
                      <Button variant="ghost">Wyczyść zaznaczenie</Button>
                      <Button>Eksport do przeglądu</Button>
                    </>
                  )}
                  start={(
                    <div className="pd-filter-cluster">
                      <FilterChip label="Status" removable value="Wymaga uwagi" />
                      <FilterChip label="Źródło" removable value="Commerce" />
                      <FilterChip label="Zakres dat" value="Ostatnie 7 dni" />
                    </div>
                  )}
                  title="Przegląd lokalnych akcji"
                />
              </div>
            </div>

            <div className="pd-tools-story__row">
              <div className="pd-tools-story__label">
                <h3>Długie copy i angielski</h3>
                <p>Wariant stresuje najdłuższe etykiety wyszukiwania, segmentów, sortowania i akcji w jednym toolbarze.</p>
              </div>
              <div className="pd-tools-story__canvas">
                <ToolbarLongCopyPreview />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  ),
};
