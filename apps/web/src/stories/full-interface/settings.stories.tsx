import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/100 Ustawienia/Ustawienia',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'settings',
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

export const Default = story({ screenId: 'settings' }, 'Domyślny');
export const Loading = story({ screenId: 'settings', state: 'loading' }, 'Ładowanie');
export const Forbidden = story({ screenId: 'settings', state: 'forbidden' }, 'Brak dostępu');
export const UzytkownicyRole = story({ screenId: 'users_roles' }, 'Użytkownicy i role');
export const CeleBiznesowe = story({ screenId: 'business_goals' }, 'Cele biznesowe');
export const Powiadomienia = story({ screenId: 'notifications' }, 'Powiadomienia');
export const CentrumPomocy = story({ screenId: 'help_center' }, 'Centrum pomocy');
export const DokumentyPrawne = story({ screenId: 'legal_privacy' }, 'Dokumenty prawne i prywatność');
export const AudytKlienta = story({ screenId: 'customer_audit' }, 'Audyt dostępny klientowi');
export const Mobile = story({ screenId: 'settings', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'settings', theme: 'dark' }, 'Motyw ciemny');
