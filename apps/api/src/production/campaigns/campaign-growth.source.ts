import { growthCampaignKey, growthDateShift, growthMeasures, growthSum, type GrowthAttribution, type GrowthBudgetAudit, type GrowthBudgetPlan, type GrowthCampaign, type GrowthCreative, type GrowthObservation, type GrowthPortfolio, type GrowthProvider, type GrowthRange, type GrowthSource, } from '@papadata/contracts/campaign-growth';
import { isRevenueQualifyingStatus } from '../../metrics/metricEngineCore.ts';
import { dedupeGa4CanonicalRows, readEntity, readEntityNumber, readEntityString, type CommandCenterDataSource, } from '../contract-runtime/command-center-metrics.real-source.ts';
import { resolveMetricWindow } from '../contract-runtime/command-center-metrics.contract-data.ts';
type Row = Record<string, unknown>;
type Source = Pick<CommandCenterDataSource, 'listCanonicalRecords' | 'listConnections' | 'listSyncCheckpoints'>;
export type GrowthFilters = {
    readonly provider?: GrowthProvider | null;
    readonly campaignKey?: string | null;
    readonly currency?: string | null;
};
const text = (v: unknown): string | null => typeof v === 'string' && v.length ? v : null;
const field = (row: Row, key: string) => readEntityString(readEntity(row.canonical_payload), key);
const number = (row: Row | undefined, key: string): number | null => {
    if (!row)
        return null;
    const n = readEntityNumber(readEntity(row.canonical_payload), key);
    return n !== null && Number.isFinite(n) && n >= 0 ? n : null;
};
const stamp = (v: unknown): string | null => {
    const value = v instanceof Date ? v.toISOString() : text(v);
    return value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;
};
const sourceId = (row: Row) => text(row.connection_id) ?? text(row.id) ?? '';
const localDay = (at: string, timezone: string): string => {
    const values = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' })
        .formatToParts(new Date(at)).map(p => [p.type, p.value]));
    return `${values.year}-${values.month}-${values.day}`;
};
function date(row: Row): string | null {
    const value = field(row, 'date');
    if (value && /^\d{8}$/.test(value))
        return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    return value?.slice(0, 10) ?? null;
}
function safeHttps(value: string | null): string | null {
    if (!value || value.length > 2048)
        return null;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
    }
    catch {
        return null;
    }
}
function group<T>(rows: readonly T[], key: (row: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const row of rows) {
        const id = key(row);
        const bucket = map.get(id);
        if (bucket)
            bucket.push(row);
        else
            map.set(id, [row]);
    }
    return map;
}
const evidence = (rows: readonly Row[]) => [...new Set(rows.map(row => text(row.id)).filter((id): id is string => id !== null))].slice(0, 50);
const keyFor = (row: GrowthObservation) => growthCampaignKey(row.sourceId, row.campaignId, row.currency);
/** Reads provider facts only. Advertising returns are never relabelled as store orders. */
export async function readGrowthPortfolio(input: {
    readonly dataSource: Source;
    readonly tenantId: string;
    readonly workspaceId: string;
    readonly range: GrowthRange;
    readonly filters: GrowthFilters;
    readonly generatedAt: string;
    readonly plans: readonly GrowthBudgetPlan[];
    readonly history: readonly GrowthBudgetAudit[];
    readonly canManagePlans: boolean;
    readonly catalog?: GrowthPortfolio['choices']['campaigns'];
}): Promise<GrowthPortfolio> {
    const { dataSource, tenantId, workspaceId, range, filters, generatedAt } = input;
    const futureRange = range.from > localDay(generatedAt, range.timezone);
    const window = resolveMetricWindow(generatedAt, range, 30);
    const [records, connections, checkpoints] = await Promise.all([
        dataSource.listCanonicalRecords(tenantId, workspaceId, {
            streams: ['ad_spend', 'attributed_conversions', 'ad_creative_performance', 'orders', 'traffic', 'traffic_breakdown'],
            // Daily provider aggregates retain the provider's calendar date; order filtering below uses workspace instants.
            businessTimeFrom: `${growthDateShift(range.from, -1)}T00:00:00.000Z`,
            businessTimeTo: `${growthDateShift(range.to, 2)}T00:00:00.000Z`,
        }),
        dataSource.listConnections(tenantId, workspaceId),
        dataSource.listSyncCheckpoints(tenantId, workspaceId),
    ]);
    if (records.length > 100000)
        throw new Error('GROWTH_RANGE_TOO_LARGE');
    const sourceRecords = connections.map((connection): GrowthSource => {
        const id = sourceId(connection), provider = text(connection.provider_id) ?? 'unknown';
        const relevantStreams = provider === 'ga4' ? ['traffic', 'traffic_breakdown']
            : provider === 'google_ads' || provider === 'meta_ads' ? ['ad_spend', 'attributed_conversions'] : ['orders'];
        const times = checkpoints.filter(row => text(row.connection_id) === id && relevantStreams.includes(text(row.stream) ?? ''))
            .map(row => stamp(row.updated_at)).filter((v): v is string => v !== null).sort();
        const synced = new Set(checkpoints.filter(row => text(row.connection_id) === id && stamp(row.updated_at)).map(row => text(row.stream)));
        const complete = provider === 'google_ads' || provider === 'meta_ads' ? relevantStreams.every(stream => synced.has(stream)) : times.length > 0;
        return { id, provider, label: text(connection.display_name) ?? text(connection.name) ?? provider,
            state: text(connection.status) ?? 'unknown', synchronizedAt: complete ? times.at(0) ?? null : null };
    });
    const sources = sourceRecords.filter(source => ['google_ads', 'meta_ads', 'ga4', 'woocommerce', 'shopify', 'baselinker', 'allegro'].includes(source.provider));
    const sourceMap = new Map(sources.map(source => [source.id, source]));
    const within = (row: Row) => { const day = date(row); return day !== null && day >= range.from && day <= range.to; };
    const pairs = new Map<string, {
        spend?: Row;
        conversions?: Row;
    }>();
    for (const row of records) {
        if (!['google_ads', 'meta_ads'].includes(text(row.provider_id) ?? '') || !within(row))
            continue;
        if (row.stream !== 'ad_spend' && row.stream !== 'attributed_conversions')
            continue;
        const externalId = text(row.external_id), campaignId = field(row, 'campaignId');
        if (!externalId || !campaignId || !text(row.connection_id))
            continue;
        const key = `${sourceId(row)}:${externalId}`;
        const pair = pairs.get(key) ?? {};
        if (row.stream === 'ad_spend')
            pair.spend = row;
        else
            pair.conversions = row;
        pairs.set(key, pair);
    }
    const observations: GrowthObservation[] = [];
    const creativePairs: {
        observation: GrowthObservation;
        row: Row;
    }[] = [];
    for (const pair of pairs.values()) {
        const row = pair.spend ?? pair.conversions!;
        const observation: GrowthObservation = {
            date: date(row)!, sourceId: sourceId(row), provider: row.provider_id as GrowthProvider,
            campaignId: field(row, 'campaignId')!, campaignName: field(row, 'campaignName') ?? field(row, 'campaignId')!,
            currency: field(row, 'currency') ?? 'XXX', spend: number(pair.spend, 'spend'),
            clicks: number(pair.spend, 'clicks'), impressions: number(pair.spend, 'impressions'),
            conversions: number(pair.conversions, 'conversions'), revenue: number(pair.conversions, 'conversionValue'),
            model: field(pair.conversions ?? row, 'attributionModel'),
            attributionWindow: field(pair.conversions ?? row, 'attributionWindow'),
            evidenceIds: evidence([...(pair.spend ? [pair.spend] : []), ...(pair.conversions ? [pair.conversions] : [])]),
        };
        observations.push(observation);
        if (pair.spend && field(pair.spend, 'adId'))
            creativePairs.push({ observation, row: pair.spend });
    }
    // Google ad-level data is a separate stream, never added to campaign totals.
    for (const row of records) {
        if (row.stream !== 'ad_creative_performance' || !within(row) || !field(row, 'adId') || !field(row, 'campaignId'))
            continue;
        if (!['google_ads', 'meta_ads'].includes(text(row.provider_id) ?? ''))
            continue;
        creativePairs.push({ row, observation: {
                date: date(row)!, sourceId: sourceId(row), provider: row.provider_id as GrowthProvider,
                campaignId: field(row, 'campaignId')!, campaignName: field(row, 'campaignName') ?? field(row, 'campaignId')!,
                currency: field(row, 'currency') ?? 'XXX', spend: number(row, 'spend'), clicks: number(row, 'clicks'),
                impressions: number(row, 'impressions'), conversions: number(row, 'conversions'), revenue: number(row, 'conversionValue'),
                model: field(row, 'attributionModel'), attributionWindow: field(row, 'attributionWindow'), evidenceIds: evidence([row]),
            } });
    }
    const matches = (row: GrowthObservation) => (!filters.provider || row.provider === filters.provider)
        && (!filters.campaignKey || keyFor(row) === filters.campaignKey)
        && (!filters.currency || row.currency === filters.currency);
    const filtered = observations.filter(matches);
    const campaigns: GrowthCampaign[] = [...group(filtered, keyFor)].map(([id, rows]) => ({
        ...growthMeasures(rows), id, sourceId: rows[0]!.sourceId, provider: rows[0]!.provider,
        campaignId: rows[0]!.campaignId, name: rows.at(-1)!.campaignName, currency: rows[0]!.currency,
        observedDays: new Set(rows.map(row => row.date)).size,
        evidenceIds: [...new Set(rows.flatMap(row => row.evidenceIds))].slice(0, 50),
    })).sort((a, b) => (b.spend ?? -1) - (a.spend ?? -1));
    const creatives: GrowthCreative[] = [...group(creativePairs.filter(pair => matches(pair.observation)), pair => `${keyFor(pair.observation)}:${encodeURIComponent(field(pair.row, 'adId')!)}`)].map(([id, pairs]) => {
        // The newer dedicated stream wins for an overlapping ad/day, avoiding double-counting a Meta projection.
        const distinct = new Map<string, typeof pairs[number]>();
        for (const pair of pairs) {
            if (!distinct.has(pair.observation.date) || pair.row.stream === 'ad_creative_performance')
                distinct.set(pair.observation.date, pair);
        }
        const unique = [...distinct.values()].sort((a, b) => a.observation.date.localeCompare(b.observation.date));
        const first = unique[0]!, last = unique.at(-1)!, row = last.row, observation = last.observation;
        const measures = growthMeasures(unique.map(pair => pair.observation));
        return { ...measures, id, sourceId: observation.sourceId, provider: observation.provider,
            campaignKey: keyFor(observation), campaignId: observation.campaignId, campaignName: observation.campaignName,
            adId: field(row, 'adId')!, name: field(row, 'adName') ?? field(row, 'adId')!,
            format: field(row, 'adFormat'), status: field(row, 'adStatus'), currency: observation.currency,
            media: { imageUrl: safeHttps(field(row, 'imageUrl')), headline: field(row, 'headline'),
                body: field(row, 'body'), destinationUrl: safeHttps(field(row, 'destinationUrl')) },
            observedDays: distinct.size, firstDate: first.observation.date, lastDate: last.observation.date,
            smallSample: measures.impressions === null || measures.impressions < 1000 || measures.conversions === null || measures.conversions < 10,
            evidenceIds: [...new Set(unique.flatMap(pair => pair.observation.evidenceIds))].slice(0, 50),
        };
    }).sort((a, b) => (b.spend ?? -1) - (a.spend ?? -1));
    const attribution: GrowthAttribution[] = [...group(filtered, row => JSON.stringify([row.sourceId, row.currency, row.model, row.attributionWindow]))].map(([id, rows]) => ({
        id: `ads:${id}`, kind: 'ad_platform', sourceId: rows[0]!.sourceId, provider: rows[0]!.provider,
        label: sourceMap.get(rows[0]!.sourceId)?.label ?? rows[0]!.provider, currency: rows[0]!.currency,
        revenue: growthSum(rows.map(row => row.revenue)), conversions: growthSum(rows.map(row => row.conversions)),
        model: rows[0]!.model, attributionWindow: rows[0]!.attributionWindow,
        population: 'campaign_filter', timeBasis: 'provider_reporting_date',
        synchronizedAt: sourceMap.get(rows[0]!.sourceId)?.synchronizedAt ?? null,
        evidenceIds: [...new Set(rows.flatMap(row => row.evidenceIds))].slice(0, 50),
    }));
    const ga4Old = dedupeGa4CanonicalRows(records, 'traffic').filter(within);
    const ga4New = dedupeGa4CanonicalRows(records, 'traffic_breakdown').filter(within);
    // One grain per property/day; do not sum legacy and detailed reports.
    const oldDays = new Set(ga4Old.map(row => `${sourceId(row)}:${date(row)}`));
    const ga4 = [...ga4Old, ...ga4New.filter(row => !oldDays.has(`${sourceId(row)}:${date(row)}`))];
    const stores = records.filter(row => !futureRange && row.stream === 'orders' && isRevenueQualifyingStatus(field(row, 'status'))
        && (stamp(row.effective_time) ?? '') >= window.periodStart && (stamp(row.effective_time) ?? '') < window.periodEnd);
    for (const [kind, rows] of [['ga4', ga4], ['store', stores]] as const) {
        for (const [id, bucket] of group(rows, row => `${sourceId(row)}:${field(row, 'currency') ?? 'XXX'}`)) {
            const first = bucket[0]!, currency = field(first, 'currency') ?? 'XXX';
            if (filters.currency && currency !== filters.currency)
                continue;
            attribution.push({ id: `${kind}:${id}`, kind, sourceId: sourceId(first), provider: text(first.provider_id) ?? kind,
                label: sourceMap.get(sourceId(first))?.label ?? text(first.provider_id) ?? kind, currency,
                revenue: growthSum(bucket.map(row => number(row, kind === 'ga4' ? 'revenue' : 'grossAmount'))),
                conversions: kind === 'store' ? bucket.length : growthSum(bucket.map(row => number(row, 'transactions'))),
                model: kind === 'store' ? 'qualifying_orders' : 'ga4_reported', attributionWindow: null,
                population: 'whole_source', timeBasis: kind === 'store' ? 'order_business_time' : 'provider_reporting_date',
                synchronizedAt: sourceMap.get(sourceId(first))?.synchronizedAt ?? null, evidenceIds: evidence(bucket) });
        }
    }
    const currentCampaigns = [...group(observations, keyFor)].map(([id, rows]) => ({ id, name: rows.at(-1)!.campaignName, provider: rows[0]!.provider, currency: rows[0]!.currency }));
    const allCampaigns = [...new Map([...(input.catalog ?? []), ...currentCampaigns].map(row => [row.id, row])).values()];
    const usedSources = [...new Set(filtered.map(row => row.sourceId))].map(id => sourceMap.get(id));
    const synchronizedAt = usedSources.length && usedSources.every(source => source?.synchronizedAt)
        ? usedSources.map(source => source!.synchronizedAt!).sort()[0]! : null;
    const creativeDays = new Set(creativePairs.map(pair => `${keyFor(pair.observation)}:${pair.observation.date}`));
    const missingCreativeRows = filtered.filter(row => !creativeDays.has(`${keyFor(row)}:${row.date}`)).length;
    const limitations: GrowthPortfolio['limitations'][number][] = [
        { code: 'ATTRIBUTION_NOT_RECONCILED', pl: 'Wynik platformy reklamowej, GA4 i sklepu opisuje różne populacje. Różnica nie dowodzi duplikacji ani inkrementalności.', en: 'Ad-platform, GA4 and store results describe different populations. A difference does not establish duplication or incrementality.' },
        { code: 'PROVIDER_CALENDAR', pl: 'Reklamy i GA4 zachowują dzień raportowy dostawcy. Zamówienia stosują strefę workspace. Nie przeliczamy agregatów dziennych na inną strefę.', en: 'Ads and GA4 retain provider reporting dates. Orders use workspace time. Daily aggregates are not rebucketed into another timezone.' },
        { code: 'INTERNAL_PLAN_ONLY', pl: 'Zapis planu budżetowego zmienia wyłącznie plan w PapaData, nie limit reklamowy dostawcy.', en: 'Saving a budget plan changes only the PapaData plan, not the provider advertising limit.' },
    ];
    if (filtered.some(row => !row.model || !row.attributionWindow))
        limitations.push({ code: 'ATTRIBUTION_METADATA_MISSING', pl: 'Część danych nie zawiera modelu lub okna atrybucji. Nie przypisujemy domyślnie last click ani 7 dni.', en: 'Some data has no recorded attribution model or window. Last click or seven days are not assumed.' });
    if (missingCreativeRows)
        limitations.push({ code: 'CREATIVE_COVERAGE_PARTIAL', pl: 'Część kampanii nie ma danych na poziomie reklamy. Wykonaj synchronizację i backfill strumienia kreacji.', en: 'Some campaigns have no ad-level data. Synchronize and backfill the creative stream.' });
    const incompleteMetrics = filtered.some(row => row.spend === null || row.revenue === null);
    const stale = synchronizedAt !== null && Date.parse(generatedAt) - Date.parse(synchronizedAt) > 86400000;
    return { version: 'campaigns.growth.v1', scope: { ...range, calculatedAt: generatedAt,
            asOf: growthDateShift(localDay(generatedAt, range.timezone), -1), synchronizedAt,
            readiness: !filtered.length ? 'empty' : stale ? 'stale' : incompleteMetrics || missingCreativeRows || !synchronizedAt ? 'partial' : 'ready',
            provider: filters.provider ?? null, campaignKey: filters.campaignKey ?? null, currency: filters.currency ?? null,
            missingCreativeRows, limited: false },
        sources, campaigns, observations: filtered, creatives, attribution,
        budgetPlans: input.plans.filter(plan => plan.from === range.from && plan.to === range.to
            && (!filters.provider || allCampaigns.some(campaign => campaign.id === plan.campaignKey && campaign.provider === filters.provider))
            && (!filters.campaignKey || plan.campaignKey === filters.campaignKey)
            && (!filters.currency || plan.currency === filters.currency)),
        budgetHistory: input.history.filter(event => input.plans.some(plan => plan.id === event.planId && plan.from === range.from && plan.to === range.to
            && (!filters.campaignKey || plan.campaignKey === filters.campaignKey) && (!filters.currency || plan.currency === filters.currency)
            && (!filters.provider || allCampaigns.some(campaign => campaign.id === plan.campaignKey && campaign.provider === filters.provider)))),
        choices: { campaigns: allCampaigns, currencies: [...new Set(allCampaigns.map(row => row.currency))].sort(),
            models: [...new Set(attribution.map(row => row.model).filter((v): v is string => v !== null))].sort(),
            windows: [...new Set(attribution.map(row => row.attributionWindow).filter((v): v is string => v !== null))].sort() },
        limitations, canManagePlans: input.canManagePlans, externalBudgetExecution: false };
}
