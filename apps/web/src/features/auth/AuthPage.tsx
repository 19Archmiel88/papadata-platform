import { useSession } from '../../app/providers';
import {
  navigate,
  safeReturnTo,
} from '../../app/routing/navigation';
import {
  bffClient,
  type BffSession,
} from '../../shared/api/bffClient';
import {
  AuthSurface,
  type AuthSurfaceMode,
} from './AuthSurface';
import { CookieConsentBanner } from './CookieConsentBanner';

const AUTH_PATHS = new Set([
  '/accept-invite',
  '/auth',
  '/login',
  '/mfa',
  '/reauth',
  '/recover-access',
  '/register',
  '/select-workspace',
]);

export function AuthPage({
  mode,
}: {
  readonly mode: AuthSurfaceMode;
}) {
  const {
    login,
    refresh,
    register,
    selectWorkspace,
    session,
    stepUp,
  } = useSession();
  const params = new URLSearchParams(window.location.search);
  const rawReturnTo = params.get('returnTo');
  const returnTo = safeReturnTo(rawReturnTo);
  const initialEmail = params.get('email') ?? '';
  const resetToken = params.get('token');
  const invitationId = mode === 'accept-invite' ? params.get('invitationId') : null;
  const invitationToken = mode === 'accept-invite' ? params.get('token') : null;
  const showLoggedOut = mode === 'login' && params.get('loggedOut') === '1';

  function navigateWithinAuth(path: string) {
    if (!rawReturnTo || !isAuthPath(path)) {
      navigate(path);
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set('returnTo', returnTo);
    navigate(`${path}?${nextParams.toString()}`);
  }

  function navigateAfterAuthentication(nextSession: BffSession) {
    if (nextSession.memberships.length > 1) {
      const nextParams = new URLSearchParams();
      nextParams.set('returnTo', returnTo);
      navigate(`/select-workspace?${nextParams.toString()}`, { replace: true });
      return;
    }

    navigate(returnTo, { replace: true });
  }

  return (
    <>
      <AuthSurface
        initialEmail={initialEmail}
        initialInvitationId={invitationId}
        initialInvitationToken={invitationToken}
        initialResetToken={resetToken}
        mode={mode}
        onAcceptInvitation={async (input) => {
          const { displayName, invitationId: id, password, token } = input;
          const result = await bffClient.acceptInvitation({
            displayName,
            invitationId: id,
            password,
            token,
          });
          if (!result.accepted || !result.email) {
            throw new Error('Nie udało się dołączyć do zespołu.');
          }
          const nextSession = await login({ email: result.email, password });
          navigateAfterAuthentication(nextSession);
        }}
        onLogin={async (input) => {
          const nextSession = await login(input);
          navigateAfterAuthentication(nextSession);
        }}
        onMfaConfirm={async (input) => {
          await bffClient.confirmMfa(input);
          await refresh();
          navigate(returnTo, { replace: true });
        }}
        onNavigate={navigateWithinAuth}
        onPasswordRecoveryRequest={(input) =>
          bffClient.requestPasswordRecovery(input)}
        onPasswordReset={async (input) => {
          const {
            newPasswordConfirmation,
            ...resetInput
          } = input;
          void newPasswordConfirmation;
          await bffClient.resetPassword(resetInput);
          navigate('/login', { replace: true });
        }}
        onRegister={async (input) => {
          const nextSession = await register(input);
          navigateAfterAuthentication(nextSession);
        }}
        onRetry={refresh}
        onSelectWorkspace={async (workspaceId) => {
          await selectWorkspace(workspaceId);
          navigate(returnTo, { replace: true });
        }}
        onStepUpConfirm={async (input) => {
          await stepUp(input.code, 'account.reauth');
          navigate(returnTo, { replace: true });
        }}
        onValidateInvitation={(input) => bffClient.validateInvitation(input)}
        state={showLoggedOut ? 'loggedOut' : undefined}
        workspaceOptions={session?.memberships ?? []}
      />
      <CookieConsentBanner />
    </>
  );
}

function isAuthPath(path: string) {
  return AUTH_PATHS.has(path);
}
