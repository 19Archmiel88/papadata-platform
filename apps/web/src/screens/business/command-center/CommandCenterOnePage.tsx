import type {
  DataRow,
} from '../../../../../../contracts/component-shared';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  defaultWorkspaceContext,
} from '../businessData';
import {
  CommandCenterAiRecommendationsSection,
} from './CommandCenterAiRecommendationsSection';
import {
  CommandCenterCustomerSplitSection,
} from './CommandCenterCustomerSplitSection';
import {
  CommandCenterFunnelSection,
} from './CommandCenterFunnelSection';
import {
  CommandCenterKpiSection,
} from './CommandCenterKpiSection';
import {
  CommandCenterPlanForecastSection,
} from './CommandCenterPlanForecastSection';
import {
  CommandCenterProductSalesSection,
} from './CommandCenterProductSalesSection';
import {
  CommandCenterRecordsSection,
} from './CommandCenterRecordsSection';
import {
  CommandCenterRevenueCostsSection,
} from './CommandCenterRevenueCostsSection';
import {
  CommandCenterTrafficSourcesSection,
} from './CommandCenterTrafficSourcesSection';
import {
  CommandSectionAnchor,
} from './CommandCenterSectionFrame';
import {
  isLocalClientRuntimeAvailable,
} from '../../../shared/api/bffClient';
import {
  useCommandLens,
} from './commandCenterLens';
import type {
  CommandCenterData,
  CommandOnePageIssue,
} from './commandCenterOnePageModel';
import {
  buildDemoCommandCustomerRows,
  buildDemoCommandProductRows,
  buildDemoCommandSourceRows,
  buildDemoExecutiveKpiRecords,
  buildExecutiveKpiRecords,
} from './commandCenterOnePageModel';
import './command-center-one-page.css';

export type CommandCenterOnePageProps = {
  readonly data: CommandCenterData;
  readonly dataState: AnalyticsDataState;
  readonly issues: readonly CommandOnePageIssue[];
  readonly rows: readonly DataRow[];
  readonly workspaceContext: typeof defaultWorkspaceContext;
};

export function CommandCenterOnePage({
  data,
  dataState,
  issues,
  rows,
  workspaceContext,
}: CommandCenterOnePageProps) {
  // Source, customer and product breakdowns have no coverage in the command
  // centre contract yet. Rather than fabricating them in production, they are
  // demo-only and the sections fall back to their empty states elsewhere.
  const [activeLens, selectLens] = useCommandLens();
  const useDemoBreakdowns = isLocalClientRuntimeAvailable();

  const executiveKpis = useDemoBreakdowns
    ? buildDemoExecutiveKpiRecords(data.records)
    : buildExecutiveKpiRecords(data.records);
  const sourceRows = useDemoBreakdowns
    ? buildDemoCommandSourceRows(executiveKpis)
    : [];
  const customerRows = useDemoBreakdowns
    ? buildDemoCommandCustomerRows(executiveKpis)
    : [];
  const productRows = useDemoBreakdowns
    ? buildDemoCommandProductRows(executiveKpis)
    : [];

  return (
    <>
      <CommandSectionAnchor id="command-section-kpi">
        <CommandCenterKpiSection
          data={data}
          dataState={dataState}
          issues={issues}
          records={executiveKpis}
          workspaceContext={workspaceContext}
        />
      </CommandSectionAnchor>

      <CommandSectionAnchor id="command-section-plan">
        <CommandCenterPlanForecastSection records={executiveKpis} />
      </CommandSectionAnchor>

      <CommandSectionAnchor id="command-section-sales-costs">
        <CommandCenterRevenueCostsSection
          activeLens={activeLens}
          onLensChange={selectLens}
          records={executiveKpis}
          sourceRows={sourceRows}
        />
      </CommandSectionAnchor>

      {/* "Where is it happening" — four structural views that used to stack
          full-width, one under the other. Paired into a mosaic they answer the
          same question in roughly half the scroll. */}
      <div className="pd-command-center-one-page__mosaic">
        <CommandSectionAnchor id="command-section-traffic-sources">
          <CommandCenterTrafficSourcesSection sourceRows={sourceRows} />
        </CommandSectionAnchor>

        <CommandSectionAnchor id="command-section-customers">
          <CommandCenterCustomerSplitSection customerRows={customerRows} />
        </CommandSectionAnchor>

        <CommandSectionAnchor id="command-section-products">
          <CommandCenterProductSalesSection productRows={productRows} />
        </CommandSectionAnchor>

        <CommandSectionAnchor id="command-section-funnel">
          <CommandCenterFunnelSection
            data={data}
            dataState={dataState}
          />
        </CommandSectionAnchor>
      </div>

      <CommandSectionAnchor id="command-section-recommendations">
        <CommandCenterAiRecommendationsSection
          activeLens={activeLens}
          data={data}
        />
      </CommandSectionAnchor>

      <CommandSectionAnchor id="command-section-records">
        <CommandCenterRecordsSection
          customerRows={customerRows}
          productRows={productRows}
          rows={rows}
          sourceRows={sourceRows}
          title="Pełny rejestr operacyjny"
        />
      </CommandSectionAnchor>
    </>
  );
}
