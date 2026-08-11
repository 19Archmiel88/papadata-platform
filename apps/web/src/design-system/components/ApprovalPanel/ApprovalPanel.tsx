import type {
  HTMLAttributes,
} from 'react';
import {
  forwardRef,
  useId,
} from 'react';

import {
  joinClassNames,
  resolveDescribedBy,
} from '../Field/fieldUtils';
import {
  StatusBadge,
} from '../StatusBadge';
import './approval-panel.css';

export type ApprovalPanelRisk =
  | 'low'
  | 'medium'
  | 'high';

export type ApprovalPanelApproverStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export type ApprovalPanelApprover = {
  readonly name: string;
  readonly status: ApprovalPanelApproverStatus;
  readonly userId: string;
};

export type ApprovalPanelProps = Omit<
  HTMLAttributes<HTMLElement>,
  | 'children'
> & {
  readonly approvers: readonly ApprovalPanelApprover[];
  readonly expiresAt: string | null;
  readonly risk: ApprovalPanelRisk;
  readonly subjectId: string;
  readonly subjectLabel: string;
};

function resolveRiskLabel(
  risk: ApprovalPanelRisk,
) {
  switch (risk) {
    case 'high':
      return 'Wysokie';
    case 'medium':
      return 'Średnie';
    case 'low':
    default:
      return 'Niskie';
  }
}

function resolveRiskTone(
  risk: ApprovalPanelRisk,
) {
  switch (risk) {
    case 'high':
      return 'critical' as const;
    case 'medium':
      return 'warning' as const;
    case 'low':
    default:
      return 'info' as const;
  }
}

function resolveApproverLabel(
  status: ApprovalPanelApproverStatus,
) {
  switch (status) {
    case 'approved':
      return 'Zatwierdzono';
    case 'rejected':
      return 'Odrzucono';
    case 'pending':
    default:
      return 'Oczekuje';
  }
}

function resolveApproverTone(
  status: ApprovalPanelApproverStatus,
) {
  switch (status) {
    case 'approved':
      return 'success' as const;
    case 'rejected':
      return 'critical' as const;
    case 'pending':
    default:
      return 'warning' as const;
  }
}

function resolveOverallStatus(
  approvers: readonly ApprovalPanelApprover[],
) {
  if (approvers.some((approver) => approver.status === 'rejected')) {
    return {
      text: 'Odrzucone',
      tone: 'critical' as const,
    };
  }

  if (
    approvers.length > 0
    && approvers.every((approver) => approver.status === 'approved')
  ) {
    return {
      text: 'Zatwierdzone',
      tone: 'success' as const,
    };
  }

  return {
    text: 'Oczekuje',
    tone: 'warning' as const,
  };
}

function formatExpiry(
  expiresAt: string | null,
) {
  if (!expiresAt) {
    return 'Bez terminu wygaśnięcia';
  }

  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return expiresAt;
  }

  return new Intl.DateTimeFormat(
    'pl-PL',
    {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: '2-digit',
      year: 'numeric',
    },
  ).format(date);
}

export const ApprovalPanel = forwardRef<
  HTMLElement,
  ApprovalPanelProps
>(function ApprovalPanel(
  {
    approvers,
    className,
    expiresAt,
    risk,
    subjectId,
    subjectLabel,
    ...props
  },
  ref,
) {
  const titleId = useId();
  const descriptionId = useId();
  const overallStatus =
    resolveOverallStatus(approvers);

  return (
    <section
      {...props}
      ref={ref}
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className={joinClassNames(
        'pd-approval-panel',
        className,
      )}
      data-component="ApprovalPanel"
      data-risk={risk}
      data-subject-id={subjectId}
    >
      <header className="pd-approval-panel__header">
        <div className="pd-approval-panel__heading">
          <p className="pd-approval-panel__eyebrow">
            Approval wymagany
          </p>
          <h3
            className="pd-approval-panel__title"
            id={titleId}
          >
            {subjectLabel}
          </h3>
          <p
            className="pd-approval-panel__description"
            id={descriptionId}
          >
            Akcja pozostaje zablokowana do czasu spełnienia warunku
            zatwierdzenia.
          </p>
        </div>
        <StatusBadge
          status="Status approval"
          text={overallStatus.text}
          tone={overallStatus.tone}
        />
      </header>

      <dl className="pd-approval-panel__meta">
        <div>
          <dt>Identyfikator</dt>
          <dd>{subjectId}</dd>
        </div>
        <div>
          <dt>Ryzyko</dt>
          <dd>
            <StatusBadge
              status="Ryzyko"
              text={resolveRiskLabel(risk)}
              tone={resolveRiskTone(risk)}
            />
          </dd>
        </div>
        <div>
          <dt>Wygasa</dt>
          <dd>{formatExpiry(expiresAt)}</dd>
        </div>
      </dl>

      <ul
        aria-label="Lista osób zatwierdzających"
        className="pd-approval-panel__approvers"
      >
        {approvers.map((approver) => (
          <li key={approver.userId}>
            <span className="pd-approval-panel__approver-name">
              {approver.name}
            </span>
            <StatusBadge
              status="Status osoby zatwierdzającej"
              text={resolveApproverLabel(approver.status)}
              tone={resolveApproverTone(approver.status)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
});
