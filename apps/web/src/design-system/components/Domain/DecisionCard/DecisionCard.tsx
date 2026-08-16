import type {
  BaseComponentContractKeys,
  ContractDecisionCardProps,
  HTMLAttributes,
  ReactNode,
} from '../domainShared';
import {
  StatusBadge,
  formatDate,
  forwardRef,
  joinClassNames,
  resolveDecisionStatusLabel,
  resolveDecisionTone,
  resolveImpactLabel,
  useId,
} from '../domainShared';

export type DecisionCardProps = Omit<
  ContractDecisionCardProps,
  BaseComponentContractKeys
> & HTMLAttributes<HTMLElement> & {
  readonly action?: ReactNode;
  readonly priority?: 'low' | 'medium' | 'high';
};

export const DecisionCard = forwardRef<HTMLElement, DecisionCardProps>(
  function DecisionCard(
    {
      action = null,
      className,
      decisionId,
      dueAt,
      impact,
      owner,
      priority = 'medium',
      status,
      title,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <article
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-decision-card', className)}
        data-impact={impact}
        data-priority={priority}
      >
        <header className="pd-decision-card__header">
          <div>
            <p>{decisionId}</p>
            <h3 id={titleId}>{title}</h3>
          </div>
          <StatusBadge
            status="Status decyzji"
            text={resolveDecisionStatusLabel(status)}
            tone={resolveDecisionTone(status)}
          />
        </header>
        <dl className="pd-decision-card__meta">
          <div>
            <dt>Wpływ</dt>
            <dd>{resolveImpactLabel(impact)}</dd>
          </div>
          <div>
            <dt>Właściciel</dt>
            <dd>{owner ?? 'Nieprzypisane'}</dd>
          </div>
          <div>
            <dt>Termin</dt>
            <dd>{dueAt ? formatDate(dueAt) : 'Bez terminu'}</dd>
          </div>
        </dl>
        {action ? (
          <div className="pd-decision-card__action">{action}</div>
        ) : null}
      </article>
    );
  },
);
