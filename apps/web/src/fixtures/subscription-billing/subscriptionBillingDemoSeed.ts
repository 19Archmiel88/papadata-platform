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
    periodEnd: '2026-09-01T00:00:00.000Z',
    periodStart: '2026-08-01T00:00:00.000Z',
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
  documents: {
    invoiceCount: 2,
    paymentCount: 2,
    paymentMethodConfigured: true,
  },
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
