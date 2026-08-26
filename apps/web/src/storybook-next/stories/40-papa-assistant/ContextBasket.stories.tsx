import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  ContextBasket,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/ContextBasket',
  component: ContextBasket,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ContextBasket>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllContextTypes: Story = {
  name: 'Koszyk kontekstu',
  render: () => (
    <main className="pd-pa-story-stage">
      <ContextBasket data={papaAssistantFixture} />
    </main>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Koszyk kontekstu' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Usuń z kontekstu: ROAS blended MTD' })).toBeInTheDocument();
  },
};
