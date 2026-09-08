import {
  useEffect,
  useState,
} from 'react';

import {
  CommandCenterScreen,
} from '../../screens/command-center/CommandCenterScreen';
import type {
  CommandCenterScreenData,
} from '../../screens/command-center/CommandCenterScreen.model';
import {
  bffClient,
} from '../../runtime/shared/api/bffClient';
import {
  useShellDateRange,
} from '../../runtime/shell/app-shell/ShellDateRangeContext';
import {
  loadCommandCenterRuntimeData,
} from './commandCenterRuntimeAdapter';

type RuntimeState = {
  readonly data: CommandCenterScreenData | null;
  readonly viewState: 'error' | 'loading' | 'ready';
};

const initialState: RuntimeState = {
  data: null,
  viewState: 'loading',
};

export function CommandCenterPage() {
  const { dateRange, dateRangeKey } = useShellDateRange();
  const [state, setState] = useState<RuntimeState>(initialState);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState(initialState);

    loadCommandCenterRuntimeData(bffClient, dateRange)
      .then((data) => {
        if (!active) return;
        setState({ data, viewState: 'ready' });
      })
      .catch(() => {
        if (!active) return;
        setState({ data: null, viewState: 'error' });
      });

    return () => {
      active = false;
    };
  }, [dateRangeKey, refreshKey]);

  return (
    <CommandCenterScreen
      data={state.data}
      state={state.viewState}
      onRetry={() => setRefreshKey((current) => current + 1)}
    />
  );
}
