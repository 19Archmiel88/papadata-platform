import type {
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent,
} from 'react';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

import {
  Icon,
} from '../../icons';
import {
  Spinner,
} from '../Spinner';
import {
  joinClassNames,
  resolveDescribedBy,
  resolveFormControlState,
} from '../Field/fieldUtils';
import type {
  FormControlStatus,
} from '../Field/fieldUtils';
import '../Loading/loading.css';
import '../Filters/filters.css';

export type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'children'
  | 'required'
  | 'size'
  | 'type'
  | 'value'
> & {
  readonly clearLabel?: string;
  readonly debounceMs: number;
  readonly helperText?: string | null;
  readonly hideLabel?: boolean;
  readonly invalid?: boolean;
  readonly label: string;
  readonly loading: boolean;
  readonly message?: string | null;
  readonly onClear?:
    | (() => void)
    | undefined;
  readonly onQueryChange?:
    | ((
        value: string,
      ) => void)
    | undefined;
  readonly placeholder: string;
  readonly query: string;
  readonly required?: boolean;
  readonly resultCount: number | null;
  readonly size?: 'default' | 'compact';
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
};

export const SearchField = forwardRef<
  HTMLInputElement,
  SearchFieldProps
>(function SearchField(
  {
    'aria-describedby': ariaDescribedBy,
    'aria-label': ariaLabel,
    className,
    clearLabel = 'Wyczyść wyszukiwanie',
    debounceMs,
    disabled = false,
    helperText = null,
    hideLabel = false,
    id,
    invalid = false,
    label,
    loading,
    message = null,
    onChange,
    onClear,
    onKeyDown,
    onQueryChange,
    placeholder,
    query,
    readOnly = false,
    required = false,
    resultCount,
    size = 'default',
    status = 'default',
    valid = false,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `pd-search-field-${autoId}`;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const previousQueryRef = useRef(query);
  const isFirstDraftRenderRef = useRef(true);
  const [draftQuery, setDraftQuery] = useState(query);
  const helperId = helperText
    ? `${inputId}-helper`
    : undefined;
  const messageId = message
    ? `${inputId}-message`
    : undefined;
  const state = resolveFormControlState({
    disabled,
    invalid,
    readOnly,
    status,
    valid,
  });
  const describedBy = resolveDescribedBy(
    ariaDescribedBy,
    helperId,
    messageId,
  );

  useEffect(() => {
    if (query === previousQueryRef.current) {
      return;
    }

    previousQueryRef.current = query;
    setDraftQuery(query);
  }, [query]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isFirstDraftRenderRef.current) {
      isFirstDraftRenderRef.current = false;
      return;
    }

    if (
      !onQueryChange
      || draftQuery === previousQueryRef.current
    ) {
      return;
    }

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    const emitQueryChange = () => {
      debounceTimerRef.current = null;
      previousQueryRef.current = draftQuery;
      onQueryChange(draftQuery);
    };

    if (debounceMs <= 0) {
      emitQueryChange();
      return;
    }

    debounceTimerRef.current = window.setTimeout(
      emitQueryChange,
      debounceMs,
    );

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    debounceMs,
    draftQuery,
    onQueryChange,
  ]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setDraftQuery(event.currentTarget.value);
    onChange?.(event);
  };

  const clearValue = () => {
    if (disabled || readOnly) {
      return;
    }

    setDraftQuery('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ) => {
    onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      return;
    }

    if (event.key === 'Escape' && draftQuery.length > 0) {
      event.preventDefault();
      clearValue();
    }
  };

  return (
    <div
      className={joinClassNames(
        'pd-search-field',
        className,
      )}
      data-size={size}
      data-state={state}
    >
      <div className="pd-search-field__label-row">
        <label
          className={joinClassNames(
            'pd-search-field__label',
            hideLabel ? 'pd-visually-hidden' : null,
          )}
          htmlFor={inputId}
        >
          {label}
          {required ? (
            <span
              aria-hidden="true"
              className="pd-search-field__required"
            >
              {' '}
              *
            </span>
          ) : null}
        </label>
      </div>

      <div className="pd-search-field__control">
        <span
          aria-hidden="true"
          className="pd-search-field__icon"
        >
          <Icon decorative name="search" size={16} />
        </span>

        <input
          {...props}
          ref={(node) => {
            inputRef.current = node;

            if (typeof ref === 'function') {
              ref(node);
              return;
            }

            if (ref) {
              ref.current = node;
            }
          }}
          aria-describedby={describedBy}
          aria-invalid={state === 'error' ? true : undefined}
          aria-label={ariaLabel}
          className="pd-search-field__input"
          disabled={disabled}
          id={inputId}
          inputMode="search"
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          type="search"
          value={draftQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />

        <span className="pd-search-field__suffix">
          {resultCount !== null ? (
            <span className="pd-search-field__count">
              {resultCount} wyników
            </span>
          ) : null}
          {loading ? (
            <Spinner
              delayMs={Math.max(debounceMs, 0)}
              label="Trwa wyszukiwanie"
              size={16}
            />
          ) : null}
          {draftQuery.length > 0 && !disabled && !readOnly ? (
            <button
              aria-label={clearLabel}
              className="pd-search-field__action"
              type="button"
              onClick={clearValue}
            >
              Wyczyść
            </button>
          ) : null}
        </span>
      </div>

      {helperText || message ? (
        <div className="pd-search-field__meta">
          {helperText ? (
            <div
              className="pd-search-field__helper"
              id={helperId}
            >
              {helperText}
            </div>
          ) : null}
          {message ? (
            <div
              className="pd-search-field__message"
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
