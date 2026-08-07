import type {
  TextareaHTMLAttributes,
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

export type TextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'children'
  | 'required'
  | 'value'
> & {
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly message?: string | null;
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
  readonly value: string;
};

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(function Textarea(
  {
    className,
    disabled = false,
    helperText = null,
    id,
    invalid = false,
    label,
    message = null,
    readOnly = false,
    required = false,
    rows = 5,
    status = 'default',
    valid = false,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `pd-textarea-${autoId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const messageId = message ? `${inputId}-message` : undefined;
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
      data-component="Textarea"
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
        className="pd-form-control pd-form-control--textarea"
        data-invalid={state === 'error' ? true : undefined}
        data-readonly={readOnly ? true : undefined}
        data-state={state}
      >
        <textarea
          {...props}
          ref={ref}
          aria-describedby={resolveDescribedBy(helperId, messageId)}
          aria-invalid={state === 'error' ? true : undefined}
          className="pd-form-control__textarea"
          data-slot="textarea"
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          required={required}
          rows={rows}
          value={value}
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
