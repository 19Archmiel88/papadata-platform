import type {
  AuthError,
  AuthGateway,
  AuthSession,
  Invitation,
  InvitationAcceptInput,
  LoginInput,
  LoginOutcome,
  MfaChallengeInput,
  OperationResult,
  PasswordChangeInput,
  PasswordResetConfirmInput,
  PasswordResetStartInput,
  PasswordResetValidateInput,
  PostLoginContextResolution,
  ReauthenticationContext,
  ReauthenticationInput,
  ReauthenticationValidationInput,
  RecoveryCode,
  SessionId,
  SessionResult,
  TestOutboxMessage,
} from '../contracts/auth';
import type { AccessDecision, ActorContext, Capability } from '../contracts/authz';
import type { InvitationId } from '../contracts/ids';
import type { TenantContext } from '../contracts/tenant';

export type ServerAuthApiClientOptions = {
  baseUrl?: string;
  fetchFn?: typeof fetch;
};

type CsrfResponse = {
  csrfToken: string;
  status: 'success';
};

const defaultBaseUrl = '/api/auth';

export function createServerAuthApiClient(
  options: ServerAuthApiClientOptions = {},
): AuthGateway {
  const baseUrl = trimTrailingSlash(options.baseUrl ?? resolveAuthApiBaseUrl());
  const fetchFn = options.fetchFn ?? globalThis.fetch.bind(globalThis);
  let csrfToken: string | undefined;

  async function requestJson<TResponse>(
    path: string,
    init: {
      body?: unknown;
      method: 'GET' | 'POST';
    },
  ): Promise<TResponse> {
    const headers = new Headers();

    if (init.method === 'POST') {
      csrfToken = csrfToken ?? await loadCsrfToken();
      headers.set('Content-Type', 'application/json');
      headers.set('X-PapaData-CSRF', csrfToken);
    }

    const response = await fetchFn(`${baseUrl}${path}`, {
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      credentials: 'include',
      headers,
      method: init.method,
    });

    return await response.json() as TResponse;
  }

  async function loadCsrfToken(): Promise<string> {
    const response = await fetchFn(`${baseUrl}/csrf`, {
      credentials: 'include',
      method: 'GET',
    });
    const payload = await response.json() as CsrfResponse;
    return payload.csrfToken;
  }

  async function operation<TValue>(
    path: string,
    body?: unknown,
  ): Promise<OperationResult<TValue>> {
    try {
      return await requestJson<OperationResult<TValue>>(path, {
        body,
        method: 'POST',
      });
    } catch {
      return { error: networkAuthError(), status: 'error' };
    }
  }

  return {
    async acceptInvitation(input: InvitationAcceptInput) {
      try {
        return await requestJson<LoginOutcome>('/invitations/accept', {
          body: input,
          method: 'POST',
        });
      } catch {
        return { error: networkAuthError(), status: 'error' };
      }
    },
    async authorizeOperation(
      sessionId: SessionId,
      capability: Capability,
      tenant: TenantContext,
    ) {
      void sessionId;
      return operation<AccessDecision>('/authz/check', {
        capability,
        ...tenant,
      });
    },
    async cancelInvitation(actor: ActorContext, invitationId: InvitationId) {
      void actor;
      return operation<Invitation>('/invitations/cancel', { invitationId });
    },
    async changePasswordAfterReauthentication(input: PasswordChangeInput) {
      return operation('/password/change', input);
    },
    async checkInvitationToken(input) {
      return operation<Invitation>('/invitations/check', input);
    },
    async configureMfa(sessionId: SessionId) {
      void sessionId;
      return operation<readonly RecoveryCode[]>('/mfa/setup/confirm');
    },
    async createInvitation(actor: ActorContext, input) {
      void actor;
      return operation<Invitation>('/invitations/create', input);
    },
    async disableMfa(sessionId: SessionId) {
      void sessionId;
      return operation('/mfa/disable');
    },
    async getActorContext(sessionId: SessionId) {
      void sessionId;
      try {
        return await requestJson<OperationResult<ActorContext>>('/actor/current', {
          method: 'GET',
        });
      } catch {
        return { error: networkAuthError(), status: 'error' };
      }
    },
    getAuditEvents() {
      return [];
    },
    getTestOutbox(): readonly TestOutboxMessage[] {
      return [];
    },
    async listSessions(sessionId: SessionId) {
      void sessionId;
      try {
        return await requestJson<OperationResult<readonly AuthSession[]>>('/sessions', {
          method: 'GET',
        });
      } catch {
        return { error: networkAuthError(), status: 'error' };
      }
    },
    async logout(sessionId: SessionId) {
      void sessionId;
      return operation<{ redirectTo: string }>('/session/logout');
    },
    async reauthenticate(input: ReauthenticationInput) {
      return operation<ReauthenticationContext>('/reauth/confirm', input);
    },
    async refreshSession(sessionId: SessionId) {
      void sessionId;
      try {
        return await requestJson<SessionResult>('/session/refresh', {
          method: 'POST',
        });
      } catch {
        return { error: networkAuthError(), status: 'missing' };
      }
    },
    async regenerateRecoveryCodes(sessionId: SessionId) {
      void sessionId;
      return operation<readonly RecoveryCode[]>('/mfa/recovery/regenerate');
    },
    async resendInvitation(actor: ActorContext, invitationId: InvitationId) {
      void actor;
      return operation<Invitation>('/invitations/resend', { invitationId });
    },
    async requestPasswordReset(input: PasswordResetStartInput) {
      return operation<{ neutralMessage: string }>('/password/recovery/start', input);
    },
    async resetPassword(input: PasswordResetConfirmInput) {
      return operation('/password/reset/confirm', input);
    },
    async restoreSession(sessionId: SessionId) {
      void sessionId;
      try {
        return await requestJson<SessionResult>('/session/current', {
          method: 'GET',
        });
      } catch {
        return { error: networkAuthError(), status: 'missing' };
      }
    },
    async revokeOtherSessions(sessionId: SessionId) {
      void sessionId;
      return operation<readonly AuthSession[]>('/sessions/revoke-other');
    },
    async revokeSession(sessionId: SessionId, targetSessionId: SessionId) {
      void sessionId;
      return operation<AuthSession>('/sessions/revoke', { targetSessionId });
    },
    async selectWorkspace(sessionId: SessionId, tenant: TenantContext) {
      void sessionId;
      return operation<PostLoginContextResolution>('/context/select', tenant);
    },
    async signIn(input: LoginInput) {
      try {
        return await requestJson<LoginOutcome>('/session/login', {
          body: input,
          method: 'POST',
        });
      } catch {
        return { error: networkAuthError(), status: 'error' };
      }
    },
    async validatePasswordResetToken(input: PasswordResetValidateInput) {
      return operation('/password/reset/validate', input);
    },
    async validateReauthenticationContext(input: ReauthenticationValidationInput) {
      return operation('/reauth/validate', input);
    },
    async verifyMfaChallenge(input: MfaChallengeInput) {
      try {
        return await requestJson<LoginOutcome>('/mfa/challenge/verify', {
          body: input,
          method: 'POST',
        });
      } catch {
        return { error: networkAuthError(), status: 'error' };
      }
    },
  };
}

export function resolveAuthApiBaseUrl(): string {
  const env = (import.meta as ImportMeta & {
    env?: {
      VITE_PAPADATA_AUTH_API_URL?: string;
    };
  }).env;

  return env?.VITE_PAPADATA_AUTH_API_URL ?? defaultBaseUrl;
}

function networkAuthError(): AuthError {
  return {
    code: 'NETWORK_ERROR',
    message: 'Nie udało się połączyć z serwerem auth.',
    retrySafe: true,
  };
}

function trimTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}
