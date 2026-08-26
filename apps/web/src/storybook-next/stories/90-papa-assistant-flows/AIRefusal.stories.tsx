import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  AIRefusalFlow,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '90 Przepływy/AIRefusal',
  component: AIRefusalFlow,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AIRefusalFlow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const RefusalReasonsAndEvidence: Story = {
  name: 'Powody odmowy',
  render: () => (
    <AIRefusalFlow data={papaAssistantFixture} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'AIRefusal' })).toBeInTheDocument();
    await expect(await canvas.findByText('prompt_injection_detected')).toBeInTheDocument();
    await expect(await canvas.findByText(/nie może przygotować odpowiedzi/u)).toBeInTheDocument();
  },
};
