import type { Meta, StoryObj } from '@storybook/react-vite';

import { dashboardDefinitions } from '../../fixtures/dashboard';
import { DashboardStory } from '../../screens/dashboard/DashboardStory';

const meta = {
  title: 'PapaData/04 Ekrany docelowe/Dashboard',
  component: DashboardStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    module: {
      control: 'select',
      options: Object.keys(dashboardDefinitions),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof DashboardStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Shell: Story = {
  name: 'Główny widok',
  args: { module: 'shell', theme: 'dark' },
};

export const CentrumDowodzenia: Story = {
  args: { module: 'command', theme: 'dark' },
};

export const Zamowienia: Story = {
  name: 'Zamówienia',
  args: { module: 'orders', theme: 'dark' },
};

export const Produkty: Story = {
  args: { module: 'products', theme: 'dark' },
};

export const Klienci: Story = {
  args: { module: 'customers', theme: 'dark' },
};

export const Ruch: Story = {
  args: { module: 'traffic', theme: 'dark' },
};

export const KampaniePlatne: Story = {
  name: 'Kampanie płatne',
  args: { module: 'campaigns', theme: 'dark' },
};

export const Integracje: Story = {
  args: { module: 'integrations', theme: 'dark' },
};

export const Ustawienia: Story = {
  args: { module: 'settings', theme: 'dark' },
};

export const Subskrypcja: Story = {
  args: { module: 'subscription', theme: 'dark' },
};

export const Pomoc: Story = {
  args: { module: 'support', theme: 'dark' },
};

export const PapaAsystent: Story = {
  args: { module: 'assistant', theme: 'dark' },
};
