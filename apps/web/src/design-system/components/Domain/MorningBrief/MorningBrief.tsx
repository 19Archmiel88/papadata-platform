import type {
  ContractMorningBriefProps,
  HTMLAttributes,
} from '../domainShared';
import {
  StatusBadge,
  TextAction,
  forwardRef,
  joinClassNames,
  resolveIssueTone,
  resolveReadinessLabel,
  resolveReadinessTone,
  resolveSeverityLabel,
  useId,
} from '../domainShared';

export type MorningBriefProps =
  ContractMorningBriefProps & HTMLAttributes<HTMLElement>;

export const MorningBrief = forwardRef<HTMLElement, MorningBriefProps>(
  function MorningBrief(
    {
      className,
      context: _context,
      dataReadiness,
      decisionsDue,
      highlights,
      onOpenHighlight,
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
        className={joinClassNames('pd-morning-brief', className)}
      >
        <header className="pd-morning-brief__header">
          <div>
            <p>Brief poranny</p>
            <h2 id={titleId}>Najważniejsze sygnały</h2>
          </div>
          <StatusBadge
            status="Stan danych"
            text={resolveReadinessLabel(dataReadiness)}
            tone={resolveReadinessTone(dataReadiness)}
          />
        </header>
        <ul className="pd-morning-brief__list">
          {highlights.map((highlight) => (
            <li key={highlight.id}>
              <StatusBadge
                status="Priorytet"
                text={resolveSeverityLabel(highlight.severity)}
                tone={resolveIssueTone(highlight.severity)}
              />
              <div>
                <strong>{highlight.title}</strong>
                <span>{highlight.metric}</span>
              </div>
              {onOpenHighlight ? (
                <TextAction
                  size="small"
                  onClick={() => {
                    onOpenHighlight({
                      action: 'open-highlight',
                      componentId: 'MorningBrief',
                      highlightId: highlight.id,
                    });
                  }}
                >
                  Otwórz
                </TextAction>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="pd-morning-brief__footer">
          Decyzje do obsłużenia dzisiaj: {decisionsDue}.
        </p>
      </section>
    );
  },
);
