# Stany systemu i błędy

## Wymagane stany

- loading,
- processing,
- empty,
- no_data,
- partial_data,
- delayed_data,
- stale_data,
- conflicting_data,
- error,
- no_access,
- expired_session,
- expired_link,
- success,
- warning,
- integration_disconnected,
- integration_syncing,
- integration_error,
- reauthorization_required,
- data_quality_warning,
- no_data_for_ai,
- insufficient_permissions_for_ai,
- workspace_not_ready,
- workspace_blocked,
- sync_failed,
- sync_in_progress,
- resync_required.

## Wymagania dla każdego stanu

- użytkownik rozumie przyczynę,
- użytkownik widzi wpływ,
- użytkownik widzi możliwą akcję,
- retry jest dostępne tylko wtedy, gdy jest bezpieczne,
- częściowe dane nie są bez potrzeby ukrywane,
- stan ma fixture,
- stan ma story,
- zdarzenie jest audytowane, jeżeli wymaga tego bezpieczeństwo.
