provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  prefix = "papadata-${var.environment}"
  labels = {
    application = "papadata"
    environment = var.environment
    managed_by  = "terraform"
  }

  required_external_secret_keys = toset([
    "database_url",
    "scheduler_database_url",
    "api_auth_active_secret",
    "api_auth_previous_secret",
    "mfa_encryption_key",
    "infrastructure_auth_token",
    "bff_cookie_secret",
    "bff_cookie_previous_secret",
    "bff_csrf_secret",
    "bff_refresh_cookie_secret",
    "bff_refresh_cookie_previous_secret",
  ])

  generated_secret_values = {
    redis_url       = "rediss://default:${urlencode(google_redis_instance.runtime.auth_string)}@${google_redis_instance.runtime.host}:${google_redis_instance.runtime.port}"
    redis_ca_base64 = base64encode(google_redis_instance.runtime.server_ca_certs[0].cert)
  }

  external_secret_ids = {
    for key, secret in data.google_secret_manager_secret.runtime : key => secret.secret_id
  }
  generated_secret_ids = {
    for key, secret in google_secret_manager_secret.generated : key => secret.secret_id
  }
  runtime_secret_ids = merge(local.external_secret_ids, local.generated_secret_ids)

  api_secret_names = toset([
    "database_url",
    "api_auth_active_secret",
    "api_auth_previous_secret",
    "mfa_encryption_key",
    "infrastructure_auth_token",
    "redis_url",
    "redis_ca_base64",
  ])
  bff_secret_names = toset([
    "bff_cookie_secret",
    "bff_cookie_previous_secret",
    "bff_csrf_secret",
    "bff_refresh_cookie_secret",
    "bff_refresh_cookie_previous_secret",
    "redis_url",
    "redis_ca_base64",
  ])
  worker_secret_names = toset([
    "database_url",
    "scheduler_database_url",
    "redis_url",
    "redis_ca_base64",
  ])

  # Optional integration secrets (Stripe, OAuth, GUS/BIR, remote Papa AI,
  # KSeF). Terraform never requires these keys to exist in
  # runtime_secret_ids -- it only grants IAM access and injects them into
  # the API service for whichever of these keys the operator actually
  # supplied, and the preconditions below require the ones a given feature
  # flag needs once that feature is turned on.
  optional_integration_secret_names = toset([
    "stripe_secret_key",
    "stripe_webhook_secret",
    "google_oauth_client_secret",
    "microsoft_oauth_client_secret",
    "gus_bir_api_key",
    "papa_remote_api_key",
    "ksef_certificate_ref",
  ])
  api_integration_secret_names = setintersection(
    local.optional_integration_secret_names,
    toset(keys(var.runtime_secret_ids)),
  )
  worker_integration_secret_names = setintersection(
    toset(["papa_remote_api_key"]),
    toset(keys(var.runtime_secret_ids)),
  )

  oauth_google_enabled    = var.google_oauth_client_id != ""
  oauth_microsoft_enabled = var.microsoft_oauth_client_id != ""
  gus_bir_production      = var.gus_bir_mode == "production"
  billing_enabled         = var.billing_mode != ""
  web_origin              = "https://${var.public_domain}"
  billing_return_origin   = var.billing_return_origin != "" ? var.billing_return_origin : local.web_origin
}

resource "terraform_data" "validate_external_secrets" {
  lifecycle {
    precondition {
      condition = length(setsubtract(
        local.required_external_secret_keys,
        toset(keys(var.runtime_secret_ids)),
      )) == 0
      error_message = "runtime_secret_ids is missing one or more required keys. See variables.tf and README.md."
    }

    precondition {
      condition     = !local.oauth_google_enabled || contains(keys(var.runtime_secret_ids), "google_oauth_client_secret")
      error_message = "google_oauth_client_id is set but runtime_secret_ids is missing \"google_oauth_client_secret\"."
    }

    precondition {
      condition     = !local.oauth_microsoft_enabled || contains(keys(var.runtime_secret_ids), "microsoft_oauth_client_secret")
      error_message = "microsoft_oauth_client_id is set but runtime_secret_ids is missing \"microsoft_oauth_client_secret\"."
    }

    precondition {
      condition     = !local.gus_bir_production || (var.gus_bir_base_url != "" && contains(keys(var.runtime_secret_ids), "gus_bir_api_key"))
      error_message = "gus_bir_mode=production requires gus_bir_base_url and a \"gus_bir_api_key\" entry in runtime_secret_ids."
    }

    precondition {
      condition = !local.billing_enabled || (
        var.stripe_api_version != "" &&
        contains(keys(var.runtime_secret_ids), "stripe_secret_key") &&
        (var.billing_mode != "live" || var.billing_allow_live)
      )
      error_message = "billing_mode requires stripe_api_version, a \"stripe_secret_key\" entry in runtime_secret_ids, and billing_allow_live=true when billing_mode=live."
    }

    precondition {
      condition = !var.papa_remote_enabled || (
        var.papa_remote_endpoint != "" &&
        var.papa_remote_model != "" &&
        length(var.papa_remote_allowed_hosts) > 0 &&
        contains(keys(var.runtime_secret_ids), "papa_remote_api_key")
      )
      error_message = "papa_remote_enabled requires papa_remote_endpoint, papa_remote_model, papa_remote_allowed_hosts, and a \"papa_remote_api_key\" entry in runtime_secret_ids."
    }
  }
}

resource "google_project_service" "required" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "certificatemanager.googleapis.com",
    "compute.googleapis.com",
    "iam.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "redis.googleapis.com",
    "run.googleapis.com",
    "secretmanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "sqladmin.googleapis.com",
    "storage.googleapis.com",
  ])
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "runtime" {
  depends_on    = [google_project_service.required]
  location      = var.region
  repository_id = var.artifact_repository
  format        = "DOCKER"
  labels        = local.labels
}

resource "google_compute_network" "runtime" {
  name                    = "${local.prefix}-network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "runtime" {
  name                     = "${local.prefix}-subnet"
  ip_cidr_range            = "10.40.0.0/20"
  region                   = var.region
  network                  = google_compute_network.runtime.id
  private_ip_google_access = true
}

resource "google_compute_global_address" "private_services" {
  name          = "${local.prefix}-private-services"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.runtime.id
}

resource "google_service_networking_connection" "private_services" {
  network                 = google_compute_network.runtime.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services.name]
}

resource "google_sql_database_instance" "runtime" {
  depends_on          = [google_service_networking_connection.private_services]
  name                = "${local.prefix}-postgres"
  database_version    = "POSTGRES_16"
  region              = var.region
  deletion_protection = var.deletion_protection

  settings {
    tier              = var.database_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.runtime.id
      ssl_mode        = "ENCRYPTED_ONLY"
    }

    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }
    database_flags {
      name  = "log_connections"
      value = "on"
    }
    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    user_labels = local.labels
  }
}

resource "google_sql_database" "runtime" {
  name     = "papadata"
  instance = google_sql_database_instance.runtime.name
}

resource "google_redis_instance" "runtime" {
  depends_on              = [google_project_service.required]
  name                    = "${local.prefix}-redis"
  tier                    = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb          = var.redis_memory_size_gb
  region                  = var.region
  authorized_network      = google_compute_network.runtime.id
  redis_version           = "REDIS_7_2"
  auth_enabled            = true
  transit_encryption_mode = "SERVER_AUTHENTICATION"
  display_name            = "PapaData ${var.environment}"
  labels                  = local.labels
}

resource "google_storage_bucket" "objects" {
  name                        = "${var.project_id}-${local.prefix}-objects"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  force_destroy               = false

  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      age = var.artifact_retention_days
    }
    action {
      type = "Delete"
    }
  }

  labels = local.labels
}

data "google_secret_manager_secret" "runtime" {
  for_each  = var.runtime_secret_ids
  project   = var.project_id
  secret_id = each.value

  depends_on = [terraform_data.validate_external_secrets]
}

resource "google_secret_manager_secret" "generated" {
  for_each  = local.generated_secret_values
  secret_id = "${local.prefix}-${replace(each.key, "_", "-")}"

  replication {
    auto {}
  }

  labels = local.labels
}

resource "google_secret_manager_secret_version" "generated" {
  for_each    = local.generated_secret_values
  secret      = google_secret_manager_secret.generated[each.key].id
  secret_data = each.value
}

resource "google_service_account" "api" {
  account_id   = "${local.prefix}-api"
  display_name = "PapaData API"
}

resource "google_service_account" "bff" {
  account_id   = "${local.prefix}-bff"
  display_name = "PapaData BFF"
}

resource "google_service_account" "worker" {
  account_id   = "${local.prefix}-worker"
  display_name = "PapaData Worker"
}

resource "google_service_account" "web" {
  account_id   = "${local.prefix}-web"
  display_name = "PapaData Web"
}

resource "google_secret_manager_secret_iam_member" "api" {
  for_each  = setunion(local.api_secret_names, local.api_integration_secret_names)
  project   = var.project_id
  secret_id = local.runtime_secret_ids[each.key]
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.api.email}"
}

resource "google_secret_manager_secret_iam_member" "bff" {
  for_each  = local.bff_secret_names
  project   = var.project_id
  secret_id = local.runtime_secret_ids[each.key]
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.bff.email}"
}

resource "google_secret_manager_secret_iam_member" "worker" {
  for_each  = setunion(local.worker_secret_names, local.worker_integration_secret_names)
  project   = var.project_id
  secret_id = local.runtime_secret_ids[each.key]
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.worker.email}"
}

resource "google_storage_bucket_iam_member" "api_objects" {
  bucket = google_storage_bucket.objects.name
  role   = "roles/storage.objectUser"
  member = "serviceAccount:${google_service_account.api.email}"
}

resource "google_storage_bucket_iam_member" "worker_objects" {
  bucket = google_storage_bucket.objects.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.worker.email}"
}

resource "google_cloud_run_v2_service" "api" {
  name                = "${local.prefix}-api"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_ONLY"
  deletion_protection = var.deletion_protection

  template {
    service_account = google_service_account.api.email
    timeout         = "30s"

    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = 20
    }

    containers {
      image = var.api_image

      ports {
        container_port = 4000
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PAPADATA_STORAGE_DRIVER"
        value = "gcs"
      }
      env {
        name  = "PAPADATA_STORAGE_BUCKET"
        value = google_storage_bucket.objects.name
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "PAPADATA_API_AUTH_ISSUER"
        value = var.api_auth_issuer
      }
      env {
        name  = "PAPADATA_API_AUTH_AUDIENCE"
        value = var.api_auth_audience
      }
      env {
        name  = "OTEL_EXPORTER_OTLP_ENDPOINT"
        value = var.otel_exporter_otlp_endpoint
      }
      env {
        name  = "PAPADATA_API_AUTH_SESSION_STORE"
        value = "redis-auth-state"
      }
      env {
        name  = "PAPADATA_API_AUTH_SESSION_REDIS_PREFIX"
        value = "papadata:auth"
      }

      # Optional integrations (Stripe billing, Google/Microsoft OAuth,
      # GUS/BIR, KSeF, remote Papa AI). Every value here is safe to set
      # even when the corresponding feature is disabled -- apps/api treats
      # an empty/default value as "not configured" rather than erroring
      # (see each adapter's readXConfig()), so this env contract is
      # explicit and complete regardless of which features are turned on.
      env {
        name  = "PAPADATA_WEB_ORIGIN"
        value = local.web_origin
      }
      env {
        name  = "GOOGLE_OAUTH_CLIENT_ID"
        value = var.google_oauth_client_id
      }
      env {
        name  = "MICROSOFT_OAUTH_CLIENT_ID"
        value = var.microsoft_oauth_client_id
      }
      env {
        name  = "GUS_BIR_MODE"
        value = var.gus_bir_mode
      }
      env {
        name  = "GUS_BIR_BASE_URL"
        value = var.gus_bir_base_url
      }
      env {
        name  = "GUS_BIR_TIMEOUT_MS"
        value = tostring(var.gus_bir_timeout_ms)
      }
      env {
        name  = "GUS_BIR_CACHE_TTL_SECONDS"
        value = tostring(var.gus_bir_cache_ttl_seconds)
      }
      env {
        name  = "KSEF_ENV"
        value = var.ksef_env
      }
      env {
        name  = "KSEF_BASE_URL"
        value = var.ksef_base_url
      }
      env {
        name  = "KSEF_NIP_CONTEXT"
        value = var.ksef_nip_context
      }
      env {
        name  = "KSEF_TIMEOUT_MS"
        value = tostring(var.ksef_timeout_ms)
      }
      env {
        name  = "KSEF_RETRY_POLICY"
        value = var.ksef_retry_policy
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_ENABLED"
        value = var.papa_remote_enabled ? "true" : "false"
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_ENDPOINT"
        value = var.papa_remote_endpoint
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_MODEL"
        value = var.papa_remote_model
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_ALLOWED_HOSTS"
        value = join(",", var.papa_remote_allowed_hosts)
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_RESERVE_MINOR_PER_CALL"
        value = tostring(var.papa_remote_reserve_minor_per_call)
      }
      env {
        name  = "AI_WORKSPACE_BUDGET_MINOR_PER_MONTH"
        value = tostring(var.ai_workspace_budget_minor_per_month)
      }
      env {
        name  = "AI_USER_BUDGET_MINOR_PER_MONTH"
        value = tostring(var.ai_user_budget_minor_per_month)
      }
      env {
        name  = "PAPADATA_BILLING_MODE"
        value = var.billing_mode
      }
      env {
        name  = "STRIPE_API_VERSION"
        value = var.stripe_api_version
      }
      env {
        name  = "PAPADATA_BILLING_RETURN_ORIGIN"
        value = local.billing_return_origin
      }
      env {
        name  = "PAPADATA_BILLING_ALLOW_LIVE"
        value = var.billing_allow_live ? "true" : "false"
      }
      env {
        name  = "PAPADATA_BILLING_PRICES_JSON"
        value = var.billing_prices_json
      }
      env {
        name  = "STRIPE_PORTAL_CONFIGURATION"
        value = var.stripe_portal_configuration
      }
      env {
        name  = "PAYMENT_ENABLE_CARD"
        value = var.payment_methods_enabled.card ? "true" : "false"
      }
      env {
        name  = "PAYMENT_ENABLE_BLIK"
        value = var.payment_methods_enabled.blik ? "true" : "false"
      }
      env {
        name  = "PAYMENT_ENABLE_BLIK_RECURRING"
        value = var.payment_methods_enabled.blik_recurring ? "true" : "false"
      }
      env {
        name  = "PAYMENT_ENABLE_FAST_TRANSFER"
        value = var.payment_methods_enabled.fast_bank_transfer ? "true" : "false"
      }
      env {
        name  = "PAYMENT_ENABLE_BANK_TRANSFER"
        value = var.payment_methods_enabled.bank_transfer ? "true" : "false"
      }
      env {
        name  = "PAYMENT_ENABLE_APPLE_PAY"
        value = var.payment_methods_enabled.apple_pay ? "true" : "false"
      }
      env {
        name  = "PAYMENT_ENABLE_GOOGLE_PAY"
        value = var.payment_methods_enabled.google_pay ? "true" : "false"
      }

      dynamic "env" {
        for_each = {
          DATABASE_URL                       = "database_url"
          REDIS_URL                          = "redis_url"
          REDIS_CA_BASE64                    = "redis_ca_base64"
          PAPADATA_API_AUTH_ACTIVE_SECRET    = "api_auth_active_secret"
          PAPADATA_API_AUTH_PREVIOUS_SECRET  = "api_auth_previous_secret"
          MFA_ENCRYPTION_KEY                 = "mfa_encryption_key"
          PAPADATA_INFRASTRUCTURE_AUTH_TOKEN = "infrastructure_auth_token"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = local.runtime_secret_ids[env.value]
              version = "latest"
            }
          }
        }
      }

      # Same optional-integration set as the plain env{} blocks above, but
      # for the secret half of each pair. Only emits an env var for a key
      # the operator actually put in runtime_secret_ids -- a feature left
      # unconfigured gets no env var at all here, matching apps/api
      # treating a missing var the same as an empty one.
      dynamic "env" {
        for_each = {
          for entry in [
            { name = "STRIPE_SECRET_KEY", key = "stripe_secret_key" },
            { name = "STRIPE_WEBHOOK_SECRET", key = "stripe_webhook_secret" },
            { name = "GOOGLE_OAUTH_CLIENT_SECRET", key = "google_oauth_client_secret" },
            { name = "MICROSOFT_OAUTH_CLIENT_SECRET", key = "microsoft_oauth_client_secret" },
            { name = "GUS_BIR_API_KEY", key = "gus_bir_api_key" },
            { name = "PAPADATA_PAPA_REMOTE_API_KEY", key = "papa_remote_api_key" },
            { name = "KSEF_CERTIFICATE_REF", key = "ksef_certificate_ref" },
          ] : entry.name => entry.key
          if contains(keys(var.runtime_secret_ids), entry.key)
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = local.runtime_secret_ids[env.value]
              version = "latest"
            }
          }
        }
      }

      startup_probe {
        http_get {
          path = "/startupz"
          port = 4000
        }
        failure_threshold = 30
        period_seconds    = 2
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 4000
        }
      }

      readiness_probe {
        http_get {
          path = "/readyz"
          port = 4000
        }
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"
      network_interfaces {
        network    = google_compute_network.runtime.name
        subnetwork = google_compute_subnetwork.runtime.name
      }
    }
  }

  labels = local.labels
}

resource "google_cloud_run_v2_service" "bff" {
  name                = "${local.prefix}-bff"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = var.deletion_protection

  template {
    service_account = google_service_account.bff.email
    timeout         = "30s"

    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = 30
    }

    containers {
      image = var.bff_image

      ports {
        container_port = 3001
      }

      resources {
        limits = {
          cpu    = "2"
          memory = "1Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "API_ORIGIN"
        value = google_cloud_run_v2_service.api.uri
      }
      env {
        name  = "BFF_UPSTREAM_IDENTITY_AUDIENCE"
        value = google_cloud_run_v2_service.api.uri
      }
      env {
        name  = "BFF_ALLOWED_ORIGINS"
        value = join(",", var.public_origins)
      }
      env {
        name  = "BFF_PUBLIC_HOSTS"
        value = join(",", var.public_hosts)
      }
      env {
        name  = "BFF_SESSION_STORE"
        value = "redis-auth-state"
      }
      env {
        name  = "BFF_INTERNAL_AUTH_ISSUER"
        value = var.api_auth_issuer
      }
      env {
        name  = "BFF_INTERNAL_AUTH_AUDIENCE"
        value = var.api_auth_audience
      }

      dynamic "env" {
        for_each = {
          REDIS_URL                          = "redis_url"
          REDIS_CA_BASE64                    = "redis_ca_base64"
          BFF_COOKIE_SECRET                  = "bff_cookie_secret"
          BFF_COOKIE_PREVIOUS_SECRET         = "bff_cookie_previous_secret"
          BFF_CSRF_SECRET                    = "bff_csrf_secret"
          BFF_REFRESH_COOKIE_SECRET          = "bff_refresh_cookie_secret"
          BFF_REFRESH_COOKIE_PREVIOUS_SECRET = "bff_refresh_cookie_previous_secret"
          BFF_INTERNAL_AUTH_ACTIVE_SECRET    = "api_auth_active_secret"
          BFF_INTERNAL_AUTH_PREVIOUS_SECRET  = "api_auth_previous_secret"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = local.runtime_secret_ids[env.value]
              version = "latest"
            }
          }
        }
      }

      startup_probe {
        http_get {
          path = "/health"
          port = 3001
        }
      }

      liveness_probe {
        http_get {
          path = "/health"
          port = 3001
        }
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"
      network_interfaces {
        network    = google_compute_network.runtime.name
        subnetwork = google_compute_subnetwork.runtime.name
      }
    }
  }

  labels = local.labels
}

resource "google_cloud_run_v2_service" "web" {
  name                = "${local.prefix}-web"
  location            = var.region
  ingress             = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  deletion_protection = var.deletion_protection

  template {
    service_account = google_service_account.web.email
    timeout         = "10s"

    scaling {
      min_instance_count = var.environment == "production" ? 1 : 0
      max_instance_count = 20
    }

    containers {
      image = var.web_image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi"
        }
      }

      startup_probe {
        http_get {
          path = "/"
          port = 8080
        }
        failure_threshold = 10
        period_seconds    = 2
      }

      liveness_probe {
        http_get {
          path = "/"
          port = 8080
        }
      }
    }
  }

  labels = local.labels
}

resource "google_cloud_run_v2_service_iam_member" "bff_invokes_api" {
  project  = var.project_id
  location = google_cloud_run_v2_service.api.location
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.bff.email}"
}

resource "google_cloud_run_v2_service_iam_member" "edge_invokes_bff" {
  project  = var.project_id
  location = google_cloud_run_v2_service.bff.location
  name     = google_cloud_run_v2_service.bff.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "edge_invokes_web" {
  project  = var.project_id
  location = google_cloud_run_v2_service.web.location
  name     = google_cloud_run_v2_service.web.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_compute_region_network_endpoint_group" "bff" {
  name                  = "${local.prefix}-bff-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.bff.name
  }
}

resource "google_compute_region_network_endpoint_group" "web" {
  name                  = "${local.prefix}-web-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.web.name
  }
}

resource "google_compute_security_policy" "edge" {
  name        = "${local.prefix}-edge-policy"
  description = "PapaData edge WAF and abuse protection"

  rule {
    action   = "deny(403)"
    priority = 1000
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('sqli-v33-stable')"
      }
    }
    description = "Block SQL injection signatures"
  }

  rule {
    action   = "deny(403)"
    priority = 1010
    match {
      expr {
        expression = "evaluatePreconfiguredWaf('xss-v33-stable')"
      }
    }
    description = "Block cross-site scripting signatures"
  }

  rule {
    action   = "rate_based_ban"
    priority = 1100
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action   = "allow"
      exceed_action    = "deny(429)"
      enforce_on_key   = "IP"
      ban_duration_sec = var.edge_rate_limit_ban_seconds
      rate_limit_threshold {
        count        = var.edge_rate_limit_requests_per_minute
        interval_sec = 60
      }
    }
    description = "Per-IP edge rate limit"
  }

  rule {
    action   = "allow"
    priority = 2147483647
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow after WAF and rate limits"
  }
}

resource "google_compute_backend_service" "bff" {
  name                  = "${local.prefix}-bff-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.edge.id
  timeout_sec           = 30

  backend {
    group = google_compute_region_network_endpoint_group.bff.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  # No custom_response_headers here, deliberately: the BFF already
  # originates its own headers for its JSON responses (@fastify/helmet,
  # see apps/bff/src/app.factory.ts) and must not have a second,
  # web-app-shaped CSP layered on top by the load balancer. Mirrors
  # infra/production/edge/nginx.conf.template's `location /api/` block,
  # which carries the same comment for local parity.
}

resource "google_compute_backend_service" "web" {
  name                  = "${local.prefix}-web-backend"
  protocol              = "HTTP"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  security_policy       = google_compute_security_policy.edge.id
  timeout_sec           = 30

  backend {
    group = google_compute_region_network_endpoint_group.web.id
  }

  log_config {
    enable      = true
    sample_rate = 1.0
  }

  # The web-production container itself sets no security headers (see
  # infra/production/web/nginx.conf) -- this backend is the GCP-side
  # equivalent of infra/production/edge/nginx.conf.template's `location /`
  # block, which is the single source of truth for these headers locally.
  # Values must stay identical between the two: apps/web's CSP is verified
  # empirically against real console output, not assumed.
  custom_response_headers = [
    "Strict-Transport-Security: max-age=63072000; includeSubDomains",
    "X-Content-Type-Options: nosniff",
    "X-Frame-Options: DENY",
    "Referrer-Policy: strict-origin-when-cross-origin",
    "Permissions-Policy: camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
  ]
}

resource "google_compute_url_map" "edge" {
  name            = "${local.prefix}-edge-map"
  default_service = google_compute_backend_service.web.id

  host_rule {
    hosts        = [var.public_domain]
    path_matcher = "primary"
  }

  path_matcher {
    name            = "primary"
    default_service = google_compute_backend_service.web.id

    path_rule {
      paths   = ["/api", "/api/*"]
      service = google_compute_backend_service.bff.id
    }
  }
}

resource "google_compute_managed_ssl_certificate" "edge" {
  name = "${local.prefix}-edge-certificate"
  managed {
    domains = [var.public_domain]
  }
}

resource "google_compute_target_https_proxy" "edge" {
  name             = "${local.prefix}-edge-https"
  url_map          = google_compute_url_map.edge.id
  ssl_certificates = [google_compute_managed_ssl_certificate.edge.id]
}

resource "google_compute_global_address" "edge" {
  name = "${local.prefix}-edge-ip"
}

resource "google_compute_global_forwarding_rule" "edge_https" {
  name                  = "${local.prefix}-edge-https"
  ip_address            = google_compute_global_address.edge.address
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL_MANAGED"
  target                = google_compute_target_https_proxy.edge.id
}

resource "google_cloud_run_v2_worker_pool" "worker" {
  name                = "${local.prefix}-worker"
  location            = var.region
  deletion_protection = var.deletion_protection
  scaling {
    scaling_mode          = "MANUAL"
    manual_instance_count = var.environment == "production" ? 2 : 1
  }

  template {
    service_account = google_service_account.worker.email
    labels          = local.labels

    containers {
      image = var.worker_image

      resources {
        limits = {
          cpu    = "2"
          memory = "2Gi"
        }
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }
      env {
        name  = "PAPADATA_STORAGE_DRIVER"
        value = "gcs"
      }
      env {
        name  = "PAPADATA_STORAGE_BUCKET"
        value = google_storage_bucket.objects.name
      }
      env {
        name  = "GOOGLE_CLOUD_PROJECT"
        value = var.project_id
      }
      env {
        name  = "OTEL_EXPORTER_OTLP_ENDPOINT"
        value = var.otel_exporter_otlp_endpoint
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_ENABLED"
        value = var.papa_remote_enabled ? "true" : "false"
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_ENDPOINT"
        value = var.papa_remote_endpoint
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_MODEL"
        value = var.papa_remote_model
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_ALLOWED_HOSTS"
        value = join(",", var.papa_remote_allowed_hosts)
      }
      env {
        name  = "PAPADATA_PAPA_REMOTE_RESERVE_MINOR_PER_CALL"
        value = tostring(var.papa_remote_reserve_minor_per_call)
      }
      env {
        name  = "AI_WORKSPACE_BUDGET_MINOR_PER_MONTH"
        value = tostring(var.ai_workspace_budget_minor_per_month)
      }
      env {
        name  = "AI_USER_BUDGET_MINOR_PER_MONTH"
        value = tostring(var.ai_user_budget_minor_per_month)
      }

      dynamic "env" {
        for_each = {
          DATABASE_URL           = "database_url"
          SCHEDULER_DATABASE_URL = "scheduler_database_url"
          REDIS_URL              = "redis_url"
          REDIS_CA_BASE64        = "redis_ca_base64"
        }
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = local.runtime_secret_ids[env.value]
              version = "latest"
            }
          }
        }
      }

      dynamic "env" {
        for_each = (
          contains(keys(var.runtime_secret_ids), "papa_remote_api_key")
          ? { PAPADATA_PAPA_REMOTE_API_KEY = "papa_remote_api_key" }
          : {}
        )
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = local.runtime_secret_ids[env.value]
              version = "latest"
            }
          }
        }
      }
    }

    vpc_access {
      egress = "PRIVATE_RANGES_ONLY"
      network_interfaces {
        network    = google_compute_network.runtime.name
        subnetwork = google_compute_subnetwork.runtime.name
      }
    }
  }

  labels = local.labels
}
