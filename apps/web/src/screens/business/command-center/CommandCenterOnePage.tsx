import {
  useState,
} from 'react';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  CommandCenterDriversSection,
} from './CommandCenterDriversSection';
import {
  CommandCenterKpiSection,
} from './CommandCenterKpiSection';
import {
  CommandCenterPlanExecutionSection,
} from './CommandCenterPlanExecutionSection';
import {
  CommandSectionAnchor,
} from './CommandCenterSectionFrame';
import {
  defaultCommandLens,
} from './commandCenterLens';
import type {
  CommandCenterData,
} from './commandCenterOnePageModel';
import {
  buildExecutiveKpiRecords,
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
  const executiveKpis = buildExecutiveKpiRecords(data.records);
  const [driversLens, setDriversLens] = useState(defaultCommandLens);

  return (
    <div className="pd-command-center-one-page">
      <CommandSectionAnchor id={commandCenterOnePageSectionIds[0]}>
        <CommandCenterKpiSection
          dataState={dataState}
          records={executiveKpis}
        />
      </CommandSectionAnchor>

      <CommandSectionAnchor id={commandCenterOnePageSectionIds[1]}>
        <CommandCenterPlanExecutionSection
          forecastMethod={data.forecastMethod}
          forecastTotal={data.forecastTotal}
          planTotal={data.planTotal}
          trajectory={data.trajectory ?? []}
        />
      </CommandSectionAnchor>

      <CommandSectionAnchor id={commandCenterOnePageSectionIds[2]}>
        <CommandCenterDriversSection
          activeLens={driversLens}
          driverRelationships={data.driverRelationships}
          onLensChange={setDriversLens}
          records={executiveKpis}
          sourceRows={[]}
        />
      </CommandSectionAnchor>
    </div>
  );
}
