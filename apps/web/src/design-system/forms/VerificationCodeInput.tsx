import {
  forwardRef,
  type ChangeEvent,
} from 'react';

import '../primitives/papadata-primitives.css';

const VERIFICATION_CODE_LENGTH = 6;

export type VerificationCodeInputProps = {
  ariaLiveMessage?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  errorMessage?: string;
  hint?: string;
  id: string;
  invalid?: boolean;
  label: string;
  name: string;
  onChange: (value: string) => void;
  value: string;
};

export const VerificationCodeInput = forwardRef<
  HTMLInputElement,
  VerificationCodeInputProps
>(function VerificationCodeInput(
  {
    ariaLiveMessage,
    autoFocus,
    disabled = false,
    errorMessage,
    hint,
    id,
    invalid = false,
    label,
    name,
    onChange,
    value,
  },
  ref,
) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = invalid && errorMessage ? `${id}-error` : undefined;
  const liveId = ariaLiveMessage ? `${id}-live` : undefined;
  const describedBy = [hintId, errorId, liveId]
    .filter((describedId): describedId is string => Boolean(describedId))
    .join(' ');

  const digits = value.padEnd(VERIFICATION_CODE_LENGTH, ' ').slice(0, 6);
  const activeIndex = Math.min(value.length, VERIFICATION_CODE_LENGTH - 1);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(
      event.target.value
        .replace(/\D/g, '')
        .slice(0, VERIFICATION_CODE_LENGTH),
    );
  };

  return (
    <div
      className={`pds-code${
        invalid ? ' is-invalid' : ''
      }${disabled ? ' is-disabled' : ''}`}
    >
      <label className="pds-field__label" htmlFor={id}>
        {label}
      </label>

      <span className="pds-code__control">
        <input
          aria-describedby={describedBy || undefined}
          aria-invalid={invalid || undefined}
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          className="pds-code__input"
          disabled={disabled}
          id={id}
          inputMode="numeric"
          maxLength={VERIFICATION_CODE_LENGTH}
          name={name}
          onChange={handleChange}
          pattern="[0-9]{6}"
          ref={ref}
          type="text"
          value={value}
        />

        <span
          aria-hidden="true"
          className="pds-code__segments"
        >
          {Array.from({ length: VERIFICATION_CODE_LENGTH }, (_, index) => {
            const digit = (digits[index] ?? '').trim();
            const segmentClassName = [
              'pds-code__segment',
              digit ? 'has-value' : '',
              !disabled && index === activeIndex ? 'is-active' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <span className={segmentClassName} key={index}>
                {digit}
              </span>
            );
          })}
        </span>
      </span>

      {hint ? (
        <span className="pds-code__hint" id={hintId}>
          {hint}
        </span>
      ) : null}

      {invalid && errorMessage ? (
        <span className="pds-code__error" id={errorId}>
          {errorMessage}
        </span>
      ) : null}

      {ariaLiveMessage ? (
        <span
          className="pds-sr-only"
          id={liveId}
          role="status"
          aria-live="polite"
        >
          {ariaLiveMessage}
        </span>
      ) : null}
    </div>
  );
});

export const CodeInput = VerificationCodeInput;
