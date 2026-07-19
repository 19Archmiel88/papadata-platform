import type { Meta, StoryObj } from '@storybook/react-vite';

import { ThemePreferencesReference } from '../../screens/foundations/ThemePreferencesReference';

const meta = {
  title: 'PapaData/01 Podstawy marki/Motywy',
  component: ThemePreferencesReference,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ThemePreferencesReference>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ReferencjaPreferencji: Story = {
  name: 'Referencja preferencji',
};
