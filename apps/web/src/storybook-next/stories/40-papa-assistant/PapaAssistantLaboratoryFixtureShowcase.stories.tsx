import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  within,
} from 'storybook/test';

import {
  PapaAssistantLaboratoryFixtureShowcase,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/PapaAssistantLaboratoryFixtureShowcase',
  component: PapaAssistantLaboratoryFixtureShowcase,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PapaAssistantLaboratoryFixtureShowcase>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullComposition: Story = {
  name: 'Pełna kompozycja 5 sekcji',
  render: () => (
    <PapaAssistantLaboratoryFixtureShowcase data={papaAssistantFixture} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Decyzje, diagnozy, raporty i plan działań' })).toBeInTheDocument();
    await expect(await canvas.findByRole('navigation', { name: 'Sekcje Laboratorium' })).toBeInTheDocument();
    await expect(await canvas.findByRole('link', { name: 'Zapytaj' })).toBeInTheDocument();
    await expect(await canvas.findByRole('link', { name: 'Biblioteka' })).toBeInTheDocument();
    await expect(await canvas.findByRole('link', { name: 'Eksport i MCP' })).toBeInTheDocument();
  },
};
