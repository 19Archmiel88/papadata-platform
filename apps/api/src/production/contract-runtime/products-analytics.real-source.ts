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
export type ProductsDataSource = Pick<CommandCenterDataSource, "listCanonicalRecords">;

/** Matches the contract's `ProductStatus` union (packages/contracts api-schemas). */
export type ProductsRecordStatus = "active" | "archived" | "inactive" | "missingMapping";

export type RealProductsRecord = {
  readonly category: string | null;
  readonly margin: number | null;
  readonly name: string;
  readonly productId: string;
  readonly revenue: { readonly amount: number; readonly currency: string };
  readonly sku: string | null;
  readonly status: ProductsRecordStatus;
  readonly units: number;
};

export type ProductsFilters = {
  readonly search?: string | null;
  readonly source?: readonly string[] | null;
  readonly status?: readonly string[] | null;
};

export type ProductsPageRequest = {
  readonly cursor?: string | null;
  readonly limit?: number | null;
};

export type ProductsSummaryRecord = {
  readonly critical: number;
  readonly ready: number;
  readonly total: number;
  readonly updatedAt: IsoDateTime;
  readonly warning: number;
};

export type ProductsListResult = {
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number | null };
  readonly records: readonly RealProductsRecord[];
  readonly summary: ProductsSummaryRecord;
};

const DEFAULT_WINDOW_DAYS = 30;
const DEFAULT_PAGE_LIMIT = 50;
const MAX_PAGE_LIMIT = 200;
// The product catalog itself is not period-scoped -- a product doesn't stop
// existing just because it wasn't re-synced within the requested revenue
// window. Only revenue/units attribution (from order lines) uses the
// requested/default window; the catalog always looks back to this floor,
// same rationale as orders' DETAIL_LOOKUP_FLOOR.
const CATALOG_FLOOR = "2020-01-01T00:00:00.000Z" as IsoDateTime;

// Contract's ProductStatus vocabulary (active|inactive|archived|missingMapping)
// is coarser than real provider statuses (WooCommerce: publish/draft/pending/
// private/trash, ...). Unrecognized/missing raw status falls to "inactive" --
// the least committal bucket -- rather than guessing "active"/"archived".
const PRODUCT_STATUS_BY_RAW: Readonly<Record<string, ProductsRecordStatus>> = {
  active: "active",
  archived: "archived",
  deleted: "archived",
  draft: "inactive",
  inactive: "inactive",
  pending: "inactive",
  private: "inactive",
  publish: "active",
  published: "active",
  trash: "archived",
};

function mapProductStatus(rawStatus: string | null): ProductsRecordStatus {
  if (!rawStatus) {
    return "inactive";
  }
  return PRODUCT_STATUS_BY_RAW[rawStatus.toLowerCase()] ?? "inactive";
}

/**
 * ready/warning/critical mirrors the generic per-record readiness vocabulary
 * used elsewhere (e.g. orders-analytics). A product actually catalogued and
 * for sale is healthy (ready); inactive/archived is an expected lifecycle
 * state, not urgent (warning); a product only known because it showed up on
 * an order line, never synced from the provider's own catalog, is the one
 * genuinely worth flagging (critical) -- it's a real data-quality gap, the
 * same condition the DATA_ISSUE_CODES `UNMAPPED_PRODUCT` code names.
 */
function readinessBucket(status: ProductsRecordStatus): "critical" | "ready" | "warning" {
  if (status === "active") {
    return "ready";
  }
  if (status === "missingMapping") {
    return "critical";
  }
  return "warning";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type OrderLine = {
  readonly currency: string;
  readonly externalProductId: string | null;
  readonly grossAmount: number;
  readonly providerId: string;
  readonly quantity: number;
};

function mapOrderLines(row: Record<string, unknown>): readonly OrderLine[] {
  const providerId = readRowString(row.provider_id);
  if (!providerId) {
    return [];
  }
  const entity = readEntity(row.canonical_payload);
  const currency = readEntityString(entity, "currency") ?? "PLN";
  const rawLines = entity.lineItems;
  if (!Array.isArray(rawLines)) {
    return [];
  }

  return rawLines.flatMap((rawLine): readonly OrderLine[] => {
    if (!isRecord(rawLine)) {
      return [];
    }
    const grossAmount = readEntityNumber(rawLine, "grossAmount");
    const quantity = readEntityNumber(rawLine, "quantity");
    if (grossAmount === null || quantity === null) {
      return [];
    }
    return [{
      currency,
      externalProductId: readEntityString(rawLine, "externalProductId"),
      grossAmount,
      providerId,
      quantity: Math.max(0, Math.round(quantity)),
    }];
  });
}

function matchesFilters(record: RealProductsRecord, filters: ProductsFilters | null | undefined): boolean {
  if (!filters) {
    return true;
  }
  if (filters.status?.length && !filters.status.includes(record.status)) {
    return false;
  }
  if (filters.source?.length) {
    const providerId = record.productId.split(":")[0] ?? "";
    if (!filters.source.includes(providerId)) {
      return false;
    }
  }
  const needle = filters.search?.trim().toLowerCase();
  if (needle) {
    const haystacks = [record.productId, record.name, record.sku ?? ""].map((value) => value.toLowerCase());
    if (!haystacks.some((haystack) => haystack.includes(needle))) {
      return false;
    }
  }
  return true;
}

function clampLimit(requested: number | null | undefined): number {
  if (typeof requested !== "number" || !Number.isFinite(requested) || requested <= 0) {
    return DEFAULT_PAGE_LIMIT;
  }
  return Math.min(Math.round(requested), MAX_PAGE_LIMIT);
}

// Offset-based cursor over the in-memory filtered result set -- same honest
// tradeoff documented in orders-analytics.real-source.ts.
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

function summarize(records: readonly RealProductsRecord[], generatedAt: string): ProductsSummaryRecord {
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

async function fetchMappedProducts(
  dataSource: ProductsDataSource,
  tenantId: string,
  workspaceId: string,
  revenueFrom: IsoDateTime,
  revenueTo: IsoDateTime,
): Promise<readonly RealProductsRecord[]> {
  const [productRows, orderRows] = await Promise.all([
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      streams: ["products"],
      businessTimeFrom: CATALOG_FLOOR,
      businessTimeTo: revenueTo,
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      streams: ["orders"],
      businessTimeFrom: revenueFrom,
      businessTimeTo: revenueTo,
    }),
  ]);

  const catalog = new Map<string, { name: string; sku: string | null; status: ProductsRecordStatus }>();
  for (const row of productRows) {
    const providerId = readRowString(row.provider_id);
    const externalId = readRowString(row.external_id);
    if (!providerId || !externalId) {
      continue;
    }
    const entity = readEntity(row.canonical_payload);
    const name = readEntityString(entity, "name");
    if (!name) {
      continue;
    }
    catalog.set(`${providerId}:${externalId}`, {
      name,
      sku: readEntityString(entity, "sku"),
      status: mapProductStatus(readEntityString(entity, "status")),
    });
  }

  const knownRevenue = new Map<string, { currency: string; revenue: number; units: number }>();
  const unmappedRevenue = new Map<
    string,
    { currency: string; externalProductId: string; revenue: number; units: number }
  >();

  for (const row of orderRows) {
    for (const line of mapOrderLines(row)) {
      if (!line.externalProductId) {
        // No product identity on the line at all -- nothing to attribute.
        continue;
      }
      const productId = `${line.providerId}:${line.externalProductId}`;
      const bucket = catalog.has(productId) ? knownRevenue : unmappedRevenue;
      const existing = bucket.get(productId) ?? {
        currency: line.currency,
        externalProductId: line.externalProductId,
        revenue: 0,
        units: 0,
      };
      existing.revenue += line.grossAmount;
      existing.units += line.quantity;
      bucket.set(productId, existing);
    }
  }

  const catalogRecords: RealProductsRecord[] = [...catalog.entries()].map(([productId, product]) => {
    const agg = knownRevenue.get(productId);
    return {
      // No category field exists anywhere in the canonical product entity
      // (see canonical-normalizer.ts's normalizeProduct) -- left null rather
      // than fabricating one.
      category: null,
      // No real COGS source exists yet -- see P0 "Marża i rentowność"; never
      // estimate this as a fixed percentage without flagging it as such.
      margin: null,
      name: product.name,
      productId,
      revenue: {
        amount: agg ? Math.round(agg.revenue * 100) / 100 : 0,
        currency: agg?.currency ?? "PLN",
      },
      sku: product.sku,
      status: product.status,
      units: agg?.units ?? 0,
    };
  });

  const missingMappingRecords: RealProductsRecord[] = [...unmappedRevenue.entries()].map(
    ([productId, entry]) => ({
      category: null,
      margin: null,
      // The provider never sent this product through the catalog sync --
      // only its external id is known, from an order line. Surfacing the raw
      // id itself (not inventing a display name) is what lets this honestly
      // feed the mapping / gaps-queue screens.
      name: entry.externalProductId,
      productId,
      revenue: { amount: Math.round(entry.revenue * 100) / 100, currency: entry.currency },
      sku: null,
      status: "missingMapping",
      units: entry.units,
    }),
  );

  return [...catalogRecords, ...missingMappingRecords].sort((a, b) => b.revenue.amount - a.revenue.amount);
}

/**
 * Backs every `products.*.read` list-shaped operationId (catalog, gaps.queue,
 * impact, mapping, offers, overview, performance, read) -- they share an
 * identical `{records, pageInfo, summary}` contract shape and differ only in
 * which screen renders them, not in what data they need.
 */
export async function fetchProductsList(options: {
  readonly dataSource: ProductsDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly filters?: ProductsFilters | null;
  readonly generatedAt: string;
  readonly page?: ProductsPageRequest | null;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<ProductsListResult> {
  const { dataSource, dateRange, filters, generatedAt, page, tenantId, workspaceId } = options;
  const revenueWindow = resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS);
  const allRecords = await fetchMappedProducts(
    dataSource,
    tenantId,
    workspaceId,
    revenueWindow.periodStart,
    revenueWindow.periodEnd,
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

/** Backs `products.detail.read` -- a single product looked up by its productId. */
export async function fetchProductDetail(options: {
  readonly dataSource: ProductsDataSource;
  readonly dateRange: CommandCenterDateRangeInput | null;
  readonly generatedAt: string;
  readonly productId: string;
  readonly tenantId: string;
  readonly workspaceId: string;
}): Promise<RealProductsRecord | null> {
  const { dataSource, dateRange, generatedAt, productId, tenantId, workspaceId } = options;
  const revenueWindow = dateRange
    ? resolveMetricWindow(generatedAt, dateRange, DEFAULT_WINDOW_DAYS)
    : { periodEnd: generatedAt as IsoDateTime, periodStart: CATALOG_FLOOR };
  const records = await fetchMappedProducts(
    dataSource,
    tenantId,
    workspaceId,
    revenueWindow.periodStart,
    revenueWindow.periodEnd,
  );

  return records.find((record) => record.productId === productId) ?? null;
}
