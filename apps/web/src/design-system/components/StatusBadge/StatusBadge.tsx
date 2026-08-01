import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
} from 'react';

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
  StatusBadgeTone,
} from '../Feedback/feedbackTone';
import '../Feedback/feedback.css';

export type StatusBadgeProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  | 'children'
> & {
  readonly icon?: PapaDataIconName | null;
  readonly status: string;
  readonly text: string;
  readonly tone: StatusBadgeTone;
};

export const StatusBadge = forwardRef<
  HTMLSpanElement,
  StatusBadgeProps
>(function StatusBadge(
  {
    className,
    icon,
    status,
    text,
    tone,
    ...props
  },
  ref,
) {
  return (
    <span
      {...props}
      ref={ref}
      aria-label={`${status}: ${text}`}
      className={joinClassNames(
        'pd-status-badge',
        className,
      )}
      data-tone={tone}
    >
      <span
        aria-hidden="true"
        className="pd-status-badge__dot"
      />
      {icon ? (
        <span
          aria-hidden="true"
          className="pd-status-badge__icon"
        >
          <Icon decorative name={icon} size={16} />
        </span>
      ) : null}
      <span className="pd-status-badge__text">
        {text}
      </span>
    </span>
  );
});
