import type { Meta, StoryObj } from '@storybook/react-vite';

import { IntegrationLifecycleScreen } from '../../features/integrations';
import {
  integrationStoryFixtures,
  type IntegrationFixtureId,
} from '../../features/integrations/integrationFixtures';

type IntegrationStoryArgs = {
  fixtureId: IntegrationFixtureId;
  theme: 'light' | 'dark';
};

function IntegrationStory({ fixtureId, theme }: IntegrationStoryArgs) {
  return (
    <IntegrationLifecycleScreen
      fixture={integrationStoryFixtures[fixtureId]}
      theme={theme}
    />
  );
}

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Integracje i synchronizacja',
  component: IntegrationStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    fixtureId: {
      control: 'select',
      options: Object.keys(integrationStoryFixtures),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
  args: {
    fixtureId: 'provider_pilot',
    theme: 'dark',
  },
} satisfies Meta<typeof IntegrationStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ProviderNiedostepny: Story = {
  name: 'Provider niedostępny',
  args: { fixtureId: 'provider_unavailable' },
};

export const ProviderPilot: Story = {
  name: 'Provider dostępny w pilotażu',
  args: { fixtureId: 'provider_pilot' },
};

export const BrakCapability: Story = {
  name: 'Brak capability',
  args: { fixtureId: 'missing_capability' },
};

export const BrakEntitlement: Story = {
  name: 'Brak entitlement',
  args: { fixtureId: 'missing_entitlement' },
};

export const NotConnected: Story = {
  name: 'NOT_CONNECTED',
  args: { fixtureId: 'not_connected' },
};

export const Connecting: Story = {
  name: 'CONNECTING',
  args: { fixtureId: 'connecting' },
};

export const OAuthAnulowany: Story = {
  name: 'OAuth anulowany',
  args: { fixtureId: 'oauth_cancelled' },
};

export const CallbackError: Story = {
  name: 'Błąd callbacku',
  args: { fixtureId: 'callback_error' },
};

export const BlednyRedirect: Story = {
  name: 'Błędny redirect',
  args: { fixtureId: 'bad_redirect' },
};

export const PelnyScope: Story = {
  name: 'Pełny scope',
  args: { fixtureId: 'full_scope' },
};

export const OgraniczonyScope: Story = {
  name: 'Ograniczony scope',
  args: { fixtureId: 'limited_scope' },
};

export const Active: Story = {
  name: 'ACTIVE',
  args: { fixtureId: 'active' },
};

export const InitialSyncQueued: Story = {
  name: 'Synchronizacja początkowa w kolejce',
  args: { fixtureId: 'initial_sync_queued' },
};

export const InitialSyncRunning: Story = {
  name: 'Synchronizacja początkowa w toku',
  args: { fixtureId: 'initial_sync_running' },
};

export const InitialSyncPartial: Story = {
  name: 'Synchronizacja początkowa częściowa',
  args: { fixtureId: 'initial_sync_partial' },
};

export const InitialSyncFailed: Story = {
  name: 'Synchronizacja początkowa nieudana',
  args: { fixtureId: 'initial_sync_failed' },
};

export const NoData: Story = {
  name: 'Brak danych',
  args: { fixtureId: 'no_data' },
};

export const RateLimit: Story = {
  name: 'Limit żądań',
  args: { fixtureId: 'rate_limit' },
};

export const RetryWait: Story = {
  name: 'Oczekiwanie na retry',
  args: { fixtureId: 'retry_wait' },
};

export const ProviderOutage: Story = {
  name: 'Awaria providera',
  args: { fixtureId: 'provider_outage' },
};

export const SchemaMismatch: Story = {
  name: 'Niezgodność schematu',
  args: { fixtureId: 'schema_mismatch' },
};

export const CredentialExpired: Story = {
  name: 'Wygasłe poświadczenia',
  args: { fixtureId: 'credential_expired' },
};

export const ReauthRequired: Story = {
  name: 'REAUTH_REQUIRED',
  args: { fixtureId: 'reauth_required' },
};

export const ReconnectSuccess: Story = {
  name: 'Reconnect udany',
  args: { fixtureId: 'reconnect_success' },
};

export const ReconnectFailure: Story = {
  name: 'Reconnect nieudany',
  args: { fixtureId: 'reconnect_failure' },
};

export const ScopeIncreased: Story = {
  name: 'Scope zwiększony',
  args: { fixtureId: 'scope_increased' },
};

export const ScopeDecreased: Story = {
  name: 'Scope zmniejszony',
  args: { fixtureId: 'scope_decreased' },
};

export const Backfill: Story = {
  args: { fixtureId: 'backfill' },
};

export const DisconnectImpact: Story = {
  name: 'Wpływ rozłączenia',
  args: { fixtureId: 'disconnect_impact' },
};

export const RevokeFailure: Story = {
  name: 'Nieudane cofnięcie dostępu',
  args: { fixtureId: 'revoke_failure' },
};

export const DisabledConnection: Story = {
  name: 'Połączenie wyłączone',
  args: { fixtureId: 'disabled_connection' },
};

export const RecoverySuccess: Story = {
  name: 'Recovery udane',
  args: { fixtureId: 'recovery_success' },
};

export const RecoveryFailure: Story = {
  name: 'Recovery nieudane',
  args: { fixtureId: 'recovery_failure' },
};

export const Forbidden: Story = {
  name: 'Brak dostępu',
  args: { fixtureId: 'forbidden' },
};

export const ExpiredSession: Story = {
  name: 'Wygasła sesja',
  args: { fixtureId: 'expired_session' },
};

export const WorkspaceSwitchPodczasOperacji: Story = {
  name: 'Zmiana workspace podczas operacji',
  args: { fixtureId: 'workspace_switch_during_operation' },
};

export const JasnyMotyw: Story = {
  name: 'Jasny motyw',
  args: {
    fixtureId: 'active',
    theme: 'light',
  },
};
