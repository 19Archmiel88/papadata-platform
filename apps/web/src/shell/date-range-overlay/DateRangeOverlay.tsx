import type {
  ReactElement,
} from 'react';
import type {
  DateRange,
} from '../../../../../contracts/ui-contract-types';

import {
  DateRangePicker,
} from '../../design-system';
import type {
  DateRangePickerPreset,
} from '../../design-system';
import type {
  PapaDataRuntimeLocale,
} from '../../design-system/foundations/runtime';
import {
  AnchoredShellOverlay,
} from '../overlays';
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
  return (
    <AnchoredShellOverlay
      className="pd-shell-topbar__calendar-overlay"
      description={copy.calendarDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={copy.calendar}
      trigger={trigger}
      width="wide"
    >
      <div className="pd-shell-date-range-overlay">
        <DateRangePicker
          className="pd-shell-date-range-overlay__picker"
          fromLabel={copy.dateFrom}
          helperText={copy.calendarHelper}
          label={copy.dateRange}
          locale={locale}
          onChange={onChange}
          presetLabel={copy.datePreset}
          presets={presets}
          quickOptions={quickOptions}
          quickOptionsLabel={copy.calendarQuickOptions}
          timezone={value.timezone}
          toLabel={copy.dateTo}
          value={value}
        />
      </div>
    </AnchoredShellOverlay>
  );
}
