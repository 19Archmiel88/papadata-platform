import type { Meta, StoryObj } from '@storybook/react-vite';

import { SpacingGeometryReference } from '../../screens/foundations/SpacingGeometryReference';

const meta = {
  title: 'PapaData/01 Podstawy marki/Odstępy i geometria',
  component: SpacingGeometryReference,
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
} satisfies Meta<typeof SpacingGeometryReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SkalaIZasady: Story = {
  name: 'Skala i zasady',
};
