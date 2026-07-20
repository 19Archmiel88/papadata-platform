import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  DatabaseZap,
  KeyRound,
  RotateCw,
} from 'lucide-react';
import { useState } from 'react';

import '../../design-system/foundations/papadata-brand-surface.css';
import { asDataIssueId } from '../../domain-contracts';
import {
  PermissionBoundary,
  SessionContextProvider,
} from '../../shell';
import {
  DataIssuePanel,
  OperationTracker,
  ReadinessBanner,
  StandardErrorState,
  WorkspaceContextBar,
} from '../../shared/patterns';
import { Button, Surface } from '../../shared/ui';
import { integrationCapabilities } from './integrationContracts';
import {
  integrationStoryFixtures,
  type IntegrationFixtureId,
  type IntegrationStoryFixture,
} from './integrationFixtures';

type IntegrationLifecycleScreenProps = {
  fixture?: IntegrationStoryFixture;
  fixtureId?: IntegrationFixtureId;
  theme?: 'light' | 'dark';
};

const grid = {
  display: 'grid',
  gap: '1rem',
} as const;

const cluster = {
  alignItems: 'center',
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.6rem',
} as const;

const muted = {
  color: 'var(--pds-color-text-muted, #8f98aa)',
  margin: 0,
} as const;

const pill = {
  border: '1px solid var(--pds-color-border, rgba(148, 163, 184, 0.28))',
  borderRadius: '999px',
  color: 'var(--pds-color-text-muted, #8f98aa)',
  fontSize: '0.82rem',
  padding: '0.25rem 0.55rem',
} as const;

function StatusIcon({ state }: { state: IntegrationStoryFixture['uiState'] }) {
  if (
    state === 'active' ||
    state === 'provider_pilot' ||
    state === 'scope_summary' ||
    state === 'reconnect' ||
    state === 'recovery'
  ) {
    return <CheckCircle2 aria-hidden="true" size={18} />;
  }

  if (
    state === 'sync_failed' ||
    state === 'schema_mismatch' ||
    state === 'provider_outage' ||
    state === 'forbidden'
  ) {
    return <AlertTriangle aria-hidden="true" size={18} />;
  }

  if (state === 'connecting' || state === 'retry_wait' || state === 'sync_running') {
    return <RotateCw aria-hidden="true" size={18} />;
  }

  return <Cable aria-hidden="true" size={18} />;
}

export function IntegrationLifecycleContent({
  fixture,
}: {
  fixture: IntegrationStoryFixture;
}) {
  const [lastCommand, setLastCommand] = useState('Brak wykonanej komendy.');
  const connection = fixture.connection;
  const job = fixture.job;

  const runCommand = (label: string) => {
    setLastCommand(`${label}: przyjęto lokalną komendę dla ${fixture.title}.`);
  };

  return (
    <div style={{ ...grid, margin: '0 auto', maxWidth: '1180px' }}>
      <WorkspaceContextBar context={fixture.context} />

      <section
        aria-labelledby="integrations-title"
        style={{
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 24rem), 1fr))',
        }}
      >
        <div style={grid}>
          <Surface style={{ ...grid, padding: '1.25rem' }}>
            <span style={{ color: 'var(--pds-color-accent, #5ea2ff)', fontWeight: 700 }}>
              Integracje i synchronizacja
            </span>
            <h1 id="integrations-title" style={{ fontSize: '2rem', margin: 0 }}>
              {fixture.title}
            </h1>
            <p style={muted}>{fixture.provider.name}</p>
            <div style={cluster}>
              <span style={pill}>{fixture.provider.runtimeAvailability}</span>
              <span style={pill}>{fixture.provider.adapterStatus}</span>
              <span style={pill}>{fixture.provider.operationalReadiness}</span>
            </div>
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <StatusIcon state={fixture.uiState} />
              <strong>Status i wpływ</strong>
            </span>
            <p style={{ margin: 0 }}>{fixture.impact}</p>
            <p style={muted}>{fixture.nextAction}</p>
          </Surface>

          {fixture.operation ? <OperationTracker operation={fixture.operation} /> : null}
          <ReadinessBanner readiness={fixture.readiness} />

          {fixture.uiState === 'forbidden' ? (
            <StandardErrorState title="Brak dostępu do operacji integracji" />
          ) : null}

          {fixture.uiState === 'schema_mismatch' ? (
            <DataIssuePanel
              issues={[
                {
                  issueId: asDataIssueId('iss_schema_mismatch'),
                  message: 'Payload providera trafił do kwarantanny.',
                  severity: 'blocking',
                  tenantId: fixture.context.tenant.tenantId,
                  workspaceId: fixture.context.activeWorkspace.workspaceId,
                },
              ]}
            />
          ) : null}
        </div>

        <aside style={grid}>
          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <KeyRound aria-hidden="true" size={18} />
              <strong>Connection</strong>
            </span>
            {connection ? (
              <>
                <span style={pill}>{connection.status}</span>
                <p style={muted}>ID: {connection.id}</p>
                <p style={muted}>Credential: write-only reference {connection.credentialRef}</p>
                <p style={muted}>
                  Granted scopes: {connection.grantedScopes.length > 0
                    ? connection.grantedScopes.join(', ')
                    : 'brak'}
                </p>
              </>
            ) : (
              <p style={muted}>Connection nie zostało jeszcze utworzone.</p>
            )}
          </Surface>

          <Surface style={{ ...grid, padding: '1rem' }}>
            <span style={cluster}>
              <DatabaseZap aria-hidden="true" size={18} />
              <strong>Sync job</strong>
            </span>
            {job ? (
              <>
                <span style={pill}>{job.status}</span>
                <p style={muted}>Job: {job.id}</p>
                <p style={muted}>
                  Progress: {job.progress.recordsStored}/{job.progress.recordsFetched}
                </p>
              </>
            ) : (
              <p style={muted}>Brak aktywnego joba.</p>
            )}
          </Surface>

          <PermissionBoundary
            capability={integrationCapabilities.connect}
            explanation="Connect wymaga capability w aktywnym workspace."
            mode="explain"
          >
            <div style={{ ...grid, gridTemplateColumns: 'repeat(auto-fit, minmax(10rem, 1fr))' }}>
              <Button onClick={() => runCommand('Connect')} variant="primary">
                Connect
              </Button>
              <Button onClick={() => runCommand('Sync')} variant="secondary">
                Sync
              </Button>
              <Button onClick={() => runCommand('Reconnect')} variant="secondary">
                Reconnect
              </Button>
              <Button onClick={() => runCommand('Disconnect')} variant="danger">
                Disconnect
              </Button>
            </div>
          </PermissionBoundary>

          <Surface aria-live="polite" style={{ padding: '1rem' }}>
            <p style={muted}>{lastCommand}</p>
          </Surface>
        </aside>
      </section>
    </div>
  );
}

export function IntegrationLifecycleScreen({
  fixture,
  fixtureId = 'provider_pilot',
  theme = 'dark',
}: IntegrationLifecycleScreenProps) {
  const resolvedFixture = fixture ?? integrationStoryFixtures[fixtureId];

  return (
    <main
      className="pds-brand-surface pds-foundation-stage"
      data-theme={theme}
      lang="pl"
      style={{ minHeight: '100vh', padding: '1.25rem' }}
    >
      <SessionContextProvider initialContext={resolvedFixture.context}>
        <IntegrationLifecycleContent fixture={resolvedFixture} />
      </SessionContextProvider>
    </main>
  );
}
