import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import {
  PapaDataFullInterfaceScreen,
  internalControlPlaneScreens,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/120-internal-control-plane/Ekrany operacyjne',
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
  ...story({}, 'Default'),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.findByRole('heading', { name: /Internal Control Plane/i })).resolves.toBeInTheDocument();
    await expect(canvas.findAllByText(/Customer Success/i)).resolves.not.toHaveLength(0);
  },
};

export const Loading = story({ state: 'loading' }, 'Loading');
export const Partial = story({ state: 'partial' }, 'Partial');
export const Error = story({ state: 'error' }, 'Error');
export const Blocked = story({ state: 'blocked' }, 'Blocked');
export const Mobile = story({ viewport: 'mobile' }, 'Mobile');
export const Dark = story({ theme: 'dark' }, 'Dark');

export const PortfolioKlientow = internalStory('customer_portfolio', 'Portfolio klientów');
export const GlobalnaKolejkaAlertow = internalStory('global_alert_queue', 'Globalna kolejka alertów');
export const WorkloadQueue = internalStory('workload_queue', 'Workload queue');
export const RecoveryCases = internalStory('recovery_cases', 'Recovery cases');
export const SupportCases = internalStory('support_cases', 'Support cases');
export const TemporaryAccessApprovals = internalStory('temporary_access_approvals', 'Temporary access approvals');
export const CostObservability = internalStory('cost_observability', 'Cost Observability');
export const KosztKlienta = internalStory('customer_cost', 'Koszt klienta');
export const KosztProvidera = internalStory('provider_cost', 'Koszt providera');
export const KosztAi = internalStory('ai_cost', 'Koszt AI');
export const ManualWork = internalStory('manual_work', 'Manual work');
export const GateDashboard = internalStory('gate_dashboard', 'Gate dashboard');
export const RiskRegister = internalStory('risk_register', 'Risk register');
export const ControlRegister = internalStory('control_register', 'Control register');
export const AccessReview = internalStory('access_review', 'Access review');
export const BackupTests = internalStory('backup_tests', 'Backup tests');
export const IncidentRegister = internalStory('incident_register', 'Incident register');
export const AIUseCaseRegister = internalStory('ai_use_case_register', 'AI use case register');
export const ModelRegistry = internalStory('model_registry', 'Model registry');
export const AIEvaluationRuns = internalStory('ai_evaluation_runs', 'AI evaluation runs');
export const AIIncidentRegister = internalStory('ai_incident_register', 'AI incident register');
