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

variable "web_image" {
  type = string
  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.web_image))
    error_message = "web_image must be immutable and pinned by sha256 digest."
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

# ---------------------------------------------------------------------------
# Optional integration configuration: Stripe billing, Google/Microsoft OAuth,
# GUS/BIR, KSeF and remote Papa AI. Every one of these is off by default,
# matching apps/api's own fail-closed behavior (see
# config/p0-integrations.env.example and each adapter under
# packages/integrations/src and apps/api/src/production) -- Terraform never
# turns an integration on by itself, it only plumbs values through to the API
# service once an operator supplies them. See README.md for which Secret
# Manager keys become required in runtime_secret_ids as each one is enabled.
# ---------------------------------------------------------------------------

variable "google_oauth_client_id" {
  description = "GOOGLE_OAUTH_CLIENT_ID. Non-secret. Empty disables Google login."
  type        = string
  default     = ""
}

variable "microsoft_oauth_client_id" {
  description = "MICROSOFT_OAUTH_CLIENT_ID. Non-secret. Empty disables Microsoft login."
  type        = string
  default     = ""
}

variable "gus_bir_mode" {
  description = "GUS_BIR_MODE."
  type        = string
  default     = "mock"
  validation {
    condition     = contains(["mock", "test", "production"], var.gus_bir_mode)
    error_message = "gus_bir_mode must be mock, test or production."
  }
}

variable "gus_bir_base_url" {
  description = "GUS_BIR_BASE_URL. Required (with a gus_bir_api_key secret) when gus_bir_mode=production."
  type        = string
  default     = ""
}

variable "gus_bir_timeout_ms" {
  type    = number
  default = 10000
  validation {
    condition     = var.gus_bir_timeout_ms > 0 && var.gus_bir_timeout_ms <= 60000
    error_message = "gus_bir_timeout_ms must be between 1 and 60000."
  }
}

variable "gus_bir_cache_ttl_seconds" {
  type    = number
  default = 86400
  validation {
    condition     = var.gus_bir_cache_ttl_seconds > 0
    error_message = "gus_bir_cache_ttl_seconds must be a positive integer."
  }
}

variable "ksef_env" {
  description = "KSEF_ENV. production is accepted by Terraform but the adapter itself does not implement it yet (degrades to not_implemented) -- see packages/integrations/src/ksef-adapter.ts."
  type        = string
  default     = "demo"
  validation {
    condition     = contains(["demo", "production"], var.ksef_env)
    error_message = "ksef_env must be demo or production."
  }
}

variable "ksef_base_url" {
  type    = string
  default = ""
}

variable "ksef_nip_context" {
  type    = string
  default = ""
}

variable "ksef_timeout_ms" {
  type    = number
  default = 30000
  validation {
    condition     = var.ksef_timeout_ms > 0
    error_message = "ksef_timeout_ms must be a positive integer."
  }
}

variable "ksef_retry_policy" {
  type    = string
  default = "exponential"
  validation {
    condition     = contains(["none", "exponential"], var.ksef_retry_policy)
    error_message = "ksef_retry_policy must be none or exponential."
  }
}

variable "papa_remote_enabled" {
  description = "PAPADATA_PAPA_REMOTE_ENABLED. false keeps the assistant on LocalDeterministicProvider."
  type        = bool
  default     = false
}

variable "papa_remote_endpoint" {
  description = "PAPADATA_PAPA_REMOTE_ENDPOINT. Must be https and end in /chat/completions (enforced by the app, not by this validation)."
  type        = string
  default     = ""
}

variable "papa_remote_model" {
  type    = string
  default = ""
}

variable "papa_remote_allowed_hosts" {
  description = "PAPADATA_PAPA_REMOTE_ALLOWED_HOSTS. The host of papa_remote_endpoint must be in this list."
  type        = list(string)
  default     = []
}

variable "papa_remote_reserve_minor_per_call" {
  type    = number
  default = 50
}

variable "ai_workspace_budget_minor_per_month" {
  description = "AI_WORKSPACE_BUDGET_MINOR_PER_MONTH, enforced by AiBudgetGuard regardless of provider."
  type        = number
  default     = 20000
}

variable "ai_user_budget_minor_per_month" {
  description = "AI_USER_BUDGET_MINOR_PER_MONTH, enforced by AiBudgetGuard regardless of provider."
  type        = number
  default     = 4000
}

variable "billing_mode" {
  description = "PAPADATA_BILLING_MODE. Empty disables Stripe billing entirely (readStripeBillingConfig returns null)."
  type        = string
  default     = ""
  validation {
    condition     = contains(["", "test", "live"], var.billing_mode)
    error_message = "billing_mode must be empty, test or live."
  }
}

variable "stripe_api_version" {
  description = "STRIPE_API_VERSION, pinned date format (e.g. 2024-06-20). Required when billing_mode is set."
  type        = string
  default     = ""
}

variable "billing_return_origin" {
  description = "PAPADATA_BILLING_RETURN_ORIGIN. Defaults to https://<public_domain> when left empty."
  type        = string
  default     = ""
}

variable "billing_allow_live" {
  description = "PAPADATA_BILLING_ALLOW_LIVE. Must be true when billing_mode=live, or the API refuses to boot billing."
  type        = bool
  default     = false
}

variable "billing_prices_json" {
  description = "PAPADATA_BILLING_PRICES_JSON: JSON array of {plan,cycle,priceId,name}, at most six entries."
  type        = string
  default     = "[]"
}

variable "stripe_portal_configuration" {
  type    = string
  default = ""
}

variable "payment_methods_enabled" {
  description = "PAYMENT_ENABLE_* checkout flags. See packages/integrations/src/stripe-billing.ts for which of these actually reach Stripe Checkout today -- most are configured-but-not-wired by design."
  type = object({
    card               = optional(bool, false)
    blik               = optional(bool, false)
    blik_recurring     = optional(bool, false)
    fast_bank_transfer = optional(bool, false)
    bank_transfer      = optional(bool, false)
    apple_pay          = optional(bool, false)
    google_pay         = optional(bool, false)
  })
  default = {}
}
