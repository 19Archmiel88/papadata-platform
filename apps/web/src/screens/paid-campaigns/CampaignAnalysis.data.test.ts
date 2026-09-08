import { describe, expect, it } from 'vitest';
import {
  commandCenterDemoRange,
  commandCenterDemoSeed,
} from '../../fixtures/command-center/commandCenterDemoSeed';
import {
  aggregateCampaignDays,
  campaignBudgetScenario,
  campaignDemoDays,
  deriveCampaignAnalysis,
} from './CampaignAnalysis.data';

describe('Campaign analysis scope', () => {
  it('reconciles channel totals and daily spend with the business overview', () => {
    const result = deriveCampaignAnalysis(commandCenterDemoRange);
    const marketing = commandCenterDemoSeed.days
      .filter((d) => d.date >= commandCenterDemoRange.from && d.date <= commandCenterDemoRange.to)
      .reduce((sum, d) => sum + d.marketingSpend, 0);
    expect(result.current.spend).toBe(marketing);
    expect(result.rows.reduce((sum, r) => sum + (r.spend ?? 0), 0)).toBe(marketing);
    expect(result.points.reduce((sum, r) => sum + (r.spend ?? 0), 0)).toBe(marketing);
    expect(
      deriveCampaignAnalysis(commandCenterDemoRange, 'google_ads').current.spend +
        deriveCampaignAnalysis(commandCenterDemoRange, 'meta_ads').current.spend,
    ).toBe(marketing);
  });
  it('calculates weighted CAC and ROAS from sums, never averages campaign ratios', () => {
    const result = deriveCampaignAnalysis(commandCenterDemoRange);
    expect(result.current.ncac).toBe(result.current.spend / result.current.newCustomers);
    expect(result.current.roas).toBe(result.current.revenue / result.current.spend);
    expect(aggregateCampaignDays([]).ncac).toBeNull();
  });
  it('keeps table, trend and comparison inside a custom inclusive period', () => {
    const result = deriveCampaignAnalysis(
      { ...commandCenterDemoRange, from: '2026-08-10', to: '2026-08-16' },
      'meta_ads',
    );
    expect(result.points).toHaveLength(7);
    expect(result.previousRange).toMatchObject({ from: '2026-08-03', to: '2026-08-09' });
    expect(result.rows.every((r) => r.channel === 'meta_ads')).toBe(true);
  });
  it('flags missing observations instead of showing a complete comparison', () => {
    const result = deriveCampaignAnalysis(
      commandCenterDemoRange,
      'all',
      'previous_period',
      campaignDemoDays.filter(
        (_, index) => index !== campaignDemoDays.findIndex((d) => d.date === '2026-08-12'),
      ),
    );
    expect(result.complete).toBe(false);
    expect(
      deriveCampaignAnalysis({ ...commandCenterDemoRange, from: '2030-01-01', to: '2030-01-07' })
        .rows,
    ).toHaveLength(0);
  });
  it('computes budget scenarios arithmetically without inventing revenue uplift', () => {
    expect(campaignBudgetScenario(10000, -10, 10)).toEqual({
      spend: 9000,
      delta: -1000,
      daily: 900,
    });
    expect(campaignBudgetScenario(10000, 90, 10).spend).toBe(13000);
  });
});
