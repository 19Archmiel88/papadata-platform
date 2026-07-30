import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import {
  Button,
} from '../Button';
import {
  joinClassNames,
} from '../Field/fieldUtils';
import {
  Icon,
} from '../../icons';
import type {
  PapaDataIconName,
} from '../../icons';
import '../Feedback/feedback.css';

export type ErrorStateVariant =
  | 'data'
  | 'permission'
  | 'integration'
  | 'system';

export type ErrorStateProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
  | 'title'
> & {
  readonly correlationId?: string | null;
  readonly errorCode: string;
  readonly icon?: PapaDataIconName | null;
  readonly message: string;
  readonly recoverable?: boolean;
  readonly retryLabel?: string | null;
  readonly supportLabel?: string | null;
  readonly title: string;
  readonly variant?: ErrorStateVariant;
  readonly onRetry?: (() => void) | undefined;
  readonly onSupport?: (() => void) | undefined;
};

function resolveErrorIcon(
  variant: ErrorStateVariant,
) {
  switch (variant) {
    case 'permission':
      return 'security';
    case 'integration':
      return 'integration';
    case 'data':
      return 'warning';
    case 'system':
    default:
      return 'warning';
  }
}

export const ErrorState = forwardRef<
  HTMLElement,
  ErrorStateProps
>(function ErrorState(
  {
    className,
    correlationId = null,
    errorCode,
    icon,
    message,
    onRetry,
    onSupport,
    recoverable = true,
    retryLabel = 'Ponów',
    supportLabel = 'Skontaktuj się ze wsparciem',
    title,
    variant = 'system',
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const resolvedIcon =
    icon === undefined
      ? resolveErrorIcon(variant)
      : icon;

  return (
    <section
      {...props}
      ref={ref}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={joinClassNames(
        'pd-feedback-state',
        className,
      )}
      data-variant={variant}
      role="alert"
    >
      {resolvedIcon ? (
        <span
          aria-hidden="true"
          className="pd-feedback-state__symbol"
        >
          <Icon decorative name={resolvedIcon} size={24} />
        </span>
      ) : null}

      <div className="pd-feedback-state__content">
        <h2
          className="pd-feedback-state__title"
          id={titleId}
        >
          {title}
        </h2>
        <p
          className="pd-feedback-state__description"
          id={descriptionId}
        >
          {message}
        </p>
        <div className="pd-feedback-surface__meta">
          <span>Kod błędu: {errorCode}</span>
          {correlationId ? (
            <span>Identyfikator korelacji: {correlationId}</span>
          ) : null}
        </div>
      </div>

      {(recoverable && retryLabel) || supportLabel ? (
        <div className="pd-feedback-state__actions">
          {recoverable && retryLabel ? (
            <Button
              onClick={onRetry}
              variant="secondary"
            >
              {retryLabel}
            </Button>
          ) : null}

          {supportLabel ? (
            <Button
              onClick={onSupport}
              variant="ghost"
            >
              {supportLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
});
