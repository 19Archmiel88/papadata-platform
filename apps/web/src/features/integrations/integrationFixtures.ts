import { z } from 'zod';

import {
  applicationSessionContextSchema,
  asCorrelationId,
  asOperationId,
  domainContractVersion,
  operationStatusSchema,
  readinessSchema,
  type OperationStatus,
  type Readiness,
} from '../../domain-contracts';
import {
  integrationConnectionSchema,
  integrationProviderSchema,
  syncJobSchema,
  type IntegrationConnection,
  type SyncJob,
} from './integrationContracts';
import {
  createDefaultIntegrationContext,
  createWave2Runtime,
} from './localIntegrationRuntime';

const fixtureIds = [
  'provider_unavailable',
  'provider_pilot',
  'missing_capability',
  'missing_entitlement',
  'not_connected',
  'connecting',
  'oauth_cancelled',
  'callback_error',
  'bad_redirect',
  'full_scope',
  'limited_scope',
  'active',
  'initial_sync_queued',
  'initial_sync_running',
  'initial_sync_partial',
  'initial_sync_failed',
  'no_data',
  'rate_limit',
  'retry_wait',
  'provider_outage',
  'schema_mismatch',
  'credential_expired',
  'reauth_required',
  'reconnect_success',
  'reconnect_failure',
  'scope_increased',
  'scope_decreased',
  'backfill',
  'disconnect_impact',
  'revoke_failure',
  'disabled_connection',
  'recovery_success',
  'recovery_failure',
  'forbidden',
  'expired_session',
  'workspace_switch_during_operation',
] as const;

export const integrationFixtureIdSchema = z.enum(fixtureIds);
export type IntegrationFixtureId = z.infer<typeof integrationFixtureIdSchema>;

const integrationUiStateSchema = z.enum([
  'provider_unavailable',
  'provider_pilot',
  'forbidden',
  'not_connected',
  'connecting',
  'oauth_error',
  'scope_summary',
  'active',
  'sync_queued',
  'sync_running',
  'sync_partial',
  'sync_failed',
  'no_data',
  'retry_wait',
  'provider_outage',
  'schema_mismatch',
  'credential_expired',
  'reauth_required',
  'reconnect',
  'backfill',
  'disconnect',
  'disabled',
  'recovery',
  'expired_session',
  'workspace_switch',
]);

export const integrationStoryFixtureSchema = z.object({
  connection: integrationConnectionSchema.optional(),
  context: applicationSessionContextSchema,
  fixtureId: integrationFixtureIdSchema,
  impact: z.string().min(1),
  job: syncJobSchema.optional(),
  nextAction: z.string().min(1),
  operation: operationStatusSchema.optional(),
  provider: integrationProviderSchema,
  readiness: readinessSchema,
  title: z.string().min(1),
  uiState: integrationUiStateSchema,
});

export type IntegrationStoryFixture = z.infer<typeof integrationStoryFixtureSchema>;

function readiness(state: Readiness['state']): Readiness {
  const context = createDefaultIntegrationContext();

  return readinessSchema.parse({
    evaluatedAt: '2026-07-19T00:00:00.000Z',
    limitations:
      state === 'ready'
        ? []
        : ['Connection i source data nie promują automatycznie readiness KPI.'],
    scope: {
      currency: 'PLN',
      dataLayer: 'source',
      period: {
        from: '2026-07-01T00:00:00.000Z',
        to: '2026-07-19T00:00:00.000Z',
      },
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    },
    state,
  });
}

function operation(
  status: OperationStatus['status'],
  connection?: IntegrationConnection,
  job?: SyncJob,
): OperationStatus {
  const context = createDefaultIntegrationContext();

  return operationStatusSchema.parse({
    contractVersion: domainContractVersion,
    correlationId: asCorrelationId(`cor_fixture_${status}`),
    limitations: [],
    operationId: asOperationId(job ? `op_${job.id}` : 'op_integration_fixture'),
    readiness: readiness(status === 'succeeded' ? 'ready' : 'processing'),
    status,
    tenantId: connection?.tenantId ?? context.tenant.tenantId,
    workspaceId: connection?.workspaceId ?? context.activeWorkspace.workspaceId,
  });
}

function integrationContext(kind: 'default' | 'no_capability' | 'no_entitlement' | 'expired') {
  const context = createDefaultIntegrationContext();

  if (kind === 'no_capability') {
    return applicationSessionContextSchema.parse({
      ...context,
      capabilities: context.capabilities.filter(
        (capability) => capability !== 'integration:connect',
      ),
    });
  }

  if (kind === 'no_entitlement') {
    return applicationSessionContextSchema.parse({
      ...context,
      entitlements: context.entitlements.filter(
        (entitlement) => entitlement.capability !== 'integrations:commerce',
      ),
    });
  }

  if (kind === 'expired') {
    return applicationSessionContextSchema.parse({
      ...context,
      featureFlags: {
        ...context.featureFlags,
        expiredSession: true,
      },
    });
  }

  return context;
}

function baseFlow() {
  const runtime = createWave2Runtime({ testMode: true });
  const context = integrationContext('default');
  const provider = runtime.listProviders().find((item) => item.providerId === 'woocommerce');

  if (!provider) {
    throw new Error('REFERENCE_PROVIDER_MISSING');
  }

  const { connection } = runtime.createConnection(context, {
    externalAccountRef: 'woo_account_northstar',
    grantedScopes: ['orders:read', 'products:read', 'refunds:read'],
    idempotencyKey: 'idem_fixture_connect',
    providerId: provider.providerId,
    requestedScopes: ['orders:read', 'products:read', 'refunds:read'],
  });
  const { job } = runtime.createSyncJob(context, {
    connectionId: connection.id,
    idempotencyKey: 'idem_fixture_initial',
    range: {
      from: '2026-07-01T00:00:00.000Z',
      mode: 'bounded',
      to: '2026-07-19T00:00:00.000Z',
    },
    streams: ['orders', 'products', 'refunds'],
    type: 'INITIAL',
  });

  return {
    connection,
    context,
    job,
    provider,
    runtime,
  };
}

function mutateConnection(
  connection: IntegrationConnection,
  patch: Partial<IntegrationConnection>,
): IntegrationConnection {
  return integrationConnectionSchema.parse({
    ...connection,
    ...patch,
  });
}

function mutateJob(job: SyncJob, patch: Partial<SyncJob>): SyncJob {
  return syncJobSchema.parse({
    ...job,
    ...patch,
  });
}

function fixture(input: IntegrationStoryFixture): IntegrationStoryFixture {
  return integrationStoryFixtureSchema.parse(input);
}

function makeFixture(
  fixtureId: IntegrationFixtureId,
  input: Omit<IntegrationStoryFixture, 'fixtureId'>,
): IntegrationStoryFixture {
  return fixture({
    fixtureId,
    ...input,
  });
}

const base = baseFlow();
const disabledProvider = base.runtime
  .listProviders()
  .find((provider) => provider.providerId === 'shopify');

if (!disabledProvider) {
  throw new Error('DISABLED_PROVIDER_MISSING');
}

const limitedConnection = mutateConnection(base.connection, {
  grantedScopes: ['orders:read'],
  lastScopeDiff: {
    granted: ['orders:read'],
    missingOptional: ['products:read', 'refunds:read'],
    missingRequired: [],
    newlyGranted: ['orders:read'],
    removed: [],
    requested: ['orders:read', 'products:read', 'refunds:read'],
  },
  status: 'LIMITED_ACCESS',
});

const failedJob = mutateJob(base.job, {
  errorClass: 'TRANSIENT',
  finishedAt: '2026-07-19T00:00:00.000Z',
  status: 'FAILED',
});

const retryJob = mutateJob(base.job, {
  errorClass: 'RATE_LIMIT',
  status: 'RETRY_WAIT',
});

export const integrationStoryFixtures = {
  active: makeFixture('active', {
    connection: base.connection,
    context: base.context,
    impact: 'Connection jest aktywne, ale dane source nadal wymagają sync.',
    nextAction: 'Uruchom initial sync.',
    operation: operation('succeeded', base.connection),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Aktywne connection',
    uiState: 'active',
  }),
  backfill: makeFixture('backfill', {
    connection: base.connection,
    context: base.context,
    impact: 'Backfill ma osobny budżet i nie blokuje incremental sync.',
    job: mutateJob(base.job, { type: 'BACKFILL' }),
    nextAction: 'Monitoruj koszt i progress backfillu.',
    operation: operation('processing', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Backfill',
    uiState: 'backfill',
  }),
  bad_redirect: makeFixture('bad_redirect', {
    context: base.context,
    impact: 'Redirect nie spełnia polityki callbacku.',
    nextAction: 'Rozpocznij connect ponownie z poprawnym redirect URI.',
    operation: operation('failed'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Błędny redirect',
    uiState: 'oauth_error',
  }),
  callback_error: makeFixture('callback_error', {
    context: base.context,
    impact: 'Callback zwrócił klasę AUTH i connection nie zostanie utworzone.',
    nextAction: 'Wróć do wyboru konta.',
    operation: operation('failed'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Callback error',
    uiState: 'oauth_error',
  }),
  connecting: makeFixture('connecting', {
    connection: mutateConnection(base.connection, { status: 'CONNECTING' }),
    context: base.context,
    impact: 'Trwa wymiana tokenu na write-only credential.',
    nextAction: 'Poczekaj na walidację callbacku.',
    operation: operation('processing', base.connection),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'CONNECTING',
    uiState: 'connecting',
  }),
  credential_expired: makeFixture('credential_expired', {
    connection: mutateConnection(base.connection, {
      expiresAt: '2026-07-18T00:00:00.000Z',
      status: 'REAUTH_REQUIRED',
    }),
    context: base.context,
    impact: 'Nowe joby są zatrzymane do czasu reconnect.',
    nextAction: 'Wykonaj reauthorization.',
    operation: operation('waiting_for_user', base.connection),
    provider: base.provider,
    readiness: readiness('resync_required'),
    title: 'Credential expired',
    uiState: 'credential_expired',
  }),
  disabled_connection: makeFixture('disabled_connection', {
    connection: mutateConnection(base.connection, { status: 'DISABLED' }),
    context: base.context,
    impact: 'Scheduling i nowe joby są zatrzymane.',
    nextAction: 'Włącz connection dopiero po analizie wpływu.',
    operation: operation('cancelled', base.connection),
    provider: base.provider,
    readiness: readiness('stale'),
    title: 'Disabled connection',
    uiState: 'disabled',
  }),
  disconnect_impact: makeFixture('disconnect_impact', {
    connection: base.connection,
    context: base.context,
    impact: 'Disconnect zatrzyma scheduling, cofnie credential i zachowa historię zgodnie z retencją.',
    nextAction: 'Potwierdź reauthentication i wpływ.',
    operation: operation('waiting_for_user', base.connection),
    provider: base.provider,
    readiness: readiness('stale'),
    title: 'Disconnect impact',
    uiState: 'disconnect',
  }),
  expired_session: makeFixture('expired_session', {
    context: integrationContext('expired'),
    impact: 'Operacja wymaga świeżej sesji.',
    nextAction: 'Zaloguj się ponownie.',
    operation: operation('expired'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Expired session',
    uiState: 'expired_session',
  }),
  forbidden: makeFixture('forbidden', {
    context: integrationContext('no_capability'),
    impact: 'Użytkownik nie posiada capability dla tego workspace.',
    nextAction: 'Poproś administratora o rolę lub wybierz inny workspace.',
    operation: operation('blocked'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Forbidden',
    uiState: 'forbidden',
  }),
  full_scope: makeFixture('full_scope', {
    connection: base.connection,
    context: base.context,
    impact: 'Requested i granted scopes są zgodne z polityką.',
    nextAction: 'Zapisz credential i rozpocznij initial sync.',
    operation: operation('succeeded', base.connection),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Pełny scope',
    uiState: 'scope_summary',
  }),
  initial_sync_failed: makeFixture('initial_sync_failed', {
    connection: mutateConnection(base.connection, { status: 'ERROR' }),
    context: base.context,
    impact: 'Job zakończył się błędem i wymaga retry albo DLQ replay.',
    job: failedJob,
    nextAction: 'Sprawdź retry matrix.',
    operation: operation('failed', base.connection, failedJob),
    provider: base.provider,
    readiness: readiness('invalid'),
    title: 'Initial sync failed',
    uiState: 'sync_failed',
  }),
  initial_sync_partial: makeFixture('initial_sync_partial', {
    connection: limitedConnection,
    context: base.context,
    impact: 'Niezależne streamy mogą kontynuować mimo lokalnego issue.',
    job: mutateJob(base.job, {
      errorClass: 'VALIDATION_DATA',
      status: 'PARTIAL_SUCCESS',
    }),
    nextAction: 'Przejrzyj kwarantannę i DataIssue.',
    operation: operation('partial', limitedConnection, base.job),
    provider: base.provider,
    readiness: readiness('partial'),
    title: 'Initial sync partial',
    uiState: 'sync_partial',
  }),
  initial_sync_queued: makeFixture('initial_sync_queued', {
    connection: base.connection,
    context: base.context,
    impact: 'Job czeka na concurrency slot.',
    job: base.job,
    nextAction: 'Poczekaj na worker.',
    operation: operation('queued', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Initial sync queued',
    uiState: 'sync_queued',
  }),
  initial_sync_running: makeFixture('initial_sync_running', {
    connection: mutateConnection(base.connection, { status: 'SYNCING' }),
    context: base.context,
    impact: 'Worker zapisuje source batch przed checkpointem.',
    job: mutateJob(base.job, { status: 'RUNNING' }),
    nextAction: 'Monitoruj progress i rate limits.',
    operation: operation('processing', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Initial sync running',
    uiState: 'sync_running',
  }),
  limited_scope: makeFixture('limited_scope', {
    connection: limitedConnection,
    context: base.context,
    impact: 'Brakuje optional scopes, więc część analiz będzie ograniczona.',
    nextAction: 'Wykonaj reconnect tylko po świadomej zgodzie.',
    operation: operation('partial', limitedConnection),
    provider: base.provider,
    readiness: readiness('partial'),
    title: 'Ograniczony scope',
    uiState: 'scope_summary',
  }),
  missing_capability: makeFixture('missing_capability', {
    context: integrationContext('no_capability'),
    impact: 'Provider nie jest dostępny bez capability integration:connect.',
    nextAction: 'Poproś o zmianę roli.',
    operation: operation('blocked'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Brak capability',
    uiState: 'forbidden',
  }),
  missing_entitlement: makeFixture('missing_entitlement', {
    context: integrationContext('no_entitlement'),
    impact: 'Plan nie zawiera entitlementu commerce integrations.',
    nextAction: 'Sprawdź billing lub plan workspace.',
    operation: operation('blocked'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Brak entitlement',
    uiState: 'forbidden',
  }),
  no_data: makeFixture('no_data', {
    connection: base.connection,
    context: base.context,
    impact: 'Brak danych źródłowych nie jest zerem ani gotowym KPI.',
    nextAction: 'Uruchom initial sync lub sprawdź zakres czasu.',
    operation: operation('succeeded', base.connection),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'No data',
    uiState: 'no_data',
  }),
  not_connected: makeFixture('not_connected', {
    context: base.context,
    impact: 'Provider w katalogu nie oznacza gotowego connection.',
    nextAction: 'Rozpocznij connect i wybierz konto.',
    operation: operation('requested'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'NOT_CONNECTED',
    uiState: 'not_connected',
  }),
  oauth_cancelled: makeFixture('oauth_cancelled', {
    context: base.context,
    impact: 'Użytkownik anulował OAuth, credential nie powstał.',
    nextAction: 'Możesz bezpiecznie rozpocząć connect ponownie.',
    operation: operation('cancelled'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'OAuth anulowany',
    uiState: 'oauth_error',
  }),
  provider_outage: makeFixture('provider_outage', {
    connection: mutateConnection(base.connection, { status: 'ERROR' }),
    context: base.context,
    impact: 'Awaria WooCommerce nie blokuje innych providerów ani workspace.',
    job: failedJob,
    nextAction: 'Zastosuj retry matrix i alert provider outage.',
    operation: operation('failed', base.connection, failedJob),
    provider: base.provider,
    readiness: readiness('delayed'),
    title: 'Provider outage',
    uiState: 'provider_outage',
  }),
  provider_pilot: makeFixture('provider_pilot', {
    context: base.context,
    impact: 'WooCommerce jest dostępny tylko jako pilot_ready.',
    nextAction: 'Użyj pilotażowego flow z audytem.',
    operation: operation('requested'),
    provider: base.provider,
    readiness: readiness('no_data'),
    title: 'Provider dostępny w pilotażu',
    uiState: 'provider_pilot',
  }),
  provider_unavailable: makeFixture('provider_unavailable', {
    context: base.context,
    impact: 'Provider jest w katalogu MVP, ale bez zweryfikowanego adaptera.',
    nextAction: 'Nie pokazuj go jako dostępnego runtime.',
    operation: operation('blocked'),
    provider: disabledProvider,
    readiness: readiness('no_data'),
    title: 'Provider niedostępny',
    uiState: 'provider_unavailable',
  }),
  rate_limit: makeFixture('rate_limit', {
    connection: mutateConnection(base.connection, { status: 'RETRY_WAIT' }),
    context: base.context,
    impact: 'Retry respektuje retryAfter i jitter.',
    job: retryJob,
    nextAction: 'Poczekaj bez agresywnego pollingu.',
    operation: operation('retrying', base.connection, retryJob),
    provider: base.provider,
    readiness: readiness('delayed'),
    title: 'Rate limit',
    uiState: 'retry_wait',
  }),
  reauth_required: makeFixture('reauth_required', {
    connection: mutateConnection(base.connection, { status: 'REAUTH_REQUIRED' }),
    context: base.context,
    impact: 'Historia zostaje zachowana, nowe joby czekają na reconnect.',
    nextAction: 'Przeprowadź reauthorization.',
    operation: operation('waiting_for_user', base.connection),
    provider: base.provider,
    readiness: readiness('resync_required'),
    title: 'REAUTH_REQUIRED',
    uiState: 'reauth_required',
  }),
  reconnect_failure: makeFixture('reconnect_failure', {
    connection: mutateConnection(base.connection, { status: 'ERROR' }),
    context: base.context,
    impact: 'Reconnect nie może przepiąć istniejącej historii na inne konto.',
    nextAction: 'Utwórz nowe connection dla innego konta.',
    operation: operation('failed', base.connection),
    provider: base.provider,
    readiness: readiness('invalid'),
    title: 'Reconnect failure',
    uiState: 'reconnect',
  }),
  reconnect_success: makeFixture('reconnect_success', {
    connection: base.connection,
    context: base.context,
    impact: 'Scopes i zasób zewnętrzny zostały ponownie zweryfikowane.',
    nextAction: 'Uruchom catch-up po luce czasowej.',
    operation: operation('succeeded', base.connection),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Reconnect success',
    uiState: 'reconnect',
  }),
  recovery_failure: makeFixture('recovery_failure', {
    connection: base.connection,
    context: base.context,
    impact: 'Recovery trafił do DLQ i wymaga manual replay.',
    job: mutateJob(base.job, { status: 'DLQ' }),
    nextAction: 'Podaj reason i ticket do replay.',
    operation: operation('recovery_required', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('invalid'),
    title: 'Recovery failure',
    uiState: 'recovery',
  }),
  recovery_success: makeFixture('recovery_success', {
    connection: base.connection,
    context: base.context,
    impact: 'Worker wznowił od ostatniego potwierdzonego checkpointu.',
    job: mutateJob(base.job, { status: 'SUCCESS' }),
    nextAction: 'Zweryfikuj source counts i outbox.',
    operation: operation('succeeded', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Recovery success',
    uiState: 'recovery',
  }),
  retry_wait: makeFixture('retry_wait', {
    connection: mutateConnection(base.connection, { status: 'RETRY_WAIT' }),
    context: base.context,
    impact: 'Job czeka na retry budget i backoff.',
    job: retryJob,
    nextAction: 'Nie uruchamiaj duplikatu komendy.',
    operation: operation('retrying', base.connection, retryJob),
    provider: base.provider,
    readiness: readiness('delayed'),
    title: 'Retry wait',
    uiState: 'retry_wait',
  }),
  revoke_failure: makeFixture('revoke_failure', {
    connection: mutateConnection(base.connection, { status: 'ERROR' }),
    context: base.context,
    impact: 'Provider revoke zakończył disconnect częściowym błędem.',
    nextAction: 'Nie raportuj sukcesu, powtórz po recovery.',
    operation: operation('partial', base.connection),
    provider: base.provider,
    readiness: readiness('stale'),
    title: 'Revoke failure',
    uiState: 'disconnect',
  }),
  schema_mismatch: makeFixture('schema_mismatch', {
    connection: mutateConnection(base.connection, { status: 'ERROR' }),
    context: base.context,
    impact: 'Payload trafia do kwarantanny, checkpoint nie pomija błędnego zakresu bez polityki.',
    job: mutateJob(base.job, {
      errorClass: 'SCHEMA_MISMATCH',
      status: 'FAILED',
    }),
    nextAction: 'Wymagany adapter review.',
    operation: operation('failed', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('conflicting'),
    title: 'Schema mismatch',
    uiState: 'schema_mismatch',
  }),
  scope_decreased: makeFixture('scope_decreased', {
    connection: limitedConnection,
    context: base.context,
    impact: 'Zmniejszenie scopes aktualizuje wpływ na dane i KPI.',
    nextAction: 'Pokaż ograniczenia i nie ukrywaj częściowych danych.',
    operation: operation('partial', limitedConnection),
    provider: base.provider,
    readiness: readiness('partial'),
    title: 'Scope decreased',
    uiState: 'scope_summary',
  }),
  scope_increased: makeFixture('scope_increased', {
    connection: base.connection,
    context: base.context,
    impact: 'Zwiększenie scopes wymaga capability, reauth, potwierdzenia i audytu.',
    nextAction: 'Potwierdź zwiększenie scope.',
    operation: operation('waiting_for_user', base.connection),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Scope increased',
    uiState: 'scope_summary',
  }),
  workspace_switch_during_operation: makeFixture('workspace_switch_during_operation', {
    connection: mutateConnection(base.connection, { status: 'SYNCING' }),
    context: base.context,
    impact: 'Spóźniona odpowiedź poprzedniego workspace jest odrzucana.',
    job: mutateJob(base.job, { status: 'RUNNING' }),
    nextAction: 'Wyczyść stan zależny od workspace.',
    operation: operation('processing', base.connection, base.job),
    provider: base.provider,
    readiness: readiness('processing'),
    title: 'Workspace switch podczas operacji',
    uiState: 'workspace_switch',
  }),
} satisfies Record<IntegrationFixtureId, IntegrationStoryFixture>;

export function validateIntegrationStoryFixtures(
  fixtures: Record<IntegrationFixtureId, IntegrationStoryFixture> = integrationStoryFixtures,
): readonly IntegrationStoryFixture[] {
  return fixtureIds.map((fixtureId) => integrationStoryFixtureSchema.parse(fixtures[fixtureId]));
}
