import type { DateRange } from '../../../../../contracts/ui-contract-types';
import type {
  CommandCenterScreenData,
  OverviewComparison,
  OverviewDay,
  OverviewMetric,
  OverviewResult,
  OverviewTotals,
} from './CommandCenterScreen.model';

const dayMs = 86_400_000;
const dateValue = (date: string) => {
  const value = Date.parse(`${date}T12:00:00Z`);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(value) &&
    new Date(value).toISOString().slice(0, 10) === date
    ? value
    : NaN;
};
export const shiftOverviewDate = (date: string, days: number) =>
  new Date(dateValue(date) + days * dayMs).toISOString().slice(0, 10);
export const overviewDayCount = (range: Pick<DateRange, 'from' | 'to'>) =>
  Math.max(0, Math.round((dateValue(range.to) - dateValue(range.from)) / dayMs) + 1) || 0;

function previousYear(date: string): string {
  const d = new Date(dateValue(date));
  const month = d.getUTCMonth();
  d.setUTCFullYear(d.getUTCFullYear() - 1);
  if (d.getUTCMonth() !== month) d.setUTCDate(0);
  return d.toISOString().slice(0, 10);
}

export function overviewComparisonRange(
  range: DateRange,
  comparison: OverviewComparison,
): DateRange {
  return comparison === 'previous_year'
    ? { ...range, preset: 'custom', from: previousYear(range.from), to: previousYear(range.to) }
    : {
        ...range,
        preset: 'custom',
        from: shiftOverviewDate(range.from, -overviewDayCount(range)),
        to: shiftOverviewDate(range.from, -1),
      };
}

export const dayMargin = (day: OverviewDay) =>
  day.revenue - day.costOfGoods - day.fulfillmentCost - day.marketingSpend;
function totals(days: readonly OverviewDay[]): OverviewTotals {
  return days.reduce(
    (sum, day) => ({
      revenue: sum.revenue + day.revenue,
      costOfGoods: sum.costOfGoods + day.costOfGoods,
      fulfillmentCost: sum.fulfillmentCost + day.fulfillmentCost,
      marketingSpend: sum.marketingSpend + day.marketingSpend,
      newCustomers: sum.newCustomers + day.newCustomers,
      orders: sum.orders + day.orders,
      margin: sum.margin + dayMargin(day),
    }),
    {
      revenue: 0,
      costOfGoods: 0,
      fulfillmentCost: 0,
      marketingSpend: 0,
      newCustomers: 0,
      orders: 0,
      margin: 0,
    },
  );
}

export function deriveOverview(
  data: CommandCenterScreenData,
  range: DateRange,
  comparison: OverviewComparison,
  metric: OverviewMetric = 'margin',
): OverviewResult {
  const previousRange = overviewComparisonRange(range, comparison);
  const rows = data.days.filter((d) => d.date >= range.from && d.date <= range.to);
  const previousRows = data.days.filter(
    (d) => d.date >= previousRange.from && d.date <= previousRange.to,
  );
  const current = totals(rows),
    previous = totals(previousRows);
  const currentByDate = new Map(rows.map((d) => [d.date, d]));
  const previousByDate = new Map(previousRows.map((d) => [d.date, d]));
  const expectedDays = overviewDayCount(range);
  const metricValue = (d: OverviewDay | undefined) =>
    d ? (metric === 'margin' ? dayMargin(d) : d[metric]) : null;
  return {
    range,
    previousRange,
    current,
    previous,
    currentDays: rows.length,
    previousDays: previousRows.length,
    expectedDays,
    points: Array.from({ length: Math.min(expectedDays, 366) }, (_, index) => ({
      date: shiftOverviewDate(range.from, index),
      current: metricValue(currentByDate.get(shiftOverviewDate(range.from, index))),
      previous: metricValue(previousByDate.get(shiftOverviewDate(previousRange.from, index))),
    })),
    drivers: [
      {
        label: 'Sprzedaż netto',
        value: current.revenue - previous.revenue,
        explanation: 'Różnica sprzedaży netto, po zwrotach i bez VAT.',
      },
      {
        label: 'Koszt produktów',
        value: previous.costOfGoods - current.costOfGoods,
        explanation: 'Wzrost kosztu sprzedanych produktów zmniejsza marżę.',
      },
      {
        label: 'Realizacja zamówień',
        value: previous.fulfillmentCost - current.fulfillmentCost,
        explanation: 'Różnica kosztów dostawy, płatności i realizacji.',
      },
      {
        label: 'Koszt marketingu',
        value: previous.marketingSpend - current.marketingSpend,
        explanation: 'Różnica wydatków reklamowych; wyższy koszt zmniejsza marżę.',
      },
    ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value)),
  };
}

export function overviewChange(value: number, previous: number): number | null {
  return previous === 0 ? null : ((value - previous) / Math.abs(previous)) * 100;
}
export const overviewNumber = (value: number, decimals = 0) =>
  new Intl.NumberFormat('pl-PL', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
export const overviewMoney = (value: number) => `${overviewNumber(value)} zł`;
export const overviewShortDate = (date: string) =>
  Number.isFinite(dateValue(date))
    ? new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
        new Date(dateValue(date)),
      )
    : '—';
export const overviewRangeLabel = (range: Pick<DateRange, 'from' | 'to'>) =>
  overviewDayCount(range)
    ? `${overviewShortDate(range.from)} – ${overviewShortDate(range.to)} ${range.to.slice(0, 4)}`
    : 'Wybierz okres';
