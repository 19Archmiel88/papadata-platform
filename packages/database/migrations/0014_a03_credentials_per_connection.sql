begin;

alter table app.integration_credentials
  add column if not exists credential_reference text,
  add column if not exists secret_resource text,
  add column if not exists active_version text not null default 'latest',
  add column if not exists previous_version text,
  add column if not exists rotation_state text not null default 'active',
  add column if not exists last_verified_at timestamptz;

update app.integration_credentials
set
  credential_reference = coalesce(credential_reference, secret_reference),
  secret_resource = coalesce(secret_resource, secret_reference),
  rotation_state = coalesce(rotation_state, 'active'),
  active_version = coalesce(active_version, 'latest')
where credential_reference is null
   or secret_resource is null
   or rotation_state is null
   or active_version is null;

alter table app.integration_credentials
  alter column credential_reference set not null,
  alter column secret_resource set not null;

alter table app.integration_credentials
  drop constraint if exists integration_credentials_status_valid;

alter table app.integration_credentials
  add constraint integration_credentials_status_valid
  check (
    status in (
      'active',
      'expired',
      'pending_verification',
      'reauthorization_required',
      'revoked'
    )
  );

alter table app.integration_credentials
  drop constraint if exists integration_credentials_rotation_state_valid;

alter table app.integration_credentials
  add constraint integration_credentials_rotation_state_valid
  check (
    rotation_state in (
      'active',
      'previous',
      'revoked',
      'rotating',
      'verifying_new'
    )
  );

alter table app.integration_credentials
  drop constraint if exists integration_credentials_reference_not_blank;

alter table app.integration_credentials
  add constraint integration_credentials_reference_not_blank
  check (
    length(trim(credential_reference)) > 0
    and length(trim(secret_resource)) > 0
    and length(trim(active_version)) > 0
  );

create unique index if not exists integration_credentials_active_reference_unique
  on app.integration_credentials (
    tenant_id,
    workspace_id,
    connection_id,
    provider_id,
    credential_reference
  )
  where revoked_at is null and status <> 'revoked';

create index if not exists integration_credentials_rotation_idx
  on app.integration_credentials (
    tenant_id,
    workspace_id,
    connection_id,
    provider_id,
    rotation_state,
    updated_at desc
  );

commit;
