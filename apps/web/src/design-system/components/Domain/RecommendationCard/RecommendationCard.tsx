import type {
  ContractRecommendationCardProps,
  HTMLAttributes,
} from '../domainShared';
import {
  Button,
  StatusBadge,
  forwardRef,
  joinClassNames,
  resolveImpactLabel,
  resolveImpactTone,
  useId,
} from '../domainShared';

export type RecommendationCardProps =
  ContractRecommendationCardProps & HTMLAttributes<HTMLElement>;

export const RecommendationCard = forwardRef<
  HTMLElement,
  RecommendationCardProps
>(function RecommendationCard(
  {
    className,
    effort,
    evidence,
    impact,
    onApprove,
    onReject,
    recommendationId,
    risk,
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
      className={joinClassNames('pd-recommendation-card', className)}
      data-risk={risk}
    >
      <header className="pd-recommendation-card__header">
        <div>
          <p>Rekomendacja</p>
          <h3 id={titleId}>{title}</h3>
        </div>
        <StatusBadge
          status="Wpływ"
          text={resolveImpactLabel(impact)}
          tone={resolveImpactTone(impact)}
        />
      </header>

      <dl className="pd-recommendation-card__meta">
        <div>
          <dt>Nakład</dt>
          <dd>{resolveImpactLabel(effort)}</dd>
        </div>
        <div>
          <dt>Ryzyko</dt>
          <dd>{resolveImpactLabel(risk)}</dd>
        </div>
        <div>
          <dt>Dowody</dt>
          <dd>{evidence.length}</dd>
        </div>
      </dl>

      <div className="pd-recommendation-card__actions">
        {onApprove ? (
          <Button
            size="small"
            onClick={() => {
              onApprove({
                action: 'approve',
                componentId: 'RecommendationCard',
                recommendationId,
              });
            }}
          >
            Zatwierdź
          </Button>
        ) : null}
        {onReject ? (
          <Button
            size="small"
            variant="secondary"
            onClick={() => {
              onReject({
                action: 'reject',
                componentId: 'RecommendationCard',
                recommendationId,
              });
            }}
          >
            Odrzuć
          </Button>
        ) : null}
      </div>
    </article>
  );
});
