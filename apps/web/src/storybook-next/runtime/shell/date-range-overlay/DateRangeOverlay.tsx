import type {
  ReactElement,
} from 'react';
import type {
  DatePreset,
  DateRange,
} from '../../../../../../../contracts/ui-contract-types';

import type {
  DateRangePickerPreset,
} from '../../../../design-system/index';
import type {
  PapaDataRuntimeLocale,
} from '../../../../design-system/foundations/runtime/index';
import {
  AnchoredShellOverlay,
} from '../overlays/index';
import './date-range-overlay.css';

export type DateRangeOverlayCopy = {
  readonly calendar: string;
  readonly calendarDescription: string;
  readonly calendarHelper: string;
  readonly calendarQuickOptions: string;
  readonly dateFrom: string;
  readonly datePreset: string;
  readonly dateRange: string;
  readonly dateTo: string;
};

export type DateRangeOverlayProps = {
  readonly copy: DateRangeOverlayCopy;
  readonly locale: PapaDataRuntimeLocale;
  readonly onChange: (range: DateRange) => void;
  readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean;
  readonly presets: readonly DateRangePickerPreset[];
  readonly quickOptions: readonly DateRangePickerPreset[];
  readonly trigger: ReactElement;
  readonly value: DateRange;
};

export function DateRangeOverlay({
  copy,
  locale,
  onChange,
  onOpenChange,
  open,
  presets,
  quickOptions,
  trigger,
  value,
}: DateRangeOverlayProps) {
  const activePreset = value.preset ?? 'custom';
  const activePresetLabel = presets.find((preset) => (
    preset.value === activePreset
  ))?.label ?? copy.datePreset;

  function updateRange(nextValue: Partial<DateRange>) {
    onChange({
      ...value,
      timezone: value.timezone,
      ...nextValue,
    });
  }

  function applyPreset(preset: DatePreset) {
    if (preset === 'custom') {
      updateRange({ preset });
      return;
    }

    updateRange(resolveDatePresetRange(preset));
  }

  return (
    <AnchoredShellOverlay
      className="pd-shell-topbar__calendar-overlay"
      description={copy.calendarDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.calendar}
      trigger={trigger}
      width="medium"
    >
      <div className="pd-shell-date-range-overlay">
        <div className="pd-shell-date-range-overlay__summary">
          <span>{copy.dateRange}</span>
          <strong>
            {formatDateInputLabel(value.from, locale)}
            {' - '}
            {formatDateInputLabel(value.to, locale)}
          </strong>
          <small>{activePresetLabel}</small>
        </div>

        <div
          aria-label={copy.calendarQuickOptions}
          className="pd-shell-date-range-overlay__quick-options"
          role="group"
        >
          {quickOptions.map((option) => (
            <button
              aria-pressed={activePreset === option.value}
              key={option.value}
              onClick={() => applyPreset(option.value)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <label className="pd-shell-date-range-overlay__preset">
          <span>{copy.datePreset}</span>
          <select
            onChange={(event) => applyPreset(event.currentTarget.value as DatePreset)}
            value={activePreset}
          >
            {presets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        </label>

        <div className="pd-shell-date-range-overlay__custom-range">
          <label>
            <span>{copy.dateFrom}</span>
            <input
              onChange={(event) => updateRange({
                from: event.currentTarget.value,
                preset: 'custom',
              })}
              type="date"
              value={value.from}
            />
          </label>
          <label>
            <span>{copy.dateTo}</span>
            <input
              onChange={(event) => updateRange({
                preset: 'custom',
                to: event.currentTarget.value,
              })}
              type="date"
              value={value.to}
            />
          </label>
        </div>

        <p className="pd-shell-date-range-overlay__helper">
          {copy.calendarHelper}
        </p>
      </div>
    </AnchoredShellOverlay>
  );
}

function resolveDatePresetRange(
  preset: DatePreset,
): Pick<DateRange, 'from' | 'preset' | 'to'> {
  const today = new Date();

  if (preset === 'monthToDate') {
    return {
      from: formatDateInput(
        new Date(today.getFullYear(), today.getMonth(), 1),
      ),
      preset,
      to: formatDateInput(today),
    };
  }

  if (preset === 'yesterday') {
    const yesterday = shiftDate(today, -1);

    return {
      from: formatDateInput(yesterday),
      preset,
      to: formatDateInput(yesterday),
    };
  }

  const days = preset === 'last90d'
    ? 90
    : preset === 'last30d'
      ? 30
      : preset === 'last7d'
        ? 7
        : 1;

  return {
    from: formatDateInput(shiftDate(today, -(days - 1))),
    preset,
    to: formatDateInput(today),
  };
}

function shiftDate(value: Date, days: number): Date {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate() + days,
  );
}

function formatDateInput(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateInputLabel(value: string, locale: PapaDataRuntimeLocale) {
  const date = new Date(`${value}T00:00:00`);
  if (!Number.isFinite(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
