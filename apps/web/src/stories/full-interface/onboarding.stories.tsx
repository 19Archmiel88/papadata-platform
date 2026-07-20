import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/20-onboarding/Onboarding',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'company_onboarding',
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

export const Default = story({ screenId: 'company_onboarding' }, 'Default');
export const Loading = story({ screenId: 'company_onboarding', state: 'loading' }, 'Loading');
export const Empty = story({ screenId: 'company_onboarding', state: 'empty' }, 'Empty');
export const Partial = story({ screenId: 'company_onboarding', state: 'partial' }, 'Partial');
export const Error = story({ screenId: 'company_onboarding', state: 'error' }, 'Error');
export const ProfilBiznesowy = story({ screenId: 'business_profile' }, 'Konfiguracja profilu biznesowego');
export const Mobile = story({ screenId: 'company_onboarding', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'company_onboarding', theme: 'dark' }, 'Dark');
