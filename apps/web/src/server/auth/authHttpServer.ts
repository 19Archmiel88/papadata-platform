import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { URL } from 'node:url';

import { createLocalAuthGateway } from '../../auth/localAuthGateway';
import type {
  AuditEvent,
  AuthError,
  AuthGateway,
  AuthSession,
  LoginOutcome,
  OperationResult,
  ReauthenticationPurpose,
  SessionId,
  SessionResult,
} from '../../contracts/auth';
import type { ActorContext, Capability, Role } from '../../contracts/authz';
import { asCapability } from '../../contracts/authz';
import {
  asAuthChallengeId,
  asInvitationId,
  asOrganizationId,
  asSessionId,
  asWorkspaceId,
} from '../../contracts/ids';
import type { TenantContext } from '../../contracts/tenant';
import {
  authCsrfCookieName,
  authSessionCookieName,
  clearSessionCookie,
  getCookie,
  setCsrfCookie,
  setSessionCookie,
  type AuthCookieOptions,
} from './cookies';
import { createCsrfToken, validateCsrfRequest } from './csrf';
import {
  createInMemoryAuthRateLimiter,
  type AuthRateLimiter,
} from './rateLimit';
import {
  createInMemoryServerAuditLog,
  maskEmail,
  type ServerAuditLog,
} from './audit';

export type AuthServerEnvironment = 'local' | 'production' | 'test';

export type AuthHttpServerOptions = {
  allowedHosts: readonly string[];
  allowedOrigins: readonly string[];
  basePath?: string;
  cookieDomain?: string;
  environment: AuthServerEnvironment;
  exposeLocalTestRoutes?: boolean;
  gateway: AuthGateway;
  now?: () => Date;
  rateLimiter?: AuthRateLimiter;
  tokenGenerator?: () => string;
};

export type StartedAuthHttpServer = {
  auditLog: ServerAuditLog;
  gateway: AuthGateway;
  server: Server;
};

const defaultBasePath = '/api/auth';
const publicCurrentSessionId = asSessionId('cookie_session');
const jsonContentType = 'application/json; charset=utf-8';

class SessionHandleStore {
  private readonly internalByPublic = new Map<SessionId, SessionId>();

  private readonly publicByInternal = new Map<SessionId, SessionId>();

  private readonly tokenGenerator: () => string;

  constructor(tokenGenerator: () => string) {
    this.tokenGenerator = tokenGenerator;
  }

  publicSession(session: AuthSession): AuthSession {
    return {
      ...session,
      sessionId: this.toPublicSessionId(session.sessionId),
    };
  }

  resolvePublicSessionId(publicSessionId: SessionId): SessionId | undefined {
    if (publicSessionId === publicCurrentSessionId) {
      return undefined;
    }

    return this.internalByPublic.get(publicSessionId);
  }

  private toPublicSessionId(internalSessionId: SessionId): SessionId {
    const existing = this.publicByInternal.get(internalSessionId);

    if (existing) {
      return existing;
    }

    const publicSessionId = asSessionId(`pub_${this.tokenGenerator()}`);
    this.publicByInternal.set(internalSessionId, publicSessionId);
    this.internalByPublic.set(publicSessionId, internalSessionId);
    return publicSessionId;
  }
}

export async function createLocalTestAuthHttpServer(
  options: Omit<AuthHttpServerOptions, 'gateway'>,
): Promise<StartedAuthHttpServer> {
  const gateway = await createLocalAuthGateway({
    now: options.now,
  });

  return createAuthHttpServer({
    ...options,
    exposeLocalTestRoutes: options.exposeLocalTestRoutes ?? true,
    gateway,
  });
}

export function createAuthHttpServer(
  options: AuthHttpServerOptions,
): StartedAuthHttpServer {
  const now = options.now ?? (() => new Date());
  const tokenGenerator = options.tokenGenerator ?? defaultTokenGenerator;
  const auditLog = createInMemoryServerAuditLog(now, tokenGenerator);
  const rateLimiter = options.rateLimiter ?? createInMemoryAuthRateLimiter();
  const basePath = options.basePath ?? defaultBasePath;
  const cookieOptions: AuthCookieOptions = {
    domain: options.cookieDomain,
    environment: options.environment,
    maxAgeSeconds: 30 * 60,
    path: basePath,
    sameSite: 'Lax',
  };
  const csrfCookieOptions: AuthCookieOptions = {
    ...cookieOptions,
    maxAgeSeconds: 60 * 60,
  };
  const handles = new SessionHandleStore(tokenGenerator);
  const handler = createAuthHttpHandler({
    ...options,
    auditLog,
    basePath,
    cookieOptions,
    csrfCookieOptions,
    handles,
    now,
    rateLimiter,
    tokenGenerator,
  });

  return {
    auditLog,
    gateway: options.gateway,
    server: createServer(handler),
  };
}

type RuntimeAuthHttpServerOptions = AuthHttpServerOptions & {
  auditLog: ServerAuditLog;
  basePath: string;
  cookieOptions: AuthCookieOptions;
  csrfCookieOptions: AuthCookieOptions;
  handles: SessionHandleStore;
  now: () => Date;
  rateLimiter: AuthRateLimiter;
  tokenGenerator: () => string;
};

function createAuthHttpHandler(
  options: RuntimeAuthHttpServerOptions,
): (request: IncomingMessage, response: ServerResponse) => void {
  return (request, response) => {
    void handleRequest(request, response, options).catch(() => {
      sendJson(response, 500, {
        error: authError('SERVER_ERROR', 'Serwer auth nie może obsłużyć żądania.', true),
        status: 'error',
      });
    });
  };
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  applyCors(request, response, options.allowedOrigins);

  if (request.method === 'OPTIONS') {
    response.statusCode = 204;
    response.end();
    return;
  }

  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);

  if (!url.pathname.startsWith(options.basePath)) {
    sendJson(response, 404, {
      error: authError('SERVER_ERROR', 'Nie znaleziono endpointu auth.', false),
      status: 'error',
    });
    return;
  }

  const route = url.pathname.slice(options.basePath.length) || '/';
  const method = request.method ?? 'GET';

  if (requiresCsrf(method)) {
    const csrf = validateCsrfRequest(request, {
      allowedHosts: options.allowedHosts,
      allowedOrigins: options.allowedOrigins,
    });

    if (!csrf.valid) {
      options.auditLog.append({
        eventType: 'auth.csrf_rejected',
        reason: 'CSRF_INVALID',
        result: 'denied',
      });
      sendJson(response, 403, {
        error: authError('CSRF_INVALID', 'Żądanie auth nie przeszło kontroli CSRF.', true),
        status: 'error',
      });
      return;
    }
  }

  if (method === 'GET' && route === '/csrf') {
    const csrfToken = createCsrfToken(options.now(), options.tokenGenerator);
    setCsrfCookie(response, csrfToken, options.csrfCookieOptions);
    sendJson(response, 200, {
      csrfToken,
      cookieName: authCsrfCookieName,
      status: 'success',
    });
    return;
  }

  if (method === 'GET' && route === '/session/current') {
    await restoreCurrentSession(request, response, options);
    return;
  }

  if (method === 'GET' && route === '/sessions') {
    await listSessions(request, response, options);
    return;
  }

  if (method === 'GET' && route === '/context/organizations') {
    await listOrganizations(request, response, options);
    return;
  }

  if (method === 'GET' && route === '/context/workspaces') {
    await listWorkspaces(request, response, options, url);
    return;
  }

  if (method === 'GET' && route === '/actor/current') {
    await currentActor(request, response, options);
    return;
  }

  if (method === 'GET' && route === '/local-test/outbox' && options.exposeLocalTestRoutes) {
    sendJson(response, 200, {
      status: 'success',
      value: options.gateway.getTestOutbox(),
    });
    return;
  }

  if (method === 'GET' && route === '/local-test/audit' && options.exposeLocalTestRoutes) {
    sendJson(response, 200, {
      status: 'success',
      value: [
        ...sanitizeAuditEvents(options.auditLog.list()),
        ...sanitizeAuditEvents(options.gateway.getAuditEvents()),
      ],
    });
    return;
  }

  const body = await readJsonBody(request);

  if (method === 'POST' && route === '/session/login') {
    await signIn(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/session/refresh') {
    await refreshSession(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/session/logout') {
    await logout(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/sessions/revoke') {
    await revokeSession(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/sessions/revoke-other') {
    await revokeOtherSessions(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/mfa/setup/begin') {
    await beginMfaSetup(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/mfa/setup/confirm') {
    await confirmMfaSetup(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/mfa/challenge/begin') {
    sendJson(response, 200, {
      status: 'success',
      value: {
        method: 'totp_dev',
        state: 'login_starts_challenge',
      },
    });
    return;
  }

  if (
    method === 'POST' &&
    (route === '/mfa/challenge/verify' || route === '/mfa/recovery/use')
  ) {
    await verifyMfa(response, body, options);
    return;
  }

  if (method === 'POST' && route === '/mfa/recovery/regenerate') {
    await regenerateRecoveryCodes(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/mfa/disable') {
    await disableMfa(request, response, options);
    return;
  }

  if (method === 'POST' && route === '/password/recovery/start') {
    await requestPasswordReset(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/password/reset/validate') {
    await validatePasswordReset(response, body, options);
    return;
  }

  if (method === 'POST' && route === '/password/reset/confirm') {
    await resetPassword(response, body, options);
    return;
  }

  if (method === 'POST' && route === '/password/change') {
    await changePassword(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/invitations/check') {
    await checkInvitation(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/invitations/accept') {
    await acceptInvitation(response, body, options);
    return;
  }

  if (method === 'POST' && route === '/invitations/create') {
    await createInvitation(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/invitations/resend') {
    await resendInvitation(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/invitations/cancel') {
    await cancelInvitation(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/context/select') {
    await selectWorkspace(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/context/validate') {
    await validateContext(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/authz/check') {
    await checkAuthorization(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/reauth/begin') {
    await beginReauthentication(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/reauth/confirm') {
    await confirmReauthentication(request, response, body, options);
    return;
  }

  if (method === 'POST' && route === '/reauth/validate') {
    await validateReauthentication(request, response, body, options);
    return;
  }

  sendJson(response, 404, {
    error: authError('SERVER_ERROR', 'Nie znaleziono endpointu auth.', false),
    status: 'error',
  });
}

async function signIn(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const email = getString(body, 'email');
  const limit = await enforceRateLimit(
    request,
    response,
    options,
    `login:${email.toLowerCase()}`,
    email,
  );

  if (!limit) {
    return;
  }

  const outcome = await options.gateway.signIn({
    email,
    password: getString(body, 'password'),
    returnUrl: getString(body, 'returnUrl'),
  });

  if (outcome.status === 'authenticated') {
    setSessionCookie(response, outcome.session.sessionId, options.cookieOptions);
  }

  sendJson(response, outcome.status === 'error' ? 401 : 200, redactLoginOutcome(outcome, options));
}

async function verifyMfa(
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const outcome = await options.gateway.verifyMfaChallenge({
    challengeId: asAuthChallengeId(getString(body, 'challengeId')),
    code: getString(body, 'code'),
  });

  if (outcome.status === 'authenticated') {
    setSessionCookie(response, outcome.session.sessionId, options.cookieOptions);
  }

  sendJson(response, outcome.status === 'error' ? 401 : 200, redactLoginOutcome(outcome, options));
}

async function restoreCurrentSession(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const sessionId = sessionIdFromCookie(request);

  if (!sessionId) {
    sendJson(response, 401, missingSessionResult());
    return;
  }

  const result = await options.gateway.restoreSession(sessionId);

  if (result.status !== 'active') {
    clearSessionCookie(response, options.cookieOptions);
  }

  sendJson(response, result.status === 'active' ? 200 : 401, redactSessionResult(result, options));
}

async function refreshSession(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const sessionId = sessionIdFromCookie(request);

  if (!sessionId) {
    sendJson(response, 401, missingSessionResult());
    return;
  }

  const result = await options.gateway.refreshSession(sessionId);

  if (result.status === 'active') {
    setSessionCookie(response, result.session.sessionId, options.cookieOptions);
  } else {
    clearSessionCookie(response, options.cookieOptions);
  }

  sendJson(response, result.status === 'active' ? 200 : 401, redactSessionResult(result, options));
}

async function logout(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const sessionId = sessionIdFromCookie(request);
  const result = sessionId
    ? await options.gateway.logout(sessionId)
    : {
        status: 'success',
        value: { redirectTo: '/auth/login' },
      } satisfies OperationResult<{ redirectTo: string }>;

  clearSessionCookie(response, options.cookieOptions);
  sendJson(response, 200, result);
}

async function listSessions(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.listSessions(active.sessionId);

  if (result.status === 'success') {
    sendJson(response, 200, {
      status: 'success',
      value: result.value.map((session) => options.handles.publicSession(session)),
    });
    return;
  }

  sendJson(response, 403, result);
}

async function revokeSession(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const target = options.handles.resolvePublicSessionId(
    asSessionId(getString(body, 'targetSessionId')),
  );

  if (!target) {
    sendJson(response, 404, {
      error: authError('SESSION_NOT_FOUND', 'Nie znaleziono sesji.', false),
      status: 'error',
    });
    return;
  }

  const result = await options.gateway.revokeSession(active.sessionId, target);

  if (result.status === 'success' && target === active.sessionId) {
    clearSessionCookie(response, options.cookieOptions);
  }

  sendJson(response, result.status === 'success' ? 200 : 403, redactOperationSession(result, options));
}

async function revokeOtherSessions(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.revokeOtherSessions(active.sessionId);

  if (result.status === 'success') {
    sendJson(response, 200, {
      status: 'success',
      value: result.value.map((session) => options.handles.publicSession(session)),
    });
    return;
  }

  sendJson(response, 403, result);
}

async function beginMfaSetup(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  sendJson(response, 200, {
    status: 'success',
    value: {
      method: 'totp_dev',
      secretDelivery: 'server_only_local_test',
    },
  });
}

async function confirmMfaSetup(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.configureMfa(active.sessionId);
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function regenerateRecoveryCodes(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.regenerateRecoveryCodes(active.sessionId);
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function disableMfa(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.disableMfa(active.sessionId);
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function requestPasswordReset(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const email = getString(body, 'email');
  const limit = await enforceRateLimit(
    request,
    response,
    options,
    `password-reset:${email.toLowerCase()}`,
    email,
  );

  if (!limit) {
    return;
  }

  const result = await options.gateway.requestPasswordReset({ email });
  sendJson(response, result.status === 'success' ? 200 : 400, result);
}

async function validatePasswordReset(
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const result = await options.gateway.validatePasswordResetToken({
    token: getString(body, 'token'),
  });
  sendJson(response, result.status === 'success' ? 200 : 400, result);
}

async function resetPassword(
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const result = await options.gateway.resetPassword({
    confirmPassword: getString(body, 'confirmPassword'),
    newPassword: getString(body, 'newPassword'),
    token: getString(body, 'token'),
  });

  if (result.status === 'success') {
    clearSessionCookie(response, options.cookieOptions);
  }

  sendJson(response, result.status === 'success' ? 200 : 400, result);
}

async function changePassword(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.changePasswordAfterReauthentication({
    confirmPassword: getString(body, 'confirmPassword'),
    currentPassword: getString(body, 'currentPassword'),
    newPassword: getString(body, 'newPassword'),
    sessionId: active.sessionId,
  });

  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function checkInvitation(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const email = getString(body, 'email');
  const limit = await enforceRateLimit(
    request,
    response,
    options,
    `invitation-check:${email.toLowerCase()}:${clientAddress(request)}`,
    email,
  );

  if (!limit) {
    return;
  }

  const result = await options.gateway.checkInvitationToken({
    email,
    token: getString(body, 'token'),
  });
  sendJson(response, result.status === 'success' ? 200 : 400, result);
}

async function acceptInvitation(
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const outcome = await options.gateway.acceptInvitation({
    email: getString(body, 'email'),
    password: getString(body, 'password'),
    token: getString(body, 'token'),
  });

  if (outcome.status === 'authenticated') {
    setSessionCookie(response, outcome.session.sessionId, options.cookieOptions);
  }

  sendJson(response, outcome.status === 'authenticated' ? 200 : 400, redactLoginOutcome(outcome, options));
}

async function createInvitation(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const actor = await options.gateway.getActorContext(active.sessionId);

  if (actor.status === 'error') {
    sendJson(response, 403, actor);
    return;
  }

  const result = await options.gateway.createInvitation(actor.value, {
    email: getString(body, 'email'),
    organizationId: asOrganizationId(getString(body, 'organizationId')),
    requestedRole: getString(body, 'requestedRole') as Role,
    workspaceId: asWorkspaceId(getString(body, 'workspaceId')),
  });
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function resendInvitation(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const actor = await actorFromActiveSession(request, response, options);

  if (!actor) {
    return;
  }

  const result = await options.gateway.resendInvitation(
    actor,
    asInvitationId(getString(body, 'invitationId')),
  );
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function cancelInvitation(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const actor = await actorFromActiveSession(request, response, options);

  if (!actor) {
    return;
  }

  const result = await options.gateway.cancelInvitation(
    actor,
    asInvitationId(getString(body, 'invitationId')),
  );
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function currentActor(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const actor = await options.gateway.getActorContext(active.sessionId);
  sendJson(response, actor.status === 'success' ? 200 : 403, actor);
}

async function listOrganizations(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const context = active.result.context;

  if (context.status === 'organization_selection_required') {
    sendJson(response, 200, { status: 'success', value: context.organizations });
    return;
  }

  if ('organization' in context && context.organization) {
    sendJson(response, 200, { status: 'success', value: [context.organization] });
    return;
  }

  sendJson(response, 403, {
    error: 'error' in context
      ? context.error
      : authError('NO_ACTIVE_MEMBERSHIP', 'Brak aktywnego membershipu.', false),
    status: 'error',
  });
}

async function listWorkspaces(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
  url: URL,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const organizationId = url.searchParams.get('organizationId');
  const context = active.result.context;

  if (context.status === 'workspace_selection_required') {
    sendJson(response, 200, {
      status: 'success',
      value: context.workspaces.filter(
        (workspace) => !organizationId || workspace.organizationId === organizationId,
      ),
    });
    return;
  }

  if (context.status === 'workspace_selected' && (!organizationId || context.workspace.organizationId === organizationId)) {
    sendJson(response, 200, { status: 'success', value: [context.workspace] });
    return;
  }

  sendJson(response, 403, {
    error: 'error' in context ? context.error : authError('NO_ACTIVE_MEMBERSHIP', 'Brak aktywnego membershipu.', false),
    status: 'error',
  });
}

async function selectWorkspace(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const tenant = tenantFromBody(body);
  const result = await options.gateway.selectWorkspace(active.sessionId, tenant);

  sendJson(response, result.status === 'success' ? 200 : 403, {
    ...result,
    clearClientWorkspaceCache: result.status === 'success',
  });
}

async function validateContext(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.selectWorkspace(active.sessionId, tenantFromBody(body));
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function checkAuthorization(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.authorizeOperation(
    active.sessionId,
    asCapability(getString(body, 'capability')) as Capability,
    tenantFromBody(body),
  );
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function beginReauthentication(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  sendJson(response, 200, {
    status: 'success',
    value: {
      purpose: reauthenticationPurposeFromBody(body),
      state: 'password_required',
    },
  });
}

async function confirmReauthentication(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const password = getString(body, 'password');
  const purpose = reauthenticationPurposeFromBody(body);
  const confirmed = await options.gateway.reauthenticate({
    password,
    purpose,
    sessionId: active.sessionId,
  });

  if (confirmed.status === 'error') {
    sendJson(response, 403, confirmed);
    return;
  }

  const rotated = await options.gateway.refreshSession(active.sessionId);

  if (rotated.status !== 'active') {
    clearSessionCookie(response, options.cookieOptions);
    sendJson(response, 401, redactSessionResult(rotated, options));
    return;
  }

  const rotatedConfirmation = await options.gateway.reauthenticate({
    password,
    purpose,
    sessionId: rotated.session.sessionId,
  });

  setSessionCookie(response, rotated.session.sessionId, options.cookieOptions);
  sendJson(response, rotatedConfirmation.status === 'success' ? 200 : 403, rotatedConfirmation);
}

async function validateReauthentication(
  request: IncomingMessage,
  response: ServerResponse,
  body: unknown,
  options: RuntimeAuthHttpServerOptions,
): Promise<void> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return;
  }

  const result = await options.gateway.validateReauthenticationContext({
    purpose: reauthenticationPurposeFromBody(body),
    sessionId: active.sessionId,
  });
  sendJson(response, result.status === 'success' ? 200 : 403, result);
}

async function actorFromActiveSession(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<ActorContext | undefined> {
  const active = await requireActiveSession(request, response, options);

  if (!active) {
    return undefined;
  }

  const actor = await options.gateway.getActorContext(active.sessionId);

  if (actor.status === 'error') {
    sendJson(response, 403, actor);
    return undefined;
  }

  return actor.value;
}

async function requireActiveSession(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
): Promise<
  | {
      result: Extract<SessionResult, { status: 'active' }>;
      sessionId: SessionId;
    }
  | undefined
> {
  const sessionId = sessionIdFromCookie(request);

  if (!sessionId) {
    options.auditLog.append({
      eventType: 'auth.unauthorized_access_attempt',
      reason: 'UNAUTHENTICATED',
      result: 'denied',
    });
    sendJson(response, 401, missingSessionResult());
    return undefined;
  }

  const result = await options.gateway.restoreSession(sessionId);

  if (result.status !== 'active') {
    clearSessionCookie(response, options.cookieOptions);
    sendJson(response, 401, redactSessionResult(result, options));
    return undefined;
  }

  return {
    result,
    sessionId,
  };
}

async function enforceRateLimit(
  request: IncomingMessage,
  response: ServerResponse,
  options: RuntimeAuthHttpServerOptions,
  key: string,
  email?: string,
): Promise<boolean> {
  const decision = await options.rateLimiter.check(
    `${key}:${clientAddress(request)}`,
    options.now(),
  );

  if (decision.allowed) {
    return true;
  }

  options.auditLog.append({
    eventType: 'auth.rate_limited',
    reason: 'RATE_LIMITED',
    result: 'denied',
    target: email ? { email: maskEmail(email) } : undefined,
  });
  response.setHeader('Retry-After', Math.ceil(decision.retryAfterMs / 1000).toString());
  sendJson(response, 429, {
    error: authError(
      'RATE_LIMITED',
      'Operacja jest czasowo ograniczona. Spróbuj ponownie później.',
      true,
    ),
    status: 'error',
  });
  return false;
}

function applyCors(
  request: IncomingMessage,
  response: ServerResponse,
  allowedOrigins: readonly string[],
): void {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader(
      'Access-Control-Allow-Headers',
      'content-type, x-papadata-csrf, x-papadata-correlation-id',
    );
    response.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS',
    );
  }

  response.setHeader('Vary', 'Origin');
}

function requiresCsrf(method: string): boolean {
  return method !== 'GET' && method !== 'HEAD';
}

async function readJsonBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.byteLength;

    if (size > 64 * 1024) {
      throw new Error('Auth request body is too large.');
    }

    chunks.push(buffer);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
}

function getString(body: unknown, key: string): string {
  if (!isRecord(body)) {
    return '';
  }

  const value = body[key];
  return typeof value === 'string' ? value : '';
}

function tenantFromBody(body: unknown): TenantContext {
  return {
    organizationId: asOrganizationId(getString(body, 'organizationId')),
    workspaceId: asWorkspaceId(getString(body, 'workspaceId')),
  };
}

function reauthenticationPurposeFromBody(body: unknown): ReauthenticationPurpose {
  const value = getString(body, 'purpose');
  const allowed: readonly ReauthenticationPurpose[] = [
    'change_password',
    'disable_mfa',
    'regenerate_recovery_codes',
    'revoke_session',
    'admin_action',
    'export',
    'ai_action',
  ];

  if (allowed.includes(value as ReauthenticationPurpose)) {
    return value as ReauthenticationPurpose;
  }

  return 'admin_action';
}

function sessionIdFromCookie(request: IncomingMessage): SessionId | undefined {
  const value = getCookie(request, authSessionCookieName);
  return value ? asSessionId(value) : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function redactLoginOutcome(
  outcome: LoginOutcome,
  options: RuntimeAuthHttpServerOptions,
): LoginOutcome {
  if (outcome.status !== 'authenticated') {
    return outcome;
  }

  return {
    ...outcome,
    session: options.handles.publicSession(outcome.session),
  };
}

function redactSessionResult(
  result: SessionResult,
  options: RuntimeAuthHttpServerOptions,
): SessionResult {
  if (result.status !== 'active') {
    return result;
  }

  return {
    ...result,
    session: options.handles.publicSession(result.session),
  };
}

function redactOperationSession(
  result: OperationResult<AuthSession>,
  options: RuntimeAuthHttpServerOptions,
): OperationResult<AuthSession> {
  if (result.status === 'error') {
    return result;
  }

  return {
    status: 'success',
    value: options.handles.publicSession(result.value),
  };
}

function sanitizeAuditEvents(events: readonly AuditEvent[]): readonly AuditEvent[] {
  return events.map((event) => ({
    ...event,
    target: event.target?.sessionId
      ? {
          ...event.target,
          sessionId: publicCurrentSessionId,
        }
      : event.target,
  }));
}

function missingSessionResult(): SessionResult {
  return {
    error: authError('UNAUTHENTICATED', 'Brak aktywnej sesji.', true),
    status: 'missing',
  };
}

function authError(
  code: AuthError['code'],
  message: string,
  retrySafe: boolean,
): AuthError {
  return {
    code,
    message,
    retrySafe,
  };
}

function clientAddress(request: IncomingMessage): string {
  const forwardedFor = request.headers['x-forwarded-for'];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] ?? 'unknown';
  }

  return forwardedFor ?? request.socket.remoteAddress ?? 'unknown';
}

function sendJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', jsonContentType);
  response.end(JSON.stringify(body));
}

function defaultTokenGenerator(): string {
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
