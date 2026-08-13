import type {
  ChangeEvent,
  HTMLAttributes,
  KeyboardEvent,
} from 'react';
import {
  forwardRef,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  joinClassNames,
  resolveDescribedBy,
  resolveFormControlState,
} from '../Field/fieldUtils';
import type {
  FormControlStatus,
} from '../Field/fieldUtils';
import '../Field/field.css';
import './combobox.css';

export type ComboboxOption = {
  readonly disabled?: boolean;
  readonly label: string;
  readonly value: string;
};

export type ComboboxProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange'
> & {
  readonly disabled?: boolean;
  readonly emptyMessage?: string;
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly message?: string | null;
  readonly onChange?:
    | ((
      value: string | null,
    ) => void)
    | undefined;
  readonly options: readonly ComboboxOption[];
  readonly placeholder: string;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
  readonly value: string | null;
};

export const Combobox = forwardRef<HTMLDivElement, ComboboxProps>(
  function Combobox(
    {
      className,
      disabled = false,
      emptyMessage = 'Brak wyników.',
      helperText = null,
      id,
      invalid = false,
      label,
      message = null,
      onBlur,
      onChange,
      onFocus,
      options,
      placeholder,
      readOnly = false,
      required = false,
      status = 'default',
      valid = false,
      value,
      ...props
    },
    ref,
  ) {
    const autoId = useId();
    const rootId = id ?? `pd-combobox-${autoId}`;
    const inputId = `${rootId}-input`;
    const listboxId = `${rootId}-listbox`;
    const helperId = helperText ? `${rootId}-helper` : undefined;
    const messageId = message ? `${rootId}-message` : undefined;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const state = resolveFormControlState({
      disabled,
      invalid,
      readOnly,
      status,
      valid,
    });
    const selectedOption = options.find((option) => option.value === value) ?? null;
    const filteredOptions = useMemo(() => {
      const normalizedQuery = query.trim().toLocaleLowerCase('pl-PL');

      if (!normalizedQuery) {
        return options;
      }

      return options.filter((option) => (
        option.label.toLocaleLowerCase('pl-PL').includes(normalizedQuery)
      ));
    }, [options, query]);
    const activeOption = filteredOptions[activeIndex] ?? null;

    function commitOption(option: ComboboxOption | null) {
      if (!option || option.disabled || disabled || readOnly) {
        return;
      }

      onChange?.(option.value);
      setQuery('');
      setOpen(false);
      inputRef.current?.focus();
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
      setQuery(event.currentTarget.value);
      setActiveIndex(0);
      setOpen(true);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
      if (disabled || readOnly) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) => (
          Math.min(current + 1, Math.max(filteredOptions.length - 1, 0))
        ));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setOpen(true);
        setActiveIndex((current) => Math.max(current - 1, 0));
        return;
      }

      if (event.key === 'Enter' && open) {
        event.preventDefault();
        commitOption(activeOption);
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        setQuery('');
      }
    }

    const describedBy = resolveDescribedBy(helperId, messageId);
    const displayValue = open
      ? query
      : selectedOption?.label ?? '';

    return (
      <div
        {...props}
        ref={ref}
        className={joinClassNames('pd-form-field pd-combobox', className)}
        data-component="Combobox"
        data-state={state}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false);
            setQuery('');
          }
          onBlur?.(event);
        }}
        onFocus={onFocus}
      >
        <label className="pd-form-field__label-row" htmlFor={inputId}>
          <span className="pd-form-field__label">
            {label}
            {required ? (
              <span aria-hidden="true" className="pd-form-field__required">
                {' '}*
              </span>
            ) : null}
          </span>
        </label>

        <div
          className="pd-form-control pd-combobox__control"
          data-invalid={state === 'error' ? true : undefined}
          data-readonly={readOnly ? true : undefined}
          data-state={state}
        >
          <input
            ref={inputRef}
            aria-activedescendant={
              open && activeOption
                ? `${rootId}-option-${activeOption.value}`
                : undefined
            }
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-describedby={describedBy}
            aria-expanded={open}
            aria-invalid={state === 'error' ? true : undefined}
            aria-required={required || undefined}
            className="pd-combobox__input"
            disabled={disabled}
            id={inputId}
            placeholder={placeholder}
            readOnly={readOnly}
            role="combobox"
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onClick={() => {
              if (!disabled && !readOnly) {
                setOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
          />
        </div>

        {open ? (
          <div
            className="pd-combobox__listbox"
            id={listboxId}
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <button
                  key={option.value}
                  aria-disabled={option.disabled || undefined}
                  aria-selected={option.value === value}
                  className="pd-combobox__option"
                  data-active={index === activeIndex ? true : undefined}
                  disabled={option.disabled}
                  id={`${rootId}-option-${option.value}`}
                  role="option"
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                  }}
                  onClick={() => {
                    commitOption(option);
                  }}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <p className="pd-combobox__empty" role="status">
                {emptyMessage}
              </p>
            )}
          </div>
        ) : null}

        {helperText || message ? (
          <div className="pd-form-control__meta">
            {helperText ? (
              <div className="pd-form-control__helper" id={helperId}>
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
  },
);
