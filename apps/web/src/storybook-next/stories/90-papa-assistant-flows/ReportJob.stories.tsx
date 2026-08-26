import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ReportJobFlow,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '90 Przepływy/ReportJob',
  component: ReportJobFlow,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ReportJobFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AsyncReportQueue: Story = {
  name: 'Kolejka raportów',
  render: () => (
    <ReportJobFlow data={papaAssistantFixture} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'ReportJob' })).toBeInTheDocument();
    await expect(await canvas.findByText('ReportJob generating')).toBeInTheDocument();
    await expect(await canvas.findByText('CSV + MCP')).toBeInTheDocument();
  },
};
