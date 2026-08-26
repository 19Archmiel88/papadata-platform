import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  AssistantShell,
  papaAssistantFixture,
} from '../../../features/papa-assistant';

const meta = {
  title: '40 Laboratorium Papa Asystenta/AssistantShell',
  component: AssistantShell,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AssistantShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FullWorkspace: Story = {
  name: 'Panel, split i pełna sekcja',
  render: () => (
    <AssistantShell
      data={papaAssistantFixture}
      presentation="split"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Papa Asystent' })).toBeInTheDocument();
    await expect(await canvas.findByRole('heading', { name: 'ContextSummary' })).toBeInTheDocument();
    await expect(await canvas.findByRole('button', { name: 'Stop generation' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: 'Artefakt' }));
    await expect(await canvas.findByRole('heading', { name: 'Artefakty bez zagnieżdżonych modali' })).toBeInTheDocument();
  },
};

export const CompactPanel: Story = {
  name: 'Kompaktowy panel',
  render: () => (
    <AssistantShell
      data={papaAssistantFixture}
      density="compact"
      presentation="panel"
    />
  ),
};
