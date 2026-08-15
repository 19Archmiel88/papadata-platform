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

export type EmptyStateVariant =
  | 'empty'
  | 'search'
  | 'forbidden'
  | 'configuration';

export type EmptyStateProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
  | 'title'
> & {
  readonly icon?: PapaDataIconName | null;
  readonly message: string;
  readonly primaryActionLabel?: string | null;
  readonly secondaryActionLabel?: string | null;
  readonly title: string;
  readonly variant?: EmptyStateVariant;
  readonly onPrimaryAction?: (() => void) | undefined;
  readonly onSecondaryAction?: (() => void) | undefined;
};

function resolveEmptyStateIcon(
  variant: EmptyStateVariant,
) {
  switch (variant) {
    case 'search':
      return 'search';
    case 'forbidden':
      return 'security';
    case 'configuration':
      return 'integration';
    case 'empty':
    default:
      return 'data';
  }
}

export const EmptyState = forwardRef<
  HTMLElement,
  EmptyStateProps
>(function EmptyState(
  {
    className,
    icon,
    message,
    onPrimaryAction,
    onSecondaryAction,
    primaryActionLabel = null,
    secondaryActionLabel = null,
    title,
    variant = 'empty',
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const resolvedIcon =
    icon === undefined
      ? resolveEmptyStateIcon(variant)
      : icon;
  const hasPrimaryAction = Boolean(primaryActionLabel && onPrimaryAction);
  const hasSecondaryAction = Boolean(secondaryActionLabel && onSecondaryAction);
  const hasActions = hasPrimaryAction || hasSecondaryAction;

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
      data-has-actions={hasActions ? 'true' : undefined}
      data-variant={variant}
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
      </div>

      {hasActions ? (
        <div className="pd-feedback-state__actions">
          {hasPrimaryAction ? (
            <Button
              onClick={onPrimaryAction}
              variant="primary"
            >
              {primaryActionLabel}
            </Button>
          ) : null}

          {hasSecondaryAction ? (
            <Button
              onClick={onSecondaryAction}
              variant="ghost"
            >
              {secondaryActionLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
});
