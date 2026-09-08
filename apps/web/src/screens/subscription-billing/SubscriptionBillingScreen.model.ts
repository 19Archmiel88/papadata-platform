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

export type SubscriptionBillingCycle = 'annual' | 'monthly';

export type SubscriptionBillingMoney = {
  readonly amount: number;
  readonly currency: 'EUR' | 'PLN' | 'USD';
};

export type SubscriptionBillingEntitlement = {
  readonly enabled: boolean;
  readonly id: string;
  readonly label: string;
};

export type SubscriptionBillingPlan = {
  readonly annualPrice: SubscriptionBillingMoney | null;
  readonly code: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly monthlyPrice: SubscriptionBillingMoney | null;
  readonly name: string;
  readonly recommended?: boolean;
};

export type SubscriptionBillingInvoice = {
  readonly amount: SubscriptionBillingMoney;
  readonly dueAt: string | null;
  readonly id: string;
  readonly issuedAt: string;
  readonly number: string;
  readonly status: 'open' | 'overdue' | 'paid';
};

export type SubscriptionBillingPayment = {
  readonly amount: SubscriptionBillingMoney;
  readonly createdAt: string;
  readonly id: string;
  readonly methodLabel: string;
  readonly status: 'failed' | 'pending' | 'succeeded';
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
  readonly billing?: {
    readonly autoRenew: boolean | null;
    readonly cycle: SubscriptionBillingCycle | null;
    readonly nextChargeAt: string | null;
    readonly paymentMethodLabel: string | null;
  };
  readonly invoices?: readonly SubscriptionBillingInvoice[];
  readonly payments?: readonly SubscriptionBillingPayment[];
  readonly plans?: readonly SubscriptionBillingPlan[];
  readonly limitations: readonly string[];
};

export type SubscriptionBillingScreenProps = {
  readonly data: SubscriptionBillingScreenData | null;
  readonly onAutoRenewChange?: ((enabled: boolean) => void) | undefined;
  readonly onBillingCycleChange?: ((cycle: SubscriptionBillingCycle) => void) | undefined;
  readonly onCancelSubscription?: (() => void) | undefined;
  readonly onInvoiceDownload?: ((invoiceId: string) => void) | undefined;
  readonly onPaymentMethodChange?: (() => void) | undefined;
  readonly onPlanChange?: ((planCode: string, cycle: SubscriptionBillingCycle) => void) | undefined;
  readonly onReload?: (() => void) | undefined;
  readonly problem?: string | null;
  readonly state?: SubscriptionBillingViewState;
};
