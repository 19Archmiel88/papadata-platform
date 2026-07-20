import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/50-integrations/Integracje',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'integrations',
    state: 'ready',
    surface: 'customer_workspace',
    theme: 'dark',
    viewport: 'desktop',
  },
} satisfies Meta<typeof PapaDataFullInterfaceScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

function story(args: Partial<PapaDataFullInterfaceScreenProps>, name: string): Story {
  return { args, name };
}

export const Default = story({ screenId: 'integrations' }, 'Default');
export const Loading = story({ screenId: 'integrations', state: 'loading' }, 'Loading');
export const NoData = story({ screenId: 'integrations', state: 'no_data' }, 'NoData');
export const Partial = story({ screenId: 'integrations', state: 'partial' }, 'Partial');
export const ProviderError = story({ screenId: 'integrations', state: 'provider_error' }, 'Provider error');
export const SzczegolyIntegracji = story({ screenId: 'integration_details' }, 'Szczegóły integracji');
export const SynchronizacjaHistoria = story({ screenId: 'sync_history' }, 'Synchronizacja i historia synchronizacji');
export const Mobile = story({ screenId: 'integrations', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'integrations', theme: 'dark' }, 'Dark');
