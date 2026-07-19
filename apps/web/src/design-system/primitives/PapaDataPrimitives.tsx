import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Ban,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Eye,
  EyeOff,
  Info,
  LoaderCircle,
  LockKeyhole,
  MinusCircle,
  Moon,
  RefreshCw,
  Sun,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  useId,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';

import type { PapaDataLanguage, PapaDataTheme } from '../../contracts/ui';
import { PapaDataBrand } from '../brand/PapaDataBrand';
import './papadata-primitives.css';

type ClassValue = string | false | null | undefined;

function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> & {
  iconAfter?: ReactNode;
  iconBefore?: ReactNode;
  loading?: boolean;
  variant?: ButtonVariant;
};

export function Button({
  children,
  className,
  disabled,
  iconAfter,
  iconBefore,
  loading = false,
  type = 'button',
  variant = 'secondary',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      aria-busy={loading || undefined}
      className={cx(
        'pds-button',
        `pds-button--${variant}`,
        loading && 'pds-button--loading',
        className,
      )}
      disabled={isDisabled}
      type={type}
    >
      {loading ? (
        <LoaderCircle
          aria-hidden="true"
          className="pds-button__spinner"
          size={16}
          strokeWidth={1.8}
        />
      ) : (
        iconBefore
      )}
      <span>{children}</span>
      {iconAfter}
    </button>
  );
}

export type TextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children' | 'id' | 'prefix'
> & {
  helper?: string;
  icon?: ReactNode;
  id?: string;
  invalid?: boolean;
  label: string;
  labelAction?: ReactNode;
  validationMessage?: string;
};

export function TextField({
  className,
  helper,
  icon,
  id,
  invalid = false,
  label,
  labelAction,
  validationMessage,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const helperId = helper ? `${resolvedId}-hint` : undefined;
  const errorId =
    invalid && validationMessage ? `${resolvedId}-error` : undefined;
  const describedBy = [inputProps['aria-describedby'], helperId, errorId]
    .filter((item): item is string => typeof item === 'string')
    .join(' ');

  return (
    <div className={cx('pds-field', invalid && 'is-invalid', className)}>
      <span className="pds-field__head">
        <label className="pds-field__label" htmlFor={resolvedId}>
          {label}
        </label>
        {labelAction}
      </span>

      <span className="pds-input-frame">
        {icon}
        <input
          {...inputProps}
          aria-describedby={describedBy || undefined}
          aria-invalid={invalid || undefined}
          id={resolvedId}
        />
        <span className="pds-input-frame__signal" aria-hidden="true" />
      </span>

      {helper ? (
        <span className="pds-field__hint" id={helperId}>
          {helper}
        </span>
      ) : null}

      {invalid && validationMessage ? (
        <ValidationMessage id={errorId} tone="error">
          {validationMessage}
        </ValidationMessage>
      ) : null}
    </div>
  );
}

export type PasswordFieldProps = Omit<TextFieldProps, 'icon' | 'type'> & {
  onVisibleChange?: (visible: boolean) => void;
  visible?: boolean;
};

export function PasswordField({
  onVisibleChange,
  visible,
  ...props
}: PasswordFieldProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = visible !== undefined;
  const isVisible = visible ?? internalVisible;

  const toggleVisible = () => {
    const nextVisible = !isVisible;

    if (!isControlled) {
      setInternalVisible(nextVisible);
    }

    onVisibleChange?.(nextVisible);
  };

  return (
    <PasswordFieldFrame
      {...props}
      onToggleVisible={toggleVisible}
      visible={isVisible}
    />
  );
}

type PasswordFieldFrameProps = Omit<PasswordFieldProps, 'onVisibleChange' | 'visible'> & {
  onToggleVisible: () => void;
  visible: boolean;
};

function PasswordFieldFrame({
  className,
  helper,
  id,
  invalid = false,
  label,
  labelAction,
  onToggleVisible,
  validationMessage,
  visible,
  ...inputProps
}: PasswordFieldFrameProps) {
  const generatedId = useId();
  const resolvedId = id ?? generatedId;
  const helperId = helper ? `${resolvedId}-hint` : undefined;
  const errorId =
    invalid && validationMessage ? `${resolvedId}-error` : undefined;
  const describedBy = [inputProps['aria-describedby'], helperId, errorId]
    .filter((item): item is string => typeof item === 'string')
    .join(' ');

  return (
    <div className={cx('pds-field', invalid && 'is-invalid', className)}>
      <span className="pds-field__head">
        <label className="pds-field__label" htmlFor={resolvedId}>
          {label}
        </label>
        {labelAction}
      </span>

      <span className="pds-input-frame">
        <LockKeyhole aria-hidden="true" size={18} strokeWidth={1.8} />
        <input
          {...inputProps}
          aria-describedby={describedBy || undefined}
          aria-invalid={invalid || undefined}
          id={resolvedId}
          type={visible ? 'text' : 'password'}
        />
        <button
          aria-label={visible ? 'Ukryj hasło' : 'Pokaż hasło'}
          className="pds-field-action"
          disabled={inputProps.disabled}
          onClick={onToggleVisible}
          type="button"
        >
          {visible ? (
            <EyeOff aria-hidden="true" size={18} strokeWidth={1.8} />
          ) : (
            <Eye aria-hidden="true" size={18} strokeWidth={1.8} />
          )}
        </button>
      </span>

      {helper ? (
        <span className="pds-field__hint" id={helperId}>
          {helper}
        </span>
      ) : null}

      {invalid && validationMessage ? (
        <ValidationMessage id={errorId} tone="error">
          {validationMessage}
        </ValidationMessage>
      ) : null}
    </div>
  );
}

export type Provider = 'google' | 'microsoft';

export type ProviderButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> & {
  provider: Provider;
  unavailable?: boolean;
};

export function ProviderButton({
  children,
  className,
  provider,
  type = 'button',
  unavailable = false,
  ...props
}: ProviderButtonProps) {
  return (
    <button
      {...props}
      className={cx(
        'pds-provider-button',
        `pds-provider-button--${provider}`,
        unavailable && 'is-unavailable',
        className,
      )}
      type={type}
    >
      {provider === 'microsoft' ? <MicrosoftLogo /> : <GoogleLogo />}
      <span>{children}</span>
    </button>
  );
}

function MicrosoftLogo() {
  return (
    <svg
      aria-hidden="true"
      className="pds-provider-logo"
      viewBox="0 0 20 20"
    >
      <rect fill="#f25022" height="8.5" width="8.5" x="1" y="1" />
      <rect fill="#7fba00" height="8.5" width="8.5" x="10.5" y="1" />
      <rect fill="#00a4ef" height="8.5" width="8.5" x="1" y="10.5" />
      <rect fill="#ffb900" height="8.5" width="8.5" x="10.5" y="10.5" />
    </svg>
  );
}

function GoogleLogo() {
  return (
    <svg
      aria-hidden="true"
      className="pds-provider-logo"
      viewBox="0 0 24 24"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285f4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34a853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#fbbc05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#ea4335"
      />
    </svg>
  );
}

export type NoticeTone = 'info' | 'success' | 'warning' | 'error' | 'neutral';

const noticeIconByTone: Record<NoticeTone, LucideIcon> = {
  error: AlertCircle,
  info: Info,
  neutral: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

export type InlineNoticeProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode | false;
  title?: string;
  tone?: NoticeTone;
};

export function InlineNotice({
  children,
  className,
  icon,
  role,
  title,
  tone = 'info',
  ...props
}: InlineNoticeProps) {
  const NoticeIcon = noticeIconByTone[tone];
  const resolvedRole = role ?? (tone === 'error' ? 'alert' : 'status');

  return (
    <div
      {...props}
      className={cx('pds-inline-notice', `pds-inline-notice--${tone}`, className)}
      role={resolvedRole}
    >
      {icon === false ? null : (icon ?? <NoticeIcon aria-hidden="true" size={17} strokeWidth={1.8} />)}
      <span className="pds-inline-notice__body">
        {title ? (
          <span className="pds-inline-notice__title">{title}</span>
        ) : null}
        <span>{children}</span>
      </span>
    </div>
  );
}

export type ValidationMessageProps = HTMLAttributes<HTMLSpanElement> & {
  icon?: ReactNode | false;
  tone?: Exclude<NoticeTone, 'neutral'>;
};

export function ValidationMessage({
  children,
  className,
  icon,
  tone = 'error',
  ...props
}: ValidationMessageProps) {
  const MessageIcon = noticeIconByTone[tone];

  return (
    <span
      {...props}
      className={cx(
        'pds-validation-message',
        `pds-validation-message--${tone}`,
        className,
      )}
    >
      {icon === false ? null : (icon ?? <MessageIcon aria-hidden="true" size={14} strokeWidth={1.8} />)}
      <span>{children}</span>
    </span>
  );
}

export type StatusBadgeStatus =
  | 'active'
  | 'ready'
  | 'pending'
  | 'inProgress'
  | 'delayed'
  | 'warning'
  | 'error'
  | 'blocked'
  | 'inactive'
  | 'noData';

const statusBadgeConfig: Record<
  StatusBadgeStatus,
  {
    icon: LucideIcon;
    label: string;
  }
> = {
  active: { icon: CheckCircle2, label: 'aktywny' },
  blocked: { icon: Ban, label: 'zablokowany' },
  delayed: { icon: Clock3, label: 'opóźniony' },
  error: { icon: XCircle, label: 'błąd' },
  inactive: { icon: MinusCircle, label: 'nieaktywny' },
  inProgress: { icon: RefreshCw, label: 'w toku' },
  noData: { icon: Circle, label: 'brak danych' },
  pending: { icon: Clock3, label: 'oczekujący' },
  ready: { icon: BadgeCheck, label: 'gotowy' },
  warning: { icon: AlertTriangle, label: 'ostrzeżenie' },
};

export type StatusBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  label?: string;
  status: StatusBadgeStatus;
};

export function StatusBadge({
  className,
  label,
  status,
  ...props
}: StatusBadgeProps) {
  const config = statusBadgeConfig[status];
  const StatusIcon = config.icon;

  return (
    <span
      {...props}
      className={cx('pds-status-badge', `pds-status-badge--${status}`, className)}
    >
      <StatusIcon aria-hidden="true" size={13} strokeWidth={1.9} />
      <span>{label ?? config.label}</span>
    </span>
  );
}

export type AppHeaderProps = HTMLAttributes<HTMLElement> & {
  language?: PapaDataLanguage;
  onLanguageChange?: (language: PapaDataLanguage) => void;
  onThemeChange?: (theme: PapaDataTheme) => void;
  theme?: PapaDataTheme;
  trailing?: ReactNode;
};

export function AppHeader({
  className,
  language,
  onLanguageChange,
  onThemeChange,
  theme,
  trailing,
  ...props
}: AppHeaderProps) {
  const canChangeLanguage = language !== undefined && onLanguageChange;
  const canChangeTheme = theme !== undefined && onThemeChange;
  const nextLanguage: PapaDataLanguage = language === 'pl' ? 'en' : 'pl';
  const nextTheme: PapaDataTheme = theme === 'dark' ? 'light' : 'dark';
  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <header {...props} className={cx('pds-topbar', className)} aria-label="PapaData">
      <div className="pds-topbar__inner">
        <PapaDataBrand
          signetVariant="micro"
        />

        {canChangeLanguage || canChangeTheme || trailing ? (
          <div className="pds-preferences" aria-label="Ustawienia widoku">
            {canChangeLanguage ? (
              <button
                aria-label={
                  language === 'pl'
                    ? 'Zmień język na angielski'
                    : 'Zmień język na polski'
                }
                className="pds-preferences__button pds-preferences__button--language"
                onClick={() => onLanguageChange(nextLanguage)}
                type="button"
              >
                <span className="pds-language-switch" aria-hidden="true">
                  <span
                    className={cx(
                      'pds-language-switch__option',
                      language === 'pl' && 'is-active',
                    )}
                  >
                    PL
                  </span>
                  <span className="pds-language-switch__separator">/</span>
                  <span
                    className={cx(
                      'pds-language-switch__option',
                      language === 'en' && 'is-active',
                    )}
                  >
                    EN
                  </span>
                </span>
              </button>
            ) : null}

            {canChangeTheme ? (
              <button
                aria-label={
                  theme === 'dark'
                    ? 'Przełącz na motyw jasny'
                    : 'Przełącz na motyw ciemny'
                }
                aria-pressed={theme === 'dark'}
                className="pds-preferences__button pds-preferences__button--theme"
                onClick={() => onThemeChange(nextTheme)}
                type="button"
              >
                <ThemeIcon aria-hidden="true" size={18} strokeWidth={1.75} />
              </button>
            ) : null}

            {trailing}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export type PageHeaderProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: string;
  heading?: 'h1' | 'h2';
  text?: ReactNode;
  title: ReactNode;
};

export function PageHeader({
  children,
  className,
  eyebrow,
  heading = 'h1',
  text,
  title,
  ...props
}: PageHeaderProps) {
  const Heading = heading;

  return (
    <header {...props} className={cx('pds-page-header', className)}>
      {eyebrow ? <span className="pds-page-header__eyebrow">{eyebrow}</span> : null}
      <Heading>{title}</Heading>
      {text ? <p>{text}</p> : null}
      {children}
    </header>
  );
}

export type SurfaceProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'subtle' | 'plain';
};

export function Surface({
  className,
  variant = 'default',
  ...props
}: SurfaceProps) {
  return (
    <div
      {...props}
      className={cx('pds-card', variant !== 'default' && `pds-card--${variant}`, className)}
    />
  );
}

export const Card = Surface;

export type StepIndicatorStep = {
  icon?: ReactNode;
  key: string;
  label: string;
};

export type StepIndicatorProps = HTMLAttributes<HTMLOListElement> & {
  currentIndex: number;
  steps: readonly StepIndicatorStep[];
};

export function StepIndicator({
  className,
  currentIndex,
  steps,
  style,
  ...props
}: StepIndicatorProps) {
  return (
    <ol
      {...props}
      className={cx('pds-step-indicator', className)}
      style={{
        '--pds-step-count': steps.length,
        ...style,
      } as CSSProperties & Record<'--pds-step-count', number>}
    >
      {steps.map((step, index) => {
        const state =
          index < currentIndex
            ? 'is-complete'
            : index === currentIndex
              ? 'is-active'
              : undefined;

        return (
          <li className={state} key={step.key}>
            <span className="pds-step-indicator__node">
              {index < currentIndex ? (
                <Check aria-hidden="true" size={14} strokeWidth={2.2} />
              ) : (
                step.icon
              )}
            </span>
            <span className="pds-step-indicator__label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

export type StateBlockProps = HTMLAttributes<HTMLDivElement> & {
  action?: ReactNode;
  icon?: ReactNode;
  text: ReactNode;
  title: ReactNode;
};

export function LoadingState({
  action,
  className,
  icon,
  text,
  title,
  ...props
}: StateBlockProps) {
  return (
    <div {...props} className={cx('pds-loading-state', className)}>
      <span className="pds-state-symbol">
        {icon ?? <LoaderCircle aria-hidden="true" size={28} strokeWidth={1.7} />}
      </span>
      <PageHeader heading="h2" text={text} title={title} />
      {action}
    </div>
  );
}

export function EmptyState({
  action,
  className,
  icon,
  text,
  title,
  ...props
}: StateBlockProps) {
  return (
    <div {...props} className={cx('pds-empty-state', className)}>
      <span className="pds-state-symbol">
        {icon ?? <Info aria-hidden="true" size={28} strokeWidth={1.7} />}
      </span>
      <PageHeader heading="h2" text={text} title={title} />
      {action}
    </div>
  );
}

export function ErrorState({
  action,
  className,
  icon,
  text,
  title,
  ...props
}: StateBlockProps) {
  return (
    <div {...props} className={cx('pds-error-state', className)}>
      <span className="pds-state-symbol">
        {icon ?? <AlertCircle aria-hidden="true" size={28} strokeWidth={1.7} />}
      </span>
      <PageHeader heading="h2" text={text} title={title} />
      {action}
    </div>
  );
}

export type AuthShellProps = HTMLAttributes<HTMLDivElement> & {
  language?: PapaDataLanguage;
  onLanguageChange?: (language: PapaDataLanguage) => void;
  onThemeChange?: (theme: PapaDataTheme) => void;
  theme: PapaDataTheme;
};

export function AuthShell({
  children,
  className,
  language,
  onLanguageChange,
  onThemeChange,
  theme,
  ...props
}: AuthShellProps) {
  return (
    <div
      {...props}
      className={cx('pds-brand-surface pda-auth-shell', className)}
      data-theme={theme}
      lang={language}
    >
      <AppHeader
        language={language}
        onLanguageChange={onLanguageChange}
        onThemeChange={onThemeChange}
        theme={theme}
      />
      {children}
    </div>
  );
}

export function ActionArrow() {
  return <ArrowRight aria-hidden="true" size={18} strokeWidth={1.9} />;
}
