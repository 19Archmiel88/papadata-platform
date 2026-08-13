import type {
  ChangeEvent,
  FieldsetHTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import type {
  DatePreset,
  DateRange,
} from '../../../../../../contracts/ui-contract-types';
import type {
  PapaDataRuntimeLocale,
} from '../../foundations';
import {
  joinClassNames,
  resolveDescribedBy,
  resolveFormControlState,
} from '../Field/fieldUtils';
import type {
  FormControlStatus,
} from '../Field/fieldUtils';
import {
  Select,
} from '../Select';
import '../Field/field.css';
import './date-range-picker.css';

export type DateRangePickerPreset = {
  readonly label: string;
  readonly value: DatePreset;
};

export type DateRangePickerProps = Omit<
  FieldsetHTMLAttributes<HTMLFieldSetElement>,
  'children' | 'onChange'
> & {
  readonly fromLabel?: string;
  readonly helperText?: string | null;
  readonly invalid?: boolean;
  readonly label: string;
  readonly locale?: PapaDataRuntimeLocale;
  readonly message?: string | null;
  readonly onChange?:
    | ((
      value: DateRange,
    ) => void)
    | undefined;
  readonly presetLabel?: string;
  readonly presets: readonly DateRangePickerPreset[];
  readonly readOnly?: boolean;
  readonly status?: FormControlStatus;
  readonly timezone: string;
  readonly toLabel?: string;
  readonly valid?: boolean;
  readonly value: DateRange;
};

export const DateRangePicker = forwardRef<
  HTMLFieldSetElement,
  DateRangePickerProps
>(function DateRangePicker(
  {
    className,
    disabled = false,
    fromLabel = 'Od',
    helperText = null,
    id,
    invalid = false,
    label,
    locale = 'pl',
    message = null,
    onChange,
    presetLabel = 'Zakres',
    presets,
    readOnly = false,
    status = 'default',
    timezone,
    toLabel = 'Do',
    valid = false,
    value,
    ...props
  },
  ref,
) {
  const autoId = useId();
  const fieldsetId = id ?? `pd-date-range-${autoId}`;
  const legendId = `${fieldsetId}-legend`;
  const helperId = helperText ? `${fieldsetId}-helper` : undefined;
  const messageId = message ? `${fieldsetId}-message` : undefined;
  const state = resolveFormControlState({
    disabled,
    invalid,
    readOnly,
    status,
    valid,
  });
  const describedBy = resolveDescribedBy(helperId, messageId);

  function updateRange(nextValue: Partial<DateRange>) {
    onChange?.({
      ...value,
      timezone,
      ...nextValue,
    });
  }

  function handlePresetChange(event: ChangeEvent<HTMLSelectElement>) {
    updateRange({
      preset: event.currentTarget.value as DatePreset,
    });
  }

  function handleFromChange(event: ChangeEvent<HTMLInputElement>) {
    updateRange({
      from: event.currentTarget.value,
      preset: 'custom',
    });
  }

  function handleToChange(event: ChangeEvent<HTMLInputElement>) {
    updateRange({
      preset: 'custom',
      to: event.currentTarget.value,
    });
  }

  return (
    <fieldset
      {...props}
      ref={ref}
      aria-describedby={describedBy}
      aria-labelledby={legendId}
      className={joinClassNames('pd-date-range-picker', className)}
      data-state={state}
      disabled={disabled}
      id={fieldsetId}
    >
      <legend id={legendId}>{label}</legend>

      <div className="pd-date-range-picker__preset">
        <Select
          disabled={disabled}
          invalid={invalid}
          label={presetLabel}
          locale={locale}
          onChange={handlePresetChange}
          options={presets}
          placeholder={presetLabel}
          readOnly={readOnly}
          status={status}
          valid={valid}
          value={value.preset ?? 'custom'}
        />
      </div>

      <label>
        <span>{fromLabel}</span>
        <input
          disabled={disabled || readOnly}
          readOnly={readOnly}
          type="date"
          value={value.from}
          onChange={handleFromChange}
        />
      </label>

      <label>
        <span>{toLabel}</span>
        <input
          disabled={disabled || readOnly}
          readOnly={readOnly}
          type="date"
          value={value.to}
          onChange={handleToChange}
        />
      </label>

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
    </fieldset>
  );
});
