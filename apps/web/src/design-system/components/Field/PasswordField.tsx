import type {
  ButtonHTMLAttributes,
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

type PasswordRequirement = {
  readonly id: string;
  readonly label: string;
  readonly met: boolean;
};

export type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'autoComplete'
  | 'children'
  | 'required'
  | 'size'
  | 'type'
  | 'value'
> & {
  readonly autocomplete?: 'current-password' | 'new-password';
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly message?: string | null;
  readonly onVisibilityChange?: (visible: boolean) => void;
  readonly requirements?: readonly PasswordRequirement[];
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly strength?: number | null;
  readonly toggleButtonProps?: Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'children' | 'type'
  >;
  readonly value: string;
  readonly valid?: boolean;
  readonly visible?: boolean;
  readonly visibilityLabelHidden?: string;
  readonly visibilityLabelVisible?: string;
};

export const PasswordField = forwardRef<
  HTMLInputElement,
  PasswordFieldProps
>(function PasswordField(
  {
    autocomplete = 'current-password',
    className,
    disabled = false,
    helperText = null,
    id,
    invalid = false,
    label,
    message = null,
    onVisibilityChange,
    readOnly = false,
    requirements = [],
    required = false,
    status = 'default',
    strength = null,
    toggleButtonProps,
    valid = false,
    value,
    visibilityLabelHidden = 'Pokaż hasło',
    visibilityLabelVisible = 'Ukryj hasło',
    visible = false,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `pd-password-field-${autoId}`;
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
  const toggleLabel = visible
    ? visibilityLabelVisible
    : visibilityLabelHidden;
  const normalizedStrength = strength === null
    ? null
    : Math.max(0, Math.min(100, strength));

  return (
    <div
      className={joinClassNames('pd-form-field', className)}
      data-component="PasswordField"
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
        <input
          {...props}
          ref={ref}
          aria-describedby={resolveDescribedBy(helperId, messageId)}
          aria-invalid={state === 'error' ? true : undefined}
          autoComplete={autocomplete}
          className="pd-form-control__input"
          data-slot="input"
          disabled={disabled}
          id={inputId}
          readOnly={readOnly}
          required={required}
          type={visible ? 'text' : 'password'}
          value={value}
        />

        <button
          {...toggleButtonProps}
          aria-controls={inputId}
          aria-label={toggleLabel}
          className={joinClassNames(
            'pd-form-control__toggle',
            toggleButtonProps?.className,
          )}
          data-slot="visibility-toggle"
          disabled={disabled}
          onClick={(event) => {
            toggleButtonProps?.onClick?.(event);

            if (!event.defaultPrevented) {
              onVisibilityChange?.(!visible);
            }
          }}
          type="button"
        >
          {toggleLabel}
        </button>
      </div>

      {normalizedStrength !== null || requirements.length > 0 ? (
        <div className="pd-form-control__strength">
          {normalizedStrength !== null ? (
            <div
              aria-hidden="true"
              className="pd-form-control__strength-bar"
            >
              <span
                className="pd-form-control__strength-fill"
                style={{ width: `${normalizedStrength}%` }}
              />
            </div>
          ) : null}

          {requirements.length > 0 ? (
            <ul className="pd-form-control__requirements">
              {requirements.map((requirement) => (
                <li
                  data-met={requirement.met ? true : undefined}
                  key={requirement.id}
                >
                  {requirement.label}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

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
