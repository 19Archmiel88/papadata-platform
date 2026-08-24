import type {
  KeyboardEvent,
} from 'react';
import {
  useEffect,
  useRef,
} from 'react';
import {
  Button,
  ComparisonChart,
  StatusBadge,
} from '../../../design-system';
import type {
  StatusBadgeTone,
} from '../../../design-system';
import {
  defaultWorkspaceContext,
} from '../businessData';
import type {
  CommandAttentionSignal,
} from './CommandCenterAttentionSection';
import {
  resolveAttentionCtaElementId,
} from './CommandCenterAttentionSection';
import {
  CommandRuntimeTableDisclosure,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
  CommandSignalKind,
  RecommendationExecutionState,
} from './commandCenterOnePageModel';
import {
  formatMetricValue,
  formatPercent,
  formatSignedMetricValue,
  openPapaAssistantForElement,
  resolveMetricFreshnessLabel,
  resolveMetricSourceLabel,
  resolveNoActionProjection,
  resolveRecommendationCtaLabel,
  resolveRecommendationExecutionState,
  resolveRecommendationForRecord,
  resolveRecommendationProjectedValue,
  resolveReadinessLabel,
  resolveUnitLabel,
  shortenMetricLabel,
} from './commandCenterOnePageModel';

const signalKindLabels: Record<CommandSignalKind, string> = {
  data: 'Dane',
  opportunity: 'Szansa',
  risk: 'Ryzyko',
};

const signalKindTones: Record<CommandSignalKind, StatusBadgeTone> = {
  data: 'warning',
  opportunity: 'success',
  risk: 'critical',
};

export type CommandCenterDecisionWorkspaceProps = {
  readonly data: CommandCenterData;
  /** Story-only override — real usage always resolves advisory/available. */
  readonly executionState?: RecommendationExecutionState;
  readonly onClose: () => void;
  readonly onDismiss: (signalId: string) => void;
  readonly signal: CommandAttentionSignal;
  readonly workspaceContext: typeof defaultWorkspaceContext;
};

export function CommandCenterDecisionWorkspace({
  data,
  executionState = resolveRecommendationExecutionState(),
  onClose,
  onDismiss,
  signal,
  workspaceContext,
}: CommandCenterDecisionWorkspaceProps) {
  const {
    decision,
    kind,
    record,
  } = signal;
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const recommendation = resolveRecommendationForRecord(data.recommendations, record);
  const projection = resolveNoActionProjection(record, workspaceContext.range);
  const projectedValue = recommendation
    ? resolveRecommendationProjectedValue(record, recommendation)
    : null;
  const scenario = recommendation && projectedValue !== null
    ? { projectedValue, recommendation }
    : null;
  const ctaLabel = recommendation
    ? resolveRecommendationCtaLabel(executionState)
    : 'Zapytaj Papę o ten sygnał';

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, [decision.id]);

  const handleClose = () => {
    onClose();

    if (typeof document !== 'undefined') {
      document.getElementById(resolveAttentionCtaElementId(decision.id))?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <aside
      aria-labelledby="command-decision-workspace-title"
      className="pd-command-center-one-page__decision-workspace"
      data-has-scenario={scenario ? 'true' : undefined}
      data-kind={kind}
      onKeyDown={handleKeyDown}
    >
      <header className="pd-command-center-one-page__decision-workspace-header">
        <div>
          <StatusBadge
            status="Wybrane"
            text={signalKindLabels[kind]}
            tone={signalKindTones[kind]}
          />
          <h2 id="command-decision-workspace-title">{decision.metricLabel}</h2>
        </div>

        <Button
          aria-label="Zamknij Decision Workspace"
          onClick={handleClose}
          ref={closeButtonRef}
          size="small"
          variant="ghost"
        >
          Zamknij
        </Button>
      </header>

      <section
        aria-label="Co się dzieje"
        className="pd-command-center-one-page__decision-workspace-block"
      >
        <p className="pd-command-center-one-page__decision-workspace-eyebrow">Co się dzieje</p>
        <p>{decision.diagnosis}</p>
        <p className="pd-command-center-one-page__decision-workspace-state">
          <span>{decision.valueLabel}</span>
          <span>{decision.deltaLabel}</span>
        </p>
      </section>

      <section
        aria-label="Wpływ"
        className="pd-command-center-one-page__decision-workspace-block"
      >
        <p className="pd-command-center-one-page__decision-workspace-eyebrow">Wpływ</p>
        <p>{decision.businessImpact}</p>
      </section>

      {projection ? (
        <section
          aria-label="Jeśli nic nie zrobisz"
          className="pd-command-center-one-page__decision-workspace-block"
        >
          <p className="pd-command-center-one-page__decision-workspace-eyebrow">Jeśli nic nie zrobisz</p>
          <p>
            {formatSignedMetricValue(projection.deltaValue, record.unit)}
            {' '}
            do końca okresu, jeśli obecny trend się utrzyma.
          </p>
        </section>
      ) : null}

      <section aria-label="Rekomendacja Papa" className="pd-command-center-one-page__decision-workspace-recommendation">
        <p className="pd-command-center-one-page__decision-workspace-eyebrow">Rekomendacja Papa</p>

        {recommendation ? (
          <>
            <p><strong>{recommendation.title}</strong></p>
            <p>{recommendation.rationale}</p>
            <ol className="pd-command-center-one-page__decision-workspace-steps">
              <li>Zobacz plan działania — jesteś w nim teraz.</li>
              <li>Wykonaj zmianę ręcznie w {resolveMetricSourceLabel(record)}.</li>
              <li>PapaData monitoruje rezultat i pokaże go w Działaniach w toku.</li>
            </ol>
          </>
        ) : (
          <p>Brak rekomendacji AI dopasowanej do tego sygnału. Papa może przeanalizować metrykę na żądanie.</p>
        )}

        <div className="pd-command-center-one-page__decision-workspace-actions">
          <Button
            onClick={() => onDismiss(decision.id)}
            size="small"
            variant="ghost"
          >
            Odrzuć rekomendację
          </Button>
          <Button
            onClick={() => openPapaAssistantForElement(record.metricId)}
            size="small"
            variant="primary"
          >
            {ctaLabel}
          </Button>
        </div>
      </section>

      {scenario ? (
        <section aria-label="Scenariusze i efekty" className="pd-command-center-one-page__decision-workspace-scenario">
          <p className="pd-command-center-one-page__decision-workspace-eyebrow">Scenariusze i efekty</p>
          <ComparisonChart
            ariaLabel={`Symulacja wpływu rekomendacji: ${scenario.recommendation.title}`}
            className="pd-command-center-one-page__decision-workspace-chart"
            data={[{
              id: record.metricId,
              label: shortenMetricLabel(record.label),
              values: {
                current: record.value,
                projected: scenario.projectedValue,
              },
            }]}
            series={[
              { key: 'current', label: 'Obecnie' },
              { key: 'projected', label: 'Po wdrożeniu' },
            ]}
            unit={resolveUnitLabel(record.unit)}
            valueFormatter={(value) => formatMetricValue(value, record.unit)}
            variant="grouped"
            visualStyle="vivid"
          />
        </section>
      ) : null}

      <div className="pd-command-center-one-page__decision-workspace-disclosures">
        <CommandRuntimeTableDisclosure label="Proponowany plan działania">
          <p>{decision.nextAction}</p>
          <p>Właściciel: {decision.owner} · Termin: {decision.timebox}</p>
        </CommandRuntimeTableDisclosure>

        <CommandRuntimeTableDisclosure label="Analiza AI">
          <p>{decision.diagnosis}</p>
          {recommendation ? (
            <p>Pewność rekomendacji: {formatPercent(recommendation.confidence)}</p>
          ) : null}
        </CommandRuntimeTableDisclosure>

        <CommandRuntimeTableDisclosure label="Dowody i dane">
          <dl>
            <div>
              <dt>Źródło</dt>
              <dd>{resolveMetricSourceLabel(record)}</dd>
            </div>
            <div>
              <dt>Świeżość</dt>
              <dd>{resolveMetricFreshnessLabel(record)}</dd>
            </div>
            <div>
              <dt>Stan danych</dt>
              <dd>{resolveReadinessLabel(record.readiness)}</dd>
            </div>
            <div>
              <dt>Zakres dowodów</dt>
              <dd>{decision.evidenceLabel}</dd>
            </div>
          </dl>
        </CommandRuntimeTableDisclosure>
      </div>
    </aside>
  );
}
