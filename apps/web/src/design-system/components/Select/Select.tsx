import type {
  ChangeEvent,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent,
  SelectHTMLAttributes,
} from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type {
  PapaDataRuntimeLocale,
} from '../../foundations';
import '../Field/field.css';
import './select.css';
import {
  joinClassNames,
  resolveFormControlState,
} from '../Field/fieldUtils';
import type {
  FormControlStatus,
} from '../Field/fieldUtils';

type SelectOption = {
  readonly disabled?: boolean;
  readonly label: string;
  readonly value: string;
};

const selectRuntimeCopy: Record<
  PapaDataRuntimeLocale,
  {
    readonly emptySearchMessage: string;
    readonly searchLabelSuffix: string;
    readonly searchPlaceholder: string;
  }
> = {
  pl: {
    emptySearchMessage: 'Brak wyników dla podanej frazy.',
    searchLabelSuffix: 'wyszukiwanie',
    searchPlaceholder: 'Szukaj opcji',
  },
  en: {
    emptySearchMessage: 'No results for this query.',
    searchLabelSuffix: 'search',
    searchPlaceholder: 'Search options',
  },
};

function resolveDescribedBy(
  describedBy: string | undefined,
  helperId: string | undefined,
  messageId: string | undefined,
) {
  const ids = [
    describedBy,
    helperId,
    messageId,
  ].filter(Boolean);

  return ids.length > 0
    ? ids.join(' ')
    : undefined;
}

function resolveOptionId(
  selectId: string,
  optionValue: string,
) {
  return `${selectId}-option-${encodeURIComponent(optionValue)}`;
}

function findSelectedIndex(
  options: readonly SelectOption[],
  value: string | null,
) {
  return options.findIndex((option) => option.value === value);
}

function findBoundaryEnabledIndex(
  options: readonly SelectOption[],
  direction: 1 | -1,
) {
  const start = direction === 1
    ? 0
    : options.length - 1;

  for (
    let index = start;
    index >= 0 && index < options.length;
    index += direction
  ) {
    if (!options[index]?.disabled) {
      return index;
    }
  }

  return -1;
}

function findNextEnabledIndex(
  options: readonly SelectOption[],
  startIndex: number,
  direction: 1 | -1,
) {
  if (options.length === 0) {
    return -1;
  }

  let index = startIndex;

  for (let step = 0; step < options.length; step += 1) {
    index = (index + direction + options.length) % options.length;

    if (!options[index]?.disabled) {
      return index;
    }
  }

  return startIndex;
}

function resolveInitialActiveIndex(
  options: readonly SelectOption[],
  value: string | null,
  direction: 1 | -1 = 1,
) {
  const selectedIndex = findSelectedIndex(options, value);

  if (
    selectedIndex >= 0
    && !options[selectedIndex]?.disabled
  ) {
    return selectedIndex;
  }

  return findBoundaryEnabledIndex(options, direction);
}

function focusTargetIsInside(
  root: HTMLElement,
  target: EventTarget | null,
) {
  return target instanceof Node && root.contains(target);
}

export type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  | 'children'
  | 'onBlur'
  | 'onFocus'
  | 'required'
  | 'size'
  | 'value'
> & {
  readonly emptySearchMessage?: string;
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly locale?: PapaDataRuntimeLocale;
  readonly message?: string | null;
  readonly onBlur?: (
    event: ReactFocusEvent<HTMLDivElement>,
  ) => void;
  readonly onFocus?: (
    event: ReactFocusEvent<HTMLDivElement>,
  ) => void;
  readonly options: readonly SelectOption[];
  readonly placeholder: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly searchable?: boolean;
  readonly searchPlaceholder?: string;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
  readonly value: string | null;
};

export const Select = forwardRef<
  HTMLSelectElement,
  SelectProps
>(function Select(
  {
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    autoFocus,
    className,
    disabled = false,
    emptySearchMessage,
    helperText = null,
    id,
    invalid = false,
    label,
    locale = 'pl',
    message = null,
    name,
    onBlur,
    onChange,
    onFocus,
    options,
    placeholder,
    readOnly = false,
    required = false,
    searchable = false,
    searchPlaceholder,
    status = 'default',
    valid = false,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? `pd-select-${autoId}`;
  const labelId = `${selectId}-label`;
  const helperId = helperText
    ? `${selectId}-helper`
    : undefined;
  const messageId = message
    ? `${selectId}-message`
    : undefined;
  const listboxId = `${selectId}-listbox`;
  const nativeSelectId = `${selectId}-native`;
  const searchId = `${selectId}-search`;

  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const listboxRef = useRef<HTMLDivElement | null>(null);
  const nativeSelectRef = useRef<HTMLSelectElement | null>(null);
  const optionRefs = useRef<
    Record<string, HTMLButtonElement | null>
  >({});

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [uncontrolledValue, setUncontrolledValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [panelPosition, setPanelPosition] = useState<{
    readonly left: number;
    readonly maxHeight: number;
    readonly openUpward: boolean;
    readonly top: number;
    readonly width: number;
  } | null>(null);

  const state = resolveFormControlState({
    disabled,
    invalid,
    readOnly,
    status,
    valid,
  });

  const resolvedValue = onChange
    ? value
    : uncontrolledValue;

  const runtimeCopy = selectRuntimeCopy[locale];
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? runtimeCopy.searchPlaceholder;
  const resolvedEmptySearchMessage =
    emptySearchMessage ?? runtimeCopy.emptySearchMessage;

  const filteredOptions = useMemo(() => {
    if (!searchable) {
      return options;
    }

    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase(locale);

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) =>
      option.label
        .toLocaleLowerCase(locale)
        .includes(normalizedQuery),
    );
  }, [
    locale,
    options,
    query,
    searchable,
  ]);

  const selectedOption = options.find(
    (option) => option.value === resolvedValue,
  );

  const activeOption =
    activeIndex >= 0
      ? filteredOptions[activeIndex]
      : undefined;

  const activeOptionId = activeOption
    ? resolveOptionId(selectId, activeOption.value)
    : undefined;

  const describedBy = resolveDescribedBy(
    ariaDescribedBy,
    helperId,
    messageId,
  );

  useImperativeHandle(
    ref,
    () => nativeSelectRef.current!,
    [],
  );

  useEffect(() => {
    if (onChange) {
      return;
    }

    setUncontrolledValue(value);
  }, [
    onChange,
    value,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        rootRef.current
        && !rootRef.current.contains(event.target as Node)
      ) {
        closeList({
          restoreFocus: false,
        });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (
        rootRef.current
        && !rootRef.current.contains(event.target as Node)
      ) {
        closeList({
          restoreFocus: false,
        });
      }
    };

    document.addEventListener(
      'pointerdown',
      handlePointerDown,
    );
    document.addEventListener(
      'focusin',
      handleFocusIn,
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown,
      );
      document.removeEventListener(
        'focusin',
        handleFocusIn,
      );
    };
  }, [isOpen]);

  const updatePanelPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || typeof window === 'undefined') return;

    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const edgeMargin = 12;
    const preferredMaxHeight = 352; // 22rem, matches the design's option-list cap.
    // Never narrower than the trigger, but a narrow trigger (e.g. a compact
    // preset select in a topbar dropdown) shouldn't force option labels
    // like "Ostatnie 90 dni" to truncate — give the popover a sane floor.
    const width = Math.min(
      Math.max(rect.width, 220),
      window.innerWidth - edgeMargin * 2,
    );
    const spaceBelow = window.innerHeight - rect.bottom - gap - edgeMargin;
    const spaceAbove = rect.top - gap - edgeMargin;
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;

    setPanelPosition({
      left: Math.min(
        Math.max(edgeMargin, rect.left),
        window.innerWidth - width - edgeMargin,
      ),
      maxHeight: Math.max(
        120,
        Math.min(preferredMaxHeight, openUpward ? spaceAbove : spaceBelow),
      ),
      openUpward,
      top: openUpward ? rect.top - gap : rect.bottom + gap,
      width,
    });
  }, []);

  // Popover is position:fixed and its extent is computed from the trigger's
  // real viewport rect, not CSS anchored to a relative ancestor — so it can
  // never be clipped by a scrolling/overflow:hidden container the select
  // happens to be nested in (e.g. a topbar dropdown), unlike a plain
  // position:absolute popover would be.
  useLayoutEffect(() => {
    if (!isOpen) {
      setPanelPosition(null);
      return;
    }

    updatePanelPosition();

    window.addEventListener('resize', updatePanelPosition);
    window.addEventListener('scroll', updatePanelPosition, true);

    return () => {
      window.removeEventListener('resize', updatePanelPosition);
      window.removeEventListener('scroll', updatePanelPosition, true);
    };
  }, [isOpen, updatePanelPosition]);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(
      resolveInitialActiveIndex(
        filteredOptions,
        resolvedValue,
      ),
    );
  }, [
    filteredOptions,
    isOpen,
    resolvedValue,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (searchable) {
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
      return;
    }

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [
    isOpen,
    searchable,
  ]);

  useEffect(() => {
    if (!isOpen || !activeOption) {
      return;
    }

    const listbox = listboxRef.current;
    const option = optionRefs.current[activeOption.value];

    if (!listbox || !option) {
      return;
    }

    const optionTop = option.offsetTop;
    const optionBottom = optionTop + option.offsetHeight;
    const visibleTop = listbox.scrollTop;
    const visibleBottom = visibleTop + listbox.clientHeight;

    if (optionTop < visibleTop) {
      listbox.scrollTo({
        top: optionTop,
      });
      return;
    }

    if (optionBottom > visibleBottom) {
      listbox.scrollTo({
        top: optionBottom - listbox.clientHeight,
      });
    }
  }, [
    activeOption,
    isOpen,
  ]);

  function closeList({
    restoreFocus = false,
  }: {
    readonly restoreFocus?: boolean;
  } = {}) {
    setIsOpen(false);
    setQuery('');

    if (restoreFocus) {
      requestAnimationFrame(() => {
        triggerRef.current?.focus();
      });
    }
  }

  function openList(direction: 1 | -1 = 1) {
    if (disabled || readOnly) {
      return;
    }

    setIsOpen(true);
    setActiveIndex(
      resolveInitialActiveIndex(
        filteredOptions,
        resolvedValue,
        direction,
      ),
    );
  }

  function moveActive(direction: 1 | -1) {
    setActiveIndex((currentIndex) => {
      if (filteredOptions.length === 0) {
        return -1;
      }

      if (currentIndex < 0) {
        return findBoundaryEnabledIndex(
          filteredOptions,
          direction,
        );
      }

      return findNextEnabledIndex(
        filteredOptions,
        currentIndex,
        direction,
      );
    });
  }

  function moveToBoundary(direction: 1 | -1) {
    setActiveIndex(
      findBoundaryEnabledIndex(
        filteredOptions,
        direction,
      ),
    );
  }

  function commitValue(nextValue: string) {
    const nextOption = options.find(
      (option) => option.value === nextValue,
    );

    if (!nextOption || nextOption.disabled) {
      return;
    }

    if (!onChange) {
      setUncontrolledValue(nextValue);
    }

    closeList({
      restoreFocus: true,
    });

    if (
      !nativeSelectRef.current
      || nextValue === resolvedValue
    ) {
      return;
    }

    nativeSelectRef.current.value = nextValue;
    nativeSelectRef.current.dispatchEvent(
      new Event('change', {
        bubbles: true,
      }),
    );
  }

  function selectActiveOption() {
    if (!activeOption || activeOption.disabled) {
      return;
    }

    commitValue(activeOption.value);
  }

  function handleRootFocus(
    event: ReactFocusEvent<HTMLDivElement>,
  ) {
    if (
      focusTargetIsInside(
        event.currentTarget,
        event.relatedTarget,
      )
    ) {
      return;
    }

    onFocus?.(event);
  }

  function handleRootBlur(
    event: ReactFocusEvent<HTMLDivElement>,
  ) {
    if (
      focusTargetIsInside(
        event.currentTarget,
        event.relatedTarget,
      )
    ) {
      return;
    }

    onBlur?.(event);
  }

  function handleTriggerKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (disabled || readOnly) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();

        if (!isOpen) {
          openList(1);
          return;
        }

        moveActive(1);
        return;
      }

      case 'ArrowUp': {
        event.preventDefault();

        if (!isOpen) {
          openList(-1);
          return;
        }

        moveActive(-1);
        return;
      }

      case 'Home': {
        if (!isOpen || searchable) {
          return;
        }

        event.preventDefault();
        moveToBoundary(1);
        return;
      }

      case 'End': {
        if (!isOpen || searchable) {
          return;
        }

        event.preventDefault();
        moveToBoundary(-1);
        return;
      }

      case 'Enter':
      case ' ': {
        event.preventDefault();

        if (!isOpen) {
          openList(1);
          return;
        }

        selectActiveOption();
        return;
      }

      case 'Escape': {
        if (!isOpen) {
          return;
        }

        event.preventDefault();
        closeList({
          restoreFocus: true,
        });
        return;
      }

      case 'Tab': {
        if (isOpen) {
          closeList();
        }

        return;
      }

      default: {
        return;
      }
    }
  }

  function handleSearchKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        moveActive(1);
        return;
      }

      case 'ArrowUp': {
        event.preventDefault();
        moveActive(-1);
        return;
      }

      case 'Enter': {
        event.preventDefault();
        selectActiveOption();
        return;
      }

      case 'Escape': {
        event.preventDefault();
        closeList({
          restoreFocus: true,
        });
        return;
      }

      case 'Tab': {
        closeList();
        return;
      }

      default: {
        return;
      }
    }
  }

  function handleNativeChange(
    event: ChangeEvent<HTMLSelectElement>,
  ) {
    onChange?.(event);
  }

  return (
    <div
      className={joinClassNames('pd-select', className)}
      data-component="Select"
      data-state={state}
      onBlur={handleRootBlur}
      onFocus={handleRootFocus}
      ref={rootRef}
    >
      <label
        className="pd-form-field__label-row"
        htmlFor={selectId}
        id={labelId}
      >
        <span className="pd-form-field__label">
          {label}
          {required ? (
            <span
              aria-hidden="true"
              className="pd-form-field__required"
            >
              {' '}
              *
            </span>
          ) : null}
        </span>
      </label>

      <select
        {...props}
        aria-hidden="true"
        aria-labelledby={labelId}
        className="pd-select__native"
        disabled={disabled}
        id={nativeSelectId}
        name={name}
        onChange={handleNativeChange}
        ref={nativeSelectRef}
        required={required}
        tabIndex={-1}
        value={resolvedValue ?? ''}
      >
        <option disabled value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      <div
        className="pd-form-control pd-select__trigger-shell"
        data-invalid={state === 'error' ? true : undefined}
        data-open={isOpen ? true : undefined}
        data-state={state}
      >
        <button
          aria-activedescendant={
            !searchable && isOpen
              ? activeOptionId
              : undefined
          }
          aria-controls={isOpen ? listboxId : undefined}
          aria-describedby={describedBy}
          aria-disabled={
            searchable && readOnly
              ? true
              : undefined
          }
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={state === 'error' ? true : undefined}
          aria-label={ariaLabel}
          aria-labelledby={
            ariaLabelledBy
            ?? (ariaLabel ? undefined : labelId)
          }
          aria-readonly={
            !searchable && readOnly
              ? true
              : undefined
          }
          autoFocus={autoFocus}
          className="pd-select__trigger"
          data-slot="select-trigger"
          disabled={disabled}
          id={selectId}
          onClick={() => {
            if (isOpen) {
              closeList();
              return;
            }

            openList(1);
          }}
          onKeyDown={handleTriggerKeyDown}
          ref={triggerRef}
          role={searchable ? undefined : 'combobox'}
          type="button"
        >
          <span
            className={joinClassNames(
              'pd-select__trigger-label',
              selectedOption
                ? undefined
                : 'pd-select__trigger-label--placeholder',
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>

          <span
            aria-hidden="true"
            className="pd-select__indicator"
            data-open={isOpen ? true : undefined}
          >
            ▼
          </span>
        </button>

        {isOpen && panelPosition ? (
          <div
            className="pd-select__panel"
            data-open-upward={panelPosition.openUpward ? true : undefined}
            data-state={state}
            style={{
              left: panelPosition.left,
              maxHeight: panelPosition.maxHeight,
              top: panelPosition.top,
              transform: panelPosition.openUpward ? 'translateY(-100%)' : undefined,
              width: panelPosition.width,
            }}
          >
            {searchable ? (
              <div className="pd-select__search-shell">
                <input
                  aria-activedescendant={activeOptionId}
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-describedby={describedBy}
                  aria-expanded="true"
                  aria-haspopup="listbox"
                  aria-invalid={
                    state === 'error'
                      ? true
                      : undefined
                  }
                  aria-label={`${label} ${runtimeCopy.searchLabelSuffix}`}
                  autoComplete="off"
                  className="pd-select__search-input"
                  id={searchId}
                  onChange={(event) => {
                    setQuery(event.currentTarget.value);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder={resolvedSearchPlaceholder}
                  ref={searchRef}
                  role="combobox"
                  spellCheck={false}
                  type="text"
                  value={query}
                />
              </div>
            ) : null}

            <div
              aria-labelledby={labelId}
              className="pd-select__listbox"
              id={listboxId}
              ref={listboxRef}
              role="listbox"
            >
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => {
                  const selected =
                    option.value === resolvedValue;
                  const active = index === activeIndex;

                  return (
                    <button
                      aria-disabled={
                        option.disabled
                          ? true
                          : undefined
                      }
                      aria-selected={selected}
                      className="pd-select__option"
                      data-active={
                        active
                          ? true
                          : undefined
                      }
                      data-disabled={
                        option.disabled
                          ? true
                          : undefined
                      }
                      data-selected={
                        selected
                          ? true
                          : undefined
                      }
                      disabled={option.disabled}
                      id={resolveOptionId(
                        selectId,
                        option.value,
                      )}
                      key={option.value}
                      onClick={() => {
                        commitValue(option.value);
                      }}
                      onMouseDown={(event) => {
                        event.preventDefault();
                      }}
                      onMouseEnter={() => {
                        if (!option.disabled) {
                          setActiveIndex(index);
                        }
                      }}
                      ref={(node) => {
                        optionRefs.current[option.value] = node;
                      }}
                      role="option"
                      tabIndex={-1}
                      type="button"
                    >
                      <span className="pd-select__option-text">
                        {option.label}
                      </span>

                      <span
                        aria-hidden="true"
                        className="pd-select__option-mark"
                        data-selected={
                          selected
                            ? true
                            : undefined
                        }
                      />
                    </button>
                  );
                })
              ) : (
                <div
                  aria-disabled="true"
                  aria-selected="false"
                  className="pd-select__empty-state"
                  role="option"
                >
                  {resolvedEmptySearchMessage}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {helperText || message ? (
        <div className="pd-form-control__meta">
          {helperText ? (
            <div
              className="pd-form-control__helper"
              id={helperId}
            >
              {helperText}
            </div>
          ) : null}

          {message ? (
            <div
              className="pd-form-control__message"
              data-state={state}
              id={messageId}
            >
              {message}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
