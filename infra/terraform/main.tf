provider "google" {
  project = var.project_id
  region  = var.region
}

locals {
  prefix = "papadata-${var.environment}"
  labels = { application = "papadata", environment = var.environment, managed_by = "terraform" }
}

resource "google_project_service" "required" {
  for_each = toset([
    "artifactregistry.googleapis.com",
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
  name          = "${local.prefix}-subnet"
  ip_cidr_range = "10.40.0.0/20"
  region        = var.region
  network       = google_compute_network.runtime.id
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

resource "random_password" "database" {
  length  = 32
  special = true
}

resource "google_sql_database_instance" "runtime" {
  depends_on       = [google_service_networking_connection.private_services]
  name             = "${local.prefix}-postgres"
  database_version = "POSTGRES_16"
  region           = var.region
  deletion_protection = var.environment == "production"
  settings {
    tier              = var.database_tier
    availability_type = var.environment == "production" ? "REGIONAL" : "ZONAL"
    disk_type          = "PD_SSD"
    disk_autoresize    = true
    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      transaction_log_retention_days = 7
    }
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.runtime.id
    }
    database_flags { name = "cloudsql.iam_authentication" value = "on" }
    user_labels = local.labels
  }
}

resource "google_sql_database" "runtime" {
  name     = "papadata"
  instance = google_sql_database_instance.runtime.name
}

resource "google_sql_user" "runtime" {
  name     = "papadata_app"
  instance = google_sql_database_instance.runtime.name
  password = random_password.database.result
}

resource "google_redis_instance" "runtime" {
  depends_on         = [google_project_service.required]
  name               = "${local.prefix}-redis"
  tier               = var.environment == "production" ? "STANDARD_HA" : "BASIC"
  memory_size_gb     = var.redis_memory_size_gb
  region             = var.region
  authorized_network = google_compute_network.runtime.id
  redis_version      = "REDIS_7_2"
  display_name       = "PapaData ${var.environment}"
  labels             = local.labels
}

resource "google_storage_bucket" "objects" {
  name                        = "${var.project_id}-${local.prefix}-objects"
  location                    = var.region
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"
  versioning { enabled = true }
  lifecycle_rule {
    condition { age = 30 }
    action { type = "Delete" }
  }
  labels = local.labels
}

resource "google_secret_manager_secret" "database_url" {
  secret_id = "${local.prefix}-database-url"
  replication { auto {} }
  labels = local.labels
}

resource "google_secret_manager_secret_version" "database_url" {
  secret      = google_secret_manager_secret.database_url.id
  secret_data = "postgresql://papadata_app:${urlencode(random_password.database.result)}@${google_sql_database_instance.runtime.private_ip_address}:5432/papadata"
}

resource "google_service_account" "api" { account_id = "${local.prefix}-api" display_name = "PapaData API" }
resource "google_service_account" "bff" { account_id = "${local.prefix}-bff" display_name = "PapaData BFF" }
resource "google_service_account" "worker" { account_id = "${local.prefix}-worker" display_name = "PapaData Worker" }

resource "google_project_iam_member" "api_secret" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.api.email}"
}
resource "google_project_iam_member" "worker_secret" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.worker.email}"
}
resource "google_storage_bucket_iam_member" "api_objects" {
  bucket = google_storage_bucket.objects.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.api.email}"
}
resource "google_storage_bucket_iam_member" "worker_objects" {
  bucket = google_storage_bucket.objects.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.worker.email}"
}

resource "google_cloud_run_v2_service" "api" {
  name     = "${local.prefix}-api"
  location = var.region
  template {
    service_account = google_service_account.api.email
    containers {
      image = var.api_image
      ports { container_port = 4000 }
      env { name = "NODE_ENV" value = "production" }
      env { name = "PAPADATA_STORAGE_DRIVER" value = "gcs" }
      env { name = "PAPADATA_STORAGE_BUCKET" value = google_storage_bucket.objects.name }
      env { name = "REDIS_URL" value = "redis://${google_redis_instance.runtime.host}:${google_redis_instance.runtime.port}" }
      env {
        name = "DATABASE_URL"
        value_source { secret_key_ref { secret = google_secret_manager_secret.database_url.secret_id version = "latest" } }
      }
      startup_probe { http_get { path = "/startupz" port = 4000 } failure_threshold = 30 period_seconds = 2 }
      liveness_probe { http_get { path = "/health" port = 4000 } }
    }
    vpc_access { network_interfaces { network = google_compute_network.runtime.name subnetwork = google_compute_subnetwork.runtime.name } }
  }
  labels = local.labels
}

resource "google_cloud_run_v2_service" "bff" {
  name     = "${local.prefix}-bff"
  location = var.region
  template {
    service_account = google_service_account.bff.email
    containers {
      image = var.bff_image
      ports { container_port = 3001 }
      env { name = "NODE_ENV" value = "production" }
      env { name = "API_ORIGIN" value = google_cloud_run_v2_service.api.uri }
    }
  }
  labels = local.labels
}

resource "google_cloud_run_v2_worker_pool" "worker" {
  name                = "${local.prefix}-worker"
  location            = var.region
  launch_stage        = "BETA"
  deletion_protection = var.environment == "production"
  scaling {
    scaling_mode         = "MANUAL"
    manual_instance_count = var.environment == "production" ? 2 : 1
  }
  template {
    service_account = google_service_account.worker.email
    labels          = local.labels
    containers {
      image = var.worker_image
      env { name = "NODE_ENV" value = "production" }
      env { name = "PAPADATA_STORAGE_DRIVER" value = "gcs" }
      env { name = "PAPADATA_STORAGE_BUCKET" value = google_storage_bucket.objects.name }
      env { name = "REDIS_URL" value = "redis://${google_redis_instance.runtime.host}:${google_redis_instance.runtime.port}" }
      env {
        name = "DATABASE_URL"
        value_source { secret_key_ref { secret = google_secret_manager_secret.database_url.secret_id version = "latest" } }
      }
    }
    vpc_access { network_interfaces { network = google_compute_network.runtime.name subnetwork = google_compute_subnetwork.runtime.name } }
  }
  labels = local.labels
}
