import {
  useState,
} from 'react';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  EmptyState,
} from '../../../design-system';
import {
  useShellDateRange,
} from '../../../shell/app-shell';
import {
  defaultWorkspaceContext,
} from '../businessData';
import {
  buildAttentionSignals,
  CommandCenterAttentionSection,
} from './CommandCenterAttentionSection';
import {
  CommandCenterCommittedActionsSection,
} from './CommandCenterCommittedActionsSection';
import {
  CommandCenterCustomerSplitSection,
} from './CommandCenterCustomerSplitSection';
import {
  CommandCenterDecisionWorkspace,
} from './CommandCenterDecisionWorkspace';
import {
  CommandCenterDashboardLayout,
} from './CommandCenterDashboardLayout';
import {
  CommandCenterDriversSection,
} from './CommandCenterDriversSection';
import {
  CommandCenterFunnelSection,
} from './CommandCenterFunnelSection';
import {
  CommandCenterKpiSection,
} from './CommandCenterKpiSection';
import {
  CommandCenterPlanExecutionSection,
} from './CommandCenterPlanExecutionSection';
import {
  CommandCenterProductSalesSection,
} from './CommandCenterProductSalesSection';
import {
  CommandSectionAnchor,
} from './CommandCenterSectionFrame';
import {
  CommandCenterTrafficSourcesSection,
} from './CommandCenterTrafficSourcesSection';
import {
  defaultCommandLens,
} from './commandCenterLens';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  buildExecutiveKpiRecords,
  buildCustomerSegmentRows,
  buildProductSalesRows,
  buildTrafficSourceRows,
  commandCenterOnePageSectionIds,
} from './commandCenterOnePageModel';
import './command-center-one-page.css';
import './command-center-vivid.css';

export type CommandCenterOnePageProps = {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
};

export function CommandCenterOnePage({
  data,
  dataState,
}: CommandCenterOnePageProps) {
  const {
    dateRange,
  } = useShellDateRange();
  const workspaceContext = {
    ...defaultWorkspaceContext,
    range: dateRange,
  };
  const executiveKpis = buildExecutiveKpiRecords(data.records);
  const [driversLens, setDriversLens] = useState(defaultCommandLens);
  const [dismissedSignalIds, setDismissedSignalIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const attentionSignals = buildAttentionSignals(data, dismissedSignalIds);
  const selectedSignal = attentionSignals.find((signal) => (
    signal.decision.id === selectedSignalId
  )) ?? attentionSignals[0] ?? null;

  function dismissSignal(signalId: string) {
    setDismissedSignalIds((current) => {
      const next = new Set(current);
      next.add(signalId);
      return next;
    });
    setSelectedSignalId((current) => (
      current === signalId ? null : current
    ));
  }

  const kpis = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[0]}>
      <CommandCenterKpiSection
        dataState={dataState}
        records={executiveKpis}
      />
    </CommandSectionAnchor>
  );
  const plan = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[1]}>
      <CommandCenterPlanExecutionSection
        forecastMethod={data.forecastMethod}
        forecastTotal={data.forecastTotal}
        planTotal={data.planTotal}
        trajectory={data.trajectory ?? []}
      />
    </CommandSectionAnchor>
  );
  const drivers = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[2]}>
      <CommandCenterDriversSection
        activeLens={driversLens}
        driverRelationships={data.driverRelationships}
        onLensChange={setDriversLens}
        records={executiveKpis}
      />
    </CommandSectionAnchor>
  );
  const funnel = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[3]}>
      <CommandCenterFunnelSection
        data={data}
        dataState={dataState}
      />
    </CommandSectionAnchor>
  );
  const traffic = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[4]}>
      <CommandCenterTrafficSourcesSection
        sourceRows={buildTrafficSourceRows(data.trafficSources)}
      />
    </CommandSectionAnchor>
  );
  const products = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[5]}>
      <CommandCenterProductSalesSection
        productRows={buildProductSalesRows(data.productSales)}
      />
    </CommandSectionAnchor>
  );
  const customers = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[6]}>
      <CommandCenterCustomerSplitSection customerRows={buildCustomerSegmentRows(data.customerSegments)} />
    </CommandSectionAnchor>
  );
  const priorities = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[7]}>
      <CommandCenterAttentionSection
        data={data}
        dismissedSignalIds={dismissedSignalIds}
        onSelectSignal={setSelectedSignalId}
        selectedSignalId={selectedSignal?.decision.id ?? null}
        workspaceContext={workspaceContext}
      />
    </CommandSectionAnchor>
  );
  const decisionWorkspace = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[8]}>
      {selectedSignal ? (
        <CommandCenterDecisionWorkspace
          data={data}
          onClose={() => setSelectedSignalId(null)}
          onDismiss={dismissSignal}
          signal={selectedSignal}
          workspaceContext={workspaceContext}
        />
      ) : (
        <section
          className="pd-command-center-one-page__section"
        >
          <EmptyState
            message="Wybierz sygnał z sekcji Priorytety, aby zobaczyć dowody, rekomendację i plan działania."
            title="Brak wybranej decyzji"
            variant="empty"
          />
        </section>
      )}
    </CommandSectionAnchor>
  );
  const actions = (
    <CommandSectionAnchor id={commandCenterOnePageSectionIds[9]}>
      <CommandCenterCommittedActionsSection actions={data.committedActions} />
    </CommandSectionAnchor>
  );

  return (
    <div className="pd-command-center-one-page">
      <CommandCenterDashboardLayout
        actions={actions}
        customers={customers}
        decisionWorkspace={decisionWorkspace}
        drivers={drivers}
        funnel={funnel}
        kpis={kpis}
        plan={plan}
        priorities={priorities}
        products={products}
        traffic={traffic}
      />
    </div>
  );
}
