import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  Recommendation,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/Recommendation',
  component: Recommendation,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Recommendation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const BeforeAfterNoAction: Story = {
  name: 'Before, after i no action',
  render: () => (
    <main className="pd-pa-story-stage">
      <Recommendation data={papaAssistantFixture} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Rekomendacja wygenerowana przez AI. Wdrożenie wymaga zatwierdzenia użytkownika i ponownej walidacji danych.')).toBeInTheDocument();
    await expect(await canvas.findByText('Stan obecny')).toBeInTheDocument();
    await expect(await canvas.findByText('Bez działania')).toBeInTheDocument();
    await expect(await canvas.findByText('Po wdrożeniu')).toBeInTheDocument();
  },
};
