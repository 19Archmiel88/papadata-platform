import type { PapaDataIconName } from '../../design-system';

/** Headers for the detailed monthly order analyses. */
export const ordersSections = [
  {
    icon: 'billing',
    id: 'platnosci',
    navLabel: 'Płatności',
    title: 'Płatności i dostawa',
  },
  {
    icon: 'success',
    id: 'rabaty',
    navLabel: 'Rabaty i zwroty',
    title: 'Rabaty i zwroty',
  },
  {
    icon: 'trend',
    id: 'lejek',
    navLabel: 'Lejek',
    title: 'Lejek zakupowy',
  },
  {
    icon: 'assistant',
    id: 'insight',
    navLabel: 'Papa AI',
    title: 'Podsumowanie Papa AI',
  },
] as const satisfies readonly {
  readonly icon: PapaDataIconName;
  readonly id: string;
  readonly navLabel: string;
  readonly title: string;
}[];

export type OrdersSectionId = (typeof ordersSections)[number]['id'];

export const ordersSectionsById = ordersSections.reduce(
  (accumulator, section) => {
    accumulator[section.id] = section;
    return accumulator;
  },
  {} as Record<OrdersSectionId, (typeof ordersSections)[number]>,
);

export type OrdersTone =
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'indigo'
  | 'red'
  | 'slate'
  | 'sky'
  | 'violet';

export type OrdersProvenanceKey =
  | 'aov'
  | 'cancellations'
  | 'discounts'
  | 'funnel'
  | 'orders'
  | 'payments'
  | 'refunds'
  | 'returns'
  | 'revenue'
  | 'shipping'
  | 'sla_breach';

export type OrdersDataBadgeLevel =
  | 'L1 Pomiar'
  | 'L2 Normal.'
  | 'L2 Znormalizowane'
  | 'L3 Wylicz.'
  | 'L3 Wyliczone'
  | 'L4 Estymacja';

export type OrdersProvenance = {
  readonly badge: OrdersDataBadgeLevel;
  readonly coverage: string;
  readonly notes: string;
  readonly source: string;
  readonly title: string;
};

export const ordersProvenanceDict: Record<OrdersProvenanceKey, OrdersProvenance> = {
  orders: {
    title: 'Zamówienia',
    badge: 'L1 Pomiar',
    source: 'fact_orders (count)',
    coverage: '100%',
    notes: 'Bezpośrednia obserwacja bazy',
  },
  revenue: {
    title: 'Sprzedaż po rabatach',
    badge: 'L2 Znormalizowane',
    source: 'SUM(fact_orders.totalNet) z przewalutowaniem FX',
    coverage: '99,8%',
    notes: 'Korygowana o rabaty, przed refundami',
  },
  aov: {
    title: 'AOV',
    badge: 'L3 Wyliczone',
    source: 'Sprzedaż po rabatach / Liczba kwalifikowanych zamówień',
    coverage: '100%',
    notes: 'Wyklucza zamówienia anulowane',
  },
  cancellations: {
    title: 'Anulacje',
    badge: 'L1 Pomiar',
    source: 'fact_orders (status=cancelled)',
    coverage: '100%',
    notes: 'Utracone zamówienia przed wysyłką',
  },
  refunds: {
    title: 'Refundy & Zwroty',
    badge: 'L1 Pomiar',
    source: 'SUM(fact_refunds.amount)',
    coverage: '98,2%',
    notes: 'Rzeczywista zaksięgowana suma refundów',
  },
  sla_breach: {
    title: 'SLA Breach',
    badge: 'L3 Wyliczone',
    source: 'NOW() - paidAt > 36h dla statusu unfulfilled',
    coverage: '96,0%',
    notes: 'Wyklucza zamówienia COD bez timestampu wydania',
  },
  payments: {
    title: 'Płatności',
    badge: 'L1 Pomiar',
    source: 'fact_payments',
    coverage: '100%',
    notes: 'Rzeczywiste transakcje finansowe',
  },
  shipping: {
    title: 'Dostawa',
    badge: 'L3 Wyliczone',
    source: 'fact_orders.shippingMethod',
    coverage: '98,5%',
    notes: 'Wyliczenia z danych zamówień',
  },
  discounts: {
    title: 'Rabaty',
    badge: 'L1 Pomiar',
    source: 'fact_orders.discountTotal',
    coverage: '100%',
    notes: 'Dokładne wartości z linii zamówień',
  },
  returns: {
    title: 'Zwroty',
    badge: 'L1 Pomiar',
    source: 'fact_refunds',
    coverage: '98,2%',
    notes: 'Zaksięgowane operacje refundacji',
  },
  funnel: {
    title: 'Lejek Zakupu',
    badge: 'L4 Estymacja',
    source: 'sessions + orders proxy model',
    coverage: '72,0%',
    notes: 'Etapy pośrednie są modelowane planistycznie',
  },
};

export type SampleOrder = {
  readonly channel: 'BaseLinker' | 'WooCommerce';
  readonly customerId: string;
  readonly date: string;
  readonly discount: number;
  readonly discountCode: string;
  readonly fulfillmentStatus: 'Fulfilled' | 'Pending' | 'Processing';
  readonly grossValue: number;
  readonly id: string;
  readonly items: readonly {
    readonly name: string;
    readonly price: number;
    readonly qty: number;
    readonly sku: string;
  }[];
  readonly netValue: number;
  readonly paymentProvider: string;
  readonly paymentStatus: 'Failed' | 'Paid';
  readonly refund: number;
  readonly slaHours: string;
  readonly slaStatus: 'breached' | 'ok' | 'warning';
};

export const sampleOrders = [
  {
    id: '#WC-19482',
    channel: 'WooCommerce',
    customerId: 'CUST-8831',
    grossValue: 124.9,
    netValue: 101.54,
    discount: 12.49,
    discountCode: 'WELCOME10',
    paymentStatus: 'Paid',
    paymentProvider: 'PayU (BLIK)',
    fulfillmentStatus: 'Processing',
    slaStatus: 'breached',
    slaHours: '+4h SLA',
    refund: 0,
    date: '2026-08-27 09:14',
    items: [
      {
        sku: 'SKU-102',
        name: 'Koszulka Oversize',
        price: 135.0,
        qty: 1,
      },
    ],
  },
  {
    id: '#BL-88219',
    channel: 'BaseLinker',
    customerId: 'CUST-1042',
    grossValue: 242.0,
    netValue: 196.74,
    discount: 0,
    discountCode: 'Brak',
    paymentStatus: 'Paid',
    paymentProvider: 'Przelewy24',
    fulfillmentStatus: 'Fulfilled',
    slaStatus: 'ok',
    slaHours: 'OK',
    refund: 0,
    date: '2026-08-27 08:30',
    items: [
      {
        sku: 'SKU-301',
        name: 'Kurtka Zimowa Black',
        price: 242.0,
        qty: 1,
      },
    ],
  },
  {
    id: '#WC-19484',
    channel: 'WooCommerce',
    customerId: 'CUST-9920',
    grossValue: 88.0,
    netValue: 71.54,
    discount: 0,
    discountCode: 'Brak',
    paymentStatus: 'Failed',
    paymentProvider: 'Stripe',
    fulfillmentStatus: 'Pending',
    slaStatus: 'warning',
    slaHours: 'Zbliża się',
    refund: 0,
    date: '2026-08-27 07:45',
    items: [
      {
        sku: 'SKU-105',
        name: 'Czapka Beanie Grey',
        price: 88.0,
        qty: 1,
      },
    ],
  },
  {
    id: '#WC-19485',
    channel: 'WooCommerce',
    customerId: 'CUST-4412',
    grossValue: 310.0,
    netValue: 252.03,
    discount: 31.0,
    discountCode: 'WELCOME10',
    paymentStatus: 'Paid',
    paymentProvider: 'PayU (Karta)',
    fulfillmentStatus: 'Fulfilled',
    slaStatus: 'ok',
    slaHours: 'OK',
    refund: 310.0,
    date: '2026-08-26 14:20',
    items: [
      {
        sku: 'SKU-404',
        name: 'Spodnie Chino Slim',
        price: 310.0,
        qty: 1,
      },
    ],
  },
  {
    id: '#BL-88225',
    channel: 'BaseLinker',
    customerId: 'CUST-7711',
    grossValue: 156.0,
    netValue: 126.82,
    discount: 0,
    discountCode: 'Brak',
    paymentStatus: 'Paid',
    paymentProvider: 'COD (Pobranie)',
    fulfillmentStatus: 'Processing',
    slaStatus: 'breached',
    slaHours: '+14h SLA',
    refund: 0,
    date: '2026-08-26 11:10',
    items: [
      {
        sku: 'SKU-102',
        name: 'Koszulka Oversize',
        price: 156.0,
        qty: 1,
      },
    ],
  },
  {
    id: '#WC-19490',
    channel: 'WooCommerce',
    customerId: 'CUST-2201',
    grossValue: 95.0,
    netValue: 77.23,
    discount: 15.0,
    discountCode: 'SUMMER15',
    paymentStatus: 'Paid',
    paymentProvider: 'PayU (BLIK)',
    fulfillmentStatus: 'Fulfilled',
    slaStatus: 'ok',
    slaHours: 'OK',
    refund: 0,
    date: '2026-08-25 18:05',
    items: [
      {
        sku: 'SKU-202',
        name: 'Skarpetki Sport Pack',
        price: 95.0,
        qty: 1,
      },
    ],
  },
] as const satisfies readonly SampleOrder[];

export const ordersPaymentsDistribution = [
  {
    label: 'PayU (BLIK / Card)',
    share: 68.4,
    value: '992 000 zł',
  },
  {
    label: 'Przelewy24 (P24)',
    share: 18.0,
    value: '261 000 zł',
  },
  {
    label: 'COD (Za pobraniem)',
    share: 8.0,
    value: '116 000 zł',
  },
  {
    label: 'Stripe / Cards',
    share: 5.6,
    value: '81 000 zł',
  },
] as const;

export const ordersShippingPerformance = [
  {
    method: 'InPost Paczkomaty',
    orders: 8420,
    breached: 24,
  },
  {
    method: 'Kurier DPD',
    orders: 5110,
    breached: 154,
  },
  {
    method: 'Pocztex',
    orders: 1540,
    breached: 32,
  },
  {
    method: 'Odbiór Osobisty',
    orders: 550,
    breached: 4,
  },
] as const;

export const ordersDiscountSegments = [
  {
    aov: '89,10 zł',
    label: 'Bez Rabatu',
    orders: '10 718',
    refundRate: '6,2%',
    share: '68,6%',
    tone: 'slate',
  },
  {
    aov: '101,60 zł',
    aovDelta: '↑ +14%',
    label: 'Z Rabatem',
    orders: '4 902',
    refundDelta: '↑ wyższy zwrot',
    refundRate: '11,2%',
    share: '31,4%',
    tone: 'blue',
  },
] as const;

export const ordersDiscountCodes = [
  {
    aov: '98,20 zł',
    code: 'WELCOME10',
    discount: '26 750 zł',
    orders: '2 140',
    refundRate: '8,4%',
    tone: 'amber',
  },
  {
    aov: '112,00 zł',
    code: 'SUMMER15',
    discount: '38 220 zł',
    orders: '1 820',
    refundRate: '14,2%',
    tone: 'red',
  },
  {
    aov: '88,40 zł',
    code: 'LOYALTY20',
    discount: '28 260 zł',
    orders: '942',
    refundRate: '5,1%',
    tone: 'emerald',
  },
] as const;

export const ordersReturnsSummary = [
  {
    label: 'Suma Refundów',
    tone: 'slate',
    value: '113 100 zł',
  },
  {
    label: 'Refund Rate',
    tone: 'amber',
    value: '7,8%',
  },
  {
    label: 'Benchmark branżowy',
    tone: 'muted',
    value: 'Brak danych (null)',
  },
] as const;

export const ordersRefundedProducts = [
  {
    label: 'Koszulka Oversize (SKU-102)',
    rate: '18,4% zwrotów',
    refunds: '142 refundy',
    tone: 'red',
    value: '19 170 zł',
  },
  {
    label: 'Spodnie Chino Slim (SKU-404)',
    rate: '14,1% zwrotów',
    refunds: '98 refundów',
    tone: 'amber',
    value: '18 620 zł',
  },
] as const;

export const ordersFunnelSteps = [
  {
    label: '1. Sesje',
    note: '100% baseline',
    tone: 'slate',
    value: '100 000',
  },
  {
    label: '2. Produkt',
    note: '↓ 58% konwersji',
    tone: 'slate',
    value: '58 000',
  },
  {
    label: '3. Koszyk',
    note: '55,2% z widoku produktu',
    tone: 'amber',
    value: '32 000',
  },
  {
    label: '4. Checkout',
    note: '75,0% z koszyka',
    tone: 'slate',
    value: '24 000',
  },
  {
    label: '5. Płatność',
    note: '82,4% z checkoutu',
    tone: 'slate',
    value: '19 772',
  },
  {
    label: '6. Zamówienie',
    note: '✓ 15,6% Overall',
    tone: 'emerald',
    value: '15 620',
  },
] as const;

export const ordersExecutiveInsights = [
  {
    body: [
      'Obserwacja: 214 zamówień przekroczyło cel 36h.',
      'Dowód: P90 fulfillmentu wzrósł do 47,8h (+18h vs poprz. okres).',
      'Rekomendacja: Udrożnij kolejkę kompletacji Kuriera DPD, z której pochodzi 72% opóźnień.',
    ],
    label: '1. Węższe gardło magazynowe (SLA Breach)',
    tone: 'amber',
  },
  {
    body: [
      'Obserwacja: Zamówienia z kodem WELCOME10 mają AOV 98,20 zł.',
      'Dowód: 2 140 zamówień i wskaźnik zwrotów 8,4%. Dane nie ustalają przyczynowego wpływu kodu.',
      'Rekomendacja: Porównaj koszt rabatów i zwrotów z marżą przed przedłużeniem promocji.',
    ],
    label: '2. Efektywność Promocji WELCOME10',
    tone: 'blue',
  },
  {
    body: [
      'Obserwacja: Koszulka Oversize generuje 18,4% zwrotów.',
      'Dowód: 142 refundy o łącznej wartości 19 170 zł w ciągu 30 dni.',
      'Rekomendacja: Zaktualizuj tabelę rozmiarów na karcie produktu (sygnał błędnego wariantu).',
    ],
    label: '3. Ryzyko Zwrotów SKU-102',
    tone: 'emerald',
  },
] as const;
