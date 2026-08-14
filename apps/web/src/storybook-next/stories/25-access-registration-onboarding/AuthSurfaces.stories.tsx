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
import {
  Button,
  InlineNotice,
  ProgressIndicator,
  StatusBadge,
} from '../../../design-system/components';
import {
  StoryPresentationSection,
} from '../../../storybook-next/presentation/StoryPresentation';
import {
  ProductionStoryShell,
} from '../../production/ProductionStoryShell';
import './auth-surfaces.stories.css';

const navigateAction = fn();
const loginAction = fn();
const registerAction = fn();
const mfaAction = fn();
const recoveryRequestAction = fn();
const resetAction = fn();
const retryAction = fn();
const acceptInvitationAction = fn();

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

type AuthScenario = {
  readonly title: string;
  readonly status: string;
  readonly tone: 'critical' | 'neutral' | 'success' | 'warning';
  readonly description: string;
  readonly meta: readonly string[];
  readonly action?: string;
};

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
    <ProductionStoryShell
      contract={{
        displayTitle: title,
        documentPath: '06-dostep-i-onboarding/auth-runtime.md',
        id: storyId,
        operationId: 'auth.runtime.storybook',
        owner: 'Auth',
        sectionId: '25',
        sectionLabel: 'Dostęp i onboarding',
        status: 'runtime + target states',
        summary,
      }}
      wrapCanvas={false}
    >
      {children}
    </ProductionStoryShell>
  );
}

function AuthFlowPanel({
  scenarios,
}: {
  readonly scenarios: readonly AuthScenario[];
}) {
  const completedCount = scenarios.filter((scenario) => scenario.tone === 'success').length;
  const currentIndex = Math.max(0, scenarios.findIndex((scenario) => scenario.action));
  const progressValue = Math.round((completedCount / Math.max(scenarios.length, 1)) * 100);

  return (
    <div className="pd-s25-flow-panel">
      <header className="pd-s25-flow-panel__header">
        <div>
          <h3>Flow dostępu</h3>
          <p>Aktualny krok, decyzje i blokery procesu są widoczne bez przechodzenia do dokumentacji.</p>
        </div>
        <ProgressIndicator
          description={`${completedCount} z ${scenarios.length} kroków oznaczono jako gotowe.`}
          indeterminate={false}
          label="Postęp procesu"
          max={100}
          showValue
          tone={progressValue >= 75 ? 'success' : 'warning'}
          value={progressValue}
        />
      </header>
      <ol className="pd-s25-flow-steps" aria-label="Kroki procesu Auth">
        {scenarios.map((scenario, index) => (
          <li
            className="pd-s25-flow-step"
            data-current={index === currentIndex ? 'true' : undefined}
            key={scenario.title}
          >
          <header>
            <StatusBadge
              status="Status"
              text={scenario.status}
              tone={scenario.tone}
            />
            <h3>{scenario.title}</h3>
          </header>
          <p>{scenario.description}</p>
          <ul aria-label={`Kryteria: ${scenario.title}`}>
            {scenario.meta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {scenario.action ? (
            <Button
              size="small"
              variant="secondary"
              onClick={scenario.title === 'Przegląd zaproszenia' ? acceptInvitationAction : navigateAction}
            >
              {scenario.action}
            </Button>
          ) : null}
          </li>
      ))}
      </ol>
    </div>
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

export const InvitationStory: Story = {
  name: '25.04 Przegląd zaproszenia',
  render: () => (
    <AuthPageFrame
      storyId="25.04"
      summary="Zaproszenie pokazuje kontekst organizacji, rolę, termin ważności oraz bezpieczne przejście bez ujawniania danych spoza tokenu."
      title="Przegląd zaproszenia"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Zaproszenie aktywne">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-invitation-ready">
          <AuthFlowPanel
            scenarios={[
              {
                action: 'Przyjmij zaproszenie',
                description: 'Operator widzi organizację, workspace, rolę i informację o dacie ważności zaproszenia przed akceptacją.',
                meta: ['PL/EN copy', 'focus na akcji głównej', 'brak danych PII poza adresem z tokenu'],
                status: 'Aktywne',
                title: 'Przegląd zaproszenia',
                tone: 'success',
              },
              {
                description: 'Jeżeli konto lub firma istnieje, ekran prowadzi do logowania lub rozwiązania kontekstu bez tworzenia duplikatu.',
                meta: ['firma już zarejestrowana', 'bez enumeracji kont', 'ścieżka powrotu do logowania'],
                status: 'Wymaga logowania',
                title: 'Firma już zarejestrowana',
                tone: 'warning',
              },
            ]}
          />
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector('[data-testid="auth-invitation-ready"]');
    if (!(stage instanceof HTMLElement)) throw new Error('Invitation stage is not rendered.');

    const canvas = within(stage);
    await expect(canvas.getByRole('heading', { name: 'Przegląd zaproszenia' })).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Przyjmij zaproszenie' }));
  },
};

export const EmailVerificationStory: Story = {
  name: '25.05 Weryfikacja adresu e-mail',
  render: () => (
    <AuthPageFrame
      storyId="25.05"
      summary="Weryfikacja e-mail i informacja o wysłaniu resetu rozdzielają status procesu od pól edycyjnych."
      title="Weryfikacja adresu e-mail"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Stany komunikacji e-mail">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-email-verification-ready">
          <AuthFlowPanel
            scenarios={[
              {
                action: 'Wyślij ponownie',
                description: 'Komunikat potwierdza wysłanie linku, pokazuje adres docelowy w bezpiecznej formie i nie ujawnia statusu konta.',
                meta: ['live region', 'rate-limit safe copy', 'focus na ponownym wysłaniu'],
                status: 'Wysłano',
                title: 'Weryfikacja adresu e-mail',
                tone: 'success',
              },
              {
                description: 'Potwierdzenie resetu pozostaje stanem informacyjnym; formularz nowego hasła jest dostępny dopiero po wejściu z tokenu.',
                meta: ['informacja o wysłaniu resetu', 'brak pola tokenu', 'powrót do logowania'],
                status: 'Instrukcja wysłana',
                title: 'Informacja o wysłaniu resetu',
                tone: 'neutral',
              },
            ]}
          />
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector('[data-testid="auth-email-verification-ready"]');
    if (!(stage instanceof HTMLElement)) throw new Error('Email verification stage is not rendered.');

    const canvas = within(stage);
    await expect(canvas.getByText('Informacja o wysłaniu resetu')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Wyślij ponownie' }));
  },
};

export const CompanyIdentificationStory: Story = {
  name: '25.06 Identyfikacja firmy',
  render: () => (
    <AuthPageFrame
      storyId="25.06"
      summary="Identyfikacja firmy pokazuje wyszukiwanie, ręczne wprowadzenie, edycję i stan niedostępnego rejestru bez lokalnego obejścia walidacji."
      title="Identyfikacja firmy"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Firma i dane rejestrowe">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-company-identification-ready">
          <InlineNotice
            message="Dane firmy są widoczne jako stan do sprawdzenia i edycji; zapis wymaga kolejnej operacji onboardingowej."
            title="Sprawdzenie danych firmy"
            tone="info"
          />
          <AuthFlowPanel
            scenarios={[
              {
                action: 'Sprawdź NIP',
                description: 'Ekran prowadzi przez NIP, status źródła danych i potwierdzenie znalezionej firmy.',
                meta: ['NIP field', 'status źródła danych', 'keyboard-only'],
                status: 'Gotowe do sprawdzenia',
                title: 'Identyfikacja firmy',
                tone: 'success',
              },
              {
                description: 'Fallback zachowuje wymagane pola, walidację i oznaczenie danych wymagających późniejszej weryfikacji.',
                meta: ['ręczne wprowadzenie firmy', 'walidacja wymaganych pól', 'tryb rejestru niedostępnego'],
                status: 'Fallback',
                title: 'Ręczne wprowadzenie firmy',
                tone: 'warning',
              },
              {
                description: 'Po znalezieniu firmy użytkownik może przejrzeć i skorygować pola przed kontynuacją onboardingu.',
                meta: ['sprawdzenie i edycja danych firmy', 'semantyka formularza', 'error state'],
                status: 'Do potwierdzenia',
                title: 'Sprawdzenie i edycja danych firmy',
                tone: 'neutral',
              },
            ]}
          />
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector('[data-testid="auth-company-identification-ready"]');
    if (!(stage instanceof HTMLElement)) throw new Error('Company identification stage is not rendered.');

    const canvas = within(stage);
    await expect(canvas.getByText('Ręczne wprowadzenie firmy')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Sprawdź NIP' }));
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

export const AccessContextResolutionStory: Story = {
  name: '25.09 Rozpoznanie kontekstu dostępu',
  render: () => (
    <AuthPageFrame
      storyId="25.09"
      summary="Rozpoznanie kontekstu obejmuje zablokowany dostęp, wylogowanie, reauth, MFA step-up oraz niedostępność usługi Auth."
      title="Rozpoznanie kontekstu dostępu"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Kontekst i blokady">
        <div className="pd-s25-grid pd-s25-grid--compact" data-testid="auth-access-context-ready">
          <div className="pd-s25-stage">
            <AuthSurface mode="entry" onNavigate={navigateAction} state="blocked" />
          </div>
          <div className="pd-s25-stage">
            <AuthSurface mode="entry" onNavigate={navigateAction} onRetry={retryAction} state="serviceUnavailable" />
          </div>
        </div>
      </StoryPresentationSection>

      <StoryPresentationSection index="02" layout="showcase" title="Reauth i MFA">
        <div className="pd-s25-stage pd-s25-stage--full">
          <AuthFlowPanel
            scenarios={[
              {
                action: 'Potwierdź ponownie',
                description: 'Ponowne uwierzytelnienie zachowuje kontekst operacji i pokazuje, dlaczego sesja wymaga odświeżenia.',
                meta: ['ponowne uwierzytelnienie', 'focus restoration', 'brak utraty kontekstu workspace'],
                status: 'Step-up',
                title: 'Ponowne uwierzytelnienie',
                tone: 'warning',
              },
              {
                description: 'Konfiguracja MFA jest wymagana przed wejściem do workspace i używa tego samego wzorca co challenge MFA.',
                meta: ['konfiguracja MFA', 'verification code', 'error states'],
                status: 'Wymagane',
                title: 'Konfiguracja MFA',
                tone: 'warning',
              },
              {
                description: 'Ekran po wylogowaniu potwierdza zakończenie sesji i prowadzi do logowania bez pokazywania technicznych statusów.',
                meta: ['przetwarzanie wylogowania', 'ekran po wylogowaniu', 'bez danych sesji'],
                status: 'Wylogowano',
                title: 'Ekran po wylogowaniu',
                tone: 'success',
              },
            ]}
          />
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector('[data-testid="auth-access-context-ready"]');
    if (!(stage instanceof HTMLElement)) throw new Error('Access context stage is not rendered.');

    const canvas = within(canvasElement);
    await expect(canvas.getByText('Ponowne uwierzytelnienie')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Potwierdź ponownie' }));
  },
};

export const OnboardingStory: Story = {
  name: '25.10 Onboarding',
  render: () => (
    <AuthPageFrame
      storyId="25.10"
      summary="Onboarding zamyka wybory workspace/tenant, zgody, przetwarzanie rejestracji i wejście do aplikacji po utworzeniu kontekstu."
      title="Onboarding"
    >
      <StoryPresentationSection index="01" layout="showcase" title="Proces po rejestracji">
        <div className="pd-s25-stage pd-s25-stage--full" data-testid="auth-onboarding-ready">
          <AuthFlowPanel
            scenarios={[
              {
                description: 'Ekran utrzymuje status procesu, gdy konto i firma są tworzone po stronie usługi Auth/onboarding.',
                meta: ['przetwarzanie rejestracji', 'progress semantics', 'reduced motion'],
                status: 'Przetwarzanie',
                title: 'Przetwarzanie rejestracji',
                tone: 'neutral',
              },
              {
                action: 'Wybierz workspace',
                description: 'Użytkownik wybiera workspace lub organizację/tenanta, jeśli token i członkostwa zwracają więcej niż jeden kontekst.',
                meta: ['wybory workspace/tenant', 'organization switch', 'keyboard-only'],
                status: 'Wymaga wyboru',
                title: 'Wybór workspace i tenanta',
                tone: 'warning',
              },
              {
                description: 'Zgody są osobnym krokiem, a zakończenie procesu prowadzi do pierwszego ekranu aplikacji bez automatycznej mutacji w Storybooku.',
                meta: ['zgody', 'zakończenie procesu', 'wejście do aplikacji'],
                status: 'Gotowe',
                title: 'Zgody i zakończenie procesu',
                tone: 'success',
              },
              {
                description: 'OAuth i rejestracja e-mailem pozostają rozdzielone, żeby błędy providera nie blokowały formularza e-mail.',
                meta: ['rejestracja przez OAuth', 'rejestracja adresem e-mail', 'rejestracja zakończona'],
                status: 'Metody rejestracji',
                title: 'Rejestracja i OAuth',
                tone: 'neutral',
              },
            ]}
          />
        </div>
      </StoryPresentationSection>
    </AuthPageFrame>
  ),
  play: async ({ canvasElement }) => {
    const stage = canvasElement.querySelector('[data-testid="auth-onboarding-ready"]');
    if (!(stage instanceof HTMLElement)) throw new Error('Onboarding stage is not rendered.');

    const canvas = within(stage);
    await expect(canvas.getByText('Zgody i zakończenie procesu')).toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button', { name: 'Wybierz workspace' }));
  },
};
