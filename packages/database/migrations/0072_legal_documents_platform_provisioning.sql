begin;

-- app.legal_documents currently grants only SELECT to papadata_app (the
-- runtime role used by the API/BFF/worker) -- deliberate, per
-- LegalDocumentsController's own comment: publishing a new document version
-- is an operator/admin path, not a public one, so the running application
-- must never be able to write it. Provisioning a new legal document version
-- (see tools/provision-legal-documents.mjs) is an explicit, out-of-band
-- operator action, run with the same papadata_platform credential already
-- used for the retention/scheduling workers (see PlatformDatabase) -- never
-- the application's own runtime credential. app.legal_documents has no
-- tenant_id column and is not subject to any RLS policy, so this is a plain
-- grant, not a policy change.

grant select, insert, update on app.legal_documents to papadata_platform;

commit;
