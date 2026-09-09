import type { CustomersPortfolio, IsoDateTime } from '@papadata/contracts';

/** Fixed, explicitly labelled scenario, not a production fallback or a calibrated model. */
export const customerPortfolioFixture: CustomersPortfolio = {
  scope: { asOf: '2026-08-31T21:59:59.999Z', historyFrom: '2020-01-01T00:00:00.000Z', periodStart: '2026-08-01T00:00:00.000Z',
    periodEndExclusive: '2026-08-31T22:00:00.000Z', timezone: 'Europe/Warsaw', calculatedAt: '2026-09-01T09:00:00.000Z',
    synchronizedAt: null, filtersApplyTo: 'records_only', rfmMethod: 'tied_midrank_quintiles_v2', ltvMethod: 'observed_qualifying_gross_revenue' },
  records: [
    { customerPseudonym: 'customer-demo-a', segmentId: 'demo-loyal', segmentLabel: 'Loyal Customers', rfmScore: '444', ordersCount: 4, recencyDays: 6, ltv: { amount: 1600, currency: 'PLN' }, revenue: { amount: 400, currency: 'PLN' }, aov: { amount: 400, currency: 'PLN' }, cohortKey: '2026-05', isNewCustomer: false, consentStatus: 'unknown' },
    { customerPseudonym: 'customer-demo-b', segmentId: 'demo-risk', segmentLabel: 'At Risk', rfmScore: '244', ordersCount: 3, recencyDays: 61, ltv: { amount: 1200, currency: 'PLN' }, revenue: { amount: 0, currency: 'PLN' }, aov: { amount: 400, currency: 'PLN' }, cohortKey: '2026-04', isNewCustomer: false, consentStatus: 'unknown' },
    { customerPseudonym: 'customer-demo-c', segmentId: 'demo-new', segmentLabel: 'New', rfmScore: '411', ordersCount: 1, recencyDays: 5, ltv: { amount: 200, currency: 'PLN' }, revenue: { amount: 200, currency: 'PLN' }, aov: { amount: 200, currency: 'PLN' }, cohortKey: '2026-08', isNewCustomer: true, consentStatus: 'unknown' },
  ],
  portfolioTotals: { activeCustomers: 2, newCustomers: 1, returningCustomers: 1, totalCustomers: 3, totalLtv: { amount: 3000, currency: 'PLN' }, totalWindowRevenue: { amount: 600, currency: 'PLN' }, aovAllTime: { amount: 375, currency: 'PLN' } },
  pageInfo: { nextCursor: null, total: 3 },
  summary: { total: 3, ready: 2, critical: 0, warning: 1, updatedAt: '2026-09-01T09:00:00.000Z' as IsoDateTime },
  segments: [{ count: 1, description: 'Scenariusz demonstracyjny', segmentId: 'demo-loyal', segmentLabel: 'Loyal Customers', revenue: { amount: 1600, currency: 'PLN' } },
    { count: 1, description: 'Scenariusz demonstracyjny', segmentId: 'demo-risk', segmentLabel: 'At Risk', revenue: { amount: 1200, currency: 'PLN' } },
    { count: 1, description: 'Scenariusz demonstracyjny', segmentId: 'demo-new', segmentLabel: 'New', revenue: { amount: 200, currency: 'PLN' } }],
  cohorts: ['2026-04', '2026-05', '2026-08'].map((cohortKey, index) => ({ cohortKey, users: 1,
    revenue: { amount: [1200, 1600, 200][index]!, currency: 'PLN' }, retentionRate: index === 2 ? null : 1,
    retention: Array.from({ length: 12 }, (_, i) => { const complete = (Number(cohortKey.slice(5)) + i + 1) < 8;
      const retainedUsers = index < 2 && i === 0 ? 1 : 0;
      return { monthOffset: i + 1, complete, eligibleUsers: complete ? 1 : 0, retainedUsers, rate: complete ? retainedUsers : null }; }), })),
  pareto: [{ bucket: 'A', customers: 2, revenue: { amount: 2800, currency: 'PLN' }, cumulativeRevenueShare: 2800 / 3000 },
    { bucket: 'B', customers: 1, revenue: { amount: 200, currency: 'PLN' }, cumulativeRevenueShare: 1 }],
  currencyCoverage: { reportingCurrency: 'PLN', observedCurrencies: ['PLN'], excludedOrders: 0 },
  cac: null,
  affinity: { newProducts: [], returningProducts: [] },
  priorityAlert: { count: 1, revenue: { amount: 1200, currency: 'PLN' } },
  trend: [{ date: '2026-08-25', newCustomers: 0, returningCustomers: 1, newRevenue: 0, returningRevenue: 400 },
    { date: '2026-08-26', newCustomers: 1, returningCustomers: 0, newRevenue: 200, returningRevenue: 0 }],
};
