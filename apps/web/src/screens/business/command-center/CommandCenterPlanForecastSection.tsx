import type {
  CommandCenterRecord,
} from '../../../../../../contracts/api-schemas';
import type {
  ForecastChartQuality,
} from '../../../design-system';
import {
  ForecastChart,
} from '../../../design-system';
import {
  defaultWorkspaceContext,
} from '../businessData';
import {
  CommandRuntimeTableDisclosure,
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import {
  buildRecordTrajectoryPoints,
  chooseComparableRecords,
  findRecordByLabel,
  formatMetricValue,
  formatSignedMetricValue,
  resolveRangeElapsedRatio,
  resolveRuntimeForecastValue,
  resolveUnitLabel,
} from './commandCenterOnePageModel';

function clampRatio(value: number): number {
  return Math.max(value, 0);
}

function resolveForecastState(ratio: number): {
  readonly label: string;
  readonly tone: 'critical' | 'success' | 'warning';
} {
  if (ratio >= 1.02) {
    return { label: 'Powyżej celu', tone: 'success' };
  }

  if (ratio >= 0.98) {
    return { label: 'Na trajektorii', tone: 'success' };
  }

  if (ratio >= 0.9) {
    return { label: 'Ryzyko niedowiezienia', tone: 'warning' };
  }

  return { label: 'Poniżej planu', tone: 'critical' };
}

function resolveForecastQuality(paceRatio: number | null): ForecastChartQuality {
  if (paceRatio === null) {
    return {
      description: 'Brak zakresu dat do oceny, ile okresu stoi za tą prognozą.',
      label: 'Ograniczona',
      level: 'limited',
    };
  }

  const elapsedLabel = formatMetricValue(paceRatio, 'percent');

  if (paceRatio >= 0.55) {
    return {
      description: `Oparta na ${elapsedLabel} zrealizowanego okresu.`,
      label: 'Wysoka',
      level: 'high',
    };
  }

  if (paceRatio >= 0.25) {
    return {
      description: `Oparta na ${elapsedLabel} zrealizowanego okresu — możliwe wahania do końca.`,
      label: 'Średnia',
      level: 'medium',
    };
  }

  return {
    description: `Oparta na ${elapsedLabel} zrealizowanego okresu — wczesny etap, duża niepewność.`,
    label: 'Ograniczona',
    level: 'limited',
  };
}

/**
 * One trajectory, one scale. The track keeps forecast beyond the target
 * visible instead of clipping every value at 100%, which makes overdelivery
 * and underdelivery readable without opening another chart.
 */
export function CommandCenterPlanForecastSection({
  records,
  workspaceContext,
}: {
  readonly records: readonly CommandCenterRecord[];
  readonly workspaceContext: typeof defaultWorkspaceContext;
}) {
  const primary = findRecordByLabel(records, ['przychod'])
    ?? chooseComparableRecords(records)[0]
    ?? null;

  if (!primary || primary.target === null || primary.target <= 0) {
    return null;
  }

  const paceRatio = resolveRangeElapsedRatio(workspaceContext.range);
  const forecastValue = resolveRuntimeForecastValue(primary);
  const actualRatio = clampRatio(primary.value / primary.target);
  const forecastRatio = clampRatio(forecastValue / primary.target);
  const gapValue = forecastValue - primary.target;
  const forecastState = resolveForecastState(forecastRatio);
  const forecastQuality = resolveForecastQuality(paceRatio);
  const trajectory = buildRecordTrajectoryPoints(primary, 5, paceRatio);

  return (
    <section
      aria-labelledby="command-center-plan-title"
      className="pd-command-center-one-page__section"
    >
      <CommandSectionHeader
        actions={(
          <span
            className="pd-command-center-one-page__status-pill"
            data-tone={forecastState.tone}
          >
            {forecastState.label} · {formatMetricValue(forecastRatio, 'percent')} celu
          </span>
        )}
        description="Jedna trajektoria pokazuje wykonanie, tempo okresu, cel i prognozę bez dokładania drugiego zestawu KPI."
        eyebrow="Plan i prognoza"
        title="Czy dowieziemy cel"
        titleId="command-center-plan-title"
      />

      <div className="pd-command-center-one-page__runway">
        <dl className="pd-command-center-one-page__runway-stats">
          <div data-tone={actualRatio >= 1 ? 'success' : undefined}>
            <dt>Wynik</dt>
            <dd>{formatMetricValue(primary.value, primary.unit)}</dd>
            <span>{formatMetricValue(actualRatio, 'percent')} planu</span>
          </div>
          <div>
            <dt>Cel</dt>
            <dd>{formatMetricValue(primary.target, primary.unit)}</dd>
            <span>100% planu</span>
          </div>
          <div data-tone={forecastState.tone}>
            <dt>Prognoza</dt>
            <dd>{formatMetricValue(forecastValue, primary.unit)}</dd>
            <span>{formatMetricValue(forecastRatio, 'percent')} celu</span>
          </div>
          <div data-tone={gapValue >= 0 ? 'success' : 'warning'}>
            <dt>Gap do celu</dt>
            <dd>{formatSignedMetricValue(gapValue, primary.unit)}</dd>
            <span>{gapValue >= 0 ? 'bufor ponad plan' : 'brakujący wynik'}</span>
          </div>
        </dl>

        <ForecastChart
          actual={trajectory.actual}
          ariaLabel={`Trajektoria ${primary.label}: wykonanie, cel i prognoza`}
          className="pd-command-center-one-page__chart-surface pd-command-center-one-page__plan-chart"
          data-tone={forecastState.tone}
          forecast={trajectory.forecast}
          horizonLabel={paceRatio !== null ? `${formatMetricValue(paceRatio, 'percent')} okresu minęło` : null}
          lowerBound={trajectory.lowerBound}
          quality={forecastQuality}
          targetLabel="Cel"
          targetValue={primary.target}
          unit={resolveUnitLabel(primary.unit)}
          upperBound={trajectory.upperBound}
          valueFormatter={(value) => formatMetricValue(value, primary.unit)}
        />
      </div>

      <CommandRuntimeTableDisclosure label="Pokaż punkty trajektorii">
        <dl>
          {trajectory.actual.map((point) => (
            <div key={`actual-${point.label}`}>
              <dt>{point.label}</dt>
              <dd>{formatMetricValue(point.value, primary.unit)}</dd>
            </div>
          ))}
          <div>
            <dt>Koniec okresu</dt>
            <dd>{formatMetricValue(forecastValue, primary.unit)}</dd>
          </div>
        </dl>
      </CommandRuntimeTableDisclosure>
    </section>
  );
}
