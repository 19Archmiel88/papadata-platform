import type {
  DateRange,
} from '../../../../../contracts/ui-contract-types';

export type BffSessionMembership = {
  readonly tenantId: string;
  readonly tenantName?: string;
  readonly workspaceId: string;
  readonly workspaceName?: string;
  readonly capabilities: readonly string[];
  readonly roles: readonly string[];
};

export type BffSession = {
  readonly activeTenantId: string;
  readonly activeWorkspaceId: string;
  readonly authLevel: string;
  readonly capabilities: readonly string[];
  readonly expiresAt: string;
  readonly memberships: readonly BffSessionMembership[];
  readonly sessionId: string;
  readonly user?: AuthenticatedUser;
  readonly userId: string;
};

export type AuthenticatedUser = {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;
};

export type AuthenticationResult = {
  readonly session: BffSession;
  readonly user: AuthenticatedUser;
};

export type OAuthProviderId = 'google' | 'microsoft';

export type OAuthAvailability = {
  readonly google: 'available' | 'configuration_required';
  readonly microsoft: 'available' | 'configuration_required';
};

export type OAuthStartResult = {
  readonly redirectUrl: string;
  readonly state: string;
};

// Every variant carries `returnTo` — the callback URL only ever has
// code/state, so this is the only way this landing page learns where the
// flow was supposed to continue afterward, success or not.
export type OAuthCallbackResult = (
  | {
      readonly outcome: 'authenticated';
      readonly session: BffSession;
      readonly user: AuthenticatedUser;
    }
  | { readonly outcome: 'linked'; readonly provider: OAuthProviderId | null }
  | {
      readonly outcome: 'reauth_confirmed';
      readonly session: BffSession;
      readonly stepUpExpiresAt: string;
    }
  | { readonly outcome: 'no_linked_account'; readonly email?: string }
  | { readonly outcome: 'email_already_registered'; readonly email?: string }
  | { readonly outcome: 'invitation_invalid' }
) & { readonly returnTo: string | null };

export type BffNotification = {
  readonly createdAt: string;
  readonly id: string;
  readonly message: string;
  readonly priority: string;
  readonly readAt: string | null;
  readonly resource: {
    readonly id: string | null;
    readonly type: string;
  };
  readonly snoozedUntil: string | null;
  readonly status: 'read' | 'unread';
  readonly title: string;
  readonly type: string;
  readonly updatedAt: string;
};

export type BffNotificationList = {
  readonly notifications: readonly BffNotification[];
  readonly unreadCount: number;
  readonly view: 'active' | 'all' | 'snoozed';
};

export type BffIntegrationJob = Readonly<Record<string, unknown>>;
export type BffIntegrationProviderTestResult = Readonly<Record<string, unknown>>;

export type PapaAnswerEvidence = {
  readonly evidenceId: string;
  readonly source: string;
  readonly collectedAt: string;
  readonly confidence: number;
};

export type PapaAnswerRecord = {
  readonly messageId: string;
  readonly content: string;
  readonly confidence: number | null;
  readonly evidence: readonly PapaAnswerEvidence[];
  readonly actionId: string | null;
  readonly status: 'blocked' | 'completed' | 'ready';
  readonly riskLevel: 'critical' | 'high' | 'low' | 'medium';
  readonly approvalRequired: boolean;
  readonly role: 'assistant' | 'system' | 'user';
  readonly createdAt: string;
  readonly limitations: readonly string[];
};

export type PapaAnswerSummary = {
  readonly total: number;
  readonly ready: number;
  readonly warning: number;
  readonly critical: number;
  readonly updatedAt: string;
};

export type PapaReportDefinitionRow = {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: 'private' | 'tenant' | 'workspace';
  readonly status: 'archived' | 'draft' | 'ready';
  readonly currentVersion: number;
  readonly chartTypes: readonly unknown[];
  readonly metricSelection: readonly unknown[];
  readonly layout: readonly unknown[];
  readonly filters: Readonly<Record<string, unknown>>;
  readonly dateRange: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type PapaReportDefinitionReadRuntimeData = {
  readonly reports: readonly PapaReportDefinitionRow[];
  readonly exports: readonly Readonly<Record<string, unknown>>[];
  readonly schedules: readonly Readonly<Record<string, unknown>>[];
  readonly pageInfo: { readonly nextCursor: string | null; readonly total: number };
  readonly summary: Readonly<Record<string, unknown>>;
};

export type PapaReportDefinitionUpsertInput = {
  /**
   * Must be a stable key per draft (not regenerated on every save) — the
   * backend upserts on (tenant, workspace, idempotencyKey), so reusing the
   * same key is what turns a repeated "Zapisz" into an update instead of a
   * new row.
   */
  readonly idempotencyKey: string;
  readonly name: string;
  readonly description?: string | null;
  readonly visibility?: 'private' | 'tenant' | 'workspace';
  readonly chartTypes: readonly unknown[];
  readonly metricSelection: readonly unknown[];
  readonly layout: readonly unknown[];
  readonly filters?: Readonly<Record<string, unknown>>;
  readonly dateRange?: Readonly<Record<string, unknown>>;
  readonly status?: 'archived' | 'draft' | 'ready';
  readonly caseId?: string | null;
};

export type PapaReportExportRow = {
  readonly id: string;
  readonly reportDefinitionId: string | null;
  readonly format: 'csv' | 'pdf' | 'xlsx';
  readonly status: string;
  readonly createdAt: string;
};

export type PapaReportScheduleRow = {
  readonly id: string;
  readonly reportDefinitionId: string;
  readonly cadence: string;
  readonly status: string;
};

export type PapaContextCaptureResult = {
  readonly conversationId: string;
  readonly snapshotId: string;
};

export type PapaAnswerGenerateResult = {
  readonly conversationId: string;
  readonly caseThreadId: string | null;
  readonly messageId: string;
  readonly record: PapaAnswerRecord;
};

export type BffReportRecord = {
  readonly id: string;
  readonly report_type: string;
  readonly format: 'csv' | 'json' | 'pdf' | 'xlsx';
  readonly status: 'queued' | 'generating' | 'ready' | 'failed' | 'expired' | 'cancelled';
  readonly date_from: string;
  readonly date_to: string;
  readonly filters: Readonly<Record<string, unknown>>;
  readonly object_key: string | null;
  readonly checksum_sha256: string | null;
  readonly size_bytes: number | null;
  readonly content_type: string | null;
  readonly error_code: string | null;
  readonly created_at: string;
  readonly ready_at: string | null;
  readonly expires_at: string | null;
};

export type InvitationPreview = {
  readonly accepted: boolean;
  readonly email?: string;
  readonly existingIdentity?: boolean;
  readonly role?: string;
  readonly status: string;
  readonly tenantName?: string;
  readonly workspaceName?: string;
};

export type RegisterInput = {
  readonly displayName?: string;
  readonly email: string;
  readonly fullName?: string;
  readonly organizationName: string;
  readonly password: string;
  readonly workspaceName: string;
};

type ErrorPayload = {
  readonly error?: {
    readonly code?: unknown;
    readonly message?: unknown;
  };
};

export class BffProblem extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'BffProblem';
    this.status = status;
    this.code = code;
  }
}

class BffClient {
  private csrfToken: string | null = null;
  private readonly baseUrl: string;

  constructor(baseUrl = import.meta.env.VITE_BFF_BASE_URL?.trim() ?? '') {
    this.baseUrl = baseUrl.replace(/\/+$/u, '');
  }

  async readSession(): Promise<BffSession | null> {
    try {
      const response = await this.fetch('/api/v1/auth/session', { method: 'GET' });
      const localSession = readLocalClientSession();
      if (response.status === 401 || response.status === 403) {
        return localSession;
      }
      const payload = await readJson<{ readonly data: BffSession }>(response);
      assertOk(response, payload);
      return payload.data;
    } catch (cause) {
      const localSession = readLocalClientSession();
      if (canUseLocalAuthFallback(cause) || localSession) {
        return localSession;
      }
      throw cause;
    }
  }

  async login(input: {
    readonly email: string;
    readonly password: string;
    readonly rememberDevice?: boolean;
  }): Promise<AuthenticationResult> {
    this.csrfToken = null;
    try {
      return await this.authenticate('/api/v1/auth/login', input);
    } catch (cause) {
      if (canUseLocalAuthFallback(cause)) {
        return loginWithLocalClient(input);
      }
      throw cause;
    }
  }

  async register(input: RegisterInput): Promise<AuthenticationResult> {
    this.csrfToken = null;
    const body = normalizeRegistrationInput(input);
    try {
      return await this.authenticate('/api/v1/auth/register/email', body);
    } catch (cause) {
      if (canUseLocalAuthFallback(cause)) {
        return registerWithLocalClient(body);
      }
      throw cause;
    }
  }

  async confirmMfa(input: {
    readonly code: string;
  }): Promise<{
    readonly session: BffSession;
    readonly verified: boolean;
  }> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch('/api/v1/auth/mfa/confirm', {
      method: 'POST',
      headers: {
        'x-papadata-csrf': csrfToken,
      },
      body: JSON.stringify(input),
    });
    const payload = await readJson<{
      readonly data: {
        readonly session: BffSession;
        readonly verified: boolean;
      };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async stepUp(input: {
    readonly code: string;
    readonly operationScope: string;
  }): Promise<{
    readonly session: BffSession;
    readonly stepUpExpiresAt: string;
  }> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch('/api/v1/auth/step-up', {
      method: 'POST',
      headers: {
        'x-papadata-csrf': csrfToken,
      },
      body: JSON.stringify(input),
    });
    const payload = await readJson<{
      readonly data: {
        readonly session: BffSession;
        readonly stepUpExpiresAt: string;
      };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async enrollMfa(input: {
    readonly accountName: string;
  }): Promise<{
    readonly otpauthUri: string;
    readonly recoveryCodes: readonly string[];
    readonly secret: string;
  }> {
    // Unlike every other authenticated command, this one is proxied
    // generically (ProxyController's catch-all, apps/bff/src/proxy.controller.ts)
    // straight to SecurityController.enroll() -- a hand-written controller
    // that returns its object directly, not wrapped in the generated
    // contract runtime's { data: ... } envelope. Confirmed against the real
    // running response (apps/worker/scripts/verify-invitations-flow.ts) --
    // authenticatedCommand()'s payload.data would be undefined here.
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch('/api/v1/security/mfa/enroll', {
      method: 'POST',
      headers: {
        'idempotency-key': createCorrelationId(),
        'x-papadata-csrf': csrfToken,
      },
      body: JSON.stringify(input),
    });
    const payload = await readJson<{
      readonly otpauthUri: string;
      readonly recoveryCodes: readonly string[];
      readonly secret: string;
    }>(response);
    assertOk(response, payload);
    return payload;
  }

  async inviteMember(input: {
    readonly email: string;
    readonly role: string;
  }): Promise<{
    readonly email: string;
    readonly expiresAt: string;
    readonly invitationId: string;
    readonly role: string;
    readonly token: string;
  }> {
    return this.authenticatedCommand('/api/v1/auth/invitations/request', input);
  }

  async revokeInvitation(invitationId: string): Promise<{
    readonly invitationId: string;
    readonly status: string;
  }> {
    return this.authenticatedCommand('/api/v1/invitation/reject', { invitationId });
  }

  async validateInvitation(input: {
    readonly invitationId: string;
    readonly token: string;
  }): Promise<InvitationPreview> {
    const response = await this.fetch('/api/v1/auth/invitations/validate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const payload = await readJson<{ readonly data: InvitationPreview }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async acceptInvitation(input: {
    readonly displayName: string;
    readonly invitationId: string;
    readonly password: string;
    readonly token: string;
  }): Promise<{
    readonly accepted: boolean;
    readonly email?: string;
  }> {
    const response = await this.fetch('/api/v1/auth/invitations/accept', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const payload = await readJson<{
      readonly data: { readonly accepted: boolean; readonly email?: string };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async requestPasswordRecovery(input: {
    readonly email: string;
  }): Promise<void> {
    await this.publicCommand(
      '/api/v1/auth/password/recovery/request',
      input,
    );
  }

  async resetPassword(input: {
    readonly email: string;
    readonly newPassword: string;
    readonly otp: string;
    readonly resetToken: string;
  }): Promise<void> {
    await this.publicCommand('/api/v1/auth/password/reset', input);
  }

  async readAuthStatus(): Promise<{ readonly oauth: OAuthAvailability }> {
    const response = await this.fetch('/api/v1/auth/status', { method: 'GET' });
    const payload = await readJson<{
      readonly data: { readonly oauth: OAuthAvailability };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async startOAuth(input: {
    readonly provider: OAuthProviderId;
    readonly intent: 'login' | 'register' | 'accept_invitation';
    readonly invitationId?: string;
    readonly invitationToken?: string;
    readonly returnTo?: string;
  }): Promise<OAuthStartResult> {
    const response = await this.fetch('/api/v1/auth/oauth/start', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const payload = await readJson<{ readonly data: OAuthStartResult }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async linkOAuthAccount(input: {
    readonly provider: OAuthProviderId;
    readonly returnTo?: string;
  }): Promise<OAuthStartResult> {
    return this.authenticatedCommand<OAuthStartResult>(
      '/api/v1/auth/oauth/link/start',
      input,
    );
  }

  async startOAuthReauth(input: {
    readonly provider: OAuthProviderId;
    readonly returnTo?: string;
  }): Promise<OAuthStartResult> {
    return this.authenticatedCommand<OAuthStartResult>(
      '/api/v1/auth/oauth/reauth/start',
      input,
    );
  }

  // No `provider` here on purpose: the backend recovers it from the
  // consumed OAuth transaction row keyed by `state`, so the callback URL
  // (which the provider controls) never needs to carry it either.
  async completeOAuthCallback(input: {
    readonly code: string;
    readonly state: string;
  }): Promise<OAuthCallbackResult> {
    const response = await this.fetch('/api/v1/auth/oauth/callback', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    const payload = await readJson<{ readonly data: OAuthCallbackResult }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async logout(): Promise<void> {
    const hadLocalSession = Boolean(readLocalClientSession());
    try {
      const csrfToken = await this.getCsrfToken();
      const response = await this.fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'x-papadata-csrf': csrfToken,
        },
      });
      const payload = await readJson<unknown>(response);
      assertOk(response, payload);
    } catch (cause) {
      if (!hadLocalSession || !canUseLocalAuthFallback(cause)) {
        throw cause;
      }
    } finally {
      clearLocalClientSession();
      this.csrfToken = null;
    }
  }

  async probeProtectedApi(): Promise<{
    readonly ok: boolean;
    readonly status: number;
    readonly requestId: string | null;
  }> {
    const response = await this.fetch('/api/v1/integrations/providers', {
      method: 'GET',
    });
    return {
      ok: response.ok,
      status: response.status,
      requestId: response.headers.get('x-request-id'),
    };
  }

  async readDomainScreen<TData>(
    path: `/api/v1/${string}`,
    options: {
      readonly dateRange?: DateRange | null;
    } = {},
  ): Promise<TData> {
    const response = await this.fetch(withDateRangeQuery(
      path,
      options.dateRange ?? null,
    ), {
      method: 'GET',
    });
    const payload = await readJson<{
      readonly data: TData;
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async selectWorkspace(workspaceId: string): Promise<BffSession> {
    try {
      const session = await this.authenticatedCommand<BffSession>(
        '/api/v1/access/workspace/select',
        { workspaceId },
      );
      return session;
    } catch (cause) {
      const localSession = readLocalClientSession();
      if (!localSession || !canUseLocalAuthFallback(cause)) {
        throw cause;
      }
      const membership = localSession.memberships.find((item) => (
        item.workspaceId === workspaceId
      ));
      if (!membership) {
        throw new BffProblem(403, 'WORKSPACE_NOT_AVAILABLE', 'Workspace nie jest dostępny dla tej sesji.');
      }
      const nextSession: BffSession = {
        ...localSession,
        activeTenantId: membership.tenantId,
        activeWorkspaceId: membership.workspaceId,
        capabilities: membership.capabilities,
      };
      const state = readLocalClientState();
      writeLocalClientState({ accounts: state.accounts, session: nextSession });
      return nextSession;
    }
  }

  async readNotifications(
    view: 'active' | 'all' | 'snoozed' = 'active',
  ): Promise<BffNotificationList> {
    const response = await this.fetch(`/api/v1/notifications?view=${encodeURIComponent(view)}`, {
      method: 'GET',
    });
    const payload = await readJson<{ readonly data: BffNotificationList }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    await this.authenticatedCommand(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`);
  }

  async markNotificationUnread(notificationId: string): Promise<void> {
    await this.authenticatedCommand(`/api/v1/notifications/${encodeURIComponent(notificationId)}/unread`);
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.authenticatedCommand('/api/v1/notifications/read-all');
  }

  async snoozeNotification(notificationId: string, until: string): Promise<void> {
    await this.authenticatedCommand(
      `/api/v1/notifications/${encodeURIComponent(notificationId)}/snooze`,
      { until },
    );
  }

  async unsnoozeNotification(notificationId: string): Promise<void> {
    await this.authenticatedCommand(`/api/v1/notifications/${encodeURIComponent(notificationId)}/unsnooze`);
  }

  async capturePapaContext(input: {
    readonly captureReason: string;
    readonly conversationId: string | null;
    readonly parentConversationId: string | null;
    readonly snapshot: Readonly<Record<string, unknown>>;
    readonly title: string;
    readonly idempotencyKey?: string;
  }): Promise<PapaContextCaptureResult> {
    const { idempotencyKey, ...body } = input;
    const data = await this.authenticatedCommand<{
      readonly contextCaptureResult: PapaContextCaptureResult;
    }>('/api/v1/papa/context/capture', body, { idempotencyKey });
    return data.contextCaptureResult;
  }

  async generatePapaAnswer(input: {
    readonly caseThreadId: string | null;
    readonly conversationId: string | null;
    readonly parentConversationId: string | null;
    readonly prompt: string;
    readonly idempotencyKey?: string;
  }): Promise<PapaAnswerGenerateResult> {
    const { idempotencyKey, ...body } = input;
    const data = await this.authenticatedCommand<{
      readonly answerGenerateResult: {
        readonly caseThreadId: string | null;
        readonly conversationId: string;
        readonly messageId: string;
      };
      readonly record: PapaAnswerRecord;
    }>('/api/v1/papa/answer', body, { idempotencyKey });
    return {
      caseThreadId: data.answerGenerateResult.caseThreadId,
      conversationId: data.answerGenerateResult.conversationId,
      messageId: data.answerGenerateResult.messageId,
      record: data.record,
    };
  }

  async readPapaAnswers(conversationId: string): Promise<{
    readonly records: readonly PapaAnswerRecord[];
    readonly summary: PapaAnswerSummary;
  }> {
    return this.readDomainScreen(
      `/api/v1/papa/odpowiedz-papa?conversationId=${encodeURIComponent(conversationId)}`,
    );
  }

  async readPapaLab<TData = unknown>(input: {
    readonly caseThreadId?: string | null;
    readonly conversationId?: string | null;
    readonly limit?: number | null;
  } = {}): Promise<TData> {
    const search = new URLSearchParams();
    if (input.caseThreadId) search.set('caseThreadId', input.caseThreadId);
    if (input.conversationId) search.set('conversationId', input.conversationId);
    if (input.limit !== undefined && input.limit !== null) {
      search.set('limit', String(input.limit));
    }
    const query = search.toString();
    return this.readDomainScreen<TData>(
      `/api/v1/papa/laboratorium-ai${query ? `?${query}` : ''}` as `/api/v1/${string}`,
    );
  }

  async readPapaGovernance<TData = unknown>(): Promise<TData> {
    return this.readDomainScreen<TData>('/api/v1/papa/ustawienia-ai-i-governance');
  }

  async readPapaReportDefinitions(input: {
    readonly caseId?: string | null;
    readonly limit?: number | null;
  } = {}): Promise<PapaReportDefinitionReadRuntimeData> {
    const search = new URLSearchParams();
    if (input.caseId) search.set('caseId', input.caseId);
    if (input.limit !== undefined && input.limit !== null) {
      search.set('limit', String(input.limit));
    }
    const query = search.toString();
    return this.readDomainScreen<PapaReportDefinitionReadRuntimeData>(
      `/api/v1/papa/report-definitions${query ? `?${query}` : ''}` as `/api/v1/${string}`,
    );
  }

  async upsertPapaReportDefinition(
    input: PapaReportDefinitionUpsertInput,
  ): Promise<PapaReportDefinitionRow> {
    const { idempotencyKey, ...body } = input;
    const data = await this.authenticatedCommand<{ readonly record: PapaReportDefinitionRow }>(
      '/api/v1/papa/report-definitions',
      body,
      { idempotencyKey },
    );
    return data.record;
  }

  async duplicatePapaReportDefinition(input: {
    readonly reportDefinitionId: string;
    readonly idempotencyKey: string;
  }): Promise<PapaReportDefinitionRow> {
    const data = await this.authenticatedCommand<{ readonly record: PapaReportDefinitionRow }>(
      '/api/v1/papa/report-definitions/duplicate',
      { reportDefinitionId: input.reportDefinitionId },
      { idempotencyKey: input.idempotencyKey },
    );
    return data.record;
  }

  async createPapaReportExport(input: {
    readonly reportDefinitionId: string;
    readonly reportVersionId?: string | null;
    readonly format: 'csv' | 'pdf' | 'xlsx';
    readonly exportScope?: 'report' | 'section' | 'table';
    readonly idempotencyKey: string;
  }): Promise<PapaReportExportRow> {
    const { idempotencyKey, ...body } = input;
    const data = await this.authenticatedCommand<{ readonly record: PapaReportExportRow }>(
      '/api/v1/papa/report-definitions/exports',
      body,
      { idempotencyKey },
    );
    return data.record;
  }

  async upsertPapaReportSchedule(input: {
    readonly reportDefinitionId: string;
    readonly cadence: string;
    readonly recipients: readonly string[];
    readonly exportFormats: readonly ('csv' | 'pdf' | 'xlsx')[];
    readonly idempotencyKey: string;
  }): Promise<PapaReportScheduleRow> {
    const { idempotencyKey, ...body } = input;
    const data = await this.authenticatedCommand<{ readonly record: PapaReportScheduleRow }>(
      '/api/v1/papa/report-definitions/schedule',
      body,
      { idempotencyKey },
    );
    return data.record;
  }

  async createPapaReport(input: {
    readonly reportType: string;
    readonly format: 'csv' | 'json' | 'pdf' | 'xlsx';
    readonly dateFrom: string;
    readonly dateTo: string;
    readonly filters: Readonly<Record<string, unknown>>;
    readonly idempotencyKey: string;
  }): Promise<BffReportRecord> {
    return this.authenticatedCommand<BffReportRecord>(
      '/api/v1/reports',
      input,
      { idempotencyKey: input.idempotencyKey },
    );
  }

  async readPapaReport(reportId: string): Promise<BffReportRecord> {
    const response = await this.fetch(
      `/api/v1/reports/${encodeURIComponent(reportId)}`,
      { method: 'GET' },
    );
    const payload = await readJson<{ readonly data: BffReportRecord }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async getPapaReportDownload(reportId: string): Promise<{
    readonly url: string;
    readonly expiresInSeconds: number;
  }> {
    const response = await this.fetch(
      `/api/v1/reports/${encodeURIComponent(reportId)}/download`,
      { method: 'GET' },
    );
    const payload = await readJson<{
      readonly data: { readonly url: string; readonly expiresInSeconds: number };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async readIntegrationJobs(): Promise<readonly BffIntegrationJob[]> {
    const response = await this.fetch('/api/v1/integrations/jobs', { method: 'GET' });
    const payload = await readJson<{ readonly data: readonly BffIntegrationJob[] }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async readIntegrationsStatus<TData = unknown>(): Promise<TData> {
    return this.readDomainScreen<TData>('/api/v1/integrations/status');
  }

  async readIntegrationsCatalog<TData = unknown>(): Promise<TData> {
    return this.readDomainScreen<TData>('/api/v1/integrations/catalog');
  }

  async readIntegrationsLogs<TData = unknown>(): Promise<TData> {
    return this.readDomainScreen<TData>('/api/v1/integrations/logs');
  }

  async readIntegrationsCompleteness<TData = unknown>(): Promise<TData> {
    return this.readDomainScreen<TData>('/api/v1/integrations/completeness');
  }

  async retryIntegrationJob(jobId: string): Promise<void> {
    await this.authenticatedCommand(`/api/v1/integrations/jobs/${encodeURIComponent(jobId)}/retry`);
  }

  async cancelIntegrationJob(jobId: string): Promise<void> {
    await this.authenticatedCommand(`/api/v1/integrations/jobs/${encodeURIComponent(jobId)}/cancel`);
  }

  async testIntegrationProvider(
    provider: string,
    input: Readonly<Record<string, unknown>>,
  ): Promise<BffIntegrationProviderTestResult> {
    return this.authenticatedCommand(
      `/api/v1/integrations/${encodeURIComponent(provider)}/test`,
      input,
    );
  }

  async createIntegrationConnection(input: {
    readonly providerId: string;
    readonly credentialReference: string;
    readonly requestedScopes: readonly string[];
  }): Promise<Readonly<Record<string, unknown>>> {
    return this.authenticatedCommand('/api/v1/integrations/connections', {
      ...input,
      idempotencyKey: createCorrelationId(),
    });
  }

  async startIntegrationSync(input: {
    readonly connectionId: string;
    readonly providerId: string;
    readonly streams: readonly string[];
  }): Promise<Readonly<Record<string, unknown>>> {
    return this.authenticatedCommand(
      `/api/v1/integrations/connections/${encodeURIComponent(input.connectionId)}/sync`,
      {
        idempotencyKey: createCorrelationId(),
        providerId: input.providerId,
        streams: input.streams,
      },
    );
  }

  async startIntegrationBackfill(input: {
    readonly connectionId: string;
    readonly providerId: string;
    readonly streams: readonly string[];
  }): Promise<Readonly<Record<string, unknown>>> {
    const to = new Date();
    const from = new Date(to);
    from.setUTCDate(from.getUTCDate() - 90);
    return this.authenticatedCommand(
      `/api/v1/integrations/connections/${encodeURIComponent(input.connectionId)}/backfill`,
      {
        from: from.toISOString(),
        idempotencyKey: createCorrelationId(),
        providerId: input.providerId,
        streams: input.streams,
        to: to.toISOString(),
      },
    );
  }

  async disconnectIntegrationConnection(connectionId: string): Promise<void> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch(
      `/api/v1/integrations/connections/${encodeURIComponent(connectionId)}`,
      {
        method: 'DELETE',
        headers: {
          'idempotency-key': createCorrelationId(),
          'x-papadata-csrf': csrfToken,
        },
      },
    );
    const payload = await readJson<unknown>(response);
    assertOk(response, payload);
  }

  private async authenticatedCommand<TData = unknown>(
    path: string,
    body?: Readonly<Record<string, unknown>>,
    options: { readonly idempotencyKey?: string } = {},
  ): Promise<TData> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch(path, {
      method: 'POST',
      headers: {
        'idempotency-key': options.idempotencyKey ?? createCorrelationId(),
        'x-papadata-csrf': csrfToken,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const payload = await readJson<{ readonly data: TData }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async authenticate(
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<AuthenticationResult> {
    const response = await this.fetch(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const payload = await readJson<{
      readonly data: AuthenticationResult;
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async publicCommand(
    path: string,
    body: Readonly<Record<string, string>>,
  ): Promise<void> {
    const response = await this.fetch(path, {
      method: 'POST',
      headers: {
        'idempotency-key': createCorrelationId(),
      },
      body: JSON.stringify(body),
    });
    const payload = await readJson<unknown>(response);
    assertOk(response, payload);
  }

  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    const response = await this.fetch('/api/csrf', { method: 'GET' });
    const payload = await readJson<{
      readonly data: {
        readonly csrfToken: string;
      };
    }>(response);
    assertOk(response, payload);
    this.csrfToken = payload.data.csrfToken;
    return this.csrfToken;
  }

  private fetch(
    path: string,
    init: RequestInit,
  ): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    headers.set('x-correlation-id', createCorrelationId());
    if (init.body !== undefined && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers,
      redirect: 'manual',
    });
  }
}

function withDateRangeQuery(
  path: `/api/v1/${string}`,
  dateRange: DateRange | null,
): `/api/v1/${string}` {
  if (!dateRange) {
    return path;
  }

  const [pathname = path, currentQuery = ''] = path.split('?');
  const params = new URLSearchParams(currentQuery);

  params.set('from', dateRange.from);
  params.set('to', dateRange.to);
  params.set('timezone', dateRange.timezone);

  if (dateRange.preset) {
    params.set('preset', dateRange.preset);
  }

  const query = params.toString();

  return `${pathname}?${query}` as `/api/v1/${string}`;
}

export const bffClient = new BffClient();

type NormalizedRegisterInput = {
  readonly displayName: string;
  readonly email: string;
  readonly organizationName: string;
  readonly password: string;
  readonly workspaceName: string;
};

type LocalClientAccount = NormalizedRegisterInput & {
  readonly tenantId: string;
  readonly userId: string;
  readonly workspaceId: string;
};

type LocalClientState = {
  readonly accounts: readonly LocalClientAccount[];
  readonly session: BffSession | null;
};

const localClientStateKey = 'papadata.local-client-runtime.v1';

const localClientCapabilities = [
  'analytics.read',
  'analytics.command_center.read',
  'analytics.metrics.read',
  'analytics.metrics.compare',
  'ai.action_proposal.approve',
  'ai.action_proposal.create',
  'ai.assistant.run',
  'ai.history.read',
  'billing.manage',
  'billing.read',
  'data_quality.read',
  'decisions.manage',
  'decisions.read',
  'integrations.catalog.read',
  'integrations.connection.manage',
  'integrations.connection.read',
  'integrations.credentials.manage',
  'integrations.jobs.manage',
  'integrations.jobs.read',
  'integrations.manage',
  'integrations.read',
  'integrations.sync.run',
  'reports.create',
  'reports.read',
  'settings.manage',
  'workspace.manage',
  'workspace.read',
] as const;

export function isLocalClientRuntimeAvailable(): boolean {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;
  try {
    if (!window.localStorage) return false;
  } catch {
    return false;
  }
  const hostname = window.location.hostname.toLocaleLowerCase('en-US');
  return hostname === 'localhost'
    || hostname === '127.0.0.1'
    || hostname === 'papadata.localhost'
    || hostname.endsWith('.localhost');
}

function normalizeRegistrationInput(input: RegisterInput): NormalizedRegisterInput {
  const displayName = (input.displayName ?? input.fullName ?? '').trim();
  return {
    displayName,
    email: input.email.trim(),
    organizationName: input.organizationName.trim(),
    password: input.password,
    workspaceName: input.workspaceName.trim(),
  };
}

function canUseLocalAuthFallback(cause: unknown): boolean {
  if (!isLocalClientRuntimeAvailable()) return false;
  if (cause instanceof BffProblem) {
    return cause.status >= 500 || cause.code === 'LOGIN_FAILED';
  }
  return true;
}

function registerWithLocalClient(
  input: NormalizedRegisterInput,
): AuthenticationResult {
  const state = readLocalClientState();
  const email = normalizeEmail(input.email);
  const existing = state.accounts.find((account) => (
    normalizeEmail(account.email) === email
  ));

  if (existing) {
    throw new BffProblem(
      409,
      'REGISTRATION_FAILED',
      'Konto lokalne o tym adresie już istnieje. Zaloguj się lokalnie.',
    );
  }

  const account: LocalClientAccount = {
    ...input,
    email,
    tenantId: createLocalId('tenant'),
    userId: createLocalId('user'),
    workspaceId: createLocalId('workspace'),
  };
  const session = createLocalClientSession(account);
  writeLocalClientState({
    accounts: [...state.accounts, account],
    session,
  });
  return {
    session,
    user: localAuthenticatedUser(account),
  };
}

function loginWithLocalClient(input: {
  readonly email: string;
  readonly password: string;
}): AuthenticationResult {
  const state = readLocalClientState();
  const email = normalizeEmail(input.email);
  const account = state.accounts.find((candidate) => (
    normalizeEmail(candidate.email) === email
  ));

  if (!account || account.password !== input.password) {
    throw new BffProblem(
      401,
      'LOGIN_FAILED',
      'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.',
    );
  }

  const session = createLocalClientSession(account);
  writeLocalClientState({
    accounts: state.accounts,
    session,
  });
  return {
    session,
    user: localAuthenticatedUser(account),
  };
}

function readLocalClientSession(): BffSession | null {
  const state = readLocalClientState();
  if (!state.session) return null;
  if (Date.parse(state.session.expiresAt) <= Date.now()) {
    writeLocalClientState({
      accounts: state.accounts,
      session: null,
    });
    return null;
  }
  return state.session;
}

function clearLocalClientSession(): void {
  if (!isLocalClientRuntimeAvailable()) return;
  const state = readLocalClientState();
  writeLocalClientState({
    accounts: state.accounts,
    session: null,
  });
}

function createLocalClientSession(account: LocalClientAccount): BffSession {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000).toISOString();
  return {
    activeTenantId: account.tenantId,
    activeWorkspaceId: account.workspaceId,
    authLevel: 'session',
    capabilities: localClientCapabilities,
    expiresAt,
    memberships: [
      {
        capabilities: localClientCapabilities,
        roles: ['Tenant Owner'],
        tenantId: account.tenantId,
        tenantName: account.organizationName,
        workspaceId: account.workspaceId,
        workspaceName: account.workspaceName,
      },
    ],
    sessionId: createLocalId('session'),
    user: localAuthenticatedUser(account),
    userId: account.userId,
  };
}

function localAuthenticatedUser(
  account: LocalClientAccount,
): AuthenticatedUser {
  return {
    displayName: account.displayName,
    email: account.email,
    userId: account.userId,
  };
}

function readLocalClientState(): LocalClientState {
  if (!isLocalClientRuntimeAvailable()) {
    return { accounts: [], session: null };
  }

  try {
    const raw = window.localStorage.getItem(localClientStateKey);
    if (!raw) return { accounts: [], session: null };
    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) return { accounts: [], session: null };
    return {
      accounts: readLocalClientAccounts(parsed.accounts),
      session: readLocalClientSessionValue(parsed.session),
    };
  } catch {
    return { accounts: [], session: null };
  }
}

function writeLocalClientState(state: LocalClientState): void {
  if (!isLocalClientRuntimeAvailable()) return;
  window.localStorage.setItem(localClientStateKey, JSON.stringify(state));
}

function readLocalClientAccounts(value: unknown): readonly LocalClientAccount[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): readonly LocalClientAccount[] => {
    if (!isRecord(item)) return [];
    const displayName = optionalString(item.displayName);
    const email = optionalString(item.email);
    const organizationName = optionalString(item.organizationName);
    const password = optionalString(item.password);
    const tenantId = optionalString(item.tenantId);
    const userId = optionalString(item.userId);
    const workspaceId = optionalString(item.workspaceId);
    const workspaceName = optionalString(item.workspaceName);
    if (
      !displayName
      || !email
      || !organizationName
      || !password
      || !tenantId
      || !userId
      || !workspaceId
      || !workspaceName
    ) {
      return [];
    }
    return [{
      displayName,
      email,
      organizationName,
      password,
      tenantId,
      userId,
      workspaceId,
      workspaceName,
    }];
  });
}

function readLocalClientSessionValue(value: unknown): BffSession | null {
  if (!isRecord(value)) return null;
  const activeTenantId = optionalString(value.activeTenantId);
  const activeWorkspaceId = optionalString(value.activeWorkspaceId);
  const authLevel = optionalString(value.authLevel);
  const expiresAt = optionalString(value.expiresAt);
  const sessionId = optionalString(value.sessionId);
  const userId = optionalString(value.userId);
  const capabilities = stringArray(value.capabilities);
  const memberships = readLocalClientMemberships(value.memberships);
  const user = readLocalAuthenticatedUser(value.user);
  if (
    !activeTenantId
    || !activeWorkspaceId
    || !authLevel
    || capabilities.length === 0
    || !expiresAt
    || memberships.length === 0
    || !sessionId
    || !userId
  ) {
    return null;
  }
  return {
    activeTenantId,
    activeWorkspaceId,
    authLevel,
    capabilities,
    expiresAt,
    memberships,
    sessionId,
    ...(user ? { user } : {}),
    userId,
  };
}

function readLocalClientMemberships(
  value: unknown,
): readonly BffSessionMembership[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): readonly BffSessionMembership[] => {
    if (!isRecord(item)) return [];
    const tenantId = optionalString(item.tenantId);
    const tenantName = optionalString(item.tenantName);
    const workspaceId = optionalString(item.workspaceId);
    const workspaceName = optionalString(item.workspaceName);
    const capabilities = stringArray(item.capabilities);
    const roles = stringArray(item.roles);
    return tenantId && workspaceId && capabilities.length > 0
      ? [{
          capabilities,
          roles,
          tenantId,
          ...(tenantName ? { tenantName } : {}),
          workspaceId,
          ...(workspaceName ? { workspaceName } : {}),
        }]
      : [];
  });
}

function readLocalAuthenticatedUser(value: unknown): AuthenticatedUser | null {
  if (!isRecord(value)) return null;
  const displayName = optionalString(value.displayName);
  const email = optionalString(value.email);
  const userId = optionalString(value.userId);
  return displayName && email && userId
    ? { displayName, email, userId }
    : null;
}

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase('en-US');
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : [];
}

function createLocalId(prefix: string): string {
  return `${prefix}_${createCorrelationId()}`;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new BffProblem(
      response.status,
      'INVALID_JSON_RESPONSE',
      'BFF returned a response that is not valid JSON.',
    );
  }
}

function assertOk(response: Response, payload: unknown): void {
  if (response.ok) return;
  const errorPayload: ErrorPayload = isRecord(payload)
    ? payload as ErrorPayload
    : {};
  const code = typeof errorPayload.error?.code === 'string'
    ? errorPayload.error.code
    : `HTTP_${response.status}`;
  const message = typeof errorPayload.error?.message === 'string'
    ? errorPayload.error.message
    : friendlyMessage(code, response.status);
  throw new BffProblem(response.status, code, message);
}

function friendlyMessage(code: string, status: number): string {
  if (code === 'LOGIN_FAILED') return 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.';
  if (code === 'REGISTRATION_FAILED') return 'Nie udało się utworzyć konta.';
  if (status === 401) return 'Sesja wygasła lub nie jest aktywna.';
  if (status === 403) return 'Żądanie zostało odrzucone przez zabezpieczenia aplikacji.';
  if (status >= 500) return 'Usługa jest chwilowo niedostępna.';
  return 'Żądanie nie mogło zostać wykonane.';
}

function createCorrelationId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Papa/Lab runtime operation contract anchor for BFF calls.
 * Source of truth: contracts/papa-lab-runtime-operations.json.
 */
export const BFF_PAPA_LAB_RUNTIME_OPERATION_CONTRACT_VERSION = "papa-lab-runtime-operations.v1" as const;

export const BFF_PAPA_LAB_RUNTIME_OPERATION_IDS = [
  "papa.context.capture",
  "papa.answer.generate",
  "papa.answer.read",
  "papa.context-panel.read",
  "papa.assistant-shell.read",
  "papa.observations.read",
  "papa.observation.save",
  "papa.history-memory.read",
  "papa.context-basket.read",
  "papa.evidence.read",
  "papa.lab.read",
  "papa.proposals.read",
  "papa.governance.read",
  "papa.actions.read",
  "papa.action-approval.read",
  "papa.ai.action.validate",
  "papa.ai.action.approve",
  "papa.ai.action.reject",
  "papa.ai.action.execute",
  "papa.ai.action.rollback",
  "papa.ai.notifications.read",
  "papa.ai.notification.mark-read",
  "papa.ai.notification.snooze",
  "papa.ai.notification.unsnooze",
  "papa.metric-provenance.read",
  "papa.answer-contract.read",
  "papa.provider-governance.read",
  "papa.privacy-redaction.read",
  "papa.report-definition.read",
  "papa.report-definition.upsert",
  "papa.report-definition.duplicate",
  "papa.report-export.create",
  "papa.report-schedule.upsert"
] as const;

export type BffPapaLabRuntimeOperationId =
  typeof BFF_PAPA_LAB_RUNTIME_OPERATION_IDS[number];
