import { useCallback, useEffect, useState } from 'react';
import { useLocationPath } from '../../runtime/app/routing/navigation';
import { bffClient, BffProblem } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { IntegrationsWorkspace } from '../../runtime/integrations/IntegrationsWorkspace';
import type {
  IntegrationProviderTestResult,
  IntegrationsRuntimeView,
} from '../../runtime/integrations/integrationsData';
import { loadIntegrationsRuntimeView } from './integrationsRuntimeAdapter';

type LoadState = {
  readonly runtime: IntegrationsRuntimeView | null;
  readonly loading: boolean;
  readonly problem: string | null;
};

export function IntegrationsPage() {
  const runtime = useAuthSessionRuntimeContext();
  const locationPath = useLocationPath();
  const [state, setState] = useState<LoadState>({ runtime: null, loading: true, problem: null });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, problem: null }));
    loadIntegrationsRuntimeView(bffClient)
      .then((view) => {
        if (active) setState({ runtime: view, loading: false, problem: null });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const forbidden = cause instanceof BffProblem && cause.status === 403;
        setState({
          runtime: null,
          loading: false,
          problem: forbidden
            ? 'Twoja rola nie ma capability integrations.connection.read wymaganej do wyświetlenia integracji.'
            : cause instanceof Error
              ? cause.message
              : 'Nie udało się wczytać integracji.',
        });
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const reload = () => setRefreshKey((key) => key + 1);

  const command = useCallback(
    <T,>(action: () => Promise<T>) => runtime.runAuthenticatedCommand(action, locationPath),
    [runtime, locationPath],
  );

  return (
    <IntegrationsWorkspace
      mode="runtime"
      loading={state.loading}
      problem={state.problem}
      runtime={state.runtime}
      path={locationPath}
      onReload={reload}
      onCreateConnection={async (provider, input) => {
        await command(() =>
          bffClient.createIntegrationConnection({
            providerId: provider.provider,
            credentialReference: input.credentialReference,
            requestedScopes: input.requestedScopes,
          }),
        );
        reload();
      }}
      onDisconnectConnection={async (source) => {
        await command(() => bffClient.disconnectIntegrationConnection(source.integrationId));
        reload();
      }}
      onProviderTest={async (provider, input) => {
        const result = await command(() => bffClient.testIntegrationProvider(provider.provider, input));
        // testIntegrationProvider's return type is a generic BFF passthrough
        // (Readonly<Record<string, unknown>>) -- the API's provider-test
        // response shape matches IntegrationProviderTestResult field for
        // field (same contract the ConnectWizard mock in Storybook models).
        return result as unknown as IntegrationProviderTestResult;
      }}
      onSourceCommand={async (source, actionId) => {
        if (actionId === 'sync') {
          await command(() =>
            bffClient.startIntegrationSync({
              connectionId: source.integrationId,
              providerId: source.provider,
              streams: source.selectedStreams,
            }),
          );
          reload();
          return;
        }
        if (actionId === 'backfill') {
          await command(() =>
            bffClient.startIntegrationBackfill({
              connectionId: source.integrationId,
              providerId: source.provider,
              streams: source.selectedStreams,
            }),
          );
          reload();
          return;
        }
        // 'reauth' opens the reconnect wizard locally (IntegrationsWorkspace's
        // own state, before this handler even runs); 'fix' and 'plan' are
        // navigation cues with no dedicated backend operation. Nothing to
        // call for any of the three.
      }}
    />
  );
}
