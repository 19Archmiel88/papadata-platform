import {
  Fingerprint,
  Mail,
  ShieldCheck,
  UserRoundCheck,
  Waypoints,
} from 'lucide-react';
import { useState } from 'react';

import {
  ActionArrow,
  AppHeader,
  Button,
  InlineNotice,
  PageHeader,
  PasswordField,
  ProviderButton,
  StatusBadge,
  StepIndicator,
  Surface,
  TextField,
  VerificationCodeInput,
} from '../../design-system';
import '../../design-system/foundations/papadata-brand-surface.css';
import { authCodeExamples, authIdentityFixture } from '../../fixtures/auth';
import './papadata-auth.css';

type AuthComponentShowcaseProps = {
  initialTheme: 'light' | 'dark';
};

function AuthComponentShowcase({
  initialTheme = 'dark',
}: AuthComponentShowcaseProps) {
  return (
    <div
      className="pds-brand-surface pda-auth-shell"
      data-theme={initialTheme}
      lang="pl"
    >
      <AppHeader />

      <main className="pda-components-main">
        <PageHeader
          className="pda-components-heading"
          eyebrow="Dostęp do konta"
          text="Wspólne komponenty używane przez logowanie, MFA, odzyskiwanie dostępu i zaproszenia."
          title="Elementy procesu Auth"
        />

        <Surface className="pda-component-section">
          <header>
            <span>Akcje</span>
            <h2>Przyciski i dostawcy</h2>
          </header>

          <div className="pda-component-row">
            <Button iconAfter={<ActionArrow />} variant="primary">
              Kontynuuj
            </Button>

            <Button variant="secondary">Wyślij ponownie</Button>

            <Button variant="ghost">Odzyskaj dostęp</Button>
          </div>

          <div className="pda-provider-row pda-component-row--narrow">
            <ProviderButton provider="google">Google</ProviderButton>
            <ProviderButton provider="microsoft">Microsoft</ProviderButton>
          </div>
        </Surface>

        <Surface className="pda-component-section">
          <header>
            <span>Formularze</span>
            <h2>Pola i kod jednorazowy</h2>
          </header>

          <div className="pda-field-grid pda-component-row--fields">
            <TextFieldExample />

            <PasswordField
              autoComplete="current-password"
              label="Hasło"
            />

            <div className="pda-code-showcase-grid">
              {authCodeExamples.map((example) => (
                <CodeInputExample
                  disabled={example.disabled}
                  errorMessage={example.errorMessage}
                  id={example.id}
                  initialValue={example.initialValue}
                  invalid={example.invalid}
                  key={example.id}
                  label={example.label}
                />
              ))}
            </div>
          </div>
        </Surface>

        <Surface className="pda-component-section">
          <header>
            <span>Stan</span>
            <h2>Postęp, status i komunikat</h2>
          </header>

          <div className="pda-component-grid">
            <StepIndicator
              aria-label="Postęp procesu dostępu"
              currentIndex={1}
              steps={[
                {
                  icon: <UserRoundCheck aria-hidden="true" size={15} />,
                  key: 'account',
                  label: 'Konto',
                },
                {
                  icon: <Fingerprint aria-hidden="true" size={15} />,
                  key: 'verification',
                  label: 'Weryfikacja',
                },
                {
                  icon: <Waypoints aria-hidden="true" size={15} />,
                  key: 'access',
                  label: 'Dostęp',
                },
              ]}
            />

            <div className="pda-component-trust">
              <ShieldCheck aria-hidden="true" size={22} />
              <span>
                <strong>Bezpieczny feedback</strong>
                <span>Komunikaty nie ujawniają stanu konta ani dostawcy.</span>
              </span>
            </div>
          </div>

          <div className="pda-component-row">
            <StatusBadge status="ready" />
            <StatusBadge status="pending" />
            <StatusBadge status="blocked" />
          </div>

          <InlineNotice tone="info">
            Ten sam komponent komunikatu obsługuje informację, sukces,
            ostrzeżenie i błąd.
          </InlineNotice>
        </Surface>
      </main>
    </div>
  );
}

function TextFieldExample() {
  return (
    <TextField
      autoComplete="email"
      defaultValue={authIdentityFixture.email}
      icon={<Mail aria-hidden="true" size={18} strokeWidth={1.8} />}
      label="E-mail służbowy"
      type="email"
    />
  );
}

function CodeInputExample({
  disabled,
  errorMessage,
  id,
  initialValue,
  invalid,
  label,
}: {
  disabled?: boolean;
  errorMessage?: string;
  id: string;
  initialValue: string;
  invalid?: boolean;
  label: string;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <VerificationCodeInput
      disabled={disabled}
      errorMessage={errorMessage}
      hint={invalid ? undefined : 'Wpisz dokładnie sześć cyfr.'}
      id={id}
      invalid={invalid}
      label={label}
      name={id}
      onChange={setValue}
      value={value}
    />
  );
}

export { AuthComponentShowcase };
