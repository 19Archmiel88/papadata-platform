import type { Meta, StoryObj } from '@storybook/react-vite';

import { AuthStorySurface } from '../../screens/account-access/AuthStorySurface';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dostęp do konta/Stany dostępu',
  component: AuthStorySurface,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthStorySurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StanDostepuNiedostepny: Story = {
  name: 'Dostęp niedostępny',
  args: {
    initialScreen: 'authUnavailable',
    initialTheme: 'dark',
  },
};

export const DostepZablokowany: Story = {
  name: 'Dostęp zablokowany',
  args: {
    initialScreen: 'accessBlocked',
    initialTheme: 'dark',
  },
};

export const RozwiazanieDostepu: Story = {
  name: 'Rozwiązanie dostępu',
  args: {
    initialScreen: 'accessResolution',
    initialTheme: 'dark',
  },
};

export const DostepGotowy: Story = {
  name: 'Dostęp gotowy',
  args: {
    initialScreen: 'complete',
    initialTheme: 'dark',
  },
};
