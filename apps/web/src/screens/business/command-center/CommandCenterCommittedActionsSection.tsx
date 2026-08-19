import {
  EmptyState,
  ProgressIndicator,
  StatusBadge,
} from '../../../design-system';
import {
  CommandSectionHeader,
} from './CommandCenterSectionFrame';
import type {
  CommandCommittedAction,
} from './commandCenterOnePageModel';
import {
  resolveCommittedActionStatusLabel,
  resolveCommittedActionStatusTone,
} from './commandCenterOnePageModel';

/**
 * Active decisions close the command loop: decision -> execution -> measurement.
 * When there are no committed actions the section stays in place with an
 * honest empty state instead of vanishing and leaving a gap in the page.
 */
export function CommandCenterCommittedActionsSection({
  actions,
}: {
  readonly actions: readonly CommandCommittedAction[];
}) {
  const hasActions = actions.length > 0;
  const activeCount = actions.filter((action) => action.status === 'approved' || action.status === 'executing').length;
  const attentionCount = actions.filter((action) => action.status === 'proposed').length;
  const doneCount = actions.filter((action) => action.status === 'measured').length;

  return (
    <section
      aria-labelledby="command-center-committed-actions-title"
      className="pd-command-center-one-page__section pd-command-center-one-page__committed-actions"
    >
      <CommandSectionHeader
        description="Tu kończy się cykl decyzji: właściciel, wykonanie, oczekiwany lub zmierzony efekt oraz termin kolejnego pomiaru."
        eyebrow="Działania"
        title="Działania i pomiar"
        titleId="command-center-committed-actions-title"
      />

      {!hasActions ? (
        <EmptyState
          message="Zatwierdzone decyzje z rejestru pojawią się tutaj razem z postępem wdrożenia i pomiarem efektu."
          title="Brak działań w toku"
          variant="empty"
        />
      ) : (
        <>
      <div className="pd-command-center-one-page__committed-actions-table" role="table">
        <div className="pd-command-center-one-page__committed-actions-row" role="row">
          <span role="columnheader">Działanie</span>
          <span role="columnheader">Właściciel</span>
          <span role="columnheader">Status</span>
          <span role="columnheader">Postęp</span>
          <span role="columnheader">Efekt</span>
          <span role="columnheader">Termin</span>
        </div>

        {actions.map((action) => (
          <div className="pd-command-center-one-page__committed-actions-row" key={action.id} role="row">
            <span role="cell">
              <a href={action.registryHref}>{action.title}</a>
              <small>{action.goal}</small>
            </span>
            <span role="cell">{action.owner}</span>
            <span role="cell">
              <StatusBadge
                status="Status"
                text={resolveCommittedActionStatusLabel(action.status)}
                tone={resolveCommittedActionStatusTone(action.status)}
              />
            </span>
            <span role="cell">
              <ProgressIndicator
                aria-label={`Postęp działania: ${action.title}`}
                indeterminate={false}
                label="Postęp"
                max={1}
                showValue
                value={action.progress}
              />
            </span>
            <span data-measured={action.measurement ? true : undefined} role="cell">
              <small>{action.measurement ? 'Zmierzony efekt' : 'Oczekiwany efekt'}</small>
              {action.measurement
                ? `${action.measurement.baselineLabel} → ${action.measurement.resultLabel}`
                : action.expectedImpactLabel}
            </span>
            <span role="cell">{action.dueLabel}</span>
          </div>
        ))}
      </div>

      <p className="pd-command-center-one-page__committed-actions-summary">
        {activeCount} aktywne · {attentionCount} oczekuje na decyzję · {doneCount} zmierzone
        {' · '}
        <a href="/app/decisions/rejestr-decyzji">Zobacz cały rejestr</a>
      </p>
        </>
      )}
    </section>
  );
}
