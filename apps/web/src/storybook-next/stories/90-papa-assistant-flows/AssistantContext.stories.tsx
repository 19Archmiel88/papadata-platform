import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  AssistantContextFlow,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '90 Przepływy/AssistantContext',
  component: AssistantContextFlow,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AssistantContextFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TenantWorkspaceScreenAndBasket: Story = {
  name: 'Ciągłość kontekstu',
  render: () => (
    <AssistantContextFlow data={papaAssistantFixture} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'AssistantContext' })).toBeInTheDocument();
    await expect(await canvas.findByText('tenant-papadata-demo')).toBeInTheDocument();
    await expect(await canvas.findByText('Commerce PL')).toBeInTheDocument();
  },
};
