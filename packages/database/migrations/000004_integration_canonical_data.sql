CREATE TABLE IF NOT EXISTS app.integration_connections (
  connection_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  provider_id text NOT NULL,
  status text NOT NULL,
  external_account_id text,
  account_name text,
  credential_ref text,
  is_primary_inventory_source boolean NOT NULL DEFAULT false,
  connected_at timestamptz NOT NULL DEFAULT now(),
  reauthorized_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT integration_connections_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT integration_connections_status_valid CHECK (
    status IN (
      'account_selection_required',
      'active',
      'disconnected',
      'reauthorization_required'
    )
  ),
  CONSTRAINT integration_connections_inventory_provider_valid CHECK (
    is_primary_inventory_source IS FALSE
    OR provider_id IN ('allegro', 'woocommerce')
  ),
  CONSTRAINT integration_connections_account_selected_for_active CHECK (
    status <> 'active'
    OR (external_account_id IS NOT NULL AND credential_ref IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS integration_connections_provider_account_idx
  ON app.integration_connections (
    tenant_id,
    workspace_id,
    provider_id,
    external_account_id
  )
  WHERE external_account_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS integration_connections_primary_inventory_idx
  ON app.integration_connections (tenant_id, workspace_id)
  WHERE is_primary_inventory_source IS TRUE;

CREATE TABLE IF NOT EXISTS app.sync_jobs (
  sync_job_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  connection_id uuid NOT NULL REFERENCES app.integration_connections (connection_id),
  provider_id text NOT NULL,
  job_kind text NOT NULL,
  status text NOT NULL,
  streams text[] NOT NULL,
  parent_sync_job_id uuid REFERENCES app.sync_jobs (sync_job_id),
  attempts integer NOT NULL DEFAULT 1,
  retry_after_seconds integer,
  operation_id uuid,
  error_code text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT sync_jobs_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT sync_jobs_kind_valid CHECK (
    job_kind IN ('backfill', 'incremental_sync', 'initial_sync', 'recovery', 'retry')
  ),
  CONSTRAINT sync_jobs_status_valid CHECK (
    status IN (
      'cancelled',
      'dlq',
      'failed',
      'partial_success',
      'queued',
      'rate_limited',
      'recovered',
      'running',
      'succeeded'
    )
  ),
  CONSTRAINT sync_jobs_attempts_positive CHECK (attempts > 0),
  CONSTRAINT sync_jobs_retry_after_positive CHECK (
    retry_after_seconds IS NULL OR retry_after_seconds > 0
  ),
  CONSTRAINT sync_jobs_streams_not_empty CHECK (array_length(streams, 1) > 0)
);

CREATE INDEX IF NOT EXISTS sync_jobs_scope_status_idx
  ON app.sync_jobs (tenant_id, workspace_id, provider_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.sync_checkpoints (
  sync_checkpoint_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  connection_id uuid NOT NULL REFERENCES app.integration_connections (connection_id),
  provider_id text NOT NULL,
  stream text NOT NULL,
  cursor text NOT NULL,
  watermark timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, stream),
  CONSTRAINT sync_checkpoints_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT sync_checkpoints_stream_valid CHECK (
    stream IN (
      'ad_spend',
      'attributed_conversions',
      'inventory',
      'orders',
      'products',
      'refunds'
    )
  ),
  CONSTRAINT sync_checkpoints_sales_stream_valid CHECK (
    provider_id NOT IN ('allegro', 'woocommerce')
    OR stream IN ('inventory', 'orders', 'products', 'refunds')
  ),
  CONSTRAINT sync_checkpoints_ads_stream_valid CHECK (
    provider_id NOT IN ('google_ads', 'meta_ads')
    OR stream IN ('ad_spend', 'attributed_conversions')
  )
);

CREATE TABLE IF NOT EXISTS app.source_batches (
  source_batch_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  connection_id uuid NOT NULL REFERENCES app.integration_connections (connection_id),
  sync_job_id uuid NOT NULL REFERENCES app.sync_jobs (sync_job_id),
  provider_id text NOT NULL,
  stream text NOT NULL,
  status text NOT NULL,
  record_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT source_batches_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT source_batches_stream_valid CHECK (
    stream IN (
      'ad_spend',
      'attributed_conversions',
      'inventory',
      'orders',
      'products',
      'refunds'
    )
  ),
  CONSTRAINT source_batches_status_valid CHECK (status IN ('failed', 'partial', 'success')),
  CONSTRAINT source_batches_record_count_non_negative CHECK (record_count >= 0)
);

CREATE INDEX IF NOT EXISTS source_batches_scope_idx
  ON app.source_batches (tenant_id, workspace_id, provider_id, stream, started_at DESC);

CREATE TABLE IF NOT EXISTS app.source_records (
  source_record_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  source_batch_id uuid NOT NULL REFERENCES app.source_batches (source_batch_id),
  connection_id uuid NOT NULL REFERENCES app.integration_connections (connection_id),
  provider_id text NOT NULL,
  stream text NOT NULL,
  external_id text NOT NULL,
  fingerprint text NOT NULL,
  payload jsonb NOT NULL,
  ingested_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, stream, external_id),
  UNIQUE (fingerprint),
  CONSTRAINT source_records_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT source_records_stream_valid CHECK (
    stream IN (
      'ad_spend',
      'attributed_conversions',
      'inventory',
      'orders',
      'products',
      'refunds'
    )
  ),
  CONSTRAINT source_records_external_id_not_blank CHECK (length(trim(external_id)) > 0),
  CONSTRAINT source_records_fingerprint_not_blank CHECK (length(trim(fingerprint)) > 0)
);

CREATE INDEX IF NOT EXISTS source_records_scope_stream_idx
  ON app.source_records (tenant_id, workspace_id, provider_id, stream, ingested_at DESC);

CREATE TABLE IF NOT EXISTS app.normalized_records (
  normalized_record_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  source_record_id uuid NOT NULL UNIQUE REFERENCES app.source_records (source_record_id),
  provider_id text NOT NULL,
  stream text NOT NULL,
  external_id text NOT NULL,
  payload jsonb NOT NULL,
  validation_status text NOT NULL,
  normalized_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT normalized_records_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT normalized_records_stream_valid CHECK (
    stream IN (
      'ad_spend',
      'attributed_conversions',
      'inventory',
      'orders',
      'products',
      'refunds'
    )
  ),
  CONSTRAINT normalized_records_validation_status_valid CHECK (
    validation_status IN ('partial', 'valid')
  )
);

CREATE INDEX IF NOT EXISTS normalized_records_scope_stream_idx
  ON app.normalized_records (tenant_id, workspace_id, provider_id, stream, normalized_at DESC);

CREATE TABLE IF NOT EXISTS app.canonical_products (
  canonical_product_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  sku text,
  ean text,
  catalog_id text,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT canonical_products_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT canonical_products_status_valid CHECK (status IN ('active', 'archived'))
);

CREATE UNIQUE INDEX IF NOT EXISTS canonical_products_sku_idx
  ON app.canonical_products (tenant_id, workspace_id, sku)
  WHERE sku IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS canonical_products_ean_idx
  ON app.canonical_products (tenant_id, workspace_id, ean)
  WHERE ean IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS canonical_products_catalog_idx
  ON app.canonical_products (tenant_id, workspace_id, catalog_id)
  WHERE catalog_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.canonical_product_variants (
  canonical_variant_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  canonical_product_id uuid NOT NULL REFERENCES app.canonical_products (canonical_product_id),
  sku text,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT canonical_product_variants_name_not_blank CHECK (length(trim(name)) > 0),
  CONSTRAINT canonical_product_variants_status_valid CHECK (status IN ('active', 'archived'))
);

CREATE UNIQUE INDEX IF NOT EXISTS canonical_product_variants_product_sku_idx
  ON app.canonical_product_variants (tenant_id, workspace_id, canonical_product_id, sku)
  WHERE sku IS NOT NULL;

CREATE TABLE IF NOT EXISTS app.external_product_mappings (
  external_product_mapping_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  canonical_product_id uuid NOT NULL REFERENCES app.canonical_products (canonical_product_id),
  provider_id text NOT NULL,
  external_product_id text NOT NULL,
  mapping_method text NOT NULL,
  confidence text NOT NULL,
  policy_version text NOT NULL,
  approved_by_user_id uuid REFERENCES app.users (user_id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, external_product_id),
  CONSTRAINT external_product_mappings_provider_valid CHECK (
    provider_id IN ('allegro', 'google_ads', 'meta_ads', 'woocommerce')
  ),
  CONSTRAINT external_product_mappings_method_valid CHECK (
    mapping_method IN (
      'catalog',
      'ean',
      'exact_match',
      'fuzzy_manual_review',
      'manual',
      'sku'
    )
  ),
  CONSTRAINT external_product_mappings_confidence_valid CHECK (
    confidence IN ('high', 'manual_review_required')
  ),
  CONSTRAINT external_product_mappings_fuzzy_requires_review CHECK (
    (
      mapping_method = 'fuzzy_manual_review'
      AND confidence = 'manual_review_required'
      AND approved_at IS NULL
    )
    OR (
      mapping_method <> 'fuzzy_manual_review'
      AND confidence = 'high'
      AND approved_at IS NOT NULL
    )
  ),
  CONSTRAINT external_product_mappings_policy_version_not_blank CHECK (
    length(trim(policy_version)) > 0
  ),
  CONSTRAINT external_product_mappings_external_id_not_blank CHECK (
    length(trim(external_product_id)) > 0
  )
);

CREATE INDEX IF NOT EXISTS external_product_mappings_product_idx
  ON app.external_product_mappings (tenant_id, workspace_id, canonical_product_id);

CREATE TABLE IF NOT EXISTS app.canonical_orders (
  canonical_order_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  provider_id text NOT NULL,
  external_order_id text NOT NULL,
  order_number text NOT NULL,
  currency text NOT NULL,
  gross_amount numeric(18, 2) NOT NULL,
  ordered_at timestamptz NOT NULL,
  source_authority_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, order_number),
  CONSTRAINT canonical_orders_provider_sales_valid CHECK (
    provider_id IN ('allegro', 'woocommerce')
  ),
  CONSTRAINT canonical_orders_currency_valid CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT canonical_orders_gross_amount_non_negative CHECK (gross_amount >= 0),
  CONSTRAINT canonical_orders_authority_not_blank CHECK (
    length(trim(source_authority_version)) > 0
  )
);

CREATE INDEX IF NOT EXISTS canonical_orders_scope_ordered_at_idx
  ON app.canonical_orders (tenant_id, workspace_id, ordered_at DESC);

CREATE TABLE IF NOT EXISTS app.canonical_order_lines (
  canonical_order_line_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  canonical_order_id uuid NOT NULL REFERENCES app.canonical_orders (canonical_order_id),
  canonical_product_id uuid REFERENCES app.canonical_products (canonical_product_id),
  quantity numeric(18, 4) NOT NULL,
  gross_amount numeric(18, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT canonical_order_lines_quantity_positive CHECK (quantity > 0),
  CONSTRAINT canonical_order_lines_gross_amount_non_negative CHECK (gross_amount >= 0)
);

CREATE INDEX IF NOT EXISTS canonical_order_lines_order_idx
  ON app.canonical_order_lines (tenant_id, workspace_id, canonical_order_id);

CREATE TABLE IF NOT EXISTS app.canonical_payments (
  canonical_payment_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  canonical_order_id uuid NOT NULL REFERENCES app.canonical_orders (canonical_order_id),
  amount numeric(18, 2) NOT NULL,
  currency text NOT NULL,
  paid_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT canonical_payments_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT canonical_payments_currency_valid CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS canonical_payments_order_idx
  ON app.canonical_payments (tenant_id, workspace_id, canonical_order_id);

CREATE TABLE IF NOT EXISTS app.canonical_refunds (
  canonical_refund_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  provider_id text NOT NULL,
  canonical_order_id uuid REFERENCES app.canonical_orders (canonical_order_id),
  external_refund_id text NOT NULL,
  amount numeric(18, 2) NOT NULL,
  currency text NOT NULL,
  refunded_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, external_refund_id),
  CONSTRAINT canonical_refunds_provider_sales_valid CHECK (
    provider_id IN ('allegro', 'woocommerce')
  ),
  CONSTRAINT canonical_refunds_amount_non_negative CHECK (amount >= 0),
  CONSTRAINT canonical_refunds_currency_valid CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS canonical_refunds_order_idx
  ON app.canonical_refunds (tenant_id, workspace_id, canonical_order_id);

CREATE TABLE IF NOT EXISTS app.canonical_customer_returns (
  canonical_customer_return_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  canonical_refund_id uuid REFERENCES app.canonical_refunds (canonical_refund_id),
  external_refund_id text NOT NULL,
  reason text NOT NULL,
  returned_quantity numeric(18, 4) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, external_refund_id),
  CONSTRAINT canonical_customer_returns_reason_not_blank CHECK (length(trim(reason)) > 0),
  CONSTRAINT canonical_customer_returns_quantity_positive CHECK (returned_quantity > 0)
);

CREATE TABLE IF NOT EXISTS app.canonical_inventory_snapshots (
  canonical_inventory_snapshot_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  provider_id text NOT NULL,
  canonical_product_id uuid REFERENCES app.canonical_products (canonical_product_id),
  external_product_id text NOT NULL,
  quantity_available numeric(18, 4) NOT NULL,
  snapshot_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, external_product_id, snapshot_at),
  CONSTRAINT canonical_inventory_snapshots_provider_sales_valid CHECK (
    provider_id IN ('allegro', 'woocommerce')
  ),
  CONSTRAINT canonical_inventory_snapshots_quantity_non_negative CHECK (
    quantity_available >= 0
  )
);

CREATE INDEX IF NOT EXISTS canonical_inventory_snapshots_scope_idx
  ON app.canonical_inventory_snapshots (tenant_id, workspace_id, snapshot_at DESC);

CREATE TABLE IF NOT EXISTS app.canonical_ad_spend (
  canonical_ad_spend_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  provider_id text NOT NULL,
  campaign_id text NOT NULL,
  date date NOT NULL,
  cost_amount numeric(18, 2) NOT NULL,
  currency text NOT NULL,
  impressions integer NOT NULL,
  clicks integer NOT NULL,
  source_authority_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, campaign_id, date),
  CONSTRAINT canonical_ad_spend_provider_ads_valid CHECK (
    provider_id IN ('google_ads', 'meta_ads')
  ),
  CONSTRAINT canonical_ad_spend_cost_non_negative CHECK (cost_amount >= 0),
  CONSTRAINT canonical_ad_spend_currency_valid CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT canonical_ad_spend_impressions_non_negative CHECK (impressions >= 0),
  CONSTRAINT canonical_ad_spend_clicks_non_negative CHECK (clicks >= 0),
  CONSTRAINT canonical_ad_spend_clicks_not_above_impressions CHECK (clicks <= impressions),
  CONSTRAINT canonical_ad_spend_authority_not_blank CHECK (
    length(trim(source_authority_version)) > 0
  )
);

CREATE INDEX IF NOT EXISTS canonical_ad_spend_scope_date_idx
  ON app.canonical_ad_spend (tenant_id, workspace_id, date DESC);

CREATE TABLE IF NOT EXISTS app.canonical_attributed_conversions (
  canonical_attributed_conversion_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  provider_id text NOT NULL,
  external_conversion_id text NOT NULL,
  campaign_id text NOT NULL,
  attributed_value_amount numeric(18, 2) NOT NULL,
  currency text NOT NULL,
  conversion_time timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (tenant_id, workspace_id, provider_id, external_conversion_id),
  CONSTRAINT canonical_attributed_conversions_provider_ads_valid CHECK (
    provider_id IN ('google_ads', 'meta_ads')
  ),
  CONSTRAINT canonical_attributed_conversions_value_non_negative CHECK (
    attributed_value_amount >= 0
  ),
  CONSTRAINT canonical_attributed_conversions_currency_valid CHECK (currency ~ '^[A-Z]{3}$')
);

CREATE INDEX IF NOT EXISTS canonical_attributed_conversions_scope_time_idx
  ON app.canonical_attributed_conversions (tenant_id, workspace_id, conversion_time DESC);

CREATE TABLE IF NOT EXISTS app.canonical_lineage (
  canonical_lineage_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  canonical_table text NOT NULL,
  canonical_record_id uuid NOT NULL,
  source_record_id uuid NOT NULL REFERENCES app.source_records (source_record_id),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  UNIQUE (canonical_table, canonical_record_id, source_record_id),
  CONSTRAINT canonical_lineage_table_valid CHECK (
    canonical_table IN (
      'canonical_ad_spend',
      'canonical_attributed_conversions',
      'canonical_customer_returns',
      'canonical_inventory_snapshots',
      'canonical_order_lines',
      'canonical_orders',
      'canonical_payments',
      'canonical_product_variants',
      'canonical_products',
      'canonical_refunds'
    )
  )
);

CREATE INDEX IF NOT EXISTS canonical_lineage_source_record_idx
  ON app.canonical_lineage (tenant_id, workspace_id, source_record_id);

CREATE TABLE IF NOT EXISTS app.data_issues (
  data_issue_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  source_record_id uuid REFERENCES app.source_records (source_record_id),
  code text NOT NULL,
  severity text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT data_issues_code_valid CHECK (
    code IN (
      'FUZZY_MATCH_REQUIRES_MANUAL_APPROVAL',
      'PARTIAL_SYNC_FAILURE',
      'RATE_LIMITED',
      'UNMAPPED_PRODUCT'
    )
  ),
  CONSTRAINT data_issues_severity_valid CHECK (severity IN ('error', 'warning')),
  CONSTRAINT data_issues_status_valid CHECK (status IN ('open', 'resolved')),
  CONSTRAINT data_issues_message_not_blank CHECK (length(trim(message)) > 0),
  CONSTRAINT data_issues_resolved_status_consistent CHECK (
    (status = 'resolved' AND resolved_at IS NOT NULL)
    OR (status = 'open' AND resolved_at IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS data_issues_scope_status_idx
  ON app.data_issues (tenant_id, workspace_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS app.quality_assessments (
  quality_assessment_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  status text NOT NULL,
  issue_count integer NOT NULL DEFAULT 0,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT quality_assessments_status_valid CHECK (status IN ('partial', 'passed')),
  CONSTRAINT quality_assessments_issue_count_non_negative CHECK (issue_count >= 0)
);

CREATE INDEX IF NOT EXISTS quality_assessments_scope_idx
  ON app.quality_assessments (tenant_id, workspace_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS app.readiness_assessments (
  readiness_assessment_id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  workspace_id uuid NOT NULL,
  status text NOT NULL,
  limitations text[] NOT NULL DEFAULT ARRAY[]::text[],
  assessed_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (tenant_id, workspace_id)
    REFERENCES app.workspaces (tenant_id, workspace_id),
  CONSTRAINT readiness_assessments_status_valid CHECK (
    status IN ('partial', 'ready', 'retry_wait')
  )
);

CREATE INDEX IF NOT EXISTS readiness_assessments_scope_idx
  ON app.readiness_assessments (tenant_id, workspace_id, assessed_at DESC);

GRANT SELECT, INSERT, UPDATE ON app.integration_connections TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.sync_jobs TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.sync_checkpoints TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.source_batches TO papadata_app;
GRANT SELECT, INSERT ON app.source_records TO papadata_app;
GRANT SELECT, INSERT ON app.normalized_records TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.canonical_products TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.canonical_product_variants TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.external_product_mappings TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_orders TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_order_lines TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_payments TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_refunds TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_customer_returns TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_inventory_snapshots TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_ad_spend TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_attributed_conversions TO papadata_app;
GRANT SELECT, INSERT ON app.canonical_lineage TO papadata_app;
GRANT SELECT, INSERT, UPDATE ON app.data_issues TO papadata_app;
GRANT SELECT, INSERT ON app.quality_assessments TO papadata_app;
GRANT SELECT, INSERT ON app.readiness_assessments TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON app.integration_connections TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.sync_jobs TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.sync_checkpoints TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.source_batches TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.source_records TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.normalized_records TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_products TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_product_variants TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.external_product_mappings TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_orders TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_order_lines TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_payments TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_refunds TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_customer_returns TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_inventory_snapshots TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_ad_spend TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_attributed_conversions TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.canonical_lineage TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.data_issues TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.quality_assessments TO papadata_test;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.readiness_assessments TO papadata_test;
