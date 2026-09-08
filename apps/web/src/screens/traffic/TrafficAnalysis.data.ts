import type { DateRange } from '../../../../../contracts/ui-contract-types';
import { overviewDayCount, overviewShortDate } from '../command-center/CommandCenterScreen.data';
import type { TrafficTrendMode } from './TrafficScreen.data';

// Daily flow records. sessions/purchases/revenue are legitimately summable
// across days without double-counting. "Active users" is not (the same
// visitor can show up on several different days in the range), so it's
// modeled as a smooth function of the range's day-count instead, mirroring
// the same approach used for Customers' active-customer count.
export type TrafficDailyRecord = {
  readonly date: string;
  readonly sessions: number;
  readonly purchases: number;
  readonly revenue: number;
};

const trafficDailyWindowStart = '2026-06-01';
const trafficDailyWindowDays = 100; // 2026-06-01 .. 2026-09-08

function addDays(date: string, days: number): string {
  const next = new Date(`${date}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

// Raw shape (realistic day-to-day/weekday variation) generated first, then
// uniformly rescaled so the shell's default August 2026 window reproduces
// the historical KPI anchors (128 420 sessions, 1 188 220 zł revenue)
// exactly, while keeping the relative day-to-day pattern intact.
function rawShapeFor(i: number) {
  const dow = new Date(`${addDays(trafficDailyWindowStart, i)}T00:00:00Z`).getUTCDay();
  const weekday = dow !== 0 && dow !== 6;
  const growth = 1 + i * 0.0025;
  const wave = 1 + 0.16 * Math.sin(i * 0.4);
  const sessions = (weekday ? 4600 : 2900) * growth * wave;
  const crPct = 3.0 + 0.35 * Math.sin(i * 0.5 + 1);
  const revPerSession = 9.0 + 1.1 * Math.sin(i * 0.3 + 2);
  return { sessions, crPct, revPerSession };
}

const augustAnchorStart = 61; // index of 2026-08-01 within the window (June has 30 days + July 31)
const augustAnchorDays = 31;
const rawAugustSessions = Array.from({ length: augustAnchorDays }, (_, d) => rawShapeFor(augustAnchorStart + d).sessions)
  .reduce((sum, value) => sum + value, 0);
const sessionsScale = 128420 / rawAugustSessions;
const rawAugustRevenue = Array.from({ length: augustAnchorDays }, (_, d) => {
  const shape = rawShapeFor(augustAnchorStart + d);
  return shape.sessions * sessionsScale * shape.revPerSession;
}).reduce((sum, value) => sum + value, 0);
const revenueScale = 1188220 / rawAugustRevenue;

const unroundedTrafficRecords = Array.from({ length: trafficDailyWindowDays }, (_, i) => {
  const date = addDays(trafficDailyWindowStart, i);
  const shape = rawShapeFor(i);
  const sessions = Math.round(shape.sessions * sessionsScale);
  const purchases = Math.round(sessions * (shape.crPct / 100));
  const revenue = Math.round(sessions * shape.revPerSession * revenueScale);
  return { date, sessions, purchases, revenue };
});

// Per-day rounding drifts the August sum away from the exact anchor by a
// couple of units -- nudged back onto the last August day so the KPI
// scorecard reproduces the historical totals exactly, not just closely.
const augustSlice = unroundedTrafficRecords.slice(augustAnchorStart, augustAnchorStart + augustAnchorDays);
const sessionsResidual = 128420 - augustSlice.reduce((sum, day) => sum + day.sessions, 0);
const revenueResidual = 1188220 - augustSlice.reduce((sum, day) => sum + day.revenue, 0);
const lastAugustIndex = augustAnchorStart + augustAnchorDays - 1;

export const trafficDailyRecords: readonly TrafficDailyRecord[] = unroundedTrafficRecords.map((day, i) =>
  i === lastAugustIndex
    ? { ...day, sessions: day.sessions + sessionsResidual, revenue: day.revenue + revenueResidual }
    : day,
);

// Calibrated so the shell's default month-to-date August 2026 window
// (31 days) reproduces the historical anchor of 82 419 active users.
function periodActiveUsers(days: number): number {
  return Math.round(6954.1959 * Math.pow(Math.max(1, days), 0.72));
}

export type TrafficAnalysis = {
  readonly valid: boolean;
  readonly dayCount: number;
  readonly days: readonly TrafficDailyRecord[];
  readonly sessions: number;
  readonly purchases: number;
  readonly revenue: number;
  readonly activeUsers: number;
  readonly crPct: number;
  readonly revPerSession: number;
  readonly previous: {
    readonly sessions: number;
    readonly purchases: number;
    readonly revenue: number;
    readonly activeUsers: number;
    readonly crPct: number;
    readonly revPerSession: number;
  };
};

function periodTotals(days: readonly TrafficDailyRecord[], dayCount: number) {
  const sessions = days.reduce((sum, day) => sum + day.sessions, 0);
  const purchases = days.reduce((sum, day) => sum + day.purchases, 0);
  const revenue = days.reduce((sum, day) => sum + day.revenue, 0);
  const activeUsers = periodActiveUsers(dayCount);
  const crPct = sessions > 0 ? (purchases / sessions) * 100 : 0;
  const revPerSession = sessions > 0 ? revenue / sessions : 0;
  return { sessions, purchases, revenue, activeUsers, crPct, revPerSession };
}

export function deriveTrafficAnalysis(range: DateRange): TrafficAnalysis {
  const dayCount = overviewDayCount(range);
  const valid = dayCount > 0 && dayCount <= 366;
  const days = valid
    ? trafficDailyRecords.filter((day) => day.date >= range.from && day.date <= range.to)
    : [];
  const current = periodTotals(days, dayCount);

  const previousRange = {
    from: addDays(range.from, -dayCount),
    to: addDays(range.from, -1),
    timezone: range.timezone,
  };
  const previousDayCount = overviewDayCount(previousRange);
  const previousDays = trafficDailyRecords.filter((day) => day.date >= previousRange.from && day.date <= previousRange.to);
  const previous = periodTotals(previousDays, previousDayCount);

  return { valid, dayCount, days, ...current, previous };
}

// Used as a sensible default by components rendered standalone (Storybook
// section stories) outside TrafficScreen, matching the shell's own default
// fallback range (commandCenterDemoRange, August 2026).
export const defaultTrafficAnalysis: TrafficAnalysis = deriveTrafficAnalysis({
  from: '2026-08-01',
  to: '2026-08-31',
  timezone: 'Europe/Warsaw',
});

export type TrafficChartPoint = { readonly label: string; readonly current: number; readonly previous: number };

const dailyRecordsByDate = new Map(trafficDailyRecords.map((day) => [day.date, day]));

// CR / revenue-per-session are ratios -- a day-by-day ratio series is more
// legible than a running-total one, so those two modes compute a per-day
// ratio while sessions/purchases/revenue plot the day's own flow value.
// "Previous" is the matching day exactly one range-length earlier, giving a
// genuine period-over-period overlay.
export function trafficTrendChartData(analysis: TrafficAnalysis, mode: TrafficTrendMode): readonly TrafficChartPoint[] {
  return analysis.days.map((day) => {
    const previousDay = dailyRecordsByDate.get(addDays(day.date, -analysis.dayCount)) ?? day;
    const label = overviewShortDate(day.date);
    if (mode === 'cr') {
      return {
        label,
        current: day.sessions > 0 ? (day.purchases / day.sessions) * 100 : 0,
        previous: previousDay.sessions > 0 ? (previousDay.purchases / previousDay.sessions) * 100 : 0,
      };
    }
    if (mode === 'revPerSession') {
      return {
        label,
        current: day.sessions > 0 ? day.revenue / day.sessions : 0,
        previous: previousDay.sessions > 0 ? previousDay.revenue / previousDay.sessions : 0,
      };
    }
    if (mode === 'purchases') return { label, current: day.purchases, previous: previousDay.purchases };
    if (mode === 'revenue') return { label, current: day.revenue, previous: previousDay.revenue };
    if (mode === 'users') {
      // Active users has no daily record (non-additive) -- approximate the
      // daily chart point as a stable fraction of sessions.
      return { label, current: Math.round(day.sessions * 0.62), previous: Math.round(previousDay.sessions * 0.62) };
    }
    return { label, current: day.sessions, previous: previousDay.sessions };
  });
}
