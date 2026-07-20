export const CONTRACT_VERSION = "domain-contracts.v1";
export const API_VERSION = "v1";
export const API_BASE_PATH = `/${API_VERSION}`;

export const apiHeaders = {
  correlationId: "x-correlation-id",
  contractVersion: "x-contract-version",
  idempotencyKey: "idempotency-key",
  expectedVersion: "x-expected-version",
  etag: "etag",
  ifMatch: "if-match",
} as const;

declare const tenantIdBrand: unique symbol;
declare const workspaceIdBrand: unique symbol;
declare const operationIdBrand: unique symbol;
declare const correlationIdBrand: unique symbol;
declare const idempotencyKeyBrand: unique symbol;
declare const expectedVersionBrand: unique symbol;
declare const entityTagBrand: unique symbol;
declare const cursorBrand: unique symbol;
declare const isoDateTimeBrand: unique symbol;

export type TenantId = string & {
  readonly [tenantIdBrand]: "TenantId";
};

export type WorkspaceId = string & {
  readonly [workspaceIdBrand]: "WorkspaceId";
};

export type OperationId = string & {
  readonly [operationIdBrand]: "OperationId";
};

export type CorrelationId = string & {
  readonly [correlationIdBrand]: "CorrelationId";
};

export type IdempotencyKey = string & {
  readonly [idempotencyKeyBrand]: "IdempotencyKey";
};

export type ExpectedVersion = string & {
  readonly [expectedVersionBrand]: "ExpectedVersion";
};

export type EntityTag = string & {
  readonly [entityTagBrand]: "EntityTag";
};

export type Cursor = string & {
  readonly [cursorBrand]: "Cursor";
};

export type IsoDateTime = string & {
  readonly [isoDateTimeBrand]: "IsoDateTime";
};

export type TenantWorkspaceScope = {
  readonly tenantId: TenantId;
  readonly workspaceId: WorkspaceId;
};

export type VersionedApiPath = `${typeof API_BASE_PATH}/${string}`;

export const readinessStates = [
  "no_data",
  "partial",
  "delayed",
  "stale",
  "invalid",
  "conflicting",
  "processing",
  "ready",
  "resync_required",
  "manual_review_required",
] as const;

export type ReadinessState = (typeof readinessStates)[number];

export type Readiness = {
  readonly state: ReadinessState;
  readonly checkedAt: IsoDateTime;
  readonly limitations: readonly string[];
};

export type ContractEnvelopeMeta = TenantWorkspaceScope & {
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly correlationId: CorrelationId;
  readonly readiness: Readiness;
  readonly limitations: readonly string[];
};

export type ApiResponseEnvelope<TData> = {
  readonly data: TData;
  readonly meta: ContractEnvelopeMeta;
};

export type FieldError = {
  readonly field: string;
  readonly message: string;
};

export const apiErrorCodes = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "VALIDATION_FAILED",
  "DATA_NOT_READY",
  "RATE_LIMITED",
  "PROVIDER_UNAVAILABLE",
  "INTERNAL_ERROR",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export type ApiError = {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly fieldErrors: readonly FieldError[];
  readonly impact: string;
  readonly nextActions: readonly string[];
  readonly retryable: boolean;
  readonly correlationId: CorrelationId;
  readonly contractVersion: typeof CONTRACT_VERSION;
};

export type ApiErrorEnvelope = {
  readonly error: ApiError;
};

export type CursorPageInfo = {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: Cursor | null;
  readonly endCursor: Cursor | null;
};

export type CursorPage<TItem> = {
  readonly items: readonly TItem[];
  readonly pageInfo: CursorPageInfo;
};

export type CursorPaginationRequest = {
  readonly first: number;
  readonly after?: Cursor;
};

export type ConcurrencyControl =
  | {
      readonly expectedVersion: ExpectedVersion;
      readonly etag?: never;
    }
  | {
      readonly expectedVersion?: never;
      readonly etag: EntityTag;
    };

export type CommandRequest<TPayload> = {
  readonly payload: TPayload;
  readonly idempotencyKey: IdempotencyKey;
  readonly concurrency?: ConcurrencyControl;
};

export const operationStates = [
  "queued",
  "running",
  "retry_wait",
  "succeeded",
  "partial",
  "failed",
  "cancelled",
  "dlq",
] as const;

export type OperationState = (typeof operationStates)[number];

export type OperationStatus = TenantWorkspaceScope & {
  readonly operationId: OperationId;
  readonly state: OperationState;
  readonly progressPercent: number;
  readonly retryable: boolean;
};

export type OperationAccepted = TenantWorkspaceScope & {
  readonly operationId: OperationId;
  readonly statusPath: VersionedApiPath;
};

export type ServiceReadinessState =
  | "not_configured"
  | "ready"
  | "blocked";

export type ServiceDependencyReadiness = {
  readonly name: string;
  readonly state: ServiceReadinessState;
};

export type ServiceReadiness = {
  readonly serviceName: string;
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly state: ServiceReadinessState;
  readonly dependencies: readonly ServiceDependencyReadiness[];
  readonly limitations: readonly string[];
};

export type BackendServiceManifest = {
  readonly serviceName: "api" | "worker" | "database";
  readonly contractVersion: typeof CONTRACT_VERSION;
  readonly readiness: ServiceReadinessState;
  readonly capabilities: readonly string[];
  readonly limitations: readonly string[];
};

export const authApiPaths = {
  register: `${API_BASE_PATH}/auth/register`,
  login: `${API_BASE_PATH}/auth/login`,
  logout: `${API_BASE_PATH}/auth/logout`,
  refresh: `${API_BASE_PATH}/auth/refresh`,
  me: `${API_BASE_PATH}/auth/me`,
  contextSelect: `${API_BASE_PATH}/auth/context/select`,
  passwordResetRequest: `${API_BASE_PATH}/auth/password/reset/request`,
  passwordResetConfirm: `${API_BASE_PATH}/auth/password/reset/confirm`,
  passwordChange: `${API_BASE_PATH}/auth/password/change`,
  emailVerify: `${API_BASE_PATH}/auth/email/verify`,
  mfaChallenge: `${API_BASE_PATH}/auth/mfa/challenge`,
  mfaVerify: `${API_BASE_PATH}/auth/mfa/verify`,
  mfaRecovery: `${API_BASE_PATH}/auth/mfa/recovery`,
  sessions: `${API_BASE_PATH}/auth/sessions`,
  session: `${API_BASE_PATH}/auth/sessions/:sessionId`,
} as const satisfies Record<string, VersionedApiPath>;

export type AuthApiPath = (typeof authApiPaths)[keyof typeof authApiPaths];

export const tenantWorkspaceApiPaths = {
  invitationValidate: `${API_BASE_PATH}/invitations/validate`,
  invitationAccept: `${API_BASE_PATH}/invitations/accept`,
  invitationResend: `${API_BASE_PATH}/invitations/resend`,
  invitationRevoke: `${API_BASE_PATH}/invitations/:id/revoke`,
  organizationRegister: `${API_BASE_PATH}/organizations/register`,
  organizationVerify: `${API_BASE_PATH}/organizations/verify`,
  organizationBootstrap: `${API_BASE_PATH}/organizations/bootstrap`,
  workspaces: `${API_BASE_PATH}/workspaces`,
  workspaceReadiness: `${API_BASE_PATH}/workspaces/:id/readiness`,
  onboardingStatus: `${API_BASE_PATH}/onboarding/status`,
  onboardingCompany: `${API_BASE_PATH}/onboarding/company`,
  onboardingBusinessProfile: `${API_BASE_PATH}/onboarding/business-profile`,
  onboardingPlatform: `${API_BASE_PATH}/onboarding/platform`,
  onboardingDataSources: `${API_BASE_PATH}/onboarding/data-sources`,
  onboardingComplete: `${API_BASE_PATH}/onboarding/complete`,
} as const satisfies Record<string, VersionedApiPath>;

export type TenantWorkspaceApiPath =
  (typeof tenantWorkspaceApiPaths)[keyof typeof tenantWorkspaceApiPaths];

export const complianceApiPaths = {
  privacyConsent: `${API_BASE_PATH}/privacy/consent`,
  legalDocuments: `${API_BASE_PATH}/legal/documents`,
  legalDocument: `${API_BASE_PATH}/legal/documents/:type`,
  legalAcceptances: `${API_BASE_PATH}/legal/acceptances`,
  legalAcceptancesMe: `${API_BASE_PATH}/legal/acceptances/me`,
  notifications: `${API_BASE_PATH}/notifications`,
  notificationRead: `${API_BASE_PATH}/notifications/:id/read`,
  notificationsReadAll: `${API_BASE_PATH}/notifications/read-all`,
} as const satisfies Record<string, VersionedApiPath>;

export type ComplianceApiPath =
  (typeof complianceApiPaths)[keyof typeof complianceApiPaths];

export const mvpIntegrationProviderIds = [
  "woocommerce",
  "allegro",
  "google_ads",
  "meta_ads",
] as const;

export type MvpIntegrationProviderId =
  (typeof mvpIntegrationProviderIds)[number];

export const commerceSalesProviderIds = [
  "woocommerce",
  "allegro",
] as const satisfies readonly MvpIntegrationProviderId[];

export const adsAttributionProviderIds = [
  "google_ads",
  "meta_ads",
] as const satisfies readonly MvpIntegrationProviderId[];

export const integrationStreams = [
  "ad_spend",
  "attributed_conversions",
  "inventory",
  "orders",
  "products",
  "refunds",
] as const;

export type IntegrationStream = (typeof integrationStreams)[number];

export const sandboxIntegrationOperations = [
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

export type SandboxIntegrationOperation =
  (typeof sandboxIntegrationOperations)[number];

export const productMappingMethods = [
  "catalog",
  "ean",
  "exact_match",
  "fuzzy_manual_review",
  "manual",
  "sku",
] as const;

export type ProductMappingMethod = (typeof productMappingMethods)[number];

export const dashboardApiPaths = {
  readiness: `${API_BASE_PATH}/dashboard/readiness`,
  commandCenter: `${API_BASE_PATH}/dashboard/command-center`,
  campaigns: `${API_BASE_PATH}/dashboard/campaigns`,
  orders: `${API_BASE_PATH}/dashboard/orders`,
  products: `${API_BASE_PATH}/dashboard/products`,
  customers: `${API_BASE_PATH}/dashboard/customers`,
  traffic: `${API_BASE_PATH}/dashboard/traffic`,
} as const satisfies Record<string, VersionedApiPath>;

export type DashboardApiPath =
  (typeof dashboardApiPaths)[keyof typeof dashboardApiPaths];

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

export const dashboardMetricReadinessStates = [
  "ready",
  "partial",
  "stale",
  "invalid",
  "no_data",
  "unavailable",
] as const;

export type DashboardMetricReadinessState =
  (typeof dashboardMetricReadinessStates)[number];

export const reportApiPaths = {
  export: `${API_BASE_PATH}/reports/export`,
  status: `${API_BASE_PATH}/reports/:id/status`,
  download: `${API_BASE_PATH}/reports/:id/download`,
} as const satisfies Record<string, VersionedApiPath>;

export type ReportApiPath = (typeof reportApiPaths)[keyof typeof reportApiPaths];

export const assistantApiPaths = {
  threads: `${API_BASE_PATH}/assistant/threads`,
  threadMessages: `${API_BASE_PATH}/assistant/threads/:threadId/messages`,
  threadStream: `${API_BASE_PATH}/assistant/threads/:threadId/stream`,
  approvals: `${API_BASE_PATH}/assistant/threads/:threadId/approvals`,
  simulation: `${API_BASE_PATH}/assistant/threads/:threadId/simulation`,
  revalidation: `${API_BASE_PATH}/assistant/threads/:threadId/revalidation`,
} as const satisfies Record<string, VersionedApiPath>;

export type AssistantApiPath =
  (typeof assistantApiPaths)[keyof typeof assistantApiPaths];

export const billingApiPaths = {
  subscription: `${API_BASE_PATH}/billing/subscription`,
  activateSubscription: `${API_BASE_PATH}/billing/subscription/activate`,
  changePlan: `${API_BASE_PATH}/billing/subscription/change-plan`,
  cancelSubscription: `${API_BASE_PATH}/billing/subscription/cancel`,
  resumeSubscription: `${API_BASE_PATH}/billing/subscription/resume`,
  paymentPending: `${API_BASE_PATH}/billing/payment/pending`,
  paymentFailed: `${API_BASE_PATH}/billing/payment/failed`,
  paymentRecovered: `${API_BASE_PATH}/billing/payment/recovered`,
  generateInvoice: `${API_BASE_PATH}/billing/invoices/generate`,
  updateUsage: `${API_BASE_PATH}/billing/usage/update`,
  limitReached: `${API_BASE_PATH}/billing/limits/reached`,
  changeEntitlement: `${API_BASE_PATH}/billing/entitlements/change`,
} as const satisfies Record<string, VersionedApiPath>;

export type BillingApiPath = (typeof billingApiPaths)[keyof typeof billingApiPaths];

export const workerJobTypes = [
  "email_outbox",
  "sync",
  "backfill",
  "readiness",
  "metric_calculation",
  "reprocessing",
  "notifications",
  "reports",
  "exports",
  "ai_briefings",
  "cleanup",
  "retry",
  "dlq",
] as const;

export type WorkerJobType = (typeof workerJobTypes)[number];

export const billingSandboxEventTypes = [
  "subscription_activated",
  "plan_changed",
  "subscription_cancelled",
  "subscription_resumed",
  "payment_pending",
  "payment_failed",
  "payment_recovered",
  "invoice_generated",
  "usage_updated",
  "limit_reached",
  "entitlement_changed",
] as const;

export type BillingSandboxEventType = (typeof billingSandboxEventTypes)[number];

export const assistantRefusalCodes = [
  "INSUFFICIENT_DATA",
  "DATA_NOT_READY",
  "DATA_INVALID",
  "DATA_BLOCKED",
  "STALE_FOR_CURRENT_DECISION",
  "PERMISSION_DENIED",
  "ENTITLEMENT_REQUIRED",
  "OUT_OF_SCOPE",
  "UNSUPPORTED_USE_CASE",
  "EVIDENCE_UNAVAILABLE",
  "CONFLICT_UNRESOLVED",
  "SAFETY_POLICY_BLOCK",
  "PROVIDER_UNAVAILABLE",
  "COST_LIMIT_REACHED",
  "GATE_NOT_SATISFIED",
  "INJECTION_DETECTED",
] as const;

export type AssistantRefusalCode = (typeof assistantRefusalCodes)[number];

export const METRIC_CATALOG_VERSION = "2026-05-analytics-v1";

export const metricCatalogScopes = [
  "audited",
  "supplemental",
] as const;

export type MetricCatalogScope = (typeof metricCatalogScopes)[number];

export const metricUnits = [
  "count",
  "days",
  "hours",
  "money",
  "percent",
  "ratio",
] as const;

export type MetricUnit = (typeof metricUnits)[number];

export const metricCalculationStatuses = [
  "ok",
  "zero",
  "partial",
  "no_data",
  "not_configured",
  "not_supported",
  "syncing",
  "needs_reauth",
  "permission_error",
  "network_error",
  "provider_error",
  "error",
] as const;

export type MetricCalculationStatus =
  (typeof metricCalculationStatuses)[number];

export type CanonicalMetricDefinition = {
  readonly key: string;
  readonly name: string;
  readonly catalogScope: MetricCatalogScope;
  readonly unit: MetricUnit;
  readonly formula: string;
  readonly requiredSources: readonly string[];
  readonly qualityNotes: readonly string[];
};

type ExactLength<T extends readonly unknown[], TLength extends number> =
  T & {
    readonly length: TLength;
  };

const defineAuditedMetricCatalog = <
  const T extends readonly CanonicalMetricDefinition[],
>(
  definitions: ExactLength<T, 55>,
): T => definitions;

const defineSupplementalMetricCatalog = <
  const T extends readonly CanonicalMetricDefinition[],
>(
  definitions: ExactLength<T, 3>,
): T => definitions;

const defineCompleteMetricCatalog = <
  const T extends readonly CanonicalMetricDefinition[],
>(
  definitions: ExactLength<T, 58>,
): T => definitions;

export const auditedMetricDefinitions = defineAuditedMetricCatalog([
  {
    key: "roi",
    name: "ROI",
    catalogScope: "audited",
    unit: "ratio",
    formula: "(revenue - purchase_cost - ad_spend) / (purchase_cost + ad_spend)",
    requiredSources: ["commerce", "ads", "costs"],
    qualityNotes: ["Requires confirmed costs and ad spend."],
  },
  {
    key: "purchase_cost",
    name: "Purchase cost",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(fact_order_lines.cogs_total_reporting)",
    requiredSources: ["commerce", "costs"],
    qualityNotes: ["Must be blocked or partial without source authority for costs."],
  },
  {
    key: "impressions",
    name: "Ad impressions",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_ads_daily.impressions)",
    requiredSources: ["ads"],
    qualityNotes: ["Zero is valid only when ads data exists."],
  },
  {
    key: "clicks",
    name: "Ad clicks",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_ads_daily.clicks)",
    requiredSources: ["ads"],
    qualityNotes: ["Zero is valid only when ads data exists."],
  },
  {
    key: "sessions",
    name: "Sessions",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_analytics_daily.sessions)",
    requiredSources: ["analytics"],
    qualityNotes: ["Zero is valid only when analytics data exists."],
  },
  {
    key: "users",
    name: "Users",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_analytics_daily.users_count)",
    requiredSources: ["analytics"],
    qualityNotes: ["Daily users can count the same person more than once."],
  },
  {
    key: "revenue",
    name: "Gross revenue",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(qualified_orders.totalGross)",
    requiredSources: ["commerce"],
    qualityNotes: ["Requires qualified commerce orders."],
  },
  {
    key: "conversion_rate",
    name: "E-commerce conversion rate",
    catalogScope: "audited",
    unit: "percent",
    formula: "orders_count / sessions * 100",
    requiredSources: ["commerce", "analytics"],
    qualityNotes: ["Uses commerce orders, not ad platform purchases."],
  },
  {
    key: "ctr",
    name: "CTR",
    catalogScope: "audited",
    unit: "percent",
    formula: "clicks / impressions * 100",
    requiredSources: ["ads"],
    qualityNotes: ["No artificial zero when impressions are missing."],
  },
  {
    key: "ad_spend",
    name: "Ad spend",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(fact_ads_daily.spend_reporting)",
    requiredSources: ["ads"],
    qualityNotes: ["Requires currency policy and source authority."],
  },
  {
    key: "purchases",
    name: "Ad platform purchases",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_ads_daily.conversions)",
    requiredSources: ["ads"],
    qualityNotes: ["Not equivalent to orders_count."],
  },
  {
    key: "roas",
    name: "ROAS",
    catalogScope: "audited",
    unit: "ratio",
    formula: "revenue / ad_spend",
    requiredSources: ["commerce", "ads"],
    qualityNotes: ["No artificial zero when ad spend is missing."],
  },
  {
    key: "aov",
    name: "Average order value",
    catalogScope: "audited",
    unit: "money",
    formula: "revenue / orders_count",
    requiredSources: ["commerce"],
    qualityNotes: ["Depends on canonical revenue definition."],
  },
  {
    key: "add_to_cart",
    name: "Add to cart",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_analytics_daily.add_to_cart)",
    requiredSources: ["analytics"],
    qualityNotes: ["Zero is valid only when analytics events exist."],
  },
  {
    key: "reach",
    name: "Ad reach",
    catalogScope: "audited",
    unit: "count",
    formula: "exact range reach; fallback SUM(fact_ads_daily.reach)",
    requiredSources: ["ads"],
    qualityNotes: ["Daily reach fallback is partial."],
  },
  {
    key: "avg_cpc",
    name: "Average CPC",
    catalogScope: "audited",
    unit: "money",
    formula: "ad_spend / clicks",
    requiredSources: ["ads"],
    qualityNotes: ["No artificial zero when clicks are missing."],
  },
  {
    key: "avg_cpm",
    name: "Average CPM",
    catalogScope: "audited",
    unit: "money",
    formula: "ad_spend / impressions * 1000",
    requiredSources: ["ads"],
    qualityNotes: ["No artificial zero when impressions are missing."],
  },
  {
    key: "avg_cpv",
    name: "Average CPV",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(video_cost_reporting) / SUM(video_views)",
    requiredSources: ["ads"],
    qualityNotes: ["Partial when video views exist without video cost."],
  },
  {
    key: "net_revenue",
    name: "Net revenue",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(totalNet); fallback totalGross with partial status",
    requiredSources: ["commerce"],
    qualityNotes: ["Not equivalent to gross revenue minus refunds."],
  },
  {
    key: "orders_count",
    name: "Orders count",
    catalogScope: "audited",
    unit: "count",
    formula: "COUNT(qualified_orders)",
    requiredSources: ["commerce"],
    qualityNotes: ["Uses commerce order status policy."],
  },
  {
    key: "avg_products_per_order",
    name: "Average products per order",
    catalogScope: "audited",
    unit: "ratio",
    formula: "products_sold_count / orders_count",
    requiredSources: ["commerce"],
    qualityNotes: ["No artificial zero when orders are missing."],
  },
  {
    key: "avg_order_discount_percent",
    name: "Average order discount percent",
    catalogScope: "audited",
    unit: "percent",
    formula: "AVG(discount / (totalGross + discount) * 100)",
    requiredSources: ["commerce"],
    qualityNotes: ["Skips orders with non-positive pre-discount value."],
  },
  {
    key: "discounted_orders_count",
    name: "Discounted orders count",
    catalogScope: "audited",
    unit: "count",
    formula: "COUNT(orders with discountTotal > 0 or discount code)",
    requiredSources: ["commerce"],
    qualityNotes: ["Requires discount evidence."],
  },
  {
    key: "non_discounted_orders_count",
    name: "Non-discounted orders count",
    catalogScope: "audited",
    unit: "count",
    formula: "MAX(orders_count - discounted_orders_count, 0)",
    requiredSources: ["commerce"],
    qualityNotes: ["Derived from orders and discounted orders."],
  },
  {
    key: "order_fulfillment_time",
    name: "Order fulfillment time",
    catalogScope: "audited",
    unit: "hours",
    formula: "AVG(hours_between(paidAt, fulfilledAt))",
    requiredSources: ["commerce"],
    qualityNotes: ["Partial when fulfillment timestamps are incomplete."],
  },
  {
    key: "cancellation_return_rate",
    name: "Cancellation and return rate",
    catalogScope: "audited",
    unit: "percent",
    formula: "affected_orders / placed_orders * 100",
    requiredSources: ["commerce", "refunds"],
    qualityNotes: ["Each order contributes once to the numerator."],
  },
  {
    key: "payment_methods_used_count",
    name: "Payment methods used count",
    catalogScope: "audited",
    unit: "count",
    formula: "COUNT_DISTINCT(fact_payments.provider)",
    requiredSources: ["payments"],
    qualityNotes: ["Blocked or partial without payments data."],
  },
  {
    key: "delivery_types_selected_count",
    name: "Delivery types selected count",
    catalogScope: "audited",
    unit: "count",
    formula: "COUNT_DISTINCT(shippingMethod)",
    requiredSources: ["commerce"],
    qualityNotes: ["Fallback to channel is partial."],
  },
  {
    key: "discounts",
    name: "Discounts",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(discountTotal)",
    requiredSources: ["commerce"],
    qualityNotes: ["Duplicate of discount_value_total until resolved."],
  },
  {
    key: "discount_uses_count",
    name: "Discount uses count",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(discount code uses); fallback discounted_orders_count",
    requiredSources: ["commerce"],
    qualityNotes: ["Fallback is partial."],
  },
  {
    key: "discounted_purchase_value_total",
    name: "Discounted purchase value total",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(totalGross for discounted orders)",
    requiredSources: ["commerce"],
    qualityNotes: ["Requires discount evidence."],
  },
  {
    key: "discount_value_total",
    name: "Discount value total",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(discountTotal)",
    requiredSources: ["commerce"],
    qualityNotes: ["Duplicate of discounts until resolved."],
  },
  {
    key: "discounted_orders_aov",
    name: "Discounted orders AOV",
    catalogScope: "audited",
    unit: "money",
    formula: "discounted_purchase_value_total / discounted_orders_count",
    requiredSources: ["commerce"],
    qualityNotes: ["No artificial zero when discounted orders are missing."],
  },
  {
    key: "gross_margin_total",
    name: "Gross margin total",
    catalogScope: "audited",
    unit: "money",
    formula: "revenue - purchase_cost",
    requiredSources: ["commerce", "costs"],
    qualityNotes: ["Blocked without confirmed costs and source authority."],
  },
  {
    key: "products_sold_count",
    name: "Products sold count",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(fact_order_lines.quantity)",
    requiredSources: ["commerce"],
    qualityNotes: ["Requires canonical order lines."],
  },
  {
    key: "sold_products_margin_value",
    name: "Sold products margin value",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(fact_order_lines.gross_margin_reporting)",
    requiredSources: ["commerce", "costs"],
    qualityNotes: ["Blocked without confirmed costs and source authority."],
  },
  {
    key: "margin_revenue_share",
    name: "Margin revenue share",
    catalogScope: "audited",
    unit: "percent",
    formula: "gross_margin_total / revenue * 100",
    requiredSources: ["commerce", "costs"],
    qualityNotes: ["Derived from margin and revenue readiness."],
  },
  {
    key: "products_on_promotion_count",
    name: "Products on promotion count",
    catalogScope: "audited",
    unit: "count",
    formula: "COUNT_DISTINCT(products with promotion evidence)",
    requiredSources: ["commerce", "products"],
    qualityNotes: ["Counts unique products, not units sold."],
  },
  {
    key: "promo_product_regular_price",
    name: "Promotion product regular price",
    catalogScope: "audited",
    unit: "money",
    formula: "quantity-weighted regular reference price",
    requiredSources: ["commerce", "products"],
    qualityNotes: ["Catalog or reconstructed price fallback is partial."],
  },
  {
    key: "promo_product_sale_price",
    name: "Promotion product sale price",
    catalogScope: "audited",
    unit: "money",
    formula: "quantity-weighted actual sale price",
    requiredSources: ["commerce", "products"],
    qualityNotes: ["Requires promotional sale evidence."],
  },
  {
    key: "promo_product_discount_percent",
    name: "Promotion product discount percent",
    catalogScope: "audited",
    unit: "percent",
    formula: "(regular_price - sale_price) / regular_price * 100",
    requiredSources: ["commerce", "products"],
    qualityNotes: ["No artificial zero when regular price is missing."],
  },
  {
    key: "customers_total",
    name: "Customers total",
    catalogScope: "audited",
    unit: "count",
    formula: "COUNT_DISTINCT(customerId); fallback customerEmailHash",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Email hash fallback is partial."],
  },
  {
    key: "customers_to_users_ratio",
    name: "Customers to users ratio",
    catalogScope: "audited",
    unit: "ratio",
    formula: "customers_total / users",
    requiredSources: ["commerce", "analytics"],
    qualityNotes: ["Derived from customer and analytics readiness."],
  },
  {
    key: "avg_revenue_per_customer",
    name: "Average revenue per customer",
    catalogScope: "audited",
    unit: "money",
    formula: "revenue / customers_total",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["No artificial zero when customers are missing."],
  },
  {
    key: "orders_per_customer",
    name: "Orders per customer",
    catalogScope: "audited",
    unit: "ratio",
    formula: "orders_count / customers_total",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Duplicate of purchase_frequency until resolved."],
  },
  {
    key: "repeat_purchase_rate",
    name: "Repeat purchase rate",
    catalogScope: "audited",
    unit: "percent",
    formula: "repeat_customers / active_customers * 100",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Uses customer lifetime orders through period end."],
  },
  {
    key: "purchase_frequency",
    name: "Purchase frequency",
    catalogScope: "audited",
    unit: "ratio",
    formula: "orders_count / customers_total",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Duplicate of orders_per_customer until resolved."],
  },
  {
    key: "avg_time_between_purchases",
    name: "Average time between purchases",
    catalogScope: "audited",
    unit: "days",
    formula: "AVG(days_between(customer_orders))",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Requires chronological customer order history."],
  },
  {
    key: "customer_retention_rate",
    name: "Customer retention rate",
    catalogScope: "audited",
    unit: "percent",
    formula: "retained_customers / eligible_customers * 100",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Email hash fallback is partial."],
  },
  {
    key: "customer_churn_rate",
    name: "Customer churn rate",
    catalogScope: "audited",
    unit: "percent",
    formula: "MAX(100 - customer_retention_rate, 0)",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Derived from customer retention readiness."],
  },
  {
    key: "clv",
    name: "Customer lifetime value",
    catalogScope: "audited",
    unit: "money",
    formula: "lifetime_margin / active_customers; fallback lifetime_revenue",
    requiredSources: ["commerce", "customers", "costs"],
    qualityNotes: ["Revenue fallback is partial."],
  },
  {
    key: "ltv",
    name: "Lifetime value",
    catalogScope: "audited",
    unit: "money",
    formula: "lifetime_revenue_total / active_customers_count",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Revenue-based lifetime metric."],
  },
  {
    key: "cac",
    name: "Blended CAC",
    catalogScope: "audited",
    unit: "money",
    formula: "ad_spend / customers_total",
    requiredSources: ["ads", "commerce", "customers"],
    qualityNotes: ["Not equivalent to new-customer CAC."],
  },
  {
    key: "customer_revenue_over_time",
    name: "Customer revenue over time",
    catalogScope: "audited",
    unit: "money",
    formula: "SUM(lifetime customer revenue for active customers)",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Requires customer identity policy."],
  },
  {
    key: "customer_lifetime_orders_count",
    name: "Customer lifetime orders count",
    catalogScope: "audited",
    unit: "count",
    formula: "SUM(lifetime orders for active customers)",
    requiredSources: ["commerce", "customers"],
    qualityNotes: ["Requires customer identity policy."],
  },
] as const);

export const supplementalMetricDefinitions = defineSupplementalMetricCatalog([
  {
    key: "begin_checkout",
    name: "Begin checkout",
    catalogScope: "supplemental",
    unit: "count",
    formula: "SUM(fact_analytics_daily.begin_checkout)",
    requiredSources: ["analytics"],
    qualityNotes: ["Supplemental GA4 metric available with scope=all."],
  },
  {
    key: "new_users",
    name: "New users",
    catalogScope: "supplemental",
    unit: "count",
    formula: "SUM(fact_analytics_daily.new_users)",
    requiredSources: ["analytics"],
    qualityNotes: ["Supplemental GA4 metric available with scope=all."],
  },
  {
    key: "event_count",
    name: "Event count",
    catalogScope: "supplemental",
    unit: "count",
    formula: "SUM(fact_analytics_daily.event_count)",
    requiredSources: ["analytics"],
    qualityNotes: ["Supplemental GA4 metric available with scope=all."],
  },
] as const);

export const canonicalMetricDefinitions = defineCompleteMetricCatalog([
  ...auditedMetricDefinitions,
  ...supplementalMetricDefinitions,
] as const);

export type CanonicalMetricKey =
  (typeof canonicalMetricDefinitions)[number]["key"];

export type AuditedMetricKey =
  (typeof auditedMetricDefinitions)[number]["key"];

export type SupplementalMetricKey =
  (typeof supplementalMetricDefinitions)[number]["key"];

export const metricCatalogSummary = {
  auditedCount: auditedMetricDefinitions.length,
  supplementalCount: supplementalMetricDefinitions.length,
  totalCount: canonicalMetricDefinitions.length,
  version: METRIC_CATALOG_VERSION,
} as const;

export const dashboardMetricConflictKeys = [
  "net_revenue",
  "cac",
  "aov",
  "conversion_rate",
  "roas",
  "orders_per_customer",
  "purchase_frequency",
  "discounts",
  "discount_value_total",
] as const satisfies readonly CanonicalMetricKey[];

export const dashboardOnlyMetricKeys = [
  "gmv",
  "refund_rate",
  "margin",
  "mer",
];
