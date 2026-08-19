import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  isLocalClientRuntimeAvailable,
} from '../../../shared/api/bffClient';
import {
  CommandCenterKpiSection,
} from './CommandCenterKpiSection';
import {
  CommandCenterPlanExecutionSection,
} from './CommandCenterPlanExecutionSection';
import {
  CommandSectionAnchor,
} from './CommandCenterSectionFrame';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  buildDemoExecutiveKpiRecords,
  buildExecutiveKpiRecords,
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
  const useDemoBreakdowns = isLocalClientRuntimeAvailable();
  const executiveKpis = useDemoBreakdowns
    ? buildDemoExecutiveKpiRecords(data.records)
    : buildExecutiveKpiRecords(data.records);

  return (
    <div className="pd-command-center-one-page">
      <CommandSectionAnchor id="command-section-kpi">
        <CommandCenterKpiSection
          dataState={dataState}
          records={executiveKpis}
        />
      </CommandSectionAnchor>

      <CommandSectionAnchor id="command-section-plan">
        <CommandCenterPlanExecutionSection
          forecastMethod={data.forecastMethod}
          forecastTotal={data.forecastTotal}
          planTotal={data.planTotal}
          trajectory={data.trajectory ?? []}
        />
      </CommandSectionAnchor>
    </div>
  );
}
