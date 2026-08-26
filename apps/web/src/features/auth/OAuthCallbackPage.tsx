import {
  useEffect,
  useState,
} from 'react';
import {
  Button,
  InlineNotice,
  Spinner,
} from '../../design-system/components';
import { useSession } from '../../app/providers';
import {
  navigate,
  safeReturnTo,
} from '../../app/routing/navigation';
import {
  bffClient,
  BffProblem,
} from '../../shared/api/bffClient';
import {
  businessOutcomeMessage,
  oauthErrorMessage,
  resolvePostAuthDestination,
} from './oauthOutcomes';
import './auth-surface.css';

type CallbackState =
  | { readonly kind: 'processing' }
  | { readonly kind: 'error'; readonly message: string };

// The landing page every Google/Microsoft redirect returns to. No auth-
// status guard (mirrors /accept-invite): this route's job is establishing
// or changing session state, not requiring a pre-existing one.
export function OAuthCallbackPage() {
  const { applySession } = useSession();
  const [state, setState] = useState<CallbackState>({ kind: 'processing' });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const providerError = params.get('error');
      if (providerError) {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'Logowanie zostało anulowane lub odrzucone przez dostawcę.',
          });
        }
        return;
      }

      const code = params.get('code');
      const oauthState = params.get('state');
      if (!code || !oauthState) {
        if (!cancelled) {
          setState({
            kind: 'error',
            message: 'Brak wymaganych parametrów w odpowiedzi dostawcy.',
          });
        }
        return;
      }

      try {
        const result = await bffClient.completeOAuthCallback({ code, state: oauthState });
        if (cancelled) return;
        const returnTo = safeReturnTo(result.returnTo);

        if (result.outcome === 'authenticated') {
          applySession(result.session, result.user);
          navigate(resolvePostAuthDestination(result.session.memberships.length, returnTo), { replace: true });
          return;
        }

        if (result.outcome === 'reauth_confirmed') {
          applySession(result.session, null);
          navigate(returnTo, { replace: true });
          return;
        }

        if (result.outcome === 'linked') {
          navigate(returnTo, { replace: true });
          return;
        }

        setState({ kind: 'error', message: businessOutcomeMessage(result.outcome) });
      } catch (cause) {
        if (cancelled) return;
        const code = cause instanceof BffProblem ? cause.code : null;
        const fallbackMessage = cause instanceof Error
          ? cause.message
          : 'Nie udało się dokończyć logowania.';
        setState({ kind: 'error', message: oauthErrorMessage(code, fallbackMessage) });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applySession]);

  if (state.kind === 'processing') {
    return (
      <main aria-live="polite" className="pd-oauth-callback" role="status">
        <Spinner delayMs={0} label="Kończymy logowanie..." size={32} />
        <p>Kończymy logowanie...</p>
      </main>
    );
  }

  return (
    <main className="pd-oauth-callback">
      <InlineNotice
        message={state.message}
        title="Logowanie się nie powiodło"
        tone="critical"
      />
      <Button onClick={() => navigate('/login')} size="large">
        Wróć do logowania
      </Button>
    </main>
  );
}
