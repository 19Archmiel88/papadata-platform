import type { CustomerSegment, CustomerMoney as Money, RealCustomersRecord, CustomersSegmentSummary, CustomersParetoBucket, CustomersTrendPoint, CustomersCacSummary, CustomersAffinityRow, CustomersAffinitySummary, CustomersPriorityAlert, CustomersCohort, CustomersCurrencyCoverage, CustomersFilters, CustomersPageRequest, CustomersPortfolio, CustomersPortfolioTotals } from "@papadata/contracts";
export type { CustomerSegment, CustomerMoney as Money, RealCustomersRecord, CustomersSegmentSummary, CustomersParetoBucket, CustomersTrendPoint, CustomersCacSummary, CustomersAffinityRow, CustomersAffinitySummary, CustomersPriorityAlert, CustomersCohort, CustomersRetentionCell, CustomersCurrencyCoverage, CustomersFilters, CustomersPageRequest, CustomersSummaryRecord, CustomersPortfolio, CustomersPortfolioTotals } from "@papadata/contracts";
import type { IsoDateTime } from "@papadata/contracts";
import type { CanonicalAdSpendRecord, CanonicalOrderRecord } from "../../integrations/integrationDataCore.ts";
import { centsToDecimal, decimalToCents, isRevenueQualifyingOrder } from "../../metrics/metricEngineCore.ts";
import {
  createRealMetricEngineInput,
  type CommandCenterDataSource,
} from "./command-center-metrics.real-source.ts";
import {
  resolveMetricWindow,
  type CommandCenterDateRangeInput,
} from "./command-center-metrics.contract-data.ts";
import {
  classifyCustomerOrders,
  customerIdentityDiagnostics,
  pseudonymizeCustomerReference,
  CUSTOMER_HISTORY_FLOOR,
  type ClassifiedCustomerOrder,
} from "./customer-lifecycle.ts";

/** Needs the full data source (not just listCanonicalRecords) because it goes through `createRealMetricEngineInput`. */
export type CustomersDataSource = CommandCenterDataSource;

// Fixed, stable ids for each RFM segment bucket -- same pattern as Command
// Center's own hardcoded recommendation ids (buildCommandCenterRecommendationsData).
// Not per-tenant-generated because the segment taxonomy itself is a platform
// concept, not tenant data.
const SEGMENT_IDS: Readonly<Record<CustomerSegment, string>> = {
  atRisk: "55555555-5555-4555-8555-555555555504",
  champions: "55555555-5555-4555-8555-555555555501",
  hibernating: "55555555-5555-4555-8555-555555555505",
  loyal: "55555555-5555-4555-8555-555555555502",
  new: "55555555-5555-4555-8555-555555555506",
  potential: "55555555-5555-4555-8555-555555555503",
};

const SEGMENT_LABELS: Readonly<Record<CustomerSegment, string>> = {
  atRisk: "At Risk",
  champions: "Champions",
  hibernating: "Hibernating",
  loyal: "Loyal Customers",
  new: "New",
  potential: "Potential Loyalists",
};

/**
 * Portfolio-wide totals over EVERY real customer, computed before pagination
 * slices `records` down to a page -- a KPI tile built from `records.length`
 * alone would silently undercount once the base exceeds one page (records
 * defaults to a 50-row page; this repo's own demo tenant already has more
 * than 50 real customers, so this is not a hypothetical).
 */


const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;

type CustomerAggregate = {
  readonly customerReference: string;
  readonly firstOrderAt: IsoDateTime;
  readonly isNewInWindow: boolean;
  readonly lastOrderAt: IsoDateTime;
  readonly ordersAllTime: readonly CanonicalOrderRecord[];
  readonly ordersInWindow: readonly CanonicalOrderRecord[];
  readonly pseudonym: string;
  readonly revenueAllTimeCents: bigint;
  readonly revenueInWindowCents: bigint;
};

function buildAggregates(
  classified: readonly ClassifiedCustomerOrder[],
  periodStart: string,
  periodEnd: string,
): readonly CustomerAggregate[] {
  const byCustomer = new Map<string, ClassifiedCustomerOrder[]>();
  for (const entry of classified) {
    const list = byCustomer.get(entry.customerReference) ?? [];
    list.push(entry);
    byCustomer.set(entry.customerReference, list);
  }

  const aggregates: CustomerAggregate[] = [];
  for (const [customerReference, entries] of byCustomer) {
    // `classifyCustomerOrders` already emits each customer's orders in
    // chronological order, so `entries[0]` is genuinely their first order.
    const first = entries[0]!;
    const last = entries[entries.length - 1]!;
    const revenueAllTimeCents = entries.reduce((sum, e) => sum + decimalToCents(e.order.grossAmount), 0n);
    const windowEntries = entries.filter((e) => e.order.orderedAt >= periodStart && e.order.orderedAt < periodEnd);
    const revenueInWindowCents = windowEntries.reduce((sum, e) => sum + decimalToCents(e.order.grossAmount), 0n);

    aggregates.push({
      customerReference,
      firstOrderAt: first.order.orderedAt,
      isNewInWindow: first.order.orderedAt >= periodStart && first.order.orderedAt < periodEnd,
      lastOrderAt: last.order.orderedAt,
      ordersAllTime: entries.map((e) => e.order),
      ordersInWindow: windowEntries.map((e) => e.order),
      pseudonym: pseudonymizeCustomerReference(customerReference),
      revenueAllTimeCents,
      revenueInWindowCents,
    });
  }
  return aggregates;
}

// Rank-based 1-5 quantile scoring -- adapts to however many real customers
// exist rather than assuming a fixed population (honest for small demo-scale
// data, where a handful of customers won't spread evenly across 5 buckets by
// any fixed-threshold scheme). `higherIsBetter` false is used for recency
// (fewer days since last order = better).
function rankScores(values: readonly number[], higherIsBetter: boolean): number[] {
  const n = values.length;
  const scores = new Array<number>(n).fill(3);
  const order = [...values.keys()].sort((a, b) => values[a]! - values[b]!);
  // Equal input values receive the same score. An all-equal/single-customer
  // population is neutral, not arbitrarily marked at risk by iteration order.
  for (let first = 0; first < n;) {
    let last = first;
    while (last + 1 < n && values[order[last + 1]!] === values[order[first]!]) last += 1;
    const percentile = (first + last + 1) / (2 * n);
    const bucket = Math.min(5, Math.max(1, Math.ceil(percentile * 5)));
    for (let rank = first; rank <= last; rank += 1) scores[order[rank]!] = higherIsBetter ? bucket : 6 - bucket;
    first = last + 1;
  }
  return scores;
}

/**
 * Simplified, documented rule-based RFM segmentation (Recency/Frequency/
 * Monetary scored 1-5 by rank, see `rankScores`). Not a fabricated label --
 * every input (recency, order count, revenue) is real; the segmentation
 * rule itself is a chosen, disclosed methodology (same posture as products'
 * ABC/Pareto classification and orders' status-bucketing table).
 *
 * "champions"/"loyal" both require decent recency (r >= 3/4), not just high
 * frequency/monetary -- with a small customer base, rank-based scoring can
 * hand a long-dormant, one-time high-value buyer a high monetary/frequency
 * *rank* purely because most of the (tiny) population spent/ordered less;
 * gating on recency too keeps that customer out of "loyal" and into
 * "atRisk"/"hibernating", where a lapsed high-value buyer belongs.
 */
function classifySegment(r: number, f: number, m: number, ordersAllTimeCount: number, isNewInWindow: boolean): CustomerSegment {
  if (ordersAllTimeCount <= 1 && isNewInWindow) return "new";
  if (r >= 4 && f >= 4 && m >= 4) return "champions";
  if (r >= 3 && f >= 3 && m >= 3) return "loyal";
  if (r <= 2 && (f >= 3 || m >= 3)) return "atRisk";
  if (r <= 2) return "hibernating";
  return "potential";
}

function readinessForSegment(segment: CustomerSegment): "critical" | "ready" | "warning" {
  if (segment === "hibernating") return "critical";
  if (segment === "atRisk") return "warning";
  return "ready";
}

/** Use workspace-local calendar dates, not elapsed 24-hour periods (DST). */
function localDate(instant: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" })
    .formatToParts(new Date(instant));
  const part = (name: string) => parts.find((item) => item.type === name)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
function daysBetween(fromIso: string, toIso: string, timezone: string): number {
  const from = Date.parse(`${localDate(fromIso, timezone)}T00:00:00Z`);
  const to = Date.parse(`${localDate(toIso, timezone)}T00:00:00Z`);
  return Math.max(0, Math.round((to - from) / 86_400_000));
}
function monthIndex(month: string): number {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7)) - 1;
}

function toMoney(cents: bigint, currency: string): Money {
  return { amount: Number.parseFloat(centsToDecimal(cents)), currency };
}

function clampLimit(requested: number | null | undefined): number {
  if (typeof requested !== "number" || !Number.isFinite(requested) || requested <= 0) {
    return DEFAULT_PAGE_LIMIT;
  }
  return Math.min(Math.round(requested), MAX_PAGE_LIMIT);
}

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64url");
}

function decodeCursor(cursor: string | null | undefined): number {
  if (!cursor) return 0;
  const decoded = Number.parseInt(Buffer.from(cursor, "base64url").toString("utf8"), 10);
  return Number.isFinite(decoded) && decoded >= 0 ? decoded : 0;
}

function buildTrend(
  classified: readonly ClassifiedCustomerOrder[],
  periodStart: string,
  periodEnd: string,
  timezone: string,
): readonly CustomersTrendPoint[] {
  const byDay = new Map<string, { newCustomers: Set<string>; newRevenueCents: bigint; returningCustomers: Set<string>; returningRevenueCents: bigint }>();
  for (const { customerReference, isFirstOrder, order } of classified) {
    if (order.orderedAt < periodStart || order.orderedAt >= periodEnd) continue;
    const date = localDate(order.orderedAt, timezone);
    const bucket = byDay.get(date) ?? {
      newCustomers: new Set<string>(),
      newRevenueCents: 0n,
      returningCustomers: new Set<string>(),
      returningRevenueCents: 0n,
    };
    const cents = decimalToCents(order.grossAmount);
    if (isFirstOrder) {
      bucket.newCustomers.add(customerReference);
      bucket.newRevenueCents += cents;
    } else {
      bucket.returningCustomers.add(customerReference);
      bucket.returningRevenueCents += cents;
    }
    byDay.set(date, bucket);
  }

  return [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([date, bucket]) => ({
      date,
      newCustomers: bucket.newCustomers.size,
      newRevenue: Number.parseFloat(centsToDecimal(bucket.newRevenueCents)),
      returningCustomers: bucket.returningCustomers.size,
      returningRevenue: Number.parseFloat(centsToDecimal(bucket.returningRevenueCents)),
    }));
}

function buildCac(
  adSpendRows: readonly CanonicalAdSpendRecord[],
  periodStart: string,
  periodEnd: string,
  newCustomersInWindow: number,
  reportingCurrency: string,
): CustomersCacSummary | null {
  const windowSpend = adSpendRows.filter((row) => {
    if (row.currency !== reportingCurrency) return false;
    const time = new Date(row.date).getTime();
    return time >= new Date(periodStart).getTime() && time < new Date(periodEnd).getTime();
  });
  // No ad spend in this window -- CAC is genuinely unknowable, not zero.
  if (windowSpend.length === 0) return null;

  const spendCents = windowSpend.reduce((sum, row) => sum + decimalToCents(row.costAmount), 0n);
  const currency = windowSpend[0]!.currency;
  const spend = Number.parseFloat(centsToDecimal(spendCents));
  return {
    cac: newCustomersInWindow > 0 ? Math.round((spend / newCustomersInWindow) * 100) / 100 : null,
    newCustomers: newCustomersInWindow,
    spend: { amount: spend, currency },
  };
}

function buildAffinity(
  classified: readonly ClassifiedCustomerOrder[],
  orderLines: readonly { readonly canonicalOrderId: string; readonly canonicalProductId: string | null; readonly grossAmount: string }[],
  productNames: ReadonlyMap<string, string>,
  periodStart: string,
  periodEnd: string,
  fallbackCurrency: string,
): CustomersAffinitySummary {
  const linesByOrderId = new Map<string, typeof orderLines[number][]>();
  for (const line of orderLines) {
    const list = linesByOrderId.get(line.canonicalOrderId) ?? [];
    list.push(line);
    linesByOrderId.set(line.canonicalOrderId, list);
  }

  type Totals = { currency: string; orders: Set<string>; revenueCents: bigint };
  const newTotals = new Map<string, Totals>();
  const returningTotals = new Map<string, Totals>();

  for (const { isFirstOrder, order } of classified) {
    if (order.orderedAt < periodStart || order.orderedAt >= periodEnd) continue;
    const lines = linesByOrderId.get(order.canonicalOrderId) ?? [];
    const totals = isFirstOrder ? newTotals : returningTotals;
    for (const line of lines) {
      if (!line.canonicalProductId) continue;
      const entry = totals.get(line.canonicalProductId) ?? { currency: order.currency, orders: new Set<string>(), revenueCents: 0n };
      entry.orders.add(order.canonicalOrderId);
      entry.revenueCents += decimalToCents(line.grossAmount);
      totals.set(line.canonicalProductId, entry);
    }
  }

  function topRows(totals: Map<string, Totals>): CustomersAffinityRow[] {
    return [...totals.entries()]
      .map(([productId, entry]) => ({
        name: productNames.get(productId) ?? productId,
        orders: entry.orders.size,
        revenue: toMoney(entry.revenueCents, entry.currency || fallbackCurrency),
      }))
      .sort((a, b) => b.revenue.amount - a.revenue.amount)
      .slice(0, 5);
  }

  return { newProducts: topRows(newTotals), returningProducts: topRows(returningTotals) };
}

function buildCohorts(aggregates: readonly CustomerAggregate[], currency: string, asOf: string, timezone: string): readonly CustomersCohort[] {
  const byMonth = new Map<string, CustomerAggregate[]>();
  const observationMonth = monthIndex(localDate(asOf, timezone).slice(0, 7));
  for (const aggregate of aggregates) {
    const month = localDate(aggregate.firstOrderAt, timezone).slice(0, 7);
    const entries = byMonth.get(month) ?? [];
    entries.push(aggregate);
    byMonth.set(month, entries);
  }
  return [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([cohortKey, entries]) => {
    const cohortMonth = monthIndex(cohortKey);
    const returnedLater = entries.filter(entry => entry.ordersAllTime.some(order => monthIndex(localDate(order.orderedAt, timezone).slice(0, 7)) > cohortMonth)).length;
    return {
      cohortKey,
      users: entries.length,
      revenue: toMoney(entries.reduce((sum, entry) => sum + entry.revenueAllTimeCents, 0n), currency),
      retentionRate: observationMonth > cohortMonth && entries.length > 0 ? returnedLater / entries.length : null,
      // Periodic M1-M12 retention, not cumulative retention. A month becomes
      // eligible only after it has completely elapsed as of the selected date.
      retention: Array.from({ length: 12 }, (_, index) => {
        const monthOffset = index + 1;
        const targetMonth = cohortMonth + monthOffset;
        const complete = targetMonth < observationMonth;
        const retainedUsers = entries.filter(entry => entry.ordersAllTime.some(order => monthIndex(localDate(order.orderedAt, timezone).slice(0, 7)) === targetMonth)).length;
        return { monthOffset, eligibleUsers: complete ? entries.length : 0, retainedUsers,
          rate: complete && entries.length > 0 ? retainedUsers / entries.length : null, complete };
      }),
    };
  });
}

function matchesFilters(record: RealCustomersRecord, segment: CustomerSegment, filters: CustomersFilters | null | undefined): boolean {
  if (!filters) return true;
  if (filters.segment?.length && !filters.segment.includes(segment)) return false;
  if (filters.riskStatus?.length) {
    const risk = segment === "atRisk" ? "at_risk" : segment === "hibernating" ? "lapsed" : "active";
    if (!filters.riskStatus.includes(risk)) return false;
  }
  const needle = filters.search?.trim().toLowerCase();
  if (needle && !record.customerPseudonym.toLowerCase().includes(needle)) return false;
  return true;
}

/**
 * Builds the full real customer-portfolio view backing every `customers.*.read`
 * list-shaped operationId. Unlike orders/products (where each record is a
 * per-period event), a "customer" is an enduring entity -- so `records`
 * covers every real customer with at least one qualifying order ever, not
 * just ones active in the requested window (an At Risk/Hibernating customer,
 * by definition, has *no* recent orders -- restricting to window-active
 * customers would make the whole risk concept impossible to show).
 * `ordersCount`/`ltv` are all-time; `revenue`/`isNewCustomer` are
 * window-scoped (revenue can be honestly 0 for a real customer who simply
 * didn't order this period).
 */
export async function buildCustomerPortfolio(options: {
  readonly dataSource: CustomersDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly filters?: CustomersFilters | null;
  readonly generatedAt: string;
  readonly page?: CustomersPageRequest | null;
  /** Trusted service-only export, never copied from a raw read query. */
  readonly exportAll?: boolean;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<CustomersPortfolio> {
  const { dataSource, dateRange, filters, generatedAt, page, tenantId, workspaceId } = options;
  const { periodEnd, periodStart, timezone } = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);

  const [allTimeInput, rawRows, connections, checkpoints] = await Promise.all([
    createRealMetricEngineInput({
      dataSource,
      generatedAt: generatedAt as IsoDateTime,
      periodEnd,
      periodStart: CUSTOMER_HISTORY_FLOOR as IsoDateTime,
      tenantId,
      timezone,
      workspaceId,
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      businessTimeFrom: CUSTOMER_HISTORY_FLOOR,
      businessTimeTo: periodEnd,
      streams: ["orders"],
    }),
    dataSource.listConnections(tenantId,workspaceId),
    dataSource.listSyncCheckpoints(tenantId,workspaceId),
  ]);

  const currency = allTimeInput.currency;
  const observedCurrencies = [...new Set(
    allTimeInput.canonicalOrders.map((order) => order.currency).filter(Boolean),
  )].sort();
  const allQualifyingOrders = allTimeInput.canonicalOrders.filter(isRevenueQualifyingOrder);
  // LTV/AOV/revenue cannot be added across currencies without an FX policy.
  // Until the workspace owns an explicit reporting-currency + historical FX
  // contract, calculate monetary customer views in one reporting currency and
  // expose exactly how many qualifying orders were excluded.
  const qualifyingOrders = allQualifyingOrders.filter((order) => order.currency === currency);
  const classified = classifyCustomerOrders(qualifyingOrders, rawRows);
  const identity=customerIdentityDiagnostics(qualifyingOrders,rawRows);
  const sourceIds=[...new Set(rawRows.map(row=>String(row.connection_id??'')).filter(Boolean))];
  const activeCommerce=connections.filter(row=>['allegro','baselinker','shopify','woocommerce'].includes(String(row.provider_id))&&!row.deleted_at).map(row=>String(row.id??row.connection_id??''));
  const requiredSources=[...new Set([...sourceIds,...activeCommerce])].filter(Boolean);
  const times=requiredSources.map(id=>checkpoints.filter(row=>String(row.connection_id)===id&&row.stream==='orders').map(row=>row.updated_at instanceof Date?row.updated_at.toISOString():String(row.updated_at??'')).filter(value=>Number.isFinite(Date.parse(value))).sort().at(-1)??null);
  const synchronizedAt=times.length>0&&times.every((value):value is string=>value!==null)?[...times].sort()[0]!:null;
  const firstObservedOrderAt=qualifyingOrders.length?qualifyingOrders.reduce((first,row)=>row.orderedAt<first?row.orderedAt:first,qualifyingOrders[0]!.orderedAt):null;
  const aggregates = buildAggregates(classified, periodStart, periodEnd);
  const currencyCoverage: CustomersCurrencyCoverage = {
    excludedOrders: allQualifyingOrders.length - qualifyingOrders.length,
    observedCurrencies,
    reportingCurrency: currency,
  };

  // periodEnd is exclusive; subtract one millisecond before deriving "as of".
  const asOf = new Date(Date.parse(periodEnd) - 1).toISOString();
  const recencyDaysByCustomer = aggregates.map((a) => daysBetween(a.lastOrderAt, asOf, timezone));
  const frequencyByCustomer = aggregates.map((a) => a.ordersAllTime.length);
  const monetaryByCustomer = aggregates.map((a) => Number(a.revenueAllTimeCents));
  const rScores = rankScores(recencyDaysByCustomer, false);
  const fScores = rankScores(frequencyByCustomer, true);
  const mScores = rankScores(monetaryByCustomer, true);

  const allRecords: { readonly ltvCents: bigint; readonly record: RealCustomersRecord; readonly segment: CustomerSegment }[] = aggregates.map((aggregate, index) => {
    const r = rScores[index]!;
    const f = fScores[index]!;
    const m = mScores[index]!;
    const segment = classifySegment(r, f, m, aggregate.ordersAllTime.length, aggregate.isNewInWindow);
    const record: RealCustomersRecord = {
      aov: toMoney(aggregate.revenueAllTimeCents / BigInt(aggregate.ordersAllTime.length), currency),
      cohortKey: localDate(aggregate.firstOrderAt, timezone).slice(0, 7),
      consentStatus: "unknown",
      customerPseudonym: aggregate.pseudonym,
      isNewCustomer: aggregate.isNewInWindow,
      ltv: toMoney(aggregate.revenueAllTimeCents, currency),
      ordersCount: aggregate.ordersAllTime.length,
      recencyDays: recencyDaysByCustomer[index]!,
      revenue: toMoney(aggregate.revenueInWindowCents, currency),
      rfmScore: `${r}${f}${m}`,
      segmentId: SEGMENT_IDS[segment],
      segmentLabel: SEGMENT_LABELS[segment],
    };
    return { ltvCents: aggregate.revenueAllTimeCents, record, segment };
  });

  const filtered = allRecords.filter(({ record, segment }) => matchesFilters(record, segment, filters));
  const sortBy = filters?.sortBy ?? "ltv";
  const direction = filters?.sortDirection === "asc" ? 1 : -1;
  const sortValue = (record: RealCustomersRecord): number | string => {
    switch (sortBy) {
      case "customerPseudonym": return record.customerPseudonym;
      case "ordersCount": return record.ordersCount;
      case "recencyDays": return record.recencyDays;
      case "revenue": return record.revenue.amount;
      default: return record.ltv.amount;
    }
  };
  const sorted = [...filtered].sort((a, b) => {
    const left = sortValue(a.record), right = sortValue(b.record);
    return (left < right ? -direction : left > right ? direction : 0)
      || a.record.customerPseudonym.localeCompare(b.record.customerPseudonym);
  });

  if (options.exportAll && sorted.length > 50000) throw new Error("CUSTOMER_EXPORT_TOO_LARGE");
  const limit = options.exportAll ? 50000 : clampLimit(page?.limit);
  const offset = options.exportAll ? 0 : decodeCursor(page?.cursor);
  const pageRecords = sorted.slice(offset, offset + limit).map((entry) => entry.record);
  const nextOffset = offset + pageRecords.length;

  let ready = 0;
  let warning = 0;
  let critical = 0;
  const segmentTotals = new Map<CustomerSegment, { count: number; revenueCents: bigint }>();
  for (const { ltvCents, segment } of allRecords) {
    const bucket = readinessForSegment(segment);
    if (bucket === "ready") ready += 1;
    else if (bucket === "warning") warning += 1;
    else critical += 1;
    const totals = segmentTotals.get(segment) ?? { count: 0, revenueCents: 0n };
    totals.count += 1;
    totals.revenueCents += ltvCents;
    segmentTotals.set(segment, totals);
  }

  const segments: CustomersSegmentSummary[] = (Object.keys(SEGMENT_LABELS) as CustomerSegment[])
    .map((segment) => {
      const totals = segmentTotals.get(segment) ?? { count: 0, revenueCents: 0n };
      return {
        count: totals.count,
        description: SEGMENT_DESCRIPTIONS[segment],
        revenue: toMoney(totals.revenueCents, currency),
        segmentId: SEGMENT_IDS[segment],
        segmentLabel: SEGMENT_LABELS[segment],
      };
    })
    .filter((segment) => segment.count > 0);

  const totalRevenueAllTimeCents = aggregates.reduce((sum, a) => sum + a.revenueAllTimeCents, 0n);
  const byRevenueDesc = [...aggregates].sort((a, b) => (b.revenueAllTimeCents > a.revenueAllTimeCents ? 1 : b.revenueAllTimeCents < a.revenueAllTimeCents ? -1 : 0));
  let runningCents = 0n;
  const bucketed = new Map<"A" | "B" | "C", { count: number; revenueCents: bigint }>();
  for (const aggregate of byRevenueDesc) {
    // Include the customer who crosses a threshold in the bucket they fill.
    // A single customer contributing >80% must not leave bucket A empty.
    const shareBefore = totalRevenueAllTimeCents > 0n ? Number(runningCents) / Number(totalRevenueAllTimeCents) : 0;
    const bucketKey: "A" | "B" | "C" = shareBefore < 0.8 ? "A" : shareBefore < 0.95 ? "B" : "C";
    runningCents += aggregate.revenueAllTimeCents;
    const entry = bucketed.get(bucketKey) ?? { count: 0, revenueCents: 0n };
    entry.count += 1;
    entry.revenueCents += aggregate.revenueAllTimeCents;
    bucketed.set(bucketKey, entry);
  }
  let cumulativeCents = 0n;
  const pareto: CustomersParetoBucket[] = (["A", "B", "C"] as const)
    .map((bucketKey) => {
      const entry = bucketed.get(bucketKey);
      if (!entry) return null;
      cumulativeCents += entry.revenueCents;
      return {
        bucket: bucketKey,
        customers: entry.count,
        cumulativeRevenueShare: totalRevenueAllTimeCents > 0n
          ? Math.round((Number(cumulativeCents) / Number(totalRevenueAllTimeCents)) * 1000) / 1000
          : 0,
        revenue: toMoney(entry.revenueCents, currency),
      };
    })
    .filter((bucket): bucket is CustomersParetoBucket => bucket !== null);

  const productNames = new Map(allTimeInput.canonicalProducts.map((product) => [product.canonicalProductId, product.name] as const));
  const affinity = buildAffinity(classified, allTimeInput.canonicalOrderLines, productNames, periodStart, periodEnd, currency);

  const newCustomersInWindow = aggregates.filter((a) => a.isNewInWindow).length;
  const cac = buildCac(
    allTimeInput.canonicalAdSpend,
    periodStart,
    periodEnd,
    newCustomersInWindow,
    currency,
  );

  const priorityEntries = allRecords.filter(({ segment }) => segment === "atRisk" || segment === "hibernating");
  const priorityAlert: CustomersPriorityAlert | null = priorityEntries.length > 0
    ? {
        count: priorityEntries.length,
        revenue: toMoney(
          priorityEntries.reduce((sum, { ltvCents }) => sum + ltvCents, 0n),
          currency,
        ),
      }
    : null;

  const newCustomers = aggregates.filter((aggregate) => aggregate.isNewInWindow).length;
  const activeCustomers = aggregates.filter((aggregate) => aggregate.ordersInWindow.length > 0).length;
  const totalLtvCents = aggregates.reduce((sum, aggregate) => sum + aggregate.revenueAllTimeCents, 0n);
  const totalWindowRevenueCents = aggregates.reduce((sum, aggregate) => sum + aggregate.revenueInWindowCents, 0n);
  const totalOrdersAllTime = aggregates.reduce((sum, aggregate) => sum + aggregate.ordersAllTime.length, 0);
  const portfolioTotals: CustomersPortfolioTotals = {
    activeCustomers,
    aovAllTime: totalOrdersAllTime > 0 ? toMoney(totalLtvCents / BigInt(totalOrdersAllTime), currency) : null,
    newCustomers,
    returningCustomers: aggregates.filter((aggregate) => aggregate.ordersInWindow.length > 0 && !aggregate.isNewInWindow).length,
    totalCustomers: aggregates.length,
    totalLtv: toMoney(totalLtvCents, currency),
    totalWindowRevenue: toMoney(totalWindowRevenueCents, currency),
  };

  return {
    scope: { asOf, historyFrom: CUSTOMER_HISTORY_FLOOR, periodStart, periodEndExclusive: periodEnd, timezone,
      calculatedAt: generatedAt, synchronizedAt, filtersApplyTo: "records_only",
      rfmMethod: "tied_midrank_quintiles_v2", ltvMethod: "observed_qualifying_gross_revenue" },
    coverage:{qualifyingOrders:qualifyingOrders.length,classifiedOrders:classified.length,...identity,firstObservedOrderAt,sourceCount:requiredSources.length,historyComplete:false},
    affinity,
    cac,
    cohorts: buildCohorts(aggregates, currency, asOf, timezone),
    currencyCoverage,
    pageInfo: { nextCursor: nextOffset < sorted.length ? encodeCursor(nextOffset) : null, total: sorted.length },
    pareto,
    portfolioTotals,
    priorityAlert,
    records: pageRecords,
    segments,
    summary: { critical, ready, total: allRecords.length, updatedAt: generatedAt as IsoDateTime, warning },
    trend: buildTrend(classified, periodStart, periodEnd, timezone),
  };
}

const SEGMENT_DESCRIPTIONS: Readonly<Record<CustomerSegment, string>> = {
  atRisk: "Wysoka wartość, długa przerwa od zakupu",
  champions: "Najwyższa częstotliwość i przychód",
  hibernating: "Niska aktywność, dawny zakup",
  loyal: "Regularne zakupy, wysoki LTV",
  new: "Pierwsze kwalifikowane zamówienie",
  potential: "Ostatnie zakupy, powtarzalni",
};

/** Backs `customers.pseudonymized-detail.read` -- a single customer looked up by pseudonym. */
export async function fetchCustomerDetail(options: {
  readonly customerPseudonym: string;
  readonly dataSource: CustomersDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<RealCustomersRecord | null> {
  const portfolio = await buildCustomerPortfolio({
    dataSource: options.dataSource, dateRange: options.dateRange, generatedAt: options.generatedAt,
    filters: { search: options.customerPseudonym }, page: { limit: MAX_PAGE_LIMIT },
    tenantId: options.tenantId, workspaceId: options.workspaceId,
  });
  return portfolio.records.find(record => record.customerPseudonym === options.customerPseudonym) ?? null;
}
