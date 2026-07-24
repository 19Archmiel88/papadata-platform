import type {
  IsoDateTime,
  TenantWorkspaceScope,
} from "./index.js";
import type { MvpIntegrationCatalogProviderId } from "./integration-platform.js";

export type CurrencyCode = string;

export type Money = {
  readonly amountMinor: bigint;
  readonly currency: CurrencyCode;
};

export type ConvertedMoney = {
  readonly source: Money;
  readonly reporting: Money;
  readonly exchangeRate: string;
  readonly rateSource: string;
  readonly rateObservedAt: IsoDateTime;
  readonly roundingMode: "half_even";
};

export const canonicalOrderStatuses = [
  "pending",
  "confirmed",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
  "partially_refunded",
  "returned",
] as const;

export type CanonicalOrderStatus = (typeof canonicalOrderStatuses)[number];

export type CanonicalOrderLine = {
  readonly lineId: string;
  readonly externalLineId: string;
  readonly productId: string | null;
  readonly variantId: string | null;
  readonly sku: string | null;
  readonly name: string;
  readonly quantity: number;
  readonly gross: Money;
  readonly net: Money;
  readonly discount: Money;
  readonly tax: Money;
  readonly fee: Money;
};

export type CanonicalPayment = {
  readonly paymentId: string;
  readonly method: string;
  readonly status: "pending" | "authorized" | "captured" | "failed" | "refunded";
  readonly amount: Money;
  readonly paidAt: IsoDateTime | null;
};

export type CanonicalRefund = {
  readonly refundId: string;
  readonly amount: Money;
  readonly reason: string | null;
  readonly createdAt: IsoDateTime;
};

export type CanonicalReturn = {
  readonly returnId: string;
  readonly status: "requested" | "accepted" | "received" | "rejected" | "completed";
  readonly amount: Money;
  readonly createdAt: IsoDateTime;
};

export type CanonicalOrder = TenantWorkspaceScope & {
  readonly orderId: string;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly externalOrderId: string;
  readonly externalOrderNumber: string | null;
  readonly status: CanonicalOrderStatus;
  readonly sourceCurrency: CurrencyCode;
  readonly reportingCurrency: CurrencyCode;
  readonly gross: Money;
  readonly net: Money;
  readonly discount: Money;
  readonly tax: Money;
  readonly shipping: Money;
  readonly fees: Money;
  readonly refunded: Money;
  readonly reportingGross: ConvertedMoney | null;
  readonly businessTime: IsoDateTime;
  readonly effectiveTime: IsoDateTime;
  readonly timezone: string;
  readonly sourceAuthorityVersion: string;
  readonly mappingVersion: string;
  readonly deduplicationVersion: string;
  readonly lines: readonly CanonicalOrderLine[];
  readonly payments: readonly CanonicalPayment[];
  readonly refunds: readonly CanonicalRefund[];
  readonly returns: readonly CanonicalReturn[];
};

export type SourceAuthorityRule = TenantWorkspaceScope & {
  readonly ruleId: string;
  readonly factType: string;
  readonly fieldPath: string;
  readonly providerPriority: readonly MvpIntegrationCatalogProviderId[];
  readonly owner: string;
  readonly rationale: string;
  readonly status: "draft" | "active" | "retired";
  readonly validFrom: IsoDateTime;
  readonly validTo: IsoDateTime | null;
  readonly version: string;
};

export type OverlapCandidate = TenantWorkspaceScope & {
  readonly candidateId: string;
  readonly leftProviderId: MvpIntegrationCatalogProviderId;
  readonly leftExternalId: string;
  readonly rightProviderId: MvpIntegrationCatalogProviderId;
  readonly rightExternalId: string;
  readonly score: number;
  readonly matchingSignals: readonly string[];
  readonly state: "automatic_match" | "manual_review" | "rejected";
  readonly deduplicationVersion: string;
};
