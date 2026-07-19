import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AuthOperationalScreen } from '../../screens/auth/AuthOperationalScreen';
import { renderLocalAuthStory } from './authStoryRender';

const meta = {
  title: 'PapaData/Auth/Logowanie',
  component: AuthOperationalScreen,
  render: renderLocalAuthStory,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    initialScenario: {
      control: 'select',
      options: ['login', 'loginLoading', 'loginInvalidCredentials', 'loginAccountBlocked'],
    },
    theme: { control: 'inline-radio', options: ['light', 'dark'] },
  },
} satisfies Meta<typeof AuthOperationalScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const PoprawneLogowanie: Story = {
  name: 'Poprawne logowanie',
  args: { initialScenario: 'login', theme: 'dark' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', { name: /Zaloguj/i }));
    await expect(canvas.findByText(/Sesja aktywna/i)).resolves.toBeInTheDocument();
  },
};

export const StanLoading: Story = {
  name: 'Stan loading',
  args: { initialScenario: 'loginLoading', theme: 'dark' },
};

export const BledneDane: Story = {
  name: 'Błędne dane',
  args: { initialScenario: 'loginInvalidCredentials', theme: 'dark' },
};

export const KontoZablokowane: Story = {
  name: 'Konto zablokowane',
  args: { initialScenario: 'loginAccountBlocked', theme: 'dark' },
};

export const MotywJasny: Story = {
  name: 'Motyw jasny',
  args: { initialScenario: 'login', theme: 'light' },
};
