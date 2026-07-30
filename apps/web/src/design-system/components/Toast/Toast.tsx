import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import {
  TextAction,
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
import type {
  FeedbackTone,
} from '../Feedback/feedbackTone';
import {
  resolveFeedbackIconName,
  resolveFeedbackRole,
} from '../Feedback/feedbackTone';
import '../Feedback/feedback.css';

export type ToastProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
  | 'title'
> & {
  readonly actionLabel?: string | null;
  readonly dismissLabel?: string;
  readonly dismissible?: boolean;
  readonly durationMs?: number | null;
  readonly icon?: PapaDataIconName | null;
  readonly message: string;
  readonly onAction?: (() => void) | undefined;
  readonly onDismiss?: (() => void) | undefined;
  readonly title?: string | null;
  readonly toastId: string;
  readonly tone: FeedbackTone;
};

export const Toast = forwardRef<
  HTMLElement,
  ToastProps
>(function Toast(
  {
    actionLabel = null,
    className,
    dismissLabel = 'Zamknij powiadomienie',
    dismissible = false,
    durationMs = null,
    icon,
    message,
    onAction,
    onDismiss,
    title = null,
    toastId,
    tone,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const messageId = useId();
  const resolvedIcon =
    icon === undefined
      ? resolveFeedbackIconName(tone)
      : icon;

  return (
    <section
      {...props}
      ref={ref}
      aria-describedby={messageId}
      aria-labelledby={title ? titleId : undefined}
      className={joinClassNames(
        'pd-feedback-surface',
        'pd-toast',
        className,
      )}
      data-tone={tone}
      data-toast-id={toastId}
      role={resolveFeedbackRole(tone)}
    >
      <div className="pd-feedback-surface__header">
        {resolvedIcon ? (
          <span
            aria-hidden="true"
            className="pd-feedback-surface__icon"
          >
            <Icon decorative name={resolvedIcon} size={20} />
          </span>
        ) : null}

        <div className="pd-feedback-surface__body">
          {title ? (
            <p
              className="pd-feedback-surface__title"
              id={titleId}
            >
              {title}
            </p>
          ) : null}

          <p
            className="pd-feedback-surface__message"
            id={messageId}
          >
            {message}
          </p>
        </div>

        {dismissible ? (
          <TextAction
            aria-label={dismissLabel}
            className="pd-feedback-surface__close"
            onClick={onDismiss}
            size="small"
            tone="muted"
          >
            Zamknij
          </TextAction>
        ) : null}
      </div>

      <div className="pd-feedback-surface__meta">
        {durationMs ? (
          <span>Wygasa po {Math.round(durationMs / 1000)} s.</span>
        ) : (
          <span>Wariant prezentacyjny bez automatycznego wygaszania.</span>
        )}
      </div>

      {actionLabel ? (
        <div className="pd-feedback-surface__actions">
          <TextAction
            onClick={onAction}
            size="small"
          >
            {actionLabel}
          </TextAction>
        </div>
      ) : null}
    </section>
  );
});
