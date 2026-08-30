import { StrictMode, useEffect, useMemo, useState } from 'react';
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
  BffProblem,
  type BffSession,
} from '../storybook-next/runtime/shared/api/bffClient';
import './runtime-app.css';

applyPapaDataRuntimeGlobals(document.documentElement, {
  density: 'comfortable',
  locale: 'pl',
  motion: 'standard',
  theme: 'refractive-prism',
});

function RuntimeApp() {
  const locationPath = useLocationPath();
  const [session, setSession] = useState<BffSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    bffClient.readSession()
      .then((nextSession) => {
        if (cancelled) return;
        setSession(nextSession);
        setProblem(null);
      })
      .catch((cause: unknown) => {
        if (cancelled) return;
        setSession(null);
        setProblem(readProblemMessage(cause));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const authMode = resolveAuthMode(locationPath);
  if (authMode || (!loading && !session)) {
    return (
      <AuthSurface
        mode={authMode ?? 'login'}
        onAcceptInvitation={async (_input: AuthAcceptInvitationInput) => {
          throw new Error('Invitation acceptance is not enabled in this runtime shell.');
        }}
        onLogin={async (input: AuthLoginInput) => {
          const result = await bffClient.login(input);
          setSession(result.session);
          navigate(safeReturnTo(new URLSearchParams(window.location.search).get('returnTo')));
        }}
        onMfaConfirm={async (input: AuthMfaInput) => {
          const result = await bffClient.confirmMfa(input);
          setSession(result.session);
          navigate('/app');
        }}
        onNavigate={navigate}
        onOAuthContinue={async () => {
          throw new Error('OAuth is not configured for this production-parity shell.');
        }}
        onPasswordRecoveryRequest={async (_input: AuthRecoveryRequestInput) => {
          throw new Error('Password recovery is not enabled in this runtime shell.');
        }}
        onPasswordReset={async (_input: AuthPasswordResetInput) => {
          throw new Error('Password reset is not enabled in this runtime shell.');
        }}
        onRegister={async (input: AuthRegisterInput) => {
          const result = await bffClient.register(input);
          setSession(result.session);
          navigate('/app');
        }}
        onRetry={async () => {
          const nextSession = await bffClient.readSession();
          setSession(nextSession);
          setProblem(null);
        }}
        onSelectWorkspace={async (workspaceId: string) => {
          const nextSession = await bffClient.selectWorkspace(workspaceId);
          setSession(nextSession);
          navigate('/app');
        }}
        onStepUpConfirm={async (input: AuthStepUpInput) => {
          const result = await bffClient.stepUp({
            code: input.code,
            operationScope: 'runtime.shell',
          });
          setSession(result.session);
          navigate('/app');
        }}
        state={problem ? 'serviceUnavailable' : 'ready'}
        workspaceOptions={sessionToWorkspaceOptions(session)}
      />
    );
  }

  if (loading) {
    return <main className="pd-runtime-loading">Ładowanie PapaData...</main>;
  }

  return session ? (
    <AuthenticatedRuntimeShell
      activePath={locationPath.startsWith('/app') ? locationPath : '/app'}
      session={session}
      setSession={setSession}
    />
  ) : null;
}

function AuthenticatedRuntimeShell({
  activePath,
  session,
  setSession,
}: {
  readonly activePath: string;
  readonly session: BffSession;
  readonly setSession: (session: BffSession | null) => void;
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
        await bffClient.logout();
        setSession(null);
        navigate('/auth');
      }}
      onNavigate={navigate}
      onSelectWorkspace={async (workspaceId) => {
        setSession(await bffClient.selectWorkspace(workspaceId));
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

function resolveAuthMode(path: string) {
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

function readProblemMessage(cause: unknown): string {
  if (cause instanceof BffProblem) return cause.message;
  return cause instanceof Error ? cause.message : 'Runtime BFF is unavailable.';
}

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point.');

createRoot(root).render(
  <StrictMode>
    <RuntimeApp />
  </StrictMode>,
);
