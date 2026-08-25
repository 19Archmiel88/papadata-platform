import {
  useState,
} from 'react';
import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import type {
  DriverRelationships,
  PlanTrajectoryPointView,
} from '../../../../../../contracts/api-schemas';
import type {
  AnalyticsDataState,
} from '../../../design-system';
import {
  businessScreenDefinitions,
  createStorybookBusinessData,
} from '../../../screens/business';
import {
  CommandCenterDriversSection,
} from '../../../screens/business/command-center/CommandCenterDriversSection';
import {
  CommandCenterKpiSection,
} from '../../../screens/business/command-center/CommandCenterKpiSection';
import {
  defaultCommandLens,
} from '../../../screens/business/command-center/commandCenterLens';
import type {
  CommandLens,
} from '../../../screens/business/command-center/commandCenterLens';
import {
  CommandCenterPlanExecutionSection,
} from '../../../screens/business/command-center/CommandCenterPlanExecutionSection';
import {
  CommandCenterCustomerSplitSection,
} from '../../../screens/business/command-center/CommandCenterCustomerSplitSection';
import {
  CommandCenterFunnelSection,
} from '../../../screens/business/command-center/CommandCenterFunnelSection';
import {
  CommandCenterProductSalesSection,
} from '../../../screens/business/command-center/CommandCenterProductSalesSection';
import {
  CommandCenterTrafficSourcesSection,
} from '../../../screens/business/command-center/CommandCenterTrafficSourcesSection';
import {
  buildCustomerSegmentRows,
  buildDemoExecutiveKpiRecords,
  buildProductSalesRows,
  buildTrafficSourceRows,
} from '../../../screens/business/command-center/commandCenterOnePageModel';
import '../../../screens/business/command-center/command-center-one-page.css';
import '../../../screens/business/command-center/command-center-vivid.css';

const meta = {
  title: '30 Centrum Dowodzenia/Sekcje landing page',
  parameters: {
    layout: 'fullscreen',
    docs: {
      disable: true,
    },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

const onePageDefinition = businessScreenDefinitions.find(
  (definition) => definition.group === 'command-center' && definition.id === '30.01',
);

if (!onePageDefinition) {
  throw new Error('Missing Command Center definition for 30.01');
}

const baseData = createStorybookBusinessData(onePageDefinition);

if (baseData.group !== 'command-center') {
  throw new Error('Command Center section stories require command-center data.');
}

const dataState = 'ready' satisfies AnalyticsDataState;
const executiveKpis = buildDemoExecutiveKpiRecords(baseData.records);

function SectionCanvas({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-command-center-section-story-canvas">
      <div
        className="pd-command-center-one-page"
        data-mode="runtime"
      >
        {children}
      </div>
    </main>
  );
}

const demoTrajectory: readonly PlanTrajectoryPointView[] = Array.from({ length: 30 }, (_unused, index) => {
  const isForecast = index >= 21;
  const dayValue = 5_200 + index * 145 + (index % 7 === 5 || index % 7 === 6 ? 900 : 0);

  return {
    actual: isForecast ? null : dayValue,
    date: new Date(Date.UTC(2026, 6, 20 + index)).toISOString(),
    forecast: isForecast ? dayValue : null,
    plan: 5_600 + index * 140,
  };
});

export const KpiSectionStory: Story = {
  name: 'KPI',
  render: () => (
    <SectionCanvas>
      <CommandCenterKpiSection
        dataState={dataState}
        records={executiveKpis}
      />
    </SectionCanvas>
  ),
};

export const PlanVsForecastSectionStory: Story = {
  name: 'Plan vs Benchmark',
  render: () => (
    <SectionCanvas>
      <CommandCenterPlanExecutionSection
        forecastMethod="linear-run-rate"
        forecastTotal={demoTrajectory.reduce((sum, point) => sum + (point.actual ?? point.forecast ?? 0), 0)}
        planTotal={demoTrajectory.reduce((sum, point) => sum + point.plan, 0)}
        trajectory={demoTrajectory}
      />
    </SectionCanvas>
  ),
};

// Efficiency demonstrates the honest insufficient-data state
// (sampleSize below the backend's MIN_CORRELATION_SAMPLE_SIZE), so the UI
// never invents a replacement statistic when Pearson r is not defensible.
// Volume is always a decomposition (exact algebra, never a correlation) —
// see command-center-metrics.contract-data.ts for why orders-vs-AOV
// correlation would be statistically spurious.
const demoDriverRelationships: DriverRelationships = {
  efficiency: {
    basis: 'insufficient-data',
    coefficient: null,
    points: Array.from({ length: 8 }, (_unused, index) => ({
      id: `efficiency-${index}`,
      label: `T-${7 - index}`,
      x: 1_800 + index * 60,
      y: 6_500 + index * 220,
    })),
    sampleSize: 8,
    xLabel: 'Koszt mediów',
    xMetricId: 'demo-ad-spend',
    yLabel: 'Przychód z reklam (attributed)',
    yMetricId: 'demo-attributed-revenue',
  },
  volume: {
    basis: 'decomposition',
    endValue: 92_400,
    priceEffect: 4_100,
    priceLabel: 'Wartość koszyka (AOV)',
    sampleSize: 14,
    startValue: 84_900,
    unit: 'currency',
    volumeEffect: 3_400,
    volumeLabel: 'Liczba zamówień',
  },
};

function DriversSectionDemo() {
  const [activeLens, setActiveLens] = useState<CommandLens>(defaultCommandLens);

  return (
    <CommandCenterDriversSection
      activeLens={activeLens}
      driverRelationships={demoDriverRelationships}
      onLensChange={setActiveLens}
      records={executiveKpis}
    />
  );
}

export const DriversSectionStory: Story = {
  name: 'Drivery wyniku',
  render: () => (
    <SectionCanvas>
      <DriversSectionDemo />
    </SectionCanvas>
  ),
};

export const SalesFunnelSectionStory: Story = {
  name: 'Lejek sprzedaży',
  render: () => (
    <SectionCanvas>
      <CommandCenterFunnelSection
        data={baseData}
        dataState={dataState}
      />
    </SectionCanvas>
  ),
};

export const ProductSalesSectionStory: Story = {
  name: 'Najlepiej sprzedające się produkty',
  render: () => (
    <SectionCanvas>
      <CommandCenterProductSalesSection
        productRows={buildProductSalesRows(baseData.productSales)}
      />
    </SectionCanvas>
  ),
};

export const TrafficSourcesSectionStory: Story = {
  name: 'Kanały ruchu',
  render: () => (
    <SectionCanvas>
      <CommandCenterTrafficSourcesSection
        sourceRows={buildTrafficSourceRows(baseData.trafficSources)}
      />
    </SectionCanvas>
  ),
};

export const CustomerSplitSectionStory: Story = {
  name: 'Nowi i powracający',
  render: () => (
    <SectionCanvas>
      <CommandCenterCustomerSplitSection
        customerRows={buildCustomerSegmentRows(baseData.customerSegments)}
      />
    </SectionCanvas>
  ),
};

