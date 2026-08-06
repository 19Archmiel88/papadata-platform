variable "project_id" {
  type = string
}

variable "region" {
  type    = string
  default = "europe-central2"
}

variable "environment" {
  type = string
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}

variable "database_tier" {
  type    = string
  default = "db-custom-2-7680"
}

variable "redis_memory_size_gb" {
  type    = number
  default = 1
}

variable "artifact_repository" {
  type    = string
  default = "papadata"
}

variable "artifact_retention_days" {
  type    = number
  default = 30
  validation {
    condition     = var.artifact_retention_days >= 1 && var.artifact_retention_days <= 3650
    error_message = "artifact_retention_days must be between 1 and 3650."
  }
}

variable "api_image" {
  type = string
  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.api_image))
    error_message = "api_image must be immutable and pinned by sha256 digest."
  }
}

variable "bff_image" {
  type = string
  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.bff_image))
    error_message = "bff_image must be immutable and pinned by sha256 digest."
  }
}

variable "worker_image" {
  type = string
  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.worker_image))
    error_message = "worker_image must be immutable and pinned by sha256 digest."
  }
}

variable "public_domain" {
  type = string
}

variable "public_origins" {
  type = list(string)
}

variable "public_hosts" {
  type = list(string)
}

variable "runtime_secret_ids" {
  description = "Map of runtime secret key to existing Secret Manager secret ID. Secret values are provisioned and rotated outside Terraform."
  type        = map(string)
}

variable "api_auth_issuer" {
  type = string
}

variable "api_auth_audience" {
  type = string
}


variable "otel_exporter_otlp_endpoint" {
  type    = string
  default = ""
}

variable "edge_rate_limit_requests_per_minute" {
  type    = number
  default = 600
  validation {
    condition     = var.edge_rate_limit_requests_per_minute >= 60
    error_message = "edge_rate_limit_requests_per_minute must be at least 60."
  }
}

variable "edge_rate_limit_ban_seconds" {
  type    = number
  default = 300
  validation {
    condition     = var.edge_rate_limit_ban_seconds >= 60
    error_message = "edge_rate_limit_ban_seconds must be at least 60."
  }
}

variable "deletion_protection" {
  type    = bool
  default = true
}
