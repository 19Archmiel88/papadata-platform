import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Auth/Odzyskiwanie hasła',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Formularz: Story = {
  args: { initialScenario: 'passwordRecovery', theme: 'dark' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /Wyślij instrukcje/i }));
    await expect(canvas.findByText(/wyślemy dalsze instrukcje/i)).resolves.toBeInTheDocument();
  },
};

export const SukcesNeutralny: Story = {
  name: 'Sukces neutralny',
  args: { initialScenario: 'passwordRecoverySuccess', theme: 'dark' },
};
