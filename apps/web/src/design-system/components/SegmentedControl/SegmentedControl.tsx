import type {
  HTMLAttributes,
  KeyboardEvent,
} from 'react';
import {
  forwardRef,
  useMemo,
  useRef,
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
import '../Filters/filters.css';

export type SegmentedControlItem = {
  readonly count?: number;
  readonly disabled?: boolean;
  readonly icon?: PapaDataIconName;
  readonly label: string;
  readonly value: string;
};

export type SegmentedControlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly ariaLabel: string;
  readonly items: readonly SegmentedControlItem[];
  readonly onValueChange?:
    | ((
        value: string,
      ) => void)
    | undefined;
  readonly size?: 'default' | 'compact';
  readonly value: string;
};

function findEnabledIndex(
  items: readonly SegmentedControlItem[],
  startIndex: number,
  direction: 1 | -1,
) {
  if (items.length === 0) {
    return -1;
  }

  let index = startIndex;

  for (let step = 0; step < items.length; step += 1) {
    index = (index + direction + items.length) % items.length;

    if (!items[index]?.disabled) {
      return index;
    }
  }

  return startIndex;
}

function findBoundaryEnabledIndex(
  items: readonly SegmentedControlItem[],
  direction: 1 | -1,
) {
  const start = direction === 1
    ? 0
    : items.length - 1;

  for (
    let index = start;
    index >= 0 && index < items.length;
    index += direction
  ) {
    if (!items[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

export const SegmentedControl = forwardRef<
  HTMLDivElement,
  SegmentedControlProps
>(function SegmentedControl(
  {
    ariaLabel,
    className,
    items,
    onValueChange,
    size = 'default',
    value,
    ...props
  },
  ref,
) {
  const itemRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});
  const currentIndex = useMemo(
    () =>
      items.findIndex(
        (item) => item.value === value,
      ),
    [
      items,
      value,
    ],
  );
  const fallbackIndex = useMemo(
    () => findBoundaryEnabledIndex(items, 1),
    [items],
  );

  const focusAndSelect = (index: number) => {
    const item = items[index];

    if (!item || item.disabled) {
      return;
    }

    onValueChange?.(item.value);
    itemRefs.current[item.value]?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        focusAndSelect(
          findEnabledIndex(items, index, 1),
        );
        return;
      }
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        focusAndSelect(
          findEnabledIndex(items, index, -1),
        );
        return;
      }
      case 'Home': {
        event.preventDefault();
        focusAndSelect(
          findBoundaryEnabledIndex(items, 1),
        );
        return;
      }
      case 'End': {
        event.preventDefault();
        focusAndSelect(
          findBoundaryEnabledIndex(items, -1),
        );
        return;
      }
      case 'Enter':
      case ' ': {
        event.preventDefault();
        focusAndSelect(index);
        return;
      }
      default:
    }
  };

  return (
    <div
      {...props}
      ref={ref}
      aria-label={ariaLabel}
      className={joinClassNames(
        'pd-segmented-control',
        className,
      )}
      data-size={size}
      role="radiogroup"
    >
      {items.map((item, index) => {
        const active = item.value === value;
        const tabIndex =
          active
            ? 0
            : currentIndex === -1 && index === fallbackIndex
              ? 0
              : -1;

        return (
          <button
            key={item.value}
            ref={(node) => {
              itemRefs.current[item.value] = node;
            }}
            aria-checked={active}
            className="pd-segmented-control__item"
            data-active={active ? true : undefined}
            disabled={item.disabled}
            role="radio"
            tabIndex={tabIndex}
            type="button"
            onClick={() => {
              if (item.disabled) {
                return;
              }

              onValueChange?.(item.value);
            }}
            onKeyDown={(event) => {
              handleKeyDown(event, index);
            }}
          >
            {item.icon ? (
              <Icon decorative name={item.icon} size={16} />
            ) : null}
            <span>{item.label}</span>
            {typeof item.count === 'number' ? (
              <span className="pd-segmented-control__count">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
});
