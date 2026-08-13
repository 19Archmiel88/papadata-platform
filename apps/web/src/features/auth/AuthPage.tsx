import { useSession } from '../../app/providers';
import {
  navigate,
  safeReturnTo,
} from '../../app/routing/navigation';
import {
  bffClient,
} from '../../shared/api/bffClient';
import {
  AuthSurface,
  type AuthSurfaceMode,
} from './AuthSurface';

export function AuthPage({
  mode,
}: {
  readonly mode: AuthSurfaceMode;
}) {
  const { login, refresh, register } = useSession();
  const params = new URLSearchParams(window.location.search);
  const rawReturnTo = params.get('returnTo');
  const returnTo = safeReturnTo(rawReturnTo);
  const initialEmail = params.get('email') ?? '';
  const resetToken = params.get('token');

  function navigateWithinAuth(path: string) {
    if (!rawReturnTo || !isAuthPath(path)) {
      navigate(path);
      return;
    }

    const nextParams = new URLSearchParams();
    nextParams.set('returnTo', returnTo);
    navigate(`${path}?${nextParams.toString()}`);
  }

  return (
    <AuthSurface
      initialEmail={initialEmail}
      initialResetToken={resetToken}
      mode={mode}
      onLogin={async (input) => {
        await login(input);
        navigate(returnTo, { replace: true });
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
        await register(input);
        navigate(returnTo, { replace: true });
      }}
      onRetry={refresh}
    />
  );
}

const authPaths = new Set([
  '/auth',
  '/login',
  '/mfa',
  '/recover-access',
  '/register',
]);

function isAuthPath(path: string) {
  return authPaths.has(path);
}
