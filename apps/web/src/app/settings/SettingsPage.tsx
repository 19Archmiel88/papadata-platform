import { useCallback, useEffect, useState } from 'react';

import { useLocationPath } from '../../runtime/app/routing/navigation';
import { bffClient, BffProblem } from '../../runtime/shared/api/bffClient';
import { useAuthSessionRuntimeContext } from '../../runtime/shared/auth/authSessionRuntime';
import { SettingsGovernanceScreen } from '../../screens/settings-governance/SettingsGovernanceScreen';
import {
  loadSettingsMemberships,
  settingsInvitableRoles,
  type SettingsMembershipsView,
} from './settingsRuntimeAdapter';

type LoadState = {
  readonly view: SettingsMembershipsView | null;
  readonly loading: boolean;
  readonly problem: string | null;
};

const initialState: LoadState = { view: null, loading: true, problem: null };

export function SettingsPage() {
  const runtime = useAuthSessionRuntimeContext();
  const locationPath = useLocationPath();
  const [state, setState] = useState<LoadState>(initialState);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setState((current) => ({ ...current, loading: true, problem: null }));
    loadSettingsMemberships(bffClient)
      .then((view) => {
        if (active) setState({ view, loading: false, problem: null });
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const forbidden = cause instanceof BffProblem && cause.status === 403;
        setState({
          view: null,
          loading: false,
          problem: forbidden
            ? 'Twoja rola nie ma capability tenant.membership.read wymaganej do wyświetlenia zespołu.'
            : cause instanceof Error
              ? cause.message
              : 'Nie udało się wczytać członków zespołu.',
        });
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const reload = useCallback(() => setRefreshKey((key) => key + 1), []);

  const command = useCallback(
    <T,>(action: () => Promise<T>) => runtime.runAuthenticatedCommand(action, locationPath),
    [runtime, locationPath],
  );

  return (
    <SettingsGovernanceScreen
      membershipsRuntime={{
        mode: 'runtime',
        loading: state.loading,
        problem: state.problem,
        members: state.view?.members ?? [],
        invitations: state.view?.invitations ?? [],
        inviteRoles: settingsInvitableRoles,
        onInvite: async (email, role) => {
          await command(() => bffClient.inviteMember({ email, role }));
          reload();
        },
        onCancelInvite: async (invitationId) => {
          await command(() => bffClient.revokeInvitation(invitationId));
          reload();
        },
        onReload: reload,
      }}
    />
  );
}
