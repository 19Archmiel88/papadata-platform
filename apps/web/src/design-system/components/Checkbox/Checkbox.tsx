import type {
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
} from 'react';

import '../Field/field.css';
import {
  joinClassNames,
  resolveDescribedBy,
  resolveFormControlState,
} from '../Field/fieldUtils';
import type {
  FormControlStatus,
} from '../Field/fieldUtils';

export type CheckboxProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'children'
  | 'required'
  | 'type'
  | 'value'
> & {
  readonly checked: boolean;
  readonly helperText?: string | null;
  readonly indeterminate?: boolean;
  readonly invalid?: boolean;
  readonly label: ReactNode;
  readonly message?: string | null;
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
  readonly value: string;
};

export const Checkbox = forwardRef<
  HTMLInputElement,
  CheckboxProps
>(function Checkbox(
  {
    checked,
    className,
    disabled = false,
    helperText = null,
    id,
    indeterminate = false,
    invalid = false,
    label,
    message = null,
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
  const inputId = id ?? `pd-checkbox-${autoId}`;
  const helperId = helperText
    ? `${inputId}-helper`
    : undefined;
  const messageId = message
    ? `${inputId}-message`
    : undefined;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const state = resolveFormControlState({
    disabled,
    invalid,
    readOnly,
    status,
    valid,
  });

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div
      className={joinClassNames('pd-form-check', className)}
      data-component="Checkbox"
      data-state={state}
    >
      <label
        className="pd-form-check__label"
        data-checked={checked ? true : undefined}
        data-disabled={disabled ? true : undefined}
        data-indeterminate={indeterminate ? true : undefined}
        htmlFor={inputId}
      >
        <input
          {...props}
          ref={(node) => {
            inputRef.current = node;

            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          aria-describedby={resolveDescribedBy(helperId, messageId)}
          aria-invalid={state === 'error' ? true : undefined}
          checked={checked}
          className="pd-form-check__input"
          data-slot="input"
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          required={required}
          type="checkbox"
          value={value}
        />
        <span
          aria-hidden="true"
          className="pd-form-check__control"
        />
        <span className="pd-form-check__text">
          <span className="pd-form-check__caption">
            {label}
          </span>
        </span>
      </label>

      {helperText || message ? (
        <div className="pd-form-check__meta">
          {helperText ? (
            <div
              className="pd-form-check__helper"
              id={helperId}
            >
              {helperText}
            </div>
          ) : null}

          {message ? (
            <div
              className="pd-form-check__message"
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
