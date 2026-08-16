import type {
  DataColumn,
  DataRow,
} from '../../../../../contracts/component-shared';

export type BillingScreenId =
  | '70.01'
  | '70.02'
  | '70.03'
  | '70.04'
  | '70.05'
  | '70.06'
  | '70.07'
  | '70.08'
  | '70.09'
  | '70.10';

export type BillingScreenVariant =
  | 'subscription'
  | 'usage-limits'
  | 'plans'
  | 'invoices'
  | 'payments'
  | 'overdue-payment'
  | 'adjustments'
  | 'change-cancel'
  | 'pilot-to-subscription'
  | 'billing-variants';

export type BillingScreenDefinition = {
  readonly apiPath: `/api/v1/${string}` | null;
  readonly displayTitle: string;
  readonly documentPath: string;
  readonly id: BillingScreenId;
  readonly operationId: string | null;
  readonly route: `/app/${string}` | null;
  readonly routeBase: `/app/${string}` | null;
  readonly summary: string;
  readonly variant: BillingScreenVariant;
};

export type BillingWorkspaceData = {
  readonly generatedAt: string;
  readonly subscription: {
    readonly plan: string;
    readonly cycle: string;
    readonly renewalAt: string;
    readonly status: string;
  };
  readonly kpis: readonly {
    readonly hint: string;
    readonly label: string;
    readonly value: string;
  }[];
  readonly decisionQueue: readonly {
    readonly detail: string;
    readonly due: string;
    readonly id: string;
    readonly priority: 'critical' | 'high' | 'low' | 'medium';
    readonly status: string;
    readonly title: string;
  }[];
  readonly usageRows: readonly DataRow[];
  readonly planRows: readonly DataRow[];
  readonly invoiceRows: readonly DataRow[];
  readonly paymentRows: readonly DataRow[];
  readonly adjustmentRows: readonly DataRow[];
  readonly variantRows: readonly DataRow[];
};

export const billingScreenDefinitions: readonly BillingScreenDefinition[] = [
  {
    apiPath: '/api/v1/billing/subskrypcja',
    displayTitle: 'Subskrypcja',
    documentPath: '17-subskrypcja-i-platnosci/70-01-subskrypcja.md',
    id: '70.01',
    operationId: 'billing.subscription.read',
    route: '/app/billing/subskrypcja',
    routeBase: '/app/billing/subskrypcja',
    summary: 'Aktualny plan, status rozliczenia, odnowienie i ograniczenia wynikające z subskrypcji.',
    variant: 'subscription',
  },
  {
    apiPath: '/api/v1/billing/uzycie-i-limity',
    displayTitle: 'Użycie i limity',
    documentPath: '17-subskrypcja-i-platnosci/70-02-uzycie-i-limity.md',
    id: '70.02',
    operationId: 'billing.usage-limits.read',
    route: '/app/billing/uzycie-i-limity',
    routeBase: '/app/billing/uzycie-i-limity',
    summary: 'Zużycie limitów, próg bezpieczeństwa i wpływ ograniczeń na dane oraz automatyzacje.',
    variant: 'usage-limits',
  },
  {
    apiPath: '/api/v1/billing/plany',
    displayTitle: 'Plany',
    documentPath: '17-subskrypcja-i-platnosci/70-03-plany.md',
    id: '70.03',
    operationId: 'billing.plans.read',
    route: '/app/billing/plany',
    routeBase: '/app/billing/plany',
    summary: 'Porównanie planów, limitów i rekomendacji zmiany przed zatwierdzeniem.',
    variant: 'plans',
  },
  {
    apiPath: '/api/v1/billing/faktury',
    displayTitle: 'Faktury',
    documentPath: '17-subskrypcja-i-platnosci/70-04-faktury.md',
    id: '70.04',
    operationId: 'billing.invoices.read',
    route: '/app/billing/faktury',
    routeBase: '/app/billing/faktury',
    summary: 'Historia faktur, kwoty, statusy i powiązanie z rozliczeniami.',
    variant: 'invoices',
  },
  {
    apiPath: '/api/v1/billing/platnosci',
    displayTitle: 'Płatności',
    documentPath: '17-subskrypcja-i-platnosci/70-05-platnosci.md',
    id: '70.05',
    operationId: 'billing.payments.read',
    route: '/app/billing/platnosci',
    routeBase: '/app/billing/platnosci',
    summary: 'Metody płatności, ostatnie obciążenia i bezpieczne stany aktualizacji metody.',
    variant: 'payments',
  },
  {
    apiPath: '/api/v1/billing/zalegla-platnosc',
    displayTitle: 'Zaległa płatność',
    documentPath: '17-subskrypcja-i-platnosci/70-06-zalegla-platnosc.md',
    id: '70.06',
    operationId: 'billing.overdue-payment.read',
    route: '/app/billing/zalegla-platnosc',
    routeBase: '/app/billing/zalegla-platnosc',
    summary: 'Stan zaległości, ograniczenia dostępu i ścieżka odzyskania pełnej funkcjonalności.',
    variant: 'overdue-payment',
  },
  {
    apiPath: '/api/v1/billing/korekty',
    displayTitle: 'Korekty',
    documentPath: '17-subskrypcja-i-platnosci/70-07-korekty.md',
    id: '70.07',
    operationId: 'billing.adjustments.read',
    route: '/app/billing/korekty',
    routeBase: '/app/billing/korekty',
    summary: 'Korekty, rabaty i ręczne interwencje rozliczeniowe wymagające audytu.',
    variant: 'adjustments',
  },
  {
    apiPath: '/api/v1/billing/zmiana-i-anulowanie',
    displayTitle: 'Zmiana lub anulowanie planu',
    documentPath: '17-subskrypcja-i-platnosci/70-08-zmiana-i-anulowanie.md',
    id: '70.08',
    operationId: 'billing.change-cancel.read',
    route: '/app/billing/zmiana-i-anulowanie',
    routeBase: '/app/billing/zmiana-i-anulowanie',
    summary: 'Konsekwencje zmiany planu, anulowania, okresu rozliczeniowego i utraty funkcji.',
    variant: 'change-cancel',
  },
  {
    apiPath: '/api/v1/billing/pilot-do-abonamentu',
    displayTitle: 'Przejście na abonament',
    documentPath: '17-subskrypcja-i-platnosci/70-09-pilot-do-abonamentu.md',
    id: '70.09',
    operationId: 'billing.pilot-to-subscription.read',
    route: '/app/billing/pilot-do-abonamentu',
    routeBase: '/app/billing/pilot-do-abonamentu',
    summary: 'Migracja z pilota do abonamentu, wymagane kroki i blokery komercyjne.',
    variant: 'pilot-to-subscription',
  },
  {
    apiPath: null,
    displayTitle: 'Warianty subskrypcji',
    documentPath: '17-subskrypcja-i-platnosci/70-10-warianty-billingowe.md',
    id: '70.10',
    operationId: null,
    route: null,
    routeBase: null,
    summary: 'Zestaw stanów billingowych: aktywny, trial, zaległy, anulowanie i limity.',
    variant: 'billing-variants',
  },
] as const;

export const billingNavigationItems = billingScreenDefinitions.map((definition) => ({
  href: definition.routeBase ?? '/app/billing/subskrypcja',
  id: definition.id,
  label: definition.displayTitle,
}));

export const billingUsageColumns: readonly DataColumn[] = [
  { id: 'metric', label: 'Limit', sortable: true, width: 240 },
  { align: 'right', id: 'used', label: 'Wykorzystano', sortable: true },
  { align: 'right', id: 'limit', label: 'Limit', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const billingPlanColumns: readonly DataColumn[] = [
  { id: 'plan', label: 'Plan', sortable: true, width: 220 },
  { align: 'right', id: 'price', label: 'Cena', sortable: true },
  { id: 'fit', label: 'Dopasowanie', sortable: true },
  { id: 'constraint', label: 'Ograniczenie', sortable: true },
];

export const billingInvoiceColumns: readonly DataColumn[] = [
  { id: 'invoice', label: 'Faktura', sortable: true, width: 180 },
  { id: 'period', label: 'Okres', sortable: true },
  { align: 'right', id: 'amount', label: 'Kwota', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const billingPaymentColumns: readonly DataColumn[] = [
  { id: 'method', label: 'Metoda', sortable: true, width: 220 },
  { id: 'owner', label: 'Właściciel', sortable: true },
  { id: 'lastCharge', label: 'Ostatnie obciążenie', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const billingAdjustmentColumns: readonly DataColumn[] = [
  { id: 'case', label: 'Korekta', sortable: true, width: 240 },
  { align: 'right', id: 'amount', label: 'Kwota', sortable: true },
  { id: 'reason', label: 'Powód', sortable: true },
  { id: 'status', label: 'Status', sortable: true },
];

export const billingVariantColumns: readonly DataColumn[] = [
  { id: 'variant', label: 'Wariant', sortable: true, width: 240 },
  { id: 'surface', label: 'Powierzchnia', sortable: true },
  { id: 'risk', label: 'Ryzyko UX', sortable: true },
  { id: 'guardrail', label: 'Guardrail', sortable: true },
];

export function findBillingScreenDefinition(path: string): BillingScreenDefinition | null {
  const normalizedPath = path === '/app/billing'
    ? '/app/billing/subskrypcja'
    : path;

  return billingScreenDefinitions.find((definition) => (
    Boolean(definition.routeBase)
    && (
      normalizedPath === definition.routeBase
      || normalizedPath.startsWith(`${definition.routeBase}/`)
    )
  )) ?? billingScreenDefinitions[0] ?? null;
}

export function createBillingStorybookData(): BillingWorkspaceData {
  return {
    generatedAt: '2026-08-14T12:00:00Z',
    subscription: {
      cycle: 'Miesięcznie',
      plan: 'Growth Commerce',
      renewalAt: '2026-09-01',
      status: 'Aktywna',
    },
    kpis: [
      { label: 'MRR', value: '899 PLN', hint: 'Następne odnowienie: 01.09' },
      { label: 'Zużycie integracji', value: '78%', hint: 'Najwyższy koszt: Google Ads' },
      { label: 'Faktury otwarte', value: '1', hint: 'Wymaga weryfikacji NIP' },
      { label: 'Ryzyka dostępu', value: '2', hint: 'Limity i zaległa metoda płatności' },
    ],
    decisionQueue: [
      {
        detail: 'Przejście na plan roczny obniży koszt o 15%, ale wymaga decyzji właściciela.',
        due: 'do 20.08',
        id: 'bill-decision-annual',
        priority: 'medium',
        status: 'Do decyzji',
        title: 'Rozważ plan roczny',
      },
      {
        detail: 'Zbliża się próg 80% limitu synchronizacji marketplace.',
        due: 'dziś',
        id: 'bill-decision-limit',
        priority: 'high',
        status: 'Wymaga uwagi',
        title: 'Limit integracji blisko progu',
      },
      {
        detail: 'Metoda płatności ma wygasnąć przed kolejnym odnowieniem.',
        due: '7 dni',
        id: 'bill-decision-card',
        priority: 'critical',
        status: 'Bloker',
        title: 'Zaktualizuj kartę firmową',
      },
    ],
    usageRows: [
      { id: 'usage-1', limit: '100 000', metric: 'Zamówienia miesięcznie', status: 'Bezpiecznie', used: '62 400' },
      { id: 'usage-2', limit: '12', metric: 'Aktywne integracje', status: 'Blisko limitu', used: '9' },
      { id: 'usage-3', limit: '50', metric: 'Eksporty raportów', status: 'W normie', used: '18' },
      { id: 'usage-4', limit: '5', metric: 'Użytkownicy administracyjni', status: 'Do przeglądu', used: '5' },
    ],
    planRows: [
      { id: 'plan-1', constraint: 'Brak prognoz AI', fit: 'Za mały', plan: 'Starter', price: '299 PLN' },
      { id: 'plan-2', constraint: 'Bieżący plan', fit: 'Dopasowany', plan: 'Growth Commerce', price: '899 PLN' },
      { id: 'plan-3', constraint: 'Wymaga rocznego kontraktu', fit: 'Dla skalowania', plan: 'Scale', price: '1 799 PLN' },
    ],
    invoiceRows: [
      { id: 'inv-1', amount: '899 PLN', invoice: 'FV/2026/08/0142', period: '08.2026', status: 'Wystawiona' },
      { id: 'inv-2', amount: '899 PLN', invoice: 'FV/2026/07/0128', period: '07.2026', status: 'Opłacona' },
      { id: 'inv-3', amount: '749 PLN', invoice: 'FV/2026/06/0104', period: '06.2026', status: 'Skorygowana' },
    ],
    paymentRows: [
      { id: 'pay-1', lastCharge: '2026-08-01', method: 'Visa •••• 2842', owner: 'Artur Wiśniewski', status: 'Aktywna' },
      { id: 'pay-2', lastCharge: '2026-07-01', method: 'Przelew bankowy', owner: 'Finance', status: 'Rezerwowa' },
      { id: 'pay-3', lastCharge: '—', method: 'Karta wygasająca', owner: 'Operations', status: 'Do wymiany' },
    ],
    adjustmentRows: [
      { id: 'adj-1', amount: '-150 PLN', case: 'Rabat pilotażowy', reason: 'Migracja z pilota', status: 'Zastosowana' },
      { id: 'adj-2', amount: '+49 PLN', case: 'Dodatkowy pakiet eksportów', reason: 'Użycie ponad limit', status: 'Do akceptacji' },
      { id: 'adj-3', amount: '-89 PLN', case: 'Korekta NIP', reason: 'Dane faktury', status: 'W toku' },
    ],
    variantRows: [
      { id: 'var-1', guardrail: 'Wymaga potwierdzenia', risk: 'Zmiana planu bez zrozumienia skutków', surface: 'Porównanie planów', variant: 'Aktywny plan' },
      { id: 'var-2', guardrail: 'Wyraźna ścieżka odzyskania', risk: 'Blokada dostępu po zaległości', surface: 'Overdue banner', variant: 'Zaległa płatność' },
      { id: 'var-3', guardrail: 'Czytelny stan błędu', risk: 'Provider płatności niedostępny', surface: 'Metoda płatności', variant: 'Błąd aktualizacji' },
    ],
  };
}
