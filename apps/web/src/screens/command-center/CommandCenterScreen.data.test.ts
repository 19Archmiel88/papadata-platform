import { describe, expect, it } from 'vitest';
import {
  commandCenterDemoRange,
  commandCenterDemoSeed,
} from '../../fixtures/command-center/commandCenterDemoSeed';
import {
  deriveOverview,
  overviewChange,
  overviewComparisonRange,
  overviewDayCount,
  overviewRangeLabel,
} from './CommandCenterScreen.data';

describe('Business overview — one scope for metrics, trend and explanation', () => {
  it('handles incomplete input and rejects normalized impossible calendar dates', () => {
    for (const from of ['', '2026-02-30', 'invalid']) {
      const range = { from, to: '2026-03-10' };
      expect(overviewDayCount(range)).toBe(0);
      expect(overviewRangeLabel(range)).toBe('Wybierz okres');
    }
  });
  it('reconciles daily margin, aggregate margin and each driver contribution', () => {
    const result = deriveOverview(commandCenterDemoSeed, commandCenterDemoRange, 'previous_period');
    expect(result.current.margin).toBe(
      result.current.revenue -
        result.current.costOfGoods -
        result.current.fulfillmentCost -
        result.current.marketingSpend,
    );
    expect(result.points.reduce((sum, point) => sum + (point.current ?? 0), 0)).toBe(
      result.current.margin,
    );
    expect(result.drivers.reduce((sum, driver) => sum + driver.value, 0)).toBe(
      result.current.margin - result.previous.margin,
    );
  });
  it('filters an inclusive custom period and compares with the preceding same-length period', () => {
    const range = { ...commandCenterDemoRange, from: '2026-08-10', to: '2026-08-16' };
    const result = deriveOverview(commandCenterDemoSeed, range, 'previous_period');
    expect(result.currentDays).toBe(7);
    expect(result.previousRange).toMatchObject({ from: '2026-08-03', to: '2026-08-09' });
    expect(result.points[0].date).toBe('2026-08-10');
    expect(result.current.revenue).toBe(
      commandCenterDemoSeed.days
        .filter((d) => d.date >= range.from && d.date <= range.to)
        .reduce((sum, d) => sum + d.revenue, 0),
    );
  });
  it('keeps missing observations distinct from zero in both periods', () => {
    const data = {
      ...commandCenterDemoSeed,
      days: commandCenterDemoSeed.days.filter(
        (d) => d.date !== '2026-08-12' && d.date !== '2026-07-05',
      ),
    };
    const result = deriveOverview(data, commandCenterDemoRange, 'previous_period');
    expect(result.currentDays).toBe(30);
    expect(result.previousDays).toBe(30);
    expect(result.points[11].current).toBeNull();
    expect(result.points[4].previous).toBeNull();
  });
  it('does not fabricate a percent change when the comparison is zero', () => {
    expect(overviewChange(100, 0)).toBeNull();
    expect(overviewChange(-80, -100)).toBe(20);
  });
  it('clamps leap day to the final valid day of the previous year', () => {
    expect(
      overviewComparisonRange(
        { ...commandCenterDemoRange, from: '2024-02-01', to: '2024-02-29' },
        'previous_year',
      ),
    ).toMatchObject({ from: '2023-02-01', to: '2023-02-28' });
  });
  it('returns an empty period without substituting the full demo dataset', () => {
    const result = deriveOverview(
      commandCenterDemoSeed,
      { ...commandCenterDemoRange, from: '2030-01-01', to: '2030-01-07' },
      'previous_period',
    );
    expect(result.currentDays).toBe(0);
    expect(result.current.revenue).toBe(0);
    expect(result.points.every((p) => p.current === null)).toBe(true);
  });
});
