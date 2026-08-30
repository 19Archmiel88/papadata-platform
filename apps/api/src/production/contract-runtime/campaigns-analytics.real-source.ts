import type { IsoDateTime } from "@papadata/contracts";
import {
  readEntity,
  readEntityNumber,
  readEntityString,
  readRowString,
  type CommandCenterDataSource,
} from "./command-center-metrics.real-source.ts";
import {
  resolveMetricWindow,
  type CommandCenterDateRangeInput,
} from "./command-center-metrics.contract-data.ts";

/** Narrow slice of `CommandCenterDataSource` this module actually needs. */
export type CampaignsDataSource = Pick<CommandCenterDataSource, "listCanonicalRecords">;

/** Matches the contract's `CampaignChannel` union (contracts/api-schemas.ts). */
export type CampaignsRecordChannel = "googleAds" | "metaAds" | "tiktokAds" | "other";

const AD_PROVIDER_CHANNEL: Readonly<Record<string, CampaignsRecordChannel>> = {
  google_ads: "googleAds",
  meta_ads: "metaAds",
};

// `status` and `budget` are genuinely absent from the canonical pipeline --
// `normalizeAdSpend` (packages/integrations/src/canonical-normalizer.ts)
// never captures them and no Google Ads/Meta Ads adapter fetches them from
// the provider. Documented as a deliberate gap in CLAUDE.md (2026-08-24
// "campaigns" audit) -- left `null` here rather than fabricated, matching
// the same-shaped `category`/`margin` gaps already accepted for products.
export type RealCampaignsRecord = {
  readonly budget: null;
  readonly campaignId: string;
  readonly channel: CampaignsRecordChannel;
  readonly clicks: number;
  readonly conversions: number;
  readonly cpc: number | null;
  readonly cpm: number | null;
  readonly ctr: number | null;
  readonly impressions: number;
  readonly name: string;
  readonly revenue: { readonly amount: number; readonly currency: string };
  readonly roas: number | null;
  readonly spend: { readonly amount: number; readonly currency: string };
  readonly status: null;
};

export type CampaignsAttributionRow = {
  readonly contribution: number;
  readonly model: string;
  readonly orders: number;
  readonly revenue: { readonly amount: number; readonly currency: string };
  readonly source: string;
};

export type CampaignsFilters = {
  readonly channel?: readonly CampaignsRecordChannel[] | null;
  readonly search?: string | null;
};

export type CampaignsPageRequest = {
  readonly cursor?: string | null;
  readonly limit?: number | null;
};

export type CampaignsSummaryRecord = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: IsoDateTime;
  readonly warning: number;
};

export type CampaignsListResult = {
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number | null };
  readonly records: readonly RealCampaignsRecord[];
  readonly summary: CampaignsSummaryRecord;
};

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;
// Same reasoning as orders/products detail lookups: a campaign being looked
// up individually isn't bound to the list's default trailing window.
const DETAIL_LOOKUP_FLOOR = "2020-01-01T00:00:00.000Z" as IsoDateTime;

type CampaignBucket = {
  campaignId: string;
  channel: CampaignsRecordChannel;
  clicks: number;
  conversionValue: number;
  conversions: number;
  currency: string;
  impressions: number;
  name: string | null;
  spend: number;
};

/**
 * ready/warning/critical mirrors the generic per-record readiness vocabulary
 * used elsewhere (orders, products). There's no campaign "status" to bucket
 * on (see the RealCampaignsRecord comment), so this is derived from the one
 * real, non-arbitrary signal available: whether ad spend is actually
 * producing attributed revenue. ROAS >= 1 (break-even or better) is ready;
 * spending at a loss but still getting some return is a warning; roas is
 * `null` only when there's no spend to divide by (shouldn't happen for a
 * record that exists at all), and exactly `0` means spend with literally no
 * attributed revenue in the window -- both are the most concerning state.
 */
function readinessBucket(roas: number | null): "critical" | "ready" | "warning" {
  if (roas === null || roas === 0) {
    return "critical";
  }
  return roas >= 1 ? "ready" : "warning";
}

function channelForProvider(providerId: string): CampaignsRecordChannel {
  return AD_PROVIDER_CHANNEL[providerId] ?? "other";
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function toRecord(bucket: CampaignBucket): RealCampaignsRecord {
  const spend = roundMoney(bucket.spend);
  const revenue = roundMoney(bucket.conversionValue);
  const roas = spend > 0 ? Math.round((revenue / spend) * 100) / 100 : null;
  const ctr = bucket.impressions > 0 ? Math.round((bucket.clicks / bucket.impressions) * 10000) / 10000 : null;
  const cpc = bucket.clicks > 0 ? roundMoney(spend / bucket.clicks) : null;
  const cpm = bucket.impressions > 0 ? roundMoney((spend / bucket.impressions) * 1000) : null;

  return {
    budget: null,
    campaignId: bucket.campaignId,
    channel: bucket.channel,
    clicks: bucket.clicks,
    conversions: bucket.conversions,
    cpc,
    cpm,
    ctr,
    impressions: bucket.impressions,
    // Falls back to the raw campaign identifier when the provider payload
    // never carried a campaign_name -- a real identifier, not a fabricated
    // display name (same convention as products' missingMapping rows).
    name: bucket.name ?? bucket.campaignId,
    revenue: { amount: revenue, currency: bucket.currency },
    roas,
    spend: { amount: spend, currency: bucket.currency },
    status: null,
  };
}

async function fetchCampaignAggregates(
  dataSource: CampaignsDataSource,
  tenantId: string,
  workspaceId: string,
  periodStart: IsoDateTime,
  periodEnd: IsoDateTime,
): Promise<readonly RealCampaignsRecord[]> {
  const rows = await dataSource.listCanonicalRecords(tenantId, workspaceId, {
    streams: ["ad_spend", "attributed_conversions"],
    businessTimeFrom: periodStart,
    businessTimeTo: periodEnd,
  });

  // Grouped in memory, not via SQL GROUP BY -- campaignId lives inside
  // canonical_payload jsonb, which has no index (confirmed against the
  // 0015_a04_durable_ingestion_pipeline.sql migration). Same accepted
  // precedent as orders-analytics.real-source.ts / products-analytics.real-source.ts.
  const buckets = new Map<string, CampaignBucket>();

  function bucketFor(providerId: string, campaignId: string, currency: string): CampaignBucket {
    const key = `${providerId}:${campaignId}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = {
        campaignId: key,
        channel: channelForProvider(providerId),
        clicks: 0,
        conversionValue: 0,
        conversions: 0,
        currency,
        impressions: 0,
        name: null,
        spend: 0,
      };
      buckets.set(key, bucket);
    }
    return bucket;
  }

  for (const row of rows) {
    const providerId = readRowString(row.provider_id);
    const stream = readRowString(row.stream);
    if (!providerId || (providerId !== "google_ads" && providerId !== "meta_ads")) {
      continue;
    }
    const entity = readEntity(row.canonical_payload);
    const campaignId = readEntityString(entity, "campaignId");
    if (!campaignId) {
      continue;
    }
    const currency = readEntityString(entity, "currency") ?? "PLN";

    if (stream === "ad_spend") {
      const spend = readEntityNumber(entity, "spend");
      if (spend === null) {
        continue;
      }
      const bucket = bucketFor(providerId, campaignId, currency);
      bucket.spend += spend;
      bucket.impressions += Math.max(0, Math.round(readEntityNumber(entity, "impressions") ?? 0));
      bucket.clicks += Math.max(0, Math.round(readEntityNumber(entity, "clicks") ?? 0));
      const name = readEntityString(entity, "campaignName");
      if (name && !bucket.name) {
        bucket.name = name;
      }
    } else if (stream === "attributed_conversions") {
      const conversionValue = readEntityNumber(entity, "conversionValue");
      if (conversionValue === null) {
        continue;
      }
      const bucket = bucketFor(providerId, campaignId, currency);
      bucket.conversionValue += conversionValue;
      bucket.conversions += Math.max(0, Math.round(readEntityNumber(entity, "conversions") ?? 0));
    }
  }

  return [...buckets.values()]
    .map(toRecord)
    .sort((a, b) => b.spend.amount - a.spend.amount);
}

function matchesFilters(record: RealCampaignsRecord, filters: CampaignsFilters | null | undefined): boolean {
  if (!filters) {
    return true;
  }
  if (filters.channel?.length && !filters.channel.includes(record.channel)) {
    return false;
  }
  const needle = filters.search?.trim().toLowerCase();
  if (needle && !record.name.toLowerCase().includes(needle) && !record.campaignId.toLowerCase().includes(needle)) {
    return false;
  }
  return true;
}

function clampLimit(requested: number | null | undefined): number {
  if (typeof requested !== "number" || !Number.isFinite(requested) || requested <= 0) {
    return DEFAULT_PAGE_LIMIT;
  }
  return Math.min(Math.round(requested), MAX_PAGE_LIMIT);
}

// Same offset-over-in-memory-array cursor as orders/products -- honest for
// the current data volume, not database keyset pagination.
function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) {
    return 0;
  }
  const decoded = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
  return Number.isFinite(decoded) && decoded >= 0 ? decoded : 0;
}

function summarize(records: readonly RealCampaignsRecord[], generatedAt: string): CampaignsSummaryRecord {
  let ready = 0;
  let warning = 0;
  let critical = 0;
  for (const record of records) {
    const bucket = readinessBucket(record.roas);
    if (bucket === "ready") ready += 1;
    else if (bucket === "warning") warning += 1;
    else critical += 1;
  }

  return {
    critical,
    ready,
    total: records.length,
    updatedAt: generatedAt as IsoDateTime,
    warning,
  };
}

/**
 * Backs every `campaigns.*.read` list-shaped operationId (overview, list,
 * read, budget, diagnostics, recommendations) -- they share the identical
 * `{records, pageInfo, summary}` contract shape, differing only in which
 * screen renders them and which extra field (diagnostics/recommendations/
 * attribution) is layered on top by the caller.
 */
export async function fetchCampaignsList(options: {
  readonly dataSource: CampaignsDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly filters?: CampaignsFilters | null;
  readonly generatedAt: string;
  readonly page?: CampaignsPageRequest | null;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<CampaignsListResult> {
  const { dataSource, dateRange, filters, generatedAt, page, tenantId, workspaceId } = options;
  const window = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);
  const allRecords = await fetchCampaignAggregates(
    dataSource,
    tenantId,
    workspaceId,
    window.periodStart,
    window.periodEnd,
  );
  const filtered = allRecords.filter((record) => matchesFilters(record, filters));

  const limit = clampLimit(page?.limit);
  const offset = decodeCursor(page?.cursor);
  const pageRecords = filtered.slice(offset, offset + limit);
  const nextOffset = offset + pageRecords.length;

  return {
    pageInfo: {
      nextCursor: nextOffset < filtered.length ? encodeCursor(nextOffset) : null,
      total: filtered.length,
    },
    records: pageRecords,
    summary: summarize(filtered, generatedAt),
  };
}

/** Backs `campaigns.detail.read` -- a single campaign looked up by its campaignId. */
export async function fetchCampaignDetail(options: {
  readonly campaignId: string;
  readonly dataSource: CampaignsDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<RealCampaignsRecord | null> {
  const { campaignId, dataSource, dateRange, generatedAt, tenantId, workspaceId } = options;
  const window = dateRange
    ? resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS)
    : { periodEnd: generatedAt as IsoDateTime, periodStart: DETAIL_LOOKUP_FLOOR };
  const records = await fetchCampaignAggregates(
    dataSource,
    tenantId,
    workspaceId,
    window.periodStart,
    window.periodEnd,
  );

  return records.find((record) => record.campaignId === campaignId) ?? null;
}

/**
 * Backs `campaigns.attribution-sales.read`. Real per-channel attributed
 * revenue side by side (Google Ads vs Meta Ads) -- but deliberately does NOT
 * compute a cross-channel "overlap %"/deduplication figure: that requires an
 * attribution model this platform doesn't have. `model` is labelled
 * "provider_reported" rather than guessing "last_click"/"data_driven" --
 * the ad platform's own attribution window/model isn't captured anywhere in
 * the canonical pipeline either (CLAUDE.md: "Zapisywać attribution window
 * używane przez Google Ads" / Meta equivalent, both still open).
 */
export async function fetchCampaignsAttribution(options: {
  readonly dataSource: CampaignsDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly filters?: CampaignsFilters | null;
  readonly generatedAt: string;
  readonly page?: CampaignsPageRequest | null;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<CampaignsListResult & { readonly attribution: readonly CampaignsAttributionRow[] }> {
  const { dataSource, dateRange, filters, generatedAt, page, tenantId, workspaceId } = options;
  const window = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);
  const allRecords = await fetchCampaignAggregates(
    dataSource,
    tenantId,
    workspaceId,
    window.periodStart,
    window.periodEnd,
  );
  const filtered = allRecords.filter((record) => matchesFilters(record, filters));

  const totalRevenue = filtered.reduce((sum, record) => sum + record.revenue.amount, 0);
  const byChannel = new Map<string, { conversions: number; currency: string; revenue: number }>();
  for (const record of filtered) {
    const bucket = byChannel.get(record.channel) ?? {
      conversions: 0,
      currency: record.revenue.currency,
      revenue: 0,
    };
    bucket.revenue += record.revenue.amount;
    bucket.conversions += record.conversions;
    byChannel.set(record.channel, bucket);
  }
  const attribution: CampaignsAttributionRow[] = [...byChannel.entries()].map(([channel, bucket]) => ({
    contribution: totalRevenue > 0 ? Math.round((bucket.revenue / totalRevenue) * 1000) / 1000 : 0,
    model: "provider_reported",
    orders: bucket.conversions,
    revenue: { amount: roundMoney(bucket.revenue), currency: bucket.currency },
    source: channel,
  }));

  const limit = clampLimit(page?.limit);
  const offset = decodeCursor(page?.cursor);
  const pageRecords = filtered.slice(offset, offset + limit);
  const nextOffset = offset + pageRecords.length;

  return {
    attribution,
    pageInfo: {
      nextCursor: nextOffset < filtered.length ? encodeCursor(nextOffset) : null,
      total: filtered.length,
    },
    records: pageRecords,
    summary: summarize(filtered, generatedAt),
  };
}
