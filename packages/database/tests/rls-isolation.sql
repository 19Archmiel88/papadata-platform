\set ON_ERROR_STOP on

DO $fixture$
DECLARE
  tenant_a constant uuid := '00000000-0000-4000-8000-0000000000a1';
  tenant_b constant uuid := '00000000-0000-4000-8000-0000000000b2';
  workspace_a1 constant uuid := '00000000-0000-4000-8000-000000000a11';
  workspace_a2 constant uuid := '00000000-0000-4000-8000-000000000a12';
  workspace_b1 constant uuid := '00000000-0000-4000-8000-000000000b21';
  user_a constant uuid := '00000000-0000-4000-8000-000000000aa1';
  user_b constant uuid := '00000000-0000-4000-8000-000000000bb1';
  identity_a constant text := repeat('a', 64);
  identity_b constant text := repeat('b', 64);
BEGIN
  INSERT INTO app.users (user_id, email, full_name, status)
  VALUES
    (user_a, 'rls-a@example.test', 'RLS User A', 'active'),
    (user_b, 'rls-b@example.test', 'RLS User B', 'active');

  PERFORM set_config('app.workspace_id', '', true);

  PERFORM set_config('app.tenant_id', tenant_a::text, true);
  INSERT INTO app.tenants (tenant_id, created_by_user_id, name, status)
  VALUES (tenant_a, user_a, 'RLS Tenant A', 'active');

  PERFORM set_config('app.tenant_id', tenant_b::text, true);
  INSERT INTO app.tenants (tenant_id, created_by_user_id, name, status)
  VALUES (tenant_b, user_b, 'RLS Tenant B', 'active');

  PERFORM set_config('app.tenant_id', tenant_a::text, true);
  PERFORM set_config('app.workspace_id', workspace_a1::text, true);
  INSERT INTO app.workspaces (workspace_id, tenant_id, created_by_user_id, name, status)
  VALUES (workspace_a1, tenant_a, user_a, 'RLS Workspace A1', 'active');

  PERFORM set_config('app.workspace_id', workspace_a2::text, true);
  INSERT INTO app.workspaces (workspace_id, tenant_id, created_by_user_id, name, status)
  VALUES (workspace_a2, tenant_a, user_a, 'RLS Workspace A2', 'active');

  PERFORM set_config('app.tenant_id', tenant_b::text, true);
  PERFORM set_config('app.workspace_id', workspace_b1::text, true);
  INSERT INTO app.workspaces (workspace_id, tenant_id, created_by_user_id, name, status)
  VALUES (workspace_b1, tenant_b, user_b, 'RLS Workspace B1', 'active');

  PERFORM set_config('app.identity_user_id', '', true);
  PERFORM set_config('app.identity_key', identity_a, true);
  INSERT INTO app.identity_users (
    user_id,
    identity_key,
    normalized_email,
    password_hash,
    display_name,
    status
  )
  VALUES (
    user_a,
    identity_a,
    'rls-a@example.test',
    'test-password-hash-a',
    'RLS Identity A',
    'active'
  );

  PERFORM set_config('app.identity_key', identity_b, true);
  INSERT INTO app.identity_users (
    user_id,
    identity_key,
    normalized_email,
    password_hash,
    display_name,
    status
  )
  VALUES (
    user_b,
    identity_b,
    'rls-b@example.test',
    'test-password-hash-b',
    'RLS Identity B',
    'active'
  );
END
$fixture$;

BEGIN;
SELECT set_config('app.tenant_id', '00000000-0000-4000-8000-0000000000a1', true);
COMMIT;

DO $scope_leak$
BEGIN
  IF nullif(current_setting('app.tenant_id', true), '') IS NOT NULL THEN
    RAISE EXCEPTION 'tenant GUC leaked outside transaction scope';
  END IF;
END
$scope_leak$;

DO $catalog$
DECLARE
  failures text[];
BEGIN
  WITH checks(check_name, failed) AS (
    VALUES
      (
        'app_runtime_role_has_no_bypassrls',
        EXISTS (
          SELECT 1
          FROM pg_roles
          WHERE rolname = current_user
            AND (rolsuper OR rolbypassrls)
        )
      ),
      (
        'all_app_base_tables_classified',
        EXISTS (
          SELECT 1
          FROM information_schema.tables table_list
          LEFT JOIN app.table_security_classification classification
            ON classification.table_name = table_list.table_name
          WHERE table_list.table_schema = 'app'
            AND table_list.table_type = 'BASE TABLE'
            AND classification.table_name IS NULL
        )
      ),
      (
        'scoped_tables_have_forced_rls',
        EXISTS (
          SELECT 1
          FROM app.table_security_classification classification
          JOIN pg_class relation
            ON relation.relname = classification.table_name
          JOIN pg_namespace namespace
            ON namespace.oid = relation.relnamespace
           AND namespace.nspname = 'app'
          WHERE classification.scope_class IN (
              'tenant',
              'tenant_workspace',
              'child_scoped'
            )
            AND (NOT relation.relrowsecurity OR NOT relation.relforcerowsecurity)
        )
      ),
      (
        'identity_tables_have_rls_and_policies',
        EXISTS (
          SELECT 1
          FROM app.table_security_classification classification
          JOIN pg_class relation
            ON relation.relname = classification.table_name
          JOIN pg_namespace namespace
            ON namespace.oid = relation.relnamespace
           AND namespace.nspname = 'app'
          WHERE classification.scope_class = 'identity_scoped'
            AND (
              NOT relation.relrowsecurity
              OR NOT EXISTS (
                SELECT 1
                FROM pg_policy policy
                WHERE policy.polrelid = relation.oid
              )
            )
        )
      ),
      (
        'security_definers_pin_search_path',
        EXISTS (
          SELECT 1
          FROM pg_proc procedure
          JOIN pg_namespace namespace
            ON namespace.oid = procedure.pronamespace
          WHERE namespace.nspname = 'app'
            AND procedure.prosecdef
            AND NOT (
              coalesce(procedure.proconfig, ARRAY[]::text[])
              @> ARRAY['search_path=app, pg_catalog']
            )
        )
      ),
      (
        'security_definers_not_public_executable',
        EXISTS (
          SELECT 1
          FROM pg_proc procedure
          JOIN pg_namespace namespace
            ON namespace.oid = procedure.pronamespace
          WHERE namespace.nspname = 'app'
            AND procedure.prosecdef
            AND EXISTS (
              SELECT 1
              FROM aclexplode(
                coalesce(
                  procedure.proacl,
                  acldefault('f', procedure.proowner)
                )
              ) privilege
              WHERE privilege.grantee = 0
                AND privilege.privilege_type = 'EXECUTE'
            )
        )
      ),
      (
        'app_tables_have_no_public_grants',
        EXISTS (
          SELECT 1
          FROM information_schema.role_table_grants
          WHERE table_schema = 'app'
            AND grantee = 'PUBLIC'
        )
      ),
      (
        'single_column_scoped_fks_have_same_scope_companion',
        EXISTS (
          WITH fks AS (
            SELECT
              con.oid,
              con.conrelid,
              con.confrelid,
              array_agg(child_col.attname ORDER BY ord.n) AS child_cols,
              array_agg(parent_col.attname ORDER BY ord.n) AS parent_cols
            FROM pg_constraint con
            JOIN pg_class child
              ON child.oid = con.conrelid
            JOIN pg_namespace child_ns
              ON child_ns.oid = child.relnamespace
             AND child_ns.nspname = 'app'
            JOIN pg_class parent
              ON parent.oid = con.confrelid
            JOIN pg_namespace parent_ns
              ON parent_ns.oid = parent.relnamespace
             AND parent_ns.nspname = 'app'
            JOIN unnest(con.conkey, con.confkey) WITH ORDINALITY
              AS ord(child_attnum, parent_attnum, n)
              ON true
            JOIN pg_attribute child_col
              ON child_col.attrelid = child.oid
             AND child_col.attnum = ord.child_attnum
            JOIN pg_attribute parent_col
              ON parent_col.attrelid = parent.oid
             AND parent_col.attnum = ord.parent_attnum
            WHERE con.contype = 'f'
            GROUP BY con.oid, con.conrelid, con.confrelid
          ),
          scoped_columns AS (
            SELECT
              table_schema,
              table_name,
              bool_or(column_name = 'tenant_id') AS has_tenant_id,
              bool_or(column_name = 'workspace_id') AS has_workspace_id
            FROM information_schema.columns
            WHERE table_schema = 'app'
            GROUP BY table_schema, table_name
          ),
          candidates AS (
            SELECT fks.*
            FROM fks
            JOIN pg_class child
              ON child.oid = fks.conrelid
            JOIN pg_class parent
              ON parent.oid = fks.confrelid
            JOIN scoped_columns child_columns
              ON child_columns.table_name = child.relname
            JOIN scoped_columns parent_columns
              ON parent_columns.table_name = parent.relname
            WHERE child_columns.has_tenant_id
              AND child_columns.has_workspace_id
              AND parent_columns.has_tenant_id
              AND parent_columns.has_workspace_id
              AND array_length(fks.child_cols, 1) = 1
              AND fks.child_cols[1] NOT IN ('tenant_id', 'workspace_id')
          )
          SELECT 1
          FROM candidates candidate
          WHERE NOT EXISTS (
            SELECT 1
            FROM fks companion
            WHERE companion.conrelid = candidate.conrelid
              AND companion.confrelid = candidate.confrelid
              AND 'tenant_id' = ANY(companion.child_cols)
              AND 'workspace_id' = ANY(companion.child_cols)
              AND candidate.child_cols[1] = ANY(companion.child_cols)
              AND 'tenant_id' = ANY(companion.parent_cols)
              AND 'workspace_id' = ANY(companion.parent_cols)
              AND candidate.parent_cols[1] = ANY(companion.parent_cols)
          )
        )
      )
  )
  SELECT array_agg(check_name ORDER BY check_name)
    INTO failures
  FROM checks
  WHERE failed;

  IF failures IS NOT NULL THEN
    RAISE EXCEPTION 'catalog RLS checks failed: %', array_to_string(failures, ', ');
  END IF;
END
$catalog$;

DO $tenant_isolation$
DECLARE
  tenant_a constant text := '00000000-0000-4000-8000-0000000000a1';
  tenant_b constant text := '00000000-0000-4000-8000-0000000000b2';
  visible_count integer;
  changed_count integer;
BEGIN
  PERFORM set_config('app.workspace_id', '', true);
  PERFORM set_config('app.tenant_id', tenant_a, true);

  INSERT INTO app.security_mfa_enrollments (
    tenant_id,
    user_id,
    method,
    encrypted_secret,
    status
  )
  VALUES (
    tenant_a,
    'rls-test-user-a',
    'totp',
    'test-only-ciphertext-a',
    'pending'
  );

  SELECT count(*) INTO visible_count
  FROM app.security_mfa_enrollments
  WHERE user_id = 'rls-test-user-a';

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'Tenant A could not read its own MFA row; count=%', visible_count;
  END IF;

  PERFORM set_config('app.tenant_id', tenant_b, true);

  SELECT count(*) INTO visible_count
  FROM app.security_mfa_enrollments
  WHERE user_id = 'rls-test-user-a';

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Tenant B can read tenant A MFA row; count=%', visible_count;
  END IF;

  UPDATE app.security_mfa_enrollments
  SET status = 'revoked'
  WHERE user_id = 'rls-test-user-a';
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 0 THEN
    RAISE EXCEPTION 'Tenant B can mutate tenant A MFA row; rows=%', changed_count;
  END IF;

  BEGIN
    INSERT INTO app.security_mfa_enrollments (
      tenant_id,
      user_id,
      method,
      encrypted_secret,
      status
    )
    VALUES (
      tenant_a,
      'rls-cross-tenant-write',
      'totp',
      'test-only-ciphertext-cross-tenant',
      'pending'
    );
    RAISE EXCEPTION 'Tenant B inserted a row owned by tenant A';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      NULL;
  END;
END
$tenant_isolation$;

DO $workspace_isolation$
DECLARE
  tenant_a constant uuid := '00000000-0000-4000-8000-0000000000a1';
  workspace_a1 constant uuid := '00000000-0000-4000-8000-000000000a11';
  workspace_a2 constant uuid := '00000000-0000-4000-8000-000000000a12';
  visible_count integer;
  changed_count integer;
BEGIN
  PERFORM set_config('app.tenant_id', tenant_a::text, true);
  PERFORM set_config('app.workspace_id', workspace_a1::text, true);

  INSERT INTO app.product_domain_records (
    tenant_id,
    workspace_id,
    domain,
    entity_type,
    external_key,
    data
  )
  VALUES (
    tenant_a,
    workspace_a1,
    'commerce',
    'product',
    'rls-product-a1',
    '{"source":"rls"}'::jsonb
  );

  PERFORM set_config('app.workspace_id', workspace_a2::text, true);
  INSERT INTO app.product_domain_records (
    tenant_id,
    workspace_id,
    domain,
    entity_type,
    external_key,
    data
  )
  VALUES (
    tenant_a,
    workspace_a2,
    'commerce',
    'product',
    'rls-product-a2',
    '{"source":"rls"}'::jsonb
  );

  PERFORM set_config('app.workspace_id', workspace_a1::text, true);

  SELECT count(*) INTO visible_count
  FROM app.product_domain_records
  WHERE external_key LIKE 'rls-product-a%';

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'Workspace A1 visible product count mismatch; count=%', visible_count;
  END IF;

  UPDATE app.product_domain_records
  SET status = 'archived'
  WHERE external_key = 'rls-product-a2';
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 0 THEN
    RAISE EXCEPTION 'Workspace A1 can mutate workspace A2 row; rows=%', changed_count;
  END IF;

  BEGIN
    INSERT INTO app.product_domain_records (
      tenant_id,
      workspace_id,
      domain,
      entity_type,
      external_key,
      data
    )
    VALUES (
      tenant_a,
      workspace_a2,
      'commerce',
      'product',
      'rls-forged-workspace',
      '{}'::jsonb
    );
    RAISE EXCEPTION 'Workspace A1 inserted a row owned by workspace A2';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      NULL;
  END;

  BEGIN
    UPDATE app.product_domain_records
    SET workspace_id = workspace_a2
    WHERE external_key = 'rls-product-a1';
    RAISE EXCEPTION 'Workspace A1 moved its row into workspace A2';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      NULL;
  END;
END
$workspace_isolation$;

DO $parent_child_scope$
DECLARE
  tenant_a constant text := '00000000-0000-4000-8000-0000000000a1';
  tenant_b constant text := '00000000-0000-4000-8000-0000000000b2';
  workspace_a1 constant text := '00000000-0000-4000-8000-000000000a11';
  workspace_a2 constant text := '00000000-0000-4000-8000-000000000a12';
  request_a1 uuid;
  request_a_all uuid;
  visible_count integer;
  changed_count integer;
BEGIN
  PERFORM set_config('app.tenant_id', tenant_a, true);
  PERFORM set_config('app.workspace_id', workspace_a1, true);

  INSERT INTO app.privacy_requests (
    tenant_id,
    workspace_id,
    subject_reference,
    request_type,
    status,
    due_at,
    correlation_id
  )
  VALUES (
    tenant_a,
    workspace_a1,
    'subject-a1',
    'export',
    'pending',
    now() + interval '7 days',
    'rls-request-a1'
  )
  RETURNING id INTO request_a1;

  INSERT INTO app.privacy_requests (
    tenant_id,
    workspace_id,
    subject_reference,
    request_type,
    status,
    due_at,
    correlation_id
  )
  VALUES (
    tenant_a,
    NULL,
    'subject-a-all',
    'erasure',
    'pending',
    now() + interval '7 days',
    'rls-request-a-all'
  )
  RETURNING id INTO request_a_all;

  INSERT INTO app.privacy_request_targets (request_id, system, status)
  VALUES
    (request_a1, 'crm', 'pending'),
    (request_a_all, 'warehouse', 'pending');

  SELECT count(*) INTO visible_count
  FROM app.privacy_request_targets
  WHERE request_id IN (request_a1, request_a_all);

  IF visible_count <> 2 THEN
    RAISE EXCEPTION 'Workspace A1 parent-child visibility mismatch; count=%', visible_count;
  END IF;

  PERFORM set_config('app.workspace_id', workspace_a2, true);

  SELECT count(*) INTO visible_count
  FROM app.privacy_request_targets
  WHERE request_id = request_a1;

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Workspace A2 can read workspace A1 child row; count=%', visible_count;
  END IF;

  SELECT count(*) INTO visible_count
  FROM app.privacy_request_targets
  WHERE request_id = request_a_all;

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'Workspace A2 cannot read tenant-wide nullable-workspace child row; count=%', visible_count;
  END IF;

  PERFORM set_config('app.tenant_id', tenant_b, true);
  PERFORM set_config('app.workspace_id', '', true);

  SELECT count(*) INTO visible_count
  FROM app.privacy_request_targets
  WHERE request_id IN (request_a1, request_a_all);

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Tenant B can read tenant A child rows; count=%', visible_count;
  END IF;

  UPDATE app.privacy_request_targets
  SET status = 'completed'
  WHERE request_id = request_a1;
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 0 THEN
    RAISE EXCEPTION 'Tenant B can mutate tenant A child rows; rows=%', changed_count;
  END IF;
END
$parent_child_scope$;

DO $same_scope_fk$
DECLARE
  tenant_a constant uuid := '00000000-0000-4000-8000-0000000000a1';
  tenant_b constant uuid := '00000000-0000-4000-8000-0000000000b2';
  workspace_a1 constant uuid := '00000000-0000-4000-8000-000000000a11';
  workspace_b1 constant uuid := '00000000-0000-4000-8000-000000000b21';
  connection_a1 constant uuid := '00000000-0000-4000-8000-00000c0a0001';
  connection_b1 constant uuid := '00000000-0000-4000-8000-00000c0b0001';
  changed_count integer;
BEGIN
  PERFORM set_config('app.tenant_id', tenant_a::text, true);
  PERFORM set_config('app.workspace_id', workspace_a1::text, true);
  INSERT INTO app.integration_connections (
    connection_id,
    tenant_id,
    workspace_id,
    provider_id,
    status
  )
  VALUES (
    connection_a1,
    tenant_a,
    workspace_a1,
    'shopify',
    'disconnected'
  );

  INSERT INTO app.webhook_replay_receipts (
    tenant_id,
    workspace_id,
    connection_id,
    provider_id,
    provider_event_id,
    signature_digest,
    payload_digest,
    expires_at
  )
  VALUES (
    tenant_a,
    workspace_a1,
    connection_a1,
    'shopify',
    'rls-replay-a1',
    'signature-a1',
    'payload-a1',
    now() + interval '1 day'
  );

  PERFORM set_config('app.tenant_id', tenant_b::text, true);
  PERFORM set_config('app.workspace_id', workspace_b1::text, true);
  INSERT INTO app.integration_connections (
    connection_id,
    tenant_id,
    workspace_id,
    provider_id,
    status
  )
  VALUES (
    connection_b1,
    tenant_b,
    workspace_b1,
    'shopify',
    'disconnected'
  );

  INSERT INTO app.webhook_replay_receipts (
    tenant_id,
    workspace_id,
    connection_id,
    provider_id,
    provider_event_id,
    signature_digest,
    payload_digest,
    expires_at
  )
  VALUES (
    tenant_b,
    workspace_b1,
    connection_b1,
    'shopify',
    'rls-replay-b1',
    'signature-b1',
    'payload-b1',
    now() + interval '1 day'
  );

  PERFORM set_config('app.tenant_id', tenant_a::text, true);
  PERFORM set_config('app.workspace_id', workspace_a1::text, true);

  DELETE FROM app.webhook_replay_receipts
  WHERE provider_event_id = 'rls-replay-b1';
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 0 THEN
    RAISE EXCEPTION 'Workspace A1 can delete workspace B replay receipt; rows=%', changed_count;
  END IF;

  DELETE FROM app.webhook_replay_receipts
  WHERE provider_event_id = 'rls-replay-a1';
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 1 THEN
    RAISE EXCEPTION 'Workspace A1 could not delete its own replay receipt; rows=%', changed_count;
  END IF;

  INSERT INTO app.sync_jobs (
    sync_job_id,
    tenant_id,
    workspace_id,
    connection_id,
    provider_id,
    job_kind,
    status,
    streams,
    idempotency_key
  )
  VALUES (
    '00000000-0000-4000-8000-00000000a001',
    tenant_a,
    workspace_a1,
    connection_a1,
    'shopify',
    'initial_sync',
    'queued',
    ARRAY['products']::text[],
    'rls-sync-a1'
  );

  BEGIN
    INSERT INTO app.sync_jobs (
      sync_job_id,
      tenant_id,
      workspace_id,
      connection_id,
      provider_id,
      job_kind,
      status,
      streams,
      idempotency_key
    )
    VALUES (
      '00000000-0000-4000-8000-00000000a002',
      tenant_a,
      workspace_a1,
      connection_b1,
      'shopify',
      'initial_sync',
      'queued',
      ARRAY['products']::text[],
      'rls-sync-forged-parent'
    );
    RAISE EXCEPTION 'same-scope FK allowed a workspace A row to reference workspace B parent';
  EXCEPTION
    WHEN foreign_key_violation THEN
      NULL;
  END;
END
$same_scope_fk$;

DO $identity_scope$
DECLARE
  user_a constant uuid := '00000000-0000-4000-8000-000000000aa1';
  user_b constant uuid := '00000000-0000-4000-8000-000000000bb1';
  identity_a constant text := repeat('a', 64);
  identity_b constant text := repeat('b', 64);
  visible_count integer;
  changed_count integer;
BEGIN
  PERFORM set_config('app.identity_user_id', '', true);
  PERFORM set_config('app.identity_key', identity_a, true);

  INSERT INTO app.identity_audit_events (
    identity_key,
    user_id,
    event_type,
    outcome,
    metadata
  )
  VALUES (
    identity_a,
    user_a,
    'rls.identity.login',
    'success',
    '{}'::jsonb
  );

  INSERT INTO app.security_password_reset_tokens (
    user_id,
    identity_key,
    token_hash,
    expires_at
  )
  VALUES (
    user_a,
    identity_a,
    'rls-password-token-a',
    now() + interval '15 minutes'
  );

  INSERT INTO app.security_email_verification_tokens (
    user_id,
    identity_key,
    token_hash,
    expires_at
  )
  VALUES (
    user_a,
    identity_a,
    'rls-email-token-a',
    now() + interval '15 minutes'
  );

  PERFORM set_config('app.identity_key', identity_b, true);

  INSERT INTO app.security_password_reset_tokens (
    user_id,
    identity_key,
    token_hash,
    expires_at
  )
  VALUES (
    user_b,
    identity_b,
    'rls-password-token-b',
    now() + interval '15 minutes'
  );

  PERFORM set_config('app.identity_key', identity_a, true);

  SELECT count(*) INTO visible_count
  FROM app.security_password_reset_tokens
  WHERE token_hash LIKE 'rls-password-token-%';

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'Identity A visible password token count mismatch; count=%', visible_count;
  END IF;

  UPDATE app.security_password_reset_tokens
  SET revoked_at = now()
  WHERE token_hash = 'rls-password-token-b';
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 0 THEN
    RAISE EXCEPTION 'Identity A can mutate identity B password token; rows=%', changed_count;
  END IF;

  BEGIN
    INSERT INTO app.security_password_reset_tokens (
      user_id,
      identity_key,
      token_hash,
      expires_at
    )
    VALUES (
      user_b,
      identity_b,
      'rls-forged-password-token',
      now() + interval '15 minutes'
    );
    RAISE EXCEPTION 'Identity A inserted a token owned by identity B';
  EXCEPTION
    WHEN insufficient_privilege OR check_violation THEN
      NULL;
  END;

  PERFORM set_config('app.identity_key', '', true);

  SELECT count(*) INTO visible_count
  FROM app.security_password_reset_tokens
  WHERE token_hash = 'rls-password-token-a';

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Direct password token SELECT bypassed identity scope; count=%', visible_count;
  END IF;

  SELECT count(*) INTO visible_count
  FROM app.lookup_password_reset_token('rls-password-token-a');

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'SECURITY DEFINER password lookup did not return exact live token; count=%', visible_count;
  END IF;

  SELECT count(*) INTO visible_count
  FROM app.lookup_password_reset_token('rls-password-token-missing');

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'SECURITY DEFINER password lookup returned a missing token; count=%', visible_count;
  END IF;

  SELECT count(*) INTO visible_count
  FROM app.lookup_email_verification_token('rls-email-token-a');

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'SECURITY DEFINER email lookup did not return exact live token; count=%', visible_count;
  END IF;

  PERFORM set_config('app.identity_user_id', user_a::text, true);

  INSERT INTO app.identity_oauth_links (
    user_id,
    provider,
    provider_subject_id,
    provider_email,
    identity_key
  )
  VALUES (
    user_a,
    'google',
    'rls-google-subject-a',
    'rls-a@example.test',
    identity_a
  );

  PERFORM set_config('app.identity_user_id', '', true);

  SELECT count(*) INTO visible_count
  FROM app.identity_oauth_links
  WHERE provider_subject_id = 'rls-google-subject-a';

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Direct OAuth link SELECT bypassed identity user scope; count=%', visible_count;
  END IF;

  SELECT count(*) INTO visible_count
  FROM app.lookup_oauth_link('google', 'rls-google-subject-a');

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'SECURITY DEFINER OAuth lookup did not return exact link; count=%', visible_count;
  END IF;
END
$identity_scope$;

SELECT 'rls_matrix=ok' AS result;
