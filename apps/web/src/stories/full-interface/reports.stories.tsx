import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/90-reports/Raporty i eksporty',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'reports_exports',
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

export const Default = story({ screenId: 'reports_exports' }, 'Default');
export const Loading = story({ screenId: 'reports_exports', state: 'loading' }, 'Loading');
export const Empty = story({ screenId: 'reports_exports', state: 'empty' }, 'Empty');
export const Partial = story({ screenId: 'reports_exports', state: 'partial' }, 'Partial');
export const Error = story({ screenId: 'reports_exports', state: 'error' }, 'Error');
export const Forbidden = story({ screenId: 'reports_exports', state: 'forbidden' }, 'Forbidden');
export const Mobile = story({ screenId: 'reports_exports', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'reports_exports', theme: 'dark' }, 'Dark');
