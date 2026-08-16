import type {
  ContractEvidencePanelProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  formatDateTime,
  formatPercent,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type EvidencePanelProps =
  ContractEvidencePanelProps & HTMLAttributes<HTMLElement>;

export const EvidencePanel = forwardRef<HTMLElement, EvidencePanelProps>(
  function EvidencePanel(
    {
      className,
      confidence,
      evidence,
      onOpenEvidence,
      sources,
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
        className={joinClassNames('pd-evidence-panel', className)}
      >
        <header className="pd-evidence-panel__header">
          <div>
            <p>Dowody</p>
            <h2 id={titleId}>Źródła i pewność</h2>
          </div>
          <StatusBadge
            status="Pewność"
            text={formatPercent(confidence)}
            tone={confidence >= 0.8 ? 'success' : 'warning'}
          />
        </header>

        <ul className="pd-evidence-panel__list">
          {evidence.map((item) => (
            <li key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <span>{item.source}</span>
              </div>
              {onOpenEvidence ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenEvidence({
                      action: 'open-evidence',
                      componentId: 'EvidencePanel',
                      evidenceId: item.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>

        <dl className="pd-evidence-panel__sources">
          {sources.map((source) => (
            <div key={`${source.provider}-${source.dataset}`}>
              <dt>{source.dataset}</dt>
              <dd>{source.provider} · {formatDateTime(source.lastSyncAt)}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  },
);
