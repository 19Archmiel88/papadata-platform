import {
  asAuditEventId,
  asCapability,
  asCorrelationId,
  asOperationId,
  auditEventSchema,
  domainContractVersion,
  operationStatusSchema,
  type ApplicationSessionContext,
  type AuditEvent,
  type Capability,
  type OperationId,
  type OperationStatus,
} from '../../domain-contracts';
import { createApplicationSessionContext } from '../../shell';
import {
  asCheckpointId,
  asConnectionId,
  asCredentialRef,
  asIntegrationSourceRecordId,
  asOutboxEventId,
  asProviderId,
  asSourceBatchId,
  asSyncJobId,
  asWebhookEventId,
  calculateScopeDiff,
  canTransitionConnection,
  createCommandFingerprint,
  createDeterministicHash,
  credentialMetadataSchema,
  integrationCapabilities,
  integrationApiRoutes,
  integrationCommandResponseSchema,
  integrationConnectionSchema,
  integrationContractVersion,
  integrationPolicyVersion,
  integrationProviderSchema,
  outboxEventSchema,
  retryDecisionForError,
  scopePolicySchema,
  sourceBatchSchema,
  sourceRecordSchema,
  syncCheckpointSchema,
  syncJobSchema,
  transitionConnection,
  transitionJob,
  type CredentialMetadata,
  type CredentialRef,
  type IntegrationCommandResponse,
  type IntegrationConnection,
  type IntegrationConnectionId,
  type IntegrationConnectionStatus,
  type IntegrationErrorClass,
  type IntegrationProvider,
  type IntegrationProviderId,
  type IntegrationWebhookEnvelope,
  type OutboxEvent,
  type SafeIntegrationError,
  type ScopeDiff,
  type ScopePolicy,
  type SourceBatch,
  type SourceRecord,
  type SyncCheckpoint,
  type SyncJob,
  type SyncJobId,
  type SyncJobType,
  type SyncRange,
} from './integrationContracts';

type ProviderRecord = {
  provider: IntegrationProvider;
  scopePolicy: ScopePolicy;
};

type AdapterAccount = {
  externalAccountRef: string;
  name: string;
  resources: readonly {
    channels: readonly string[];
    externalResourceRef: string;
    name: string;
  }[];
};

type AdapterPageItem = {
  externalId: string;
  providerEventTime: string;
  providerRevision: string;
  payload: Record<string, string | number | boolean>;
};

type AdapterPage = {
  cursor: string | null;
  hasMore: boolean;
  items: readonly AdapterPageItem[];
  providerRequestId: string;
  rateLimit: {
    remaining: number;
    retryAfterSeconds: number | null;
  };
  watermark: string | null;
};

type AdapterFetchInput = {
  checkpoint: SyncCheckpoint | null;
  connection: IntegrationConnection;
  range: SyncRange;
  stream: string;
};

type IntegrationAdapter = {
  adapterContractVersion: typeof integrationContractVersion;
  beginAuthorization(input: {
    requestedScopes: readonly string[];
    state: string;
  }): {
    authorizationUrl: string;
    pkceRequired: boolean;
    state: string;
  };
  detectAccounts(): readonly AdapterAccount[];
  exchangeAuthorization(input: {
    externalAccountRef: string;
    grantedScopes: readonly string[];
    state: string;
  }): {
    credentialMaterial: string;
    externalAccountRef: string;
    grantedScopes: readonly string[];
    expiresAt: string;
  };
  fetchPage(input: AdapterFetchInput): AdapterPage;
  providerId: IntegrationProviderId;
  reauthorize(input: {
    connection: IntegrationConnection;
    externalAccountRef: string;
    grantedScopes: readonly string[];
  }): {
    credentialMaterial: string;
    externalAccountRef: string;
    grantedScopes: readonly string[];
    expiresAt: string;
  };
  revoke(input: { connection: IntegrationConnection }): { revoked: true };
  verifyWebhook(input: {
    expectedSignature: string;
    signature: string | undefined;
  }): boolean;
};

type FailureInjection =
  | {
      kind: 'none';
    }
  | {
      errorClass: IntegrationErrorClass;
      kind:
        | 'auth_failure'
        | 'checkpoint_failure'
        | 'outage'
        | 'rate_limit'
        | 'revoke_failure'
        | 'schema_mismatch'
        | 'secret_store_failure'
        | 'storage_failure'
        | 'timeout'
        | 'validation_data'
        | 'worker_crash';
      retryAfterSeconds?: number;
      stream?: string;
    };

type RuntimeOptions = {
  now?: () => string;
  testMode?: boolean;
};

type RuntimeLogEntry = {
  attempt?: number;
  checkpointRef?: string;
  connectionId?: IntegrationConnectionId;
  correlationId: string;
  errorClass?: IntegrationErrorClass;
  event: string;
  jobId?: SyncJobId;
  operationId?: string;
  providerId?: IntegrationProviderId;
  tenantId?: string;
  workspaceId?: string;
};

type RuntimeAlert = {
  alertType:
    | 'credential_expiring'
    | 'auth_failures'
    | 'retry_storm'
    | 'stale_checkpoint'
    | 'missing_incremental_sync'
    | 'dlq_threshold'
    | 'schema_drift'
    | 'provider_outage'
    | 'cross_workspace_deny'
    | 'tenant_workspace_mismatch'
    | 'unauthorized_replay';
  correlationId: string;
  severity: 'info' | 'warning' | 'critical';
};

type RuntimeMetrics = Record<string, number>;

type RuntimeSnapshot = {
  alerts: readonly RuntimeAlert[];
  auditEvents: readonly AuditEvent[];
  batches: readonly SourceBatch[];
  checkpoints: readonly SyncCheckpoint[];
  connections: readonly IntegrationConnection[];
  dlq: readonly SyncJob[];
  jobs: readonly SyncJob[];
  logs: readonly RuntimeLogEntry[];
  metrics: RuntimeMetrics;
  outbox: readonly OutboxEvent[];
  providers: readonly IntegrationProvider[];
  records: readonly SourceRecord[];
};

type CreateConnectionInput = {
  externalAccountRef: string;
  grantedScopes: readonly string[];
  idempotencyKey: string;
  providerId: IntegrationProviderId;
  requestedScopes: readonly string[];
};

type SyncCommandInput = {
  connectionId: IntegrationConnectionId;
  idempotencyKey: string;
  range: SyncRange;
  streams: readonly string[];
  type: SyncJobType;
};

type WebhookRequest = {
  body: {
    connectionId: IntegrationConnectionId;
    eventId: string;
    eventType: string;
    occurredAt: string;
    payloadRef: string;
  };
  headers: {
    signature?: string;
    timestamp?: string;
  };
};

const wooCommerceProviderId = asProviderId('woocommerce');
const fixtureTimestamp = '2026-07-19T00:00:00.000Z';

const wooCommerceProvider = integrationProviderSchema.parse({
  adapterContractVersion: integrationContractVersion,
  adapterStatus: 'verified',
  businessDescription: 'Zamówienia, produkty i zwroty ze sklepu WooCommerce.',
  catalogStatus: 'catalogued',
  category: 'commerce',
  dependencies: ['OAuth app', 'webhook signing secret', 'bounded REST pagination'],
  environmentStatus: 'verified',
  evidenceReferences: ['docs/evidence/wave-2/woocommerce-adapter.md'],
  lastAssessedAt: fixtureTimestamp,
  name: 'WooCommerce',
  operationalReadiness: 'pilot_ready',
  optionalScopes: ['products:read', 'refunds:read'],
  owner: 'PapaData Integrations',
  providerId: wooCommerceProviderId,
  requiredCapabilities: ['integration:connect', 'integration:sync'],
  requiredEntitlements: ['integrations:commerce'],
  requiredScopes: ['orders:read'],
  risks: ['Provider rate limit can delay initial sync.'],
  runtimeAvailability: 'pilot',
  supportedEnvironments: ['local', 'ci', 'development', 'staging'],
  supportedStreams: ['orders', 'products', 'refunds'],
  supportedUseCases: ['commerce_orders', 'commerce_products', 'commerce_refunds'],
});

const shopifyProvider = integrationProviderSchema.parse({
  ...wooCommerceProvider,
  adapterStatus: 'planned',
  businessDescription: 'Provider w katalogu MVP, niedostępny do czasu adaptera.',
  catalogStatus: 'catalogued',
  environmentStatus: 'not_configured',
  evidenceReferences: ['docs/spec/integrations.md'],
  name: 'Shopify',
  operationalReadiness: 'not_ready',
  providerId: asProviderId('shopify'),
  runtimeAvailability: 'disabled',
});

export const providerCatalog: readonly ProviderRecord[] = [
  {
    provider: wooCommerceProvider,
    scopePolicy: scopePolicySchema.parse({
      owner: 'PapaData Integrations',
      providerId: wooCommerceProviderId,
      useCases: [
        {
          impactWhenMissing: 'Bez orders:read initial sync nie może zapisać source data.',
          minimalScopes: ['orders:read'],
          optionalScopes: ['products:read', 'refunds:read'],
          purpose: 'Pobranie zamówień i korekt sprzedaży.',
          useCase: 'commerce_orders',
        },
        {
          impactWhenMissing: 'Brak produktów ogranicza analizę katalogu, ale nie blokuje orders.',
          minimalScopes: ['products:read'],
          optionalScopes: [],
          purpose: 'Pobranie wymiarów produktowych.',
          useCase: 'commerce_products',
        },
      ],
      validFrom: fixtureTimestamp,
      version: integrationPolicyVersion,
    }),
  },
  {
    provider: shopifyProvider,
    scopePolicy: scopePolicySchema.parse({
      owner: 'PapaData Integrations',
      providerId: asProviderId('shopify'),
      useCases: [],
      validFrom: fixtureTimestamp,
      version: integrationPolicyVersion,
    }),
  },
];

function createSafeError(input: {
  code: string;
  correlationId: string;
  errorClass: IntegrationErrorClass;
  impact: string;
  nextAction: string;
  retryAfterSeconds?: number | null;
  retryable: boolean;
}): SafeIntegrationError {
  return {
    code: input.code,
    correlationId: asCorrelationId(input.correlationId),
    errorClass: input.errorClass,
    impact: input.impact,
    metadata: {},
    nextAction: input.nextAction,
    retry: {
      retryAfterSeconds: input.retryAfterSeconds ?? null,
      retryable: input.retryable,
    },
  };
}

class IntegrationRuntimeError extends Error {
  readonly safeError: SafeIntegrationError;

  constructor(safeError: SafeIntegrationError) {
    super(safeError.code);
    this.safeError = safeError;
  }
}

function createWooCommerceAdapter(
  getFailureInjection: () => FailureInjection,
): IntegrationAdapter {
  const pages: Record<string, readonly AdapterPageItem[]> = {
    orders: [
      {
        externalId: 'woo_order_1001',
        payload: {
          currency: 'PLN',
          discount: 0,
          gross: 420,
          lineGrossTotal: 420,
          net: 341.46,
          orderNumber: '1001',
          shipping: 19,
          status: 'paid',
          tax: 78.54,
        },
        providerEventTime: '2026-07-18T20:00:00.000Z',
        providerRevision: 'rev_1',
      },
      {
        externalId: 'woo_order_1002',
        payload: {
          currency: 'PLN',
          discount: 0,
          gross: 730,
          lineGrossTotal: 730,
          net: 593.5,
          orderNumber: '1002',
          refund: 100,
          shipping: 25,
          status: 'refunded',
          tax: 136.5,
        },
        providerEventTime: '2026-07-18T21:00:00.000Z',
        providerRevision: 'rev_1',
      },
    ],
    products: [
      {
        externalId: 'woo_product_2001',
        payload: {
          active: true,
          name: 'Northstar Pack',
          sku: 'NS-001',
        },
        providerEventTime: '2026-07-18T19:00:00.000Z',
        providerRevision: 'rev_1',
      },
    ],
    refunds: [
      {
        externalId: 'woo_refund_3001',
        payload: {
          amount: 100,
          currency: 'PLN',
          reason: 'customer_return',
        },
        providerEventTime: '2026-07-18T22:00:00.000Z',
        providerRevision: 'rev_1',
      },
    ],
  };

  return {
    adapterContractVersion: integrationContractVersion,
    beginAuthorization: ({ requestedScopes, state }) => ({
      authorizationUrl: `https://woocommerce.example/oauth?state=${state}&scope=${requestedScopes.join(
        ',',
      )}`,
      pkceRequired: true,
      state,
    }),
    detectAccounts: () => [
      {
        externalAccountRef: 'woo_account_northstar',
        name: 'Northstar WooCommerce',
        resources: [
          {
            channels: ['online_store'],
            externalResourceRef: 'woo_store_main',
            name: 'Northstar Store',
          },
        ],
      },
    ],
    exchangeAuthorization: ({ externalAccountRef, grantedScopes, state }) => {
      if (!state.startsWith('state_')) {
        throw new IntegrationRuntimeError(
          createSafeError({
            code: 'OAUTH_STATE_INVALID',
            correlationId: 'cor_oauth_state_invalid',
            errorClass: 'AUTH',
            impact: 'Connection nie zostanie utworzone.',
            nextAction: 'Rozpocznij connect ponownie.',
            retryable: false,
          }),
        );
      }

      return {
        credentialMaterial: `credential-material:${externalAccountRef}`,
        expiresAt: '2026-08-19T00:00:00.000Z',
        externalAccountRef,
        grantedScopes,
      };
    },
    fetchPage: ({ checkpoint, stream }) => {
      const injection = getFailureInjection();
      const isProviderFailure =
        injection.kind === 'auth_failure' ||
        injection.kind === 'outage' ||
        injection.kind === 'rate_limit' ||
        injection.kind === 'schema_mismatch' ||
        injection.kind === 'timeout' ||
        injection.kind === 'validation_data';

      if (isProviderFailure && (!injection.stream || injection.stream === stream)) {
        const retry = retryDecisionForError(
          injection.errorClass,
          1,
          3,
          injection.retryAfterSeconds,
        );
        throw new IntegrationRuntimeError(
          createSafeError({
            code: `PROVIDER_${injection.errorClass}`,
            correlationId: 'cor_provider_failure',
            errorClass: injection.errorClass,
            impact: `Stream ${stream} nie może zakończyć bieżącej strony.`,
            nextAction: retry.nextAction,
            retryAfterSeconds: retry.retryAfterSeconds,
            retryable: retry.retryable,
          }),
        );
      }

      const cursorPage = checkpoint?.cursor === 'page_1' ? 2 : 1;
      const streamItems = pages[stream] ?? [];
      const items = cursorPage === 1 ? streamItems : [];

      return {
        cursor: cursorPage === 1 && streamItems.length > 0 ? 'page_1' : null,
        hasMore: false,
        items,
        providerRequestId: `woo_req_${stream}_${cursorPage}`,
        rateLimit: {
          remaining: 99,
          retryAfterSeconds: null,
        },
        watermark: items.at(-1)?.providerEventTime ?? checkpoint?.watermark ?? null,
      };
    },
    providerId: wooCommerceProviderId,
    reauthorize: ({ connection, externalAccountRef, grantedScopes }) => {
      if (externalAccountRef !== connection.externalAccountRef) {
        throw new IntegrationRuntimeError(
          createSafeError({
            code: 'EXTERNAL_ACCOUNT_CHANGED',
            correlationId: 'cor_reauth_wrong_account',
            errorClass: 'INVARIANT',
            impact: 'Historia i lineage connection nie mogą zostać przepięte.',
            nextAction: 'Utwórz nowe connection dla innego konta.',
            retryable: false,
          }),
        );
      }

      return {
        credentialMaterial: `credential-material:${externalAccountRef}:reauth`,
        expiresAt: '2026-09-19T00:00:00.000Z',
        externalAccountRef,
        grantedScopes,
      };
    },
    revoke: () => {
      const injection = getFailureInjection();

      if (injection.kind === 'revoke_failure') {
        throw new IntegrationRuntimeError(
          createSafeError({
            code: 'PROVIDER_REVOKE_FAILED',
            correlationId: 'cor_provider_revoke_failed',
            errorClass: 'TRANSIENT',
            impact: 'Credential providera może nadal być aktywny.',
            nextAction: 'Powtórz disconnect po ustąpieniu błędu provider outage.',
            retryable: true,
          }),
        );
      }

      return { revoked: true };
    },
    verifyWebhook: ({ expectedSignature, signature }) => signature === expectedSignature,
  };
}

class LocalSecretStore {
  private readonly records = new Map<CredentialRef, CredentialMetadata & {
    encryptedMaterial: string;
  }>();
  private readonly now: () => string;

  constructor(now: () => string) {
    this.now = now;
  }

  delete(ref: CredentialRef): CredentialMetadata {
    const current = this.getMetadata(ref);
    const deleted = credentialMetadataSchema.parse({
      ...current,
      status: 'DELETED',
      version: current.version + 1,
    });
    this.records.set(ref, {
      ...deleted,
      encryptedMaterial: '[deleted]',
    });

    return deleted;
  }

  getMetadata(ref: CredentialRef): CredentialMetadata {
    const record = this.records.get(ref);

    if (!record) {
      throw new Error('CREDENTIAL_NOT_FOUND');
    }

    return credentialMetadataSchema.parse({
      connectionId: record.connectionId,
      createdAt: record.createdAt,
      expiresAt: record.expiresAt,
      lastRotatedAt: record.lastRotatedAt,
      providerId: record.providerId,
      ref: record.ref,
      status: record.status,
      tenantId: record.tenantId,
      version: record.version,
      workspaceId: record.workspaceId,
    });
  }

  isUsable(ref: CredentialRef): boolean {
    const metadata = this.getMetadata(ref);

    return metadata.status === 'ACTIVE' || metadata.status === 'ROTATING';
  }

  revoke(ref: CredentialRef): CredentialMetadata {
    const current = this.getMetadata(ref);
    const revoked = credentialMetadataSchema.parse({
      ...current,
      status: 'REVOKED',
      version: current.version + 1,
    });
    this.records.set(ref, {
      ...revoked,
      encryptedMaterial: '[revoked]',
    });

    return revoked;
  }

  rotate(ref: CredentialRef, credentialMaterial: string): CredentialMetadata {
    const current = this.getMetadata(ref);
    const rotated = credentialMetadataSchema.parse({
      ...current,
      lastRotatedAt: this.now(),
      status: 'ACTIVE',
      version: current.version + 1,
    });
    this.records.set(ref, {
      ...rotated,
      encryptedMaterial: createDeterministicHash({
        credentialMaterial,
        version: rotated.version,
      }),
    });

    return rotated;
  }

  write(input: {
    connectionId: IntegrationConnectionId;
    credentialMaterial: string;
    expiresAt: string | null;
    providerId: IntegrationProviderId;
    ref: CredentialRef;
    tenantId: string;
    workspaceId: string;
  }): CredentialMetadata {
    const metadata = credentialMetadataSchema.parse({
      connectionId: input.connectionId,
      createdAt: this.now(),
      expiresAt: input.expiresAt,
      lastRotatedAt: null,
      providerId: input.providerId,
      ref: input.ref,
      status: 'ACTIVE',
      tenantId: input.tenantId,
      version: 1,
      workspaceId: input.workspaceId,
    });
    this.records.set(input.ref, {
      ...metadata,
      encryptedMaterial: createDeterministicHash(input.credentialMaterial),
    });

    return metadata;
  }
}

function hasCapability(context: ApplicationSessionContext, capability: string): boolean {
  return context.capabilities.some((item) => item === capability);
}

function hasEnabledEntitlement(
  context: ApplicationSessionContext,
  entitlementKey: string,
): boolean {
  return context.entitlements.some(
    (entitlement) =>
      entitlement.enabled &&
      entitlement.capability === entitlementKey &&
      entitlement.tenantId === context.tenant.tenantId &&
      (!entitlement.workspaceId ||
        entitlement.workspaceId === context.activeWorkspace.workspaceId),
  );
}

function safeConnectionRef(connectionId: IntegrationConnectionId): string {
  return `connection:${connectionId}`;
}

export class LocalIntegrationRuntime {
  private readonly adapters = new Map<IntegrationProviderId, IntegrationAdapter>();
  private readonly alerts: RuntimeAlert[] = [];
  private readonly auditEvents: AuditEvent[] = [];
  private readonly batches = new Map<string, SourceBatch>();
  private readonly checkpoints = new Map<string, SyncCheckpoint>();
  private readonly connections = new Map<IntegrationConnectionId, IntegrationConnection>();
  private readonly dlq = new Map<SyncJobId, SyncJob>();
  private readonly idempotency = new Map<
    string,
    {
      commandFingerprint: string;
      resultId: string;
    }
  >();
  private readonly jobs = new Map<SyncJobId, SyncJob>();
  private readonly logs: RuntimeLogEntry[] = [];
  private readonly metrics: RuntimeMetrics = {};
  private readonly outbox = new Map<string, OutboxEvent>();
  private readonly payloadStore = new Map<string, Record<string, string | number | boolean>>();
  private readonly processedWebhookEvents = new Set<string>();
  private readonly records = new Map<string, SourceRecord>();
  private readonly secretStore: LocalSecretStore;
  private readonly writeOrder: string[] = [];
  private activeConnectionSlots = new Set<string>();
  private activeProviderSlots = new Set<string>();
  private activeTenantSlots = new Set<string>();
  private connectionSequence = 0;
  private failureInjection: FailureInjection = { kind: 'none' };
  private jobSequence = 0;
  private operationSequence = 0;
  private readonly options: RuntimeOptions;

  constructor(options: RuntimeOptions = {}) {
    this.options = options;
    this.secretStore = new LocalSecretStore(this.now);
    this.adapters.set(wooCommerceProviderId, createWooCommerceAdapter(() => this.failureInjection));
  }

  private readonly now = (): string => this.options.now?.() ?? fixtureTimestamp;

  clearFailureInjection(): void {
    this.failureInjection = { kind: 'none' };
  }

  setFailureInjection(failureInjection: FailureInjection): void {
    if (!this.options.testMode) {
      throw new Error('FAILURE_INJECTION_REQUIRES_TEST_MODE');
    }

    this.failureInjection = failureInjection;
  }

  getSecretMetadata(ref: CredentialRef): CredentialMetadata {
    return this.secretStore.getMetadata(ref);
  }

  getWriteOrder(): readonly string[] {
    return [...this.writeOrder];
  }

  listAvailableProviders(context: ApplicationSessionContext): readonly IntegrationProvider[] {
    return providerCatalog
      .map((entry) => entry.provider)
      .filter(
        (provider) =>
          provider.catalogStatus === 'catalogued' &&
          provider.adapterStatus === 'verified' &&
          provider.environmentStatus === 'verified' &&
          (provider.runtimeAvailability === 'pilot' ||
            provider.runtimeAvailability === 'available') &&
          provider.operationalReadiness !== 'not_ready' &&
          provider.requiredCapabilities.every((capability) =>
            hasCapability(context, capability),
          ) &&
          provider.requiredEntitlements.every((entitlement) =>
            hasEnabledEntitlement(context, entitlement),
          ),
      );
  }

  listProviders(): readonly IntegrationProvider[] {
    return providerCatalog.map((entry) => entry.provider);
  }

  getProvider(providerId: IntegrationProviderId): IntegrationProvider | undefined {
    return providerCatalog.find((entry) => entry.provider.providerId === providerId)?.provider;
  }

  getSnapshot(): RuntimeSnapshot {
    return {
      alerts: [...this.alerts],
      auditEvents: [...this.auditEvents],
      batches: [...this.batches.values()],
      checkpoints: [...this.checkpoints.values()],
      connections: [...this.connections.values()],
      dlq: [...this.dlq.values()],
      jobs: [...this.jobs.values()],
      logs: [...this.logs],
      metrics: { ...this.metrics },
      outbox: [...this.outbox.values()],
      providers: this.listProviders(),
      records: [...this.records.values()],
    };
  }

  getOperation(operationId: OperationId): OperationStatus | undefined {
    const job = [...this.jobs.values()].find((candidate) =>
      candidate.id.endsWith(operationId.replace('op_', 'job_')),
    );
    const connection = [...this.connections.values()][0];

    if (!connection) {
      return undefined;
    }

    return operationStatusSchema.parse({
      contractVersion: domainContractVersion,
      correlationId: asCorrelationId('cor_operation_lookup'),
      limitations: [],
      operationId,
      status: job?.status === 'SUCCESS' ? 'succeeded' : 'processing',
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });
  }

  getSourcePayloadForPipeline(
    context: ApplicationSessionContext,
    sourceRecordId: SourceRecord['id'],
  ): Record<string, string | number | boolean> {
    this.assertCapability(context, 'integration:read');
    const record = this.requireSourceRecord(context, sourceRecordId);
    const payload = this.payloadStore.get(record.payloadRef);

    if (!payload) {
      throw new Error('SOURCE_PAYLOAD_NOT_FOUND');
    }

    return { ...payload };
  }

  createConnection(
    context: ApplicationSessionContext,
    input: CreateConnectionInput,
  ): {
    connection: IntegrationConnection;
    operation: IntegrationCommandResponse;
    scopeDiff: ScopeDiff;
  } {
    this.assertScope(context, {
      tenantId: input.providerId === wooCommerceProviderId
        ? context.tenant.tenantId
        : context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.assertCapability(context, 'integration:connect');
    this.assertEntitlement(context, 'integrations:commerce');
    const provider = this.requireAvailableProvider(context, input.providerId);
    const adapter = this.requireAdapter(input.providerId);
    const scopePolicy = this.requireScopePolicy(input.providerId);
    const correlationId = this.nextCorrelationId('connect');
    const operationId = this.nextOperationId('connect');
    const requestedScopes = [...input.requestedScopes];
    const fingerprint = createCommandFingerprint({
      externalAccountRef: input.externalAccountRef,
      providerId: input.providerId,
      requestedScopes,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    const idempotent = this.resolveIdempotency({
      commandFingerprint: fingerprint,
      idempotencyKey: input.idempotencyKey,
      operationId,
      resultRefPrefix: 'connection',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });

    if (idempotent.reused) {
      const existing = this.connections.get(asConnectionId(idempotent.resultId));

      if (!existing) {
        throw new Error('IDEMPOTENCY_RESULT_MISSING');
      }

      return {
        connection: existing,
        operation: this.commandResponse(operationId, correlationId, 'completed'),
        scopeDiff: existing.lastScopeDiff ?? this.emptyScopeDiff(requestedScopes),
      };
    }

    adapter.beginAuthorization({
      requestedScopes,
      state: `state_${input.idempotencyKey}`,
    });
    const exchange = adapter.exchangeAuthorization({
      externalAccountRef: input.externalAccountRef,
      grantedScopes: input.grantedScopes,
      state: `state_${input.idempotencyKey}`,
    });
    const requiredScopes = [
      ...new Set([
        ...provider.requiredScopes,
        ...scopePolicy.useCases.flatMap((useCase) => useCase.minimalScopes),
      ]),
    ];
    const optionalScopes = [
      ...new Set([
        ...provider.optionalScopes,
        ...scopePolicy.useCases.flatMap((useCase) => useCase.optionalScopes),
      ]),
    ];
    const scopeDiff = calculateScopeDiff({
      granted: exchange.grantedScopes,
      optional: optionalScopes,
      requested: requestedScopes,
      required: requiredScopes,
    });
    const connectionId = asConnectionId(
      `conn_woo_${(this.connectionSequence + 1).toString().padStart(3, '0')}`,
    );
    const credentialRef = asCredentialRef(
      `cred_woo_${(this.connectionSequence + 1).toString().padStart(3, '0')}`,
    );
    this.connectionSequence += 1;
    this.secretStore.write({
      connectionId,
      credentialMaterial: exchange.credentialMaterial,
      expiresAt: exchange.expiresAt,
      providerId: provider.providerId,
      ref: credentialRef,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    const connecting = integrationConnectionSchema.parse({
      connectedAt: null,
      credentialRef,
      externalAccountRef: exchange.externalAccountRef,
      expiresAt: exchange.expiresAt,
      grantedScopes: [...exchange.grantedScopes],
      id: connectionId,
      lastError: null,
      lastScopeDiff: scopeDiff,
      lastSuccessfulSyncAt: null,
      policyVersion: integrationPolicyVersion,
      providerId: provider.providerId,
      status: 'CONNECTING',
      tenantId: context.tenant.tenantId,
      validatedAt: null,
      version: 1,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    const status: IntegrationConnectionStatus =
      scopeDiff.missingRequired.length > 0 ? 'LIMITED_ACCESS' : 'ACTIVE';
    const { connection } = transitionConnection(connecting, {
      correlationId,
      reason:
        status === 'ACTIVE'
          ? 'requested_and_granted_scopes_match'
          : 'missing_required_scope',
      status,
      timestamp: this.now(),
    });
    this.connections.set(connection.id, connection);
    this.idempotency.set(this.idempotencyKey(context, input.idempotencyKey), {
      commandFingerprint: fingerprint,
      resultId: connection.id,
    });
    this.audit({
      context,
      eventType: 'INTEGRATION_CONNECT_STARTED',
      operationId,
      providerId: provider.providerId,
      result: 'success',
    });
    this.audit({
      connectionId: connection.id,
      context,
      eventType:
        status === 'ACTIVE'
          ? 'INTEGRATION_CONNECT_COMPLETED'
          : 'INTEGRATION_SCOPE_CHANGED',
      operationId,
      providerId: provider.providerId,
      result: 'success',
    });
    this.outboxEvent(context, 'integration.connection.changed', operationId, {
      connectionId: connection.id,
      providerId: provider.providerId,
      status,
    });
    this.metric(status === 'ACTIVE' ? 'connect.success' : 'connect.limited');
    this.log({
      connectionId: connection.id,
      correlationId,
      event: 'integration_connect_completed',
      operationId,
      providerId: provider.providerId,
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });

    return {
      connection,
      operation: this.commandResponse(operationId, correlationId, 'completed'),
      scopeDiff,
    };
  }

  reauthorize(
    context: ApplicationSessionContext,
    input: {
      connectionId: IntegrationConnectionId;
      externalAccountRef: string;
      grantedScopes: readonly string[];
      idempotencyKey: string;
      requestedScopes: readonly string[];
    },
  ): {
    connection: IntegrationConnection;
    operation: IntegrationCommandResponse;
    scopeDiff: ScopeDiff;
  } {
    this.assertCapability(context, 'integration:connect');
    const connection = this.requireConnection(context, input.connectionId);
    const provider = this.requireProvider(connection.providerId);
    const adapter = this.requireAdapter(connection.providerId);
    const correlationId = this.nextCorrelationId('reauth');
    const operationId = this.nextOperationId('reauth');
    const exchange = adapter.reauthorize({
      connection,
      externalAccountRef: input.externalAccountRef,
      grantedScopes: input.grantedScopes,
    });
    const scopeDiff = calculateScopeDiff({
      granted: exchange.grantedScopes,
      optional: provider.optionalScopes,
      previousGranted: connection.grantedScopes,
      requested: input.requestedScopes,
      required: provider.requiredScopes,
    });
    this.secretStore.rotate(connection.credentialRef, exchange.credentialMaterial);
    const { connection: reauthorized } = transitionConnection(
      {
        ...connection,
        expiresAt: exchange.expiresAt,
        grantedScopes: [...exchange.grantedScopes],
        lastScopeDiff: scopeDiff,
      },
      {
        correlationId,
        reason:
          scopeDiff.missingRequired.length === 0
            ? 'reauthorization_scope_validated'
            : 'reauthorization_limited_scope',
        status: scopeDiff.missingRequired.length === 0 ? 'ACTIVE' : 'LIMITED_ACCESS',
        timestamp: this.now(),
      },
    );
    this.connections.set(reauthorized.id, reauthorized);
    this.audit({
      connectionId: reauthorized.id,
      context,
      eventType: 'INTEGRATION_REAUTH_COMPLETED',
      operationId,
      providerId: reauthorized.providerId,
      result: 'success',
    });
    this.metric('reconnect.success');

    return {
      connection: reauthorized,
      operation: this.commandResponse(operationId, correlationId, 'completed'),
      scopeDiff,
    };
  }

  disconnect(
    context: ApplicationSessionContext,
    input: {
      connectionId: IntegrationConnectionId;
      idempotencyKey: string;
      reason: string;
    },
  ): {
    connection: IntegrationConnection;
    operation: IntegrationCommandResponse;
    partialFailure?: SafeIntegrationError;
  } {
    this.assertCapability(context, 'integration:disconnect');
    const connection = this.requireConnection(context, input.connectionId);
    const adapter = this.requireAdapter(connection.providerId);
    const correlationId = this.nextCorrelationId('disconnect');
    const operationId = this.nextOperationId('disconnect');
    const activeJobs = [...this.jobs.values()].filter(
      (job) =>
        job.connectionId === connection.id &&
        (job.status === 'QUEUED' ||
          job.status === 'RUNNING' ||
          job.status === 'RETRY_WAIT'),
    );

    for (const job of activeJobs) {
      this.jobs.set(job.id, transitionJob(job, 'CANCELLED', this.now(), null));
    }

    try {
      adapter.revoke({ connection });
      this.secretStore.revoke(connection.credentialRef);
      this.secretStore.delete(connection.credentialRef);
    } catch (error) {
      const safeError =
        error instanceof IntegrationRuntimeError
          ? error.safeError
          : createSafeError({
              code: 'DISCONNECT_FAILED',
              correlationId: 'cor_disconnect_failed',
              errorClass: 'TRANSIENT',
              impact: 'Disconnect zakończył się częściowym błędem.',
              nextAction: 'Zweryfikuj provider revoke i powtórz.',
              retryable: true,
            });
      const failed = this.transitionConnectionWithError(
        connection,
        'ERROR',
        safeError,
        correlationId,
        'provider_revoke_failed',
      );
      this.connections.set(failed.id, failed);
      this.audit({
        connectionId: failed.id,
        context,
        eventType: 'INTEGRATION_DISCONNECT_FAILED',
        operationId,
        providerId: failed.providerId,
        reason: input.reason,
        result: 'failure',
      });
      this.metric('disconnect.failure');

      return {
        connection: failed,
        operation: this.commandResponse(operationId, correlationId, 'partial'),
        partialFailure: safeError,
      };
    }

    const disabled = this.transitionConnectionStatus(
      connection,
      'DISABLED',
      correlationId,
      'disconnect_revoked_and_deleted_credential',
    );
    this.connections.set(disabled.id, disabled);
    this.audit({
      connectionId: disabled.id,
      context,
      eventType: 'INTEGRATION_CREDENTIAL_REVOKED',
      operationId,
      providerId: disabled.providerId,
      reason: input.reason,
      result: 'success',
    });
    this.audit({
      connectionId: disabled.id,
      context,
      eventType: 'INTEGRATION_DISCONNECTED',
      operationId,
      providerId: disabled.providerId,
      reason: input.reason,
      result: 'success',
    });
    this.metric('disconnect.success');

    return {
      connection: disabled,
      operation: this.commandResponse(operationId, correlationId, 'completed'),
    };
  }

  createSyncJob(
    context: ApplicationSessionContext,
    input: SyncCommandInput,
  ): {
    job: SyncJob;
    operation: IntegrationCommandResponse;
  } {
    this.assertCapability(
      context,
      input.type === 'BACKFILL' ? 'integration:backfill' : 'integration:sync',
    );
    const connection = this.requireConnection(context, input.connectionId);

    if (connection.status === 'DISABLED') {
      throw new Error('CONNECTION_DISABLED');
    }

    if (!this.secretStore.isUsable(connection.credentialRef)) {
      throw new Error('CREDENTIAL_NOT_USABLE');
    }

    const provider = this.requireProvider(connection.providerId);
    const unsupported = input.streams.filter(
      (stream) => !provider.supportedStreams.includes(stream),
    );

    if (unsupported.length > 0) {
      throw new Error(`STREAM_NOT_SUPPORTED:${unsupported.join(',')}`);
    }

    const operationId = this.nextOperationId('sync');
    const correlationId = this.nextCorrelationId('sync');
    const fingerprint = createCommandFingerprint({
      connectionId: input.connectionId,
      range: input.range,
      streams: [...input.streams],
      type: input.type,
    });
    const idempotent = this.resolveIdempotency({
      commandFingerprint: fingerprint,
      idempotencyKey: input.idempotencyKey,
      operationId,
      resultRefPrefix: 'job',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });

    if (idempotent.reused) {
      const existing = this.jobs.get(asSyncJobId(idempotent.resultId));

      if (!existing) {
        throw new Error('IDEMPOTENCY_RESULT_MISSING');
      }

      return {
        job: existing,
        operation: this.commandResponse(operationId, correlationId, 'accepted'),
      };
    }

    const jobId = asSyncJobId(
      `job_woo_${(this.jobSequence + 1).toString().padStart(3, '0')}`,
    );
    this.jobSequence += 1;
    const job = syncJobSchema.parse({
      attempt: 0,
      checkpointRef: null,
      commandFingerprint: fingerprint,
      connectionId: connection.id,
      createdAt: this.now(),
      errorClass: null,
      finishedAt: null,
      id: jobId,
      idempotencyKey: input.idempotencyKey,
      progress: {
        currentStream: null,
        errors: 0,
        pages: 0,
        recordsFetched: 0,
        recordsStored: 0,
        streamsCompleted: 0,
        streamsTotal: input.streams.length,
      },
      providerId: connection.providerId,
      range: input.range,
      retryBudget: 3,
      startedAt: null,
      status: 'QUEUED',
      streams: [...input.streams],
      tenantId: connection.tenantId,
      type: input.type,
      workspaceId: connection.workspaceId,
    });
    this.jobs.set(job.id, job);
    this.idempotency.set(this.idempotencyKey(context, input.idempotencyKey), {
      commandFingerprint: fingerprint,
      resultId: job.id,
    });
    this.outboxEvent(context, 'integration.sync.requested', operationId, {
      connectionId: connection.id,
      jobId: job.id,
      providerId: connection.providerId,
    });
    this.audit({
      connectionId: connection.id,
      context,
      eventType: 'INTEGRATION_SYNC_STARTED',
      jobId: job.id,
      operationId,
      providerId: connection.providerId,
      result: 'success',
    });

    return {
      job,
      operation: this.commandResponse(operationId, correlationId, 'accepted'),
    };
  }

  runJob(context: ApplicationSessionContext, jobId: SyncJobId): SyncJob {
    const queued = this.requireJob(context, jobId);
    const connection = this.requireConnection(context, queued.connectionId);
    const adapter = this.requireAdapter(connection.providerId);
    const slot = this.reserveConcurrency(connection);
    let job = transitionJob(
      {
        ...queued,
        attempt: queued.attempt + 1,
      },
      'RUNNING',
      this.now(),
      null,
    );
    this.jobs.set(job.id, job);

    try {
      for (const stream of job.streams) {
        const checkpointBefore = this.getCheckpoint(connection, stream);
        const page = adapter.fetchPage({
          checkpoint: checkpointBefore,
          connection,
          range: job.range,
          stream,
        });
        this.metric('sync.page.fetched');
        const batchId = asSourceBatchId(`${job.id}_${stream}_batch_${job.progress.pages + 1}`);
        let batch = sourceBatchSchema.parse({
          checkpointAfter: null,
          checkpointBefore: checkpointBefore?.id ?? null,
          completedAt: null,
          connectionId: connection.id,
          contractVersion: domainContractVersion,
          correlationId: asCorrelationId(`cor_batch_${batchId}`),
          counts: {
            accepted: 0,
            duplicated: 0,
            failed: 0,
            fetched: page.items.length,
            quarantined: 0,
          },
          createdAt: this.now(),
          id: batchId,
          jobId: job.id,
          providerId: connection.providerId,
          range: job.range,
          status: 'OPEN',
          stream,
          tenantId: connection.tenantId,
          workspaceId: connection.workspaceId,
        });
        this.batches.set(batch.id, batch);

        if (this.failureInjection.kind === 'storage_failure') {
          throw new IntegrationRuntimeError(
            createSafeError({
              code: 'SOURCE_STORAGE_FAILED',
              correlationId: 'cor_storage_failed',
              errorClass: 'TRANSIENT',
              impact: 'Source batch nie został trwale zapisany.',
              nextAction: 'Retry po recovery storage.',
              retryable: true,
            }),
          );
        }

        let stored = 0;
        let duplicated = 0;
        for (const item of page.items) {
          const naturalKey = [
            connection.tenantId,
            connection.workspaceId,
            connection.id,
            stream,
            item.externalId,
            item.providerRevision,
            createDeterministicHash(item.payload),
          ].join(':');

          if (!this.records.has(naturalKey)) {
            const payloadRef = `payload://${connection.tenantId}/${connection.workspaceId}/${batch.id}/${item.externalId}`;
            this.payloadStore.set(payloadRef, item.payload);
            const record = sourceRecordSchema.parse({
              classification: 'CUSTOMER_CONFIDENTIAL',
              connectionId: connection.id,
              contentHash: createDeterministicHash(item.payload),
              contractVersion: domainContractVersion,
              externalId: item.externalId,
              fetchedAt: this.now(),
              id: asIntegrationSourceRecordId(
                `srcint_${(this.records.size + 1).toString().padStart(4, '0')}`,
              ),
              payloadRef,
              providerEventTime: item.providerEventTime,
              providerId: connection.providerId,
              providerRevision: item.providerRevision,
              retentionClass: 'R-BUSINESS',
              sourceBatchId: batch.id,
              stream,
              tenantId: connection.tenantId,
              workspaceId: connection.workspaceId,
            });
            this.records.set(naturalKey, record);
            this.writeOrder.push(`source:${record.id}`);
            stored += 1;
          } else {
            duplicated += 1;
          }
        }

        if (this.failureInjection.kind === 'worker_crash') {
          throw new IntegrationRuntimeError(
            createSafeError({
              code: 'WORKER_CRASH_AFTER_SOURCE_WRITE',
              correlationId: 'cor_worker_crash',
              errorClass: 'TRANSIENT',
              impact: 'Worker zatrzymał się po zapisie source i przed checkpointem.',
              nextAction: 'Recovery wznowi od ostatniego potwierdzonego checkpointu.',
              retryable: true,
            }),
          );
        }

        const checkpointAfter = this.updateCheckpoint({
          batchId: batch.id,
          connection,
          cursor: page.cursor,
          eventId: page.providerRequestId,
          stream,
          watermark: page.watermark,
        });
        batch = sourceBatchSchema.parse({
          ...batch,
          checkpointAfter: checkpointAfter.id,
          completedAt: this.now(),
          counts: {
            accepted: stored,
            duplicated,
            failed: 0,
            fetched: page.items.length,
            quarantined: 0,
          },
          status: 'COMMITTED',
        });
        this.batches.set(batch.id, batch);
        job = syncJobSchema.parse({
          ...job,
          checkpointRef: checkpointAfter.id,
          progress: {
            ...job.progress,
            currentStream: stream,
            pages: job.progress.pages + 1,
            recordsFetched: job.progress.recordsFetched + page.items.length,
            recordsStored: job.progress.recordsStored + stored,
            streamsCompleted: job.progress.streamsCompleted + 1,
          },
        });
        this.jobs.set(job.id, job);
        this.metric('source.records.stored', stored);
      }

      job = transitionJob(job, 'SUCCESS', this.now(), null);
      this.jobs.set(job.id, job);
      const active = this.transitionConnectionStatus(
        {
          ...connection,
          lastSuccessfulSyncAt: this.now(),
        },
        'ACTIVE',
        asCorrelationId('cor_sync_success'),
        'sync_completed_without_readiness_promotion',
      );
      this.connections.set(active.id, active);
      this.audit({
        connectionId: active.id,
        context,
        eventType: 'INTEGRATION_SYNC_COMPLETED',
        jobId: job.id,
        operationId: asOperationId(`op_${job.id}`),
        providerId: active.providerId,
        result: 'success',
      });
      this.metric(job.type === 'INITIAL' ? 'sync.initial.success' : 'sync.success');

      return job;
    } catch (error) {
      const safeError =
        error instanceof IntegrationRuntimeError
          ? error.safeError
          : createSafeError({
              code: 'SYNC_WORKER_FAILED',
              correlationId: 'cor_sync_worker_failed',
              errorClass: 'BUG',
              impact: 'Worker zakończył job błędem.',
              nextAction: 'Sprawdź DLQ i log diagnostyczny.',
              retryable: false,
            });
      job = this.applyRetryDecision(context, job, connection, safeError);
      this.jobs.set(job.id, job);

      return job;
    } finally {
      this.releaseConcurrency(slot);
    }
  }

  replayFromDlq(
    context: ApplicationSessionContext,
    input: {
      idempotencyKey: string;
      jobId: SyncJobId;
      reason: string;
      ticket: string;
    },
  ): SyncJob {
    this.assertCapability(context, 'integration:replay');

    if (!input.reason || !input.ticket) {
      throw new Error('REPLAY_REASON_AND_TICKET_REQUIRED');
    }

    const dlqJob = this.dlq.get(input.jobId);

    if (!dlqJob) {
      throw new Error('DLQ_JOB_NOT_FOUND');
    }

    if (
      dlqJob.tenantId !== context.tenant.tenantId ||
      dlqJob.workspaceId !== context.activeWorkspace.workspaceId
    ) {
      this.alert('unauthorized_replay', 'critical');
      throw new Error('NOT_FOUND');
    }

    const replay = syncJobSchema.parse({
      ...dlqJob,
      attempt: 0,
      createdAt: this.now(),
      errorClass: null,
      finishedAt: null,
      id: asSyncJobId(`${dlqJob.id}_replay`),
      idempotencyKey: input.idempotencyKey,
      startedAt: null,
      status: 'QUEUED',
      type: 'REPLAY',
    });
    this.jobs.set(replay.id, replay);
    this.audit({
      connectionId: replay.connectionId,
      context,
      eventType: 'INTEGRATION_REPLAY_REQUESTED',
      jobId: replay.id,
      operationId: asOperationId(`op_${replay.id}`),
      providerId: replay.providerId,
      reason: `${input.reason}:${input.ticket}`,
      result: 'success',
    });

    return replay;
  }

  handleWebhook(
    context: ApplicationSessionContext,
    providerId: IntegrationProviderId,
    request: WebhookRequest,
  ): {
    envelope: IntegrationWebhookEnvelope | null;
    job: SyncJob | null;
    status:
      | 'accepted'
      | 'duplicate'
      | 'invalid_signature'
      | 'invalid_timestamp'
      | 'quarantined'
      | 'replay'
      | 'unknown_event';
  } {
    const connection = this.requireConnection(context, request.body.connectionId);

    if (providerId !== connection.providerId) {
      throw new Error('NOT_FOUND');
    }

    const timestamp = request.headers.timestamp;

    if (!timestamp) {
      return {
        envelope: null,
        job: null,
        status: 'invalid_timestamp',
      };
    }

    const nowMs = Date.parse(this.now());
    const timestampMs = Date.parse(timestamp);
    const fiveMinutes = 5 * 60 * 1000;

    if (
      Number.isNaN(timestampMs) ||
      timestampMs < nowMs - fiveMinutes ||
      timestampMs > nowMs + fiveMinutes
    ) {
      return {
        envelope: null,
        job: null,
        status: 'invalid_timestamp',
      };
    }

    const signature = this.signWebhookForTest(connection.id, request.body.eventId, timestamp);
    const adapter = this.requireAdapter(providerId);

    if (
      !adapter.verifyWebhook({
        expectedSignature: signature,
        signature: request.headers.signature,
      })
    ) {
      return {
        envelope: null,
        job: null,
        status: request.headers.signature ? 'invalid_signature' : 'invalid_signature',
      };
    }

    if (this.processedWebhookEvents.has(request.body.eventId)) {
      return {
        envelope: null,
        job: null,
        status: 'duplicate',
      };
    }

    if (request.body.eventType === 'unknown') {
      this.quarantine('webhook_unknown_event', connection, request.body.payloadRef);

      return {
        envelope: null,
        job: null,
        status: 'unknown_event',
      };
    }

    if (request.body.eventType === 'schema_mismatch') {
      this.quarantine('webhook_schema_mismatch', connection, request.body.payloadRef);

      return {
        envelope: null,
        job: null,
        status: 'quarantined',
      };
    }

    this.processedWebhookEvents.add(request.body.eventId);
    const envelope: IntegrationWebhookEnvelope = {
      connectionId: connection.id,
      eventId: asWebhookEventId(request.body.eventId),
      eventType: request.body.eventType,
      occurredAt: request.body.occurredAt,
      payloadRef: request.body.payloadRef,
      providerId,
      receivedAt: this.now(),
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    };
    const { job } = this.createSyncJob(context, {
      connectionId: connection.id,
      idempotencyKey: `idem_webhook_${request.body.eventId}`,
      range: {
        from: request.body.occurredAt,
        mode: 'cursor',
        to: this.now(),
      },
      streams: ['orders'],
      type: 'INCREMENTAL',
    });

    return {
      envelope,
      job,
      status: 'accepted',
    };
  }

  signWebhookForTest(
    connectionId: IntegrationConnectionId,
    eventId: string,
    timestamp: string,
  ): string {
    if (!this.options.testMode) {
      throw new Error('WEBHOOK_SIGNING_HELPER_REQUIRES_TEST_MODE');
    }

    return `sig_${createDeterministicHash({
      connectionId,
      eventId,
      timestamp,
      version: integrationContractVersion,
    })}`;
  }

  reserveConcurrencySlotForTest(connectionId: IntegrationConnectionId): void {
    if (!this.options.testMode) {
      throw new Error('CONCURRENCY_HELPER_REQUIRES_TEST_MODE');
    }

    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error('CONNECTION_NOT_FOUND');
    }

    this.reserveConcurrency(connection);
  }

  publishOutbox(): readonly OutboxEvent[] {
    const published: OutboxEvent[] = [];

    for (const event of this.outbox.values()) {
      if (event.status === 'PUBLISHED') {
        published.push(event);
        continue;
      }

      const next = outboxEventSchema.parse({
        ...event,
        attempts: event.attempts + 1,
        publishedAt: this.now(),
        status: 'PUBLISHED',
      });
      this.outbox.set(next.eventId, next);
      published.push(next);
      this.metric('outbox.published');
    }

    return published;
  }

  private applyRetryDecision(
    context: ApplicationSessionContext,
    job: SyncJob,
    connection: IntegrationConnection,
    safeError: SafeIntegrationError,
  ): SyncJob {
    const decision = retryDecisionForError(
      safeError.errorClass,
      job.attempt,
      job.retryBudget,
      safeError.retry.retryAfterSeconds ?? undefined,
    );
    const nextJob = transitionJob(job, decision.jobStatus, this.now(), safeError.errorClass);

    if (decision.sendToDlq) {
      this.dlq.set(nextJob.id, nextJob);
      this.metric('dlq.size');
      this.alert('dlq_threshold', 'warning');
    }

    if (decision.connectionStatus) {
      const nextConnection = this.transitionConnectionWithError(
        connection,
        decision.connectionStatus,
        safeError,
        safeError.correlationId,
        safeError.nextAction,
      );
      this.connections.set(nextConnection.id, nextConnection);
    }

    if (safeError.errorClass === 'RATE_LIMIT') {
      this.metric('rate_limit.count');
    }

    if (safeError.errorClass === 'SCHEMA_MISMATCH') {
      this.metric('schema_mismatch.count');
      this.alert('schema_drift', 'critical');
      this.quarantine('schema_mismatch', connection, safeConnectionRef(connection.id));
    }

    if (safeError.errorClass === 'TRANSIENT') {
      this.alert('provider_outage', 'warning');
    }

    this.audit({
      connectionId: connection.id,
      context,
      eventType:
        nextJob.status === 'PARTIAL_SUCCESS'
          ? 'INTEGRATION_SYNC_PARTIAL'
          : 'INTEGRATION_SYNC_FAILED',
      jobId: nextJob.id,
      operationId: asOperationId(`op_${nextJob.id}`),
      providerId: connection.providerId,
      reason: safeError.code,
      result: nextJob.status === 'PARTIAL_SUCCESS' ? 'success' : 'failure',
    });
    this.log({
      attempt: nextJob.attempt,
      connectionId: connection.id,
      correlationId: safeError.correlationId,
      errorClass: safeError.errorClass,
      event: 'sync_retry_decision',
      jobId: nextJob.id,
      providerId: connection.providerId,
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });

    return nextJob;
  }

  private assertCapability(context: ApplicationSessionContext, capability: string): void {
    if (!hasCapability(context, capability)) {
      this.alert('cross_workspace_deny', 'warning');
      throw new Error('FORBIDDEN');
    }
  }

  private assertEntitlement(context: ApplicationSessionContext, entitlementKey: string): void {
    if (!hasEnabledEntitlement(context, entitlementKey)) {
      throw new Error('ENTITLEMENT_REQUIRED');
    }
  }

  private assertScope(
    context: ApplicationSessionContext,
    scope: {
      tenantId: string;
      workspaceId: string;
    },
  ): void {
    if (
      context.tenant.tenantId !== scope.tenantId ||
      context.activeWorkspace.workspaceId !== scope.workspaceId
    ) {
      this.alert('cross_workspace_deny', 'critical');
      throw new Error('NOT_FOUND');
    }
  }

  private audit(input: {
    connectionId?: IntegrationConnectionId;
    context: ApplicationSessionContext;
    eventType: string;
    jobId?: SyncJobId;
    operationId?: OperationId;
    providerId: IntegrationProviderId;
    reason?: string;
    result: 'success' | 'failure' | 'denied';
  }): void {
    const event = auditEventSchema.parse({
      actor: {
        actorId: input.context.user.userId,
        roles: input.context.memberships.map((membership) => membership.role),
      },
      auditEventId: asAuditEventId(
        `aud_int_${(this.auditEvents.length + 1).toString().padStart(4, '0')}`,
      ),
      correlationId: asCorrelationId(`cor_audit_${this.auditEvents.length + 1}`),
      eventType: input.eventType,
      occurredAt: this.now(),
      reason: input.reason ?? input.connectionId ?? input.jobId,
      result: input.result,
      source: 'app_shell',
      tenantId: input.context.tenant.tenantId,
      workspaceId: input.context.activeWorkspace.workspaceId,
    });
    this.auditEvents.push(event);
  }

  private alert(alertType: RuntimeAlert['alertType'], severity: RuntimeAlert['severity']): void {
    this.alerts.push({
      alertType,
      correlationId: `cor_alert_${this.alerts.length + 1}`,
      severity,
    });
  }

  private commandResponse(
    operationId: OperationId,
    correlationId: ReturnType<typeof asCorrelationId>,
    status: IntegrationCommandResponse['status'],
  ): IntegrationCommandResponse {
    return integrationCommandResponseSchema.parse({
      contractVersion: domainContractVersion,
      correlationId,
      operationId,
      status,
    });
  }

  private emptyScopeDiff(requested: readonly string[]): ScopeDiff {
    return calculateScopeDiff({
      granted: requested,
      requested,
      required: requested,
    });
  }

  private getCheckpoint(
    connection: IntegrationConnection,
    stream: string,
  ): SyncCheckpoint | null {
    return (
      this.checkpoints.get(
        [connection.tenantId, connection.workspaceId, connection.id, stream].join(':'),
      ) ?? null
    );
  }

  private idempotencyKey(context: ApplicationSessionContext, idempotencyKey: string): string {
    return [
      context.tenant.tenantId,
      context.activeWorkspace.workspaceId,
      idempotencyKey,
    ].join(':');
  }

  private log(entry: RuntimeLogEntry): void {
    this.logs.push(entry);
  }

  private metric(name: string, increment = 1): void {
    this.metrics[name] = (this.metrics[name] ?? 0) + increment;
  }

  private nextCorrelationId(scope: string): ReturnType<typeof asCorrelationId> {
    return asCorrelationId(
      `cor_int_${scope}_${(this.operationSequence + 1).toString().padStart(4, '0')}`,
    );
  }

  private nextOperationId(scope: string): OperationId {
    this.operationSequence += 1;

    return asOperationId(
      `op_int_${scope}_${this.operationSequence.toString().padStart(4, '0')}`,
    );
  }

  private outboxEvent(
    context: ApplicationSessionContext,
    eventType: string,
    operationId: OperationId,
    payload: Record<string, string | number | boolean>,
  ): OutboxEvent {
    const event = outboxEventSchema.parse({
      attempts: 0,
      eventId: asOutboxEventId(
        `out_int_${(this.outbox.size + 1).toString().padStart(4, '0')}`,
      ),
      eventType,
      occurredAt: this.now(),
      operationId,
      payload,
      publishedAt: null,
      status: 'PENDING',
      tenantId: context.tenant.tenantId,
      workspaceId: context.activeWorkspace.workspaceId,
    });
    this.outbox.set(event.eventId, event);

    return event;
  }

  private quarantine(
    reason: string,
    connection: IntegrationConnection,
    payloadRef: string,
  ): void {
    this.metric('quarantine.count');
    this.log({
      connectionId: connection.id,
      correlationId: `cor_quarantine_${this.metrics['quarantine.count'] ?? 1}`,
      event: `quarantine:${reason}:${payloadRef}`,
      providerId: connection.providerId,
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });
  }

  private releaseConcurrency(slot: {
    connection: string;
    provider: string;
    tenant: string;
  }): void {
    this.activeConnectionSlots.delete(slot.connection);
    this.activeProviderSlots.delete(slot.provider);
    this.activeTenantSlots.delete(slot.tenant);
  }

  private reserveConcurrency(connection: IntegrationConnection): {
    connection: string;
    provider: string;
    tenant: string;
  } {
    const slot = {
      connection: String(connection.id),
      provider: String(connection.providerId),
      tenant: String(connection.tenantId),
    };

    if (
      this.activeConnectionSlots.has(slot.connection) ||
      this.activeProviderSlots.has(slot.provider) ||
      this.activeTenantSlots.has(slot.tenant)
    ) {
      throw new Error('CONCURRENCY_LIMIT_REACHED');
    }

    this.activeConnectionSlots.add(slot.connection);
    this.activeProviderSlots.add(slot.provider);
    this.activeTenantSlots.add(slot.tenant);

    return slot;
  }

  private requireAdapter(providerId: IntegrationProviderId): IntegrationAdapter {
    const adapter = this.adapters.get(providerId);

    if (!adapter) {
      throw new Error('ADAPTER_NOT_IMPLEMENTED');
    }

    return adapter;
  }

  private requireAvailableProvider(
    context: ApplicationSessionContext,
    providerId: IntegrationProviderId,
  ): IntegrationProvider {
    const provider = this.getProvider(providerId);

    if (!provider) {
      throw new Error('PROVIDER_NOT_FOUND');
    }

    if (!this.listAvailableProviders(context).some((item) => item.providerId === providerId)) {
      throw new Error('PROVIDER_NOT_AVAILABLE');
    }

    return provider;
  }

  private requireConnection(
    context: ApplicationSessionContext,
    connectionId: IntegrationConnectionId,
  ): IntegrationConnection {
    const connection = this.connections.get(connectionId);

    if (!connection) {
      throw new Error('NOT_FOUND');
    }

    this.assertScope(context, {
      tenantId: connection.tenantId,
      workspaceId: connection.workspaceId,
    });

    return connection;
  }

  private requireJob(context: ApplicationSessionContext, jobId: SyncJobId): SyncJob {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new Error('NOT_FOUND');
    }

    this.assertScope(context, {
      tenantId: job.tenantId,
      workspaceId: job.workspaceId,
    });

    return job;
  }

  private requireSourceRecord(
    context: ApplicationSessionContext,
    sourceRecordId: SourceRecord['id'],
  ): SourceRecord {
    const record = [...this.records.values()].find(
      (candidate) => candidate.id === sourceRecordId,
    );

    if (!record) {
      throw new Error('NOT_FOUND');
    }

    this.assertScope(context, {
      tenantId: record.tenantId,
      workspaceId: record.workspaceId,
    });

    return record;
  }

  private requireProvider(providerId: IntegrationProviderId): IntegrationProvider {
    const provider = this.getProvider(providerId);

    if (!provider) {
      throw new Error('PROVIDER_NOT_FOUND');
    }

    return provider;
  }

  private requireScopePolicy(providerId: IntegrationProviderId): ScopePolicy {
    const policy = providerCatalog.find((entry) => entry.provider.providerId === providerId)
      ?.scopePolicy;

    if (!policy) {
      throw new Error('SCOPE_POLICY_NOT_FOUND');
    }

    return policy;
  }

  private resolveIdempotency(input: {
    commandFingerprint: string;
    idempotencyKey: string;
    operationId: OperationId;
    resultRefPrefix: string;
    tenantId: string;
    workspaceId: string;
  }): {
    resultId: string;
    reused: boolean;
  } {
    const key = [input.tenantId, input.workspaceId, input.idempotencyKey].join(':');
    const existing = this.idempotency.get(key);

    if (existing) {
      if (existing.commandFingerprint !== input.commandFingerprint) {
        throw new Error('IDEMPOTENCY_FINGERPRINT_CONFLICT');
      }

      return {
        resultId: existing.resultId,
        reused: true,
      };
    }

    return {
      resultId: `${input.resultRefPrefix}:pending:${input.operationId}`,
      reused: false,
    };
  }

  private transitionConnectionStatus(
    connection: IntegrationConnection,
    status: IntegrationConnectionStatus,
    correlationId: ReturnType<typeof asCorrelationId>,
    reason: string,
  ): IntegrationConnection {
    if (!canTransitionConnection(connection.status, status)) {
      throw new Error(`CONNECTION_STATUS_CONFLICT:${connection.status}->${status}`);
    }

    return transitionConnection(connection, {
      correlationId,
      reason,
      status,
      timestamp: this.now(),
    }).connection;
  }

  private transitionConnectionWithError(
    connection: IntegrationConnection,
    status: IntegrationConnectionStatus,
    safeError: SafeIntegrationError,
    correlationId: ReturnType<typeof asCorrelationId>,
    reason: string,
  ): IntegrationConnection {
    return transitionConnection(connection, {
      correlationId,
      lastError: safeError,
      reason,
      status,
      timestamp: this.now(),
    }).connection;
  }

  private updateCheckpoint(input: {
    batchId: SourceBatch['id'];
    connection: IntegrationConnection;
    cursor: string | null;
    eventId: string;
    stream: string;
    watermark: string | null;
  }): SyncCheckpoint {
    const key = [
      input.connection.tenantId,
      input.connection.workspaceId,
      input.connection.id,
      input.stream,
    ].join(':');
    const previous = this.checkpoints.get(key) ?? null;

    if (this.failureInjection.kind === 'checkpoint_failure') {
      throw new IntegrationRuntimeError(
        createSafeError({
          code: 'CHECKPOINT_UPDATE_FAILED',
          correlationId: 'cor_checkpoint_failed',
          errorClass: 'TRANSIENT',
          impact: 'Source został zapisany, ale checkpoint nie został przesunięty.',
          nextAction: 'Recovery wznowi od ostatniego checkpointu.',
          retryable: true,
        }),
      );
    }

    const next = syncCheckpointSchema.parse({
      connectionId: input.connection.id,
      contractVersion: domainContractVersion,
      cursor: input.cursor,
      id: previous?.id ?? asCheckpointId(`chk_${input.connection.id}_${input.stream}`),
      lastBatchId: input.batchId,
      lastEventId: input.eventId,
      recordVersion: (previous?.recordVersion ?? 0) + 1,
      stream: input.stream,
      tenantId: input.connection.tenantId,
      timestamp: this.now(),
      watermark: input.watermark ?? previous?.watermark ?? null,
      workspaceId: input.connection.workspaceId,
    });
    this.writeOrder.push(`checkpoint:${next.id}`);
    this.checkpoints.set(key, next);

    return next;
  }
}

export function createDefaultIntegrationContext(): ApplicationSessionContext {
  const context = createApplicationSessionContext();

  return {
    ...context,
    capabilities: [
      ...new Set([
        ...context.capabilities,
        integrationCapabilities.backfill,
        integrationCapabilities.connect,
        integrationCapabilities.disconnect,
        integrationCapabilities.read,
        integrationCapabilities.replay,
        integrationCapabilities.sync,
      ]),
    ],
    entitlements: [
      ...context.entitlements,
      {
        capability: asCapability('integrations:commerce') as Capability,
        enabled: true,
        limitations: [],
        tenantId: context.tenant.tenantId,
        workspaceId: context.activeWorkspace.workspaceId,
      },
    ],
  };
}

export function createWave2Runtime(options: RuntimeOptions = {}): LocalIntegrationRuntime {
  return new LocalIntegrationRuntime(options);
}

export function createIntegrationApi(runtime: LocalIntegrationRuntime) {
  return {
    routes: integrationApiRoutes,
    createConnection: (
      context: ApplicationSessionContext,
      input: CreateConnectionInput,
    ) => runtime.createConnection(context, input),
    createSyncJob: (
      context: ApplicationSessionContext,
      input: SyncCommandInput,
    ) => runtime.createSyncJob(context, input),
    disconnect: (
      context: ApplicationSessionContext,
      input: {
        connectionId: IntegrationConnectionId;
        idempotencyKey: string;
        reason: string;
      },
    ) => runtime.disconnect(context, input),
    getOperation: (operationId: OperationId) => runtime.getOperation(operationId),
    listConnections: () => runtime.getSnapshot().connections,
    listProviders: () => runtime.listProviders(),
    reauthorize: (
      context: ApplicationSessionContext,
      input: {
        connectionId: IntegrationConnectionId;
        externalAccountRef: string;
        grantedScopes: readonly string[];
        idempotencyKey: string;
        requestedScopes: readonly string[];
      },
    ) => runtime.reauthorize(context, input),
    webhook: (
      context: ApplicationSessionContext,
      providerId: IntegrationProviderId,
      request: WebhookRequest,
    ) => runtime.handleWebhook(context, providerId, request),
  };
}
