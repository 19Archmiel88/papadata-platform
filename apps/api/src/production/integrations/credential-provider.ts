import { IntegrationCredentialRepository, ProductionDatabase } from "@papadata/database";
import {
  ScopedCredentialProvider,
  SecretManagerCredentialSecretStore,
  type CredentialProvider,
} from "@papadata/integrations";

export const INTEGRATION_CREDENTIAL_PROVIDER = Symbol("INTEGRATION_CREDENTIAL_PROVIDER");

export function createIntegrationCredentialProvider(
  database: ProductionDatabase,
): CredentialProvider {
  return new ScopedCredentialProvider({
    metadataReader: new IntegrationCredentialRepository(database),
    secretStore: new SecretManagerCredentialSecretStore(),
  });
}
