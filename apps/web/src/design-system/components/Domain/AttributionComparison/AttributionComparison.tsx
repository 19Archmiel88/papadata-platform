import type {
  ContractAttributionComparisonProps,
  HTMLAttributes,
} from '../domainShared';
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  forwardRef,
  joinClassNames,
  useId,
} from '../domainShared';

export type AttributionComparisonProps =
  ContractAttributionComparisonProps & HTMLAttributes<HTMLFieldSetElement>;

export const AttributionComparison = forwardRef<
  HTMLFieldSetElement,
  AttributionComparisonProps
>(function AttributionComparison(
  {
    className,
    models,
    onSelectModel,
    selectedModelId,
    ...props
  },
  ref,
) {
  const legendId = useId();

  return (
    <fieldset
      {...props}
      ref={ref}
      className={joinClassNames('pd-attribution-comparison', className)}
    >
      <legend id={legendId}>Model atrybucji</legend>
      <div
        aria-labelledby={legendId}
        className="pd-attribution-comparison__models"
        role="radiogroup"
      >
        {models.map((model) => (
          <label key={model.id}>
            <input
              checked={model.id === selectedModelId}
              name={legendId}
              type="radio"
              value={model.id}
              onChange={() => {
                onSelectModel?.({
                  action: 'select-model',
                  componentId: 'AttributionComparison',
                  modelId: model.id,
                });
              }}
            />
            <span>
              <strong>{model.label}</strong>
              <span>{formatCurrency(model.revenue)} · ROAS {formatNumber(model.roas)}</span>
              <span>Pewność {formatPercent(model.confidence)}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
});
