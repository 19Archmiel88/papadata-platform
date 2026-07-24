variable "project_id" { type = string }
variable "region" { type = string default = "europe-central2" }
variable "environment" { type = string }
variable "database_tier" { type = string default = "db-custom-2-7680" }
variable "redis_memory_size_gb" { type = number default = 1 }
variable "artifact_repository" { type = string default = "papadata" }
variable "api_image" { type = string }
variable "bff_image" { type = string }
variable "worker_image" { type = string }
