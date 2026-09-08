-- Adds cost_of_goods_sold to the dashboard metric code catalog so
-- app.metric_definitions and app.metric_snapshots can carry it. The engine
-- (apps/api/src/metrics/metricEngineCore.ts) already computes this metric;
-- this migration only widens the two CHECK constraints that previously
-- rejected it.

ALTER TABLE app.metric_definitions
  DROP CONSTRAINT IF EXISTS metric_definitions_metric_code_valid;

ALTER TABLE app.metric_definitions
  ADD CONSTRAINT metric_definitions_metric_code_valid
  CHECK (
    metric_code IN (
      'ad_spend',
      'aov',
      'available_stock',
      'cost_of_goods_sold',
      'cost_per_order',
      'cpc',
      'cpm',
      'ctr',
      'days_of_inventory',
      'gross_order_value',
      'inventory_turnover',
      'orders',
      'platform_attributed_conversions',
      'platform_attributed_revenue',
      'product_contribution',
      'product_margin',
      'product_revenue',
      'product_units',
      'return_rate_orders',
      'return_rate_units',
      'return_value',
      'returned_units',
      'revenue_after_refunds',
      'roas',
      'sell_through_rate',
      'stock_value',
      'stockout_risk',
      'units_sold'
    )
  );

ALTER TABLE app.metric_snapshots
  DROP CONSTRAINT IF EXISTS metric_snapshots_metric_code_valid;

ALTER TABLE app.metric_snapshots
  ADD CONSTRAINT metric_snapshots_metric_code_valid
  CHECK (
    metric_code IN (
      'ad_spend',
      'aov',
      'available_stock',
      'cost_of_goods_sold',
      'cost_per_order',
      'cpc',
      'cpm',
      'ctr',
      'days_of_inventory',
      'gross_order_value',
      'inventory_turnover',
      'orders',
      'platform_attributed_conversions',
      'platform_attributed_revenue',
      'product_contribution',
      'product_margin',
      'product_revenue',
      'product_units',
      'return_rate_orders',
      'return_rate_units',
      'return_value',
      'returned_units',
      'revenue_after_refunds',
      'roas',
      'sell_through_rate',
      'stock_value',
      'stockout_risk',
      'units_sold'
    )
  );
