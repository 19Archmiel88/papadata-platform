import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PapaDataFullInterfaceScreen,
  type PapaDataFullInterfaceScreenProps,
} from '../../features/full-interface';

const meta = {
  title: 'PapaData/70 Decyzje/Decyzje i działania',
  component: PapaDataFullInterfaceScreen,
  parameters: { layout: 'fullscreen' },
  args: {
    screenId: 'recommendations',
    state: 'needs_review',
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

export const Default = story({ screenId: 'recommendations' }, 'Domyślny');
export const Loading = story({ screenId: 'recommendations', state: 'loading' }, 'Ładowanie');
export const Partial = story({ screenId: 'recommendations', state: 'partial' }, 'Częściowe dane');
export const NeedsReview = story({ screenId: 'recommendations', state: 'needs_review' }, 'Wymaga przeglądu');
export const Forbidden = story({ screenId: 'recommendations', state: 'forbidden' }, 'Brak dostępu');
export const Rekomendacje = story({ screenId: 'recommendations' }, 'Rekomendacje');
export const Decyzje = story({ screenId: 'decisions' }, 'Decyzje');
export const Dzialania = story({ screenId: 'actions' }, 'Działania');
export const Rezultaty = story({ screenId: 'outcomes' }, 'Rezultaty');
export const Mobile = story({ screenId: 'recommendations', viewport: 'mobile' }, 'Mobile');
export const Dark = story({ screenId: 'recommendations', theme: 'dark' }, 'Motyw ciemny');
