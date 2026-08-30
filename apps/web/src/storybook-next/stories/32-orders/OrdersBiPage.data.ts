import type {
  PapaDataIconName,
} from '../../../design-system';

/**
 * Single source of truth for every business section this module renders:
 * section headers, the floating topbar, and anchor navigation are all
 * generated from this one array — none of them hand-type a title/label
 * or an anchor id separately. Same model as Command Center's
 * `commandCenterSections` and Paid Campaigns' `paidCampaignsSections`.
 */
export const ordersSections = [
  {
    icon: 'decisions',
    id: 'wynik',
    navLabel: 'Wynik',
    title: 'Wynik operacyjny',
  },
  {
    icon: 'integration',
    id: 'cykl',
    navLabel: 'Realizacja',
    title: 'Realizacja zamówień',
  },
  {
    icon: 'search',
    id: 'explorer',
    navLabel: 'Zamówienia',
    title: 'Eksplorator zamówień',
  },
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

export type OrdersSectionId = typeof ordersSections[number]['id'];

export const ordersSectionsById = ordersSections.reduce(
  (accumulator, section) => {
    accumulator[section.id] = section;
    return accumulator;
  },
  {} as Record<OrdersSectionId, typeof ordersSections[number]>,
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

export const ordersDateBasisOptions = [
  {
    label: 'Data zamówienia (orderedAt)',
    value: 'orderedAt',
  },
  {
    label: 'Data opłacenia (paidAt)',
    value: 'paidAt',
  },
  {
    label: 'Data wysyłki (fulfilledAt)',
    value: 'fulfilledAt',
  },
  {
    label: 'Data zwrotu (refundedAt)',
    value: 'refundedAt',
  },
] as const;

export const ordersRangeOptions = [
  {
    label: 'Ostatnie 30 dni',
    value: '30d',
  },
  {
    label: 'Ostatnie 7 dni',
    value: '7d',
  },
  {
    label: 'Dzisiaj',
    value: 'today',
  },
  {
    label: 'Ostatnie 90 dni',
    value: '90d',
  },
] as const;

export const ordersCompareOptions = [
  {
    label: 'Poprzedni okres',
    value: 'prev_period',
  },
  {
    label: 'Rok do roku (YoY)',
    value: 'yoy',
  },
  {
    label: 'Brak porównania',
    value: 'none',
  },
] as const;

export const ordersSourceOptions = [
  {
    label: 'Wszystkie (Woo + Base)',
    value: 'all',
  },
  {
    label: 'WooCommerce',
    value: 'woocommerce',
  },
  {
    label: 'BaseLinker',
    value: 'baselinker',
  },
] as const;

export const ordersStatusOptions = [
  {
    label: 'Wszystkie statusy',
    value: 'all',
  },
  {
    label: 'W realizacji',
    value: 'processing',
  },
  {
    label: 'Zakończone',
    value: 'fulfilled',
  },
  {
    label: 'Anulowane',
    value: 'cancelled',
  },
] as const;

export const ordersSlaOptions = [
  {
    label: 'Wszystkie SLA',
    value: 'all',
  },
  {
    label: 'W normie',
    value: 'ok',
  },
  {
    label: 'Zbliża się',
    value: 'warning',
  },
  {
    label: 'Po SLA (>36h)',
    value: 'breached',
  },
] as const;

export const ordersCurrencyOptions = [
  {
    label: 'PLN (Złoty)',
    value: 'PLN',
  },
  {
    label: 'EUR (Euro)',
    value: 'EUR',
  },
] as const;

export type OrdersFilterState = {
  readonly compare: typeof ordersCompareOptions[number]['value'];
  readonly currency: typeof ordersCurrencyOptions[number]['value'];
  readonly dateBasis: typeof ordersDateBasisOptions[number]['value'];
  readonly range: typeof ordersRangeOptions[number]['value'];
  readonly sla: typeof ordersSlaOptions[number]['value'];
  readonly source: typeof ordersSourceOptions[number]['value'];
  readonly status: typeof ordersStatusOptions[number]['value'];
};

export const ordersDefaultFilters: OrdersFilterState = {
  compare: 'prev_period',
  currency: 'PLN',
  dateBasis: 'orderedAt',
  range: '30d',
  sla: 'all',
  source: 'all',
  status: 'all',
};

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

export const ordersKpis = [
  {
    change: '↑ +11,2% vs poprz.',
    key: 'orders',
    label: 'Zamówienia',
    tone: 'slate',
    value: '15 620',
  },
  {
    change: '↑ +14,6% vs poprz.',
    key: 'revenue',
    label: 'Sprzedaż po rabatach',
    tone: 'slate',
    value: '1,45 mln zł',
  },
  {
    change: '↑ +3,1% vs poprz.',
    key: 'aov',
    label: 'AOV (Średnia wartość)',
    tone: 'slate',
    value: '93,02 zł',
  },
  {
    change: '↓ -0,3 p.p. poprawa',
    key: 'cancellations',
    label: 'Anulacje',
    suffix: '(375)',
    tone: 'slate',
    value: '2,4%',
  },
  {
    change: '↑ +0,8 p.p. vs poprz.',
    key: 'refunds',
    label: 'Refundy & Zwroty',
    suffix: '(113k zł)',
    tone: 'amber',
    value: '7,8%',
  },
  {
    change: '↑ +41% wzrost ryzyka',
    key: 'sla_breach',
    label: 'Po SLA (>36h)',
    suffix: '(1,4%)',
    tone: 'red',
    value: '214',
  },
] as const satisfies readonly {
  readonly change: string;
  readonly key: OrdersProvenanceKey;
  readonly label: string;
  readonly suffix?: string;
  readonly tone: OrdersTone;
  readonly value: string;
}[];

export const ordersOperationalStats = [
  {
    label: 'Mediana realizacji (Fulfillment):',
    note: '(Cel: 24h)',
    tone: 'slate',
    value: '19,2 godz.',
  },
  {
    label: 'P90 fulfillmentu (Ogon opóźnień):',
    note: '⚠️ Ogon > 36h',
    tone: 'amber',
    value: '47,8 godz.',
  },
  {
    label: 'Pokrycie COD (Płatność za pobraniem):',
    note: '(Osobny model czasowy)',
    tone: 'slate',
    value: '1 240 zamówień (8%)',
  },
  {
    label: 'Udział zamówień z rabatem:',
    note: '(4 902 orders)',
    tone: 'slate',
    value: '31,4%',
  },
] as const;

export const ordersTrendModes = [
  {
    id: 'sales',
    label: 'Sprzedaż & Orders',
  },
  {
    id: 'aov',
    label: 'AOV Trend',
  },
  {
    id: 'fulfillment',
    label: 'Mediana vs P90',
  },
  {
    id: 'returns',
    label: 'Zwroty %',
  },
] as const;

export type OrdersTrendMode = typeof ordersTrendModes[number]['id'];

export const ordersTrendLabels = [
  '01.08',
  '05.08',
  '10.08',
  '15.08',
  '20.08',
  '25.08',
  '27.08',
] as const;

export type OrdersTrendSeries = {
  readonly color: OrdersTone;
  readonly dash?: boolean;
  readonly key: string;
  readonly label: string;
  readonly values: readonly number[];
};

export const ordersTrendSeries: Record<OrdersTrendMode, readonly OrdersTrendSeries[]> = {
  sales: [
    {
      color: 'blue',
      key: 'revenue',
      label: 'Sprzedaż po rabatach (zł)',
      values: [
        42000,
        48000,
        51000,
        46000,
        58000,
        62000,
        59000,
      ],
    },
    {
      color: 'emerald',
      dash: true,
      key: 'orders',
      label: 'Liczba Zamówień',
      values: [
        450,
        510,
        540,
        490,
        610,
        660,
        630,
      ],
    },
  ],
  aov: [
    {
      color: 'blue',
      key: 'aov',
      label: 'AOV (zł)',
      values: [
        91.2,
        92.5,
        94.1,
        89.8,
        93.5,
        95.2,
        93.0,
      ],
    },
  ],
  fulfillment: [
    {
      color: 'amber',
      key: 'fulfillmentMedian',
      label: 'Mediana Fulfillmentu (h)',
      values: [
        18.2,
        19.0,
        21.4,
        19.5,
        24.1,
        28.5,
        19.2,
      ],
    },
    {
      color: 'red',
      dash: true,
      key: 'fulfillmentP90',
      label: 'P90 Fulfillmentu (h)',
      values: [
        36.8,
        38.2,
        43.0,
        39.4,
        48.1,
        52.6,
        47.8,
      ],
    },
  ],
  returns: [
    {
      color: 'red',
      key: 'returns',
      label: 'Wskaźnik Zwrotów %',
      values: [
        6.8,
        7.1,
        7.5,
        7.2,
        8.1,
        8.4,
        7.8,
      ],
    },
  ],
};

export type OrdersLifecycleFilter = 'breached' | 'delivered' | 'nowe' | 'paid' | 'pending_payment' | 'processing' | 'ready' | 'shipped';

export const ordersLifecycleStages = [
  {
    count: '1 240',
    filter: 'nowe',
    label: '1. Nowe',
    note: 'Oczekuje na akcept',
    tone: 'slate',
  },
  {
    count: '318',
    filter: 'pending_payment',
    label: '2. Czeka na płatność',
    note: 'Przekroczony czas: 12',
    tone: 'amber',
  },
  {
    count: '1 850',
    filter: 'paid',
    label: '3. Opłacone',
    note: 'Gotowe do kompletacji',
    tone: 'blue',
  },
  {
    count: '3 882',
    filter: 'processing',
    label: '4. W realizacji',
    note: 'Magazyn / Pakowanie',
    tone: 'indigo',
  },
  {
    count: '742',
    filter: 'ready',
    label: '5. Gotowe',
    note: 'Czeka na kuriera',
    tone: 'sky',
  },
  {
    count: '5 120',
    filter: 'shipped',
    label: '6. Wysłane',
    note: 'W drodze do klienta',
    tone: 'violet',
  },
  {
    count: '4 801',
    filter: 'delivered',
    label: '7. Dostarczone',
    note: 'Cykl zakończony',
    tone: 'emerald',
  },
  {
    count: '214',
    filter: 'breached',
    label: '🚨 Po SLA (>36h)',
    note: 'Wymaga interwencji',
    tone: 'red',
  },
] as const satisfies readonly {
  readonly count: string;
  readonly filter: OrdersLifecycleFilter;
  readonly label: string;
  readonly note: string;
  readonly tone: OrdersTone;
}[];

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
    grossValue: 124.90,
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
        price: 135.00,
        qty: 1,
      },
    ],
  },
  {
    id: '#BL-88219',
    channel: 'BaseLinker',
    customerId: 'CUST-1042',
    grossValue: 242.00,
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
        price: 242.00,
        qty: 1,
      },
    ],
  },
  {
    id: '#WC-19484',
    channel: 'WooCommerce',
    customerId: 'CUST-9920',
    grossValue: 88.00,
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
        price: 88.00,
        qty: 1,
      },
    ],
  },
  {
    id: '#WC-19485',
    channel: 'WooCommerce',
    customerId: 'CUST-4412',
    grossValue: 310.00,
    netValue: 252.03,
    discount: 31.00,
    discountCode: 'WELCOME10',
    paymentStatus: 'Paid',
    paymentProvider: 'PayU (Karta)',
    fulfillmentStatus: 'Fulfilled',
    slaStatus: 'ok',
    slaHours: 'OK',
    refund: 310.00,
    date: '2026-08-26 14:20',
    items: [
      {
        sku: 'SKU-404',
        name: 'Spodnie Chino Slim',
        price: 310.00,
        qty: 1,
      },
    ],
  },
  {
    id: '#BL-88225',
    channel: 'BaseLinker',
    customerId: 'CUST-7711',
    grossValue: 156.00,
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
        price: 156.00,
        qty: 1,
      },
    ],
  },
  {
    id: '#WC-19490',
    channel: 'WooCommerce',
    customerId: 'CUST-2201',
    grossValue: 95.00,
    netValue: 77.23,
    discount: 15.00,
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
        price: 95.00,
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
    note: '↓ 24% (Spadek)',
    tone: 'amber',
    value: '13 920',
  },
  {
    label: '4. Checkout',
    note: '↓ 62% konwersji',
    tone: 'slate',
    value: '8 630',
  },
  {
    label: '5. Płatność',
    note: '↓ 79% konwersji',
    tone: 'slate',
    value: '6 818',
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
      'Obserwacja: Kod WELCOME10 podnosi AOV o +14% (do 101,60 zł).',
      'Dowód: Wyższa konwersja koszyka przy umiarkowanym wskaźniku zwrotów (8,4%).',
      'Rekomendacja: Kontynuuj promocję przy utrzymaniu progu darmowej dostawy od 150 zł.',
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
