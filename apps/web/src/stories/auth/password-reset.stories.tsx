import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Auth/Reset hasła',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AktywnyToken: Story = {
  name: 'Aktywny token',
  args: { initialScenario: 'resetPassword', theme: 'dark' },
};

export const LinkWygasl: Story = {
  name: 'Link wygasł',
  args: { initialScenario: 'resetExpiredLink', theme: 'dark' },
};

export const LinkWykorzystany: Story = {
  name: 'Link wykorzystany',
  args: { initialScenario: 'resetUsedLink', theme: 'dark' },
};
