import { shiftOverviewDate } from '../command-center/CommandCenterScreen.data';

export type ProductCategory = 'Accessories' | 'Beauty' | 'Body' | 'Hair';
export type ProductLifecycle = 'Intro' | 'Growth' | 'Maturity' | 'Decline';
export type ProductIdentity = {
  readonly id: string;
  readonly name: string;
  readonly category: ProductCategory;
  readonly brand: string;
  readonly availableFrom: string;
  readonly lifecycle: ProductLifecycle;
};
export type ProductDay = {
  readonly date: string;
  readonly skuId: string;
  readonly revenue: number;
  readonly units: number;
  readonly cogs: number | null;
};
export type ProductStock = {
  readonly skuId: string;
  readonly stock: number;
  readonly reserved: number;
  readonly unitCost: number | null;
  readonly leadTime: number | null;
};
export type ProductPromotionDay = {
  readonly date: string;
  readonly skuId: string;
  readonly regularPrice: number;
  readonly promoPrice: number;
  readonly units: number;
  readonly unitCost: number | null;
};
export type ProductBasketDay = {
  readonly date: string;
  readonly firstSku: string;
  readonly secondSku: string;
  readonly orders: number;
  readonly first: number;
  readonly second: number;
  readonly both: number;
};
export type ProductData = {
  readonly products: readonly ProductIdentity[];
  readonly days: readonly ProductDay[];
  readonly inventory: readonly ProductStock[];
  readonly inventoryDate: string;
  readonly promotions?: readonly ProductPromotionDay[];
  readonly baskets?: readonly ProductBasketDay[];
};
export const productCategories: Record<ProductCategory, string> = {
  Beauty: 'Twarz',
  Hair: 'Włosy',
  Body: 'Ciało',
  Accessories: 'Akcesoria',
};
export const productLifecycleLabels: Record<ProductLifecycle, string> = {
  Intro: 'Wprowadzenie',
  Growth: 'Wzrost',
  Maturity: 'Dojrzałość',
  Decline: 'Spadek',
};

// Synthetic monthly examples. These are not the store's complete product ledger.
const monthlyExamples = [
  {
    id: 'SER-C-30',
    name: 'Serum Glow C 30ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 184200,
    units: 4280,
    cogs: 104900,
    stock: 184,
    reserved: 20,
    leadTime: 12,
    lifecycle: 'Growth',
  },
  {
    id: 'KRM-BR-50',
    name: 'Krem Barrier Repair 50ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 151000,
    units: 3560,
    cogs: 92110,
    stock: 420,
    reserved: 30,
    leadTime: 14,
    lifecycle: 'Maturity',
  },
  {
    id: 'TNK-HY-200',
    name: 'Tonik Nawilżający 200ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 82000,
    units: 2910,
    cogs: 67240,
    stock: 3020,
    reserved: 50,
    leadTime: 7,
    lifecycle: 'Maturity',
  },
  {
    id: 'ZST-HC-REPAIR',
    name: 'Zestaw Hair Care Repair',
    category: 'Hair',
    brand: 'PapaCare',
    revenue: 124000,
    units: 1100,
    cogs: 78000,
    stock: 95,
    reserved: 10,
    leadTime: 10,
    lifecycle: 'Growth',
  },
  {
    id: 'MSK-HY-100',
    name: 'Maska Nawilżająca 100ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 64000,
    units: 1800,
    cogs: 41000,
    stock: 600,
    reserved: 20,
    leadTime: 7,
    lifecycle: 'Maturity',
  },
  {
    id: 'PLC-KW-100',
    name: 'Peeling Kwasowy 100ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 32000,
    units: 640,
    cogs: 21000,
    stock: 850,
    reserved: 5,
    leadTime: 14,
    lifecycle: 'Decline',
  },
  {
    id: 'OLK-RET-30',
    name: 'Olejek Retinol 0.5% 30ml',
    category: 'Beauty',
    brand: 'PapaCare',
    revenue: 29000,
    units: 410,
    cogs: 16000,
    stock: 500,
    reserved: 10,
    leadTime: 14,
    lifecycle: 'Intro',
  },
  {
    id: 'SZMP-BC-250',
    name: 'Szampon Wzmacniający 250ml',
    category: 'Hair',
    brand: 'PapaCare',
    revenue: 41000,
    units: 1450,
    cogs: 27000,
    stock: 310,
    reserved: 15,
    leadTime: 7,
    lifecycle: 'Growth',
  },
  {
    id: 'BAL-BD-200',
    name: 'Balsam Do Ciała 200ml',
    category: 'Body',
    brand: 'PapaCare',
    revenue: 19500,
    units: 650,
    cogs: 13000,
    stock: 450,
    reserved: 0,
    leadTime: 7,
    lifecycle: 'Maturity',
  },
  {
    id: 'AKC-SZCZOT',
    name: 'Szczotka Do Masażu',
    category: 'Accessories',
    brand: 'PapaCare',
    revenue: 12000,
    units: 300,
    cogs: 5000,
    stock: 120,
    reserved: 0,
    leadTime: 21,
    lifecycle: 'Decline',
  },
] as const;
const products: ProductIdentity[] = monthlyExamples.map((row) => ({
  id: row.id,
  name: row.name,
  category: row.category,
  brand: row.brand,
  lifecycle: row.lifecycle,
  availableFrom: row.lifecycle === 'Intro' ? '2026-08-24' : '2026-07-01',
}));
const days: ProductDay[] = [];
for (const [index, row] of monthlyExamples.entries()) {
  for (const month of ['2026-07', '2026-08']) {
    const availableFrom = products[index].availableFrom;
    const dates = Array.from({ length: 31 }, (_, day) =>
      shiftOverviewDate(`${month}-01`, day),
    ).filter((date) => date >= availableFrom);
    const weights = dates.map(
      (_, day) => 1 + (index % 3 === 2 ? 0.85 : 0.2) * Math.sin(day * 1.7 + index),
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    const factor = month === '2026-08' ? 1 : 0.82 + index * 0.012;
    let cumulative = 0;
    dates.forEach((date, day) => {
      const previous = cumulative;
      cumulative += weights[day] / total;
      const allocate = (value: number, scale = 1) =>
        (Math.round(value * factor * cumulative * scale) -
          Math.round(value * factor * previous * scale)) /
        scale;
      days.push({
        date,
        skuId: row.id,
        revenue: allocate(row.revenue, 100),
        units: allocate(row.units),
        cogs: row.id === 'OLK-RET-30' ? null : allocate(row.cogs, 100),
      });
    });
  }
}
export const productDemoRange = {
  from: '2026-08-01',
  to: '2026-08-31',
  timezone: 'Europe/Warsaw',
  preset: 'custom' as const,
};
const allocateCount = (total: number, day: number) =>
  Math.round((total * (day + 1)) / 31) - Math.round((total * day) / 31);
const promotions: ProductPromotionDay[] = [
  { skuId: 'SER-C-30', regularPrice: 59, promoPrice: 49, units: 1240, unitCost: 24.51 },
  { skuId: 'ZST-HC-REPAIR', regularPrice: 149, promoPrice: 99, units: 450, unitCost: 70.91 },
].flatMap((promotion) =>
  Array.from({ length: 31 }, (_, day) => ({
    ...promotion,
    date: shiftOverviewDate('2026-08-01', day),
    units: allocateCount(promotion.units, day),
  })),
);
const baskets: ProductBasketDay[] = Array.from({ length: 31 }, (_, day) => ({
  date: shiftOverviewDate('2026-08-01', day),
  firstSku: 'SER-C-30',
  secondSku: 'KRM-BR-50',
  orders: allocateCount(10000, day),
  first: allocateCount(2700, day),
  second: allocateCount(1350, day),
  both: allocateCount(842, day),
}));
export const productDemoData: ProductData = {
  promotions,
  baskets,
  products,
  days,
  inventoryDate: '2026-08-31',
  inventory: monthlyExamples.map((row) => ({
    skuId: row.id,
    stock: row.stock,
    reserved: row.reserved,
    unitCost: row.id === 'OLK-RET-30' ? null : row.cogs / row.units,
    leadTime: row.leadTime,
  })),
};
