import {
  useId,
  useState,
} from 'react';
import type {
  DataColumn,
} from '../../../../../../contracts/component-shared';
import {
  InlineNotice,
  VisuallyHidden,
} from '../../../design-system';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  CommandChartTableFallback,
  CommandFunnelSummary,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  formatInteger,
  formatPercent,
} from './commandCenterOnePageModel';

const funnelViewBox = {
  height: 420,
  plotLeft: 82,
  plotRight: 930,
  plotTop: 96,
  rowGap: 78,
  rowHeight: 34,
  width: 1000,
} as const;
const funnelAxisTicks = [0, 0.25, 0.5, 0.75, 1] as const;

/**
 * Ordinal color: one hue, monotone lightness by step position — the
 * documented pattern for "swapping order changes meaning" data (funnel
 * stages, tiers, cohort buckets), not a second competing categorical hue
 * per bar. Step 1 = fullest tint, last step = lightest, mixed toward the
 * surface color so it degrades gracefully in both themes.
 */
function resolveFunnelStepFill(index: number, total: number): string {
  const ratio = total > 1 ? index / (total - 1) : 0;
  const mixPercent = 100 - ratio * 55;

  return `color-mix(in srgb, var(--pd-data-actual) ${mixPercent.toFixed(1)}%, var(--pd-surface))`;
}

const funnelColumns: readonly DataColumn[] = [
  { id: 'label', label: 'Krok', sortable: true, width: 240 },
  { align: 'right', id: 'value', label: 'Ilość', sortable: true, width: 140 },
  { align: 'right', id: 'conversionRate', label: 'Konwersja', sortable: true, width: 140 },
];

type FunnelStep = CommandCenterData['funnelSteps'][number];

type RuntimeFunnelStep = FunnelStep & {
  readonly conversionFromPrevious: number;
  readonly droppedFromPrevious: number;
  readonly dropoffFromPrevious: number;
  readonly overallConversion: number;
  readonly previousLabel: string | null;
  readonly previousValue: number;
};

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function resolveStepConversion(
  step: FunnelStep,
  previousStep: FunnelStep | null,
): number {
  if (!previousStep) {
    return 1;
  }

  if (Number.isFinite(step.conversionRate)) {
    return clampRatio(step.conversionRate);
  }

  return previousStep.completions > 0
    ? clampRatio(step.completions / previousStep.completions)
    : 0;
}

function buildRuntimeFunnelSteps(
  steps: readonly FunnelStep[],
): readonly RuntimeFunnelStep[] {
  const firstValue = steps[0]?.completions ?? 0;

  return steps.map((step, index) => {
    const previousStep = steps[index - 1] ?? null;
    const previousValue = previousStep?.completions ?? step.completions;
    const conversionFromPrevious = resolveStepConversion(step, previousStep);
    const droppedFromPrevious = previousStep
      ? Math.max(previousStep.completions - step.completions, 0)
      : 0;

    return {
      ...step,
      conversionFromPrevious,
      droppedFromPrevious,
      dropoffFromPrevious: previousStep ? 1 - conversionFromPrevious : 0,
      overallConversion: firstValue > 0 ? clampRatio(step.completions / firstValue) : 0,
      previousLabel: previousStep?.label ?? null,
      previousValue,
    };
  });
}

function findLargestDropoff(
  steps: readonly RuntimeFunnelStep[],
): RuntimeFunnelStep | null {
  return steps.slice(1).reduce<RuntimeFunnelStep | null>((largest, step) => (
    !largest || step.dropoffFromPrevious > largest.dropoffFromPrevious
      ? step
      : largest
  ), null);
}

function resolveFunnelTooltipX(x: number): number {
  return x > funnelViewBox.plotRight - 190 ? x - 210 : x + 14;
}

function CommandFunnelConversionChart({
  steps,
}: {
  readonly steps: readonly FunnelStep[];
}) {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const tooltipTitleId = useId();
  const runtimeSteps = buildRuntimeFunnelSteps(steps);
  const largestDropoff = findLargestDropoff(runtimeSteps);
  const firstStep = runtimeSteps[0] ?? null;
  const finalStep = runtimeSteps[runtimeSteps.length - 1] ?? null;
  const activeStepIndex = runtimeSteps.findIndex((step) => step.stepId === activeStepId);
  const activeStep = activeStepIndex >= 0 ? runtimeSteps[activeStepIndex] : null;
  const plotWidth = funnelViewBox.plotRight - funnelViewBox.plotLeft;

  function resolveRowY(index: number): number {
    return funnelViewBox.plotTop + index * funnelViewBox.rowGap;
  }

  const summaryMetrics = [
    {
      detail: firstStep ? firstStep.label : 'brak danych',
      label: 'Start',
      tone: 'neutral',
      value: firstStep ? formatInteger(firstStep.completions) : '—',
    },
    {
      detail: 'z pierwszego kroku do zakupu',
      label: 'Konwersja końcowa',
      tone: finalStep && finalStep.overallConversion >= 0.03 ? 'positive' : 'warning',
      value: finalStep ? formatPercent(finalStep.overallConversion) : '—',
    },
    {
      detail: largestDropoff?.previousLabel
        ? `${largestDropoff.previousLabel} → ${largestDropoff.label}`
        : 'brak odpływu',
      label: 'Największy odpływ',
      tone: 'danger',
      value: largestDropoff ? formatPercent(largestDropoff.dropoffFromPrevious) : '—',
    },
    {
      detail: largestDropoff ? `${formatInteger(largestDropoff.droppedFromPrevious)} użytkowników` : 'brak odpływu',
      label: 'Utracony wolumen',
      tone: largestDropoff && largestDropoff.droppedFromPrevious > 0 ? 'warning' : 'neutral',
      value: largestDropoff ? formatInteger(largestDropoff.droppedFromPrevious) : '—',
    },
  ] as const;

  return (
    <div
      aria-label="Wykres lejka sprzedaży: konwersja i odpływ między krokami"
      className="pd-command-funnel-visual"
      role="group"
    >
      <svg
        aria-hidden="true"
        className="pd-command-funnel-chart"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox={`0 0 ${funnelViewBox.width} ${funnelViewBox.height}`}
      >
        <rect
          className="pd-command-funnel-chart__plot-bg"
          height={funnelViewBox.rowGap * Math.max(runtimeSteps.length - 1, 0) + funnelViewBox.rowHeight + 62}
          width={plotWidth}
          x={funnelViewBox.plotLeft}
          y={funnelViewBox.plotTop - 44}
        />

        {funnelAxisTicks.map((tick) => {
          const x = funnelViewBox.plotLeft + plotWidth * tick;

          return (
            <g key={`funnel-axis-${tick}`}>
              <line
                className="pd-command-funnel-chart__axis-line"
                x1={x}
                x2={x}
                y1={funnelViewBox.plotTop - 30}
                y2={funnelViewBox.plotTop + funnelViewBox.rowGap * Math.max(runtimeSteps.length - 1, 0) + funnelViewBox.rowHeight + 30}
              />
              <text
                className="pd-command-funnel-chart__axis-value"
                textAnchor="middle"
                x={x}
                y={funnelViewBox.plotTop - 50}
              >
                {formatPercent(tick)}
              </text>
            </g>
          );
        })}

        {/* Now an honest label: every bar's width is overallConversion (share
            of step 1), so this axis is finally one consistent scale for
            every row instead of an unrelated static ruler. */}
        <text
          className="pd-command-funnel-chart__axis-title"
          x={funnelViewBox.plotLeft}
          y={funnelViewBox.plotTop - 72}
        >
          Udział względem kroku 1
        </text>

        {runtimeSteps.map((step, index) => {
          const rowY = resolveRowY(index);
          const barWidth = plotWidth * step.overallConversion;
          const isLargestDropoff = largestDropoff?.stepId === step.stepId;

          return (
            <g key={step.stepId}>
              {index > 0 ? (
                <g
                  className="pd-command-funnel-chart__dropoff-annotation"
                  data-emphasis={isLargestDropoff ? 'true' : undefined}
                >
                  <text
                    textAnchor="middle"
                    x={funnelViewBox.plotLeft + plotWidth / 2}
                    y={rowY - 32}
                  >
                    ↓
                  </text>
                  <text
                    textAnchor="middle"
                    x={funnelViewBox.plotLeft + plotWidth / 2}
                    y={rowY - 18}
                  >
                    odpływ {formatPercent(step.dropoffFromPrevious)} · −{formatInteger(step.droppedFromPrevious)} osób
                  </text>
                </g>
              ) : null}

              <text
                className="pd-command-funnel-chart__step-index"
                textAnchor="end"
                x={funnelViewBox.plotLeft - 26}
                y={rowY + 22}
              >
                {String(index + 1).padStart(2, '0')}
              </text>
              <text
                className="pd-command-funnel-chart__step-label"
                x={funnelViewBox.plotLeft}
                y={rowY - 12}
              >
                {step.label}
              </text>
              <text
                className="pd-command-funnel-chart__step-value"
                textAnchor="end"
                x={funnelViewBox.plotRight}
                y={rowY - 12}
              >
                {formatInteger(step.completions)} · CR {formatPercent(step.conversionFromPrevious)}
              </text>
              <rect
                className="pd-command-funnel-chart__track"
                height={funnelViewBox.rowHeight}
                rx="6"
                width={plotWidth}
                x={funnelViewBox.plotLeft}
                y={rowY}
              />
              <rect
                className="pd-command-funnel-chart__bar"
                height={funnelViewBox.rowHeight}
                rx="6"
                style={{ fill: resolveFunnelStepFill(index, runtimeSteps.length) }}
                width={Math.max(barWidth, 2)}
                x={funnelViewBox.plotLeft}
                y={rowY}
              />

              {/* The bar itself is the hit target — wider than the painted
                  fill so the gap/annotation area above the row is reachable
                  too. Mouse-only: the whole chart is aria-hidden (the real
                  data lives in the always-reachable "Pokaż dane" table), so
                  making descendants tab-focusable here would be the
                  focusable-but-hidden anti-pattern, not an accessibility
                  improvement. */}
              <rect
                className="pd-command-funnel-chart__hit-area"
                height={funnelViewBox.rowHeight + 36}
                width={plotWidth}
                x={funnelViewBox.plotLeft}
                y={rowY - 28}
                onMouseEnter={() => setActiveStepId(step.stepId)}
                onMouseLeave={() => setActiveStepId((current) => (current === step.stepId ? null : current))}
              />
            </g>
          );
        })}

        {activeStep ? (
          <g
            className="pd-command-funnel-chart__tooltip"
            transform={`translate(${resolveFunnelTooltipX(funnelViewBox.plotLeft + plotWidth * activeStep.overallConversion)}, ${resolveRowY(activeStepIndex) - 8})`}
          >
            <rect
              aria-labelledby={tooltipTitleId}
              height="94"
              rx="9"
              width="208"
            />
            <text
              className="pd-command-funnel-chart__tooltip-title"
              id={tooltipTitleId}
              x="14"
              y="22"
            >
              {activeStep.label}
            </text>
            <text
              className="pd-command-funnel-chart__tooltip-value"
              x="14"
              y="42"
            >
              {formatInteger(activeStep.completions)} osób
            </text>
            <text
              className="pd-command-funnel-chart__tooltip-detail"
              x="14"
              y="62"
            >
              {activeStepIndex === 0
                ? 'Punkt startowy lejka'
                : `Od poprzedniego kroku: ${formatPercent(activeStep.conversionFromPrevious)}`}
            </text>
            <text
              className="pd-command-funnel-chart__tooltip-detail"
              x="14"
              y="80"
            >
              Skumulowane od kroku 1: {formatPercent(activeStep.overallConversion)}
            </text>
          </g>
        ) : null}
      </svg>

      <ul className="pd-command-funnel-visual__metrics">
        {summaryMetrics.map((metric) => (
          <li
            data-tone={metric.tone}
            key={metric.label}
          >
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <small>{metric.detail}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommandCenterFunnelSection({
  data,
  dataState,
}: {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
}) {
  const hasFunnelSteps = data.funnelSteps.length > 0;

  return (
    <section
      aria-labelledby="command-center-funnel-title"
      className="pd-command-center-one-page__section"
    >
      <VisuallyHidden as="div">
        <CommandSectionHeader
          description="Adnotacja pokazuje największy odpływ bez dokładania osobnej karty ponad właściwym lejkiem."
          eyebrow="Lejek"
          title="Lejek sprzedaży"
          titleId="command-center-funnel-title"
        />
      </VisuallyHidden>

      {hasFunnelSteps ? (
        <>
          <CommandFunnelSummary steps={data.funnelSteps} />
          <CommandFunnelConversionChart steps={data.funnelSteps} />

          <CommandChartTableFallback
            ariaLabel="Kroki lejka: ilość i konwersja"
            columns={funnelColumns}
            emptyMessage="Brak kroków lejka."
            minWidth={640}
            rows={data.funnelSteps.map((step) => ({
              conversionRate: formatPercent(step.conversionRate),
              id: step.stepId,
              label: step.label,
              value: formatInteger(step.completions),
            }))}
            sortColumnId="value"
          />
        </>
      ) : (
        <InlineNotice
          message="Dla bieżącego zakresu nie ma jeszcze kroków lejka do pokazania."
          title="Brak danych lejka"
          tone={dataState === 'error' ? 'critical' : 'info'}
        />
      )}
    </section>
  );
}
