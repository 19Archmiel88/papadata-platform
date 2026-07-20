import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  customerWorkspaceScreens,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/30-command-center/Customer Workspace',
  component: PapaDataFullInterfaceScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    screenId: 'command_center',
    state: 'ready',
    surface: 'customer_workspace',
    theme: 'dark',
    viewport: 'desktop',
  },
  argTypes: {
    screenId: {
      control: 'select',
      options: customerWorkspaceScreens.map((screen) => screen.id),
    },
    state: {
      control: 'select',
      options: [
        'loading',
        'empty',
        'no_data',
        'partial',
        'invalid',
        'stale',
        'delayed',
        'processing',
        'ready',
        'success',
        'warning',
        'error',
        'forbidden',
        'blocked',
        'expired',
        'cancelled',
        'needs_review',
        'provider_error',
        'insufficient_data',
        'blocked_by_policy',
      ],
    },
    theme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
    viewport: {
      control: 'inline-radio',
      options: ['desktop', 'tablet', 'mobile'],
    },
  },
} satisfies Meta<typeof PapaDataFullInterfaceScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function story(args: Partial<PapaDataFullInterfaceScreenProps>, name: string): Story {
  return {
    args,
    name,
  };
}

function screenStory(screenId: string, name: string): Story {
  return story({ screenId, state: 'ready' }, name);
}

export const Default: Story = {
  ...story({}, 'Default'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: /Centrum Dowodzenia/i })).resolves.toBeInTheDocument();
    await expect(canvas.findAllByText(/tenant_papadata_demo/i)).resolves.not.toHaveLength(0);
    await userEvent.click(await canvas.findByRole('button', { name: /Otwórz command palette/i }));
  },
};

export const Loading = story({ state: 'loading' }, 'Loading');
export const Empty = story({ state: 'empty' }, 'Empty');
export const NoData = story({ state: 'no_data' }, 'NoData');
export const Partial = story({ state: 'partial' }, 'Partial');
export const Stale = story({ state: 'stale' }, 'Stale');
export const Error = story({ state: 'error' }, 'Error');
export const Forbidden = story({ state: 'forbidden' }, 'Forbidden');
export const Blocked = story({ state: 'blocked' }, 'Blocked');
export const ExpiredSession = story({ state: 'expired' }, 'ExpiredSession');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Dark');

export const LogowanieOdzyskiwanie = screenStory('login_access_recovery', 'Logowanie i odzyskiwanie dostępu');
export const ZaproszenieAktywacja = screenStory('invitation_activation', 'Zaproszenie i aktywacja konta');
export const MfaRecovery = screenStory('mfa_recovery', 'MFA i recovery');
export const WyborTenantWorkspace = screenStory('tenant_workspace_choice', 'Wybór tenant/workspace');
export const OnboardingFirmy = screenStory('company_onboarding', 'Onboarding firmy');
export const ProfilBiznesowy = screenStory('business_profile', 'Konfiguracja profilu biznesowego');
export const CentrumDowodzenia = screenStory('command_center', 'Centrum Dowodzenia');
export const Kampanie = screenStory('campaigns', 'Kampanie');
export const Zamowienia = screenStory('orders', 'Zamówienia');
export const Produkty = screenStory('products', 'Produkty');
export const Klienci = screenStory('customers', 'Klienci');
export const RuchLejek = screenStory('traffic_funnel', 'Ruch i lejek');
export const Integracje = screenStory('integrations', 'Integracje');
export const SzczegolyIntegracji = screenStory('integration_details', 'Szczegóły integracji');
export const SynchronizacjaHistoria = screenStory('sync_history', 'Synchronizacja i historia synchronizacji');
export const JakoscDanych = screenStory('data_quality', 'Jakość danych');
export const Readiness = screenStory('readiness', 'Readiness');
export const KonfliktyDuplikaty = screenStory('conflicts_duplicates', 'Konflikty i duplikaty');
export const RaportyEksporty = screenStory('reports_exports', 'Raporty i eksporty');
export const Rekomendacje = screenStory('recommendations', 'Rekomendacje');
export const Decyzje = screenStory('decisions', 'Decyzje');
export const Dzialania = screenStory('actions', 'Działania');
export const Rezultaty = screenStory('outcomes', 'Rezultaty');
export const PapaAsystent = screenStory('papa_assistant', 'Papa Asystent');
export const BibliotekaAsystenta = screenStory('assistant_library', 'Biblioteka Asystenta');
export const Briefingi = screenStory('briefings', 'Briefingi');
export const Ustawienia = screenStory('settings', 'Ustawienia');
export const UzytkownicyRole = screenStory('users_roles', 'Użytkownicy i role');
export const CeleBiznesowe = screenStory('business_goals', 'Cele biznesowe');
export const SubskrypcjaUzycie = screenStory('subscription_usage', 'Subskrypcja i użycie');
export const Powiadomienia = screenStory('notifications', 'Powiadomienia');
export const CentrumPomocy = screenStory('help_center', 'Centrum pomocy');
export const DokumentyPrywatnosc = screenStory('legal_privacy', 'Dokumenty prawne i prywatność');
export const AudytKlienta = screenStory('customer_audit', 'Audyt dostępny klientowi');
