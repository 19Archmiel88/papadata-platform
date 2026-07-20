import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/110 Rozliczenia/Subskrypcja i użycie',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'subscription_usage',
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

export const Default = story({ screenId: 'subscription_usage' }, 'Domyślny');
export const Loading = story({ screenId: 'subscription_usage', state: 'loading' }, 'Ładowanie');
export const Partial = story({ screenId: 'subscription_usage', state: 'partial' }, 'Częściowe dane');
export const Blocked = story({ screenId: 'subscription_usage', state: 'blocked_by_policy' }, 'Zablokowane polityką');
export const Error = story({ screenId: 'subscription_usage', state: 'error' }, 'Błąd');
export const Mobile = story({ screenId: 'subscription_usage', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'subscription_usage', theme: 'dark' }, 'Motyw ciemny');
