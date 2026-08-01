import type {
  InputHTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import './field.css';
import {
  joinClassNames,
  resolveDescribedBy,
  resolveFormControlState,
} from './fieldUtils';
import type {
  FormControlStatus,
} from './fieldUtils';

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'autoComplete'
  | 'children'
  | 'prefix'
  | 'required'
  | 'size'
  | 'suffix'
  | 'type'
  | 'value'
> & {
  readonly autocomplete?: string | null;
  readonly helperText?: string | null;
  readonly inputType?: 'text' | 'email' | 'url' | 'tel';
  readonly invalid?: boolean;
  readonly label: string;
  readonly message?: string | null;
  readonly prefix?: string | null;
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly suffix?: string | null;
  readonly valid?: boolean;
  readonly value: string;
};

export const TextField = forwardRef<
  HTMLInputElement,
  TextFieldProps
>(function TextField(
  {
    autocomplete = null,
    className,
    disabled = false,
    helperText = null,
    id,
    inputType = 'text',
    invalid = false,
    label,
    message = null,
    prefix = null,
    readOnly = false,
    required = false,
    status = 'default',
    suffix = null,
    valid = false,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `pd-text-field-${autoId}`;
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

  return (
    <div
      className={joinClassNames('pd-form-field', className)}
      data-component="TextField"
      data-state={state}
    >
      <label className="pd-form-field__label-row" htmlFor={inputId}>
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

      <div
        className="pd-form-control"
        data-invalid={state === 'error' ? true : undefined}
        data-readonly={readOnly ? true : undefined}
        data-state={state}
      >
        {prefix ? (
          <span className="pd-form-control__prefix">
            {prefix}
          </span>
        ) : null}

        <input
          {...props}
          ref={ref}
          aria-describedby={resolveDescribedBy(helperId, messageId)}
          aria-invalid={state === 'error' ? true : undefined}
          autoComplete={autocomplete ?? undefined}
          className="pd-form-control__input"
          data-slot="input"
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          required={required}
          type={inputType}
          value={value}
        />

        {suffix ? (
          <span className="pd-form-control__suffix">
            {suffix}
          </span>
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
