-- P0-01: align persisted metric codes with the canonical 58-metric catalog.
-- Existing snapshots/definitions that used the pre-canonical alias are migrated
-- to `cogs` before the CHECK constraints are replaced.

UPDATE app.metric_definitions
SET metric_code = 'cogs'
WHERE metric_code = 'cost_of_goods_sold';

UPDATE app.metric_snapshots
SET metric_code = 'cogs'
WHERE metric_code = 'cost_of_goods_sold';

ALTER TABLE app.metric_definitions
  DROP CONSTRAINT IF EXISTS metric_definitions_metric_code_valid;

ALTER TABLE app.metric_definitions
  ADD CONSTRAINT metric_definitions_metric_code_valid
  CHECK (
    metric_code IN (
      'active_customers',
      'ad_spend',
      'add_to_cart_rate',
      'aov',
      'available_stock',
      'cancellation_rate',
      'cancelled_orders',
      'cart_abandonment_rate',
      'checkout_start_rate',
      'cogs',
      'contribution_margin',
      'contribution_margin_rate',
      'conversion_rate',
      'cost_per_order',
      'cpc',
      'cpm',
      'ctr',
      'customer_acquisition_cost',
      'customer_lifetime_value',
      'customer_retention_rate',
      'days_of_inventory',
      'discount_value',
      'gross_margin',
      'gross_margin_rate',
      'gross_order_value',
      'inventory_turnover',
      'marketing_efficiency_ratio',
      'marketplace_fees',
      'net_sales',
      'new_customers',
      'new_users',
      'orders',
      'organic_revenue_share',
      'payment_fees',
      'platform_attributed_conversions',
      'platform_attributed_revenue',
      'product_contribution',
      'product_margin',
      'product_revenue',
      'product_units',
      'purchase_frequency',
      'repeat_purchase_rate',
      'return_rate_orders',
      'return_rate_units',
      'return_value',
      'returned_units',
      'returning_customers',
      'revenue_after_refunds',
      'revenue_per_session',
      'roas',
      'sell_through_rate',
      'sessions',
      'shipping_revenue',
      'stock_value',
      'stockout_risk',
      'tax_value',
      'units_sold',
      'users'
    )
  );

ALTER TABLE app.metric_snapshots
  DROP CONSTRAINT IF EXISTS metric_snapshots_metric_code_valid;

ALTER TABLE app.metric_snapshots
  ADD CONSTRAINT metric_snapshots_metric_code_valid
  CHECK (
    metric_code IN (
      'active_customers',
      'ad_spend',
      'add_to_cart_rate',
      'aov',
      'available_stock',
      'cancellation_rate',
      'cancelled_orders',
      'cart_abandonment_rate',
      'checkout_start_rate',
      'cogs',
      'contribution_margin',
      'contribution_margin_rate',
      'conversion_rate',
      'cost_per_order',
      'cpc',
      'cpm',
      'ctr',
      'customer_acquisition_cost',
      'customer_lifetime_value',
      'customer_retention_rate',
      'days_of_inventory',
      'discount_value',
      'gross_margin',
      'gross_margin_rate',
      'gross_order_value',
      'inventory_turnover',
      'marketing_efficiency_ratio',
      'marketplace_fees',
      'net_sales',
      'new_customers',
      'new_users',
      'orders',
      'organic_revenue_share',
      'payment_fees',
      'platform_attributed_conversions',
      'platform_attributed_revenue',
      'product_contribution',
      'product_margin',
      'product_revenue',
      'product_units',
      'purchase_frequency',
      'repeat_purchase_rate',
      'return_rate_orders',
      'return_rate_units',
      'return_value',
      'returned_units',
      'returning_customers',
      'revenue_after_refunds',
      'revenue_per_session',
      'roas',
      'sell_through_rate',
      'sessions',
      'shipping_revenue',
      'stock_value',
      'stockout_risk',
      'tax_value',
      'units_sold',
      'users'
    )
  );
