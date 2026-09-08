import type { DateRange } from '../../../../../contracts/ui-contract-types';
import {
  overviewDayCount,
  overviewNumber,
  shiftOverviewDate,
} from '../command-center/CommandCenterScreen.data';
import type {
  ProductCategory,
  ProductData,
  ProductDay,
  ProductIdentity,
  ProductStock,
} from './ProductsScreen.data';

export const productNumber = (value: number | null, digits = 0) =>
  value === null ? '—' : overviewNumber(value, digits);
export const productMoney = (value: number | null, digits = 0) =>
  value === null ? '—' : `${productNumber(value, digits)} zł`;
const cents = (n: number) => Math.round(n * 100) / 100;
export type ProductFilter = 'all' | 'missing_cost' | 'no_margin' | 'stock_risk' | 'excess_stock';
export const productFilterLabels: Record<ProductFilter, string> = {
  all: 'Wszystkie',
  missing_cost: 'Brak kosztu',
  no_margin: 'Sprzedaż bez marży',
  stock_risk: 'Ryzyko braku',
  excess_stock: 'Zapas ponad 90 dni',
};
export type ProductInventoryResult = {
  available: number | null;
  coverage: number | null;
  dailyDemand: number | null;
  capital: number | null;
  leadTime: number | null;
  status: 'risk' | 'excess' | 'ready' | 'unknown';
};
export type ProductResult = ProductIdentity &
  ProductInventoryResult & {
    revenue: number;
    units: number;
    cogs: number | null;
    margin: number | null;
    marginPct: number | null;
    complete: boolean;
    observedDays: number;
    abc: 'A' | 'B' | 'C' | null;
    xyz: 'X' | 'Y' | 'Z' | null;
    stock: ProductStock | null;
  };

function coefficientOfVariation(values: readonly number[]) {
  if (values.length < 14) return null;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  if (mean <= 0) return null;
  return (
    Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length) / mean
  );
}
export function productInventory(
  stock: ProductStock | null,
  demand: readonly ProductDay[],
  expectedDays: number,
): ProductInventoryResult {
  const available = stock ? Math.max(0, stock.stock - stock.reserved) : null;
  const complete =
    expectedDays >= 14 && new Set(demand.map((day) => day.date)).size === expectedDays;
  const dailyDemand = complete
    ? demand.reduce((sum, day) => sum + day.units, 0) / expectedDays
    : null;
  const coverage =
    available !== null && dailyDemand !== null && dailyDemand > 0 ? available / dailyDemand : null;
  const capital =
    stock && available !== null && stock.unitCost !== null
      ? cents(available * stock.unitCost)
      : null;
  const leadTime = stock?.leadTime ?? null;
  const status =
    coverage === null || leadTime === null
      ? 'unknown'
      : coverage < leadTime
        ? 'risk'
        : coverage > 90
          ? 'excess'
          : 'ready';
  return { available, coverage, dailyDemand, capital, leadTime, status };
}
export function filterProductRows(rows: readonly ProductResult[], filter: ProductFilter) {
  return rows.filter(
    (row) =>
      filter === 'all' ||
      (filter === 'missing_cost'
        ? row.cogs === null
        : filter === 'no_margin'
          ? row.margin !== null && row.revenue > 0 && row.margin <= 0
          : filter === 'stock_risk'
            ? row.status === 'risk'
            : row.status === 'excess'),
  );
}
export function deriveProducts(
  data: ProductData,
  range: DateRange,
  category: ProductCategory | 'all' = 'all',
) {
  const valid = overviewDayCount(range) > 0 && overviewDayCount(range) <= 366;
  const inventoryStart = shiftOverviewDate(data.inventoryDate, -29);
  const rows: ProductResult[] = data.products
    .filter((p) => category === 'all' || p.category === category)
    .map((product) => {
      const current = valid
        ? data.days.filter(
            (day) => day.skuId === product.id && day.date >= range.from && day.date <= range.to,
          )
        : [];
      const first = range.from > product.availableFrom ? range.from : product.availableFrom;
      const expected = valid && first <= range.to ? overviewDayCount({ ...range, from: first }) : 0;
      const complete = expected > 0 && new Set(current.map((day) => day.date)).size === expected;
      const revenue = cents(current.reduce((sum, day) => sum + day.revenue, 0));
      const units = current.reduce((sum, day) => sum + day.units, 0);
      const cogs =
        current.length && complete && current.every((day) => day.cogs !== null)
          ? cents(current.reduce((sum, day) => sum + (day.cogs ?? 0), 0))
          : null;
      const margin = cogs === null ? null : cents(revenue - cogs);
      const cv = complete ? coefficientOfVariation(current.map((day) => day.units)) : null;
      const stock = data.inventory.find((stock) => stock.skuId === product.id) ?? null;
      const demandStart =
        product.availableFrom > inventoryStart ? product.availableFrom : inventoryStart;
      const demand = data.days.filter(
        (day) =>
          day.skuId === product.id && day.date >= demandStart && day.date <= data.inventoryDate,
      );
      const expectedDemand =
        demandStart <= data.inventoryDate
          ? overviewDayCount({ ...range, from: demandStart, to: data.inventoryDate })
          : 0;
      return {
        ...product,
        revenue,
        units,
        cogs,
        margin,
        marginPct: margin !== null && revenue > 0 ? (margin / revenue) * 100 : null,
        complete,
        observedDays: current.length,
        abc: null,
        xyz: cv === null ? null : cv <= 0.5 ? 'X' : cv <= 1 ? 'Y' : 'Z',
        stock,
        ...productInventory(stock, demand, expectedDemand),
      };
    });
  const observed = rows.filter((row) => row.observedDays > 0);
  const profitable = observed
    .filter((row) => row.margin !== null && row.margin > 0)
    .sort((a, b) => b.margin! - a.margin!);
  const positiveMargin = profitable.reduce((sum, row) => sum + row.margin!, 0);
  let cumulative = 0;
  for (const row of profitable) {
    row.abc = cumulative < 0.8 ? 'A' : cumulative < 0.95 ? 'B' : 'C';
    cumulative += row.margin! / positiveMargin;
  }
  const revenue = cents(observed.reduce((sum, row) => sum + row.revenue, 0));
  const coveredRevenue = cents(
    observed.filter((row) => row.cogs !== null).reduce((sum, row) => sum + row.revenue, 0),
  );
  const knownMargin = cents(observed.reduce((sum, row) => sum + (row.margin ?? 0), 0));
  const matrix = (['A', 'B', 'C'] as const).flatMap((abc) =>
    (['X', 'Y', 'Z'] as const).map((xyz) => {
      const members = observed.filter((row) => row.abc === abc && row.xyz === xyz);
      return {
        code: `${abc}${xyz}`,
        count: members.length,
        margin: cents(members.reduce((sum, row) => sum + row.margin!, 0)),
      };
    }),
  );
  return {
    valid,
    rows: observed,
    inventoryRows: rows,
    revenue,
    coveredRevenue,
    knownMargin: coveredRevenue > 0 ? knownMargin : null,
    costCoverage: revenue > 0 ? (coveredRevenue / revenue) * 100 : null,
    complete: observed.length > 0 && observed.every((row) => row.complete),
    units: observed.reduce((sum, row) => sum + row.units, 0),
    matrix,
    unclassified: observed.filter((row) => row.abc === null || row.xyz === null).length,
    inventoryDate: data.inventoryDate,
  };
}
export type ProductAnalysis = ReturnType<typeof deriveProducts>;

export function calculateProductBundle(rows: readonly ProductResult[], discount: number) {
  const validDiscount = Math.max(0, Math.min(40, Number.isFinite(discount) ? discount : 0));
  if (
    rows.length !== 2 ||
    new Set(rows.map((row) => row.id)).size !== 2 ||
    rows.some((row) => row.units <= 0 || row.cogs === null || !row.complete)
  )
    return null;
  const basePrice = cents(rows.reduce((sum, row) => sum + row.revenue / row.units, 0));
  const cost = cents(rows.reduce((sum, row) => sum + row.cogs! / row.units, 0));
  const price = cents(basePrice * (1 - validDiscount / 100));
  return {
    basePrice: cents(basePrice),
    price: cents(price),
    cost: cents(cost),
    margin: cents(price - cost),
    marginPct: price > 0 ? (cents(price - cost) / price) * 100 : null,
    discount: validDiscount,
  };
}

export function deriveProductMerchandising(
  data: ProductData,
  range: DateRange,
  category: ProductCategory | 'all' = 'all',
) {
  const valid = overviewDayCount(range) > 0 && overviewDayCount(range) <= 366;
  const products = data.products.filter((row) => category === 'all' || row.category === category);
  const promotions = products.flatMap((product) => {
    const days = (data.promotions ?? []).filter(
      (day) => valid && day.skuId === product.id && day.date >= range.from && day.date <= range.to,
    );
    const units = days.reduce((sum, day) => sum + day.units, 0);
    if (units === 0) return [];
    const regularValue = days.reduce((sum, day) => sum + day.units * day.regularPrice, 0);
    const revenue = cents(days.reduce((sum, day) => sum + day.units * day.promoPrice, 0));
    const cost = days.every((day) => day.unitCost !== null)
      ? cents(days.reduce((sum, day) => sum + day.units * day.unitCost!, 0))
      : null;
    const margin = cost === null ? null : cents(revenue - cost);
    return [
      {
        ...product,
        units,
        regularPrice: regularValue / units,
        promoPrice: revenue / units,
        discount: regularValue > 0 ? (1 - revenue / regularValue) * 100 : null,
        revenue,
        margin,
        marginPct: margin === null || revenue <= 0 ? null : (margin / revenue) * 100,
      },
    ];
  });
  const pairs = new Map<
    string,
    {
      firstSku: string;
      secondSku: string;
      orders: number;
      first: number;
      second: number;
      both: number;
    }
  >();
  for (const day of data.baskets ?? []) {
    if (
      !valid ||
      day.date < range.from ||
      day.date > range.to ||
      !products.some((p) => p.id === day.firstSku) ||
      !products.some((p) => p.id === day.secondSku)
    )
      continue;
    const key = `${day.firstSku}:${day.secondSku}`;
    const pair = pairs.get(key) ?? {
      firstSku: day.firstSku,
      secondSku: day.secondSku,
      orders: 0,
      first: 0,
      second: 0,
      both: 0,
    };
    pair.orders += day.orders;
    pair.first += day.first;
    pair.second += day.second;
    pair.both += day.both;
    pairs.set(key, pair);
  }
  const baskets = [...pairs.values()].map((pair) => ({
    ...pair,
    support: pair.orders > 0 ? (pair.both / pair.orders) * 100 : null,
    confidence: pair.first > 0 ? (pair.both / pair.first) * 100 : null,
    lift:
      pair.first > 0 && pair.second > 0 && pair.orders > 0
        ? pair.both / pair.first / (pair.second / pair.orders)
        : null,
  }));
  return { promotions, baskets };
}
