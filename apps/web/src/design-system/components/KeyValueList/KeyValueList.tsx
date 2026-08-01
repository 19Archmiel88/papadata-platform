import type {
  HTMLAttributes,
  ReactNode,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Data/data.css';

export type KeyValueListItem = {
  readonly id: string;
  readonly label: string;
  readonly value: ReactNode;
};

export type KeyValueListGroup = {
  readonly id: string;
  readonly items: readonly KeyValueListItem[];
  readonly title?: string | null;
};

export type KeyValueListProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly density?: 'comfortable' | 'compact';
  readonly groups: readonly KeyValueListGroup[];
};

export function KeyValueList({
  className,
  density = 'comfortable',
  groups,
  ...props
}: KeyValueListProps) {
  return (
    <div
      {...props}
      className={joinClassNames(
        'pd-key-value-list',
        className,
      )}
      data-density={density}
    >
      {groups.map((group) => (
        <section
          className="pd-key-value-list__group"
          key={group.id}
        >
          {group.title ? (
            <h3 className="pd-key-value-list__group-title">
              {group.title}
            </h3>
          ) : null}
          <dl className="pd-key-value-list__list">
            {group.items.map((item) => (
              <div
                className="pd-key-value-list__entry"
                key={item.id}
              >
                <dt className="pd-key-value-list__term">
                  {item.label}
                </dt>
                <dd className="pd-key-value-list__value">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
