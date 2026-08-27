import type {
  IntegrationProviderDescriptor,
  MvpIntegrationCatalogProviderId,
} from "@papadata/contracts";
import {
  mvpIntegrationCatalogProviderIds,
} from "@papadata/contracts";
import {
  ProviderAdapterError,
  createProviderAdapter,
  type IntegrationProviderAdapter,
  type ResolvedCredentialMaterial,
} from "@papadata/integrations";

export type ProviderReadiness =
  | "production_ready"
  | "pilot_ready"
  | "runtime_flagged"
  | "internal_only"
  | "disabled";

export type EnvironmentStatus =
  | "ready"
  | "missing"
  | "disabled"
  | "not_required";

export type IntegrationConnectionStatus =
  | "CONNECTED"
  | "DISCONNECTED"
  | "ERROR";

export type IntegrationDataSourceStatus =
  | "ACTIVE"
  | "DEGRADED"
  | "DISCONNECTED"
  | "DISABLED"
  | "ERROR";

export type IntegrationLifecycleStatus =
  | "READY"
  | "SYNCING"
  | "REAUTH_REQUIRED"
  | "RATE_LIMITED"
  | "FAILED"
  | "BLOCKED_BY_PLAN";

export type IntegrationSyncStatus =
  | "IDLE"
  | "RUNNING"
  | "FAILED"
  | "SUCCEEDED";

export type InitialBackfillStatus =
  | "NOT_STARTED"
  | "QUEUED"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED";

export type CompletenessStatus =
  | "COMPLETE"
  | "PARTIAL"
  | "MISSING";

export type BusinessSourceStatus =
  | "working"
  | "syncing"
  | "action_required";

export type IntegrationCredentialTestRequest = Readonly<Record<string, unknown>>;

export type IntegrationCredentialTestResult = {
  readonly provider: MvpIntegrationCatalogProviderId;
  readonly formValidation: {
    readonly status: "passed" | "failed";
    readonly message: string;
    readonly fieldErrors: Readonly<Record<string, string>>;
  };
  readonly providerTest: {
    readonly status: "not_run" | "passed" | "failed";
    readonly message: string;
    readonly failureClass?: string;
    readonly retryAfterSeconds?: number | null;
  };
  readonly canSave: boolean;
};

export type IntegrationRuntimeCatalogProvider = {
  readonly provider: MvpIntegrationCatalogProviderId;
  readonly providerId: MvpIntegrationCatalogProviderId;
  readonly displayName: string;
  readonly category: IntegrationProviderDescriptor["category"] | "import";
  readonly categoryLabel: string;
  readonly readiness: ProviderReadiness;
  readonly environmentStatus: EnvironmentStatus;
  readonly connectable: boolean;
  readonly availabilityLabel: string;
  readonly authType: "oauth" | "api_key" | "basic_auth";
  readonly supportedStreams: readonly string[];
  readonly requiredScopes: readonly string[];
  readonly optionalScopes: readonly string[];
  readonly supportsWebhooks: boolean;
  readonly dataCollected: readonly string[];
  readonly unlocks: readonly string[];
  readonly updateCadence: string;
  readonly security: readonly string[];
  readonly limitations: readonly string[];
  readonly connectedCount: number;
};

export type IntegrationRuntimeSource = {
  readonly integrationId: string;
  readonly provider: MvpIntegrationCatalogProviderId;
  readonly providerDisplayName: string;
  readonly displayName: string;
  readonly accountName: string | null;
  readonly externalAccountId: string | null;
  readonly externalAccountIdMasked: string | null;
  readonly category: IntegrationProviderDescriptor["category"] | "import";
  readonly authType: "oauth" | "api_key" | "basic_auth";
  readonly providerReadiness: ProviderReadiness;
  readonly connectionStatus: IntegrationConnectionStatus;
  readonly dataSourceStatus: IntegrationDataSourceStatus;
  readonly lifecycleStatus: IntegrationLifecycleStatus;
  readonly syncStatus: IntegrationSyncStatus;
  readonly businessStatus: BusinessSourceStatus;
  readonly businessStatusLabel: string;
  readonly nextStep: string;
  readonly primaryAction: {
    readonly id:
      | "details"
      | "backfill"
      | "sync"
      | "reauth"
      | "fix"
      | "plan";
    readonly label: string;
  };
  readonly canManage: boolean;
  readonly blockedByPlan: boolean;
  readonly initialBackfill: {
    readonly status: InitialBackfillStatus;
    readonly progress: number;
    readonly coverageDays: number;
    readonly completedDays: number;
    readonly lastBackfillAt: string | null;
  };
  readonly latestSyncRun: IntegrationRuntimeLog | null;
  readonly completeness: {
    readonly percentage: number;
    readonly status: CompletenessStatus;
    readonly days: readonly SourceCompletenessDay[];
  };
  readonly freshness: {
    readonly watermark: string | null;
    readonly lastSuccessfulSyncAt: string | null;
    readonly ageMinutes: number | null;
    readonly label: string;
  };
  readonly issue: {
    readonly code: string;
    readonly severity: "error" | "warning";
    readonly message: string;
  } | null;
  readonly impact: {
    readonly areas: readonly string[];
    readonly kpis: readonly string[];
    readonly ai: string;
  };
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
};

export type SourceCompletenessDay = {
  readonly date: string;
  readonly status: CompletenessStatus;
  readonly recordCount: number;
  readonly latestIngestedAt: string | null;
};

export type IntegrationRuntimeLog = {
  readonly jobId: string;
  readonly integrationId: string;
  readonly provider: MvpIntegrationCatalogProviderId;
  readonly providerDisplayName: string;
  readonly type: "initial_sync" | "incremental_sync" | "backfill" | "reprocess" | "reconcile" | "recovery" | "retry";
  readonly startedAt: string | null;
  readonly finishedAt: string | null;
  readonly durationMs: number | null;
  readonly status: "completed" | "running" | "attention";
  readonly statusLabel: string;
  readonly recordsRead: number | null;
  readonly recordsWritten: number | null;
  readonly errorCode: string | null;
  readonly safeErrorMessage: string | null;
  readonly createdAt: string | null;
};

export type IntegrationDomainReadiness = {
  readonly id:
    | "sales_orders"
    | "traffic_behavior"
    | "paid_campaigns"
    | "products_inventory"
    | "customers_retention"
    | "margin_costs"
    | "papa_assistant";
  readonly label: string;
  readonly readiness: number;
  readonly status: CompletenessStatus;
  readonly requiredSources: readonly string[];
  readonly connectedRequiredSources: readonly string[];
  readonly missingRequiredSources: readonly string[];
  readonly supportingSources: readonly string[];
  readonly blockedKpis: readonly string[];
};

export type IntegrationRuntimeStatus = {
  readonly generatedAt: string;
  readonly runtime: "current";
  readonly plan: {
    readonly dataSourcesUsed: number;
    readonly dataSourcesLimit: number;
    readonly overLimit: boolean;
    readonly blockedByPlanCount: number;
  };
  readonly summary: {
    readonly activeSources: number;
    readonly actionRequired: number;
    readonly syncingSources: number;
    readonly completenessPercentage: number;
    readonly queuedBackfills: number;
    readonly runningBackfills: number;
    readonly lockedBackfills: number;
    readonly healthTitle: string;
    readonly healthDescription: string;
    readonly lastUpdatedAt: string;
  };
  readonly sources: readonly IntegrationRuntimeSource[];
  readonly alerts: readonly {
    readonly id: string;
    readonly sourceId: string | null;
    readonly tone: "critical" | "warning" | "info";
    readonly title: string;
    readonly message: string;
    readonly actionLabel: string | null;
  }[];
};

export type IntegrationCompletenessRuntime = {
  readonly generatedAt: string;
  readonly global: {
    readonly title: string;
    readonly percentage: number;
    readonly description: string;
  };
  readonly domains: readonly IntegrationDomainReadiness[];
  readonly sources: readonly Pick<
    IntegrationRuntimeSource,
    "integrationId" | "provider" | "providerDisplayName" | "displayName" | "completeness" | "freshness" | "impact" | "businessStatus"
  >[];
  readonly blockers: readonly {
    readonly id: string;
    readonly title: string;
    readonly message: string;
    readonly blockedKpis: readonly string[];
  }[];
};

export type BuildIntegrationRuntimeInput = {
  readonly descriptors: readonly IntegrationProviderDescriptor[];
  readonly hasAdapter: (provider: MvpIntegrationCatalogProviderId) => boolean;
  readonly connections: readonly Record<string, unknown>[];
  readonly jobs: readonly Record<string, unknown>[];
  readonly checkpoints: readonly Record<string, unknown>[];
  readonly issues: readonly Record<string, unknown>[];
  readonly coverageRows: readonly Record<string, unknown>[];
  readonly reconciliationRows: readonly Record<string, unknown>[];
  readonly now?: Date;
  readonly planLimit?: number;
};

type AdapterFactory = (credential: ResolvedCredentialMaterial) => IntegrationProviderAdapter;

const productionReadyProviderIds = new Set<MvpIntegrationCatalogProviderId>([
  "woocommerce",
  "baselinker",
  "google_ads",
  "meta_ads",
  "ga4",
]);

const pilotReadyProviderIds = new Set<MvpIntegrationCatalogProviderId>([
  "shopify",
]);

const internalOnlyProviderIds = new Set<MvpIntegrationCatalogProviderId>([
  "allegro",
]);

const defaultCoverageDays = 90;
const defaultPlanLimit = 7;

const providerPresentation: Record<MvpIntegrationCatalogProviderId, {
  readonly authType: "oauth" | "api_key" | "basic_auth";
  readonly dataCollected: readonly string[];
  readonly unlocks: readonly string[];
  readonly updateCadence: string;
  readonly security: readonly string[];
  readonly limitations: readonly string[];
}> = {
  woocommerce: {
    authType: "api_key",
    dataCollected: [
      "zamówienia",
      "produkty",
      "refundacje",
      "stany magazynowe",
    ],
    unlocks: [
      "sprzedaż i przychód",
      "AOV",
      "produkty i magazyn",
      "kontekst Papa Asystenta",
    ],
    updateCadence: "co godzinę po pierwszym pobraniu danych",
    security: [
      "klucz zapisujemy jako secret reference",
      "po zapisaniu sekret nie jest ponownie wyświetlany",
      "źródło można wyłączyć albo rozłączyć",
    ],
    limitations: [],
  },
  shopify: {
    authType: "oauth",
    dataCollected: [
      "zamówienia",
      "produkty",
      "refundacje",
      "inventory",
    ],
    unlocks: [
      "sprzedaż i przychód",
      "produkty",
      "retencję",
      "unit economics",
    ],
    updateCadence: "co godzinę po dopuszczeniu providera",
    security: [
      "OAuth bez ujawniania tokenu",
      "dostęp można odwołać",
    ],
    limitations: ["Provider pozostaje w pilotażu runtime."],
  },
  baselinker: {
    authType: "api_key",
    dataCollected: [
      "zamówienia",
      "produkty",
      "inventory",
    ],
    unlocks: [
      "sprzedaż wielokanałową",
      "produkty i magazyn",
      "kontekst operacyjny Papa Asystenta",
    ],
    updateCadence: "co godzinę po pierwszym pobraniu danych",
    security: [
      "token zapisujemy jako secret reference",
      "wartość tokenu nie wraca do UI",
      "każda zmiana credentiala wymaga step-up",
    ],
    limitations: [],
  },
  allegro: {
    authType: "oauth",
    dataCollected: [
      "zamówienia",
      "oferty",
      "refundacje",
      "inventory",
    ],
    unlocks: [
      "sprzedaż marketplace",
      "produkty",
      "marżę i koszty po uzupełnieniu danych",
    ],
    updateCadence: "po aktywacji providera",
    security: [
      "OAuth bez ujawniania tokenu",
      "rewokacja przy rozłączeniu, jeżeli provider ją wspiera",
    ],
    limitations: ["Provider nie jest aktualnie dopuszczony do runtime produkcyjnego."],
  },
  google_ads: {
    authType: "oauth",
    dataCollected: [
      "koszt",
      "kampanie",
      "kliknięcia",
      "wyświetlenia",
      "konwersje",
      "wartość konwersji",
    ],
    unlocks: [
      "ROAS",
      "CAC",
      "analizę kampanii",
      "rekomendacje budżetowe",
      "odpowiedzi Papa Asystenta o paid media",
    ],
    updateCadence: "co godzinę po pierwszym pobraniu danych",
    security: [
      "OAuth z minimalnym zakresem odczytu",
      "token nie jest widoczny po zapisie",
      "ponowna autoryzacja nie usuwa historii analitycznej",
    ],
    limitations: [],
  },
  meta_ads: {
    authType: "oauth",
    dataCollected: [
      "koszt",
      "kampanie",
      "zestawy reklam",
      "reklamy",
      "kliknięcia",
      "konwersje",
    ],
    unlocks: [
      "ROAS",
      "CAC",
      "porównanie kanałów",
      "rekomendacje budżetowe",
    ],
    updateCadence: "co godzinę po pierwszym pobraniu danych",
    security: [
      "OAuth lub token systemowy jako secret reference",
      "raw token nie trafia do UI ani logów",
      "rozłączenie zatrzymuje kolejne synchronizacje",
    ],
    limitations: [],
  },
  ga4: {
    authType: "oauth",
    dataCollected: [
      "sesje",
      "użytkownicy",
      "źródło / medium",
      "zdarzenia",
      "konwersje",
      "ścieżka e-commerce",
    ],
    unlocks: [
      "analizę ruchu",
      "konwersję",
      "funnel",
      "kontekst Papa Asystenta o zachowaniu klientów",
    ],
    updateCadence: "co godzinę po pierwszym pobraniu danych",
    security: [
      "OAuth z zakresem analytics.readonly",
      "token nie jest ujawniany po zapisie",
      "źródło można rozłączyć bez usuwania historii analitycznej",
    ],
    limitations: [],
  },
};

const categoryLabels: Record<IntegrationProviderDescriptor["category"] | "import", string> = {
  advertising: "Reklama",
  analytics: "Analityka i marketing",
  commerce: "Sprzedaż i marketplace",
  import: "Import danych",
};

const providerImpact: Record<MvpIntegrationCatalogProviderId, IntegrationRuntimeSource["impact"]> = {
  woocommerce: {
    areas: [
      "Sprzedaż i zamówienia",
      "Produkty i magazyn",
      "Klienci i retencja",
      "Centrum Dowodzenia",
    ],
    kpis: ["Przychód", "Zamówienia", "AOV", "Inventory", "LTV"],
    ai: "Brak WooCommerce ogranicza pewność odpowiedzi o sprzedaży, produktach, klientach i marży.",
  },
  shopify: {
    areas: [
      "Sprzedaż i zamówienia",
      "Produkty i magazyn",
      "Klienci i retencja",
      "Centrum Dowodzenia",
    ],
    kpis: ["Przychód", "Zamówienia", "AOV", "Inventory", "LTV"],
    ai: "Brak Shopify ogranicza pewność odpowiedzi o sprzedaży, produktach, klientach i marży.",
  },
  baselinker: {
    areas: [
      "Sprzedaż wielokanałowa",
      "Produkty i magazyn",
      "Centrum Dowodzenia",
      "Papa Asystent",
    ],
    kpis: ["Przychód", "Zamówienia", "Inventory", "Produkty"],
    ai: "Brak BaseLinkera zmniejsza pewność rekomendacji operacyjnych dla sprzedaży wielokanałowej.",
  },
  allegro: {
    areas: [
      "Marketplace",
      "Sprzedaż i zamówienia",
      "Produkty",
      "Papa Asystent",
    ],
    kpis: ["Przychód marketplace", "Zamówienia", "Inventory"],
    ai: "Brak Allegro ogranicza analizy kanału marketplace.",
  },
  google_ads: {
    areas: [
      "Kampanie płatne",
      "ROAS",
      "CAC",
      "Centrum Dowodzenia",
      "Papa Asystent",
    ],
    kpis: ["Wydatki reklamowe", "ROAS", "CAC", "Konwersje"],
    ai: "Brak Google Ads ogranicza pewność rekomendacji dotyczących budżetu reklamowego.",
  },
  meta_ads: {
    areas: [
      "Kampanie płatne",
      "ROAS",
      "CAC",
      "Centrum Dowodzenia",
      "Papa Asystent",
    ],
    kpis: ["Wydatki reklamowe", "ROAS", "CAC", "Konwersje"],
    ai: "Brak Meta Ads obniża pewność analiz kampanii social ads.",
  },
  ga4: {
    areas: [
      "Ruch i zachowanie",
      "Funnel",
      "Konwersja",
      "Centrum Dowodzenia",
      "Papa Asystent",
    ],
    kpis: ["Sesje", "Użytkownicy", "Konwersja", "Źródła ruchu"],
    ai: "Brak GA4 ogranicza pewność odpowiedzi o ruchu, zachowaniu i ścieżce zakupowej.",
  },
};

export function isMvpProviderId(
  value: string,
): value is MvpIntegrationCatalogProviderId {
  return (mvpIntegrationCatalogProviderIds as readonly string[]).includes(value);
}

export function resolveProviderReadiness(
  provider: MvpIntegrationCatalogProviderId,
): ProviderReadiness {
  if (productionReadyProviderIds.has(provider)) return "production_ready";
  if (pilotReadyProviderIds.has(provider)) return "pilot_ready";
  if (internalOnlyProviderIds.has(provider)) return "internal_only";
  return "disabled";
}

export function buildIntegrationCatalog(
  input: Pick<BuildIntegrationRuntimeInput, "descriptors" | "hasAdapter" | "connections">,
): readonly IntegrationRuntimeCatalogProvider[] {
  const connectedCounts = countConnectionsByProvider(input.connections);
  return input.descriptors.map((descriptor) => createCatalogProvider({
    descriptor,
    hasAdapter: input.hasAdapter(descriptor.providerId),
    connectedCount: connectedCounts.get(descriptor.providerId) ?? 0,
  }));
}

export function buildIntegrationRuntimeStatus(
  input: BuildIntegrationRuntimeInput,
): IntegrationRuntimeStatus {
  const now = input.now ?? new Date();
  const generatedAt = now.toISOString();
  const planLimit = input.planLimit ?? defaultPlanLimit;
  const descriptorsByProvider = new Map(
    input.descriptors.map((descriptor) => [descriptor.providerId, descriptor]),
  );
  const logs = buildIntegrationLogs({
    descriptors: input.descriptors,
    jobs: input.jobs,
    reconciliationRows: input.reconciliationRows,
  });
  const logsByJob = new Map(logs.map((log) => [log.jobId, log]));
  const jobsByConnection = groupRowsByString(input.jobs, "connection_id", "connectionId");
  const checkpointsByConnection = groupRowsByString(input.checkpoints, "connection_id", "connectionId");
  const issuesByConnection = groupRowsByString(input.issues, "connection_id", "connectionId");
  const coverageByConnection = groupCoverageRowsByConnection(input.coverageRows);
  const activeConnectionCount = input.connections
    .filter((connection) => readString(connection.status) !== "disconnected")
    .length;
  const blockedByPlanCount = Math.max(0, activeConnectionCount - planLimit);
  const blockedConnectionIds = new Set(
    input.connections
      .filter((connection) => readString(connection.status) !== "disconnected")
      .slice(planLimit)
      .map((connection) => rowId(connection))
      .filter((id): id is string => Boolean(id)),
  );

  const sources = input.connections.map((connection) => {
    const provider = readProvider(connection.provider_id ?? connection.providerId);
    const descriptor = provider ? descriptorsByProvider.get(provider) ?? null : null;
    const connectionId = rowId(connection) ?? "unknown";
    const sourceJobs = jobsByConnection.get(connectionId) ?? [];
    const latestJob = latestJobRow(sourceJobs);
    const latestBackfill = latestBackfillJob(sourceJobs);
    const sourceCheckpoints = checkpointsByConnection.get(connectionId) ?? [];
    const sourceIssues = issuesByConnection.get(connectionId) ?? [];
    const latestIssue = sourceIssues[0] ?? null;
    const completenessDays = buildSourceCompletenessDays(
      coverageByConnection.get(connectionId) ?? [],
      now,
    );
    const completeness = summarizeCompleteness(completenessDays);
    const blockedByPlan = blockedConnectionIds.has(connectionId);
    const providerId = provider ?? "woocommerce";
    const syncStatus = resolveSyncStatus(latestJob);
    const initialBackfill = resolveInitialBackfill({
      completedDays: completenessDays.filter((day) => day.status === "COMPLETE").length,
      coverageDays: defaultCoverageDays,
      latestBackfill,
    });
    const freshness = resolveFreshness({
      checkpoints: sourceCheckpoints,
      latestSuccessfulJob: latestSuccessfulJobRow(sourceJobs),
      now,
    });
    const connectionStatus = resolveConnectionStatus(connection);
    const lifecycleStatus = resolveLifecycleStatus({
      blockedByPlan,
      connection,
      latestJob,
      latestIssue,
      initialBackfillStatus: initialBackfill.status,
    });
    const dataSourceStatus = resolveDataSourceStatus({
      blockedByPlan,
      completenessStatus: completeness.status,
      connectionStatus,
      lifecycleStatus,
      latestIssue,
    });
    const businessStatus = resolveBusinessStatus({
      connectionStatus,
      dataSourceStatus,
      initialBackfillStatus: initialBackfill.status,
      lifecycleStatus,
      syncStatus,
    });
    const primaryAction = resolvePrimaryAction({
      businessStatus,
      initialBackfillStatus: initialBackfill.status,
      lifecycleStatus,
    });

    return {
      accountName: readString(connection.account_name ?? connection.accountName),
      authType: providerPresentation[providerId].authType,
      blockedByPlan,
      businessStatus,
      businessStatusLabel: businessStatusLabel(businessStatus),
      canManage: true,
      category: descriptor?.category ?? "commerce",
      completeness,
      connectionStatus,
      createdAt: readIso(connection.created_at ?? connection.createdAt),
      dataSourceStatus,
      displayName: readSourceDisplayName(connection, descriptor),
      externalAccountId: readString(connection.external_account_id ?? connection.externalAccountId),
      externalAccountIdMasked: maskExternalAccountId(
        readString(connection.external_account_id ?? connection.externalAccountId),
      ),
      freshness,
      impact: providerImpact[providerId],
      initialBackfill,
      integrationId: connectionId,
      issue: latestIssue ? {
        code: readString(latestIssue.code) ?? "DATA_ISSUE",
        message: sanitizeProviderMessage(readString(latestIssue.message))
          ?? "Wykryto problem jakości danych.",
        severity: readString(latestIssue.severity) === "error" ? "error" : "warning",
      } : issueFromLatestJob(latestJob),
      latestSyncRun: latestJob ? logsByJob.get(String(latestJob.id ?? latestJob.sync_job_id)) ?? null : null,
      lifecycleStatus,
      nextStep: resolveNextStep({
        businessStatus,
        initialBackfillStatus: initialBackfill.status,
        lifecycleStatus,
      }),
      primaryAction,
      provider: providerId,
      providerDisplayName: descriptor?.displayName ?? providerId,
      providerReadiness: resolveProviderReadiness(providerId),
      syncStatus,
      updatedAt: readIso(connection.updated_at ?? connection.updatedAt),
    } satisfies IntegrationRuntimeSource;
  });

  const activeSources = sources.filter((source) => source.connectionStatus === "CONNECTED").length;
  const actionRequired = sources.filter((source) => source.businessStatus === "action_required").length;
  const syncingSources = sources.filter((source) => source.businessStatus === "syncing").length;
  const completenessPercentage = roundedAverage(
    sources.map((source) => source.completeness.percentage),
  );
  const queuedBackfills = sources.filter((source) => source.initialBackfill.status === "QUEUED").length;
  const runningBackfills = sources.filter((source) => source.initialBackfill.status === "RUNNING").length;
  const lockedBackfills = sources.filter((source) => source.lifecycleStatus === "RATE_LIMITED").length;
  const summary = {
    activeSources,
    actionRequired,
    completenessPercentage,
    healthDescription: resolveHealthDescription({
      actionRequired,
      activeSources,
      completenessPercentage,
      sources,
      syncingSources,
    }),
    healthTitle: resolveHealthTitle({
      actionRequired,
      completenessPercentage,
      sources,
    }),
    lastUpdatedAt: generatedAt,
    lockedBackfills,
    queuedBackfills,
    runningBackfills,
    syncingSources,
  };

  return {
    alerts: buildRuntimeAlerts(sources),
    generatedAt,
    plan: {
      blockedByPlanCount,
      dataSourcesLimit: planLimit,
      dataSourcesUsed: activeConnectionCount,
      overLimit: blockedByPlanCount > 0,
    },
    runtime: "current",
    sources,
    summary,
  };
}

export function buildIntegrationLogs(input: {
  readonly descriptors: readonly IntegrationProviderDescriptor[];
  readonly jobs: readonly Record<string, unknown>[];
  readonly reconciliationRows: readonly Record<string, unknown>[];
}): readonly IntegrationRuntimeLog[] {
  const descriptorsByProvider = new Map(
    input.descriptors.map((descriptor) => [descriptor.providerId, descriptor]),
  );
  const reconciliationByJob = groupReconciliationByJob(input.reconciliationRows);

  return input.jobs.map((job) => {
    const provider = readProvider(job.provider_id ?? job.providerId) ?? "woocommerce";
    const startedAt = readIso(job.started_at ?? job.startedAt);
    const finishedAt = readIso(job.completed_at ?? job.completedAt);
    const reconciliation = reconciliationByJob.get(String(job.id ?? job.sync_job_id)) ?? null;
    return {
      createdAt: readIso(job.created_at ?? job.createdAt),
      durationMs: startedAt && finishedAt
        ? Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt))
        : null,
      errorCode: readString(job.error_code ?? job.errorCode),
      finishedAt,
      integrationId: readString(job.connection_id ?? job.connectionId) ?? "unknown",
      jobId: readString(job.id ?? job.sync_job_id ?? job.jobId) ?? "unknown",
      provider,
      providerDisplayName: descriptorsByProvider.get(provider)?.displayName ?? provider,
      recordsRead: readNumber(reconciliation?.fetched_count ?? reconciliation?.fetchedCount),
      recordsWritten: readNumber(reconciliation?.canonical_count ?? reconciliation?.canonicalCount),
      safeErrorMessage: sanitizeProviderMessage(readString(job.error_message ?? job.errorMessage)),
      startedAt,
      status: resolveLogStatus(job),
      statusLabel: resolveLogStatusLabel(job),
      type: normalizeJobKind(readString(job.job_kind ?? job.operation ?? job.jobKind)),
    };
  });
}

export function buildIntegrationCompleteness(
  status: IntegrationRuntimeStatus,
): IntegrationCompletenessRuntime {
  const domains = buildDomainReadiness(status.sources);
  const blockers = domains
    .filter((domain) => domain.missingRequiredSources.length > 0 || domain.blockedKpis.length > 0)
    .map((domain) => ({
      blockedKpis: domain.blockedKpis,
      id: domain.id,
      message: domain.missingRequiredSources.length > 0
        ? `Brakuje wymaganych danych: ${domain.missingRequiredSources.join(", ")}.`
        : `${domain.label} ma częściową kompletność danych.`,
      title: domain.label,
    }));

  return {
    blockers,
    domains,
    generatedAt: status.generatedAt,
    global: {
      description: globalCompletenessDescription(status.summary.completenessPercentage, blockers),
      percentage: status.summary.completenessPercentage,
      title: globalCompletenessTitle(status.summary.completenessPercentage, blockers),
    },
    sources: status.sources.map((source) => ({
      businessStatus: source.businessStatus,
      completeness: source.completeness,
      displayName: source.displayName,
      freshness: source.freshness,
      impact: source.impact,
      integrationId: source.integrationId,
      provider: source.provider,
      providerDisplayName: source.providerDisplayName,
    })),
  };
}

export async function testProviderCredential(
  provider: MvpIntegrationCatalogProviderId,
  request: IntegrationCredentialTestRequest,
  adapterFactory: AdapterFactory = createProviderAdapter,
): Promise<IntegrationCredentialTestResult> {
  const descriptor = providerPresentation[provider];
  const readiness = resolveProviderReadiness(provider);
  const formValidation = validateProviderCredentialForm(provider, request);

  if (readiness !== "production_ready") {
    return {
      canSave: false,
      formValidation,
      provider,
      providerTest: {
        message: availabilityMessage(readiness),
        status: "failed",
      },
    };
  }

  if (formValidation.status === "failed") {
    return {
      canSave: false,
      formValidation,
      provider,
      providerTest: {
        message: "Test providera nie został uruchomiony, bo formularz wymaga poprawy.",
        status: "not_run",
      },
    };
  }

  try {
    const credential = credentialFromRequest(provider, request, descriptor.authType);
    const adapter = adapterFactory(credential);
    if (!adapter.isConfigured()) {
      return {
        canSave: false,
        formValidation,
        provider,
        providerTest: {
          message: "Credential nie zawiera kompletu danych wymaganych przez providera.",
          failureClass: "validation",
          status: "failed",
        },
      };
    }

    await adapter.verifyConnection();

    return {
      canSave: true,
      formValidation,
      provider,
      providerTest: {
        message: `${displayName(provider)} potwierdził połączenie.`,
        status: "passed",
      },
    };
  } catch (cause) {
    if (cause instanceof ProviderAdapterError) {
      return {
        canSave: false,
        formValidation,
        provider,
        providerTest: {
          failureClass: cause.failureClass,
          message: providerFailureMessage(cause.failureClass),
          retryAfterSeconds: cause.retryAfterSeconds,
          status: "failed",
        },
      };
    }

    return {
      canSave: false,
      formValidation,
      provider,
      providerTest: {
        failureClass: "transient",
        message: "Nie udało się potwierdzić połączenia u providera. Zapis połączenia pozostaje zablokowany.",
        retryAfterSeconds: null,
        status: "failed",
      },
    };
  }
}

export function validateProviderCredentialForm(
  provider: MvpIntegrationCatalogProviderId,
  request: IntegrationCredentialTestRequest,
): IntegrationCredentialTestResult["formValidation"] {
  const fieldErrors: Record<string, string> = {};
  const required = (field: string, label: string) => {
    if (!trimmedString(request[field])) {
      fieldErrors[field] = `${label} jest wymagane.`;
    }
  };

  switch (provider) {
    case "woocommerce":
      required("storeUrl", "Adres sklepu");
      required("consumerKey", "Consumer key");
      required("consumerSecret", "Consumer secret");
      if (trimmedString(request.storeUrl) && !isHttpUrl(trimmedString(request.storeUrl)!)) {
        fieldErrors.storeUrl = "Adres sklepu musi zaczynać się od http:// albo https://.";
      }
      break;
    case "baselinker":
      required("token", "Token API");
      if (trimmedString(request.token) && trimmedString(request.token)!.length < 10) {
        fieldErrors.token = "Token API jest zbyt krótki.";
      }
      break;
    case "google_ads":
      required("developerToken", "Developer token");
      required("customerId", "Customer ID");
      requireOAuthTokenShape(request, fieldErrors);
      break;
    case "meta_ads":
      required("accountId", "Account ID");
      required("accessToken", "Access token");
      break;
    case "ga4":
      required("propertyId", "Property ID");
      requireOAuthTokenShape(request, fieldErrors);
      break;
    case "shopify":
      required("shopDomain", "Domena sklepu");
      required("accessToken", "Access token");
      break;
    case "allegro":
      requireOAuthTokenShape(request, fieldErrors);
      break;
  }

  const hasErrors = Object.keys(fieldErrors).length > 0;

  return {
    fieldErrors,
    message: hasErrors
      ? "Dane formularza wymagają poprawy."
      : "Dane mają poprawny format.",
    status: hasErrors ? "failed" : "passed",
  };
}

function createCatalogProvider(input: {
  readonly descriptor: IntegrationProviderDescriptor;
  readonly hasAdapter: boolean;
  readonly connectedCount: number;
}): IntegrationRuntimeCatalogProvider {
  const readiness = resolveProviderReadiness(input.descriptor.providerId);
  const environmentStatus: EnvironmentStatus = !input.hasAdapter
    ? "missing"
    : readiness === "disabled"
      ? "disabled"
      : "ready";
  const connectable = readiness === "production_ready"
    && input.hasAdapter
    && environmentStatus === "ready";
  const presentation = providerPresentation[input.descriptor.providerId];

  return {
    authType: presentation.authType,
    availabilityLabel: providerAvailabilityLabel({
      connectable,
      environmentStatus,
      readiness,
    }),
    category: input.descriptor.category,
    categoryLabel: categoryLabels[input.descriptor.category],
    connectable,
    connectedCount: input.connectedCount,
    dataCollected: presentation.dataCollected,
    displayName: input.descriptor.displayName,
    environmentStatus,
    limitations: presentation.limitations,
    optionalScopes: input.descriptor.optionalScopes,
    provider: input.descriptor.providerId,
    providerId: input.descriptor.providerId,
    readiness,
    requiredScopes: input.descriptor.requiredScopes,
    security: presentation.security,
    supportedStreams: input.descriptor.supportedStreams,
    supportsWebhooks: input.descriptor.supportsWebhooks,
    unlocks: presentation.unlocks,
    updateCadence: presentation.updateCadence,
  };
}

function countConnectionsByProvider(
  connections: readonly Record<string, unknown>[],
): Map<MvpIntegrationCatalogProviderId, number> {
  const counts = new Map<MvpIntegrationCatalogProviderId, number>();
  for (const connection of connections) {
    const provider = readProvider(connection.provider_id ?? connection.providerId);
    if (!provider || readString(connection.status) === "disconnected") continue;
    counts.set(provider, (counts.get(provider) ?? 0) + 1);
  }
  return counts;
}

function resolveConnectionStatus(
  connection: Record<string, unknown>,
): IntegrationConnectionStatus {
  const status = readString(connection.status);
  if (status === "active") return "CONNECTED";
  if (status === "reauthorization_required") return "ERROR";
  return "DISCONNECTED";
}

function resolveLifecycleStatus(input: {
  readonly blockedByPlan: boolean;
  readonly connection: Record<string, unknown>;
  readonly latestJob: Record<string, unknown> | null;
  readonly latestIssue: Record<string, unknown> | null;
  readonly initialBackfillStatus: InitialBackfillStatus;
}): IntegrationLifecycleStatus {
  if (input.blockedByPlan) return "BLOCKED_BY_PLAN";
  const connectionStatus = readString(input.connection.status);
  if (connectionStatus === "reauthorization_required") return "REAUTH_REQUIRED";
  if (connectionStatus !== "active") return "FAILED";

  const jobStatus = readString(input.latestJob?.status);
  const issueCode = readString(input.latestIssue?.code);
  if (jobStatus === "rate_limited" || issueCode === "RATE_LIMITED") {
    return "RATE_LIMITED";
  }
  if (jobStatus && ["queued", "running", "retry_wait"].includes(jobStatus)) {
    return "SYNCING";
  }
  if (jobStatus && ["failed", "dlq"].includes(jobStatus)) {
    return "FAILED";
  }
  if (input.initialBackfillStatus === "QUEUED" || input.initialBackfillStatus === "RUNNING") {
    return "SYNCING";
  }
  if (input.initialBackfillStatus === "FAILED") {
    return "FAILED";
  }
  return "READY";
}

function resolveDataSourceStatus(input: {
  readonly blockedByPlan: boolean;
  readonly completenessStatus: CompletenessStatus;
  readonly connectionStatus: IntegrationConnectionStatus;
  readonly lifecycleStatus: IntegrationLifecycleStatus;
  readonly latestIssue: Record<string, unknown> | null;
}): IntegrationDataSourceStatus {
  if (input.blockedByPlan) return "DISABLED";
  if (input.connectionStatus !== "CONNECTED") return "DISCONNECTED";
  if (input.lifecycleStatus === "FAILED" || input.lifecycleStatus === "REAUTH_REQUIRED") return "ERROR";
  if (input.completenessStatus === "MISSING") return "DEGRADED";
  if (input.completenessStatus === "PARTIAL" || input.latestIssue) return "DEGRADED";
  return "ACTIVE";
}

function resolveSyncStatus(job: Record<string, unknown> | null): IntegrationSyncStatus {
  const status = readString(job?.status);
  if (!status) return "IDLE";
  if (["queued", "running", "retry_wait", "rate_limited"].includes(status)) return "RUNNING";
  if (["failed", "dlq"].includes(status)) return "FAILED";
  if (["succeeded", "partial_success", "recovered"].includes(status)) return "SUCCEEDED";
  return "IDLE";
}

export function resolveBusinessStatus(input: {
  readonly connectionStatus: IntegrationConnectionStatus;
  readonly dataSourceStatus: IntegrationDataSourceStatus;
  readonly initialBackfillStatus: InitialBackfillStatus;
  readonly lifecycleStatus: IntegrationLifecycleStatus;
  readonly syncStatus: IntegrationSyncStatus;
}): BusinessSourceStatus {
  if (
    input.lifecycleStatus === "BLOCKED_BY_PLAN"
    || input.lifecycleStatus === "REAUTH_REQUIRED"
    || input.lifecycleStatus === "FAILED"
    || input.connectionStatus !== "CONNECTED"
    || input.dataSourceStatus === "ERROR"
    || input.dataSourceStatus === "DISCONNECTED"
  ) {
    return "action_required";
  }

  if (
    input.lifecycleStatus === "SYNCING"
    || input.lifecycleStatus === "RATE_LIMITED"
    || input.syncStatus === "RUNNING"
    || input.initialBackfillStatus === "QUEUED"
    || input.initialBackfillStatus === "RUNNING"
  ) {
    return "syncing";
  }

  return "working";
}

function resolveInitialBackfill(input: {
  readonly completedDays: number;
  readonly coverageDays: number;
  readonly latestBackfill: Record<string, unknown> | null;
}): IntegrationRuntimeSource["initialBackfill"] {
  const status = readString(input.latestBackfill?.status);
  let backfillStatus: InitialBackfillStatus = "NOT_STARTED";
  if (status && ["queued", "retry_wait"].includes(status)) backfillStatus = "QUEUED";
  if (status && ["running", "rate_limited"].includes(status)) backfillStatus = "RUNNING";
  if (status && ["succeeded", "partial_success", "recovered"].includes(status)) backfillStatus = "SUCCEEDED";
  if (status && ["failed", "dlq"].includes(status)) backfillStatus = "FAILED";

  if (!status && input.completedDays > 0) {
    backfillStatus = input.completedDays >= Math.ceil(input.coverageDays * 0.95)
      ? "SUCCEEDED"
      : "RUNNING";
  }

  return {
    completedDays: input.completedDays,
    coverageDays: input.coverageDays,
    lastBackfillAt: readIso(input.latestBackfill?.completed_at ?? input.latestBackfill?.completedAt),
    progress: Math.min(100, Math.round((input.completedDays / input.coverageDays) * 100)),
    status: backfillStatus,
  };
}

function resolveFreshness(input: {
  readonly checkpoints: readonly Record<string, unknown>[];
  readonly latestSuccessfulJob: Record<string, unknown> | null;
  readonly now: Date;
}): IntegrationRuntimeSource["freshness"] {
  const checkpointWatermark = latestIso(
    input.checkpoints.map((checkpoint) => readIso(checkpoint.watermark)),
  );
  const lastSuccessfulSyncAt = readIso(
    input.latestSuccessfulJob?.completed_at ?? input.latestSuccessfulJob?.completedAt,
  );
  const watermark = checkpointWatermark ?? lastSuccessfulSyncAt;
  const ageMinutes = watermark
    ? Math.max(0, Math.round((input.now.getTime() - Date.parse(watermark)) / 60_000))
    : null;

  return {
    ageMinutes,
    label: ageMinutes === null
      ? "Brak wiarygodnego watermarku"
      : formatFreshnessAge(ageMinutes),
    lastSuccessfulSyncAt,
    watermark,
  };
}

function buildSourceCompletenessDays(
  rows: readonly Record<string, unknown>[],
  now: Date,
): readonly SourceCompletenessDay[] {
  const byDay = new Map<string, {
    recordCount: number;
    latestIngestedAt: string | null;
  }>();
  for (const row of rows) {
    const day = readString(row.day);
    if (!day) continue;
    const existing = byDay.get(day) ?? { latestIngestedAt: null, recordCount: 0 };
    const latestIngestedAt = latestIso([
      existing.latestIngestedAt,
      readIso(row.latest_ingested_at ?? row.latestIngestedAt),
    ]);
    byDay.set(day, {
      latestIngestedAt,
      recordCount: existing.recordCount + (readNumber(row.record_count ?? row.recordCount) ?? 0),
    });
  }

  return Array.from({ length: defaultCoverageDays }, (_, index) => {
    const date = toDateOnly(addDays(startOfUtcDay(now), -index));
    const coverage = byDay.get(date);
    return {
      date,
      latestIngestedAt: coverage?.latestIngestedAt ?? null,
      recordCount: coverage?.recordCount ?? 0,
      status: coverage && coverage.recordCount > 0 ? "COMPLETE" : "MISSING",
    };
  });
}

function summarizeCompleteness(
  days: readonly SourceCompletenessDay[],
): IntegrationRuntimeSource["completeness"] {
  const completeDays = days.filter((day) => day.status === "COMPLETE").length;
  const percentage = days.length > 0
    ? Math.round((completeDays / days.length) * 100)
    : 0;
  const status: CompletenessStatus = percentage >= 95
    ? "COMPLETE"
    : percentage > 0
      ? "PARTIAL"
      : "MISSING";
  return {
    days,
    percentage,
    status,
  };
}

function buildRuntimeAlerts(
  sources: readonly IntegrationRuntimeSource[],
): IntegrationRuntimeStatus["alerts"] {
  const alerts: IntegrationRuntimeStatus["alerts"][number][] = [];

  for (const source of sources) {
    if (source.lifecycleStatus === "REAUTH_REQUIRED") {
      alerts.push({
        actionLabel: "Połącz ponownie",
        id: `${source.integrationId}:reauth`,
        message: `${source.providerDisplayName} nie aktualizuje danych. ${source.impact.ai}`,
        sourceId: source.integrationId,
        title: `${source.providerDisplayName} wymaga ponownego połączenia`,
        tone: "critical",
      });
      continue;
    }
    if (source.lifecycleStatus === "BLOCKED_BY_PLAN") {
      alerts.push({
        actionLabel: "Zarządzaj planem",
        id: `${source.integrationId}:plan`,
        message: "Źródło zostało zatrzymane przez limit planu. To nie jest awaria providera.",
        sourceId: source.integrationId,
        title: `${source.providerDisplayName} zatrzymane limitem planu`,
        tone: "critical",
      });
      continue;
    }
    if (source.lifecycleStatus === "FAILED") {
      alerts.push({
        actionLabel: "Napraw",
        id: `${source.integrationId}:failed`,
        message: source.issue?.message ?? "Ostatnia synchronizacja wymaga sprawdzenia.",
        sourceId: source.integrationId,
        title: `${source.providerDisplayName} wymaga działania`,
        tone: "critical",
      });
      continue;
    }
    if (source.lifecycleStatus === "RATE_LIMITED") {
      alerts.push({
        actionLabel: "Szczegóły",
        id: `${source.integrationId}:rate-limit`,
        message: "Provider chwilowo ograniczył liczbę zapytań. PapaData ponowi pobieranie automatycznie.",
        sourceId: source.integrationId,
        title: `${source.providerDisplayName} jest chwilowo ograniczony`,
        tone: "warning",
      });
      continue;
    }
    if (source.completeness.status === "PARTIAL") {
      alerts.push({
        actionLabel: "Sprawdź braki",
        id: `${source.integrationId}:partial`,
        message: `${source.providerDisplayName} ma ${source.completeness.percentage}% kompletności. Część KPI może mieć niższą pewność.`,
        sourceId: source.integrationId,
        title: "Częściowa kompletność danych",
        tone: "warning",
      });
      continue;
    }
    if (source.initialBackfill.status === "RUNNING" || source.initialBackfill.status === "QUEUED") {
      alerts.push({
        actionLabel: "Szczegóły",
        id: `${source.integrationId}:backfill`,
        message: "Trwa pierwsze pobieranie danych. Źródło nie jest jeszcze oznaczane jako w pełni gotowe.",
        sourceId: source.integrationId,
        title: `${source.providerDisplayName} przygotowuje dane`,
        tone: "info",
      });
    }
  }

  return alerts;
}

function buildDomainReadiness(
  sources: readonly IntegrationRuntimeSource[],
): readonly IntegrationDomainReadiness[] {
  const connectedReadyProviders = new Set(
    sources
      .filter((source) => source.connectionStatus === "CONNECTED" && source.completeness.percentage > 0)
      .map((source) => source.provider),
  );
  const sourceCompleteness = new Map(
    sources.map((source) => [source.provider, source.completeness.percentage]),
  );
  const commerce = ["woocommerce", "baselinker", "shopify", "allegro"] as const;
  const ads = ["google_ads", "meta_ads"] as const;

  return [
    domainReadiness({
      blockedKpis: ["Przychód", "Zamówienia", "AOV"],
      id: "sales_orders",
      label: "Sprzedaż i zamówienia",
      providerOptions: commerce,
      requiredLabel: "źródło sprzedażowe",
      sourceCompleteness,
      connectedReadyProviders,
    }),
    domainReadiness({
      blockedKpis: ["Sesje", "Konwersja", "Funnel"],
      id: "traffic_behavior",
      label: "Ruch i zachowanie",
      providerOptions: ["ga4"],
      requiredLabel: "Google Analytics 4",
      sourceCompleteness,
      connectedReadyProviders,
    }),
    domainReadiness({
      blockedKpis: ["Wydatki reklamowe", "ROAS", "CAC"],
      id: "paid_campaigns",
      label: "Kampanie płatne",
      providerOptions: ads,
      requiredLabel: "Google Ads albo Meta Ads",
      sourceCompleteness,
      connectedReadyProviders,
    }),
    domainReadiness({
      blockedKpis: ["Produkty", "Inventory"],
      id: "products_inventory",
      label: "Produkty i magazyn",
      providerOptions: commerce,
      requiredLabel: "źródło commerce z produktami",
      sourceCompleteness,
      connectedReadyProviders,
    }),
    domainReadiness({
      blockedKpis: ["LTV", "Retencja"],
      id: "customers_retention",
      label: "Klienci i retencja",
      providerOptions: commerce,
      requiredLabel: "źródło sprzedażowe z klientami",
      sourceCompleteness,
      connectedReadyProviders,
    }),
    compoundDomainReadiness({
      blockedKpis: ["Marża", "Contribution margin", "Unit economics"],
      id: "margin_costs",
      label: "Marża i koszty",
      requirements: [
        { label: "źródło sprzedażowe", options: commerce },
        { label: "koszty reklamowe albo import kosztów", options: ads },
      ],
      sourceCompleteness,
      connectedReadyProviders,
    }),
    compoundDomainReadiness({
      blockedKpis: ["Confidence odpowiedzi", "Rekomendacje", "Briefingi"],
      id: "papa_assistant",
      label: "Papa Asystent",
      requirements: [
        { label: "źródło sprzedażowe", options: commerce },
        { label: "ruch albo reklamy", options: ["ga4", ...ads] },
      ],
      sourceCompleteness,
      connectedReadyProviders,
    }),
  ];
}

function domainReadiness(input: {
  readonly id: IntegrationDomainReadiness["id"];
  readonly label: string;
  readonly providerOptions: readonly MvpIntegrationCatalogProviderId[];
  readonly requiredLabel: string;
  readonly blockedKpis: readonly string[];
  readonly sourceCompleteness: ReadonlyMap<MvpIntegrationCatalogProviderId, number>;
  readonly connectedReadyProviders: ReadonlySet<MvpIntegrationCatalogProviderId>;
}): IntegrationDomainReadiness {
  const connected = input.providerOptions.filter((provider) => input.connectedReadyProviders.has(provider));
  const readiness = connected.length > 0
    ? Math.max(...connected.map((provider) => input.sourceCompleteness.get(provider) ?? 0))
    : 0;
  return {
    blockedKpis: connected.length > 0 ? [] : input.blockedKpis,
    connectedRequiredSources: connected.map(displayName),
    id: input.id,
    label: input.label,
    missingRequiredSources: connected.length > 0 ? [] : [input.requiredLabel],
    readiness,
    requiredSources: [input.requiredLabel],
    status: completenessStatusFromPercentage(readiness),
    supportingSources: [],
  };
}

function compoundDomainReadiness(input: {
  readonly id: IntegrationDomainReadiness["id"];
  readonly label: string;
  readonly requirements: readonly {
    readonly label: string;
    readonly options: readonly MvpIntegrationCatalogProviderId[];
  }[];
  readonly blockedKpis: readonly string[];
  readonly sourceCompleteness: ReadonlyMap<MvpIntegrationCatalogProviderId, number>;
  readonly connectedReadyProviders: ReadonlySet<MvpIntegrationCatalogProviderId>;
}): IntegrationDomainReadiness {
  const connected: string[] = [];
  const missing: string[] = [];
  const scores: number[] = [];

  for (const requirement of input.requirements) {
    const providers = requirement.options.filter((provider) => input.connectedReadyProviders.has(provider));
    if (providers.length === 0) {
      missing.push(requirement.label);
      scores.push(0);
      continue;
    }
    const bestProvider = providers.reduce((best, provider) => (
      (input.sourceCompleteness.get(provider) ?? 0) > (input.sourceCompleteness.get(best) ?? 0)
        ? provider
        : best
    ), providers[0]!);
    connected.push(displayName(bestProvider));
    scores.push(input.sourceCompleteness.get(bestProvider) ?? 0);
  }

  const readiness = missing.length > 0
    ? 0
    : Math.round(scores.reduce((sum, value) => sum + value, 0) / Math.max(1, scores.length));

  return {
    blockedKpis: missing.length > 0 ? input.blockedKpis : [],
    connectedRequiredSources: connected,
    id: input.id,
    label: input.label,
    missingRequiredSources: missing,
    readiness,
    requiredSources: input.requirements.map((requirement) => requirement.label),
    status: completenessStatusFromPercentage(readiness),
    supportingSources: [],
  };
}

function providerAvailabilityLabel(input: {
  readonly connectable: boolean;
  readonly environmentStatus: EnvironmentStatus;
  readonly readiness: ProviderReadiness;
}): string {
  if (input.connectable) return "Dostępne";
  if (input.environmentStatus === "missing") return "Wymaga konfiguracji środowiska";
  switch (input.readiness) {
    case "pilot_ready":
      return "Pilot";
    case "runtime_flagged":
      return "W przygotowaniu";
    case "internal_only":
      return "Tylko wewnętrznie";
    case "disabled":
      return "Wyłączone";
    case "production_ready":
      return "Wymaga konfiguracji środowiska";
  }
}

function availabilityMessage(readiness: ProviderReadiness): string {
  switch (readiness) {
    case "production_ready":
      return "Provider wymaga poprawnej konfiguracji środowiska przed testem.";
    case "pilot_ready":
      return "Provider jest w pilotażu i nie może jeszcze zapisać produkcyjnego połączenia.";
    case "runtime_flagged":
      return "Provider jest w przygotowaniu runtime.";
    case "internal_only":
      return "Provider jest dostępny wyłącznie wewnętrznie.";
    case "disabled":
      return "Provider jest wyłączony.";
  }
}

function providerFailureMessage(failureClass: string): string {
  switch (failureClass) {
    case "authentication":
      return "Provider odrzucił credential. Sprawdź dane dostępu i spróbuj ponownie.";
    case "authorization":
      return "Credential działa, ale nie ma wymaganych uprawnień.";
    case "validation":
      return "Provider zwrócił odpowiedź w nieobsługiwanym formacie.";
    case "rate_limit":
      return "Provider chwilowo ograniczył liczbę zapytań. Zapis pozostaje zablokowany do potwierdzenia testu.";
    case "provider_outage":
      return "Provider jest chwilowo niedostępny. Zapis połączenia pozostaje zablokowany.";
    case "permanent":
      return "Provider odrzucił test połączenia.";
    case "transient":
    default:
      return "Nie udało się potwierdzić połączenia u providera.";
  }
}

function credentialFromRequest(
  provider: MvpIntegrationCatalogProviderId,
  request: IntegrationCredentialTestRequest,
  authType: IntegrationRuntimeCatalogProvider["authType"],
): ResolvedCredentialMaterial {
  const credentialReference = `inline-test:${provider}`;
  const secretResource = "inline-test";
  const version = "test";

  switch (provider) {
    case "woocommerce":
      return {
        credentialReference,
        material: {
          consumerKey: trimmedString(request.consumerKey) ?? "",
          consumerSecret: trimmedString(request.consumerSecret) ?? "",
          storeUrl: trimmedString(request.storeUrl) ?? "",
        },
        providerId: provider,
        secretResource,
        version,
      };
    case "shopify":
      return {
        credentialReference,
        material: {
          accessToken: trimmedString(request.accessToken) ?? "",
          apiVersion: trimmedString(request.apiVersion) ?? "2025-10",
          shopDomain: trimmedString(request.shopDomain) ?? "",
        },
        providerId: provider,
        secretResource,
        version,
      };
    case "baselinker":
      return {
        credentialReference,
        material: {
          token: trimmedString(request.token) ?? "",
        },
        providerId: provider,
        secretResource,
        version,
      };
    case "allegro":
      return {
        credentialReference,
        material: {
          accessToken: trimmedString(request.accessToken),
          clientId: trimmedString(request.clientId),
          clientSecret: trimmedString(request.clientSecret),
          refreshToken: trimmedString(request.refreshToken),
          tokenUri: trimmedString(request.tokenUri),
        },
        providerId: provider,
        secretResource,
        version,
      };
    case "google_ads":
      return {
        credentialReference,
        material: {
          accessToken: trimmedString(request.accessToken),
          clientId: trimmedString(request.clientId),
          clientSecret: trimmedString(request.clientSecret),
          customerId: trimmedString(request.customerId) ?? "",
          developerToken: trimmedString(request.developerToken) ?? "",
          loginCustomerId: trimmedString(request.loginCustomerId),
          refreshToken: trimmedString(request.refreshToken),
          tokenUri: trimmedString(request.tokenUri),
        },
        providerId: provider,
        secretResource,
        version,
      };
    case "meta_ads":
      return {
        credentialReference,
        material: {
          accessToken: trimmedString(request.accessToken) ?? "",
          accountId: trimmedString(request.accountId) ?? "",
          appSecret: trimmedString(request.appSecret),
        },
        providerId: provider,
        secretResource,
        version,
      };
    case "ga4":
      return {
        credentialReference,
        material: {
          accessToken: trimmedString(request.accessToken),
          clientId: trimmedString(request.clientId),
          clientSecret: trimmedString(request.clientSecret),
          propertyId: trimmedString(request.propertyId) ?? "",
          refreshToken: trimmedString(request.refreshToken),
          tokenUri: trimmedString(request.tokenUri),
        },
        providerId: provider,
        secretResource,
        version,
      };
  }

  throw new Error(`Unsupported provider credential type: ${authType}`);
}

function requireOAuthTokenShape(
  request: IntegrationCredentialTestRequest,
  fieldErrors: Record<string, string>,
): void {
  const hasAccessToken = Boolean(trimmedString(request.accessToken));
  const hasRefreshTuple = Boolean(
    trimmedString(request.refreshToken)
    && trimmedString(request.clientId)
    && trimmedString(request.clientSecret),
  );
  if (!hasAccessToken && !hasRefreshTuple) {
    fieldErrors.accessToken = "Podaj access token albo refresh token z client ID i client secret.";
  }
}

function groupRowsByString(
  rows: readonly Record<string, unknown>[],
  snakeKey: string,
  camelKey: string,
): Map<string, readonly Record<string, unknown>[]> {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const row of rows) {
    const id = readString(row[snakeKey] ?? row[camelKey]);
    if (!id) continue;
    const group = groups.get(id) ?? [];
    group.push(row);
    groups.set(id, group);
  }
  return groups;
}

function groupCoverageRowsByConnection(
  rows: readonly Record<string, unknown>[],
): Map<string, readonly Record<string, unknown>[]> {
  return groupRowsByString(rows, "connection_id", "connectionId");
}

function groupReconciliationByJob(
  rows: readonly Record<string, unknown>[],
): Map<string, Record<string, unknown>> {
  const groups = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const jobId = readString(row.sync_job_id ?? row.syncJobId);
    if (jobId && !groups.has(jobId)) {
      groups.set(jobId, row);
    }
  }
  return groups;
}

function latestJobRow(
  rows: readonly Record<string, unknown>[],
): Record<string, unknown> | null {
  return [...rows].sort((left, right) => (
    Date.parse(readIso(right.updated_at ?? right.updatedAt ?? right.created_at ?? right.createdAt) ?? "0")
    - Date.parse(readIso(left.updated_at ?? left.updatedAt ?? left.created_at ?? left.createdAt) ?? "0")
  ))[0] ?? null;
}

function latestSuccessfulJobRow(
  rows: readonly Record<string, unknown>[],
): Record<string, unknown> | null {
  return latestJobRow(rows.filter((row) => {
    const status = readString(row.status);
    return status === "succeeded" || status === "partial_success" || status === "recovered";
  }));
}

function latestBackfillJob(
  rows: readonly Record<string, unknown>[],
): Record<string, unknown> | null {
  return latestJobRow(rows.filter((row) => {
    const kind = readString(row.job_kind ?? row.operation ?? row.jobKind);
    return kind === "backfill" || kind === "initial_sync";
  }));
}

function resolveLogStatus(job: Record<string, unknown>): IntegrationRuntimeLog["status"] {
  const status = readString(job.status);
  if (status && ["succeeded", "partial_success", "recovered"].includes(status)) return "completed";
  if (status && ["queued", "running", "retry_wait", "rate_limited"].includes(status)) return "running";
  return "attention";
}

function resolveLogStatusLabel(job: Record<string, unknown>): string {
  const status = resolveLogStatus(job);
  switch (status) {
    case "completed":
      return "Zakończone";
    case "running":
      return "W toku";
    case "attention":
      return "Wymaga uwagi";
  }
}

function normalizeJobKind(value: string | null): IntegrationRuntimeLog["type"] {
  switch (value) {
    case "initial_sync":
    case "incremental_sync":
    case "backfill":
    case "reprocess":
    case "reconcile":
    case "recovery":
    case "retry":
      return value;
    default:
      return "incremental_sync";
  }
}

function issueFromLatestJob(
  latestJob: Record<string, unknown> | null,
): IntegrationRuntimeSource["issue"] {
  const status = readString(latestJob?.status);
  if (!status || !["failed", "dlq"].includes(status)) return null;
  return {
    code: readString(latestJob?.error_code ?? latestJob?.errorCode) ?? "SYNC_FAILED",
    message: sanitizeProviderMessage(readString(latestJob?.error_message ?? latestJob?.errorMessage))
      ?? "Ostatnia synchronizacja zakończyła się błędem.",
    severity: "error",
  };
}

function resolvePrimaryAction(input: {
  readonly businessStatus: BusinessSourceStatus;
  readonly initialBackfillStatus: InitialBackfillStatus;
  readonly lifecycleStatus: IntegrationLifecycleStatus;
}): IntegrationRuntimeSource["primaryAction"] {
  if (input.lifecycleStatus === "BLOCKED_BY_PLAN") {
    return { id: "plan", label: "Zarządzaj planem" };
  }
  if (input.lifecycleStatus === "REAUTH_REQUIRED") {
    return { id: "reauth", label: "Połącz ponownie" };
  }
  if (input.lifecycleStatus === "FAILED") {
    return { id: "fix", label: "Napraw" };
  }
  if (input.initialBackfillStatus === "NOT_STARTED") {
    return { id: "backfill", label: "Pobierz dane" };
  }
  if (input.businessStatus === "working") {
    return { id: "sync", label: "Pobierz najnowsze dane" };
  }
  return { id: "details", label: "Szczegóły" };
}

function resolveNextStep(input: {
  readonly businessStatus: BusinessSourceStatus;
  readonly initialBackfillStatus: InitialBackfillStatus;
  readonly lifecycleStatus: IntegrationLifecycleStatus;
}): string {
  if (input.lifecycleStatus === "BLOCKED_BY_PLAN") return "Zwiększ limit planu";
  if (input.lifecycleStatus === "REAUTH_REQUIRED") return "Odśwież autoryzację";
  if (input.lifecycleStatus === "FAILED") return "Sprawdź błąd synchronizacji";
  if (input.lifecycleStatus === "RATE_LIMITED") return "Poczekaj na automatyczne ponowienie";
  if (input.initialBackfillStatus === "NOT_STARTED") return "Uruchom pierwsze pobranie";
  if (input.initialBackfillStatus === "QUEUED") return "Oczekuje na rozpoczęcie";
  if (input.initialBackfillStatus === "RUNNING") return "Poczekaj na zakończenie pobierania";
  if (input.businessStatus === "syncing") return "Poczekaj na zakończenie synchronizacji";
  return "Brak wymaganych działań";
}

function resolveHealthTitle(input: {
  readonly actionRequired: number;
  readonly completenessPercentage: number;
  readonly sources: readonly IntegrationRuntimeSource[];
}): string {
  if (input.sources.length === 0) return "Nie masz jeszcze podłączonych źródeł danych";
  if (input.actionRequired > 0) return `${input.actionRequired} źródła wymagają działania`;
  if (input.completenessPercentage < 95) return "Dane częściowo gotowe";
  return "Dane gotowe do analizy";
}

function resolveHealthDescription(input: {
  readonly actionRequired: number;
  readonly activeSources: number;
  readonly completenessPercentage: number;
  readonly sources: readonly IntegrationRuntimeSource[];
  readonly syncingSources: number;
}): string {
  if (input.sources.length === 0) {
    return "Zacznij od systemu sprzedażowego, aby PapaData mogła policzyć pierwsze KPI biznesowe.";
  }
  const firstAction = input.sources.find((source) => source.businessStatus === "action_required");
  if (firstAction) {
    return `${firstAction.providerDisplayName}: ${firstAction.nextStep}.`;
  }
  if (input.syncingSources > 0) {
    return `${input.syncingSources} źródła pobierają dane. Ostatnie kompletne dane pozostają widoczne w analizach.`;
  }
  return `${input.activeSources} aktywnych źródeł · kompletność ${input.completenessPercentage}% · synchronizacje działają.`;
}

function globalCompletenessTitle(
  percentage: number,
  blockers: readonly unknown[],
): string {
  if (percentage === 0 || blockers.length > 0) return "Dane jeszcze niegotowe";
  if (percentage < 95) return "Dane częściowo gotowe";
  return "Dane gotowe do analiz";
}

function globalCompletenessDescription(
  percentage: number,
  blockers: readonly { readonly title: string }[],
): string {
  if (blockers.length > 0) {
    return `${blockers[0]!.title} blokuje część analiz. Sprawdź brakujące wymagane źródła.`;
  }
  if (percentage === 0) {
    return "Połączone źródła wymagają pierwszego pobrania danych.";
  }
  if (percentage < 95) {
    return "Część źródeł ma luki w wybranym okresie. KPI zależne od tych danych mogą mieć niższą pewność.";
  }
  return "Kluczowe obszary analityczne posiadają dane dla wybranego okresu.";
}

function businessStatusLabel(status: BusinessSourceStatus): string {
  switch (status) {
    case "working":
      return "Działa";
    case "syncing":
      return "Pobieranie danych";
    case "action_required":
      return "Wymaga działania";
  }
}

function completenessStatusFromPercentage(percentage: number): CompletenessStatus {
  if (percentage >= 95) return "COMPLETE";
  if (percentage > 0) return "PARTIAL";
  return "MISSING";
}

function readSourceDisplayName(
  connection: Record<string, unknown>,
  descriptor: IntegrationProviderDescriptor | null,
): string {
  return readString(connection.display_name ?? connection.displayName)
    ?? readString(connection.account_name ?? connection.accountName)
    ?? descriptor?.displayName
    ?? readString(connection.provider_id ?? connection.providerId)
    ?? "Źródło danych";
}

function displayName(provider: MvpIntegrationCatalogProviderId): string {
  switch (provider) {
    case "woocommerce":
      return "WooCommerce";
    case "shopify":
      return "Shopify";
    case "baselinker":
      return "BaseLinker";
    case "allegro":
      return "Allegro";
    case "google_ads":
      return "Google Ads";
    case "meta_ads":
      return "Meta Ads";
    case "ga4":
      return "Google Analytics 4";
  }
}

function maskExternalAccountId(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (normalized.length <= 8) return "••••" + normalized.slice(-2);
  return `${normalized.slice(0, 3)}...${normalized.slice(-3)}`;
}

function formatFreshnessAge(ageMinutes: number): string {
  if (ageMinutes < 1) return "przed chwilą";
  if (ageMinutes < 60) return `${ageMinutes} min temu`;
  const hours = Math.round(ageMinutes / 60);
  if (hours < 48) return `${hours} h temu`;
  const days = Math.round(hours / 24);
  return `${days} dni temu`;
}

function sanitizeProviderMessage(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gu, "[email]");
  if (normalized.length > 180) return `${normalized.slice(0, 177)}...`;
  return normalized;
}

function roundedAverage(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function latestIso(values: readonly (string | null)[]): string | null {
  return values
    .filter((value): value is string => Boolean(value && Number.isFinite(Date.parse(value))))
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] ?? null;
}

function rowId(row: Record<string, unknown>): string | null {
  return readString(row.id ?? row.connection_id ?? row.connectionId);
}

function readProvider(value: unknown): MvpIntegrationCatalogProviderId | null {
  const text = readString(value);
  return text && isMvpProviderId(text) ? text : null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function trimmedString(value: unknown): string | undefined {
  const text = readString(value);
  return text ?? undefined;
}

function readIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}
