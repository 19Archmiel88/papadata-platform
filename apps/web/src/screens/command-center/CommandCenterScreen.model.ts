import type { DateRange } from '../../../../../contracts/ui-contract-types';

export type OverviewDay = {
  readonly date: string;
  readonly revenue: number;
  readonly costOfGoods: number;
  readonly fulfillmentCost: number;
  readonly marketingSpend: number;
  readonly newCustomers: number;
  readonly orders: number;
};

export type OverviewDecision = {
  readonly id: string;
  readonly title: string;
  readonly reason: string;
  readonly owner: string;
  readonly due: string;
  readonly effect: string;
  readonly evidence: readonly { readonly label: string; readonly value: string }[];
  readonly path: string;
};

export type OverviewSource = {
  readonly id: string;
  readonly name: string;
  readonly status: 'ready' | 'partial' | 'stale';
  readonly detail: string;
};

export type CommandCenterScreenData = {
  readonly mode: 'demo' | 'live';
  readonly currency: 'PLN';
  readonly timezone: string;
  readonly days: readonly OverviewDay[];
  readonly decisions: readonly OverviewDecision[];
  readonly sources: readonly OverviewSource[];
  readonly lastUpdated: string;
};

export type OverviewComparison = 'previous_period' | 'previous_year';
export type OverviewMetric = 'revenue' | 'margin' | 'marketingSpend' | 'newCustomers';
export type OverviewSection = 'metrics' | 'trend' | 'drivers' | 'decisions' | 'data';
export type OverviewTotals = Record<
  OverviewMetric | 'costOfGoods' | 'fulfillmentCost' | 'orders',
  number
>;
export type OverviewPoint = {
  readonly date: string;
  readonly current: number | null;
  readonly previous: number | null;
};
export type OverviewDriver = {
  readonly label: string;
  readonly value: number;
  readonly explanation: string;
};
export type OverviewResult = {
  readonly range: DateRange;
  readonly previousRange: DateRange;
  readonly current: OverviewTotals;
  readonly previous: OverviewTotals;
  readonly currentDays: number;
  readonly previousDays: number;
  readonly expectedDays: number;
  readonly points: readonly OverviewPoint[];
  readonly drivers: readonly OverviewDriver[];
};
