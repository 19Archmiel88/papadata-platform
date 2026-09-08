import type {
  SubscriptionBillingScreenData,
  SubscriptionBillingStatus,
} from '../../screens/subscription-billing/SubscriptionBillingScreen.model';

export const subscriptionBillingDemoSeed: SubscriptionBillingScreenData = {
  currentPlan: {
    availablePlanCount: 3,
    code: 'growth',
    monthlyPrice: {
      amount: 499,
      currency: 'PLN',
    },
    name: 'Growth',
  },
  subscription: {
    amount: {
      amount: 499,
      currency: 'PLN',
    },
    periodEnd: '2026-10-01T00:00:00.000Z',
    periodStart: '2026-09-01T00:00:00.000Z',
    status: 'active',
  },
  usage: {
    connectedDataSources: 6,
    maxDataSources: 10,
  },
  entitlements: [
    { enabled: true, id: 'write', label: 'Operacje zapisu' },
    { enabled: true, id: 'ai', label: 'Papa Asystent' },
    { enabled: true, id: 'reports', label: 'Raporty' },
    { enabled: true, id: 'exports', label: 'Eksport danych' },
  ],
  billing: {
    autoRenew: true,
    cycle: 'monthly',
    nextChargeAt: '2026-10-01T00:00:00.000Z',
    paymentMethodLabel: 'Visa •••• 4242 · ważna do 08/29',
  },
  documents: {
    invoiceCount: 4,
    paymentCount: 4,
    paymentMethodConfigured: true,
  },
  invoices: [
    {
      amount: { amount: 499, currency: 'PLN' },
      dueAt: '2026-09-08T00:00:00.000Z',
      id: 'inv_2026_09',
      issuedAt: '2026-09-01T00:00:00.000Z',
      number: 'FV/09/2026/0193',
      status: 'paid',
    },
    {
      amount: { amount: 499, currency: 'PLN' },
      dueAt: '2026-08-08T00:00:00.000Z',
      id: 'inv_2026_08',
      issuedAt: '2026-08-01T00:00:00.000Z',
      number: 'FV/08/2026/0172',
      status: 'paid',
    },
    {
      amount: { amount: 499, currency: 'PLN' },
      dueAt: '2026-07-08T00:00:00.000Z',
      id: 'inv_2026_07',
      issuedAt: '2026-07-01T00:00:00.000Z',
      number: 'FV/07/2026/0151',
      status: 'paid',
    },
    {
      amount: { amount: 499, currency: 'PLN' },
      dueAt: '2026-06-08T00:00:00.000Z',
      id: 'inv_2026_06',
      issuedAt: '2026-06-01T00:00:00.000Z',
      number: 'FV/06/2026/0130',
      status: 'paid',
    },
  ],
  payments: [
    {
      amount: { amount: 499, currency: 'PLN' },
      createdAt: '2026-09-01T08:16:00.000Z',
      id: 'pay_2026_09',
      methodLabel: 'Visa •••• 4242',
      status: 'succeeded',
    },
    {
      amount: { amount: 499, currency: 'PLN' },
      createdAt: '2026-08-01T08:12:00.000Z',
      id: 'pay_2026_08',
      methodLabel: 'Visa •••• 4242',
      status: 'succeeded',
    },
    {
      amount: { amount: 499, currency: 'PLN' },
      createdAt: '2026-07-01T08:08:00.000Z',
      id: 'pay_2026_07',
      methodLabel: 'Visa •••• 4242',
      status: 'succeeded',
    },
    {
      amount: { amount: 499, currency: 'PLN' },
      createdAt: '2026-06-01T08:03:00.000Z',
      id: 'pay_2026_06',
      methodLabel: 'Visa •••• 4242',
      status: 'succeeded',
    },
  ],
  plans: [
    {
      annualPrice: { amount: 2388, currency: 'PLN' },
      code: 'starter',
      description: 'Dla małych zespołów, które porządkują podstawową analitykę sprzedaży.',
      features: ['3 źródła danych', 'Podstawowe dashboardy', 'Raport miesięczny'],
      monthlyPrice: { amount: 249, currency: 'PLN' },
      name: 'Starter',
    },
    {
      annualPrice: { amount: 4788, currency: 'PLN' },
      code: 'growth',
      description: 'Pełny zestaw analityki, automatyzacji i Papa Asystenta dla rozwijającego się e-commerce.',
      features: ['10 źródeł danych', 'Papa Asystent', 'Raporty i eksporty', 'Alerty i rekomendacje'],
      monthlyPrice: { amount: 499, currency: 'PLN' },
      name: 'Growth',
      recommended: true,
    },
    {
      annualPrice: { amount: 9588, currency: 'PLN' },
      code: 'scale',
      description: 'Dla większych zespołów potrzebujących rozbudowanej kontroli, limitów i wsparcia.',
      features: ['25 źródeł danych', 'Zaawansowane role', 'Priorytetowe wsparcie', 'Rozszerzona retencja danych'],
      monthlyPrice: { amount: 999, currency: 'PLN' },
      name: 'Scale',
    },
  ],
  limitations: [
    'Operacje providera płatności i integracja KSeF pozostają zależne od konfiguracji środowiska.',
  ],
};

export function createSubscriptionBillingDemoState(
  status: SubscriptionBillingStatus,
): SubscriptionBillingScreenData {
  return {
    ...subscriptionBillingDemoSeed,
    subscription: {
      ...subscriptionBillingDemoSeed.subscription,
      status,
    },
  };
}
