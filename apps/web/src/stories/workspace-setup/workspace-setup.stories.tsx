import type { Meta, StoryObj } from '@storybook/react-vite';

import { workspaceSurfaces } from '../../fixtures/workspace';
import { WorkspaceSetupStory } from '../../screens/workspace-setup/WorkspaceSetupStory';

const meta = {
  title: 'PapaData/Konfiguracja workspace',
  component: WorkspaceSetupStory,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    surface: {
      control: 'select',
      options: Object.keys(workspaceSurfaces),
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof WorkspaceSetupStory>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WyborWorkspace: Story = {
  name: 'Wybór workspace',
  args: { surface: 'selection', theme: 'dark' },
};

export const UtworzenieWorkspace: Story = {
  name: 'Utworzenie workspace',
  args: { surface: 'creation', theme: 'dark' },
};

export const DaneFirmy: Story = {
  name: 'Dane firmy',
  args: { surface: 'company', theme: 'dark' },
};

export const ProfilDzialalnosci: Story = {
  name: 'Profil działalności',
  args: { surface: 'business', theme: 'dark' },
};

export const PolaczenieZrodlaDanych: Story = {
  name: 'Połączenie źródła danych',
  args: { surface: 'dataSource', theme: 'dark' },
};

export const StanKonfiguracjiWorkspace: Story = {
  name: 'Stan konfiguracji workspace',
  args: { surface: 'status', theme: 'dark' },
};

export const PrzygotowanieDashboardu: Story = {
  name: 'Przygotowanie dashboardu',
  args: { surface: 'preparation', theme: 'dark' },
};

export const DostepZablokowany: Story = {
  name: 'Dostęp zablokowany',
  args: { surface: 'blocked', theme: 'dark' },
};
