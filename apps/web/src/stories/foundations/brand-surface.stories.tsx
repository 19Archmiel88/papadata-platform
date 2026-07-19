import type { Meta, StoryObj } from '@storybook/react-vite';

import { PapaDataBrandSurface } from '../../screens/foundations/PapaDataBrandSurface';

const meta = {
  title: 'PapaData/Podstawy marki/Tło i górny pasek',
  component: PapaDataBrandSurface,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialLanguage: {
      control: 'inline-radio',
      options: ['pl', 'en'],
    },
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
} satisfies Meta<typeof PapaDataBrandSurface>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MotywCiemny: Story = {
  name: 'Motyw ciemny',
  args: {
    initialLanguage: 'pl',
    initialTheme: 'dark',
  },
};

export const MotywJasny: Story = {
  name: 'Motyw jasny',
  args: {
    initialLanguage: 'pl',
    initialTheme: 'light',
  },
};
