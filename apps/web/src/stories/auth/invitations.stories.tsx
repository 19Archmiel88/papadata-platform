import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Auth/Zaproszenia',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AktywneZaproszenie: Story = {
  name: 'Aktywne zaproszenie',
  args: { initialScenario: 'invitation', theme: 'dark' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /Przyjmij zaproszenie/i }));
    await expect(canvas.findByText(/zaakceptowane i audytowane/i)).resolves.toBeInTheDocument();
  },
};

export const ZaproszenieWygasle: Story = {
  name: 'Zaproszenie wygasłe',
  args: { initialScenario: 'invitationExpired', theme: 'dark' },
};

export const ZaproszenieWykorzystane: Story = {
  name: 'Zaproszenie wykorzystane',
  args: { initialScenario: 'invitationUsed', theme: 'dark' },
};

export const InnyEmail: Story = {
  name: 'Inny e-mail',
  args: { initialScenario: 'invitationEmailMismatch', theme: 'dark' },
};
