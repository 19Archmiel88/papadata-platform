export type PapaDataTheme = 'light' | 'dark';

export type PapaDataLanguage = 'pl' | 'en';

export type DataReadinessState =
  | 'no_data'
  | 'partial'
  | 'delayed'
  | 'stale'
  | 'invalid'
  | 'conflicting'
  | 'processing'
  | 'ready'
  | 'resync_required'
  | 'manual_review_required';

export type SystemState =
  | 'loading'
  | 'processing'
  | 'empty'
  | 'no_data'
  | 'partial_data'
  | 'delayed_data'
  | 'stale_data'
  | 'conflicting_data'
  | 'error'
  | 'no_access'
  | 'expired_session'
  | 'expired_link'
  | 'success'
  | 'warning'
  | 'integration_disconnected'
  | 'integration_syncing'
  | 'integration_error'
  | 'reauthorization_required'
  | 'data_quality_warning'
  | 'no_data_for_ai'
  | 'insufficient_permissions_for_ai'
  | 'workspace_not_ready'
  | 'workspace_blocked'
  | 'sync_failed'
  | 'sync_in_progress'
  | 'resync_required';
