import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';

import {
  Button,
  PasswordField,
  TextField,
} from '../../design-system';
import { useSession } from '../../app/providers';
import {
  navigate,
  safeReturnTo,
} from '../../app/routing/navigation';

type AuthMode = 'login' | 'register';

export function AuthPage({
  mode,
}: {
  readonly mode: AuthMode;
}) {
  const { login, register } = useSession();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const isRegister = mode === 'register';
  const title = isRegister ? 'Utwórz konto' : 'Zaloguj się';
  const submitLabel = isRegister ? 'Utwórz konto' : 'Zaloguj się';
  const alternativeLabel = isRegister
    ? 'Masz już konto? Zaloguj się'
    : 'Nie masz konta? Utwórz konto';

  const passwordRequirements = useMemo(() => [
    { id: 'length', label: 'Co najmniej 12 znaków', met: password.length >= 12 },
  ], [password.length]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setProblem(null);
    try {
      if (isRegister) {
        await register({
          email: email.trim(),
          fullName: fullName.trim(),
          password,
        });
      } else {
        await login({
          email: email.trim(),
          password,
        });
      }

      const params = new URLSearchParams(window.location.search);
      navigate(safeReturnTo(params.get('returnTo')), { replace: true });
    } catch (cause) {
      setProblem(cause instanceof Error ? cause.message : 'Operacja nie powiodła się.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="runtime-auth">
      <section className="runtime-auth__card" aria-labelledby="auth-title">
        <div className="runtime-auth__brand">PapaData</div>
        <p className="runtime-auth__eyebrow">Lokalny runtime produktu</p>
        <h1 id="auth-title">{title}</h1>
        <p className="runtime-auth__description">
          Formularz korzysta z rzeczywistego BFF, sesji HttpOnly i kontraktu Auth.
        </p>

        {problem ? (
          <div className="runtime-alert" role="alert">
            {problem}
          </div>
        ) : null}

        <form className="runtime-auth__form" onSubmit={submit}>
          {isRegister ? (
            <TextField
              autocomplete="name"
              label="Imię i nazwisko"
              onChange={(event) => setFullName(event.currentTarget.value)}
              required
              value={fullName}
            />
          ) : null}

          <TextField
            autocomplete="email"
            inputType="email"
            label="E-mail"
            onChange={(event) => setEmail(event.currentTarget.value)}
            required
            value={email}
          />

          <PasswordField
            autocomplete={isRegister ? 'new-password' : 'current-password'}
            label="Hasło"
            onChange={(event) => setPassword(event.currentTarget.value)}
            onVisibilityChange={setPasswordVisible}
            requirements={isRegister ? passwordRequirements : []}
            required
            value={password}
            visible={passwordVisible}
          />

          <Button
            fullWidth
            loading={submitting}
            loadingLabel="Przetwarzanie…"
            size="large"
            type="submit"
          >
            {submitLabel}
          </Button>
        </form>

        <button
          className="runtime-auth__alternative"
          onClick={() => navigate(isRegister ? '/login' : '/register')}
          type="button"
        >
          {alternativeLabel}
        </button>

        <p className="runtime-auth__scope-note">
          Pełny transport production-parity z Secure cookie pod jednym adresem HTTPS
          jest bramą LP-6. LP-4 implementuje realny runtime i kontrakt klienta.
        </p>
      </section>
    </main>
  );
}
