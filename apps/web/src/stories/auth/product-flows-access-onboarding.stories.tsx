import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Product Flows/Dostęp i onboarding',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ZaproszenieDoWorkspace: Story = {
  name: 'Zaproszenie do workspace',
  args: { initialScenario: 'invitation', theme: 'dark' },
};

export const LogowanieDoDashboardu: Story = {
  name: 'Logowanie do dashboardu',
  args: { initialScenario: 'login', theme: 'dark' },
};

export const BrakDostepuPoLogowaniu: Story = {
  name: 'Brak dostępu po logowaniu',
  args: { initialScenario: 'noMembership', theme: 'dark' },
};
