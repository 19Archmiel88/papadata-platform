import type { Meta, StoryObj } from '@storybook/react-vite';

import { TypographyReference } from '../../screens/foundations/TypographyReference';

const meta = {
  title: 'PapaData/01 Podstawy marki/Typografia',
  component: TypographyReference,
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
    initialTheme: 'dark',
  },
} satisfies Meta<typeof TypographyReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkalaTypografii: Story = {
  name: 'Skala typografii',
};
