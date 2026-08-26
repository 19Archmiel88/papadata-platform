import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  InlineAssistant,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/InlineAssistant',
  component: InlineAssistant,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof InlineAssistant>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KpiContext: Story = {
  name: 'KPI, wykres i filtr',
  render: () => (
    <main className="pd-pa-story-stage">
      <InlineAssistant data={papaAssistantFixture} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'ROAS blended MTD' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Przejdź do panelu bez utraty rozmowy' })).toBeInTheDocument();
  },
};
