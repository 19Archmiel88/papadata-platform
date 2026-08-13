import type {
  InputHTMLAttributes,
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

export type VerificationCodeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  | 'children'
  | 'inputMode'
  | 'required'
  | 'size'
  | 'type'
  | 'value'
> & {
  readonly helperText?: string | null;
  readonly inputMode?: 'numeric' | 'text';
  readonly invalid?: boolean;
  readonly label: string;
  readonly length?: number;
  readonly masked?: boolean;
  readonly message?: string | null;
  readonly required?: boolean;
  readonly resendAvailableAt?: string | null;
  readonly status?: FormControlStatus;
  readonly valid?: boolean;
  readonly value: string;
};

export const VerificationCodeInput = forwardRef<
  HTMLInputElement,
  VerificationCodeInputProps
>(function VerificationCodeInput(
  {
    className,
    disabled = false,
    helperText = null,
    id,
    inputMode = 'numeric',
    invalid = false,
    label,
    length = 6,
    masked = false,
    message = null,
    readOnly = false,
    required = false,
    resendAvailableAt = null,
    status = 'default',
    valid = false,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `pd-code-input-${autoId}`;
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
  const normalizedValue = value.slice(0, length);

  return (
    <div
      className={joinClassNames('pd-verification-code', className)}
      data-component="VerificationCodeInput"
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
        <span className="pd-form-field__badge">
          {normalizedValue.length}/{length}
        </span>
      </label>

      <div
        className="pd-form-control pd-form-control--verification-code"
        data-invalid={state === 'error' ? true : undefined}
        data-state={state}
      >
        <input
          {...props}
          ref={ref}
          aria-describedby={resolveDescribedBy(helperId, messageId)}
          aria-invalid={state === 'error' ? true : undefined}
          autoComplete="one-time-code"
          className="pd-verification-code__input"
          data-slot="input"
          disabled={disabled}
          id={inputId}
          inputMode={inputMode}
          maxLength={length}
          pattern={inputMode === 'numeric' ? '[0-9]*' : undefined}
          readOnly={readOnly}
          required={required}
          spellCheck={false}
          type="text"
          value={normalizedValue}
        />

        <div
          aria-hidden="true"
          className="pd-verification-code__slots"
          style={{ ['--pd-code-length' as string]: length }}
        >
          {Array.from({ length }, (_, index) => {
            const character = normalizedValue[index] ?? '';
            const displayValue = masked && character
              ? '•'
              : character || '·';

            return (
              <span
                className="pd-verification-code__slot"
                data-filled={character.length > 0 ? true : undefined}
                data-state={state}
                key={`${inputId}-${index}`}
              >
                {displayValue}
              </span>
            );
          })}
        </div>
      </div>

      {helperText || message || resendAvailableAt ? (
        <div className="pd-verification-code__meta">
          {helperText ? (
            <div
              className="pd-verification-code__helper"
              id={helperId}
            >
              {helperText}
            </div>
          ) : null}

          {resendAvailableAt ? (
            <div className="pd-verification-code__resend">
              Ponowne wysłanie dostępne: {resendAvailableAt}
            </div>
          ) : null}

          {message ? (
            <div
              className="pd-verification-code__message"
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
