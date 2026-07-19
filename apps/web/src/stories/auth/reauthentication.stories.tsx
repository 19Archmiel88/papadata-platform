import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Auth/Reauthentication',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PotwierdzenieOperacji: Story = {
  name: 'Potwierdzenie operacji',
  args: { initialScenario: 'reauthentication', theme: 'dark' },
};
