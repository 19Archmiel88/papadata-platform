import { describe, expect, it } from 'vitest';
import {
  calculateProductBundle,
  deriveProducts,
  deriveProductMerchandising,
  filterProductRows,
  productInventory,
} from './ProductAnalysis.data';
import { productDemoData, productDemoRange } from './ProductsScreen.data';

describe('Product economics, inventory and classification', () => {
  it('reconciles monthly observations, rows and headline totals', () => {
    const result = deriveProducts(productDemoData, productDemoRange);
    expect(result.rows).toHaveLength(10);
    expect(result.rows.find((row) => row.id === 'SER-C-30')).toMatchObject({
      revenue: 184200,
      units: 4280,
      cogs: 104900,
      margin: 79300,
    });
    expect(result.revenue).toBe(result.rows.reduce((sum, row) => sum + row.revenue, 0));
    expect(result.units).toBe(result.rows.reduce((sum, row) => sum + row.units, 0));
    expect(result.complete).toBe(true);
  });
  it('preserves missing cost and computes revenue-weighted cost coverage', () => {
    const result = deriveProducts(productDemoData, productDemoRange);
    const missing = result.rows.find((row) => row.id === 'OLK-RET-30')!;
    expect(missing.cogs).toBeNull();
    expect(missing.margin).toBeNull();
    expect(missing.abc).toBeNull();
    expect(result.costCoverage).toBe(((result.revenue - missing.revenue) / result.revenue) * 100);
    expect(result.knownMargin).toBe(result.rows.reduce((sum, row) => sum + (row.margin ?? 0), 0));
  });
  it('filters dates and category before totals and disables XYZ for a short history', () => {
    const result = deriveProducts(
      productDemoData,
      { ...productDemoRange, from: '2026-08-10', to: '2026-08-16' },
      'Hair',
    );
    expect(result.rows).toHaveLength(2);
    expect(
      result.rows.every((row) => row.category === 'Hair' && row.observedDays === 7 && row.complete),
    ).toBe(true);
    expect(result.rows.every((row) => row.xyz === null)).toBe(true);
    expect(result.matrix.reduce((sum, cell) => sum + cell.count, 0)).toBe(0);
  });
  it('derives ABC/XYZ cells from classified rows, leaving new products unclassified', () => {
    const result = deriveProducts(productDemoData, productDemoRange);
    expect(result.rows.find((row) => row.id === 'OLK-RET-30')!.xyz).toBeNull();
    expect(result.matrix.reduce((sum, cell) => sum + cell.count, 0) + result.unclassified).toBe(10);
    for (const cell of result.matrix) {
      const rows = result.rows.filter((row) => `${row.abc}${row.xyz}` === cell.code);
      expect(cell.count).toBe(rows.length);
      expect(cell.margin).toBe(rows.reduce((sum, row) => sum + row.margin!, 0));
    }
  });
  it('keeps inventory demand independent of the selected sales period', () => {
    const full = deriveProducts(productDemoData, productDemoRange),
      short = deriveProducts(productDemoData, {
        ...productDemoRange,
        from: '2026-07-01',
        to: '2026-07-07',
      });
    for (const row of full.inventoryRows) {
      const other = short.inventoryRows.find((candidate) => candidate.id === row.id)!;
      expect(row.coverage).toBe(other.coverage);
      expect(row.status).toBe(other.status);
      expect(row.available).toBe(row.stock!.stock - row.stock!.reserved);
    }
    const risk = filterProductRows(full.inventoryRows, 'stock_risk');
    expect(risk.length).toBeGreaterThan(0);
    expect(risk.every((row) => row.coverage! < row.leadTime!)).toBe(true);
  });
  it('does not infer infinite coverage or a stockout date from absent demand', () => {
    const stock = productDemoData.inventory[0];
    expect(productInventory(stock, [], 30)).toMatchObject({
      coverage: null,
      dailyDemand: null,
      status: 'unknown',
    });
    const zero = Array.from({ length: 30 }, (_, day) => ({
      date: `day-${day}`,
      skuId: stock.skuId,
      units: 0,
      revenue: 0,
      cogs: 0,
    }));
    expect(productInventory(stock, zero, 30)).toMatchObject({
      coverage: null,
      dailyDemand: 0,
      status: 'unknown',
    });
    expect(productInventory(null, zero, 30).available).toBeNull();
  });
  it('flags missing daily observations instead of calculating complete margin', () => {
    const result = deriveProducts(
      {
        ...productDemoData,
        days: productDemoData.days.filter(
          (day) => !(day.skuId === 'SER-C-30' && day.date === '2026-08-12'),
        ),
      },
      productDemoRange,
    );
    expect(result.complete).toBe(false);
    expect(result.rows.find((row) => row.id === 'SER-C-30')).toMatchObject({
      cogs: null,
      margin: null,
      abc: null,
      xyz: null,
      status: 'unknown',
    });
  });
  it('calculates bundle price and margin from the selected products at cent precision', () => {
    const rows = deriveProducts(productDemoData, productDemoRange).rows.slice(0, 2),
      result = calculateProductBundle(rows, 20)!;
    expect(result.price).toBe(Math.round(result.basePrice * 0.8 * 100) / 100);
    expect(result.margin).toBe(Math.round((result.price - result.cost) * 100) / 100);
    expect(result.marginPct).toBe((result.margin / result.price) * 100);
    expect(calculateProductBundle(rows, 99)!.discount).toBe(40);
    expect(calculateProductBundle([rows[0], rows[0]], 10)).toBeNull();
    expect(calculateProductBundle([rows[0], { ...rows[1], cogs: null }], 10)).toBeNull();
  });
  it('returns an empty sales range while keeping the separately dated inventory', () => {
    const result = deriveProducts(productDemoData, {
      ...productDemoRange,
      from: '2030-01-01',
      to: '2030-01-31',
    });
    expect(result.rows).toHaveLength(0);
    expect(result.inventoryRows).toHaveLength(10);
    expect(result.knownMargin).toBeNull();
    expect(deriveProducts(productDemoData, { ...productDemoRange, from: '', to: '' }).valid).toBe(
      false,
    );
  });
});

describe('Product promotions and basket observations', () => {
  it('reconciles promotional revenue and costs instead of using stored margin percentages', () => {
    const result = deriveProductMerchandising(productDemoData, productDemoRange);
    const serum = result.promotions.find((row) => row.id === 'SER-C-30')!;
    expect(serum.units).toBe(1240);
    expect(serum.revenue).toBe(60760);
    expect(serum.margin).toBe(Math.round((49 - 24.51) * 1240 * 100) / 100);
    expect(serum.discount).toBe((1 - 49 / 59) * 100);
  });
  it('computes support, conditional share and lift from explicit basket counts', () => {
    const pair = deriveProductMerchandising(productDemoData, productDemoRange).baskets[0];
    expect(pair).toMatchObject({ orders: 10000, first: 2700, second: 1350, both: 842 });
    expect(pair.support).toBe((842 / 10000) * 100);
    expect(pair.confidence).toBe((842 / 2700) * 100);
    expect(pair.lift).toBe(842 / 2700 / (1350 / 10000));
  });
  it('applies the same date and category scope to promotional and basket observations', () => {
    const result = deriveProductMerchandising(
      productDemoData,
      { ...productDemoRange, from: '2026-08-10', to: '2026-08-16' },
      'Hair',
    );
    expect(result.promotions).toHaveLength(1);
    expect(result.promotions[0].units).toBeLessThan(450);
    expect(result.baskets).toHaveLength(0);
    expect(
      deriveProductMerchandising(productDemoData, {
        ...productDemoRange,
        from: '2026-07-01',
        to: '2026-07-31',
      }).promotions,
    ).toHaveLength(0);
  });
  it('keeps missing promotion cost and empty basket denominators unavailable', () => {
    const result = deriveProductMerchandising(
      {
        ...productDemoData,
        promotions: productDemoData.promotions!.map((day) => ({ ...day, unitCost: null })),
        baskets: [
          {
            date: '2026-08-01',
            firstSku: 'SER-C-30',
            secondSku: 'KRM-BR-50',
            orders: 0,
            first: 0,
            second: 0,
            both: 0,
          },
        ],
      },
      productDemoRange,
    );
    expect(result.promotions.every((row) => row.margin === null)).toBe(true);
    expect(result.baskets[0]).toMatchObject({ support: null, confidence: null, lift: null });
  });
});
