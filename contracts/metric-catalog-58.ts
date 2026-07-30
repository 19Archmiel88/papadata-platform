export type MetricCatalogStatus = "canonical" | "supplemental" | "experimental" | "deprecated" | "retired";
export type MetricImplementationStatus = "migration_ready" | "planned_p0" | "partial" | "blocked" | "deprecated" | "retired";
export interface CanonicalMetricDefinition {
  readonly id: string; readonly metricKey: string; readonly displayName: string; readonly formula: string; readonly unit: string; readonly aggregationPolicy: string; readonly requiredFacts: readonly string[]; readonly implementationStatus: MetricImplementationStatus; readonly mvpScope: "required"; readonly implementationTarget: string;
}
export const CANONICAL_METRIC_CATALOG_VERSION = "2026-07-p0-v1" as const;
export const canonicalMetricCatalog = [
  {
    "id": "KPI-01",
    "metricKey": "gross_order_value",
    "displayName": "Sprzedaż brutto",
    "formula": "SUM(accepted_order.gross_amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_orders"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-02",
    "metricKey": "revenue_after_refunds",
    "displayName": "Przychód po zwrotach",
    "formula": "gross_order_value - return_value",
    "unit": "money",
    "aggregationPolicy": "derived",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-03",
    "metricKey": "orders",
    "displayName": "Liczba zamówień",
    "formula": "COUNT_DISTINCT(canonical_order_id WHERE accepted_status)",
    "unit": "count",
    "aggregationPolicy": "count_distinct",
    "requiredFacts": [
      "canonical_orders"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-04",
    "metricKey": "units_sold",
    "displayName": "Sprzedane sztuki",
    "formula": "SUM(canonical_order_lines.quantity)",
    "unit": "units",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_order_lines"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-05",
    "metricKey": "returned_units",
    "displayName": "Zwrócone sztuki",
    "formula": "SUM(canonical_returns.quantity)",
    "unit": "units",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_customer_returns"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-06",
    "metricKey": "return_value",
    "displayName": "Wartość zwrotów",
    "formula": "SUM(posted_refund.amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_refunds"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-07",
    "metricKey": "return_rate_units",
    "displayName": "Wskaźnik zwrotów sztuk",
    "formula": "returned_units / units_sold",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_customer_returns",
      "canonical_order_lines"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-08",
    "metricKey": "return_rate_orders",
    "displayName": "Wskaźnik zwrotów zamówień",
    "formula": "orders_with_refund / orders",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-09",
    "metricKey": "aov",
    "displayName": "Średnia wartość zamówienia",
    "formula": "gross_order_value / orders",
    "unit": "money",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-10",
    "metricKey": "available_stock",
    "displayName": "Dostępny zapas",
    "formula": "SUM(primary_inventory.quantity_available)",
    "unit": "units",
    "aggregationPolicy": "latest_snapshot_sum",
    "requiredFacts": [
      "canonical_inventory_snapshots"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-11",
    "metricKey": "stock_value",
    "displayName": "Wartość zapasu",
    "formula": "SUM(quantity_available * confirmed_unit_cost)",
    "unit": "money",
    "aggregationPolicy": "latest_snapshot_sum",
    "requiredFacts": [
      "canonical_inventory_snapshots",
      "product_costs"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-12",
    "metricKey": "days_of_inventory",
    "displayName": "Dni zapasu",
    "formula": "available_stock / average_daily_units_sold",
    "unit": "days",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_inventory_snapshots",
      "canonical_order_lines"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-13",
    "metricKey": "inventory_turnover",
    "displayName": "Rotacja zapasu",
    "formula": "units_sold / average_inventory",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_inventory_snapshots",
      "canonical_order_lines"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-14",
    "metricKey": "sell_through_rate",
    "displayName": "Sell-through",
    "formula": "units_sold / (units_sold + available_stock)",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_inventory_snapshots",
      "canonical_order_lines"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-15",
    "metricKey": "stockout_risk",
    "displayName": "Ryzyko braku zapasu",
    "formula": "RISK(days_of_inventory,lead_time,velocity)",
    "unit": "risk",
    "aggregationPolicy": "policy",
    "requiredFacts": [
      "canonical_inventory_snapshots",
      "canonical_order_lines",
      "supply_policy"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-16",
    "metricKey": "product_revenue",
    "displayName": "Przychód produktu",
    "formula": "SUM(order_line.gross_amount BY canonical_product_id)",
    "unit": "money",
    "aggregationPolicy": "sum_by_product",
    "requiredFacts": [
      "canonical_order_lines",
      "product_mapping"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-17",
    "metricKey": "product_units",
    "displayName": "Sztuki produktu",
    "formula": "SUM(order_line.quantity BY canonical_product_id)",
    "unit": "units",
    "aggregationPolicy": "sum_by_product",
    "requiredFacts": [
      "canonical_order_lines",
      "product_mapping"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-18",
    "metricKey": "product_margin",
    "displayName": "Marża produktu",
    "formula": "product_revenue - product_cogs",
    "unit": "money",
    "aggregationPolicy": "derived",
    "requiredFacts": [
      "canonical_order_lines",
      "product_costs"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-19",
    "metricKey": "product_contribution",
    "displayName": "Kontrybucja produktu",
    "formula": "product_margin - allocated_ad_spend - variable_fees",
    "unit": "money",
    "aggregationPolicy": "derived",
    "requiredFacts": [
      "canonical_order_lines",
      "product_costs",
      "canonical_ad_spend",
      "fees"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-20",
    "metricKey": "ad_spend",
    "displayName": "Wydatki reklamowe",
    "formula": "SUM(canonical_ad_spend.cost_amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_ad_spend"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-21",
    "metricKey": "cpc",
    "displayName": "Koszt kliknięcia",
    "formula": "ad_spend / clicks",
    "unit": "money",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_ad_spend"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-22",
    "metricKey": "cpm",
    "displayName": "Koszt tysiąca wyświetleń",
    "formula": "ad_spend / impressions * 1000",
    "unit": "money",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_ad_spend"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-23",
    "metricKey": "ctr",
    "displayName": "CTR",
    "formula": "clicks / impressions",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_ad_spend"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-24",
    "metricKey": "platform_attributed_conversions",
    "displayName": "Konwersje platformowe",
    "formula": "SUM(provider_attributed_conversions)",
    "unit": "count",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_attributed_conversions"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-25",
    "metricKey": "platform_attributed_revenue",
    "displayName": "Przychód przypisany przez platformę",
    "formula": "SUM(provider_attributed_value)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_attributed_conversions"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-26",
    "metricKey": "roas",
    "displayName": "ROAS",
    "formula": "platform_attributed_revenue / ad_spend",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_attributed_conversions",
      "canonical_ad_spend"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-27",
    "metricKey": "cost_per_order",
    "displayName": "Koszt na zamówienie",
    "formula": "ad_spend / orders",
    "unit": "money",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_ad_spend",
      "canonical_orders"
    ],
    "implementationStatus": "migration_ready",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-28",
    "metricKey": "cancelled_orders",
    "displayName": "Anulowane zamówienia",
    "formula": "COUNT_DISTINCT(order_id WHERE cancelled_status)",
    "unit": "count",
    "aggregationPolicy": "count_distinct",
    "requiredFacts": [
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-29",
    "metricKey": "cancellation_rate",
    "displayName": "Wskaźnik anulowań",
    "formula": "cancelled_orders / all_created_orders",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-30",
    "metricKey": "discount_value",
    "displayName": "Wartość rabatów",
    "formula": "SUM(order_line.list_price - order_line.sale_price)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_order_lines"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-31",
    "metricKey": "shipping_revenue",
    "displayName": "Przychód z dostawy",
    "formula": "SUM(accepted_order.shipping_amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-32",
    "metricKey": "tax_value",
    "displayName": "Wartość podatku",
    "formula": "SUM(accepted_order.tax_amount) - SUM(refund.tax_amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-33",
    "metricKey": "net_sales",
    "displayName": "Sprzedaż netto",
    "formula": "gross_order_value - tax_value - return_value",
    "unit": "money",
    "aggregationPolicy": "derived",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-34",
    "metricKey": "cogs",
    "displayName": "Koszt sprzedanych produktów",
    "formula": "SUM(sold_quantity * valid_unit_cost)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_order_lines",
      "product_costs"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-35",
    "metricKey": "gross_margin",
    "displayName": "Marża brutto",
    "formula": "net_sales - cogs",
    "unit": "money",
    "aggregationPolicy": "derived",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds",
      "product_costs"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-36",
    "metricKey": "gross_margin_rate",
    "displayName": "Marża brutto procentowa",
    "formula": "gross_margin / net_sales",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds",
      "product_costs"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-37",
    "metricKey": "marketplace_fees",
    "displayName": "Opłaty marketplace",
    "formula": "SUM(posted_marketplace_fee.amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_marketplace_fees"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-38",
    "metricKey": "payment_fees",
    "displayName": "Opłaty płatnicze",
    "formula": "SUM(settled_payment_fee.amount)",
    "unit": "money",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "canonical_payment_fees"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-39",
    "metricKey": "contribution_margin",
    "displayName": "Marża kontrybucyjna",
    "formula": "net_sales - cogs - marketplace_fees - payment_fees - ad_spend - variable_costs",
    "unit": "money",
    "aggregationPolicy": "derived",
    "requiredFacts": [
      "orders",
      "refunds",
      "product_costs",
      "fees",
      "canonical_ad_spend"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-40",
    "metricKey": "contribution_margin_rate",
    "displayName": "Marża kontrybucyjna procentowa",
    "formula": "contribution_margin / net_sales",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "orders",
      "refunds",
      "product_costs",
      "fees",
      "canonical_ad_spend"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-41",
    "metricKey": "new_customers",
    "displayName": "Nowi klienci",
    "formula": "COUNT_DISTINCT(customer_id WHERE first_order_in_period)",
    "unit": "count",
    "aggregationPolicy": "count_distinct",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-42",
    "metricKey": "returning_customers",
    "displayName": "Powracający klienci",
    "formula": "COUNT_DISTINCT(customer_id WHERE prior_order_before_period)",
    "unit": "count",
    "aggregationPolicy": "count_distinct",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-43",
    "metricKey": "active_customers",
    "displayName": "Aktywni klienci",
    "formula": "COUNT_DISTINCT(customer_id WITH accepted_order_in_period)",
    "unit": "count",
    "aggregationPolicy": "count_distinct",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-44",
    "metricKey": "customer_retention_rate",
    "displayName": "Retencja klientów",
    "formula": "customers_from_prior_cohort_active_now / eligible_prior_cohort",
    "unit": "ratio",
    "aggregationPolicy": "cohort_ratio",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-45",
    "metricKey": "repeat_purchase_rate",
    "displayName": "Wskaźnik ponownych zakupów",
    "formula": "customers_with_2plus_orders / customers_with_order",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-46",
    "metricKey": "purchase_frequency",
    "displayName": "Częstotliwość zakupów",
    "formula": "accepted_orders / active_customers",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-47",
    "metricKey": "customer_lifetime_value",
    "displayName": "Wartość klienta CLV",
    "formula": "average_order_value * purchase_frequency * modeled_customer_lifetime * gross_margin_rate",
    "unit": "money",
    "aggregationPolicy": "model",
    "requiredFacts": [
      "canonical_customers",
      "canonical_orders",
      "product_costs"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-48",
    "metricKey": "customer_acquisition_cost",
    "displayName": "Koszt pozyskania klienta CAC",
    "formula": "eligible_acquisition_spend / new_customers",
    "unit": "money",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_ad_spend",
      "new_customers",
      "acquisition_cost_policy"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-49",
    "metricKey": "marketing_efficiency_ratio",
    "displayName": "MER",
    "formula": "revenue_after_refunds / total_marketing_spend",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds",
      "canonical_ad_spend"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-50",
    "metricKey": "sessions",
    "displayName": "Sesje",
    "formula": "SUM(ga4_sessions)",
    "unit": "count",
    "aggregationPolicy": "sum",
    "requiredFacts": [
      "ga4_traffic_facts"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-51",
    "metricKey": "users",
    "displayName": "Użytkownicy",
    "formula": "SUM(ga4_total_users DEDUPED BY GA4)",
    "unit": "count",
    "aggregationPolicy": "provider_aggregate",
    "requiredFacts": [
      "ga4_traffic_facts"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-52",
    "metricKey": "new_users",
    "displayName": "Nowi użytkownicy",
    "formula": "SUM(ga4_new_users)",
    "unit": "count",
    "aggregationPolicy": "provider_aggregate",
    "requiredFacts": [
      "ga4_traffic_facts"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-53",
    "metricKey": "conversion_rate",
    "displayName": "Współczynnik konwersji",
    "formula": "accepted_orders / eligible_sessions",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders",
      "ga4_traffic_facts",
      "attribution_policy"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-54",
    "metricKey": "add_to_cart_rate",
    "displayName": "Dodania do koszyka",
    "formula": "sessions_with_add_to_cart / eligible_sessions",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "ga4_ecommerce_events",
      "ga4_traffic_facts"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-55",
    "metricKey": "checkout_start_rate",
    "displayName": "Rozpoczęcia checkoutu",
    "formula": "sessions_with_begin_checkout / eligible_sessions",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "ga4_ecommerce_events",
      "ga4_traffic_facts"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-56",
    "metricKey": "cart_abandonment_rate",
    "displayName": "Porzucenia koszyka",
    "formula": "1 - purchases / begin_checkout_sessions",
    "unit": "ratio",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "ga4_ecommerce_events",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-57",
    "metricKey": "revenue_per_session",
    "displayName": "Przychód na sesję",
    "formula": "revenue_after_refunds / eligible_sessions",
    "unit": "money",
    "aggregationPolicy": "ratio",
    "requiredFacts": [
      "canonical_orders",
      "canonical_refunds",
      "ga4_traffic_facts"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  },
  {
    "id": "KPI-58",
    "metricKey": "organic_revenue_share",
    "displayName": "Udział przychodu organicznego",
    "formula": "revenue_attributed_to_organic / attributable_revenue",
    "unit": "ratio",
    "aggregationPolicy": "attribution_ratio",
    "requiredFacts": [
      "ga4_attribution_facts",
      "canonical_orders"
    ],
    "implementationStatus": "planned_p0",
    "mvpScope": "required",
    "implementationTarget": "packages/contracts metric catalog + backend Metric Engine; frontend, reports and AI consume snapshots only"
  }
] as const satisfies readonly CanonicalMetricDefinition[];
export type CanonicalMetricKey = typeof canonicalMetricCatalog[number]["metricKey"];
