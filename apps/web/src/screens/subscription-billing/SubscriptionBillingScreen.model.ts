export type SubscriptionBillingStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'grace'
  | 'pastDue'
  | 'trial'
  | 'unknown';

export type SubscriptionBillingViewState =
  | 'error'
  | 'forbidden'
  | 'loading'
  | 'partial'
  | 'ready';

export type SubscriptionBillingMoney = {
  readonly amount: number;
  readonly currency: 'EUR' | 'PLN' | 'USD';
};

export type SubscriptionBillingEntitlement = {
  readonly enabled: boolean;
  readonly id: string;
  readonly label: string;
};

export type SubscriptionBillingScreenData = {
  readonly currentPlan: {
    readonly code: string | null;
    readonly name: string | null;
    readonly monthlyPrice: SubscriptionBillingMoney | null;
    readonly availablePlanCount: number | null;
  };
  readonly subscription: {
    readonly amount: SubscriptionBillingMoney | null;
    readonly periodEnd: string | null;
    readonly periodStart: string | null;
    readonly status: SubscriptionBillingStatus;
  };
  readonly usage: {
    readonly connectedDataSources: number | null;
    readonly maxDataSources: number | null;
  };
  readonly entitlements: readonly SubscriptionBillingEntitlement[];
  readonly documents: {
    readonly invoiceCount: number | null;
    readonly paymentCount: number | null;
    readonly paymentMethodConfigured: boolean | null;
  };
  readonly limitations: readonly string[];
};

export type SubscriptionBillingScreenProps = {
  readonly data: SubscriptionBillingScreenData | null;
  readonly onReload?: (() => void) | undefined;
  readonly problem?: string | null;
  readonly state?: SubscriptionBillingViewState;
};
