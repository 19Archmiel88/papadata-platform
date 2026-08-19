// PapaData 1.0 — kanoniczne kontrakty API. Generated from rejestry/api-operations.csv.
export type UUID = string;
export type ISODateTime = string;
export type CurrencyCode = 'PLN' | 'EUR' | 'USD';
export type Locale = 'pl' | 'en';
export type OperationKind = 'query' | 'command' | 'callback' | 'job';
export type AccessRole = 'Owner' | 'Admin' | 'Analyst' | 'Viewer' | 'Support';
export type AccessResolutionStatus = 'resolved' | 'tenantSelectionRequired' | 'workspaceSelectionRequired' | 'blocked';
export type ReadinessStatus = 'ready' | 'partial' | 'stale' | 'unavailable';
export type CampaignChannel = 'googleAds' | 'metaAds' | 'tiktokAds' | 'other';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type BillingStatus = 'trial' | 'active' | 'pastDue' | 'cancelled';
export type CompanyRegistryStatus = 'matched' | 'manual' | 'unavailable';
export type ConsentStatus = 'granted' | 'withdrawn' | 'unknown';
export type DecisionStatus = 'proposed' | 'approved' | 'rejected' | 'executing' | 'measured';
export type ImpactLevel = 'low' | 'medium' | 'high';
export type EffortLevel = 'low' | 'medium' | 'high';
export type IntegrationProvider = 'shopify' | 'woocommerce' | 'ga4' | 'googleAds' | 'metaAds' | 'other';
export type IntegrationStatus = 'notConnected' | 'connecting' | 'syncing' | 'ready' | 'degraded' | 'failed';
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'revoked';
export type MobilePlatform = 'ios' | 'android';
export type MobileDeviceStatus = 'paired' | 'revoked' | 'inactive';
export type OnboardingStep = 'company' | 'workspace' | 'integration' | 'firstData' | 'firstValue';
export type OrderStatus = 'new' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
export type PapaStatus = 'draft' | 'ready' | 'blocked' | 'executing' | 'completed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ProductStatus = 'active' | 'inactive' | 'missingMapping' | 'archived';
export type SettingsResourceType = 'tenant' | 'workspace' | 'membership' | 'role' | 'session' | 'supportAccess';
export type SettingsStatus = 'active' | 'disabled' | 'pending' | 'revoked';
export type WorkspaceStatus = 'active' | 'archived' | 'suspended';
export type HelpContentStatus = 'draft' | 'published' | 'archived';
export type ActionStatus = 'draft' | 'approved' | 'running' | 'completed' | 'failed';
export type MetricUnit = 'currency' | 'number' | 'percent' | 'ratio' | 'duration';
export type AuthSurfaceId = `auth-${string}` | 'app-shell';
export interface Money { amount: number; currency: CurrencyCode; }
export interface PostalAddress { countryCode: string; postalCode: string; city: string; street: string; buildingNumber: string; }
export interface EvidenceRef { evidenceId: UUID; source: string; collectedAt: ISODateTime; confidence: number; }
export interface ApiActor { userId: UUID; tenantId: UUID; workspaceId: UUID; role: AccessRole; capabilities: string[]; }
export interface ApiContext { correlationId: string; locale: Locale; timezone: string; actor: ApiActor; asOf?: ISODateTime; }
export interface ApiProblem { type: string; title: string; status: number; code: string; detail: string; correlationId: string; recoverable: boolean; fieldErrors?: Array<{field:string; code:string; message:string}>; retryAfterSeconds?: number; }
export interface PageRequest { cursor?: string; limit?: number; sort?: string; direction?: 'asc' | 'desc'; }
export interface DateRangeRequest { from?: string; to?: string; preset?: 'today' | 'last7d' | 'last30d' | 'last90d' | 'monthToDate' | 'custom'; }
export interface MutationMetadata { idempotencyKey: string; reason?: string; expectedVersion?: number; }
export interface PageInfo { nextCursor: string | null; total: number | null; }

export type CommandStatus = 'applied' | 'queued' | 'rejected';
export interface RecommendationView { recommendationId: UUID; title: string; rationale: string; impact: ImpactLevel; confidence: number; }
export interface DiagnosticFinding { findingId: UUID; code: string; severity: 'info' | 'warning' | 'error'; message: string; sourceRef: string | null; }
export interface FunnelStepView { stepId: string; label: string; entrants: number; completions: number; conversionRate: number; }
export interface CohortView { cohortKey: string; users: number; revenue: Money; retentionRate: number | null; }
export interface AttributionView { source: string; model: string; orders: number; revenue: Money; contribution: number; }
export interface WaterfallItem { key: string; label: string; value: number; cumulativeValue: number; }
export interface PlanTrajectoryPointView { date: ISODateTime; actual: number | null; plan: number; forecast: number | null; }
export interface DriverMetricView { metricId: UUID; label: string; basis: 'correlation' | 'contribution-share'; coefficient: number | null; contributionShare: number | null; sampleSize: number; }
export interface AccessRecord { tenantId: UUID; workspaceId: UUID; role: AccessRole; capabilities: string[]; resolutionStatus: AccessResolutionStatus; }
export interface AccessSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface AccessForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface AccessTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface ActionsRecord { actionId: UUID; title: string; status: ActionStatus; ownerUserId: UUID | null; dueAt: ISODateTime | null; resultMetricId: UUID | null; }
export interface ActionsSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface ActionsForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface ActionsTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface AuthRecord { userId: UUID | null; email: string | null; sessionId: UUID | null; nextSurface: AuthSurfaceId | null; mfaRequired: boolean; accessResolution: AccessResolutionStatus; }
export interface AuthSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface AuthForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface AuthTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface BillingRecord { subscriptionId: UUID; planCode: string; status: BillingStatus; periodStart: ISODateTime; periodEnd: ISODateTime; amount: Money; invoiceId: UUID | null; paymentMethodId: UUID | null; }
export interface BillingSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface BillingForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface BillingTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface CampaignsRecord { campaignId: UUID; name: string; channel: CampaignChannel; status: CampaignStatus; budget: Money; spend: Money; revenue: Money; roas: number | null; }
export interface CampaignsSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface CampaignsForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface CampaignsTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface CommandCenterRecord { metricId: UUID; label: string; value: number; unit: MetricUnit; delta: number | null; target: number | null; readiness: ReadinessStatus; }
export interface CommandCenterSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface CommandCenterForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface CommandCenterTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface CompanyRecord { companyId: UUID | null; nip: string; legalName: string; registryStatus: CompanyRegistryStatus; address: PostalAddress | null; }
export interface CompanySummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface CompanyForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface CompanyTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface CustomersRecord { customerPseudonym: string; segmentId: UUID | null; cohortKey: string | null; ordersCount: number; revenue: Money; ltv: Money | null; consentStatus: ConsentStatus; }
export interface CustomersSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface CustomersForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface CustomersTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface DataQualityRecord { datasetId: UUID; datasetName: string; readiness: ReadinessStatus; issueCount: number; freshnessAt: ISODateTime | null; completeness: number | null; conflictCount: number; }
export interface DataQualitySummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface DataQualityForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface DataQualityTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface DecisionsRecord { decisionId: UUID; title: string; status: DecisionStatus; ownerUserId: UUID | null; dueAt: ISODateTime | null; impact: ImpactLevel; effort: EffortLevel; }
export interface DecisionsSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface DecisionsForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface DecisionsTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface HelpRecord { articleId: UUID; title: string; category: string; procedureCode: string | null; supportCaseId: UUID | null; status: HelpContentStatus; }
export interface HelpSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface HelpForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface HelpTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface IntegrationsRecord { integrationId: UUID; provider: IntegrationProvider; status: IntegrationStatus; lastSyncAt: ISODateTime | null; recordsProcessed: number; lastErrorCode: string | null; }
export interface IntegrationsSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface IntegrationsForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface IntegrationsTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface InvitationRecord { invitationId: UUID; email: string; tenantId: UUID; workspaceId: UUID | null; role: AccessRole; expiresAt: ISODateTime; status: InvitationStatus; }
export interface InvitationSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface InvitationForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface InvitationTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface MobileRecord { deviceId: UUID; platform: MobilePlatform; status: MobileDeviceStatus; lastSeenAt: ISODateTime | null; pushEnabled: boolean; }
export interface MobileSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface MobileForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface MobileTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface OnboardingRecord { onboardingId: UUID; currentStep: OnboardingStep; completedSteps: OnboardingStep[]; progress: number; firstValueAt: ISODateTime | null; }
export interface OnboardingSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface OnboardingForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface OnboardingTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface OrdersRecord { orderId: UUID; externalOrderId: string; orderedAt: ISODateTime; status: OrderStatus; amount: Money; source: string; customerPseudonym: string | null; }
export interface OrdersSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface OrdersForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface OrdersTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface PapaRecord { messageId: UUID; content: string; confidence: number | null; evidence: EvidenceRef[]; actionId: UUID | null; status: PapaStatus; riskLevel: RiskLevel; approvalRequired: boolean; }
export interface PapaSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface PapaForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface PapaTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface ProductsRecord { productId: UUID; sku: string; name: string; status: ProductStatus; category: string | null; revenue: Money; units: number; margin: number | null; }
export interface ProductsSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface ProductsForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface ProductsTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface SettingsRecord { resourceId: UUID; resourceType: SettingsResourceType; name: string; status: SettingsStatus; role: AccessRole | null; capabilities: string[]; }
export interface SettingsSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface SettingsForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface SettingsTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface TrafficRecord { dimensionKey: string; channel: string; sessions: number; users: number; conversions: number; conversionRate: number; revenue: Money; landingPage: string | null; eventQuality: number | null; }
export interface TrafficSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface TrafficForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface TrafficTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface WorkspaceRecord { workspaceId: UUID; name: string; timezone: string; currency: CurrencyCode; status: WorkspaceStatus; }
export interface WorkspaceSummary { total: number; ready: number; warning: number; critical: number; updatedAt: ISODateTime; }
export interface WorkspaceForecast { horizonEnd: ISODateTime; expected: number; lowerBound: number; upperBound: number; confidence: number; }
export interface WorkspaceTimelineEvent { eventId: UUID; occurredAt: ISODateTime; type: string; actorId: UUID | null; description: string; }
export interface AccessBootstrapFilters { search: string | null; status: string[] | null; source: string[] | null; bootstrapFilter: string | number | boolean | null; }
export interface AccessBootstrapInput { requestedBy: UUID; effectiveAt: ISODateTime | null; bootstrapValue: string | number | boolean | null; }
export interface AccessBootstrapNextAction { type: 'bootstrap'; label: string; route: string | null; }
export interface AccessBootstrapResult { operationId: 'access.bootstrap'; completedAt: ISODateTime; domain: 'access'; }
export interface AccessBootstrapRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AccessBootstrapInput; }
export interface AccessBootstrapData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AccessBootstrapNextAction | null; bootstrapResult: AccessBootstrapResult; }
export interface AccessBootstrapResponse { operationId: 'access.bootstrap'; correlationId: string; generatedAt: ISODateTime; data: AccessBootstrapData; warnings: ApiProblem[]; }
export interface AccessResolveFilters { search: string | null; status: string[] | null; source: string[] | null; resolveFilter: string | number | boolean | null; }
export interface AccessResolveInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resolveValue: string | number | boolean | null; }
export interface AccessResolveNextAction { type: 'resolve'; label: string; route: string | null; }
export interface AccessResolveResult { operationId: 'access.resolve'; completedAt: ISODateTime; domain: 'access'; }
export interface AccessResolveRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AccessResolveInput; }
export interface AccessResolveData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AccessResolveNextAction | null; resolveResult: AccessResolveResult; }
export interface AccessResolveResponse { operationId: 'access.resolve'; correlationId: string; generatedAt: ISODateTime; data: AccessResolveData; warnings: ApiProblem[]; }
export interface AccessTenantSelectFilters { search: string | null; status: string[] | null; source: string[] | null; tenantSelectFilter: string | number | boolean | null; }
export interface AccessTenantSelectInput { requestedBy: UUID; effectiveAt: ISODateTime | null; tenantSelectValue: string | number | boolean | null; }
export interface AccessTenantSelectNextAction { type: 'tenantSelect'; label: string; route: string | null; }
export interface AccessTenantSelectResult { operationId: 'access.tenant.select'; completedAt: ISODateTime; domain: 'access'; }
export interface AccessTenantSelectRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AccessTenantSelectInput; }
export interface AccessTenantSelectData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AccessTenantSelectNextAction | null; tenantSelectResult: AccessTenantSelectResult; }
export interface AccessTenantSelectResponse { operationId: 'access.tenant.select'; correlationId: string; generatedAt: ISODateTime; data: AccessTenantSelectData; warnings: ApiProblem[]; }
export interface AccessTenantsListFilters { search: string | null; status: string[] | null; source: string[] | null; tenantsFilter: string | number | boolean | null; }
export interface AccessTenantsListInput { requestedBy: UUID; effectiveAt: ISODateTime | null; tenantsValue: string | number | boolean | null; }
export interface AccessTenantsListNextAction { type: 'tenants'; label: string; route: string | null; }
export interface AccessTenantsListResult { operationId: 'access.tenants.list'; completedAt: ISODateTime; domain: 'access'; }
export interface AccessTenantsListRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: AccessTenantsListFilters | null; }
export interface AccessTenantsListData { records: AccessRecord[]; pageInfo: PageInfo; summary: AccessSummary; tenantsResult: AccessTenantsListResult; }
export interface AccessTenantsListResponse { operationId: 'access.tenants.list'; correlationId: string; generatedAt: ISODateTime; data: AccessTenantsListData; warnings: ApiProblem[]; }
export interface AccessWorkspaceSelectFilters { search: string | null; status: string[] | null; source: string[] | null; workspaceSelectFilter: string | number | boolean | null; }
export interface AccessWorkspaceSelectInput { requestedBy: UUID; effectiveAt: ISODateTime | null; workspaceSelectValue: string | number | boolean | null; }
export interface AccessWorkspaceSelectNextAction { type: 'workspaceSelect'; label: string; route: string | null; }
export interface AccessWorkspaceSelectResult { operationId: 'access.workspace.select'; completedAt: ISODateTime; domain: 'access'; }
export interface AccessWorkspaceSelectRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AccessWorkspaceSelectInput; }
export interface AccessWorkspaceSelectData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AccessWorkspaceSelectNextAction | null; workspaceSelectResult: AccessWorkspaceSelectResult; }
export interface AccessWorkspaceSelectResponse { operationId: 'access.workspace.select'; correlationId: string; generatedAt: ISODateTime; data: AccessWorkspaceSelectData; warnings: ApiProblem[]; }
export interface AccessWorkspacesListFilters { search: string | null; status: string[] | null; source: string[] | null; workspacesFilter: string | number | boolean | null; }
export interface AccessWorkspacesListInput { requestedBy: UUID; effectiveAt: ISODateTime | null; workspacesValue: string | number | boolean | null; }
export interface AccessWorkspacesListNextAction { type: 'workspaces'; label: string; route: string | null; }
export interface AccessWorkspacesListResult { operationId: 'access.workspaces.list'; completedAt: ISODateTime; domain: 'access'; }
export interface AccessWorkspacesListRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: AccessWorkspacesListFilters | null; }
export interface AccessWorkspacesListData { records: AccessRecord[]; pageInfo: PageInfo; summary: AccessSummary; workspacesResult: AccessWorkspacesListResult; }
export interface AccessWorkspacesListResponse { operationId: 'access.workspaces.list'; correlationId: string; generatedAt: ISODateTime; data: AccessWorkspacesListData; warnings: ApiProblem[]; }
export interface ActionsReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface ActionsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface ActionsReadNextAction { type: 'result'; label: string; route: string | null; }
export interface ActionsReadResult { operationId: 'actions.read'; completedAt: ISODateTime; domain: 'actions'; }
export interface ActionsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ActionsReadFilters | null; }
export interface ActionsReadData { records: ActionsRecord[]; pageInfo: PageInfo; summary: ActionsSummary; resultResult: ActionsReadResult; }
export interface ActionsReadResponse { operationId: 'actions.read'; correlationId: string; generatedAt: ISODateTime; data: ActionsReadData; warnings: ApiProblem[]; }
export interface ActionsWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface ActionsWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface ActionsWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface ActionsWriteResult { operationId: 'actions.write'; completedAt: ISODateTime; domain: 'actions'; }
export interface ActionsWriteRequest { context: ApiContext; metadata: MutationMetadata; actionId: UUID | string | null; input: ActionsWriteInput; }
export interface ActionsWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: ActionsWriteNextAction | null; resultResult: ActionsWriteResult; }
export interface ActionsWriteResponse { operationId: 'actions.write'; correlationId: string; generatedAt: ISODateTime; data: ActionsWriteData; warnings: ApiProblem[]; }
export interface AuthAccessBlockedReadFilters { search: string | null; status: string[] | null; source: string[] | null; accessBlockedFilter: string | number | boolean | null; }
export interface AuthAccessBlockedReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; accessBlockedValue: string | number | boolean | null; }
export interface AuthAccessBlockedReadNextAction { type: 'accessBlocked'; label: string; route: string | null; }
export interface AuthAccessBlockedReadResult { operationId: 'auth.access.blocked.read'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthAccessBlockedReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: AuthAccessBlockedReadFilters | null; }
export interface AuthAccessBlockedReadData { records: AuthRecord[]; pageInfo: PageInfo; summary: AuthSummary; accessBlockedResult: AuthAccessBlockedReadResult; }
export interface AuthAccessBlockedReadResponse { operationId: 'auth.access.blocked.read'; correlationId: string; generatedAt: ISODateTime; data: AuthAccessBlockedReadData; warnings: ApiProblem[]; }
export interface AuthAccessResolveFilters { search: string | null; status: string[] | null; source: string[] | null; accessResolveFilter: string | number | boolean | null; }
export interface AuthAccessResolveInput { requestedBy: UUID; effectiveAt: ISODateTime | null; accessResolveValue: string | number | boolean | null; }
export interface AuthAccessResolveNextAction { type: 'accessResolve'; label: string; route: string | null; }
export interface AuthAccessResolveResult { operationId: 'auth.access.resolve'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthAccessResolveRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthAccessResolveInput; }
export interface AuthAccessResolveData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthAccessResolveNextAction | null; accessResolveResult: AuthAccessResolveResult; }
export interface AuthAccessResolveResponse { operationId: 'auth.access.resolve'; correlationId: string; generatedAt: ISODateTime; data: AuthAccessResolveData; warnings: ApiProblem[]; }
export interface AuthAccountLinkFilters { search: string | null; status: string[] | null; source: string[] | null; accountLinkFilter: string | number | boolean | null; }
export interface AuthAccountLinkInput { requestedBy: UUID; effectiveAt: ISODateTime | null; accountLinkValue: string | number | boolean | null; }
export interface AuthAccountLinkNextAction { type: 'accountLink'; label: string; route: string | null; }
export interface AuthAccountLinkResult { operationId: 'auth.account.link'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthAccountLinkRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthAccountLinkInput; }
export interface AuthAccountLinkData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthAccountLinkNextAction | null; accountLinkResult: AuthAccountLinkResult; }
export interface AuthAccountLinkResponse { operationId: 'auth.account.link'; correlationId: string; generatedAt: ISODateTime; data: AuthAccountLinkData; warnings: ApiProblem[]; }
export interface AuthConsentsAcceptFilters { search: string | null; status: string[] | null; source: string[] | null; consentsAcceptFilter: string | number | boolean | null; }
export interface AuthConsentsAcceptInput { requestedBy: UUID; effectiveAt: ISODateTime | null; consentsAcceptValue: string | number | boolean | null; }
export interface AuthConsentsAcceptNextAction { type: 'consentsAccept'; label: string; route: string | null; }
export interface AuthConsentsAcceptResult { operationId: 'auth.consents.accept'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthConsentsAcceptRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthConsentsAcceptInput; }
export interface AuthConsentsAcceptData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthConsentsAcceptNextAction | null; consentsAcceptResult: AuthConsentsAcceptResult; }
export interface AuthConsentsAcceptResponse { operationId: 'auth.consents.accept'; correlationId: string; generatedAt: ISODateTime; data: AuthConsentsAcceptData; warnings: ApiProblem[]; }
export interface AuthEmailResendFilters { search: string | null; status: string[] | null; source: string[] | null; emailResendFilter: string | number | boolean | null; }
export interface AuthEmailResendInput { requestedBy: UUID; effectiveAt: ISODateTime | null; emailResendValue: string | number | boolean | null; }
export interface AuthEmailResendNextAction { type: 'emailResend'; label: string; route: string | null; }
export interface AuthEmailResendResult { operationId: 'auth.email.resend'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthEmailResendRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthEmailResendInput; }
export interface AuthEmailResendData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthEmailResendNextAction | null; emailResendResult: AuthEmailResendResult; }
export interface AuthEmailResendResponse { operationId: 'auth.email.resend'; correlationId: string; generatedAt: ISODateTime; data: AuthEmailResendData; warnings: ApiProblem[]; }
export interface AuthEmailVerifyFilters { search: string | null; status: string[] | null; source: string[] | null; emailVerifyFilter: string | number | boolean | null; }
export interface AuthEmailVerifyInput { requestedBy: UUID; effectiveAt: ISODateTime | null; emailVerifyValue: string | number | boolean | null; }
export interface AuthEmailVerifyNextAction { type: 'emailVerify'; label: string; route: string | null; }
export interface AuthEmailVerifyResult { operationId: 'auth.email.verify'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthEmailVerifyRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthEmailVerifyInput; }
export interface AuthEmailVerifyData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthEmailVerifyNextAction | null; emailVerifyResult: AuthEmailVerifyResult; }
export interface AuthEmailVerifyResponse { operationId: 'auth.email.verify'; correlationId: string; generatedAt: ISODateTime; data: AuthEmailVerifyData; warnings: ApiProblem[]; }
export interface AuthLoginFilters { search: string | null; status: string[] | null; source: string[] | null; loginFilter: string | number | boolean | null; }
export interface AuthLoginInput { requestedBy: UUID; effectiveAt: ISODateTime | null; loginValue: string | number | boolean | null; }
export interface AuthLoginNextAction { type: 'login'; label: string; route: string | null; }
export interface AuthLoginResult { operationId: 'auth.login'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthLoginRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthLoginInput; }
export interface AuthLoginData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthLoginNextAction | null; loginResult: AuthLoginResult; }
export interface AuthLoginResponse { operationId: 'auth.login'; correlationId: string; generatedAt: ISODateTime; data: AuthLoginData; warnings: ApiProblem[]; }
export interface AuthLogoutFilters { search: string | null; status: string[] | null; source: string[] | null; logoutFilter: string | number | boolean | null; }
export interface AuthLogoutInput { requestedBy: UUID; effectiveAt: ISODateTime | null; logoutValue: string | number | boolean | null; }
export interface AuthLogoutNextAction { type: 'logout'; label: string; route: string | null; }
export interface AuthLogoutResult { operationId: 'auth.logout'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthLogoutRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthLogoutInput; }
export interface AuthLogoutData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthLogoutNextAction | null; logoutResult: AuthLogoutResult; }
export interface AuthLogoutResponse { operationId: 'auth.logout'; correlationId: string; generatedAt: ISODateTime; data: AuthLogoutData; warnings: ApiProblem[]; }
export interface AuthMfaConfirmFilters { search: string | null; status: string[] | null; source: string[] | null; mfaConfirmFilter: string | number | boolean | null; }
export interface AuthMfaConfirmInput { requestedBy: UUID; effectiveAt: ISODateTime | null; mfaConfirmValue: string | number | boolean | null; }
export interface AuthMfaConfirmNextAction { type: 'mfaConfirm'; label: string; route: string | null; }
export interface AuthMfaConfirmResult { operationId: 'auth.mfa.confirm'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthMfaConfirmRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthMfaConfirmInput; }
export interface AuthMfaConfirmData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthMfaConfirmNextAction | null; mfaChallengeId: UUID | null; mfaConfirmResult: AuthMfaConfirmResult; }
export interface AuthMfaConfirmResponse { operationId: 'auth.mfa.confirm'; correlationId: string; generatedAt: ISODateTime; data: AuthMfaConfirmData; warnings: ApiProblem[]; }
export interface AuthMfaEnrollFilters { search: string | null; status: string[] | null; source: string[] | null; mfaEnrollFilter: string | number | boolean | null; }
export interface AuthMfaEnrollInput { requestedBy: UUID; effectiveAt: ISODateTime | null; mfaEnrollValue: string | number | boolean | null; }
export interface AuthMfaEnrollNextAction { type: 'mfaEnroll'; label: string; route: string | null; }
export interface AuthMfaEnrollResult { operationId: 'auth.mfa.enroll'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthMfaEnrollRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthMfaEnrollInput; }
export interface AuthMfaEnrollData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthMfaEnrollNextAction | null; mfaChallengeId: UUID | null; mfaEnrollResult: AuthMfaEnrollResult; }
export interface AuthMfaEnrollResponse { operationId: 'auth.mfa.enroll'; correlationId: string; generatedAt: ISODateTime; data: AuthMfaEnrollData; warnings: ApiProblem[]; }
export interface AuthMfaVerifyFilters { search: string | null; status: string[] | null; source: string[] | null; mfaVerifyFilter: string | number | boolean | null; }
export interface AuthMfaVerifyInput { requestedBy: UUID; effectiveAt: ISODateTime | null; mfaVerifyValue: string | number | boolean | null; }
export interface AuthMfaVerifyNextAction { type: 'mfaVerify'; label: string; route: string | null; }
export interface AuthMfaVerifyResult { operationId: 'auth.mfa.verify'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthMfaVerifyRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthMfaVerifyInput; }
export interface AuthMfaVerifyData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthMfaVerifyNextAction | null; mfaChallengeId: UUID | null; mfaVerifyResult: AuthMfaVerifyResult; }
export interface AuthMfaVerifyResponse { operationId: 'auth.mfa.verify'; correlationId: string; generatedAt: ISODateTime; data: AuthMfaVerifyData; warnings: ApiProblem[]; }
export interface AuthOauthCallbackFilters { search: string | null; status: string[] | null; source: string[] | null; oauthCallbackFilter: string | number | boolean | null; }
export interface AuthOauthCallbackInput { requestedBy: UUID; effectiveAt: ISODateTime | null; oauthCallbackValue: string | number | boolean | null; }
export interface AuthOauthCallbackNextAction { type: 'oauthCallback'; label: string; route: string | null; }
export interface AuthOauthCallbackResult { operationId: 'auth.oauth.callback'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthOauthCallbackRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthOauthCallbackInput; }
export interface AuthOauthCallbackData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthOauthCallbackNextAction | null; redirectUrl: string | null; oauthCallbackResult: AuthOauthCallbackResult; }
export interface AuthOauthCallbackResponse { operationId: 'auth.oauth.callback'; correlationId: string; generatedAt: ISODateTime; data: AuthOauthCallbackData; warnings: ApiProblem[]; }
export interface AuthOauthStartFilters { search: string | null; status: string[] | null; source: string[] | null; oauthStartFilter: string | number | boolean | null; }
export interface AuthOauthStartInput { requestedBy: UUID; effectiveAt: ISODateTime | null; oauthStartValue: string | number | boolean | null; }
export interface AuthOauthStartNextAction { type: 'oauthStart'; label: string; route: string | null; }
export interface AuthOauthStartResult { operationId: 'auth.oauth.start'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthOauthStartRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthOauthStartInput; }
export interface AuthOauthStartData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthOauthStartNextAction | null; redirectUrl: string | null; oauthStartResult: AuthOauthStartResult; }
export interface AuthOauthStartResponse { operationId: 'auth.oauth.start'; correlationId: string; generatedAt: ISODateTime; data: AuthOauthStartData; warnings: ApiProblem[]; }
export interface AuthPasswordRecoveryRequestFilters { search: string | null; status: string[] | null; source: string[] | null; passwordRecoveryRequestFilter: string | number | boolean | null; }
export interface AuthPasswordRecoveryRequestInput { requestedBy: UUID; effectiveAt: ISODateTime | null; passwordRecoveryRequestValue: string | number | boolean | null; }
export interface AuthPasswordRecoveryRequestNextAction { type: 'passwordRecoveryRequest'; label: string; route: string | null; }
export interface AuthPasswordRecoveryRequestResult { operationId: 'auth.password.recovery.request'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthPasswordRecoveryRequestRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthPasswordRecoveryRequestInput; }
export interface AuthPasswordRecoveryRequestData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthPasswordRecoveryRequestNextAction | null; passwordRecoveryRequestResult: AuthPasswordRecoveryRequestResult; }
export interface AuthPasswordRecoveryRequestResponse { operationId: 'auth.password.recovery.request'; correlationId: string; generatedAt: ISODateTime; data: AuthPasswordRecoveryRequestData; warnings: ApiProblem[]; }
export interface AuthPasswordRecoveryTokenValidateFilters { search: string | null; status: string[] | null; source: string[] | null; passwordRecoveryTokenValidateFilter: string | number | boolean | null; }
export interface AuthPasswordRecoveryTokenValidateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; passwordRecoveryTokenValidateValue: string | number | boolean | null; }
export interface AuthPasswordRecoveryTokenValidateNextAction { type: 'passwordRecoveryTokenValidate'; label: string; route: string | null; }
export interface AuthPasswordRecoveryTokenValidateResult { operationId: 'auth.password.recovery.token.validate'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthPasswordRecoveryTokenValidateRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthPasswordRecoveryTokenValidateInput; }
export interface AuthPasswordRecoveryTokenValidateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthPasswordRecoveryTokenValidateNextAction | null; passwordRecoveryTokenValidateResult: AuthPasswordRecoveryTokenValidateResult; }
export interface AuthPasswordRecoveryTokenValidateResponse { operationId: 'auth.password.recovery.token.validate'; correlationId: string; generatedAt: ISODateTime; data: AuthPasswordRecoveryTokenValidateData; warnings: ApiProblem[]; }
export interface AuthPasswordResetFilters { search: string | null; status: string[] | null; source: string[] | null; passwordResetFilter: string | number | boolean | null; }
export interface AuthPasswordResetInput { requestedBy: UUID; effectiveAt: ISODateTime | null; passwordResetValue: string | number | boolean | null; }
export interface AuthPasswordResetNextAction { type: 'passwordReset'; label: string; route: string | null; }
export interface AuthPasswordResetResult { operationId: 'auth.password.reset'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthPasswordResetRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthPasswordResetInput; }
export interface AuthPasswordResetData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthPasswordResetNextAction | null; passwordResetResult: AuthPasswordResetResult; }
export interface AuthPasswordResetResponse { operationId: 'auth.password.reset'; correlationId: string; generatedAt: ISODateTime; data: AuthPasswordResetData; warnings: ApiProblem[]; }
export interface AuthReauthenticateFilters { search: string | null; status: string[] | null; source: string[] | null; reauthenticateFilter: string | number | boolean | null; }
export interface AuthReauthenticateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; reauthenticateValue: string | number | boolean | null; }
export interface AuthReauthenticateNextAction { type: 'reauthenticate'; label: string; route: string | null; }
export interface AuthReauthenticateResult { operationId: 'auth.reauthenticate'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthReauthenticateRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthReauthenticateInput; }
export interface AuthReauthenticateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthReauthenticateNextAction | null; reauthenticateResult: AuthReauthenticateResult; }
export interface AuthReauthenticateResponse { operationId: 'auth.reauthenticate'; correlationId: string; generatedAt: ISODateTime; data: AuthReauthenticateData; warnings: ApiProblem[]; }
export interface AuthRegisterEmailFilters { search: string | null; status: string[] | null; source: string[] | null; registerEmailFilter: string | number | boolean | null; }
export interface AuthRegisterEmailInput { requestedBy: UUID; effectiveAt: ISODateTime | null; registerEmailValue: string | number | boolean | null; }
export interface AuthRegisterEmailNextAction { type: 'registerEmail'; label: string; route: string | null; }
export interface AuthRegisterEmailResult { operationId: 'auth.register.email'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthRegisterEmailRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthRegisterEmailInput; }
export interface AuthRegisterEmailData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthRegisterEmailNextAction | null; registerEmailResult: AuthRegisterEmailResult; }
export interface AuthRegisterEmailResponse { operationId: 'auth.register.email'; correlationId: string; generatedAt: ISODateTime; data: AuthRegisterEmailData; warnings: ApiProblem[]; }
export interface AuthRegistrationFinalizeFilters { search: string | null; status: string[] | null; source: string[] | null; registrationFinalizeFilter: string | number | boolean | null; }
export interface AuthRegistrationFinalizeInput { requestedBy: UUID; effectiveAt: ISODateTime | null; registrationFinalizeValue: string | number | boolean | null; }
export interface AuthRegistrationFinalizeNextAction { type: 'registrationFinalize'; label: string; route: string | null; }
export interface AuthRegistrationFinalizeResult { operationId: 'auth.registration.finalize'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthRegistrationFinalizeRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: AuthRegistrationFinalizeInput; }
export interface AuthRegistrationFinalizeData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: AuthRegistrationFinalizeNextAction | null; registrationFinalizeResult: AuthRegistrationFinalizeResult; }
export interface AuthRegistrationFinalizeResponse { operationId: 'auth.registration.finalize'; correlationId: string; generatedAt: ISODateTime; data: AuthRegistrationFinalizeData; warnings: ApiProblem[]; }
export interface AuthSessionReadFilters { search: string | null; status: string[] | null; source: string[] | null; sessionFilter: string | number | boolean | null; }
export interface AuthSessionReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; sessionValue: string | number | boolean | null; }
export interface AuthSessionReadNextAction { type: 'session'; label: string; route: string | null; }
export interface AuthSessionReadResult { operationId: 'auth.session.read'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthSessionReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: AuthSessionReadFilters | null; }
export interface AuthSessionReadData { records: AuthRecord[]; pageInfo: PageInfo; summary: AuthSummary; sessionResult: AuthSessionReadResult; }
export interface AuthSessionReadResponse { operationId: 'auth.session.read'; correlationId: string; generatedAt: ISODateTime; data: AuthSessionReadData; warnings: ApiProblem[]; }
export interface AuthStatusReadFilters { search: string | null; status: string[] | null; source: string[] | null; statusFilter: string | number | boolean | null; }
export interface AuthStatusReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; statusValue: string | number | boolean | null; }
export interface AuthStatusReadNextAction { type: 'status'; label: string; route: string | null; }
export interface AuthStatusReadResult { operationId: 'auth.status.read'; completedAt: ISODateTime; domain: 'auth'; }
export interface AuthStatusReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: AuthStatusReadFilters | null; }
export interface AuthStatusReadData { records: AuthRecord[]; pageInfo: PageInfo; summary: AuthSummary; statusResult: AuthStatusReadResult; }
export interface AuthStatusReadResponse { operationId: 'auth.status.read'; correlationId: string; generatedAt: ISODateTime; data: AuthStatusReadData; warnings: ApiProblem[]; }
export interface BillingAdjustmentsReadFilters { search: string | null; status: string[] | null; source: string[] | null; adjustmentsFilter: string | number | boolean | null; }
export interface BillingAdjustmentsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; adjustmentsValue: string | number | boolean | null; }
export interface BillingAdjustmentsReadNextAction { type: 'adjustments'; label: string; route: string | null; }
export interface BillingAdjustmentsReadResult { operationId: 'billing.adjustments.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingAdjustmentsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingAdjustmentsReadFilters | null; }
export interface BillingAdjustmentsReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; adjustmentsResult: BillingAdjustmentsReadResult; }
export interface BillingAdjustmentsReadResponse { operationId: 'billing.adjustments.read'; correlationId: string; generatedAt: ISODateTime; data: BillingAdjustmentsReadData; warnings: ApiProblem[]; }
export interface BillingChangeCancelReadFilters { search: string | null; status: string[] | null; source: string[] | null; changeCancelFilter: string | number | boolean | null; }
export interface BillingChangeCancelReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; changeCancelValue: string | number | boolean | null; }
export interface BillingChangeCancelReadNextAction { type: 'changeCancel'; label: string; route: string | null; }
export interface BillingChangeCancelReadResult { operationId: 'billing.change-cancel.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingChangeCancelReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingChangeCancelReadFilters | null; }
export interface BillingChangeCancelReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; changeCancelResult: BillingChangeCancelReadResult; }
export interface BillingChangeCancelReadResponse { operationId: 'billing.change-cancel.read'; correlationId: string; generatedAt: ISODateTime; data: BillingChangeCancelReadData; warnings: ApiProblem[]; }
export interface BillingEntitlementsReadFilters { search: string | null; status: string[] | null; source: string[] | null; entitlementsFilter: string | number | boolean | null; }
export interface BillingEntitlementsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; entitlementsValue: string | number | boolean | null; }
export interface BillingEntitlementsReadNextAction { type: 'entitlements'; label: string; route: string | null; }
export interface BillingEntitlementsReadResult { operationId: 'billing.entitlements.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingEntitlementsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingEntitlementsReadFilters | null; }
export interface BillingEntitlementsReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; entitlementsResult: BillingEntitlementsReadResult; }
export interface BillingEntitlementsReadResponse { operationId: 'billing.entitlements.read'; correlationId: string; generatedAt: ISODateTime; data: BillingEntitlementsReadData; warnings: ApiProblem[]; }
export interface BillingInvoicesReadFilters { search: string | null; status: string[] | null; source: string[] | null; invoicesFilter: string | number | boolean | null; }
export interface BillingInvoicesReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; invoicesValue: string | number | boolean | null; }
export interface BillingInvoicesReadNextAction { type: 'invoices'; label: string; route: string | null; }
export interface BillingInvoicesReadResult { operationId: 'billing.invoices.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingInvoicesReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingInvoicesReadFilters | null; }
export interface BillingInvoicesReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; invoicesResult: BillingInvoicesReadResult; }
export interface BillingInvoicesReadResponse { operationId: 'billing.invoices.read'; correlationId: string; generatedAt: ISODateTime; data: BillingInvoicesReadData; warnings: ApiProblem[]; }
export interface BillingOverduePaymentReadFilters { search: string | null; status: string[] | null; source: string[] | null; overduePaymentFilter: string | number | boolean | null; }
export interface BillingOverduePaymentReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overduePaymentValue: string | number | boolean | null; }
export interface BillingOverduePaymentReadNextAction { type: 'overduePayment'; label: string; route: string | null; }
export interface BillingOverduePaymentReadResult { operationId: 'billing.overdue-payment.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingOverduePaymentReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingOverduePaymentReadFilters | null; }
export interface BillingOverduePaymentReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; overduePaymentResult: BillingOverduePaymentReadResult; }
export interface BillingOverduePaymentReadResponse { operationId: 'billing.overdue-payment.read'; correlationId: string; generatedAt: ISODateTime; data: BillingOverduePaymentReadData; warnings: ApiProblem[]; }
export interface BillingOverdueResolveFilters { search: string | null; status: string[] | null; source: string[] | null; overdueResolveFilter: string | number | boolean | null; }
export interface BillingOverdueResolveInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overdueResolveValue: string | number | boolean | null; }
export interface BillingOverdueResolveNextAction { type: 'overdueResolve'; label: string; route: string | null; }
export interface BillingOverdueResolveResult { operationId: 'billing.overdue.resolve'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingOverdueResolveRequest { context: ApiContext; metadata: MutationMetadata; subscriptionId: UUID | string | null; input: BillingOverdueResolveInput; }
export interface BillingOverdueResolveData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: BillingOverdueResolveNextAction | null; overdueResolveResult: BillingOverdueResolveResult; }
export interface BillingOverdueResolveResponse { operationId: 'billing.overdue.resolve'; correlationId: string; generatedAt: ISODateTime; data: BillingOverdueResolveData; warnings: ApiProblem[]; }
export interface BillingPaymentMethodUpdateFilters { search: string | null; status: string[] | null; source: string[] | null; paymentMethodUpdateFilter: string | number | boolean | null; }
export interface BillingPaymentMethodUpdateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; paymentMethodUpdateValue: string | number | boolean | null; }
export interface BillingPaymentMethodUpdateNextAction { type: 'paymentMethodUpdate'; label: string; route: string | null; }
export interface BillingPaymentMethodUpdateResult { operationId: 'billing.payment.method.update'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingPaymentMethodUpdateRequest { context: ApiContext; metadata: MutationMetadata; subscriptionId: UUID | string | null; input: BillingPaymentMethodUpdateInput; }
export interface BillingPaymentMethodUpdateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: BillingPaymentMethodUpdateNextAction | null; paymentMethodUpdateResult: BillingPaymentMethodUpdateResult; }
export interface BillingPaymentMethodUpdateResponse { operationId: 'billing.payment.method.update'; correlationId: string; generatedAt: ISODateTime; data: BillingPaymentMethodUpdateData; warnings: ApiProblem[]; }
export interface BillingPaymentsReadFilters { search: string | null; status: string[] | null; source: string[] | null; paymentsFilter: string | number | boolean | null; }
export interface BillingPaymentsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; paymentsValue: string | number | boolean | null; }
export interface BillingPaymentsReadNextAction { type: 'payments'; label: string; route: string | null; }
export interface BillingPaymentsReadResult { operationId: 'billing.payments.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingPaymentsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingPaymentsReadFilters | null; }
export interface BillingPaymentsReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; paymentsResult: BillingPaymentsReadResult; }
export interface BillingPaymentsReadResponse { operationId: 'billing.payments.read'; correlationId: string; generatedAt: ISODateTime; data: BillingPaymentsReadData; warnings: ApiProblem[]; }
export interface BillingPilotToSubscriptionReadFilters { search: string | null; status: string[] | null; source: string[] | null; pilotToSubscriptionFilter: string | number | boolean | null; }
export interface BillingPilotToSubscriptionReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; pilotToSubscriptionValue: string | number | boolean | null; }
export interface BillingPilotToSubscriptionReadNextAction { type: 'pilotToSubscription'; label: string; route: string | null; }
export interface BillingPilotToSubscriptionReadResult { operationId: 'billing.pilot-to-subscription.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingPilotToSubscriptionReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingPilotToSubscriptionReadFilters | null; }
export interface BillingPilotToSubscriptionReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; pilotToSubscriptionResult: BillingPilotToSubscriptionReadResult; }
export interface BillingPilotToSubscriptionReadResponse { operationId: 'billing.pilot-to-subscription.read'; correlationId: string; generatedAt: ISODateTime; data: BillingPilotToSubscriptionReadData; warnings: ApiProblem[]; }
export interface BillingPilotReadFilters { search: string | null; status: string[] | null; source: string[] | null; pilotFilter: string | number | boolean | null; }
export interface BillingPilotReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; pilotValue: string | number | boolean | null; }
export interface BillingPilotReadNextAction { type: 'pilot'; label: string; route: string | null; }
export interface BillingPilotReadResult { operationId: 'billing.pilot.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingPilotReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingPilotReadFilters | null; }
export interface BillingPilotReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; pilotResult: BillingPilotReadResult; }
export interface BillingPilotReadResponse { operationId: 'billing.pilot.read'; correlationId: string; generatedAt: ISODateTime; data: BillingPilotReadData; warnings: ApiProblem[]; }
export interface BillingPlanSelectFilters { search: string | null; status: string[] | null; source: string[] | null; planSelectFilter: string | number | boolean | null; }
export interface BillingPlanSelectInput { requestedBy: UUID; effectiveAt: ISODateTime | null; planSelectValue: string | number | boolean | null; }
export interface BillingPlanSelectNextAction { type: 'planSelect'; label: string; route: string | null; }
export interface BillingPlanSelectResult { operationId: 'billing.plan.select'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingPlanSelectRequest { context: ApiContext; metadata: MutationMetadata; subscriptionId: UUID | string | null; input: BillingPlanSelectInput; }
export interface BillingPlanSelectData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: BillingPlanSelectNextAction | null; planSelectResult: BillingPlanSelectResult; }
export interface BillingPlanSelectResponse { operationId: 'billing.plan.select'; correlationId: string; generatedAt: ISODateTime; data: BillingPlanSelectData; warnings: ApiProblem[]; }
export interface BillingPlansReadFilters { search: string | null; status: string[] | null; source: string[] | null; plansFilter: string | number | boolean | null; }
export interface BillingPlansReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; plansValue: string | number | boolean | null; }
export interface BillingPlansReadNextAction { type: 'plans'; label: string; route: string | null; }
export interface BillingPlansReadResult { operationId: 'billing.plans.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingPlansReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingPlansReadFilters | null; }
export interface BillingPlansReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; plansResult: BillingPlansReadResult; }
export interface BillingPlansReadResponse { operationId: 'billing.plans.read'; correlationId: string; generatedAt: ISODateTime; data: BillingPlansReadData; warnings: ApiProblem[]; }
export interface BillingReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface BillingReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface BillingReadNextAction { type: 'result'; label: string; route: string | null; }
export interface BillingReadResult { operationId: 'billing.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingReadFilters | null; }
export interface BillingReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; resultResult: BillingReadResult; }
export interface BillingReadResponse { operationId: 'billing.read'; correlationId: string; generatedAt: ISODateTime; data: BillingReadData; warnings: ApiProblem[]; }
export interface BillingSubscriptionActivateFilters { search: string | null; status: string[] | null; source: string[] | null; subscriptionActivateFilter: string | number | boolean | null; }
export interface BillingSubscriptionActivateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; subscriptionActivateValue: string | number | boolean | null; }
export interface BillingSubscriptionActivateNextAction { type: 'subscriptionActivate'; label: string; route: string | null; }
export interface BillingSubscriptionActivateResult { operationId: 'billing.subscription.activate'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingSubscriptionActivateRequest { context: ApiContext; metadata: MutationMetadata; subscriptionId: UUID | string | null; input: BillingSubscriptionActivateInput; }
export interface BillingSubscriptionActivateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: BillingSubscriptionActivateNextAction | null; subscriptionActivateResult: BillingSubscriptionActivateResult; }
export interface BillingSubscriptionActivateResponse { operationId: 'billing.subscription.activate'; correlationId: string; generatedAt: ISODateTime; data: BillingSubscriptionActivateData; warnings: ApiProblem[]; }
export interface BillingSubscriptionReadFilters { search: string | null; status: string[] | null; source: string[] | null; subscriptionFilter: string | number | boolean | null; }
export interface BillingSubscriptionReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; subscriptionValue: string | number | boolean | null; }
export interface BillingSubscriptionReadNextAction { type: 'subscription'; label: string; route: string | null; }
export interface BillingSubscriptionReadResult { operationId: 'billing.subscription.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingSubscriptionReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingSubscriptionReadFilters | null; }
export interface BillingSubscriptionReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; subscriptionResult: BillingSubscriptionReadResult; }
export interface BillingSubscriptionReadResponse { operationId: 'billing.subscription.read'; correlationId: string; generatedAt: ISODateTime; data: BillingSubscriptionReadData; warnings: ApiProblem[]; }
export interface BillingUsageLimitsReadFilters { search: string | null; status: string[] | null; source: string[] | null; usageLimitsFilter: string | number | boolean | null; }
export interface BillingUsageLimitsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; usageLimitsValue: string | number | boolean | null; }
export interface BillingUsageLimitsReadNextAction { type: 'usageLimits'; label: string; route: string | null; }
export interface BillingUsageLimitsReadResult { operationId: 'billing.usage-limits.read'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingUsageLimitsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: BillingUsageLimitsReadFilters | null; }
export interface BillingUsageLimitsReadData { records: BillingRecord[]; pageInfo: PageInfo; summary: BillingSummary; usageLimitsResult: BillingUsageLimitsReadResult; }
export interface BillingUsageLimitsReadResponse { operationId: 'billing.usage-limits.read'; correlationId: string; generatedAt: ISODateTime; data: BillingUsageLimitsReadData; warnings: ApiProblem[]; }
export interface BillingWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface BillingWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface BillingWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface BillingWriteResult { operationId: 'billing.write'; completedAt: ISODateTime; domain: 'billing'; }
export interface BillingWriteRequest { context: ApiContext; metadata: MutationMetadata; subscriptionId: UUID | string | null; input: BillingWriteInput; }
export interface BillingWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: BillingWriteNextAction | null; resultResult: BillingWriteResult; }
export interface BillingWriteResponse { operationId: 'billing.write'; correlationId: string; generatedAt: ISODateTime; data: BillingWriteData; warnings: ApiProblem[]; }
export interface CampaignsAttributionSalesReadFilters { search: string | null; status: string[] | null; source: string[] | null; attributionSalesFilter: string | number | boolean | null; }
export interface CampaignsAttributionSalesReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; attributionSalesValue: string | number | boolean | null; }
export interface CampaignsAttributionSalesReadNextAction { type: 'attributionSales'; label: string; route: string | null; }
export interface CampaignsAttributionSalesReadResult { operationId: 'campaigns.attribution-sales.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsAttributionSalesReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsAttributionSalesReadFilters | null; }
export interface CampaignsAttributionSalesReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; attribution: AttributionView[]; attributionSalesResult: CampaignsAttributionSalesReadResult; }
export interface CampaignsAttributionSalesReadResponse { operationId: 'campaigns.attribution-sales.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsAttributionSalesReadData; warnings: ApiProblem[]; }
export interface CampaignsBudgetChangeProposeFilters { search: string | null; status: string[] | null; source: string[] | null; budgetChangeProposeFilter: string | number | boolean | null; }
export interface CampaignsBudgetChangeProposeInput { requestedBy: UUID; effectiveAt: ISODateTime | null; budgetChangeProposeValue: string | number | boolean | null; }
export interface CampaignsBudgetChangeProposeNextAction { type: 'budgetChangePropose'; label: string; route: string | null; }
export interface CampaignsBudgetChangeProposeResult { operationId: 'campaigns.budget.change.propose'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsBudgetChangeProposeRequest { context: ApiContext; metadata: MutationMetadata; campaignId: UUID | string | null; input: CampaignsBudgetChangeProposeInput; }
export interface CampaignsBudgetChangeProposeData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: CampaignsBudgetChangeProposeNextAction | null; budgetChangeProposeResult: CampaignsBudgetChangeProposeResult; }
export interface CampaignsBudgetChangeProposeResponse { operationId: 'campaigns.budget.change.propose'; correlationId: string; generatedAt: ISODateTime; data: CampaignsBudgetChangeProposeData; warnings: ApiProblem[]; }
export interface CampaignsBudgetReadFilters { search: string | null; status: string[] | null; source: string[] | null; budgetFilter: string | number | boolean | null; }
export interface CampaignsBudgetReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; budgetValue: string | number | boolean | null; }
export interface CampaignsBudgetReadNextAction { type: 'budget'; label: string; route: string | null; }
export interface CampaignsBudgetReadResult { operationId: 'campaigns.budget.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsBudgetReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsBudgetReadFilters | null; }
export interface CampaignsBudgetReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; budgetResult: CampaignsBudgetReadResult; }
export interface CampaignsBudgetReadResponse { operationId: 'campaigns.budget.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsBudgetReadData; warnings: ApiProblem[]; }
export interface CampaignsBudgetRecommendationReadFilters { search: string | null; status: string[] | null; source: string[] | null; budgetRecommendationFilter: string | number | boolean | null; }
export interface CampaignsBudgetRecommendationReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; budgetRecommendationValue: string | number | boolean | null; }
export interface CampaignsBudgetRecommendationReadNextAction { type: 'budgetRecommendation'; label: string; route: string | null; }
export interface CampaignsBudgetRecommendationReadResult { operationId: 'campaigns.budget.recommendation.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsBudgetRecommendationReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsBudgetRecommendationReadFilters | null; }
export interface CampaignsBudgetRecommendationReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; recommendations: RecommendationView[]; budgetRecommendationResult: CampaignsBudgetRecommendationReadResult; }
export interface CampaignsBudgetRecommendationReadResponse { operationId: 'campaigns.budget.recommendation.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsBudgetRecommendationReadData; warnings: ApiProblem[]; }
export interface CampaignsDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; detailFilter: string | number | boolean | null; }
export interface CampaignsDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; detailValue: string | number | boolean | null; }
export interface CampaignsDetailReadNextAction { type: 'detail'; label: string; route: string | null; }
export interface CampaignsDetailReadResult { operationId: 'campaigns.detail.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; campaignId: UUID | string; filters: CampaignsDetailReadFilters | null; }
export interface CampaignsDetailReadData { record: CampaignsRecord; detailResult: CampaignsDetailReadResult; }
export interface CampaignsDetailReadResponse { operationId: 'campaigns.detail.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsDetailReadData; warnings: ApiProblem[]; }
export interface CampaignsDiagnosticsReadFilters { search: string | null; status: string[] | null; source: string[] | null; diagnosticsFilter: string | number | boolean | null; }
export interface CampaignsDiagnosticsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; diagnosticsValue: string | number | boolean | null; }
export interface CampaignsDiagnosticsReadNextAction { type: 'diagnostics'; label: string; route: string | null; }
export interface CampaignsDiagnosticsReadResult { operationId: 'campaigns.diagnostics.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsDiagnosticsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsDiagnosticsReadFilters | null; }
export interface CampaignsDiagnosticsReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; diagnostics: DiagnosticFinding[]; diagnosticsResult: CampaignsDiagnosticsReadResult; }
export interface CampaignsDiagnosticsReadResponse { operationId: 'campaigns.diagnostics.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsDiagnosticsReadData; warnings: ApiProblem[]; }
export interface CampaignsListReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface CampaignsListReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface CampaignsListReadNextAction { type: 'result'; label: string; route: string | null; }
export interface CampaignsListReadResult { operationId: 'campaigns.list.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsListReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsListReadFilters | null; }
export interface CampaignsListReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; resultResult: CampaignsListReadResult; }
export interface CampaignsListReadResponse { operationId: 'campaigns.list.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsListReadData; warnings: ApiProblem[]; }
export interface CampaignsOverviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; overviewFilter: string | number | boolean | null; }
export interface CampaignsOverviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overviewValue: string | number | boolean | null; }
export interface CampaignsOverviewReadNextAction { type: 'overview'; label: string; route: string | null; }
export interface CampaignsOverviewReadResult { operationId: 'campaigns.overview.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsOverviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsOverviewReadFilters | null; }
export interface CampaignsOverviewReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; overviewResult: CampaignsOverviewReadResult; }
export interface CampaignsOverviewReadResponse { operationId: 'campaigns.overview.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsOverviewReadData; warnings: ApiProblem[]; }
export interface CampaignsReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface CampaignsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface CampaignsReadNextAction { type: 'result'; label: string; route: string | null; }
export interface CampaignsReadResult { operationId: 'campaigns.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsReadFilters | null; }
export interface CampaignsReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; resultResult: CampaignsReadResult; }
export interface CampaignsReadResponse { operationId: 'campaigns.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsReadData; warnings: ApiProblem[]; }
export interface CampaignsRecommendationsReadFilters { search: string | null; status: string[] | null; source: string[] | null; recommendationsFilter: string | number | boolean | null; }
export interface CampaignsRecommendationsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; recommendationsValue: string | number | boolean | null; }
export interface CampaignsRecommendationsReadNextAction { type: 'recommendations'; label: string; route: string | null; }
export interface CampaignsRecommendationsReadResult { operationId: 'campaigns.recommendations.read'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsRecommendationsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CampaignsRecommendationsReadFilters | null; }
export interface CampaignsRecommendationsReadData { records: CampaignsRecord[]; pageInfo: PageInfo; summary: CampaignsSummary; recommendations: RecommendationView[]; recommendationsResult: CampaignsRecommendationsReadResult; }
export interface CampaignsRecommendationsReadResponse { operationId: 'campaigns.recommendations.read'; correlationId: string; generatedAt: ISODateTime; data: CampaignsRecommendationsReadData; warnings: ApiProblem[]; }
export interface CampaignsWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface CampaignsWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface CampaignsWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface CampaignsWriteResult { operationId: 'campaigns.write'; completedAt: ISODateTime; domain: 'campaigns'; }
export interface CampaignsWriteRequest { context: ApiContext; metadata: MutationMetadata; campaignId: UUID | string | null; input: CampaignsWriteInput; }
export interface CampaignsWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: CampaignsWriteNextAction | null; resultResult: CampaignsWriteResult; }
export interface CampaignsWriteResponse { operationId: 'campaigns.write'; correlationId: string; generatedAt: ISODateTime; data: CampaignsWriteData; warnings: ApiProblem[]; }
export interface CommandCenterAiRecommendationsReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerAiRecommendationsFilter: string | number | boolean | null; }
export interface CommandCenterAiRecommendationsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerAiRecommendationsValue: string | number | boolean | null; }
export interface CommandCenterAiRecommendationsReadNextAction { type: 'centerAiRecommendations'; label: string; route: string | null; }
export interface CommandCenterAiRecommendationsReadResult { operationId: 'command-center.ai-recommendations.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterAiRecommendationsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterAiRecommendationsReadFilters | null; }
export interface CommandCenterAiRecommendationsReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; recommendations: RecommendationView[]; centerAiRecommendationsResult: CommandCenterAiRecommendationsReadResult; }
export interface CommandCenterAiRecommendationsReadResponse { operationId: 'command-center.ai-recommendations.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterAiRecommendationsReadData; warnings: ApiProblem[]; }
export interface CommandCenterAttentionQueueReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerAttentionQueueFilter: string | number | boolean | null; }
export interface CommandCenterAttentionQueueReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerAttentionQueueValue: string | number | boolean | null; }
export interface CommandCenterAttentionQueueReadNextAction { type: 'centerAttentionQueue'; label: string; route: string | null; }
export interface CommandCenterAttentionQueueReadResult { operationId: 'command-center.attention.queue.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterAttentionQueueReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterAttentionQueueReadFilters | null; }
export interface CommandCenterAttentionQueueReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerAttentionQueueResult: CommandCenterAttentionQueueReadResult; }
export interface CommandCenterAttentionQueueReadResponse { operationId: 'command-center.attention.queue.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterAttentionQueueReadData; warnings: ApiProblem[]; }
export interface CommandCenterCustomersSummaryReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerCustomersSummaryFilter: string | number | boolean | null; }
export interface CommandCenterCustomersSummaryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerCustomersSummaryValue: string | number | boolean | null; }
export interface CommandCenterCustomersSummaryReadNextAction { type: 'centerCustomersSummary'; label: string; route: string | null; }
export interface CommandCenterCustomersSummaryReadResult { operationId: 'command-center.customers-summary.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterCustomersSummaryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterCustomersSummaryReadFilters | null; }
export interface CommandCenterCustomersSummaryReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerCustomersSummaryResult: CommandCenterCustomersSummaryReadResult; }
export interface CommandCenterCustomersSummaryReadResponse { operationId: 'command-center.customers-summary.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterCustomersSummaryReadData; warnings: ApiProblem[]; }
export interface CommandCenterDriversReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerDriversFilter: string | number | boolean | null; }
export interface CommandCenterDriversReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerDriversValue: string | number | boolean | null; }
export interface CommandCenterDriversReadNextAction { type: 'centerDrivers'; label: string; route: string | null; }
export interface CommandCenterDriversReadResult { operationId: 'command-center.drivers.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterDriversReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterDriversReadFilters | null; }
export interface CommandCenterDriversReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; drivers: DriverMetricView[]; centerDriversResult: CommandCenterDriversReadResult; }
export interface CommandCenterDriversReadResponse { operationId: 'command-center.drivers.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterDriversReadData; warnings: ApiProblem[]; }
export interface CommandCenterFunnelReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerFunnelFilter: string | number | boolean | null; }
export interface CommandCenterFunnelReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerFunnelValue: string | number | boolean | null; }
export interface CommandCenterFunnelReadNextAction { type: 'centerFunnel'; label: string; route: string | null; }
export interface CommandCenterFunnelReadResult { operationId: 'command-center.funnel.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterFunnelReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterFunnelReadFilters | null; }
export interface CommandCenterFunnelReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; steps: FunnelStepView[]; centerFunnelResult: CommandCenterFunnelReadResult; }
export interface CommandCenterFunnelReadResponse { operationId: 'command-center.funnel.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterFunnelReadData; warnings: ApiProblem[]; }
export interface CommandCenterKpiReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerKpiFilter: string | number | boolean | null; }
export interface CommandCenterKpiReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerKpiValue: string | number | boolean | null; }
export interface CommandCenterKpiReadNextAction { type: 'centerKpi'; label: string; route: string | null; }
export interface CommandCenterKpiReadResult { operationId: 'command-center.kpi.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterKpiReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterKpiReadFilters | null; }
export interface CommandCenterKpiReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerKpiResult: CommandCenterKpiReadResult; }
export interface CommandCenterKpiReadResponse { operationId: 'command-center.kpi.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterKpiReadData; warnings: ApiProblem[]; }
export interface CommandCenterOverviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerOverviewFilter: string | number | boolean | null; }
export interface CommandCenterOverviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerOverviewValue: string | number | boolean | null; }
export interface CommandCenterOverviewReadNextAction { type: 'centerOverview'; label: string; route: string | null; }
export interface CommandCenterOverviewReadResult { operationId: 'command-center.overview.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterOverviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterOverviewReadFilters | null; }
export interface CommandCenterOverviewReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerOverviewResult: CommandCenterOverviewReadResult; }
export interface CommandCenterOverviewReadResponse { operationId: 'command-center.overview.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterOverviewReadData; warnings: ApiProblem[]; }
export interface CommandCenterPlanPerformanceReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerPlanPerformanceFilter: string | number | boolean | null; }
export interface CommandCenterPlanPerformanceReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerPlanPerformanceValue: string | number | boolean | null; }
export interface CommandCenterPlanPerformanceReadNextAction { type: 'centerPlanPerformance'; label: string; route: string | null; }
export interface CommandCenterPlanPerformanceReadResult { operationId: 'command-center.plan-performance.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterPlanPerformanceReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterPlanPerformanceReadFilters | null; }
export interface CommandCenterPlanPerformanceReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; trajectory: PlanTrajectoryPointView[]; planTotal: number; forecastTotal: number; forecastMethod: 'linear-run-rate'; centerPlanPerformanceResult: CommandCenterPlanPerformanceReadResult; }
export interface CommandCenterPlanPerformanceReadResponse { operationId: 'command-center.plan-performance.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterPlanPerformanceReadData; warnings: ApiProblem[]; }
export interface CommandCenterProductsSummaryReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerProductsSummaryFilter: string | number | boolean | null; }
export interface CommandCenterProductsSummaryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerProductsSummaryValue: string | number | boolean | null; }
export interface CommandCenterProductsSummaryReadNextAction { type: 'centerProductsSummary'; label: string; route: string | null; }
export interface CommandCenterProductsSummaryReadResult { operationId: 'command-center.products-summary.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterProductsSummaryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterProductsSummaryReadFilters | null; }
export interface CommandCenterProductsSummaryReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerProductsSummaryResult: CommandCenterProductsSummaryReadResult; }
export interface CommandCenterProductsSummaryReadResponse { operationId: 'command-center.products-summary.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterProductsSummaryReadData; warnings: ApiProblem[]; }
export interface CommandCenterReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerFilter: string | number | boolean | null; }
export interface CommandCenterReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerValue: string | number | boolean | null; }
export interface CommandCenterReadNextAction { type: 'center'; label: string; route: string | null; }
export interface CommandCenterReadResult { operationId: 'command-center.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterReadFilters | null; }
export interface CommandCenterReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerResult: CommandCenterReadResult; }
export interface CommandCenterReadResponse { operationId: 'command-center.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterReadData; warnings: ApiProblem[]; }
export interface CommandCenterSalesSignalsReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerSalesSignalsFilter: string | number | boolean | null; }
export interface CommandCenterSalesSignalsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerSalesSignalsValue: string | number | boolean | null; }
export interface CommandCenterSalesSignalsReadNextAction { type: 'centerSalesSignals'; label: string; route: string | null; }
export interface CommandCenterSalesSignalsReadResult { operationId: 'command-center.sales-signals.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterSalesSignalsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterSalesSignalsReadFilters | null; }
export interface CommandCenterSalesSignalsReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerSalesSignalsResult: CommandCenterSalesSignalsReadResult; }
export interface CommandCenterSalesSignalsReadResponse { operationId: 'command-center.sales-signals.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterSalesSignalsReadData; warnings: ApiProblem[]; }
export interface CommandCenterSalesSourcesReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerSalesSourcesFilter: string | number | boolean | null; }
export interface CommandCenterSalesSourcesReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerSalesSourcesValue: string | number | boolean | null; }
export interface CommandCenterSalesSourcesReadNextAction { type: 'centerSalesSources'; label: string; route: string | null; }
export interface CommandCenterSalesSourcesReadResult { operationId: 'command-center.sales-sources.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterSalesSourcesReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterSalesSourcesReadFilters | null; }
export interface CommandCenterSalesSourcesReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerSalesSourcesResult: CommandCenterSalesSourcesReadResult; }
export interface CommandCenterSalesSourcesReadResponse { operationId: 'command-center.sales-sources.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterSalesSourcesReadData; warnings: ApiProblem[]; }
export interface CommandCenterTrafficSummaryReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerTrafficSummaryFilter: string | number | boolean | null; }
export interface CommandCenterTrafficSummaryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerTrafficSummaryValue: string | number | boolean | null; }
export interface CommandCenterTrafficSummaryReadNextAction { type: 'centerTrafficSummary'; label: string; route: string | null; }
export interface CommandCenterTrafficSummaryReadResult { operationId: 'command-center.traffic-summary.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterTrafficSummaryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterTrafficSummaryReadFilters | null; }
export interface CommandCenterTrafficSummaryReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; centerTrafficSummaryResult: CommandCenterTrafficSummaryReadResult; }
export interface CommandCenterTrafficSummaryReadResponse { operationId: 'command-center.traffic-summary.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterTrafficSummaryReadData; warnings: ApiProblem[]; }
export interface CommandCenterWaterfallReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerWaterfallFilter: string | number | boolean | null; }
export interface CommandCenterWaterfallReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerWaterfallValue: string | number | boolean | null; }
export interface CommandCenterWaterfallReadNextAction { type: 'centerWaterfall'; label: string; route: string | null; }
export interface CommandCenterWaterfallReadResult { operationId: 'command-center.waterfall.read'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterWaterfallReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CommandCenterWaterfallReadFilters | null; }
export interface CommandCenterWaterfallReadData { records: CommandCenterRecord[]; pageInfo: PageInfo; summary: CommandCenterSummary; waterfall: WaterfallItem[]; centerWaterfallResult: CommandCenterWaterfallReadResult; }
export interface CommandCenterWaterfallReadResponse { operationId: 'command-center.waterfall.read'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterWaterfallReadData; warnings: ApiProblem[]; }
export interface CommandCenterWriteFilters { search: string | null; status: string[] | null; source: string[] | null; centerFilter: string | number | boolean | null; }
export interface CommandCenterWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerValue: string | number | boolean | null; }
export interface CommandCenterWriteNextAction { type: 'center'; label: string; route: string | null; }
export interface CommandCenterWriteResult { operationId: 'command-center.write'; completedAt: ISODateTime; domain: 'command-center'; }
export interface CommandCenterWriteRequest { context: ApiContext; metadata: MutationMetadata; metricId: UUID | string | null; input: CommandCenterWriteInput; }
export interface CommandCenterWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: CommandCenterWriteNextAction | null; centerResult: CommandCenterWriteResult; }
export interface CommandCenterWriteResponse { operationId: 'command-center.write'; correlationId: string; generatedAt: ISODateTime; data: CommandCenterWriteData; warnings: ApiProblem[]; }
export interface CompanyDraftUpdateFilters { search: string | null; status: string[] | null; source: string[] | null; draftUpdateFilter: string | number | boolean | null; }
export interface CompanyDraftUpdateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; draftUpdateValue: string | number | boolean | null; }
export interface CompanyDraftUpdateNextAction { type: 'draftUpdate'; label: string; route: string | null; }
export interface CompanyDraftUpdateResult { operationId: 'company.draft.update'; completedAt: ISODateTime; domain: 'company'; }
export interface CompanyDraftUpdateRequest { context: ApiContext; metadata: MutationMetadata; companyId: UUID | string | null; input: CompanyDraftUpdateInput; }
export interface CompanyDraftUpdateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: CompanyDraftUpdateNextAction | null; draftUpdateResult: CompanyDraftUpdateResult; }
export interface CompanyDraftUpdateResponse { operationId: 'company.draft.update'; correlationId: string; generatedAt: ISODateTime; data: CompanyDraftUpdateData; warnings: ApiProblem[]; }
export interface CompanyLookupFilters { search: string | null; status: string[] | null; source: string[] | null; lookupFilter: string | number | boolean | null; }
export interface CompanyLookupInput { requestedBy: UUID; effectiveAt: ISODateTime | null; lookupValue: string | number | boolean | null; }
export interface CompanyLookupNextAction { type: 'lookup'; label: string; route: string | null; }
export interface CompanyLookupResult { operationId: 'company.lookup'; completedAt: ISODateTime; domain: 'company'; }
export interface CompanyLookupRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CompanyLookupFilters | null; }
export interface CompanyLookupData { records: CompanyRecord[]; pageInfo: PageInfo; summary: CompanySummary; lookupResult: CompanyLookupResult; }
export interface CompanyLookupResponse { operationId: 'company.lookup'; correlationId: string; generatedAt: ISODateTime; data: CompanyLookupData; warnings: ApiProblem[]; }
export interface CustomersCohortsReadFilters { search: string | null; status: string[] | null; source: string[] | null; cohortsFilter: string | number | boolean | null; }
export interface CustomersCohortsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; cohortsValue: string | number | boolean | null; }
export interface CustomersCohortsReadNextAction { type: 'cohorts'; label: string; route: string | null; }
export interface CustomersCohortsReadResult { operationId: 'customers.cohorts.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersCohortsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersCohortsReadFilters | null; }
export interface CustomersCohortsReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; cohorts: CohortView[]; cohortsResult: CustomersCohortsReadResult; }
export interface CustomersCohortsReadResponse { operationId: 'customers.cohorts.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersCohortsReadData; warnings: ApiProblem[]; }
export interface CustomersIdentityConflictsReadFilters { search: string | null; status: string[] | null; source: string[] | null; identityConflictsFilter: string | number | boolean | null; }
export interface CustomersIdentityConflictsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; identityConflictsValue: string | number | boolean | null; }
export interface CustomersIdentityConflictsReadNextAction { type: 'identityConflicts'; label: string; route: string | null; }
export interface CustomersIdentityConflictsReadResult { operationId: 'customers.identity-conflicts.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersIdentityConflictsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersIdentityConflictsReadFilters | null; }
export interface CustomersIdentityConflictsReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; identityConflictsResult: CustomersIdentityConflictsReadResult; }
export interface CustomersIdentityConflictsReadResponse { operationId: 'customers.identity-conflicts.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersIdentityConflictsReadData; warnings: ApiProblem[]; }
export interface CustomersImpactReadFilters { search: string | null; status: string[] | null; source: string[] | null; impactFilter: string | number | boolean | null; }
export interface CustomersImpactReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; impactValue: string | number | boolean | null; }
export interface CustomersImpactReadNextAction { type: 'impact'; label: string; route: string | null; }
export interface CustomersImpactReadResult { operationId: 'customers.impact.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersImpactReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersImpactReadFilters | null; }
export interface CustomersImpactReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; impactResult: CustomersImpactReadResult; }
export interface CustomersImpactReadResponse { operationId: 'customers.impact.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersImpactReadData; warnings: ApiProblem[]; }
export interface CustomersOverviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; overviewFilter: string | number | boolean | null; }
export interface CustomersOverviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overviewValue: string | number | boolean | null; }
export interface CustomersOverviewReadNextAction { type: 'overview'; label: string; route: string | null; }
export interface CustomersOverviewReadResult { operationId: 'customers.overview.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersOverviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersOverviewReadFilters | null; }
export interface CustomersOverviewReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; overviewResult: CustomersOverviewReadResult; }
export interface CustomersOverviewReadResponse { operationId: 'customers.overview.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersOverviewReadData; warnings: ApiProblem[]; }
export interface CustomersPrivacyReadFilters { search: string | null; status: string[] | null; source: string[] | null; privacyFilter: string | number | boolean | null; }
export interface CustomersPrivacyReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; privacyValue: string | number | boolean | null; }
export interface CustomersPrivacyReadNextAction { type: 'privacy'; label: string; route: string | null; }
export interface CustomersPrivacyReadResult { operationId: 'customers.privacy.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersPrivacyReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersPrivacyReadFilters | null; }
export interface CustomersPrivacyReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; privacyResult: CustomersPrivacyReadResult; }
export interface CustomersPrivacyReadResponse { operationId: 'customers.privacy.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersPrivacyReadData; warnings: ApiProblem[]; }
export interface CustomersPseudonymizedDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; pseudonymizedDetailFilter: string | number | boolean | null; }
export interface CustomersPseudonymizedDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; pseudonymizedDetailValue: string | number | boolean | null; }
export interface CustomersPseudonymizedDetailReadNextAction { type: 'pseudonymizedDetail'; label: string; route: string | null; }
export interface CustomersPseudonymizedDetailReadResult { operationId: 'customers.pseudonymized-detail.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersPseudonymizedDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; customerPseudonym: UUID | string; filters: CustomersPseudonymizedDetailReadFilters | null; }
export interface CustomersPseudonymizedDetailReadData { record: CustomersRecord; pseudonymizedDetailResult: CustomersPseudonymizedDetailReadResult; }
export interface CustomersPseudonymizedDetailReadResponse { operationId: 'customers.pseudonymized-detail.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersPseudonymizedDetailReadData; warnings: ApiProblem[]; }
export interface CustomersReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface CustomersReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface CustomersReadNextAction { type: 'result'; label: string; route: string | null; }
export interface CustomersReadResult { operationId: 'customers.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersReadFilters | null; }
export interface CustomersReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; resultResult: CustomersReadResult; }
export interface CustomersReadResponse { operationId: 'customers.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersReadData; warnings: ApiProblem[]; }
export interface CustomersSegmentAnalyzeFilters { search: string | null; status: string[] | null; source: string[] | null; segmentAnalyzeFilter: string | number | boolean | null; }
export interface CustomersSegmentAnalyzeInput { requestedBy: UUID; effectiveAt: ISODateTime | null; segmentAnalyzeValue: string | number | boolean | null; }
export interface CustomersSegmentAnalyzeNextAction { type: 'segmentAnalyze'; label: string; route: string | null; }
export interface CustomersSegmentAnalyzeResult { operationId: 'customers.segment.analyze'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersSegmentAnalyzeRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersSegmentAnalyzeFilters | null; }
export interface CustomersSegmentAnalyzeData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; segmentAnalyzeResult: CustomersSegmentAnalyzeResult; }
export interface CustomersSegmentAnalyzeResponse { operationId: 'customers.segment.analyze'; correlationId: string; generatedAt: ISODateTime; data: CustomersSegmentAnalyzeData; warnings: ApiProblem[]; }
export interface CustomersSegmentsReadFilters { search: string | null; status: string[] | null; source: string[] | null; segmentsFilter: string | number | boolean | null; }
export interface CustomersSegmentsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; segmentsValue: string | number | boolean | null; }
export interface CustomersSegmentsReadNextAction { type: 'segments'; label: string; route: string | null; }
export interface CustomersSegmentsReadResult { operationId: 'customers.segments.read'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersSegmentsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: CustomersSegmentsReadFilters | null; }
export interface CustomersSegmentsReadData { records: CustomersRecord[]; pageInfo: PageInfo; summary: CustomersSummary; segmentsResult: CustomersSegmentsReadResult; }
export interface CustomersSegmentsReadResponse { operationId: 'customers.segments.read'; correlationId: string; generatedAt: ISODateTime; data: CustomersSegmentsReadData; warnings: ApiProblem[]; }
export interface CustomersWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface CustomersWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface CustomersWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface CustomersWriteResult { operationId: 'customers.write'; completedAt: ISODateTime; domain: 'customers'; }
export interface CustomersWriteRequest { context: ApiContext; metadata: MutationMetadata; customerPseudonym: UUID | string | null; input: CustomersWriteInput; }
export interface CustomersWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: CustomersWriteNextAction | null; resultResult: CustomersWriteResult; }
export interface CustomersWriteResponse { operationId: 'customers.write'; correlationId: string; generatedAt: ISODateTime; data: CustomersWriteData; warnings: ApiProblem[]; }
export interface DataQualityCenterReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityCenterFilter: string | number | boolean | null; }
export interface DataQualityCenterReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityCenterValue: string | number | boolean | null; }
export interface DataQualityCenterReadNextAction { type: 'qualityCenter'; label: string; route: string | null; }
export interface DataQualityCenterReadResult { operationId: 'data-quality.center.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityCenterReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityCenterReadFilters | null; }
export interface DataQualityCenterReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityCenterResult: DataQualityCenterReadResult; }
export interface DataQualityCenterReadResponse { operationId: 'data-quality.center.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityCenterReadData; warnings: ApiProblem[]; }
export interface DataQualityConflictsReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityConflictsFilter: string | number | boolean | null; }
export interface DataQualityConflictsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityConflictsValue: string | number | boolean | null; }
export interface DataQualityConflictsReadNextAction { type: 'qualityConflicts'; label: string; route: string | null; }
export interface DataQualityConflictsReadResult { operationId: 'data-quality.conflicts.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityConflictsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityConflictsReadFilters | null; }
export interface DataQualityConflictsReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityConflictsResult: DataQualityConflictsReadResult; }
export interface DataQualityConflictsReadResponse { operationId: 'data-quality.conflicts.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityConflictsReadData; warnings: ApiProblem[]; }
export interface DataQualityDatasetReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityDatasetFilter: string | number | boolean | null; }
export interface DataQualityDatasetReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityDatasetValue: string | number | boolean | null; }
export interface DataQualityDatasetReadNextAction { type: 'qualityDataset'; label: string; route: string | null; }
export interface DataQualityDatasetReadResult { operationId: 'data-quality.dataset.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityDatasetReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityDatasetReadFilters | null; }
export interface DataQualityDatasetReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityDatasetResult: DataQualityDatasetReadResult; }
export interface DataQualityDatasetReadResponse { operationId: 'data-quality.dataset.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityDatasetReadData; warnings: ApiProblem[]; }
export interface DataQualityLineageReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityLineageFilter: string | number | boolean | null; }
export interface DataQualityLineageReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityLineageValue: string | number | boolean | null; }
export interface DataQualityLineageReadNextAction { type: 'qualityLineage'; label: string; route: string | null; }
export interface DataQualityLineageReadResult { operationId: 'data-quality.lineage.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityLineageReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityLineageReadFilters | null; }
export interface DataQualityLineageReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityLineageResult: DataQualityLineageReadResult; }
export interface DataQualityLineageReadResponse { operationId: 'data-quality.lineage.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityLineageReadData; warnings: ApiProblem[]; }
export interface DataQualityManualReviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityManualReviewFilter: string | number | boolean | null; }
export interface DataQualityManualReviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityManualReviewValue: string | number | boolean | null; }
export interface DataQualityManualReviewReadNextAction { type: 'qualityManualReview'; label: string; route: string | null; }
export interface DataQualityManualReviewReadResult { operationId: 'data-quality.manual-review.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityManualReviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityManualReviewReadFilters | null; }
export interface DataQualityManualReviewReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityManualReviewResult: DataQualityManualReviewReadResult; }
export interface DataQualityManualReviewReadResponse { operationId: 'data-quality.manual-review.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityManualReviewReadData; warnings: ApiProblem[]; }
export interface DataQualityManualReviewSubmitFilters { search: string | null; status: string[] | null; source: string[] | null; qualityManualReviewSubmitFilter: string | number | boolean | null; }
export interface DataQualityManualReviewSubmitInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityManualReviewSubmitValue: string | number | boolean | null; }
export interface DataQualityManualReviewSubmitNextAction { type: 'qualityManualReviewSubmit'; label: string; route: string | null; }
export interface DataQualityManualReviewSubmitResult { operationId: 'data-quality.manual-review.submit'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityManualReviewSubmitRequest { context: ApiContext; metadata: MutationMetadata; datasetId: UUID | string | null; input: DataQualityManualReviewSubmitInput; }
export interface DataQualityManualReviewSubmitData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DataQualityManualReviewSubmitNextAction | null; qualityManualReviewSubmitResult: DataQualityManualReviewSubmitResult; }
export interface DataQualityManualReviewSubmitResponse { operationId: 'data-quality.manual-review.submit'; correlationId: string; generatedAt: ISODateTime; data: DataQualityManualReviewSubmitData; warnings: ApiProblem[]; }
export interface DataQualityReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityFilter: string | number | boolean | null; }
export interface DataQualityReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityValue: string | number | boolean | null; }
export interface DataQualityReadNextAction { type: 'quality'; label: string; route: string | null; }
export interface DataQualityReadResult { operationId: 'data-quality.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityReadFilters | null; }
export interface DataQualityReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityResult: DataQualityReadResult; }
export interface DataQualityReadResponse { operationId: 'data-quality.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityReadData; warnings: ApiProblem[]; }
export interface DataQualityReadinessReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityReadinessFilter: string | number | boolean | null; }
export interface DataQualityReadinessReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityReadinessValue: string | number | boolean | null; }
export interface DataQualityReadinessReadNextAction { type: 'qualityReadiness'; label: string; route: string | null; }
export interface DataQualityReadinessReadResult { operationId: 'data-quality.readiness.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityReadinessReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityReadinessReadFilters | null; }
export interface DataQualityReadinessReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityReadinessResult: DataQualityReadinessReadResult; }
export interface DataQualityReadinessReadResponse { operationId: 'data-quality.readiness.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityReadinessReadData; warnings: ApiProblem[]; }
export interface DataQualityReconciliationConfirmFilters { search: string | null; status: string[] | null; source: string[] | null; qualityReconciliationConfirmFilter: string | number | boolean | null; }
export interface DataQualityReconciliationConfirmInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityReconciliationConfirmValue: string | number | boolean | null; }
export interface DataQualityReconciliationConfirmNextAction { type: 'qualityReconciliationConfirm'; label: string; route: string | null; }
export interface DataQualityReconciliationConfirmResult { operationId: 'data-quality.reconciliation.confirm'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityReconciliationConfirmRequest { context: ApiContext; metadata: MutationMetadata; datasetId: UUID | string | null; input: DataQualityReconciliationConfirmInput; }
export interface DataQualityReconciliationConfirmData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DataQualityReconciliationConfirmNextAction | null; qualityReconciliationConfirmResult: DataQualityReconciliationConfirmResult; }
export interface DataQualityReconciliationConfirmResponse { operationId: 'data-quality.reconciliation.confirm'; correlationId: string; generatedAt: ISODateTime; data: DataQualityReconciliationConfirmData; warnings: ApiProblem[]; }
export interface DataQualityReconciliationReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityReconciliationFilter: string | number | boolean | null; }
export interface DataQualityReconciliationReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityReconciliationValue: string | number | boolean | null; }
export interface DataQualityReconciliationReadNextAction { type: 'qualityReconciliation'; label: string; route: string | null; }
export interface DataQualityReconciliationReadResult { operationId: 'data-quality.reconciliation.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityReconciliationReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityReconciliationReadFilters | null; }
export interface DataQualityReconciliationReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityReconciliationResult: DataQualityReconciliationReadResult; }
export interface DataQualityReconciliationReadResponse { operationId: 'data-quality.reconciliation.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityReconciliationReadData; warnings: ApiProblem[]; }
export interface DataQualityReprocessStartFilters { search: string | null; status: string[] | null; source: string[] | null; qualityReprocessStartFilter: string | number | boolean | null; }
export interface DataQualityReprocessStartInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityReprocessStartValue: string | number | boolean | null; }
export interface DataQualityReprocessStartNextAction { type: 'qualityReprocessStart'; label: string; route: string | null; }
export interface DataQualityReprocessStartResult { operationId: 'data-quality.reprocess.start'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityReprocessStartRequest { context: ApiContext; metadata: MutationMetadata; datasetId: UUID | string | null; input: DataQualityReprocessStartInput; }
export interface DataQualityReprocessStartData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DataQualityReprocessStartNextAction | null; jobId: UUID | null; qualityReprocessStartResult: DataQualityReprocessStartResult; }
export interface DataQualityReprocessStartResponse { operationId: 'data-quality.reprocess.start'; correlationId: string; generatedAt: ISODateTime; data: DataQualityReprocessStartData; warnings: ApiProblem[]; }
export interface DataQualityReprocessingReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualityReprocessingFilter: string | number | boolean | null; }
export interface DataQualityReprocessingReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityReprocessingValue: string | number | boolean | null; }
export interface DataQualityReprocessingReadNextAction { type: 'qualityReprocessing'; label: string; route: string | null; }
export interface DataQualityReprocessingReadResult { operationId: 'data-quality.reprocessing.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityReprocessingReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualityReprocessingReadFilters | null; }
export interface DataQualityReprocessingReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualityReprocessingResult: DataQualityReprocessingReadResult; }
export interface DataQualityReprocessingReadResponse { operationId: 'data-quality.reprocessing.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualityReprocessingReadData; warnings: ApiProblem[]; }
export interface DataQualitySourceOverlapReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualitySourceOverlapFilter: string | number | boolean | null; }
export interface DataQualitySourceOverlapReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualitySourceOverlapValue: string | number | boolean | null; }
export interface DataQualitySourceOverlapReadNextAction { type: 'qualitySourceOverlap'; label: string; route: string | null; }
export interface DataQualitySourceOverlapReadResult { operationId: 'data-quality.source-overlap.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualitySourceOverlapReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualitySourceOverlapReadFilters | null; }
export interface DataQualitySourceOverlapReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualitySourceOverlapResult: DataQualitySourceOverlapReadResult; }
export interface DataQualitySourceOverlapReadResponse { operationId: 'data-quality.source-overlap.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualitySourceOverlapReadData; warnings: ApiProblem[]; }
export interface DataQualitySourcePriorityReadFilters { search: string | null; status: string[] | null; source: string[] | null; qualitySourcePriorityFilter: string | number | boolean | null; }
export interface DataQualitySourcePriorityReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualitySourcePriorityValue: string | number | boolean | null; }
export interface DataQualitySourcePriorityReadNextAction { type: 'qualitySourcePriority'; label: string; route: string | null; }
export interface DataQualitySourcePriorityReadResult { operationId: 'data-quality.source-priority.read'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualitySourcePriorityReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DataQualitySourcePriorityReadFilters | null; }
export interface DataQualitySourcePriorityReadData { records: DataQualityRecord[]; pageInfo: PageInfo; summary: DataQualitySummary; diagnostics: DiagnosticFinding[]; qualitySourcePriorityResult: DataQualitySourcePriorityReadResult; }
export interface DataQualitySourcePriorityReadResponse { operationId: 'data-quality.source-priority.read'; correlationId: string; generatedAt: ISODateTime; data: DataQualitySourcePriorityReadData; warnings: ApiProblem[]; }
export interface DataQualityWriteFilters { search: string | null; status: string[] | null; source: string[] | null; qualityFilter: string | number | boolean | null; }
export interface DataQualityWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; qualityValue: string | number | boolean | null; }
export interface DataQualityWriteNextAction { type: 'quality'; label: string; route: string | null; }
export interface DataQualityWriteResult { operationId: 'data-quality.write'; completedAt: ISODateTime; domain: 'data-quality'; }
export interface DataQualityWriteRequest { context: ApiContext; metadata: MutationMetadata; datasetId: UUID | string | null; input: DataQualityWriteInput; }
export interface DataQualityWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DataQualityWriteNextAction | null; qualityResult: DataQualityWriteResult; }
export interface DataQualityWriteResponse { operationId: 'data-quality.write'; correlationId: string; generatedAt: ISODateTime; data: DataQualityWriteData; warnings: ApiProblem[]; }
export interface DecisionsActionBriefReadFilters { search: string | null; status: string[] | null; source: string[] | null; actionBriefFilter: string | number | boolean | null; }
export interface DecisionsActionBriefReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; actionBriefValue: string | number | boolean | null; }
export interface DecisionsActionBriefReadNextAction { type: 'actionBrief'; label: string; route: string | null; }
export interface DecisionsActionBriefReadResult { operationId: 'decisions.action-brief.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsActionBriefReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsActionBriefReadFilters | null; }
export interface DecisionsActionBriefReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; actionBriefResult: DecisionsActionBriefReadResult; }
export interface DecisionsActionBriefReadResponse { operationId: 'decisions.action-brief.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsActionBriefReadData; warnings: ApiProblem[]; }
export interface DecisionsActionDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; actionDetailFilter: string | number | boolean | null; }
export interface DecisionsActionDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; actionDetailValue: string | number | boolean | null; }
export interface DecisionsActionDetailReadNextAction { type: 'actionDetail'; label: string; route: string | null; }
export interface DecisionsActionDetailReadResult { operationId: 'decisions.action-detail.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsActionDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; decisionId: UUID | string; filters: DecisionsActionDetailReadFilters | null; }
export interface DecisionsActionDetailReadData { record: DecisionsRecord; actionDetailResult: DecisionsActionDetailReadResult; }
export interface DecisionsActionDetailReadResponse { operationId: 'decisions.action-detail.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsActionDetailReadData; warnings: ApiProblem[]; }
export interface DecisionsActionLibraryReadFilters { search: string | null; status: string[] | null; source: string[] | null; actionLibraryFilter: string | number | boolean | null; }
export interface DecisionsActionLibraryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; actionLibraryValue: string | number | boolean | null; }
export interface DecisionsActionLibraryReadNextAction { type: 'actionLibrary'; label: string; route: string | null; }
export interface DecisionsActionLibraryReadResult { operationId: 'decisions.action-library.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsActionLibraryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsActionLibraryReadFilters | null; }
export interface DecisionsActionLibraryReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; actionLibraryResult: DecisionsActionLibraryReadResult; }
export interface DecisionsActionLibraryReadResponse { operationId: 'decisions.action-library.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsActionLibraryReadData; warnings: ApiProblem[]; }
export interface DecisionsActionBriefCreateFilters { search: string | null; status: string[] | null; source: string[] | null; actionBriefCreateFilter: string | number | boolean | null; }
export interface DecisionsActionBriefCreateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; actionBriefCreateValue: string | number | boolean | null; }
export interface DecisionsActionBriefCreateNextAction { type: 'actionBriefCreate'; label: string; route: string | null; }
export interface DecisionsActionBriefCreateResult { operationId: 'decisions.action.brief.create'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsActionBriefCreateRequest { context: ApiContext; metadata: MutationMetadata; decisionId: UUID | string | null; input: DecisionsActionBriefCreateInput; }
export interface DecisionsActionBriefCreateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DecisionsActionBriefCreateNextAction | null; actionBriefCreateResult: DecisionsActionBriefCreateResult; }
export interface DecisionsActionBriefCreateResponse { operationId: 'decisions.action.brief.create'; correlationId: string; generatedAt: ISODateTime; data: DecisionsActionBriefCreateData; warnings: ApiProblem[]; }
export interface DecisionsCenterReadFilters { search: string | null; status: string[] | null; source: string[] | null; centerFilter: string | number | boolean | null; }
export interface DecisionsCenterReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; centerValue: string | number | boolean | null; }
export interface DecisionsCenterReadNextAction { type: 'center'; label: string; route: string | null; }
export interface DecisionsCenterReadResult { operationId: 'decisions.center.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsCenterReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsCenterReadFilters | null; }
export interface DecisionsCenterReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; centerResult: DecisionsCenterReadResult; }
export interface DecisionsCenterReadResponse { operationId: 'decisions.center.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsCenterReadData; warnings: ApiProblem[]; }
export interface DecisionsDecisionRecordFilters { search: string | null; status: string[] | null; source: string[] | null; decisionRecordFilter: string | number | boolean | null; }
export interface DecisionsDecisionRecordInput { requestedBy: UUID; effectiveAt: ISODateTime | null; decisionRecordValue: string | number | boolean | null; }
export interface DecisionsDecisionRecordNextAction { type: 'decisionRecord'; label: string; route: string | null; }
export interface DecisionsDecisionRecordResult { operationId: 'decisions.decision.record'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsDecisionRecordRequest { context: ApiContext; metadata: MutationMetadata; decisionId: UUID | string | null; input: DecisionsDecisionRecordInput; }
export interface DecisionsDecisionRecordData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DecisionsDecisionRecordNextAction | null; decisionRecordResult: DecisionsDecisionRecordResult; }
export interface DecisionsDecisionRecordResponse { operationId: 'decisions.decision.record'; correlationId: string; generatedAt: ISODateTime; data: DecisionsDecisionRecordData; warnings: ApiProblem[]; }
export interface DecisionsMeasurementReadFilters { search: string | null; status: string[] | null; source: string[] | null; measurementFilter: string | number | boolean | null; }
export interface DecisionsMeasurementReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; measurementValue: string | number | boolean | null; }
export interface DecisionsMeasurementReadNextAction { type: 'measurement'; label: string; route: string | null; }
export interface DecisionsMeasurementReadResult { operationId: 'decisions.measurement.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsMeasurementReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsMeasurementReadFilters | null; }
export interface DecisionsMeasurementReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; measurementResult: DecisionsMeasurementReadResult; }
export interface DecisionsMeasurementReadResponse { operationId: 'decisions.measurement.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsMeasurementReadData; warnings: ApiProblem[]; }
export interface DecisionsObservationCreateFilters { search: string | null; status: string[] | null; source: string[] | null; observationCreateFilter: string | number | boolean | null; }
export interface DecisionsObservationCreateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; observationCreateValue: string | number | boolean | null; }
export interface DecisionsObservationCreateNextAction { type: 'observationCreate'; label: string; route: string | null; }
export interface DecisionsObservationCreateResult { operationId: 'decisions.observation.create'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsObservationCreateRequest { context: ApiContext; metadata: MutationMetadata; decisionId: UUID | string | null; input: DecisionsObservationCreateInput; }
export interface DecisionsObservationCreateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: DecisionsObservationCreateNextAction | null; observationCreateResult: DecisionsObservationCreateResult; }
export interface DecisionsObservationCreateResponse { operationId: 'decisions.observation.create'; correlationId: string; generatedAt: ISODateTime; data: DecisionsObservationCreateData; warnings: ApiProblem[]; }
export interface DecisionsObservationsReadFilters { search: string | null; status: string[] | null; source: string[] | null; observationsFilter: string | number | boolean | null; }
export interface DecisionsObservationsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; observationsValue: string | number | boolean | null; }
export interface DecisionsObservationsReadNextAction { type: 'observations'; label: string; route: string | null; }
export interface DecisionsObservationsReadResult { operationId: 'decisions.observations.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsObservationsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsObservationsReadFilters | null; }
export interface DecisionsObservationsReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; observationsResult: DecisionsObservationsReadResult; }
export interface DecisionsObservationsReadResponse { operationId: 'decisions.observations.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsObservationsReadData; warnings: ApiProblem[]; }
export interface DecisionsRecommendationReadFilters { search: string | null; status: string[] | null; source: string[] | null; recommendationFilter: string | number | boolean | null; }
export interface DecisionsRecommendationReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; recommendationValue: string | number | boolean | null; }
export interface DecisionsRecommendationReadNextAction { type: 'recommendation'; label: string; route: string | null; }
export interface DecisionsRecommendationReadResult { operationId: 'decisions.recommendation.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsRecommendationReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsRecommendationReadFilters | null; }
export interface DecisionsRecommendationReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; recommendations: RecommendationView[]; recommendationResult: DecisionsRecommendationReadResult; }
export interface DecisionsRecommendationReadResponse { operationId: 'decisions.recommendation.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsRecommendationReadData; warnings: ApiProblem[]; }
export interface DecisionsRegistryReadFilters { search: string | null; status: string[] | null; source: string[] | null; registryFilter: string | number | boolean | null; }
export interface DecisionsRegistryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; registryValue: string | number | boolean | null; }
export interface DecisionsRegistryReadNextAction { type: 'registry'; label: string; route: string | null; }
export interface DecisionsRegistryReadResult { operationId: 'decisions.registry.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsRegistryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsRegistryReadFilters | null; }
export interface DecisionsRegistryReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; registryResult: DecisionsRegistryReadResult; }
export interface DecisionsRegistryReadResponse { operationId: 'decisions.registry.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsRegistryReadData; warnings: ApiProblem[]; }
export interface DecisionsRekomendacjeReadFilters { search: string | null; status: string[] | null; source: string[] | null; rekomendacjeFilter: string | number | boolean | null; }
export interface DecisionsRekomendacjeReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; rekomendacjeValue: string | number | boolean | null; }
export interface DecisionsRekomendacjeReadNextAction { type: 'rekomendacje'; label: string; route: string | null; }
export interface DecisionsRekomendacjeReadResult { operationId: 'decisions.rekomendacje.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsRekomendacjeReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsRekomendacjeReadFilters | null; }
export interface DecisionsRekomendacjeReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; rekomendacjeResult: DecisionsRekomendacjeReadResult; }
export interface DecisionsRekomendacjeReadResponse { operationId: 'decisions.rekomendacje.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsRekomendacjeReadData; warnings: ApiProblem[]; }
export interface DecisionsRelationsReadFilters { search: string | null; status: string[] | null; source: string[] | null; relationsFilter: string | number | boolean | null; }
export interface DecisionsRelationsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; relationsValue: string | number | boolean | null; }
export interface DecisionsRelationsReadNextAction { type: 'relations'; label: string; route: string | null; }
export interface DecisionsRelationsReadResult { operationId: 'decisions.relations.read'; completedAt: ISODateTime; domain: 'decisions'; }
export interface DecisionsRelationsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: DecisionsRelationsReadFilters | null; }
export interface DecisionsRelationsReadData { records: DecisionsRecord[]; pageInfo: PageInfo; summary: DecisionsSummary; relationsResult: DecisionsRelationsReadResult; }
export interface DecisionsRelationsReadResponse { operationId: 'decisions.relations.read'; correlationId: string; generatedAt: ISODateTime; data: DecisionsRelationsReadData; warnings: ApiProblem[]; }
export interface HelpHomeReadFilters { search: string | null; status: string[] | null; source: string[] | null; homeFilter: string | number | boolean | null; }
export interface HelpHomeReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; homeValue: string | number | boolean | null; }
export interface HelpHomeReadNextAction { type: 'home'; label: string; route: string | null; }
export interface HelpHomeReadResult { operationId: 'help.home.read'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpHomeReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: HelpHomeReadFilters | null; }
export interface HelpHomeReadData { records: HelpRecord[]; pageInfo: PageInfo; summary: HelpSummary; homeResult: HelpHomeReadResult; }
export interface HelpHomeReadResponse { operationId: 'help.home.read'; correlationId: string; generatedAt: ISODateTime; data: HelpHomeReadData; warnings: ApiProblem[]; }
export interface HelpProcedureDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; procedureDetailFilter: string | number | boolean | null; }
export interface HelpProcedureDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; procedureDetailValue: string | number | boolean | null; }
export interface HelpProcedureDetailReadNextAction { type: 'procedureDetail'; label: string; route: string | null; }
export interface HelpProcedureDetailReadResult { operationId: 'help.procedure-detail.read'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpProcedureDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; articleId: UUID | string; filters: HelpProcedureDetailReadFilters | null; }
export interface HelpProcedureDetailReadData { record: HelpRecord; procedureDetailResult: HelpProcedureDetailReadResult; }
export interface HelpProcedureDetailReadResponse { operationId: 'help.procedure-detail.read'; correlationId: string; generatedAt: ISODateTime; data: HelpProcedureDetailReadData; warnings: ApiProblem[]; }
export interface HelpProceduresReadFilters { search: string | null; status: string[] | null; source: string[] | null; proceduresFilter: string | number | boolean | null; }
export interface HelpProceduresReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; proceduresValue: string | number | boolean | null; }
export interface HelpProceduresReadNextAction { type: 'procedures'; label: string; route: string | null; }
export interface HelpProceduresReadResult { operationId: 'help.procedures.read'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpProceduresReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: HelpProceduresReadFilters | null; }
export interface HelpProceduresReadData { records: HelpRecord[]; pageInfo: PageInfo; summary: HelpSummary; proceduresResult: HelpProceduresReadResult; }
export interface HelpProceduresReadResponse { operationId: 'help.procedures.read'; correlationId: string; generatedAt: ISODateTime; data: HelpProceduresReadData; warnings: ApiProblem[]; }
export interface HelpReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface HelpReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface HelpReadNextAction { type: 'result'; label: string; route: string | null; }
export interface HelpReadResult { operationId: 'help.read'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: HelpReadFilters | null; }
export interface HelpReadData { records: HelpRecord[]; pageInfo: PageInfo; summary: HelpSummary; resultResult: HelpReadResult; }
export interface HelpReadResponse { operationId: 'help.read'; correlationId: string; generatedAt: ISODateTime; data: HelpReadData; warnings: ApiProblem[]; }
export interface HelpResultsReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultsFilter: string | number | boolean | null; }
export interface HelpResultsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultsValue: string | number | boolean | null; }
export interface HelpResultsReadNextAction { type: 'results'; label: string; route: string | null; }
export interface HelpResultsReadResult { operationId: 'help.results.read'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpResultsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: HelpResultsReadFilters | null; }
export interface HelpResultsReadData { records: HelpRecord[]; pageInfo: PageInfo; summary: HelpSummary; resultsResult: HelpResultsReadResult; }
export interface HelpResultsReadResponse { operationId: 'help.results.read'; correlationId: string; generatedAt: ISODateTime; data: HelpResultsReadData; warnings: ApiProblem[]; }
export interface HelpSupportRequestReadFilters { search: string | null; status: string[] | null; source: string[] | null; supportRequestFilter: string | number | boolean | null; }
export interface HelpSupportRequestReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; supportRequestValue: string | number | boolean | null; }
export interface HelpSupportRequestReadNextAction { type: 'supportRequest'; label: string; route: string | null; }
export interface HelpSupportRequestReadResult { operationId: 'help.support-request.read'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpSupportRequestReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: HelpSupportRequestReadFilters | null; }
export interface HelpSupportRequestReadData { records: HelpRecord[]; pageInfo: PageInfo; summary: HelpSummary; supportRequestResult: HelpSupportRequestReadResult; }
export interface HelpSupportRequestReadResponse { operationId: 'help.support-request.read'; correlationId: string; generatedAt: ISODateTime; data: HelpSupportRequestReadData; warnings: ApiProblem[]; }
export interface HelpWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface HelpWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface HelpWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface HelpWriteResult { operationId: 'help.write'; completedAt: ISODateTime; domain: 'help'; }
export interface HelpWriteRequest { context: ApiContext; metadata: MutationMetadata; articleId: UUID | string | null; input: HelpWriteInput; }
export interface HelpWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: HelpWriteNextAction | null; resultResult: HelpWriteResult; }
export interface HelpWriteResponse { operationId: 'help.write'; correlationId: string; generatedAt: ISODateTime; data: HelpWriteData; warnings: ApiProblem[]; }
export interface IntegrationsCatalogReadFilters { search: string | null; status: string[] | null; source: string[] | null; catalogFilter: string | number | boolean | null; }
export interface IntegrationsCatalogReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; catalogValue: string | number | boolean | null; }
export interface IntegrationsCatalogReadNextAction { type: 'catalog'; label: string; route: string | null; }
export interface IntegrationsCatalogReadResult { operationId: 'integrations.catalog.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsCatalogReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsCatalogReadFilters | null; }
export interface IntegrationsCatalogReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; catalogResult: IntegrationsCatalogReadResult; }
export interface IntegrationsCatalogReadResponse { operationId: 'integrations.catalog.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsCatalogReadData; warnings: ApiProblem[]; }
export interface IntegrationsConnectionWizardReadFilters { search: string | null; status: string[] | null; source: string[] | null; connectionWizardFilter: string | number | boolean | null; }
export interface IntegrationsConnectionWizardReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; connectionWizardValue: string | number | boolean | null; }
export interface IntegrationsConnectionWizardReadNextAction { type: 'connectionWizard'; label: string; route: string | null; }
export interface IntegrationsConnectionWizardReadResult { operationId: 'integrations.connection-wizard.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsConnectionWizardReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsConnectionWizardReadFilters | null; }
export interface IntegrationsConnectionWizardReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; connectionWizardResult: IntegrationsConnectionWizardReadResult; }
export interface IntegrationsConnectionWizardReadResponse { operationId: 'integrations.connection-wizard.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsConnectionWizardReadData; warnings: ApiProblem[]; }
export interface IntegrationsConnectionCreateFilters { search: string | null; status: string[] | null; source: string[] | null; connectionCreateFilter: string | number | boolean | null; }
export interface IntegrationsConnectionCreateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; connectionCreateValue: string | number | boolean | null; }
export interface IntegrationsConnectionCreateNextAction { type: 'connectionCreate'; label: string; route: string | null; }
export interface IntegrationsConnectionCreateResult { operationId: 'integrations.connection.create'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsConnectionCreateRequest { context: ApiContext; metadata: MutationMetadata; integrationId: UUID | string | null; input: IntegrationsConnectionCreateInput; }
export interface IntegrationsConnectionCreateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: IntegrationsConnectionCreateNextAction | null; connectionCreateResult: IntegrationsConnectionCreateResult; }
export interface IntegrationsConnectionCreateResponse { operationId: 'integrations.connection.create'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsConnectionCreateData; warnings: ApiProblem[]; }
export interface IntegrationsDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; detailFilter: string | number | boolean | null; }
export interface IntegrationsDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; detailValue: string | number | boolean | null; }
export interface IntegrationsDetailReadNextAction { type: 'detail'; label: string; route: string | null; }
export interface IntegrationsDetailReadResult { operationId: 'integrations.detail.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; integrationId: UUID | string; filters: IntegrationsDetailReadFilters | null; }
export interface IntegrationsDetailReadData { record: IntegrationsRecord; detailResult: IntegrationsDetailReadResult; }
export interface IntegrationsDetailReadResponse { operationId: 'integrations.detail.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsDetailReadData; warnings: ApiProblem[]; }
export interface IntegrationsDisconnectReadFilters { search: string | null; status: string[] | null; source: string[] | null; disconnectFilter: string | number | boolean | null; }
export interface IntegrationsDisconnectReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; disconnectValue: string | number | boolean | null; }
export interface IntegrationsDisconnectReadNextAction { type: 'disconnect'; label: string; route: string | null; }
export interface IntegrationsDisconnectReadResult { operationId: 'integrations.disconnect.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsDisconnectReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; integrationId: UUID | string; filters: IntegrationsDisconnectReadFilters | null; }
export interface IntegrationsDisconnectReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; disconnectResult: IntegrationsDisconnectReadResult; }
export interface IntegrationsDisconnectReadResponse { operationId: 'integrations.disconnect.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsDisconnectReadData; warnings: ApiProblem[]; }
export interface IntegrationsOauthCallbackFilters { search: string | null; status: string[] | null; source: string[] | null; oauthCallbackFilter: string | number | boolean | null; }
export interface IntegrationsOauthCallbackInput { requestedBy: UUID; effectiveAt: ISODateTime | null; oauthCallbackValue: string | number | boolean | null; }
export interface IntegrationsOauthCallbackNextAction { type: 'oauthCallback'; label: string; route: string | null; }
export interface IntegrationsOauthCallbackResult { operationId: 'integrations.oauth.callback'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsOauthCallbackRequest { context: ApiContext; metadata: MutationMetadata; integrationId: UUID | string | null; input: IntegrationsOauthCallbackInput; }
export interface IntegrationsOauthCallbackData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: IntegrationsOauthCallbackNextAction | null; redirectUrl: string | null; oauthCallbackResult: IntegrationsOauthCallbackResult; }
export interface IntegrationsOauthCallbackResponse { operationId: 'integrations.oauth.callback'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsOauthCallbackData; warnings: ApiProblem[]; }
export interface IntegrationsProviderOutageReadFilters { search: string | null; status: string[] | null; source: string[] | null; providerOutageFilter: string | number | boolean | null; }
export interface IntegrationsProviderOutageReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; providerOutageValue: string | number | boolean | null; }
export interface IntegrationsProviderOutageReadNextAction { type: 'providerOutage'; label: string; route: string | null; }
export interface IntegrationsProviderOutageReadResult { operationId: 'integrations.provider-outage.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsProviderOutageReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsProviderOutageReadFilters | null; }
export interface IntegrationsProviderOutageReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; providerOutageResult: IntegrationsProviderOutageReadResult; }
export interface IntegrationsProviderOutageReadResponse { operationId: 'integrations.provider-outage.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsProviderOutageReadData; warnings: ApiProblem[]; }
export interface IntegrationsReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface IntegrationsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface IntegrationsReadNextAction { type: 'result'; label: string; route: string | null; }
export interface IntegrationsReadResult { operationId: 'integrations.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsReadFilters | null; }
export interface IntegrationsReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; resultResult: IntegrationsReadResult; }
export interface IntegrationsReadResponse { operationId: 'integrations.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsReadData; warnings: ApiProblem[]; }
export interface IntegrationsReconnectReadFilters { search: string | null; status: string[] | null; source: string[] | null; reconnectFilter: string | number | boolean | null; }
export interface IntegrationsReconnectReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; reconnectValue: string | number | boolean | null; }
export interface IntegrationsReconnectReadNextAction { type: 'reconnect'; label: string; route: string | null; }
export interface IntegrationsReconnectReadResult { operationId: 'integrations.reconnect.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsReconnectReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; integrationId: UUID | string; filters: IntegrationsReconnectReadFilters | null; }
export interface IntegrationsReconnectReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; reconnectResult: IntegrationsReconnectReadResult; }
export interface IntegrationsReconnectReadResponse { operationId: 'integrations.reconnect.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsReconnectReadData; warnings: ApiProblem[]; }
export interface IntegrationsReconnectStartFilters { search: string | null; status: string[] | null; source: string[] | null; reconnectStartFilter: string | number | boolean | null; }
export interface IntegrationsReconnectStartInput { requestedBy: UUID; effectiveAt: ISODateTime | null; reconnectStartValue: string | number | boolean | null; }
export interface IntegrationsReconnectStartNextAction { type: 'reconnectStart'; label: string; route: string | null; }
export interface IntegrationsReconnectStartResult { operationId: 'integrations.reconnect.start'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsReconnectStartRequest { context: ApiContext; metadata: MutationMetadata; integrationId: UUID | string | null; input: IntegrationsReconnectStartInput; }
export interface IntegrationsReconnectStartData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: IntegrationsReconnectStartNextAction | null; reconnectStartResult: IntegrationsReconnectStartResult; }
export interface IntegrationsReconnectStartResponse { operationId: 'integrations.reconnect.start'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsReconnectStartData; warnings: ApiProblem[]; }
export interface IntegrationsSyncHistoryReadFilters { search: string | null; status: string[] | null; source: string[] | null; syncHistoryFilter: string | number | boolean | null; }
export interface IntegrationsSyncHistoryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; syncHistoryValue: string | number | boolean | null; }
export interface IntegrationsSyncHistoryReadNextAction { type: 'syncHistory'; label: string; route: string | null; }
export interface IntegrationsSyncHistoryReadResult { operationId: 'integrations.sync-history.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsSyncHistoryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsSyncHistoryReadFilters | null; }
export interface IntegrationsSyncHistoryReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; timeline: IntegrationsTimelineEvent[]; syncHistoryResult: IntegrationsSyncHistoryReadResult; }
export interface IntegrationsSyncHistoryReadResponse { operationId: 'integrations.sync-history.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsSyncHistoryReadData; warnings: ApiProblem[]; }
export interface IntegrationsSyncRunReadFilters { search: string | null; status: string[] | null; source: string[] | null; syncRunFilter: string | number | boolean | null; }
export interface IntegrationsSyncRunReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; syncRunValue: string | number | boolean | null; }
export interface IntegrationsSyncRunReadNextAction { type: 'syncRun'; label: string; route: string | null; }
export interface IntegrationsSyncRunReadResult { operationId: 'integrations.sync-run.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsSyncRunReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsSyncRunReadFilters | null; }
export interface IntegrationsSyncRunReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; syncRunResult: IntegrationsSyncRunReadResult; }
export interface IntegrationsSyncRunReadResponse { operationId: 'integrations.sync-run.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsSyncRunReadData; warnings: ApiProblem[]; }
export interface IntegrationsSyncScopeReadFilters { search: string | null; status: string[] | null; source: string[] | null; syncScopeFilter: string | number | boolean | null; }
export interface IntegrationsSyncScopeReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; syncScopeValue: string | number | boolean | null; }
export interface IntegrationsSyncScopeReadNextAction { type: 'syncScope'; label: string; route: string | null; }
export interface IntegrationsSyncScopeReadResult { operationId: 'integrations.sync-scope.read'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsSyncScopeReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: IntegrationsSyncScopeReadFilters | null; }
export interface IntegrationsSyncScopeReadData { records: IntegrationsRecord[]; pageInfo: PageInfo; summary: IntegrationsSummary; syncScopeResult: IntegrationsSyncScopeReadResult; }
export interface IntegrationsSyncScopeReadResponse { operationId: 'integrations.sync-scope.read'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsSyncScopeReadData; warnings: ApiProblem[]; }
export interface IntegrationsSyncResumeFilters { search: string | null; status: string[] | null; source: string[] | null; syncResumeFilter: string | number | boolean | null; }
export interface IntegrationsSyncResumeInput { requestedBy: UUID; effectiveAt: ISODateTime | null; syncResumeValue: string | number | boolean | null; }
export interface IntegrationsSyncResumeNextAction { type: 'syncResume'; label: string; route: string | null; }
export interface IntegrationsSyncResumeResult { operationId: 'integrations.sync.resume'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsSyncResumeRequest { context: ApiContext; metadata: MutationMetadata; integrationId: UUID | string | null; input: IntegrationsSyncResumeInput; }
export interface IntegrationsSyncResumeData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: IntegrationsSyncResumeNextAction | null; jobId: UUID | null; syncResumeResult: IntegrationsSyncResumeResult; }
export interface IntegrationsSyncResumeResponse { operationId: 'integrations.sync.resume'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsSyncResumeData; warnings: ApiProblem[]; }
export interface IntegrationsSyncStartFilters { search: string | null; status: string[] | null; source: string[] | null; syncStartFilter: string | number | boolean | null; }
export interface IntegrationsSyncStartInput { requestedBy: UUID; effectiveAt: ISODateTime | null; syncStartValue: string | number | boolean | null; }
export interface IntegrationsSyncStartNextAction { type: 'syncStart'; label: string; route: string | null; }
export interface IntegrationsSyncStartResult { operationId: 'integrations.sync.start'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsSyncStartRequest { context: ApiContext; metadata: MutationMetadata; integrationId: UUID | string | null; input: IntegrationsSyncStartInput; }
export interface IntegrationsSyncStartData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: IntegrationsSyncStartNextAction | null; jobId: UUID | null; syncStartResult: IntegrationsSyncStartResult; }
export interface IntegrationsSyncStartResponse { operationId: 'integrations.sync.start'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsSyncStartData; warnings: ApiProblem[]; }
export interface IntegrationsWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface IntegrationsWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface IntegrationsWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface IntegrationsWriteResult { operationId: 'integrations.write'; completedAt: ISODateTime; domain: 'integrations'; }
export interface IntegrationsWriteRequest { context: ApiContext; metadata: MutationMetadata; integrationId: UUID | string | null; input: IntegrationsWriteInput; }
export interface IntegrationsWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: IntegrationsWriteNextAction | null; resultResult: IntegrationsWriteResult; }
export interface IntegrationsWriteResponse { operationId: 'integrations.write'; correlationId: string; generatedAt: ISODateTime; data: IntegrationsWriteData; warnings: ApiProblem[]; }
export interface InvitationAcceptFilters { search: string | null; status: string[] | null; source: string[] | null; acceptFilter: string | number | boolean | null; }
export interface InvitationAcceptInput { requestedBy: UUID; effectiveAt: ISODateTime | null; acceptValue: string | number | boolean | null; }
export interface InvitationAcceptNextAction { type: 'accept'; label: string; route: string | null; }
export interface InvitationAcceptResult { operationId: 'invitation.accept'; completedAt: ISODateTime; domain: 'auth'; }
export interface InvitationAcceptRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: InvitationAcceptInput; }
export interface InvitationAcceptData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: InvitationAcceptNextAction | null; acceptResult: InvitationAcceptResult; }
export interface InvitationAcceptResponse { operationId: 'invitation.accept'; correlationId: string; generatedAt: ISODateTime; data: InvitationAcceptData; warnings: ApiProblem[]; }
export interface InvitationReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface InvitationReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface InvitationReadNextAction { type: 'result'; label: string; route: string | null; }
export interface InvitationReadResult { operationId: 'invitation.read'; completedAt: ISODateTime; domain: 'invitation'; }
export interface InvitationReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: InvitationReadFilters | null; }
export interface InvitationReadData { records: InvitationRecord[]; pageInfo: PageInfo; summary: InvitationSummary; resultResult: InvitationReadResult; }
export interface InvitationReadResponse { operationId: 'invitation.read'; correlationId: string; generatedAt: ISODateTime; data: InvitationReadData; warnings: ApiProblem[]; }
export interface InvitationRejectFilters { search: string | null; status: string[] | null; source: string[] | null; rejectFilter: string | number | boolean | null; }
export interface InvitationRejectInput { requestedBy: UUID; effectiveAt: ISODateTime | null; rejectValue: string | number | boolean | null; }
export interface InvitationRejectNextAction { type: 'reject'; label: string; route: string | null; }
export interface InvitationRejectResult { operationId: 'invitation.reject'; completedAt: ISODateTime; domain: 'invitation'; }
export interface InvitationRejectRequest { context: ApiContext; metadata: MutationMetadata; invitationId: UUID | string | null; input: InvitationRejectInput; }
export interface InvitationRejectData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: InvitationRejectNextAction | null; rejectResult: InvitationRejectResult; }
export interface InvitationRejectResponse { operationId: 'invitation.reject'; correlationId: string; generatedAt: ISODateTime; data: InvitationRejectData; warnings: ApiProblem[]; }
export interface InvitationRequestFilters { search: string | null; status: string[] | null; source: string[] | null; requestFilter: string | number | boolean | null; }
export interface InvitationRequestInput { requestedBy: UUID; effectiveAt: ISODateTime | null; requestValue: string | number | boolean | null; }
export interface InvitationRequestNextAction { type: 'request'; label: string; route: string | null; }
export interface InvitationRequestResult { operationId: 'invitation.request'; completedAt: ISODateTime; domain: 'invitation'; }
export interface InvitationRequestRequest { context: ApiContext; metadata: MutationMetadata; invitationId: UUID | string | null; input: InvitationRequestInput; }
export interface InvitationRequestData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: InvitationRequestNextAction | null; requestResult: InvitationRequestResult; }
export interface InvitationRequestResponse { operationId: 'invitation.request'; correlationId: string; generatedAt: ISODateTime; data: InvitationRequestData; warnings: ApiProblem[]; }
export interface InvitationValidateFilters { search: string | null; status: string[] | null; source: string[] | null; validateFilter: string | number | boolean | null; }
export interface InvitationValidateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; validateValue: string | number | boolean | null; }
export interface InvitationValidateNextAction { type: 'validate'; label: string; route: string | null; }
export interface InvitationValidateResult { operationId: 'invitation.validate'; completedAt: ISODateTime; domain: 'auth'; }
export interface InvitationValidateRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: InvitationValidateInput; }
export interface InvitationValidateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: InvitationValidateNextAction | null; validateResult: InvitationValidateResult; }
export interface InvitationValidateResponse { operationId: 'invitation.validate'; correlationId: string; generatedAt: ISODateTime; data: InvitationValidateData; warnings: ApiProblem[]; }
export interface MobileDeviceManageFilters { search: string | null; status: string[] | null; source: string[] | null; deviceManageFilter: string | number | boolean | null; }
export interface MobileDeviceManageInput { requestedBy: UUID; effectiveAt: ISODateTime | null; deviceManageValue: string | number | boolean | null; }
export interface MobileDeviceManageNextAction { type: 'deviceManage'; label: string; route: string | null; }
export interface MobileDeviceManageResult { operationId: 'mobile.device.manage'; completedAt: ISODateTime; domain: 'mobile'; }
export interface MobileDeviceManageRequest { context: ApiContext; metadata: MutationMetadata; deviceId: UUID | string | null; input: MobileDeviceManageInput; }
export interface MobileDeviceManageData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: MobileDeviceManageNextAction | null; deviceManageResult: MobileDeviceManageResult; }
export interface MobileDeviceManageResponse { operationId: 'mobile.device.manage'; correlationId: string; generatedAt: ISODateTime; data: MobileDeviceManageData; warnings: ApiProblem[]; }
export interface MobileInviteFilters { search: string | null; status: string[] | null; source: string[] | null; inviteFilter: string | number | boolean | null; }
export interface MobileInviteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; inviteValue: string | number | boolean | null; }
export interface MobileInviteNextAction { type: 'invite'; label: string; route: string | null; }
export interface MobileInviteResult { operationId: 'mobile.invite'; completedAt: ISODateTime; domain: 'mobile'; }
export interface MobileInviteRequest { context: ApiContext; metadata: MutationMetadata; deviceId: UUID | string | null; input: MobileInviteInput; }
export interface MobileInviteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: MobileInviteNextAction | null; inviteResult: MobileInviteResult; }
export interface MobileInviteResponse { operationId: 'mobile.invite'; correlationId: string; generatedAt: ISODateTime; data: MobileInviteData; warnings: ApiProblem[]; }
export interface MobileUseFilters { search: string | null; status: string[] | null; source: string[] | null; useFilter: string | number | boolean | null; }
export interface MobileUseInput { requestedBy: UUID; effectiveAt: ISODateTime | null; useValue: string | number | boolean | null; }
export interface MobileUseNextAction { type: 'use'; label: string; route: string | null; }
export interface MobileUseResult { operationId: 'mobile.use'; completedAt: ISODateTime; domain: 'mobile'; }
export interface MobileUseRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: MobileUseFilters | null; }
export interface MobileUseData { records: MobileRecord[]; pageInfo: PageInfo; summary: MobileSummary; useResult: MobileUseResult; }
export interface MobileUseResponse { operationId: 'mobile.use'; correlationId: string; generatedAt: ISODateTime; data: MobileUseData; warnings: ApiProblem[]; }
export interface OnboardingProfileUpdateFilters { search: string | null; status: string[] | null; source: string[] | null; profileUpdateFilter: string | number | boolean | null; }
export interface OnboardingProfileUpdateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; profileUpdateValue: string | number | boolean | null; }
export interface OnboardingProfileUpdateNextAction { type: 'profileUpdate'; label: string; route: string | null; }
export interface OnboardingProfileUpdateResult { operationId: 'onboarding.profile.update'; completedAt: ISODateTime; domain: 'onboarding'; }
export interface OnboardingProfileUpdateRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: OnboardingProfileUpdateInput; }
export interface OnboardingProfileUpdateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: OnboardingProfileUpdateNextAction | null; profileUpdateResult: OnboardingProfileUpdateResult; }
export interface OnboardingProfileUpdateResponse { operationId: 'onboarding.profile.update'; correlationId: string; generatedAt: ISODateTime; data: OnboardingProfileUpdateData; warnings: ApiProblem[]; }
export interface OnboardingProgressReadFilters { search: string | null; status: string[] | null; source: string[] | null; progressFilter: string | number | boolean | null; }
export interface OnboardingProgressReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; progressValue: string | number | boolean | null; }
export interface OnboardingProgressReadNextAction { type: 'progress'; label: string; route: string | null; }
export interface OnboardingProgressReadResult { operationId: 'onboarding.progress.read'; completedAt: ISODateTime; domain: 'onboarding'; }
export interface OnboardingProgressReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OnboardingProgressReadFilters | null; }
export interface OnboardingProgressReadData { records: OnboardingRecord[]; pageInfo: PageInfo; summary: OnboardingSummary; progressResult: OnboardingProgressReadResult; }
export interface OnboardingProgressReadResponse { operationId: 'onboarding.progress.read'; correlationId: string; generatedAt: ISODateTime; data: OnboardingProgressReadData; warnings: ApiProblem[]; }
export interface OrdersDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; detailFilter: string | number | boolean | null; }
export interface OrdersDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; detailValue: string | number | boolean | null; }
export interface OrdersDetailReadNextAction { type: 'detail'; label: string; route: string | null; }
export interface OrdersDetailReadResult { operationId: 'orders.detail.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; orderId: UUID | string; filters: OrdersDetailReadFilters | null; }
export interface OrdersDetailReadData { record: OrdersRecord; detailResult: OrdersDetailReadResult; }
export interface OrdersDetailReadResponse { operationId: 'orders.detail.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersDetailReadData; warnings: ApiProblem[]; }
export interface OrdersEksportReadFilters { search: string | null; status: string[] | null; source: string[] | null; eksportFilter: string | number | boolean | null; }
export interface OrdersEksportReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; eksportValue: string | number | boolean | null; }
export interface OrdersEksportReadNextAction { type: 'eksport'; label: string; route: string | null; }
export interface OrdersEksportReadResult { operationId: 'orders.eksport.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersEksportReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersEksportReadFilters | null; }
export interface OrdersEksportReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; eksportResult: OrdersEksportReadResult; }
export interface OrdersEksportReadResponse { operationId: 'orders.eksport.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersEksportReadData; warnings: ApiProblem[]; }
export interface OrdersListReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface OrdersListReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface OrdersListReadNextAction { type: 'result'; label: string; route: string | null; }
export interface OrdersListReadResult { operationId: 'orders.list.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersListReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersListReadFilters | null; }
export interface OrdersListReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; resultResult: OrdersListReadResult; }
export interface OrdersListReadResponse { operationId: 'orders.list.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersListReadData; warnings: ApiProblem[]; }
export interface OrdersOsZdarzenReadFilters { search: string | null; status: string[] | null; source: string[] | null; osZdarzenFilter: string | number | boolean | null; }
export interface OrdersOsZdarzenReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; osZdarzenValue: string | number | boolean | null; }
export interface OrdersOsZdarzenReadNextAction { type: 'osZdarzen'; label: string; route: string | null; }
export interface OrdersOsZdarzenReadResult { operationId: 'orders.os-zdarzen.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersOsZdarzenReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersOsZdarzenReadFilters | null; }
export interface OrdersOsZdarzenReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; osZdarzenResult: OrdersOsZdarzenReadResult; }
export interface OrdersOsZdarzenReadResponse { operationId: 'orders.os-zdarzen.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersOsZdarzenReadData; warnings: ApiProblem[]; }
export interface OrdersOverviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; overviewFilter: string | number | boolean | null; }
export interface OrdersOverviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overviewValue: string | number | boolean | null; }
export interface OrdersOverviewReadNextAction { type: 'overview'; label: string; route: string | null; }
export interface OrdersOverviewReadResult { operationId: 'orders.overview.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersOverviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersOverviewReadFilters | null; }
export interface OrdersOverviewReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; overviewResult: OrdersOverviewReadResult; }
export interface OrdersOverviewReadResponse { operationId: 'orders.overview.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersOverviewReadData; warnings: ApiProblem[]; }
export interface OrdersPorownanieZrodelReadFilters { search: string | null; status: string[] | null; source: string[] | null; porownanieZrodelFilter: string | number | boolean | null; }
export interface OrdersPorownanieZrodelReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; porownanieZrodelValue: string | number | boolean | null; }
export interface OrdersPorownanieZrodelReadNextAction { type: 'porownanieZrodel'; label: string; route: string | null; }
export interface OrdersPorownanieZrodelReadResult { operationId: 'orders.porownanie-zrodel.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersPorownanieZrodelReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersPorownanieZrodelReadFilters | null; }
export interface OrdersPorownanieZrodelReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; porownanieZrodelResult: OrdersPorownanieZrodelReadResult; }
export interface OrdersPorownanieZrodelReadResponse { operationId: 'orders.porownanie-zrodel.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersPorownanieZrodelReadData; warnings: ApiProblem[]; }
export interface OrdersReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface OrdersReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface OrdersReadNextAction { type: 'result'; label: string; route: string | null; }
export interface OrdersReadResult { operationId: 'orders.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersReadFilters | null; }
export interface OrdersReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; resultResult: OrdersReadResult; }
export interface OrdersReadResponse { operationId: 'orders.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersReadData; warnings: ApiProblem[]; }
export interface OrdersRekoncyliacjaSkrotReadFilters { search: string | null; status: string[] | null; source: string[] | null; rekoncyliacjaSkrotFilter: string | number | boolean | null; }
export interface OrdersRekoncyliacjaSkrotReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; rekoncyliacjaSkrotValue: string | number | boolean | null; }
export interface OrdersRekoncyliacjaSkrotReadNextAction { type: 'rekoncyliacjaSkrot'; label: string; route: string | null; }
export interface OrdersRekoncyliacjaSkrotReadResult { operationId: 'orders.rekoncyliacja-skrot.read'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersRekoncyliacjaSkrotReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: OrdersRekoncyliacjaSkrotReadFilters | null; }
export interface OrdersRekoncyliacjaSkrotReadData { records: OrdersRecord[]; pageInfo: PageInfo; summary: OrdersSummary; rekoncyliacjaSkrotResult: OrdersRekoncyliacjaSkrotReadResult; }
export interface OrdersRekoncyliacjaSkrotReadResponse { operationId: 'orders.rekoncyliacja-skrot.read'; correlationId: string; generatedAt: ISODateTime; data: OrdersRekoncyliacjaSkrotReadData; warnings: ApiProblem[]; }
export interface OrdersWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface OrdersWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface OrdersWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface OrdersWriteResult { operationId: 'orders.write'; completedAt: ISODateTime; domain: 'orders'; }
export interface OrdersWriteRequest { context: ApiContext; metadata: MutationMetadata; orderId: UUID | string | null; input: OrdersWriteInput; }
export interface OrdersWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: OrdersWriteNextAction | null; resultResult: OrdersWriteResult; }
export interface OrdersWriteResponse { operationId: 'orders.write'; correlationId: string; generatedAt: ISODateTime; data: OrdersWriteData; warnings: ApiProblem[]; }
export interface PapaActionApprovalReadFilters { search: string | null; status: string[] | null; source: string[] | null; actionApprovalFilter: string | number | boolean | null; }
export interface PapaActionApprovalReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; actionApprovalValue: string | number | boolean | null; }
export interface PapaActionApprovalReadNextAction { type: 'actionApproval'; label: string; route: string | null; }
export interface PapaActionApprovalReadResult { operationId: 'papa.action-approval.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaActionApprovalReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaActionApprovalReadFilters | null; }
export interface PapaActionApprovalReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; actionApprovalResult: PapaActionApprovalReadResult; }
export interface PapaActionApprovalReadResponse { operationId: 'papa.action-approval.read'; correlationId: string; generatedAt: ISODateTime; data: PapaActionApprovalReadData; warnings: ApiProblem[]; }
export interface PapaActionsReadFilters { search: string | null; status: string[] | null; source: string[] | null; actionsFilter: string | number | boolean | null; }
export interface PapaActionsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; actionsValue: string | number | boolean | null; }
export interface PapaActionsReadNextAction { type: 'actions'; label: string; route: string | null; }
export interface PapaActionsReadResult { operationId: 'papa.actions.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaActionsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaActionsReadFilters | null; }
export interface PapaActionsReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; actionsResult: PapaActionsReadResult; }
export interface PapaActionsReadResponse { operationId: 'papa.actions.read'; correlationId: string; generatedAt: ISODateTime; data: PapaActionsReadData; warnings: ApiProblem[]; }
export interface PapaAiActionApproveFilters { search: string | null; status: string[] | null; source: string[] | null; aiActionApproveFilter: string | number | boolean | null; }
export interface PapaAiActionApproveInput { requestedBy: UUID; effectiveAt: ISODateTime | null; aiActionApproveValue: string | number | boolean | null; }
export interface PapaAiActionApproveNextAction { type: 'aiActionApprove'; label: string; route: string | null; }
export interface PapaAiActionApproveResult { operationId: 'papa.ai.action.approve'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAiActionApproveRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaAiActionApproveInput; }
export interface PapaAiActionApproveData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaAiActionApproveNextAction | null; aiActionApproveResult: PapaAiActionApproveResult; }
export interface PapaAiActionApproveResponse { operationId: 'papa.ai.action.approve'; correlationId: string; generatedAt: ISODateTime; data: PapaAiActionApproveData; warnings: ApiProblem[]; }
export interface PapaAiActionExecuteFilters { search: string | null; status: string[] | null; source: string[] | null; aiActionExecuteFilter: string | number | boolean | null; }
export interface PapaAiActionExecuteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; aiActionExecuteValue: string | number | boolean | null; }
export interface PapaAiActionExecuteNextAction { type: 'aiActionExecute'; label: string; route: string | null; }
export interface PapaAiActionExecuteResult { operationId: 'papa.ai.action.execute'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAiActionExecuteRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaAiActionExecuteInput; }
export interface PapaAiActionExecuteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaAiActionExecuteNextAction | null; aiActionExecuteResult: PapaAiActionExecuteResult; }
export interface PapaAiActionExecuteResponse { operationId: 'papa.ai.action.execute'; correlationId: string; generatedAt: ISODateTime; data: PapaAiActionExecuteData; warnings: ApiProblem[]; }
export interface PapaAiActionRejectFilters { search: string | null; status: string[] | null; source: string[] | null; aiActionRejectFilter: string | number | boolean | null; }
export interface PapaAiActionRejectInput { requestedBy: UUID; effectiveAt: ISODateTime | null; aiActionRejectValue: string | number | boolean | null; }
export interface PapaAiActionRejectNextAction { type: 'aiActionReject'; label: string; route: string | null; }
export interface PapaAiActionRejectResult { operationId: 'papa.ai.action.reject'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAiActionRejectRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaAiActionRejectInput; }
export interface PapaAiActionRejectData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaAiActionRejectNextAction | null; aiActionRejectResult: PapaAiActionRejectResult; }
export interface PapaAiActionRejectResponse { operationId: 'papa.ai.action.reject'; correlationId: string; generatedAt: ISODateTime; data: PapaAiActionRejectData; warnings: ApiProblem[]; }
export interface PapaAiActionRollbackFilters { search: string | null; status: string[] | null; source: string[] | null; aiActionRollbackFilter: string | number | boolean | null; }
export interface PapaAiActionRollbackInput { requestedBy: UUID; effectiveAt: ISODateTime | null; aiActionRollbackValue: string | number | boolean | null; }
export interface PapaAiActionRollbackNextAction { type: 'aiActionRollback'; label: string; route: string | null; }
export interface PapaAiActionRollbackResult { operationId: 'papa.ai.action.rollback'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAiActionRollbackRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaAiActionRollbackInput; }
export interface PapaAiActionRollbackData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaAiActionRollbackNextAction | null; aiActionRollbackResult: PapaAiActionRollbackResult; }
export interface PapaAiActionRollbackResponse { operationId: 'papa.ai.action.rollback'; correlationId: string; generatedAt: ISODateTime; data: PapaAiActionRollbackData; warnings: ApiProblem[]; }
export interface PapaAiActionValidateFilters { search: string | null; status: string[] | null; source: string[] | null; aiActionValidateFilter: string | number | boolean | null; }
export interface PapaAiActionValidateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; aiActionValidateValue: string | number | boolean | null; }
export interface PapaAiActionValidateNextAction { type: 'aiActionValidate'; label: string; route: string | null; }
export interface PapaAiActionValidateResult { operationId: 'papa.ai.action.validate'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAiActionValidateRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaAiActionValidateInput; }
export interface PapaAiActionValidateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaAiActionValidateNextAction | null; aiActionValidateResult: PapaAiActionValidateResult; }
export interface PapaAiActionValidateResponse { operationId: 'papa.ai.action.validate'; correlationId: string; generatedAt: ISODateTime; data: PapaAiActionValidateData; warnings: ApiProblem[]; }
export interface PapaAnswerGenerateFilters { search: string | null; status: string[] | null; source: string[] | null; answerGenerateFilter: string | number | boolean | null; }
export interface PapaAnswerGenerateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; answerGenerateValue: string | number | boolean | null; }
export interface PapaAnswerGenerateNextAction { type: 'answerGenerate'; label: string; route: string | null; }
export interface PapaAnswerGenerateResult { operationId: 'papa.answer.generate'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAnswerGenerateRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaAnswerGenerateInput; }
export interface PapaAnswerGenerateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaAnswerGenerateNextAction | null; answerGenerateResult: PapaAnswerGenerateResult; }
export interface PapaAnswerGenerateResponse { operationId: 'papa.answer.generate'; correlationId: string; generatedAt: ISODateTime; data: PapaAnswerGenerateData; warnings: ApiProblem[]; }
export interface PapaAnswerReadFilters { search: string | null; status: string[] | null; source: string[] | null; answerFilter: string | number | boolean | null; }
export interface PapaAnswerReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; answerValue: string | number | boolean | null; }
export interface PapaAnswerReadNextAction { type: 'answer'; label: string; route: string | null; }
export interface PapaAnswerReadResult { operationId: 'papa.answer.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAnswerReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaAnswerReadFilters | null; }
export interface PapaAnswerReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; answerResult: PapaAnswerReadResult; }
export interface PapaAnswerReadResponse { operationId: 'papa.answer.read'; correlationId: string; generatedAt: ISODateTime; data: PapaAnswerReadData; warnings: ApiProblem[]; }
export interface PapaAssistantShellReadFilters { search: string | null; status: string[] | null; source: string[] | null; assistantShellFilter: string | number | boolean | null; }
export interface PapaAssistantShellReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; assistantShellValue: string | number | boolean | null; }
export interface PapaAssistantShellReadNextAction { type: 'assistantShell'; label: string; route: string | null; }
export interface PapaAssistantShellReadResult { operationId: 'papa.assistant-shell.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaAssistantShellReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaAssistantShellReadFilters | null; }
export interface PapaAssistantShellReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; assistantShellResult: PapaAssistantShellReadResult; }
export interface PapaAssistantShellReadResponse { operationId: 'papa.assistant-shell.read'; correlationId: string; generatedAt: ISODateTime; data: PapaAssistantShellReadData; warnings: ApiProblem[]; }
export interface PapaContextBasketReadFilters { search: string | null; status: string[] | null; source: string[] | null; contextBasketFilter: string | number | boolean | null; }
export interface PapaContextBasketReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; contextBasketValue: string | number | boolean | null; }
export interface PapaContextBasketReadNextAction { type: 'contextBasket'; label: string; route: string | null; }
export interface PapaContextBasketReadResult { operationId: 'papa.context-basket.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaContextBasketReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaContextBasketReadFilters | null; }
export interface PapaContextBasketReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; contextBasketResult: PapaContextBasketReadResult; }
export interface PapaContextBasketReadResponse { operationId: 'papa.context-basket.read'; correlationId: string; generatedAt: ISODateTime; data: PapaContextBasketReadData; warnings: ApiProblem[]; }
export interface PapaContextPanelReadFilters { search: string | null; status: string[] | null; source: string[] | null; contextPanelFilter: string | number | boolean | null; }
export interface PapaContextPanelReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; contextPanelValue: string | number | boolean | null; }
export interface PapaContextPanelReadNextAction { type: 'contextPanel'; label: string; route: string | null; }
export interface PapaContextPanelReadResult { operationId: 'papa.context-panel.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaContextPanelReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaContextPanelReadFilters | null; }
export interface PapaContextPanelReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; contextPanelResult: PapaContextPanelReadResult; }
export interface PapaContextPanelReadResponse { operationId: 'papa.context-panel.read'; correlationId: string; generatedAt: ISODateTime; data: PapaContextPanelReadData; warnings: ApiProblem[]; }
export interface PapaContextCaptureFilters { search: string | null; status: string[] | null; source: string[] | null; contextCaptureFilter: string | number | boolean | null; }
export interface PapaContextCaptureInput { requestedBy: UUID; effectiveAt: ISODateTime | null; contextCaptureValue: string | number | boolean | null; }
export interface PapaContextCaptureNextAction { type: 'contextCapture'; label: string; route: string | null; }
export interface PapaContextCaptureResult { operationId: 'papa.context.capture'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaContextCaptureRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaContextCaptureInput; }
export interface PapaContextCaptureData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaContextCaptureNextAction | null; contextCaptureResult: PapaContextCaptureResult; }
export interface PapaContextCaptureResponse { operationId: 'papa.context.capture'; correlationId: string; generatedAt: ISODateTime; data: PapaContextCaptureData; warnings: ApiProblem[]; }
export interface PapaEvidenceReadFilters { search: string | null; status: string[] | null; source: string[] | null; evidenceFilter: string | number | boolean | null; }
export interface PapaEvidenceReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; evidenceValue: string | number | boolean | null; }
export interface PapaEvidenceReadNextAction { type: 'evidence'; label: string; route: string | null; }
export interface PapaEvidenceReadResult { operationId: 'papa.evidence.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaEvidenceReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaEvidenceReadFilters | null; }
export interface PapaEvidenceReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; evidenceResult: PapaEvidenceReadResult; }
export interface PapaEvidenceReadResponse { operationId: 'papa.evidence.read'; correlationId: string; generatedAt: ISODateTime; data: PapaEvidenceReadData; warnings: ApiProblem[]; }
export interface PapaGovernanceReadFilters { search: string | null; status: string[] | null; source: string[] | null; governanceFilter: string | number | boolean | null; }
export interface PapaGovernanceReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; governanceValue: string | number | boolean | null; }
export interface PapaGovernanceReadNextAction { type: 'governance'; label: string; route: string | null; }
export interface PapaGovernanceReadResult { operationId: 'papa.governance.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaGovernanceReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaGovernanceReadFilters | null; }
export interface PapaGovernanceReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; governanceResult: PapaGovernanceReadResult; }
export interface PapaGovernanceReadResponse { operationId: 'papa.governance.read'; correlationId: string; generatedAt: ISODateTime; data: PapaGovernanceReadData; warnings: ApiProblem[]; }
export interface PapaHistoryMemoryReadFilters { search: string | null; status: string[] | null; source: string[] | null; historyMemoryFilter: string | number | boolean | null; }
export interface PapaHistoryMemoryReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; historyMemoryValue: string | number | boolean | null; }
export interface PapaHistoryMemoryReadNextAction { type: 'historyMemory'; label: string; route: string | null; }
export interface PapaHistoryMemoryReadResult { operationId: 'papa.history-memory.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaHistoryMemoryReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaHistoryMemoryReadFilters | null; }
export interface PapaHistoryMemoryReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; timeline: PapaTimelineEvent[]; historyMemoryResult: PapaHistoryMemoryReadResult; }
export interface PapaHistoryMemoryReadResponse { operationId: 'papa.history-memory.read'; correlationId: string; generatedAt: ISODateTime; data: PapaHistoryMemoryReadData; warnings: ApiProblem[]; }
export interface PapaLabReadFilters { search: string | null; status: string[] | null; source: string[] | null; labFilter: string | number | boolean | null; }
export interface PapaLabReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; labValue: string | number | boolean | null; }
export interface PapaLabReadNextAction { type: 'lab'; label: string; route: string | null; }
export interface PapaLabReadResult { operationId: 'papa.lab.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaLabReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaLabReadFilters | null; }
export interface PapaLabReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; labResult: PapaLabReadResult; }
export interface PapaLabReadResponse { operationId: 'papa.lab.read'; correlationId: string; generatedAt: ISODateTime; data: PapaLabReadData; warnings: ApiProblem[]; }
export interface PapaObservationSaveFilters { search: string | null; status: string[] | null; source: string[] | null; observationSaveFilter: string | number | boolean | null; }
export interface PapaObservationSaveInput { requestedBy: UUID; effectiveAt: ISODateTime | null; observationSaveValue: string | number | boolean | null; }
export interface PapaObservationSaveNextAction { type: 'observationSave'; label: string; route: string | null; }
export interface PapaObservationSaveResult { operationId: 'papa.observation.save'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaObservationSaveRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaObservationSaveInput; }
export interface PapaObservationSaveData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaObservationSaveNextAction | null; observationSaveResult: PapaObservationSaveResult; }
export interface PapaObservationSaveResponse { operationId: 'papa.observation.save'; correlationId: string; generatedAt: ISODateTime; data: PapaObservationSaveData; warnings: ApiProblem[]; }
export interface PapaObservationsReadFilters { search: string | null; status: string[] | null; source: string[] | null; observationsFilter: string | number | boolean | null; }
export interface PapaObservationsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; observationsValue: string | number | boolean | null; }
export interface PapaObservationsReadNextAction { type: 'observations'; label: string; route: string | null; }
export interface PapaObservationsReadResult { operationId: 'papa.observations.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaObservationsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaObservationsReadFilters | null; }
export interface PapaObservationsReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; observationsResult: PapaObservationsReadResult; }
export interface PapaObservationsReadResponse { operationId: 'papa.observations.read'; correlationId: string; generatedAt: ISODateTime; data: PapaObservationsReadData; warnings: ApiProblem[]; }
export interface PapaProposalsReadFilters { search: string | null; status: string[] | null; source: string[] | null; proposalsFilter: string | number | boolean | null; }
export interface PapaProposalsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; proposalsValue: string | number | boolean | null; }
export interface PapaProposalsReadNextAction { type: 'proposals'; label: string; route: string | null; }
export interface PapaProposalsReadResult { operationId: 'papa.proposals.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaProposalsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaProposalsReadFilters | null; }
export interface PapaProposalsReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; proposalsResult: PapaProposalsReadResult; }
export interface PapaProposalsReadResponse { operationId: 'papa.proposals.read'; correlationId: string; generatedAt: ISODateTime; data: PapaProposalsReadData; warnings: ApiProblem[]; }
export interface PapaReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface PapaReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface PapaReadNextAction { type: 'result'; label: string; route: string | null; }
export interface PapaReadResult { operationId: 'papa.read'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: PapaReadFilters | null; }
export interface PapaReadData { records: PapaRecord[]; pageInfo: PageInfo; summary: PapaSummary; resultResult: PapaReadResult; }
export interface PapaReadResponse { operationId: 'papa.read'; correlationId: string; generatedAt: ISODateTime; data: PapaReadData; warnings: ApiProblem[]; }
export interface PapaWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface PapaWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface PapaWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface PapaWriteResult { operationId: 'papa.write'; completedAt: ISODateTime; domain: 'papa'; }
export interface PapaWriteRequest { context: ApiContext; metadata: MutationMetadata; messageId: UUID | string | null; input: PapaWriteInput; }
export interface PapaWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: PapaWriteNextAction | null; resultResult: PapaWriteResult; }
export interface PapaWriteResponse { operationId: 'papa.write'; correlationId: string; generatedAt: ISODateTime; data: PapaWriteData; warnings: ApiProblem[]; }
export interface ProductsCatalogReadFilters { search: string | null; status: string[] | null; source: string[] | null; catalogFilter: string | number | boolean | null; }
export interface ProductsCatalogReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; catalogValue: string | number | boolean | null; }
export interface ProductsCatalogReadNextAction { type: 'catalog'; label: string; route: string | null; }
export interface ProductsCatalogReadResult { operationId: 'products.catalog.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsCatalogReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsCatalogReadFilters | null; }
export interface ProductsCatalogReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; catalogResult: ProductsCatalogReadResult; }
export interface ProductsCatalogReadResponse { operationId: 'products.catalog.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsCatalogReadData; warnings: ApiProblem[]; }
export interface ProductsDetailReadFilters { search: string | null; status: string[] | null; source: string[] | null; detailFilter: string | number | boolean | null; }
export interface ProductsDetailReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; detailValue: string | number | boolean | null; }
export interface ProductsDetailReadNextAction { type: 'detail'; label: string; route: string | null; }
export interface ProductsDetailReadResult { operationId: 'products.detail.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsDetailReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; productId: UUID | string; filters: ProductsDetailReadFilters | null; }
export interface ProductsDetailReadData { record: ProductsRecord; detailResult: ProductsDetailReadResult; }
export interface ProductsDetailReadResponse { operationId: 'products.detail.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsDetailReadData; warnings: ApiProblem[]; }
export interface ProductsGapsQueueReadFilters { search: string | null; status: string[] | null; source: string[] | null; gapsQueueFilter: string | number | boolean | null; }
export interface ProductsGapsQueueReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; gapsQueueValue: string | number | boolean | null; }
export interface ProductsGapsQueueReadNextAction { type: 'gapsQueue'; label: string; route: string | null; }
export interface ProductsGapsQueueReadResult { operationId: 'products.gaps.queue.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsGapsQueueReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsGapsQueueReadFilters | null; }
export interface ProductsGapsQueueReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; gapsQueueResult: ProductsGapsQueueReadResult; }
export interface ProductsGapsQueueReadResponse { operationId: 'products.gaps.queue.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsGapsQueueReadData; warnings: ApiProblem[]; }
export interface ProductsImpactReadFilters { search: string | null; status: string[] | null; source: string[] | null; impactFilter: string | number | boolean | null; }
export interface ProductsImpactReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; impactValue: string | number | boolean | null; }
export interface ProductsImpactReadNextAction { type: 'impact'; label: string; route: string | null; }
export interface ProductsImpactReadResult { operationId: 'products.impact.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsImpactReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsImpactReadFilters | null; }
export interface ProductsImpactReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; impactResult: ProductsImpactReadResult; }
export interface ProductsImpactReadResponse { operationId: 'products.impact.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsImpactReadData; warnings: ApiProblem[]; }
export interface ProductsMappingReadFilters { search: string | null; status: string[] | null; source: string[] | null; mappingFilter: string | number | boolean | null; }
export interface ProductsMappingReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; mappingValue: string | number | boolean | null; }
export interface ProductsMappingReadNextAction { type: 'mapping'; label: string; route: string | null; }
export interface ProductsMappingReadResult { operationId: 'products.mapping.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsMappingReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsMappingReadFilters | null; }
export interface ProductsMappingReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; mappingResult: ProductsMappingReadResult; }
export interface ProductsMappingReadResponse { operationId: 'products.mapping.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsMappingReadData; warnings: ApiProblem[]; }
export interface ProductsMappingUpdateFilters { search: string | null; status: string[] | null; source: string[] | null; mappingUpdateFilter: string | number | boolean | null; }
export interface ProductsMappingUpdateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; mappingUpdateValue: string | number | boolean | null; }
export interface ProductsMappingUpdateNextAction { type: 'mappingUpdate'; label: string; route: string | null; }
export interface ProductsMappingUpdateResult { operationId: 'products.mapping.update'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsMappingUpdateRequest { context: ApiContext; metadata: MutationMetadata; productId: UUID | string | null; input: ProductsMappingUpdateInput; }
export interface ProductsMappingUpdateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: ProductsMappingUpdateNextAction | null; mappingUpdateResult: ProductsMappingUpdateResult; }
export interface ProductsMappingUpdateResponse { operationId: 'products.mapping.update'; correlationId: string; generatedAt: ISODateTime; data: ProductsMappingUpdateData; warnings: ApiProblem[]; }
export interface ProductsOffersReadFilters { search: string | null; status: string[] | null; source: string[] | null; offersFilter: string | number | boolean | null; }
export interface ProductsOffersReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; offersValue: string | number | boolean | null; }
export interface ProductsOffersReadNextAction { type: 'offers'; label: string; route: string | null; }
export interface ProductsOffersReadResult { operationId: 'products.offers.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsOffersReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsOffersReadFilters | null; }
export interface ProductsOffersReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; offersResult: ProductsOffersReadResult; }
export interface ProductsOffersReadResponse { operationId: 'products.offers.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsOffersReadData; warnings: ApiProblem[]; }
export interface ProductsOverviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; overviewFilter: string | number | boolean | null; }
export interface ProductsOverviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overviewValue: string | number | boolean | null; }
export interface ProductsOverviewReadNextAction { type: 'overview'; label: string; route: string | null; }
export interface ProductsOverviewReadResult { operationId: 'products.overview.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsOverviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsOverviewReadFilters | null; }
export interface ProductsOverviewReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; overviewResult: ProductsOverviewReadResult; }
export interface ProductsOverviewReadResponse { operationId: 'products.overview.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsOverviewReadData; warnings: ApiProblem[]; }
export interface ProductsPerformanceReadFilters { search: string | null; status: string[] | null; source: string[] | null; performanceFilter: string | number | boolean | null; }
export interface ProductsPerformanceReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; performanceValue: string | number | boolean | null; }
export interface ProductsPerformanceReadNextAction { type: 'performance'; label: string; route: string | null; }
export interface ProductsPerformanceReadResult { operationId: 'products.performance.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsPerformanceReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsPerformanceReadFilters | null; }
export interface ProductsPerformanceReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; performanceResult: ProductsPerformanceReadResult; }
export interface ProductsPerformanceReadResponse { operationId: 'products.performance.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsPerformanceReadData; warnings: ApiProblem[]; }
export interface ProductsReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface ProductsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface ProductsReadNextAction { type: 'result'; label: string; route: string | null; }
export interface ProductsReadResult { operationId: 'products.read'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: ProductsReadFilters | null; }
export interface ProductsReadData { records: ProductsRecord[]; pageInfo: PageInfo; summary: ProductsSummary; resultResult: ProductsReadResult; }
export interface ProductsReadResponse { operationId: 'products.read'; correlationId: string; generatedAt: ISODateTime; data: ProductsReadData; warnings: ApiProblem[]; }
export interface ProductsWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface ProductsWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface ProductsWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface ProductsWriteResult { operationId: 'products.write'; completedAt: ISODateTime; domain: 'products'; }
export interface ProductsWriteRequest { context: ApiContext; metadata: MutationMetadata; productId: UUID | string | null; input: ProductsWriteInput; }
export interface ProductsWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: ProductsWriteNextAction | null; resultResult: ProductsWriteResult; }
export interface ProductsWriteResponse { operationId: 'products.write'; correlationId: string; generatedAt: ISODateTime; data: ProductsWriteData; warnings: ApiProblem[]; }
export interface SettingsAccountSecurityReadFilters { search: string | null; status: string[] | null; source: string[] | null; accountSecurityFilter: string | number | boolean | null; }
export interface SettingsAccountSecurityReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; accountSecurityValue: string | number | boolean | null; }
export interface SettingsAccountSecurityReadNextAction { type: 'accountSecurity'; label: string; route: string | null; }
export interface SettingsAccountSecurityReadResult { operationId: 'settings.account-security.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsAccountSecurityReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsAccountSecurityReadFilters | null; }
export interface SettingsAccountSecurityReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; accountSecurityResult: SettingsAccountSecurityReadResult; }
export interface SettingsAccountSecurityReadResponse { operationId: 'settings.account-security.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsAccountSecurityReadData; warnings: ApiProblem[]; }
export interface SettingsAuditReadFilters { search: string | null; status: string[] | null; source: string[] | null; auditFilter: string | number | boolean | null; }
export interface SettingsAuditReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; auditValue: string | number | boolean | null; }
export interface SettingsAuditReadNextAction { type: 'audit'; label: string; route: string | null; }
export interface SettingsAuditReadResult { operationId: 'settings.audit.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsAuditReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsAuditReadFilters | null; }
export interface SettingsAuditReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; auditResult: SettingsAuditReadResult; }
export interface SettingsAuditReadResponse { operationId: 'settings.audit.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsAuditReadData; warnings: ApiProblem[]; }
export interface SettingsMembershipsReadFilters { search: string | null; status: string[] | null; source: string[] | null; membershipsFilter: string | number | boolean | null; }
export interface SettingsMembershipsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; membershipsValue: string | number | boolean | null; }
export interface SettingsMembershipsReadNextAction { type: 'memberships'; label: string; route: string | null; }
export interface SettingsMembershipsReadResult { operationId: 'settings.memberships.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsMembershipsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsMembershipsReadFilters | null; }
export interface SettingsMembershipsReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; membershipsResult: SettingsMembershipsReadResult; }
export interface SettingsMembershipsReadResponse { operationId: 'settings.memberships.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsMembershipsReadData; warnings: ApiProblem[]; }
export interface SettingsOrganizationReadFilters { search: string | null; status: string[] | null; source: string[] | null; organizationFilter: string | number | boolean | null; }
export interface SettingsOrganizationReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; organizationValue: string | number | boolean | null; }
export interface SettingsOrganizationReadNextAction { type: 'organization'; label: string; route: string | null; }
export interface SettingsOrganizationReadResult { operationId: 'settings.organization.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsOrganizationReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsOrganizationReadFilters | null; }
export interface SettingsOrganizationReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; organizationResult: SettingsOrganizationReadResult; }
export interface SettingsOrganizationReadResponse { operationId: 'settings.organization.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsOrganizationReadData; warnings: ApiProblem[]; }
export interface SettingsPrivacyReadFilters { search: string | null; status: string[] | null; source: string[] | null; privacyFilter: string | number | boolean | null; }
export interface SettingsPrivacyReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; privacyValue: string | number | boolean | null; }
export interface SettingsPrivacyReadNextAction { type: 'privacy'; label: string; route: string | null; }
export interface SettingsPrivacyReadResult { operationId: 'settings.privacy.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsPrivacyReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsPrivacyReadFilters | null; }
export interface SettingsPrivacyReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; privacyResult: SettingsPrivacyReadResult; }
export interface SettingsPrivacyReadResponse { operationId: 'settings.privacy.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsPrivacyReadData; warnings: ApiProblem[]; }
export interface SettingsReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface SettingsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface SettingsReadNextAction { type: 'result'; label: string; route: string | null; }
export interface SettingsReadResult { operationId: 'settings.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsReadFilters | null; }
export interface SettingsReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; resultResult: SettingsReadResult; }
export interface SettingsReadResponse { operationId: 'settings.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsReadData; warnings: ApiProblem[]; }
export interface SettingsRolesReadFilters { search: string | null; status: string[] | null; source: string[] | null; rolesFilter: string | number | boolean | null; }
export interface SettingsRolesReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; rolesValue: string | number | boolean | null; }
export interface SettingsRolesReadNextAction { type: 'roles'; label: string; route: string | null; }
export interface SettingsRolesReadResult { operationId: 'settings.roles.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsRolesReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsRolesReadFilters | null; }
export interface SettingsRolesReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; rolesResult: SettingsRolesReadResult; }
export interface SettingsRolesReadResponse { operationId: 'settings.roles.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsRolesReadData; warnings: ApiProblem[]; }
export interface SettingsSessionsReadFilters { search: string | null; status: string[] | null; source: string[] | null; sessionsFilter: string | number | boolean | null; }
export interface SettingsSessionsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; sessionsValue: string | number | boolean | null; }
export interface SettingsSessionsReadNextAction { type: 'sessions'; label: string; route: string | null; }
export interface SettingsSessionsReadResult { operationId: 'settings.sessions.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsSessionsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsSessionsReadFilters | null; }
export interface SettingsSessionsReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; sessionsResult: SettingsSessionsReadResult; }
export interface SettingsSessionsReadResponse { operationId: 'settings.sessions.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsSessionsReadData; warnings: ApiProblem[]; }
export interface SettingsSupportAccessReadFilters { search: string | null; status: string[] | null; source: string[] | null; supportAccessFilter: string | number | boolean | null; }
export interface SettingsSupportAccessReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; supportAccessValue: string | number | boolean | null; }
export interface SettingsSupportAccessReadNextAction { type: 'supportAccess'; label: string; route: string | null; }
export interface SettingsSupportAccessReadResult { operationId: 'settings.support-access.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsSupportAccessReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsSupportAccessReadFilters | null; }
export interface SettingsSupportAccessReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; supportAccessResult: SettingsSupportAccessReadResult; }
export interface SettingsSupportAccessReadResponse { operationId: 'settings.support-access.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsSupportAccessReadData; warnings: ApiProblem[]; }
export interface SettingsWorkspaceProfileUpdateFilters { search: string | null; status: string[] | null; source: string[] | null; workspaceProfileUpdateFilter: string | number | boolean | null; }
export interface SettingsWorkspaceProfileUpdateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; workspaceProfileUpdateValue: string | number | boolean | null; }
export interface SettingsWorkspaceProfileUpdateNextAction { type: 'workspaceProfileUpdate'; label: string; route: string | null; }
export interface SettingsWorkspaceProfileUpdateResult { operationId: 'settings.workspace.profile.update'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsWorkspaceProfileUpdateRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: SettingsWorkspaceProfileUpdateInput; }
export interface SettingsWorkspaceProfileUpdateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: SettingsWorkspaceProfileUpdateNextAction | null; workspaceProfileUpdateResult: SettingsWorkspaceProfileUpdateResult; }
export interface SettingsWorkspaceProfileUpdateResponse { operationId: 'settings.workspace.profile.update'; correlationId: string; generatedAt: ISODateTime; data: SettingsWorkspaceProfileUpdateData; warnings: ApiProblem[]; }
export interface SettingsWorkspaceReadFilters { search: string | null; status: string[] | null; source: string[] | null; workspaceFilter: string | number | boolean | null; }
export interface SettingsWorkspaceReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; workspaceValue: string | number | boolean | null; }
export interface SettingsWorkspaceReadNextAction { type: 'workspace'; label: string; route: string | null; }
export interface SettingsWorkspaceReadResult { operationId: 'settings.workspace.read'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsWorkspaceReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: SettingsWorkspaceReadFilters | null; }
export interface SettingsWorkspaceReadData { records: SettingsRecord[]; pageInfo: PageInfo; summary: SettingsSummary; workspaceResult: SettingsWorkspaceReadResult; }
export interface SettingsWorkspaceReadResponse { operationId: 'settings.workspace.read'; correlationId: string; generatedAt: ISODateTime; data: SettingsWorkspaceReadData; warnings: ApiProblem[]; }
export interface SettingsWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface SettingsWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface SettingsWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface SettingsWriteResult { operationId: 'settings.write'; completedAt: ISODateTime; domain: 'settings'; }
export interface SettingsWriteRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: SettingsWriteInput; }
export interface SettingsWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: SettingsWriteNextAction | null; resultResult: SettingsWriteResult; }
export interface SettingsWriteResponse { operationId: 'settings.write'; correlationId: string; generatedAt: ISODateTime; data: SettingsWriteData; warnings: ApiProblem[]; }
export interface TrafficChannelsReadFilters { search: string | null; status: string[] | null; source: string[] | null; channelsFilter: string | number | boolean | null; }
export interface TrafficChannelsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; channelsValue: string | number | boolean | null; }
export interface TrafficChannelsReadNextAction { type: 'channels'; label: string; route: string | null; }
export interface TrafficChannelsReadResult { operationId: 'traffic.channels.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficChannelsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficChannelsReadFilters | null; }
export interface TrafficChannelsReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; channelsResult: TrafficChannelsReadResult; }
export interface TrafficChannelsReadResponse { operationId: 'traffic.channels.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficChannelsReadData; warnings: ApiProblem[]; }
export interface TrafficDropDiagnoseFilters { search: string | null; status: string[] | null; source: string[] | null; dropDiagnoseFilter: string | number | boolean | null; }
export interface TrafficDropDiagnoseInput { requestedBy: UUID; effectiveAt: ISODateTime | null; dropDiagnoseValue: string | number | boolean | null; }
export interface TrafficDropDiagnoseNextAction { type: 'dropDiagnose'; label: string; route: string | null; }
export interface TrafficDropDiagnoseResult { operationId: 'traffic.drop.diagnose'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficDropDiagnoseRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficDropDiagnoseFilters | null; }
export interface TrafficDropDiagnoseData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; dropDiagnoseResult: TrafficDropDiagnoseResult; }
export interface TrafficDropDiagnoseResponse { operationId: 'traffic.drop.diagnose'; correlationId: string; generatedAt: ISODateTime; data: TrafficDropDiagnoseData; warnings: ApiProblem[]; }
export interface TrafficEventQualityReadFilters { search: string | null; status: string[] | null; source: string[] | null; eventQualityFilter: string | number | boolean | null; }
export interface TrafficEventQualityReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; eventQualityValue: string | number | boolean | null; }
export interface TrafficEventQualityReadNextAction { type: 'eventQuality'; label: string; route: string | null; }
export interface TrafficEventQualityReadResult { operationId: 'traffic.event-quality.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficEventQualityReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficEventQualityReadFilters | null; }
export interface TrafficEventQualityReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; diagnostics: DiagnosticFinding[]; eventQualityResult: TrafficEventQualityReadResult; }
export interface TrafficEventQualityReadResponse { operationId: 'traffic.event-quality.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficEventQualityReadData; warnings: ApiProblem[]; }
export interface TrafficFunnelDefinitionsReadFilters { search: string | null; status: string[] | null; source: string[] | null; funnelDefinitionsFilter: string | number | boolean | null; }
export interface TrafficFunnelDefinitionsReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; funnelDefinitionsValue: string | number | boolean | null; }
export interface TrafficFunnelDefinitionsReadNextAction { type: 'funnelDefinitions'; label: string; route: string | null; }
export interface TrafficFunnelDefinitionsReadResult { operationId: 'traffic.funnel-definitions.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficFunnelDefinitionsReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficFunnelDefinitionsReadFilters | null; }
export interface TrafficFunnelDefinitionsReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; steps: FunnelStepView[]; funnelDefinitionsResult: TrafficFunnelDefinitionsReadResult; }
export interface TrafficFunnelDefinitionsReadResponse { operationId: 'traffic.funnel-definitions.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficFunnelDefinitionsReadData; warnings: ApiProblem[]; }
export interface TrafficFunnelStepReadFilters { search: string | null; status: string[] | null; source: string[] | null; funnelStepFilter: string | number | boolean | null; }
export interface TrafficFunnelStepReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; funnelStepValue: string | number | boolean | null; }
export interface TrafficFunnelStepReadNextAction { type: 'funnelStep'; label: string; route: string | null; }
export interface TrafficFunnelStepReadResult { operationId: 'traffic.funnel-step.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficFunnelStepReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficFunnelStepReadFilters | null; }
export interface TrafficFunnelStepReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; steps: FunnelStepView[]; funnelStepResult: TrafficFunnelStepReadResult; }
export interface TrafficFunnelStepReadResponse { operationId: 'traffic.funnel-step.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficFunnelStepReadData; warnings: ApiProblem[]; }
export interface TrafficFunnelReadFilters { search: string | null; status: string[] | null; source: string[] | null; funnelFilter: string | number | boolean | null; }
export interface TrafficFunnelReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; funnelValue: string | number | boolean | null; }
export interface TrafficFunnelReadNextAction { type: 'funnel'; label: string; route: string | null; }
export interface TrafficFunnelReadResult { operationId: 'traffic.funnel.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficFunnelReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficFunnelReadFilters | null; }
export interface TrafficFunnelReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; steps: FunnelStepView[]; funnelResult: TrafficFunnelReadResult; }
export interface TrafficFunnelReadResponse { operationId: 'traffic.funnel.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficFunnelReadData; warnings: ApiProblem[]; }
export interface TrafficGa4OrdersReadFilters { search: string | null; status: string[] | null; source: string[] | null; ga4OrdersFilter: string | number | boolean | null; }
export interface TrafficGa4OrdersReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; ga4OrdersValue: string | number | boolean | null; }
export interface TrafficGa4OrdersReadNextAction { type: 'ga4Orders'; label: string; route: string | null; }
export interface TrafficGa4OrdersReadResult { operationId: 'traffic.ga4-orders.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficGa4OrdersReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficGa4OrdersReadFilters | null; }
export interface TrafficGa4OrdersReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; ga4OrdersResult: TrafficGa4OrdersReadResult; }
export interface TrafficGa4OrdersReadResponse { operationId: 'traffic.ga4-orders.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficGa4OrdersReadData; warnings: ApiProblem[]; }
export interface TrafficLandingPagesReadFilters { search: string | null; status: string[] | null; source: string[] | null; landingPagesFilter: string | number | boolean | null; }
export interface TrafficLandingPagesReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; landingPagesValue: string | number | boolean | null; }
export interface TrafficLandingPagesReadNextAction { type: 'landingPages'; label: string; route: string | null; }
export interface TrafficLandingPagesReadResult { operationId: 'traffic.landing-pages.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficLandingPagesReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficLandingPagesReadFilters | null; }
export interface TrafficLandingPagesReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; landingPagesResult: TrafficLandingPagesReadResult; }
export interface TrafficLandingPagesReadResponse { operationId: 'traffic.landing-pages.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficLandingPagesReadData; warnings: ApiProblem[]; }
export interface TrafficOverviewReadFilters { search: string | null; status: string[] | null; source: string[] | null; overviewFilter: string | number | boolean | null; }
export interface TrafficOverviewReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; overviewValue: string | number | boolean | null; }
export interface TrafficOverviewReadNextAction { type: 'overview'; label: string; route: string | null; }
export interface TrafficOverviewReadResult { operationId: 'traffic.overview.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficOverviewReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficOverviewReadFilters | null; }
export interface TrafficOverviewReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; overviewResult: TrafficOverviewReadResult; }
export interface TrafficOverviewReadResponse { operationId: 'traffic.overview.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficOverviewReadData; warnings: ApiProblem[]; }
export interface TrafficReadFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface TrafficReadInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface TrafficReadNextAction { type: 'result'; label: string; route: string | null; }
export interface TrafficReadResult { operationId: 'traffic.read'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficReadRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; filters: TrafficReadFilters | null; }
export interface TrafficReadData { records: TrafficRecord[]; pageInfo: PageInfo; summary: TrafficSummary; resultResult: TrafficReadResult; }
export interface TrafficReadResponse { operationId: 'traffic.read'; correlationId: string; generatedAt: ISODateTime; data: TrafficReadData; warnings: ApiProblem[]; }
export interface TrafficWriteFilters { search: string | null; status: string[] | null; source: string[] | null; resultFilter: string | number | boolean | null; }
export interface TrafficWriteInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resultValue: string | number | boolean | null; }
export interface TrafficWriteNextAction { type: 'result'; label: string; route: string | null; }
export interface TrafficWriteResult { operationId: 'traffic.write'; completedAt: ISODateTime; domain: 'traffic'; }
export interface TrafficWriteRequest { context: ApiContext; metadata: MutationMetadata; resourceId: UUID | string | null; input: TrafficWriteInput; }
export interface TrafficWriteData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: TrafficWriteNextAction | null; resultResult: TrafficWriteResult; }
export interface TrafficWriteResponse { operationId: 'traffic.write'; correlationId: string; generatedAt: ISODateTime; data: TrafficWriteData; warnings: ApiProblem[]; }
export interface WorkspaceOnboardingUpdateFilters { search: string | null; status: string[] | null; source: string[] | null; onboardingUpdateFilter: string | number | boolean | null; }
export interface WorkspaceOnboardingUpdateInput { requestedBy: UUID; effectiveAt: ISODateTime | null; onboardingUpdateValue: string | number | boolean | null; }
export interface WorkspaceOnboardingUpdateNextAction { type: 'onboardingUpdate'; label: string; route: string | null; }
export interface WorkspaceOnboardingUpdateResult { operationId: 'workspace.onboarding.update'; completedAt: ISODateTime; domain: 'workspace'; }
export interface WorkspaceOnboardingUpdateRequest { context: ApiContext; metadata: MutationMetadata; workspaceId: UUID | string | null; input: WorkspaceOnboardingUpdateInput; }
export interface WorkspaceOnboardingUpdateData { outcomeId: UUID; status: CommandStatus; changedResourceIds: UUID[]; nextAction: WorkspaceOnboardingUpdateNextAction | null; onboardingUpdateResult: WorkspaceOnboardingUpdateResult; }
export interface WorkspaceOnboardingUpdateResponse { operationId: 'workspace.onboarding.update'; correlationId: string; generatedAt: ISODateTime; data: WorkspaceOnboardingUpdateData; warnings: ApiProblem[]; }
export interface WorkspaceResolveFilters { search: string | null; status: string[] | null; source: string[] | null; resolveFilter: string | number | boolean | null; }
export interface WorkspaceResolveInput { requestedBy: UUID; effectiveAt: ISODateTime | null; resolveValue: string | number | boolean | null; }
export interface WorkspaceResolveNextAction { type: 'resolve'; label: string; route: string | null; }
export interface WorkspaceResolveResult { operationId: 'workspace.resolve'; completedAt: ISODateTime; domain: 'workspace'; }
export interface WorkspaceResolveRequest { context: ApiContext; dateRange: DateRangeRequest | null; page: PageRequest | null; workspaceId: UUID | string; filters: WorkspaceResolveFilters | null; }
export interface WorkspaceResolveData { records: WorkspaceRecord[]; pageInfo: PageInfo; summary: WorkspaceSummary; resolveResult: WorkspaceResolveResult; }
export interface WorkspaceResolveResponse { operationId: 'workspace.resolve'; correlationId: string; generatedAt: ISODateTime; data: WorkspaceResolveData; warnings: ApiProblem[]; }
