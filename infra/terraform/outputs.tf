output "api_uri" { value = google_cloud_run_v2_service.api.uri }
output "bff_uri" { value = google_cloud_run_v2_service.bff.uri }
output "worker_job_name" { value = google_cloud_run_v2_worker_pool.worker.name }
output "database_private_ip" { value = google_sql_database_instance.runtime.private_ip_address sensitive = true }
output "redis_host" { value = google_redis_instance.runtime.host sensitive = true }
output "object_bucket" { value = google_storage_bucket.objects.name }
output "artifact_repository" { value = google_artifact_registry_repository.runtime.name }
