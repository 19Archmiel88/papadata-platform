import type {
  ReactNode,
} from 'react';
import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';

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
    a11y: {
      disable: true,
      test: 'off',
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

export const KpiSectionStory: Story = {
  name: '30.01 KPI',
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
  name: '30.02 Plan vs Prognoza',
  render: () => (
    <SectionCanvas>
      <CommandCenterPlanExecutionSection />
    </SectionCanvas>
  ),
};
