import type {
  ReactNode,
} from 'react';
import type {
  DataColumn,
  DataRow,
} from '../../../../../../contracts/component-shared';
import {
  DataTable,
} from '../../../design-system';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  formatPercent,
} from './commandCenterOnePageModel';

export function CommandSectionAnchor({
  children,
  className,
  id,
}: {
  readonly children: ReactNode;
  readonly className?: string;
  readonly id: string;
}) {
  return (
    <div
      className={className
        ? `pd-command-center-one-page__anchor ${className}`
        : 'pd-command-center-one-page__anchor'}
      id={id}
    >
      {children}
    </div>
  );
}

export function CommandSectionHeader({
  actions = null,
  description = null,
  eyebrow,
  title = null,
  titleId,
}: {
  readonly actions?: ReactNode;
  readonly description?: ReactNode;
  readonly eyebrow: string;
  readonly title?: string | null;
  readonly titleId: string;
}) {
  return (
    <header className="pd-command-center-one-page__section-header">
      <div>
        <span id={title ? undefined : titleId}>{eyebrow}</span>
        {title ? <h2 id={titleId}>{title}</h2> : null}
        {description ? (
          <p className="pd-command-center-one-page__section-description">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="pd-command-center-one-page__section-actions">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function CommandRuntimeSourceSummary({
  id,
  rows,
}: {
  readonly id?: string;
  readonly rows: readonly DataRow[];
}) {
  return (
    <aside
      aria-label="Kanały sprzedaży"
      className="pd-command-center-one-page__runtime-side-panel"
      id={id}
    >
      <header>
        <span>Źródła</span>
        <h3>Kanały sprzedaży</h3>
        <p>Udział w przychodzie i skala ruchu.</p>
      </header>

      <div className="pd-command-center-one-page__source-list">
        {rows.slice(0, 5).map((row) => (
          <article key={String(row.id)}>
            <div className="pd-command-center-one-page__source-list-main">
              <strong>{row.source}</strong>
              <span>{row.revenue}</span>
            </div>
            <div className="pd-command-center-one-page__source-list-meta">
              <span>{formatPercent(Number(row.share ?? 0))} przychodu</span>
              <span>{row.sessions} sesji</span>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

export function CommandRuntimeTableDisclosure({
  children,
  label,
  open = false,
}: {
  readonly children: ReactNode;
  readonly label: string;
  readonly open?: boolean;
}) {
  return (
    <details
      className="pd-command-center-one-page__table-disclosure"
      open={open}
    >
      <summary>{label}</summary>
      <div>{children}</div>
    </details>
  );
}

/**
 * Shared accessible table alternative for charts. It stays collapsed until
 * requested so analytical sections keep their visual hierarchy without
 * dropping the data alternative required by the analytics contract.
 */
export function CommandChartTableFallback({
  ariaLabel,
  columns,
  emptyMessage,
  minWidth,
  rows,
  sortColumnId,
}: {
  readonly ariaLabel: string;
  readonly columns: readonly DataColumn[];
  readonly emptyMessage: string;
  readonly minWidth: number;
  readonly rows: readonly DataRow[];
  readonly sortColumnId: string;
}) {
  return (
    <CommandRuntimeTableDisclosure label="Pokaż dane">
      <DataTable
        ariaLabel={ariaLabel}
        columns={columns}
        density="compact"
        emptyMessage={emptyMessage}
        loading={false}
        minWidth={minWidth}
        rowCount={rows.length}
        rows={rows}
        selectedRowIds={[]}
        sort={{ columnId: sortColumnId, direction: 'desc' }}
      />
    </CommandRuntimeTableDisclosure>
  );
}

export function CommandFunnelSummary({
  steps,
}: {
  readonly steps: CommandCenterData['funnelSteps'];
}) {
  const dropoffs = steps.slice(1).map((step, index) => ({
    from: steps[index]?.label ?? 'Start',
    to: step.label,
    value: 1 - step.conversionRate,
  })).sort((left, right) => right.value - left.value);
  const primary = dropoffs[0];
  const secondary = dropoffs[1];

  if (!primary) {
    return null;
  }

  return (
    <div
      className="pd-command-center-one-page__funnel-summary"
      role="note"
    >
      <div>
        <span>Największy odpływ</span>
        <strong>{primary.from} → {primary.to}</strong>
      </div>
      <p>
        {formatPercent(primary.value)} użytkowników nie przechodzi dalej.
        {secondary
          ? ` Kolejny odpływ: ${secondary.from} → ${secondary.to} (${formatPercent(secondary.value)}).`
          : ''}
      </p>
    </div>
  );
}
