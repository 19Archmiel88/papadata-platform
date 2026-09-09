/** Campaign Growth v1. Currency-scoped provider facts are not reconciled store sales. */
export type GrowthProvider = 'google_ads' | 'meta_ads';
export type GrowthReadiness = 'ready' | 'partial' | 'stale' | 'empty';
export type GrowthMetric = number | null;
export type GrowthRange = {
    readonly from: string;
    readonly to: string;
    readonly timezone: string;
};
export type GrowthMeasures = {
    readonly spend: GrowthMetric;
    readonly impressions: GrowthMetric;
    readonly clicks: GrowthMetric;
    readonly conversions: GrowthMetric;
    readonly revenue: GrowthMetric;
    readonly ctr: GrowthMetric;
    readonly cpc: GrowthMetric;
    readonly cpm: GrowthMetric;
    readonly cpa: GrowthMetric;
    readonly roas: GrowthMetric;
};
export type GrowthObservation = {
    readonly date: string;
    readonly sourceId: string;
    readonly provider: GrowthProvider;
    readonly campaignId: string;
    readonly campaignName: string;
    readonly currency: string;
    readonly spend: GrowthMetric;
    readonly impressions: GrowthMetric;
    readonly clicks: GrowthMetric;
    readonly conversions: GrowthMetric;
    readonly revenue: GrowthMetric;
    readonly model: string | null;
    readonly attributionWindow: string | null;
    readonly evidenceIds: readonly string[];
};
export type GrowthCampaign = GrowthMeasures & {
    readonly id: string;
    readonly sourceId: string;
    readonly provider: GrowthProvider;
    readonly campaignId: string;
    readonly name: string;
    readonly currency: string;
    readonly observedDays: number;
    readonly evidenceIds: readonly string[];
};
export type GrowthCreative = GrowthMeasures & {
    readonly id: string;
    readonly sourceId: string;
    readonly provider: GrowthProvider;
    readonly campaignKey: string;
    readonly campaignId: string;
    readonly campaignName: string;
    readonly adId: string;
    readonly name: string;
    readonly format: string | null;
    readonly status: string | null;
    readonly currency: string;
    readonly media: {
        readonly imageUrl: string | null;
        readonly headline: string | null;
        readonly body: string | null;
        readonly destinationUrl: string | null;
    };
    readonly observedDays: number;
    readonly firstDate: string;
    readonly lastDate: string;
    /** A diagnostic threshold, not a claim of statistical significance. */
    readonly smallSample: boolean;
    readonly evidenceIds: readonly string[];
};
export type GrowthAttribution = {
    readonly id: string;
    readonly kind: 'ad_platform' | 'ga4' | 'store';
    readonly sourceId: string;
    readonly provider: string;
    readonly label: string;
    readonly currency: string;
    readonly revenue: GrowthMetric;
    readonly conversions: GrowthMetric;
    readonly model: string | null;
    readonly attributionWindow: string | null;
    readonly population: 'campaign_filter' | 'whole_source';
    readonly timeBasis: 'provider_reporting_date' | 'order_business_time';
    readonly synchronizedAt: string | null;
    readonly evidenceIds: readonly string[];
};
export type GrowthSource = {
    readonly id: string;
    readonly provider: string;
    readonly label: string;
    readonly state: string;
    readonly synchronizedAt: string | null;
};
export type GrowthBudgetPlan = {
    readonly id: string;
    readonly campaignKey: string;
    readonly from: string;
    readonly to: string;
    readonly currency: string;
    readonly amount: number;
    readonly version: number;
    readonly reason: string;
    readonly updatedAt: string;
    readonly updatedBy: string;
    /** This is a PapaData planning amount, never an external advertising limit. */
    readonly target: 'internal_plan';
};
export type GrowthBudgetCommand = {
    readonly requestId: string;
    readonly campaignKey: string;
    readonly from: string;
    readonly to: string;
    readonly currency: string;
    readonly amount: number;
    readonly expectedVersion: number;
    readonly reason: string;
    readonly acknowledgedInternalPlan: true;
};
export type GrowthBudgetAudit = {
    readonly id: string;
    readonly planId: string;
    readonly at: string;
    readonly actor: string;
    readonly before: number | null;
    readonly after: number;
    readonly version: number;
    readonly reason: string;
};
export type GrowthPortfolio = {
    readonly version: 'campaigns.growth.v1';
    readonly scope: GrowthRange & {
        readonly calculatedAt: string;
        readonly asOf: string;
        readonly synchronizedAt: string | null;
        readonly readiness: GrowthReadiness;
        readonly provider: GrowthProvider | null;
        readonly campaignKey: string | null;
        readonly currency: string | null;
        readonly missingCreativeRows: number;
        readonly limited: boolean;
    };
    readonly sources: readonly GrowthSource[];
    readonly campaigns: readonly GrowthCampaign[];
    readonly observations: readonly GrowthObservation[];
    readonly creatives: readonly GrowthCreative[];
    readonly attribution: readonly GrowthAttribution[];
    readonly budgetPlans: readonly GrowthBudgetPlan[];
    readonly budgetHistory: readonly GrowthBudgetAudit[];
    readonly choices: {
        readonly campaigns: readonly {
            readonly id: string;
            readonly name: string;
            readonly provider: GrowthProvider;
            readonly currency: string;
        }[];
        readonly currencies: readonly string[];
        readonly models: readonly string[];
        readonly windows: readonly string[];
    };
    readonly limitations: readonly {
        readonly code: string;
        readonly pl: string;
        readonly en: string;
    }[];
    readonly canManagePlans: boolean;
    readonly externalBudgetExecution: false;
};
export function growthCampaignKey(sourceId: string, campaignId: string, currency: string): string {
    return `${sourceId}:${encodeURIComponent(campaignId)}:${currency}`;
}
export function growthRatio(numerator: GrowthMetric, denominator: GrowthMetric): GrowthMetric {
    return numerator !== null && denominator !== null && denominator > 0 ? numerator / denominator : null;
}
export function growthSum(values: readonly GrowthMetric[]): GrowthMetric {
    return values.length && values.every(value => value !== null && Number.isFinite(value))
        ? values.reduce<number>((sum, value) => sum + (value ?? 0), 0) : null;
}
export function growthMeasures(rows: readonly Pick<GrowthObservation, 'spend' | 'impressions' | 'clicks' | 'conversions' | 'revenue'>[]): GrowthMeasures {
    const spend = growthSum(rows.map(row => row.spend));
    const impressions = growthSum(rows.map(row => row.impressions));
    const clicks = growthSum(rows.map(row => row.clicks));
    const conversions = growthSum(rows.map(row => row.conversions));
    const revenue = growthSum(rows.map(row => row.revenue));
    const perImpression = growthRatio(spend, impressions);
    return { spend, impressions, clicks, conversions, revenue,
        ctr: growthRatio(clicks, impressions), cpc: growthRatio(spend, clicks),
        cpm: perImpression === null ? null : perImpression * 1000,
        cpa: growthRatio(spend, conversions), roas: growthRatio(revenue, spend) };
}
export function growthDayCount(from: string, to: string): number {
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1;
}
export function growthDateShift(value: string, days: number): string {
    return new Date(Date.parse(`${value}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
}
export type BudgetProjection = {
    readonly totalDays: number;
    readonly elapsedDays: number;
    readonly observedDays: number;
    readonly spent: GrowthMetric;
    readonly expectedSpend: GrowthMetric;
    readonly remaining: GrowthMetric;
    readonly utilization: GrowthMetric;
    readonly deviation: GrowthMetric;
    readonly dailyRunRate: GrowthMetric;
    readonly projectedTotal: GrowthMetric;
    readonly projectedDeviation: GrowthMetric;
    readonly partial: boolean;
    readonly points: readonly {
        readonly date: string;
        readonly planned: GrowthMetric;
        readonly actual: GrowthMetric;
    }[];
};
/** A transparent linear run-rate scenario. Missing dates stay null, never zero. */
export function projectGrowthBudget(plan: GrowthBudgetPlan, observations: readonly GrowthObservation[], asOf: string): BudgetProjection {
    const totalDays = growthDayCount(plan.from, plan.to);
    const cutoff = asOf < plan.to ? asOf : plan.to;
    const elapsedDays = Math.max(0, Math.min(totalDays, growthDayCount(plan.from, cutoff)));
    const rows = observations.filter(row => growthCampaignKey(row.sourceId, row.campaignId, row.currency) === plan.campaignKey
        && row.currency === plan.currency && row.date >= plan.from && row.date <= cutoff);
    const days = new Map<string, GrowthMetric[]>();
    for (const row of rows)
        days.set(row.date, [...(days.get(row.date) ?? []), row.spend]);
    const observedDays = [...days.values()].filter(values => growthSum(values) !== null).length;
    const spent = growthSum(rows.map(row => row.spend));
    const expectedSpend = totalDays > 0 ? plan.amount * elapsedDays / totalDays : null;
    const dailyRunRate = growthRatio(spent, observedDays);
    const projectedTotal = dailyRunRate === null || spent === null ? null : spent + dailyRunRate * (totalDays - observedDays);
    let actualTotal = 0;
    let complete = true;
    const points = Array.from({ length: Math.max(0, Math.min(totalDays, 366)) }, (_, index) => {
        const date = growthDateShift(plan.from, index);
        const amount = growthSum(days.get(date) ?? []);
        if (date <= cutoff && amount !== null)
            actualTotal += amount;
        else
            complete = false;
        return { date, planned: plan.amount * (index + 1) / totalDays, actual: complete && date <= cutoff ? actualTotal : null };
    });
    return { totalDays, elapsedDays, observedDays, spent, expectedSpend,
        remaining: spent === null ? null : plan.amount - spent,
        utilization: growthRatio(spent, plan.amount),
        deviation: spent === null || expectedSpend === null ? null : spent - expectedSpend,
        dailyRunRate, projectedTotal,
        projectedDeviation: projectedTotal === null ? null : projectedTotal - plan.amount,
        partial: observedDays < elapsedDays, points };
}
export type GrowthListFilter = {
    readonly search?: string | null;
    readonly format?: string | null;
    readonly sample?: string | null;
    readonly sort?: string | null;
    readonly direction?: string | null;
};
export const growthMetricIds = ['spend', 'impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'cpc', 'cpm', 'cpa', 'roas'] as const;
export function filterGrowthCreatives(rows: readonly GrowthCreative[], filter: GrowthListFilter): GrowthCreative[] {
    const search = (filter.search ?? '').toLocaleLowerCase().trim();
    const filtered = rows.filter(row => (!search || `${row.name} ${row.adId} ${row.campaignName}`.toLocaleLowerCase().includes(search))
        && (!filter.format || filter.format === 'all' || row.format === filter.format)
        && (!filter.sample || filter.sample === 'all' || (filter.sample === 'small' ? row.smallSample : !row.smallSample)));
    return sortGrowthRows(filtered, filter);
}
export function sortGrowthRows<T extends GrowthMeasures & {
    readonly id: string;
    readonly name: string;
}>(rows: readonly T[], filter: GrowthListFilter): T[] {
    const sort = filter.sort ?? 'spend', direction = filter.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
        if (sort === 'name')
            return a.name.localeCompare(b.name, 'pl', { numeric: true }) * direction || a.id.localeCompare(b.id, 'en');
        const key = growthMetricIds.find(metric => metric === sort) ?? 'spend';
        const left = a[key], right = b[key];
        if (left === null || right === null)
            return left === right ? a.id.localeCompare(b.id, 'en') : left === null ? 1 : -1;
        return (left - right) * direction || a.id.localeCompare(b.id, 'en');
    });
}
