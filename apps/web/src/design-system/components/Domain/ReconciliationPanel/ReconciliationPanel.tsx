import type {
  ContractReconciliationPanelProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type ReconciliationPanelProps =
  ContractReconciliationPanelProps & HTMLAttributes<HTMLElement>;

export const ReconciliationPanel = forwardRef<
  HTMLElement,
  ReconciliationPanelProps
>(function ReconciliationPanel(
  {
    className,
    conflicts,
    onResolveConflict,
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
      className={joinClassNames('pd-reconciliation-panel', className)}
    >
      <header className="pd-reconciliation-panel__header">
        <div>
          <p>Rekoncyliacja</p>
          <h2 id={titleId}>Konflikty źródeł</h2>
        </div>
        <StatusBadge
          status="Konflikty"
          text={`${conflicts.length}`}
          tone={conflicts.length > 0 ? 'warning' : 'success'}
        />
      </header>
      <ul className="pd-reconciliation-panel__list">
        {conflicts.map((conflict) => (
          <li key={conflict.id}>
            <div>
              <strong>{conflict.entityType}</strong>
              <span>{conflict.sourceA} ↔ {conflict.sourceB}</span>
              {conflict.proposedResolution ? (
                <span>{conflict.proposedResolution}</span>
              ) : null}
            </div>
            {onResolveConflict ? (
              <TextAction
                size="small"
                onClick={() => {
                  onResolveConflict({
                    action: 'resolve-conflict',
                    componentId: 'ReconciliationPanel',
                    conflictId: conflict.id,
                    resolution: conflict.proposedResolution ?? 'manual-review',
                  });
                }}
              >
                Rozwiąż
              </TextAction>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
});
