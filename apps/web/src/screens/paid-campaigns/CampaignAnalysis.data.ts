import type { DateRange } from '../../../../../contracts/ui-contract-types';
import { paidCampaignsCampaigns } from '../../fixtures/paid-campaigns/paidCampaignsDemoSeed';
import { commandCenterDemoSeed } from '../../fixtures/command-center/commandCenterDemoSeed';
import {
  overviewComparisonRange,
  overviewDayCount,
  shiftOverviewDate,
} from '../command-center/CommandCenterScreen.data';

export type CampaignChannel = 'all' | 'google_ads' | 'meta_ads';
export type CampaignDay = {
  readonly date: string;
  readonly campaignId: string;
  readonly spend: number;
  readonly revenue: number;
  readonly newCustomers: number;
};
export type CampaignIdentity = {
  readonly id: string;
  readonly name: string;
  readonly channel: Exclude<CampaignChannel, 'all'>;
  readonly costCoverage: number;
  readonly cacGoal: number;
};
export type CampaignTotals = {
  readonly spend: number;
  readonly revenue: number;
  readonly newCustomers: number;
  readonly roas: number | null;
  readonly ncac: number | null;
};
export type CampaignResult = CampaignIdentity & CampaignTotals & { readonly needsReview: boolean };
export type CampaignAnalysis = ReturnType<typeof deriveCampaignAnalysis>;
export const campaignIdentities: readonly CampaignIdentity[] = paidCampaignsCampaigns.map(
  (campaign) => ({
    id: campaign.id,
    name: campaign.name.replace(/^(Google|Meta) — /, ''),
    channel: campaign.platform,
    costCoverage: campaign.id === 'm_camp_104922' ? 82 : 100,
    cacGoal: 100,
  }),
);

// Deterministic demo observations. Daily spend reconciles exactly with the
// business overview. Attributed revenue is a separate last-click measure.
export const campaignDemoDays: readonly CampaignDay[] = commandCenterDemoSeed.days.flatMap(
  (day, dayIndex) => {
    const baseSpend = paidCampaignsCampaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
    let allocated = 0;
    return paidCampaignsCampaigns.map((campaign, index) => {
      const spend =
        index === paidCampaignsCampaigns.length - 1
          ? day.marketingSpend - allocated
          : Math.round((day.marketingSpend * campaign.spend) / baseSpend);
      allocated += spend;
      const wave = 1 + Math.sin(dayIndex * 0.33 + index) * 0.09;
      const cac = campaign.id === 'm_camp_104922' ? 128 : campaign.ncac;
      return {
        date: day.date,
        campaignId: campaign.id,
        spend,
        revenue: Math.round(spend * campaign.roas * wave),
        newCustomers: Math.max(1, Math.round(spend / (cac * wave))),
      };
    });
  },
);

export function aggregateCampaignDays(days: readonly CampaignDay[]): CampaignTotals {
  const sum = days.reduce(
    (acc, day) => ({
      spend: acc.spend + day.spend,
      revenue: acc.revenue + day.revenue,
      newCustomers: acc.newCustomers + day.newCustomers,
    }),
    { spend: 0, revenue: 0, newCustomers: 0 },
  );
  return {
    ...sum,
    roas: sum.spend ? sum.revenue / sum.spend : null,
    ncac: sum.newCustomers ? sum.spend / sum.newCustomers : null,
  };
}

export function deriveCampaignAnalysis(
  range: DateRange,
  channel: CampaignChannel = 'all',
  compare: 'previous_period' | 'previous_year' = 'previous_period',
  days: readonly CampaignDay[] = campaignDemoDays,
) {
  const valid = overviewDayCount(range) >= 1 && overviewDayCount(range) <= 366;
  const previousRange = valid ? overviewComparisonRange(range, compare) : range;
  const identities = campaignIdentities.filter((c) => channel === 'all' || c.channel === channel);
  const ids = new Set(identities.map((c) => c.id));
  const scoped = days.filter(
    (d) => ids.has(d.campaignId) && d.date >= range.from && d.date <= range.to,
  );
  const previous = days.filter(
    (d) => ids.has(d.campaignId) && d.date >= previousRange.from && d.date <= previousRange.to,
  );
  const rows: CampaignResult[] = scoped.length
    ? identities.map((identity) => {
        const totals = aggregateCampaignDays(scoped.filter((d) => d.campaignId === identity.id));
        return {
          ...identity,
          ...totals,
          needsReview:
            identity.costCoverage < 100 || (totals.ncac !== null && totals.ncac > identity.cacGoal),
        };
      })
    : [];
  const expected = overviewDayCount(range) * identities.length;
  const complete =
    valid &&
    scoped.length === expected &&
    previous.length === overviewDayCount(previousRange) * identities.length;
  const points = Array.from({ length: valid ? overviewDayCount(range) : 0 }, (_, index) => {
    const date = shiftOverviewDate(range.from, index);
    const observations = scoped.filter((d) => d.date === date);
    const totals = aggregateCampaignDays(observations);
    return { date, ...totals, spend: observations.length ? totals.spend : null };
  });
  return {
    range,
    previousRange,
    channel,
    valid,
    complete,
    current: aggregateCampaignDays(scoped),
    previous: aggregateCampaignDays(previous),
    rows,
    points,
    days: new Set(scoped.map((d) => d.date)).size,
    attention: rows.filter((r) => r.needsReview).sort((a, b) => (b.ncac ?? 0) - (a.ncac ?? 0)),
  };
}

export function campaignBudgetScenario(spend: number, change: number, days: number) {
  const safeChange = Math.max(-30, Math.min(30, change));
  return {
    spend: Math.round(spend * (1 + safeChange / 100)),
    delta: Math.round((spend * safeChange) / 100),
    daily: days > 0 ? Math.round((spend * (1 + safeChange / 100)) / days) : null,
  };
}
