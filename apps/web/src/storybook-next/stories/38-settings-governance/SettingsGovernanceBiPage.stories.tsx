import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  expect,
  userEvent,
  within,
} from 'storybook/test';

import {
  SettingsAccountProfile,
  SettingsAccountSecurity,
  SettingsAuditP0,
  SettingsGovernanceBiPage,
  SettingsWorkspaceAi,
  SettingsWorkspaceAnalytics,
  SettingsWorkspaceCompany,
  SettingsWorkspaceCompliance,
  SettingsWorkspaceNotifications,
  SettingsWorkspaceTeam,
} from './SettingsGovernanceBiPage';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: '38 Ustawienia i governance/Strona z dostarczonego HTML',
  component: SettingsGovernanceBiPage,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SettingsGovernanceBiPage>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-set">
      <div className="pd-set-content">
        <div className="pd-set-view">
          {children}
        </div>
      </div>
    </main>
  );
}

export const FullPage: Story = {
  name: 'Pełna kompozycja strony',
  render: () => (
    <StorybookProductShellFrame activePath="/app/settings/organizacja">
      <SettingsGovernanceBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByRole('heading', { name: 'Moje konto' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Bezpieczeństwo/u }));
    await expect(await canvas.findByRole('heading', { name: 'Bezpieczeństwo i Dostęp' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Zespół i uprawnienia/u }));
    await expect(await canvas.findByRole('heading', { name: 'Zespół i Uprawnienia (RBAC)' })).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Audyt P0/u }));
    await expect(await canvas.findByRole('heading', { name: 'Raport Audytu Architektury Ustawień (P0 Fixes)' })).toBeInTheDocument();
  },
};

export const AccountProfile: Story = {
  name: '1. Moje konto',
  render: () => (
    <StoryFrame>
      <SettingsAccountProfile />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByDisplayValue('Anna Kowalska')).toBeInTheDocument();
    await expect(await canvas.findByText('Email Zweryfikowany ✓')).toBeInTheDocument();
  },
};

export const AccountSecurity: Story = {
  name: '2. Bezpieczeństwo',
  render: () => (
    <StoryFrame>
      <SettingsAccountSecurity />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('YubiKey 5 NFC (Hardware Key)')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Ponownie Skonfiguruj TOTP/u }));
  },
};

export const WsCompany: Story = {
  name: '3. Firma i workspace',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceCompany revision={124} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByDisplayValue('Casa di Orfeo')).toBeInTheDocument();
    await expect(await canvas.findByText('Strefa Krytyczna (Danger Zone)')).toBeInTheDocument();
  },
};

export const WsTeam: Story = {
  name: '4. Zespół i uprawnienia',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceTeam />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Piotr Wiśniewski')).toBeInTheDocument();
    await expect(await canvas.findByText('michal.nowak@casadiorfeo.pl')).toBeInTheDocument();
  },
};

export const WsAnalytics: Story = {
  name: '5. Analityka i cele',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceAnalytics />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Koszt Pozyskania Klienta (CAC)')).toBeInTheDocument();
  },
};

export const WsAi: Story = {
  name: '6. Papa AI',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceAi />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('VIP_CUSTOMER')).toBeInTheDocument();
    await expect(await canvas.findByText(/AI Security Guardrail/u)).toBeInTheDocument();
  },
};

export const WsNotifications: Story = {
  name: '7. Powiadomienia',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceNotifications />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Weekly Executive Brief')).toBeInTheDocument();
  },
};

export const WsCompliance: Story = {
  name: '8. Prywatność i zgodność',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceCompliance />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('OpenAI Ireland Ltd.')).toBeInTheDocument();
  },
};

export const AuditP0: Story = {
  name: '9. Audyt P0',
  render: () => (
    <StoryFrame>
      <SettingsAuditP0 />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText(/P0.#8/u)).toBeInTheDocument();
  },
};

export const ModalsAndSearch: Story = {
  name: '10. Modale (TOTP, zaproszenie, cel, Ctrl+K)',
  render: () => (
    <StorybookProductShellFrame activePath="/app/settings/organizacja">
      <SettingsGovernanceBiPage />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(await canvas.findByRole('button', { name: /Bezpieczeństwo/u }));
    await userEvent.click(await canvas.findByRole('button', { name: /Ponownie Skonfiguruj TOTP/u }));
    await expect(await canvas.findByRole('dialog', { name: 'Konfiguracja TOTP 2FA' })).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij' }));

    await userEvent.click(await canvas.findByRole('button', { name: /Zespół i uprawnienia/u }));
    await userEvent.click(await canvas.findByRole('button', { name: /Zaproś Nowego Użytkownika/u }));
    await expect(await canvas.findByRole('dialog', { name: 'Zaproś członka zespołu' })).toBeInTheDocument();
    await expect(await canvas.findByText('targets.manage')).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole('button', { name: 'Zamknij' }));

    await userEvent.click(await canvas.findByRole('button', { name: /Szukaj ustawień/u }));
    await expect(await canvas.findByRole('dialog', { name: 'Szukaj ustawień' })).toBeInTheDocument();
    await userEvent.type(await canvas.findByPlaceholderText(/Szukaj ustawienia/u), 'ROAS');
    await expect(await canvas.findByText('Cele Biznesowe (/targets)')).toBeInTheDocument();
  },
};
