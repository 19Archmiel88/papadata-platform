import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  fn,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';
import type {
  AccessLifecycleStatus,
} from '@papadata/contracts';

import {
  AuthSurface,
} from '../../../runtime/features/auth/AuthSurface';
import {
  AccessFlowScreen,
} from '../../../runtime/features/auth/AccessFlowScreen';
import {
  AuthDataSourceMarquee,
} from '../../../runtime/features/auth/AuthDataSourceMarquee';
import {
  AuthInsightChart,
} from '../../../runtime/features/auth/AuthInsightChart';
import {
  AuthRuntimePreferences,
} from '../../../runtime/features/auth/AuthRuntimePreferences';
import {
  accessLifecycleFixture,
} from '../../../fixtures/access/accessLifecycleFixture';
import {
  Button,
} from '../../../design-system/components';
import {
  StoryPresentationMeta,
  StoryPresentationPage,
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import './auth-surfaces.stories.css';

// Every handler below is a tracked spy (storybook/test's `fn()`, a
// Vitest-compatible mock) so each story's play() function can assert real
// clicks reach the real production component's callback contract -- not
// just that something rendered.
const navigateAction = fn();
const loginAction = fn();
const registerAction = fn();
const mfaAction = fn();
const recoveryRequestAction = fn();
const resetAction = fn();
const retryAction = fn();
const acceptInvitationAction = fn();
const stepUpAction = fn();
const selectWorkspaceAction = fn();
const oauthContinueAction = fn();
const accessFlowAction = fn();
const validateInvitationAction = fn(async () => ({
  status: 'valid',
  email: 'nowy.operator@papadata.local',
  role: 'Operator',
  tenantName: 'PapaData Sp. z o.o.',
  workspaceName: 'E-commerce PL',
}));

// AuthSurface's handler props are required (no silent no-op-on-missing-handler
// in production) — every story instance needs the full set regardless of
// which handler that particular scenario is exercising.
const allAuthHandlerProps = {
  onAcceptInvitation: acceptInvitationAction,
  onLogin: loginAction,
  onMfaConfirm: mfaAction,
  onOAuthContinue: oauthContinueAction,
  onPasswordRecoveryRequest: recoveryRequestAction,
  onPasswordReset: resetAction,
  onRegister: registerAction,
  onSelectWorkspace: selectWorkspaceAction,
  onStepUpConfirm: stepUpAction,
  onValidateInvitation: validateInvitationAction,
};

const workspaceOptions = [
  {
    tenantId: 'tenant_papadata',
    tenantName: 'PapaData Sp. z o.o.',
    workspaceId: 'workspace_ecommerce',
    workspaceName: 'E-commerce PL',
  },
  {
    tenantId: 'tenant_northwind',
    tenantName: 'Northwind Retail',
    workspaceId: 'workspace_marketing',
    workspaceName: 'Marketing EU',
  },
];
const organizationOptions = Array.from(
  new Map(workspaceOptions.map((option) => [option.tenantId, option])).values(),
);

const meta = {
  title: 'PLATFORMA/Dostęp i onboarding/Procesy dostępu',
  parameters: {
    layout: 'fullscreen',
    a11y: {
      test: 'error',
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

// Real screens (below) render at full size, exactly as the production
// AccessRouter shows them — no documentation title/summary/metadata chrome
// on top. That chrome is reserved for the one non-screen entry at the
// bottom of this file (the component showcase), which documents a set of
// parts rather than presenting a single real page.
function Stage({
  authSurface,
  children,
}: {
  readonly authSurface: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="pd-s25-stage pd-s25-stage--full" data-testid={`stage-${authSurface}`}>
      {children}
    </div>
  );
}

function getStage(canvasElement: HTMLElement, authSurface: string): HTMLElement {
  const stage = canvasElement.querySelector(`[data-auth-surface="${authSurface}"]`);
  if (!(stage instanceof HTMLElement)) {
    throw new Error(`${authSurface} stage is not rendered.`);
  }
  return stage;
}

// Company-form data variants. AccessFlowScreen owns its own form state
// internally (see its useState calls) — these only vary what's already
// saved server-side when the surface is first shown.
const companyPending: AccessLifecycleStatus = { ...accessLifecycleFixture, company: null };
const companySaved: AccessLifecycleStatus = accessLifecycleFixture;
const emailUnverified: AccessLifecycleStatus = { ...accessLifecycleFixture, emailVerified: false };
const registrationDone: AccessLifecycleStatus = {
  ...accessLifecycleFixture,
  completedAt: '2026-09-08T09:12:00.000Z',
  integrationCount: 2,
  lastSyncAt: '2026-09-10T06:40:00.000Z',
  readySourceCount: 1,
};
const onboardingInProgress: AccessLifecycleStatus = {
  ...accessLifecycleFixture,
  company: null,
  completedAt: null,
};
const lookupResult = {
  normalized: {
    city: 'Kraków',
    country: 'PL' as const,
    legalName: 'Nowa Firma Demonstracyjna sp. z o.o.',
    postalCode: '30-001',
    street: 'Rynkowa 12',
    vatId: '5260250995',
  },
};

export const AuthEntryStory: Story = {
  name: 'Wejście',
  render: () => (
    <Stage authSurface="auth-01">
      <AuthSurface {...allAuthHandlerProps} mode="entry" onNavigate={navigateAction} />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-01');
    const canvas = within(stage);
    await expect(canvas.getByRole('heading', { name: 'Witaj w PapaData' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Zaloguj się' }));
    await expect(navigateAction).toHaveBeenCalled();
  },
};

export const LoginStory: Story = {
  name: 'Logowanie',
  render: () => (
    <Stage authSurface="auth-02">
      <AuthSurface {...allAuthHandlerProps} mode="login" onLogin={loginAction} onNavigate={navigateAction} />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-02');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Zaloguj się' }));
    await expect(canvas.getAllByText('Podaj poprawny adres e-mail.')[0]).toBeInTheDocument();
    await expect(canvas.getByRole('checkbox', { name: 'Zapamiętaj to urządzenie' })).toBeInTheDocument();
  },
};

export const RegistrationMethodStory: Story = {
  name: 'Metoda rejestracji',
  render: () => (
    <Stage authSurface="auth-03">
      <AuthSurface {...allAuthHandlerProps}
        initialRegistrationStage="choice"
        mode="register"
        onNavigate={navigateAction}
        onRegister={registerAction}
      />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-03');
    const canvas = within(stage);
    await expect(canvas.getByRole('button', { name: 'Kontynuuj przez Google' })).toBeDisabled();
    await expect(canvas.queryByRole('textbox', { name: /E-mail/u })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Utwórz konto e-mailem' }));
    await expect(canvas.getByRole('textbox', { name: /E-mail/u })).toBeInTheDocument();
  },
};

export const RegistrationEmailStory: Story = {
  name: 'Rejestracja e-mail',
  render: () => (
    <Stage authSurface="auth-04">
      <AuthSurface {...allAuthHandlerProps}
        initialRegistrationStage="email"
        mode="register"
        onNavigate={navigateAction}
        onRegister={registerAction}
      />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-04');
    const canvas = within(stage);
    await userEvent.type(canvas.getByRole('textbox', { name: /E-mail/u }), 'user@example.com');
    await userEvent.click(canvas.getByRole('button', { name: 'Utwórz konto' }));
    await expect(canvas.getAllByText('Podaj imię i nazwisko.')[0]).toBeInTheDocument();
    await expect(canvas.getAllByText('Hasło musi mieć co najmniej 12 znaków.')[0]).toBeInTheDocument();
  },
};

export const OAuthCallbackStory: Story = {
  name: 'Powrót OAuth',
  render: () => (
    <Stage authSurface="auth-05">
      <AccessFlowScreen demo data={null} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-05" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-05');
    const canvas = within(stage);
    await expect(canvas.getByRole('button', { name: 'Wybierz organizacje' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Wroc do logowania' }));
    await expect(navigateAction).toHaveBeenCalledWith('/login');
  },
};

export const EmailVerificationStory: Story = {
  name: 'Weryfikacja adresu e-mail',
  render: () => (
    <Stage authSurface="auth-06">
      <AccessFlowScreen demo data={emailUnverified} hasToken onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-06" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-06');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Potwierdz adres z linku' }));
    await expect(accessFlowAction).toHaveBeenCalledWith('verify');
  },
};

export const CompanyIdentityStory: Story = {
  name: 'Identyfikacja firmy',
  render: () => (
    <Stage authSurface="auth-07">
      <AccessFlowScreen demo data={companyPending} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-07" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-07');
    const canvas = within(stage);
    const submit = canvas.getByRole('button', { name: 'Zapisz i przejrzyj dane' });
    await expect(submit).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: 'NIP' }), '123');
    await expect(canvas.getAllByText('Sprawdz 10 cyfr i sume kontrolna NIP.')[0]).toBeInTheDocument();
  },
};

export const CompanyLookupStory: Story = {
  name: 'Wyszukiwanie firmy',
  render: () => (
    <Stage authSurface="auth-08">
      <AccessFlowScreen demo data={companyPending} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-08" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-08');
    const canvas = within(stage);
    const search = canvas.getByRole('button', { name: 'Szukaj w GUS/BIR' });
    await expect(search).toBeDisabled();
    await userEvent.type(canvas.getByRole('textbox', { name: 'NIP' }), '5260250995');
    await expect(search).toBeEnabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Wprowadz dane recznie' }));
    await expect(navigateAction).toHaveBeenCalledWith('/auth/company/manual');
  },
};

export const CompanyReviewStory: Story = {
  name: 'Przegląd danych firmy',
  render: () => (
    <Stage authSurface="auth-09">
      <AccessFlowScreen demo data={companySaved} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-09" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-09');
    const canvas = within(stage);
    await expect(canvas.getByText('Firma demonstracyjna')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Dalej' }));
    await expect(navigateAction).toHaveBeenCalledWith('/auth/consents');
  },
};

export const CompanyManualEntryStory: Story = {
  name: 'Firma: wpis ręczny',
  render: () => (
    <Stage authSurface="auth-10">
      <AccessFlowScreen demo companyLookup={lookupResult} data={companyPending} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-10" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-10');
    const canvas = within(stage);
    await expect(canvas.getByText(/Dane pobrane z GUS\/BIR/u)).toBeInTheDocument();
    // The lookup-derived company name lands via a useEffect that fires after the initial
    // render, so the input may still show its pre-lookup (empty) value at the moment play()
    // starts -- wait for the effect to commit instead of asserting synchronously.
    await waitFor(() => {
      expect(canvas.getByRole('textbox', { name: /Nazwa firmy/u })).toHaveValue('Nowa Firma Demonstracyjna sp. z o.o.');
    });
  },
};

export const CompanyExistingStory: Story = {
  name: 'Firma już zarejestrowana',
  render: () => (
    <Stage authSurface="auth-11">
      <AccessFlowScreen demo data={companySaved} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-11" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-11');
    const canvas = within(stage);
    await expect(canvas.getByText(/Nie wyszukujemy cudzych kont po NIP/u)).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Edytuj' }));
    await expect(navigateAction).toHaveBeenCalledWith('/auth/company/manual');
  },
};

export const ConsentsStory: Story = {
  name: 'Zgody i dokumenty',
  render: () => (
    <Stage authSurface="auth-12">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-12" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-12');
    const canvas = within(stage);
    const submit = canvas.getByRole('button', { name: 'Zapisz potwierdzenia' });
    await expect(submit).toBeDisabled();
    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await userEvent.click(checkbox);
    }
    await expect(submit).toBeEnabled();
  },
};

export const RegistrationCompletingStory: Story = {
  name: 'Przetwarzanie rejestracji',
  render: () => (
    <Stage authSurface="auth-13">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-13" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-13');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Zakoncz przygotowanie konta' }));
    await expect(accessFlowAction).toHaveBeenCalledWith('complete');
  },
};

export const RegistrationCompletedStory: Story = {
  name: 'Rejestracja zakończona',
  render: () => (
    <Stage authSurface="auth-14">
      <AccessFlowScreen demo data={registrationDone} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-14" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-14');
    const canvas = within(stage);
    await expect(canvas.getByText('2')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Przejdz do aplikacji' }));
    await expect(navigateAction).toHaveBeenCalledWith('/app/command-center');
  },
};

export const InvitationStory: Story = {
  name: 'Zaproszenie',
  render: () => (
    <Stage authSurface="auth-15">
      <AuthSurface {...allAuthHandlerProps}
        initialInvitationId="inv_demo_001"
        initialInvitationToken="demo-invitation-token"
        mode="accept-invite"
        onNavigate={navigateAction}
      />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-15');
    const canvas = within(stage);
    // Validation fires from a mount-time useEffect in AuthSurface, so wait for it instead of
    // asserting synchronously (same race as the company-lookup effect above).
    await waitFor(() => {
      expect(validateInvitationAction).toHaveBeenCalled();
    });
    await expect(canvas.getByText(/nowy\.operator@papadata\.local/u)).toBeInTheDocument();
    await expect(canvas.getByRole('textbox', { name: /Imię i nazwisko/u })).toBeInTheDocument();
  },
};

export const MfaStory: Story = {
  name: 'Weryfikacja MFA',
  render: () => (
    <Stage authSurface="auth-16">
      <AuthSurface {...allAuthHandlerProps} mode="mfa" onMfaConfirm={mfaAction} onNavigate={navigateAction} />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-16');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Potwierdź MFA' }));
    await expect(canvas.getAllByText('Kod MFA musi mieć 6 cyfr.')[0]).toBeInTheDocument();
  },
};

export const MfaEnrollmentStory: Story = {
  name: 'Konfiguracja MFA',
  render: () => (
    <Stage authSurface="auth-17">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-17" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-17');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Skonfiguruj MFA' }));
    await expect(accessFlowAction).toHaveBeenCalledWith('mfa');
  },
};

export const AccessRecoveryStory: Story = {
  name: 'Odzyskiwanie hasła',
  render: () => (
    <Stage authSurface="auth-18">
      <AuthSurface {...allAuthHandlerProps}
        mode="recover"
        onNavigate={navigateAction}
        onPasswordRecoveryRequest={recoveryRequestAction}
      />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-18');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Wyślij instrukcję' }));
    await expect(canvas.getAllByText('Podaj poprawny adres e-mail.')[0]).toBeInTheDocument();
  },
};

export const RecoveryInstructionsStory: Story = {
  name: 'Instrukcje odzyskiwania',
  render: () => (
    <Stage authSurface="auth-19">
      <AccessFlowScreen demo data={null} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-19" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-19');
    const canvas = within(stage);
    await expect(canvas.getByRole('status')).toHaveTextContent('Jezeli konto spelnia warunki odzyskiwania');
    await userEvent.click(canvas.getByRole('button', { name: 'Wroc do logowania' }));
    await expect(navigateAction).toHaveBeenCalledWith('/login');
  },
};

export const NewPasswordStory: Story = {
  name: 'Nowe hasło',
  render: () => (
    <Stage authSurface="auth-20">
      <AuthSurface {...allAuthHandlerProps}
        initialEmail="user@example.com"
        initialResetToken="demo-reset-token"
        mode="recover"
        onNavigate={navigateAction}
        onPasswordReset={resetAction}
      />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-20');
    const canvas = within(stage);
    await expect(canvas.queryByRole('textbox', { name: 'Token resetu' })).not.toBeInTheDocument();
    await expect(canvas.getByLabelText(/Powtórz nowe hasło/u)).toBeInTheDocument();
  },
};

export const ResolveAccessStory: Story = {
  name: 'Rozwiązywanie dostępu',
  render: () => (
    <Stage authSurface="auth-21">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-21" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-21');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Wybierz organizacje' }));
    await expect(navigateAction).toHaveBeenCalledWith('/auth/organization');
  },
};

export const ChooseOrganizationStory: Story = {
  name: 'Wybór organizacji',
  render: () => (
    <Stage authSurface="auth-22">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-22">
        <div className="pd-access__actions">
          {organizationOptions.map((option) => (
            <Button
              key={option.tenantId}
              onClick={() => navigateAction(`/auth/workspace?tenant=${option.tenantId}`)}
              variant="secondary"
            >
              {option.tenantName}
            </Button>
          ))}
        </div>
      </AccessFlowScreen>
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-22');
    const canvas = within(stage);
    await expect(canvas.getByRole('heading', { name: 'Wybór organizacji' })).toBeInTheDocument();
    await userEvent.click(canvas.getByText('PapaData Sp. z o.o.'));
    await expect(navigateAction).toHaveBeenCalledWith('/auth/workspace?tenant=tenant_papadata');
  },
};

export const ChooseWorkspaceStory: Story = {
  name: 'Wybór workspace',
  render: () => (
    <Stage authSurface="auth-23">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-23">
        <div className="pd-access__actions">
          {workspaceOptions.map((option) => (
            <Button
              key={option.workspaceId}
              onClick={() => selectWorkspaceAction(option.workspaceId)}
              variant="secondary"
            >
              {option.workspaceName}
            </Button>
          ))}
        </div>
      </AccessFlowScreen>
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-23');
    const canvas = within(stage);
    await userEvent.click(canvas.getByText('E-commerce PL'));
    await expect(selectWorkspaceAction).toHaveBeenCalledWith('workspace_ecommerce');
  },
};

export const ReauthStory: Story = {
  name: 'Ponowne uwierzytelnienie',
  render: () => (
    <Stage authSurface="auth-24">
      <AuthSurface {...allAuthHandlerProps} mode="reauth" onNavigate={navigateAction} onStepUpConfirm={stepUpAction} />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-24');
    const canvas = within(stage);
    await expect(canvas.getByRole('heading', { name: 'Potwierdź to jeszcze raz' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Potwierdź' }));
    await expect(canvas.getAllByText('Kod MFA musi mieć 6 cyfr.')[0]).toBeInTheDocument();
  },
};

export const SigningOutStory: Story = {
  name: 'Wylogowywanie',
  render: () => (
    <Stage authSurface="auth-25">
      <AccessFlowScreen demo data={accessLifecycleFixture} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-25" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-25');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Potwierdz wylogowanie' }));
    await expect(accessFlowAction).toHaveBeenCalledWith('logout');
  },
};

export const SignedOutStory: Story = {
  name: 'Wylogowano',
  render: () => (
    <Stage authSurface="auth-26">
      <AccessFlowScreen demo data={null} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-26" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-26');
    const canvas = within(stage);
    await expect(canvas.getByText('Sesja zostala zakonczona.')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Zaloguj sie ponownie' }));
    await expect(navigateAction).toHaveBeenCalledWith('/login');
  },
};

export const ServiceUnavailableStory: Story = {
  name: 'Usługa niedostępna',
  render: () => (
    <Stage authSurface="auth-27">
      <AccessFlowScreen demo data={null} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-27" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-27');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Sprobuj ponownie' }));
    await expect(accessFlowAction).toHaveBeenCalledWith('retry');
  },
};

export const AccessBlockedStory: Story = {
  name: 'Dostęp zablokowany',
  render: () => (
    <Stage authSurface="auth-28">
      <AccessFlowScreen demo data={null} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-28" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-28');
    const canvas = within(stage);
    await expect(canvas.getByText(/Popros administratora/u)).toBeInTheDocument();
  },
};

export const EnterApplicationStory: Story = {
  name: 'Wejście do aplikacji',
  render: () => (
    <Stage authSurface="auth-29">
      <AccessFlowScreen demo data={onboardingInProgress} onAction={accessFlowAction} onNavigate={navigateAction} surface="auth-29" />
    </Stage>
  ),
  play: async ({ canvasElement }) => {
    const stage = getStage(canvasElement, 'auth-29');
    const canvas = within(stage);
    await userEvent.click(canvas.getByRole('button', { name: 'Uzupelnij firme' }));
    await expect(navigateAction).toHaveBeenCalledWith('/auth/company');
  },
};

export const AuthVisualComponentsStory: Story = {
  name: 'Elementy wizualne dostępu',
  render: () => (
    <StoryPresentationPage
      headerAside={(
        <StoryPresentationMeta
          ariaLabel="Status procesu dostępu"
          items={[
            { label: 'Właściciel', value: 'runtime/features/auth' },
            { label: 'Status', value: 'Kanoniczny runtime' },
            { label: 'Zakres', value: 'Dostęp i onboarding' },
          ]}
        />
      )}
      sectionCode="AU"
      sectionLabel="Dostęp i onboarding"
      storyId="25.30"
      summary="Kontrolki preferencji, animowane źródła danych i wykres/krokomierz są osobnymi komponentami produkcyjnymi używanymi przez AuthSurface i AccessFlowScreen."
      title="Komponenty Auth"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Preferencje, źródła i wykresy">
        <div className="pd-s25-auth-components pd-auth-theme">
          <div className="pd-s25-auth-component" data-testid="auth-runtime-preferences">
            <AuthRuntimePreferences />
          </div>

          <div className="pd-s25-auth-component" data-testid="auth-source-marquee">
            <AuthDataSourceMarquee locale="pl" />
          </div>

          <div className="pd-s25-auth-component" data-testid="auth-revenue-chart">
            <AuthInsightChart locale="pl" mode="login" />
          </div>

          <div className="pd-s25-auth-component" data-testid="auth-registration-stepper-chart">
            <AuthInsightChart locale="pl" mode="register" />
          </div>
        </div>
      </StoryPresentationSection>
    </StoryPresentationPage>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('auth-runtime-preferences')).toBeInTheDocument();
    await expect(canvas.getByTestId('auth-source-marquee')).toBeInTheDocument();
    await expect(canvas.getByText('Przychód z 30 dni')).toBeInTheDocument();
    await expect(canvas.getByText('Kroki uruchomienia')).toBeInTheDocument();
  },
};
