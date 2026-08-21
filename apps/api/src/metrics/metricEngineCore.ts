import {
  METRIC_CATALOG_VERSION,
  type IsoDateTime,
} from "@papadata/contracts";

import type {
  AccessService,
} from "../access/accessCore.ts";
import {
  responseMeta,
  toIso,
} from "../auth/authCore.ts";
import type {
  AuthRandomSource,
  AuthServiceResult,
  RequestContext,
} from "../auth/authCore.ts";
import {
  createSandboxIntegrationDataRuntime,
  integrationProviderIds,
  type CanonicalAdSpendRecord,
  type CanonicalAttributedConversionRecord,
  type CanonicalCustomerReturnRecord,
  type CanonicalInventorySnapshotRecord,
  type CanonicalOrderLineRecord,
  type CanonicalOrderRecord,
  type CanonicalProductRecord,
  type CanonicalRefundRecord,
  type DataIssueRecord,
  type IntegrationDataSnapshot,
  type PrimaryInventorySourceRecord,
  type SyncCheckpointRecord,
} from "../integrations/integrationDataCore.ts";

// Order statuses that must never contribute to revenue/order KPIs. An order
// with a status outside this set (or with no status at all, e.g. providers
// that don't report one) is still counted -- only known non-qualifying
// statuses are excluded, so we never silently drop revenue we can't
// classify. Verified against a live WooCommerce reconciliation on
// 2026-08-20/21: a "pending" order and an order that became "refunded" after
// a full refund both correctly dropped out of orders/revenue, while
// "completed" orders matched the store's own count 1:1.
const REVENUE_EXCLUDED_ORDER_STATUSES: ReadonlySet<string> = new Set([
  "cancelled",
  "canceled",
  "checkout-draft",
  "draft",
  "failed",
  "on-hold",
  "pending",
  "refunded",
  "trash",
  "voided",
]);

function isRevenueQualifyingOrder(order: CanonicalOrderRecord): boolean {
  if (!order.status) return true;
  return !REVENUE_EXCLUDED_ORDER_STATUSES.has(order.status.toLowerCase());
}

export const METRIC_ENGINE_POLICY_VERSION = "metric-engine.2026-07.prompt7";
export const DASHBOARD_PROJECTION_VERSION = "dashboard-api.2026-07.prompt7";
export const METRIC_DEFINITION_VERSION = "metric-definition.2026-07.prompt7";
export const METRIC_FRESHNESS_THRESHOLD_HOURS = 36;

export const dashboardMetricCodes = [
  "gross_order_value",
  "revenue_after_refunds",
  "orders",
  "units_sold",
  "returned_units",
  "return_value",
  "return_rate_units",
  "return_rate_orders",
  "aov",
  "available_stock",
  "stock_value",
  "days_of_inventory",
  "inventory_turnover",
  "sell_through_rate",
  "stockout_risk",
  "product_revenue",
  "product_units",
  "product_margin",
  "product_contribution",
  "ad_spend",
  "cpc",
  "cpm",
  "ctr",
  "platform_attributed_conversions",
  "platform_attributed_revenue",
  "roas",
  "cost_per_order",
] as const;

export type DashboardMetricCode = (typeof dashboardMetricCodes)[number];

export type MetricReadiness =
  | "invalid"
  | "no_data"
  | "partial"
  | "ready"
  | "stale"
  | "unavailable";

export type MetricValueKind =
  | "count"
  | "money"
  | "ratio"
  | "risk"
  | "units";

export type MetricReasonCode =
  | "INVALID_RECONCILIATION"
  | "MISSING_AD_SPEND"
  | "MISSING_COMMERCE_FACTS"
  | "MISSING_INVENTORY_AUTHORITY"
  | "MISSING_INVENTORY_FACTS"
  | "MISSING_PRODUCT_COST"
  | "MISSING_PRODUCT_MAPPING"
  | "NO_DATA"
  | "STALE_CANONICAL_FACTS"
  | "UNAVAILABLE";

export type MetricDefinitionRecord = {
  readonly businessDefinition: string;
  readonly currencyPolicy: string;
  readonly datePolicy: string;
  readonly definitionVersion: typeof METRIC_DEFINITION_VERSION;
  readonly excludedStatuses: readonly string[];
  readonly formula: string;
  readonly includedStatuses: readonly string[];
  readonly metricCode: DashboardMetricCode;
  readonly missingDataPolicy: string;
  readonly readinessRule: string;
  readonly refundPolicy: string;
  readonly requiredCanonicalFacts: readonly string[];
  readonly taxPolicy: string;
  readonly testVectors: readonly MetricTestVector[];
  readonly unit: MetricValueKind;
};

export type MetricTestVector = {
  readonly expectedReadiness: MetricReadiness;
  readonly expectedValue: string | null;
  readonly name: string;
};

export type MetricSnapshotRecord = {
  readonly currency: string | null;
  readonly definitionVersion: typeof METRIC_DEFINITION_VERSION;
  readonly evidence: readonly string[];
  readonly generatedAt: IsoDateTime;
  readonly inputHash: string;
  readonly limitations: readonly string[];
  readonly metricCode: DashboardMetricCode;
  readonly periodEnd: IsoDateTime;
  readonly periodStart: IsoDateTime;
  readonly readiness: MetricReadiness;
  readonly reasonCodes: readonly MetricReasonCode[];
  readonly snapshotId: string;
  readonly tenantId: string;
  readonly value: string | null;
  readonly valueKind: MetricValueKind;
  readonly workspaceId: string;
};

export type ReprocessJobRecord = {
  readonly affectedMetricCodes: readonly DashboardMetricCode[];
  readonly createdAt: IsoDateTime;
  readonly reason: "invalid" | "stale";
  readonly reprocessJobId: string;
  readonly status: "queued";
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type ReconciliationReportStatus = "matched" | "mismatch";

export type ReconciliationReportRecord = {
  readonly createdAt: IsoDateTime;
  readonly details: readonly string[];
  readonly metricCodes: readonly DashboardMetricCode[];
  readonly reconciliationReportId: string;
  readonly status: ReconciliationReportStatus;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type ProductCostRecord = {
  readonly currency: string;
  readonly sku: string;
  readonly unitCostAmount: string;
};

export type MetricEngineInput = {
  readonly canonicalAdSpend: readonly CanonicalAdSpendRecord[];
  readonly canonicalAttributedConversions: readonly CanonicalAttributedConversionRecord[];
  readonly canonicalCustomerReturns: readonly CanonicalCustomerReturnRecord[];
  readonly canonicalInventorySnapshots: readonly CanonicalInventorySnapshotRecord[];
  readonly canonicalOrderLines: readonly CanonicalOrderLineRecord[];
  readonly canonicalOrders: readonly CanonicalOrderRecord[];
  readonly canonicalProducts: readonly CanonicalProductRecord[];
  readonly canonicalRefunds: readonly CanonicalRefundRecord[];
  readonly currency: string;
  readonly dataIssues: readonly DataIssueRecord[];
  readonly generatedAt: IsoDateTime;
  readonly periodEnd: IsoDateTime;
  readonly periodStart: IsoDateTime;
  readonly primaryInventorySource: PrimaryInventorySourceRecord | null;
  readonly productCosts: readonly ProductCostRecord[];
  readonly reconciliationReports: readonly ReconciliationReportRecord[];
  readonly syncCheckpoints: readonly SyncCheckpointRecord[];
  readonly tenantId: string;
  readonly timezone: string;
  readonly workspaceId: string;
};

export type MetricStateSnapshot = {
  readonly metricDefinitions: readonly MetricDefinitionRecord[];
  readonly metricSnapshots: readonly MetricSnapshotRecord[];
  readonly reconciliationReports: readonly ReconciliationReportRecord[];
  readonly reprocessJobs: readonly ReprocessJobRecord[];
};

export type DashboardReadinessResponse = {
  readonly generatedAt: IsoDateTime;
  readonly metrics: readonly MetricSnapshotRecord[];
  readonly readiness: MetricReadiness;
  readonly reconciliationReports: readonly ReconciliationReportRecord[];
  readonly reprocessJobs: readonly ReprocessJobRecord[];
};

export type DashboardProjection = {
  readonly generatedAt: IsoDateTime;
  readonly metrics: readonly MetricSnapshotRecord[];
  readonly module: DashboardModule;
  readonly readiness: MetricReadiness;
};

export type DashboardModule =
  | "campaigns"
  | "command-center"
  | "customers"
  | "orders"
  | "products"
  | "readiness"
  | "traffic";

type MaybePromise<TValue> = TValue | Promise<TValue>;

type MetricStateStore = {
  getInput: (tenantId: string, workspaceId: string) => MaybePromise<MetricEngineInput | undefined>;
  saveDefinitions: (definitions: readonly MetricDefinitionRecord[]) => MaybePromise<void>;
  saveInput: (input: MetricEngineInput) => MaybePromise<void>;
  saveReconciliationReport: (report: ReconciliationReportRecord) => MaybePromise<void>;
  saveReprocessJob: (job: ReprocessJobRecord) => MaybePromise<void>;
  saveSnapshots: (snapshots: readonly MetricSnapshotRecord[]) => MaybePromise<void>;
  snapshot: () => MaybePromise<MetricStateSnapshot>;
};

type MetricFacts = {
  readonly adSpend: readonly CanonicalAdSpendRecord[];
  readonly attributedConversions: readonly CanonicalAttributedConversionRecord[];
  readonly commerceOrders: readonly CanonicalOrderRecord[];
  readonly inventorySnapshots: readonly CanonicalInventorySnapshotRecord[];
  readonly orderLines: readonly CanonicalOrderLineRecord[];
  readonly productById: ReadonlyMap<string, CanonicalProductRecord>;
  readonly productCostBySku: ReadonlyMap<string, bigint>;
  readonly refunds: readonly CanonicalRefundRecord[];
  // Narrower subset of `refunds`, used only by revenue_after_refunds -- see
  // the comment on its derivation in createMetricFacts.
  readonly revenueQualifyingRefunds: readonly CanonicalRefundRecord[];
  readonly returns: readonly CanonicalCustomerReturnRecord[];
};

type CalculationResult = {
  readonly limitations: readonly string[];
  readonly readiness: MetricReadiness;
  readonly reasonCodes: readonly MetricReasonCode[];
  readonly value: string | null;
};

export class InMemoryMetricState implements MetricStateStore {
  private readonly inputs = new Map<string, MetricEngineInput>();

  private readonly metricDefinitions = new Map<string, MetricDefinitionRecord>();

  private readonly metricSnapshots = new Map<string, MetricSnapshotRecord>();

  private readonly reconciliationReports = new Map<string, ReconciliationReportRecord>();

  private readonly reprocessJobs = new Map<string, ReprocessJobRecord>();

  getInput(tenantId: string, workspaceId: string): MetricEngineInput | undefined {
    return this.inputs.get(scopeKey(tenantId, workspaceId));
  }

  saveInput(input: MetricEngineInput): void {
    this.inputs.set(scopeKey(input.tenantId, input.workspaceId), input);
  }

  saveDefinitions(definitions: readonly MetricDefinitionRecord[]): void {
    for (const definition of definitions) {
      this.metricDefinitions.set(definition.metricCode, definition);
    }
  }

  saveSnapshots(snapshots: readonly MetricSnapshotRecord[]): void {
    for (const snapshot of snapshots) {
      this.metricSnapshots.set(snapshot.snapshotId, snapshot);
    }
  }

  saveReconciliationReport(report: ReconciliationReportRecord): void {
    this.reconciliationReports.set(report.reconciliationReportId, report);
  }

  saveReprocessJob(job: ReprocessJobRecord): void {
    this.reprocessJobs.set(job.reprocessJobId, job);
  }

  snapshot(): MetricStateSnapshot {
    return {
      metricDefinitions: [...this.metricDefinitions.values()],
      metricSnapshots: [...this.metricSnapshots.values()],
      reconciliationReports: [...this.reconciliationReports.values()],
      reprocessJobs: [...this.reprocessJobs.values()],
    };
  }
}

export class DashboardMetricService {
  private readonly accessService: AccessService;

  private readonly random: AuthRandomSource;

  private readonly state: MetricStateStore;

  constructor(options: {
    readonly accessService: AccessService;
    readonly random: AuthRandomSource;
    readonly state?: MetricStateStore;
  }) {
    this.accessService = options.accessService;
    this.random = options.random;
    this.state = options.state ?? new InMemoryMetricState();
    void this.state.saveDefinitions(metricDefinitions);
  }

  async setInputForTest(input: MetricEngineInput): Promise<void> {
    await this.state.saveInput(input);
  }

  async getSnapshot(): Promise<MetricStateSnapshot> {
    return this.state.snapshot();
  }

  async calculate(input: MetricEngineInput): Promise<DashboardReadinessResponse> {
    const snapshots = this.calculateSnapshots(input);
    const reconciliationReport = this.createReconciliationReport(input, snapshots);
    await this.state.saveSnapshots(snapshots);
    await this.state.saveReconciliationReport(reconciliationReport);

    const reprocessJob = this.createReprocessJob(input, snapshots);

    if (reprocessJob) {
      await this.state.saveReprocessJob(reprocessJob);
    }

    const stored = await this.state.snapshot();
    const scopeReports = stored.reconciliationReports.filter(
      (report) =>
        report.tenantId === input.tenantId &&
        report.workspaceId === input.workspaceId,
    );
    const scopeJobs = stored.reprocessJobs.filter(
      (job) =>
        job.tenantId === input.tenantId &&
        job.workspaceId === input.workspaceId,
    );

    return {
      generatedAt: input.generatedAt,
      metrics: snapshots,
      readiness: aggregateReadiness(snapshots.map((snapshot) => snapshot.readiness)),
      reconciliationReports: scopeReports,
      reprocessJobs: scopeJobs,
    };
  }

  async dashboardReadiness(
    context: RequestContext,
  ): Promise<AuthServiceResult<DashboardReadinessResponse>> {
    const authorized = await this.accessService.authorizeSelectedContext(
      context,
      "analytics.read",
    );

    if (!authorized.ok) {
      return authorized.result;
    }

    return this.ok(await this.calculateForScope(authorized.tenantId, authorized.workspaceId, context), context);
  }

  async commandCenter(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    return this.projection(context, "command-center", [
      "gross_order_value",
      "revenue_after_refunds",
      "orders",
      "aov",
      "ad_spend",
      "roas",
      "stockout_risk",
    ]);
  }

  async campaigns(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    return this.projection(context, "campaigns", [
      "ad_spend",
      "cpc",
      "cpm",
      "ctr",
      "platform_attributed_conversions",
      "platform_attributed_revenue",
      "roas",
      "cost_per_order",
    ]);
  }

  async orders(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    return this.projection(context, "orders", [
      "gross_order_value",
      "revenue_after_refunds",
      "orders",
      "units_sold",
      "returned_units",
      "return_value",
      "return_rate_units",
      "return_rate_orders",
      "aov",
    ]);
  }

  async products(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    return this.projection(context, "products", [
      "available_stock",
      "stock_value",
      "days_of_inventory",
      "inventory_turnover",
      "sell_through_rate",
      "stockout_risk",
      "product_revenue",
      "product_units",
      "product_margin",
      "product_contribution",
    ]);
  }

  async customers(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    return this.projection(context, "customers", []);
  }

  async traffic(
    context: RequestContext,
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    return this.projection(context, "traffic", []);
  }

  private async projection(
    context: RequestContext,
    module: DashboardModule,
    metricCodes: readonly DashboardMetricCode[],
  ): Promise<AuthServiceResult<{ projection: DashboardProjection }>> {
    const authorized = await this.accessService.authorizeSelectedContext(
      context,
      "analytics.read",
    );

    if (!authorized.ok) {
      return authorized.result;
    }

    const readiness = await this.calculateForScope(
      authorized.tenantId,
      authorized.workspaceId,
      context,
    );
    const metrics = readiness.metrics.filter((snapshot) =>
      metricCodes.includes(snapshot.metricCode),
    );
    const projection = {
      generatedAt: readiness.generatedAt,
      metrics,
      module,
      readiness: metricCodes.length
        ? aggregateReadiness(metrics.map((snapshot) => snapshot.readiness))
        : "no_data",
    } satisfies DashboardProjection;

    return this.ok({ projection }, context);
  }

  private async calculateForScope(
    tenantId: string,
    workspaceId: string,
    context: RequestContext,
  ): Promise<DashboardReadinessResponse> {
    const storedInput = await this.state.getInput(tenantId, workspaceId);
    const input = storedInput ?? createMetricEngineInput({
      generatedAt: toIso(context.now),
      tenantId,
      workspaceId,
    });
    return this.calculate(input);
  }

  private calculateSnapshots(input: MetricEngineInput): readonly MetricSnapshotRecord[] {
    const facts = createMetricFacts(input);

    return metricDefinitions.map((definition) => {
      const result = calculateMetric(definition.metricCode, input, facts);

      return {
        currency: definition.unit === "money" ? input.currency : null,
        definitionVersion: definition.definitionVersion,
        evidence: evidenceFor(definition.metricCode, input, facts),
        generatedAt: input.generatedAt,
        inputHash: inputHash(input, definition.metricCode),
        limitations: result.limitations,
        metricCode: definition.metricCode,
        periodEnd: input.periodEnd,
        periodStart: input.periodStart,
        readiness: result.readiness,
        reasonCodes: result.reasonCodes,
        snapshotId: this.random.uuid(),
        tenantId: input.tenantId,
        value: result.value,
        valueKind: definition.unit,
        workspaceId: input.workspaceId,
      } satisfies MetricSnapshotRecord;
    });
  }

  private createReconciliationReport(
    input: MetricEngineInput,
    snapshots: readonly MetricSnapshotRecord[],
  ): ReconciliationReportRecord {
    const invalidSnapshots = snapshots.filter((snapshot) => snapshot.readiness === "invalid");
    const status = invalidSnapshots.length ? "mismatch" : "matched";

    return {
      createdAt: input.generatedAt,
      details: status === "matched"
        ? ["source_normalized_canonical_snapshot_matched"]
        : ["invalid_reconciliation_blocks_metric_publication"],
      metricCodes: status === "matched"
        ? dashboardMetricCodes
        : invalidSnapshots.map((snapshot) => snapshot.metricCode),
      reconciliationReportId: this.random.uuid(),
      status,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    };
  }

  private createReprocessJob(
    input: MetricEngineInput,
    snapshots: readonly MetricSnapshotRecord[],
  ): ReprocessJobRecord | null {
    const affected = snapshots.filter((snapshot) =>
      snapshot.readiness === "invalid" || snapshot.readiness === "stale",
    );

    if (!affected.length) {
      return null;
    }

    return {
      affectedMetricCodes: uniqueMetricCodes(affected.map((snapshot) => snapshot.metricCode)),
      createdAt: input.generatedAt,
      reason: affected.some((snapshot) => snapshot.readiness === "invalid") ? "invalid" : "stale",
      reprocessJobId: this.random.uuid(),
      status: "queued",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    };
  }

  private ok<TData>(
    data: TData,
    context: RequestContext,
  ): AuthServiceResult<TData> {
    return {
      body: {
        data,
        meta: responseMeta(context),
      },
      status: 200,
    };
  }
}

export const metricDefinitions = [
  definition("gross_order_value", "money", "Suma brutto kanonicznych zamowien sklepowych.", "SUM(canonical_orders.gross_amount)", ["canonical_orders"], "348.00"),
  definition("revenue_after_refunds", "money", "Przychod po odjeciu kanonicznych zwrotow.", "gross_order_value - return_value", ["canonical_orders", "canonical_refunds"], "150.00"),
  definition("orders", "count", "Liczba kanonicznych zamowien sklepowych.", "COUNT(canonical_orders)", ["canonical_orders"], "2"),
  definition("units_sold", "units", "Liczba sprzedanych sztuk z kanonicznych linii zamowien.", "SUM(canonical_order_lines.quantity)", ["canonical_order_lines"], "2"),
  definition("returned_units", "units", "Liczba zwroconych sztuk klientow.", "SUM(canonical_customer_returns.returned_quantity)", ["canonical_customer_returns"], "2"),
  definition("return_value", "money", "Wartosc zwrotow klientow.", "SUM(canonical_refunds.amount)", ["canonical_refunds"], "198.00"),
  definition("return_rate_units", "ratio", "Share of returned units in sold units.", "returned_units / units_sold", ["canonical_customer_returns", "canonical_order_lines"], "1.0000"),
  definition("return_rate_orders", "ratio", "Share of refunded orders in all orders.", "orders_with_refund / orders", ["canonical_orders", "canonical_refunds"], "1.0000"),
  definition("aov", "money", "Srednia wartosc zamowienia brutto.", "gross_order_value / orders", ["canonical_orders"], "174.00"),
  definition("available_stock", "units", "Dostepny stan magazynowy z wybranego zrodla inventory.", "SUM(primary_inventory.quantity_available)", ["canonical_inventory_snapshots"], "12"),
  definition("stock_value", "money", "Inventory value from confirmed product costs.", "available_stock * product_unit_cost", ["canonical_inventory_snapshots", "product_costs"], "840.00"),
  definition("days_of_inventory", "ratio", "Liczba dni pokrycia magazynu przy obecnym tempie sprzedazy.", "available_stock / average_daily_units_sold", ["canonical_inventory_snapshots", "canonical_order_lines"], "12.0000"),
  definition("inventory_turnover", "ratio", "Rotacja magazynu liczona jako sprzedane sztuki do dostepnego stanu.", "units_sold / available_stock", ["canonical_inventory_snapshots", "canonical_order_lines"], "0.1667"),
  definition("sell_through_rate", "ratio", "Share of sold units in sold units plus remaining stock.", "units_sold / (units_sold + available_stock)", ["canonical_inventory_snapshots", "canonical_order_lines"], "0.1429"),
  definition("stockout_risk", "risk", "Ryzyko braku magazynu na podstawie dni pokrycia.", "CASE days_of_inventory WHEN <= 7 THEN HIGH ELSE LOW", ["canonical_inventory_snapshots", "canonical_order_lines"], "MEDIUM"),
  definition("product_revenue", "money", "Przychod produktu z kanonicznych linii zamowien.", "SUM(canonical_order_lines.gross_amount)", ["canonical_order_lines", "external_product_mappings"], "348.00"),
  definition("product_units", "units", "Sztuki produktu z kanonicznych linii zamowien.", "SUM(canonical_order_lines.quantity)", ["canonical_order_lines", "external_product_mappings"], "2"),
  definition("product_margin", "money", "Marza produktu po potwierdzonym koszcie produktu.", "product_revenue - product_cost", ["canonical_order_lines", "product_costs"], "208.00"),
  definition("product_contribution", "money", "Kontrybucja produktu po koszcie produktu i koszcie reklam.", "product_margin - ad_spend", ["canonical_order_lines", "product_costs", "canonical_ad_spend"], "-2.00"),
  definition("ad_spend", "money", "Koszt reklam z kanonicznych danych platform reklamowych.", "SUM(canonical_ad_spend.cost_amount)", ["canonical_ad_spend"], "210.00"),
  definition("cpc", "money", "Sredni koszt klikniecia.", "ad_spend / clicks", ["canonical_ad_spend"], "1.56"),
  definition("cpm", "money", "Sredni koszt tysiaca wyswietlen.", "ad_spend / impressions * 1000", ["canonical_ad_spend"], "30.88"),
  definition("ctr", "ratio", "Click-through rate for ads.", "clicks / impressions", ["canonical_ad_spend"], "0.0199"),
  definition("platform_attributed_conversions", "count", "Konwersje przypisane przez platformy reklamowe.", "COUNT(canonical_attributed_conversions)", ["canonical_attributed_conversions"], "2"),
  definition("platform_attributed_revenue", "money", "Wartosc konwersji przypisana przez platformy reklamowe, oddzielna od przychodu sklepu.", "SUM(canonical_attributed_conversions.attributed_value_amount)", ["canonical_attributed_conversions"], "810.00"),
  definition("roas", "ratio", "ROAS platform reklamowych bez sumowania z przychodem sklepu.", "platform_attributed_revenue / ad_spend", ["canonical_ad_spend", "canonical_attributed_conversions"], "3.8571"),
  definition("cost_per_order", "money", "Koszt reklam przypadajacy na kanoniczne zamowienie sklepowe.", "ad_spend / orders", ["canonical_ad_spend", "canonical_orders"], "105.00"),
] as const satisfies readonly MetricDefinitionRecord[];

export function createMetricEngineInput(options: {
  readonly generatedAt?: IsoDateTime;
  readonly includeProductCosts?: boolean;
  readonly invalid?: boolean;
  readonly missingProductMapping?: boolean;
  readonly noData?: boolean;
  readonly partial?: boolean;
  readonly primaryInventoryProvider?: "allegro" | "woocommerce" | null;
  readonly stale?: boolean;
  readonly tenantId?: string;
  readonly workspaceId?: string;
} = {}): MetricEngineInput {
  const tenantId = options.tenantId ?? "tenant_metrics";
  const workspaceId = options.workspaceId ?? "workspace_metrics";
  const generatedAt = options.generatedAt ?? ("2026-07-20T00:00:00.000Z" as IsoDateTime);
  const periodStart = "2026-07-19T00:00:00.000Z" as IsoDateTime;
  const periodEnd = "2026-07-21T00:00:00.000Z" as IsoDateTime;
  const primaryProvider = options.primaryInventoryProvider === undefined
    ? "woocommerce"
    : options.primaryInventoryProvider;

  if (options.noData) {
    return {
      canonicalAdSpend: [],
      canonicalAttributedConversions: [],
      canonicalCustomerReturns: [],
      canonicalInventorySnapshots: [],
      canonicalOrderLines: [],
      canonicalOrders: [],
      canonicalProducts: [],
      canonicalRefunds: [],
      currency: "PLN",
      dataIssues: options.partial ? [partialDataIssue(tenantId, workspaceId, generatedAt)] : [],
      generatedAt,
      periodEnd,
      periodStart,
      primaryInventorySource: primaryProvider
        ? primaryInventorySource(tenantId, workspaceId, primaryProvider, generatedAt)
        : null,
      productCosts: options.includeProductCosts === false ? [] : readyProductCosts,
      reconciliationReports: options.invalid
        ? [invalidReconciliationReport(tenantId, workspaceId, generatedAt)]
        : [],
      syncCheckpoints: [],
      tenantId,
      timezone: "Europe/Warsaw",
      workspaceId,
    };
  }

  const snapshot = createReadyIntegrationSnapshot(tenantId, workspaceId);
  const dataIssues = options.partial
    ? [...snapshot.dataIssues, partialDataIssue(tenantId, workspaceId, generatedAt)]
    : snapshot.dataIssues;
  const syncCheckpoints = options.stale
    ? snapshot.syncCheckpoints.map((checkpoint) => ({
        ...checkpoint,
        updatedAt: "2026-07-10T00:00:00.000Z" as IsoDateTime,
      }))
    : snapshot.syncCheckpoints;
  const orderLines = options.missingProductMapping
    ? snapshot.canonicalOrderLines.map((line) => ({
        ...line,
        canonicalProductId: null,
      }))
    : snapshot.canonicalOrderLines;

  return {
    canonicalAdSpend: snapshot.canonicalAdSpend,
    canonicalAttributedConversions: snapshot.canonicalAttributedConversions,
    canonicalCustomerReturns: snapshot.canonicalCustomerReturns,
    canonicalInventorySnapshots: snapshot.canonicalInventorySnapshots,
    canonicalOrderLines: orderLines,
    canonicalOrders: snapshot.canonicalOrders,
    canonicalProducts: snapshot.canonicalProducts,
    canonicalRefunds: snapshot.canonicalRefunds,
    currency: "PLN",
    dataIssues,
    generatedAt,
    periodEnd,
    periodStart,
    primaryInventorySource: primaryProvider
      ? primaryInventorySource(tenantId, workspaceId, primaryProvider, generatedAt)
      : null,
    productCosts: options.includeProductCosts === false ? [] : readyProductCosts,
    reconciliationReports: options.invalid
      ? [invalidReconciliationReport(tenantId, workspaceId, generatedAt)]
      : [],
    syncCheckpoints,
    tenantId,
    timezone: "Europe/Warsaw",
    workspaceId,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

type CalendarDayWindow = {
  readonly date: string;
  readonly endMs: number;
  readonly startMs: number;
};

function normalizeSeriesTimeZone(timezone: string): string {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date(0));
    return timezone;
  } catch {
    return "UTC";
  }
}

function localDateOnlyForInstant(instantMs: number, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(new Date(instantMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function parseCalendarDateOnly(dateOnly: string): { day: number; month: number; year: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);
  if (!match) {
    throw new Error(`Invalid calendar date: ${dateOnly}`);
  }

  return {
    day: Number(match[3]),
    month: Number(match[2]),
    year: Number(match[1]),
  };
}

function addCalendarDays(dateOnly: string, days: number): string {
  const { day, month, year } = parseCalendarDateOnly(dateOnly);
  return new Date(Date.UTC(year, month - 1, day) + days * DAY_MS)
    .toISOString()
    .slice(0, 10);
}

function seriesTimeZoneOffsetMs(instantMs: number, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(new Date(instantMs));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return representedAsUtc - Math.floor(instantMs / 1000) * 1000;
}

function localMidnightMs(dateOnly: string, timezone: string): number {
  const { day, month, year } = parseCalendarDateOnly(dateOnly);
  const wallClockUtc = Date.UTC(year, month - 1, day);
  let instantMs = wallClockUtc;

  // Re-evaluate the offset because DST at the target date can differ from
  // the provisional instant's offset. Three passes are deterministic and
  // sufficient for IANA timezone transitions around local midnight.
  for (let pass = 0; pass < 3; pass += 1) {
    instantMs = wallClockUtc - seriesTimeZoneOffsetMs(instantMs, timezone);
  }

  return instantMs;
}

/**
 * Splits the metric window into real local-calendar days in input.timezone.
 * This avoids two subtle production bugs from the former fixed 24h slicing:
 * dates were labelled in UTC (off by one in Europe/Warsaw) and DST days were
 * forced to 24 hours even when the local day actually lasted 23 or 25.
 */
function buildCalendarDayWindows(input: MetricEngineInput): readonly CalendarDayWindow[] {
  const periodStartMs = Date.parse(input.periodStart);
  const periodEndMs = Date.parse(input.periodEnd);
  if (
    !Number.isFinite(periodStartMs)
    || !Number.isFinite(periodEndMs)
    || periodEndMs <= periodStartMs
  ) {
    return [];
  }

  const timezone = normalizeSeriesTimeZone(input.timezone);
  let date = localDateOnlyForInstant(periodStartMs, timezone);
  const lastDate = localDateOnlyForInstant(periodEndMs - 1, timezone);
  const windows: CalendarDayWindow[] = [];

  // The engine caps user-facing Command Center windows at 366 days, while
  // this generic guard prevents malformed input from creating an unbounded
  // loop in other callers.
  for (let index = 0; index < 4_000; index += 1) {
    const nextDate = addCalendarDays(date, 1);
    const startMs = Math.max(periodStartMs, localMidnightMs(date, timezone));
    const endMs = Math.min(periodEndMs, localMidnightMs(nextDate, timezone));

    if (endMs > startMs) {
      windows.push({ date, endMs, startMs });
    }

    if (date === lastDate) {
      break;
    }

    date = nextDate;
  }

  return windows;
}

/**
 * Builds a multi-day MetricEngineInput by cloning the sandbox's canonical
 * fact template once per day, shifting dates into the window and scaling
 * amounts with a deterministic (non-random) day-of-week + trend curve. This
 * lets command-center features compute real daily series — via
 * computeMetricEngineSeries below — over the same formulas/facts the rest of
 * the metric engine already uses, instead of inventing numbers client-side.
 */
export function createMetricEngineSeriesInput(options: {
  readonly days?: number;
  readonly generatedAt?: IsoDateTime;
  readonly tenantId?: string;
  readonly workspaceId?: string;
} = {}): MetricEngineInput {
  const tenantId = options.tenantId ?? "tenant_metrics";
  const workspaceId = options.workspaceId ?? "workspace_metrics";
  const days = Math.max(1, options.days ?? 30);
  const generatedAt = options.generatedAt ?? ("2026-07-20T00:00:00.000Z" as IsoDateTime);
  const windowEndMs = Date.parse(generatedAt);
  const windowStartMs = windowEndMs - days * DAY_MS;

  const template = createReadyIntegrationSnapshot(tenantId, workspaceId);
  const templateAnchorMs = Date.parse("2026-07-19T00:00:00.000Z");

  const canonicalOrders: CanonicalOrderRecord[] = [];
  const canonicalOrderLines: CanonicalOrderLineRecord[] = [];
  const canonicalRefunds: CanonicalRefundRecord[] = [];
  const canonicalCustomerReturns: CanonicalCustomerReturnRecord[] = [];
  const canonicalAdSpend: CanonicalAdSpendRecord[] = [];
  const canonicalAttributedConversions: CanonicalAttributedConversionRecord[] = [];

  for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
    const dayStartMs = windowStartMs + dayIndex * DAY_MS;
    const suffix = `d${dayIndex}`;
    const orderWeight = seriesWeight(dayIndex, days, workspaceId, "orders");
    const adSpendWeight = seriesWeight(dayIndex, days, workspaceId, "ad_spend");
    const conversionWeight = seriesWeight(dayIndex, days, workspaceId, "conversions");

    for (const order of template.canonicalOrders) {
      const newOrderId = `${order.canonicalOrderId}_${suffix}`;
      canonicalOrders.push({
        ...order,
        canonicalOrderId: newOrderId,
        grossAmount: scaleMoney(order.grossAmount, orderWeight),
        orderedAt: shiftIso(order.orderedAt, templateAnchorMs, dayStartMs),
      });

      for (const line of template.canonicalOrderLines) {
        if (line.canonicalOrderId !== order.canonicalOrderId) {
          continue;
        }

        canonicalOrderLines.push({
          ...line,
          canonicalLineId: `${line.canonicalLineId}_${suffix}`,
          canonicalOrderId: newOrderId,
          grossAmount: scaleMoney(line.grossAmount, orderWeight),
        });
      }
    }

    for (const refund of template.canonicalRefunds) {
      const newExternalRefundId = `${refund.externalRefundId}_${suffix}`;
      canonicalRefunds.push({
        ...refund,
        canonicalOrderId: refund.canonicalOrderId ? `${refund.canonicalOrderId}_${suffix}` : null,
        canonicalRefundId: `${refund.canonicalRefundId}_${suffix}`,
        amount: scaleMoney(refund.amount, orderWeight),
        externalRefundId: newExternalRefundId,
        refundedAt: shiftIso(refund.refundedAt, templateAnchorMs, dayStartMs),
      });

      for (const returned of template.canonicalCustomerReturns) {
        if (returned.externalRefundId !== refund.externalRefundId) {
          continue;
        }

        canonicalCustomerReturns.push({
          ...returned,
          canonicalReturnId: `${returned.canonicalReturnId}_${suffix}`,
          externalRefundId: newExternalRefundId,
        });
      }
    }

    for (const spend of template.canonicalAdSpend) {
      canonicalAdSpend.push({
        ...spend,
        canonicalAdSpendId: `${spend.canonicalAdSpendId}_${suffix}`,
        clicks: scaleCount(spend.clicks, adSpendWeight),
        costAmount: scaleMoney(spend.costAmount, adSpendWeight),
        date: toDateOnly(dayStartMs),
        impressions: scaleCount(spend.impressions, adSpendWeight),
      });
    }

    for (const conversion of template.canonicalAttributedConversions) {
      canonicalAttributedConversions.push({
        ...conversion,
        attributedConversionId: `${conversion.attributedConversionId}_${suffix}`,
        attributedValueAmount: scaleMoney(conversion.attributedValueAmount, conversionWeight),
        conversionTime: shiftIso(conversion.conversionTime, templateAnchorMs, dayStartMs),
        externalConversionId: `${conversion.externalConversionId}_${suffix}`,
      });
    }
  }

  return {
    canonicalAdSpend,
    canonicalAttributedConversions,
    canonicalCustomerReturns,
    canonicalInventorySnapshots: template.canonicalInventorySnapshots,
    canonicalOrderLines,
    canonicalOrders,
    canonicalProducts: template.canonicalProducts,
    canonicalRefunds,
    currency: "PLN",
    dataIssues: template.dataIssues,
    generatedAt,
    periodEnd: toIsoDateTime(windowEndMs),
    periodStart: toIsoDateTime(windowStartMs),
    primaryInventorySource: primaryInventorySource(tenantId, workspaceId, "woocommerce", generatedAt),
    productCosts: readyProductCosts,
    reconciliationReports: [],
    syncCheckpoints: template.syncCheckpoints,
    tenantId,
    timezone: "UTC",
    workspaceId,
  };
}

/**
 * Computes both a full-window aggregate and a per-day breakdown for the
 * given metric codes, over a MetricEngineInput (typically produced by
 * createMetricEngineSeriesInput). Reuses the same createMetricFacts/
 * calculateMetric formulas as the rest of the engine — a day is just a
 * narrower period window over the same canonical facts.
 */
export function computeMetricEngineSeries(
  input: MetricEngineInput,
  metricCodes: readonly DashboardMetricCode[],
): {
  readonly aggregate: Partial<Record<DashboardMetricCode, string | null>>;
  readonly readiness: Partial<Record<DashboardMetricCode, MetricReadiness>>;
  readonly reasonCodes: Partial<Record<DashboardMetricCode, readonly MetricReasonCode[]>>;
  readonly daily: readonly {
    readonly date: string;
    readonly values: Partial<Record<DashboardMetricCode, string | null>>;
  }[];
} {
  const aggregateFacts = createMetricFacts(input);
  const aggregate: Partial<Record<DashboardMetricCode, string | null>> = {};
  const readiness: Partial<Record<DashboardMetricCode, MetricReadiness>> = {};
  const reasonCodes: Partial<Record<DashboardMetricCode, readonly MetricReasonCode[]>> = {};

  for (const code of metricCodes) {
    const result = calculateMetric(code, input, aggregateFacts);
    aggregate[code] = result.value;
    readiness[code] = result.readiness;
    reasonCodes[code] = result.reasonCodes;
  }

  const daily: {
    readonly date: string;
    readonly values: Partial<Record<DashboardMetricCode, string | null>>;
  }[] = [];

  for (const dayWindow of buildCalendarDayWindows(input)) {
    const dayInput: MetricEngineInput = {
      ...input,
      periodEnd: toIsoDateTime(dayWindow.endMs),
      periodStart: toIsoDateTime(dayWindow.startMs),
    };
    const dayFacts = createMetricFacts(dayInput);
    const values: Partial<Record<DashboardMetricCode, string | null>> = {};

    for (const code of metricCodes) {
      values[code] = calculateMetric(code, dayInput, dayFacts).value;
    }

    daily.push({ date: dayWindow.date, values });
  }

  return { aggregate, daily, readiness, reasonCodes };
}

function seriesWeight(
  dayIndex: number,
  totalDays: number,
  workspaceId: string,
  channel: "ad_spend" | "conversions" | "orders",
): number {
  const dayOfWeekCurve = [0.84, 0.9, 0.97, 1, 1.08, 1.2, 1.14] as const;
  const weekday = dayIndex % 7;
  const seed = (hashSeed(`${workspaceId}:${channel}`) % 1000) / 1000;
  const trendProgress = totalDays > 1 ? dayIndex / (totalDays - 1) : 0;
  const trend = 0.9 + trendProgress * 0.25 + seed * 0.1;
  return dayOfWeekCurve[weekday] * trend;
}

function hashSeed(value: string): number {
  let hash = 2166136261;

  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function scaleMoney(amount: string, weight: number): string {
  const cents = decimalToCents(amount);
  const scaledCents = BigInt(Math.round(Number(cents) * weight));
  return centsToDecimal(scaledCents);
}

function scaleCount(value: number, weight: number): number {
  return Math.max(0, Math.round(value * weight));
}

function shiftIso(value: IsoDateTime, anchorMs: number, dayStartMs: number): IsoDateTime {
  const offsetMs = Date.parse(value) - anchorMs;
  return toIsoDateTime(dayStartMs + offsetMs);
}

function toIsoDateTime(ms: number): IsoDateTime {
  return new Date(ms).toISOString() as IsoDateTime;
}

function toDateOnly(ms: number): string {
  return toIsoDateTime(ms).slice(0, 10);
}

function calculateMetric(
  metricCode: DashboardMetricCode,
  input: MetricEngineInput,
  facts: MetricFacts,
): CalculationResult {
  const unavailable = unavailableFor(metricCode, input, facts);

  if (unavailable) {
    return unavailable;
  }

  if (!hasRequiredData(metricCode, facts)) {
    return {
      limitations: ["Required canonical facts are not available."],
      readiness: "no_data",
      reasonCodes: ["NO_DATA"],
      value: null,
    };
  }

  const baseReadiness = readinessForInput(input);

  if (baseReadiness === "invalid") {
    return {
      limitations: limitationsFor(baseReadiness),
      readiness: baseReadiness,
      reasonCodes: reasonCodesFor(baseReadiness),
      value: null,
    };
  }

  const value = valueForMetric(metricCode, input, facts);

  if (value === null) {
    return {
      limitations: ["Metric denominator or required value is missing."],
      readiness: "no_data",
      reasonCodes: ["NO_DATA"],
      value: null,
    };
  }

  return {
    limitations: limitationsFor(baseReadiness),
    readiness: baseReadiness,
    reasonCodes: reasonCodesFor(baseReadiness),
    value,
  };
}

function valueForMetric(
  metricCode: DashboardMetricCode,
  input: MetricEngineInput,
  facts: MetricFacts,
): string | null {
  const grossOrderValue = sumMoney(facts.commerceOrders.map((order) => order.grossAmount));
  const returnValue = sumMoney(facts.refunds.map((refund) => refund.amount));
  const revenueQualifyingReturnValue = sumMoney(
    facts.revenueQualifyingRefunds.map((refund) => refund.amount),
  );
  const unitsSold = sumQuantities(facts.orderLines.map((line) => line.quantity));
  const returnedUnits = sumQuantities(facts.returns.map((returnRecord) => returnRecord.returnedQuantity));
  const availableStock = sumQuantities(facts.inventorySnapshots.map((snapshot) => snapshot.quantityAvailable));
  const adSpend = sumMoney(facts.adSpend.map((spend) => spend.costAmount));
  const platformAttributedRevenue = sumMoney(
    facts.attributedConversions.map((conversion) => conversion.attributedValueAmount),
  );
  const productRevenue = sumMoney(facts.orderLines.map((line) => line.grossAmount));
  const productCost = productCostCents(facts.orderLines, facts);
  const stockCost = inventoryCostCents(facts.inventorySnapshots, facts);
  const orderCount = facts.commerceOrders.length;
  const refundOrderCount = uniqueStrings(
    facts.refunds
      .map((refund) => refund.canonicalOrderId)
      .filter((orderId): orderId is string => Boolean(orderId)),
  ).length;
  const clicks = sumIntegers(facts.adSpend.map((spend) => spend.clicks));
  const impressions = sumIntegers(facts.adSpend.map((spend) => spend.impressions));
  const periodDays = periodDayCount(input.periodStart, input.periodEnd, input.timezone);

  switch (metricCode) {
    case "ad_spend":
      return centsToDecimal(adSpend);
    case "aov":
      return divideCentsByInteger(grossOrderValue, orderCount);
    case "available_stock":
      return integerString(availableStock);
    case "cost_per_order":
      return divideCentsByInteger(adSpend, orderCount);
    case "cpc":
      return divideCentsByInteger(adSpend, clicks);
    case "cpm":
      return divideCentsByInteger(adSpend * 1000n, impressions);
    case "ctr":
      return ratio(clicks, impressions);
    case "days_of_inventory":
      return ratio(availableStock * periodDays, unitsSold);
    case "gross_order_value":
      return centsToDecimal(grossOrderValue);
    case "inventory_turnover":
      return ratio(unitsSold, availableStock);
    case "orders":
      return String(orderCount);
    case "platform_attributed_conversions":
      return String(facts.attributedConversions.length);
    case "platform_attributed_revenue":
      return centsToDecimal(platformAttributedRevenue);
    case "product_contribution":
      return centsToDecimal(productRevenue - productCost - adSpend);
    case "product_margin":
      return centsToDecimal(productRevenue - productCost);
    case "product_revenue":
      return centsToDecimal(productRevenue);
    case "product_units":
      return integerString(unitsSold);
    case "return_rate_orders":
      return ratio(refundOrderCount, orderCount);
    case "return_rate_units":
      return ratio(returnedUnits, unitsSold);
    case "return_value":
      return centsToDecimal(returnValue);
    case "returned_units":
      return integerString(returnedUnits);
    case "revenue_after_refunds":
      return centsToDecimal(grossOrderValue - revenueQualifyingReturnValue);
    case "roas":
      return ratioCents(platformAttributedRevenue, adSpend);
    case "sell_through_rate":
      return ratio(unitsSold, unitsSold + availableStock);
    case "stock_value":
      return centsToDecimal(stockCost);
    case "stockout_risk":
      return stockoutRisk(availableStock, unitsSold, periodDays);
    case "units_sold":
      return integerString(unitsSold);
  }
}

function unavailableFor(
  metricCode: DashboardMetricCode,
  input: MetricEngineInput,
  facts: MetricFacts,
): CalculationResult | null {
  if (inventoryMetricCodes.includes(metricCode) && !input.primaryInventorySource) {
    return unavailable("MISSING_INVENTORY_AUTHORITY", "Inventory source authority is not selected.");
  }

  if (inventoryMetricCodes.includes(metricCode) && facts.inventorySnapshots.length > 0) {
    const hasWrongAuthority = facts.inventorySnapshots.some(
      (snapshot) => snapshot.providerId !== input.primaryInventorySource?.providerId,
    );

    if (hasWrongAuthority) {
      return unavailable("MISSING_INVENTORY_AUTHORITY", "Inventory facts do not match selected authority.");
    }
  }

  if (productMappingMetricCodes.includes(metricCode) && facts.orderLines.some((line) => !line.canonicalProductId)) {
    return unavailable("MISSING_PRODUCT_MAPPING", "Product metric requires accepted product mapping.");
  }

  if (metricCode === "stock_value" && facts.inventorySnapshots.some((snapshot) => !snapshot.canonicalProductId)) {
    return unavailable("MISSING_PRODUCT_MAPPING", "Stock value requires mapped inventory products.");
  }

  if (costMetricCodes.includes(metricCode) && hasRequiredData(metricCode, facts)) {
    if (missingCostFor(metricCode, facts)) {
      return unavailable("MISSING_PRODUCT_COST", "Metric requires confirmed product cost.");
    }
  }

  return null;
}

function hasRequiredData(metricCode: DashboardMetricCode, facts: MetricFacts): boolean {
  if (commerceOrderMetricCodes.includes(metricCode)) {
    return facts.commerceOrders.length > 0;
  }

  if (orderLineMetricCodes.includes(metricCode)) {
    return facts.orderLines.length > 0;
  }

  if (refundMetricCodes.includes(metricCode)) {
    return facts.refunds.length > 0 || facts.returns.length > 0;
  }

  if (inventoryMetricCodes.includes(metricCode)) {
    return facts.inventorySnapshots.length > 0;
  }

  if (adMetricCodes.includes(metricCode)) {
    return facts.adSpend.length > 0;
  }

  if (conversionMetricCodes.includes(metricCode)) {
    return facts.attributedConversions.length > 0;
  }

  if (metricCode === "roas") {
    return facts.adSpend.length > 0 && facts.attributedConversions.length > 0;
  }

  if (metricCode === "cost_per_order") {
    return facts.adSpend.length > 0 && facts.commerceOrders.length > 0;
  }

  return true;
}

function createMetricFacts(input: MetricEngineInput): MetricFacts {
  const commerceOrders = input.canonicalOrders.filter(
    (order) =>
      isInPeriod(order.orderedAt, input.periodStart, input.periodEnd)
      && isRevenueQualifyingOrder(order),
  );
  const orderIds = new Set(commerceOrders.map((order) => order.canonicalOrderId));
  const orderLines = input.canonicalOrderLines.filter((line) =>
    orderIds.has(line.canonicalOrderId),
  );
  // ALL refunds in the period, regardless of whether their order is still
  // revenue-qualifying. return_value, return_rate_orders, returned_units and
  // return_rate_units must reflect every real refund -- narrowing this to
  // only revenue-qualifying orders would make those metrics blind to refunds
  // against orders that got excluded by status (e.g. a full refund that
  // flipped the order to "refunded").
  const refunds = input.canonicalRefunds.filter((refund) =>
    isInPeriod(refund.refundedAt, input.periodStart, input.periodEnd),
  );
  // Narrower subset used ONLY by revenue_after_refunds, to avoid
  // double-counting a loss: a refund against an order that itself got
  // excluded from `commerceOrders` (e.g. status flipped to "refunded") must
  // NOT also be subtracted from revenue -- that order already contributes 0
  // to gross_order_value, so subtracting its refund on top would decrement
  // revenue twice for the same event. A refund against an order that is
  // still revenue-qualifying (e.g. a partial refund that left the order
  // "completed") correctly still reduces revenue.
  const revenueQualifyingRefunds = refunds.filter(
    (refund) => refund.canonicalOrderId !== null && orderIds.has(refund.canonicalOrderId),
  );
  const returns = input.canonicalCustomerReturns.filter((returnRecord) =>
    refunds.some((refund) => refund.externalRefundId === returnRecord.externalRefundId),
  );
  const inventorySnapshots = input.primaryInventorySource
    ? input.canonicalInventorySnapshots.filter(
        (snapshot) => snapshot.providerId === input.primaryInventorySource?.providerId,
      )
    : input.canonicalInventorySnapshots;
  const adSpend = input.canonicalAdSpend.filter((spend) =>
    isDateInPeriod(spend.date, input.periodStart, input.periodEnd, input.timezone),
  );
  const attributedConversions = input.canonicalAttributedConversions.filter((conversion) =>
    isInPeriod(conversion.conversionTime, input.periodStart, input.periodEnd),
  );

  return {
    adSpend,
    attributedConversions,
    commerceOrders,
    inventorySnapshots,
    orderLines,
    productById: new Map(input.canonicalProducts.map((product) => [product.canonicalProductId, product])),
    productCostBySku: new Map(input.productCosts.map((cost) => [cost.sku, decimalToCents(cost.unitCostAmount)])),
    refunds,
    revenueQualifyingRefunds,
    returns,
  };
}

function missingCostFor(metricCode: DashboardMetricCode, facts: MetricFacts): boolean {
  if (metricCode === "stock_value") {
    return facts.inventorySnapshots.some((snapshot) => {
      if (!snapshot.canonicalProductId) {
        return true;
      }

      return productUnitCost(snapshot.canonicalProductId, facts) === null;
    });
  }

  if (metricCode === "product_margin" || metricCode === "product_contribution") {
    return facts.orderLines.some((line) => {
      if (!line.canonicalProductId) {
        return true;
      }

      return productUnitCost(line.canonicalProductId, facts) === null;
    });
  }

  return false;
}

function productCostCents(
  lines: readonly CanonicalOrderLineRecord[],
  facts: MetricFacts,
): bigint {
  return lines.reduce((sum, line) => {
    if (!line.canonicalProductId) {
      return sum;
    }

    const unitCost = productUnitCost(line.canonicalProductId, facts);
    return unitCost === null ? sum : sum + unitCost * BigInt(line.quantity);
  }, 0n);
}

function inventoryCostCents(
  snapshots: readonly CanonicalInventorySnapshotRecord[],
  facts: MetricFacts,
): bigint {
  return snapshots.reduce((sum, snapshot) => {
    if (!snapshot.canonicalProductId) {
      return sum;
    }

    const unitCost = productUnitCost(snapshot.canonicalProductId, facts);
    return unitCost === null ? sum : sum + unitCost * BigInt(snapshot.quantityAvailable);
  }, 0n);
}

function productUnitCost(
  canonicalProductId: string,
  facts: MetricFacts,
): bigint | null {
  const product = facts.productById.get(canonicalProductId);

  if (!product?.sku) {
    return null;
  }

  return facts.productCostBySku.get(product.sku) ?? null;
}

function readinessForInput(input: MetricEngineInput): MetricReadiness {
  if (input.reconciliationReports.some((report) => report.status === "mismatch")) {
    return "invalid";
  }

  if (isStale(input)) {
    return "stale";
  }

  if (input.dataIssues.some((issue) => issue.status === "open")) {
    return "partial";
  }

  return "ready";
}

function isStale(input: MetricEngineInput): boolean {
  if (!input.syncCheckpoints.length) {
    return false;
  }

  const latest = Math.max(
    ...input.syncCheckpoints.map((checkpoint) => Date.parse(checkpoint.updatedAt)),
  );
  const ageMs = Date.parse(input.generatedAt) - latest;
  return ageMs > METRIC_FRESHNESS_THRESHOLD_HOURS * 60 * 60 * 1000;
}

function reasonCodesFor(readiness: MetricReadiness): readonly MetricReasonCode[] {
  if (readiness === "invalid") {
    return ["INVALID_RECONCILIATION"];
  }

  if (readiness === "stale") {
    return ["STALE_CANONICAL_FACTS"];
  }

  return [];
}

function limitationsFor(readiness: MetricReadiness): readonly string[] {
  if (readiness === "invalid") {
    return ["Reconciliation mismatch blocks metric publication."];
  }

  if (readiness === "stale") {
    return ["Canonical facts exceed freshness threshold."];
  }

  if (readiness === "partial") {
    return ["Open data issues limit metric reliability."];
  }

  return [];
}

function unavailable(
  reason: Exclude<
    MetricReasonCode,
    | "INVALID_RECONCILIATION"
    | "MISSING_AD_SPEND"
    | "MISSING_COMMERCE_FACTS"
    | "MISSING_INVENTORY_FACTS"
    | "NO_DATA"
    | "STALE_CANONICAL_FACTS"
    | "UNAVAILABLE"
  >,
  limitation: string,
): CalculationResult {
  return {
    limitations: [limitation],
    readiness: "unavailable",
    reasonCodes: ["UNAVAILABLE", reason],
    value: null,
  };
}

function evidenceFor(
  metricCode: DashboardMetricCode,
  input: MetricEngineInput,
  facts: MetricFacts,
): readonly string[] {
  if (commerceOrderMetricCodes.includes(metricCode)) {
    return facts.commerceOrders.map((order) => `canonical_orders:${order.canonicalOrderId}`);
  }

  if (orderLineMetricCodes.includes(metricCode)) {
    return facts.orderLines.map((line) => `canonical_order_lines:${line.canonicalLineId}`);
  }

  if (refundMetricCodes.includes(metricCode)) {
    return facts.refunds.map((refund) => `canonical_refunds:${refund.canonicalRefundId}`);
  }

  if (inventoryMetricCodes.includes(metricCode)) {
    return facts.inventorySnapshots.map(
      (snapshot) => `canonical_inventory_snapshots:${snapshot.canonicalInventorySnapshotId}`,
    );
  }

  if (adMetricCodes.includes(metricCode)) {
    return facts.adSpend.map((spend) => `canonical_ad_spend:${spend.canonicalAdSpendId}`);
  }

  if (conversionMetricCodes.includes(metricCode)) {
    return facts.attributedConversions.map(
      (conversion) => `canonical_attributed_conversions:${conversion.attributedConversionId}`,
    );
  }

  return [`metric_input:${input.tenantId}:${input.workspaceId}`];
}

function definition(
  metricCode: DashboardMetricCode,
  unit: MetricValueKind,
  businessDefinition: string,
  formula: string,
  requiredCanonicalFacts: readonly string[],
  expectedValue: string,
): MetricDefinitionRecord {
  return {
    businessDefinition,
    currencyPolicy: unit === "money" ? "PLN local/CI; no FX conversion in Prompt 7." : "not_applicable",
    datePolicy: "Facts are included when their business timestamp is inside [periodStart, periodEnd).",
    definitionVersion: METRIC_DEFINITION_VERSION,
    // Mirrors `REVENUE_EXCLUDED_ORDER_STATUSES` exactly (single source of
    // truth) -- this used to be a hardcoded, disconnected list that didn't
    // match what `createMetricFacts` actually filtered.
    excludedStatuses: [...REVENUE_EXCLUDED_ORDER_STATUSES],
    formula,
    // "completed" is the only WooCommerce order status empirically proven
    // qualifying via live reconciliation (see `isRevenueQualifyingOrder`);
    // this is a known-good example, not an exhaustive allow-list -- the
    // real filter is exclude-based, so any status not in `excludedStatuses`
    // still qualifies.
    includedStatuses: ["completed"],
    metricCode,
    missingDataPolicy: "Missing required facts produce no_data; blocked prerequisites produce unavailable.",
    readinessRule: "ready only when canonical facts are fresh, valid and without open data issues.",
    refundPolicy: "return_value, return_rate_orders, return_rate_units and returned_units are computed over ALL refunds in the period, regardless of their order's revenue-qualifying status. revenue_after_refunds is the one exception: it subtracts only refunds whose order is still revenue-qualifying (present in commerceOrders); a refund against an order already excluded by status (e.g. fully refunded) is not subtracted again there, to avoid double-decrementing revenue. Ad attributed revenue is not store revenue.",
    requiredCanonicalFacts,
    taxPolicy: "gross values include tax when provider gross amount includes tax; no inferred tax in Prompt 7.",
    testVectors: [
      {
        expectedReadiness: "ready",
        expectedValue,
        name: "prompt7-ready-fixture",
      },
    ],
    unit,
  };
}

function createReadyIntegrationSnapshot(
  tenantId: string,
  workspaceId: string,
): IntegrationDataSnapshot {
  const runtime = createSandboxIntegrationDataRuntime();
  runtime.selectPrimaryInventorySource({
    providerId: "woocommerce",
    tenantId,
    workspaceId,
  });

  for (const providerId of integrationProviderIds) {
    const { accounts, connection } = runtime.connect({
      providerId,
      tenantId,
      workspaceId,
    });
    const [account] = accounts;

    if (!account) {
      continue;
    }

    const selectedConnection = runtime.selectAccount({
      accountId: account.accountId,
      connectionId: connection.connectionId,
    });
    runtime.initialSync(selectedConnection.connectionId);
  }

  return runtime.getSnapshot();
}

function partialDataIssue(
  tenantId: string,
  workspaceId: string,
  generatedAt: IsoDateTime,
): DataIssueRecord {
  return {
    code: "PARTIAL_SYNC_FAILURE",
    createdAt: generatedAt,
    issueId: "data_issue_prompt7_partial",
    message: "Prompt 7 partial data issue.",
    severity: "warning",
    sourceRecordId: null,
    status: "open",
    tenantId,
    workspaceId,
  };
}

function primaryInventorySource(
  tenantId: string,
  workspaceId: string,
  providerId: "allegro" | "woocommerce",
  selectedAt: IsoDateTime,
): PrimaryInventorySourceRecord {
  return {
    providerId,
    selectedAt,
    tenantId,
    workspaceId,
  };
}

function invalidReconciliationReport(
  tenantId: string,
  workspaceId: string,
  generatedAt: IsoDateTime,
): ReconciliationReportRecord {
  return {
    createdAt: generatedAt,
    details: ["source_to_snapshot_mismatch"],
    metricCodes: dashboardMetricCodes,
    reconciliationReportId: "reconciliation_prompt7_invalid",
    status: "mismatch",
    tenantId,
    workspaceId,
  };
}

function isInPeriod(value: IsoDateTime, periodStart: IsoDateTime, periodEnd: IsoDateTime): boolean {
  const time = Date.parse(value);
  return time >= Date.parse(periodStart) && time < Date.parse(periodEnd);
}

function isDateInPeriod(
  value: string,
  periodStart: IsoDateTime,
  periodEnd: IsoDateTime,
  timezone: string,
): boolean {
  const startMs = Date.parse(periodStart);
  const endMs = Date.parse(periodEnd);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return false;
  }

  const normalizedTimeZone = normalizeSeriesTimeZone(timezone);
  const firstDate = localDateOnlyForInstant(startMs, normalizedTimeZone);
  const lastDate = localDateOnlyForInstant(endMs - 1, normalizedTimeZone);
  return value >= firstDate && value <= lastDate;
}

function decimalToCents(value: string): bigint {
  const sign = value.startsWith("-") ? -1n : 1n;
  const normalized = sign < 0n ? value.slice(1) : value;
  const [units = "0", cents = ""] = normalized.split(".");
  const paddedCents = `${cents}00`.slice(0, 2);
  return sign * (BigInt(units) * 100n + BigInt(paddedCents));
}

function centsToDecimal(value: bigint): string {
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const units = absolute / 100n;
  const cents = (absolute % 100n).toString().padStart(2, "0");
  return `${sign}${units}.${cents}`;
}

function divideCentsByInteger(value: bigint, divisor: number): string | null {
  if (divisor <= 0) {
    return null;
  }

  const divisorBigInt = BigInt(divisor);
  const rounded = value >= 0n
    ? (value + divisorBigInt / 2n) / divisorBigInt
    : (value - divisorBigInt / 2n) / divisorBigInt;
  return centsToDecimal(rounded);
}

function sumMoney(values: readonly string[]): bigint {
  return values.reduce((sum, value) => sum + decimalToCents(value), 0n);
}

function sumQuantities(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

function sumIntegers(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

function integerString(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(4);
}

function ratio(numerator: number, denominator: number): string | null {
  if (denominator <= 0) {
    return null;
  }

  return (numerator / denominator).toFixed(4);
}

function ratioCents(numerator: bigint, denominator: bigint): string | null {
  if (denominator === 0n) {
    return null;
  }

  const scaled = numerator * 10_000n;
  const rounded = (scaled + denominator / 2n) / denominator;
  const units = rounded / 10_000n;
  const fractional = (rounded % 10_000n).toString().padStart(4, "0");
  return `${units}.${fractional}`;
}

function periodDayCount(
  periodStart: IsoDateTime,
  periodEnd: IsoDateTime,
  timezone: string,
): number {
  const startMs = Date.parse(periodStart);
  const endMs = Date.parse(periodEnd);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) {
    return 1;
  }

  const normalizedTimeZone = normalizeSeriesTimeZone(timezone);
  let date = localDateOnlyForInstant(startMs, normalizedTimeZone);
  const lastDate = localDateOnlyForInstant(endMs - 1, normalizedTimeZone);
  let dayEquivalents = 0;

  /*
   * Count elapsed local-calendar-day equivalents rather than the number of
   * calendar labels touched by the interval.
   *
   * Examples:
   * - 48 elapsed hours in a normal Warsaw week = 2 day equivalents, even
   *   when the UTC interval touches three local calendar dates.
   * - two complete local days across DST = 2 day equivalents although their
   *   absolute duration can be 47 or 49 hours.
   * - a partial local day contributes only its proportional fraction.
   */
  for (let index = 0; index < 4_000; index += 1) {
    const nextDate = addCalendarDays(date, 1);
    const localDayStartMs = localMidnightMs(date, normalizedTimeZone);
    const localDayEndMs = localMidnightMs(nextDate, normalizedTimeZone);
    const localDayDurationMs = localDayEndMs - localDayStartMs;

    const overlapStartMs = Math.max(startMs, localDayStartMs);
    const overlapEndMs = Math.min(endMs, localDayEndMs);
    const overlapDurationMs = Math.max(0, overlapEndMs - overlapStartMs);

    if (localDayDurationMs > 0 && overlapDurationMs > 0) {
      dayEquivalents += overlapDurationMs / localDayDurationMs;
    }

    if (date === lastDate) {
      break;
    }

    date = nextDate;
  }

  return dayEquivalents > 0 ? dayEquivalents : 1;
}

function stockoutRisk(
  availableStock: number,
  unitsSold: number,
  periodDays: number,
): string | null {
  if (unitsSold <= 0) {
    return null;
  }

  const days = availableStock / (unitsSold / periodDays);

  if (days <= 3) {
    return "CRITICAL";
  }

  if (days <= 7) {
    return "HIGH";
  }

  if (days <= 14) {
    return "MEDIUM";
  }

  return "LOW";
}

function inputHash(input: MetricEngineInput, metricCode: DashboardMetricCode): string {
  const parts = [
    METRIC_CATALOG_VERSION,
    METRIC_ENGINE_POLICY_VERSION,
    input.tenantId,
    input.workspaceId,
    input.periodStart,
    input.periodEnd,
    metricCode,
    ...input.canonicalOrders.map((order) => order.canonicalOrderId),
    ...input.canonicalOrderLines.map((line) => line.canonicalLineId),
    ...input.canonicalRefunds.map((refund) => refund.canonicalRefundId),
    ...input.canonicalAdSpend.map((spend) => spend.canonicalAdSpendId),
  ];
  let hash = 2166136261;

  for (const char of parts.join("|")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return `fnv1a_${(hash >>> 0).toString(16)}`;
}

function aggregateReadiness(readinessValues: readonly MetricReadiness[]): MetricReadiness {
  if (!readinessValues.length) {
    return "no_data";
  }

  for (const status of ["invalid", "unavailable", "stale", "partial", "no_data"] as const) {
    if (readinessValues.includes(status)) {
      return status;
    }
  }

  return "ready";
}

function uniqueMetricCodes(values: readonly DashboardMetricCode[]): readonly DashboardMetricCode[] {
  return dashboardMetricCodes.filter((code) => values.includes(code));
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

function scopeKey(tenantId: string, workspaceId: string): string {
  return `${tenantId}:${workspaceId}`;
}

const readyProductCosts = [
  {
    currency: "PLN",
    sku: "PAPA-MUG",
    unitCostAmount: "70.00",
  },
] as const satisfies readonly ProductCostRecord[];

const commerceOrderMetricCodes: readonly DashboardMetricCode[] = [
  "aov",
  "cost_per_order",
  "gross_order_value",
  "orders",
  "return_rate_orders",
  "revenue_after_refunds",
] as const;

const orderLineMetricCodes: readonly DashboardMetricCode[] = [
  "days_of_inventory",
  "inventory_turnover",
  "product_contribution",
  "product_margin",
  "product_revenue",
  "product_units",
  "return_rate_units",
  "sell_through_rate",
  "stockout_risk",
  "units_sold",
] as const;

const refundMetricCodes: readonly DashboardMetricCode[] = [
  "return_rate_orders",
  "return_rate_units",
  "return_value",
  "returned_units",
  "revenue_after_refunds",
] as const;

const inventoryMetricCodes: readonly DashboardMetricCode[] = [
  "available_stock",
  "days_of_inventory",
  "inventory_turnover",
  "sell_through_rate",
  "stock_value",
  "stockout_risk",
] as const;

const adMetricCodes: readonly DashboardMetricCode[] = [
  "ad_spend",
  "cost_per_order",
  "cpc",
  "cpm",
  "ctr",
  "product_contribution",
  "roas",
] as const;

const conversionMetricCodes: readonly DashboardMetricCode[] = [
  "platform_attributed_conversions",
  "platform_attributed_revenue",
  "roas",
] as const;

const productMappingMetricCodes: readonly DashboardMetricCode[] = [
  "product_contribution",
  "product_margin",
  "product_revenue",
  "product_units",
] as const;

const costMetricCodes: readonly DashboardMetricCode[] = [
  "product_contribution",
  "product_margin",
  "stock_value",
] as const;
