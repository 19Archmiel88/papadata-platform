import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/60 Jakość danych/Jakość danych',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'data_quality',
    state: 'partial',
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

export const Default = story({ screenId: 'data_quality' }, 'Domyślny');
export const Loading = story({ screenId: 'data_quality', state: 'loading' }, 'Ładowanie');
export const Empty = story({ screenId: 'data_quality', state: 'empty' }, 'Pusty stan');
export const Partial = story({ screenId: 'data_quality', state: 'partial' }, 'Częściowe dane');
export const Invalid = story({ screenId: 'data_quality', state: 'invalid' }, 'Nieprawidłowe dane');
export const Blocked = story({ screenId: 'data_quality', state: 'blocked' }, 'Zablokowane');
export const Readiness = story({ screenId: 'readiness' }, 'Readiness');
export const KonfliktyDuplikaty = story({ screenId: 'conflicts_duplicates' }, 'Konflikty i duplikaty');
export const Mobile = story({ screenId: 'data_quality', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'data_quality', theme: 'dark' }, 'Motyw ciemny');
