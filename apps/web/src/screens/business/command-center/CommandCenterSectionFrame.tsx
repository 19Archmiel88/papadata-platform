import {
  useId,
  useState,
} from 'react';
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

/**
 * "Pokaż X" → "Ukryj X" for the common case (matches Plan vs Benchmark's
 * exact "Pokaż dane benchmarku"/"Ukryj dane benchmarku" wording); falls
 * back to "Ukryj: X" for labels that aren't phrased as "Pokaż …" (e.g. the
 * decision-workspace disclosures' "Analiza AI").
 */
function resolveDisclosureOpenLabel(label: string): string {
  const pokazMatch = /^Pokaż\s+(.+)$/i.exec(label);

  return pokazMatch ? `Ukryj ${pokazMatch[1]}` : `Ukryj: ${label}`;
}

/**
 * Same show/hide principle and look as Plan vs Benchmark's table toggle
 * (CommandCenterPlanExecutionSection.tsx's isTableVisible): a real button,
 * not a native <details>/<summary> disclosure triangle — styled as a pill
 * (border/radius/surface), toggling label text between "Pokaż …"/"Ukryj …"
 * instead of relying on native marker styling.
 */
export function CommandRuntimeTableDisclosure({
  children,
  label,
  open = false,
}: {
  readonly children: ReactNode;
  readonly label: string;
  readonly open?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(open);
  const contentId = useId();

  return (
    <div className="pd-command-center-one-page__table-disclosure">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="pd-command-center-one-page__table-disclosure-trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        {isOpen ? resolveDisclosureOpenLabel(label) : label}
      </button>

      {isOpen ? <div id={contentId}>{children}</div> : null}
    </div>
  );
}

const CHART_TABLE_ROW_LIMIT = 5;

/**
 * Shared accessible table alternative for charts. It stays collapsed until
 * requested so analytical sections keep their visual hierarchy without
 * dropping the data alternative required by the analytics contract. Once
 * open, it caps to CHART_TABLE_ROW_LIMIT rows with a "Pokaż więcej" expand —
 * the same principle as the detail table in Plan vs Benchmark, not
 * DataTable's own numbered pagination (a different UX for a different need).
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
  const [showAllRows, setShowAllRows] = useState(false);
  const visibleRows = showAllRows ? rows : rows.slice(0, CHART_TABLE_ROW_LIMIT);
  const hiddenRowCount = rows.length - visibleRows.length;

  return (
    <CommandRuntimeTableDisclosure label="Pokaż dane">
      <DataTable
        ariaLabel={ariaLabel}
        columns={columns}
        density="compact"
        emptyMessage={emptyMessage}
        loading={false}
        minWidth={minWidth}
        rowCount={visibleRows.length}
        rows={visibleRows}
        selectedRowIds={[]}
        sort={{ columnId: sortColumnId, direction: 'desc' }}
      />

      {rows.length > CHART_TABLE_ROW_LIMIT ? (
        <button
          aria-expanded={showAllRows}
          className="pd-command-center-one-page__table-disclosure-expand"
          onClick={() => setShowAllRows((current) => !current)}
          type="button"
        >
          {showAllRows ? 'Pokaż mniej' : `Pokaż więcej (${hiddenRowCount})`}
        </button>
      ) : null}
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
