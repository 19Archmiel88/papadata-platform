import type {
  ReactNode,
} from 'react';
import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  formatPercent,
} from './commandCenterOnePageModel';

export function CommandSectionAnchor({
  children,
  id,
}: {
  readonly children: ReactNode;
  readonly id: string;
}) {
  return (
    <div
      className="pd-command-center-one-page__anchor"
      id={id}
    >
      {children}
    </div>
  );
}

export function CommandSectionHeader({
  eyebrow,
  title,
  titleId,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly titleId: string;
}) {
  return (
    <header className="pd-command-center-one-page__section-header">
      <div>
        <span>{eyebrow}</span>
        <h2 id={titleId}>{title}</h2>
      </div>
    </header>
  );
}

export function CommandInsightTile({
  label,
  text,
  value,
}: {
  readonly label: string;
  readonly text: string;
  readonly value: string;
}) {
  return (
    <article className="pd-command-center-one-page__insight-tile">
      <strong>{label}</strong>
      <p>{text}</p>
      <span>{value}</span>
    </article>
  );
}

export function CommandRuntimeSourceSummary({
  rows,
}: {
  readonly rows: readonly DataRow[];
}) {
  return (
    <aside className="pd-command-center-one-page__runtime-side-panel">
      <header>
        <span>Mix ruchu</span>
        <h3>Sprzedaż według źródła</h3>
      </header>
      {rows.slice(0, 4).map((row) => (
        <article key={String(row.id)}>
          <div>
            <strong>{row.source}</strong>
            <span>{formatPercent(Number(row.share ?? 0))}</span>
          </div>
          <dl>
            <div><dt>Sesje</dt><dd>{row.sessions}</dd></div>
            <div><dt>Przychód</dt><dd>{row.revenue}</dd></div>
          </dl>
        </article>
      ))}
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

  return (
    <div className="pd-command-center-one-page__funnel-summary">
      {dropoffs.slice(0, 2).map((dropoff) => (
        <article key={`${dropoff.from}-${dropoff.to}`}>
          <span>Największy odpływ</span>
          <strong>{dropoff.from} → {dropoff.to}</strong>
          <p>{formatPercent(dropoff.value)} użytkowników nie przechodzi dalej.</p>
        </article>
      ))}
    </div>
  );
}
