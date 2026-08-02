import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Icon,
} from '../../icons';
import {
  Menu,
} from '../Menu';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import '../Filters/filters.css';

export type SortControlDirection =
  | 'asc'
  | 'desc';

export type SortControlOption = {
  readonly id: string;
  readonly label: string;
};

export type SortControlProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
> & {
  readonly ariaLabel?: string;
  readonly direction?: SortControlDirection | null;
  readonly disabled?: boolean;
  readonly label?: string;
  readonly onDirectionChange?:
    | ((
        direction: SortControlDirection,
      ) => void)
    | undefined;
  readonly onSelectedIdChange?:
    | ((
        id: string,
      ) => void)
    | undefined;
  readonly options: readonly SortControlOption[];
  readonly selectedId: string;
  readonly size?: 'default' | 'compact';
};

export const SortControl = forwardRef<
  HTMLDivElement,
  SortControlProps
>(function SortControl(
  {
    ariaLabel = 'Sortowanie lokalne',
    className,
    direction = null,
    disabled = false,
    label = 'Sortuj',
    onDirectionChange,
    onSelectedIdChange,
    options,
    selectedId,
    size = 'default',
    ...props
  },
  ref,
) {
    const [open, setOpen] = useState(false);
    const [activeItemId, setActiveItemId] =
      useState<string | null>(selectedId);
    const selectedOption = useMemo(
      () =>
        options.find(
          (option) => option.id === selectedId,
        )
        ?? options[0],
      [
        options,
        selectedId,
      ],
    );

    useEffect(() => {
      setActiveItemId(selectedId);
    }, [selectedId]);

    return (
      <div
        {...props}
        ref={ref}
        className={joinClassNames(
          'pd-sort-control',
          className,
        )}
        data-size={size}
      >
        <Menu
          activeItemId={activeItemId}
          items={options.map((option) => ({
            id: option.id,
            label: option.label,
          }))}
          open={open}
          placement="bottom-end"
          trigger={(
            <button
              aria-label={ariaLabel}
              className="pd-sort-control__trigger"
              disabled={disabled}
              type="button"
            >
              <Icon decorative name="trend" size={16} />
              <span>
                {label}: {selectedOption?.label ?? '—'}
              </span>
            </button>
          )}
          onAction={(itemId) => {
            onSelectedIdChange?.(itemId);
            setOpen(false);
          }}
          onActiveItemIdChange={(itemId) => {
            setActiveItemId(itemId);
          }}
          onOpenChange={(nextOpen) => {
            if (disabled) {
              return;
            }

            setOpen(nextOpen);
          }}
        />

        {direction ? (
          <button
            aria-label={`Zmień kierunek sortowania. Aktualnie ${direction === 'asc' ? 'rosnąco' : 'malejąco'}.`}
            className="pd-sort-control__direction"
            disabled={disabled}
            type="button"
            onClick={() => {
              onDirectionChange?.(
                direction === 'asc'
                  ? 'desc'
                  : 'asc',
              );
            }}
          >
            {direction === 'asc'
              ? 'Rosnąco'
              : 'Malejąco'}
          </button>
        ) : null}

        <span className="pd-sort-control__summary">
          lokalne sterowanie kolejnością
        </span>
      </div>
    );
});
