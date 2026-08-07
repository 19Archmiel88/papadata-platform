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

export type FileInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'children'
  | 'required'
  | 'type'
  | 'value'
> & {
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly message?: string | null;
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
};

export const FileInput = forwardRef<
  HTMLInputElement,
  FileInputProps
>(function FileInput(
  {
    className,
    disabled = false,
    helperText = null,
    id,
    invalid = false,
    label,
    message = null,
    required = false,
    status = 'default',
    valid = false,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `pd-file-input-${autoId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const messageId = message ? `${inputId}-message` : undefined;
  const state = resolveFormControlState({
    disabled,
    invalid,
    readOnly: false,
    status,
    valid,
  });

  return (
    <div
      className={joinClassNames('pd-form-field', className)}
      data-component="FileInput"
      data-state={state}
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
        className="pd-form-control pd-form-control--file"
        data-invalid={state === 'error' ? true : undefined}
        data-state={state}
      >
        <input
          {...props}
          ref={ref}
          aria-describedby={resolveDescribedBy(helperId, messageId)}
          aria-invalid={state === 'error' ? true : undefined}
          className="pd-form-control__file"
          data-slot="file-input"
          disabled={disabled}
          id={inputId}
          required={required}
          type="file"
        />
      </div>

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
});
