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
  buildDemoExecutiveKpiRecords,
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
    test: {
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
  name: 'Plan vs Prognoza',
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

// Two relationships, deliberately on opposite sides of the basis fork: volume
// has enough real paired history to correlate; efficiency demonstrates the
// deterministic contribution-share fallback (sampleSize below the real
// backend's MIN_CORRELATION_SAMPLE_SIZE) so both honest-labeling paths are
// visible in this demo, not just the happy path.
const demoDriverRelationships: DriverRelationships = {
  efficiency: {
    basis: 'contribution-share',
    coefficient: null,
    contributionShare: 0.63,
    points: Array.from({ length: 8 }, (_unused, index) => ({
      id: `efficiency-${index}`,
      label: `T-${7 - index}`,
      x: 1_800 + index * 60,
      y: 3.6 + (index % 3) * 0.15,
    })),
    sampleSize: 8,
    xLabel: 'Koszt mediów',
    xMetricId: 'demo-ad-spend',
    yLabel: 'ROAS',
    yMetricId: 'demo-roas',
  },
  volume: {
    basis: 'correlation',
    coefficient: 0.42,
    contributionShare: null,
    points: Array.from({ length: 14 }, (_unused, index) => ({
      id: `volume-${index}`,
      label: `T-${13 - index}`,
      x: 30 + index * 2 + (index % 4),
      y: 150 + index * 3 - (index % 3) * 4,
    })),
    sampleSize: 14,
    xLabel: 'Zamówienia',
    xMetricId: 'demo-orders',
    yLabel: 'AOV',
    yMetricId: 'demo-aov',
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
      sourceRows={[]}
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
