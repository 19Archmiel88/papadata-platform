begin;

alter table app.table_security_classification
  drop constraint if exists table_security_classification_scope_class_check;

alter table app.table_security_classification
  add constraint table_security_classification_scope_class_check
  check (scope_class in (
    'tenant',
    'tenant_workspace',
    'identity_scoped',
    'global_internal',
    'child_scoped'
  ));

update app.table_security_classification
   set scope_class = 'identity_scoped',
       rationale = case table_name
         when 'identity_users' then 'Identity-scoped user record constrained by identity_key or identity_user_id RLS.'
         when 'identity_audit_events' then 'Identity-scoped audit state constrained by identity_key RLS.'
         when 'identity_oauth_links' then 'Identity-scoped OAuth link state constrained by identity_user_id RLS; SECURITY DEFINER lookup is token/provider constrained.'
         when 'security_password_reset_tokens' then 'Identity-scoped password reset token state constrained by identity_key RLS; SECURITY DEFINER pre-auth lookup is token-hash constrained.'
         when 'security_email_verification_tokens' then 'Identity-scoped email verification token state constrained by identity_key RLS; SECURITY DEFINER pre-auth lookup is token-hash constrained.'
         else rationale
       end,
       reviewed_at = now()
 where table_name in (
   'identity_users',
   'identity_audit_events',
   'identity_oauth_links',
   'security_password_reset_tokens',
   'security_email_verification_tokens'
 );

-- Enforce logical tenant/workspace consistency for child tables whose
-- original FK referenced only the parent's globally unique id. RLS protects
-- row visibility, but this additionally prevents a correctly scoped writer
-- from creating Tenant A rows that point at Tenant B parents.
do $$
declare
  relation record;
  parent_index_name text;
  child_constraint_name text;
begin
  for relation in
    with fks as (
      select
        con.conname,
        child.relname as child_table,
        parent.relname as parent_table,
        array_agg(child_col.attname order by ord.n) as child_cols,
        array_agg(parent_col.attname order by ord.n) as parent_cols
      from pg_constraint con
      join pg_class child on child.oid = con.conrelid
      join pg_namespace child_ns
        on child_ns.oid = child.relnamespace
       and child_ns.nspname = 'app'
      join pg_class parent on parent.oid = con.confrelid
      join pg_namespace parent_ns
        on parent_ns.oid = parent.relnamespace
       and parent_ns.nspname = 'app'
      join unnest(con.conkey, con.confkey) with ordinality
        as ord(child_attnum, parent_attnum, n)
        on true
      join pg_attribute child_col
        on child_col.attrelid = child.oid
       and child_col.attnum = ord.child_attnum
      join pg_attribute parent_col
        on parent_col.attrelid = parent.oid
       and parent_col.attnum = ord.parent_attnum
      where con.contype = 'f'
      group by con.conname, child.relname, parent.relname
    ),
    columns as (
      select
        table_name,
        bool_or(column_name = 'tenant_id') as has_tenant_id,
        bool_or(column_name = 'workspace_id') as has_workspace_id
      from information_schema.columns
      where table_schema = 'app'
      group by table_name
    )
    select
      f.child_table,
      f.parent_table,
      f.child_cols[1] as child_column,
      f.parent_cols[1] as parent_column
    from fks f
    join columns child_columns
      on child_columns.table_name = f.child_table
    join columns parent_columns
      on parent_columns.table_name = f.parent_table
    where child_columns.has_tenant_id
      and child_columns.has_workspace_id
      and parent_columns.has_tenant_id
      and parent_columns.has_workspace_id
      and array_length(f.child_cols, 1) = 1
      and not (
        'tenant_id' = any(f.child_cols)
        and 'tenant_id' = any(f.parent_cols)
      )
    order by f.child_table, f.parent_table, f.conname
  loop
    parent_index_name := left(
      relation.parent_table || '_' || relation.parent_column || '_scope_uidx',
      55
    ) || '_' || substr(md5(
      relation.parent_table || '.' || relation.parent_column
    ), 1, 7);

    if to_regclass(format('app.%I', parent_index_name)) is null then
      execute format(
        'create unique index %I on app.%I (tenant_id, workspace_id, %I)',
        parent_index_name,
        relation.parent_table,
        relation.parent_column
      );
    end if;

    child_constraint_name := left(
      relation.child_table || '_' || relation.child_column || '_same_scope_fk',
      55
    ) || '_' || substr(md5(
      relation.child_table || '.' || relation.child_column || '->' ||
      relation.parent_table || '.' || relation.parent_column
    ), 1, 7);

    if not exists (
      select 1
      from pg_constraint existing
      join pg_class child_relation
        on child_relation.oid = existing.conrelid
      join pg_namespace child_namespace
        on child_namespace.oid = child_relation.relnamespace
      where child_namespace.nspname = 'app'
        and child_relation.relname = relation.child_table
        and existing.conname = child_constraint_name
    ) then
      execute format(
        'alter table app.%I add constraint %I foreign key (tenant_id, workspace_id, %I) references app.%I (tenant_id, workspace_id, %I) not valid',
        relation.child_table,
        child_constraint_name,
        relation.child_column,
        relation.parent_table,
        relation.parent_column
      );
      execute format(
        'alter table app.%I validate constraint %I',
        relation.child_table,
        child_constraint_name
      );
    end if;
  end loop;
end $$;

commit;
