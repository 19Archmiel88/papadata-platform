import type {
  FieldsetHTMLAttributes,
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

export type RadioGroupOption = {
  readonly disabled?: boolean;
  readonly helperText?: string | null;
  readonly label: ReactNode;
  readonly value: string;
};

export type RadioGroupProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  | 'children'
  | 'onChange'
> & {
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly message?: string | null;
  readonly name?: string;
  readonly onValueChange?: (value: string) => void;
  readonly options: readonly RadioGroupOption[];
  readonly required?: boolean;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
  readonly value: string | null;
};

export const RadioGroup = forwardRef<
  HTMLFieldSetElement,
  RadioGroupProps
>(function RadioGroup(
  {
    className,
    disabled = false,
    helperText = null,
    id,
    invalid = false,
    label,
    message = null,
    name,
    onValueChange,
    options,
    required = false,
    status = 'default',
    valid = false,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const groupId = id ?? `pd-radio-group-${autoId}`;
  const legendId = `${groupId}-legend`;
  const helperId = helperText
    ? `${groupId}-helper`
    : undefined;
  const messageId = message
    ? `${groupId}-message`
    : undefined;
  const state = resolveFormControlState({
    disabled,
    invalid,
    readOnly: false,
    status,
    valid,
  });
  const resolvedName = name ?? groupId;

  return (
    <fieldset
      {...props}
      ref={ref}
      aria-describedby={resolveDescribedBy(helperId, messageId)}
      aria-invalid={state === 'error' ? true : undefined}
      aria-labelledby={legendId}
      className={joinClassNames(
        'pd-form-field',
        'pd-radio-group',
        className,
      )}
      data-component="RadioGroup"
      data-state={state}
      disabled={disabled}
      id={groupId}
    >
      <legend className="pd-form-field__label-row" id={legendId}>
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
      </legend>

      <div className="pd-radio-group__options" role="presentation">
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;

          return (
            <label
              className="pd-form-check__label"
              data-checked={value === option.value ? true : undefined}
              data-disabled={disabled || option.disabled ? true : undefined}
              htmlFor={optionId}
              key={option.value}
            >
              <input
                checked={value === option.value}
                className="pd-form-check__input"
                data-slot="input"
                disabled={disabled || option.disabled}
                id={optionId}
                name={resolvedName}
                onChange={(event) => {
                  if (event.currentTarget.checked) {
                    onValueChange?.(option.value);
                  }
                }}
                required={required}
                type="radio"
                value={option.value}
              />
              <span
                aria-hidden="true"
                className="pd-form-check__control"
              />
              <span className="pd-form-check__text">
                <span className="pd-form-check__caption">
                  {option.label}
                </span>
                {option.helperText ? (
                  <span className="pd-form-check__helper">
                    {option.helperText}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
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
    </fieldset>
  );
});
