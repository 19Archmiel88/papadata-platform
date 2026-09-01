import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  within,
} from 'storybook/test';

import {
  FilterBar,
} from './FilterBar';
import {
  SearchField,
} from '../SearchField';
import {
  SortControl,
} from '../SortControl';

import {
  Localized,
  copy,
} from '../../../storybook-next/presentation/storyLocalization';
import '../../../storybook-next/presentation/story-presentation.css';
import { StoryPresentationMeta, StoryPresentationPage, StoryPresentationSection } from '../../../storybook-next/presentation/StoryPresentation';

const filters = [
  { id: 'source', label: 'Źródło', tone: 'accent' as const, type: 'select' as const, value: 'Google Ads' },
  { id: 'status', label: 'Status', tone: 'success' as const, type: 'select' as const, value: 'Gotowe' },
  { id: 'range', label: 'Zakres', removable: false, tone: 'neutral' as const, type: 'date' as const, value: 'Ostatnie 30 dni' },
];

const meta = {
  title: 'DESIGN SYSTEM/Komponenty/Formularze i wybór/FilterBar',
  component: FilterBar,
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
  args: {
    activeCount: filters.filter((f) => f.value !== null).length,
    collapsible: false,
    filters,
    onClearFilters: fn(),
    onRemoveFilter: fn(),
    resultCount: 248,
  },
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;


function StorySection({
  children,
  index,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly index: string;
  readonly summary?: ReactNode;
  readonly title: ReactNode;
}) {
  return (
    <StoryPresentationSection
      className="pd-filter-bar-section"
      index={index}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationSection>
  );
}

export const FilterBarStory: Story = {
  name: 'FilterBar',
  render: (args) => (
    <StoryPresentationPage
      className="pd-filter-bar-story"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel={copy({ pl: 'Parametry FilterBar', en: 'FilterBar parameters' })}
          items={[
            { label: <Localized pl="Sloty kompozycji" en="Composition slots" />, value: 'search / availableFilters / segments / sort / actions' },
          ]}
        />
      )}
      sectionCode="DS"
      sectionLabel={<Localized pl="Komponenty" en="Components" />}
      storyId="filter-bar"
      summary={
        <Localized
          pl="Powłoka układu, nie zestaw własnej logiki filtrowania — search/sort/akcje przekazujesz jako sloty złożone z kanonicznych komponentów (SearchField, SortControl). Aktywne filtry renderują się jako FilterChip."
          en="A layout shell, not its own filtering logic — search/sort/actions are passed as slots composed from canonical components (SearchField, SortControl). Active filters render as FilterChip."
        />
      }
      title={<Localized pl="Jeden rząd na całe filtrowanie tabeli." en="One row for a table's entire filtering." />}
    >
      <StorySection index="01" title={<Localized pl="Kontrolowany (pełna kompozycja)" en="Controlled (full composition)" />}>
        <div data-testid="filter-bar-controlled">
          <FilterBar
            {...args}
            search={(
              <SearchField
                debounceMs={250}
                label={copy({ pl: 'Szukaj', en: 'Search' })}
                loading={false}
                placeholder={copy({ pl: 'Szukaj zamówień…', en: 'Search orders…' })}
                query=""
                resultCount={null}
                size="compact"
                onQueryChange={fn()}
              />
            )}
            sort={(
              <SortControl
                direction="desc"
                options={[{ id: 'date', label: copy({ pl: 'Data', en: 'Date' }) }, { id: 'revenue', label: copy({ pl: 'Przychód', en: 'Revenue' }) }]}
                selectedId="date"
                size="compact"
                onDirectionChange={fn()}
                onSelectedIdChange={fn()}
              />
            )}
          />
        </div>
      </StorySection>

      <StorySection index="02" title={<Localized pl="Brak aktywnych filtrów" en="No active filters" />}>
        <div data-testid="filter-bar-empty">
          <FilterBar activeCount={0} collapsible={false} filters={[]} resultCount={null} />
        </div>
      </StorySection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('filter-bar-controlled')).toBeInTheDocument();
    await expect(canvas.getByTestId('filter-bar-empty')).toBeInTheDocument();
  },
};
