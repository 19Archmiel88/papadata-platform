import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
} from 'react';

import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Filters/filters.css';

export type FilterChipTone =
  | 'neutral'
  | 'accent'
  | 'success'
  | 'warning'
  | 'danger';

export type FilterChipProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | 'children'
> & {
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly label: string;
  readonly removable?: boolean;
  readonly removeLabel?: string;
  readonly tone?: FilterChipTone;
  readonly value?: string | null;
  readonly onRemove?:
    | (() => void)
    | undefined;
};

export const FilterChip = forwardRef<
  HTMLSpanElement,
  FilterChipProps
>(function FilterChip(
  {
    active = false,
    className,
    disabled = false,
    label,
    onRemove,
    removable = false,
    removeLabel,
    tone = 'neutral',
    value = null,
    ...props
  },
  ref,
) {
  const resolvedRemoveLabel =
    removeLabel
    ?? `Usuń filtr: ${label}${value ? ` ${value}` : ''}`;

  return (
    <span
      {...props}
      aria-disabled={disabled ? true : undefined}
      ref={ref}
      className={joinClassNames(
        'pd-filter-chip',
        className,
      )}
      data-active={active ? true : undefined}
      data-disabled={disabled ? true : undefined}
      data-tone={tone}
    >
      <span className="pd-filter-chip__label">
        {label}
      </span>
      {value ? (
        <span className="pd-filter-chip__value">
          {value}
        </span>
      ) : null}
      {removable ? (
        <button
          aria-label={resolvedRemoveLabel}
          className="pd-filter-chip__remove"
          disabled={disabled}
          type="button"
          onClick={() => {
            if (!disabled) {
              onRemove?.();
            }
          }}
        >
          ×
        </button>
      ) : null}
    </span>
  );
});
