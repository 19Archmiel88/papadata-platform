/** Shared customer portfolio wire contract. No demo source and no UI dependencies. */
import type { IsoDateTime } from "./index.js";

export type CustomerSegment = "atRisk" | "champions" | "hibernating" | "loyal" | "new" | "potential";

export type CustomerMoney = { readonly amount: number; readonly currency: string };

export type RealCustomersRecord = {
  readonly aov: CustomerMoney;
  readonly consentStatus: "unknown";
  readonly cohortKey: string;
  readonly customerPseudonym: string;
  readonly isNewCustomer: boolean;
  readonly ltv: CustomerMoney;
  readonly ordersCount: number;
  readonly recencyDays: number;
  readonly revenue: CustomerMoney;
  readonly rfmScore: string;
  readonly segmentId: string;
  readonly segmentLabel: string;
};

export type CustomersSegmentSummary = {
  readonly count: number;
  readonly description: string;
  readonly revenue: CustomerMoney;
  readonly segmentId: string;
  readonly segmentLabel: string;
};

export type CustomersParetoBucket = {
  readonly bucket: "A" | "B" | "C";
  readonly customers: number;
  readonly cumulativeRevenueShare: number;
  readonly revenue: CustomerMoney;
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
  readonly spend: CustomerMoney;
};

export type CustomersAffinityRow = { readonly name: string; readonly orders: number; readonly revenue: CustomerMoney };

export type CustomersAffinitySummary = {
  readonly newProducts: readonly CustomersAffinityRow[];
  readonly returningProducts: readonly CustomersAffinityRow[];
};

export type CustomersPriorityAlert = { readonly count: number; readonly revenue: CustomerMoney };

export type CustomersCohort = {
  readonly cohortKey: string;
  /** Any return in a later calendar month; null while that observation is unavailable. */
  readonly retentionRate: number | null;
  readonly retention: readonly CustomersRetentionCell[];
  readonly revenue: CustomerMoney;
  readonly users: number;
};

export type CustomersRetentionCell = {
  readonly monthOffset: number;
  readonly eligibleUsers: number;
  readonly retainedUsers: number;
  readonly rate: number | null;
  readonly complete: boolean;
};

export type CustomersCurrencyCoverage = {
  readonly excludedOrders: number;
  readonly observedCurrencies: readonly string[];
  readonly reportingCurrency: string;
};

export type CustomersFilters = {
  readonly sortBy?: "ltv" | "revenue" | "ordersCount" | "recencyDays" | "customerPseudonym" | null;
  readonly sortDirection?: "asc" | "desc" | null;
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
  readonly scope: {
    readonly asOf: string;
    readonly historyFrom: string;
    readonly periodStart: string;
    readonly periodEndExclusive: string;
    readonly timezone: string;
    readonly calculatedAt: string;
    readonly synchronizedAt: string | null;
    readonly filtersApplyTo: "records_only";
    readonly rfmMethod: "tied_midrank_quintiles_v2";
    readonly ltvMethod: "observed_qualifying_gross_revenue";
  };
  readonly coverage?: {
    readonly qualifyingOrders: number;
    readonly classifiedOrders: number;
    readonly missingReferenceOrders: number;
    readonly ambiguousOrders: number;
    readonly conflictGroups: number;
    readonly firstObservedOrderAt: string | null;
    readonly sourceCount: number;
    readonly historyComplete: false;
  };
  readonly affinity: CustomersAffinitySummary;
  readonly cac: CustomersCacSummary | null;
  readonly cohorts: readonly CustomersCohort[];
  readonly currencyCoverage: CustomersCurrencyCoverage;
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number | null };
  readonly pareto: readonly CustomersParetoBucket[];
  readonly portfolioTotals: CustomersPortfolioTotals;
  readonly priorityAlert: CustomersPriorityAlert | null;
  readonly records: readonly RealCustomersRecord[];
  readonly segments: readonly CustomersSegmentSummary[];
  readonly summary: CustomersSummaryRecord;
  readonly trend: readonly CustomersTrendPoint[];
};

export type CustomersPortfolioTotals = {
  readonly activeCustomers: number;
  readonly aovAllTime: CustomerMoney | null;
  readonly newCustomers: number;
  readonly returningCustomers: number;
  readonly totalCustomers: number;
  readonly totalLtv: CustomerMoney;
  readonly totalWindowRevenue: CustomerMoney;
};
