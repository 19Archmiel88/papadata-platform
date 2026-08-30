import type { IsoDateTime } from "@papadata/contracts";
import {
  effectiveIso,
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
import { pseudonymizeCustomerReference } from "./customer-lifecycle.ts";

/** Narrow slice of `CommandCenterDataSource` this module actually needs. */
export type OrdersDataSource = Pick<CommandCenterDataSource, "listCanonicalRecords">;

/** Matches the contract's `OrderStatus` union (packages/contracts api-schemas). */
export type OrdersRecordStatus = "cancelled" | "fulfilled" | "new" | "paid" | "refunded";

export type RealOrdersRecord = {
  readonly amount: { readonly amount: number; readonly currency: string };
  readonly customerPseudonym: string | null;
  readonly externalOrderId: string;
  readonly orderedAt: IsoDateTime;
  readonly orderId: string;
  readonly source: string;
  readonly status: OrdersRecordStatus;
};

export type OrdersFilters = {
  readonly search?: string | null;
  readonly source?: readonly string[] | null;
  readonly status?: readonly string[] | null;
};

export type OrdersPageRequest = {
  readonly cursor?: string | null;
  readonly limit?: number | null;
};

export type OrdersSummaryRecord = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: IsoDateTime;
  readonly warning: number;
};

export type OrdersListResult = {
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number | null };
  readonly records: readonly RealOrdersRecord[];
  readonly summary: OrdersSummaryRecord;
};

export type OrdersTimelineEvent = {
  readonly amount: RealOrdersRecord["amount"];
  readonly occurredAt: IsoDateTime;
  readonly orderId: string;
  readonly source: string;
  readonly status: OrdersRecordStatus;
};

export type OrdersSourceComparison = {
  readonly amount: { readonly amount: number; readonly currency: string };
  readonly orders: number;
  readonly source: string;
};

export type OrdersReconciliationAvailability = {
  readonly reason: string;
  readonly supported: false;
};

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;
// Detail lookups aren't bound to the list's default trailing window -- the
// order being looked up could be arbitrarily old. Real data only exists from
// when ingestion started, so this is a real floor, not an arbitrary guess.
const DETAIL_LOOKUP_FLOOR = "2020-01-01T00:00:00.000Z" as IsoDateTime;

// Contract's OrderStatus vocabulary (new|paid|fulfilled|cancelled|refunded) is
// coarser than real provider statuses (WooCommerce alone has ~10: pending,
// on-hold, processing, completed, cancelled, refunded, failed, trash,
// checkout-draft, ...). This buckets known raw statuses into that vocabulary;
// anything unrecognized falls to "new" -- the least committal bucket -- rather
// than guessing "paid"/"fulfilled", which would misrepresent the order.
const ORDER_STATUS_BY_RAW: Readonly<Record<string, OrdersRecordStatus>> = {
  cancelled: "cancelled",
  canceled: "cancelled",
  "checkout-draft": "new",
  completed: "fulfilled",
  draft: "new",
  failed: "cancelled",
  fulfilled: "fulfilled",
  "on-hold": "new",
  paid: "paid",
  pending: "new",
  processing: "paid",
  refunded: "refunded",
  shipped: "fulfilled",
  trash: "cancelled",
  voided: "cancelled",
};

function mapOrderStatus(rawStatus: string | null): OrdersRecordStatus {
  if (!rawStatus) {
    return "new";
  }
  return ORDER_STATUS_BY_RAW[rawStatus.toLowerCase()] ?? "new";
}

/**
 * ready/warning/critical mirrors the generic per-record readiness vocabulary
 * the platform already uses elsewhere (e.g. the data-quality domain). For an
 * order: paid/fulfilled is healthy (ready); a still-open or refunded order
 * needs attention but isn't wrong (warning); cancelled is the one state
 * genuinely worth flagging (critical).
 */
function readinessBucket(status: OrdersRecordStatus): "critical" | "ready" | "warning" {
  if (status === "paid" || status === "fulfilled") {
    return "ready";
  }
  if (status === "cancelled") {
    return "critical";
  }
  return "warning";
}

function mapCanonicalOrderRow(row: Record<string, unknown>): RealOrdersRecord | null {
  const providerId = readRowString(row.provider_id);
  const externalId = readRowString(row.external_id);
  if (!providerId || !externalId) {
    return null;
  }
  const entity = readEntity(row.canonical_payload);
  const grossAmount = readEntityNumber(entity, "grossAmount");
  if (grossAmount === null) {
    return null;
  }
  const orderedAt = effectiveIso(row.effective_time) ?? readEntityString(entity, "updatedAt");
  if (!orderedAt) {
    return null;
  }

  // `customerReference` (email / provider customer id, see normalizeOrder in
  // canonical-normalizer.ts) is real and already flows through the canonical
  // payload -- Command Center's own Customer Split section already relies on
  // it (see customer-lifecycle.ts). It was never wired into this list
  // before; hashed here rather than shown raw so no PII reaches the UI.
  const customerReference = readEntityString(entity, "customerReference");

  return {
    amount: {
      amount: Math.round(grossAmount * 100) / 100,
      currency: readEntityString(entity, "currency") ?? "PLN",
    },
    customerPseudonym: customerReference ? pseudonymizeCustomerReference(customerReference) : null,
    externalOrderId: externalId,
    orderedAt: orderedAt as IsoDateTime,
    orderId: `${providerId}:${externalId}`,
    source: providerId,
    status: mapOrderStatus(readEntityString(entity, "status")),
  };
}

function matchesFilters(record: RealOrdersRecord, filters: OrdersFilters | null | undefined): boolean {
  if (!filters) {
    return true;
  }
  if (filters.status?.length && !filters.status.includes(record.status)) {
    return false;
  }
  if (filters.source?.length && !filters.source.includes(record.source)) {
    return false;
  }
  const needle = filters.search?.trim().toLowerCase();
  if (needle && !record.externalOrderId.toLowerCase().includes(needle) && !record.orderId.toLowerCase().includes(needle)) {
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

// Offset-based cursor over the in-memory filtered result set, not database
// keyset pagination -- honest for the current data volume (see P1 sync
// scheduling), but would need revisiting were canonical order counts to grow
// past what fits comfortably in one query response.
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

function summarize(records: readonly RealOrdersRecord[], generatedAt: string): OrdersSummaryRecord {
  let ready = 0;
  let warning = 0;
  let critical = 0;
  for (const record of records) {
    const bucket = readinessBucket(record.status);
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

async function fetchMappedOrders(
  dataSource: OrdersDataSource,
  tenantId: string,
  workspaceId: string,
  periodStart: IsoDateTime,
  periodEnd: IsoDateTime,
): Promise<readonly RealOrdersRecord[]> {
  const rows = await dataSource.listCanonicalRecords(tenantId, workspaceId, {
    streams: ["orders"],
    businessTimeFrom: periodStart,
    businessTimeTo: periodEnd,
  });

  return rows
    .map(mapCanonicalOrderRow)
    .filter((record): record is RealOrdersRecord => record !== null)
    .sort((a, b) => (a.orderedAt < b.orderedAt ? 1 : a.orderedAt > b.orderedAt ? -1 : 0));
}

/**
 * Backs every `orders.*.read` list-shaped operationId (overview, list, read,
 * eksport, os-zdarzen, porownanie-zrodel, rekoncyliacja-skrot) -- they share
 * an identical `{records, pageInfo, summary}` contract shape and differ only
 * in which screen renders them, not in what data they need.
 */
export async function fetchOrdersList(options: {
  readonly dataSource: OrdersDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly filters?: OrdersFilters | null;
  readonly generatedAt: string;
  readonly page?: OrdersPageRequest | null;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<OrdersListResult> {
  const { dataSource, dateRange, filters, generatedAt, page, tenantId, workspaceId } = options;
  const window = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);
  const allRecords = await fetchMappedOrders(
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

/** Backs `orders.detail.read` -- a single order looked up by its orderId. */
export async function fetchOrderDetail(options: {
  readonly dataSource: OrdersDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly generatedAt: string;
  readonly orderId: string;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<RealOrdersRecord | null> {
  const { dataSource, dateRange, generatedAt, orderId, tenantId, workspaceId } = options;
  const window = dateRange
    ? resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS)
    : { periodEnd: generatedAt as IsoDateTime, periodStart: DETAIL_LOOKUP_FLOOR };
  const records = await fetchMappedOrders(
    dataSource,
    tenantId,
    workspaceId,
    window.periodStart,
    window.periodEnd,
  );

  return records.find((record) => record.orderId === orderId) ?? null;
}

export function buildOrdersTimeline(
  records: readonly RealOrdersRecord[],
): readonly OrdersTimelineEvent[] {
  return records.map((record) => ({
    amount: record.amount,
    occurredAt: record.orderedAt,
    orderId: record.orderId,
    source: record.source,
    status: record.status,
  }));
}

export function buildOrdersSourceComparison(
  records: readonly RealOrdersRecord[],
): readonly OrdersSourceComparison[] {
  const buckets = new Map<string, { amount: number; currency: string; orders: number; source: string }>();
  for (const record of records) {
    const key = `${record.source}:${record.amount.currency}`;
    const bucket = buckets.get(key) ?? {
      amount: 0,
      currency: record.amount.currency,
      orders: 0,
      source: record.source,
    };
    bucket.amount += record.amount.amount;
    bucket.orders += 1;
    buckets.set(key, bucket);
  }
  return [...buckets.values()]
    .map((bucket) => ({
      amount: { amount: Math.round(bucket.amount * 100) / 100, currency: bucket.currency },
      orders: bucket.orders,
      source: bucket.source,
    }))
    .sort((left, right) => right.orders - left.orders || left.source.localeCompare(right.source));
}

export function ordersReconciliationAvailability(): OrdersReconciliationAvailability {
  // The canonical order read model does not expose reconciliation conflicts.
  // Returning an explicit unsupported state is safer than claiming there are
  // no conflicts merely because none are visible in the order list.
  return {
    reason: "Reconciliation conflicts are not exposed by the canonical orders read model.",
    supported: false,
  };
}
