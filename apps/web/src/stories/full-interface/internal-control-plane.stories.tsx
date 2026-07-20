import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  internalControlPlaneScreens,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/120 Panel operacyjny/Ekrany operacyjne',
  component: PapaDataFullInterfaceScreen,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    internalId: 'customer_portfolio',
    state: 'ready',
    surface: 'internal_control_plane',
    theme: 'dark',
    viewport: 'desktop',
  },
  argTypes: {
    internalId: {
      control: 'select',
      options: internalControlPlaneScreens.map((screen) => screen.id),
    },
    state: {
      control: 'select',
      options: ['ready', 'loading', 'partial', 'stale', 'error', 'provider_error', 'blocked', 'blocked_by_policy'],
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

function internalStory(internalId: string, name: string): Story {
  return story({ internalId, state: 'ready' }, name);
}

export const Default: Story = {
  ...story({}, 'Domyślny'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: /Internal Control Plane/i })).resolves.toBeInTheDocument();
    await expect(canvas.findAllByText(/Customer Success/i)).resolves.not.toHaveLength(0);
  },
};

export const Loading = story({ state: 'loading' }, 'Ładowanie');
export const Partial = story({ state: 'partial' }, 'Częściowe dane');
export const Error = story({ state: 'error' }, 'Błąd');
export const Blocked = story({ state: 'blocked' }, 'Zablokowane');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Motyw ciemny');

export const PortfolioKlientow = internalStory('customer_portfolio', 'Portfolio klientów');
export const GlobalnaKolejkaAlertow = internalStory('global_alert_queue', 'Globalna kolejka alertów');
export const WorkloadQueue = internalStory('workload_queue', 'Kolejka zadań');
export const RecoveryCases = internalStory('recovery_cases', 'Sprawy recovery');
export const SupportCases = internalStory('support_cases', 'Sprawy supportu');
export const TemporaryAccessApprovals = internalStory('temporary_access_approvals', 'Zatwierdzenia dostępu tymczasowego');
export const CostObservability = internalStory('cost_observability', 'Obserwowalność kosztów');
export const KosztKlienta = internalStory('customer_cost', 'Koszt klienta');
export const KosztProvidera = internalStory('provider_cost', 'Koszt providera');
export const KosztAi = internalStory('ai_cost', 'Koszt AI');
export const ManualWork = internalStory('manual_work', 'Praca manualna');
export const GateDashboard = internalStory('gate_dashboard', 'Dashboard bram');
export const RiskRegister = internalStory('risk_register', 'Rejestr ryzyk');
export const ControlRegister = internalStory('control_register', 'Rejestr kontroli');
export const AccessReview = internalStory('access_review', 'Przegląd dostępów');
export const BackupTests = internalStory('backup_tests', 'Testy backupu');
export const IncidentRegister = internalStory('incident_register', 'Rejestr incydentów');
export const AIUseCaseRegister = internalStory('ai_use_case_register', 'Rejestr use case AI');
export const ModelRegistry = internalStory('model_registry', 'Rejestr modeli');
export const AIEvaluationRuns = internalStory('ai_evaluation_runs', 'Uruchomienia ewaluacji AI');
export const AIIncidentRegister = internalStory('ai_incident_register', 'Rejestr incydentów AI');
