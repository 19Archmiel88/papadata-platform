import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
} from 'react';

import {
  FilterChip,
} from '../FilterChip';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Filters/filters.css';

export type FilterBarFilter = {
  readonly id: string;
  readonly label: string;
  readonly removable?: boolean;
  readonly tone?:
    | 'neutral'
    | 'accent'
    | 'success'
    | 'warning'
    | 'danger';
  readonly type: 'select' | 'date' | 'search';
  readonly value: string | null;
};

export type FilterBarProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly actions?: ReactNode;
  readonly activeCount: number;
  readonly availableFilters?: ReactNode;
  readonly clearFiltersLabel?: string;
  readonly collapsible: boolean;
  readonly compact?: boolean;
  readonly emptyLabel?: string;
  readonly filters: readonly FilterBarFilter[];
  readonly onClearFilters?:
    | (() => void)
    | undefined;
  readonly onRemoveFilter?:
    | ((
        filterId: string,
      ) => void)
    | undefined;
  readonly resultCount?: number | null;
  readonly search?: ReactNode;
  readonly segments?: ReactNode;
  readonly sort?: ReactNode;
};

export const FilterBar = forwardRef<
  HTMLDivElement,
  FilterBarProps
>(function FilterBar(
  {
    actions = null,
    activeCount,
    availableFilters = null,
    className,
    clearFiltersLabel = 'Wyczyść filtry',
    collapsible,
    compact = false,
    emptyLabel = 'Brak aktywnych filtrów.',
    filters,
    onClearFilters,
    onRemoveFilter,
    resultCount = null,
    search = null,
    segments = null,
    sort = null,
    ...props
  },
  ref,
) {
  const activeFilters = filters.filter(
    (filter) => filter.value !== null,
  );
  const clearableFilters = activeFilters.filter(
    (filter) => filter.removable ?? true,
  );

  return (
    <div
      {...props}
      ref={ref}
      className={joinClassNames(
        'pd-filter-bar',
        className,
      )}
      data-collapsible={collapsible ? true : undefined}
      data-compact={compact ? true : undefined}
    >
      <div className="pd-filter-bar__controls">
        <div className="pd-filter-bar__controls-start">
          {search}
          {availableFilters}
          {segments}
        </div>
        <div className="pd-filter-bar__controls-end">
          {sort}
          {actions}
          {resultCount !== null ? (
            <span className="pd-filter-bar__summary">
              {resultCount} wyników
            </span>
          ) : null}
        </div>
      </div>

      <div className="pd-filter-bar__active">
        <div className="pd-filter-bar__active-main">
          {activeFilters.length > 0 ? (
            <>
              <span className="pd-filter-bar__summary">
                Aktywne filtry: {activeCount}
              </span>
              <div className="pd-filter-bar__chips">
                {activeFilters.map((filter) => (
                  <FilterChip
                    key={filter.id}
                    label={filter.label}
                    removable={
                      filter.removable ?? true
                    }
                    tone={filter.tone ?? 'accent'}
                    value={filter.value}
                    onRemove={() => {
                      onRemoveFilter?.(filter.id);
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <span className="pd-filter-bar__empty">
              {emptyLabel}
            </span>
          )}
        </div>

        <div className="pd-filter-bar__active-side">
          {clearableFilters.length > 0 && onClearFilters ? (
            <button
              className="pd-filter-bar__clear"
              type="button"
              onClick={() => {
                onClearFilters();
              }}
            >
              {clearFiltersLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
});
