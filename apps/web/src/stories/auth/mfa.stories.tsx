import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/05 Diagnostyka deweloperska/Dostęp do konta/MFA',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const KodJednorazowy: Story = {
  name: 'Kod jednorazowy',
  args: { initialScenario: 'mfaChallenge', theme: 'dark' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /Potwierdź kod/i }));
    await expect(canvas.findByText(/MFA potwierdzone/i)).resolves.toBeInTheDocument();
  },
};

export const BlednyKod: Story = {
  name: 'Błędny kod',
  args: { initialScenario: 'mfaInvalid', theme: 'dark' },
};

export const ChallengeWygasl: Story = {
  name: 'Próba MFA wygasła',
  args: { initialScenario: 'mfaExpired', theme: 'dark' },
};

export const RecoveryCode: Story = {
  name: 'Kod odzyskiwania',
  args: { initialScenario: 'mfaRecoveryCode', theme: 'dark' },
};
