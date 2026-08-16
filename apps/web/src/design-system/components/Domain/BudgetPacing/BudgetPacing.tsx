import type {
  ContractBudgetPacingProps,
  HTMLAttributes,
} from '../domainShared';
import {
  Button,
  InlineNotice,
  ProgressIndicator,
  StatusBadge,
  formatCurrency,
  forwardRef,
  joinClassNames,
  resolveBudgetPacingLabel,
  resolveBudgetPacingProgressTone,
  resolveBudgetPacingTone,
  useId,
} from '../domainShared';

export type BudgetPacingProps =
  ContractBudgetPacingProps & HTMLAttributes<HTMLElement>;

export const BudgetPacing = forwardRef<HTMLElement, BudgetPacingProps>(
  function BudgetPacing(
    {
      actualSpend,
      campaignId,
      className,
      evidence,
      forecastSpend,
      onCreateDecision,
      plannedSpend,
      recommendation = null,
      status,
      ...props
    },
    ref,
  ) {
    const titleId = useId();
    const spendRatio = plannedSpend > 0
      ? actualSpend / plannedSpend
      : 0;
    const forecastRatio = plannedSpend > 0
      ? forecastSpend / plannedSpend
      : 0;

    return (
      <section
        {...props}
        ref={ref}
        aria-labelledby={titleId}
        className={joinClassNames('pd-budget-pacing', className)}
        data-status={status}
      >
        <header className="pd-budget-pacing__header">
          <div>
            <p>{campaignId}</p>
            <h2 id={titleId}>Pacing budżetu</h2>
          </div>
          <StatusBadge
            status="Pacing"
            text={resolveBudgetPacingLabel(status)}
            tone={resolveBudgetPacingTone(status)}
          />
        </header>
        <ProgressIndicator
          description={`Wydano ${formatCurrency(actualSpend)} z planu ${formatCurrency(plannedSpend)}.`}
          indeterminate={false}
          label="Wydanie budżetu"
          max={100}
          showValue
          tone={resolveBudgetPacingProgressTone(status)}
          value={Math.round(spendRatio * 100)}
        />
        <ProgressIndicator
          description={`Prognoza końca okresu: ${formatCurrency(forecastSpend)}.`}
          indeterminate={false}
          label="Prognoza względem planu"
          max={100}
          showValue
          tone={forecastRatio > 1 ? 'warning' : 'success'}
          value={Math.round(forecastRatio * 100)}
        />
        {recommendation ? (
          <InlineNotice
            message={recommendation}
            title="Rekomendacja budżetowa"
            tone="info"
          />
        ) : null}
        <div className="pd-budget-pacing__footer">
          <span>{evidence.length} dowody źródłowe</span>
          {onCreateDecision ? (
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                onCreateDecision({
                  action: 'create-decision',
                  campaignId,
                  componentId: 'BudgetPacing',
                });
              }}
            >
              Utwórz decyzję
            </Button>
          ) : null}
        </div>
      </section>
    );
  },
);
