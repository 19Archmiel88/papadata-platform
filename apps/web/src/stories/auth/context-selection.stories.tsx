import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/03 Wzorce/Wybór kontekstu',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WyborKontekstu: Story = {
  name: 'Wybór kontekstu',
  args: { initialScenario: 'contextSelection', theme: 'dark' },
};

export const WorkspaceNieGotowy: Story = {
  name: 'Workspace niegotowy',
  args: { initialScenario: 'workspaceNotReady', theme: 'dark' },
};

export const WorkspaceZablokowany: Story = {
  name: 'Workspace zablokowany',
  args: { initialScenario: 'workspaceBlocked', theme: 'dark' },
};

export const BrakMembershipu: Story = {
  name: 'Brak membershipu',
  args: { initialScenario: 'noMembership', theme: 'dark' },
};
