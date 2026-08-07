import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

export type DataSurfaceSelectOption<Value extends string> = {
  readonly value: Value;
  readonly label: string;
};

type DataSurfaceSelectProps<Value extends string> = {
  readonly label: string;
  readonly onValueChange: (value: Value) => void;
  readonly options: readonly DataSurfaceSelectOption<Value>[];
  readonly value: Value;
};

export function DataSurfaceSelect<Value extends string>({
  label,
  onValueChange,
  options,
  value,
}: DataSurfaceSelectProps<Value>) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selectedOption = options[selectedIndex] ?? options[0];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const focusOption = (index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, options.length - 1));
    optionRefs.current[boundedIndex]?.focus();
  };

  const openList = (index: number) => {
    setOpen(true);
    window.requestAnimationFrame(() => focusOption(index));
  };

  const closeList = (returnFocus = true) => {
    setOpen(false);

    if (returnFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  };

  const selectOption = (option: DataSurfaceSelectOption<Value>) => {
    onValueChange(option.value);
    closeList();
  };

  const handleOptionKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusOption((index + 1) % options.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusOption((index - 1 + options.length) % options.length);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusOption(options.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      closeList();
    } else if (event.key === 'Tab') {
      closeList(false);
    }
  };

  return (
    <div className="pd-s53-select" ref={rootRef}>
      <span className="pd-s53-select__label" id={`${id}-label`}>
        {label}
      </span>
      <div className="pd-s53-select__control">
        <button
          data-lab-control="select-trigger"
          aria-controls={`${id}-listbox`}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-labelledby={`${id}-label ${id}-value`}
          className="pd-s53-select__trigger"
          onClick={() => {
            if (open) {
              closeList(false);
            } else {
              openList(selectedIndex);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              openList(selectedIndex);
            } else if (event.key === 'ArrowUp') {
              event.preventDefault();
              openList(selectedIndex);
            } else if (event.key === 'Home') {
              event.preventDefault();
              openList(0);
            } else if (event.key === 'End') {
              event.preventDefault();
              openList(options.length - 1);
            } else if (event.key === 'Escape' && open) {
              event.preventDefault();
              closeList();
            }
          }}
          ref={triggerRef}
          type="button"
        >
          <span id={`${id}-value`}>{selectedOption?.label}</span>
          <span aria-hidden="true" className="pd-s53-select__chevron">
            ⌄
          </span>
        </button>

        {open ? (
          <div
            aria-labelledby={`${id}-label`}
            className="pd-s53-select__list"
            id={`${id}-listbox`}
            role="listbox"
          >
            {options.map((option, index) => (
              <button
                data-lab-control="select-option"
                aria-selected={option.value === value}
                key={option.value}
                onClick={() => selectOption(option)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
                <span aria-hidden="true" className="pd-s53-select__marker" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
