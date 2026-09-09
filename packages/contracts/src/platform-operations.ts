/** ZIP 3 contracts: persisted configuration is distinct from provider execution. */
export type SettingSection = 'profile' | 'organization' | 'workspace' | 'analytics' | 'notifications';
export type SettingScope = 'self' | 'tenant' | 'workspace';
export type SettingValues = Readonly<Record<string, string | number | boolean>>;
export type SettingDocument = {
  section: SettingSection; scope: SettingScope; version: number;
  values: SettingValues; updatedAt: string | null; canEdit: boolean;
};
export type SettingsOverview = {
  version: 'settings.operations.v1'; documents: readonly SettingDocument[];
  user: { id: string; name: string; email: string; mfaEnabled: boolean };
  tenantName: string; workspaceName: string;
};
export type SettingCommand = { requestId: string; expectedVersion: number; values: SettingValues };
export type TeamMember = { id: string; userId: string; name: string; email: string; role: string; status: string; scope: string; version: number; mfaEnabled: boolean };
export type TeamInvitation = { id: string; email: string; role: string; status: string; expiresAt: string; createdAt: string };
export type TeamOverview = { members: readonly TeamMember[]; invitations: readonly TeamInvitation[]; canManage: boolean; currentUserId: string };
export type MemberCommand = { requestId: string; expectedVersion: number; action: 'role' | 'revoke'; role?: string; reason: string };
export const assignableTeamRoles = ['Workspace Admin','Analyst','Marketing Operator','Viewer','Billing Admin','Auditor/Security'] as const;
export type IntegrationScope = { connectionId: string; version: number; streams: readonly string[]; supportedStreams: readonly string[]; updatedAt: string | null };
export type IntegrationScopeCommand = { requestId: string; expectedVersion: number; streams: readonly string[]; reason: string };
export type QualityDataset = { connectionId: string; provider: string; stream: string; sourceRecords: number; canonicalRecords: number; lastIngestedAt: string | null; lastBusinessAt: string | null; failedBatches: number };
export type QualityRun = { id: string; connectionId: string; status: string; createdAt: string; details: unknown };
export type QualityReview = { id: string; connectionId: string; stream: string; disposition: 'investigating' | 'accepted_limitation' | 'resolved'; note: string; updatedAt: string; version: number };
export type QualityOverview = { version: 'quality.operations.v1'; datasets: readonly QualityDataset[]; runs: readonly QualityRun[]; reviews: readonly QualityReview[]; measuredAt: string; truncated: boolean };
export type QualityReviewCommand = { requestId: string; expectedVersion: number; connectionId: string; stream: string; disposition: QualityReview['disposition']; note: string };
export type QualityLineage = { sourceId: string; canonicalId: string | null; externalId: string; businessAt: string | null; ingestedAt: string; schemaVersion: string; batchId: string; checksum: string | null };
export type PlatformPrivacyRequest = { id: string; kind: string; status: string; subject: string; requestedAt: string; dueAt: string; completedAt: string | null; legalHold: boolean; targets: readonly { system: string; status: string; errorCode: string | null }[] };
export type BillingCycle = 'monthly' | 'annual';
export type BillingOffer = { plan: 'starter' | 'growth' | 'scale'; name: string; cycle: BillingCycle; priceId: string; currency: string; unitAmount: number; interval: string; intervalCount: number; taxBehavior: string };
// PaymentMethodType/KsefInvoiceStatus/KsefInvoiceReference mirror contracts/billing-compliance.ts
// (root -- the UI-facing design contract used only by apps/web, see that file's own copies of
// these shapes) the same way BillingCycle above already does. They are kept in sync manually
// rather than imported, because packages/integrations (the only backend consumer) has
// tsconfig rootDir:'src' with a composite build, which cannot include a file outside its own
// src tree -- confirmed with `tsc -b`: TS6059 ("File ... is not under 'rootDir'") plus TS6307.
export type PaymentMethodType = 'card' | 'blik' | 'blik_recurring' | 'fast_bank_transfer' | 'traditional_bank_transfer' | 'apple_pay' | 'google_pay';
export type KsefInvoiceStatus = 'draft' | 'ready_for_ksef' | 'submitted' | 'accepted' | 'rejected' | 'offline_pending' | 'correction_required';
export type KsefInvoiceReference = { readonly localInvoiceId: string; readonly ksefNumber: string | null; readonly status: KsefInvoiceStatus; readonly schemaVersion: string; readonly submittedAt: string | null; readonly acceptedAt: string | null; readonly upoReference: string | null };
export type BillingInvoiceView = { id: string; number: string | null; currency: string; total: number; due: number; status: string; createdAt: string; dueAt: string | null; pdfUrl: string | null; paymentUrl: string | null; ksefStatus: 'not_connected' | KsefInvoiceStatus };
// One row per PaymentMethodType, reported by BillingOperationsService.read() so the UI (and
// tests) can see, per method, whether it is merely turned on in env config (`enabledByConfig`)
// versus actually sent to Stripe for the live checkout (`wiredToCheckout`) -- see
// resolveStripeCheckoutPaymentMethods in @papadata/integrations for how these are computed.
export type BillingPaymentMethodStatus = { readonly method: PaymentMethodType; readonly enabledByConfig: boolean; readonly wiredToCheckout: boolean; readonly note: string };
export type BillingOverview = {
 version: 'billing.operations.v1'; mode: 'disabled' | 'test' | 'live'; canManage: boolean;
 subscription: { plan: string; status: string; customerConfigured: boolean; subscriptionConfigured: boolean; currentPeriodEnd: string | null; providerStatus: string | null; cancelAtPeriodEnd: boolean | null; providerCheckedAt: string | null };
 usage: { connectedSources: number; maxSources: number }; offers: readonly BillingOffer[];
 invoices: readonly BillingInvoiceView[]; invoicesHasMore: boolean; invoiceCursor: string | null;
 pendingCheckout: {requestId:string;offerId:string;expiresAt:string}|null; portalEnabled: boolean; limitations: readonly string[];
 // Optional: absent only means an older caller hasn't been updated to populate it (e.g. a
 // fixture); never treat absence as "no payment methods are configured."
 paymentMethods?: readonly BillingPaymentMethodStatus[];
};
export type BillingSessionCommand = { requestId: string; action: 'checkout' | 'portal'; offerId?: string };
export type BillingSessionResult = { url: string; mode: 'test' | 'live'; action: 'checkout' | 'portal'; status: 'requires_provider_confirmation' };
export const settingSections: readonly SettingSection[] = ['profile','organization','workspace','analytics','notifications'];
export function isSettingSection(value: string): value is SettingSection { return (settingSections as readonly string[]).includes(value); }
export function settingScope(section: SettingSection): SettingScope { return section === 'profile' || section === 'notifications' ? 'self' : section === 'organization' ? 'tenant' : 'workspace'; }

export type SettingsAuditEvent = { id:string; sequence:string; action:string; outcome:string; actor:string; resource:string; resourceId:string|null; createdAt:string; correlationId:string };
export type SettingsAuditPage = { events:readonly SettingsAuditEvent[]; hasMore:boolean; nextCursor:string|null; chainVerified:false };
export type PrivacyCreateCommand = { requestId:string; subjectReference:string; requestType:'export'|'deletion' };

export type IntegrationProvisionCommand = {requestId:string; provider:import('./index.js').MvpIntegrationCatalogProviderId; displayName:string; streams:readonly string[]; material:Readonly<Record<string,string>>; connectionId?:string; expectedVersion:number};
export type IntegrationProvisionResult = {connectionId:string; status:'active'; credentialVersion:number; synchronizationStarted:false};
export type IntegrationProvisionCapabilities = {enabled:boolean; reason:string; storage:'gcp_secret_manager'; transport:'https_required'; automaticOAuth:false};
