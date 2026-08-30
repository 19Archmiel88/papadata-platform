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

resource "google_secret_manager_secret_iam_member" "api" {
  for_each  = local.api_secret_names
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
  for_each  = local.worker_secret_names
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

resource "google_compute_region_network_endpoint_group" "bff" {
  name                  = "${local.prefix}-bff-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region

  cloud_run {
    service = google_cloud_run_v2_service.bff.name
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
}

resource "google_compute_url_map" "edge" {
  name            = "${local.prefix}-edge-map"
  default_service = google_compute_backend_service.bff.id
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
