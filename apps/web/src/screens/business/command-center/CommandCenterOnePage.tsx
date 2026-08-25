import {
  useState,
} from 'react';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  CommandCenterCustomerSplitSection,
} from './CommandCenterCustomerSplitSection';
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
  const executiveKpis = buildExecutiveKpiRecords(data.records);
  const [driversLens, setDriversLens] = useState(defaultCommandLens);

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

  return (
    <div className="pd-command-center-one-page">
      <CommandCenterDashboardLayout
        customers={customers}
        drivers={drivers}
        funnel={funnel}
        kpis={kpis}
        plan={plan}
        products={products}
        traffic={traffic}
      />
    </div>
  );
}
