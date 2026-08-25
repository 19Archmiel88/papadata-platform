import type {
  DataColumn,
} from '../../../../../../contracts/component-shared';
import {
  Button,
  InlineNotice,
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
  openPapaAssistantForElement,
} from './commandCenterOnePageModel';

const funnelElementId = 'command-funnel';
const funnelViewBox = {
  height: 500,
  plotLeft: 82,
  plotRight: 930,
  plotTop: 96,
  rowGap: 78,
  rowHeight: 34,
  width: 1000,
} as const;
const funnelAxisTicks = [0, 0.25, 0.5, 0.75, 1] as const;

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

function buildFunnelFlowPath(
  points: readonly {
    readonly x: number;
    readonly y: number;
  }[],
): string {
  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`)
    .join(' ');
}

function CommandFunnelConversionChart({
  steps,
}: {
  readonly steps: readonly FunnelStep[];
}) {
  const runtimeSteps = buildRuntimeFunnelSteps(steps);
  const largestDropoff = findLargestDropoff(runtimeSteps);
  const firstStep = runtimeSteps[0] ?? null;
  const finalStep = runtimeSteps[runtimeSteps.length - 1] ?? null;
  const plotWidth = funnelViewBox.plotRight - funnelViewBox.plotLeft;
  const flowPoints = runtimeSteps.map((step, index) => ({
    x: funnelViewBox.plotLeft + plotWidth * step.conversionFromPrevious,
    y: funnelViewBox.plotTop + index * funnelViewBox.rowGap + funnelViewBox.rowHeight / 2,
  }));
  const flowPath = flowPoints.length > 0 ? buildFunnelFlowPath(flowPoints) : '';
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
        <defs>
          <linearGradient id="command-funnel-survive" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-2)" />
            <stop offset="100%" stopColor="var(--pd-data-series-8)" />
          </linearGradient>
          <linearGradient id="command-funnel-dropoff" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--pd-data-series-1) 68%, transparent)" />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--pd-data-series-4) 74%, transparent)" />
          </linearGradient>
          <linearGradient id="command-funnel-path" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--pd-data-series-2)" />
            <stop offset="100%" stopColor="var(--pd-data-series-1)" />
          </linearGradient>
        </defs>

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

        <text
          className="pd-command-funnel-chart__axis-title"
          x={funnelViewBox.plotLeft}
          y={funnelViewBox.plotTop - 72}
        >
          Konwersja z poprzedniego kroku
        </text>

        {flowPath ? (
          <path
            className="pd-command-funnel-chart__flow-path"
            d={flowPath}
          />
        ) : null}

        {runtimeSteps.map((step, index) => {
          const rowY = funnelViewBox.plotTop + index * funnelViewBox.rowGap;
          const survivedWidth = plotWidth * step.conversionFromPrevious;
          const dropoffWidth = plotWidth - survivedWidth;
          const isLargestDropoff = largestDropoff?.stepId === step.stepId;

          return (
            <g
              data-largest-dropoff={isLargestDropoff ? 'true' : undefined}
              key={step.stepId}
            >
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
                rx="10"
                width={plotWidth}
                x={funnelViewBox.plotLeft}
                y={rowY}
              />
              <rect
                className="pd-command-funnel-chart__survived"
                height={funnelViewBox.rowHeight}
                rx="10"
                width={Math.max(survivedWidth, 2)}
                x={funnelViewBox.plotLeft}
                y={rowY}
              />
              {dropoffWidth > 2 ? (
                <rect
                  className="pd-command-funnel-chart__dropoff"
                  height={funnelViewBox.rowHeight}
                  rx="10"
                  width={dropoffWidth}
                  x={funnelViewBox.plotLeft + survivedWidth}
                  y={rowY}
                />
              ) : null}
              {index > 0 ? (
                <>
                  <text
                    className="pd-command-funnel-chart__retention-label"
                    x={funnelViewBox.plotLeft + Math.min(Math.max(survivedWidth, 74), plotWidth - 170)}
                    y={rowY + 22}
                  >
                    przechodzi {formatPercent(step.conversionFromPrevious)}
                  </text>
                  <text
                    className="pd-command-funnel-chart__dropoff-label"
                    textAnchor="end"
                    x={funnelViewBox.plotRight - 14}
                    y={rowY + 22}
                  >
                    odpływ {formatPercent(step.dropoffFromPrevious)}
                  </text>
                </>
              ) : (
                <text
                  className="pd-command-funnel-chart__retention-label"
                  x={funnelViewBox.plotLeft + 18}
                  y={rowY + 22}
                >
                  pełna baza sesji
                </text>
              )}
            </g>
          );
        })}

        {finalStep ? (
          <g className="pd-command-funnel-chart__final-marker">
            <line
              x1={funnelViewBox.plotLeft + plotWidth * finalStep.overallConversion}
              x2={funnelViewBox.plotLeft + plotWidth * finalStep.overallConversion}
              y1={funnelViewBox.plotTop + funnelViewBox.rowGap * Math.max(runtimeSteps.length - 1, 0) + funnelViewBox.rowHeight + 18}
              y2={funnelViewBox.plotTop + funnelViewBox.rowGap * Math.max(runtimeSteps.length - 1, 0) + funnelViewBox.rowHeight + 48}
            />
            <text
              textAnchor="middle"
              x={funnelViewBox.plotLeft + plotWidth * finalStep.overallConversion}
              y={funnelViewBox.plotTop + funnelViewBox.rowGap * Math.max(runtimeSteps.length - 1, 0) + funnelViewBox.rowHeight + 68}
            >
              finalnie {formatPercent(finalStep.overallConversion)}
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
      <CommandSectionHeader
        actions={hasFunnelSteps ? (
          <Button
            onClick={() => openPapaAssistantForElement(funnelElementId)}
            size="small"
            variant="secondary"
          >
            Analizuj z Papą
          </Button>
        ) : null}
        description="Adnotacja pokazuje największy odpływ bez dokładania osobnej karty ponad właściwym lejkiem."
        eyebrow="Lejek"
        title="Lejek sprzedaży"
        titleId="command-center-funnel-title"
      />

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
