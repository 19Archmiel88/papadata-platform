import type {
  Meta,
  StoryObj,
} from '@storybook/react-vite';
import type {
  ReactNode,
} from 'react';
import {
  expect,
  fireEvent,
  userEvent,
  waitFor,
  within,
} from 'storybook/test';

import {
  SettingsAccountProfile,
  SettingsAccountSecurity,
  SettingsAuditP0,
  SettingsGovernanceScreen,
  SettingsWorkspaceAi,
  SettingsWorkspaceAnalytics,
  SettingsWorkspaceCompany,
  SettingsWorkspaceCompliance,
  SettingsWorkspaceNotifications,
  SettingsWorkspaceTeam,
} from '../../../screens/settings-governance/SettingsGovernanceScreen';
import {
  settingsSections,
  settingsSectionsById,
} from '../../../screens/settings-governance/SettingsGovernanceScreen.data';
import {
  StorybookProductShellFrame,
} from '../shared/StorybookProductShellFrame';

const meta = {
  title: 'INTERNAL STORY SUPPORT/ADMINISTRACJA/Ustawienia',
  component: SettingsGovernanceScreen,
  parameters: {
    a11y: {
      test: 'error',
    },
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SettingsGovernanceScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function StoryFrame({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <main className="pd-set">
      <div className="pd-set__content">
        {children}
      </div>
    </main>
  );
}

export const FullPage: Story = {
  name: 'Całość',
  render: () => (
    <StorybookProductShellFrame activePath="/app/settings/organizacja">
      <SettingsGovernanceScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvasElement.querySelectorAll('.pd-section-frame')).toHaveLength(settingsSections.length);
    await expect(Array.from(canvasElement.querySelectorAll('.pd-section-frame')).map((section) => section.id)).toEqual(
      settingsSections.map((section) => section.id),
    );

    for (const section of settingsSections) {
      await expect(await canvas.findByRole('heading', { name: section.title })).toBeInTheDocument();
      await expect(canvasElement.ownerDocument.querySelector(`a[href="#${section.id}"]`)).toHaveTextContent(section.navLabel);
    }

    const teamNavItem = canvasElement.ownerDocument.querySelector<HTMLAnchorElement>(`a[href="#${settingsSectionsById['ws-team'].id}"]`);
    await expect(teamNavItem).toBeInTheDocument();
    fireEvent.click(teamNavItem!);
    await waitFor(() => expect(teamNavItem).toHaveAttribute('aria-current', 'page'));

    // Story musi kończyć interakcję w stanie startowym -- w przeciwnym razie
    // ktoś oglądający "Widok pełny" ręcznie w Storybooku widzi stronę
    // przewiniętą do sekcji "Zespół i uprawnienia" po automatycznym
    // uruchomieniu play().
    const topNavItem = canvasElement.ownerDocument.querySelector<HTMLAnchorElement>(`a[href="#${settingsSectionsById['account-profile'].id}"]`);
    await expect(topNavItem).toBeInTheDocument();
    fireEvent.click(topNavItem!);
    await waitFor(() => expect(topNavItem).toHaveAttribute('aria-current', 'page'));
  },
};

export const AccountProfile: Story = {
  name: 'Sekcje — Moje konto',
  render: () => (
    <StoryFrame>
      <SettingsAccountProfile />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByDisplayValue('Anna Kowalska')).toBeInTheDocument();
    await expect(await canvas.findByText(/E-mail zweryfikowany/u)).toBeInTheDocument();
  },
};

export const AccountSecurity: Story = {
  name: 'Sekcje — Bezpieczeństwo',
  render: () => (
    <StoryFrame>
      <SettingsAccountSecurity />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('YubiKey 5 NFC (Hardware Key)')).toBeInTheDocument();

    await userEvent.click(await canvas.findByRole('button', { name: /Skonfiguruj ponownie/u }));
  },
};

export const WsCompany: Story = {
  name: 'Sekcje — Firma i workspace',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceCompany revision={124} />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByDisplayValue('Casa di Orfeo')).toBeInTheDocument();
    await expect(await canvas.findByText('Operacje zaawansowane')).toBeInTheDocument();
  },
};

export const WsTeam: Story = {
  name: 'Sekcje — Zespół i uprawnienia',
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
  name: 'Sekcje — Analityka i cele',
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
  name: 'Sekcje — Papa Asystent',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceAi />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('VIP_CUSTOMER')).toBeInTheDocument();
    await expect(await canvas.findByText(/Ochrona danych logowania/u)).toBeInTheDocument();
  },
};

export const WsNotifications: Story = {
  name: 'Sekcje — Powiadomienia',
  render: () => (
    <StoryFrame>
      <SettingsWorkspaceNotifications />
    </StoryFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Cotygodniowe podsumowanie')).toBeInTheDocument();
  },
};

export const WsCompliance: Story = {
  name: 'Sekcje — Prywatność i zgodność',
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
  name: 'Stany — Spójność konfiguracji',
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
  name: 'Interakcje — Modale i wyszukiwanie',
  render: () => (
    <StorybookProductShellFrame activePath="/app/settings/organizacja">
      <SettingsGovernanceScreen />
    </StorybookProductShellFrame>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Dialog portals to #pd-overlay-root-host in document.body (see the
    // identical pattern in Integrations/Customers/Traffic story-support
    // files), so anything rendered inside one of the 3 modals below must be
    // queried via `body`, not `canvas`. All sections are always mounted now
    // (no more tab-switch), so buttons further down the page are reachable
    // directly without first clicking a topbar anchor.
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(await canvas.findByRole('button', { name: /Skonfiguruj ponownie/u }));
    await expect(await body.findByRole('dialog', { name: 'Konfiguracja weryfikacji dwuetapowej' })).toBeInTheDocument();
    await userEvent.click(await body.findByRole('button', { name: 'Zamknij' }));

    await userEvent.click(await canvas.findByRole('button', { name: /Zaproś osobę/u }));
    await expect(await body.findByRole('dialog', { name: 'Zaproś członka zespołu' })).toBeInTheDocument();
    await expect(await body.findByText('targets.manage')).toBeInTheDocument();
    await userEvent.click(await body.findByRole('button', { name: 'Zamknij' }));

    await userEvent.click(await canvas.findByRole('button', { name: /Szukaj ustawień/u }));
    await expect(await body.findByRole('dialog', { name: 'Szukaj ustawień' })).toBeInTheDocument();
    await userEvent.type(await body.findByPlaceholderText(/Szukaj ustawienia/u), 'ROAS');
    await expect(await body.findByText('Cele Biznesowe (/targets)')).toBeInTheDocument();
  },
};
