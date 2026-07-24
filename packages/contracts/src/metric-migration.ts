import type { CanonicalMetricKey } from "./index.js";
export type MetricMigrationEntry={readonly source:"backend_legacy"|"frontend_local";readonly legacyKey:string;readonly canonicalKey:CanonicalMetricKey|null;readonly resolution:"mapped"|"mapped_with_semantic_change"|"requires_business_decision"|"deprecated";readonly notes:string};
export const metricMigrationEntries:readonly MetricMigrationEntry[]=[
  {source:"backend_legacy",legacyKey:"gross_order_value",canonicalKey:"revenue",resolution:"mapped",notes:"Canonical revenue uses qualified commerce orders."},
  {source:"backend_legacy",legacyKey:"revenue_after_refunds",canonicalKey:"net_revenue",resolution:"mapped_with_semantic_change",notes:"Verify source semantics before migration."},
  {source:"backend_legacy",legacyKey:"orders",canonicalKey:"orders_count",resolution:"mapped",notes:"Use canonical order qualification policy."},
  {source:"backend_legacy",legacyKey:"aov",canonicalKey:"aov",resolution:"mapped",notes:"Import canonical formula."},
  {source:"backend_legacy",legacyKey:"ad_spend",canonicalKey:"ad_spend",resolution:"mapped",notes:"Requires reporting currency."},
  {source:"backend_legacy",legacyKey:"cpc",canonicalKey:"avg_cpc",resolution:"mapped",notes:"Rename to avg_cpc."},
  {source:"backend_legacy",legacyKey:"cpm",canonicalKey:"avg_cpm",resolution:"mapped",notes:"Rename to avg_cpm."},
  {source:"backend_legacy",legacyKey:"ctr",canonicalKey:"ctr",resolution:"mapped",notes:"No artificial zero."},
  {source:"backend_legacy",legacyKey:"platform_attributed_conversions",canonicalKey:"purchases",resolution:"mapped_with_semantic_change",notes:"Ad purchases are not commerce orders."},
  {source:"backend_legacy",legacyKey:"platform_attributed_revenue",canonicalKey:null,resolution:"requires_business_decision",notes:"Keep attribution separate from commerce revenue."},
  {source:"backend_legacy",legacyKey:"roas",canonicalKey:"roas",resolution:"mapped",notes:"Use canonical readiness."},
  {source:"frontend_local",legacyKey:"order_count",canonicalKey:"orders_count",resolution:"mapped",notes:"Rename only."},
  {source:"frontend_local",legacyKey:"gross_revenue",canonicalKey:"revenue",resolution:"mapped",notes:"Use qualified commerce orders."},
  {source:"frontend_local",legacyKey:"refund_value",canonicalKey:null,resolution:"requires_business_decision",notes:"Missing refunds cannot become zero."},
  {source:"frontend_local",legacyKey:"net_revenue",canonicalKey:"net_revenue",resolution:"mapped",notes:"Backend-owned calculation."},
  {source:"frontend_local",legacyKey:"advertising_spend",canonicalKey:"ad_spend",resolution:"mapped",notes:"Rename only."},
  {source:"frontend_local",legacyKey:"attributed_conversion_value",canonicalKey:null,resolution:"requires_business_decision",notes:"Separate attribution from commerce revenue."},
  {source:"frontend_local",legacyKey:"roas",canonicalKey:"roas",resolution:"mapped",notes:"Canonical calculation."},
  {source:"frontend_local",legacyKey:"contribution_margin",canonicalKey:null,resolution:"requires_business_decision",notes:"Requires cost authority."},
];
export const findMetricMigration=(source:MetricMigrationEntry["source"],legacyKey:string):MetricMigrationEntry|null=>metricMigrationEntries.find(e=>e.source===source&&e.legacyKey===legacyKey)??null;
