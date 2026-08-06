/**
 * Pure domain policies ported from papadata-main and adapted to the current
 * package boundaries. This module intentionally has no Prisma, NestJS or I/O
 * dependency so API, BFF and worker code can share the same decisions.
 */

export type CanonicalBillingStatus =
  | "TRIAL"
  | "ACTIVE"
  | "PAST_DUE"
  | "GRACE"
  | "EXPIRED"
  | "CANCELED";

export type AccessState =
  | "BLOCKED"
  | "PENDING_TENANT_SELECTION"
  | "NO_TENANT"
  | "SETUP_REQUIRED"
  | "BILLING_REQUIRED"
  | "READ_ONLY"
  | "ACTIVE";

export type AccessMode = "FULL" | "READ_ONLY" | "BILLING_ONLY" | null;

export type AccessReason =
  | "SECURITY_BLOCKED"
  | "TENANT_SELECTION_REQUIRED"
  | "NO_TENANT_MEMBERSHIP"
  | "ONBOARDING_INCOMPLETE"
  | "BILLING_PAST_DUE"
  | "BILLING_GRACE"
  | "BILLING_EXPIRED"
  | "BILLING_CANCELED"
  | "ENTITLEMENT_READ_ONLY";

export type AccessResolution = {
  readonly accessState: AccessState;
  readonly accessMode: AccessMode;
  readonly reasons: readonly AccessReason[];
};

export type ResolveAccessInput = {
  readonly billingStatus: CanonicalBillingStatus;
  readonly membershipsCount: number;
  readonly hasMultipleTenants: boolean;
  readonly activeTenantId: string | null;
  readonly securityBlocked?: boolean;
  readonly onboardingCompletedAt?: Date | null;
  readonly entitlementsWrite?: boolean;
};

export function mapBillingStatus(raw: string | null | undefined): CanonicalBillingStatus {
  switch (raw?.trim().toUpperCase()) {
    case "TRIALING":
    case "TRIAL":
      return "TRIAL";
    case "ACTIVE":
      return "ACTIVE";
    case "PAST_DUE":
      return "PAST_DUE";
    case "GRACE":
      return "GRACE";
    case "INACTIVE":
    case "EXPIRED":
      return "EXPIRED";
    case "CANCELED":
    case "CANCELLED":
      return "CANCELED";
    default:
      return "TRIAL";
  }
}

export function resolveAccess(input: ResolveAccessInput): AccessResolution {
  const reasons: AccessReason[] = [];
  const tenantSelectionGap = input.hasMultipleTenants && input.activeTenantId === null;
  const noMembership = input.membershipsCount === 0;
  const onboardingIncomplete = input.onboardingCompletedAt === null;
  const pastDue = input.billingStatus === "PAST_DUE";
  const grace = input.billingStatus === "GRACE";
  const expired = input.billingStatus === "EXPIRED";
  const canceled = input.billingStatus === "CANCELED";
  const readOnly = input.entitlementsWrite === false;

  if (input.securityBlocked === true) reasons.push("SECURITY_BLOCKED");
  if (tenantSelectionGap) reasons.push("TENANT_SELECTION_REQUIRED");
  if (noMembership) reasons.push("NO_TENANT_MEMBERSHIP");
  if (onboardingIncomplete) reasons.push("ONBOARDING_INCOMPLETE");
  if (pastDue) reasons.push("BILLING_PAST_DUE");
  if (grace) reasons.push("BILLING_GRACE");
  if (expired) reasons.push("BILLING_EXPIRED");
  if (canceled) reasons.push("BILLING_CANCELED");
  if (readOnly) reasons.push("ENTITLEMENT_READ_ONLY");

  if (input.securityBlocked === true) return { accessState: "BLOCKED", accessMode: null, reasons };
  if (tenantSelectionGap) return { accessState: "PENDING_TENANT_SELECTION", accessMode: null, reasons };
  if (noMembership) return { accessState: "NO_TENANT", accessMode: null, reasons };
  if (onboardingIncomplete) return { accessState: "SETUP_REQUIRED", accessMode: "FULL", reasons };
  if (expired || canceled) return { accessState: "BILLING_REQUIRED", accessMode: "BILLING_ONLY", reasons };
  if (pastDue || readOnly) return { accessState: "READ_ONLY", accessMode: "READ_ONLY", reasons };
  return { accessState: "ACTIVE", accessMode: "FULL", reasons };
}

export type BillingTaxRegime =
  | "domestic_pl"
  | "eu_reverse_charge"
  | "eu_vat_required"
  | "non_eu"
  | "unknown";

export type BillingVatValidationStatus =
  | "unknown"
  | "valid"
  | "invalid"
  | "unavailable"
  | "not_required";

export type BillingTaxDecision = {
  readonly taxCountry: string | null;
  readonly vatIdCountryCode: string | null;
  readonly isBusinessCustomer: boolean;
  readonly vatValidationStatus: BillingVatValidationStatus;
  readonly reverseChargeEligible: boolean;
  readonly reverseChargeApplied: boolean;
  readonly taxRegime: BillingTaxRegime;
  readonly requiresReview: boolean;
};

const euCountryCodes = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI",
  "FR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL",
  "PT", "RO", "SE", "SI", "SK",
]);

export function normalizeTaxCountry(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/u.test(normalized)) return null;
  return normalized === "GR" ? "EL" : normalized;
}

export function normalizeVatIdentifier(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase().replace(/[\s.-]+/gu, "");
  return normalized.length > 0 ? normalized : null;
}

export function readVatCountryCode(value: string | null | undefined): string | null {
  const vatId = normalizeVatIdentifier(value);
  if (!vatId || vatId.length < 2) return null;
  const prefix = vatId.slice(0, 2);
  return /^[A-Z]{2}$/u.test(prefix) ? normalizeTaxCountry(prefix) : null;
}

export function isEuTaxCountry(countryCode: string | null | undefined): boolean {
  const normalized = normalizeTaxCountry(countryCode);
  return normalized !== null && euCountryCodes.has(normalized);
}

export function resolveBillingTaxDecision(input: {
  readonly taxCountry?: string | null;
  readonly vatId?: string | null;
  readonly nip?: string | null;
  readonly isBusinessCustomer?: boolean;
  readonly vatValidationStatus?: BillingVatValidationStatus;
}): BillingTaxDecision {
  const taxCountry = normalizeTaxCountry(input.taxCountry);
  const vatId = normalizeVatIdentifier(input.vatId) ?? normalizeVatIdentifier(input.nip);
  const vatValidationStatus = input.vatValidationStatus ?? "unknown";
  const isBusinessCustomer = input.isBusinessCustomer ?? vatId !== null;
  const vatIdCountryCode = readVatCountryCode(vatId);

  if (!taxCountry) {
    return decision(null, vatIdCountryCode, isBusinessCustomer, vatValidationStatus, false, "unknown", true);
  }
  if (taxCountry === "PL") {
    return decision(taxCountry, vatIdCountryCode, isBusinessCustomer,
      vatValidationStatus === "unknown" ? "not_required" : vatValidationStatus,
      false, "domestic_pl", false);
  }
  if (!isEuTaxCountry(taxCountry)) {
    return decision(taxCountry, vatIdCountryCode, isBusinessCustomer,
      vatValidationStatus === "unknown" ? "not_required" : vatValidationStatus,
      false, "non_eu", false);
  }
  if (!isBusinessCustomer) {
    return decision(taxCountry, vatIdCountryCode, false,
      vatValidationStatus === "unknown" ? "not_required" : vatValidationStatus,
      false, "eu_vat_required", false);
  }
  if (vatValidationStatus === "valid") {
    return decision(taxCountry, vatIdCountryCode, true, vatValidationStatus, true, "eu_reverse_charge", false);
  }
  if (vatValidationStatus === "invalid") {
    return decision(taxCountry, vatIdCountryCode, true, vatValidationStatus, false, "eu_vat_required", true);
  }
  return decision(taxCountry, vatIdCountryCode, true, vatValidationStatus, false, "unknown", true);
}

function decision(
  taxCountry: string | null,
  vatIdCountryCode: string | null,
  isBusinessCustomer: boolean,
  vatValidationStatus: BillingVatValidationStatus,
  reverseCharge: boolean,
  taxRegime: BillingTaxRegime,
  requiresReview: boolean,
): BillingTaxDecision {
  return {
    taxCountry,
    vatIdCountryCode,
    isBusinessCustomer,
    vatValidationStatus,
    reverseChargeEligible: reverseCharge,
    reverseChargeApplied: reverseCharge,
    taxRegime,
    requiresReview,
  };
}

export type KsefReadinessMetadata = {
  readonly ksefStatus: "not_integrated" | "unavailable";
  readonly invoiceFormat: "standard_invoice" | "ksef_not_integrated";
  readonly ksefApiIntegrationImplemented: false;
};

export function resolveKsefReadinessMetadata(input: {
  readonly taxCountry: string | null;
}): KsefReadinessMetadata {
  const taxCountry = normalizeTaxCountry(input.taxCountry);
  if (!taxCountry) {
    return {
      ksefStatus: "unavailable",
      invoiceFormat: "standard_invoice",
      ksefApiIntegrationImplemented: false,
    };
  }
  return {
    ksefStatus: "not_integrated",
    invoiceFormat: taxCountry === "PL" ? "ksef_not_integrated" : "standard_invoice",
    ksefApiIntegrationImplemented: false,
  };
}

const currencyAliases: Readonly<Record<string, string>> = {
  zl: "PLN",
  pln: "PLN",
  eur: "EUR",
  usd: "USD",
  gbp: "GBP",
  czk: "CZK",
  sek: "SEK",
  nok: "NOK",
};

export function normalizeCurrencyCode(value: string | undefined | null): string {
  if (!value) return "PLN";
  const normalized = value.trim().toLowerCase();
  return currencyAliases[normalized] ?? normalized.toUpperCase();
}

export type ProviderErrorTaxonomy = {
  readonly class: "rate_limited" | "reauth_required" | "invalid_input" | "provider_unavailable" | "conflict" | "unknown";
  readonly code: string;
  readonly retryable: boolean;
  readonly recommendation: string;
};

export function mapProviderErrorTaxonomy(input: {
  readonly code?: string | null;
  readonly message?: string | null;
}): ProviderErrorTaxonomy | null {
  const code = input.code?.trim().toUpperCase() ?? "";
  if (!code) return null;
  if (code.includes("RATE_LIMIT")) return taxonomy("rate_limited", code, true, "Respect Retry-After/cooldown and retry after next window.");
  if (/REAUTH|AUTH_INVALID|TOKEN_EXPIRED/u.test(code)) return taxonomy("reauth_required", code, false, "Re-authorize credentials for this provider connection.");
  if (/VALIDATION|CREDENTIALS_INVALID|INPUT_INVALID/u.test(code)) return taxonomy("invalid_input", code, false, "Correct provider input fields and run test connection again.");
  if (/TIMEOUT|DEPENDENCY_UNAVAILABLE|PROVIDER_HTTP_ERROR|PROVIDER_RETRYABLE_ERROR/u.test(code)) return taxonomy("provider_unavailable", code, true, "Provider is temporarily unavailable; retry with backoff.");
  if (/CONFLICT|DUPLICATE/u.test(code)) return taxonomy("conflict", code, false, "Resolve duplicate/conflict state before retrying.");
  return taxonomy("unknown", code, false, "Review sync error details and provider diagnostics.");
}

function taxonomy(
  classification: ProviderErrorTaxonomy["class"],
  code: string,
  retryable: boolean,
  recommendation: string,
): ProviderErrorTaxonomy {
  return { class: classification, code, retryable, recommendation };
}

export type MigratedCommercialPlan = {
  readonly id: "starter" | "growth" | "scale";
  readonly name: string;
  readonly monthlyPricePln: number;
  readonly entitlements: {
    readonly write: boolean;
    readonly maxDataSources: number;
    readonly aiEnabled: boolean;
    readonly reportsEnabled: boolean;
    readonly exportsEnabled: boolean;
  };
};

export const migratedCommercialPlans: readonly MigratedCommercialPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPricePln: 199,
    entitlements: { write: true, maxDataSources: 3, aiEnabled: false, reportsEnabled: true, exportsEnabled: true },
  },
  {
    id: "growth",
    name: "Growth",
    monthlyPricePln: 499,
    entitlements: { write: true, maxDataSources: 10, aiEnabled: true, reportsEnabled: true, exportsEnabled: true },
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPricePln: 999,
    entitlements: { write: true, maxDataSources: 50, aiEnabled: true, reportsEnabled: true, exportsEnabled: true },
  },
] as const;

export function entitlementsForMigratedPlan(planId: string | null | undefined): MigratedCommercialPlan["entitlements"] {
  return (migratedCommercialPlans.find((plan) => plan.id === planId) ?? migratedCommercialPlans[0]).entitlements;
}

export type MigratedSourcePriorityRule = {
  readonly domain: "orders" | "products" | "customers" | "advertising" | "analytics";
  readonly authoritativeProviders: readonly string[];
  readonly fallbackProviders: readonly string[];
  readonly fieldOwnership: Readonly<Record<string, string>>;
};

export const migratedSourcePriorityPolicy: readonly MigratedSourcePriorityRule[] = [
  {
    domain: "orders",
    authoritativeProviders: ["shopify", "woocommerce", "baselinker", "allegro"],
    fallbackProviders: ["ga4"],
    fieldOwnership: {
      orderStatus: "commerce_provider",
      grossAmount: "commerce_provider",
      currency: "commerce_provider",
      acquisitionChannel: "analytics_or_ads",
    },
  },
  {
    domain: "products",
    authoritativeProviders: ["shopify", "woocommerce", "baselinker", "allegro"],
    fallbackProviders: [],
    fieldOwnership: {
      sku: "commerce_provider",
      inventory: "commerce_provider",
      price: "commerce_provider",
    },
  },
  {
    domain: "customers",
    authoritativeProviders: ["shopify", "woocommerce"],
    fallbackProviders: ["baselinker", "allegro"],
    fieldOwnership: {
      identity: "commerce_provider",
      consent: "identity_or_commerce_provider",
      cohort: "papadata_derived",
    },
  },
  {
    domain: "advertising",
    authoritativeProviders: ["google_ads", "meta_ads"],
    fallbackProviders: ["ga4"],
    fieldOwnership: {
      spend: "ads_provider",
      impressions: "ads_provider",
      clicks: "ads_provider",
      attributedRevenue: "papadata_reconciled",
    },
  },
  {
    domain: "analytics",
    authoritativeProviders: ["ga4"],
    fallbackProviders: ["shopify", "woocommerce"],
    fieldOwnership: {
      sessions: "ga4",
      events: "ga4",
      conversionRate: "papadata_reconciled",
    },
  },
] as const;
