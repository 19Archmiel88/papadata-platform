import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  DecisionQueue,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/DecisionQueue',
  component: DecisionQueue,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DecisionQueue>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllApprovalStates: Story = {
  name: 'Wszystkie stany decyzji',
  render: () => (
    <main className="pd-pa-story-stage">
      <DecisionQueue data={papaAssistantFixture} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Proposal, approval, revalidation, execution, audit i recovery' })).toBeInTheDocument();
    await expect(await canvas.findByText('partiallySucceeded')).toBeInTheDocument();
    await expect(await canvas.findByText('compensated')).toBeInTheDocument();
  },
};
