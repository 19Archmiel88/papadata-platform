import type { Meta, StoryObj } from '@storybook/react-vite';
import { useId, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';

import {
  Button,
  Checkbox,
  InlineNotice,
  PasswordField,
  TextField,
  VerificationCodeInput,
  type StatusBadgeTone,
} from '../../../design-system/components';
import { PapaDataBrand } from '../../../design-system/icons';
import '../foundations-demo.css';
import '../00-foundations/foundation-lab-alignment.css';
import './surfaces-laboratory.css';
import { EffectsLaboratory } from './EffectsLaboratory';
import { SeparatorLaboratory } from './SeparatorLaboratory';
import { DataSurfaceLaboratory } from './DataSurfaceLaboratory';
import { AppBackgroundLaboratory } from './AppBackgroundLaboratory';
const meta = {
  title: '05 Laboratorium decyzji/Tła i powierzchnie',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

type LocalizedCopy = {
  readonly pl: string;
  readonly en: string;
};

type StatusTone = StatusBadgeTone;

function readLocale() {
  if (typeof document === 'undefined') {
    return 'pl';
  }

  return document.documentElement.dataset.locale === 'en' ? 'en' : 'pl';
}

function copy(value: LocalizedCopy) {
  return readLocale() === 'en' ? value.en : value.pl;
}

function Localized({ pl, en }: LocalizedCopy) {
  return <>{readLocale() === 'en' ? en : pl}</>;
}


function SurfacePage({
  title,
  summary,
  meta,
  className,
  children,
}: {
  readonly title: ReactNode;
  readonly summary: ReactNode;
  readonly meta: ReadonlyArray<{
    readonly label: ReactNode;
    readonly value: ReactNode;
  }>;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <main className={['pd-f0-page', 'pd-s5-page', className].filter(Boolean).join(' ')}>
      <div className="pd-f0-page__inner">
        <header className="pd-f0-page__header">
          <div className="pd-f0-page__label">
            <span>05</span>
            <span>
              <Localized pl="Laboratorium decyzji" en="Decision laboratory" />
            </span>
          </div>
          <div className="pd-f0-page__heading">
            <h1>{title}</h1>
            <p>{summary}</p>
          </div>
          <dl className="pd-f0-page__meta" aria-label={copy({
            pl: 'Parametry kontraktu powierzchni',
            en: 'Surface contract parameters',
          })}>
            {meta.map((item, index) => (
              <div key={index}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </header>
        {children}
      </div>
    </main>
  );
}

function SurfaceSection({
  index,
  title,
  summary,
  children,
}: {
  readonly index: string;
  readonly title: ReactNode;
  readonly summary?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="pd-f0-section">
      <header className="pd-f0-section__header">
        <span className="pd-f0-section__index" aria-hidden="true">
          {index}
        </span>
        <div>
          <h2>{title}</h2>
          {summary ? <p>{summary}</p> : null}
        </div>
      </header>
      <div className="pd-f0-section__content">{children}</div>
    </section>
  );
}

function SurfaceVariant({
  title,
  description,
  token,
  children,
  surface = 'plain',
}: {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly token?: ReactNode;
  readonly children: ReactNode;
  readonly surface?: 'plain' | 'subtle' | 'data';
}) {
  return (
    <article className="pd-f0-variant" data-reference="demo-only" data-surface={surface}>
      <header className="pd-f0-variant__header">
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
        {token ? <code>{token}</code> : null}
      </header>
      <div className="pd-f0-variant__body">{children}</div>
    </article>
  );
}

// Storybook reference helper only; status API is owned by StatusBadgeTone.
function StatusBadge({
  tone,
  children,
}: {
  readonly tone: StatusTone;
  readonly children: ReactNode;
}) {
  return (
    <span className="pd-f0-status" data-reference="demo-only" data-tone={tone}>
      <span aria-hidden="true" />
      {children}
    </span>
  );
}

function ThemePreview({
  theme,
  title,
  description,
  children,
}: {
  readonly theme: 'light' | 'dark';
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <article className="pd-f0-theme-preview" data-reference="demo-only" data-theme={theme}>
      <header>
        <span>
          {theme === 'light' ? (
            <Localized pl="Tryb jasny" en="Light mode" />
          ) : (
            <Localized pl="Tryb ciemny" en="Dark mode" />
          )}
        </span>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </header>
      <div className="pd-f0-theme-preview__body">{children}</div>
    </article>
  );
}

function ThemePair({
  light,
  dark,
}: {
  readonly light: ReactNode;
  readonly dark: ReactNode;
}) {
  return (
    <div className="pd-f0-theme-pair" data-reference="demo-only">
      {light}
      {dark}
    </div>
  );
}

function ContractMeta({
  id,
  variants,
  behavior,
}: {
  readonly id: string;
  readonly variants: ReactNode;
  readonly behavior?: ReactNode;
}) {
  const items = [
    {
      label: <Localized pl="Kontrakt" en="Contract" />,
      value: id,
    },
    {
      label: <Localized pl="Warianty" en="Variants" />,
      value: variants,
    },
    {
      label: <Localized pl="Źródło UI" en="UI source" />,
      value: <Localized pl="00 Fundamenty" en="00 Foundations" />,
    },
  ];

  if (behavior) {
    items.splice(2, 0, {
      label: <Localized pl="Właściciel scrolla" en="Scroll owner" />,
      value: behavior,
    });
  }

  return items;
}

function MetaVariantList({
  items,
}: {
  readonly items: ReadonlyArray<ReactNode>;
}) {
  return (
    <span className="pd-s5-meta-list">
      {items.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </span>
  );
}

function DecisionList({
  accepted,
  rejected,
}: {
  readonly accepted: ReactNode;
  readonly rejected: ReactNode;
}) {
  return (
    <div className="pd-f0-decision-list">
      <div data-result="accepted">
        <StatusBadge tone="success">
          <Localized pl="Stosujemy" en="Use" />
        </StatusBadge>
        <p>{accepted}</p>
      </div>
      <div data-result="rejected">
        <StatusBadge tone="critical">
          <Localized pl="Odrzucamy" en="Avoid" />
        </StatusBadge>
        <p>{rejected}</p>
      </div>
    </div>
  );
}

function AuthFieldDemo({
  label,
  short = false,
}: {
  readonly label: ReactNode;
  readonly short?: boolean;
}) {
  return (
    <div className="pd-s5-field-demo">
      <span>{label}</span>
      <i data-short={short ? 'true' : 'false'} />
    </div>
  );
}

type AuthMode = 'login' | 'register' | 'mfa' | 'reset' | 'invite';
type NoticeTone = 'info' | 'success' | 'warning' | 'critical';

type AuthDemoAction = {
  readonly label: LocalizedCopy;
  readonly message?: LocalizedCopy;
  readonly disabled?: boolean;
  readonly disabledReason?: LocalizedCopy;
};

type AuthDemoConfig = {
  readonly operationId: string;
  readonly stateLabel: LocalizedCopy;
  readonly noticeTone: NoticeTone;
  readonly noticeTitle: LocalizedCopy;
  readonly noticeMessage: LocalizedCopy;
  readonly primaryLabel: LocalizedCopy;
  readonly primaryAnnouncement: LocalizedCopy;
  readonly primaryDisabled?: boolean;
  readonly primaryLoading?: boolean;
  readonly primaryDisabledReason?: LocalizedCopy;
  readonly secondaryActions?: readonly AuthDemoAction[];
};

const authInitialValues = {
  login: {
    email: 'anna@papadata.pl',
    password: 'demo-password',
  },
  register: {
    email: 'anna@papadata',
    password: 'kr0tkie',
    passwordConfirmation: 'inne-haslo',
    inviteToken: 'inv_demo_7K2',
  },
  mfa: {
    challengeId: 'mfa_ch_9H2P',
    verificationCode: '3812',
  },
  reset: {
    email: 'anna@papadata.pl',
  },
  invite: {
    invitationToken: 'inv_blocked_K9F2',
    recipientEmail: 'anna@papadata.pl',
  },
} satisfies Record<AuthMode, Record<string, string>>;

const authDemoConfig: Record<AuthMode, AuthDemoConfig> = {
  login: {
    operationId: 'auth.login',
    stateLabel: {
      pl: 'ready',
      en: 'ready',
    },
    noticeTone: 'info',
    noticeTitle: {
      pl: 'Stan gotowy do wysłania',
      en: 'Ready to submit',
    },
    noticeMessage: {
      pl: 'Pola logowania są aktywne, wymagane i zachowują wartości lokalnie w Storybooku.',
      en: 'Sign-in fields are active, required and keep their values locally in Storybook.',
    },
    primaryLabel: {
      pl: 'Zaloguj się',
      en: 'Sign in',
    },
    primaryAnnouncement: {
      pl: 'Demo lokalne: zarejestrowano intencję auth.login bez komunikacji z backendem.',
      en: 'Local demo: auth.login intent recorded without backend communication.',
    },
    secondaryActions: [
      {
        label: {
          pl: 'Nie pamiętam hasła',
          en: 'Forgot password',
        },
        message: {
          pl: 'Demo lokalne: akcja prowadziłaby do auth-18, ale story nie przełącza pełnego FSM.',
          en: 'Local demo: the action would lead to auth-18, but the story does not switch the full FSM.',
        },
      },
      {
        label: {
          pl: 'Utwórz konto',
          en: 'Create account',
        },
        message: {
          pl: 'Demo lokalne: akcja prowadziłaby do auth-04, bez zmiany widoku i backendu.',
          en: 'Local demo: the action would lead to auth-04, without changing view or backend.',
        },
      },
    ],
  },
  register: {
    operationId: 'auth.register.email',
    stateLabel: {
      pl: 'validationError',
      en: 'validationError',
    },
    noticeTone: 'critical',
    noticeTitle: {
      pl: 'Błąd walidacji',
      en: 'Validation error',
    },
    noticeMessage: {
      pl: 'Adres e-mail i potwierdzenie hasła wymagają poprawy przed kontynuacją.',
      en: 'Email address and password confirmation must be corrected before continuing.',
    },
    primaryLabel: {
      pl: 'Utwórz konto',
      en: 'Create account',
    },
    primaryAnnouncement: {
      pl: 'Demo lokalne: walidacja formularza auth.register.email zatrzymuje wysłanie.',
      en: 'Local demo: auth.register.email form validation blocks submission.',
    },
  },
  mfa: {
    operationId: 'auth.mfa.verify',
    stateLabel: {
      pl: 'rateLimited',
      en: 'rateLimited',
    },
    noticeTone: 'warning',
    noticeTitle: {
      pl: 'Limit prób MFA',
      en: 'MFA attempt limit',
    },
    noticeMessage: {
      pl: 'Kod pozostaje widoczny, ale potwierdzenie jest czasowo zablokowane po przekroczeniu limitu prób.',
      en: 'The code remains visible, but confirmation is temporarily blocked after the attempt limit is reached.',
    },
    primaryLabel: {
      pl: 'Potwierdź MFA',
      en: 'Confirm MFA',
    },
    primaryAnnouncement: {
      pl: 'Demo lokalne: auth.mfa.verify nie jest wysyłane w stanie rateLimited.',
      en: 'Local demo: auth.mfa.verify is not sent while rateLimited.',
    },
    primaryDisabled: true,
    primaryDisabledReason: {
      pl: 'Limit prób: ponowne potwierdzenie dostępne za 60 sekund.',
      en: 'Attempt limit: confirmation is available again in 60 seconds.',
    },
    secondaryActions: [
      {
        label: {
          pl: 'Użyj innej metody',
          en: 'Use another method',
        },
        disabled: true,
        disabledReason: {
          pl: 'Stany alternatywnych metod wymagają pełnego Auth FSM poza bieżącym review 05.01.',
          en: 'Alternative-method states require the full Auth FSM outside the current 05.01 review.',
        },
      },
      {
        label: {
          pl: 'Odzyskaj dostęp',
          en: 'Recover access',
        },
        disabled: true,
        disabledReason: {
          pl: 'Odzyskanie dostępu nie ma lokalnego flow bez backendu.',
          en: 'Access recovery has no local flow without backend.',
        },
      },
    ],
  },
  reset: {
    operationId: 'auth.password.recovery.request',
    stateLabel: {
      pl: 'loading',
      en: 'loading',
    },
    noticeTone: 'info',
    noticeTitle: {
      pl: 'Wysyłanie linku resetującego',
      en: 'Sending reset link',
    },
    noticeMessage: {
      pl: 'Pole pozostaje opisane, a przycisk pokazuje stan przetwarzania bez zmiany geometrii.',
      en: 'The field remains labelled while the button shows processing without layout shift.',
    },
    primaryLabel: {
      pl: 'Wyślij link resetujący',
      en: 'Send reset link',
    },
    primaryAnnouncement: {
      pl: 'Demo lokalne: operacja auth.password.recovery.request jest w trakcie.',
      en: 'Local demo: auth.password.recovery.request is in progress.',
    },
    primaryLoading: true,
    primaryDisabledReason: {
      pl: 'Operacja w toku: kontrolki są czasowo niedostępne.',
      en: 'Operation in progress: controls are temporarily unavailable.',
    },
    secondaryActions: [
      {
        label: {
          pl: 'Wróć do logowania',
          en: 'Back to sign in',
        },
        disabled: true,
        disabledReason: {
          pl: 'Powrót jest zablokowany w tej lokalnej demonstracji stanu loading.',
          en: 'Back navigation is blocked in this local loading-state demonstration.',
        },
      },
    ],
  },
  invite: {
    operationId: 'invitation.validate',
    stateLabel: {
      pl: 'blocked',
      en: 'blocked',
    },
    noticeTone: 'critical',
    noticeTitle: {
      pl: 'Zaproszenie zablokowane',
      en: 'Invitation blocked',
    },
    noticeMessage: {
      pl: 'Token i adres odbiorcy są pokazane jako kontekst, ale decyzja wejścia jest niedostępna.',
      en: 'Token and recipient email are shown as context, but the entry decision is unavailable.',
    },
    primaryLabel: {
      pl: 'Zaakceptuj zaproszenie',
      en: 'Accept invitation',
    },
    primaryAnnouncement: {
      pl: 'Demo lokalne: invitation.validate nie jest wykonywane w stanie blocked.',
      en: 'Local demo: invitation.validate is not executed while blocked.',
    },
    primaryDisabled: true,
    primaryDisabledReason: {
      pl: 'Blocked: zaproszenie wymaga obsługi poza lokalnym Storybookiem.',
      en: 'Blocked: the invitation requires handling outside local Storybook.',
    },
    secondaryActions: [
      {
        label: {
          pl: 'Odrzuć zaproszenie',
          en: 'Decline invitation',
        },
        disabled: true,
        disabledReason: {
          pl: 'Odrzucenie zaproszenia wymaga backendu i pełnego FSM.',
          en: 'Declining the invitation requires backend and the full FSM.',
        },
      },
    ],
  },
};

function AuthCard({
  mode,
  title,
  helper,
  status,
  statusTone = 'success',
  priority = 'primary',
  surfaceId,
}: {
  readonly mode: AuthMode;
  readonly title: ReactNode;
  readonly helper: ReactNode;
  readonly status?: ReactNode;
  readonly statusTone?: StatusTone;
  readonly priority?: 'primary' | 'comparison';
  readonly surfaceId?: ReactNode;
}) {
  const autoId = useId();
  const normalizedId = autoId.replace(/:/g, '');
  const [values, setValues] = useState<Record<string, string>>(
    () => authInitialValues[mode],
  );
  const [rememberDevice, setRememberDevice] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const config = authDemoConfig[mode];
  const isComparison = priority === 'comparison';
  const stateId = `pd-s5-auth-${normalizedId}-${mode}-state`;
  const disabledReasonId = `pd-s5-auth-${normalizedId}-${mode}-disabled`;
  const liveId = `pd-s5-auth-${normalizedId}-${mode}-live`;
  const describedBy = [
    stateId,
    config.primaryDisabledReason ? disabledReasonId : null,
    liveId,
  ].filter(Boolean).join(' ');
  const hasPrimaryDisabled = config.primaryDisabled || config.primaryLoading;
  const showPrimaryAction = !isComparison || mode !== 'register';
  const visibilityLabelHidden = copy({
    pl: 'Pokaż hasło',
    en: 'Show password',
  });
  const visibilityLabelVisible = copy({
    pl: 'Ukryj hasło',
    en: 'Hide password',
  });

  const updateValue = (field: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;

    setValues((currentValues) => ({
      ...currentValues,
      [field]: nextValue,
    }));
  };

  const announce = (message: LocalizedCopy) => {
    setAnnouncement(copy(message));
  };

  const renderAuthFields = () => {
    const disabledForLoading = mode === 'reset';

    if (isComparison) {
      switch (mode) {
        case 'register':
          return (
            <TextField
              autocomplete="email"
              inputType="email"
              invalid
              label={copy({ pl: 'Adres e-mail', en: 'Email address' })}
              message={copy({
                pl: 'Podaj pełny adres e-mail.',
                en: 'Enter a complete email address.',
              })}
              onChange={updateValue('email')}
              required
              status="error"
              value={values.email ?? ''}
            />
          );
        case 'mfa':
          return (
            <VerificationCodeInput
              helperText={copy({
                pl: 'Ponowne wysłanie dostępne za 60 s.',
                en: 'Resend is available in 60 seconds.',
              })}
              inputMode="numeric"
              invalid
              label={copy({ pl: 'Kod weryfikacyjny MFA', en: 'MFA verification code' })}
              length={6}
              message={copy({
                pl: 'Kod musi mieć 6 cyfr.',
                en: 'The code must have 6 digits.',
              })}
              onChange={updateValue('verificationCode')}
              required
              status="error"
              value={values.verificationCode ?? ''}
            />
          );
        case 'reset':
          return (
            <TextField
              autocomplete="email"
              disabled={disabledForLoading}
              inputType="email"
              label={copy({ pl: 'Adres e-mail', en: 'Email address' })}
              readOnly
              required
              value={values.email ?? ''}
            />
          );
        case 'invite':
          return (
            <TextField
              autocomplete="email"
              disabled
              inputType="email"
              label={copy({ pl: 'Adres odbiorcy', en: 'Recipient email' })}
              readOnly
              value={values.recipientEmail ?? ''}
            />
          );
        case 'login':
          break;
      }
    }

    switch (mode) {
      case 'login':
        return (
          <>
            <TextField
              autocomplete="email"
              helperText={copy({
                pl: 'Adres używany do logowania.',
                en: 'Address used for sign-in.',
              })}
              inputType="email"
              label={copy({ pl: 'Adres e-mail', en: 'Email address' })}
              onChange={updateValue('email')}
              required
              value={values.email ?? ''}
            />
            <PasswordField
              autocomplete="current-password"
              helperText={copy({
                pl: 'Przycisk widoczności zachowuje focus.',
                en: 'The visibility control preserves focus.',
              })}
              label={copy({ pl: 'Hasło', en: 'Password' })}
              onChange={updateValue('password')}
              onVisibilityChange={setPasswordVisible}
              required
              value={values.password ?? ''}
              visibilityLabelHidden={visibilityLabelHidden}
              visibilityLabelVisible={visibilityLabelVisible}
              visible={passwordVisible}
            />
            <Checkbox
              checked={rememberDevice}
              label={copy({ pl: 'Zapamiętaj to urządzenie', en: 'Remember this device' })}
              onChange={(event) => setRememberDevice(event.currentTarget.checked)}
              value="remember-device"
            />
          </>
        );
      case 'register':
      case 'mfa':
      case 'reset':
      case 'invite':
        return null;
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    announce(config.primaryAnnouncement);
  };

  return (
    <article className="pd-s5-auth-card" data-mode={mode} data-priority={priority}>
      <header>
        {priority === 'primary' ? (
          <PapaDataBrand size="medium" />
        ) : (
          <span className="pd-s5-auth-card__id">{surfaceId}</span>
        )}
        {status ? <StatusBadge tone={statusTone}>{status}</StatusBadge> : null}
      </header>
      <div className="pd-s5-auth-card__copy">
        {priority === 'primary' ? (
          <span><Localized pl="Dostęp" en="Access" /></span>
        ) : null}
        <h3>{title}</h3>
        <p>{helper}</p>
      </div>
      <form
        aria-describedby={describedBy}
        aria-label={copy({
          pl: `Formularz ${config.operationId}`,
          en: `${config.operationId} form`,
        })}
        className="pd-s5-auth-form"
        data-priority={priority}
        noValidate
        onSubmit={handleSubmit}
      >
        <InlineNotice
          className="pd-s5-auth-form__notice"
          id={stateId}
          message={copy(config.noticeMessage)}
          title={copy(config.noticeTitle)}
          tone={config.noticeTone}
        />
        <div className="pd-s5-auth-form__fields">
          {renderAuthFields()}
        </div>
        {showPrimaryAction && config.primaryDisabledReason ? (
          <p className="pd-s5-auth-disabled-reason" id={disabledReasonId}>
            {copy(config.primaryDisabledReason)}
          </p>
        ) : null}
        {showPrimaryAction ? (
          <footer className="pd-s5-auth-form__actions">
            <Button
              aria-describedby={hasPrimaryDisabled ? disabledReasonId : undefined}
              disabled={config.primaryDisabled}
              fullWidth={priority === 'primary'}
              loading={config.primaryLoading}
              loadingLabel={copy({
                pl: 'Przetwarzanie',
                en: 'Processing',
              })}
              type="submit"
              variant={priority === 'primary' ? 'primary' : 'secondary'}
            >
              {copy(config.primaryLabel)}
            </Button>
            {priority === 'primary' && config.secondaryActions && config.secondaryActions.length > 0 ? (
              <div className="pd-s5-auth-form__secondary">
                {config.secondaryActions.map((action, actionIndex) => {
                  const actionReasonId = `${disabledReasonId}-${actionIndex}`;
                  const actionMessage = action.message;
                  const actionDisabledReason = action.disabledReason;

                  return (
                    <span className="pd-s5-auth-form__secondary-item" key={copy(action.label)}>
                      <Button
                        aria-describedby={action.disabled && actionDisabledReason ? actionReasonId : undefined}
                        disabled={action.disabled}
                        onClick={actionMessage ? () => announce(actionMessage) : undefined}
                        type="button"
                        variant="link"
                      >
                        {copy(action.label)}
                      </Button>
                      {action.disabled && actionDisabledReason ? (
                        <span
                          className="pd-s5-auth-disabled-reason"
                          id={actionReasonId}
                        >
                          {copy(actionDisabledReason)}
                        </span>
                      ) : null}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </footer>
        ) : null}
        <p
          aria-atomic="true"
          aria-live="polite"
          className="pd-visually-hidden"
          id={liveId}
        >
          {announcement}
        </p>
        {priority === 'primary' ? (
          <dl className="pd-s5-auth-form__meta" aria-label={copy({
            pl: 'Metadane stanu formularza',
            en: 'Form state metadata',
          })}>
            <div>
              <dt><Localized pl="Operacja" en="Operation" /></dt>
              <dd>{config.operationId}</dd>
            </div>
            <div>
              <dt><Localized pl="Stan" en="State" /></dt>
              <dd>{copy(config.stateLabel)}</dd>
            </div>
          </dl>
        ) : null}
      </form>
    </article>
  );
}

function AuthServiceUnavailableProof() {
  return (
    <aside
      aria-label={copy({
        pl: 'Dowód globalnego błędu Auth',
        en: 'Auth global error proof',
      })}
      className="pd-s5-auth-state-proof"
    >
      <InlineNotice
        message={copy({
          pl: 'Global error pozostaje widoczny bez lokalnej akcji retry, której dokumentacja nie definiuje bez backendu.',
          en: 'The global error remains visible without a local retry action, which documentation does not define without a backend.',
        })}
        title={copy({
          pl: 'Usługa niedostępna',
          en: 'Service unavailable',
        })}
        tone="critical"
      />
      <p>
        <Localized
          pl="BRAK DECYZJI W DOKUMENTACJI: retry pozostaje poza lokalnym prototypem."
          en="MISSING DECISION IN DOCUMENTATION: retry remains outside the local prototype."
        />
      </p>
    </aside>
  );
}

const authAcceptedReasons = [
  {
    title: {
      pl: 'Formularz bez obramowanego wrappera',
      en: 'Form without a bordered wrapper',
    },
    description: {
      pl: 'Formularz leży bezpośrednio na canvasie; hierarchię budują rytm, separator i szerokość treści.',
      en: 'The form sits directly on the canvas; rhythm, a divider and content width build the hierarchy.',
    },
  },
  {
    title: {
      pl: 'Hairline i rytm',
      en: 'Hairline and rhythm',
    },
    description: {
      pl: 'Hierarchię budują typografia, odstępy i pojedynczy separator, nie ramka na każdym elemencie.',
      en: 'Hierarchy comes from typography, spacing and one divider, not a frame around every element.',
    },
  },
  {
    title: {
      pl: 'CTA z jasną relacją',
      en: 'Clear CTA relationship',
    },
    description: {
      pl: 'Akcja główna jest jednoznaczna, a akcje pomocnicze pozostają lżejsze.',
      en: 'The primary action is explicit while secondary actions stay lighter.',
    },
  },
  {
    title: {
      pl: 'Status tekstem',
      en: 'Status as text',
    },
    description: {
      pl: 'Stan bezpieczeństwa jest widoczny w komunikacie, nie wyłącznie kolorem.',
      en: 'Security state is visible in the notice, not only through color.',
    },
  },
] satisfies ReadonlyArray<{
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
}>;

const authRejectedViolations = [
  {
    title: {
      pl: 'Nadmiar ramek',
      en: 'Too many frames',
    },
    description: {
      pl: 'Każde pole i panel ma własną mocną ramkę, więc separator staje się dekoracją zamiast strukturą.',
      en: 'Every field and panel has its own strong frame, so the divider becomes decoration instead of structure.',
    },
  },
  {
    title: {
      pl: 'Cień bez warstwy',
      en: 'Shadow without layer',
    },
    description: {
      pl: 'Ciężki cień udaje overlay, mimo że formularz nie jest nakładką ani modalem.',
      en: 'The heavy shadow pretends to be an overlay even though the form is not a modal or overlay.',
    },
  },
  {
    title: {
      pl: 'Przypadkowy gradient i glow',
      en: 'Arbitrary gradient and glow',
    },
    description: {
      pl: 'Dekoracyjne światło obniża czytelność i nie jest kontrolowanym gradientem marki ani wizualizacji.',
      en: 'Decorative light lowers readability and is not a controlled brand or visualization gradient.',
    },
  },
  {
    title: {
      pl: 'Nieczytelna hierarchia',
      en: 'Unclear hierarchy',
    },
    description: {
      pl: 'Hero 50/50 i dwa równorzędne przyciski odciągają uwagę od jednego celu logowania.',
      en: 'The 50/50 hero and two equal buttons pull attention away from the single sign-in goal.',
    },
  },
  {
    title: {
      pl: 'Błędne grupowanie',
      en: 'Wrong grouping',
    },
    description: {
      pl: 'Pola są rozdzielone ozdobnymi modułami, więc formularz przestaje być jednym zadaniem.',
      en: 'Fields are split by decorative modules, so the form stops reading as one task.',
    },
  },
] satisfies ReadonlyArray<{
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
}>;

const authScopeBoundaries = [
  {
    label: {
      pl: 'Aktywne review',
      en: 'Active review',
    },
    value: {
      pl: 'desktop light/dark, reprezentatywne stany formularzy i porównanie decyzji',
      en: 'desktop light/dark, representative form states and decision comparison',
    },
    tone: 'success',
  },
  {
    label: {
      pl: 'Odroczone',
      en: 'Deferred',
    },
    value: {
      pl: 'mobile i tablet pozostają wymaganiem katalogu, ale są poza bieżącym review 05.01',
      en: 'mobile and tablet remain catalog requirements, but are outside the current 05.01 review',
    },
    tone: 'info',
  },
  {
    label: {
      pl: 'Mock lokalny',
      en: 'Local mock',
    },
    value: {
      pl: 'formularze i komunikaty demonstrują zachowania Storybooka, nie produkcyjny AuthShell',
      en: 'forms and notices demonstrate Storybook behavior, not a production AuthShell',
    },
    tone: 'neutral',
  },
  {
    label: {
      pl: 'Poza zakresem',
      en: 'Out of scope',
    },
    value: {
      pl: 'pełny Auth FSM, backend, API, produkcyjne ekrany Auth i produkcyjna akceptacja',
      en: 'full Auth FSM, backend, API, production Auth screens and production acceptance',
    },
    tone: 'warning',
  },
] satisfies ReadonlyArray<{
  readonly label: LocalizedCopy;
  readonly value: LocalizedCopy;
  readonly tone: StatusTone;
}>;

function AuthThemeSample() {
  return (
    <div
      aria-label={copy({
        pl: 'Statyczna próbka geometrii panelu logowania',
        en: 'Static sign-in panel geometry sample',
      })}
      className="pd-s5-auth-theme-sample"
      role="img"
    >
      <div aria-hidden="true">
        <header>
          <PapaDataBrand size="small" />
          <span><Localized pl="review desktopowe" en="desktop review" /></span>
        </header>
        <div className="pd-s5-auth-theme-sample__copy">
          <span><Localized pl="Dostęp" en="Access" /></span>
          <strong><Localized pl="Logowanie" en="Sign in" /></strong>
          <p>
            <Localized
              pl="Formularz leży bezpośrednio na spokojnym canvasie, bez obramowanej karty."
              en="The form sits directly on a calm canvas without a bordered card."
            />
          </p>
        </div>
        <div className="pd-s5-auth-theme-sample__form">
          <span data-role="notice">
            <Localized pl="Stan gotowy do wysłania" en="Ready to submit" />
          </span>
          <i data-field="email" />
          <i data-field="password" />
          <span data-role="check">
            <Localized pl="Zapamiętaj to urządzenie" en="Remember this device" />
          </span>
          <span data-role="primary">
            <Localized pl="Zaloguj się" en="Sign in" />
          </span>
        </div>
      </div>
    </div>
  );
}

function AuthAcceptedExample() {
  return (
    <article
      aria-label={copy({
        pl: 'Rozwiązanie właściwe Tła Auth zgodne z Fundamentami',
        en: 'Correct Auth background solution aligned with Foundations',
      })}
      className="pd-s5-auth-decision-example"
      data-result="accepted"
    >
      <header>
        <StatusBadge tone="success">
          <Localized pl="Stosujemy" en="Use" />
        </StatusBadge>
        <p>
          <Localized
            pl="Spokojny canvas, formularz bez obramowanego wrappera i status osadzony przy zadaniu."
            en="Calm canvas, a form without a bordered wrapper and status placed with the task."
          />
        </p>
      </header>
      <div className="pd-s5-auth-accepted-shell">
        <div className="pd-s5-auth-accepted-shell__brand">
          <PapaDataBrand size="small" />
          <span><Localized pl="review desktopowe" en="desktop review" /></span>
        </div>
        <div className="pd-s5-auth-accepted-shell__form" aria-hidden="true">
          <span data-role="eyebrow"><Localized pl="Dostęp" en="Access" /></span>
          <strong><Localized pl="Logowanie" en="Sign in" /></strong>
          <i data-field="email" />
          <i data-field="password" />
          <span data-role="notice"><Localized pl="status: gotowy" en="status: ready" /></span>
          <span data-role="primary"><Localized pl="Zaloguj się" en="Sign in" /></span>
          <span data-role="secondary"><Localized pl="Nie pamiętam hasła" en="Forgot password" /></span>
        </div>
      </div>
      <ul className="pd-s5-auth-reason-list">
        {authAcceptedReasons.map((reason) => (
          <li key={copy(reason.title)}>
            <strong>{copy(reason.title)}</strong>
            <span>{copy(reason.description)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function RejectedAuthExample() {
  return (
    <article
      aria-label={copy({
        pl: 'Antyprzykład Tła Auth z opisanymi naruszeniami',
        en: 'Auth background anti-example with described violations',
      })}
      className="pd-s5-auth-decision-example"
      data-result="rejected"
    >
      <header>
        <StatusBadge tone="critical">
          <Localized pl="Odrzucamy" en="Avoid" />
        </StatusBadge>
        <p>
          <Localized
            pl="To nie jest tylko brzydsza karta: przykład miesza odpowiedzialności powierzchni, dekorację i akcje."
            en="This is not just an uglier card: it mixes surface responsibility, decoration and actions."
          />
        </p>
      </header>
      <div className="pd-s5-auth-rejected" aria-hidden="true">
        <section>
          <span>Hero 50/50</span>
          <strong><Localized pl="Pakiet dostępu do analityki" en="Analytics access suite" /></strong>
          <p>
            <Localized
              pl="Gradient, glow i hasło marketingowe zajmują połowę ekranu przed formularzem."
              en="A gradient, glow and marketing slogan take half of the screen before the form."
            />
          </p>
          <i />
        </section>
        <aside>
          <div>
            <span data-field="email" />
            <span data-field="password" />
            <span data-field="tenant" />
            <span data-role="primary"><Localized pl="Kontynuuj" en="Continue" /></span>
            <span data-role="primary"><Localized pl="Pomoc" en="Help" /></span>
          </div>
        </aside>
      </div>
      <ul className="pd-s5-auth-violation-list">
        {authRejectedViolations.map((violation) => (
          <li key={copy(violation.title)}>
            <strong>{copy(violation.title)}</strong>
            <span>{copy(violation.description)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function AuthDecisionComparison() {
  return (
    <div className="pd-s5-auth-decision-grid">
      <AuthAcceptedExample />
      <RejectedAuthExample />
    </div>
  );
}

function AuthScopeBoundaryList() {
  return (
    <dl
      aria-label={copy({
        pl: 'Granice zakresu review 05.01',
        en: '05.01 review scope boundaries',
      })}
      className="pd-s5-auth-scope-boundaries"
    >
      {authScopeBoundaries.map((boundary) => (
        <div key={copy(boundary.label)}>
          <dt>
            <StatusBadge tone={boundary.tone}>{copy(boundary.label)}</StatusBadge>
          </dt>
          <dd>{copy(boundary.value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function AuthMatrix() {
  return (
    <div
      className="pd-s5-auth-matrix"
      aria-label={copy({
        pl: 'Kompozycja wariantów Auth dla desktopowego review',
        en: 'Auth variant composition for desktop review',
      })}
    >
      <div className="pd-s5-auth-primary">
        <AuthCard
          mode="login"
          priority="primary"
          surfaceId="auth-02"
          title={<Localized pl="Logowanie" en="Sign in" />}
          helper={<Localized pl="Główny wariant pokazuje aktywne pola auth.login bezpośrednio na spokojnym canvasie." en="The primary variant shows active auth.login fields directly on a calm canvas." />}
          status={<Localized pl="ready" en="ready" />}
          statusTone="info"
        />
      </div>

      <section
        aria-label={copy({
          pl: 'Warianty porównawcze Auth',
          en: 'Auth comparison variants',
        })}
        className="pd-s5-auth-comparisons"
      >
        <header className="pd-s5-auth-comparisons__header">
          <div>
            <span><Localized pl="Stany reprezentatywne" en="Representative states" /></span>
            <h3><Localized pl="Pozostałe zadania Auth" en="Other Auth tasks" /></h3>
          </div>
          <p>
            <Localized
              pl="Każdy wariant pokazuje wyłącznie element rozstrzygający dany stan: błąd pola, kod MFA, przetwarzanie albo blokadę zaproszenia."
              en="Each variant shows only the element that defines its state: a field error, MFA code, processing or an invitation block."
            />
          </p>
        </header>
        <div className="pd-s5-auth-rail">
          <AuthCard
            mode="register"
            priority="comparison"
            surfaceId="auth-04"
            title={<Localized pl="Rejestracja" en="Registration" />}
            helper={<Localized pl="ValidationError pokazuje lokalne błędy pól i komunikat globalny." en="ValidationError shows local field errors and a global notice." />}
            status={<Localized pl="validationError" en="validationError" />}
            statusTone="critical"
          />
          <AuthCard
            mode="mfa"
            priority="comparison"
            surfaceId="auth-16"
            title={<Localized pl="MFA" en="MFA" />}
            helper={<Localized pl="Rate limit blokuje wysłanie, ale kod i komunikat pozostają czytelne." en="Rate limit blocks submission while code and notice remain readable." />}
            status={<Localized pl="rateLimited" en="rateLimited" />}
            statusTone="warning"
          />
          <AuthCard
            mode="reset"
            priority="comparison"
            surfaceId="auth-18/20"
            title={<Localized pl="Reset hasła" en="Password reset" />}
            helper={<Localized pl="Loading pokazuje przetwarzanie odzyskiwania bez utraty etykiety pola." en="Loading shows recovery processing without losing the field label." />}
            status={<Localized pl="loading" en="loading" />}
            statusTone="processing"
          />
          <AuthCard
            mode="invite"
            priority="comparison"
            surfaceId="auth-15"
            title={<Localized pl="Zaproszenie" en="Invitation" />}
            helper={<Localized pl="Blocked pokazuje kontekst zaproszenia bez aktywnych decyzji wejścia." en="Blocked shows invitation context without active entry decisions." />}
            status={<Localized pl="blocked" en="blocked" />}
            statusTone="critical"
          />
        </div>
      </section>

      <AuthServiceUnavailableProof />

      <aside
        aria-label={copy({
          pl: 'Odroczony zakres mobile i tablet',
          en: 'Deferred mobile and tablet scope',
        })}
        className="pd-s5-auth-deferred"
      >
        <StatusBadge tone="info">
          <Localized pl="Odroczone" en="Deferred" />
        </StatusBadge>
        <p>
          <Localized
            pl="Mobile i tablet pozostają wymaganiem katalogu, ale nie są projektowane ani odbierane w bieżącym desktopowym review 05.01."
            en="Mobile and tablet remain catalog requirements, but they are not designed or accepted in the current 05.01 desktop review."
          />
        </p>
      </aside>
    </div>
  );
}

export const TloAuth: Story = {
  name: 'Tło Auth',
  render: () => (
    <SurfacePage
      className="pd-s5-page--auth"
      title={<Localized pl="Tło Auth" en="Auth background" />}
      summary={
        <Localized
          pl="Spokojny publiczny canvas z formularzem osadzonym bezpośrednio w tle, bez obramowanej karty. Warianty pokazują decyzję powierzchni, nie osobne ekrany marketingowe."
          en="A calm public canvas with the form placed directly on the background without a bordered card. Variants show the surface decision, not separate marketing screens."
        />
      }
      meta={ContractMeta({
        id: '05.01',
        variants: (
          <MetaVariantList
            items={[
              <Localized key="login" pl="Logowanie" en="Sign in" />,
              <Localized key="register" pl="Rejestracja" en="Registration" />,
              <Localized key="mfa" pl="MFA" en="MFA" />,
              <Localized key="reset" pl="Reset hasła" en="Password reset" />,
              <Localized key="invite" pl="Zaproszenie" en="Invitation" />,
              <Localized key="deferred" pl="Mobile/tablet: odroczone" en="Mobile/tablet: deferred" />,
            ]}
          />
        ),
      })}
    >
      <SurfaceSection
        index="01"
        title={<Localized pl="Kompozycja desktopowa" en="Desktop composition" />}
        summary={<Localized pl="Logowanie pozostaje pełnym wariantem głównym na canvasie. Pozostałe zadania Auth są krótkimi próbkami stanów, bez powtarzania całych formularzy; mobile i tablet pozostają odroczone." en="Sign-in remains the complete primary variant on the canvas. Other Auth tasks are compact state samples without repeating full forms; mobile and tablet remain deferred." />}
      >
        <AuthMatrix />
      </SurfaceSection>

      <SurfaceSection
        index="02"
        title={<Localized pl="Light i dark bez zmiany geometrii" en="Light and dark without geometry changes" />}
      >
        <ThemePair
          light={
            <ThemePreview
              description={<Localized pl="Panel zachowuje czytelną szerokość bez rozciągania formularza." en="The panel keeps a readable width without stretching the form." />}
              theme="light"
              title={<Localized pl="Panel 380–440 px" en="380–440 px panel" />}
            >
              <AuthThemeSample />
            </ThemePreview>
          }
          dark={
            <ThemePreview
              description={<Localized pl="Zmieniają się tokeny kolorów, nie geometria ani hierarchia." en="Color tokens change, not geometry or hierarchy." />}
              theme="dark"
              title={<Localized pl="Ta sama struktura" en="Same structure" />}
            >
              <AuthThemeSample />
            </ThemePreview>
          }
        />
      </SurfaceSection>

      <SurfaceSection
        index="03"
        title={<Localized pl="Decyzja i antyprzykład" en="Decision and anti-example" />}
        summary={<Localized pl="Porównanie pokazuje właściwy kierunek 05.01, konkretne naruszenia antyprzykładu oraz granice aktywnego review." en="The comparison shows the 05.01 direction, concrete anti-example violations and active review boundaries." />}
      >
        <DecisionList
          accepted={<Localized pl="Spokojny canvas, formularz bez obramowanego wrappera, hairline separacja i jedno dominujące CTA." en="Calm canvas, a form without a bordered wrapper, hairline separation and one dominant CTA." />}
          rejected={<Localized pl="Hero 50/50, nadmiar ramek, ciężki cień, przypadkowy gradient/glow i niejasne akcje." en="50/50 hero, too many frames, heavy shadow, arbitrary gradient/glow and unclear actions." />}
        />
        <SurfaceVariant
          title={<Localized pl="Rozwiązanie właściwe i odrzucone" en="Accepted and rejected solution" />}
          description={<Localized pl="Oba przykłady są statyczną demonstracją Storybooka. Aktywne formularze pozostają w sekcji 01." en="Both examples are a static Storybook demonstration. Active forms remain in section 01." />}
          token="05.01 review"
        >
          <AuthDecisionComparison />
        </SurfaceVariant>
        <SurfaceVariant
          title={<Localized pl="Granice zakresu 05.01" en="05.01 scope boundaries" />}
          description={<Localized pl="Status story pozostaje review; ta sekcja nie deklaruje produkcyjnego AuthShell ani akceptacji responsive." en="The story status remains review; this section does not declare production AuthShell or responsive acceptance." />}
          token="scope"
        >
          <AuthScopeBoundaryList />
        </SurfaceVariant>
      </SurfaceSection>
    </SurfacePage>
  ),
};

export const CanvasAplikacji: Story = {
  name: 'Tło aplikacji',
  render: () => <AppBackgroundLaboratory />,
};

export const PowierzchniaDanych: Story = {
  name: 'Powierzchnie danych',
  render: () => <DataSurfaceLaboratory />,
};

export const SeparatoryIObramowania: Story = {
  name: 'Separatory i obramowania',
  render: () => <SeparatorLaboratory />,
};

export const GradientySwiatloISzklo: Story = {
  name: 'Gradienty, światło i szkło',
  render: () => <EffectsLaboratory />,
};
