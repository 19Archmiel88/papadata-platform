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
  resolveDescribedBy,
} from '../Field/fieldUtils';
import {
  resolveStatusBadgeIconName,
} from '../Feedback/feedbackTone';
import {
  ProgressIndicator,
} from '../ProgressIndicator';
import type {
  ProgressIndicatorTone,
} from '../ProgressIndicator';
import {
  StatusBadge,
} from '../StatusBadge';
import '../Loading/loading.css';

export type BackgroundOperationStatus =
  | 'cancelled'
  | 'completed'
  | 'failed'
  | 'queued'
  | 'running';

export type BackgroundOperationActionVariant =
  | 'danger'
  | 'ghost'
  | 'secondary';

export type BackgroundOperationItemProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
  | 'title'
> & {
  readonly actionLabel?: string | null;
  readonly actionVariant?: BackgroundOperationActionVariant;
  readonly description?: string | null;
  readonly errorCode: string | null;
  readonly onAction?: (() => void) | undefined;
  readonly operationId: string;
  readonly progress: number | null;
  readonly showProgressValue?: boolean;
  readonly startedAt: string | null;
  readonly status: BackgroundOperationStatus;
  readonly statusText?: string | null;
  readonly title: string;
};

function resolveStatusTone(
  status: BackgroundOperationStatus,
): ProgressIndicatorTone {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'critical';
    case 'cancelled':
      return 'warning';
    case 'running':
      return 'neutral';
    case 'queued':
    default:
      return 'neutral';
  }
}

function resolveBadgeTone(
  status: BackgroundOperationStatus,
) {
  switch (status) {
    case 'completed':
      return 'success' as const;
    case 'failed':
      return 'critical' as const;
    case 'cancelled':
      return 'warning' as const;
    case 'running':
      return 'processing' as const;
    case 'queued':
    default:
      return 'neutral' as const;
  }
}

function resolveStatusText(
  status: BackgroundOperationStatus,
) {
  switch (status) {
    case 'completed':
      return 'Zakończone';
    case 'failed':
      return 'Błąd';
    case 'cancelled':
      return 'Anulowane';
    case 'running':
      return 'W toku';
    case 'queued':
    default:
      return 'Oczekuje';
  }
}

function resolveProgressLabel(
  status: BackgroundOperationStatus,
) {
  switch (status) {
    case 'queued':
    case 'running':
    case 'completed':
    case 'failed':
    case 'cancelled':
    default:
      return 'Postęp operacji';
  }
}

export const BackgroundOperationItem = forwardRef<
  HTMLElement,
  BackgroundOperationItemProps
>(function BackgroundOperationItem(
  {
    actionLabel = null,
    actionVariant,
    className,
    description = null,
    errorCode,
    onAction,
    operationId,
    progress,
    showProgressValue = true,
    startedAt,
    status,
    statusText = null,
    title,
    ...props
  },
  ref,
) {
    const titleId = useId();
    const descriptionId = useId();
    const badgeTone = resolveBadgeTone(status);
    const tone = resolveStatusTone(status);
    const resolvedStatusText =
      statusText
      ?? resolveStatusText(status);
    const resolvedActionVariant =
      actionVariant
      ?? (
        status === 'failed'
          ? 'danger'
          : 'ghost'
      );
    const hasProgress =
      progress !== null
      || status === 'running';
    const progressLabel = resolveProgressLabel(status);
    const describedBy = resolveDescribedBy(
      description
        ? descriptionId
        : undefined,
    );

  return (
    <article
      {...props}
      ref={ref}
      aria-describedby={describedBy}
      aria-labelledby={titleId}
      className={joinClassNames(
        'pd-background-operation',
        className,
      )}
      data-status={status}
    >
      <header className="pd-background-operation__header">
        <div className="pd-background-operation__heading">
          <div className="pd-background-operation__identity">
            <h3
              className="pd-background-operation__title"
              id={titleId}
            >
              {title}
            </h3>
            <div className="pd-background-operation__meta">
              <span className="pd-background-operation__meta-code">
                {operationId}
              </span>
              {startedAt ? (
                <span>{startedAt}</span>
              ) : null}
              {errorCode ? (
                <span>Kod: {errorCode}</span>
              ) : null}
            </div>
          </div>

          <StatusBadge
            icon={resolveStatusBadgeIconName(badgeTone)}
            status="Stan operacji"
            text={resolvedStatusText}
            tone={badgeTone}
          />
        </div>

        {description ? (
          <p
            className="pd-background-operation__description"
            id={descriptionId}
          >
            {description}
          </p>
        ) : null}
      </header>

      {hasProgress ? (
        <div className="pd-background-operation__progress">
          <ProgressIndicator
            className="pd-background-operation__progress-indicator"
            indeterminate={status === 'running' && progress === null}
            label={progressLabel}
            max={100}
            showValue={showProgressValue}
            tone={tone}
            value={progress}
          />
        </div>
      ) : null}

      {actionLabel ? (
        <footer className="pd-background-operation__footer">
          <Button
            className="pd-background-operation__action"
            onClick={onAction}
            size="small"
            variant={resolvedActionVariant}
          >
            {actionLabel}
          </Button>
        </footer>
      ) : null}
    </article>
  );
});
