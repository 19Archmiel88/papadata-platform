import type { IsoDateTime } from "@papadata/contracts";
import {
  ADS_AUTHORITY_VERSION,
  SALES_AUTHORITY_VERSION,
  integrationProviderIds,
  type CanonicalAdSpendRecord,
  type CanonicalAttributedConversionRecord,
  type CanonicalInventorySnapshotRecord,
  type CanonicalOrderLineRecord,
  type CanonicalOrderRecord,
  type CanonicalProductRecord,
  type CanonicalRefundRecord,
  type DataIssueCode,
  type DataIssueRecord,
  type IntegrationStream,
  type PrimaryInventorySourceRecord,
  type SyncCheckpointRecord,
} from "../../integrations/integrationDataCore.ts";
import {
  dashboardMetricCodes,
  type MetricEngineInput,
  type ReconciliationReportRecord,
} from "../../metrics/metricEngineCore.ts";

/**
 * Structural read surface this module needs from `IntegrationRepository`
 * (@papadata/database). Kept narrow and duck-typed so tests can pass a plain
 * in-memory fake instead of a real Postgres-backed repository.
 */
export type CommandCenterDataSource = {
  readonly createMetricEngineInput?: (options: {
    readonly generatedAt: IsoDateTime;
    readonly periodStart: IsoDateTime;
    readonly periodEnd: IsoDateTime;
    readonly tenantId: string;
    readonly timezone?: string;
    readonly workspaceId: string;
  }) => Promise<MetricEngineInput>;
  readonly readMetricEngineInputRows?: (
    tenantId: string,
    workspaceId: string,
    input: {
      readonly periodStart: string;
      readonly periodEnd: string;
    },
  ) => Promise<{
    readonly canonicalRows: readonly Record<string, unknown>[];
    readonly catalogRows: readonly Record<string, unknown>[];
    readonly connectionRows: readonly Record<string, unknown>[];
    readonly checkpointRows: readonly Record<string, unknown>[];
    readonly reconciliationRun: Record<string, unknown> | null;
    readonly openIssueRows: readonly Record<string, unknown>[];
  }>;
  readonly listCanonicalRecords: (
    tenantId: string,
    workspaceId: string,
    input: {
      readonly streams: readonly string[];
      readonly businessTimeFrom: string;
      readonly businessTimeTo: string;
    },
  ) => Promise<readonly Record<string, unknown>[]>;
  readonly listConnections: (
    tenantId: string,
    workspaceId: string,
  ) => Promise<readonly Record<string, unknown>[]>;
  readonly listSyncCheckpoints: (
    tenantId: string,
    workspaceId: string,
  ) => Promise<readonly Record<string, unknown>[]>;
  readonly latestReconciliationRun: (
    tenantId: string,
    workspaceId: string,
  ) => Promise<Record<string, unknown> | null>;
  readonly listOpenDataIssues: (
    tenantId: string,
    workspaceId: string,
  ) => Promise<readonly Record<string, unknown>[]>;
};

const COMMERCE_PROVIDER_IDS = ["allegro", "baselinker", "shopify", "woocommerce"] as const;
type CommerceProviderId = (typeof COMMERCE_PROVIDER_IDS)[number];

const ADS_PROVIDER_IDS = ["google_ads", "meta_ads"] as const;
type AdsProviderId = (typeof ADS_PROVIDER_IDS)[number];

const INTEGRATION_STREAMS = [
  "ad_spend",
  "attributed_conversions",
  "inventory",
  "orders",
  "products",
  "refunds",
  "traffic",
] as const;

const DATA_ISSUE_CODES = [
  "FUZZY_MATCH_REQUIRES_MANUAL_APPROVAL",
  "PARTIAL_SYNC_FAILURE",
  "RATE_LIMITED",
  "UNMAPPED_PRODUCT",
] as const;

/**
 * Builds a real, per-tenant MetricEngineInput from ingested
 * `integration_canonical_records` rows instead of the sandbox fact
 * template. Anything without a genuine real-data source today (product
 * costs, customer returns) is left empty rather than fabricated — the
 * metric engine's existing MISSING_* / NO_DATA reason codes already report
 * that honestly. `canonicalOrderLines` is populated from each order's real
 * per-line productId/quantity/grossAmount (see `normalizeOrder` in
 * canonical-normalizer.ts); a line whose product couldn't be resolved to a
 * known canonical product keeps `canonicalProductId: null` rather than
 * guessing.
 */
export async function createRealMetricEngineInput(options: {
  readonly dataSource: CommandCenterDataSource;
  readonly generatedAt: IsoDateTime;
  readonly periodStart: IsoDateTime;
  readonly periodEnd: IsoDateTime;
  readonly tenantId: string;
  readonly timezone?: string;
  readonly workspaceId: string;
}): Promise<MetricEngineInput> {
  const {
    dataSource,
    generatedAt,
    periodStart,
    periodEnd,
    tenantId,
    timezone = "Europe/Warsaw",
    workspaceId,
  } = options;

  if (dataSource.createMetricEngineInput) {
    return dataSource.createMetricEngineInput({
      generatedAt,
      periodEnd,
      periodStart,
      tenantId,
      timezone,
      workspaceId,
    });
  }

  const {
    canonicalRows,
    catalogRows,
    connectionRows,
    checkpointRows,
    reconciliationRun,
    openIssueRows,
  } = dataSource.readMetricEngineInputRows
    ? await dataSource.readMetricEngineInputRows(tenantId, workspaceId, {
        periodEnd,
        periodStart,
      })
    : await readMetricEngineInputRowsWithLegacyFanOut(
        dataSource,
        tenantId,
        workspaceId,
        periodStart,
        periodEnd,
      );

  const rowsByStream = new Map<string, Record<string, unknown>[]>();
  const scopedRows = [
    ...canonicalRows.filter((row) => readString(row.stream) !== "products"),
    ...catalogRows.filter((row) => readString(row.stream) === "products"),
  ];

  for (const row of scopedRows) {
    const stream = readString(row.stream);
    if (!stream) {
      continue;
    }
    const bucket = rowsByStream.get(stream) ?? [];
    bucket.push(row);
    rowsByStream.set(stream, bucket);
  }

  const canonicalProducts = (rowsByStream.get("products") ?? [])
    .map((row) => mapProductRow(row, tenantId, workspaceId))
    .filter((record): record is CanonicalProductRecord => record !== null);
  const knownProductIds = new Set(canonicalProducts.map((product) => product.canonicalProductId));
  const productCosts = (rowsByStream.get("products") ?? [])
    .map(mapProductCostRow)
    .filter((record): record is { readonly currency: string; readonly sku: string; readonly unitCostAmount: string } => record !== null);

  const canonicalOrders = (rowsByStream.get("orders") ?? [])
    .map((row) => mapOrderRow(row, tenantId, workspaceId))
    .filter((record): record is CanonicalOrderRecord => record !== null);
  const canonicalOrderLines = (rowsByStream.get("orders") ?? [])
    .flatMap((row) => mapOrderLineRows(row, tenantId, workspaceId, knownProductIds));
  const canonicalRefunds = (rowsByStream.get("refunds") ?? [])
    .map((row) => mapRefundRow(row, tenantId, workspaceId))
    .filter((record): record is CanonicalRefundRecord => record !== null);
  const canonicalInventorySnapshots = (rowsByStream.get("inventory") ?? [])
    .map((row) => mapInventoryRow(row, tenantId, workspaceId, knownProductIds))
    .filter((record): record is CanonicalInventorySnapshotRecord => record !== null);
  const canonicalAdSpend = (rowsByStream.get("ad_spend") ?? [])
    .map((row) => mapAdSpendRow(row, tenantId, workspaceId))
    .filter((record): record is CanonicalAdSpendRecord => record !== null);
  const canonicalAttributedConversions = (rowsByStream.get("attributed_conversions") ?? [])
    .map((row) => mapConversionRow(row, tenantId, workspaceId))
    .filter((record): record is CanonicalAttributedConversionRecord => record !== null);

  const syncCheckpoints = checkpointRows
    .map((row) => mapCheckpointRow(row, tenantId, workspaceId))
    .filter((record): record is SyncCheckpointRecord => record !== null);
  const dataIssues = openIssueRows
    .map((row) => mapDataIssueRow(row, tenantId, workspaceId))
    .filter((record): record is DataIssueRecord => record !== null);

  return {
    canonicalAdSpend,
    canonicalAttributedConversions,
    canonicalCustomerReturns: [],
    canonicalInventorySnapshots,
    canonicalOrderLines,
    canonicalOrders,
    canonicalProducts,
    canonicalRefunds,
    currency: pickCurrency(canonicalOrders, canonicalAdSpend),
    dataIssues,
    generatedAt,
    periodEnd,
    periodStart,
    primaryInventorySource: findPrimaryInventorySource(connectionRows, tenantId, workspaceId),
    productCosts,
    reconciliationReports: buildReconciliationReports(reconciliationRun, tenantId, workspaceId, generatedAt),
    syncCheckpoints,
    tenantId,
    timezone,
    workspaceId,
  };
}

async function readMetricEngineInputRowsWithLegacyFanOut(
  dataSource: CommandCenterDataSource,
  tenantId: string,
  workspaceId: string,
  periodStart: IsoDateTime,
  periodEnd: IsoDateTime,
): Promise<{
  readonly canonicalRows: readonly Record<string, unknown>[];
  readonly catalogRows: readonly Record<string, unknown>[];
  readonly connectionRows: readonly Record<string, unknown>[];
  readonly checkpointRows: readonly Record<string, unknown>[];
  readonly reconciliationRun: Record<string, unknown> | null;
  readonly openIssueRows: readonly Record<string, unknown>[];
}> {
  const [canonicalRows, catalogRows, connectionRows, checkpointRows, reconciliationRun, openIssueRows] = await Promise.all([
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      streams: ["orders", "refunds", "inventory", "ad_spend", "attributed_conversions"],
      businessTimeFrom: periodStart,
      businessTimeTo: periodEnd,
    }),
    dataSource.listCanonicalRecords(tenantId, workspaceId, {
      streams: ["products"],
      businessTimeFrom: "1970-01-01T00:00:00.000Z",
      businessTimeTo: periodEnd,
    }),
    dataSource.listConnections(tenantId, workspaceId),
    dataSource.listSyncCheckpoints(tenantId, workspaceId),
    dataSource.latestReconciliationRun(tenantId, workspaceId),
    dataSource.listOpenDataIssues(tenantId, workspaceId),
  ]);

  return {
    canonicalRows,
    catalogRows,
    connectionRows,
    checkpointRows,
    reconciliationRun,
    openIssueRows,
  };
}

function mapOrderRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): CanonicalOrderRecord | null {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId || !isCommerceProviderId(providerId)) {
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

  return {
    canonicalOrderId: canonicalId(providerId, externalId),
    currency: readEntityString(entity, "currency") ?? "PLN",
    externalOrderId: externalId,
    grossAmount: numberToDecimalString(grossAmount),
    orderNumber: readEntityString(entity, "orderNumber") ?? externalId,
    orderedAt: orderedAt as IsoDateTime,
    providerId,
    sourceAuthorityVersion: SALES_AUTHORITY_VERSION,
    status: readEntityString(entity, "status")?.toLowerCase() ?? null,
    tenantId,
    workspaceId,
  };
}

/**
 * Real per-line productId/quantity/grossAmount preserved by `normalizeOrder`
 * (canonical-normalizer.ts) under `entity.lineItems`, mapped to canonical
 * order-line records for the product-sales breakdown. A line missing a
 * numeric quantity/amount (provider shape not recognized) is dropped rather
 * than counted as zero; a line whose product external id doesn't resolve to
 * a known canonical product keeps `canonicalProductId: null`.
 */
function mapOrderLineRows(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
  knownProductIds: ReadonlySet<string>,
): readonly CanonicalOrderLineRecord[] {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId || !isCommerceProviderId(providerId)) {
    return [];
  }
  const entity = readEntity(row.canonical_payload);
  const rawLines = entity.lineItems;
  if (!Array.isArray(rawLines)) {
    return [];
  }
  const canonicalOrderId = canonicalId(providerId, externalId);

  return rawLines.flatMap((rawLine, index): readonly CanonicalOrderLineRecord[] => {
    if (!isRecord(rawLine)) {
      return [];
    }
    const grossAmount = readEntityNumber(rawLine, "grossAmount");
    const quantity = readEntityNumber(rawLine, "quantity");
    if (grossAmount === null || quantity === null) {
      return [];
    }
    const externalProductId = readEntityString(rawLine, "externalProductId");
    const productKey = externalProductId ? canonicalId(providerId, externalProductId) : null;

    return [{
      canonicalLineId: canonicalId(providerId, `${externalId}:${index}`),
      canonicalOrderId,
      canonicalProductId: productKey && knownProductIds.has(productKey) ? productKey : null,
      grossAmount: numberToDecimalString(grossAmount),
      quantity: Math.max(0, Math.round(quantity)),
      tenantId,
      workspaceId,
    }];
  });
}

function mapRefundRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): CanonicalRefundRecord | null {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId || !isCommerceProviderId(providerId)) {
    return null;
  }
  const entity = readEntity(row.canonical_payload);
  const amount = readEntityNumber(entity, "amount");
  if (amount === null) {
    return null;
  }
  const refundedAt = effectiveIso(row.effective_time);
  if (!refundedAt) {
    return null;
  }
  const orderExternalId = readEntityString(entity, "orderId");

  return {
    amount: numberToDecimalString(amount),
    canonicalOrderId: orderExternalId ? canonicalId(providerId, orderExternalId) : null,
    canonicalRefundId: canonicalId(providerId, externalId),
    currency: readEntityString(entity, "currency") ?? "PLN",
    externalRefundId: externalId,
    providerId,
    refundedAt: refundedAt as IsoDateTime,
    tenantId,
    workspaceId,
  };
}

function mapProductRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): CanonicalProductRecord | null {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId) {
    return null;
  }
  const entity = readEntity(row.canonical_payload);
  const name = readEntityString(entity, "name");
  if (!name) {
    return null;
  }

  return {
    canonicalProductId: canonicalId(providerId, externalId),
    catalogId: null,
    createdAt: (effectiveIso(row.effective_time) ?? new Date().toISOString()) as IsoDateTime,
    ean: null,
    name,
    sku: readEntityString(entity, "sku"),
    tenantId,
    workspaceId,
  };
}

function mapProductCostRow(
  row: Record<string, unknown>,
): { readonly currency: string; readonly sku: string; readonly unitCostAmount: string } | null {
  const entity = readEntity(row.canonical_payload);
  const sku = readEntityString(entity, "sku");
  const unitCost = readEntityNumber(entity, "unitCost");

  if (!sku || unitCost === null) {
    return null;
  }

  return {
    currency: readEntityString(entity, "currency") ?? "PLN",
    sku,
    unitCostAmount: numberToDecimalString(unitCost),
  };
}

function mapInventoryRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
  knownProductIds: ReadonlySet<string>,
): CanonicalInventorySnapshotRecord | null {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId || !isCommerceProviderId(providerId)) {
    return null;
  }
  const entity = readEntity(row.canonical_payload);
  const quantityAvailable = readEntityNumber(entity, "availableQuantity");
  if (quantityAvailable === null) {
    return null;
  }
  const snapshotAt = effectiveIso(row.effective_time);
  if (!snapshotAt) {
    return null;
  }
  const externalProductId = readEntityString(entity, "productId") ?? externalId;
  const productKey = canonicalId(providerId, externalProductId);

  return {
    canonicalInventorySnapshotId: canonicalId(providerId, `${externalId}:${snapshotAt}`),
    canonicalProductId: knownProductIds.has(productKey) ? productKey : null,
    externalProductId,
    providerId,
    quantityAvailable,
    snapshotAt: snapshotAt as IsoDateTime,
    tenantId,
    workspaceId,
  };
}

function mapAdSpendRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): CanonicalAdSpendRecord | null {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId || !isAdsProviderId(providerId)) {
    return null;
  }
  const entity = readEntity(row.canonical_payload);
  const spend = readEntityNumber(entity, "spend");
  if (spend === null) {
    return null;
  }
  const effective = effectiveIso(row.effective_time);
  if (!effective) {
    return null;
  }

  return {
    canonicalAdSpendId: canonicalId(providerId, externalId),
    campaignId: readEntityString(entity, "campaignId") ?? externalId,
    clicks: Math.max(0, Math.round(readEntityNumber(entity, "clicks") ?? 0)),
    costAmount: numberToDecimalString(spend),
    currency: readEntityString(entity, "currency") ?? "PLN",
    date: effective.slice(0, 10),
    impressions: Math.max(0, Math.round(readEntityNumber(entity, "impressions") ?? 0)),
    providerId,
    sourceAuthorityVersion: ADS_AUTHORITY_VERSION,
    tenantId,
    workspaceId,
  };
}

function mapConversionRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): CanonicalAttributedConversionRecord | null {
  const providerId = readString(row.provider_id);
  const externalId = readString(row.external_id);
  if (!providerId || !externalId || !isAdsProviderId(providerId)) {
    return null;
  }
  const entity = readEntity(row.canonical_payload);
  const attributedValueAmount = readEntityNumber(entity, "conversionValue");
  if (attributedValueAmount === null) {
    return null;
  }
  const conversionTime = effectiveIso(row.effective_time);
  if (!conversionTime) {
    return null;
  }

  return {
    attributedConversionId: canonicalId(providerId, externalId),
    attributedValueAmount: numberToDecimalString(attributedValueAmount),
    campaignId: readEntityString(entity, "campaignId") ?? externalId,
    conversionTime: conversionTime as IsoDateTime,
    currency: readEntityString(entity, "currency") ?? "PLN",
    externalConversionId: externalId,
    providerId,
    tenantId,
    workspaceId,
  };
}

function mapCheckpointRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): SyncCheckpointRecord | null {
  const providerId = readString(row.provider_id);
  const stream = readString(row.stream);
  const connectionId = readString(row.connection_id);
  const updatedAt = effectiveIso(row.updated_at);
  const watermark = effectiveIso(row.watermark);
  if (
    !providerId
    || !stream
    || !connectionId
    || !updatedAt
    || !watermark
    || !isSandboxProviderId(providerId)
    || !isIntegrationStream(stream)
  ) {
    return null;
  }

  return {
    checkpointId: readString(row.id) ?? canonicalId(providerId, `${connectionId}:${stream}`),
    connectionId,
    cursor: readString(row.cursor) ?? "",
    providerId,
    stream,
    tenantId,
    updatedAt: updatedAt as IsoDateTime,
    watermark: watermark as IsoDateTime,
    workspaceId,
  };
}

function mapDataIssueRow(
  row: Record<string, unknown>,
  tenantId: string,
  workspaceId: string,
): DataIssueRecord | null {
  const code = readString(row.code);
  const message = readString(row.message);
  const severity = readString(row.severity);
  const createdAt = effectiveIso(row.created_at);
  if (
    !code
    || !isDataIssueCode(code)
    || !message
    || !createdAt
    || (severity !== "error" && severity !== "warning")
  ) {
    return null;
  }

  return {
    code,
    createdAt: createdAt as IsoDateTime,
    issueId: readString(row.id) ?? code,
    message,
    severity,
    sourceRecordId: readString(row.source_record_id),
    status: "open",
    tenantId,
    workspaceId,
  };
}

function findPrimaryInventorySource(
  connectionRows: readonly Record<string, unknown>[],
  tenantId: string,
  workspaceId: string,
): PrimaryInventorySourceRecord | null {
  const row = connectionRows.find((candidate) => candidate.is_primary_inventory_source === true);
  if (!row) {
    return null;
  }
  const providerId = readString(row.provider_id);
  if (!providerId || !isCommerceProviderId(providerId)) {
    return null;
  }

  return {
    providerId,
    selectedAt: (effectiveIso(row.connected_at) ?? new Date().toISOString()) as IsoDateTime,
    tenantId,
    workspaceId,
  };
}

function buildReconciliationReports(
  run: Record<string, unknown> | null,
  tenantId: string,
  workspaceId: string,
  generatedAt: IsoDateTime,
): readonly ReconciliationReportRecord[] {
  if (!run || readString(run.status) !== "failed") {
    return [];
  }

  return [
    {
      createdAt: (effectiveIso(run.created_at) ?? generatedAt) as IsoDateTime,
      details: ["integration_reconciliation_run_failed"],
      metricCodes: dashboardMetricCodes,
      reconciliationReportId: readString(run.id) ?? "reconciliation_run_failed",
      status: "mismatch",
      tenantId,
      workspaceId,
    },
  ];
}

function pickCurrency(
  orders: readonly CanonicalOrderRecord[],
  adSpend: readonly CanonicalAdSpendRecord[],
): string {
  const counts = new Map<string, number>();
  for (const order of orders) {
    counts.set(order.currency, (counts.get(order.currency) ?? 0) + 1);
  }
  for (const spend of adSpend) {
    counts.set(spend.currency, (counts.get(spend.currency) ?? 0) + 1);
  }

  let best: string | null = null;
  let bestCount = 0;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }

  return best ?? "PLN";
}

function canonicalId(providerId: string, externalId: string): string {
  return `${providerId}:${externalId}`;
}

function numberToDecimalString(value: number): string {
  return (Math.round(value * 100) / 100).toFixed(2);
}

// Exported so sibling real-data builders (e.g. orders-analytics.real-source.ts)
// can normalize `effective_time`/`updated_at` row columns the same way,
// instead of duplicating this Date/string coercion with a second chance to drift.
export function effectiveIso(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : null;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
  }
  return null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Exported so sibling real-data builders (traffic sources, product sales in
// command-center-metrics.contract-data.ts) can read `canonical_payload` rows
// the same way this module does, instead of duplicating the same
// entity-unwrapping logic with a second chance to drift.
export function readEntity(payload: unknown): Record<string, unknown> {
  if (!isRecord(payload)) {
    return {};
  }
  return isRecord(payload.entity) ? payload.entity : {};
}

export function readEntityString(entity: Record<string, unknown>, field: string): string | null {
  return readString(entity[field]);
}

export function readEntityNumber(entity: Record<string, unknown>, field: string): number | null {
  const value = entity[field];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export { readString as readRowString };

function isCommerceProviderId(value: string): value is CommerceProviderId {
  return (COMMERCE_PROVIDER_IDS as readonly string[]).includes(value);
}

function isAdsProviderId(value: string): value is AdsProviderId {
  return (ADS_PROVIDER_IDS as readonly string[]).includes(value);
}

function isSandboxProviderId(value: string): value is (typeof integrationProviderIds)[number] {
  return (integrationProviderIds as readonly string[]).includes(value);
}

function isIntegrationStream(value: string): value is IntegrationStream {
  return (INTEGRATION_STREAMS as readonly string[]).includes(value);
}

function isDataIssueCode(value: string): value is DataIssueCode {
  return (DATA_ISSUE_CODES as readonly string[]).includes(value);
}
