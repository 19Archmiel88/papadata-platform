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

export type InlineNoticeProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
  | 'title'
> & {
  readonly actionLabel?: string | null;
  readonly dismissLabel?: string;
  readonly dismissible?: boolean;
  readonly icon?: PapaDataIconName | null;
  readonly message: string;
  readonly onAction?: (() => void) | undefined;
  readonly onDismiss?: (() => void) | undefined;
  readonly title?: string | null;
  readonly tone: FeedbackTone;
};

export const InlineNotice = forwardRef<
  HTMLElement,
  InlineNoticeProps
>(function InlineNotice(
  {
    actionLabel = null,
    className,
    dismissLabel = 'Zamknij komunikat',
    dismissible = false,
    icon,
    message,
    onAction,
    onDismiss,
    title = null,
    tone,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const messageId = useId();
  const resolvedRole = resolveFeedbackRole(tone);
  const resolvedIcon =
    icon === undefined
      ? resolveFeedbackIconName(tone)
      : icon;
  const hasAction = Boolean(actionLabel && onAction);
  const canDismiss = Boolean(dismissible && onDismiss);

  return (
    <section
      {...props}
      ref={ref}
      aria-describedby={messageId}
      aria-labelledby={title ? titleId : undefined}
      className={joinClassNames(
        'pd-feedback-surface',
        className,
      )}
      data-dismissible={canDismiss ? 'true' : undefined}
      data-has-action={hasAction ? 'true' : undefined}
      data-tone={tone}
      role={resolvedRole}
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

        {canDismiss ? (
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

      {hasAction ? (
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
