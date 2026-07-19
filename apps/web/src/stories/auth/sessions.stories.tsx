import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Zarządzanie sesjami',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AktywneSesje: Story = {
  name: 'Aktywne sesje',
  args: { initialScenario: 'activeSessions', theme: 'dark' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByRole('button', { name: /Lista sesji/i });
    await waitFor(() => expect(button).toBeEnabled());
    await userEvent.click(button);
    await expect(canvas.findByText(/Lista sesji została odtworzona/i)).resolves.toBeInTheDocument();
  },
};

export const SesjaWygasla: Story = {
  name: 'Sesja wygasła',
  args: { initialScenario: 'sessionExpired', theme: 'dark' },
};
