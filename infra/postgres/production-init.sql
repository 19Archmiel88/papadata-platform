do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'papadata_app') then
    create role papadata_app login password 'papadata-local';
  end if;
  if not exists (select 1 from pg_roles where rolname = 'papadata_test') then
    create role papadata_test login password 'papadata-local';
  end if;
end $$;

grant connect on database papadata to papadata_app, papadata_test;
grant usage, create on schema public to papadata_migrator;
