import type {
  HTMLAttributes,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Navigation/navigation.css';

export type PaginationNavProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
> & {
  readonly ariaLabel?: string;
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
  readonly size?: 'compact' | 'default';
  readonly summary?: string;
};

export function PaginationNav({
  ariaLabel = 'Nawigacja wyników',
  className,
  cursor,
  loading,
  nextCursor,
  onNavigate,
  previousCursor,
  size = 'default',
  summary = '1–25 z 240 wyników',
  ...props
}: PaginationNavProps) {
  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-pagination-nav',
        className,
      )}
      data-size={size}
    >
      <p className="pd-pagination-nav__summary">
        {loading
          ? 'Trwa aktualizacja zakresu wyników.'
          : `${summary}${cursor ? ` Aktywny kursor: ${cursor}.` : ''}`}
      </p>

      <div className="pd-pagination-nav__controls">
        <button
          aria-label="Pobierz poprzedni zakres wyników"
          className="pd-pagination-nav__button"
          disabled={loading || !previousCursor}
          type="button"
          onClick={() => {
            if (
              loading
              || !previousCursor
            ) {
              return;
            }

            onNavigate?.('previous');
          }}
        >
          Poprzedni zakres
        </button>
        <button
          aria-label="Pobierz następny zakres wyników"
          className="pd-pagination-nav__button"
          disabled={loading || !nextCursor}
          type="button"
          onClick={() => {
            if (
              loading
              || !nextCursor
            ) {
              return;
            }

            onNavigate?.('next');
          }}
        >
          Następny zakres
        </button>
      </div>
    </nav>
  );
}
