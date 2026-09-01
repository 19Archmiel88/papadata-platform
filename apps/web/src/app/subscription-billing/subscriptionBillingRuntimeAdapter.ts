import type {
  BillingRecord,
} from '../../../../../contracts/api-schemas';
import type {
  SubscriptionBillingEntitlement,
  SubscriptionBillingScreenData,
  SubscriptionBillingStatus,
} from '../../screens/subscription-billing/SubscriptionBillingScreen.model';
import type {
  BffClient,
} from '../../runtime/shared/api/bffClient';
import {
  billingScreenDefinitions,
  type BillingScreenId,
} from '../../runtime/screens/billing/billingData';

type RuntimePlan = {
  readonly entitlements?: RuntimeEntitlements;
  readonly id?: string;
  readonly monthlyPricePln?: number;
  readonly name?: string;
};

type RuntimeEntitlements = {
  readonly aiEnabled?: boolean;
  readonly exportsEnabled?: boolean;
  readonly reportsEnabled?: boolean;
  readonly write?: boolean;
};

type BillingReadPayload = {
  readonly billingStatus?: string;
  readonly currentPlan?: RuntimePlan;
  readonly entitlements?: RuntimeEntitlements;
  readonly invoices?: readonly unknown[];
  readonly limitations?: readonly string[];
  readonly payments?: readonly unknown[];
  readonly plans?: readonly RuntimePlan[];
  readonly records?: readonly BillingRecord[];
  readonly usage?: {
    readonly connectedDataSources?: number;
    readonly maxDataSources?: number;
  };
};

type BillingReadResult = {
  readonly id: BillingScreenId;
  readonly payload: BillingReadPayload;
};

export type SubscriptionBillingRuntimeResult = {
  readonly data: SubscriptionBillingScreenData;
  readonly partial: boolean;
};

const overviewQueryIds = [
  '70.01',
  '70.02',
  '70.03',
  '70.04',
  '70.05',
] as const satisfies readonly BillingScreenId[];

export async function loadSubscriptionBillingRuntimeData(
  client: BffClient,
): Promise<SubscriptionBillingRuntimeResult> {
  const results = await Promise.allSettled(
    overviewQueryIds.map(async (id): Promise<BillingReadResult> => {
      const definition = billingScreenDefinitions.find((item) => item.id === id);
      if (!definition?.apiPath) {
        throw new Error(`Brak endpointu odczytowego dla ekranu ${id}.`);
      }

      const payload = await client.readDomainScreen<BillingReadPayload>(definition.apiPath);
      return { id, payload };
    }),
  );

  const fulfilled = results.flatMap((result): readonly BillingReadResult[] => (
    result.status === 'fulfilled' ? [result.value] : []
  ));

  if (fulfilled.length === 0) {
    const firstFailure = results.find((result) => result.status === 'rejected');
    if (firstFailure?.status === 'rejected') throw firstFailure.reason;
    throw new Error('Nie udało się pobrać danych rozliczeniowych.');
  }

  const payloadById = new Map(fulfilled.map((result) => [result.id, result.payload]));
  const subscriptionPayload = payloadById.get('70.01') ?? null;
  const usagePayload = payloadById.get('70.02') ?? null;
  const plansPayload = payloadById.get('70.03') ?? null;
  const invoicesPayload = payloadById.get('70.04') ?? null;
  const paymentsPayload = payloadById.get('70.05') ?? null;
  const primaryPayload = subscriptionPayload ?? fulfilled[0]?.payload ?? null;
  const currentPlan = firstDefined(
    subscriptionPayload?.currentPlan,
    plansPayload?.currentPlan,
    primaryPayload?.currentPlan,
  );
  const subscriptionRecord = firstDefined(
    subscriptionPayload?.records?.[0],
    primaryPayload?.records?.[0],
  );
  const entitlements = firstDefined(
    subscriptionPayload?.entitlements,
    currentPlan?.entitlements,
    primaryPayload?.entitlements,
  );
  const usage = firstDefined(
    usagePayload?.usage,
    subscriptionPayload?.usage,
    primaryPayload?.usage,
  );

  return {
    data: {
      currentPlan: {
        availablePlanCount: plansPayload?.plans?.length
          ?? plansPayload?.records?.length
          ?? null,
        code: currentPlan?.id ?? subscriptionRecord?.planCode ?? null,
        monthlyPrice: typeof currentPlan?.monthlyPricePln === 'number'
          ? { amount: currentPlan.monthlyPricePln, currency: 'PLN' }
          : null,
        name: currentPlan?.name ?? subscriptionRecord?.planCode ?? null,
      },
      subscription: {
        amount: subscriptionRecord?.amount ?? null,
        periodEnd: subscriptionRecord?.periodEnd ?? null,
        periodStart: subscriptionRecord?.periodStart ?? null,
        status: normalizeBillingStatus(
          subscriptionPayload?.billingStatus
          ?? primaryPayload?.billingStatus
          ?? subscriptionRecord?.status,
        ),
      },
      usage: {
        connectedDataSources: numberOrNull(usage?.connectedDataSources),
        maxDataSources: numberOrNull(usage?.maxDataSources),
      },
      entitlements: createEntitlements(entitlements),
      documents: {
        invoiceCount: countCollection(invoicesPayload, 'invoices'),
        paymentCount: countCollection(paymentsPayload, 'payments'),
        paymentMethodConfigured: subscriptionRecord
          ? subscriptionRecord.paymentMethodId !== null
          : null,
      },
      limitations: uniqueLimitations(fulfilled.map((result) => result.payload)),
    },
    partial: fulfilled.length !== results.length,
  };
}

function createEntitlements(
  entitlements: RuntimeEntitlements | undefined,
): readonly SubscriptionBillingEntitlement[] {
  if (!entitlements) return [];

  return [
    { enabled: entitlements.write === true, id: 'write', label: 'Operacje zapisu' },
    { enabled: entitlements.aiEnabled === true, id: 'ai', label: 'Papa Asystent' },
    { enabled: entitlements.reportsEnabled === true, id: 'reports', label: 'Raporty' },
    { enabled: entitlements.exportsEnabled === true, id: 'exports', label: 'Eksport danych' },
  ];
}

function countCollection(
  payload: BillingReadPayload | null,
  key: 'invoices' | 'payments',
): number | null {
  if (!payload) return null;
  const collection = payload[key];
  if (Array.isArray(collection)) return collection.length;
  if (Array.isArray(payload.records)) return payload.records.length;
  return null;
}

function uniqueLimitations(
  payloads: readonly BillingReadPayload[],
): readonly string[] {
  return [...new Set(
    payloads
      .flatMap((payload) => payload.limitations ?? [])
      .map(translateRuntimeLimitation),
  )];
}

function translateRuntimeLimitation(value: string): string {
  if (value === 'Stripe execution and VIES/KSeF live acceptance remain environment-gated.') {
    return 'Operacje providera płatności oraz integracje VIES i KSeF zależą od konfiguracji środowiska.';
  }
  return value;
}

function normalizeBillingStatus(value: string | null | undefined): SubscriptionBillingStatus {
  switch (value?.trim().toUpperCase()) {
    case 'ACTIVE':
      return 'active';
    case 'TRIAL':
    case 'TRIALING':
      return 'trial';
    case 'PAST_DUE':
    case 'PASTDUE':
      return 'pastDue';
    case 'GRACE':
      return 'grace';
    case 'EXPIRED':
    case 'INACTIVE':
      return 'expired';
    case 'CANCELED':
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'unknown';
  }
}

function numberOrNull(value: number | undefined): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function firstDefined<T>(
  ...values: readonly (T | null | undefined)[]
): T | undefined {
  return values.find((value): value is T => value !== null && value !== undefined);
}
