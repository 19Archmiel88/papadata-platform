import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Error States/Auth',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const NieprawidloweDane: Story = {
  name: 'Nieprawidłowe dane',
  args: { initialScenario: 'loginInvalidCredentials', theme: 'dark' },
};

export const LinkResetuWygasl: Story = {
  name: 'Link resetu wygasł',
  args: { initialScenario: 'resetExpiredLink', theme: 'dark' },
};

export const ZaproszenieDlaInnegoAdresu: Story = {
  name: 'Zaproszenie dla innego adresu',
  args: { initialScenario: 'invitationEmailMismatch', theme: 'dark' },
};
