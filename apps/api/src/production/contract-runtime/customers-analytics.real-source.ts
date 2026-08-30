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
  pseudonymizeCustomerReference,
  CUSTOMER_HISTORY_FLOOR,
  type ClassifiedCustomerOrder,
} from "./customer-lifecycle.ts";

/** Needs the full data source (not just listCanonicalRecords) because it goes through `createRealMetricEngineInput`. */
export type CustomersDataSource = CommandCenterDataSource;

export type CustomerSegment = "atRisk" | "champions" | "hibernating" | "loyal" | "new" | "potential";

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

export type Money = { readonly amount: number; readonly currency: string };

export type RealCustomersRecord = {
  readonly aov: Money;
  readonly consentStatus: "unknown";
  readonly cohortKey: string;
  readonly customerPseudonym: string;
  readonly isNewCustomer: boolean;
  readonly ltv: Money;
  readonly ordersCount: number;
  readonly recencyDays: number;
  readonly revenue: Money;
  readonly rfmScore: string;
  readonly segmentId: string;
  readonly segmentLabel: string;
};

export type CustomersSegmentSummary = {
  readonly count: number;
  readonly description: string;
  readonly revenue: Money;
  readonly segmentId: string;
  readonly segmentLabel: string;
};

export type CustomersParetoBucket = {
  readonly bucket: "A" | "B" | "C";
  readonly customers: number;
  readonly cumulativeRevenueShare: number;
  readonly revenue: Money;
};

export type CustomersTrendPoint = {
  readonly date: string;
  readonly newCustomers: number;
  readonly newRevenue: number;
  readonly returningCustomers: number;
  readonly returningRevenue: number;
};

export type CustomersCacSummary = {
  readonly cac: number | null;
  readonly newCustomers: number;
  readonly spend: Money;
};

export type CustomersAffinityRow = { readonly name: string; readonly orders: number; readonly revenue: Money };

export type CustomersAffinitySummary = {
  readonly newProducts: readonly CustomersAffinityRow[];
  readonly returningProducts: readonly CustomersAffinityRow[];
};

export type CustomersPriorityAlert = { readonly count: number; readonly revenue: Money };

export type CustomersCohort = {
  readonly cohortKey: string;
  readonly retentionRate: null;
  readonly revenue: Money;
  readonly users: number;
};

export type CustomersFilters = {
  readonly riskStatus?: readonly ("at_risk" | "active" | "lapsed")[] | null;
  readonly search?: string | null;
  readonly segment?: readonly CustomerSegment[] | null;
};

export type CustomersPageRequest = { readonly cursor?: string | null; readonly limit?: number | null };

export type CustomersSummaryRecord = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: IsoDateTime;
  readonly warning: number;
};

export type CustomersPortfolio = {
  readonly affinity: CustomersAffinitySummary;
  readonly cac: CustomersCacSummary | null;
  readonly cohorts: readonly CustomersCohort[];
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number | null };
  readonly pareto: readonly CustomersParetoBucket[];
  readonly portfolioTotals: CustomersPortfolioTotals;
  readonly priorityAlert: CustomersPriorityAlert | null;
  readonly records: readonly RealCustomersRecord[];
  readonly segments: readonly CustomersSegmentSummary[];
  readonly summary: CustomersSummaryRecord;
  readonly trend: readonly CustomersTrendPoint[];
};

/**
 * Portfolio-wide totals over EVERY real customer, computed before pagination
 * slices `records` down to a page -- a KPI tile built from `records.length`
 * alone would silently undercount once the base exceeds one page (records
 * defaults to a 50-row page; this repo's own demo tenant already has more
 * than 50 real customers, so this is not a hypothetical).
 */
export type CustomersPortfolioTotals = {
  readonly activeCustomers: number;
  readonly aovAllTime: Money | null;
  readonly newCustomers: number;
  readonly returningCustomers: number;
  readonly totalCustomers: number;
  readonly totalLtv: Money;
  readonly totalWindowRevenue: Money;
};

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
  const scores = new Array<number>(n).fill(1);
  const order = [...values.keys()].sort((a, b) => values[a]! - values[b]!);
  order.forEach((originalIndex, rank) => {
    const percentile = (rank + 1) / n;
    const bucket = Math.min(5, Math.max(1, Math.ceil(percentile * 5)));
    scores[originalIndex] = higherIsBetter ? bucket : 6 - bucket;
  });
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
function classifySegment(r: number, f: number, m: number, ordersAllTimeCount: number): CustomerSegment {
  if (ordersAllTimeCount <= 1 && r >= 4) return "new";
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

function daysBetween(fromIso: string, toIso: string): number {
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.round(ms / (24 * 60 * 60 * 1000)));
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
): readonly CustomersTrendPoint[] {
  const byDay = new Map<string, { newCustomers: Set<string>; newRevenueCents: bigint; returningCustomers: Set<string>; returningRevenueCents: bigint }>();
  for (const { customerReference, isFirstOrder, order } of classified) {
    if (order.orderedAt < periodStart || order.orderedAt >= periodEnd) continue;
    const date = order.orderedAt.slice(0, 10);
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
): CustomersCacSummary | null {
  const windowSpend = adSpendRows.filter((row) => {
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

function buildCohorts(aggregates: readonly CustomerAggregate[], currency: string): readonly CustomersCohort[] {
  const byMonth = new Map<string, { revenueCents: bigint; users: number }>();
  for (const aggregate of aggregates) {
    const cohortKey = aggregate.firstOrderAt.slice(0, 7);
    const entry = byMonth.get(cohortKey) ?? { revenueCents: 0n, users: 0 };
    entry.users += 1;
    entry.revenueCents += aggregate.revenueAllTimeCents;
    byMonth.set(cohortKey, entry);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([cohortKey, entry]) => ({
      cohortKey,
      // Real month-over-month decay requires tracking whether each cohort's
      // customers returned in later calendar months -- not computed yet
      // (CLAUDE.md P0 "Zdefiniować cohortę" / LTV-retencja is still open).
      // Honestly null, matching the contract's own `retentionRate: number | null`,
      // rather than a fabricated curve.
      retentionRate: null,
      revenue: toMoney(entry.revenueCents, currency),
      users: entry.users,
    }));
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
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<CustomersPortfolio> {
  const { dataSource, dateRange, filters, generatedAt, page, tenantId, workspaceId } = options;
  const { periodEnd, periodStart, timezone } = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);

  const [allTimeInput, rawRows] = await Promise.all([
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
  ]);

  const qualifyingOrders = allTimeInput.canonicalOrders.filter(isRevenueQualifyingOrder);
  const classified = classifyCustomerOrders(qualifyingOrders, rawRows);
  const aggregates = buildAggregates(classified, periodStart, periodEnd);
  const currency = allTimeInput.currency;

  const recencyDaysByCustomer = aggregates.map((a) => daysBetween(a.lastOrderAt, generatedAt));
  const frequencyByCustomer = aggregates.map((a) => a.ordersAllTime.length);
  const monetaryByCustomer = aggregates.map((a) => Number(a.revenueAllTimeCents));
  const rScores = rankScores(recencyDaysByCustomer, false);
  const fScores = rankScores(frequencyByCustomer, true);
  const mScores = rankScores(monetaryByCustomer, true);

  const allRecords: { readonly ltvCents: bigint; readonly record: RealCustomersRecord; readonly segment: CustomerSegment }[] = aggregates.map((aggregate, index) => {
    const r = rScores[index]!;
    const f = fScores[index]!;
    const m = mScores[index]!;
    const segment = classifySegment(r, f, m, aggregate.ordersAllTime.length);
    const record: RealCustomersRecord = {
      aov: toMoney(aggregate.revenueAllTimeCents / BigInt(aggregate.ordersAllTime.length), currency),
      cohortKey: aggregate.firstOrderAt.slice(0, 7),
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
  const sorted = [...filtered].sort((a, b) => b.record.ltv.amount - a.record.ltv.amount);

  const limit = clampLimit(page?.limit);
  const offset = decodeCursor(page?.cursor);
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
    runningCents += aggregate.revenueAllTimeCents;
    const share = totalRevenueAllTimeCents > 0n ? Number(runningCents) / Number(totalRevenueAllTimeCents) : 0;
    const bucketKey: "A" | "B" | "C" = share <= 0.8 ? "A" : share <= 0.95 ? "B" : "C";
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
  const cac = buildCac(allTimeInput.canonicalAdSpend, periodStart, periodEnd, newCustomersInWindow);

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
  const activeCustomers = aggregates.filter((aggregate) => aggregate.revenueInWindowCents > 0n).length;
  const totalLtvCents = aggregates.reduce((sum, aggregate) => sum + aggregate.revenueAllTimeCents, 0n);
  const totalWindowRevenueCents = aggregates.reduce((sum, aggregate) => sum + aggregate.revenueInWindowCents, 0n);
  const totalOrdersAllTime = aggregates.reduce((sum, aggregate) => sum + aggregate.ordersAllTime.length, 0);
  const portfolioTotals: CustomersPortfolioTotals = {
    activeCustomers,
    aovAllTime: totalOrdersAllTime > 0 ? toMoney(totalLtvCents / BigInt(totalOrdersAllTime), currency) : null,
    newCustomers,
    returningCustomers: aggregates.length - newCustomers,
    totalCustomers: aggregates.length,
    totalLtv: toMoney(totalLtvCents, currency),
    totalWindowRevenue: toMoney(totalWindowRevenueCents, currency),
  };

  return {
    affinity,
    cac,
    cohorts: buildCohorts(aggregates, currency),
    pageInfo: { nextCursor: nextOffset < sorted.length ? encodeCursor(nextOffset) : null, total: sorted.length },
    pareto,
    portfolioTotals,
    priorityAlert,
    records: pageRecords,
    segments,
    summary: { critical, ready, total: allRecords.length, updatedAt: generatedAt as IsoDateTime, warning },
    trend: buildTrend(classified, periodStart, periodEnd),
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
    dataSource: options.dataSource,
    dateRange: options.dateRange,
    generatedAt: options.generatedAt,
    page: { limit: MAX_PAGE_LIMIT },
    tenantId: options.tenantId,
    workspaceId: options.workspaceId,
  });
  return portfolio.records.find((record) => record.customerPseudonym === options.customerPseudonym) ?? null;
}
