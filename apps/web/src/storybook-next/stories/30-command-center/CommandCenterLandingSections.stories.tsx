import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

import type {
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
  CommandCenterKpiSection,
} from '../../../screens/business/command-center/CommandCenterKpiSection';
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
