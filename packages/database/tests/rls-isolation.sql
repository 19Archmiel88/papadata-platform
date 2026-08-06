\set ON_ERROR_STOP on

begin;

select set_config('app.workspace_id', '', true);
select set_config('app.tenant_id', '00000000-0000-4000-8000-0000000000a1', true);

insert into app.security_mfa_enrollments (
  tenant_id,
  user_id,
  method,
  encrypted_secret,
  status
)
values (
  '00000000-0000-4000-8000-0000000000a1',
  'rls-test-user-a',
  'totp',
  'test-only-ciphertext-a',
  'pending'
);

DO $block$
DECLARE
  visible_count integer;
  changed_count integer;
BEGIN
  SELECT count(*) INTO visible_count
  FROM app.security_mfa_enrollments
  WHERE user_id = 'rls-test-user-a';

  IF visible_count <> 1 THEN
    RAISE EXCEPTION 'Tenant A could not read its own row; count=%', visible_count;
  END IF;

  PERFORM set_config('app.tenant_id', '00000000-0000-4000-8000-0000000000b2', true);

  SELECT count(*) INTO visible_count
  FROM app.security_mfa_enrollments
  WHERE user_id = 'rls-test-user-a';

  IF visible_count <> 0 THEN
    RAISE EXCEPTION 'Tenant B can read tenant A data; count=%', visible_count;
  END IF;

  UPDATE app.security_mfa_enrollments
  SET status = 'revoked'
  WHERE user_id = 'rls-test-user-a';
  GET DIAGNOSTICS changed_count = ROW_COUNT;

  IF changed_count <> 0 THEN
    RAISE EXCEPTION 'Tenant B can mutate tenant A data; rows=%', changed_count;
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
      '00000000-0000-4000-8000-0000000000a1',
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
$block$;

rollback;
