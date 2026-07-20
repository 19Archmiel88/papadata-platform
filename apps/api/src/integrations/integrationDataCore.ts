import type { IsoDateTime } from "@papadata/contracts";

export const INTEGRATION_DATA_CONTRACT_VERSION = "integration-data.v1";
export const FUZZY_MATCHING_POLICY_VERSION = "fuzzy.manual-review.2026-07";
export const PRODUCT_MAPPING_POLICY_VERSION = "product-mapping.2026-07";
export const SALES_AUTHORITY_VERSION = "authority.sales-facts.2026-07";
export const ADS_AUTHORITY_VERSION = "authority.ads-cost-attribution.2026-07";

export const integrationProviderIds = [
  "woocommerce",
  "allegro",
  "google_ads",
  "meta_ads",
] as const;

export type IntegrationProviderId = (typeof integrationProviderIds)[number];

export const salesProviderIds = ["woocommerce", "allegro"] as const;

export const adsProviderIds = ["google_ads", "meta_ads"] as const;

export const requiredSandboxAdapterOperations = [
  "account_selection",
  "backfill",
  "checkpoint",
  "connect",
  "disconnect",
  "incremental_sync",
  "initial_sync",
  "partial_success",
  "rate_limit",
  "reauthorize",
  "recovery",
  "retry",
] as const;

export type SandboxAdapterOperation =
  (typeof requiredSandboxAdapterOperations)[number];

export type IntegrationStream =
  | "ad_spend"
  | "attributed_conversions"
  | "inventory"
  | "orders"
  | "products"
  | "refunds";

export type IntegrationConnectionStatus =
  | "account_selection_required"
  | "active"
  | "disconnected"
  | "reauthorization_required";

export type SyncJobKind = "backfill" | "incremental_sync" | "initial_sync" | "recovery" | "retry";

export type SyncJobStatus =
  | "partial_success"
  | "rate_limited"
  | "recovered"
  | "running"
  | "succeeded";

export type ProductMappingMethod =
  | "catalog"
  | "ean"
  | "exact_match"
  | "fuzzy_manual_review"
  | "manual"
  | "sku";

export type DataIssueCode =
  | "FUZZY_MATCH_REQUIRES_MANUAL_APPROVAL"
  | "PARTIAL_SYNC_FAILURE"
  | "RATE_LIMITED"
  | "UNMAPPED_PRODUCT";

export type QualityAssessmentStatus = "partial" | "passed";

export type ReadinessAssessmentStatus = "partial" | "ready" | "retry_wait";

export type IntegrationConnectionRecord = {
  readonly accountName: string | null;
  readonly availableAccounts: readonly SandboxAccount[];
  readonly connectedAt: IsoDateTime;
  readonly connectionId: string;
  readonly credentialRef: string | null;
  readonly disconnectedAt: IsoDateTime | null;
  readonly externalAccountId: string | null;
  readonly providerId: IntegrationProviderId;
  readonly reauthorizedAt: IsoDateTime | null;
  readonly status: IntegrationConnectionStatus;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type SandboxAccount = {
  readonly accountId: string;
  readonly displayName: string;
};

export type SyncJobRecord = {
  readonly attempts: number;
  readonly completedAt: IsoDateTime | null;
  readonly connectionId: string;
  readonly createdAt: IsoDateTime;
  readonly jobId: string;
  readonly kind: SyncJobKind;
  readonly parentJobId: string | null;
  readonly providerId: IntegrationProviderId;
  readonly retryAfterSeconds: number | null;
  readonly status: SyncJobStatus;
  readonly streams: readonly IntegrationStream[];
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type SyncCheckpointRecord = {
  readonly checkpointId: string;
  readonly connectionId: string;
  readonly cursor: string;
  readonly providerId: IntegrationProviderId;
  readonly stream: IntegrationStream;
  readonly tenantId: string;
  readonly updatedAt: IsoDateTime;
  readonly watermark: IsoDateTime;
  readonly workspaceId: string;
};

export type SourceBatchRecord = {
  readonly batchId: string;
  readonly connectionId: string;
  readonly createdAt: IsoDateTime;
  readonly jobId: string;
  readonly providerId: IntegrationProviderId;
  readonly recordCount: number;
  readonly status: "partial" | "success";
  readonly stream: IntegrationStream;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type SourceRecordPayload =
  | AdSpendPayload
  | AttributedConversionPayload
  | InventoryPayload
  | OrderPayload
  | ProductPayload
  | RefundPayload;

export type SourceRecordRecord = {
  readonly batchId: string;
  readonly connectionId: string;
  readonly externalId: string;
  readonly fingerprint: string;
  readonly ingestedAt: IsoDateTime;
  readonly payload: SourceRecordPayload;
  readonly providerId: IntegrationProviderId;
  readonly sourceRecordId: string;
  readonly stream: IntegrationStream;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type NormalizedRecordRecord = {
  readonly externalId: string;
  readonly normalizedAt: IsoDateTime;
  readonly normalizedRecordId: string;
  readonly payload: SourceRecordPayload;
  readonly providerId: IntegrationProviderId;
  readonly sourceRecordId: string;
  readonly stream: IntegrationStream;
  readonly tenantId: string;
  readonly validationStatus: "partial" | "valid";
  readonly workspaceId: string;
};

export type CanonicalProductRecord = {
  readonly canonicalProductId: string;
  readonly catalogId: string | null;
  readonly createdAt: IsoDateTime;
  readonly ean: string | null;
  readonly name: string;
  readonly sku: string | null;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalProductVariantRecord = {
  readonly canonicalProductId: string;
  readonly canonicalVariantId: string;
  readonly name: string;
  readonly sku: string | null;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type ExternalProductMappingRecord = {
  readonly approvedAt: IsoDateTime | null;
  readonly canonicalProductId: string;
  readonly confidence: "high" | "manual_review_required";
  readonly externalProductId: string;
  readonly mappingId: string;
  readonly method: ProductMappingMethod;
  readonly policyVersion: typeof PRODUCT_MAPPING_POLICY_VERSION;
  readonly providerId: IntegrationProviderId;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalOrderRecord = {
  readonly canonicalOrderId: string;
  readonly currency: string;
  readonly externalOrderId: string;
  readonly grossAmount: string;
  readonly orderNumber: string;
  readonly orderedAt: IsoDateTime;
  readonly providerId: "allegro" | "woocommerce";
  readonly sourceAuthorityVersion: typeof SALES_AUTHORITY_VERSION;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalOrderLineRecord = {
  readonly canonicalLineId: string;
  readonly canonicalOrderId: string;
  readonly canonicalProductId: string | null;
  readonly grossAmount: string;
  readonly quantity: number;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalPaymentRecord = {
  readonly amount: string;
  readonly canonicalOrderId: string;
  readonly canonicalPaymentId: string;
  readonly currency: string;
  readonly paidAt: IsoDateTime;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalRefundRecord = {
  readonly amount: string;
  readonly canonicalOrderId: string | null;
  readonly canonicalRefundId: string;
  readonly currency: string;
  readonly externalRefundId: string;
  readonly providerId: "allegro" | "woocommerce";
  readonly refundedAt: IsoDateTime;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalCustomerReturnRecord = {
  readonly canonicalReturnId: string;
  readonly externalRefundId: string;
  readonly reason: string;
  readonly returnedQuantity: number;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalInventorySnapshotRecord = {
  readonly canonicalInventorySnapshotId: string;
  readonly canonicalProductId: string | null;
  readonly externalProductId: string;
  readonly providerId: "allegro" | "woocommerce";
  readonly quantityAvailable: number;
  readonly snapshotAt: IsoDateTime;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalAdSpendRecord = {
  readonly canonicalAdSpendId: string;
  readonly campaignId: string;
  readonly clicks: number;
  readonly costAmount: string;
  readonly currency: string;
  readonly date: string;
  readonly impressions: number;
  readonly providerId: "google_ads" | "meta_ads";
  readonly sourceAuthorityVersion: typeof ADS_AUTHORITY_VERSION;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalAttributedConversionRecord = {
  readonly attributedConversionId: string;
  readonly attributedValueAmount: string;
  readonly campaignId: string;
  readonly conversionTime: IsoDateTime;
  readonly currency: string;
  readonly externalConversionId: string;
  readonly providerId: "google_ads" | "meta_ads";
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalLineageRecord = {
  readonly canonicalRecordId: string;
  readonly canonicalTable: CanonicalTableName;
  readonly lineageId: string;
  readonly sourceRecordId: string;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type CanonicalTableName =
  | "canonical_ad_spend"
  | "canonical_attributed_conversions"
  | "canonical_customer_returns"
  | "canonical_inventory_snapshots"
  | "canonical_order_lines"
  | "canonical_orders"
  | "canonical_payments"
  | "canonical_product_variants"
  | "canonical_products"
  | "canonical_refunds";

export type DataIssueRecord = {
  readonly code: DataIssueCode;
  readonly createdAt: IsoDateTime;
  readonly issueId: string;
  readonly message: string;
  readonly severity: "error" | "warning";
  readonly sourceRecordId: string | null;
  readonly status: "open" | "resolved";
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type QualityAssessmentRecord = {
  readonly assessedAt: IsoDateTime;
  readonly issueCount: number;
  readonly qualityAssessmentId: string;
  readonly status: QualityAssessmentStatus;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type ReadinessAssessmentRecord = {
  readonly assessedAt: IsoDateTime;
  readonly limitations: readonly string[];
  readonly readinessAssessmentId: string;
  readonly status: ReadinessAssessmentStatus;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type ProductPayload = {
  readonly catalogId: string | null;
  readonly ean: string | null;
  readonly externalProductId: string;
  readonly name: string;
  readonly sku: string | null;
  readonly variantName: string;
};

export type OrderPayload = {
  readonly currency: string;
  readonly externalOrderId: string;
  readonly grossAmount: string;
  readonly lines: readonly OrderLinePayload[];
  readonly orderNumber: string;
  readonly orderedAt: IsoDateTime;
  readonly paymentAmount: string;
  readonly paymentTime: IsoDateTime;
};

export type OrderLinePayload = {
  readonly catalogId: string | null;
  readonly ean: string | null;
  readonly externalProductId: string;
  readonly grossAmount: string;
  readonly name: string;
  readonly quantity: number;
  readonly sku: string | null;
};

export type RefundPayload = {
  readonly amount: string;
  readonly currency: string;
  readonly externalRefundId: string;
  readonly orderNumber: string;
  readonly reason: string;
  readonly refundedAt: IsoDateTime;
  readonly returnedQuantity: number;
};

export type InventoryPayload = {
  readonly externalProductId: string;
  readonly quantityAvailable: number;
  readonly sku: string | null;
  readonly snapshotAt: IsoDateTime;
};

export type AdSpendPayload = {
  readonly campaignId: string;
  readonly clicks: number;
  readonly costAmount: string;
  readonly currency: string;
  readonly date: string;
  readonly impressions: number;
};

export type AttributedConversionPayload = {
  readonly attributedValueAmount: string;
  readonly campaignId: string;
  readonly conversionTime: IsoDateTime;
  readonly currency: string;
  readonly externalConversionId: string;
};

export type IntegrationDataSnapshot = {
  readonly canonicalAdSpend: readonly CanonicalAdSpendRecord[];
  readonly canonicalAttributedConversions: readonly CanonicalAttributedConversionRecord[];
  readonly canonicalCustomerReturns: readonly CanonicalCustomerReturnRecord[];
  readonly canonicalInventorySnapshots: readonly CanonicalInventorySnapshotRecord[];
  readonly canonicalLineage: readonly CanonicalLineageRecord[];
  readonly canonicalOrderLines: readonly CanonicalOrderLineRecord[];
  readonly canonicalOrders: readonly CanonicalOrderRecord[];
  readonly canonicalPayments: readonly CanonicalPaymentRecord[];
  readonly canonicalProductVariants: readonly CanonicalProductVariantRecord[];
  readonly canonicalProducts: readonly CanonicalProductRecord[];
  readonly canonicalRefunds: readonly CanonicalRefundRecord[];
  readonly dataIssues: readonly DataIssueRecord[];
  readonly externalProductMappings: readonly ExternalProductMappingRecord[];
  readonly integrationConnections: readonly IntegrationConnectionRecord[];
  readonly normalizedRecords: readonly NormalizedRecordRecord[];
  readonly primaryInventorySources: readonly PrimaryInventorySourceRecord[];
  readonly qualityAssessments: readonly QualityAssessmentRecord[];
  readonly readinessAssessments: readonly ReadinessAssessmentRecord[];
  readonly sourceBatches: readonly SourceBatchRecord[];
  readonly sourceRecords: readonly SourceRecordRecord[];
  readonly syncCheckpoints: readonly SyncCheckpointRecord[];
  readonly syncJobs: readonly SyncJobRecord[];
};

export type PrimaryInventorySourceRecord = {
  readonly providerId: "allegro" | "woocommerce";
  readonly selectedAt: IsoDateTime;
  readonly tenantId: string;
  readonly workspaceId: string;
};

export type FailurePlan = {
  readonly providerId: IntegrationProviderId;
  readonly stream?: IntegrationStream;
  readonly type: "partial_success" | "rate_limit" | "transient";
};

export type SandboxSyncPage =
  | {
      readonly items: readonly SandboxSourceItem[];
      readonly kind: "success";
      readonly nextCursor: string;
      readonly watermark: IsoDateTime;
    }
  | {
      readonly items: readonly SandboxSourceItem[];
      readonly kind: "partial_success";
      readonly message: string;
      readonly nextCursor: string;
      readonly watermark: IsoDateTime;
    }
  | {
      readonly kind: "rate_limit";
      readonly retryAfterSeconds: number;
    }
  | {
      readonly kind: "transient";
      readonly message: string;
    };

export type SandboxSourceItem = {
  readonly externalId: string;
  readonly payload: SourceRecordPayload;
};

export type SandboxIntegrationAdapter = {
  readonly providerId: IntegrationProviderId;
  readonly supportedOperations: readonly SandboxAdapterOperation[];
  accountSelection: (input: {
    readonly accountId: string;
  }) => SandboxAccount | undefined;
  backfill: () => readonly IntegrationStream[];
  checkpoint: (input: {
    readonly connection: IntegrationConnectionRecord;
    readonly stream: IntegrationStream;
  }) => string;
  connect: () => readonly SandboxAccount[];
  disconnect: (input: {
    readonly connection: IntegrationConnectionRecord;
  }) => { readonly disconnected: true };
  incrementalSync: () => readonly IntegrationStream[];
  initialSync: () => readonly IntegrationStream[];
  partialSuccess: (input: {
    readonly stream: IntegrationStream;
  }) => SandboxSyncPage;
  rateLimit: () => SandboxSyncPage;
  reauthorize: (input: {
    readonly connection: IntegrationConnectionRecord;
  }) => { readonly credentialRef: string };
  recovery: () => readonly IntegrationStream[];
  retry: (input: {
    readonly job: SyncJobRecord;
  }) => readonly IntegrationStream[];
  fetchPage: (input: {
    readonly kind: SyncJobKind;
    readonly stream: IntegrationStream;
  }) => SandboxSyncPage;
};

export class InMemoryIntegrationDataState {
  private readonly canonicalAdSpend = new Map<string, CanonicalAdSpendRecord>();

  private readonly canonicalAttributedConversions = new Map<string, CanonicalAttributedConversionRecord>();

  private readonly canonicalCustomerReturns = new Map<string, CanonicalCustomerReturnRecord>();

  private readonly canonicalInventorySnapshots = new Map<string, CanonicalInventorySnapshotRecord>();

  private readonly canonicalLineage = new Map<string, CanonicalLineageRecord>();

  private readonly canonicalOrderLines = new Map<string, CanonicalOrderLineRecord>();

  private readonly canonicalOrders = new Map<string, CanonicalOrderRecord>();

  private readonly canonicalPayments = new Map<string, CanonicalPaymentRecord>();

  private readonly canonicalProductVariants = new Map<string, CanonicalProductVariantRecord>();

  private readonly canonicalProducts = new Map<string, CanonicalProductRecord>();

  private readonly canonicalRefunds = new Map<string, CanonicalRefundRecord>();

  private readonly dataIssues = new Map<string, DataIssueRecord>();

  private readonly externalProductMappings = new Map<string, ExternalProductMappingRecord>();

  private readonly integrationConnections = new Map<string, IntegrationConnectionRecord>();

  private readonly normalizedRecords = new Map<string, NormalizedRecordRecord>();

  private readonly primaryInventorySources = new Map<string, PrimaryInventorySourceRecord>();

  private readonly qualityAssessments = new Map<string, QualityAssessmentRecord>();

  private readonly readinessAssessments = new Map<string, ReadinessAssessmentRecord>();

  private readonly sourceBatches = new Map<string, SourceBatchRecord>();

  private readonly sourceRecords = new Map<string, SourceRecordRecord>();

  private readonly sourceRecordFingerprintIndex = new Map<string, string>();

  private readonly syncCheckpoints = new Map<string, SyncCheckpointRecord>();

  private readonly syncJobs = new Map<string, SyncJobRecord>();

  findConnection(connectionId: string): IntegrationConnectionRecord | undefined {
    return this.integrationConnections.get(connectionId);
  }

  saveConnection(connection: IntegrationConnectionRecord): void {
    this.integrationConnections.set(connection.connectionId, connection);
  }

  findJob(jobId: string): SyncJobRecord | undefined {
    return this.syncJobs.get(jobId);
  }

  saveJob(job: SyncJobRecord): void {
    this.syncJobs.set(job.jobId, job);
  }

  findCheckpoint(
    tenantId: string,
    workspaceId: string,
    providerId: IntegrationProviderId,
    stream: IntegrationStream,
  ): SyncCheckpointRecord | undefined {
    return this.syncCheckpoints.get(checkpointKey(tenantId, workspaceId, providerId, stream));
  }

  saveCheckpoint(checkpoint: SyncCheckpointRecord): void {
    this.syncCheckpoints.set(
      checkpointKey(
        checkpoint.tenantId,
        checkpoint.workspaceId,
        checkpoint.providerId,
        checkpoint.stream,
      ),
      checkpoint,
    );
  }

  saveBatch(batch: SourceBatchRecord): void {
    this.sourceBatches.set(batch.batchId, batch);
  }

  findSourceRecordByFingerprint(fingerprint: string): SourceRecordRecord | undefined {
    const existingId = this.sourceRecordFingerprintIndex.get(fingerprint);
    return existingId ? this.sourceRecords.get(existingId) : undefined;
  }

  saveSourceRecord(record: SourceRecordRecord): SourceRecordRecord {
    const existing = this.findSourceRecordByFingerprint(record.fingerprint);

    if (existing) {
      return existing;
    }

    this.sourceRecords.set(record.sourceRecordId, record);
    this.sourceRecordFingerprintIndex.set(record.fingerprint, record.sourceRecordId);
    return record;
  }

  saveNormalizedRecord(record: NormalizedRecordRecord): NormalizedRecordRecord {
    const existing = [...this.normalizedRecords.values()].find(
      (item) => item.sourceRecordId === record.sourceRecordId,
    );

    if (existing) {
      return existing;
    }

    this.normalizedRecords.set(record.normalizedRecordId, record);
    return record;
  }

  findCanonicalProductByExternalMapping(
    tenantId: string,
    workspaceId: string,
    providerId: IntegrationProviderId,
    externalProductId: string,
  ): CanonicalProductRecord | undefined {
    const mapping = this.externalProductMappings.get(
      productMappingKey(tenantId, workspaceId, providerId, externalProductId),
    );
    return mapping ? this.canonicalProducts.get(mapping.canonicalProductId) : undefined;
  }

  findCanonicalProductBySku(
    tenantId: string,
    workspaceId: string,
    sku: string | null,
  ): CanonicalProductRecord | undefined {
    if (!sku) {
      return undefined;
    }

    return [...this.canonicalProducts.values()].find(
      (product) =>
        product.tenantId === tenantId &&
        product.workspaceId === workspaceId &&
        product.sku === sku,
    );
  }

  findCanonicalProductByEan(
    tenantId: string,
    workspaceId: string,
    ean: string | null,
  ): CanonicalProductRecord | undefined {
    if (!ean) {
      return undefined;
    }

    return [...this.canonicalProducts.values()].find(
      (product) =>
        product.tenantId === tenantId &&
        product.workspaceId === workspaceId &&
        product.ean === ean,
    );
  }

  findCanonicalProductByCatalog(
    tenantId: string,
    workspaceId: string,
    catalogId: string | null,
  ): CanonicalProductRecord | undefined {
    if (!catalogId) {
      return undefined;
    }

    return [...this.canonicalProducts.values()].find(
      (product) =>
        product.tenantId === tenantId &&
        product.workspaceId === workspaceId &&
        product.catalogId === catalogId,
    );
  }

  findCanonicalProductByName(
    tenantId: string,
    workspaceId: string,
    name: string,
  ): CanonicalProductRecord | undefined {
    const normalized = normalizeProductName(name);
    return [...this.canonicalProducts.values()].find(
      (product) =>
        product.tenantId === tenantId &&
        product.workspaceId === workspaceId &&
        normalizeProductName(product.name) === normalized,
    );
  }

  findFuzzyProductCandidate(
    tenantId: string,
    workspaceId: string,
    name: string,
  ): CanonicalProductRecord | undefined {
    const normalized = normalizeProductName(name);
    return [...this.canonicalProducts.values()].find(
      (product) =>
        product.tenantId === tenantId &&
        product.workspaceId === workspaceId &&
        levenshteinDistance(normalizeProductName(product.name), normalized) <= 2,
    );
  }

  saveCanonicalProduct(product: CanonicalProductRecord): CanonicalProductRecord {
    const existing = this.canonicalProducts.get(product.canonicalProductId);

    if (existing) {
      return existing;
    }

    this.canonicalProducts.set(product.canonicalProductId, product);
    return product;
  }

  saveCanonicalProductVariant(variant: CanonicalProductVariantRecord): CanonicalProductVariantRecord {
    const existing = [...this.canonicalProductVariants.values()].find(
      (item) =>
        item.tenantId === variant.tenantId &&
        item.workspaceId === variant.workspaceId &&
        item.canonicalProductId === variant.canonicalProductId &&
        item.sku === variant.sku,
    );

    if (existing) {
      return existing;
    }

    this.canonicalProductVariants.set(variant.canonicalVariantId, variant);
    return variant;
  }

  saveExternalProductMapping(mapping: ExternalProductMappingRecord): ExternalProductMappingRecord {
    const key = productMappingKey(
      mapping.tenantId,
      mapping.workspaceId,
      mapping.providerId,
      mapping.externalProductId,
    );
    const existing = this.externalProductMappings.get(key);

    if (existing) {
      return existing;
    }

    this.externalProductMappings.set(key, mapping);
    return mapping;
  }

  findCanonicalOrder(
    tenantId: string,
    workspaceId: string,
    providerId: "allegro" | "woocommerce",
    orderNumber: string,
  ): CanonicalOrderRecord | undefined {
    return this.canonicalOrders.get(orderKey(tenantId, workspaceId, providerId, orderNumber));
  }

  saveCanonicalOrder(order: CanonicalOrderRecord): CanonicalOrderRecord {
    const key = orderKey(order.tenantId, order.workspaceId, order.providerId, order.orderNumber);
    const existing = this.canonicalOrders.get(key);

    if (existing) {
      return existing;
    }

    this.canonicalOrders.set(key, order);
    return order;
  }

  saveCanonicalOrderLine(line: CanonicalOrderLineRecord): CanonicalOrderLineRecord {
    const existing = [...this.canonicalOrderLines.values()].find(
      (item) =>
        item.tenantId === line.tenantId &&
        item.workspaceId === line.workspaceId &&
        item.canonicalOrderId === line.canonicalOrderId &&
        item.canonicalProductId === line.canonicalProductId,
    );

    if (existing) {
      return existing;
    }

    this.canonicalOrderLines.set(line.canonicalLineId, line);
    return line;
  }

  saveCanonicalPayment(payment: CanonicalPaymentRecord): CanonicalPaymentRecord {
    const existing = [...this.canonicalPayments.values()].find(
      (item) =>
        item.tenantId === payment.tenantId &&
        item.workspaceId === payment.workspaceId &&
        item.canonicalOrderId === payment.canonicalOrderId,
    );

    if (existing) {
      return existing;
    }

    this.canonicalPayments.set(payment.canonicalPaymentId, payment);
    return payment;
  }

  saveCanonicalRefund(refund: CanonicalRefundRecord): CanonicalRefundRecord {
    const key = refundKey(refund.tenantId, refund.workspaceId, refund.providerId, refund.externalRefundId);
    const existing = this.canonicalRefunds.get(key);

    if (existing) {
      return existing;
    }

    this.canonicalRefunds.set(key, refund);
    return refund;
  }

  saveCanonicalCustomerReturn(returnRecord: CanonicalCustomerReturnRecord): CanonicalCustomerReturnRecord {
    const key = `${returnRecord.tenantId}:${returnRecord.workspaceId}:${returnRecord.externalRefundId}`;
    const existing = this.canonicalCustomerReturns.get(key);

    if (existing) {
      return existing;
    }

    this.canonicalCustomerReturns.set(key, returnRecord);
    return returnRecord;
  }

  saveCanonicalInventorySnapshot(snapshot: CanonicalInventorySnapshotRecord): CanonicalInventorySnapshotRecord {
    const key = `${snapshot.tenantId}:${snapshot.workspaceId}:${snapshot.providerId}:${snapshot.externalProductId}:${snapshot.snapshotAt}`;
    const existing = this.canonicalInventorySnapshots.get(key);

    if (existing) {
      return existing;
    }

    this.canonicalInventorySnapshots.set(key, snapshot);
    return snapshot;
  }

  saveCanonicalAdSpend(spend: CanonicalAdSpendRecord): CanonicalAdSpendRecord {
    const key = `${spend.tenantId}:${spend.workspaceId}:${spend.providerId}:${spend.campaignId}:${spend.date}`;
    const existing = this.canonicalAdSpend.get(key);

    if (existing) {
      return existing;
    }

    this.canonicalAdSpend.set(key, spend);
    return spend;
  }

  saveCanonicalAttributedConversion(
    conversion: CanonicalAttributedConversionRecord,
  ): CanonicalAttributedConversionRecord {
    const key = `${conversion.tenantId}:${conversion.workspaceId}:${conversion.providerId}:${conversion.externalConversionId}`;
    const existing = this.canonicalAttributedConversions.get(key);

    if (existing) {
      return existing;
    }

    this.canonicalAttributedConversions.set(key, conversion);
    return conversion;
  }

  saveLineage(lineage: CanonicalLineageRecord): void {
    const key = `${lineage.canonicalTable}:${lineage.canonicalRecordId}:${lineage.sourceRecordId}`;
    this.canonicalLineage.set(key, lineage);
  }

  saveDataIssue(issue: DataIssueRecord): void {
    this.dataIssues.set(issue.issueId, issue);
  }

  saveQualityAssessment(assessment: QualityAssessmentRecord): void {
    this.qualityAssessments.set(assessment.qualityAssessmentId, assessment);
  }

  saveReadinessAssessment(assessment: ReadinessAssessmentRecord): void {
    this.readinessAssessments.set(assessment.readinessAssessmentId, assessment);
  }

  savePrimaryInventorySource(source: PrimaryInventorySourceRecord): void {
    this.primaryInventorySources.set(scopeKey(source.tenantId, source.workspaceId), source);
  }

  findPrimaryInventorySource(
    tenantId: string,
    workspaceId: string,
  ): PrimaryInventorySourceRecord | undefined {
    return this.primaryInventorySources.get(scopeKey(tenantId, workspaceId));
  }

  snapshot(): IntegrationDataSnapshot {
    return {
      canonicalAdSpend: [...this.canonicalAdSpend.values()],
      canonicalAttributedConversions: [...this.canonicalAttributedConversions.values()],
      canonicalCustomerReturns: [...this.canonicalCustomerReturns.values()],
      canonicalInventorySnapshots: [...this.canonicalInventorySnapshots.values()],
      canonicalLineage: [...this.canonicalLineage.values()],
      canonicalOrderLines: [...this.canonicalOrderLines.values()],
      canonicalOrders: [...this.canonicalOrders.values()],
      canonicalPayments: [...this.canonicalPayments.values()],
      canonicalProductVariants: [...this.canonicalProductVariants.values()],
      canonicalProducts: [...this.canonicalProducts.values()],
      canonicalRefunds: [...this.canonicalRefunds.values()],
      dataIssues: [...this.dataIssues.values()],
      externalProductMappings: [...this.externalProductMappings.values()],
      integrationConnections: [...this.integrationConnections.values()],
      normalizedRecords: [...this.normalizedRecords.values()],
      primaryInventorySources: [...this.primaryInventorySources.values()],
      qualityAssessments: [...this.qualityAssessments.values()],
      readinessAssessments: [...this.readinessAssessments.values()],
      sourceBatches: [...this.sourceBatches.values()],
      sourceRecords: [...this.sourceRecords.values()],
      syncCheckpoints: [...this.syncCheckpoints.values()],
      syncJobs: [...this.syncJobs.values()],
    };
  }
}

export class SandboxIntegrationDataService {
  private readonly adapters: ReadonlyMap<IntegrationProviderId, SandboxIntegrationAdapter>;

  private readonly failurePlan: FailurePlan[];

  private readonly idSource: IdSource;

  private readonly now: () => Date;

  private readonly state: InMemoryIntegrationDataState;

  constructor(options: {
    readonly failurePlan?: readonly FailurePlan[];
    readonly idSource?: IdSource;
    readonly now?: () => Date;
    readonly state?: InMemoryIntegrationDataState;
  } = {}) {
    this.idSource = options.idSource ?? new IdSource();
    this.now = options.now ?? (() => new Date("2026-07-20T00:00:00.000Z"));
    this.state = options.state ?? new InMemoryIntegrationDataState();
    this.failurePlan = [...(options.failurePlan ?? [])];
    this.adapters = new Map(
      integrationProviderIds.map((providerId) => [
        providerId,
        createSandboxAdapter(providerId, this.idSource),
      ]),
    );
  }

  getAdapter(providerId: IntegrationProviderId): SandboxIntegrationAdapter {
    return this.requireAdapter(providerId);
  }

  getSnapshot(): IntegrationDataSnapshot {
    return this.state.snapshot();
  }

  connect(input: {
    readonly providerId: IntegrationProviderId;
    readonly tenantId: string;
    readonly workspaceId: string;
  }): {
    readonly accounts: readonly SandboxAccount[];
    readonly connection: IntegrationConnectionRecord;
  } {
    const adapter = this.requireAdapter(input.providerId);
    const accounts = adapter.connect();
    const connection: IntegrationConnectionRecord = {
      accountName: null,
      availableAccounts: accounts,
      connectedAt: toIso(this.now()),
      connectionId: this.idSource.next("conn"),
      credentialRef: null,
      disconnectedAt: null,
      externalAccountId: null,
      providerId: input.providerId,
      reauthorizedAt: null,
      status: "account_selection_required",
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    };
    this.state.saveConnection(connection);
    return { accounts, connection };
  }

  selectAccount(input: {
    readonly accountId: string;
    readonly connectionId: string;
  }): IntegrationConnectionRecord {
    const connection = this.requireConnection(input.connectionId);
    const account = this.requireAdapter(connection.providerId).accountSelection({
      accountId: input.accountId,
    });

    if (!account) {
      throw new Error("Sandbox account was not found.");
    }

    const updatedConnection: IntegrationConnectionRecord = {
      ...connection,
      accountName: account.displayName,
      credentialRef: this.idSource.next("credential_ref"),
      externalAccountId: account.accountId,
      status: "active",
    };
    this.state.saveConnection(updatedConnection);
    return updatedConnection;
  }

  selectPrimaryInventorySource(input: {
    readonly providerId: "allegro" | "woocommerce";
    readonly tenantId: string;
    readonly workspaceId: string;
  }): PrimaryInventorySourceRecord {
    const source: PrimaryInventorySourceRecord = {
      providerId: input.providerId,
      selectedAt: toIso(this.now()),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    };
    this.state.savePrimaryInventorySource(source);
    return source;
  }

  initialSync(connectionId: string): SyncJobRecord {
    const connection = this.requireActiveConnection(connectionId);
    const adapter = this.requireAdapter(connection.providerId);
    return this.runSync(connection, "initial_sync", adapter.initialSync(), null);
  }

  incrementalSync(connectionId: string): SyncJobRecord {
    const connection = this.requireActiveConnection(connectionId);
    const adapter = this.requireAdapter(connection.providerId);
    return this.runSync(connection, "incremental_sync", adapter.incrementalSync(), null);
  }

  backfill(input: {
    readonly connectionId: string;
    readonly from: IsoDateTime;
    readonly to: IsoDateTime;
  }): SyncJobRecord {
    const connection = this.requireActiveConnection(input.connectionId);

    if (Date.parse(input.from) > Date.parse(input.to)) {
      throw new Error("Backfill range is invalid.");
    }

    const adapter = this.requireAdapter(connection.providerId);
    return this.runSync(connection, "backfill", adapter.backfill(), null);
  }

  retry(jobId: string): SyncJobRecord {
    const failedJob = this.requireJob(jobId);
    const connection = this.requireActiveConnection(failedJob.connectionId);
    const streams = this.requireAdapter(connection.providerId).retry({ job: failedJob });
    return this.runSync(connection, "retry", streams, failedJob.jobId);
  }

  reauthorize(connectionId: string): IntegrationConnectionRecord {
    const connection = this.requireConnection(connectionId);
    const result = this.requireAdapter(connection.providerId).reauthorize({ connection });
    const updatedConnection: IntegrationConnectionRecord = {
      ...connection,
      credentialRef: result.credentialRef,
      reauthorizedAt: toIso(this.now()),
      status: "active",
    };
    this.state.saveConnection(updatedConnection);
    return updatedConnection;
  }

  disconnect(connectionId: string): IntegrationConnectionRecord {
    const connection = this.requireConnection(connectionId);
    this.requireAdapter(connection.providerId).disconnect({ connection });
    const updatedConnection: IntegrationConnectionRecord = {
      ...connection,
      disconnectedAt: toIso(this.now()),
      status: "disconnected",
    };
    this.state.saveConnection(updatedConnection);
    return updatedConnection;
  }

  recovery(connectionId: string): SyncJobRecord {
    const connection = this.requireConnection(connectionId);
    const recoveredConnection: IntegrationConnectionRecord = {
      ...connection,
      status: "active",
    };
    this.state.saveConnection(recoveredConnection);
    const streams = this.requireAdapter(recoveredConnection.providerId).recovery();
    return this.runSync(recoveredConnection, "recovery", streams, null);
  }

  mapProduct(input: {
    readonly catalogId: string | null;
    readonly ean: string | null;
    readonly externalProductId: string;
    readonly name: string;
    readonly providerId: IntegrationProviderId;
    readonly sku: string | null;
    readonly tenantId: string;
    readonly workspaceId: string;
  }): ExternalProductMappingRecord {
    return this.resolveProductMapping(input, null);
  }

  createManualProductMapping(input: {
    readonly canonicalProductId: string;
    readonly externalProductId: string;
    readonly providerId: IntegrationProviderId;
    readonly tenantId: string;
    readonly workspaceId: string;
  }): ExternalProductMappingRecord {
    const canonicalProduct = this.state.snapshot().canonicalProducts.find(
      (product) =>
        product.tenantId === input.tenantId &&
        product.workspaceId === input.workspaceId &&
        product.canonicalProductId === input.canonicalProductId,
    );

    if (!canonicalProduct) {
      throw new Error("Canonical product was not found.");
    }

    return this.state.saveExternalProductMapping({
      approvedAt: toIso(this.now()),
      canonicalProductId: canonicalProduct.canonicalProductId,
      confidence: "high",
      externalProductId: input.externalProductId,
      mappingId: this.idSource.next("map"),
      method: "manual",
      policyVersion: PRODUCT_MAPPING_POLICY_VERSION,
      providerId: input.providerId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
  }

  private runSync(
    connection: IntegrationConnectionRecord,
    kind: SyncJobKind,
    streams: readonly IntegrationStream[],
    parentJobId: string | null,
  ): SyncJobRecord {
    let job: SyncJobRecord = {
      attempts: parentJobId ? this.requireJob(parentJobId).attempts + 1 : 1,
      completedAt: null,
      connectionId: connection.connectionId,
      createdAt: toIso(this.now()),
      jobId: this.idSource.next("sync_job"),
      kind,
      parentJobId,
      providerId: connection.providerId,
      retryAfterSeconds: null,
      status: "running",
      streams,
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    };
    this.state.saveJob(job);
    let partial = false;

    for (const stream of streams) {
      const page = this.fetchPage(connection.providerId, kind, stream);

      if (page.kind === "rate_limit") {
        job = {
          ...job,
          completedAt: toIso(this.now()),
          retryAfterSeconds: page.retryAfterSeconds,
          status: "rate_limited",
        };
        this.state.saveJob(job);
        this.createDataIssue(
          connection.tenantId,
          connection.workspaceId,
          null,
          "RATE_LIMITED",
          "Provider rate limit stopped the sync before checkpoint update.",
        );
        this.assess(connection, "retry_wait", ["rate_limit"]);
        return job;
      }

      if (page.kind === "transient") {
        job = {
          ...job,
          completedAt: toIso(this.now()),
          retryAfterSeconds: 60,
          status: "rate_limited",
        };
        this.state.saveJob(job);
        this.createDataIssue(
          connection.tenantId,
          connection.workspaceId,
          null,
          "RATE_LIMITED",
          page.message,
        );
        this.assess(connection, "retry_wait", ["transient"]);
        return job;
      }

      if (page.kind === "partial_success") {
        partial = true;
        this.createDataIssue(
          connection.tenantId,
          connection.workspaceId,
          null,
          "PARTIAL_SYNC_FAILURE",
          page.message,
        );
      }

      const batch: SourceBatchRecord = {
        batchId: this.idSource.next("source_batch"),
        connectionId: connection.connectionId,
        createdAt: toIso(this.now()),
        jobId: job.jobId,
        providerId: connection.providerId,
        recordCount: page.items.length,
        status: page.kind === "partial_success" ? "partial" : "success",
        stream,
        tenantId: connection.tenantId,
        workspaceId: connection.workspaceId,
      };
      this.state.saveBatch(batch);

      for (const item of page.items) {
        const sourceRecord = this.saveSourceRecord(connection, batch, stream, item);
        const normalizedRecord = this.normalizeSourceRecord(sourceRecord);
        this.canonicalize(normalizedRecord);
      }

      this.state.saveCheckpoint({
        checkpointId: this.idSource.next("checkpoint"),
        connectionId: connection.connectionId,
        cursor: page.nextCursor,
        providerId: connection.providerId,
        stream,
        tenantId: connection.tenantId,
        updatedAt: toIso(this.now()),
        watermark: page.watermark,
        workspaceId: connection.workspaceId,
      });
    }

    job = {
      ...job,
      completedAt: toIso(this.now()),
      status: partial ? "partial_success" : kind === "recovery" ? "recovered" : "succeeded",
    };
    this.state.saveJob(job);
    this.assess(connection, partial ? "partial" : "ready", partial ? ["partial_success"] : []);
    return job;
  }

  private fetchPage(
    providerId: IntegrationProviderId,
    kind: SyncJobKind,
    stream: IntegrationStream,
  ): SandboxSyncPage {
    const failure = this.consumeFailure(providerId, stream);
    const adapter = this.requireAdapter(providerId);

    if (failure?.type === "rate_limit") {
      return adapter.rateLimit();
    }

    if (failure?.type === "partial_success") {
      return adapter.partialSuccess({ stream });
    }

    if (failure?.type === "transient") {
      return {
        kind: "transient",
        message: "Transient sandbox provider failure.",
      };
    }

    return adapter.fetchPage({ kind, stream });
  }

  private consumeFailure(
    providerId: IntegrationProviderId,
    stream: IntegrationStream,
  ): FailurePlan | undefined {
    const index = this.failurePlan.findIndex(
      (failure) =>
        failure.providerId === providerId &&
        (failure.stream === undefined || failure.stream === stream),
    );

    if (index < 0) {
      return undefined;
    }

    return this.failurePlan.splice(index, 1)[0];
  }

  private saveSourceRecord(
    connection: IntegrationConnectionRecord,
    batch: SourceBatchRecord,
    stream: IntegrationStream,
    item: SandboxSourceItem,
  ): SourceRecordRecord {
    const fingerprint = sourceFingerprint(
      connection.tenantId,
      connection.workspaceId,
      connection.providerId,
      stream,
      item.externalId,
    );
    return this.state.saveSourceRecord({
      batchId: batch.batchId,
      connectionId: connection.connectionId,
      externalId: item.externalId,
      fingerprint,
      ingestedAt: toIso(this.now()),
      payload: item.payload,
      providerId: connection.providerId,
      sourceRecordId: this.idSource.next("source_record"),
      stream,
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });
  }

  private normalizeSourceRecord(sourceRecord: SourceRecordRecord): NormalizedRecordRecord {
    return this.state.saveNormalizedRecord({
      externalId: sourceRecord.externalId,
      normalizedAt: toIso(this.now()),
      normalizedRecordId: this.idSource.next("normalized_record"),
      payload: sourceRecord.payload,
      providerId: sourceRecord.providerId,
      sourceRecordId: sourceRecord.sourceRecordId,
      stream: sourceRecord.stream,
      tenantId: sourceRecord.tenantId,
      validationStatus: "valid",
      workspaceId: sourceRecord.workspaceId,
    });
  }

  private canonicalize(record: NormalizedRecordRecord): void {
    if (record.stream === "products") {
      this.canonicalizeProduct(record, record.payload as ProductPayload);
      return;
    }

    if (record.stream === "orders" && isSalesProvider(record.providerId)) {
      this.canonicalizeOrder(record, record.payload as OrderPayload);
      return;
    }

    if (record.stream === "refunds" && isSalesProvider(record.providerId)) {
      this.canonicalizeRefund(record, record.payload as RefundPayload);
      return;
    }

    if (record.stream === "inventory" && isSalesProvider(record.providerId)) {
      this.canonicalizeInventory(record, record.payload as InventoryPayload);
      return;
    }

    if (record.stream === "ad_spend" && isAdsProvider(record.providerId)) {
      this.canonicalizeAdSpend(record, record.payload as AdSpendPayload);
      return;
    }

    if (record.stream === "attributed_conversions" && isAdsProvider(record.providerId)) {
      this.canonicalizeAttributedConversion(record, record.payload as AttributedConversionPayload);
    }
  }

  private canonicalizeProduct(record: NormalizedRecordRecord, payload: ProductPayload): void {
    const mapping = this.resolveProductMapping(
      {
        catalogId: payload.catalogId,
        ean: payload.ean,
        externalProductId: payload.externalProductId,
        name: payload.name,
        providerId: record.providerId,
        sku: payload.sku,
        tenantId: record.tenantId,
        workspaceId: record.workspaceId,
      },
      record.sourceRecordId,
    );
    const product = this.state.snapshot().canonicalProducts.find(
      (item) => item.canonicalProductId === mapping.canonicalProductId,
    );

    if (!product) {
      return;
    }

    this.state.saveCanonicalProductVariant({
      canonicalProductId: product.canonicalProductId,
      canonicalVariantId: this.idSource.next("canonical_variant"),
      name: payload.variantName,
      sku: payload.sku,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(
      record,
      "canonical_products",
      product.canonicalProductId,
    );
  }

  private canonicalizeOrder(record: NormalizedRecordRecord, payload: OrderPayload): void {
    const providerId = record.providerId as "allegro" | "woocommerce";
    const existing = this.state.findCanonicalOrder(
      record.tenantId,
      record.workspaceId,
      providerId,
      payload.orderNumber,
    );
    const order = this.state.saveCanonicalOrder({
      canonicalOrderId: existing?.canonicalOrderId ?? this.idSource.next("canonical_order"),
      currency: payload.currency,
      externalOrderId: payload.externalOrderId,
      grossAmount: payload.grossAmount,
      orderNumber: payload.orderNumber,
      orderedAt: payload.orderedAt,
      providerId,
      sourceAuthorityVersion: SALES_AUTHORITY_VERSION,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(record, "canonical_orders", order.canonicalOrderId);

    for (const line of payload.lines) {
      let mappedProduct = this.state.findCanonicalProductByExternalMapping(
        record.tenantId,
        record.workspaceId,
        record.providerId,
        line.externalProductId,
      );

      if (!mappedProduct) {
        const mapping = this.resolveProductMapping(
          {
            catalogId: line.catalogId,
            ean: line.ean,
            externalProductId: line.externalProductId,
            name: line.name,
            providerId: record.providerId,
            sku: line.sku,
            tenantId: record.tenantId,
            workspaceId: record.workspaceId,
          },
          record.sourceRecordId,
        );
        mappedProduct = this.state.snapshot().canonicalProducts.find(
          (product) => product.canonicalProductId === mapping.canonicalProductId,
        );
      }

      const orderLine = this.state.saveCanonicalOrderLine({
        canonicalLineId: this.idSource.next("canonical_order_line"),
        canonicalOrderId: order.canonicalOrderId,
        canonicalProductId: mappedProduct?.canonicalProductId ?? null,
        grossAmount: line.grossAmount,
        quantity: line.quantity,
        tenantId: record.tenantId,
        workspaceId: record.workspaceId,
      });
      this.addLineage(record, "canonical_order_lines", orderLine.canonicalLineId);
    }

    const payment = this.state.saveCanonicalPayment({
      amount: payload.paymentAmount,
      canonicalOrderId: order.canonicalOrderId,
      canonicalPaymentId: this.idSource.next("canonical_payment"),
      currency: payload.currency,
      paidAt: payload.paymentTime,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(record, "canonical_payments", payment.canonicalPaymentId);
  }

  private canonicalizeRefund(record: NormalizedRecordRecord, payload: RefundPayload): void {
    const providerId = record.providerId as "allegro" | "woocommerce";
    const order = this.state.findCanonicalOrder(
      record.tenantId,
      record.workspaceId,
      providerId,
      payload.orderNumber,
    );
    const refund = this.state.saveCanonicalRefund({
      amount: payload.amount,
      canonicalOrderId: order?.canonicalOrderId ?? null,
      canonicalRefundId: this.idSource.next("canonical_refund"),
      currency: payload.currency,
      externalRefundId: payload.externalRefundId,
      providerId,
      refundedAt: payload.refundedAt,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(record, "canonical_refunds", refund.canonicalRefundId);
    const customerReturn = this.state.saveCanonicalCustomerReturn({
      canonicalReturnId: this.idSource.next("canonical_return"),
      externalRefundId: payload.externalRefundId,
      reason: payload.reason,
      returnedQuantity: payload.returnedQuantity,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(record, "canonical_customer_returns", customerReturn.canonicalReturnId);
  }

  private canonicalizeInventory(record: NormalizedRecordRecord, payload: InventoryPayload): void {
    const providerId = record.providerId as "allegro" | "woocommerce";
    const primarySource = this.state.findPrimaryInventorySource(record.tenantId, record.workspaceId);

    if (!primarySource || primarySource.providerId !== providerId) {
      return;
    }

    const mappedProduct = this.state.findCanonicalProductByExternalMapping(
      record.tenantId,
      record.workspaceId,
      providerId,
      payload.externalProductId,
    );
    const snapshot = this.state.saveCanonicalInventorySnapshot({
      canonicalInventorySnapshotId: this.idSource.next("canonical_inventory_snapshot"),
      canonicalProductId: mappedProduct?.canonicalProductId ?? null,
      externalProductId: payload.externalProductId,
      providerId,
      quantityAvailable: payload.quantityAvailable,
      snapshotAt: payload.snapshotAt,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(
      record,
      "canonical_inventory_snapshots",
      snapshot.canonicalInventorySnapshotId,
    );
  }

  private canonicalizeAdSpend(record: NormalizedRecordRecord, payload: AdSpendPayload): void {
    const spend = this.state.saveCanonicalAdSpend({
      campaignId: payload.campaignId,
      canonicalAdSpendId: this.idSource.next("canonical_ad_spend"),
      clicks: payload.clicks,
      costAmount: payload.costAmount,
      currency: payload.currency,
      date: payload.date,
      impressions: payload.impressions,
      providerId: record.providerId as "google_ads" | "meta_ads",
      sourceAuthorityVersion: ADS_AUTHORITY_VERSION,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(record, "canonical_ad_spend", spend.canonicalAdSpendId);
  }

  private canonicalizeAttributedConversion(
    record: NormalizedRecordRecord,
    payload: AttributedConversionPayload,
  ): void {
    const conversion = this.state.saveCanonicalAttributedConversion({
      attributedConversionId: this.idSource.next("canonical_attributed_conversion"),
      attributedValueAmount: payload.attributedValueAmount,
      campaignId: payload.campaignId,
      conversionTime: payload.conversionTime,
      currency: payload.currency,
      externalConversionId: payload.externalConversionId,
      providerId: record.providerId as "google_ads" | "meta_ads",
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
    this.addLineage(
      record,
      "canonical_attributed_conversions",
      conversion.attributedConversionId,
    );
  }

  private resolveProductMapping(
    input: {
      readonly catalogId: string | null;
      readonly ean: string | null;
      readonly externalProductId: string;
      readonly name: string;
      readonly providerId: IntegrationProviderId;
      readonly sku: string | null;
      readonly tenantId: string;
      readonly workspaceId: string;
    },
    sourceRecordId: string | null,
  ): ExternalProductMappingRecord {
    const existing = this.state.findCanonicalProductByExternalMapping(
      input.tenantId,
      input.workspaceId,
      input.providerId,
      input.externalProductId,
    );

    if (existing) {
      const mapping = this.state.snapshot().externalProductMappings.find(
        (item) =>
          item.tenantId === input.tenantId &&
          item.workspaceId === input.workspaceId &&
          item.providerId === input.providerId &&
          item.externalProductId === input.externalProductId,
      );

      if (mapping) {
        return mapping;
      }
    }

    const skuMatch = this.state.findCanonicalProductBySku(input.tenantId, input.workspaceId, input.sku);

    if (skuMatch) {
      return this.createMapping(input, skuMatch.canonicalProductId, "sku");
    }

    const eanMatch = this.state.findCanonicalProductByEan(input.tenantId, input.workspaceId, input.ean);

    if (eanMatch) {
      return this.createMapping(input, eanMatch.canonicalProductId, "ean");
    }

    const catalogMatch = this.state.findCanonicalProductByCatalog(
      input.tenantId,
      input.workspaceId,
      input.catalogId,
    );

    if (catalogMatch) {
      return this.createMapping(input, catalogMatch.canonicalProductId, "catalog");
    }

    const exactMatch = this.state.findCanonicalProductByName(input.tenantId, input.workspaceId, input.name);

    if (exactMatch) {
      return this.createMapping(input, exactMatch.canonicalProductId, "exact_match");
    }

    const fuzzyCandidate = this.state.findFuzzyProductCandidate(
      input.tenantId,
      input.workspaceId,
      input.name,
    );

    if (fuzzyCandidate) {
      this.createDataIssue(
        input.tenantId,
        input.workspaceId,
        sourceRecordId,
        "FUZZY_MATCH_REQUIRES_MANUAL_APPROVAL",
        `Fuzzy product candidate ${fuzzyCandidate.canonicalProductId} requires manual acceptance.`,
      );
      return {
        approvedAt: null,
        canonicalProductId: fuzzyCandidate.canonicalProductId,
        confidence: "manual_review_required",
        externalProductId: input.externalProductId,
        mappingId: this.idSource.next("map"),
        method: "fuzzy_manual_review",
        policyVersion: PRODUCT_MAPPING_POLICY_VERSION,
        providerId: input.providerId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
      };
    }

    const product = this.state.saveCanonicalProduct({
      canonicalProductId: this.idSource.next("canonical_product"),
      catalogId: input.catalogId,
      createdAt: toIso(this.now()),
      ean: input.ean,
      name: input.name,
      sku: input.sku,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
    return this.createMapping(input, product.canonicalProductId, "exact_match");
  }

  private createMapping(
    input: {
      readonly externalProductId: string;
      readonly providerId: IntegrationProviderId;
      readonly tenantId: string;
      readonly workspaceId: string;
    },
    canonicalProductId: string,
    method: Exclude<ProductMappingMethod, "fuzzy_manual_review">,
  ): ExternalProductMappingRecord {
    return this.state.saveExternalProductMapping({
      approvedAt: toIso(this.now()),
      canonicalProductId,
      confidence: "high",
      externalProductId: input.externalProductId,
      mappingId: this.idSource.next("map"),
      method,
      policyVersion: PRODUCT_MAPPING_POLICY_VERSION,
      providerId: input.providerId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    });
  }

  private createDataIssue(
    tenantId: string,
    workspaceId: string,
    sourceRecordId: string | null,
    code: DataIssueCode,
    message: string,
  ): void {
    this.state.saveDataIssue({
      code,
      createdAt: toIso(this.now()),
      issueId: this.idSource.next("data_issue"),
      message,
      severity: code === "FUZZY_MATCH_REQUIRES_MANUAL_APPROVAL" ? "warning" : "error",
      sourceRecordId,
      status: "open",
      tenantId,
      workspaceId,
    });
  }

  private addLineage(
    record: NormalizedRecordRecord,
    canonicalTable: CanonicalTableName,
    canonicalRecordId: string,
  ): void {
    this.state.saveLineage({
      canonicalRecordId,
      canonicalTable,
      lineageId: this.idSource.next("lineage"),
      sourceRecordId: record.sourceRecordId,
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });
  }

  private assess(
    connection: IntegrationConnectionRecord,
    readiness: ReadinessAssessmentStatus,
    limitations: readonly string[],
  ): void {
    const issueCount = this.state.snapshot().dataIssues.filter(
      (issue) =>
        issue.tenantId === connection.tenantId &&
        issue.workspaceId === connection.workspaceId &&
        issue.status === "open",
    ).length;
    this.state.saveQualityAssessment({
      assessedAt: toIso(this.now()),
      issueCount,
      qualityAssessmentId: this.idSource.next("quality_assessment"),
      status: issueCount > 0 ? "partial" : "passed",
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });
    this.state.saveReadinessAssessment({
      assessedAt: toIso(this.now()),
      limitations,
      readinessAssessmentId: this.idSource.next("readiness_assessment"),
      status: readiness,
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });
  }

  private requireAdapter(providerId: IntegrationProviderId): SandboxIntegrationAdapter {
    const adapter = this.adapters.get(providerId);

    if (!adapter) {
      throw new Error(`Unsupported sandbox provider: ${providerId}`);
    }

    return adapter;
  }

  private requireConnection(connectionId: string): IntegrationConnectionRecord {
    const connection = this.state.findConnection(connectionId);

    if (!connection) {
      throw new Error(`Integration connection was not found: ${connectionId}`);
    }

    return connection;
  }

  private requireActiveConnection(connectionId: string): IntegrationConnectionRecord {
    const connection = this.requireConnection(connectionId);

    if (connection.status !== "active") {
      throw new Error(`Integration connection is not active: ${connectionId}`);
    }

    return connection;
  }

  private requireJob(jobId: string): SyncJobRecord {
    const job = this.state.findJob(jobId);

    if (!job) {
      throw new Error(`Sync job was not found: ${jobId}`);
    }

    return job;
  }
}

export function createSandboxIntegrationDataRuntime(options: {
  readonly failurePlan?: readonly FailurePlan[];
  readonly now?: () => Date;
} = {}): SandboxIntegrationDataService {
  return new SandboxIntegrationDataService(options);
}

export class IdSource {
  private nextValue = 1;

  next(prefix: string): string {
    const value = this.nextValue.toString().padStart(6, "0");
    this.nextValue += 1;
    return `${prefix}_${value}`;
  }
}

function createSandboxAdapter(
  providerId: IntegrationProviderId,
  idSource: IdSource,
): SandboxIntegrationAdapter {
  const accounts = sandboxAccounts[providerId];
  const itemsByStream = sandboxItems[providerId] as Partial<
    Record<IntegrationStream, readonly SandboxSourceItem[]>
  >;
  const streams = providerStreams[providerId];

  return {
    providerId,
    supportedOperations: requiredSandboxAdapterOperations,
    accountSelection(input) {
      return accounts.find((account) => account.accountId === input.accountId);
    },
    backfill() {
      return streams;
    },
    checkpoint(input) {
      return checkpointKey(
        input.connection.tenantId,
        input.connection.workspaceId,
        input.connection.providerId,
        input.stream,
      );
    },
    connect() {
      return accounts;
    },
    disconnect() {
      return { disconnected: true };
    },
    incrementalSync() {
      return streams;
    },
    initialSync() {
      return streams;
    },
    partialSuccess(input) {
      const [first] = itemsByStream[input.stream] ?? [];
      return {
        items: first ? [first] : [],
        kind: "partial_success",
        message: `Sandbox partial success for ${providerId}:${input.stream}.`,
        nextCursor: idSource.next("cursor"),
        watermark: "2026-07-20T00:00:00.000Z" as IsoDateTime,
      };
    },
    rateLimit() {
      return {
        kind: "rate_limit",
        retryAfterSeconds: 60,
      };
    },
    reauthorize() {
      return {
        credentialRef: idSource.next("credential_ref"),
      };
    },
    recovery() {
      return streams;
    },
    retry(input) {
      return input.job.streams;
    },
    fetchPage(input) {
      return {
        items: itemsByStream[input.stream] ?? [],
        kind: "success",
        nextCursor: idSource.next(`cursor_${input.kind}`),
        watermark: "2026-07-20T00:00:00.000Z" as IsoDateTime,
      };
    },
  };
}

function isSalesProvider(providerId: IntegrationProviderId): providerId is "allegro" | "woocommerce" {
  return (salesProviderIds as readonly IntegrationProviderId[]).includes(providerId);
}

function isAdsProvider(providerId: IntegrationProviderId): providerId is "google_ads" | "meta_ads" {
  return (adsProviderIds as readonly IntegrationProviderId[]).includes(providerId);
}

function sourceFingerprint(
  tenantId: string,
  workspaceId: string,
  providerId: IntegrationProviderId,
  stream: IntegrationStream,
  externalId: string,
): string {
  return `${tenantId}:${workspaceId}:${providerId}:${stream}:${externalId}`;
}

function checkpointKey(
  tenantId: string,
  workspaceId: string,
  providerId: IntegrationProviderId,
  stream: IntegrationStream,
): string {
  return `${tenantId}:${workspaceId}:${providerId}:${stream}`;
}

function productMappingKey(
  tenantId: string,
  workspaceId: string,
  providerId: IntegrationProviderId,
  externalProductId: string,
): string {
  return `${tenantId}:${workspaceId}:${providerId}:${externalProductId}`;
}

function orderKey(
  tenantId: string,
  workspaceId: string,
  providerId: "allegro" | "woocommerce",
  orderNumber: string,
): string {
  return `${tenantId}:${workspaceId}:${providerId}:${orderNumber}`;
}

function refundKey(
  tenantId: string,
  workspaceId: string,
  providerId: "allegro" | "woocommerce",
  externalRefundId: string,
): string {
  return `${tenantId}:${workspaceId}:${providerId}:${externalRefundId}`;
}

function scopeKey(tenantId: string, workspaceId: string): string {
  return `${tenantId}:${workspaceId}`;
}

function normalizeProductName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function levenshteinDistance(left: string, right: string): number {
  const distances = Array.from({ length: left.length + 1 }, (_, index) =>
    Array.from({ length: right.length + 1 }, (_unused, innerIndex) =>
      index === 0 ? innerIndex : innerIndex === 0 ? index : 0,
    ),
  );

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      distances[row][column] = Math.min(
        distances[row - 1][column] + 1,
        distances[row][column - 1] + 1,
        distances[row - 1][column - 1] + cost,
      );
    }
  }

  return distances[left.length][right.length];
}

function toIso(date: Date): IsoDateTime {
  return date.toISOString() as IsoDateTime;
}

const providerStreams = {
  allegro: ["products", "orders", "refunds", "inventory"],
  google_ads: ["ad_spend", "attributed_conversions"],
  meta_ads: ["ad_spend", "attributed_conversions"],
  woocommerce: ["products", "orders", "refunds", "inventory"],
} as const satisfies Record<IntegrationProviderId, readonly IntegrationStream[]>;

const sandboxAccounts = {
  allegro: [
    {
      accountId: "allegro_account_pl",
      displayName: "Allegro Polska",
    },
  ],
  google_ads: [
    {
      accountId: "google_ads_account_pl",
      displayName: "Google Ads Polska",
    },
  ],
  meta_ads: [
    {
      accountId: "meta_ads_account_pl",
      displayName: "Meta Ads Polska",
    },
  ],
  woocommerce: [
    {
      accountId: "woo_store_pl",
      displayName: "WooCommerce Polska",
    },
  ],
} as const satisfies Record<IntegrationProviderId, readonly SandboxAccount[]>;

const sandboxItems = {
  allegro: {
    inventory: [
      {
        externalId: "alg-inventory-mug",
        payload: {
          externalProductId: "alg-product-mug",
          quantityAvailable: 7,
          sku: "PAPA-MUG",
          snapshotAt: "2026-07-20T00:00:00.000Z" as IsoDateTime,
        },
      },
    ],
    orders: [
      {
        externalId: "alg-order-2001",
        payload: {
          currency: "PLN",
          externalOrderId: "alg-order-2001",
          grossAmount: "149.00",
          lines: [
            {
              catalogId: "catalog-papa-mug",
              ean: "5900000000011",
              externalProductId: "alg-product-mug",
              grossAmount: "149.00",
              name: "Papa Mug",
              quantity: 1,
              sku: "PAPA-MUG",
            },
          ],
          orderNumber: "AL-2001",
          orderedAt: "2026-07-19T10:00:00.000Z" as IsoDateTime,
          paymentAmount: "149.00",
          paymentTime: "2026-07-19T10:05:00.000Z" as IsoDateTime,
        },
      },
    ],
    products: [
      {
        externalId: "alg-product-mug",
        payload: {
          catalogId: "catalog-papa-mug",
          ean: "5900000000011",
          externalProductId: "alg-product-mug",
          name: "Papa Mug",
          sku: "PAPA-MUG",
          variantName: "Default",
        },
      },
    ],
    refunds: [
      {
        externalId: "alg-refund-2001",
        payload: {
          amount: "149.00",
          currency: "PLN",
          externalRefundId: "alg-refund-2001",
          orderNumber: "AL-2001",
          reason: "customer_return",
          refundedAt: "2026-07-20T08:00:00.000Z" as IsoDateTime,
          returnedQuantity: 1,
        },
      },
    ],
  },
  google_ads: {
    ad_spend: [
      {
        externalId: "gads-spend-2026-07-19",
        payload: {
          campaignId: "gads-campaign-1",
          clicks: 80,
          costAmount: "120.00",
          currency: "PLN",
          date: "2026-07-19",
          impressions: 4000,
        },
      },
    ],
    attributed_conversions: [
      {
        externalId: "gads-conversion-1",
        payload: {
          attributedValueAmount: "500.00",
          campaignId: "gads-campaign-1",
          conversionTime: "2026-07-19T16:00:00.000Z" as IsoDateTime,
          currency: "PLN",
          externalConversionId: "gads-conversion-1",
        },
      },
    ],
  },
  meta_ads: {
    ad_spend: [
      {
        externalId: "meta-spend-2026-07-19",
        payload: {
          campaignId: "meta-campaign-1",
          clicks: 55,
          costAmount: "90.00",
          currency: "PLN",
          date: "2026-07-19",
          impressions: 2800,
        },
      },
    ],
    attributed_conversions: [
      {
        externalId: "meta-conversion-1",
        payload: {
          attributedValueAmount: "310.00",
          campaignId: "meta-campaign-1",
          conversionTime: "2026-07-19T18:30:00.000Z" as IsoDateTime,
          currency: "PLN",
          externalConversionId: "meta-conversion-1",
        },
      },
    ],
  },
  woocommerce: {
    inventory: [
      {
        externalId: "woo-inventory-mug",
        payload: {
          externalProductId: "woo-product-mug",
          quantityAvailable: 12,
          sku: "PAPA-MUG",
          snapshotAt: "2026-07-20T00:00:00.000Z" as IsoDateTime,
        },
      },
    ],
    orders: [
      {
        externalId: "woo-order-1001",
        payload: {
          currency: "PLN",
          externalOrderId: "woo-order-1001",
          grossAmount: "199.00",
          lines: [
            {
              catalogId: "catalog-papa-mug",
              ean: "5900000000011",
              externalProductId: "woo-product-mug",
              grossAmount: "199.00",
              name: "Papa Mug",
              quantity: 1,
              sku: "PAPA-MUG",
            },
          ],
          orderNumber: "WC-1001",
          orderedAt: "2026-07-19T09:00:00.000Z" as IsoDateTime,
          paymentAmount: "199.00",
          paymentTime: "2026-07-19T09:02:00.000Z" as IsoDateTime,
        },
      },
    ],
    products: [
      {
        externalId: "woo-product-mug",
        payload: {
          catalogId: "catalog-papa-mug",
          ean: "5900000000011",
          externalProductId: "woo-product-mug",
          name: "Papa Mug",
          sku: "PAPA-MUG",
          variantName: "Default",
        },
      },
    ],
    refunds: [
      {
        externalId: "woo-refund-1001",
        payload: {
          amount: "49.00",
          currency: "PLN",
          externalRefundId: "woo-refund-1001",
          orderNumber: "WC-1001",
          reason: "partial_return",
          refundedAt: "2026-07-20T07:00:00.000Z" as IsoDateTime,
          returnedQuantity: 1,
        },
      },
    ],
  },
} as const satisfies Record<
  IntegrationProviderId,
  Partial<Record<IntegrationStream, readonly SandboxSourceItem[]>>
>;
