BEGIN;
ALTER TABLE app.integration_connections ADD COLUMN IF NOT EXISTS credential_version integer NOT NULL DEFAULT 0 CHECK(credential_version>=0);
COMMIT;
