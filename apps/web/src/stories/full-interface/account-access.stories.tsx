import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/10 Dostęp do konta/Ekrany dostępu',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'login_access_recovery',
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

export const Default = story({ screenId: 'login_access_recovery' }, 'Domyślny');
export const Loading = story({ screenId: 'login_access_recovery', state: 'loading' }, 'Ładowanie');
export const Forbidden = story({ screenId: 'login_access_recovery', state: 'forbidden' }, 'Brak dostępu');
export const ExpiredSession = story({ screenId: 'login_access_recovery', state: 'expired' }, 'Wygasła sesja');
export const Zaproszenie = story({ screenId: 'invitation_activation' }, 'Zaproszenie i aktywacja konta');
export const MfaRecovery = story({ screenId: 'mfa_recovery' }, 'MFA i recovery');
export const WyborKontekstu = story({ screenId: 'tenant_workspace_choice' }, 'Wybór tenant/workspace');
export const Mobile = story({ screenId: 'login_access_recovery', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'login_access_recovery', theme: 'dark' }, 'Motyw ciemny');
