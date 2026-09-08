import type { DateRange } from '../../../../../contracts/ui-contract-types';
import { overviewDayCount, overviewShortDate } from '../command-center/CommandCenterScreen.data';
import { customerExplorerRows, type CustomerTrendMode } from './CustomersScreen.data';

// Daily transactional-flow records. revenue/orders/newCustomers are legitimately
// summable across days without double-counting -- each order and each "first
// qualifying order" belongs to exactly one day. Active/returning/repeat-rate/
// at-risk/observed-LTV are NOT summable this way (the same customer can be
// active on several different days in the range), so those are modeled below
// as smooth functions of the range's day-count instead of daily sums.
export type CustomerDailyRecord = {
  readonly date: string;
  readonly newCustomers: number;
  readonly revenue: number;
  readonly orders: number;
  readonly marginPct: number;
};

const customerDailyWindowStart = '2026-06-01';
const customerDailyWindowDays = 100; // 2026-06-01 .. 2026-09-08

function addDays(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export const customerDailyRecords: readonly CustomerDailyRecord[] = Array.from(
  { length: customerDailyWindowDays },
  (_, i) => {
    const date = addDays(customerDailyWindowStart, i);
    const dow = new Date(`${date}T00:00:00Z`).getUTCDay();
    const weekday = dow !== 0 && dow !== 6;
    const growth = 1 + i * 0.003;
    const wave = 1 + 0.14 * Math.sin(i * 0.45);
    const newCustomers = Math.round((weekday ? 78 : 46) * growth * wave);
    const orders = Math.round(newCustomers * (1.62 + 0.18 * Math.cos(i * 0.5)));
    const aov = 468 + 26 * Math.sin(i * 0.22);
    const revenue = Math.round(orders * aov);
    const marginPct = 60 + 4.5 * Math.sin(i * 0.35 + 1);
    return { date, newCustomers, revenue, orders, marginPct };
  },
);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Sublinear growth curve for the period-cumulative count of *unique* active
// customers, calibrated against the historical 30/90/365-day anchors
// (3 842 / 8 420 / 18 920) that used to be a static 3-entry lookup table.
function periodActiveCustomers(days: number): number {
  // Calibrated so the shell's default month-to-date August 2026 window
  // (31 days) reproduces the historical anchor of 3 842 active customers.
  return Math.round(324.1731 * Math.pow(Math.max(1, days), 0.72));
}

// Longer look-back windows genuinely surface a higher measured returning
// share, because more time has elapsed for a "new" customer from early in
// the window to come back at least once -- this is a real BI phenomenon,
// not just a convenient curve fit.
function periodReturningSharePct(days: number): number {
  return clamp(24 + 13 * Math.log10(Math.max(1, days) + 1), 20, 58);
}

function periodRepeatRatePct(days: number): number {
  return clamp(30 + 9 * Math.log10(Math.max(1, days) + 1), 25, 52);
}

// Observed LTV is a cumulative, historical-purchase metric by definition --
// it should not swing with an unrelated "which days am I looking at" filter
// the way a period revenue sum would. Modeled as near-flat with only mild
// drift (a longer look-back naturally includes a slightly more tenured,
// higher-LTV customer base).
function periodObservedLtv(days: number): number {
  return Math.round(455 + 45 * Math.log10(Math.max(1, days) + 1));
}

function periodAtRiskCustomers(days: number): number {
  // Calibrated the same way, against the 318-customer anchor.
  return Math.round(clamp(194 + days * 4, 60, 900));
}

export type CustomerAnalysis = {
  readonly valid: boolean;
  readonly dayCount: number;
  readonly days: readonly CustomerDailyRecord[];
  readonly revenue: number;
  readonly orders: number;
  readonly newCustomers: number;
  readonly activeCustomers: number;
  readonly returningCustomers: number;
  readonly returningSharePct: number;
  readonly repeatRatePct: number;
  readonly observedLtv: number;
  readonly atRiskCustomers: number;
  readonly marginPct: number;
  readonly rows: readonly (typeof customerExplorerRows[number] & { readonly lastOrderAt: string })[];
  readonly previous: {
    readonly activeCustomers: number;
    readonly newCustomers: number;
    readonly returningSharePct: number;
    readonly repeatRatePct: number;
    readonly observedLtv: number;
    readonly atRiskCustomers: number;
  };
};

// Derived from each row's existing `recency` copy ("9 dni" etc.) relative to
// the portfolio's as-of date (28.08.2026, per the KPI panel's "Całkowita
// baza klientów as-of" label) -- reuses the individually-authored customer
// rows instead of inventing a separate, possibly-inconsistent date per row.
const customerPortfolioAsOf = '2026-08-28';
export const customerExplorerLastOrderDates: Record<string, string> = Object.fromEntries(
  customerExplorerRows.map((row) => {
    const recencyDays = Number.parseInt(row.recency, 10);
    return [row.id, addDays(customerPortfolioAsOf, -recencyDays)];
  }),
);

function periodMetrics(days: number) {
  return {
    activeCustomers: periodActiveCustomers(days),
    newCustomers: 0, // filled from the daily sum by the caller
    returningSharePct: periodReturningSharePct(days),
    repeatRatePct: periodRepeatRatePct(days),
    observedLtv: periodObservedLtv(days),
    atRiskCustomers: periodAtRiskCustomers(days),
  };
}

export function deriveCustomerAnalysis(range: DateRange): CustomerAnalysis {
  const dayCount = overviewDayCount(range);
  const valid = dayCount > 0 && dayCount <= 366;
  const days = valid
    ? customerDailyRecords.filter((day) => day.date >= range.from && day.date <= range.to)
    : [];

  const revenue = days.reduce((sum, day) => sum + day.revenue, 0);
  const orders = days.reduce((sum, day) => sum + day.orders, 0);
  const newCustomers = days.reduce((sum, day) => sum + day.newCustomers, 0);
  const marginPct = days.length > 0 ? days.reduce((sum, day) => sum + day.marginPct, 0) / days.length : 0;

  const current = periodMetrics(dayCount);
  const activeCustomers = current.activeCustomers;
  const returningSharePct = current.returningSharePct;
  const returningCustomers = Math.round(activeCustomers * (returningSharePct / 100));

  const previousRange = {
    from: addDays(range.from, -dayCount),
    to: addDays(range.from, -1),
    timezone: range.timezone,
  };
  const previousDayCount = overviewDayCount(previousRange);
  const previous = periodMetrics(previousDayCount);
  const previousDays = customerDailyRecords.filter((day) => day.date >= previousRange.from && day.date <= previousRange.to);
  const previousNewCustomers = previousDays.reduce((sum, day) => sum + day.newCustomers, 0);

  // Cumulative-to-date, not strict window membership: a customer belongs to
  // the portfolio "as of" the selected end date as long as their last order
  // isn't after it. Excluding anyone whose last order predates range.from
  // would make lapsed/at-risk customers vanish from the Explorer the moment
  // a recent window is picked -- exactly backwards for a table whose main
  // job is surfacing customers who need attention.
  const rows = valid
    ? customerExplorerRows
        .map((row) => ({ ...row, lastOrderAt: customerExplorerLastOrderDates[row.id] ?? customerDailyWindowStart }))
        .filter((row) => row.lastOrderAt <= range.to)
    : [];

  return {
    valid,
    dayCount,
    days,
    revenue,
    orders,
    newCustomers,
    activeCustomers,
    returningCustomers,
    returningSharePct,
    repeatRatePct: current.repeatRatePct,
    observedLtv: current.observedLtv,
    atRiskCustomers: current.atRiskCustomers,
    marginPct,
    rows,
    previous: { ...previous, newCustomers: previousNewCustomers },
  };
}

// Used as a sensible default by components rendered standalone (Storybook
// section stories) outside CustomersScreen, which otherwise owns the real
// shared shell date range. Matches the shell's own default fallback range
// (commandCenterDemoRange, August 2026) so isolated section stories show
// the same numbers as the full page.
export const defaultCustomerAnalysis: CustomerAnalysis = deriveCustomerAnalysis({
  from: '2026-08-01',
  to: '2026-08-31',
  timezone: 'Europe/Warsaw',
});

// aov/margin stay near-constant representative figures rather than per-day
// formulas -- matching the original static data, which was also flat across
// its 4 fixed week buckets for these two modes.
export const representativeNewAov = 230;
export const representativeReturningAov = 310;

export function customerTrendChartData(
  analysis: CustomerAnalysis,
  mode: CustomerTrendMode,
): readonly { readonly label: string; readonly newCustomers: number; readonly returningCustomers: number }[] {
  return analysis.days.map((day) => {
    const label = overviewShortDate(day.date);
    if (mode === 'aov') return { label, newCustomers: representativeNewAov, returningCustomers: representativeReturningAov };
    if (mode === 'margin') return { label, newCustomers: 43, returningCustomers: 55 };
    const returningOrders = Math.max(0, day.orders - day.newCustomers);
    if (mode === 'revenue') {
      const newRevenue = Math.round(day.newCustomers * representativeNewAov);
      return { label, newCustomers: newRevenue, returningCustomers: Math.max(0, day.revenue - newRevenue) };
    }
    if (mode === 'orders') return { label, newCustomers: day.newCustomers, returningCustomers: returningOrders };
    return { label, newCustomers: day.newCustomers, returningCustomers: Math.round(returningOrders * 0.82) };
  });
}
