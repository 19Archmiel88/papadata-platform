import type {
  PapaDataIconName,
} from '../../../design-system';

export type ProductsTone =
  | 'amber'
  | 'blue'
  | 'emerald'
  | 'indigo'
  | 'red'
  | 'rose'
  | 'slate'
  | 'sky'
  | 'violet';

/**
 * Single source of truth for every business section this module renders:
 * section headers, the floating topbar, and anchor navigation are all
 * generated from this one array — none of them hand-type a title/label
 * or an anchor id separately. Same model as Command Center's
 * `commandCenterSections`, Paid Campaigns' `paidCampaignsSections`, and
 * Orders' `ordersSections`.
 */
export const productSections = [
  {
    icon: 'decisions',
    id: 'wynik',
    navLabel: 'Wynik',
    title: 'Wynik produktowy',
  },
  {
    icon: 'search',
    id: 'explorer',
    navLabel: 'Produkty',
    title: 'Eksplorator produktów',
  },
  {
    icon: 'products',
    id: 'portfolio',
    navLabel: 'Portfolio',
    title: 'Portfolio produktów',
  },
  {
    icon: 'warning',
    id: 'zapasy',
    navLabel: 'Zapasy',
    title: 'Zapasy i kapitał',
  },
  {
    icon: 'billing',
    id: 'promocje',
    navLabel: 'Promocje',
    title: 'Promocje i koszyk',
  },
  {
    icon: 'integration',
    id: 'zestawy',
    navLabel: 'Zestawy',
    title: 'Symulator zestawów',
  },
  {
    icon: 'trend',
    id: 'cykl',
    navLabel: 'Cykl życia',
    title: 'Cykl życia produktów',
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

export type ProductSectionId = typeof productSections[number]['id'];

export const productSectionsById = productSections.reduce(
  (accumulator, section) => {
    accumulator[section.id] = section;
    return accumulator;
  },
  {} as Record<ProductSectionId, typeof productSections[number]>,
);

export const productRangeOptions = [
  {
    label: 'Ostatnie 7 dni',
    value: '7d',
  },
  {
    label: 'Ostatnie 30 dni',
    value: '30d',
  },
  {
    label: 'Ostatnie 90 dni',
    value: '90d',
  },
  {
    label: 'Rok 2026 YTD',
    value: 'year',
  },
] as const;

export const productCompareOptions = [
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

export const productSourceOptions = [
  {
    label: 'Wszystkie źródła',
    value: 'all',
  },
  {
    label: 'WooCommerce Store',
    value: 'woocommerce',
  },
  {
    label: 'BaseLinker ERP',
    value: 'baselinker',
  },
] as const;

export const productCategoryOptions = [
  {
    label: 'Wszystkie kategorie',
    value: 'all',
  },
  {
    label: 'Pielęgnacja Twarzy',
    value: 'Beauty',
  },
  {
    label: 'Pielęgnacja Włosów',
    value: 'Hair',
  },
  {
    label: 'Pielęgnacja Ciała',
    value: 'Body',
  },
  {
    label: 'Akcesoria',
    value: 'Accessories',
  },
] as const;

export const productStockStatusOptions = [
  {
    label: 'Wszystkie stany',
    value: 'all',
  },
  {
    label: 'Zagrożenie Stockoutem',
    value: 'stockout_risk',
  },
  {
    label: 'Dead Stock (>60d zero sales)',
    value: 'dead_stock',
  },
  {
    label: 'Slow Movers',
    value: 'slow_mover',
  },
  {
    label: 'Prawidłowe pokrycie',
    value: 'healthy',
  },
] as const;

export const productAbcOptions = [
  {
    label: 'Wszystkie (A, B, C)',
    value: 'all',
  },
  {
    label: 'Klasa A (Top 80% marży)',
    value: 'A',
  },
  {
    label: 'Klasa B (Kolejne 15%)',
    value: 'B',
  },
  {
    label: 'Klasa C (Pozostałe 5%)',
    value: 'C',
  },
] as const;

export const productCurrencyOptions = [
  {
    label: 'PLN (zł)',
    value: 'PLN',
  },
  {
    label: 'EUR (€)',
    value: 'EUR',
  },
  {
    label: 'USD ($)',
    value: 'USD',
  },
] as const;

export type ProductFilterState = {
  readonly abc: typeof productAbcOptions[number]['value'];
  readonly category: typeof productCategoryOptions[number]['value'];
  readonly compare: typeof productCompareOptions[number]['value'];
  readonly currency: typeof productCurrencyOptions[number]['value'];
  readonly range: typeof productRangeOptions[number]['value'];
  readonly source: typeof productSourceOptions[number]['value'];
  readonly stockStatus: typeof productStockStatusOptions[number]['value'];
};

export const productDefaultFilters: ProductFilterState = {
  abc: 'all',
  category: 'all',
  compare: 'prev_period',
  currency: 'PLN',
  range: '30d',
  source: 'all',
  stockStatus: 'all',
};

export type ProductsProvenanceKey =
  | 'cogs'
  | 'gross_margin'
  | 'gross_margin_pct'
  | 'inventory_value'
  | 'net_revenue'
  | 'sold_units'
  | 'stockout_skus';

export type ProductDataBadge =
  | 'Pomiar'
  | 'Prognoza'
  | 'Snapshot'
  | 'Wyliczone';

export type ProductProvenance = {
  readonly badge: ProductDataBadge;
  readonly coverage: string;
  readonly notes: string;
  readonly source: string;
  readonly title: string;
};

export const productsProvenanceDict: Record<ProductsProvenanceKey, ProductProvenance> = {
  net_revenue: {
    title: 'Sprzedaż netto',
    badge: 'Pomiar',
    source: 'FactOrderLine',
    coverage: '100% sprzedaży w badanym okresie',
    notes: 'Rzeczywista suma wartości netto linii zamówień po korektach statusu.',
  },
  sold_units: {
    title: 'Sprzedane sztuki',
    badge: 'Pomiar',
    source: 'FactOrderLine.quantity',
    coverage: '100% linii sprzedażowych',
    notes: 'Prawdziwa suma quantity, bez estymacji popytu.',
  },
  gross_margin: {
    title: 'Marża brutto',
    badge: 'Wyliczone',
    source: 'FactOrderLine revenue - COGS kwalifikowane',
    coverage: 'COGS Coverage 92.4%',
    notes: 'Wyliczenie respektuje tylko SKU z kwalifikowanym kosztem własnym.',
  },
  gross_margin_pct: {
    title: 'Marża brutto %',
    badge: 'Wyliczone',
    source: 'Średnia ważona revenue',
    coverage: 'COGS Coverage 92.4%',
    notes: 'Wartość procentowa jest ważona przychodem SKU.',
  },
  inventory_value: {
    title: 'Wartość zapasu',
    badge: 'Snapshot',
    source: 'FactInventorySnapshot',
    coverage: 'Snapshot 27.08.2026, 22:04',
    notes: 'Dostępny zapas pomnożony przez unit cost.',
  },
  stockout_skus: {
    title: 'Zagrożone SKU',
    badge: 'Prognoza',
    source: 'Pokrycie DSI vs Lead Time',
    coverage: 'Trailing 30 days demand',
    notes: 'Ryzyko występuje, gdy pokrycie zapasu jest krótsze niż lead time dostawcy.',
  },
  cogs: {
    title: 'COGS Coverage',
    badge: 'Wyliczone',
    source: 'Mapowanie SKU do kosztów własnych',
    coverage: '92.4%',
    notes: 'Pokrycie COGS służy do kwalifikowania marż i GMROI.',
  },
};

export const productKpis = [
  {
    title: 'Sprzedaż netto',
    value: '1 450 200 zł',
    badge: 'Pomiar',
    badgeTone: 'emerald',
    trend: '+12.4%',
    trendDirection: 'up',
    note: 'vs poprz. okres',
    footer: 'Flow: FactOrderLine',
    provenanceKey: 'net_revenue',
  },
  {
    title: 'Sprzedane sztuki',
    value: '15 620 szt.',
    badge: 'Pomiar',
    badgeTone: 'emerald',
    trend: '+8.1%',
    trendDirection: 'up',
    note: 'vs poprz. okres',
    footer: 'Prawdziwa suma quantity',
    provenanceKey: 'sold_units',
  },
  {
    title: 'Marża brutto',
    value: '486 310 zł',
    badge: 'Wyliczone',
    badgeTone: 'indigo',
    trend: 'COGS Cover: 92.4%',
    trendDirection: 'flat',
    note: '',
    footer: 'COGS kwalifikowane',
    provenanceKey: 'gross_margin',
  },
  {
    title: 'Marża brutto %',
    value: '33.5%',
    badge: 'Wyliczone',
    badgeTone: 'indigo',
    trend: '-1.2 p.p.',
    trendDirection: 'down',
    note: 'wzrost rabatów',
    footer: 'Średnia ważona revenue',
    provenanceKey: 'gross_margin_pct',
  },
  {
    title: 'Wartość zapasu',
    value: '382 400 zł',
    badge: 'Snapshot',
    badgeTone: 'blue',
    trend: 'DSI: 24,2 dni',
    trendDirection: 'flat',
    note: '',
    footer: 'Dostępny zapas × Unit Cost',
    provenanceKey: 'inventory_value',
  },
  {
    title: 'Zagrożone SKU',
    value: '7 SKU',
    badge: 'Prognoza',
    badgeTone: 'amber',
    trend: '3 SKU Klasa AX',
    trendDirection: 'warning',
    note: '',
    footer: 'Pokrycie < Lead Time',
    provenanceKey: 'stockout_skus',
  },
] as const satisfies readonly {
  readonly badge: ProductDataBadge;
  readonly badgeTone: ProductsTone;
  readonly footer: string;
  readonly note: string;
  readonly provenanceKey: ProductsProvenanceKey;
  readonly title: string;
  readonly trend: string;
  readonly trendDirection: 'down' | 'flat' | 'up' | 'warning';
  readonly value: string;
}[];

export type ProductCategory =
  | 'Accessories'
  | 'Beauty'
  | 'Body'
  | 'Hair';

export type ProductAbcClass =
  | 'A'
  | 'B'
  | 'C';

export type ProductXyzClass =
  | 'X'
  | 'Y'
  | 'Z';

export type ProductLifecycle =
  | 'Decline'
  | 'Growth'
  | 'Intro'
  | 'Maturity';

export type ProductStatus =
  | 'dead_stock'
  | 'healthy'
  | 'overstock'
  | 'slow_mover'
  | 'stockout_risk'
  | 'watch';

export type ProductSku = {
  readonly abc: ProductAbcClass;
  readonly available: number;
  readonly brand: string;
  readonly category: ProductCategory;
  readonly cogs: number;
  readonly cv: number;
  readonly dsi: number;
  readonly id: string;
  readonly leadTime: number;
  readonly lifecycle: ProductLifecycle;
  readonly margin: number;
  readonly marginPct: number;
  readonly name: string;
  readonly orders: number;
  readonly reserved: number;
  readonly revenue: number;
  readonly status: ProductStatus;
  readonly statusText: string;
  readonly stock: number;
  readonly units: number;
  readonly xyz: ProductXyzClass;
};

export const productSkuDatabase = [
  {
    id: 'SER-C-30',
    name: 'Serum Glow C 30ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 184200,
    units: 4280,
    orders: 3710,
    cogs: 104900,
    margin: 79300,
    marginPct: 43.1,
    stock: 184,
    reserved: 20,
    available: 164,
    dsi: 8.2,
    leadTime: 12,
    abc: 'A',
    xyz: 'X',
    cv: 0.28,
    status: 'stockout_risk',
    statusText: 'RYZYKO STOCKOUTU',
    lifecycle: 'Growth',
  },
  {
    id: 'KRM-BR-50',
    name: 'Krem Barrier Repair 50ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 151000,
    units: 3560,
    orders: 3100,
    cogs: 92110,
    margin: 58890,
    marginPct: 39,
    stock: 420,
    reserved: 30,
    available: 390,
    dsi: 14,
    leadTime: 14,
    abc: 'A',
    xyz: 'X',
    cv: 0.32,
    status: 'watch',
    statusText: 'UWAGA LEAD TIME',
    lifecycle: 'Maturity',
  },
  {
    id: 'TNK-HY-200',
    name: 'Tonik Nawilżający 200ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 82000,
    units: 2910,
    orders: 2400,
    cogs: 67240,
    margin: 14760,
    marginPct: 18,
    stock: 3020,
    reserved: 50,
    available: 2970,
    dsi: 94,
    leadTime: 7,
    abc: 'C',
    xyz: 'Y',
    cv: 0.65,
    status: 'overstock',
    statusText: 'OVERSTOCK',
    lifecycle: 'Maturity',
  },
  {
    id: 'ZST-HC-REPAIR',
    name: 'Zestaw Hair Care Repair',
    category: 'Hair',
    brand: 'PapaCare',
    revenue: 124000,
    units: 1100,
    orders: 980,
    cogs: 78000,
    margin: 46000,
    marginPct: 37.1,
    stock: 95,
    reserved: 10,
    available: 85,
    dsi: 6.5,
    leadTime: 10,
    abc: 'A',
    xyz: 'Y',
    cv: 0.72,
    status: 'stockout_risk',
    statusText: 'RYZYKO STOCKOUTU',
    lifecycle: 'Growth',
  },
  {
    id: 'MSK-HY-100',
    name: 'Maska Nawilżająca 100ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 64000,
    units: 1800,
    orders: 1600,
    cogs: 41000,
    margin: 23000,
    marginPct: 35.9,
    stock: 600,
    reserved: 20,
    available: 580,
    dsi: 28,
    leadTime: 7,
    abc: 'B',
    xyz: 'X',
    cv: 0.41,
    status: 'healthy',
    statusText: 'OK',
    lifecycle: 'Maturity',
  },
  {
    id: 'PLC-KW-100',
    name: 'Peeling Kwasowy 100ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 32000,
    units: 640,
    orders: 590,
    cogs: 21000,
    margin: 11000,
    marginPct: 34.3,
    stock: 850,
    reserved: 5,
    available: 845,
    dsi: 120,
    leadTime: 14,
    abc: 'B',
    xyz: 'Z',
    cv: 1.15,
    status: 'slow_mover',
    statusText: 'SLOW MOVER',
    lifecycle: 'Decline',
  },
  {
    id: 'OLK-RET-30',
    name: 'Olejek Retinol 0.5% 30ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 29000,
    units: 410,
    orders: 390,
    cogs: 16000,
    margin: 13000,
    marginPct: 44.8,
    stock: 500,
    reserved: 10,
    available: 490,
    dsi: 35,
    leadTime: 14,
    abc: 'B',
    xyz: 'X',
    cv: 0.38,
    status: 'healthy',
    statusText: 'OK',
    lifecycle: 'Intro',
  },
  {
    id: 'SZMP-BC-250',
    name: 'Szampon Wzmacniający 250ml',
    category: 'Hair',
    brand: 'PapaCare',
    revenue: 41000,
    units: 1450,
    orders: 1200,
    cogs: 27000,
    margin: 14000,
    marginPct: 34.1,
    stock: 310,
    reserved: 15,
    available: 295,
    dsi: 18,
    leadTime: 7,
    abc: 'A',
    xyz: 'Z',
    cv: 1.42,
    status: 'healthy',
    statusText: 'OK',
    lifecycle: 'Growth',
  },
  {
    id: 'BAL-BD-200',
    name: 'Balsam Do Ciała 200ml',
    category: 'Body',
    brand: 'PapaCare',
    revenue: 19500,
    units: 650,
    orders: 580,
    cogs: 13000,
    margin: 6500,
    marginPct: 33.3,
    stock: 450,
    reserved: 0,
    available: 450,
    dsi: 60,
    leadTime: 7,
    abc: 'C',
    xyz: 'X',
    cv: 0.45,
    status: 'healthy',
    statusText: 'OK',
    lifecycle: 'Maturity',
  },
  {
    id: 'AKC-SZCZOT',
    name: 'Szczotka Do Masażu',
    category: 'Accessories',
    brand: 'PapaCare',
    revenue: 12000,
    units: 300,
    orders: 280,
    cogs: 5000,
    margin: 7000,
    marginPct: 58.3,
    stock: 120,
    reserved: 0,
    available: 120,
    dsi: 40,
    leadTime: 21,
    abc: 'C',
    xyz: 'Z',
    cv: 1.08,
    status: 'dead_stock',
    statusText: 'DEAD STOCK',
    lifecycle: 'Decline',
  },
] as const satisfies readonly ProductSku[];

export const productTrendModes = [
  {
    label: 'Przychód (zł)',
    value: 'revenue',
  },
  {
    label: 'Wolumen (szt.)',
    value: 'units',
  },
  {
    label: 'Marża brutto (zł)',
    value: 'margin',
  },
] as const;

export type ProductTrendMode = typeof productTrendModes[number]['value'];

export const productTrendLabels = [
  '1 Aug',
  '4 Aug',
  '7 Aug',
  '10 Aug',
  '13 Aug',
  '16 Aug',
  '19 Aug',
  '22 Aug',
  '25 Aug',
  '28 Aug',
] as const;

export const productTrendSeries = {
  revenue: [42000, 48000, 45000, 51000, 56000, 53000, 62000, 59000, 64000, 68000],
  units: [420, 480, 450, 510, 560, 530, 620, 590, 640, 680],
  margin: [14000, 16200, 15100, 17200, 19100, 17800, 20900, 19800, 21500, 22800],
  support: [210, 240, 225, 255, 280, 265, 310, 295, 320, 340],
} as const;

export const productMatrixRows = [
  {
    title: 'Klasa A (Top 80% Marży)',
    description: 'Produkty kluczowe z punktu widzenia zysku. Wymagają najwyższego priorytetu dostępności.',
    tone: 'indigo',
  },
  {
    title: 'Klasa B (Kolejne 15%)',
    description: 'Średnia wartość zysku. Standardowa kontrola zapasu i lead time.',
    tone: 'slate',
  },
  {
    title: 'Klasa C (Pozostałe 5%)',
    description: 'Długi ogon asortymentu. Kandydaci do automatyzacji lub wycofania z oferty.',
    tone: 'slate',
  },
] as const satisfies readonly {
  readonly description: string;
  readonly title: string;
  readonly tone: ProductsTone;
}[];

export type ProductMatrixCode =
  | 'AX'
  | 'AY'
  | 'AZ'
  | 'BX'
  | 'BY'
  | 'BZ'
  | 'CX'
  | 'CY'
  | 'CZ';

export const productMatrixCells = [
  {
    code: 'AX',
    count: '4 SKU',
    margin: '48.2% Całkowitej Marży',
    label: 'Strategiczny',
    tone: 'emerald',
    weight: 'strong',
  },
  {
    code: 'AY',
    count: '2 SKU',
    margin: '21.4% Całkowitej Marży',
    label: 'Wysoki Zysk',
    tone: 'emerald',
    weight: 'soft',
  },
  {
    code: 'AZ',
    count: '1 SKU',
    margin: '10.4% Całkowitej Marży',
    label: 'Wysokie Ryzyko',
    tone: 'amber',
    weight: 'strong',
  },
  {
    code: 'BX',
    count: '2 SKU',
    margin: '9.1% Marży',
    label: 'Standard',
    tone: 'slate',
    weight: 'soft',
  },
  {
    code: 'BY',
    count: '1 SKU',
    margin: '4.5% Marży',
    label: 'Średni Popyt',
    tone: 'slate',
    weight: 'soft',
  },
  {
    code: 'BZ',
    count: '1 SKU',
    margin: '2.4% Marży',
    label: 'Nieregularny',
    tone: 'amber',
    weight: 'soft',
  },
  {
    code: 'CX',
    count: '1 SKU',
    margin: '1.8% Marży',
    label: 'Niska Wartość',
    tone: 'slate',
    weight: 'soft',
  },
  {
    code: 'CY',
    count: '0 SKU',
    margin: '0.0% Marży',
    label: 'Niska Rotacja',
    tone: 'rose',
    weight: 'soft',
  },
  {
    code: 'CZ',
    count: '0 SKU',
    margin: '0.8% Marży',
    label: 'Kandydat Wycofania',
    tone: 'rose',
    weight: 'strong',
  },
] as const satisfies readonly {
  readonly code: ProductMatrixCode;
  readonly count: string;
  readonly label: string;
  readonly margin: string;
  readonly tone: ProductsTone;
  readonly weight: 'soft' | 'strong';
}[];

export const productAccessibleMatrixRows = [
  {
    code: 'AX',
    count: '4',
    margin: '48.2%',
    purpose: 'Produkty strategiczne o wysokim zysku i stabilnym popycie. Chronić stock.',
  },
  {
    code: 'AY',
    count: '2',
    margin: '21.4%',
    purpose: 'Wysoki zysk, umiarkowana zmienność. Wyższy zapas bezpieczeństwa.',
  },
  {
    code: 'AZ',
    count: '1',
    margin: '10.4%',
    purpose: 'Wysoki zysk, bardzo niestabilny popyt. Śledzić akcje promocyjne.',
  },
] as const;

export const productInventoryRisks = [
  {
    name: 'Serum Glow C 30ml',
    sku: 'SER-C-30',
    dsi: '8 dni',
    leadTime: '12 dni',
    stock: '184 szt.',
    recommendation: 'Potrzebne zamówienie: 420 szt. (Prognoza)',
    progress: 35,
    tone: 'rose',
  },
  {
    name: 'Krem Barrier Repair 50ml',
    sku: 'KRM-BR-50',
    dsi: '14 dni',
    leadTime: '14 dni',
    stock: '420 szt.',
    recommendation: 'Na granicy horyzontu dostawy',
    progress: 50,
    tone: 'amber',
  },
] as const satisfies readonly {
  readonly dsi: string;
  readonly leadTime: string;
  readonly name: string;
  readonly progress: number;
  readonly recommendation: string;
  readonly sku: string;
  readonly stock: string;
  readonly tone: ProductsTone;
}[];

export const productFinancialMetrics = [
  {
    label: 'Inventory Turnover',
    value: '3.8x / rok',
    helper: 'COGS / Średni Zapas',
  },
  {
    label: 'GMROI (Gross Margin Return)',
    value: '1.27 zł',
    helper: 'Marża brutto zł z 1 zł w zapasie',
  },
] as const;

export const productDeadStockAlert = {
  title: 'Dead Stock (>60 dni braku rotacji)',
  count: '17 SKU',
  value: '38 400 zł zamrożonego kapitału',
  description: 'Produkty posiadają dodatni zapas magazynowy, ale brak jakiejkolwiek sprzedaży w ciągu ostatnich 60 dni. Zrekomenduj wyprzedaż promocyjną lub bundle.',
} as const;

export const productPromotions = [
  {
    product: "Serum Glow C 30ml (Oferta Lato '26)",
    regularPrice: '59,00 zł',
    promoPrice: '49,00 zł',
    discount: '-16.9%',
    units: '1 240 szt.',
    revenue: '60 760 zł',
    margin: '32.4% (Pozytywna)',
    status: 'Opłacalna',
    tone: 'emerald',
  },
  {
    product: 'Zestaw Naprawczy Hair Care',
    regularPrice: '149,00 zł',
    promoPrice: '99,00 zł',
    discount: '-33.5%',
    units: '450 szt.',
    revenue: '44 550 zł',
    margin: '8.2% (Erozja!)',
    status: 'Zagrożenie Marży',
    tone: 'rose',
  },
] as const satisfies readonly {
  readonly discount: string;
  readonly margin: string;
  readonly product: string;
  readonly promoPrice: string;
  readonly regularPrice: string;
  readonly revenue: string;
  readonly status: string;
  readonly tone: ProductsTone;
  readonly units: string;
}[];

export const productBasketInsight = {
  title: 'Serum Glow C + Krem Barrier Repair',
  badge: 'Lift: 2.3x',
  sharedOrders: '842 orders',
  support: '8.4%',
  confidence: '31.2%',
  description: 'Co trzeci klient kupujący Serum Glow C dodaje do koszyka Krem Barrier Repair.',
  formula: 'Wzór: Confidence = orders(A+B) / orders(A) · Lift = Confidence / Support(B)',
} as const;

export const productBundleScenario = {
  defaultDiscount: 10,
  basePrice: 208,
  baseCogs: 106,
} as const;

export const productLifecycleCards = [
  {
    stage: 'Intro (Wdrożenie)',
    count: '1 SKU',
    description: 'Produkty z historią < 14 dni. XYZ oznaczane jako N/A.',
    product: 'Olejek Retinol 0.5%',
    tone: 'blue',
  },
  {
    stage: 'Growth (Wzrost)',
    count: '5 SKU',
    description: 'Dodatnia dynamika MoM wolumenu i marży > 15%.',
    product: 'Serum Glow C 30ml',
    tone: 'emerald',
  },
  {
    stage: 'Maturity (Dojrzałość)',
    count: '4 SKU',
    description: 'Stabilna sprzedaż, niski CV popytu, wysoki zysk.',
    product: 'Krem Barrier Repair 50ml',
    tone: 'slate',
  },
  {
    stage: 'Decline (Spadek)',
    count: '2 SKU',
    description: 'Spadek sprzedaży > 20% MoM mimo braku stockoutu.',
    product: 'Peeling Kwasowy 100ml',
    tone: 'rose',
  },
] as const satisfies readonly {
  readonly count: string;
  readonly description: string;
  readonly product: string;
  readonly stage: string;
  readonly tone: ProductsTone;
}[];

export const productInsightAuditSteps = [
  {
    label: '1. Obserwacja',
    value: 'SKU SER-C-30 ma 8 dni pokrycia.',
  },
  {
    label: '2. Dowód',
    value: 'Średnia: 23 szt./d, zapas: 184 szt.',
  },
  {
    label: '3. Interpretacja',
    value: 'Stockout nastąpi przed dostawą.',
  },
  {
    label: '4. Rekomendacja',
    value: 'Wstrzymaj rabaty, przyśpiesz ERP.',
  },
  {
    label: '5. Wpływ',
    value: 'Ochrona 12.8% marży firmy.',
  },
  {
    label: '6. Pewność',
    value: 'Wysoka (100%)',
  },
  {
    label: '7. Ograniczenia',
    value: 'Brak danych o zamówieniach PO.',
  },
] as const;

export const productDrawerPriceHistory = [
  {
    week: 'W1',
    regular: 59,
    effective: 59,
  },
  {
    week: 'W2',
    regular: 59,
    effective: 59,
  },
  {
    week: 'W3',
    regular: 59,
    effective: 49,
  },
  {
    week: 'W4',
    regular: 59,
    effective: 49,
  },
] as const;
