import type {
  HTMLAttributes,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Navigation/navigation.css';

export type BreadcrumbsItem = {
  readonly current: boolean;
  readonly href: string | null;
  readonly id: string;
  readonly label: string;
};

export type BreadcrumbsProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
> & {
  readonly ariaLabel?: string;
  readonly items: readonly BreadcrumbsItem[];
  readonly maxVisible: number;
};

type VisibleItem =
  | BreadcrumbsItem
  | {
      readonly hiddenCount: number;
      readonly id: string;
      readonly kind: 'ellipsis';
    };

function buildVisibleItems(
  items: readonly BreadcrumbsItem[],
  maxVisible: number,
): VisibleItem[] {
  if (
    maxVisible <= 0
    || items.length <= maxVisible
  ) {
    return [
      ...items,
    ];
  }

  if (maxVisible <= 2) {
    return [
      items[0],
      items[items.length - 1],
    ];
  }

  const tailCount = maxVisible - 2;
  const tailItems = items.slice(-tailCount);
  const hiddenCount =
    items.length - (tailItems.length + 1);

  return [
    items[0],
    {
      hiddenCount,
      id: 'ellipsis',
      kind: 'ellipsis',
    },
    ...tailItems,
  ];
}

export function Breadcrumbs({
  ariaLabel = 'Ścieżka nawigacji',
  className,
  items,
  maxVisible,
  ...props
}: BreadcrumbsProps) {
  const visibleItems = buildVisibleItems(
    items,
    maxVisible,
  );

  return (
    <nav
      {...props}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-breadcrumbs',
        className,
      )}
    >
      <ol className="pd-breadcrumbs__list">
        {visibleItems.map((
          item,
          index,
        ) => {
          const isLast =
            index === visibleItems.length - 1;

          if ('kind' in item) {
            return (
              <li
                key={item.id}
                className="pd-breadcrumbs__item"
              >
                <span
                  aria-label={`Pominięto ${item.hiddenCount} poziomy ścieżki`}
                  className="pd-breadcrumbs__ellipsis"
                >
                  …
                </span>
                {!isLast ? (
                  <span
                    aria-hidden="true"
                    className="pd-breadcrumbs__separator"
                  >
                    /
                  </span>
                ) : null}
              </li>
            );
          }

          const breadcrumbItem = item;

          return (
            <li
              key={breadcrumbItem.id}
              className="pd-breadcrumbs__item"
            >
              {breadcrumbItem.current || !breadcrumbItem.href ? (
                <span
                  aria-current={
                    breadcrumbItem.current
                      ? 'page'
                      : undefined
                  }
                  className="pd-breadcrumbs__current"
                >
                  {breadcrumbItem.label}
                </span>
              ) : (
                <a
                  className="pd-breadcrumbs__link"
                  href={breadcrumbItem.href}
                >
                  {breadcrumbItem.label}
                </a>
              )}
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="pd-breadcrumbs__separator"
                >
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
