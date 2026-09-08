import { useCallback, useEffect, useState } from 'react';
import { useLocationPath } from '../../runtime/app/routing/navigation';
import { bffClient, BffProblem } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { SavedReportsScreen } from '../../screens/saved-reports/SavedReportsScreen';
import type {
  ReportCommand,
  ReportConfig,
  ReportsStore,
} from '../../screens/saved-reports/SavedReports.model';

const emptyStore: ReportsStore = { schema: 1, workspace: '', reports: [] };

type LoadState = {
  readonly data: ReportsStore | null;
  readonly loading: boolean;
  readonly error: string | null;
};

export function SavedReportsPage() {
  const runtime = useAuthSessionRuntimeContext();
  const locationPath = useLocationPath();
  const [state, setState] = useState<LoadState>({ data: null, loading: true, error: null });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    bffClient
      .readSavedReports()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const forbidden = cause instanceof BffProblem && cause.status === 403;
        setState({
          data: null,
          loading: false,
          error: forbidden
            ? 'Twoja rola nie ma capability reports.read wymaganej do wyświetlenia biblioteki raportów.'
            : cause instanceof Error
              ? cause.message
              : 'Nie udało się wczytać biblioteki raportów.',
        });
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const build = useCallback(
    (config: ReportConfig) =>
      runtime.runAuthenticatedCommand(() => bffClient.previewSavedReport(config), locationPath),
    [runtime, locationPath],
  );

  const onCommand = useCallback(
    (command: ReportCommand) =>
      runtime.runAuthenticatedCommand(() => bffClient.commandSavedReports(command), locationPath),
    [runtime, locationPath],
  );

  return (
    <SavedReportsScreen
      data={state.data ?? emptyStore}
      mode="live"
      persistenceKey={null}
      canManage
      state={state.loading ? 'loading' : state.error ? 'error' : 'ready'}
      errorMessage={state.error ?? undefined}
      onRetry={() => setRefreshKey((key) => key + 1)}
      build={build}
      onCommand={onCommand}
    />
  );
}
