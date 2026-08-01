import type {
  InputHTMLAttributes,
  ReactNode,
} from 'react';
import {
  forwardRef,
  useId,
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

export type SwitchProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'children'
  | 'required'
  | 'type'
> & {
  readonly checked: boolean;
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: ReactNode;
  readonly message?: string | null;
  readonly pending?: boolean;
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
};

export const Switch = forwardRef<
  HTMLInputElement,
  SwitchProps
>(function Switch(
  {
    checked,
    className,
    disabled = false,
    helperText = null,
    id,
    invalid = false,
    label,
    message = null,
    pending = false,
    readOnly = false,
    required = false,
    status = 'default',
    valid = false,
    ...props
  },
  ref,
) {
    const autoId = useId();
    const inputId = id ?? `pd-switch-${autoId}`;
    const helperId = helperText
      ? `${inputId}-helper`
      : undefined;
    const messageId = message
      ? `${inputId}-message`
      : undefined;
    const state = resolveFormControlState({
      disabled: disabled || pending,
      invalid,
      readOnly,
      status,
      valid,
    });

    return (
      <div
        className={joinClassNames('pd-form-switch', className)}
        data-component="Switch"
        data-state={state}
      >
        <label
          className="pd-form-switch__label"
          data-checked={checked ? true : undefined}
          data-disabled={disabled ? true : undefined}
          data-pending={pending ? true : undefined}
          htmlFor={inputId}
        >
          <input
            {...props}
            ref={ref}
            aria-busy={pending ? true : undefined}
            aria-describedby={resolveDescribedBy(helperId, messageId)}
            aria-invalid={state === 'error' ? true : undefined}
            checked={checked}
            className="pd-form-switch__input"
            data-slot="input"
            disabled={disabled || pending}
            id={inputId}
            readOnly={readOnly}
            required={required}
            role="switch"
            type="checkbox"
          />
          <span
            aria-hidden="true"
            className="pd-form-switch__track"
          />
          <span className="pd-form-switch__text">
            <span className="pd-form-switch__caption">
              {label}
            </span>
            {helperText ? (
              <span
                className="pd-form-switch__helper"
                id={helperId}
              >
                {helperText}
              </span>
            ) : null}
          </span>
        </label>

        {message ? (
          <div
            className="pd-form-switch__message"
            data-state={state}
            id={messageId}
          >
            {message}
          </div>
        ) : null}
      </div>
    );
  },
);
