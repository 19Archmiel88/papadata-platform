begin;

-- app.cookie_consents and app.audit_events both have a nullable tenant_id
-- column, so migration 0016's generic tenant-scope sweep enrolled them into
-- a restrictive policy requiring tenant_id::text = app.current_tenant_id().
-- That expression can never be true when tenant_id IS NULL (NULL = anything
-- is NULL, never TRUE), and FORCE ROW LEVEL SECURITY applies the policy to
-- every role including the table owner -- so the anonymous cookie-consent
-- rows these tables were explicitly designed to hold (see
-- 000003_compliance_notifications.sql) became completely unreachable:
-- INSERT/SELECT/UPDATE all fail with "new row violates row-level security
-- policy for table ...". Same defect on app.audit_events, whose only writer
-- today is the same anonymous cookie-consent path (see
-- apps/api/src/production/cookie-consent/cookie-consent.service.ts).
--
-- Fix: give the caller a dedicated, narrow transaction-local scope --
-- app.cookie_consent_subject_id, set only by
-- ProductionDatabase.withCookieConsentSubject(), never derived from
-- anything the browser sends directly -- and let each table's policy
-- recognize either that exact-subject scope or the existing tenant scope
-- (kept so any future/other tenant-scoped consumer of these two tables
-- keeps working; nothing today queries either table by tenant). Neither
-- policy ever reduces to USING (true): a transaction with neither scope
-- set still sees and writes nothing.

create or replace function app.current_cookie_consent_subject_id()
returns text
language sql
stable
as $$
  select nullif(current_setting('app.cookie_consent_subject_id', true), '');
$$;

-- app.cookie_consents ---------------------------------------------------

drop policy if exists cookie_consents_canonical_scope_policy on app.cookie_consents;
drop policy if exists cookie_consents_scope_restriction on app.cookie_consents;

create policy cookie_consents_canonical_scope_policy
  on app.cookie_consents
  as permissive
  for all
  using (
    subject_id = app.current_cookie_consent_subject_id()
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  )
  with check (
    subject_id = app.current_cookie_consent_subject_id()
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  );

create policy cookie_consents_scope_restriction
  on app.cookie_consents
  as restrictive
  for all
  using (
    subject_id = app.current_cookie_consent_subject_id()
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  )
  with check (
    subject_id = app.current_cookie_consent_subject_id()
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  );

-- app.audit_events ---------------------------------------------------------
-- Narrower than the cookie_consents policy above on purpose: only the exact
-- anonymous cookie-consent audit shape gets the subject-scoped path. This
-- must not become "any tenantless audit row is writable" -- every other
-- tenant-ed row keeps exactly the generic 0016 tenant-scope behavior, and a
-- tenantless row that isn't a cookie-consent event stays unreachable.

drop policy if exists audit_events_canonical_scope_policy on app.audit_events;
drop policy if exists audit_events_scope_restriction on app.audit_events;

create policy audit_events_canonical_scope_policy
  on app.audit_events
  as permissive
  for all
  using (
    (
      tenant_id is null
      and workspace_id is null
      and resource_type = 'cookie_consent'
      and action like 'cookie_consent.%'
      and resource_id = app.current_cookie_consent_subject_id()
    )
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  )
  with check (
    (
      tenant_id is null
      and workspace_id is null
      and resource_type = 'cookie_consent'
      and action like 'cookie_consent.%'
      and resource_id = app.current_cookie_consent_subject_id()
    )
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  );

create policy audit_events_scope_restriction
  on app.audit_events
  as restrictive
  for all
  using (
    (
      tenant_id is null
      and workspace_id is null
      and resource_type = 'cookie_consent'
      and action like 'cookie_consent.%'
      and resource_id = app.current_cookie_consent_subject_id()
    )
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  )
  with check (
    (
      tenant_id is null
      and workspace_id is null
      and resource_type = 'cookie_consent'
      and action like 'cookie_consent.%'
      and resource_id = app.current_cookie_consent_subject_id()
    )
    or (
      tenant_id is not null
      and tenant_id::text = app.current_tenant_id()
      and (
        app.current_workspace_id() is null
        or workspace_id is null
        or workspace_id::text = app.current_workspace_id()
      )
    )
  );

commit;
