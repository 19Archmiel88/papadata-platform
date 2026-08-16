import type {
  ContractDecisionQueueProps,
  HTMLAttributes,
} from '../domainShared';
import { DecisionCard } from '../DecisionCard';
import {
  StatusBadge,
  TextAction,
  forwardRef,
  joinClassNames,
  mapQueueDecisionStatus,
  useId,
} from '../domainShared';

export type DecisionQueueProps =
  ContractDecisionQueueProps & HTMLAttributes<HTMLElement>;

export const DecisionQueue = forwardRef<HTMLElement, DecisionQueueProps>(
  function DecisionQueue(
    {
      className,
      decisions,
      onChangeStatus,
      onOpenDecision,
      ...props
    },
    ref,
  ) {
    const titleId = useId();

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-decision-queue', className)}
      >
        <header className="pd-decision-queue__header">
          <div>
            <p>Kolejka uwagi</p>
            <h2 id={titleId}>Decyzje wymagające reakcji</h2>
          </div>
          <StatusBadge
            status="Liczba decyzji"
            text={`${decisions.length}`}
            tone="warning"
          />
        </header>
        <div className="pd-decision-queue__list">
          {decisions.map((decision) => (
            <DecisionCard
              key={decision.id}
              decisionId={decision.id}
              dueAt={decision.dueAt ?? null}
              impact={decision.priority}
              owner={decision.owner ?? null}
              priority={decision.priority}
              status={mapQueueDecisionStatus(decision.status)}
              title={decision.title}
              action={(
                <div className="pd-decision-queue__actions">
                  <TextAction
                    size="small"
                    onClick={() => {
                      onOpenDecision({
                        action: 'open-decision',
                        componentId: 'DecisionQueue',
                        decisionId: decision.id,
                      });
                    }}
                  >
                    Otwórz
                  </TextAction>
                  {onChangeStatus ? (
                    <TextAction
                      size="small"
                      tone="muted"
                      onClick={() => {
                        onChangeStatus({
                          action: 'change-status',
                          componentId: 'DecisionQueue',
                          decisionId: decision.id,
                          status: 'review',
                        });
                      }}
                    >
                      Do review
                    </TextAction>
                  ) : null}
                </div>
              )}
            />
          ))}
        </div>
      </section>
    );
  },
);
