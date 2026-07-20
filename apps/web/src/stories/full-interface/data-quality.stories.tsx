import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/60-data-quality/Jakość danych',
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

export const Default = story({ screenId: 'data_quality' }, 'Default');
export const Loading = story({ screenId: 'data_quality', state: 'loading' }, 'Loading');
export const Empty = story({ screenId: 'data_quality', state: 'empty' }, 'Empty');
export const Partial = story({ screenId: 'data_quality', state: 'partial' }, 'Partial');
export const Invalid = story({ screenId: 'data_quality', state: 'invalid' }, 'Invalid');
export const Blocked = story({ screenId: 'data_quality', state: 'blocked' }, 'Blocked');
export const Readiness = story({ screenId: 'readiness' }, 'Readiness');
export const KonfliktyDuplikaty = story({ screenId: 'conflicts_duplicates' }, 'Konflikty i duplikaty');
export const Mobile = story({ screenId: 'data_quality', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'data_quality', theme: 'dark' }, 'Dark');
