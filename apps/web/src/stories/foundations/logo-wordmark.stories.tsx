import type { Meta, StoryObj } from '@storybook/react-vite';

import { LogoWordmarkReference } from '../../screens/foundations/LogoWordmarkReference';

const meta = {
  title: 'PapaData/01 Podstawy marki/Logo i znak',
  component: LogoWordmarkReference,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    initialTheme: {
      control: 'inline-radio',
      options: ['light', 'dark'],
    },
  },
  args: {
    initialTheme: 'light',
  },
} satisfies Meta<typeof LogoWordmarkReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FinalneLogo: Story = {
  name: 'Finalne logo',
};
