import { createHash } from "node:crypto";
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
  readonly status: "active" | "draft" | "ended" | "paused" | null;
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
  status: "active" | "draft" | "ended" | "paused" | null;
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
    status: bucket.status,
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
    const key = `${providerId}:${campaignId}:${currency}`;
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
        status: null,
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
      const status = normalizeCampaignStatus(readEntityString(entity, "campaignStatus"));
      if (status) bucket.status = status;
    } else if (stream === "attributed_conversions") {
      const conversionValue = readEntityNumber(entity, "conversionValue");
      if (conversionValue === null) {
        continue;
      }
      const bucket = bucketFor(providerId, campaignId, currency);
      bucket.conversionValue += conversionValue;
      bucket.conversions += Math.max(0, readEntityNumber(entity, "conversions") ?? 0);
    }
  }

  return [...buckets.values()]
    .map(toRecord)
    .sort((a, b) => b.spend.amount - a.spend.amount);
}

export type CampaignDiagnosticFinding = {
  readonly code: string;
  readonly findingId: string;
  readonly message: string;
  readonly severity: "error" | "info" | "warning";
  readonly sourceRef: string | null;
};

export type CampaignRecommendation = {
  readonly confidence: number;
  readonly impact: "high" | "low" | "medium";
  readonly rationale: string;
  readonly recommendationId: string;
  readonly title: string;
};

export function buildCampaignDiagnostics(
  records: readonly RealCampaignsRecord[],
): readonly CampaignDiagnosticFinding[] {
  const findings: CampaignDiagnosticFinding[] = [];
  for (const record of records) {
    if (record.spend.amount > 0 && record.conversions === 0) {
      findings.push(campaignFinding(
        record,
        "PAID_SPEND_WITHOUT_CONVERSIONS",
        "error",
        `Kampania ${record.name} generuje koszt bez przypisanych konwersji w wybranym okresie.`,
      ));
    } else if (record.roas !== null && record.roas < 1) {
      findings.push(campaignFinding(
        record,
        "PAID_ROAS_BELOW_ONE",
        "warning",
        `ROAS kampanii ${record.name} wynosi ${record.roas.toFixed(2)} i jest poniżej 1,00.`,
      ));
    }
    if (record.impressions >= 1_000 && record.ctr !== null && record.ctr < 0.005) {
      findings.push(campaignFinding(
        record,
        "PAID_LOW_CTR",
        "warning",
        `CTR kampanii ${record.name} wynosi ${(record.ctr * 100).toFixed(2)}% przy co najmniej 1000 wyświetleniach.`,
      ));
    }
  }
  return findings;
}

export function buildCampaignRecommendations(
  records: readonly RealCampaignsRecord[],
): readonly CampaignRecommendation[] {
  const recommendations: CampaignRecommendation[] = [];
  for (const record of records) {
    const confidence = campaignEvidenceCompleteness(record);
    if (record.spend.amount > 0 && record.conversions === 0) {
      recommendations.push({
        confidence,
        impact: "high",
        rationale: `Wydano ${record.spend.amount.toFixed(2)} ${record.spend.currency}, a provider nie raportuje konwersji. Pewność oznacza kompletność dostępnych pól kampanii, nie prognozę AI.`,
        recommendationId: deterministicUuid(`campaign:no-conversions:${record.campaignId}`),
        title: `Zweryfikuj pomiar konwersji: ${record.name}`,
      });
      continue;
    }
    if (record.roas !== null && record.roas < 1) {
      recommendations.push({
        confidence,
        impact: "high",
        rationale: `ROAS ${record.roas.toFixed(2)} jest poniżej 1,00 na danych raportowanych przez platformę. To reguła analityczna, nie wynik modelu AI.`,
        recommendationId: deterministicUuid(`campaign:roas:${record.campaignId}`),
        title: `Nie skaluj budżetu kampanii ${record.name} bez dodatkowej walidacji`,
      });
    } else if (record.roas !== null && record.roas >= 2 && record.conversions >= 3) {
      recommendations.push({
        confidence,
        impact: "medium",
        rationale: `ROAS ${record.roas.toFixed(2)} i ${record.conversions} konwersji uzasadniają test kontrolowany; brak modelu inkrementalności nie pozwala rekomendować konkretnej zmiany budżetu.`,
        recommendationId: deterministicUuid(`campaign:scale-test:${record.campaignId}`),
        title: `Rozważ kontrolowany test skalowania: ${record.name}`,
      });
    }
    if (record.impressions >= 1_000 && record.ctr !== null && record.ctr < 0.005) {
      recommendations.push({
        confidence,
        impact: "medium",
        rationale: `CTR ${(record.ctr * 100).toFixed(2)}% przy ${record.impressions} wyświetleniach wskazuje na niski udział kliknięć; przyczyna wymaga analizy kreacji i targetowania.`,
        recommendationId: deterministicUuid(`campaign:ctr:${record.campaignId}`),
        title: `Przetestuj kreację lub targetowanie: ${record.name}`,
      });
    }
  }
  return recommendations;
}

function normalizeCampaignStatus(value: string | null): RealCampaignsRecord["status"] {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) return null;
  if (normalized === "ENABLED" || normalized === "ACTIVE") return "active";
  if (normalized === "PAUSED") return "paused";
  if (normalized === "REMOVED" || normalized === "ARCHIVED" || normalized === "DELETED" || normalized === "ENDED") return "ended";
  if (normalized === "DRAFT") return "draft";
  return null;
}

function campaignFinding(
  record: RealCampaignsRecord,
  code: string,
  severity: CampaignDiagnosticFinding["severity"],
  message: string,
): CampaignDiagnosticFinding {
  return {
    code,
    findingId: deterministicUuid(`${code}:${record.campaignId}`),
    message,
    severity,
    sourceRef: record.campaignId,
  };
}

function campaignEvidenceCompleteness(record: RealCampaignsRecord): number {
  const checks = [
    record.spend.amount >= 0,
    record.revenue.amount >= 0,
    record.impressions >= 0,
    record.clicks >= 0,
    record.conversions >= 0,
    record.ctr !== null,
    record.roas !== null,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 10_000) / 10_000;
}

function deterministicUuid(value: string): string {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "4";
  hex[16] = ["8", "9", "a", "b"][Number.parseInt(hex[16] ?? "0", 16) % 4]!;
  const joined = hex.join("");
  return `${joined.slice(0, 8)}-${joined.slice(8, 12)}-${joined.slice(12, 16)}-${joined.slice(16, 20)}-${joined.slice(20)}`;
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

  const totalsByCurrency = new Map<string, number>();
  const byChannel = new Map<string, { channel: string; conversions: number; currency: string; revenue: number }>();
  for (const record of filtered) {
    const currency = record.revenue.currency;
    totalsByCurrency.set(currency, (totalsByCurrency.get(currency) ?? 0) + record.revenue.amount);
    const key = `${record.channel}:${currency}`;
    const bucket = byChannel.get(key) ?? {
      channel: record.channel,
      conversions: 0,
      currency,
      revenue: 0,
    };
    bucket.revenue += record.revenue.amount;
    bucket.conversions += record.conversions;
    byChannel.set(key, bucket);
  }
  const attribution: CampaignsAttributionRow[] = [...byChannel.values()].map((bucket) => {
    const totalRevenue = totalsByCurrency.get(bucket.currency) ?? 0;
    return {
      contribution: totalRevenue > 0 ? Math.round((bucket.revenue / totalRevenue) * 1000) / 1000 : 0,
      model: "provider_reported",
      orders: bucket.conversions,
      revenue: { amount: roundMoney(bucket.revenue), currency: bucket.currency },
      source: bucket.channel,
    };
  });

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
