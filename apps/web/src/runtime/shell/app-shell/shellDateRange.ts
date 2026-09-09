import type { DatePreset, DateRange, Locale } from '../../../../../../contracts/ui-contract-types';

const shellDateRangeStorageKey = 'papadata.shell-date-range.v1';

const presetDayCounts = {
  last7d: 7,
  last30d: 30,
  last90d: 90,
  today: 1,
} satisfies Partial<Record<DatePreset, number>>;

export function createInitialShellDateRange(fallback?: DateRange): DateRange {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from'),
      to = params.get('to');
    if (from && to && isValidShellDateRange({ from, to })) {
      return { from, to, preset: 'custom', timezone: validatedShellTimezone(params.get('timezone')) ?? fallback?.timezone ?? readRuntimeTimezone() };
    }
  }
  return fallback ?? readStoredShellDateRange() ?? createShellDateRangeForPreset('monthToDate');
}

export function createShellDateRangeForPreset(
  preset: DatePreset,
  baseDate = new Date(),
): DateRange {
  const timezone = readRuntimeTimezone();

  if (preset === 'monthToDate') {
    return {
      from: formatDateInput(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)),
      preset,
      timezone,
      to: formatDateInput(baseDate),
    };
  }

  if (preset === 'yesterday') {
    const yesterday = shiftDate(baseDate, -1);

    return {
      from: formatDateInput(yesterday),
      preset,
      timezone,
      to: formatDateInput(yesterday),
    };
  }

  const days = getPresetDayCount(preset);

  return {
    from: formatDateInput(shiftDate(baseDate, -(days - 1))),
    preset,
    timezone,
    to: formatDateInput(baseDate),
  };
}

export function formatShellDateRangeLabel(range: DateRange, locale: Locale = 'pl'): string {
  const formatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'pl-PL', {
    day: '2-digit',
    month: 'short',
    timeZone: 'UTC',
  });
  const fromDate = parseInputDate(range.from);
  const toDate = parseInputDate(range.to);

  if (!fromDate || !toDate) {
    return `${range.from} - ${range.to}`;
  }

  return `${formatter.format(fromDate)} - ${formatter.format(toDate)}`;
}

export function getShellDateRangeDayCount(range: DateRange): number {
  const fromDate = parseInputDate(range.from);
  const toDate = parseInputDate(range.to);

  if (!fromDate || !toDate) {
    return getPresetDayCount(range.preset ?? 'custom');
  }

  const dayMs = 24 * 60 * 60 * 1_000;
  const diff = Math.round((toDate.getTime() - fromDate.getTime()) / dayMs);

  return Math.max(diff + 1, 1);
}

function getPresetDayCount(preset: DatePreset): number {
  switch (preset) {
    case 'last90d':
      return presetDayCounts.last90d;
    case 'last30d':
      return presetDayCounts.last30d;
    case 'last7d':
      return presetDayCounts.last7d;
    case 'today':
    case 'yesterday':
    case 'custom':
    case 'monthToDate':
    default:
      return presetDayCounts.today;
  }
}

export function getShellDateRangeKey(range: DateRange): string {
  return [range.from, range.to, range.preset ?? 'custom', range.timezone].join(':');
}

export function writeStoredShellDateRange(range: DateRange): void {
  if (typeof window === 'undefined' || !isValidShellDateRange(range)) {
    return;
  }

  try {
    window.localStorage.setItem(shellDateRangeStorageKey, JSON.stringify(range));
  } catch {
    // Storage is optional; runtime state remains in memory.
  }
}

function readStoredShellDateRange(): DateRange | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(shellDateRangeStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;

    return isDateRange(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function isDateRange(value: unknown): value is DateRange {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Partial<DateRange>;

  return (
    typeof candidate.from === 'string' &&
    typeof candidate.to === 'string' &&
    typeof candidate.timezone === 'string' &&
    isValidShellDateRange(candidate as DateRange)
  );
}

export function isValidShellDateRange(range: Pick<DateRange, 'from' | 'to'>): boolean {
  const from = parseInputDate(range.from),
    to = parseInputDate(range.to);
  if (!from || !to) return false;
  const days = (to.getTime() - from.getTime()) / 86_400_000 + 1;
  return days >= 1 && days <= 366;
}

function readRuntimeTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Warsaw';
}

function shiftDate(value: Date, days: number): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

function parseInputDate(value: string): Date | null {
  const date = new Date(`${value}T00:00:00.000Z`);

  return !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
    ? null
    : date;
}

function formatDateInput(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function validatedShellTimezone(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 100) return null;
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }).format(); return value; }
  catch { return null; }
}
