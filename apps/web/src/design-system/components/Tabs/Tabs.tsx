import type {
  HTMLAttributes,
  ReactNode,
} from 'react';
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import type {
  PapaDataIconName,
} from '../../icons';
import {
  Icon,
} from '../../icons';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import {
  findEnabledIndex,
  findFirstEnabledIndex,
} from '../Navigation/navigationUtils';
import '../Navigation/navigation.css';

export type TabsItem = {
  readonly badge?: string;
  readonly disabled?: boolean;
  readonly icon?: PapaDataIconName;
  readonly id: string;
  readonly label: string;
  readonly panel?: ReactNode;
};

export type TabsProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly activation: 'automatic' | 'manual';
  readonly activeId: string;
  readonly ariaLabel?: string;
  readonly items: readonly TabsItem[];
  readonly onActiveIdChange?:
    | ((
        nextId: string,
        reason:
          | 'automatic'
          | 'click'
          | 'keyboard',
      ) => void)
    | undefined;
  readonly orientation:
    | 'horizontal'
    | 'vertical';
  readonly size?: 'compact' | 'default';
};

function getItemIndex(
  items: readonly TabsItem[],
  id: string,
) {
  return items.findIndex(
    (item) => item.id === id,
  );
}

export function Tabs({
  activation,
  activeId,
  ariaLabel = 'Zakładki',
  className,
  items,
  onActiveIdChange,
  orientation,
  size = 'default',
  ...props
}: TabsProps) {
  const instanceId = useId();
  const activeIndex = getItemIndex(
    items,
    activeId,
  );
  const firstEnabledIndex =
    findFirstEnabledIndex(items);
  const [focusedId, setFocusedId] =
    useState<string | null>(activeId);
  const tabRefs = useRef<
    Array<HTMLButtonElement | null>
  >([]);

  useEffect(() => {
    setFocusedId(activeId);
  }, [
    activeId,
  ]);

  const focusedIndex = focusedId
    ? getItemIndex(
        items,
        focusedId,
      )
    : -1;
  const focusableIndex =
    focusedIndex >= 0
    && !items[focusedIndex]?.disabled
      ? focusedIndex
      : activeIndex >= 0
        && !items[activeIndex]?.disabled
        ? activeIndex
        : firstEnabledIndex;

  const moveFocus = (
    nextIndex: number,
    reason: 'automatic' | 'keyboard',
  ) => {
    const nextItem = items[nextIndex];

    if (!nextItem || nextItem.disabled) {
      return;
    }

    setFocusedId(nextItem.id);
    tabRefs.current[nextIndex]?.focus();

    if (activation === 'automatic') {
      onActiveIdChange?.(
        nextItem.id,
        reason,
      );
    }
  };

  return (
    <div
      {...props}
      className={joinClassNames(
        'pd-tabs',
        className,
      )}
      data-orientation={orientation}
    >
      <div
        aria-label={ariaLabel}
        aria-orientation={orientation}
        className="pd-tabs__list"
        role="tablist"
      >
        {items.map((
          item,
          index,
        ) => {
          const panelId = `${instanceId}-${item.id}-panel`;
          const tabId = `${instanceId}-${item.id}-tab`;
          const isSelected =
            item.id === activeId;
          const isFocusable =
            index === focusableIndex;

          return (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              aria-controls={panelId}
              aria-selected={isSelected}
              className="pd-tabs__tab"
              data-size={size}
              disabled={item.disabled}
              id={tabId}
              role="tab"
              tabIndex={isFocusable ? 0 : -1}
              type="button"
              onClick={() => {
                if (item.disabled) {
                  return;
                }

                setFocusedId(item.id);
                onActiveIdChange?.(
                  item.id,
                  'click',
                );
              }}
              onFocus={() => {
                setFocusedId(item.id);

                if (
                  activation === 'automatic'
                  && !item.disabled
                ) {
                  onActiveIdChange?.(
                    item.id,
                    'automatic',
                  );
                }
              }}
              onKeyDown={(event) => {
                if (item.disabled) {
                  return;
                }

                const forwardKeys =
                  orientation === 'vertical'
                    ? [
                        'ArrowDown',
                        'ArrowRight',
                      ]
                    : [
                        'ArrowRight',
                        'ArrowDown',
                      ];
                const backwardKeys =
                  orientation === 'vertical'
                    ? [
                        'ArrowUp',
                        'ArrowLeft',
                      ]
                    : [
                        'ArrowLeft',
                        'ArrowUp',
                      ];

                if (
                  forwardKeys.includes(
                    event.key,
                  )
                ) {
                  event.preventDefault();

                  const nextIndex =
                    findEnabledIndex(
                      items,
                      index,
                      1,
                    );

                  if (nextIndex >= 0) {
                    moveFocus(
                      nextIndex,
                      'keyboard',
                    );
                  }

                  return;
                }

                if (
                  backwardKeys.includes(
                    event.key,
                  )
                ) {
                  event.preventDefault();

                  const nextIndex =
                    findEnabledIndex(
                      items,
                      index,
                      -1,
                    );

                  if (nextIndex >= 0) {
                    moveFocus(
                      nextIndex,
                      'keyboard',
                    );
                  }

                  return;
                }

                if (event.key === 'Home') {
                  event.preventDefault();

                  if (firstEnabledIndex >= 0) {
                    moveFocus(
                      firstEnabledIndex,
                      'keyboard',
                    );
                  }

                  return;
                }

                if (event.key === 'End') {
                  event.preventDefault();

                  const lastEnabledIndex = findEnabledIndex(
                    items,
                    0,
                    -1,
                  );

                  if (lastEnabledIndex >= 0) {
                    moveFocus(
                      lastEnabledIndex,
                      'keyboard',
                    );
                  }

                  return;
                }

                if (
                  activation === 'manual'
                  && (
                    event.key === 'Enter'
                    || event.key === ' '
                  )
                ) {
                  event.preventDefault();
                  onActiveIdChange?.(
                    item.id,
                    'keyboard',
                  );
                }
              }}
            >
              {item.icon ? (
                <span
                  aria-hidden="true"
                  className="pd-tabs__icon"
                >
                  <Icon
                    decorative
                    name={item.icon}
                    size={16}
                  />
                </span>
              ) : null}
              <span>{item.label}</span>
              {item.badge ? (
                <span className="pd-tabs__badge">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        const panelId = `${instanceId}-${item.id}-panel`;
        const tabId = `${instanceId}-${item.id}-tab`;
        const isSelected =
          item.id === activeId;

        return (
          <div
            key={item.id}
            aria-labelledby={tabId}
            className="pd-tabs__panel"
            hidden={!isSelected}
            id={panelId}
            role="tabpanel"
            tabIndex={0}
          >
            <div className="pd-tabs__panel-inner">
              {item.panel}
            </div>
          </div>
        );
      })}
    </div>
  );
}
