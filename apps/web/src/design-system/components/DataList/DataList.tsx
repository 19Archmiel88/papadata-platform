import type {
  HTMLAttributes,
  ReactNode,
} from 'react';

import type {
  PapaDataIconName,
} from '../../icons';
import {
  Icon,
} from '../../icons';
import {
  StatusBadge,
} from '../StatusBadge';
import type {
  StatusBadgeProps,
} from '../StatusBadge';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Data/data.css';

export type DataListItem = {
  readonly action?: ReactNode;
  readonly description?: string | null;
  readonly icon?: PapaDataIconName | null;
  readonly id: string;
  readonly meta?: readonly string[];
  readonly status?: StatusBadgeProps | null;
  readonly title: string;
};

export type DataListProps = Omit<
  HTMLAttributes<HTMLUListElement>,
  | 'children'
> & {
  readonly density?: 'comfortable' | 'compact';
  readonly items: readonly DataListItem[];
};

export function DataList({
  className,
  density = 'comfortable',
  items,
  ...props
}: DataListProps) {
  return (
    <ul
      {...props}
      className={joinClassNames(
        'pd-data-list',
        className,
      )}
      data-density={density}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className="pd-data-list__item"
        >
          {item.icon ? (
            <span className="pd-data-list__icon">
              <Icon
                decorative
                name={item.icon}
                size={16}
              />
            </span>
          ) : null}

          <div className="pd-data-list__body">
            <div className="pd-data-list__title-row">
              <span className="pd-data-list__title">
                {item.title}
              </span>
              {item.status ? (
                <StatusBadge
                  {...item.status}
                />
              ) : null}
            </div>
            {item.description ? (
              <p className="pd-data-list__description">
                {item.description}
              </p>
            ) : null}
            {item.meta?.length ? (
              <div className="pd-data-list__meta">
                {item.meta.map((entry) => (
                  <span key={entry}>{entry}</span>
                ))}
              </div>
            ) : null}
          </div>

          {item.action}
        </li>
      ))}
    </ul>
  );
}
