import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  EvidencePanel,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/EvidencePanel',
  component: EvidencePanel,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof EvidencePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SourcesConfidenceAndLimits: Story = {
  name: 'Dowody i confidence',
  render: () => (
    <main className="pd-pa-story-stage">
      <EvidencePanel data={papaAssistantFixture} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Dowody i ograniczenia odpowiedzi' })).toBeInTheDocument();
    await expect(await canvas.findByText('opisowy, bez fałszywego procentu')).toBeInTheDocument();
  },
};
