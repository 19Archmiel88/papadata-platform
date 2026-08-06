output "api_uri" {
  value     = google_cloud_run_v2_service.api.uri
  sensitive = true
}

output "bff_internal_uri" {
  value     = google_cloud_run_v2_service.bff.uri
  sensitive = true
}

output "public_https_url" {
  value = "https://${var.public_domain}"
}

output "edge_ip" {
  value = google_compute_global_address.edge.address
}

output "worker_pool_name" {
  value = google_cloud_run_v2_worker_pool.worker.name
}

output "database_private_ip" {
  value     = google_sql_database_instance.runtime.private_ip_address
  sensitive = true
}

output "redis_host" {
  value     = google_redis_instance.runtime.host
  sensitive = true
}

output "object_bucket" {
  value = google_storage_bucket.objects.name
}

output "artifact_repository" {
  value = google_artifact_registry_repository.runtime.name
}

output "runtime_secret_ids" {
  value     = local.runtime_secret_ids
  sensitive = true
}
