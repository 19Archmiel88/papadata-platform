import type { BffClient } from '../../runtime/shared/api/bffClient';
import type {
  IntegrationCatalogRuntime,
  IntegrationCompletenessRuntime,
  IntegrationLogsRuntime,
  IntegrationRuntimeStatus,
  IntegrationsRuntimeView,
} from '../../runtime/integrations/integrationsData';

// The four production endpoints (apps/api's IntegrationController) return
// the exact view-model shapes defined in integrationsData.ts -- the backend
// (integration-runtime.ts) was modeled directly off this frontend contract,
// field for field, so no client-side transform is needed here. If that ever
// drifts, the generic type parameters below make tsc catch it.
export async function loadIntegrationsRuntimeView(client: BffClient): Promise<IntegrationsRuntimeView> {
  const [status, catalog, logs, completeness] = await Promise.all([
    client.readIntegrationsStatus<IntegrationRuntimeStatus>(),
    client.readIntegrationsCatalog<IntegrationCatalogRuntime>(),
    client.readIntegrationsLogs<IntegrationLogsRuntime>(),
    client.readIntegrationsCompleteness<IntegrationCompletenessRuntime>(),
  ]);
  return { status, catalog, logs, completeness, demo: false };
}
