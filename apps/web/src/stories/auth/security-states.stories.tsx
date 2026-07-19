import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/03 Wzorce/Stan braku dostępu',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const UstawieniaBezpieczenstwa: Story = {
  name: 'Ustawienia bezpieczeństwa',
  args: { initialScenario: 'securitySettings', theme: 'dark' },
};

export const BrakCapability: Story = {
  name: 'Brak uprawnień',
  args: { initialScenario: 'forbidden', theme: 'dark' },
};
