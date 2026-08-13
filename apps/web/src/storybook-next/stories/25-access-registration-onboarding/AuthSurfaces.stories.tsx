import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  userEvent,
  within,
} from 'storybook/test';

import {
  AuthSurface,
} from '../../../features/auth/AuthSurface';
import '../../../storybook-next/presentation/story-presentation.css';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './auth-surfaces.stories.css';

const navigateAction = fn();
const loginAction = fn();
const registerAction = fn();
const mfaAction = fn();
const recoveryRequestAction = fn();
const resetAction = fn();
const retryAction = fn();

const meta = {
  title: '25 Dostęp i onboarding/Auth runtime',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function AuthPageFrame({
  children,
  storyId,
  summary,
  title,
}: {
  readonly children: ReactNode;
  readonly storyId: string;
  readonly summary: string;
  readonly title: string;
}) {
  return (
    <StoryPresentationPage
      className="pd-s25-page"
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Status Auth"
          items={[
            {
              label: 'Owner',
              value: 'Auth',
            },
            {
              label: 'Status',
              value: 'runtime + target states',
            },
            {
              label: 'Warunek',
              value: 'Pierwsza ścieżka dostępu przed onboardingiem firmy.',
            },
          ]}
        />
      )}
      sectionCode="25"
      sectionLabel="Dostęp i onboarding"
      storyId={storyId}
      summary={summary}
      title={title}
    >
      {children}
    </StoryPresentationPage>
  );
}

export const AuthEntryStory: Story = {
  name: '25.01 Wejście do Auth',
  render: () => (
    <AuthPageFrame
      storyId="25.01"
      summary="Pierwszy ekran Auth działa w publicznym AuthShellu i prowadzi do właściwej ścieżki bez technicznych statusów w interfejsie."
      title="Wejście do Auth"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Widok docelowy">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-entry-ready">
          <AuthSurface mode="entry" onNavigate={navigateAction} />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection index="02" layout="showcase" title="Stany blokujące bez przycinania powierzchni">
        <div className="pd-s25-grid pd-s25-grid--compact">
          <div className="pd-s25-stage" data-testid="auth-entry-unavailable">
            <AuthSurface
              mode="entry"
              onNavigate={navigateAction}
              onRetry={retryAction}
              state="serviceUnavailable"
            />
          </div>
          <div className="pd-s25-stage" data-testid="auth-entry-blocked">
            <AuthSurface
              mode="entry"
              onNavigate={navigateAction}
              state="blocked"
            />
          </div>
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const authEntry = canvasElement.querySelector('[data-testid="auth-entry-ready"]');

    if (!(authEntry instanceof HTMLElement)) {
      throw new Error('Auth entry stage is not rendered.');
    }

    const authCanvas = within(authEntry);
    await expect(authCanvas.getByRole('heading', { name: 'Witaj w PapaData' })).toBeInTheDocument();
    await userEvent.click(authCanvas.getByRole('button', { name: 'Zaloguj się' }));
  },
};

export const LoginStory: Story = {
  name: '25.02 Logowanie',
  render: () => (
    <AuthPageFrame
      storyId="25.02"
      summary="Logowanie obejmuje remember device, walidację pól, rate limit i produktowy komunikat bez enumeracji kont."
      title="Logowanie"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Formularz docelowy">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-login-ready">
          <AuthSurface
            mode="login"
            onLogin={loginAction}
            onNavigate={navigateAction}
          />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection index="02" layout="showcase" title="Stan limitu prób">
        <div className="pd-s25-grid pd-s25-grid--compact">
          <div className="pd-s25-stage" data-testid="auth-login-rate-limited">
            <AuthSurface
              initialEmail="operator@papadata.local"
              mode="login"
              onLogin={loginAction}
              onNavigate={navigateAction}
              state="rateLimited"
            />
          </div>
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const loginStage = canvasElement.querySelector('[data-testid="auth-login-ready"]');

    if (!(loginStage instanceof HTMLElement)) {
      throw new Error('Login stage is not rendered.');
    }

    const canvas = within(loginStage);
    await userEvent.click(canvas.getByRole('button', { name: 'Zaloguj się' }));
    await expect(canvas.getAllByText('Podaj poprawny adres e-mail.')[0]).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox', { name: 'Zapamiętaj to urządzenie' })).toBeInTheDocument();
  },
};

export const RegistrationStory: Story = {
  name: '25.03 Rejestracja',
  render: () => (
    <AuthPageFrame
      storyId="25.03"
      summary="Rejestracja rozdziela wybór metody od formularza e-mail; zgody pozostają osobnym krokiem docelowego FSM."
      title="Rejestracja"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Rejestracja e-mail">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-registration-ready">
          <AuthSurface
            mode="register"
            onNavigate={navigateAction}
            onRegister={registerAction}
          />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection index="02" layout="showcase" title="Zakończenie kroku">
        <div className="pd-s25-grid pd-s25-grid--compact">
          <div className="pd-s25-stage" data-testid="auth-registration-completed">
            <AuthSurface
              initialEmail="founder@papadata.local"
              mode="register"
              onNavigate={navigateAction}
              onRegister={registerAction}
              state="registrationCompleted"
            />
          </div>
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const registrationStage = canvasElement.querySelector('[data-testid="auth-registration-ready"]');

    if (!(registrationStage instanceof HTMLElement)) {
      throw new Error('Registration stage is not rendered.');
    }

    const canvas = within(registrationStage);
    await expect(
      canvas.getByRole('button', { name: 'Kontynuuj przez OAuth' }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Utwórz konto e-mailem' }),
    );
    await userEvent.type(
      canvas.getByRole('textbox', { name: /E-mail/u }),
      'user@example.com',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Utwórz konto' }));
    await expect(
      canvas.getAllByText('Podaj imię i nazwisko.')[0],
    ).toBeInTheDocument();
    await expect(
      canvas.getAllByText('Hasło musi mieć co najmniej 12 znaków.')[0],
    ).toBeInTheDocument();
  },
};

export const MfaStory: Story = {
  name: '25.07 MFA',
  render: () => (
    <AuthPageFrame
      storyId="25.07"
      summary="MFA pokazuje challenge, błędy kodu, rate limit i wymagany enrollment bez udawania pełnego backendu."
      title="MFA"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Challenge aktywny">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-mfa-ready">
          <AuthSurface
            mode="mfa"
            onMfaConfirm={mfaAction}
            onNavigate={navigateAction}
          />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection index="02" layout="showcase" title="Limit prób i enrollment">
        <div className="pd-s25-grid pd-s25-grid--compact">
          <div className="pd-s25-stage" data-testid="auth-mfa-rate-limited">
            <AuthSurface
              mode="mfa"
              onMfaConfirm={mfaAction}
              onNavigate={navigateAction}
              state="rateLimited"
            />
          </div>
          <div className="pd-s25-stage" data-testid="auth-mfa-enrollment">
            <AuthSurface
              mode="mfa"
              onMfaConfirm={mfaAction}
              onNavigate={navigateAction}
              state="mfaEnrollmentRequired"
            />
          </div>
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const mfaStage = canvasElement.querySelector('[data-testid="auth-mfa-ready"]');

    if (!(mfaStage instanceof HTMLElement)) {
      throw new Error('MFA stage is not rendered.');
    }

    const canvas = within(mfaStage);
    await userEvent.click(canvas.getByRole('button', { name: 'Potwierdź MFA' }));
    await expect(canvas.getAllByText('Kod MFA musi mieć 6 cyfr.')[0]).toBeInTheDocument();
  },
};

export const AccessRecoveryStory: Story = {
  name: '25.08 Odzyskiwanie dostępu',
  render: () => (
    <AuthPageFrame
      storyId="25.08"
      summary="Recovery rozdziela request, informację o wysłaniu i nowe hasło; token z linku pozostaje kontekstem procesu, nie edytowalnym polem."
      title="Odzyskiwanie dostępu"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Request odzyskania dostępu">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-recovery-request">
          <AuthSurface
            mode="recover"
            onNavigate={navigateAction}
            onPasswordRecoveryRequest={recoveryRequestAction}
          />
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection index="02" layout="showcase" title="Wysłanie resetu i nowe hasło">
        <div className="pd-s25-grid pd-s25-grid--compact">
          <div className="pd-s25-stage" data-testid="auth-recovery-sent">
            <AuthSurface
              initialEmail="user@example.com"
              mode="recover"
              onNavigate={navigateAction}
              onPasswordRecoveryRequest={recoveryRequestAction}
              state="recoverySent"
            />
          </div>
          <div className="pd-s25-stage" data-testid="auth-recovery-reset">
            <AuthSurface
              initialEmail="user@example.com"
              initialResetToken="rst_demo_token"
              mode="recover"
              onNavigate={navigateAction}
              onPasswordReset={resetAction}
            />
          </div>
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const recoveryStage = canvasElement.querySelector('[data-testid="auth-recovery-request"]');

    if (!(recoveryStage instanceof HTMLElement)) {
      throw new Error('Recovery stage is not rendered.');
    }

    const canvas = within(recoveryStage);
    await userEvent.click(canvas.getByRole('button', { name: 'Wyślij instrukcję' }));
    await expect(canvas.getAllByText('Podaj poprawny adres e-mail.')[0]).toBeInTheDocument();

    const resetStage = canvasElement.querySelector('[data-testid="auth-recovery-reset"]');

    if (!(resetStage instanceof HTMLElement)) {
      throw new Error('Password reset stage is not rendered.');
    }

    const resetCanvas = within(resetStage);
    await expect(
      resetCanvas.queryByRole('textbox', { name: 'Token resetu' }),
    ).not.toBeInTheDocument();
    await expect(
      resetCanvas.getByLabelText(/Powtórz nowe hasło/u),
    ).toBeInTheDocument();
  },
};
