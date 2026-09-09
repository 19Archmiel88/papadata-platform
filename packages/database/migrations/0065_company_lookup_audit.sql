-- P0-05 closure: GUS/BIR company-lookup adapter
-- (docs/specyfikacja-docelowa/26-priorytety-p0/05-adapter-gus-bir-nip.md).
--
-- app.company_lookup_audit is an append-only record of every *real* (i.e.
-- cache-miss) GUS/BIR registry response returned by company.lookup, kept
-- independently of the company profile a user later saves and edits
-- (app.access_company_profiles): "uzytkownik moze poprawic dane, ale
-- oryginalna odpowiedz pozostaje w audycie" (spec step 4). The API only
-- ever inserts into this table -- see the GRANTs below -- so an edit or a
-- later manual save can never overwrite or delete a prior lookup's raw
-- response.
--
-- company.lookup is @PublicEndpoint() (apps/api/src/production/contract-
-- runtime/generated/identity-access.controller.ts): it runs before a
-- workspace/tenant scope exists for the caller (no RequestPrincipal is
-- available in ContractRuntimeService.executePublic), so -- like
-- app.access_mail_outbox (0062) -- this table intentionally carries no
-- tenant_id/workspace_id/user_id and has no RLS boundary; correlation_id
-- (already an established column, see 0017) is the traceable context that
-- *is* available.
BEGIN;

CREATE TABLE app.company_lookup_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 nip text NOT NULL CHECK(nip ~ '^\d{10}$'),
 raw_payload jsonb NOT NULL CHECK(jsonb_typeof(raw_payload)='object'),
 normalized jsonb NOT NULL CHECK(jsonb_typeof(normalized)='object'),
 source text NOT NULL CHECK(source IN('gus_bir')),
 retrieved_at timestamptz NOT NULL,
 correlation_id text,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX company_lookup_audit_nip ON app.company_lookup_audit(nip,created_at DESC);

-- Write-only from the application's perspective (mirrors access_mail_outbox
-- in 0062): papadata_app/papadata_test can append audit rows but never
-- read, update or delete them, which enforces "the original response stays
-- in the audit regardless of later edits" as a DB-level guarantee rather
-- than just an application convention. papadata_platform keeps
-- read/retention access for future compliance tooling.
GRANT INSERT ON app.company_lookup_audit TO papadata_app,papadata_test;
GRANT SELECT,UPDATE,DELETE ON app.company_lookup_audit TO papadata_platform;
INSERT INTO app.table_security_classification(table_name,scope_class,rationale) VALUES
 ('company_lookup_audit','global_internal','Append-only raw GUS/BIR responses from the pre-tenant/public company.lookup step; API can insert but not read back.')
ON CONFLICT(table_name) DO NOTHING;

-- app.access_company_profiles (0062) never actually stored the 'manual'
-- literal it was read back with -- access-lifecycle.service.ts hardcoded
-- source:'manual' on every read. Persist it for real so a save made from a
-- GUS/BIR lookup (source:'gus_bir') survives a page reload instead of
-- reverting to 'manual'.
ALTER TABLE app.access_company_profiles ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual' CHECK(source IN('manual','gus_bir'));

COMMIT;
