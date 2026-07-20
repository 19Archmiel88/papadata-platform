# Canonical Metric Catalog

## Status

Kanoniczny katalog backendu L2 ma wersję `2026-05-analytics-v1` i jest
utrwalony w `packages/contracts`.

Podział:

- 55 metryk objętych audytem;
- 3 dodatkowe metryki GA4 oznaczone jako `supplemental`;
- 58 metryk łącznie.

## Zasady

- Brak danych nie jest zerem.
- Zero jest poprawnym wynikiem tylko wtedy, gdy dane istnieją i dowodzą zera.
- Metryki ilorazowe zwracają `null` oraz status `no_data`, gdy mianownik wynosi
  zero albo go brakuje.
- Metryki pochodne dziedziczą `partial`, gdy zależność jest częściowa lub używa
  fallbacku.
- Procenty w katalogu są liczbami w skali procentowej, na przykład `2.5`, a nie
  proporcją `0.025`.
- `purchases` z platform reklamowych nie jest tym samym co `orders_count` z
  commerce.
- Marża, contribution i wartość magazynu nie mogą być liczone bez kosztów oraz
  source authority.

## Statusy kalkulacji

```text
ok
zero
partial
no_data
not_configured
not_supported
syncing
needs_reauth
permission_error
network_error
provider_error
error
```

## Metryki Audytowane

| # | Klucz | Jednostka | Wzór |
| -: | --- | --- | --- |
| 1 | `roi` | ratio | `(revenue - purchase_cost - ad_spend) / (purchase_cost + ad_spend)` |
| 2 | `purchase_cost` | money | `SUM(fact_order_lines.cogs_total_reporting)` |
| 3 | `impressions` | count | `SUM(fact_ads_daily.impressions)` |
| 4 | `clicks` | count | `SUM(fact_ads_daily.clicks)` |
| 5 | `sessions` | count | `SUM(fact_analytics_daily.sessions)` |
| 6 | `users` | count | `SUM(fact_analytics_daily.users_count)` |
| 7 | `revenue` | money | `SUM(totalGross)` dla kwalifikowanych zamówień |
| 8 | `conversion_rate` | percent | `orders_count / sessions * 100` |
| 9 | `ctr` | percent | `clicks / impressions * 100` |
| 10 | `ad_spend` | money | `SUM(fact_ads_daily.spend_reporting)` |
| 11 | `purchases` | count | `SUM(fact_ads_daily.conversions)` |
| 12 | `roas` | ratio | `revenue / ad_spend` |
| 13 | `aov` | money | `revenue / orders_count` |
| 14 | `add_to_cart` | count | `SUM(fact_analytics_daily.add_to_cart)` |
| 15 | `reach` | count | dokładny zasięg zakresu, fallback `SUM(fact_ads_daily.reach)` |
| 16 | `avg_cpc` | money | `ad_spend / clicks` |
| 17 | `avg_cpm` | money | `ad_spend / impressions * 1000` |
| 18 | `avg_cpv` | money | `SUM(video_cost_reporting) / SUM(video_views)` |
| 19 | `net_revenue` | money | `SUM(totalNet)`, fallback do `totalGross`, status `partial` |
| 20 | `orders_count` | count | liczba kwalifikowanych zamówień |
| 21 | `avg_products_per_order` | ratio | `products_sold_count / orders_count` |
| 22 | `avg_order_discount_percent` | percent | średnia `discount / (totalGross + discount) * 100` |
| 23 | `discounted_orders_count` | count | zamówienia z rabatem lub kodem rabatowym |
| 24 | `non_discounted_orders_count` | count | `max(orders_count - discounted_orders_count, 0)` |
| 25 | `order_fulfillment_time` | hours | średnia liczba godzin między `paidAt` i `fulfilledAt` |
| 26 | `cancellation_return_rate` | percent | `affected_orders / placed_orders * 100` |
| 27 | `payment_methods_used_count` | count | `COUNT_DISTINCT(fact_payments.provider)` |
| 28 | `delivery_types_selected_count` | count | `COUNT_DISTINCT(shippingMethod)` |
| 29 | `discounts` | money | `SUM(discountTotal)` |
| 30 | `discount_uses_count` | count | suma użyć kodów, fallback do liczby zamówień rabatowych |
| 31 | `discounted_purchase_value_total` | money | `SUM(totalGross)` zamówień rabatowych |
| 32 | `discount_value_total` | money | `SUM(discountTotal)` |
| 33 | `discounted_orders_aov` | money | `discounted_purchase_value_total / discounted_orders_count` |
| 34 | `gross_margin_total` | money | `revenue - purchase_cost` |
| 35 | `products_sold_count` | count | `SUM(fact_order_lines.quantity)` |
| 36 | `sold_products_margin_value` | money | `SUM(fact_order_lines.gross_margin_reporting)` |
| 37 | `margin_revenue_share` | percent | `gross_margin_total / revenue * 100` |
| 38 | `products_on_promotion_count` | count | liczba unikalnych produktów sprzedanych z dowodem promocji |
| 39 | `promo_product_regular_price` | money | ważona ilością cena regularna |
| 40 | `promo_product_sale_price` | money | ważona ilością cena sprzedaży promocyjnej |
| 41 | `promo_product_discount_percent` | percent | `(regular_price - sale_price) / regular_price * 100` |
| 42 | `customers_total` | count | `COUNT_DISTINCT(customerId)`, fallback do skrótu e-mail |
| 43 | `customers_to_users_ratio` | ratio | `customers_total / users` |
| 44 | `avg_revenue_per_customer` | money | `revenue / customers_total` |
| 45 | `orders_per_customer` | ratio | `orders_count / customers_total` |
| 46 | `repeat_purchase_rate` | percent | `repeat_customers / active_customers * 100` |
| 47 | `purchase_frequency` | ratio | `orders_count / customers_total` |
| 48 | `avg_time_between_purchases` | days | średnia liczba dni między zakupami aktywnych klientów |
| 49 | `customer_retention_rate` | percent | `retained_customers / eligible_customers * 100` |
| 50 | `customer_churn_rate` | percent | `max(100 - customer_retention_rate, 0)` |
| 51 | `clv` | money | średnia marża lifetime, fallback do przychodu lifetime |
| 52 | `ltv` | money | `lifetime_revenue_total / active_customers_count` |
| 53 | `cac` | money | `ad_spend / customers_total` |
| 54 | `customer_revenue_over_time` | money | skumulowany przychód lifetime aktywnych klientów |
| 55 | `customer_lifetime_orders_count` | count | wszystkie zamówienia lifetime aktywnych klientów |

## Metryki Supplemental GA4

| # | Klucz | Jednostka | Wzór |
| -: | --- | --- | --- |
| 56 | `begin_checkout` | count | `SUM(fact_analytics_daily.begin_checkout)` |
| 57 | `new_users` | count | `SUM(fact_analytics_daily.new_users)` |
| 58 | `event_count` | count | `SUM(fact_analytics_daily.event_count)` |

## Rozbieżności Do Usunięcia

Te rozbieżności blokują uznanie backendowego Metric Engine i Dashboard API za
gotowe:

- `net_revenue`: katalog używa `SUM(totalNet)` z fallback do `totalGross`,
  a słownik dashboardu używa `SUM(totalGross - refundTotal)`.
- `cac`: katalog definiuje blended CAC jako `ad_spend / customers_total`, a
  dashboard używa `ad_spend / new_customers_count`.
- `aov`: katalog używa `revenue / orders_count`, a Centrum Dowodzenia używa
  `gmv / orders`.
- `conversion_rate`: katalog zwraca procent `orders_count / sessions * 100`, a
  Business Summary używa proporcji `purchases / sessions`.
- `roas` i `mer`: w dashboard mają tę samą formułę, a `mer` nie istnieje w
  katalogu kanonicznym.
- `orders_per_customer` i `purchase_frequency`: obecnie mają tę samą formułę.
- `discounts` i `discount_value_total`: obecnie mają tę samą formułę.

## Wymaganie Dla Dashboard API

Dashboard API może publikować projekcje takie jak `gmv`, `refund_rate`,
`margin` albo `mer` tylko jako jawnie oznaczone agregaty lub aliasy. Każda taka
projekcja musi wskazywać:

- kanoniczny `metricKey`, jeżeli istnieje;
- wersję katalogu;
- jednostkę i skalę;
- status readiness;
- limitations;
- evidence;
- informację, czy projekcja jest aliasem, agregatem czy metryką kanoniczną.
