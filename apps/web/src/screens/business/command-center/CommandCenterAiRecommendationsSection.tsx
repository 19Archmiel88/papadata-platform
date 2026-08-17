import {
  ComparisonChart,
  InlineNotice,
} from '../../../design-system';
import type {
  CommandLens,
} from './commandCenterLens';
import {
  findCommandLens,
} from './commandCenterLens';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  formatMetricValue,
  formatPercent,
  isRecommendationInLens,
  resolveImpactLabel,
  resolveRecommendationProjectedValue,
  resolveRecommendationRecordForLens,
  resolveUnitLabel,
  shortenMetricLabel,
} from './commandCenterOnePageModel';

export function CommandCenterAiRecommendationsSection({
  activeLens,
  data,
}: {
  readonly activeLens: CommandLens;
  readonly data: CommandCenterData;
}) {
  const lens = findCommandLens(activeLens);

  // The lens reorders rather than hides: every recommendation is real data, so
  // the ones outside the current perspective drop below instead of vanishing.
  const ranked = [...data.recommendations].sort((left, right) => {
    const leftInLens = isRecommendationInLens(data.records, left, lens.metricIds);
    const rightInLens = isRecommendationInLens(data.records, right, lens.metricIds);

    if (leftInLens === rightInLens) {
      return 0;
    }

    return leftInLens ? -1 : 1;
  });

  return (
    <section
      aria-labelledby="command-center-recommendations-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__recommendations"
    >
      <CommandSectionHeader
        eyebrow="AI"
        title="Rekomendacje do oceny"
        titleId="command-center-recommendations-title"
      />
      {ranked.length > 0 ? (
        <div className="pd-command-center-one-page__recommendation-list">
          {ranked.map((recommendation) => {
            const projectedRecord = resolveRecommendationRecordForLens(
              data.records,
              recommendation,
              lens.metricIds,
            );
            const projectedValue = projectedRecord
              ? resolveRecommendationProjectedValue(projectedRecord, recommendation)
              : null;
            const inLens = isRecommendationInLens(
              data.records,
              recommendation,
              lens.metricIds,
            );

            return (
              <article
                data-in-lens={inLens || undefined}
                key={recommendation.recommendationId}
              >
                <div>
                  <strong>{recommendation.title}</strong>
                  <p>{recommendation.rationale}</p>
                  <span>
                    {inLens
                      ? `Perspektywa: ${lens.label}`
                      : 'Poza bieżącą perspektywą'}
                  </span>
                </div>
                <div className="pd-command-center-one-page__recommendation-impact">
                  <dl>
                    <div><dt>Wpływ</dt><dd>{resolveImpactLabel(recommendation.impact)}</dd></div>
                    <div><dt>Pewność</dt><dd>{formatPercent(recommendation.confidence)}</dd></div>
                    <div><dt>Tryb</dt><dd>Do zatwierdzenia przez człowieka</dd></div>
                  </dl>
                  {projectedRecord && projectedValue !== null ? (
                    <ComparisonChart
                      ariaLabel={`Symulacja wpływu rekomendacji: ${recommendation.title}`}
                      className="pd-command-center-one-page__recommendation-chart"
                      data={[{
                        id: projectedRecord.metricId,
                        label: shortenMetricLabel(projectedRecord.label),
                        values: {
                          current: projectedRecord.value,
                          projected: projectedValue,
                        },
                      }]}
                      series={[
                        { key: 'current', label: 'Obecnie' },
                        { key: 'projected', label: 'Po wdrożeniu' },
                      ]}
                      unit={resolveUnitLabel(projectedRecord.unit)}
                      valueFormatter={(value) => formatMetricValue(value, projectedRecord.unit)}
                      variant="grouped"
                    />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <InlineNotice
          message="Brak rekomendacji wymagających oceny."
          title="Brak rekomendacji"
          tone="info"
        />
      )}
    </section>
  );
}
