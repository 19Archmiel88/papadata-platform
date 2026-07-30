import type {
  HTMLAttributes,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import {
  buildPaginationModel,
  clampPage,
} from '../Navigation/navigationUtils';
import '../Navigation/navigation.css';

export type PaginationProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
> & {
  readonly ariaLabel?: string;
  readonly onPageChange?:
    | ((
        nextPage: number,
        reason:
          | 'next'
          | 'page'
          | 'previous',
      ) => void)
    | undefined;
  readonly page: number;
  readonly pageSize: number;
  readonly pageSizeOptions: readonly number[];
  readonly size?: 'compact' | 'default';
  readonly total: number | null;
};

export function Pagination({
  ariaLabel = 'Nawigacja stron',
  className,
  onPageChange,
  page,
  pageSize,
  pageSizeOptions,
  size = 'default',
  total,
  ...props
}: PaginationProps) {
  const totalPages =
    total === null
      ? page + 1
      : Math.max(
          1,
          Math.ceil(total / pageSize),
        );
  const currentPage = clampPage(
    page,
    totalPages,
  );
  const pages = buildPaginationModel(
    currentPage,
    totalPages,
  );
  const supportsNext =
    total === null
      ? true
      : currentPage < totalPages;
  const pageSizeText =
    pageSizeOptions.length > 1
      ? `Dostępne rozmiary strony: ${pageSizeOptions.join(', ')}`
      : `Rozmiar strony: ${pageSize}`;

  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-pagination',
        className,
      )}
      data-size={size}
    >
      <p className="pd-pagination__summary">
        {total === null
          ? `Strona ${currentPage}. ${pageSizeText}.`
          : `${Math.min(
              total,
              (currentPage - 1) * pageSize + 1,
            )}–${Math.min(
              total,
              currentPage * pageSize,
            )} z ${total}. ${pageSizeText}.`}
      </p>

      <div className="pd-pagination__controls">
        <button
          aria-label="Poprzednia strona"
          className="pd-pagination__button"
          disabled={currentPage <= 1}
          type="button"
          onClick={() => {
            if (currentPage <= 1) {
              return;
            }

            onPageChange?.(
              currentPage - 1,
              'previous',
            );
          }}
        >
          Poprzednia
        </button>

        {pages.map((
          value,
          index,
        ) => value === 'ellipsis' ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="pd-pagination__ellipsis"
          >
            …
          </span>
        ) : (
          <button
            key={value}
            aria-current={
              value === currentPage
                ? 'page'
                : undefined
            }
            aria-label={`Strona ${value}`}
            className="pd-pagination__page"
            type="button"
            onClick={() => {
              onPageChange?.(
                value,
                'page',
              );
            }}
          >
            {value}
          </button>
        ))}

        <button
          aria-label="Następna strona"
          className="pd-pagination__button"
          disabled={!supportsNext}
          type="button"
          onClick={() => {
            if (!supportsNext) {
              return;
            }

            onPageChange?.(
              currentPage + 1,
              'next',
            );
          }}
        >
          Następna
        </button>
      </div>
    </nav>
  );
}
