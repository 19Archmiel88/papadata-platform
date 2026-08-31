import type {
  DateRange,
} from '../../../../../../../contracts/ui-contract-types';
import {
  BrowserAuthRefreshCoordinator,
  type AuthRefreshCoordinator,
  type AuthRuntimeEvent,
} from './authRefreshCoordinator';

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
  readonly code?: unknown;
  readonly correlationId?: unknown;
  readonly detail?: unknown;
  // NestJS's default (unfiltered) exception body shape is
  // `{ statusCode, message, error }` with `error` as a plain string (e.g.
  // "Forbidden") -- not the `{ error: { code, message } }` envelope the
  // rest of this type models. Used only as a last-resort human-readable
  // message fallback; never parsed for auth-level detection (see
  // requiredAuthLevel below).
  readonly message?: unknown;
  // Canonical, structural signal for "this 403 means the caller needs to
  // reach a higher authLevel" -- set by CapabilityGuard (API, forwarded
  // verbatim by the BFF's proxy) and by the BFF's own two auth-level guards
  // (session-assurance's issueStepUp/disableMfa). Deliberately never
  // inferred from message/detail text: an unrecognized or absent value
  // must resolve to `null`, not a guessed level.
  readonly requiredAuthLevel?: unknown;
};

export class BffProblem extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId: string | null;
  readonly requestId: string | null;
  readonly requiredAuthLevel: 'mfa' | 'step_up' | null;

  constructor(
    status: number,
    code: string,
    message: string,
    options: {
      readonly correlationId?: string | null;
      readonly requestId?: string | null;
      readonly requiredAuthLevel?: 'mfa' | 'step_up' | null;
    } = {},
  ) {
    super(message);
    this.name = 'BffProblem';
    this.status = status;
    this.code = code;
    this.correlationId = options.correlationId ?? null;
    this.requestId = options.requestId ?? null;
    this.requiredAuthLevel = options.requiredAuthLevel ?? null;
  }
}

type BffFetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type BffRequestMode =
  | 'auth-bootstrap'
  | 'authenticated-command'
  | 'authenticated-read'
  | 'csrf'
  | 'public'
  | 'refresh';

type BffRequestMetadata = {
  readonly allowRefresh?: boolean;
  readonly mode: BffRequestMode;
  readonly retriedAfterRefresh?: boolean;
};

export type BffSessionSummary = {
  readonly current: boolean;
  readonly expiresAt: string;
  readonly issuedAt: string;
  readonly sessionId: string;
  readonly userAgent?: string | null;
};

export type BffClientOptions = {
  readonly baseUrl?: string;
  readonly coordinator?: AuthRefreshCoordinator;
  readonly csrfCookieName?: string;
  readonly csrfToken?: string | null;
  readonly fetchImpl?: BffFetch;
};

export class BffClient {
  private csrfToken: string | null = null;
  private readonly baseUrl: string;
  private readonly coordinator: AuthRefreshCoordinator;
  private readonly csrfCookieName: string;
  private readonly fetchImpl: BffFetch;
  private readonly listeners = new Set<(event: AuthRuntimeEvent) => void>();
  private refreshPromise: Promise<BffSession> | null = null;

  constructor(options: BffClientOptions | string = {}) {
    const normalized = typeof options === 'string' ? { baseUrl: options } : options;
    this.baseUrl = (
      normalized.baseUrl
      // `?.` after `.env` too, not just after the variable name: this
      // module's `bffClient` singleton export runs this constructor at
      // import time, and `import.meta.env` is a Vite-only global -- it is
      // `undefined` when this file is imported outside a Vite build (e.g.
      // by a real-client-runtime test harness running under plain
      // Node/tsx), where a bare `import.meta.env.VITE_BFF_BASE_URL` would
      // throw before an explicit `baseUrl` option ever got a chance to
      // short-circuit it via `??`.
      ?? import.meta.env?.VITE_BFF_BASE_URL?.trim()
      ?? ''
    ).replace(/\/+$/u, '');
    this.coordinator = normalized.coordinator ?? new BrowserAuthRefreshCoordinator();
    this.csrfCookieName = normalized.csrfCookieName ?? 'papadata_csrf';
    this.csrfToken = normalized.csrfToken ?? null;
    this.fetchImpl = normalized.fetchImpl ?? ((input, init) => fetch(input, init));
    this.coordinator.subscribe((event) => {
      if (event.type === 'logout' || event.type === 'refresh-failed') {
        this.csrfToken = null;
      }
      this.emit(event);
    });
  }

  subscribeAuthEvents(listener: (event: AuthRuntimeEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  async readSession(): Promise<BffSession | null> {
    try {
      return await this.readSessionAfterRefresh();
    } catch (cause) {
      if (cause instanceof BffProblem && cause.status === 401) {
        this.endLocalSession('session-revoked');
        return null;
      }
      throw cause;
    }
  }

  private async readSessionAfterRefresh(): Promise<BffSession> {
    const response = await this.fetch(
      '/api/v1/auth/session',
      { method: 'GET' },
      { allowRefresh: true, mode: 'auth-bootstrap' },
    );
    const payload = await readJson<{ readonly data: BffSession }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async readSessionWithoutRefresh(): Promise<BffSession> {
    const response = await this.fetch(
      '/api/v1/auth/session',
      { method: 'GET' },
      { allowRefresh: false, mode: 'auth-bootstrap' },
    );
    const payload = await readJson<{ readonly data: BffSession }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async refreshSession(): Promise<BffSession> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = this.coordinator.coordinateRefresh({
      afterExternal: () => this.readSessionWithoutRefresh(),
      perform: async () => {
        const csrfToken = await this.getCsrfTokenForRefresh();
        const response = await this.fetch(
          '/api/v1/auth/refresh',
          {
            method: 'POST',
            headers: {
              'x-papadata-csrf': csrfToken,
            },
          },
          { allowRefresh: false, mode: 'refresh' },
        );
        const payload = await readJson<{ readonly data: { readonly session: BffSession } }>(response);
        assertOk(response, payload);
        return payload.data.session;
      },
    }).then((session) => {
      this.coordinator.publish({ type: 'session-updated' });
      return session;
    }).catch((cause: unknown) => {
      this.endLocalSession('refresh-failed');
      throw cause;
    }).finally(() => {
      this.refreshPromise = null;
    });

    return this.refreshPromise;
  }

  private async getCsrfTokenForRefresh(): Promise<string> {
    const token = this.csrfToken ?? this.readCsrfTokenCookie();
    if (token) {
      this.csrfToken = token;
      return token;
    }
    try {
      return await this.getCsrfToken();
    } catch (cause) {
      if (cause instanceof BffProblem && cause.status === 401) {
        throw new BffProblem(401, 'SESSION_REFRESH_CSRF_UNAVAILABLE', 'Session refresh requires a valid CSRF token.');
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
    const result = await this.authenticate('/api/v1/auth/login', input);
    this.coordinator.publish({ type: 'session-updated' });
    return result;
  }

  async register(input: RegisterInput): Promise<AuthenticationResult> {
    this.csrfToken = null;
    const body = normalizeRegistrationInput(input);
    const result = await this.authenticate('/api/v1/auth/register/email', body);
    this.coordinator.publish({ type: 'session-updated' });
    return result;
  }

  async confirmMfa(input: {
    readonly code: string;
  }): Promise<{
    readonly session: BffSession;
    readonly verified: boolean;
  }> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch(
      '/api/v1/auth/mfa/confirm',
      {
        method: 'POST',
        headers: {
          'x-papadata-csrf': csrfToken,
        },
        body: JSON.stringify(input),
      },
      { allowRefresh: true, mode: 'authenticated-command' },
    );
    const payload = await readJson<{
      readonly data: {
        readonly session: BffSession;
        readonly verified: boolean;
      };
    }>(response);
    assertOk(response, payload);
    this.coordinator.publish({ type: 'session-updated' });
    return payload.data;
  }

  async verifyMfa(input: {
    readonly code: string;
  }): Promise<{
    readonly session: BffSession;
    readonly verified: boolean;
  }> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch(
      '/api/v1/auth/mfa/verify',
      {
        method: 'POST',
        headers: {
          'x-papadata-csrf': csrfToken,
        },
        body: JSON.stringify(input),
      },
      { allowRefresh: true, mode: 'authenticated-command' },
    );
    const payload = await readJson<{
      readonly data: {
        readonly session: BffSession;
        readonly verified: boolean;
      };
    }>(response);
    assertOk(response, payload);
    this.coordinator.publish({ type: 'session-updated' });
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
    const response = await this.fetch(
      '/api/v1/auth/step-up',
      {
        method: 'POST',
        headers: {
          'x-papadata-csrf': csrfToken,
        },
        body: JSON.stringify(input),
      },
      { allowRefresh: true, mode: 'authenticated-command' },
    );
    const payload = await readJson<{
      readonly data: {
        readonly session: BffSession;
        readonly stepUpExpiresAt: string;
      };
    }>(response);
    assertOk(response, payload);
    this.coordinator.publish({ type: 'session-updated' });
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
    const response = await this.fetch(
      '/api/v1/security/mfa/enroll',
      {
        method: 'POST',
        headers: {
          'idempotency-key': createCorrelationId(),
          'x-papadata-csrf': csrfToken,
        },
        body: JSON.stringify(input),
      },
      { allowRefresh: true, mode: 'authenticated-command' },
    );
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
    const response = await this.fetch(
      '/api/v1/auth/invitations/validate',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      { allowRefresh: false, mode: 'public' },
    );
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
    const response = await this.fetch(
      '/api/v1/auth/invitations/accept',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      { allowRefresh: false, mode: 'public' },
    );
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
    const response = await this.fetch(
      '/api/v1/auth/status',
      { method: 'GET' },
      { allowRefresh: false, mode: 'public' },
    );
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
    const response = await this.fetch(
      '/api/v1/auth/oauth/start',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      { allowRefresh: false, mode: 'public' },
    );
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
    const response = await this.fetch(
      '/api/v1/auth/oauth/callback',
      {
        method: 'POST',
        body: JSON.stringify(input),
      },
      { allowRefresh: false, mode: 'public' },
    );
    const payload = await readJson<{ readonly data: OAuthCallbackResult }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async logout(): Promise<void> {
    try {
      const csrfToken = await this.getCsrfToken();
      const response = await this.fetch(
        '/api/v1/auth/logout',
        {
          method: 'POST',
          headers: {
            'x-papadata-csrf': csrfToken,
          },
        },
        { allowRefresh: false, mode: 'authenticated-command' },
      );
      const payload = await readJson<unknown>(response);
      assertOk(response, payload);
    } catch (cause) {
      if (!(cause instanceof BffProblem) || cause.status !== 401) {
        throw cause;
      }
    } finally {
      this.endLocalSession('logout');
    }
  }

  async logoutAll(): Promise<void> {
    try {
      const csrfToken = await this.getCsrfToken();
      const response = await this.fetch(
        '/api/v1/auth/logout-all',
        {
          method: 'POST',
          headers: {
            'x-papadata-csrf': csrfToken,
          },
        },
        { allowRefresh: false, mode: 'authenticated-command' },
      );
      const payload = await readJson<unknown>(response);
      assertOk(response, payload);
    } catch (cause) {
      if (!(cause instanceof BffProblem) || cause.status !== 401) {
        throw cause;
      }
    } finally {
      this.endLocalSession('logout-all');
    }
  }

  async listSessions(): Promise<readonly BffSessionSummary[]> {
    const response = await this.fetch(
      '/api/v1/auth/sessions',
      { method: 'GET' },
      { allowRefresh: true, mode: 'authenticated-read' },
    );
    const payload = await readJson<{
      readonly data: { readonly sessions: readonly BffSessionSummary[] };
    }>(response);
    assertOk(response, payload);
    return payload.data.sessions;
  }

  async revokeSession(sessionId: string, currentSessionId?: string): Promise<void> {
    const csrfToken = await this.getCsrfToken();
    const response = await this.fetch(
      `/api/v1/auth/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: 'DELETE',
        headers: {
          'x-papadata-csrf': csrfToken,
        },
      },
      { allowRefresh: true, mode: 'authenticated-command' },
    );
    const payload = await readJson<unknown>(response);
    assertOk(response, payload);
    if (currentSessionId && currentSessionId === sessionId) {
      this.endLocalSession('session-revoked');
    }
  }

  async probeProtectedApi(): Promise<{
    readonly ok: boolean;
    readonly status: number;
    readonly requestId: string | null;
  }> {
    const response = await this.fetch(
      '/api/v1/integrations/providers',
      { method: 'GET' },
      { allowRefresh: true, mode: 'authenticated-read' },
    );
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
      readonly query?: Readonly<Record<string, string | null | undefined>>;
    } = {},
  ): Promise<TData> {
    const response = await this.fetch(
      withReadQuery(
        path,
        options.dateRange ?? null,
        options.query ?? null,
      ),
      { method: 'GET' },
      { allowRefresh: true, mode: 'authenticated-read' },
    );
    const payload = await readJson<{
      readonly data: TData;
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async selectWorkspace(workspaceId: string): Promise<BffSession> {
    const session = await this.authenticatedCommand<BffSession>(
      '/api/v1/access/workspace/select',
      { workspaceId },
    );
    this.coordinator.publish({ type: 'session-updated' });
    return session;
  }

  async readNotifications(
    view: 'active' | 'all' | 'snoozed' = 'active',
  ): Promise<BffNotificationList> {
    const response = await this.fetch(
      `/api/v1/notifications?view=${encodeURIComponent(view)}`,
      { method: 'GET' },
      { allowRefresh: true, mode: 'authenticated-read' },
    );
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
      { allowRefresh: true, mode: 'authenticated-read' },
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
      { allowRefresh: true, mode: 'authenticated-read' },
    );
    const payload = await readJson<{
      readonly data: { readonly url: string; readonly expiresInSeconds: number };
    }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  async readIntegrationJobs(): Promise<readonly BffIntegrationJob[]> {
    const response = await this.fetch(
      '/api/v1/integrations/jobs',
      { method: 'GET' },
      { allowRefresh: true, mode: 'authenticated-read' },
    );
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
      { allowRefresh: true, mode: 'authenticated-command' },
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
    const response = await this.fetch(
      path,
      {
        method: 'POST',
        headers: {
          'idempotency-key': options.idempotencyKey ?? createCorrelationId(),
          'x-papadata-csrf': csrfToken,
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
      { allowRefresh: true, mode: 'authenticated-command' },
    );
    const payload = await readJson<{ readonly data: TData }>(response);
    assertOk(response, payload);
    return payload.data;
  }

  private async authenticate(
    path: string,
    body: Readonly<Record<string, unknown>>,
  ): Promise<AuthenticationResult> {
    const response = await this.fetch(
      path,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      { allowRefresh: false, mode: 'public' },
    );
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
    const response = await this.fetch(
      path,
      {
        method: 'POST',
        headers: {
          'idempotency-key': createCorrelationId(),
        },
        body: JSON.stringify(body),
      },
      { allowRefresh: false, mode: 'public' },
    );
    const payload = await readJson<unknown>(response);
    assertOk(response, payload);
  }

  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) return this.csrfToken;
    const response = await this.fetch(
      '/api/csrf',
      { method: 'GET' },
      { allowRefresh: false, mode: 'csrf' },
    );
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
    metadata: BffRequestMetadata,
  ): Promise<Response> {
    return this.fetchWithRetry(path, init, metadata);
  }

  private async fetchWithRetry(
    path: string,
    init: RequestInit,
    metadata: BffRequestMetadata,
  ): Promise<Response> {
    const response = await this.performFetch(path, init);

    if (
      response.status !== 401
      || metadata.retriedAfterRefresh
      || metadata.allowRefresh === false
      || metadata.mode === 'public'
      || metadata.mode === 'csrf'
      || metadata.mode === 'refresh'
    ) {
      return response;
    }

    await this.refreshSession();
    return this.fetchWithRetry(path, init, {
      ...metadata,
      retriedAfterRefresh: true,
    });
  }

  private async performFetch(
    path: string,
    init: RequestInit,
  ): Promise<Response> {
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    headers.set('x-correlation-id', createCorrelationId());
    if (init.body !== undefined && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    try {
      return await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        credentials: 'include',
        headers,
        redirect: 'manual',
      });
    } catch (cause) {
      throw new BffProblem(
        0,
        'NETWORK_UNAVAILABLE',
        'BFF is unavailable.',
        { correlationId: headers.get('x-correlation-id') },
      );
    }
  }

  private readCsrfTokenCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const prefix = `${encodeURIComponent(this.csrfCookieName)}=`;
    const cookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith(prefix));
    return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
  }

  private endLocalSession(reason: 'logout' | 'logout-all' | 'refresh-failed' | 'session-revoked'): void {
    this.csrfToken = null;
    this.coordinator.publish({ type: 'logout', reason });
  }

  private emit(event: AuthRuntimeEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

function withReadQuery(
  path: `/api/v1/${string}`,
  dateRange: DateRange | null,
  queryValues: Readonly<Record<string, string | null | undefined>> | null,
): `/api/v1/${string}` {
  const [pathname = path, currentQuery = ''] = path.split('?');
  const params = new URLSearchParams(currentQuery);

  if (dateRange) {
    params.set('from', dateRange.from);
    params.set('to', dateRange.to);
    params.set('timezone', dateRange.timezone);
    if (dateRange.preset) {
      params.set('preset', dateRange.preset);
    }
  }

  if (queryValues) {
    for (const [key, value] of Object.entries(queryValues)) {
      if (value === null || value === undefined || value.trim().length === 0) continue;
      params.set(key, value);
    }
  }

  const query = params.toString();
  return query.length > 0
    ? `${pathname}?${query}` as `/api/v1/${string}`
    : pathname as `/api/v1/${string}`;
}

export const bffClient = new BffClient();

type NormalizedRegisterInput = {
  readonly displayName: string;
  readonly email: string;
  readonly organizationName: string;
  readonly password: string;
  readonly workspaceName: string;
};

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

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
    ? value
    : [];
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
  const code = readProblemCode(errorPayload, response.status);
  const detail = typeof errorPayload.detail === 'string' ? errorPayload.detail : null;
  const topLevelMessage = typeof errorPayload.message === 'string' ? errorPayload.message : null;
  const message = typeof errorPayload.error?.message === 'string'
    ? errorPayload.error.message
    : detail ?? topLevelMessage ?? friendlyMessage(code, response.status);
  throw new BffProblem(response.status, code, message, {
    correlationId: readResponseIdentifier(response, payload, 'x-correlation-id'),
    requestId: readResponseIdentifier(response, payload, 'x-request-id'),
    requiredAuthLevel: response.status === 403 ? readRequiredAuthLevel(errorPayload) : null,
  });
}

function friendlyMessage(code: string, status: number): string {
  if (code === 'LOGIN_FAILED') return 'Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.';
  if (code === 'REGISTRATION_FAILED') return 'Nie udało się utworzyć konta.';
  if (code === 'NETWORK_UNAVAILABLE') return 'Usługa jest chwilowo niedostępna.';
  if (status === 400) return 'Żądanie zawiera nieprawidłowe dane.';
  if (status === 401) return 'Sesja wygasła lub nie jest aktywna.';
  if (status === 403) return 'Żądanie zostało odrzucone przez zabezpieczenia aplikacji.';
  if (status === 409) return 'Żądanie jest w konflikcie z aktualnym stanem.';
  if (status === 429) return 'Przekroczono limit żądań. Spróbuj ponownie później.';
  if (status >= 500) return 'Usługa jest chwilowo niedostępna.';
  return 'Żądanie nie mogło zostać wykonane.';
}

function readProblemCode(payload: ErrorPayload, status: number): string {
  if (typeof payload.error?.code === 'string') return payload.error.code;
  if (typeof payload.code === 'string') return payload.code;
  return `HTTP_${status}`;
}

function readResponseIdentifier(
  response: Response,
  payload: unknown,
  headerName: 'x-correlation-id' | 'x-request-id',
): string | null {
  const header = response.headers.get(headerName);
  if (header) return header;
  if (headerName === 'x-correlation-id' && isRecord(payload) && typeof payload.correlationId === 'string') {
    return payload.correlationId;
  }
  return null;
}

// Structural only -- deliberately does not scan message/detail/code text.
// An absent or unrecognized value must resolve to `null`, never a guessed
// level (in particular, an unrecognized 403 must never default to
// 'step_up'). See ErrorPayload.requiredAuthLevel for where this field
// comes from on the wire.
function readRequiredAuthLevel(payload: ErrorPayload): 'mfa' | 'step_up' | null {
  return payload.requiredAuthLevel === 'mfa' || payload.requiredAuthLevel === 'step_up'
    ? payload.requiredAuthLevel
    : null;
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
