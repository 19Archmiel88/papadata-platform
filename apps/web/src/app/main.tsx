import { StrictMode, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import '../design-system/foundations/foundations.css';
import {
  applyPapaDataRuntimeGlobals,
} from '../design-system/foundations/runtime/index';
import {
  AuthSurface,
  type AuthAcceptInvitationInput,
  type AuthLoginInput,
  type AuthMfaInput,
  type AuthPasswordResetInput,
  type AuthRecoveryRequestInput,
  type AuthRegisterInput,
  type AuthStepUpInput,
  type AuthSurfaceMode,
  type AuthSurfaceState,
} from '../storybook-next/runtime/features/auth/AuthSurface';
import {
  navigate,
  safeReturnTo,
  useLocationPath,
} from '../storybook-next/runtime/app/routing/navigation';
import {
  createRuntimeShellCommands,
  createRuntimeShellNavigation,
  ProductShellFrame,
  type ShellUser,
  type ShellWorkspace,
} from '../storybook-next/runtime/shell/index';
import {
  bffClient,
  type BffSession,
} from '../storybook-next/runtime/shared/api/bffClient';
import {
  type AuthSessionRuntime,
  useAuthSessionRuntime,
} from '../storybook-next/runtime/shared/auth/authSessionRuntime';
import './runtime-app.css';

applyPapaDataRuntimeGlobals(document.documentElement, {
  density: 'comfortable',
  locale: 'pl',
  motion: 'standard',
  theme: 'refractive-prism',
});

function RuntimeApp() {
  const locationPath = useLocationPath();
  const runtime = useAuthSessionRuntime(bffClient);
  const authMode = resolveAuthMode(locationPath);

  if (runtime.status === 'initializing') {
    return <main className="pd-runtime-loading">Ładowanie PapaData...</main>;
  }

  const showAuthSurface = runtime.status === 'service_unavailable'
    || runtime.status === 'reauth_required'
    || authMode !== null
    || runtime.status === 'anonymous';

  if (showAuthSurface) {
    return <RuntimeAuthSurface authMode={authMode} locationPath={locationPath} runtime={runtime} />;
  }

  return runtime.session ? (
    <AuthenticatedRuntimeShell
      activePath={locationPath.startsWith('/app') ? locationPath : '/app'}
      runtime={runtime}
      session={runtime.session}
    />
  ) : null;
}

function RuntimeAuthSurface({
  authMode,
  locationPath,
  runtime,
}: {
  readonly authMode: AuthSurfaceMode | null;
  readonly locationPath: string;
  readonly runtime: AuthSessionRuntime;
}) {
  const mode: AuthSurfaceMode = runtime.status === 'reauth_required'
    ? (runtime.reauth?.level === 'mfa' ? 'mfa' : 'reauth')
    : (authMode ?? 'login');
  const state: AuthSurfaceState = runtime.status === 'service_unavailable' ? 'serviceUnavailable' : 'ready';

  function postReauthReturnTo(): string {
    return safeReturnTo(runtime.reauth?.returnTo ?? queryParam('returnTo'));
  }

  return (
    <AuthSurface
      initialEmail={queryParam('email') ?? ''}
      initialInvitationId={queryParam('invitationId')}
      initialInvitationToken={queryParam('token')}
      initialResetToken={queryParam('resetToken')}
      mode={mode}
      onAcceptInvitation={async (input: AuthAcceptInvitationInput) => {
        await bffClient.acceptInvitation({
          displayName: input.displayName,
          invitationId: input.invitationId,
          password: input.password,
          token: input.token,
        });
        navigate('/login');
      }}
      onLogin={async (input: AuthLoginInput) => {
        const result = await bffClient.login(input);
        runtime.applySession(result.session);
        navigate(safeReturnTo(queryParam('returnTo')));
      }}
      onMfaConfirm={async (input: AuthMfaInput) => {
        // Elevates the current (already-authenticated) session's authLevel
        // by proving an already-enrolled TOTP factor -- this is the
        // ordinary per-login/per-reauth check, so it must call
        // POST /api/v1/auth/mfa/verify, never mfa/confirm (that endpoint
        // is reserved for confirming a brand-new enrollment and, on
        // success, revokes every sibling session for the account -- the
        // wrong side effect for a routine login).
        const result = await bffClient.verifyMfa(input);
        runtime.applySession(result.session);
        navigate(postReauthReturnTo());
      }}
      onNavigate={navigate}
      onOAuthContinue={async () => {
        // No dedicated OAuth callback landing route exists in this
        // runtime shell yet (the BffClient contract -- startOAuth /
        // completeOAuthCallback -- is ready, but wiring the redirect
        // button without a way to complete the return trip would strand
        // the user mid-flow). Tracked as an explicit Phase 8 follow-up;
        // oauthAvailability is intentionally left unset above so the
        // buttons render as disabled/"configuration required" rather
        // than reaching this handler.
        throw new Error('OAuth is not configured for this production-parity shell.');
      }}
      onPasswordRecoveryRequest={async (input: AuthRecoveryRequestInput) => {
        await bffClient.requestPasswordRecovery(input);
      }}
      onPasswordReset={async (input: AuthPasswordResetInput) => {
        await bffClient.resetPassword({
          email: input.email,
          newPassword: input.newPassword,
          otp: input.otp,
          resetToken: input.resetToken,
        });
        navigate('/login');
      }}
      onRegister={async (input: AuthRegisterInput) => {
        const result = await bffClient.register(input);
        runtime.applySession(result.session);
        navigate('/app');
      }}
      onRetry={runtime.retryBootstrap}
      onSelectWorkspace={async (workspaceId: string) => {
        const nextSession = await runtime.runAuthenticatedCommand(
          () => bffClient.selectWorkspace(workspaceId),
          locationPath,
        );
        runtime.applySession(nextSession);
        navigate('/app');
      }}
      onStepUpConfirm={async (input: AuthStepUpInput) => {
        const result = await bffClient.stepUp({
          code: input.code,
          operationScope: 'runtime.shell',
        });
        runtime.applySession(result.session);
        navigate(postReauthReturnTo());
      }}
      onValidateInvitation={(input) => bffClient.validateInvitation(input)}
      state={state}
      workspaceOptions={sessionToWorkspaceOptions(runtime.session)}
    />
  );
}

function AuthenticatedRuntimeShell({
  activePath,
  runtime,
  session,
}: {
  readonly activePath: string;
  readonly runtime: AuthSessionRuntime;
  readonly session: BffSession;
}) {
  const navigationGroups = useMemo(
    () => createRuntimeShellNavigation(session.capabilities),
    [session.capabilities],
  );
  const commands = useMemo(
    () => createRuntimeShellCommands(navigationGroups),
    [navigationGroups],
  );

  return (
    <ProductShellFrame
      activePath={activePath}
      activeTenantId={session.activeTenantId}
      activeUserId={session.userId}
      activeWorkspaceId={session.activeWorkspaceId}
      commands={commands}
      navigationGroups={navigationGroups}
      onLogout={async () => {
        // bffClient.logout() ends the local session (and, for an
        // already-expired one, swallows the resulting 401) by publishing
        // a 'logout' event -- the session runtime's subscription reacts
        // to that and transitions to anonymous, including in every other
        // open tab, so no local state needs clearing here.
        await bffClient.logout();
        navigate('/auth');
      }}
      onNavigate={navigate}
      onSelectWorkspace={async (workspaceId) => {
        const nextSession = await runtime.runAuthenticatedCommand(
          () => bffClient.selectWorkspace(workspaceId),
          activePath,
        );
        runtime.applySession(nextSession);
      }}
      user={sessionToShellUser(session)}
      workspaces={sessionToShellWorkspaces(session)}
    >
      <section className="pd-runtime-dashboard" aria-labelledby="pd-runtime-dashboard-title">
        <p className="pd-runtime-dashboard__eyebrow">Production runtime</p>
        <h1 id="pd-runtime-dashboard-title">Centrum Dowodzenia</h1>
        <p>
          PapaData działa na produkcyjnych entrypointach BFF i API przez kanoniczny edge.
        </p>
      </section>
    </ProductShellFrame>
  );
}

function resolveAuthMode(path: string): AuthSurfaceMode | null {
  const pathname = path.split('?', 1)[0] ?? '/';
  if (pathname === '/' || pathname === '/auth') return 'entry';
  if (pathname === '/login' || pathname === '/auth/login') return 'login';
  if (pathname === '/register' || pathname === '/auth/register') return 'register';
  if (pathname === '/recover-access' || pathname === '/auth/recover-access') return 'recover';
  if (pathname === '/mfa' || pathname === '/auth/mfa') return 'mfa';
  if (pathname === '/reauth' || pathname === '/auth/reauth') return 'reauth';
  if (pathname === '/workspace' || pathname === '/auth/workspace') return 'workspace';
  if (pathname === '/accept-invite' || pathname === '/auth/accept-invite') return 'accept-invite';
  return null;
}

function queryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

function sessionToShellUser(session: BffSession): ShellUser {
  const activeMembership = session.memberships.find((membership) => (
    membership.tenantId === session.activeTenantId
    && membership.workspaceId === session.activeWorkspaceId
  ));
  return {
    displayName: session.user?.displayName ?? 'Użytkownik PapaData',
    email: session.user?.email ?? session.userId,
    role: activeMembership?.roles[0] ?? 'Użytkownik',
  };
}

function sessionToShellWorkspaces(session: BffSession): readonly ShellWorkspace[] {
  return session.memberships.map((membership) => ({
    capabilities: membership.capabilities,
    id: membership.workspaceId,
    name: membership.workspaceName ?? membership.workspaceId,
    role: membership.roles[0] ?? 'Użytkownik',
    statusText: 'Aktywny',
    tone: 'success',
  }));
}

function sessionToWorkspaceOptions(session: BffSession | null) {
  return session?.memberships.map((membership) => ({
    tenantId: membership.tenantId,
    tenantName: membership.tenantName,
    workspaceId: membership.workspaceId,
    workspaceName: membership.workspaceName,
  })) ?? [];
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point.');

createRoot(root).render(
  <StrictMode>
    <RuntimeApp />
  </StrictMode>,
);
